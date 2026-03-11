from rest_framework import generics, permissions, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import MarketPrice
from .serializers import MarketPriceSerializer
from django.utils import timezone


class IsCrowdsourcerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow crowdsourcers to upload, or admins to view/manage.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            (request.user.user_type == 'CROWDSOURCER' or request.user.is_staff)
        )


class MarketPriceListCreateView(generics.ListCreateAPIView):
    """
    GET: List all market prices submitted by the authenticated crowdsourcer.
    POST: Submit a new market price (defaults to PENDING status).
    """
    serializer_class = MarketPriceSerializer
    permission_classes = [IsCrowdsourcerOrAdmin]

    def get_queryset(self):
        # Admins can see all, crowdsourcers only see their own
        if self.request.user.is_staff:
            return MarketPrice.objects.all()
        return MarketPrice.objects.filter(crowdsourcer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(crowdsourcer=self.request.user, status='PENDING')


class MarketPriceDetailView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve a specific market price.
    PUT/PATCH: Update a market price (only if it's PENDING and belongs to the user, or if admin).
    """
    serializer_class = MarketPriceSerializer
    permission_classes = [IsCrowdsourcerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_staff:
            return MarketPrice.objects.all()
        return MarketPrice.objects.filter(crowdsourcer=self.request.user)

    def perform_update(self, serializer):
        obj = self.get_object()
        # Non-admins cannot edit approved/rejected prices
        if not self.request.user.is_staff and obj.status != 'PENDING':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Cannot edit a price after it has been reviewed.")
        
        # If an admin is editing status to APPROVED/REJECTED, track the review
        if self.request.user.is_staff and 'status' in serializer.validated_data:
            new_status = serializer.validated_data.get('status')
            if new_status in ['APPROVED', 'REJECTED'] and obj.status != new_status:
                serializer.save(
                    reviewed_by=self.request.user, 
                    reviewed_at=timezone.now()
                )
                return
                
        serializer.save()


class AdminMarketPriceReviewView(generics.UpdateAPIView):
    """
    Dedicated endpoint for admins to approve/reject market prices.
    """
    queryset = MarketPrice.objects.all()
    serializer_class = MarketPriceSerializer
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(summary="Admin: Approve or Reject a Market Price")
    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        new_status = request.data.get('status')
        rejection_reason = request.data.get('rejection_reason', '')

        if new_status not in ['APPROVED', 'REJECTED']:
            return Response(
                {"detail": "Status must be APPROVED or REJECTED."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        obj.status = new_status
        obj.reviewed_by = request.user
        obj.reviewed_at = timezone.now()
        obj.rejection_reason = rejection_reason
        obj.save()

        return Response(MarketPriceSerializer(obj).data)
