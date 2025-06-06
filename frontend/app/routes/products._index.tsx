import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link, useLocation, useFetcher } from "@remix-run/react";
import { Layout } from "~/components/layout";
import ProductCard from "~/components/product-card";
import { productsAPI } from "~/lib/api";
import type { Product, Category } from "~/lib/api";
import { getImageUrl } from "~/utils/image";
import { useEffect, useRef } from "react";
import { Tag, Home, ShoppingBasket, ShoppingCart, Coffee, Apple, Utensils } from "lucide-react";

// Define the loader data type for type safety
type LoaderData = {
  products: Product[];
  categories: Category[];
  currentCategory: Category | null;
  error?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const categoryParam = url.searchParams.get("category");
  
  console.log("Loading products for category param:", categoryParam);
  
  try {
    // Fetch categories
    const categoriesResponse = await productsAPI.getCategories();
    let categories: Category[] = [];
    
    if (categoriesResponse.success && categoriesResponse.data) {
      categories = categoriesResponse.data;
    }
    
    // Debug category formatting
    if (categoryParam && categories.length > 0) {
      console.log("Checking category matches...");
      categories.forEach(cat => {
        const formattedName = formatCategoryNameForUrl(cat.name);
        console.log(`Category "${cat.name}" → "${formattedName}" matches: ${formattedName === categoryParam}`);
      });
    }
    
    // Fetch products filtered by category if provided
    const productsResponse = await productsAPI.getProducts(
      undefined, // page
      undefined, // search
      categoryParam || undefined // category
    );
    
    let products: Product[] = [];
    if (productsResponse.success) {
      if (Array.isArray(productsResponse.data)) {
        products = productsResponse.data;
      } else if (productsResponse.data.results) {
        products = productsResponse.data.results;
      }
    }
    
    // Find current category object using the same formatting logic
    const currentCategory = categoryParam 
      ? categories.find(cat => formatCategoryNameForUrl(cat.name) === categoryParam) || null
      : null;
    
    console.log("Found current category:", currentCategory?.name || 'None');
    
    return json<LoaderData>({ 
      products,
      categories,
      currentCategory
    });
  } catch (error) {
    console.error("Error loading products:", error);
    return json<LoaderData>({ 
      products: [],
      categories: [],
      currentCategory: null,
      error: "Failed to load products. Please try again later."
    });
  }
}

// Format category name for URL (lowercase, replace spaces with hyphens and handle special characters)
const formatCategoryNameForUrl = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/&/g, 'and')       // Replace & with 'and'
    .replace(/[^\w\-]/g, '')    // Remove any other special characters
    .replace(/-+/g, '-');       // Replace multiple hyphens with a single one
};

// Format URL-friendly category name back to display name
const formatUrlToDisplayName = (urlName: string): string => {
  return urlName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/And/g, '&');  // Convert 'and' back to '&' for display if needed
};

export default function Products() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const fetcher = useFetcher<typeof loader>();
  
  // Keep track of previous URL to avoid unnecessary fetches
  const prevSearchRef = useRef(location.search);
  
  // When the URL changes, fetch new data
  useEffect(() => {
    // Skip if URL hasn't changed
    if (prevSearchRef.current === location.search) {
      return;
    }
    
    // Debug logging for category parameter
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    console.log('URL category parameter:', categoryParam);
    
    if (categoryParam && loaderData.categories) {
      // Debug each category formatting to find matching issues
      loaderData.categories.forEach(cat => {
        const formatted = formatCategoryNameForUrl(cat.name);
        console.log(`Category "${cat.name}" formatted as "${formatted}", matches: ${formatted === categoryParam}`);
      });
    }
    
    // Update our ref to the current search
    prevSearchRef.current = location.search;
    
    // Use fetcher to load data without navigation
    fetcher.load(`${location.pathname}${location.search}`);
  }, [location.search, location.pathname, fetcher, loaderData.categories]);
  
  // Get data either from fetcher (if available) or from initial loader
  const data: LoaderData = fetcher.data || loaderData;
  
  // Get category name for display
  const categoryName = data.currentCategory?.name || 
    (searchParams.get("category") ? formatUrlToDisplayName(searchParams.get("category") || "") : "All Products");

  // Get a suitable icon for a category based on its name
  const getCategoryIcon = (categoryName: string, isActive: boolean) => {
    const iconClass = isActive ? "text-white" : "text-gray-500";
    const iconSize = 16;
    
    const nameLower = categoryName.toLowerCase();
    
    if (nameLower.includes('fruit') || nameLower.includes('vegetable')) {
      return <Apple size={iconSize} className={iconClass} />;
    } else if (nameLower.includes('coffee') || nameLower.includes('tea') || nameLower.includes('beverage')) {
      return <Coffee size={iconSize} className={iconClass} />;
    } else if (nameLower.includes('food') || nameLower.includes('meal') || nameLower.includes('kitchen')) {
      return <Utensils size={iconSize} className={iconClass} />;
    } else if (nameLower.includes('grocery') || nameLower.includes('essential')) {
      return <ShoppingCart size={iconSize} className={iconClass} />;
    }
    
    // Default icon
    return <Tag size={iconSize} className={iconClass} />;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">{categoryName}</h1>
          <p className="text-gray-600">
            {!data.currentCategory 
              ? "Browse our complete range of fresh groceries."
              : `Browse our selection of ${categoryName.toLowerCase()}.`}
          </p>
        </div>
        
        {/* Error message if API fetch failed */}
        {data.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {data.error}
          </div>
        )}
        
        {/* Loading state */}
        {fetcher.state === "loading" && (
          <div className="py-2 px-4 bg-primary-50 text-primary rounded mb-4">
            Loading...
          </div>
        )}
        
        {/* Filter controls */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            to="/products"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              !searchParams.get("category")
                ? "bg-primary text-white shadow-md shadow-primary/30 border border-primary/10 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 pulse-animation"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary/30 hover:shadow-sm active:bg-gray-100"
            }`}
            prefetch="intent"
          >
            <Home size={16} strokeWidth={2.5} className={!searchParams.get("category") ? "text-white" : "text-gray-500"} />
            <span>All Items</span>
          </Link>
          
          <div className="h-6 border-r border-gray-300 mx-1"></div>
          
          {data.categories?.map((category: Category) => {
            const categoryUrlName = formatCategoryNameForUrl(category.name);
            const isActive = searchParams.get("category") === categoryUrlName;
            
            return (
              <Link
                key={category.id}
                to={`/products?category=${categoryUrlName}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30 border border-primary/10 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary/30 hover:shadow-sm active:bg-gray-100"
                }`}
                prefetch="intent"
              >
                {getCategoryIcon(category.name, isActive)}
                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Add this CSS at the top of the file to create the pulse animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb, 72, 187, 120), 0.4);
            }
            70% {
              box-shadow: 0 0 0 6px rgba(var(--color-primary-rgb, 72, 187, 120), 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb, 72, 187, 120), 0);
            }
          }
          .pulse-animation {
            animation: pulse 2s infinite;
          }
        `}} />
        
        {data.products?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {data.products.map((product: Product) => {
              // Process the thumbnail URL
              const thumbnailUrl = product.thumbnail ? getImageUrl(product.thumbnail) : '';
              const imageUrl = product.images && product.images.length > 0 ? getImageUrl(product.images[0].image) : '';
              const displayImage = thumbnailUrl || imageUrl || '🛒';
              
              // Convert price to number for proper handling
              const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
              
              return (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: price,
                    unit: '1 pc',
                    image: displayImage
                  }} 
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No products found in this category.</p>
            <Link to="/products" className="text-primary font-medium mt-4 inline-block hover:underline">
              View all products
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
} 