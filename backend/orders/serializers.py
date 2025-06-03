from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    orderItem = OrderItemCreateSerializer(many=True)

    def create(self, validated_data):
        user = self.context['request'].user
        order_items_data = validated_data.pop('orderItem')

        # Create order with zero total initially
        order = Order.objects.create(
            user=user,
            total_price=0,
            status='PENDING'
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
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_price', 'created_at', 
            'updated_at', 'status', 'items', 'get_items_count',
            'shipping_address', 'payment_id', 'razorpay_order_id'
        ]
        read_only_fields = ['total_price', 'created_at', 'updated_at', 'razorpay_order_id']

