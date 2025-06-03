import { PropsWithChildren, useState } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { Footer } from "./footer";
import { Menu } from "lucide-react";

interface LayoutProps extends PropsWithChildren {
  showSidebar?: boolean;
  showFooter?: boolean;
}

export function Layout({ 
  children, 
  showSidebar = true,
  showFooter = true 
}: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Fixed navbar at top */}
      <Navbar />
      
      {/* Content area with fixed sidebar and scrollable main content */}
      <div className="flex flex-1 relative">
        {/* Mobile sidebar toggle button */}
        {showSidebar && (
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden fixed bottom-4 left-4 z-30 bg-primary text-white p-3 rounded-full shadow-lg"
            aria-label="Toggle categories"
          >
            <Menu size={24} />
          </button>
        )}
        
        {/* Desktop sidebar - position fixed on large screens */}
        {showSidebar && (
          <Sidebar 
            className="lg:fixed lg:top-[61px] lg:h-[calc(100vh-61px)]"
            isMobileOpen={isMobileSidebarOpen} 
            onCloseMobile={closeMobileSidebar} 
          />
        )}
        
        {/* Main content - offset by sidebar width on desktop */}
        <main className={`w-full overflow-y-auto ${showSidebar ? 'lg:ml-64' : ''}`}>
          <div className="container mx-auto max-w-7xl p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer at bottom */}
      {showFooter && (
        <div className={showSidebar ? 'lg:ml-64' : ''}>
          <Footer />
        </div>
      )}
    </div>
  );
} 