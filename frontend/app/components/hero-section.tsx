import { Link } from "@remix-run/react";
import { ArrowRight, Clock, ShoppingBag, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  
  const images = [
    {
      url: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1174&q=80",
      alt: "Grocery delivery"
    },
    {
      url: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80",
      alt: "Fresh vegetables and fruits in basket"
    },
    {
      url: "https://images.unsplash.com/photo-1506617420156-8e4536971650?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1376&q=80",
      alt: "Fresh grocery shopping"
    }
  ];

  const startAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);
  };

  const handleImageChange = (index: number) => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentImage(index);
      setIsAnimating(false);
      startAutoplay();
    }, 300);
  };

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [images.length]);

  return (
    <section className="relative bg-gradient-to-r from-green-50 to-green-100 py-8 md:py-16 lg:py-20 overflow-hidden" aria-label="Hero banner">
      <div className="absolute inset-0 bg-gradient-to-r from-green-50/90 to-green-100/90 backdrop-blur-sm z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left content */}
          <div className="max-w-xl md:w-1/2 animate-fadeIn">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary font-medium text-sm mb-4 transform hover:scale-105 transition-transform">
              <Check size={16} className="mr-1" aria-hidden="true" /> 
              <span>India's fastest grocery delivery</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Groceries delivered in <span className="text-primary relative inline-block">
                10 minutes
                <svg className="absolute -bottom-2 left-0 w-full h-2 text-primary/30" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0,5 C50,0 150,0 200,5" stroke="currentColor" strokeWidth="4" fill="none"/>
                </svg>
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Order groceries, fresh fruits & vegetables, dairy, household essentials and more from India's favorite instant delivery app.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative max-w-md w-full group">
                <Link 
                to="/cart" 
                className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-5 rounded-lg flex items-center justify-center shadow-md shadow-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/40 hover:translate-y-[-2px] sm:self-start"
              >
                <ShoppingBag size={16} className="mr-2" aria-hidden="true" />
                <span>Order Now</span>
              </Link>
              </div>
                
            </div>
            <div className="mt-4 text-sm text-gray-700 bg-white/50 px-3 py-1.5 rounded-md inline-block transform transition-all hover:bg-white/70 hover:shadow-sm">
              <span className="font-semibold">Free delivery</span> on first 5 orders. Limited time offer.
            </div>
            
            {/* Success indicators */}
            <div className="mt-8 flex flex-wrap gap-4">
              {[
                { text: "No minimum order" },
                { text: "Free delivery on order above ₹99" },
                { text: "25,000+ products available" }
              ].map((item, index) => (
                <div key={index} className="flex items-center group">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 text-primary mr-2 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Check size={16} aria-hidden="true" />
                  </div>
                  <span className="text-sm text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right side images */}
          <div className="relative w-full md:w-1/2 h-[300px] sm:h-[350px] md:h-[450px] rounded-xl overflow-hidden shadow-2xl mt-8 md:mt-0">
            {/* Main image with animation */}
            <div className="absolute inset-0 w-full h-full">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                    index === currentImage ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  } ${isAnimating ? "blur-sm" : "blur-0"}`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover rounded-xl"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            </div>
            
            {/* Image navigation dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleImageChange(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentImage ? "true" : "false"}
                  className={`w-2.5 h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white ${
                    index === currentImage ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
            
            {/* Delivery badge */}
            <div className="absolute top-4 left-4 bg-white py-2 px-4 rounded-lg shadow-lg flex items-center transform transition-transform hover:scale-105">
              <img 
                src="https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=90/app/images/products/sliding_image/391306a.jpg" 
                alt="Blinkit logo" 
                className="h-8 mr-2" 
                width="32"
                height="32"
              />
              <div className="flex flex-col">
                <span className="text-xs text-gray-700 font-medium">Delivery by</span>
                <span className="font-bold text-primary">Blinkit</span>
              </div>
            </div>
            
            {/* 10 min delivery */}
            <div className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-4 bg-white p-3 md:p-4 rounded-lg shadow-xl transform transition-transform hover:scale-105 z-10">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center bg-green-500 text-white w-9 h-9 rounded-full animate-pulse">
                  <Clock size={18} aria-hidden="true" />
                </div>
                <div>
                  <span className="text-xs text-gray-700 font-medium">Delivery in</span>
                  <p className="font-bold text-black">10 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trust indicators */}
      <div className="container mx-auto mt-8 md:mt-12 px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
          {[
            { title: "25,000+", subtitle: "Products" },
            { title: "10 mins", subtitle: "Delivery Time" },
            { title: "300+", subtitle: "Cities" },
            { title: "2M+", subtitle: "Happy Customers" }
          ].map((item, index) => (
            <div 
              key={index}
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] hover:bg-gray-50"
            >
              <p className="font-bold text-lg md:text-xl text-gray-900">{item.title}</p>
              <p className="text-gray-700 text-sm">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 