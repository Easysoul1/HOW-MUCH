from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.utils import timezone
from .models import CrowdsourcedSubmission, CrowdsourcedItem
from .serializers import (
    CrowdsourcedSubmissionCreateSerializer,
    CrowdsourcedSubmissionListSerializer,
    CrowdsourcedSubmissionDetailSerializer,
    CrowdsourcedItemSerializer
)


class IsCrowdsourcerOrAdmin(permissions.BasePermission):
    """Allow crowdsourcers to submit, admins to review"""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            (request.user.user_type == 'CROWDSOURCER' or request.user.is_staff)
        )


class SubmissionListCreateView(generics.ListCreateAPIView):
    """
    GET: List submissions (crowdsourcers see own, admins see all)
    POST: Create new submission with multiple items
    """
    permission_classes = [IsCrowdsourcerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_staff:
            return CrowdsourcedSubmission.objects.prefetch_related('items').all()
        return CrowdsourcedSubmission.objects.filter(crowdsourcer=self.request.user).prefetch_related('items')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CrowdsourcedSubmissionCreateSerializer
        return CrowdsourcedSubmissionListSerializer

    def perform_create(self, serializer):
        serializer.save(crowdsourcer=self.request.user)


class SubmissionDetailView(generics.RetrieveAPIView):
    """GET: Retrieve submission with all items and photos"""
    serializer_class = CrowdsourcedSubmissionDetailSerializer
    permission_classes = [IsCrowdsourcerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_staff:
            return CrowdsourcedSubmission.objects.prefetch_related('items').all()
        return CrowdsourcedSubmission.objects.filter(crowdsourcer=self.request.user).prefetch_related('items')


class ItemApproveView(generics.GenericAPIView):
    """POST: Approve individual item within a submission"""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = CrowdsourcedItemSerializer

    @extend_schema(summary="Admin: Approve a crowdsourced item")
    def post(self, request, pk):
        try:
            item = CrowdsourcedItem.objects.get(pk=pk)
        except CrowdsourcedItem.DoesNotExist:
            return Response(
                {"detail": "Item not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if item.status == 'APPROVED':
            return Response(
                {"detail": "Item is already approved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        item.status = 'APPROVED'
        item.approved_by = request.user
        item.approved_at = timezone.now()
        item.save()

        return Response(CrowdsourcedItemSerializer(item).data)


class ItemRejectView(generics.GenericAPIView):
    """POST: Reject individual item within a submission"""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = CrowdsourcedItemSerializer

    @extend_schema(summary="Admin: Reject a crowdsourced item")
    def post(self, request, pk):
        try:
            item = CrowdsourcedItem.objects.get(pk=pk)
        except CrowdsourcedItem.DoesNotExist:
            return Response(
                {"detail": "Item not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if item.status == 'REJECTED':
            return Response(
                {"detail": "Item is already rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        rejection_reason = request.data.get('reason', '')
        item.status = 'REJECTED'
        item.rejection_reason = rejection_reason
        item.save()

        return Response(CrowdsourcedItemSerializer(item).data)
