from django.urls import path
from . import views

app_name = 'vendors'

urlpatterns = [
    # Vendor endpoints
    path('verification/', views.VendorVerificationView.as_view(), name='verification'),
    
    # Admin endpoints
    path('admin/verifications/', views.AdminVerificationListView.as_view(), name='admin-verification-list'),
    path('admin/verifications/<int:pk>/', views.AdminVerificationDetailView.as_view(), name='admin-verification-detail'),
    path('admin/verifications/<int:pk>/approve/', views.AdminVerificationApproveView.as_view(), name='admin-verification-approve'),
    path('admin/verifications/<int:pk>/reject/', views.AdminVerificationRejectView.as_view(), name='admin-verification-reject'),
    
    # Public endpoints (for authenticated buyers)
    path('', views.PublicVendorListView.as_view(), name='vendor-list'),
    path('<int:pk>/', views.PublicVendorDetailView.as_view(), name='vendor-detail'),
]
