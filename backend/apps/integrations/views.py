from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Avg, Count
from django.db.models.functions import TruncDate

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
    """Admin: create a new API key."""
    serializer_class = ApiKeyCreateSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        api_key = serializer.save()
        # Return full key on creation (only time it's shown)
        return Response({
            'id': api_key.id,
            'key': api_key.key,
            'name': api_key.name,
            'owner_email': api_key.owner.email,
            'plan': api_key.plan,
            'daily_limit': api_key.daily_limit,
            'created_at': api_key.created_at,
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

class MyApiKeysView(generics.ListAPIView):
    """Integrator: list their own API keys."""
    serializer_class = ApiKeySerializer
    
    def get_queryset(self):
        return ApiKey.objects.filter(owner=self.request.user)


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
    Get all current prices for a product. Supports ?size= and ?brand=.
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
        
        return qs.order_by('price')


class SearchApiView(PublicApiMixin, generics.ListAPIView):
    """
    GET /api/v1/search/?q=
    Search across products and prices.
    """
    serializer_class = PublicPriceSerializer
    
    def get_queryset(self):
        from django.db.models import Q
        q = self.request.query_params.get('q', '')
        if not q:
            return VendorListing.objects.none()
        
        return VendorListing.objects.filter(
            is_available=True,
            product__status='APPROVED',
        ).filter(
            Q(product__name__icontains=q) |
            Q(brand__icontains=q) |
            Q(product__category__name__icontains=q)
        ).select_related('product', 'size', 'vendor').order_by('price')


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
