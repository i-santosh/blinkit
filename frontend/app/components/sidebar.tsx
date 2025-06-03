import { Link, useLocation } from "@remix-run/react";
import { cn } from "~/utils";
import { 
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { productsAPI } from "~/lib/api";
import { getImageUrl } from "~/utils/image";

// Category interface to match backend data
interface Category {
  id: number;
  name: string;
  description: string | null;
  thumbnail: string | null;
}

interface SidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ className, isMobileOpen, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await productsAPI.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Set active category based on URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    
    if (categoryParam) {
      // Debug formatting
      if (categories.length > 0) {
        console.log("Sidebar - checking category matches for:", categoryParam);
        categories.forEach(cat => {
          const formatted = formatCategoryNameForUrl(cat.name);
          console.log(`Sidebar category: "${cat.name}" formatted as "${formatted}", matches: ${formatted === categoryParam}`);
        });
      }
      
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory(null);
    }
  }, [location, categories]);

  // Format category name for URL (lowercase, replace spaces with hyphens)
  const formatCategoryNameForUrl = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')       // Replace spaces with hyphens
      .replace(/&/g, 'and')       // Replace & with 'and'
      .replace(/[^\w\-]/g, '')    // Remove any other special characters
      .replace(/-+/g, '-');       // Replace multiple hyphens with a single one
  };

  // Mobile classes
  const mobileClasses = isMobileOpen
    ? "fixed inset-y-0 left-0 z-50 transform translate-x-0"
    : "fixed inset-y-0 left-0 z-50 transform -translate-x-full";

  // Function to render category image or placeholder
  const renderCategoryImage = (category: Category) => {
    if (category.thumbnail) {
      return (
        <img 
          src={getImageUrl(category.thumbnail)} 
          alt={category.name} 
          className="w-6 h-6 object-contain"
        />
      );
    }
    
    // Default placeholder - first letter of category name
    return (
      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
        {category.name.charAt(0)}
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar - always visible on larger screens, no scrolling */}
      <aside className={cn(
        "hidden lg:block w-64 border-r border-gray-200 bg-white", 
        className
      )}>
        <div className="h-full flex flex-col">
          <h2 className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase border-b border-gray-200">
            Categories
          </h2>
          <nav className="flex-1">
            {isLoading ? (
              <div className="py-6 px-6">
                <div className="space-y-4">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center">
                      <div className="w-6 h-6 bg-gray-200 rounded-full mr-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="py-2">
                {categories.map((category) => {
                  const formattedCategoryName = formatCategoryNameForUrl(category.name);
                  return (
                    <li key={category.id}>
                      <Link
                        to={`/products?category=${formattedCategoryName}`}
                        prefetch="intent"
                        preventScrollReset
                        data-category-link={formattedCategoryName}
                        className={cn(
                          "flex items-center px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer",
                          activeCategory === formattedCategoryName && "bg-primary-50 text-primary border-r-4 border-primary"
                        )}
                      >
                        <span className="mr-3 text-primary">
                          {renderCategoryImage(category)}
                        </span>
                        <span>{category.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar - slides in on small screens */}
      <aside className={cn(
        "lg:hidden w-64 border-r border-gray-200 h-full bg-white transition-transform duration-300 ease-in-out", 
        mobileClasses
      )}>
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">Categories</h2>
          <button 
            onClick={onCloseMobile}
            className="text-gray-500 hover:text-primary"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>
        <div className="py-4 h-[calc(100%-65px)] overflow-y-auto">
          <nav>
            {isLoading ? (
              <div className="py-6 px-6">
                <div className="space-y-4">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center">
                      <div className="w-6 h-6 bg-gray-200 rounded-full mr-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ul>
                {categories.map((category) => {
                  const formattedCategoryName = formatCategoryNameForUrl(category.name);
                  return (
                    <li key={category.id}>
                      <Link
                        to={`/products?category=${formattedCategoryName}`}
                        prefetch="intent"
                        preventScrollReset
                        data-category-link={formattedCategoryName}
                        className={cn(
                          "flex items-center px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer",
                          activeCategory === formattedCategoryName && "bg-primary-50 text-primary border-r-4 border-primary"
                        )}
                        onClick={onCloseMobile}
                      >
                        <span className="mr-3 text-primary">
                          {renderCategoryImage(category)}
                        </span>
                        <span>{category.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
        </div>
      </aside>
      
      {/* Overlay when mobile sidebar is open */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
    </>
  );
} 