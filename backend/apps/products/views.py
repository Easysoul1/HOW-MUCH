from rest_framework import generics, viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Category, UnitOfMeasurement, ProductSize, Product, ProductImage
from .serializers import (
    CategorySerializer, UnitOfMeasurementSerializer, ProductSizeSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer,
    ProductImageSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for product categories
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    lookup_field = 'slug'
    
    @extend_schema(summary="List all active categories")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(summary="Get root categories (no parent)")
    @action(detail=False, methods=['get'])
    def root(self, request):
        """Get only root-level categories"""
        categories = self.queryset.filter(parent=None)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class UnitOfMeasurementViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for units of measurement
    """
    queryset = UnitOfMeasurement.objects.all()
    serializer_class = UnitOfMeasurementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'abbreviation']


class ProductSizeViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for product sizes
    """
    queryset = ProductSize.objects.all()
    serializer_class = ProductSizeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['unit']
    ordering_fields = ['value']


class ProductViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for products
    - List: GET /api/products/
    - Detail: GET /api/products/{slug}/
    - Create: POST /api/products/ (authenticated)
    - Update: PUT/PATCH /api/products/{slug}/ (authenticated)
    - Delete: DELETE /api/products/{slug}/ (authenticated)
    - Search: GET /api/products/?search=rice
    - Filter: GET /api/products/?category=1&is_featured=true
    """
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('available_sizes', 'images')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured', 'is_active']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'created_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer
    
    @extend_schema(
        summary="List all products",
        parameters=[
            OpenApiParameter('category', int, description='Filter by category ID'),
            OpenApiParameter('is_featured', bool, description='Filter featured products'),
            OpenApiParameter('search', str, description='Search by name, SKU, or description'),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(summary="Get product details by slug")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(summary="Create new product")
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @extend_schema(summary="Get featured products")
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get only featured products"""
        products = self.queryset.filter(is_featured=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @extend_schema(summary="Get products by category slug")
    @action(detail=False, methods=['get'], url_path='by-category/(?P<category_slug>[^/.]+)')
    def by_category(self, request, category_slug=None):
        """Get products by category slug"""
        try:
            category = Category.objects.get(slug=category_slug)
            products = self.queryset.filter(category=category)
            page = self.paginate_queryset(products)
            if page is not None:
                serializer = ProductListSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = ProductListSerializer(products, many=True)
            return Response(serializer.data)
        except Category.DoesNotExist:
            return Response(
                {'error': 'Category not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ProductImageViewSet(viewsets.ModelViewSet):
    """
    Manage product images
    """
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'is_primary']
