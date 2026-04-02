from rest_framework import serializers
from .models import VendorListing, PriceHistory


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
        product = self.initial_data.get('product') or (self.instance.product_id if self.instance else None)
        if product and size.products.filter(id=product).exists() is False:
            pass
        return size


class PublicListingSerializer(serializers.ModelSerializer):
    """Lightweight serializer for buyers viewing listings."""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    size_label = serializers.CharField(source='size.label', read_only=True)
    vendor_id = serializers.IntegerField(source='vendor.id', read_only=True)
    vendor_name = serializers.SerializerMethodField()
    vendor_city = serializers.CharField(source='vendor.city', read_only=True)
    vendor_state = serializers.CharField(source='vendor.state', read_only=True)
    vendor_latitude = serializers.DecimalField(source='vendor.latitude', max_digits=10, decimal_places=7, read_only=True)
    vendor_longitude = serializers.DecimalField(source='vendor.longitude', max_digits=10, decimal_places=7, read_only=True)
    vendor_verified = serializers.BooleanField(source='vendor.is_verified', read_only=True)
    distance_km = serializers.SerializerMethodField()
    updated_at = serializers.DateTimeField(read_only=True)
    price_change_pct = serializers.SerializerMethodField()

    class Meta:
        model = VendorListing
        fields = (
            'id', 'product_name', 'product_slug', 'product_image',
            'size_label', 'brand', 'price', 'is_available',
            'vendor_id', 'vendor_name', 'vendor_city', 'vendor_state',
            'vendor_latitude', 'vendor_longitude', 'vendor_verified', 'distance_km',
            'updated_at', 'price_change_pct',
        )

    def get_distance_km(self, obj):
        """Return pre-computed distance if annotated by the view."""
        dist = getattr(obj, '_distance_km', None)
        if dist is not None:
            return round(dist, 1)
        return None

    def get_vendor_name(self, obj):
        # Try to get business name from vendor verification
        verification = getattr(obj.vendor, 'vendor_verification', None)
        if verification and verification.business_name:
            return verification.business_name
        return obj.vendor.get_full_name() or obj.vendor.email.split('@')[0]

    def get_price_change_pct(self, obj):
        """
        Returns % change from the previous price to current.
        Positive = price went up, negative = price went down, None = no history.
        """
        last = obj.price_history.order_by('-recorded_at').first()
        if not last:
            return None
        old = float(last.price)
        current = float(obj.price)
        if old == 0:
            return None
        return round((current - old) / old * 100, 1)


class PriceHistorySerializer(serializers.ModelSerializer):
    """Full history record — for export, graphs, ML training."""
    listing_id = serializers.IntegerField(source='listing.id', read_only=True)
    product_name = serializers.CharField(source='listing.product.name', read_only=True)
    product_slug = serializers.CharField(source='listing.product.slug', read_only=True)
    size_label = serializers.CharField(source='listing.size.label', read_only=True)
    brand = serializers.CharField(source='listing.brand', read_only=True)
    vendor_name = serializers.SerializerMethodField()

    class Meta:
        model = PriceHistory
        fields = (
            'id', 'listing_id', 'product_name', 'product_slug',
            'size_label', 'brand', 'vendor_name', 'price', 'recorded_at',
        )

    def get_vendor_name(self, obj):
        profile = getattr(obj.listing.vendor, 'vendor_profile', None)
        if profile and hasattr(profile, 'business_name'):
            return profile.business_name
        return obj.listing.vendor.get_full_name() or obj.listing.vendor.email.split('@')[0]
