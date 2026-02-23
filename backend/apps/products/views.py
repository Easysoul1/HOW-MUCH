from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Category, UnitOfMeasurement, ProductSize, Product, ProductImage
from .serializers import (
    CategorySerializer, UnitOfMeasurementSerializer, ProductSizeSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer,
    ProductImageSerializer
)


# --- Permissions ---

class IsAdminOrReadOnly(BasePermission):
    """Only admins can write. Anyone can read."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_staff


class IsVendorOrAdmin(BasePermission):
    """Vendors can suggest products. Admins can do everything."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and (
            request.user.user_type in ['VENDOR', 'CROWDSOURCER'] or request.user.is_staff
        )


# --- Category ---

class CategoryViewSet(viewsets.ModelViewSet):
    """
    Admin manages categories. Everyone can read.
    """
    queryset = Category.objects.filter(is_active=True).prefetch_related('subcategories')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    lookup_field = 'slug'

    @action(detail=False, methods=['get'])
    def root(self, request):
        """Return only top-level categories (no parent)."""
        categories = self.get_queryset().filter(parent=None)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


# --- Unit of Measurement ---

class UnitOfMeasurementViewSet(viewsets.ModelViewSet):
    """
    Admin manages units. Everyone can read.
    """
    queryset = UnitOfMeasurement.objects.all()
    serializer_class = UnitOfMeasurementSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'abbreviation']


# --- Product Size ---

class ProductSizeViewSet(viewsets.ModelViewSet):
    """
    Admin manages sizes. Everyone can read.
    """
    queryset = ProductSize.objects.select_related('unit').all()
    serializer_class = ProductSizeSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['unit']
    ordering_fields = ['value']


# --- Product ---

class ProductViewSet(viewsets.ModelViewSet):
    """
    - Unauthenticated / customers: see only APPROVED + active products
    - Vendors: see APPROVED products + their own suggestions (any status)
    - Admins: see everything
    
    Vendors suggest products (status=PENDING), admins approve or reject.
    """
    permission_classes = [IsVendorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured', 'status']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'created_at']
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        base_qs = Product.objects.select_related(
            'category', 'suggested_by', 'reviewed_by'
        ).prefetch_related('available_sizes', 'images')

        if not user.is_authenticated or user.user_type == 'CUSTOMER':
            return base_qs.filter(status='APPROVED', is_active=True)

        if user.is_staff:
            return base_qs.all()

        # Vendors see all approved products + their own suggestions
        return base_qs.filter(
            Q(status='APPROVED', is_active=True) | Q(suggested_by=user)
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_staff:
            # Admin creates directly as approved
            serializer.save(status='APPROVED')
        else:
            # Vendor submits a suggestion for review
            serializer.save(
                suggested_by=user,
                status='PENDING',
                is_active=False  # not visible until approved
            )

    def perform_update(self, serializer):
        user = self.request.user
        product = self.get_object()

        # Vendors can only edit their own pending suggestions
        if not user.is_staff:
            if product.suggested_by != user:
                self.permission_denied(
                    self.request,
                    message="You can only edit your own product suggestions."
                )
            if product.status != 'PENDING':
                self.permission_denied(
                    self.request,
                    message="You can only edit suggestions that are still pending review."
                )
        serializer.save()

    # --- Admin moderation actions ---

    @extend_schema(summary="Approve a pending product suggestion")
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, slug=None):
        product = self.get_object()
        if product.status != 'PENDING':
            return Response(
                {'error': 'Only pending products can be approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        product.status = 'APPROVED'
        product.is_active = True
        product.reviewed_by = request.user
        product.reviewed_at = timezone.now()
        product.rejection_reason = ''
        product.save()
        return Response({'status': 'Product approved.'})

    @extend_schema(summary="Reject a pending product suggestion")
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, slug=None):
        product = self.get_object()
        if product.status != 'PENDING':
            return Response(
                {'error': 'Only pending products can be rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response(
                {'error': 'A rejection reason is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        product.status = 'REJECTED'
        product.is_active = False
        product.reviewed_by = request.user
        product.reviewed_at = timezone.now()
        product.rejection_reason = reason
        product.save()
        return Response({'status': 'Product rejected.'})

    @extend_schema(summary="List all pending product suggestions (admin only)")
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending(self, request):
        products = Product.objects.filter(status='PENDING').select_related(
            'category', 'suggested_by'
        ).prefetch_related('available_sizes', 'images')
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    # --- Vendor actions ---

    @extend_schema(summary="List the authenticated vendor's own suggestions")
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_suggestions(self, request):
        products = Product.objects.filter(
            suggested_by=request.user
        ).select_related('category').prefetch_related('available_sizes', 'images')
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    # --- General actions ---

    @extend_schema(summary="List featured products")
    @action(detail=False, methods=['get'])
    def featured(self, request):
        products = self.get_queryset().filter(is_featured=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="List products by category slug",
        parameters=[OpenApiParameter('category_slug', str, location='path')]
    )
    @action(detail=False, methods=['get'], url_path='by-category/(?P<category_slug>[^/.]+)')
    def by_category(self, request, category_slug=None):
        try:
            category = Category.objects.get(slug=category_slug, is_active=True)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)

        products = self.get_queryset().filter(category=category)
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


# --- Product Image ---

class ProductImageViewSet(viewsets.ModelViewSet):
    """
    Manage product images. Only admins and the product's suggester can add images.
    """
    queryset = ProductImage.objects.select_related('product').all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsVendorOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'is_primary']

    def perform_create(self, serializer):
        product = serializer.validated_data.get('product')
        user = self.request.user
        if not user.is_staff and product.suggested_by != user:
            self.permission_denied(
                self.request,
                message="You can only add images to your own product suggestions."
            )
        serializer.save()