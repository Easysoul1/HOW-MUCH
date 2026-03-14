from django.urls import path
from . import views

app_name = 'integrations'

urlpatterns = [
    # Admin API key management
    path('keys/', views.ApiKeyListView.as_view(), name='key-list'),
    path('keys/create/', views.ApiKeyCreateView.as_view(), name='key-create'),
    path('keys/<int:key_id>/revoke/', views.revoke_api_key, name='key-revoke'),
    path('keys/<int:key_id>/usage/', views.api_key_usage, name='key-usage'),
    
    # Integrator self-service
    path('my-keys/', views.MyApiKeysView.as_view(), name='my-keys'),
    path('my-keys/create/', views.create_my_key, name='my-key-create'),
    path('my-usage/', views.my_usage_summary, name='my-usage'),
    path('preview-search/', views.preview_search, name='preview-search'),
]

# Public API v1 endpoints (separate namespace)
v1_urlpatterns = [
    path('products/', views.ProductListApiView.as_view(), name='v1-products'),
    path('products/<slug:slug>/', views.ProductDetailApiView.as_view(), name='v1-product-detail'),
    path('products/<slug:slug>/prices/', views.ProductPricesApiView.as_view(), name='v1-product-prices'),
    path('search/', views.SearchApiView.as_view(), name='v1-search'),
    path('prices/history/', views.PriceHistoryApiView.as_view(), name='v1-price-history'),
]
