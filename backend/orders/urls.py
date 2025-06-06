from django.urls import path, include
from orders import views

app_name = 'orders'

urlpatterns = [
    path('place/', views.OrderCreateAPIView.as_view(), name='create-order'),
    path('verify-payment/', views.VerifyPaymentView.as_view(), name='verify-payment'),
    path('', views.OrderListAPIView.as_view(), name='order-list'),
    path('<int:order_id>/', views.OrderDetailAPIView.as_view(), name='order-detail'),
]