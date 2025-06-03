import { json } from "@remix-run/node";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { HeroSection } from "~/components/hero-section";
import { Layout } from "~/components/layout";
import { CategoryCard } from "~/components/category-card";
import { DownloadApp } from "~/components/download-app";
import { ProductListing } from "~/components/product-listing";
import { OffersSection } from "~/components/offers-section";
import { Clock, Truck, Shield, Star } from "lucide-react";
import PromoSlider from "~/components/features/PromoSlider";

export const meta: MetaFunction = () => {
  return [
    { title: "Blinkit - Grocery Delivery in 10 Minutes" },
    { name: "description", content: "Order groceries, fresh vegetables, fruits, dairy, household essentials and more. Get delivery in just 10 minutes." },
  ];
};

interface Category {
  id: string;
  name: string;
  image: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  weight: string;
  discount?: string;
}

interface LoaderData {
  categories: Category[];
  featuredProducts: Product[];
}

export const loader: LoaderFunction = async () => {
  const categories: Category[] = [
    { id: "1", name: "Fruits & Vegetables", image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/layout-engine/2022-12/paan-corner_web.png" },
    { id: "2", name: "Dairy & Breakfast", image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/layout-engine/2022-11/Slice-2_10.png" },
    { id: "3", name: "Snacks & Munchies", image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/layout-engine/2022-11/Slice-3_9.png" },
    { id: "4", name: "Bakery & Biscuits", image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/layout-engine/2022-11/Slice-4_9.png" },
    { id: "5", name: "Household Items", image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/layout-engine/2022-11/Slice-6_5.png" },
    { id: "6", name: "Electronics", image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/layout-engine/2022-11/Slice-5_6.png" },
  ];
  
  const featuredProducts: Product[] = [
    { id: "1", name: "Fresh Tomatoes", price: 29, originalPrice: 35, image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/app/images/products/sliding_image/391306a.jpg", weight: "500g", discount: "15% OFF" },
    { id: "2", name: "Onions", price: 39, originalPrice: 45, image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/app/images/products/sliding_image/16445a.jpg", weight: "1kg", discount: "10% OFF" },
    { id: "3", name: "Amul Butter", price: 55, image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/app/images/products/sliding_image/45533a.jpg", weight: "100g" },
    { id: "4", name: "Tata Salt", price: 28, originalPrice: 30, image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/app/images/products/sliding_image/160a.jpg", weight: "1kg", discount: "7% OFF" },
    { id: "5", name: "Aashirvaad Atta", price: 299, originalPrice: 325, image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/app/images/products/sliding_image/176a.jpg", weight: "5kg", discount: "8% OFF" },
    { id: "6", name: "Fortune Oil", price: 190, originalPrice: 220, image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=270/app/images/products/sliding_image/447a.jpg", weight: "1L", discount: "14% OFF" },
  ];

  return json({ categories, featuredProducts });
};

export default function Index() {
  const { categories, featuredProducts } = useLoaderData<LoaderData>();

  return (
    <Layout showSidebar={false}>
      <HeroSection />

      {/* Promo Slider */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-black border-b-2 border-primary pb-1 mb-6">Special Offers</h2>
          <PromoSlider />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
                <Clock size={28} />
              </div>
              <h3 className="font-semibold text-gray-900">10 Minute Delivery</h3>
              <p className="text-sm text-gray-700 mt-1">Get your order within 10 minutes</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
                <Truck size={28} />
              </div>
              <h3 className="font-semibold text-gray-900">Free Delivery</h3>
              <p className="text-sm text-gray-700 mt-1">On orders above ₹199</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
                <Shield size={28} />
              </div>
              <h3 className="font-semibold text-gray-900">Best Quality</h3>
              <p className="text-sm text-gray-700 mt-1">Handpicked fresh items</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
                <Star size={28} />
              </div>
              <h3 className="font-semibold text-gray-900">Best Prices</h3>
              <p className="text-sm text-gray-700 mt-1">Price match guarantee</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Today's Offers */}
      <OffersSection />
      
      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-black border-b-2 border-primary pb-1">Shop By Category</h2>
            <Link to="/app" className="text-primary font-medium text-sm">View All</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <CategoryCard 
                key={category.id}
                id={category.id}
                name={category.name}
                image={category.image}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <ProductListing products={featuredProducts} title="Trending Products" />
      
      {/* Download App Section */}
      <DownloadApp />
    </Layout>
  );
} 