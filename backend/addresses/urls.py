from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryAreaViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'delivery-areas', DeliveryAreaViewSet, basename='delivery-area')

urlpatterns = [
    path('', include(router.urls)),
] 