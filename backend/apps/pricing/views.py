from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

import math

from .models import VendorListing, PriceHistory
from .serializers import VendorListingSerializer, PublicListingSerializer, PriceHistorySerializer


def haversine_km(lat1, lon1, lat2, lon2):
    """Great-circle distance between two points in km."""
    R = 6371.0
    dlat = math.radians(float(lat2) - float(lat1))
    dlon = math.radians(float(lon2) - float(lon1))
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(float(lat1))) * math.cos(math.radians(float(lat2))) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class IsVendor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'VENDOR'


class VendorListingViewSet(viewsets.ModelViewSet):
    """
    Vendors manage their own listings.
    GET /api/pricing/listings/         — vendor sees only their listings
    POST /api/pricing/listings/        — create a listing
    PATCH /api/pricing/listings/{id}/  — update price / availability
    DELETE /api/pricing/listings/{id}/ — remove listing
    """
    serializer_class = VendorListingSerializer
    permission_classes = [IsVendor]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'size', 'is_available']
    search_fields = ['product__name', 'brand', 'notes']
    ordering_fields = ['price', 'updated_at', 'product__name']

    def get_queryset(self):
        return VendorListing.objects.filter(
            vendor=self.request.user
        ).select_related('product', 'size', 'size__unit')

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.vendor != self.request.user:
            raise PermissionDenied("You can only edit your own listings.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.vendor != self.request.user:
            raise PermissionDenied("You can only delete your own listings.")
        instance.delete()


class PublicListingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only view — buyers see all available listings.
    GET /api/pricing/public/                        — all available listings
    GET /api/pricing/public/?product_slug=rice      — listings for a product
    GET /api/pricing/public/?search=gino+tomato     — search brand/product name/notes
    GET /api/pricing/public/?lat=6.5&lng=3.4        — annotate distance from buyer
    GET /api/pricing/public/?lat=6.5&lng=3.4&radius=10 — within 10km of buyer
    """
    serializer_class = PublicListingSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['size', 'is_available']
    search_fields = ['product__name', 'brand', 'notes']
    ordering_fields = ['price', 'updated_at']

    def get_queryset(self):
        qs = VendorListing.objects.filter(
            is_available=True,
            vendor__is_active=True,
        ).select_related('product', 'size', 'size__unit', 'vendor').prefetch_related('price_history')

        product_slug = self.request.query_params.get('product_slug')
        if product_slug:
            qs = qs.filter(product__slug=product_slug)

        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius')

        if lat and lng:
            try:
                buyer_lat, buyer_lng = float(lat), float(lng)
            except (ValueError, TypeError):
                return response

            results = response.data if isinstance(response.data, list) else response.data.get('results', response.data)
            enriched = []
            for item in results:
                v_lat = item.get('vendor_latitude')
                v_lng = item.get('vendor_longitude')
                if v_lat is not None and v_lng is not None:
                    dist = round(haversine_km(buyer_lat, buyer_lng, v_lat, v_lng), 1)
                    item['distance_km'] = dist
                else:
                    item['distance_km'] = None

            if radius:
                try:
                    radius_km = float(radius)
                    results = [item for item in results if item.get('distance_km') is not None and item['distance_km'] <= radius_km]
                    if isinstance(response.data, dict) and 'results' in response.data:
                        response.data['results'] = results
                        response.data['count'] = len(results)
                    else:
                        response.data = results
                except (ValueError, TypeError):
                    pass

        return response


class PriceHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Full price history — for graphs and ML training.
    GET /api/pricing/history/                           — all history (paginated)
    GET /api/pricing/history/?product_slug=rice         — history for a product
    GET /api/pricing/history/?listing_id=42             — history for a specific listing
    Also returns current price as the latest data point via ?include_current=1
    """
    serializer_class = PriceHistorySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['recorded_at', 'price']
    ordering = ['recorded_at']

    def get_queryset(self):
        qs = PriceHistory.objects.select_related(
            'listing', 'listing__product', 'listing__size', 'listing__size__unit', 'listing__vendor'
        )
        product_slug = self.request.query_params.get('product_slug')
        if product_slug:
            qs = qs.filter(listing__product__slug=product_slug)

        listing_id = self.request.query_params.get('listing_id')
        if listing_id:
            qs = qs.filter(listing_id=listing_id)

        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        # Optionally append current prices as the latest data points
        if request.query_params.get('include_current') == '1':
            listings_qs = VendorListing.objects.select_related(
                'product', 'size', 'size__unit', 'vendor'
            )
            product_slug = request.query_params.get('product_slug')
            if product_slug:
                listings_qs = listings_qs.filter(product__slug=product_slug)
            listing_id = request.query_params.get('listing_id')
            if listing_id:
                listings_qs = listings_qs.filter(id=listing_id)

            current_points = []
            for l in listings_qs:
                vn = getattr(getattr(l.vendor, 'vendor_profile', None), 'business_name', None) \
                     or l.vendor.get_full_name() or l.vendor.email.split('@')[0]
                current_points.append({
                    'id': None,
                    'listing_id': l.id,
                    'product_name': l.product.name,
                    'product_slug': l.product.slug,
                    'size_label': l.size.label,
                    'brand': l.brand,
                    'vendor_name': vn,
                    'price': str(l.price),
                    'recorded_at': l.updated_at,
                    'is_current': True,
                })
            response.data['current'] = current_points
        return response

