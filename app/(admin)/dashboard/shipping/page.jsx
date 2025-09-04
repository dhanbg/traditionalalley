'use client'
import '../../../globals.css'
import React, { useState, useEffect } from "react";
import ShippingAnalytics from "../../../../components/analytics/ShippingAnalytics";
import ErrorBoundary from "../../../../components/analytics/ErrorBoundary";
import ClientOnly from "../../../../components/analytics/ClientOnly";
import DateFilter from "../../../../components/analytics/DateFilter";
import CacheProvider, { useCache } from "../../../../components/analytics/CacheProvider";
import { getDateRange } from "../../../../lib/date-utils";
import Link from "next/link";

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6">
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

const ShippingContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Use cache context
  const { clearCache } = useCache();
  
  // Get the actual date range for filtering
  const dateRange = getDateRange(dateFilter, customStartDate, customEndDate);

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCustomDateChange = (field, value) => {
    if (field === 'start') {
      setCustomStartDate(value);
    } else if (field === 'end') {
      setCustomEndDate(value);
    }
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
        
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent flex items-center">
                    <span className="text-2xl mr-2">🚚</span>
                    Shipping Analytics
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">
                    Delivery performance, shipping costs, and logistics insights
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                Shipping Data
              </div>
              <button
                onClick={async () => {
                  setRefreshing(true);
                  clearCache();
                  setTimeout(() => {
                    setRefreshing(false);
                    window.location.reload();
                  }, 500);
                }}
                disabled={refreshing}
                className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`w-4 h-4 transition-transform duration-500 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Date Filter */}
        <div className="mb-6 transform transition-all duration-500 hover:scale-[1.01]">
          <DateFilter 
            selectedFilter={dateFilter}
            onFilterChange={setDateFilter}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomDateChange={handleCustomDateChange}
          />
        </div>

        {/* Content */}
        <div className="transition-all duration-500 ease-in-out transform">
          <ClientOnly 
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent absolute top-0 left-0"></div>
                </div>
              </div>
            }
          >
            <ErrorBoundary>
              <div className="animate-fadeIn">
                <ShippingAnalytics tabId="shipping" dateFilter={dateRange} />
              </div>
            </ErrorBoundary>
          </ClientOnly>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

const ShippingAnalyticsPage = () => {
  return (
    <CacheProvider>
      <ShippingContent />
    </CacheProvider>
  );
};

export default ShippingAnalyticsPage;