import math

from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncDate
from django.contrib.auth import get_user_model

from apps.products.models import Product
from apps.pricing.models import VendorListing, PriceHistory
from .models import ApiKey, ApiUsageLog
from .authentication import ApiKeyAuthentication
from .throttling import ApiKeyDailyThrottle
from .serializers import (
    ApiKeySerializer, ApiKeyCreateSerializer,
    ApiUsageLogSerializer, ApiUsageSummarySerializer,
    PublicProductSerializer, PublicProductDetailSerializer,
    PublicPriceSerializer, PublicPriceHistorySerializer,
)

User = get_user_model()


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two lat/lon points."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ============================================================
# Admin API Key Management Views
# ============================================================

class ApiKeyListView(generics.ListAPIView):
    """Admin: list all API keys."""
    serializer_class = ApiKeySerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        return ApiKey.objects.select_related('owner').all()


class ApiKeyCreateView(generics.CreateAPIView):
    """Admin: create an integrator account and their first API key."""
    serializer_class = ApiKeyCreateSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        email = data['email']
        password = data['password']
        company_name = data.get('company_name', '')
        
        # Check if user already exists
        existing_user = User.objects.filter(email=email).first()
        if existing_user:
            if existing_user.user_type != 'INTEGRATOR':
                return Response(
                    {'error': f'A user with this email exists but is a {existing_user.user_type}, not an INTEGRATOR.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            owner = existing_user
        else:
            # Create new integrator user
            owner = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=company_name,
                user_type='INTEGRATOR',
                is_verified=True,
            )
        
        # Create API key
        api_key = ApiKey.objects.create(
            name=data['name'],
            owner=owner,
            plan=data.get('plan', 'BASIC'),
            daily_limit=data.get('daily_limit', 10000),
            expires_at=data.get('expires_at'),
        )
        
        return Response({
            'id': api_key.id,
            'key': api_key.key,
            'name': api_key.name,
            'owner_email': owner.email,
            'plan': api_key.plan,
            'daily_limit': api_key.daily_limit,
            'created_at': api_key.created_at,
            'is_new_account': not bool(existing_user),
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def revoke_api_key(request, key_id):
    """Admin: deactivate an API key."""
    try:
        api_key = ApiKey.objects.get(pk=key_id)
    except ApiKey.DoesNotExist:
        return Response({'error': 'API key not found.'}, status=404)
    
    api_key.is_active = False
    api_key.save()
    return Response({'message': f'API key "{api_key.name}" has been revoked.'})


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def api_key_usage(request, key_id):
    """Admin: get usage stats for an API key."""
    try:
        api_key = ApiKey.objects.get(pk=key_id)
    except ApiKey.DoesNotExist:
        return Response({'error': 'API key not found.'}, status=404)
    
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    
    logs = ApiUsageLog.objects.filter(api_key=api_key)
    total = logs.count()
    today_count = logs.filter(timestamp__gte=today_start).count()
    avg_time = logs.filter(timestamp__gte=thirty_days_ago).aggregate(
        avg=Avg('response_time_ms')
    )['avg'] or 0
    
    # Daily breakdown (last 30 days)
    daily = (
        logs.filter(timestamp__gte=thirty_days_ago)
        .annotate(date=TruncDate('timestamp'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )
    
    # Top endpoints
    top_endpoints = (
        logs.filter(timestamp__gte=thirty_days_ago)
        .values('endpoint')
        .annotate(count=Count('id'))
        .order_by('-count')[:5]
    )
    
    return Response({
        'key_name': api_key.name,
        'total_requests': total,
        'requests_today': today_count,
        'daily_limit': api_key.daily_limit,
        'avg_response_time_ms': round(avg_time, 1),
        'daily_breakdown': list(daily),
        'top_endpoints': list(top_endpoints),
    })


# ============================================================
# Integrator Self-Service Views (for their own dashboard)
# ============================================================

PLAN_KEY_LIMITS = {
    'BASIC': 2,
    'PRO': 5,
    'ENTERPRISE': 10,
}


class MyApiKeysView(generics.ListAPIView):
    """Integrator: list their own API keys."""
    serializer_class = ApiKeySerializer
    
    def get_queryset(self):
        return ApiKey.objects.filter(owner=self.request.user)


@api_view(['POST'])
def create_my_key(request):
    """Integrator: self-service key creation within plan limits."""
    name = request.data.get('name', '').strip()
    if not name:
        return Response({'error': 'Key name is required.'}, status=400)
    
    existing_keys = ApiKey.objects.filter(owner=request.user, is_active=True)
    
    # Determine plan from their most recent key (or BASIC if first key from admin)
    latest_key = existing_keys.order_by('-created_at').first()
    plan = latest_key.plan if latest_key else 'BASIC'
    daily_limit = latest_key.daily_limit if latest_key else 10000
    max_keys = PLAN_KEY_LIMITS.get(plan, 2)
    
    if existing_keys.count() >= max_keys:
        return Response({
            'error': f'Your {plan} plan allows a maximum of {max_keys} active keys. Upgrade your plan for more.',
            'max_keys': max_keys,
            'current_keys': existing_keys.count(),
        }, status=400)
    
    api_key = ApiKey.objects.create(
        name=name,
        owner=request.user,
        plan=plan,
        daily_limit=daily_limit,
    )
    
    return Response({
        'id': api_key.id,
        'key': api_key.key,
        'name': api_key.name,
        'plan': api_key.plan,
        'daily_limit': api_key.daily_limit,
        'created_at': api_key.created_at,
        'max_keys': max_keys,
        'current_keys': existing_keys.count() + 1,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def my_usage_summary(request):
    """Integrator: get their own aggregate usage."""
    keys = ApiKey.objects.filter(owner=request.user)
    if not keys.exists():
        return Response({
            'total_requests': 0,
            'requests_today': 0,
            'avg_response_time_ms': 0,
            'daily_limit': 0,
            'daily_breakdown': [],
        })
    
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    
    logs = ApiUsageLog.objects.filter(api_key__in=keys)
    total = logs.count()
    today_count = logs.filter(timestamp__gte=today_start).count()
    avg_time = logs.filter(timestamp__gte=thirty_days_ago).aggregate(
        avg=Avg('response_time_ms')
    )['avg'] or 0
    
    daily = (
        logs.filter(timestamp__gte=thirty_days_ago)
        .annotate(date=TruncDate('timestamp'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )
    
    total_limit = sum(k.daily_limit for k in keys)
    
    return Response({
        'total_requests': total,
        'requests_today': today_count,
        'daily_limit': total_limit,
        'avg_response_time_ms': round(avg_time, 1),
        'daily_breakdown': list(daily),
    })


@api_view(['GET'])
def preview_search(request):
    """Integrator: free preview search — doesn't count against API quota."""
    q = request.query_params.get('q', '').strip()
    if not q or len(q) < 2:
        return Response({'results': []})
    
    listings = VendorListing.objects.filter(
        is_available=True,
        product__status='APPROVED',
    ).filter(
        Q(product__name__icontains=q) |
        Q(brand__icontains=q) |
        Q(product__category__name__icontains=q)
    ).select_related('product', 'size', 'vendor').order_by('price')[:20]
    
    results = []
    for l in listings:
        results.append({
            'id': l.id,
            'product': l.product.name,
            'product_slug': l.product.slug,
            'size': l.size.label,
            'brand': l.brand,
            'price': str(l.price),
            'vendor_location': {
                'city': l.vendor.city or '',
                'state': l.vendor.state or '',
            },
            'is_available': l.is_available,
            'updated_at': l.updated_at.isoformat(),
        })
    
    return Response({'results': results, 'count': len(results)})


# ============================================================
# Public API v1 — Authenticated via X-API-Key
# ============================================================

class PublicApiPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PublicApiMixin:
    """Base mixin for all public v1 API views."""
    authentication_classes = [ApiKeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ApiKeyDailyThrottle]
    pagination_class = PublicApiPagination


def _apply_location_filters(qs, request):
    """Apply city and geo-distance filters to a VendorListing queryset.
    Returns (filtered_qs, query_lat, query_lon) for distance calculation."""
    city = request.query_params.get('city', '').strip()
    lat = request.query_params.get('latitude')
    lon = request.query_params.get('longitude')
    max_dist = request.query_params.get('max_distance')  # km
    
    if city:
        qs = qs.filter(vendor__city__icontains=city)
    
    query_lat = float(lat) if lat else None
    query_lon = float(lon) if lon else None
    
    if query_lat is not None and query_lon is not None and max_dist:
        max_km = float(max_dist)
        # Pre-filter with bounding box (~1 degree ≈ 111km)
        delta = max_km / 111.0
        qs = qs.filter(
            vendor__latitude__isnull=False,
            vendor__longitude__isnull=False,
            vendor__latitude__gte=query_lat - delta,
            vendor__latitude__lte=query_lat + delta,
            vendor__longitude__gte=query_lon - delta,
            vendor__longitude__lte=query_lon + delta,
        )
    
    return qs, query_lat, query_lon


class ProductListApiView(PublicApiMixin, generics.ListAPIView):
    """
    GET /api/v1/products/
    List all approved products. Supports ?search= and ?category=.
    """
    serializer_class = PublicProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category__name']
    
    def get_queryset(self):
        qs = Product.objects.filter(
            status='APPROVED', is_active=True
        ).select_related('category').prefetch_related('available_sizes')
        
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)
        
        return qs


class ProductDetailApiView(PublicApiMixin, generics.RetrieveAPIView):
    """
    GET /api/v1/products/{slug}/
    Get a single product by slug.
    """
    serializer_class = PublicProductDetailSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Product.objects.filter(
            status='APPROVED', is_active=True
        ).select_related('category').prefetch_related('available_sizes')


class ProductPricesApiView(PublicApiMixin, generics.ListAPIView):
    """
    GET /api/v1/products/{slug}/prices/
    Get all current prices for a product.
    Supports ?size=, ?brand=, ?city=, ?latitude=&longitude=&max_distance=
    """
    serializer_class = PublicPriceSerializer
    
    def get_queryset(self):
        slug = self.kwargs['slug']
        qs = VendorListing.objects.filter(
            product__slug=slug,
            product__status='APPROVED',
            is_available=True,
        ).select_related('product', 'size', 'vendor')
        
        size = self.request.query_params.get('size')
        if size:
            qs = qs.filter(size__label=size)
        
        brand = self.request.query_params.get('brand')
        if brand:
            qs = qs.filter(brand__icontains=brand)
        
        qs, query_lat, query_lon = _apply_location_filters(qs, self.request)
        
        # Post-filter by exact haversine distance
        max_dist = self.request.query_params.get('max_distance')
        if query_lat is not None and query_lon is not None and max_dist:
            max_km = float(max_dist)
            filtered_ids = []
            for listing in qs:
                v_lat = float(listing.vendor.latitude) if listing.vendor.latitude else None
                v_lon = float(listing.vendor.longitude) if listing.vendor.longitude else None
                if v_lat and v_lon:
                    dist = haversine_distance(query_lat, query_lon, v_lat, v_lon)
                    if dist <= max_km:
                        filtered_ids.append(listing.id)
            qs = qs.filter(id__in=filtered_ids)
        
        return qs.order_by('price')
    
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        lat = self.request.query_params.get('latitude')
        lon = self.request.query_params.get('longitude')
        if lat and lon:
            ctx['query_lat'] = float(lat)
            ctx['query_lon'] = float(lon)
        return ctx


class SearchApiView(PublicApiMixin, generics.ListAPIView):
    """
    GET /api/v1/search/?q=
    Search across products and prices.
    Supports ?city=, ?latitude=&longitude=&max_distance=
    """
    serializer_class = PublicPriceSerializer
    
    def get_queryset(self):
        q = self.request.query_params.get('q', '')
        if not q:
            return VendorListing.objects.none()
        
        qs = VendorListing.objects.filter(
            is_available=True,
            product__status='APPROVED',
        ).filter(
            Q(product__name__icontains=q) |
            Q(brand__icontains=q) |
            Q(product__category__name__icontains=q)
        ).select_related('product', 'size', 'vendor')
        
        qs, query_lat, query_lon = _apply_location_filters(qs, self.request)
        
        max_dist = self.request.query_params.get('max_distance')
        if query_lat is not None and query_lon is not None and max_dist:
            max_km = float(max_dist)
            filtered_ids = []
            for listing in qs:
                v_lat = float(listing.vendor.latitude) if listing.vendor.latitude else None
                v_lon = float(listing.vendor.longitude) if listing.vendor.longitude else None
                if v_lat and v_lon:
                    dist = haversine_distance(query_lat, query_lon, v_lat, v_lon)
                    if dist <= max_km:
                        filtered_ids.append(listing.id)
            qs = qs.filter(id__in=filtered_ids)
        
        return qs.order_by('price')
    
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        lat = self.request.query_params.get('latitude')
        lon = self.request.query_params.get('longitude')
        if lat and lon:
            ctx['query_lat'] = float(lat)
            ctx['query_lon'] = float(lon)
        return ctx


class PriceHistoryApiView(PublicApiMixin, generics.ListAPIView):
    """
    GET /api/v1/prices/history/?product={slug}&days=30
    Get price history for a product.
    """
    serializer_class = PublicPriceHistorySerializer
    
    def get_queryset(self):
        product_slug = self.request.query_params.get('product')
        days = int(self.request.query_params.get('days', 30))
        days = min(days, 365)  # Cap at 1 year
        
        since = timezone.now() - timezone.timedelta(days=days)
        
        qs = PriceHistory.objects.filter(
            recorded_at__gte=since
        ).select_related('listing__product', 'listing__size', 'listing__vendor')
        
        if product_slug:
            qs = qs.filter(listing__product__slug=product_slug)
        
        return qs.order_by('-recorded_at')
