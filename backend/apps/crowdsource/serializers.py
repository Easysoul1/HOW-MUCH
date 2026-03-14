from rest_framework import serializers
from .models import CrowdsourcedSubmission, CrowdsourcedItem


class CrowdsourcedItemSerializer(serializers.ModelSerializer):
    """Serializer for individual crowdsourced items"""
    product_display = serializers.SerializerMethodField()
    size_display = serializers.SerializerMethodField()

    class Meta:
        model = CrowdsourcedItem
        fields = [
            'id', 'product', 'product_name', 'product_display',
            'size', 'size_value', 'size_unit', 'size_display',
            'price', 'brand', 'status', 'rejection_reason',
            'created_at', 'approved_at', 'approved_by'
        ]
        read_only_fields = ['id', 'created_at', 'approved_at', 'approved_by', 'status']

    def get_product_display(self, obj):
        if obj.product:
            return {
                'slug': obj.product.slug,
                'name': obj.product.name
            }
        return {'name': obj.product_name}

    def get_size_display(self, obj):
        if obj.size:
            return {
                'id': obj.size.id,
                'label': obj.size.label
            }
        elif obj.size_value and obj.size_unit:
            return {
                'value': str(obj.size_value),
                'unit': obj.size_unit.abbreviation
            }
        return None


class CrowdsourcedItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating items within a submission"""

    class Meta:
        model = CrowdsourcedItem
        fields = [
            'product', 'product_name',
            'size', 'size_value', 'size_unit',
            'price', 'brand'
        ]

    def validate(self, data):
        # Must have either product or product_name
        if not data.get('product') and not data.get('product_name'):
            raise serializers.ValidationError(
                "Either 'product' or 'product_name' must be provided"
            )

        # Must have either size or (size_value + size_unit)
        if not data.get('size') and not (data.get('size_value') and data.get('size_unit')):
            raise serializers.ValidationError(
                "Either 'size' or both 'size_value' and 'size_unit' must be provided"
            )

        return data


class CrowdsourcedSubmissionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating submissions with multiple items"""
    items = CrowdsourcedItemCreateSerializer(many=True)

    class Meta:
        model = CrowdsourcedSubmission
        fields = [
            'latitude', 'longitude', 'address', 'city', 'state',
            'photo_1', 'photo_2', 'photo_3', 'items'
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("At least one item must be provided")
        if len(items) > 50:
            raise serializers.ValidationError("Maximum 50 items per submission")
        return items

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # Auto-set location_verified if GPS coordinates were provided
        lat = validated_data.get('latitude')
        lon = validated_data.get('longitude')
        validated_data['location_verified'] = bool(lat and lon)
        submission = CrowdsourcedSubmission.objects.create(**validated_data)

        for item_data in items_data:
            CrowdsourcedItem.objects.create(submission=submission, **item_data)

        return submission


class CrowdsourcedSubmissionListSerializer(serializers.ModelSerializer):
    """Serializer for listing submissions"""
    crowdsourcer_email = serializers.CharField(source='crowdsourcer.email', read_only=True)

    class Meta:
        model = CrowdsourcedSubmission
        fields = [
            'id', 'crowdsourcer_email', 'city', 'state',
            'status', 'location_verified', 'item_count', 'approved_item_count',
            'created_at', 'reviewed_at'
        ]
        read_only_fields = fields


class CrowdsourcedSubmissionDetailSerializer(serializers.ModelSerializer):
    """Serializer for submission detail with all items"""
    items = CrowdsourcedItemSerializer(many=True, read_only=True)
    crowdsourcer_email = serializers.CharField(source='crowdsourcer.email', read_only=True)
    reviewed_by_email = serializers.CharField(source='reviewed_by.email', read_only=True)

    class Meta:
        model = CrowdsourcedSubmission
        fields = [
            'id', 'crowdsourcer_email', 'crowdsourcer',
            'latitude', 'longitude', 'address', 'city', 'state',
            'location_verified',
            'photo_1', 'photo_2', 'photo_3',
            'status', 'admin_notes',
            'items', 'item_count', 'approved_item_count',
            'created_at', 'updated_at', 'reviewed_at', 'reviewed_by_email'
        ]
        read_only_fields = fields
