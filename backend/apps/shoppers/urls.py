from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'shoppers'

# Customer routes for shopper requests
customer_router = DefaultRouter()
customer_router.register(r'requests', views.CustomerShopperRequestViewSet, basename='customer-requests')

# Shopper routes
shopper_router = DefaultRouter()
shopper_router.register(r'pool', views.ShopperPoolViewSet, basename='pool')
shopper_router.register(r'my-requests', views.ShopperMyRequestsViewSet, basename='my-requests')

urlpatterns = [
    # Shopper profile & application
    path('apply/', views.ShopperApplicationView.as_view(), name='apply'),
    path('profile/', views.ShopperProfileView.as_view(), name='profile'),
    path('dashboard/', views.ShopperDashboardView.as_view(), name='dashboard'),
    
    # Customer routes (create/manage shopper requests)
    path('', include(customer_router.urls)),
    
    # Shopper routes (pool, my requests)
    path('', include(shopper_router.urls)),
]

