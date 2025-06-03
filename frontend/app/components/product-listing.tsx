import { Link } from "@remix-run/react";
import { useCartStore } from "~/store/cart";
import { ShoppingCart, ChevronRight, Trash2, CheckCircle, AlertCircle, Plus, Minus } from "lucide-react";
import { toast } from "react-fox-toast";
import type { Product } from "~/lib/api";
import { getImageUrl } from "~/utils/image";

interface ProductListingProps {
  products: Product[];
  title: string;
}

export function ProductListing({ products, title }: ProductListingProps) {
  const { addItem, removeItem, decrementItem, items } = useCartStore();
  
  // Function to convert title to URL-friendly category parameter
  const getCategoryParam = (title: string) => {
    return title.toLowerCase().replace(/[&\s]+/g, '-');
  };

  // Get image URL or fallback to emoji
  const getProductImage = (product: Product) => {
    if (product.thumbnail) {
      return <img 
        src={getImageUrl(product.thumbnail)} 
        alt={product.name} 
        className="w-full h-full object-contain"
      />;
    }
    
    if (product.images && product.images.length > 0) {
      return <img 
        src={getImageUrl(product.images[0].image)} 
        alt={product.images[0].alt_text || product.name} 
        className="w-full h-full object-contain"
      />;
    }
    
    // Fallback to emoji based on product name
    const firstLetter = product.name.charAt(0).toLowerCase();
    const emojis: Record<string, string> = {
      a: '🍎', b: '🍌', c: '🥕', d: '🥛', e: '🥚', f: '🍟',
      g: '🍇', h: '🍯', i: '🍦', j: '🧃', k: '🥝', l: '🍋',
      m: '🥩', n: '🌰', o: '🍊', p: '🥜', q: '🍳', r: '🍚',
      s: '🍓', t: '🍅', u: '🍇', v: '🥗', w: '🍉', x: '🥐',
      y: '🍠', z: '🫑',
    };
    
    return <span className="text-3xl">{emojis[firstLetter] || '🛒'}</span>;
  };

  // Calculate discount percentage if available
  const getDiscountPercent = (product: Product) => {
    const dealPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const originalPrice = dealPrice * 1.2; // Approximate original price for demo
    const discount = Math.round(((originalPrice - dealPrice) / originalPrice) * 100);
    return discount > 0 ? `${discount}% OFF` : null;
  };

  // Format price as Indian Rupees
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  // Handle adding item to cart with toast notification
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent navigation when adding to cart
    
    const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const imageUrl = product.thumbnail || (product.images && product.images.length > 0 ? product.images[0].image : '🛒');
    
    addItem({
      id: product.id,
      name: product.name,
      price: numPrice,
      image: imageUrl,
      unit: '1 pc' // Default unit
    });
    
    // Show toast notification
    toast.success(
      <div className="flex items-center w-full">
        <div>
          <p className="font-medium text-gray-800">{product.name} added to cart!</p>
          <p className="text-xs text-gray-500">Added to your cart</p>
        </div>
      </div>,
      {
        position: 'bottom-center',
        duration: 2000
      }
    );
  };
  
  // Handle decrementing item in cart
  const handleDecrementItem = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent navigation
    decrementItem(product.id);
  };
  
  // Handle removing item from cart with toast notification
  const handleRemoveFromCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent navigation
    
    removeItem(product.id);
    
    // Show toast notification
    toast.error(
      <div className="flex items-center w-full">
        <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={20} />
        <div>
          <p className="font-medium text-gray-800">{product.name} removed from cart</p>
        </div>
      </div>,
      {
        position: 'bottom-center',
        duration: 2000
      }
    );
  };
  
  return (
    <section className="py-6 md:py-8 bg-white">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-black border-b-2 border-primary pb-1">{title}</h2>
          <Link to={`/products?category=${getCategoryParam(title)}`} className="text-primary font-medium text-xs md:text-sm hover:underline flex items-center">
            View All <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {/* Horizontal scrollable container */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-4 gap-3 md:gap-4 custom-scrollbar">
            {products.map(product => {
              // Check if product is in cart using exact ID matching
              const cartItem = items.find(item => item.id === product.id);
              const quantity = cartItem?.quantity || 0;
              const discountPercent = getDiscountPercent(product);
              
              return (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`} 
                  className="flex-none w-36 sm:w-40 md:w-48 lg:w-52"
                  preventScrollReset
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
                    <div className="relative bg-gray-50">
                      {discountPercent && (
                        <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                          {discountPercent}
                        </span>
                      )}
                      <div className="text-5xl sm:text-7xl md:text-8xl flex justify-center items-center h-28 sm:h-32 md:h-36 p-4 pointer-events-none">
                        {getProductImage(product)}
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-medium text-black text-xs sm:text-sm line-clamp-2">{product.name}</h3>
                      <p className="text-gray-700 text-xs mt-1 line-clamp-1">{product.description.substring(0, 30)}</p>
                      <div className="mt-2 flex items-center">
                        <span className="font-bold text-black text-sm sm:text-base">{formatPrice(product.price)}</span>
                      </div>
                      
                      {quantity === 0 ? (
                        <button 
                          className="mt-2 w-full bg-primary hover:bg-primary-600 text-white text-xs sm:text-sm font-medium py-1 sm:py-1.5 rounded-md flex items-center justify-center"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          <ShoppingCart size={14} className="mr-1" /> ADD TO CART
                        </button>
                      ) : (
                        <div className="mt-2 flex items-center border border-gray-200 rounded-md bg-white" onClick={(e) => e.preventDefault()}>
                          {quantity === 1 ? (
                            <button
                              onClick={(e) => handleRemoveFromCart(e, product)}
                              className="flex-1 text-red-500 py-1 hover:bg-red-50 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleDecrementItem(e, product)}
                              className="flex-1 text-gray-500 py-1 hover:bg-gray-50 flex items-center justify-center transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                          )}
                          <span className="px-2 py-1 text-center text-black font-medium">{quantity}</span>
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="flex-1 text-primary py-1 hover:bg-primary-50 flex items-center justify-center transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
} 