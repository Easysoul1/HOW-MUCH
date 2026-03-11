from rest_framework import serializers
from .models import MarketPrice
from apps.products.serializers import ProductListSerializer

class MarketPriceSerializer(serializers.ModelSerializer):
    """
    Serializer for MarketPrice objects. Handles both reading and writing.
    """
    product_details = ProductListSerializer(source='product', read_only=True)
    crowdsourcer_name = serializers.CharField(source='crowdsourcer.username', read_only=True)

    class Meta:
        model = MarketPrice
        fields = [
            'id', 'product', 'product_name', 'product_details', 'crowdsourcer', 'crowdsourcer_name',  
            'price', 'market_name', 'proof_image_1', 'proof_image_2', 'proof_image_3', 'proof_image_4', 'proof_image_5', 'status', 'notes', 
            'reviewed_by', 'reviewed_at', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'crowdsourcer', 'status', 'reviewed_by', 
            'reviewed_at', 'rejection_reason', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        # The view should set the crowdsourcer
        return super().create(validated_data)
