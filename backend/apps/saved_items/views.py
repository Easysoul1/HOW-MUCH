from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SavedItem
from .serializers import SavedItemSerializer, SavedItemCreateSerializer


class SavedItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user's saved items.
    
    list: GET /api/saved-items/ — list user's saved items
    create: POST /api/saved-items/ — save a listing
    retrieve: GET /api/saved-items/{id}/ — get single saved item
    destroy: DELETE /api/saved-items/{id}/ — remove saved item
    ids: GET /api/saved-items/ids/ — get list of saved listing IDs (for quick checks)
    toggle: POST /api/saved-items/toggle/ — toggle save state for a listing
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SavedItem.objects.filter(user=self.request.user).select_related(
            'listing', 'listing__product', 'listing__size', 'listing__vendor'
        )
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SavedItemCreateSerializer
        return SavedItemSerializer
    
    @action(detail=False, methods=['get'])
    def ids(self, request):
        """Return list of listing IDs that the user has saved."""
        listing_ids = list(
            SavedItem.objects.filter(user=request.user).values_list('listing_id', flat=True)
        )
        return Response({'listing_ids': listing_ids})
    
    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """
        Toggle save state for a listing.
        POST /api/saved-items/toggle/ with {"listing": <id>}
        Returns {"saved": true/false, "id": <saved_item_id or null>}
        """
        listing_id = request.data.get('listing')
        if not listing_id:
            return Response(
                {'error': 'listing is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            saved_item = SavedItem.objects.get(user=request.user, listing_id=listing_id)
            saved_item.delete()
            return Response({'saved': False, 'id': None})
        except SavedItem.DoesNotExist:
            from apps.pricing.models import VendorListing
            try:
                listing = VendorListing.objects.get(id=listing_id)
            except VendorListing.DoesNotExist:
                return Response(
                    {'error': 'Listing not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            saved_item = SavedItem.objects.create(user=request.user, listing=listing)
            return Response({'saved': True, 'id': saved_item.id})
