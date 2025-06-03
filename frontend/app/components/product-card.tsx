import { Plus, Minus, CheckCircle } from "lucide-react";
import { useCartStore, type CartItem } from "~/store/cart";
import { toast } from "react-fox-toast";
import { Link } from "@remix-run/react";
import { getImageUrl } from "~/utils/image";

interface ProductCardProps {
  product: Omit<CartItem, 'quantity'> & { price: string | number };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem, decrementItem } = useCartStore();
  
  // Ensure we're using exact ID matching by converting to number
  const productId = Number(product.id);
  const cartItem = items.find(item => item.id === productId);
  const quantity = cartItem?.quantity || 0;
  
  // Ensure price is a number
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  // Handle adding item to cart with toast notification
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: Number(product.id),
      name: product.name,
      price: price,
      image: product.image,
      unit: product.unit
    });
    
    // Show toast notification
    toast.success(
      <div className="flex items-center w-full">
        <div>
          <p className="font-medium text-gray-800">{product.name} added to cart!</p>
          <p className="text-xs text-gray-500">
            {quantity === 0 ? "Added to your cart" : `Quantity updated to ${quantity + 1}`}
          </p>
        </div>
      </div>,
      {
        position: 'bottom-center',
        duration: 2000
      }
    );
  };

  // Handle decrementing item in cart
  const handleDecrementItem = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    decrementItem(Number(product.id));
  };
  
  // Handle removing item from cart
  const handleRemoveItem = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem(Number(product.id));
  };
  
  // Get the full image URL
  const getProductImage = () => {
    if (typeof product.image === 'string') {
      // For remote URLs (starting with http)
      if (product.image.startsWith('http')) {
        return product.image;
      }
      // For local paths that need the API root prepended
      else if (product.image.startsWith('/')) {
        return getImageUrl(product.image);
      }
    }
    
    // Return the original value (might be an emoji or other non-URL)
    return product.image;
  };

  return (
    <Link 
      to={`/products/${product.id}`} 
      className="block h-full"
      preventScrollReset
    >
      <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors h-full flex flex-col">
        <div className="text-4xl mb-2 pointer-events-none">
          {typeof product.image === 'string' && (product.image.startsWith('http') || product.image.startsWith('/')) ? (
            <img 
              src={getProductImage()} 
              alt={product.name} 
              className="w-20 h-20 object-contain mx-auto"
            />
          ) : (
            <div className="flex justify-center items-center h-20">
              <span className="text-4xl">{product.image || '🛒'}</span>
            </div>
          )}
        </div>
        <h3 className="font-medium text-sm mb-1 line-clamp-2 text-black">{product.name}</h3>
        <p className="text-gray-700 text-xs mb-2">{product.unit}</p>
        <div className="flex justify-between items-center mt-auto">
          <p className="font-semibold text-black">₹{price}</p>
          
          {quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              className="text-primary text-sm font-medium hover:bg-primary-50 px-2 py-1 rounded"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center border border-gray-200 rounded overflow-hidden" onClick={(e) => e.preventDefault()}>
              {quantity === 1 ? (
                <button
                  onClick={handleRemoveItem}
                  className="px-2 py-1 text-red-500 hover:bg-red-50"
                >
                  <Minus size={14} />
                </button>
              ) : (
                <button
                  onClick={handleDecrementItem}
                  className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                >
                  <Minus size={14} />
                </button>
              )}
              <span className="w-8 text-center text-sm font-medium text-black">{quantity}</span>
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center w-8 h-8 bg-gray-50 hover:bg-gray-100"
              >
                <Plus size={14} className="text-gray-700" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 