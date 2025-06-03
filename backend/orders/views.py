import razorpay
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from constants import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer
from core.views import CoreAPIView
from utils.response import generate_api_response
from core.success_codes import SuccessCodes as SC
from core.error_codes import ErrorCodes as EC

class OrderCreateAPIView(CoreAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, format=None):
        serializer = OrderCreateSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                # Use transaction to ensure atomicity
                with transaction.atomic():
                    # Create order in database but within a transaction
                    # If anything fails, the transaction will be rolled back
                    order = serializer.save()
                    
                    # Calculate amount for Razorpay
                    amount = int(order.total_price * 100)  # Convert to paise/cents

                    print(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
                    
                    # Initialize Razorpay client
                    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
                    
                    # Create Razorpay order
                    razorpay_order = client.order.create({
                        'amount': amount,
                        'currency': 'INR',  # Change as per your currency
                        'receipt': f'order_{order.id}',
                        'payment_capture': 1  # Auto-capture payment
                    })

                    print(razorpay_order)
                    
                    # Update our order with Razorpay order ID
                    order.razorpay_order_id = razorpay_order['id']
                    order.save()
                    
                    # Return the created order details with Razorpay order ID
                    response_serializer = OrderSerializer(order)
                    return generate_api_response(
                        success=True,
                        message="Your order has been placed successfully. Make payment to confirm the order.",
                        code=SC.CRE_RESOURCE_CREATED.value,
                        data={
                            'order': response_serializer.data,
                            'razorpay_order_id': razorpay_order['id'],
                            'razorpay_amount': amount,
                            'currency': 'INR'
                        },
                        status_code=status.HTTP_201_CREATED
                    )
            except Exception as e:
                # If any error occurs, the transaction will be rolled back
                # No need to manually delete the order
                return generate_api_response(
                    success=False,
                    message=f"Failed to create payment order: {str(e)}",
                    code=EC.SYS_INTERNAL_ERROR.value,
                    errors=str(e),
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                    
        return generate_api_response(
            success=False,
            message="Failed to place order. Please try again.",
            code=EC.SYS_INTERNAL_ERROR.value,
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class OrderListAPIView(CoreAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class OrderDetailAPIView(CoreAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id, format=None):
        try:
            order = Order.objects.get(id=order_id)
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

