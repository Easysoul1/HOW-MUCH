from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'products'

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('units', views.UnitOfMeasurementViewSet, basename='unit')
router.register('sizes', views.ProductSizeViewSet, basename='size')
router.register('size-requests', views.SizeRequestViewSet, basename='size-request')
router.register('images', views.ProductImageViewSet, basename='image')
router.register('', views.ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
