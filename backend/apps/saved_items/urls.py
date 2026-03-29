from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SavedItemViewSet

router = DefaultRouter()
router.register('', SavedItemViewSet, basename='saved-item')

urlpatterns = [
    path('', include(router.urls)),
]
