from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction

from .models import (
    ShopperProfile, ShopperRequest, ShopperRequestItem,
    ShopperOffer, ShopperOfferItem, ShopperRating
)
from .serializers import (
    ShopperProfileSerializer, ShopperApplicationSerializer,
    ShopperRequestSerializer, ShopperRequestListSerializer,
    ShopperOfferSerializer, CreateShopperRequestSerializer,
    MakeShopperOfferSerializer, RateShopperSerializer,
)


class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'CUSTOMER'


class IsShopper(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'SHOPPER'


class IsApprovedShopper(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated or request.user.user_type != 'SHOPPER':
            return False
        try:
            return request.user.shopper_profile.status == 'approved'
        except ShopperProfile.DoesNotExist:
            return False


# --- Shopper Profile Views ---

class ShopperProfileView(APIView):
    """
    Get or update shopper profile.
    """
    permission_classes = [IsShopper]

    def get(self, request):
        try:
            profile = request.user.shopper_profile
            serializer = ShopperProfileSerializer(profile)
            return Response(serializer.data)
        except ShopperProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found. Please apply first.'},
                status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request):
        try:
            profile = request.user.shopper_profile
            serializer = ShopperProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ShopperProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class ShopperApplicationView(APIView):
    """
    Apply to become a personal shopper.
    Creates a ShopperProfile with pending status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Check if user is already a shopper
        if request.user.user_type == 'SHOPPER':
            try:
                profile = request.user.shopper_profile
                return Response({
                    'message': 'You already have a shopper profile.',
                    'status': profile.status,
                })
            except ShopperProfile.DoesNotExist:
                pass
        
        # Change user type to SHOPPER
        request.user.user_type = 'SHOPPER'
        request.user.save()
        
        # Create profile
        serializer = ShopperApplicationSerializer(data=request.data)
        if serializer.is_valid():
            profile = ShopperProfile.objects.create(
                user=request.user,
                **serializer.validated_data
            )
            return Response({
                'message': 'Application submitted! We will review and get back to you.',
                'status': profile.status,
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShopperDashboardView(APIView):
    """
    Dashboard stats for shoppers.
    """
    permission_classes = [IsShopper]

    def get(self, request):
        try:
            profile = request.user.shopper_profile
        except ShopperProfile.DoesNotExist:
            return Response({
                'profile_status': 'not_applied',
                'is_available': False,
                'pool_requests': 0,
                'active_requests': 0,
                'completed_requests': 0,
                'total_earnings': '0',
                'average_rating': 0,
                'total_ratings': 0,
            })
        
        # Get current requests
        active_requests = ShopperRequest.objects.filter(
            shopper=request.user,
            status__in=['accepted', 'offer_made', 'confirmed', 'in_progress']
        ).count()
        
        pool_requests = ShopperRequest.objects.filter(
            status='open',
            expires_at__gt=timezone.now()
        ).count() if profile.status == 'approved' else 0
        
        return Response({
            'profile_status': profile.status,
            'is_available': profile.is_available,
            'pool_requests': pool_requests,
            'active_requests': active_requests,
            'completed_requests': profile.total_completed_orders,
            'total_earnings': str(profile.total_earnings),
            'average_rating': float(profile.average_rating),
            'total_ratings': profile.total_ratings,
        })


# --- Customer Request Views ---

class CustomerShopperRequestViewSet(viewsets.ModelViewSet):
    """
    Customer's shopper requests.
    
    POST /api/shoppers/requests/           - Create new request (assign to shopper pool)
    GET /api/shoppers/requests/            - List my requests
    GET /api/shoppers/requests/{id}/       - Request detail
    POST /api/shoppers/requests/{id}/respond/  - Accept/reject offer
    POST /api/shoppers/requests/{id}/rate/     - Rate shopper after completion
    POST /api/shoppers/requests/{id}/cancel/   - Cancel request
    """
    permission_classes = [IsCustomer]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateShopperRequestSerializer
        return ShopperRequestSerializer

    def get_queryset(self):
        return ShopperRequest.objects.filter(
            customer=self.request.user
        ).prefetch_related('items', 'offers', 'offers__offer_items')

    def create(self, request, *args, **kwargs):
        serializer = CreateShopperRequestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            shopper_request = serializer.save()
            return Response({
                'message': 'Request sent to shopper pool!',
                'request': ShopperRequestSerializer(shopper_request).data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Accept or reject a shopper's offer."""
        shopper_request = self.get_object()
        action_type = request.data.get('action')  # 'accept' or 'reject'
        
        if shopper_request.status != 'offer_made':
            return Response(
                {'error': 'No active offer to respond to.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if action_type == 'accept':
            shopper_request.status = 'confirmed'
            shopper_request.save()
            return Response({'message': 'Offer accepted! Shopper will begin shopping.'})
        
        elif action_type == 'reject':
            comment = request.data.get('comment', '')
            # Deactivate current offer
            shopper_request.offers.filter(is_active=True).update(is_active=False)
            shopper_request.status = 'accepted'  # Back to accepted, shopper can make new offer
            shopper_request.save()
            return Response({'message': 'Offer rejected. Shopper can make a new offer.'})
        
        return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Rate the shopper after completion."""
        shopper_request = self.get_object()
        
        if shopper_request.status != 'completed':
            return Response(
                {'error': 'Can only rate completed requests.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if hasattr(shopper_request, 'rating'):
            return Response(
                {'error': 'You have already rated this request.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = RateShopperSerializer(data=request.data)
        if serializer.is_valid():
            ShopperRating.objects.create(
                request=shopper_request,
                shopper=shopper_request.shopper,
                customer=request.user,
                rating=serializer.validated_data['rating'],
                comment=serializer.validated_data.get('comment', ''),
            )
            return Response({'message': 'Thank you for your rating!'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a request (only if not yet in progress)."""
        shopper_request = self.get_object()
        
        if shopper_request.status in ['in_progress', 'completed']:
            return Response(
                {'error': 'Cannot cancel a request that is already in progress or completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        shopper_request.status = 'cancelled'
        shopper_request.save()
        return Response({'message': 'Request cancelled.'})


# --- Shopper Request Pool Views ---

class ShopperPoolViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Shopper views for the request pool.
    
    GET /api/shoppers/pool/               - List open requests
    GET /api/shoppers/pool/{id}/          - Request detail
    POST /api/shoppers/pool/{id}/accept/  - Accept a request
    """
    permission_classes = [IsApprovedShopper]
    serializer_class = ShopperRequestListSerializer

    def get_queryset(self):
        return ShopperRequest.objects.filter(
            status='open',
            expires_at__gt=timezone.now()
        ).prefetch_related('items').order_by('-created_at')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ShopperRequestSerializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a request from the pool."""
        shopper_request = self.get_object()
        
        if shopper_request.status != 'open':
            return Response(
                {'error': 'This request is no longer available.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if shopper is available
        profile = request.user.shopper_profile
        if not profile.is_available:
            return Response(
                {'error': 'You are currently marked as unavailable.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Assign to this shopper
        shopper_request.shopper = request.user
        shopper_request.status = 'accepted'
        shopper_request.accepted_at = timezone.now()
        shopper_request.save()
        
        serializer = ShopperRequestSerializer(shopper_request, context={'request': request})
        return Response({
            'message': 'Request accepted! You can now make an offer.',
            'request': serializer.data,
        })


# --- Shopper's Accepted Requests Views ---

class ShopperMyRequestsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Shopper's accepted requests.
    
    GET /api/shoppers/my-requests/             - List my accepted requests
    GET /api/shoppers/my-requests/{id}/        - Request detail
    POST /api/shoppers/my-requests/{id}/offer/ - Make an offer
    POST /api/shoppers/my-requests/{id}/update-status/ - Update status
    """
    permission_classes = [IsApprovedShopper]
    serializer_class = ShopperRequestSerializer

    def get_queryset(self):
        return ShopperRequest.objects.filter(
            shopper=self.request.user
        ).prefetch_related('items', 'offers', 'offers__offer_items').order_by('-accepted_at')

    @action(detail=True, methods=['post'])
    def offer(self, request, pk=None):
        """Make an offer to the customer."""
        shopper_request = self.get_object()
        
        if shopper_request.status not in ['accepted', 'offer_made']:
            return Response(
                {'error': 'Cannot make offer for this request.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = MakeShopperOfferSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        with transaction.atomic():
            # Deactivate previous offers
            shopper_request.offers.filter(is_active=True).update(is_active=False)
            
            # Calculate items total
            items_total = sum(
                item['offered_price'] * ShopperRequestItem.objects.get(id=item['request_item_id']).quantity
                for item in data['items']
            )
            
            # Create offer
            offer = ShopperOffer.objects.create(
                request=shopper_request,
                items_total=items_total,
                delivery_fee=data.get('delivery_fee', 0),
                # service_fee calculated automatically in save()
                estimated_delivery=data.get('estimated_delivery', ''),
                message=data.get('message', ''),
            )
            
            # Create offer items
            for item_data in data['items']:
                ShopperOfferItem.objects.create(
                    offer=offer,
                    request_item_id=item_data['request_item_id'],
                    offered_price=item_data['offered_price'],
                    notes=item_data.get('notes', ''),
                )
            
            shopper_request.status = 'offer_made'
            shopper_request.save()
        
        return Response({
            'message': 'Offer sent to customer!',
            'offer': ShopperOfferSerializer(offer).data,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update request status (in_progress, completed, cancelled)."""
        shopper_request = self.get_object()
        new_status = request.data.get('status')
        
        valid_transitions = {
            'accepted': ['in_progress', 'cancelled'],
            'offer_made': ['cancelled'],
            'confirmed': ['in_progress', 'cancelled'],
            'in_progress': ['completed'],
        }
        
        allowed = valid_transitions.get(shopper_request.status, [])
        if new_status not in allowed:
            return Response(
                {'error': f'Cannot transition from {shopper_request.status} to {new_status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        shopper_request.status = new_status
        
        if new_status == 'completed':
            shopper_request.completed_at = timezone.now()
            # Update shopper stats
            profile = request.user.shopper_profile
            profile.total_completed_orders += 1
            if shopper_request.offers.filter(is_active=True).exists():
                offer = shopper_request.offers.filter(is_active=True).first()
                profile.total_earnings += offer.service_fee
            profile.save()
        
        shopper_request.save()
        
        serializer = ShopperRequestSerializer(shopper_request, context={'request': request})
        return Response({
            'message': f'Status updated to {new_status}.',
            'request': serializer.data,
        })


# --- Admin Views ---

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff


class AdminShopperListView(APIView):
    """
    List all shopper applications for admin review.
    GET /api/admin/shoppers/
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = ShopperProfile.objects.select_related('user').order_by('-created_at')
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        profiles = []
        for profile in queryset:
            profiles.append({
                'id': profile.id,
                'user': profile.user.id,
                'user_email': profile.user.email,
                'user_name': profile.user.get_full_name() or profile.user.email.split('@')[0],
                'user_phone': profile.user.phone_number or '',
                'user_city': profile.user.city or '',
                'user_state': profile.user.state or '',
                'bio': profile.bio or '',
                'experience': profile.experience or '',
                'nin': profile.nin or '',
                'profile_photo_url': request.build_absolute_uri(profile.profile_photo.url) if profile.profile_photo else None,
                'service_radius_km': profile.service_radius_km,
                'status': profile.status,
                'total_completed_orders': profile.total_completed_orders,
                'average_rating': str(profile.average_rating),
                'total_ratings': profile.total_ratings,
                'total_earnings': str(profile.total_earnings),
                'is_available': profile.is_available,
                'created_at': profile.created_at.isoformat(),
                'verified_at': profile.verified_at.isoformat() if profile.verified_at else None,
            })
        
        return Response(profiles)


class AdminShopperApproveView(APIView):
    """
    Approve a shopper application.
    POST /api/admin/shoppers/{id}/approve/
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            profile = ShopperProfile.objects.get(pk=pk)
        except ShopperProfile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        profile.approve(request.user)
        return Response({'message': 'Shopper approved successfully.'})


class AdminShopperRejectView(APIView):
    """
    Reject a shopper application.
    POST /api/admin/shoppers/{id}/reject/
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            profile = ShopperProfile.objects.get(pk=pk)
        except ShopperProfile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        reason = request.data.get('reason', 'Application rejected by admin.')
        profile.reject(request.user, reason=reason)
        return Response({'message': 'Shopper rejected.'})


class AdminShopperSuspendView(APIView):
    """
    Suspend an approved shopper.
    POST /api/admin/shoppers/{id}/suspend/
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            profile = ShopperProfile.objects.get(pk=pk)
        except ShopperProfile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        profile.status = 'suspended'
        profile.save()
        return Response({'message': 'Shopper suspended.'})
