from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import VendorListing, PriceHistory
from .serializers import VendorListingSerializer, PublicListingSerializer, PriceHistorySerializer


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

