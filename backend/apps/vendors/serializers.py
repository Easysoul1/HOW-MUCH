from rest_framework import serializers
from .models import VendorVerification


class VendorVerificationSerializer(serializers.ModelSerializer):
    """Full verification detail for vendor viewing their own status."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    reviewed_by_email = serializers.EmailField(source='reviewed_by.email', read_only=True, allow_null=True)
    store_image_1_url = serializers.SerializerMethodField()
    store_image_2_url = serializers.SerializerMethodField()
    store_image_3_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorVerification
        fields = (
            'id', 'user_email', 'business_name', 'nin',
            'store_address', 'store_city', 'store_state', 'store_landmark',
            'store_image_1', 'store_image_2', 'store_image_3',
            'store_image_1_url', 'store_image_2_url', 'store_image_3_url',
            'years_in_business', 'products_sold',
            'status', 'rejection_reason',
            'reviewed_by_email', 'reviewed_at',
            'submitted_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'user_email', 'status', 'rejection_reason',
            'reviewed_by_email', 'reviewed_at', 'submitted_at', 'updated_at',
        )
    
    def get_store_image_1_url(self, obj):
        return obj.store_image_1.url if obj.store_image_1 else None
    
    def get_store_image_2_url(self, obj):
        return obj.store_image_2.url if obj.store_image_2 else None
    
    def get_store_image_3_url(self, obj):
        return obj.store_image_3.url if obj.store_image_3 else None


class VendorVerificationSubmitSerializer(serializers.ModelSerializer):
    """For vendors submitting their verification request."""
    
    class Meta:
        model = VendorVerification
        fields = (
            'business_name', 'nin',
            'store_address', 'store_city', 'store_state', 'store_landmark',
            'store_image_1', 'store_image_2', 'store_image_3',
            'years_in_business', 'products_sold',
        )
    
    def validate_nin(self, value):
        # Basic NIN validation (11 digits in Nigeria)
        cleaned = ''.join(filter(str.isdigit, value))
        if len(cleaned) != 11:
            raise serializers.ValidationError("NIN must be 11 digits")
        return cleaned
    
    def validate(self, attrs):
        # Require at least one store image
        if not any([
            attrs.get('store_image_1'),
            attrs.get('store_image_2'),
            attrs.get('store_image_3')
        ]):
            # Check if updating existing with images
            if self.instance:
                if not any([
                    self.instance.store_image_1,
                    self.instance.store_image_2,
                    self.instance.store_image_3
                ]):
                    raise serializers.ValidationError({
                        'store_image_1': 'At least one store image is required'
                    })
            else:
                raise serializers.ValidationError({
                    'store_image_1': 'At least one store image is required'
                })
        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'PENDING'
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Reset to pending when resubmitting after rejection
        if instance.status == 'REJECTED':
            validated_data['status'] = 'PENDING'
            validated_data['rejection_reason'] = ''
        return super().update(instance, validated_data)


class AdminVendorVerificationSerializer(serializers.ModelSerializer):
    """For admin viewing verification requests."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    store_image_1_url = serializers.SerializerMethodField()
    store_image_2_url = serializers.SerializerMethodField()
    store_image_3_url = serializers.SerializerMethodField()
    reviewed_by_email = serializers.EmailField(source='reviewed_by.email', read_only=True, allow_null=True)
    
    class Meta:
        model = VendorVerification
        fields = (
            'id', 'user_email', 'user_name', 'user_phone',
            'business_name', 'nin',
            'store_address', 'store_city', 'store_state', 'store_landmark',
            'store_image_1_url', 'store_image_2_url', 'store_image_3_url',
            'years_in_business', 'products_sold',
            'status', 'rejection_reason',
            'reviewed_by_email', 'reviewed_at',
            'submitted_at',
        )
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email.split('@')[0]
    
    def get_store_image_1_url(self, obj):
        return obj.store_image_1.url if obj.store_image_1 else None
    
    def get_store_image_2_url(self, obj):
        return obj.store_image_2.url if obj.store_image_2 else None
    
    def get_store_image_3_url(self, obj):
        return obj.store_image_3.url if obj.store_image_3 else None


class VendorVerificationActionSerializer(serializers.Serializer):
    """For admin approve/reject actions."""
    reason = serializers.CharField(required=False, allow_blank=True)
