import { Smartphone } from "lucide-react";

export function DownloadApp() {
  return (
    <section className="py-12 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-black border-b-2 border-primary pb-1 inline-block">Download the Blinkit App</h2>
            <p className="mt-4 text-gray-800 text-base">
              Get groceries delivered in minutes. Order fruits, vegetables, dairy, essentials and more with the tap of a button.
            </p>
            
            <div className="mt-6 flex space-x-4">
              <a href="#" className="inline-block">
                <img src="https://blinkit.com/asset/web/images/apple-store-logo.png" alt="App Store" className="h-10" />
              </a>
              <a href="#" className="inline-block">
                <img src="https://blinkit.com/asset/web/images/google-store-logo.png" alt="Google Play" className="h-10" />
              </a>
            </div>
            
            <div className="mt-8">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-primary" />
                <span className="text-sm font-medium text-gray-800">Get the app</span>
              </div>
              <div className="mt-2 flex gap-3">
                <input
                  type="text"
                  placeholder="Enter phone number"
                  className="flex-1 py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="bg-primary text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-primary/90">
                  Send
                </button>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 max-w-md">
            <img 
              src="https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=50,metadata=none,w=720/assets/web/landing-page/blinkit-app-mock.png"
              alt="Blinkit App"
              className="w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
} 