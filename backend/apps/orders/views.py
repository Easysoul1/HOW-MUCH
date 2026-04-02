from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q

from .models import PurchaseRequest, RequestItem, VendorOffer, OfferItem
from .serializers import (
    PurchaseRequestSerializer,
    CreateRequestSerializer,
    MakeOfferInputSerializer,
    RespondToOfferSerializer,
    VendorOfferSerializer,
)


class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'CUSTOMER'


class IsVendor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'VENDOR'


class CustomerRequestViewSet(viewsets.ModelViewSet):
    """
    Customer's purchase requests.
    
    GET /api/requests/           - List customer's requests
    POST /api/requests/          - Create new request(s) from cart
    GET /api/requests/{id}/      - Get request detail
    POST /api/requests/{id}/respond/ - Accept/reject an offer
    POST /api/requests/{id}/re-request/ - Re-request an expired/rejected request
    """
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return PurchaseRequest.objects.filter(
            buyer=self.request.user
        ).select_related('vendor').prefetch_related(
            'items', 'offers', 'offers__offer_items'
        )

    def create(self, request, *args, **kwargs):
        """Create purchase request(s) from cart items."""
        serializer = CreateRequestSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        created_requests = serializer.save()
        
        # Return the created requests
        output_serializer = PurchaseRequestSerializer(
            created_requests, many=True, context={'request': request}
        )
        return Response({
            'message': f'Created {len(created_requests)} request(s)',
            'requests': output_serializer.data,
            'vendor_count': len(created_requests),
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Accept or reject an offer."""
        purchase_request = self.get_object()
        
        if purchase_request.status not in ['offer_made']:
            return Response(
                {'error': 'Can only respond to requests with an active offer.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = RespondToOfferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action_type = serializer.validated_data['action']
        comment = serializer.validated_data.get('comment', '')
        
        if action_type == 'accept':
            purchase_request.status = 'accepted'
            purchase_request.save()
            return Response({'message': 'Offer accepted', 'status': 'accepted'})
        else:
            purchase_request.status = 'rejected'
            purchase_request.rejection_reason = comment
            purchase_request.save()
            return Response({'message': 'Offer rejected', 'status': 'rejected'})

    @action(detail=True, methods=['post'], url_path='re-request')
    def re_request(self, request, pk=None):
        """Re-request an expired or rejected request."""
        old_request = self.get_object()
        
        if old_request.status not in ['expired', 'rejected']:
            return Response(
                {'error': 'Can only re-request expired or rejected requests.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create a new request with the same items
        new_request = PurchaseRequest.objects.create(
            buyer=old_request.buyer,
            vendor=old_request.vendor,
            buyer_notes=old_request.buyer_notes,
            delivery_address=old_request.delivery_address,
            delivery_city=old_request.delivery_city,
            delivery_state=old_request.delivery_state,
            delivery_latitude=old_request.delivery_latitude,
            delivery_longitude=old_request.delivery_longitude,
        )
        
        # Copy items
        for item in old_request.items.all():
            RequestItem.objects.create(
                request=new_request,
                listing=item.listing,
                product_name=item.product_name,
                product_image=item.product_image,
                size_label=item.size_label,
                brand=item.brand,
                listed_price=item.listing.price if item.listing else item.listed_price,
                quantity=item.quantity,
                notes=item.notes,
            )
        
        serializer = PurchaseRequestSerializer(new_request, context={'request': request})
        return Response({
            'message': 'Request re-sent to vendor',
            'request': serializer.data,
        }, status=status.HTTP_201_CREATED)


class VendorRequestViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Vendor's incoming requests.
    
    GET /api/vendor/requests/           - List incoming requests
    GET /api/vendor/requests/{id}/      - Get request detail
    POST /api/vendor/requests/{id}/offer/ - Make an offer
    """
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsVendor]

    def get_queryset(self):
        return PurchaseRequest.objects.filter(
            vendor=self.request.user
        ).exclude(
            status='expired'
        ).select_related('buyer').prefetch_related(
            'items', 'offers', 'offers__offer_items'
        )

    @action(detail=True, methods=['post'])
    def offer(self, request, pk=None):
        """Make an offer for a request."""
        purchase_request = self.get_object()
        
        if purchase_request.status in ['accepted', 'expired']:
            return Response(
                {'error': f'Cannot make offer on {purchase_request.status} request.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = MakeOfferInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        # Validate that all request items are covered
        request_item_ids = set(purchase_request.items.values_list('id', flat=True))
        provided_item_ids = set(item['request_item_id'] for item in data['items'])
        
        if request_item_ids != provided_item_ids:
            missing = request_item_ids - provided_item_ids
            return Response(
                {'error': f'Missing prices for items: {missing}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the offer
        offer = VendorOffer.objects.create(
            request=purchase_request,
            delivery_fee=data.get('delivery_fee', 0),
            service_fee=data.get('service_fee', 0),
            discount=data.get('discount', 0),
            estimated_delivery=data.get('estimated_delivery', ''),
            message=data.get('message', ''),
        )
        
        # Create offer items
        for item_data in data['items']:
            OfferItem.objects.create(
                offer=offer,
                request_item_id=item_data['request_item_id'],
                offered_price=item_data['offered_price'],
                notes=item_data.get('notes', ''),
            )
        
        # Update request status
        purchase_request.status = 'offer_made'
        purchase_request.save()
        
        offer_serializer = VendorOfferSerializer(offer, context={'request': request})
        return Response({
            'message': 'Offer sent to buyer',
            'offer': offer_serializer.data,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update fulfillment status of an accepted order."""
        purchase_request = self.get_object()
        
        if purchase_request.status != 'accepted':
            return Response(
                {'error': 'Can only update status of accepted orders.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        new_status = request.data.get('fulfillment_status')
        valid_statuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']
        
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        purchase_request.fulfillment_status = new_status
        purchase_request.save()
        
        serializer = PurchaseRequestSerializer(purchase_request, context={'request': request})
        return Response({
            'message': f'Order status updated to {new_status}',
            'request': serializer.data,
        })


class VendorOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Vendor's active orders (accepted requests).
    
    GET /api/orders/vendor-orders/           - List accepted orders
    GET /api/orders/vendor-orders/{id}/      - Get order detail
    POST /api/orders/vendor-orders/{id}/update-status/ - Update fulfillment status
    """
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsVendor]

    def get_queryset(self):
        return PurchaseRequest.objects.filter(
            vendor=self.request.user,
            status='accepted',
        ).select_related('buyer').prefetch_related(
            'items', 'offers', 'offers__offer_items'
        )

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update fulfillment status of an order."""
        order = self.get_object()
        
        new_status = request.data.get('fulfillment_status')
        valid_statuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']
        
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.fulfillment_status = new_status
        order.save()
        
        serializer = PurchaseRequestSerializer(order, context={'request': request})
        return Response({
            'message': f'Order status updated to {new_status}',
            'order': serializer.data,
        })


class ExpireRequestsView(APIView):
    """
    Management endpoint to expire stale requests.
    Can be called by a cron job or celery task.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        cutoff = timezone.now() - timezone.timedelta(hours=48)
        expired_count = PurchaseRequest.objects.filter(
            status__in=['pending', 'offer_made'],
            updated_at__lt=cutoff,
        ).update(status='expired')
        
        return Response({
            'message': f'Expired {expired_count} request(s)',
            'expired_count': expired_count,
        })

