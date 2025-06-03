import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { useCartStore } from "~/store/cart";
import { Layout } from "~/components/layout";
import { useState } from "react";
import { 
  ShoppingCart, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft,
  Star,
  Share2,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  Plus,
  ShoppingBag
} from "lucide-react";
import { toast } from "react-fox-toast";
import { productsAPI, type Product } from "~/lib/api";
import { getImageUrl } from "~/utils/image";
import invariant from "tiny-invariant";

export async function loader({ params }: LoaderFunctionArgs) {
  const productId = params.id;
  invariant(productId, "Product ID is required");
  
  try {
    // Fetch product data from API
    const response = await productsAPI.getProduct(Number(productId));
    
    if (!response.success || !response.data) {
      throw new Response("Product not found", { status: 404 });
    }
    
    return json({ product: response.data });
  } catch (error) {
    console.error("Error loading product:", error);
    throw new Response("Error loading product", { status: 500 });
  }
}

export default function ProductDetail() {
  const { product } = useLoaderData<typeof loader>();
  const { addItem, items } = useCartStore();
  const navigate = useNavigate();
  const cartItem = items.find(item => item.id === Number(product.id));
  const quantity = cartItem?.quantity || 0;
  
  // State for image gallery
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Format price as number
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  
  // Define product image type
  interface ProductImageItem {
    src: string;
    alt: string;
    isThumb: boolean;
    isEmoji?: boolean;
  }
  
  // Collect all product images
  const productImages: ProductImageItem[] = [];
  
  // Process images - make sure we don't duplicate the thumbnail in the gallery
  // if it's already included in the images array
  if (product.thumbnail) {
    productImages.push({
      src: product.thumbnail,
      alt: `${product.name} - thumbnail`,
      isThumb: true
    });
  }
  
  // Add additional images
  if (product.images && product.images.length > 0) {
    const additionalImages = product.images.map(img => ({
      src: img.image,
      alt: img.alt_text || `${product.name} - image`,
      isThumb: false
    }));
    
    // Only add unique images (avoid duplicating the thumbnail)
    additionalImages.forEach(img => {
      if (!productImages.some(existing => existing.src === img.src)) {
        productImages.push(img);
      }
    });
  }
  
  // Fallback if no images are available
  if (productImages.length === 0) {
    productImages.push({
      src: '🛒',
      alt: product.name,
      isThumb: false,
      isEmoji: true
    });
  }
  
  // Navigation for image gallery
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };
  
  // Function to handle Buy Now action
  const handleBuyNow = () => {
    // Add item to cart if not already there
    if (quantity === 0) {
      // Get primary image for cart display
      const primaryImage = productImages.length > 0 ? productImages[0].src : '🛒';
      
      addItem({
        id: Number(product.id),
        name: product.name,
        price,
        image: primaryImage,
        unit: '1 pc' // Default unit
      });
    }
    
    // Show toast notification
    toast.success(
      <div className="flex items-center w-full">
        <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
        <div>
          <p className="font-medium text-gray-800">Proceeding to checkout!</p>
          <p className="text-xs text-gray-500">
            {quantity === 0 ? `${product.name} added to cart` : `${product.name} already in cart`}
          </p>
        </div>
      </div>,
      {
        position: 'bottom-center',
        duration: 2000
      }
    );
    
    // Navigate to checkout page
    navigate("/checkout");
  };

  // Function to handle adding item to cart with toast notification
  const handleAddToCart = () => {
    // Get primary image for cart display
    const primaryImage = productImages.length > 0 ? productImages[0].src : '🛒';
    
    addItem({
      id: Number(product.id),
      name: product.name,
      price,
      image: primaryImage,
      unit: '1 pc' // Default unit
    });

    // Show toast notification
    toast.success(
      <div className="flex items-center w-full">
        <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
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
  
  // Function to handle share button click
  const handleShare = () => {
    // Get the current URL
    const url = window.location.href;
    
    // Copy URL to clipboard
    navigator.clipboard.writeText(url)
      .then(() => {
        // Custom success toast with styled elements
        toast.success(
          <div className="flex items-center w-full">
            <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-gray-800">Link copied!</p>
              <p className="text-xs text-gray-500">Share this product with friends</p>
            </div>
          </div>,
          {
            position: 'bottom-center',
            duration: 3000
          }
        );
      })
      .catch(err => {
        // Show error toast message if copying fails
        toast.error(
          <div className="flex items-center w-full">
            <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={20} />
            <p className="font-medium text-gray-800">Failed to copy link</p>
          </div>,
          {
            position: 'bottom-center',
            duration: 3000
          }
        );
        console.error('Failed to copy URL: ', err);
      });
  };
  
  // Helper function to render image
  const renderImage = (image: typeof productImages[0], index: number) => {
    if (!image || !image.src) return <div className="text-9xl">🛒</div>;
    
    // Handle emoji or very short strings as emojis
    if (image.isEmoji || (typeof image.src === 'string' && image.src.length <= 2)) {
      return <div className="text-9xl">{image.src}</div>;
    }
    
    // Image path
    return (
      <img 
        src={getImageUrl(image.src)}
        alt={image.alt || `${product.name} - image ${index + 1}`}
        className="w-full h-full object-contain"
        loading={index === 0 ? 'eager' : 'lazy'}
      />
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/" className="text-primary hover:underline flex items-center">
            <ArrowLeft size={16} className="mr-1" /> Back to Home
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Image Gallery */}
            <div className="md:w-1/3 bg-gray-50 p-4 relative">
              <div className="aspect-square flex items-center justify-center relative overflow-hidden rounded-md border border-gray-100">
                {renderImage(productImages[currentImageIndex], currentImageIndex)}
                
                {/* Image Navigation */}
                {productImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage} 
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 border border-gray-200 z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <button 
                      onClick={nextImage} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 border border-gray-200 z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} className="text-gray-700" />
                    </button>
                  </>
                )}
                
                {/* Share button */}
                <button 
                  onClick={handleShare}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors border border-gray-200 z-10"
                  aria-label="Share product"
                >
                  <Share2 size={20} className="text-gray-500" />
                </button>
              </div>
              
              {/* Thumbnail navigation */}
              {productImages.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2 overflow-x-auto py-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 flex items-center justify-center rounded-md overflow-hidden ${
                        currentImageIndex === index ? 'border-2 border-primary bg-primary/10 ring-2 ring-primary/30' : 'border border-gray-200 hover:border-gray-300'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      {img.isEmoji || (typeof img.src === 'string' && img.src.length <= 2) ? (
                        <div className="text-2xl">{img.src}</div>
                      ) : (
                        <img 
                          src={getImageUrl(img.src)} 
                          alt={img.alt || `Thumbnail ${index + 1}`} 
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="md:w-2/3 p-8">
              <h1 className="text-2xl font-bold text-black mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400 mr-2">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} className="text-gray-300" fill="currentColor" />
                </div>
                <span className="text-sm text-gray-500">4.2 (24 reviews)</span>
              </div>
              
              <div className="flex items-center mb-4">
                <span className="text-xl font-bold text-black">₹{price}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 flex items-center">
                <Clock size={16} className="mr-1 text-primary" /> 
                Delivered in 10-15 minutes
              </p>
              <p className="text-sm text-gray-600 mb-4 flex items-center">
                <Truck size={16} className="mr-1 text-primary" /> 
                1 pc
              </p>
              
              <div className="border-t border-b border-gray-200 py-4 my-4">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {quantity === 0 ? (
                  <button 
                    onClick={handleAddToCart}
                    className="sm:flex-1 bg-primary hover:bg-primary-600 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center"
                  >
                    <ShoppingCart size={20} className="mr-2" /> ADD TO CART
                  </button>
                ) : (
                  <div className="flex items-center sm:flex-1">
                    <span className="mr-4 text-black">In cart: {quantity}</span>
                    <button 
                      onClick={handleAddToCart}
                      className="bg-primary hover:bg-primary-600 text-white py-3 px-6 rounded-md font-medium flex items-center"
                    >
                      <Plus size={20} className="mr-2" /> ADD MORE
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={handleBuyNow}
                  className="sm:flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-md font-bold shadow-md transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center"
                >
                  <ShoppingBag size={20} className="mr-2" /> BUY NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 