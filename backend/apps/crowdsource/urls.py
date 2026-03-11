from django.urls import path
from . import views

app_name = 'crowdsource'

urlpatterns = [
    path('prices/', views.MarketPriceListCreateView.as_view(), name='price-list-create'),
    path('prices/<int:pk>/', views.MarketPriceDetailView.as_view(), name='price-detail'),
    path('prices/<int:pk>/review/', views.AdminMarketPriceReviewView.as_view(), name='price-review'),
]
