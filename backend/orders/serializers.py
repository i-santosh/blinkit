from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    orderItem = OrderItemCreateSerializer(many=True)
    payment_method = serializers.CharField(required=True)
    shipping_address = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        user = self.context['request'].user
        order_items_data = validated_data.pop('orderItem')
        shipping_address = validated_data.pop('shipping_address', None)
        payment_method = validated_data.pop('payment_method', 'COD')

        # Create order with zero total initially
        order = Order.objects.create(
            user=user,
            total_price=0,
            status='PENDING',
            shipping_address=shipping_address
        )

        total_price = 0

        # Process each order item
        for item_data in order_items_data:
            product_id = item_data['product_id']
            quantity = item_data['quantity']

            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with ID {product_id} does not exist")
            
            # Get the current price from database for security
            price = product.price
            item_total = price * quantity
            total_price += item_total
            
            # Create the order item
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price
            )

        # Update the order with the calculated total
        order.total_price = total_price
        order.save()
        
        return order


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'get_cost']
        read_only_fields = ['price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(source='orderitem_set', many=True, read_only=True)
    
    # Add more descriptive fields
    payment_method = serializers.SerializerMethodField()
    formatted_status = serializers.SerializerMethodField()
    refund_details = serializers.SerializerMethodField()
    
    def get_payment_method(self, obj):
        # Determine payment method based on available information
        if obj.payment_id:
            return 'Online Payment'
        return 'Cash on Delivery (COD)'
    
    def get_formatted_status(self, obj):
        # Capitalize and format the status
        return obj.status.capitalize()
    
    def get_refund_details(self, obj):
        # Only include refund details if the order is cancelled
        if obj.status == 'CANCELLED' and obj.payment_id:
            # This is a placeholder. In a real-world scenario, 
            # you might want to fetch actual refund details from Razorpay
            return {
                'refund_id': obj.payment_id,  # Temporary placeholder
                'status': 'processed'  # Temporary placeholder
            }
        return None
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_price', 'created_at', 
            'updated_at', 'status', 'formatted_status', 'items', 
            'get_items_count', 'shipping_address', 
            'payment_id', 'payment_method', 
            'razorpay_order_id', 'refund_details'
        ]
        read_only_fields = ['total_price', 'created_at', 'updated_at', 'razorpay_order_id']

