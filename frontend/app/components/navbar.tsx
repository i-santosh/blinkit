import { Link, useNavigate } from "@remix-run/react";
import { Search, User, MapPin, LogIn, ChevronDown, LogOut } from "lucide-react";
import { CartButton } from "./cart-button";
import { useState, useEffect } from "react";
import apiClient from "~/lib/client-axios";
import useUserProfileStore from "~/store/userProfileStore";
import { getAccessTokenCookie } from "../../utils/token/get-token";
import { clearTokens } from "../../utils/token/get-token";

export function Navbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { userProfile, setUserProfile } = useUserProfileStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Function to fetch and set user profile data
  const getAndSetProfileData = async () => {
    try {
      const response = (await apiClient.get('/accounts/profile/')).data;
      if (!response.success) return;

      const userData = response.data;

      if (userData) {
        if (userData.email_verified === false) {
          navigate(`/verify-email?email=${userData.email}`);
        }

        setUserProfile(userData);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // User is not logged in or token is invalid
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setUserProfile(null);
    setIsLoggedIn(false);
    navigate("/signin");
  };

  // Check if user is logged in on component mount
  useEffect(() => {
    const accessToken = getAccessTokenCookie();
    if (accessToken) {
      getAndSetProfileData();
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">blinkit</h1>
            </Link>
          </div>
          
          {/* Location */}
          <button className="hidden md:flex items-center text-sm font-medium gap-1 hover:text-primary transition-colors text-gray-800 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
            <MapPin size={18} className="text-primary" />
            <span className="font-medium">Deliver to: </span>
            <span className="font-bold underline">Mumbai 400001</span>
            <ChevronDown size={14} className="ml-1" />
          </button>
          
          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-600" />
            </div>
            <input
              type="text"
              placeholder="Search for products"
              className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
          
          {/* User actions */}
          <div className="flex items-center gap-4">
            {/* Login / Account Button */}
            {isLoggedIn && userProfile ? (
              <div className="hidden md:block relative">
                <button 
                  className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-primary transition-colors px-3 py-1.5 rounded-md border border-gray-300 hover:border-primary shadow-sm hover:shadow"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User size={16} className="text-primary" />
                  <span>{userProfile.full_name}</span>
                  <ChevronDown size={14} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link 
                  to="/signin" 
                  className="text-sm font-medium text-gray-800 hover:text-primary transition-colors px-3 py-1.5 rounded-md border border-gray-300 hover:border-primary flex items-center gap-1 shadow-sm hover:shadow"
                >
                  <LogIn size={16} className="text-primary" />
                  <span>Sign in</span>
                </Link>
                <Link 
                  to="/signup" 
                  className="text-sm font-medium text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all px-3 py-1.5 rounded-md shadow-sm hover:shadow flex items-center gap-1"
                >
                  <User size={16} />
                  <span>Sign up</span>
                </Link>
              </div>
            )}
            
            {/* Mobile Login */}
            {isLoggedIn && userProfile ? (
              <div className="md:hidden relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center gap-1 text-sm font-medium hover:text-primary transition-colors text-gray-800 bg-gray-50 p-2 rounded-md border border-gray-200"
                >
                  <User size={20} className="text-primary" />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm font-medium text-gray-800 border-b border-gray-200">
                        {userProfile.full_name}
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/signin" className="md:hidden flex items-center justify-center gap-1 text-sm font-medium hover:text-primary transition-colors text-gray-800 bg-gray-50 p-2 rounded-md border border-gray-200">
                <User size={20} />
              </Link>
            )}
            
            {/* Cart Button */}
            <CartButton />
          </div>
        </div>
      </div>
      
      {/* Mobile Search */}
      <div className="block md:hidden px-4 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-600" />
          </div>
          <input
            type="text"
            placeholder="Search for products"
            className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
      </div>
      
      {/* Mobile Location */}
      <div className="block md:hidden px-4 pb-3">
        <button className="flex items-center w-full text-sm font-medium gap-1 hover:text-primary transition-colors text-gray-800 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
          <MapPin size={18} className="text-primary" />
          <span className="font-medium">Deliver to: </span>
          <span className="font-bold underline">Mumbai 400001</span>
          <ChevronDown size={14} className="ml-1" />
        </button>
      </div>
    </header>
  );
} 