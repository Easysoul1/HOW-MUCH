from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import VendorVerification
from .serializers import (
    VendorVerificationSerializer,
    VendorVerificationSubmitSerializer,
    AdminVendorVerificationSerializer,
    VendorVerificationActionSerializer,
)


class IsVendor(permissions.BasePermission):
    """Only allow vendor users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'VENDOR'


class IsAdmin(permissions.BasePermission):
    """Only allow admin users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'ADMIN'


class VendorVerificationView(APIView):
    """
    Vendor's own verification status and submission.
    GET: Get current verification status
    POST: Submit new verification request
    PATCH: Update verification (if rejected)
    """
    permission_classes = [IsVendor]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get(self, request):
        try:
            verification = VendorVerification.objects.get(user=request.user)
            serializer = VendorVerificationSerializer(verification)
            return Response(serializer.data)
        except VendorVerification.DoesNotExist:
            return Response({
                'status': 'NOT_SUBMITTED',
                'message': 'Verification not yet submitted'
            })
    
    def post(self, request):
        # Check if already submitted
        if VendorVerification.objects.filter(user=request.user).exists():
            return Response(
                {'error': 'Verification already submitted. Use PATCH to update.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = VendorVerificationSubmitSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            verification = serializer.save()
            return Response(
                VendorVerificationSerializer(verification).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        try:
            verification = VendorVerification.objects.get(user=request.user)
        except VendorVerification.DoesNotExist:
            return Response(
                {'error': 'No verification found. Use POST to submit.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Only allow updates if rejected
        if verification.status == 'APPROVED':
            return Response(
                {'error': 'Verification already approved. Cannot modify.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = VendorVerificationSubmitSerializer(
            verification,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            verification = serializer.save()
            return Response(VendorVerificationSerializer(verification).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminVerificationListView(ListAPIView):
    """Admin: List all verification requests, optionally filtered by status."""
    permission_classes = [IsAdmin]
    serializer_class = AdminVendorVerificationSerializer
    
    def get_queryset(self):
        queryset = VendorVerification.objects.select_related('user', 'reviewed_by')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        return queryset


class AdminVerificationDetailView(RetrieveAPIView):
    """Admin: Get single verification detail."""
    permission_classes = [IsAdmin]
    serializer_class = AdminVendorVerificationSerializer
    queryset = VendorVerification.objects.select_related('user', 'reviewed_by')


class AdminVerificationApproveView(APIView):
    """Admin: Approve a verification request."""
    permission_classes = [IsAdmin]
    
    def post(self, request, pk):
        try:
            verification = VendorVerification.objects.get(pk=pk)
        except VendorVerification.DoesNotExist:
            return Response(
                {'error': 'Verification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if verification.status != 'PENDING':
            return Response(
                {'error': f'Cannot approve. Current status: {verification.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        verification.approve(request.user)
        return Response({
            'message': 'Verification approved successfully',
            'status': verification.status,
            'vendor_email': verification.user.email,
            'business_name': verification.business_name,
        })


class AdminVerificationRejectView(APIView):
    """Admin: Reject a verification request."""
    permission_classes = [IsAdmin]
    
    def post(self, request, pk):
        try:
            verification = VendorVerification.objects.get(pk=pk)
        except VendorVerification.DoesNotExist:
            return Response(
                {'error': 'Verification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if verification.status != 'PENDING':
            return Response(
                {'error': f'Cannot reject. Current status: {verification.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = VendorVerificationActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reason = serializer.validated_data.get('reason', '')
        if not reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        verification.reject(request.user, reason)
        return Response({
            'message': 'Verification rejected',
            'status': verification.status,
            'rejection_reason': reason,
        })
