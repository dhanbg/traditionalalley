'use client'
import '../../globals.css'
import React, { useState, useEffect } from "react";
import SalesAnalytics from "../../../components/analytics/SalesAnalytics";
import ProductAnalytics from "../../../components/analytics/ProductAnalytics";
import CustomerAnalytics from "../../../components/analytics/CustomerAnalytics";
import ShippingAnalytics from "../../../components/analytics/ShippingAnalytics";
import OverviewCards from "../../../components/analytics/OverviewCards";
import ErrorBoundary from "../../../components/analytics/ErrorBoundary";
import ClientOnly from "../../../components/analytics/ClientOnly";
import DateFilter from "../../../components/analytics/DateFilter";
import CacheProvider, { useCache } from "../../../components/analytics/CacheProvider";
import { getDateRange } from "../../../lib/date-utils";

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6">
    {/* Header skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Chart skeletons */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="flex items-center space-x-3">
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 h-3 bg-gray-200 rounded"></div>
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Tab Content Wrapper with Smooth Transitions
const TabContentWrapper = ({ children, isActive }) => (
  <div className={`transition-all duration-500 ease-in-out ${
    isActive 
      ? 'opacity-100 translate-y-0 scale-100' 
      : 'opacity-0 translate-y-4 scale-95 pointer-events-none absolute'
  }`}>
    {children}
  </div>
);

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Use cache context
  const { clearCache, getCacheInfo } = useCache();
  
  // Get the actual date range for filtering
  const dateRange = getDateRange(dateFilter, customStartDate, customEndDate);

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCustomDateChange = (field, value) => {
    if (field === 'start') {
      setCustomStartDate(value);
    } else if (field === 'end') {
      setCustomEndDate(value);
    }
  };

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    
    setIsTabChanging(true);
    
    // Smooth tab transition
    setTimeout(() => {
      setActiveTab(tabId);
      setIsMobileMenuOpen(false);
      
      setTimeout(() => {
        setIsTabChanging(false);
      }, 100);
    }, 150);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊', color: 'blue' },
    { id: 'sales', name: 'Sales Analytics', icon: '💰', color: 'green' },
    { id: 'products', name: 'Product Analytics', icon: '📦', color: 'purple' },
    { id: 'customers', name: 'Customer Analytics', icon: '👥', color: 'orange' },
    { id: 'shipping', name: 'Shipping Analytics', icon: '🚚', color: 'red' }
  ];

  const renderTabContent = (tabId) => {
    switch(tabId) {
      case 'overview':
        return <OverviewCards tabId="overview" dateFilter={dateRange} />;
      case 'sales':
        return <SalesAnalytics tabId="sales" dateFilter={dateRange} />;
      case 'products':
        return <ProductAnalytics tabId="products" dateFilter={dateRange} />;
      case 'customers':
        return <CustomerAnalytics tabId="customers" dateFilter={dateRange} />;
      case 'shipping':
        return <ShippingAnalytics tabId="shipping" dateFilter={dateRange} />;
      default:
        return <OverviewCards tabId="overview" dateFilter={dateRange} />;
    }
  };

  const getTabColorClasses = (tab, isActive) => {
    const colors = {
      blue: isActive 
        ? 'border-blue-500 text-blue-600 bg-blue-50' 
        : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300',
      green: isActive 
        ? 'border-green-500 text-green-600 bg-green-50' 
        : 'border-transparent text-gray-500 hover:text-green-600 hover:border-green-300',
      purple: isActive 
        ? 'border-purple-500 text-purple-600 bg-purple-50' 
        : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300',
      orange: isActive 
        ? 'border-orange-500 text-orange-600 bg-orange-50' 
        : 'border-transparent text-gray-500 hover:text-orange-600 hover:border-orange-300',
      red: isActive 
        ? 'border-red-500 text-red-600 bg-red-50' 
        : 'border-transparent text-gray-500 hover:text-red-600 hover:border-red-300'
    };
    return colors[tab.color] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
              </div>

        {/* Tabs Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded w-24 my-4"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with enhanced styling */}
      <div className="bg-white shadow-lg backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Traditional Alley Analytics
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Real-time business analytics and insights
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Real-time Analytics
              </div>
              <button
                onClick={async () => {
                  setRefreshing(true);
                  clearCache(); // Clear all cached data
                  // Small delay to show refresh animation
                  setTimeout(() => {
                    setRefreshing(false);
                    window.location.reload();
                  }, 500);
                }}
                disabled={refreshing}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`w-4 h-4 transition-transform duration-500 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              {/* Mobile menu button with animation */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                <svg className={`h-6 w-6 transform transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu with smooth animation */}
      <div className={`sm:hidden bg-white border-b border-gray-200 transition-all duration-300 ease-in-out ${
        isMobileMenuOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-4 py-2 space-y-1">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`${getTabColorClasses(tab, activeTab === tab.id)} w-full text-left px-4 py-3 text-sm font-medium flex items-center space-x-3 transition-all duration-200 rounded-lg transform hover:scale-[1.02]`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animation: isMobileMenuOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
              }}
            >
              <span className="text-lg transform transition-transform duration-200 hover:scale-110">{tab.icon}</span>
              <span>{tab.name}</span>
              {activeTab === tab.id && (
                <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
              </div>

      {/* Desktop Navigation Tabs with enhanced styling */}
      <div className="hidden sm:block bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`${getTabColorClasses(tab, activeTab === tab.id)} whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-300 flex-shrink-0 rounded-t-lg transform hover:scale-105 relative group`}
              >
                <span className="text-lg transform transition-transform duration-200 group-hover:scale-110">{tab.icon}</span>
                <span className="hidden md:inline">{tab.name}</span>
                <span className="md:hidden">{tab.name.split(' ')[0]}</span>
                
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-current rounded-full animate-pulse"></div>
                )}
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-5 rounded-t-lg transition-opacity duration-200"></div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content with smooth transitions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Date Filter with animation */}
        <div className="mb-6 transform transition-all duration-500 hover:scale-[1.01]">
          <DateFilter 
            selectedFilter={dateFilter}
            onFilterChange={setDateFilter}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomDateChange={handleCustomDateChange}
                />
              </div>

        {/* Tab Content with smooth transitions */}
        <div className="relative">
          {isTabChanging ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : (
            <div className="transition-all duration-500 ease-in-out transform">
              <ClientOnly 
                fallback={
                  <div className="flex justify-center items-center h-64">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                    </div>
                  </div>
                }
              >
                <ErrorBoundary>
                  <div className="animate-fadeIn">
                    {renderTabContent(activeTab)}
              </div>
                </ErrorBoundary>
              </ClientOnly>
              </div>
          )}
          </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

const AnalyticsDashboard = () => {
  return (
    <CacheProvider>
      <DashboardContent />
    </CacheProvider>
  );
};

export default AnalyticsDashboard;
