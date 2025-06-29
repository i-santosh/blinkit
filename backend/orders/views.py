import razorpay
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.conf import settings
from rest_framework.generics import ListAPIView, RetrieveAPIView
from django.db.models import Q
from rest_framework import filters

from constants import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from .models import Order, OrderItem
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
                    # Get payment method from request data
                    payment_method = request.data.get('payment_method', 'COD')
                    
                    # Create order in database but within a transaction
                    order = serializer.save()
                    
                    if payment_method == 'ONLINE':
                        # Calculate amount for Razorpay (in paise)
                        amount = int(order.total_price * 100)
                        
                        # Initialize Razorpay client
                        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
                        
                        # Create Razorpay order
                        razorpay_order = client.order.create({
                            'amount': amount,
                            'currency': 'INR',
                            'receipt': f'order_{order.id}',
                            'payment_capture': 1  # Auto-capture payment
                        })
                        
                        # Update order with Razorpay order ID
                        order.razorpay_order_id = razorpay_order['id']
                        order.save()
                        
                        # Return order details with Razorpay info
                        response_serializer = OrderSerializer(order)
                        return generate_api_response(
                            success=True,
                            message="Order created successfully. Please complete payment.",
                            code=SC.CRE_RESOURCE_CREATED.value,
                            data={
                                'order': response_serializer.data,
                                'razorpay_order_id': razorpay_order['id'],
                                'razorpay_amount': amount,
                                'razorpay_key': RAZORPAY_KEY_ID,
                                'currency': 'INR'
                            },
                            status_code=status.HTTP_201_CREATED
                        )
                    else:
                        # For COD orders
                        order.status = 'PENDING'
                        order.save()
                        
                        response_serializer = OrderSerializer(order)
                        return generate_api_response(
                            success=True,
                            message="Order placed successfully!",
                            code=SC.CRE_RESOURCE_CREATED.value,
                            data=response_serializer.data,
                            status_code=status.HTTP_201_CREATED
                        )
                        
            except Exception as e:
                # If any error occurs, the transaction will be rolled back
                return generate_api_response(
                    success=False,
                    message=f"Failed to create order: {str(e)}",
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

class VerifyPaymentView(CoreAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Get payment details from request
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_signature = request.data.get('razorpay_signature')
            
            # Initialize Razorpay client
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            
            # Verify signature
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            try:
                client.utility.verify_payment_signature(params_dict)
            except Exception:
                return generate_api_response(
                    success=False,
                    message="Invalid payment signature",
                    code=EC.AUTH_INVALID_CREDENTIALS.value,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Update order status
            try:
                order = Order.objects.get(razorpay_order_id=razorpay_order_id)
                order.payment_id = razorpay_payment_id
                order.status = 'PROCESSING'
                order.save()
                
                return generate_api_response(
                    success=True,
                    message="Payment verified successfully",
                    code=SC.PRO_OPERATION_COMPLETE.value,
                    data=OrderSerializer(order).data,
                    status_code=status.HTTP_200_OK
                )
            except Order.DoesNotExist:
                return generate_api_response(
                    success=False,
                    message="Order not found",
                    code=EC.RES_NOT_FOUND.value,
                    status_code=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            return generate_api_response(
                success=False,
                message="Payment verification failed",
                code=EC.SYS_INTERNAL_ERROR.value,
                errors=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OrderListAPIView(CoreAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all orders (this might need to be restricted based on user role)
        orders = Order.objects.all().order_by('-created_at')
        
        # Serialize the orders
        serializer = OrderSerializer(orders, many=True)
        
        # Use generate_api_response for consistent API response
        return generate_api_response(
            success=True,
            message="Orders retrieved successfully",
            code=SC.REQ_DATA_RETRIEVED.value,
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

class OrderDetailAPIView(CoreAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            # Get the specific order
            order = Order.objects.get(id=order_id)
            
            # Serialize the order
            serializer = OrderSerializer(order)
            
            # Use generate_api_response for consistent API response
            return generate_api_response(
                success=True,
                message="Order details retrieved successfully",
                code=SC.REQ_DATA_RETRIEVED.value,
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        except Order.DoesNotExist:
            # Use generate_api_response for not found scenario
            return generate_api_response(
                success=False,
                message="Order not found",
                code=EC.RES_NOT_FOUND.value,
                status_code=status.HTTP_404_NOT_FOUND
            )

    def post(self, request, order_id):
        try:
            # Get the specific order
            order = Order.objects.get(id=order_id, user=request.user)
            
            # Check if order can be cancelled
            if order.status not in ['PENDING', 'PROCESSING']:
                return generate_api_response(
                    success=False,
                    message="Order cannot be cancelled at this stage.",
                    code=EC.RES_CONFLICT.value,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Initialize refund variables
            refund_response = None
            
            # Check if the order was paid online and has a payment ID
            if order.payment_id and order.razorpay_order_id:
                try:
                    # Initialize Razorpay client
                    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
                    
                    # Prepare refund data
                    refund_data = {
                        "payment_id": order.payment_id,
                        "amount": int(order.total_price * 100),  # Convert to paise
                        "speed": "normal"
                    }
                    
                    # Process refund
                    refund_response = client.payment.refund(order.payment_id, refund_data)
                    
                    # Log refund details
                    print(f"Razorpay Refund Response: {refund_response}")
                except Exception as refund_error:
                    # Log the refund error but continue with order cancellation
                    print(f"Refund Error: {refund_error}")
            
            # Update order status to CANCELLED
            order.status = 'CANCELLED'
            order.save()
            
            # Serialize the updated order
            serializer = OrderSerializer(order)
            
            # Prepare response data
            response_data = serializer.data
            
            # Explicitly add refund details if available
            if refund_response:
                response_data['refund_details'] = {
                    'refund_id': refund_response.get('id', order.payment_id),
                    'status': refund_response.get('status', 'processed')
                }
            
            # Use generate_api_response for consistent API response
            return generate_api_response(
                success=True,
                message="Order cancelled successfully",
                code=SC.UPD_RESOURCE_MODIFIED.value,
                data=response_data,
                status_code=status.HTTP_200_OK
            )
        except Order.DoesNotExist:
            # Use generate_api_response for not found scenario
            return generate_api_response(
                success=False,
                message="Order not found",
                code=EC.RES_NOT_FOUND.value,
                status_code=status.HTTP_404_NOT_FOUND
            )

class MyOrdersListAPIView(CoreAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get orders for the current authenticated user, ordered by most recent first
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        
        # Serialize the orders
        serializer = OrderSerializer(orders, many=True)
        
        # Use generate_api_response for consistent API response
        return generate_api_response(
            success=True,
            message="User orders retrieved successfully",
            code=SC.REQ_DATA_RETRIEVED.value,
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )