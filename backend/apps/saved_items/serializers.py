from rest_framework import serializers
from .models import SavedItem
from apps.pricing.serializers import PublicListingSerializer


class SavedItemSerializer(serializers.ModelSerializer):
    """Full saved item detail with nested listing info."""
    listing_detail = PublicListingSerializer(source='listing', read_only=True)
    
    class Meta:
        model = SavedItem
        fields = ('id', 'listing', 'listing_detail', 'notes', 'saved_at')
        read_only_fields = ('id', 'saved_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SavedItemCreateSerializer(serializers.ModelSerializer):
    """Lightweight serializer for creating saved items."""
    
    class Meta:
        model = SavedItem
        fields = ('listing', 'notes')
    
    def validate_listing(self, listing):
        user = self.context['request'].user
        if SavedItem.objects.filter(user=user, listing=listing).exists():
            raise serializers.ValidationError("This item is already saved.")
        return listing
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SavedItemListSerializer(serializers.Serializer):
    """Returns just the listing IDs that the user has saved (for quick lookups)."""
    listing_ids = serializers.ListField(child=serializers.IntegerField())
