'use client';
import '../globals.css';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const navigationItems = [
  {
    href: '/dashboard/orders',
    icon: '📋',
    label: 'Order Management',
    description: 'Manage orders and payments'
  },
  {
    href: '/dashboard/daily-report',
    icon: '📑',
    label: 'Daily Report',
    description: 'Generate & export daily report card'
  },
  {
    href: '/dashboard/overview',
    icon: '📊',
    label: 'Overview',
    description: 'General analytics overview'
  },
  {
    href: '/dashboard/cod',
    icon: '💵',
    label: 'Cash on Delivery',
    description: 'Manage COD orders & deliveries'
  },
  {
    href: '/dashboard/sales',
    icon: '💰',
    label: 'Sales Analytics',
    description: 'Sales performance metrics'
  },
  {
    href: '/dashboard/products',
    icon: '📦',
    label: 'Product Analytics',
    description: 'Product performance data'
  },
  {
    href: '/dashboard/customers',
    icon: '👥',
    label: 'Customer Analytics',
    description: 'Customer insights and data'
  },
  {
    href: '/dashboard/shipping',
    icon: '🚚',
    label: 'Shipping Analytics',
    description: 'Shipping and logistics data'
  }
];

const AdminSidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/dashboard/orders') {
      return pathname === '/dashboard/orders' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling on body when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 
        w-80 sm:w-84 max-w-[88vw] bg-white shadow-2xl lg:shadow-none border-r border-gray-200
        transform transition-transform duration-300 ease-in-out flex flex-col flex-shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-2">
            <Link 
              href="/dashboard/orders" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0 flex-1 overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-gray-200 group-hover:scale-105 transition-transform bg-black flex items-center justify-center">
                <Image
                  src="/talogo.png"
                  alt="Traditional Alley Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="block text-sm sm:text-base font-bold text-gray-900 group-hover:text-red-700 transition-colors truncate leading-tight">
                  Traditional Alley
                </span>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate mt-0.5">Admin Dashboard</p>
              </div>
            </Link>
            
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1.5 overflow-y-auto overscroll-contain">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  group flex items-center p-3 rounded-xl transition-all duration-200
                  ${active
                    ? 'bg-red-50 text-red-900 border border-red-200 shadow-xs font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }
                `}
              >
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg transition-transform group-hover:scale-110
                  ${active ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}
                `}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate leading-tight">
                    {item.label}
                  </span>
                  <p className="text-xs text-gray-500 truncate hidden sm:block mt-0.5">
                    {item.description}
                  </p>
                </div>
                {active && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50/80 pb-16 lg:pb-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:text-red-700 hover:border-red-200 transition-colors shadow-xs mb-2.5"
          >
            <span className="flex items-center space-x-2">
              <span>🌐</span>
              <span>View Live Website</span>
            </span>
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 min-w-0">
            <span className="truncate">Traditional Alley Admin</span>
            <span className="flex-shrink-0 ml-1">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default function AdminLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Find active navigation item title for mobile header
  const currentItem = navigationItems.find(item => 
    pathname.startsWith(item.href) || (item.href === '/dashboard/orders' && pathname === '/dashboard')
  );
  const pageTitle = currentItem?.label || 'Order Management';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-4 py-2 flex items-center justify-between shadow-xs gap-2">
        <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 flex-1 overflow-hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Admin Menu"
            className="p-2 -ml-1 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link href="/dashboard/orders" className="flex items-center space-x-2 min-w-0 overflow-hidden group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 shadow-xs border border-gray-200 group-hover:scale-105 transition-transform bg-black flex items-center justify-center">
              <Image
                src="/talogo.png"
                alt="TA Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex items-center space-x-1.5 overflow-hidden">
              <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                Traditional Alley
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                Admin
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg flex items-center space-x-1 font-medium transition-colors"
          >
            <span>Store</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Admin Sidebar with Drawer */}
      <AdminSidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}