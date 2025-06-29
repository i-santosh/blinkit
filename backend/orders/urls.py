from django.urls import path, include
from orders import views

app_name = 'orders'

urlpatterns = [
    path('place/', views.OrderCreateAPIView.as_view(), name='create-order'),
    path('verify-payment/', views.VerifyPaymentView.as_view(), name='verify-payment'),
    path('', views.OrderListAPIView.as_view(), name='order-list'),
    path('my-orders/', views.MyOrdersListAPIView.as_view(), name='my-orders'),
    path('order/<int:order_id>/', views.OrderDetailAPIView.as_view(), name='order-detail'),
    path('order/<int:order_id>/cancel/', views.OrderDetailAPIView.as_view(), name='order-cancel'),
]