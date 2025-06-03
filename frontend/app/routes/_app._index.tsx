import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Layout } from "~/components/layout";
import ProductCard from "~/components/product-card";
import { ProductListing } from "~/components/product-listing";
import { productsAPI } from "~/lib/api";
import type { Product, Category } from "~/lib/api";
import { getImageUrl } from "~/utils/image";
import PromoSlider from "~/components/features/PromoSlider";
import { HeroSection } from "~/components/hero-section";

export const meta: MetaFunction = () => {
  return [
    { title: "Blinkit - Grocery Delivery in 10 Minutes" },
    { name: "description", content: "Groceries delivered in minutes. 10 minute delivery." },
  ];
};

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories first
        const categoriesResponse = await productsAPI.getCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
          
          // Initialize empty product arrays for each category
          const initialCategoryProducts: Record<string, Product[]> = {};
          categoriesResponse.data.forEach(category => {
            initialCategoryProducts[category.id.toString()] = [];
          });
          setCategoryProducts(initialCategoryProducts);
        }

        // Fetch all products
        const productsResponse = await productsAPI.getProducts();
        console.log("API Response:", productsResponse);
        
        // Set featured products (first 6)
        if (productsResponse.success) {
          let allProducts: Product[] = [];
          
          if (Array.isArray(productsResponse.data)) {
            allProducts = productsResponse.data;
          } else if (productsResponse.data.results) {
            allProducts = productsResponse.data.results;
          }
          
          setFeaturedProducts(allProducts.slice(0, 6));
          
          // Group products by category
          const productsByCategory: Record<string, Product[]> = {};
          allProducts.forEach(product => {
            const categoryId = product.category.toString();
            if (!productsByCategory[categoryId]) {
              productsByCategory[categoryId] = [];
            }
            if (productsByCategory[categoryId].length < 6) {
              productsByCategory[categoryId].push(product);
            }
          });
          
          setCategoryProducts(productsByCategory);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        
        {/* Promo Slider */}
        <div>
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-black">Special Offers</h2>
          <PromoSlider />
        </div>

        {/* Hero banner */}
        <div className="bg-primary-100 rounded-lg p-4 lg:p-6">
          <div className="max-w-2xl">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2 md:mb-3">
              Groceries delivered in 10 minutes
            </h1>
            <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6">
              Get your daily essentials delivered to your doorstep, faster than you can imagine!
            </p>
          </div>
        </div>
        
      
        {isLoading ? (
          // Loading skeleton
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="relative">
              <div className="flex overflow-x-auto pb-4 gap-3 md:gap-4 custom-scrollbar">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-none w-36 sm:w-40 md:w-48 lg:w-52 bg-gray-200 rounded-lg h-64"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
        {/* Featured products section */}
        <div>
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-black">Featured Products</h2>
          <div className="relative">
            <div className="flex overflow-x-auto pb-4 gap-3 md:gap-4 custom-scrollbar">
                {featuredProducts.map((product) => {
                  // Process the thumbnail URL
                  const thumbnailUrl = product.thumbnail ? getImageUrl(product.thumbnail) : '';
                  const imageUrl = product.images && product.images.length > 0 ? getImageUrl(product.images[0].image) : '';
                  const displayImage = thumbnailUrl || imageUrl || '🛒';
                  
                  // Convert price to number for proper handling
                  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
                  
                  return (
                    <div className="flex-none w-36 sm:w-40 md:w-48 lg:w-52">
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
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        
        {/* Category based product listings */}
        {categories.map(category => {
          const categoryId = category.id.toString();
          const products = categoryProducts[categoryId] || [];
          
          if (products.length > 0) {
            return (
              <ProductListing 
                key={categoryId} 
                products={products} 
                title={category.name} 
              />
            );
          }
          return null;
        })}
          </>
        )}


      <HeroSection />

        
        {/* Offers section */}
        <div>
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-black">Today's Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="bg-yellow-50 rounded-lg p-4 md:p-6 border border-secondary">
              <h3 className="text-md md:text-lg font-bold mb-2 text-black">50% OFF</h3>
              <p className="text-sm md:text-base text-gray-700 mb-2 md:mb-3">On first order above ₹199</p>
              <p className="text-xs font-medium bg-secondary text-white inline-block px-2 py-1 rounded">
                Use code: FIRST50
              </p>
            </div>
            <div className="bg-primary-50 rounded-lg p-4 md:p-6 border border-primary-200">
              <h3 className="text-md md:text-lg font-bold mb-2 text-black">Free Delivery</h3>
              <p className="text-sm md:text-base text-gray-700 mb-2 md:mb-3">On orders above ₹99</p>
              <p className="text-xs font-medium bg-primary-200 text-primary-800 inline-block px-2 py-1 rounded">
                No code needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 