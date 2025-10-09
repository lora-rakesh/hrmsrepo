import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content - Fixed positioning to avoid sidebar space issues */}
        <main className={`
          flex-1 min-h-screen transition-all duration-300
          w-full
          ${sidebarOpen && isMobile ? 'translate-x-64' : 'translate-x-0'}
          lg:translate-x-0
        `}>
          <div className={`
            p-4 sm:p-6 lg:p-8
            ${sidebarOpen && isMobile ? 'opacity-50 lg:opacity-100' : 'opacity-100'}
            transition-opacity duration-300
          `}>
            {/* Mobile padding top for fixed navbar */}
            <div className="pt-16 lg:pt-6"></div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}