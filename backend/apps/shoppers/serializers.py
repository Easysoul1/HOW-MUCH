from rest_framework import serializers
from django.db import transaction
from .models import (
    ShopperProfile, ShopperRequest, ShopperRequestItem,
    ShopperOffer, ShopperOfferItem, ShopperRating
)
from apps.pricing.models import VendorListing


class ShopperProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    user_city = serializers.CharField(source='user.city', read_only=True)
    user_state = serializers.CharField(source='user.state', read_only=True)
    profile_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = ShopperProfile
        fields = [
            'id', 'user', 'user_email', 'user_name', 'user_phone', 'user_city', 'user_state',
            'bio', 'experience', 'nin', 'profile_photo', 'profile_photo_url', 'status', 'service_radius_km',
            'total_completed_orders', 'total_earnings', 'average_rating', 'total_ratings',
            'is_available', 'created_at', 'verified_at',
        ]
        read_only_fields = [
            'id', 'user', 'status', 'total_completed_orders', 'total_earnings',
            'average_rating', 'total_ratings', 'created_at', 'verified_at',
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email.split('@')[0]

    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None


class ShopperApplicationSerializer(serializers.ModelSerializer):
    """For applying to become a shopper."""
    class Meta:
        model = ShopperProfile
        fields = ['bio', 'experience', 'nin', 'profile_photo', 'service_radius_km']


class ShopperRequestItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopperRequestItem
        fields = [
            'id', 'listing', 'product_name', 'product_image', 'size_label',
            'brand', 'vendor_name', 'listed_price', 'quantity', 'notes',
        ]
        read_only_fields = ['id']


class ShopperOfferItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='request_item.product_name', read_only=True)
    size_label = serializers.CharField(source='request_item.size_label', read_only=True)
    brand = serializers.CharField(source='request_item.brand', read_only=True)
    quantity = serializers.IntegerField(source='request_item.quantity', read_only=True)
    listed_price = serializers.DecimalField(
        source='request_item.listed_price', max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = ShopperOfferItem
        fields = [
            'id', 'request_item', 'product_name', 'size_label', 'brand',
            'quantity', 'listed_price', 'offered_price', 'notes',
        ]


class ShopperOfferSerializer(serializers.ModelSerializer):
    offer_items = ShopperOfferItemSerializer(many=True, read_only=True)
    grand_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ShopperOffer
        fields = [
            'id', 'request', 'items_total', 'delivery_fee', 'service_fee',
            'grand_total', 'estimated_delivery', 'message', 'is_active',
            'created_at', 'offer_items',
        ]
        read_only_fields = ['id', 'request', 'service_fee', 'is_active', 'created_at']


class ShopperRatingSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = ShopperRating
        fields = ['id', 'rating', 'comment', 'customer_name', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.email.split('@')[0]


class ShopperRequestSerializer(serializers.ModelSerializer):
    """Full request details for shoppers/customers."""
    items = ShopperRequestItemSerializer(many=True, read_only=True)
    offers = ShopperOfferSerializer(many=True, read_only=True)
    latest_offer = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    shopper_name = serializers.SerializerMethodField()
    total_items = serializers.IntegerField(read_only=True)
    unique_vendors = serializers.IntegerField(read_only=True)
    service_fee = serializers.SerializerMethodField()
    items_subtotal = serializers.SerializerMethodField()
    rating = ShopperRatingSerializer(read_only=True)

    class Meta:
        model = ShopperRequest
        fields = [
            'id', 'customer', 'customer_name', 'shopper', 'shopper_name', 'status',
            'customer_notes', 'delivery_address', 'delivery_city', 'delivery_state',
            'delivery_latitude', 'delivery_longitude',
            'created_at', 'updated_at', 'accepted_at', 'completed_at', 'expires_at',
            'items', 'offers', 'latest_offer', 'total_items', 'unique_vendors',
            'service_fee', 'items_subtotal', 'rating',
        ]
        read_only_fields = [
            'id', 'customer', 'shopper', 'status', 'created_at', 'updated_at',
            'accepted_at', 'completed_at', 'expires_at',
        ]

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.email.split('@')[0]

    def get_shopper_name(self, obj):
        if obj.shopper:
            return obj.shopper.get_full_name() or obj.shopper.email.split('@')[0]
        return None

    def get_latest_offer(self, obj):
        offer = obj.offers.filter(is_active=True).first()
        if offer:
            return ShopperOfferSerializer(offer).data
        return None

    def get_service_fee(self, obj):
        return str(obj.calculate_service_fee())

    def get_items_subtotal(self, obj):
        total = sum(item.listed_price * item.quantity for item in obj.items.all())
        return str(total)


class ShopperRequestListSerializer(serializers.ModelSerializer):
    """Compact version for listing requests in the pool."""
    customer_name = serializers.SerializerMethodField()
    total_items = serializers.IntegerField(read_only=True)
    unique_vendors = serializers.IntegerField(read_only=True)
    items_subtotal = serializers.SerializerMethodField()
    service_fee = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()
    items = ShopperRequestItemSerializer(many=True, read_only=True)
    customer_notes = serializers.CharField(read_only=True)

    class Meta:
        model = ShopperRequest
        fields = [
            'id', 'customer_name', 'status', 'delivery_city', 'delivery_state',
            'customer_notes', 'created_at', 'expires_at', 'total_items', 'unique_vendors',
            'items_subtotal', 'service_fee', 'distance_km', 'items',
        ]

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.email.split('@')[0]

    def get_items_subtotal(self, obj):
        total = sum(item.listed_price * item.quantity for item in obj.items.all())
        return str(total)

    def get_service_fee(self, obj):
        return str(obj.calculate_service_fee())

    def get_distance_km(self, obj):
        # Calculate distance if shopper location is available
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.latitude and obj.delivery_latitude:
            from math import radians, sin, cos, sqrt, atan2
            
            lat1 = radians(float(request.user.latitude))
            lon1 = radians(float(request.user.longitude))
            lat2 = radians(float(obj.delivery_latitude))
            lon2 = radians(float(obj.delivery_longitude))
            
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            
            # Earth's radius in km
            r = 6371
            return round(r * c, 1)
        return None


# --- Input Serializers ---

class CartItemInputSerializer(serializers.Serializer):
    listing_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class CreateShopperRequestSerializer(serializers.Serializer):
    """Create a shopper request from cart items."""
    items = CartItemInputSerializer(many=True)
    customer_notes = serializers.CharField(required=False, allow_blank=True, default='')
    delivery_address = serializers.CharField(required=False, allow_blank=True, default='')
    delivery_city = serializers.CharField(required=False, allow_blank=True, default='')
    delivery_state = serializers.CharField(required=False, allow_blank=True, default='')
    delivery_latitude = serializers.DecimalField(
        max_digits=10, decimal_places=7, required=False, allow_null=True
    )
    delivery_longitude = serializers.DecimalField(
        max_digits=10, decimal_places=7, required=False, allow_null=True
    )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        
        listing_ids = [item['listing_id'] for item in value]
        listings = VendorListing.objects.filter(id__in=listing_ids, is_available=True)
        
        if listings.count() != len(listing_ids):
            found_ids = set(listings.values_list('id', flat=True))
            missing = set(listing_ids) - found_ids
            raise serializers.ValidationError(f"Invalid or unavailable listings: {missing}")
        
        return value

    def validate(self, data):
        if not data.get('delivery_address'):
            raise serializers.ValidationError({
                'delivery_address': 'Delivery address is required for shopper requests.'
            })
        return data

    def create(self, validated_data):
        customer = self.context['request'].user
        items_data = validated_data.pop('items')
        
        # Get all listings
        listing_ids = [item['listing_id'] for item in items_data]
        listings = {
            l.id: l for l in VendorListing.objects.filter(id__in=listing_ids).select_related(
                'vendor', 'product', 'size', 'vendor__vendorverification'
            )
        }
        
        with transaction.atomic():
            # Create the request
            shopper_request = ShopperRequest.objects.create(
                customer=customer,
                customer_notes=validated_data.get('customer_notes', ''),
                delivery_address=validated_data.get('delivery_address', ''),
                delivery_city=validated_data.get('delivery_city', ''),
                delivery_state=validated_data.get('delivery_state', ''),
                delivery_latitude=validated_data.get('delivery_latitude'),
                delivery_longitude=validated_data.get('delivery_longitude'),
            )
            
            # Create request items
            for item_data in items_data:
                listing = listings[item_data['listing_id']]
                vendor_name = listing.vendor.get_full_name() or listing.vendor.email
                
                # Try to get business name from verification
                if hasattr(listing.vendor, 'vendorverification'):
                    v = listing.vendor.vendorverification
                    if v.business_name:
                        vendor_name = v.business_name
                
                ShopperRequestItem.objects.create(
                    request=shopper_request,
                    listing=listing,
                    product_name=listing.product.name,
                    product_image=listing.product.image.url if listing.product.image else '',
                    size_label=listing.size.label if listing.size else '',
                    brand=listing.product.brand or '',
                    vendor_name=vendor_name,
                    listed_price=listing.price,
                    quantity=item_data['quantity'],
                    notes=item_data.get('notes', ''),
                )
        
        return shopper_request


class MakeShopperOfferSerializer(serializers.Serializer):
    """Shopper makes an offer to customer."""
    items = serializers.ListField(child=serializers.DictField())
    delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    estimated_delivery = serializers.CharField(required=False, allow_blank=True, default='')
    message = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        
        for item in value:
            if 'request_item_id' not in item:
                raise serializers.ValidationError("Each item must have 'request_item_id'.")
            if 'offered_price' not in item:
                raise serializers.ValidationError("Each item must have 'offered_price'.")
        
        return value


class RateShopperSerializer(serializers.Serializer):
    """Customer rates a shopper after completion."""
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True, default='')
