import { Link } from "@remix-run/react";

export function OffersSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-black border-b-2 border-primary pb-1">Today's Offers</h2>
          <Link to="/app/offers" className="text-primary font-medium text-sm">View All</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-400 shadow-sm">
            <h3 className="text-xl font-bold text-black mb-2">50% OFF</h3>
            <p className="text-gray-900 mb-3 font-medium">On first order above ₹199</p>
            <p className="text-xs font-bold bg-secondary text-black inline-block px-3 py-1.5 rounded">
              Use code: FIRST50
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6 border-2 border-green-400 shadow-sm">
            <h3 className="text-xl font-bold text-black mb-2">Free Delivery</h3>
            <p className="text-gray-900 mb-3 font-medium">On orders above ₹99</p>
            <p className="text-xs font-bold bg-primary text-white inline-block px-3 py-1.5 rounded">
              No code needed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 