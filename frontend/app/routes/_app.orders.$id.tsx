import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "@remix-run/react";
import { ordersAPI } from "~/lib/api";
import { toast } from "react-fox-toast";
import { Layout } from "~/components/layout";
import type { Order } from "~/lib/api";

export default function OrderDetail() {
  const params = useParams();
  const orderId = params.id ? parseInt(params.id) : null;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) {
        setError("Invalid order ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await ordersAPI.getOrder(orderId);
        
        if (response.success) {
          setOrder(response.data);
        } else {
          setError("Failed to load order details.");
          toast.error("Failed to load order details.");
        }
      } catch (error: any) {
        console.error("Error fetching order details:", error);
        setError("Failed to load order details. Please try again later.");
        toast.error("Failed to load order details. Please try again later.");
        
        // If unauthorized, redirect to signin
        if (error.response?.status === 401) {
          navigate("/signin");
        }
        
        // If not found
        if (error.response?.status === 404) {
          setError("Order not found");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, navigate]);

  // Format price with Indian Rupee symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/orders')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            </div>
            {orderId && <p className="mt-1 text-sm text-gray-600">Order #{orderId}</p>}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
            <div className="mt-6 flex justify-center">
              <Link
                to="/orders"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        ) : order ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Order #{order.id}
                  </p>
                </div>
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full border ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900 mb-3">Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                        <span className="text-gray-500 text-xs">{item.quantity}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">{formatPrice(order.total_price)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Shipping</span>
                <span className="text-sm font-medium text-gray-900">Free</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="text-base font-medium text-gray-900">Total</span>
                <span className="text-base font-medium text-gray-900">{formatPrice(order.total_price)}</span>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex justify-between">
                <Link
                  to="/orders"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Back to Orders
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-600">No order information available.</p>
          </div>
        )}
      </div>
    </Layout>
  );
} 