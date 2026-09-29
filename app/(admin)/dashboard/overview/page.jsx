'use client'
import '../../../globals.css'
import React, { useState, useEffect } from "react";
import OverviewCards from "../../../../components/analytics/OverviewCards";
import ErrorBoundary from "../../../../components/analytics/ErrorBoundary";
import ClientOnly from "../../../../components/analytics/ClientOnly";
import DateFilter from "../../../../components/analytics/DateFilter";
import CacheProvider, { useCache } from "../../../../components/analytics/CacheProvider";
import { getDateRange } from "../../../../lib/date-utils";
import Link from "next/link";

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

const OverviewContent = () => {
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
      <div className="bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2.5 sm:space-x-4">
                <Link 
                  href="/dashboard" 
                  aria-label="Back to Dashboard"
                  className="p-1.5 -ml-1 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center truncate">
                    <span className="text-xl sm:text-2xl mr-2 flex-shrink-0">📊</span>
                    <span className="truncate">Overview Analytics</span>
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm text-gray-500 truncate">
                    Complete business overview and key metrics
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
              <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
                Real-time Data
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
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
              >
                <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
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
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                </div>
              </div>
            }
          >
            <ErrorBoundary>
              <div className="animate-fadeIn">
                <OverviewCards tabId="overview" dateFilter={dateRange} />
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

const OverviewAnalyticsPage = () => {
  return (
    <CacheProvider>
      <OverviewContent />
    </CacheProvider>
  );
};

export default OverviewAnalyticsPage;