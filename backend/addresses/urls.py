from django.urls import path
from .views import PincodeListView, PincodeCheckView

urlpatterns = [
    # URL for listing all serviceable pincodes
    path('pincodes/', PincodeListView.as_view(), name='pincode-list'),
    
    # URL for checking pincode serviceability
    path('check-pincode/', PincodeCheckView.as_view(), name='check-pincode'),
]
