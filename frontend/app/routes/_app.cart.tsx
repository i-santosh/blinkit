import { Link } from "@remix-run/react";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, CreditCard, Truck } from "lucide-react";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { useCartStore } from "~/store/cart";
import { getImageUrl } from "~/utils/image";

export default function Cart() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore();
  
  const deliveryFee = totalPrice > 99 ? 0 : 20;
  const subtotal = totalPrice;
  const total = subtotal + deliveryFee;

  // Helper function to render cart item image
  const renderItemImage = (image: string) => {
    if (!image) return <div className="text-4xl w-16 h-16 flex items-center justify-center">🛒</div>;
    
    // If it's an emoji or very short string (likely an emoji)
    if (image.length <= 2) {
      return <div className="text-4xl w-16 h-16 flex items-center justify-center">{image}</div>;
    }
    
    // If it's a URL or path
    return (
      <div className="w-16 h-16 bg-white rounded overflow-hidden border border-gray-200 flex items-center justify-center">
        <img 
          src={image.startsWith('http') ? image : getImageUrl(image)} 
          alt="Product" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  };

  return (
    <Layout showSidebar={false}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-8 mt-4">
          <Link to="/" className="mr-4 flex items-center text-primary hover:underline">
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-black">Your Cart</h1>
          <span className="ml-2 text-gray-700 font-medium">({totalItems} items)</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-semibold mb-3 text-black">Your cart is empty</h2>
            <p className="text-gray-700 mb-8 text-lg">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/">
              <Button className="px-6 py-3 text-base font-medium">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="font-semibold text-lg text-black">Cart Items</h2>
                  <button 
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    <span className="font-medium">Clear All</span>
                  </button>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="p-4 flex items-center hover:bg-gray-50">
                      <div className="flex-shrink-0 mr-4">
                        {renderItemImage(item.image)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-black text-base">{item.name}</h3>
                        <p className="text-sm text-gray-700">{item.unit}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                          <button
                            onClick={() => updateQuantity(Number(item.id), item.quantity - 1)}
                            className="flex items-center justify-center w-8 h-8 bg-gray-50 hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} className="text-gray-700" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-black">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(Number(item.id), item.quantity + 1)}
                            className="flex items-center justify-center w-8 h-8 bg-gray-50 hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} className="text-gray-700" />
                          </button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className="font-medium text-black">₹{(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-xs text-gray-700">₹{item.price.toFixed(2)} each</div>
                        </div>
                        <button 
                          onClick={() => removeItem(Number(item.id))}
                          className="text-gray-600 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-5 sticky top-20 border border-gray-200">
                <h2 className="font-semibold text-lg mb-5 text-black flex items-center">
                  <CreditCard size={18} className="mr-2 text-primary" />
                  Order Summary
                </h2>
                
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-700 font-medium">Subtotal</span>
                    <span className="font-medium text-black">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-700 font-medium flex items-center">
                      <Truck size={14} className="mr-1 text-primary" />
                      Delivery Fee
                    </span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-black'}`}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg text-black">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Link to="/checkout">
                  <Button className="w-full py-3 text-base flex items-center justify-center gap-2 font-bold">
                    <ShoppingBag size={18} />
                    <span>Proceed to Checkout</span>
                  </Button>
                </Link>
                
                <div className="mt-4 px-2 py-3 bg-green-50 rounded-md border border-green-100">
                  <p className="text-sm text-gray-700 font-medium flex items-center">
                    <Truck size={14} className="mr-2 text-green-600 flex-shrink-0" />
                    Free delivery on orders above ₹99
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 