'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

const AdminSidebar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      href: '/dashboard',
      icon: '🏠',
      label: 'Dashboard Home',
      description: 'Main dashboard overview'
    },
    {
      href: '/dashboard/overview',
      icon: '📊',
      label: 'Overview',
      description: 'General analytics overview'
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
    },
    {
      href: '/dashboard/orders',
      icon: '📋',
      label: 'Order Management',
      description: 'Manage orders and payments'
    }
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white shadow-xl border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600 mt-1">Traditional Alley</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  group flex items-start p-4 rounded-xl transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                    : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                  }
                `}
              >
                <div className="flex-shrink-0 mr-4">
                  <span className={`
                    text-2xl transition-transform duration-200 group-hover:scale-110
                    ${isActive(item.href) ? 'filter drop-shadow-sm' : ''}
                  `}>
                    {item.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    font-semibold text-sm transition-colors
                    ${isActive(item.href) ? 'text-blue-900' : 'text-gray-900 group-hover:text-gray-700'}
                  `}>
                    {item.label}
                  </h3>
                  <p className={`
                    text-xs mt-1 transition-colors
                    ${isActive(item.href) ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-600'}
                  `}>
                    {item.description}
                  </p>
                </div>
                {isActive(item.href) && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Admin Dashboard</span>
              <span>v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:ml-0">
          <div className="lg:pl-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}