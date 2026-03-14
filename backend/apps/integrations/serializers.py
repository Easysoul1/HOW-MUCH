from rest_framework import serializers
from django.utils import timezone
from .models import ApiKey, ApiUsageLog


class ApiKeySerializer(serializers.ModelSerializer):
    """Serializer for listing API keys (masks the full key)."""
    masked_key = serializers.CharField(read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    requests_today = serializers.SerializerMethodField()
    
    class Meta:
        model = ApiKey
        fields = (
            'id', 'key', 'masked_key', 'name', 'owner', 'owner_email',
            'plan', 'daily_limit', 'is_active',
            'created_at', 'last_used_at', 'expires_at', 'requests_today',
        )
        read_only_fields = ('id', 'key', 'created_at', 'last_used_at')
    
    def get_requests_today(self, obj):
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        return obj.usage_logs.filter(timestamp__gte=today_start).count()


class ApiKeyCreateSerializer(serializers.Serializer):
    """For admin creating API keys."""
    name = serializers.CharField(max_length=100)
    owner_id = serializers.IntegerField()
    plan = serializers.ChoiceField(choices=ApiKey.PLAN_CHOICES, default='BASIC')
    daily_limit = serializers.IntegerField(default=10000, min_value=100)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)
    
    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        owner = User.objects.get(pk=validated_data['owner_id'])
        return ApiKey.objects.create(
            name=validated_data['name'],
            owner=owner,
            plan=validated_data.get('plan', 'BASIC'),
            daily_limit=validated_data.get('daily_limit', 10000),
            expires_at=validated_data.get('expires_at'),
        )


class ApiUsageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiUsageLog
        fields = ('id', 'endpoint', 'method', 'status_code', 'response_time_ms', 'ip_address', 'timestamp')


class ApiUsageSummarySerializer(serializers.Serializer):
    """Summary stats for an API key."""
    total_requests = serializers.IntegerField()
    requests_today = serializers.IntegerField()
    avg_response_time_ms = serializers.FloatField()
    daily_limit = serializers.IntegerField()
    most_used_endpoints = serializers.ListField()


# --- Public API serializers (3rd party facing) ---

class PublicProductSerializer(serializers.Serializer):
    """Slim product serializer for the public API."""
    slug = serializers.CharField()
    name = serializers.CharField()
    category = serializers.CharField(source='category.name')
    image = serializers.ImageField()
    available_sizes = serializers.SerializerMethodField()
    
    def get_available_sizes(self, obj):
        return [{'id': s.id, 'label': s.label} for s in obj.available_sizes.all()]


class PublicProductDetailSerializer(serializers.Serializer):
    """Detailed product for the public API."""
    slug = serializers.CharField()
    name = serializers.CharField()
    sku = serializers.CharField()
    description = serializers.CharField()
    category = serializers.CharField(source='category.name')
    image = serializers.ImageField()
    available_sizes = serializers.SerializerMethodField()
    
    def get_available_sizes(self, obj):
        return [{'id': s.id, 'label': s.label} for s in obj.available_sizes.all()]


class PublicPriceSerializer(serializers.Serializer):
    """Price listing for the public API."""
    id = serializers.IntegerField()
    product = serializers.CharField(source='product.name')
    product_slug = serializers.CharField(source='product.slug')
    size = serializers.CharField(source='size.label')
    brand = serializers.CharField()
    price = serializers.DecimalField(max_digits=12, decimal_places=2)
    vendor_location = serializers.SerializerMethodField()
    is_available = serializers.BooleanField()
    updated_at = serializers.DateTimeField()
    
    def get_vendor_location(self, obj):
        return {
            'city': obj.vendor.city or '',
            'state': obj.vendor.state or '',
        }


class PublicPriceHistorySerializer(serializers.Serializer):
    """Price history record for the public API."""
    product = serializers.CharField(source='listing.product.name')
    product_slug = serializers.CharField(source='listing.product.slug')
    size = serializers.CharField(source='listing.size.label')
    brand = serializers.CharField(source='listing.brand')
    price = serializers.DecimalField(max_digits=12, decimal_places=2)
    recorded_at = serializers.DateTimeField()
