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


class PublicVendorListView(ListAPIView):
    """
    Public API: List all vendors with distance filtering.
    For authenticated buyers to browse nearby vendors.
    Supports filters: verified, city, state, radius (km from lat/lng).
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = 'VendorPublicSerializer'  # Will create this
    
    def get_queryset(self):
        from apps.users.models import User
        import math
        
        # Only vendors who have submitted verification
        queryset = User.objects.filter(
            user_type='VENDOR',
        ).select_related('vendorverification').order_by('-created_at')
        
        # Filter by verified status
        verified = self.request.query_params.get('verified')
        if verified is not None:
            is_verified = verified.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_verified=is_verified)
        
        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filter by state
        state = self.request.query_params.get('state')
        if state:
            queryset = queryset.filter(state__icontains=state)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        import math
        
        queryset = self.get_queryset()
        
        # Get buyer location
        buyer_lat = request.query_params.get('lat')
        buyer_lng = request.query_params.get('lng')
        radius = request.query_params.get('radius')  # in km
        
        results = []
        for vendor in queryset:
            # Serialize vendor
            from .serializers import VendorPublicSerializer
            data = VendorPublicSerializer(vendor).data
            
            # Calculate distance if buyer location provided
            if buyer_lat and buyer_lng and vendor.latitude and vendor.longitude:
                try:
                    lat1, lng1 = float(buyer_lat), float(buyer_lng)
                    lat2, lng2 = float(vendor.latitude), float(vendor.longitude)
                    
                    # Haversine formula
                    R = 6371.0  # Earth radius in km
                    dlat = math.radians(lat2 - lat1)
                    dlng = math.radians(lng2 - lng1)
                    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
                    dist = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                    data['distance_km'] = round(dist, 1)
                    
                    # Apply radius filter
                    if radius:
                        try:
                            if dist > float(radius):
                                continue
                        except ValueError:
                            pass
                except (ValueError, TypeError):
                    data['distance_km'] = None
            else:
                data['distance_km'] = None
            
            results.append(data)
        
        # Sort by distance if available
        if buyer_lat and buyer_lng:
            results.sort(key=lambda x: x['distance_km'] if x['distance_km'] is not None else float('inf'))
        
        # Pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 20
        page = paginator.paginate_queryset(results, request)
        
        if page is not None:
            return paginator.get_paginated_response(page)
        
        return Response(results)


class PublicVendorDetailView(RetrieveAPIView):
    """
    Public API: Get vendor details + their listings.
    For authenticated buyers to view vendor profile and inventory.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        from apps.users.models import User
        from apps.pricing.models import VendorListing
        from .serializers import VendorPublicSerializer
        from apps.pricing.serializers import PublicListingSerializer
        import math
        
        try:
            vendor = User.objects.select_related('vendorverification').get(
                pk=pk,
                user_type='VENDOR'
            )
        except User.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Serialize vendor
        vendor_data = VendorPublicSerializer(vendor).data
        
        # Calculate distance
        buyer_lat = request.query_params.get('lat')
        buyer_lng = request.query_params.get('lng')
        if buyer_lat and buyer_lng and vendor.latitude and vendor.longitude:
            try:
                lat1, lng1 = float(buyer_lat), float(buyer_lng)
                lat2, lng2 = float(vendor.latitude), float(vendor.longitude)
                
                R = 6371.0
                dlat = math.radians(lat2 - lat1)
                dlng = math.radians(lng2 - lng1)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
                dist = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                vendor_data['distance_km'] = round(dist, 1)
            except (ValueError, TypeError):
                vendor_data['distance_km'] = None
        else:
            vendor_data['distance_km'] = None
        
        # Get vendor's listings
        listings = VendorListing.objects.filter(
            vendor=vendor,
            product__status='APPROVED'
        ).select_related('product', 'size', 'vendor').order_by('-updated_at', 'product__name')
        
        vendor_data['listings'] = PublicListingSerializer(listings, many=True, context={'request': request}).data
        vendor_data['listings_count'] = listings.count()
        
        return Response(vendor_data)
