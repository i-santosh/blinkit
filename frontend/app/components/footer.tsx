import { Link } from "@remix-run/react";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="flex items-center">
              <h2 className="text-xl md:text-2xl font-bold text-primary">blinkit</h2>
            </Link>
            <p className="mt-3 md:mt-4 text-gray-700 text-xs md:text-sm">
              Grocery delivery in 10 minutes. Order fruits, vegetables, dairy, household essentials and more at the comfort of your home.
            </p>
            <div className="mt-4 md:mt-6 flex space-x-4">
              <a href="#" className="text-gray-700 hover:text-primary">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-700 hover:text-primary">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-700 hover:text-primary">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-black mb-2 md:mb-4">Categories</h3>
            <ul className="space-y-1 md:space-y-2">
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Vegetables & Fruits</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Dairy & Breakfast</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Snacks & Munchies</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Bakery & Biscuits</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Beverages</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Home & Kitchen</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-black mb-2 md:mb-4">Company</h3>
            <ul className="space-y-1 md:space-y-2">
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">About Us</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Careers</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Blog</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Press</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Partner with us</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-black mb-2 md:mb-4">Legal</h3>
            <ul className="space-y-1 md:space-y-2">
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Terms & Conditions</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Privacy Policy</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Refund Policy</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Delivery Policy</Link></li>
              <li><Link to="#" className="text-gray-700 hover:text-primary text-xs md:text-sm">Responsible Disclosure</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 md:mt-8 lg:mt-12 pt-4 md:pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs md:text-sm text-gray-700">
              © {new Date().getFullYear()} Blinkit. All rights reserved.
            </p>
            <div className="mt-2 sm:mt-0">
              <p className="text-xs md:text-sm text-gray-700">
                Made with ❤️ in India
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 