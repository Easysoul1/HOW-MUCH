from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend

from .models import VendorListing
from .serializers import VendorListingSerializer, PublicListingSerializer


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
    GET /api/pricing/public/              — all available listings
    GET /api/pricing/public/?product=slug — listings for a product
    """
    serializer_class = PublicListingSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'size', 'is_available']
    ordering_fields = ['price', 'updated_at']

    def get_queryset(self):
        qs = VendorListing.objects.filter(
            is_available=True,
            vendor__is_active=True,
        ).select_related('product', 'size', 'size__unit', 'vendor')

        product_slug = self.request.query_params.get('product_slug')
        if product_slug:
            qs = qs.filter(product__slug=product_slug)

        return qs
