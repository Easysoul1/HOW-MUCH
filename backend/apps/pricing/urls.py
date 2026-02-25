from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorListingViewSet, PublicListingViewSet

app_name = 'pricing'

router = DefaultRouter()
router.register('listings', VendorListingViewSet, basename='listing')
router.register('public', PublicListingViewSet, basename='public-listing')

urlpatterns = [
    path('', include(router.urls)),
]
