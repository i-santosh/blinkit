import { Form, Link, useNavigate } from "@remix-run/react";
import { Layout } from "~/components/layout";
import { useCartStore } from "~/store/cart";
import { useState, useEffect, useRef } from "react";
import { ordersAPI } from "~/lib/api";
import { 
  CheckCircle, 
  CreditCard, 
  MapPin, 
  Truck, 
  ShoppingBag, 
  ArrowLeft,
  DollarSign,
  Clock,
  Home,
  Receipt,
  AlertCircle,
  Loader2,
  Shield
} from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [addressFormValid, setAddressFormValid] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Check if cart is empty and redirect if it is
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      navigate('/');
    }
  }, [items, navigate, orderPlaced]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const delivery = 40; // Fixed delivery fee
  const total = subtotal + delivery;
  
  // Validate address form
  const validateAddressForm = () => {
    if (formRef.current) {
      setAddressFormValid(formRef.current.checkValidity());
      return formRef.current.checkValidity();
    }
    return false;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    
    // Validate form
    if (!validateAddressForm()) {
      setPaymentError("Please fill in all required address fields");
      return;
    }
    
    setIsProcessing(true);

    try {
      // Get form data for shipping address
      const formData = new FormData(formRef.current!);
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const address = formData.get('address') as string;
      const phone = formData.get('phone') as string;
      
      const shippingAddress = `${firstName} ${lastName}, ${address}, Phone: ${phone}`;

      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const orderData = {
        orderItem: orderItems,
        payment_method: paymentMethod,
        shipping_address: shippingAddress
      };

      const response = await ordersAPI.createOrder(orderData);

      if (response.success) {
        // Generate a random order number and store it
        const generatedOrderNumber = `BK${Math.floor(Math.random() * 10000000)}`;
        setOrderNumber(generatedOrderNumber);
        
        if (paymentMethod === 'ONLINE') {
          const { data } = response;
          const options = {
            key: data.razorpay_key,
            amount: data.razorpay_amount,
            currency: data.currency,
            name: "Blinkit",
            description: "Order Payment",
            order_id: data.razorpay_order_id,
            handler: async function (paymentResponse: any) {
              try {
                const verificationData = {
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                };
                const verifyResponse = await ordersAPI.verifyPayment(verificationData);
                if (verifyResponse.success) {
                  setOrderPlaced(true);
                  clearCart();
                } else {
                  setPaymentError("Payment verification failed. Please try again or contact support.");
                }
              } catch (error) {
                setPaymentError("An error occurred during payment verification. Please contact support.");
              } finally {
                setIsProcessing(false);
              }
            },
            prefill: {
              name: `${firstName} ${lastName}`,
              contact: phone,
            },
            notes: {
              address: address,
            },
            theme: {
              color: "#4CAF50",
            },
            modal: {
              ondismiss: function() {
                setIsProcessing(false);
              }
            }
          };
          
          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (response: any) {
            setPaymentError(`Payment failed: ${response.error.description}`);
            setIsProcessing(false);
          });
          rzp.open();
        } else {
          // For COD orders
          setOrderPlaced(true);
          clearCart();
          setIsProcessing(false);
        }
      } else {
        setPaymentError(`Order creation failed: ${response.message}`);
        setIsProcessing(false);
      }
    } catch (error) {
      setPaymentError("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };
  
  if (orderPlaced) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h1>
              <p className="text-gray-700 mt-2">Your order has been confirmed and will be delivered soon.</p>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-700 mb-4 flex items-center font-medium">
                <ShoppingBag size={16} className="mr-2 text-primary" />
                Order #{orderNumber}
              </p>
              <p className="text-gray-700 flex items-center font-medium">
                <Clock size={16} className="mr-2 text-primary" />
                Expected delivery: <span className="font-semibold ml-1">Today, within 10 minutes</span>
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800 flex items-center">
                <Shield size={16} className="mr-2 text-blue-600" />
                {paymentMethod === 'ONLINE' ? 
                  "Your payment has been processed successfully." : 
                  "Please keep cash ready for delivery."}
              </p>
            </div>
            
            <div className="mt-8 text-center space-y-4">
              <Link to="/orders" className="inline-block bg-white border border-primary text-primary hover:bg-gray-50 font-medium py-2 px-6 rounded-md transition-colors mr-4">
                View My Orders
              </Link>
              <Link to="/" className="inline-block bg-primary hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-md transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/" className="text-primary hover:underline flex items-center font-medium">
            <ArrowLeft size={16} className="mr-1" /> Back to Home
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-black mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delivery and Payment Form */}
          <div>
            {paymentError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center text-red-700">
                  <AlertCircle size={18} className="mr-2" />
                  <p>{paymentError}</p>
                </div>
              </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
              <h2 className="text-lg font-bold mb-4 text-black flex items-center">
                <MapPin size={18} className="mr-2 text-primary" /> Delivery Address
              </h2>
              <Form ref={formRef} className="space-y-4" onChange={validateAddressForm}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-800 mb-1">First Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-800 mb-1">Last Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-800 mb-1">Address <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-800 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 10-digit number without spaces or dashes</p>
                </div>
              </Form>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-lg font-bold mb-4 text-black flex items-center">
                <CreditCard size={18} className="mr-2 text-primary" /> Payment Method
              </h2>
              <div className="space-y-3">
                <div className="flex items-center border border-gray-300 rounded-md p-3 bg-gray-50">
                  <input type="radio" id="cod" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-primary" />
                  <label htmlFor="cod" className="ml-2 text-sm font-medium text-gray-800 flex items-center">
                    <DollarSign size={16} className="mr-2 text-primary" /> Cash on Delivery
                  </label>
                </div>
                
                <div className="flex items-center border border-gray-300 rounded-md p-3">
                  <input type="radio" id="online" name="payment" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 text-primary" />
                  <label htmlFor="online" className="ml-2 text-sm font-medium text-gray-800 flex items-center">
                    <CreditCard size={16} className="mr-2 text-primary" /> Online Payment
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-5 text-black flex items-center">
              <Receipt size={18} className="mr-2 text-primary" /> Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex items-center py-4 border-b border-gray-200">
                  <div className="text-3xl mr-4">{item.image}</div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-black">{item.name}</h3>
                    <p className="text-sm text-gray-700">{item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-black">₹{item.price} × {item.quantity}</p>
                    <p className="text-base font-bold text-black">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mb-5 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex justify-between text-base">
                <span className="text-gray-800 font-medium">Subtotal</span>
                <span className="font-medium text-black">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-800 font-medium flex items-center">
                  <Truck size={15} className="mr-2 text-primary" /> Delivery Fee
                </span>
                <span className="font-medium text-black">₹{delivery}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg text-black">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleSubmitOrder}
              disabled={isProcessing || items.length === 0}
              className={`w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center text-base ${isProcessing || items.length === 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <ShoppingBag size={18} className="mr-2" /> Place Order
                </>
              )}
            </button>
            
            <div className="mt-4 px-4 py-3 bg-gray-50 rounded-md border border-gray-200 text-center">
              <p className="text-sm text-gray-800 font-medium">
                By placing your order, you agree to our <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}