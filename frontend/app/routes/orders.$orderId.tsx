import { useEffect, useState } from 'react';
import { useParams, Link } from '@remix-run/react';
import { Layout } from '~/components/layout';
import { ordersAPI } from '~/lib/api';
import { toast } from 'react-fox-toast';
import {
  ShoppingBag,
  Clock,
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  CreditCard,
  Receipt,
  XCircle
} from 'lucide-react';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  get_cost: number;
}

interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: string | null;
  payment_id: string | null;
  razorpay_order_id: string | null;
  refund_details?: {
    refund_id: string;
    status: string;
  };
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        const response = await ordersAPI.getOrderDetails(orderId);
        if (response.success) {
          setOrder(response.data);
        } else {
          setError(response.message || 'Failed to fetch order details');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      case 'CANCELLED':
        return 0;
      default:
        return 0;
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;

    // Confirm cancellation
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    try {
      setIsCancelling(true);
      const response = await ordersAPI.cancelOrder(orderId);

      if (response.success) {
        toast.success('Order cancelled successfully');
        // Update the order state to reflect cancellation
        setOrder(prevOrder => prevOrder ? { ...prevOrder, status: 'CANCELLED' } : null);
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span>Loading order details...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center text-red-700">
              <AlertCircle size={18} className="mr-2" />
              <p>{error || 'Order not found'}</p>
            </div>
          </div>
          <Link to="/orders" className="flex items-center text-primary hover:text-primary-600 font-medium">
            <ArrowLeft size={16} className="mr-1" />
            Back to Orders
          </Link>
        </div>
      </Layout>
    );
  }

  const statusStep = getStatusStep(order.status);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="mb-6">
          <Link to="/orders" className="flex items-center text-primary hover:text-primary-600 font-medium">
            <ArrowLeft size={16} className="mr-1" />
            Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-1 text-black !text-black" style={{color: '#000 !important'}}>Order #{order.id}</h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock size={14} className="mr-1" />
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {order.status === 'CANCELLED' ? (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                    Cancelled
                  </span>
                ) : (
                  <>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                    {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                      <button 
                        onClick={handleCancelOrder}
                        disabled={isCancelling}
                        className="flex items-center px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 size={14} className="mr-1 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle size={14} className="mr-1" />
                            Cancel Order
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {order.status !== 'CANCELLED' && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4 text-black !text-black" style={{color: '#000 !important'}}>Order Status</h2>
              <div className="relative">
                {/* Progress bar */}
                <div className="h-1 bg-gray-200 absolute top-5 left-0 right-0 z-0">
                  <div 
                    className="h-1 bg-primary transition-all duration-500" 
                    style={{ width: `${(statusStep - 1) * 33.33}%` }}
                  ></div>
                </div>
                
                {/* Status steps */}
                <div className="flex justify-between relative z-10">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      statusStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <ShoppingBag size={20} />
                    </div>
                    <span className="mt-2 text-sm font-medium text-black !text-black" style={{color: '#000 !important'}}>Confirmed</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      statusStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Loader2 size={20} />
                    </div>
                    <span className="mt-2 text-sm font-medium text-black !text-black" style={{color: '#000 !important'}}>Processing</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      statusStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Truck size={20} />
                    </div>
                    <span className="mt-2 text-sm font-medium text-black !text-black" style={{color: '#000 !important'}}>Shipped</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      statusStep >= 4 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <CheckCircle size={20} />
                    </div>
                    <span className="mt-2 text-sm font-medium text-black !text-black" style={{color: '#000 !important'}}>Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-black !text-black" style={{color: '#000 !important'}}>Order Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {item.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        ₹{item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                        ₹{item.get_cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm font-medium text-black text-right">
                      Total:
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-black">
                      ₹{order.total_price}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {order.shipping_address && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold mb-2 flex items-center text-black !text-black" style={{color: '#000 !important'}}>
                <MapPin size={18} className="mr-2 text-primary" />
                Shipping Address
              </h2>
              <p className="text-black">
                {order.shipping_address}
              </p>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center text-black ">
              <CreditCard size={18} className="mr-2 text-primary" />
              Payment Information
            </h2>
            <div className="mt-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-black">Payment Method:</span>
                <span className="font-medium text-black">{order.payment_id ? 'Online Payment' : 'Cash on Delivery'}</span>
              </div>
              {order.payment_id && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-black">Transaction ID:</span>
                  <span className="font-medium text-black">{order.payment_id}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-black">Payment Status:</span>
                <span className="font-medium text-green-600">
                  {order.payment_id ? 'Paid' : order.status === 'DELIVERED' ? 'Paid' : 'Pending'}
                </span>
              </div>
              {order.status === 'CANCELLED' && order.refund_details && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-black">Refund Status:</span>
                  <span className={`font-medium ${
                    order.refund_details.status === 'processed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.refund_details.status === 'processed' ? 'Refunded' : 'Refund Processing'}
                  </span>
                </div>
              )}
              {order.status === 'CANCELLED' && order.refund_details && order.refund_details.refund_id && (
                <div className="flex justify-between py-2">
                  <span className="text-black">Refund ID:</span>
                  <span className="font-medium text-black">{order.refund_details.refund_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Link to="/orders" className="flex items-center text-primary hover:text-primary-600 font-medium">
            <ArrowLeft size={16} className="mr-1" />
            Back to Orders
          </Link>
          <Link to="/" className="bg-primary hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-md transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </Layout>
  );
}