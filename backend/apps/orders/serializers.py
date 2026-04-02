from rest_framework import serializers
from .models import PurchaseRequest, RequestItem, VendorOffer, OfferItem
from apps.pricing.models import VendorListing


class OfferItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='request_item.product_name', read_only=True)
    size_label = serializers.CharField(source='request_item.size_label', read_only=True)
    brand = serializers.CharField(source='request_item.brand', read_only=True)
    quantity = serializers.IntegerField(source='request_item.quantity', read_only=True)
    listed_price = serializers.DecimalField(
        source='request_item.listed_price', 
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = OfferItem
        fields = [
            'id', 'request_item', 'offered_price', 'notes',
            'product_name', 'size_label', 'brand', 'quantity', 'listed_price',
        ]


class VendorOfferSerializer(serializers.ModelSerializer):
    offer_items = OfferItemSerializer(many=True, read_only=True)
    items_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    grand_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = VendorOffer
        fields = [
            'id', 'request', 'delivery_fee', 'service_fee', 'discount',
            'estimated_delivery', 'message', 'is_active', 'created_at',
            'offer_items', 'items_total', 'grand_total',
        ]
        read_only_fields = ['id', 'request', 'is_active', 'created_at']


class RequestItemSerializer(serializers.ModelSerializer):
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = RequestItem
        fields = [
            'id', 'listing', 'product_name', 'product_image', 'size_label',
            'brand', 'listed_price', 'quantity', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_product_image(self, obj):
        if obj.product_image:
            return obj.product_image
        if obj.listing and obj.listing.product.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.listing.product.image.url)
            return obj.listing.product.image.url
        return None


class PurchaseRequestSerializer(serializers.ModelSerializer):
    items = RequestItemSerializer(many=True, read_only=True)
    offers = VendorOfferSerializer(many=True, read_only=True)
    latest_offer = serializers.SerializerMethodField()
    vendor_name = serializers.SerializerMethodField()
    vendor_address = serializers.SerializerMethodField()
    buyer_name = serializers.SerializerMethodField()
    expires_at = serializers.DateTimeField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = PurchaseRequest
        fields = [
            'id', 'buyer', 'vendor', 'status', 'fulfillment_status', 'delivery_method',
            'buyer_notes', 'rejection_reason',
            'delivery_address', 'delivery_city', 'delivery_state',
            'delivery_latitude', 'delivery_longitude',
            'created_at', 'updated_at', 'expires_at', 'is_expired',
            'items', 'offers', 'latest_offer',
            'vendor_name', 'vendor_address', 'buyer_name', 'total_items',
        ]
        read_only_fields = [
            'id', 'buyer', 'vendor', 'status', 'created_at', 'updated_at',
        ]

    def get_latest_offer(self, obj):
        offer = obj.offers.filter(is_active=True).first()
        if offer:
            return VendorOfferSerializer(offer, context=self.context).data
        return None

    def get_vendor_name(self, obj):
        verification = getattr(obj.vendor, 'vendorverification', None)
        if verification and verification.business_name:
            return verification.business_name
        return obj.vendor.get_full_name() or obj.vendor.email.split('@')[0]

    def get_vendor_address(self, obj):
        """Return vendor's address for pickup orders."""
        verification = getattr(obj.vendor, 'vendorverification', None)
        if verification and verification.store_address:
            return verification.store_address
        return f"{obj.vendor.city}, {obj.vendor.state}" if obj.vendor.city else None

    def get_buyer_name(self, obj):
        return obj.buyer.get_full_name() or obj.buyer.email.split('@')[0]


# --- Input Serializers for Creating/Updating ---

class CartItemInputSerializer(serializers.Serializer):
    """Input for a single cart item when creating a request."""
    listing_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class CreateRequestSerializer(serializers.Serializer):
    """
    Input for creating purchase requests from cart.
    Accepts list of cart items and groups them by vendor.
    """
    items = CartItemInputSerializer(many=True)
    delivery_method = serializers.ChoiceField(choices=['delivery', 'pickup'], default='delivery')
    buyer_notes = serializers.CharField(required=False, allow_blank=True, default='')
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
        # Require address if delivery method is 'delivery'
        if data.get('delivery_method') == 'delivery':
            if not data.get('delivery_address'):
                raise serializers.ValidationError({
                    'delivery_address': 'Delivery address is required for delivery orders.'
                })
        return data

    def create(self, validated_data):
        buyer = self.context['request'].user
        items_data = validated_data.pop('items')
        
        # Get all listings
        listing_ids = [item['listing_id'] for item in items_data]
        listings = {l.id: l for l in VendorListing.objects.filter(id__in=listing_ids).select_related('vendor', 'product', 'size')}
        
        # Group items by vendor
        vendor_items = {}
        for item_data in items_data:
            listing = listings[item_data['listing_id']]
            vendor_id = listing.vendor_id
            if vendor_id not in vendor_items:
                vendor_items[vendor_id] = []
            vendor_items[vendor_id].append((listing, item_data))
        
        # Create one PurchaseRequest per vendor
        created_requests = []
        for vendor_id, vendor_item_list in vendor_items.items():
            request = PurchaseRequest.objects.create(
                buyer=buyer,
                vendor_id=vendor_id,
                delivery_method=validated_data.get('delivery_method', 'delivery'),
                buyer_notes=validated_data.get('buyer_notes', ''),
                delivery_address=validated_data.get('delivery_address', ''),
                delivery_city=validated_data.get('delivery_city', ''),
                delivery_state=validated_data.get('delivery_state', ''),
                delivery_latitude=validated_data.get('delivery_latitude'),
                delivery_longitude=validated_data.get('delivery_longitude'),
            )
            
            # Create RequestItems
            for listing, item_data in vendor_item_list:
                product_image_url = None
                if listing.product.image:
                    product_image_url = listing.product.image.url
                
                RequestItem.objects.create(
                    request=request,
                    listing=listing,
                    product_name=listing.product.name,
                    product_image=product_image_url,
                    size_label=listing.size.label,
                    brand=listing.brand,
                    listed_price=listing.price,
                    quantity=item_data.get('quantity', 1),
                    notes=item_data.get('notes', ''),
                )
            
            created_requests.append(request)
        
        return created_requests


class MakeOfferInputSerializer(serializers.Serializer):
    """Input for vendor making an offer."""
    items = serializers.ListField(child=serializers.DictField())
    delivery_fee = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    service_fee = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    estimated_delivery = serializers.CharField(required=False, allow_blank=True, default='')
    message = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_items(self, value):
        """
        Each item should have:
        - request_item_id: int
        - offered_price: decimal
        - notes: str (optional)
        """
        if not value:
            raise serializers.ValidationError("At least one item price is required.")
        
        for item in value:
            if 'request_item_id' not in item:
                raise serializers.ValidationError("Each item must have 'request_item_id'.")
            if 'offered_price' not in item:
                raise serializers.ValidationError("Each item must have 'offered_price'.")
            try:
                float(item['offered_price'])
            except (ValueError, TypeError):
                raise serializers.ValidationError(f"Invalid price for item {item.get('request_item_id')}")
        
        return value


class RespondToOfferSerializer(serializers.Serializer):
    """Input for buyer responding to an offer."""
    action = serializers.ChoiceField(choices=['accept', 'reject'])
    comment = serializers.CharField(required=False, allow_blank=True, default='')
