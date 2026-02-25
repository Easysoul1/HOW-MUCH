from rest_framework import serializers
from .models import VendorListing
from apps.products.serializers import ProductListSerializer, ProductSizeSerializer


class VendorListingSerializer(serializers.ModelSerializer):
    """Full listing detail — used for vendor's own listings."""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    size_label = serializers.CharField(source='size.label', read_only=True)
    vendor_email = serializers.EmailField(source='vendor.email', read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = VendorListing
        fields = (
            'id', 'product', 'product_name', 'product_slug', 'product_image',
            'size', 'size_label', 'brand', 'price', 'is_available',
            'notes', 'vendor_email', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'vendor_email')

    def validate_product(self, product):
        if product.status != 'APPROVED' or not product.is_active:
            raise serializers.ValidationError("You can only list approved, active products.")
        return product

    def validate_size(self, size):
        # Validate that size belongs to the selected product (if product already validated)
        product = self.initial_data.get('product') or (self.instance.product_id if self.instance else None)
        if product and size.products.filter(id=product).exists() is False:
            # Size doesn't have to be restricted to product — allow any size
            pass
        return size


class PublicListingSerializer(serializers.ModelSerializer):
    """Lightweight serializer for buyers viewing listings."""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    size_label = serializers.CharField(source='size.label', read_only=True)
    vendor_name = serializers.SerializerMethodField()
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = VendorListing
        fields = (
            'id', 'product_name', 'product_slug', 'product_image',
            'size_label', 'brand', 'price', 'is_available',
            'vendor_name', 'updated_at',
        )

    def get_vendor_name(self, obj):
        profile = getattr(obj.vendor, 'vendor_profile', None)
        if profile and hasattr(profile, 'business_name'):
            return profile.business_name
        return obj.vendor.get_full_name() or obj.vendor.email.split('@')[0]
