from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'orders'

# Customer routes - will be at /api/orders/requests/
customer_router = DefaultRouter()
customer_router.register(r'requests', views.CustomerRequestViewSet, basename='customer-requests')

# Vendor routes - will be at /api/orders/vendor-requests/
vendor_router = DefaultRouter()
vendor_router.register(r'vendor-requests', views.VendorRequestViewSet, basename='vendor-requests')
vendor_router.register(r'vendor-orders', views.VendorOrderViewSet, basename='vendor-orders')

urlpatterns = [
    path('', include(customer_router.urls)),
    path('', include(vendor_router.urls)),
    
    # Admin endpoint for expiring stale requests
    path('admin/expire-requests/', views.ExpireRequestsView.as_view(), name='expire-requests'),
]

