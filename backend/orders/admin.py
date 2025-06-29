from django.contrib import admin
from .models import Order, OrderItem

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'total_price', 'status', 
        'created_at', 'payment_id', 'razorpay_order_id'
    )
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'user__username', 'payment_id', 'razorpay_order_id')
    readonly_fields = ('created_at', 'updated_at', 'total_price')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price', 'get_cost')
    list_filter = ('order__status', 'product')
    search_fields = ('order__id', 'product__name')
    readonly_fields = ('get_cost',)

