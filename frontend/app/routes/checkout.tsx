import { Form, Link } from "@remix-run/react";
import { Layout } from "~/components/layout";
import { useCartStore } from "~/store/cart";
import { useState } from "react";
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
  Receipt
} from "lucide-react";

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Calculate subtotal
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const delivery = 40; // Fixed delivery fee
  const total = subtotal + delivery;
  
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send order to backend
    setOrderPlaced(true);
    clearCart();
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
                Order #BK{Math.floor(Math.random() * 10000000)}
              </p>
              <p className="text-gray-700 flex items-center font-medium">
                <Clock size={16} className="mr-2 text-primary" />
                Expected delivery: <span className="font-semibold ml-1">Today, within 10 minutes</span>
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <a href="/" className="inline-block bg-primary hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-md transition-colors">
                Continue Shopping
              </a>
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
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
              <h2 className="text-lg font-bold mb-4 text-black flex items-center">
                <MapPin size={18} className="mr-2 text-primary" /> Delivery Address
              </h2>
              <Form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-800 mb-1">First Name</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-800 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-800 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-800 mb-1">Address</label>
                  <textarea 
                    id="address" 
                    rows={3} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                    required 
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-800 mb-1">City</label>
                    <input 
                      type="text" 
                      id="city" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      defaultValue="Mumbai"
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="zipcode" className="block text-sm font-medium text-gray-800 mb-1">PIN Code</label>
                    <input 
                      type="text" 
                      id="zipcode" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      required 
                    />
                  </div>
                </div>
              </Form>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-lg font-bold mb-4 text-black flex items-center">
                <CreditCard size={18} className="mr-2 text-primary" /> Payment Method
              </h2>
              <div className="space-y-4">
                <div className="flex items-center border border-gray-300 rounded-md p-3 bg-gray-50">
                  <input type="radio" id="cod" name="payment" value="cod" defaultChecked className="h-4 w-4 text-primary" />
                  <label htmlFor="cod" className="ml-2 text-sm font-medium text-gray-800 flex items-center">
                    <DollarSign size={16} className="mr-2 text-primary" /> Cash on Delivery
                  </label>
                </div>
                
                <div className="flex items-center border border-gray-300 rounded-md p-3">
                  <input type="radio" id="online" name="payment" value="online" className="h-4 w-4 text-primary" />
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
              className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center text-base"
            >
              <ShoppingBag size={18} className="mr-2" /> Place Order
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