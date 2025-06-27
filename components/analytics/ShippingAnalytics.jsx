'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAnalyticsData, safeGet, handleApiError } from '../../lib/api-utils';
import { filterPaymentsByDate } from '../../lib/date-utils';
import useCachedData from '../../hooks/useCachedData';

const ShippingAnalytics = ({ tabId, dateFilter }) => {
  const fetchShippingData = useCallback(async () => {
    if (typeof window === 'undefined') {
      throw new Error('Component must run on client side');
    }

      const data = await fetchAnalyticsData(['userBags', 'carts']);
      
      const userBagsData = data.userBags || [];
      const cartsData = data.carts || [];

      // Filter data by date if dateFilter is provided
      let filteredUserBags = userBagsData;
      if (dateFilter && dateFilter.start && dateFilter.end) {
        filteredUserBags = userBagsData.filter(bag => {
          const bagDate = new Date(safeGet(bag, 'createdAt', ''));
          return bagDate >= dateFilter.start && bagDate <= dateFilter.end;
        });
      }

      const totalShipments = filteredUserBags.length;
      
      // Calculate delivery metrics
      const deliveredOrders = filteredUserBags.filter(bag => 
        safeGet(bag, 'shipping_status', '') === 'delivered'
      ).length;

      const pendingShipments = filteredUserBags.filter(bag => 
        ['pending', 'shipped', 'in_transit'].includes(safeGet(bag, 'shipping_status', ''))
      ).length;

      // Shipping methods breakdown
      const shippingMethods = {};
      filteredUserBags.forEach(bag => {
        const method = safeGet(bag, 'shipping_method', 'Standard');
        shippingMethods[method] = (shippingMethods[method] || 0) + 1;
      });

      // Regional breakdown (mock data for now)
      const regionalBreakdown = {
        'Kathmandu': Math.floor(totalShipments * 0.4),
        'Pokhara': Math.floor(totalShipments * 0.2),
        'Chitwan': Math.floor(totalShipments * 0.15),
        'Lalitpur': Math.floor(totalShipments * 0.15),
        'Others': Math.floor(totalShipments * 0.1)
      };

      return {
        totalShipments,
        deliveredOrders,
        pendingShipments,
        averageDeliveryTime: 3.5, // Mock average
        shippingMethods,
        regionalBreakdown
      };
  }, [dateFilter]);

  // Use cached data hook
  const { data: shippingData, loading, error, isFromCache } = useCachedData(
    tabId,
    dateFilter,
    fetchShippingData
  );

  // Provide default values if data is not yet loaded
  const {
    totalShipments = 0,
    deliveredOrders = 0,
    pendingShipments = 0,
    averageDeliveryTime = 0,
    shippingMethods = {},
    regionalBreakdown = {}
  } = shippingData || {};

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Animated Header */}
        <div className="bg-gradient-to-r from-red-50 to-pink-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gradient-to-r from-red-300 to-pink-400 rounded-lg w-52 mb-2 animate-pulse"></div>
              <div className="h-4 bg-red-200 rounded w-44 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <div className="text-sm text-red-600 bg-white px-3 py-1 rounded-full animate-pulse">
                Tracking shipments...
              </div>
            </div>
          </div>
        </div>

        {/* Animated Shipping Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { color: 'blue', icon: '📦', label: 'Total Shipments', delay: '0ms' },
            { color: 'green', icon: '✅', label: 'Delivered', delay: '100ms' },
            { color: 'yellow', icon: '🚚', label: 'Pending', delay: '200ms' },
            { color: 'purple', icon: '⏱️', label: 'Avg Delivery', delay: '300ms' }
          ].map((item, i) => (
            <div 
              key={i} 
              className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 p-4 lg:p-6 rounded-xl shadow-sm border border-${item.color}-200 animate-pulse`}
              style={{ animationDelay: item.delay }}
            >
              <div className="flex items-center">
                <div className={`p-2 bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 rounded-lg animate-bounce`}>
                  <span className="text-white text-xl">{item.icon}</span>
                </div>
                <div className="ml-3 flex-1">
                  <div className={`h-3 bg-${item.color}-200 rounded w-20 mb-2`}></div>
                  <div className={`h-5 bg-${item.color}-300 rounded w-12`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Animated Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipping Methods Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg animate-spin flex items-center justify-center">
                <span className="text-blue-500">🚛</span>
              </div>
            </div>
            <div className="space-y-4">
              {['DHL Express', 'Standard', 'Same Day'].map((method, i) => (
                <div key={method} className="animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 bg-${['blue', 'green', 'purple'][i]}-400 rounded-full mr-3`}></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 bg-gray-200 rounded w-8"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-${['blue', 'green', 'purple'][i]}-400 to-${['blue', 'green', 'purple'][i]}-500 rounded-full`}
                          style={{ 
                            width: `${70 - i * 15}%`, 
                            animation: `moveProgress 2s ease-in-out infinite ${i * 0.3}s` 
                          }}
                        ></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-8"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Distribution Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-44 animate-pulse"></div>
              <div className="w-8 h-8 bg-red-100 rounded-lg animate-bounce flex items-center justify-center">
                <span className="text-red-500">🗺️</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { city: 'Kathmandu', width: '60%', color: 'red' },
                { city: 'Pokhara', width: '40%', color: 'blue' },
                { city: 'Chitwan', width: '30%', color: 'green' },
                { city: 'Lalitpur', width: '25%', color: 'yellow' },
                { city: 'Others', width: '15%', color: 'purple' }
              ].map((item, i) => (
                <div key={item.city} className="animate-pulse" style={{ animationDelay: `${i * 120}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 bg-${item.color}-400 rounded-full mr-3`}></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 bg-gray-200 rounded w-8"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 rounded-full`}
                          style={{ 
                            width: item.width, 
                            animation: `moveProgress 2.3s ease-in-out infinite ${i * 0.4}s` 
                          }}
                        ></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-8"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated Delivery Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Delivery Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="w-8 h-8 bg-green-100 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-green-500">📊</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'On Time', percent: '85%', color: 'green' },
                { label: 'Delayed', percent: '12%', color: 'yellow' },
                { label: 'Failed', percent: '3%', color: 'red' }
              ].map((item, i) => (
                <div key={item.label} className="flex items-center justify-between animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 bg-${item.color}-400 rounded-full mr-3 animate-pulse`}></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>

          {/* DHL Integration */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-28 animate-pulse"></div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg animate-spin flex items-center justify-center">
                <span className="text-yellow-500">📦</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-yellow-200 rounded-full mx-auto mb-3 animate-bounce flex items-center justify-center">
                  <span className="text-2xl">🚛</span>
                </div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-28 animate-pulse"></div>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-indigo-500">💰</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { metric: 'Avg Cost', value: '₹150' },
                { metric: 'Total Spent', value: '₹12,500' },
                { metric: 'Cost/Order', value: '₹85' }
              ].map((item, i) => (
                <div key={item.metric} className="flex justify-between animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Loading Animations */}
        <style jsx>{`
          @keyframes moveProgress {
            0% { transform: translateX(-100%); opacity: 0.6; }
            50% { transform: translateX(0%); opacity: 1; }
            100% { transform: translateX(100%); opacity: 0.6; }
          }
          
          @keyframes truck {
            0% { transform: translateX(-50px) rotate(-5deg); }
            50% { transform: translateX(0px) rotate(0deg); }
            100% { transform: translateX(50px) rotate(5deg); }
          }
          
          @keyframes delivery {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          .animate-truck {
            animation: truck 3s ease-in-out infinite;
          }
          
          .animate-delivery {
            animation: delivery 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="text-red-600 text-xl sm:text-2xl mb-2 sm:mb-0 sm:mr-3">⚠️</span>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-red-800">Error Loading Shipping Data</h3>
            <p className="text-sm sm:text-base text-red-600 mt-1">{error.message || error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">


      {/* Shipping Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-lg sm:text-xl">📦</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Shipments</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{totalShipments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-lg sm:text-xl">✅</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Delivered</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{deliveredOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-lg sm:text-xl">🚚</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{pendingShipments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-lg sm:text-xl">⏱️</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Avg. Delivery</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{averageDeliveryTime} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Shipping Methods */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Shipping Methods</h3>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(shippingMethods).map(([method, count], index) => {
              const total = Object.values(shippingMethods).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
              
              return (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2 sm:mr-3 flex-shrink-0`}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{method}</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="text-xs sm:text-sm text-gray-600">{count}</span>
                    <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Regional Distribution</h3>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(regionalBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([region, count], index) => {
                const total = Object.values(regionalBreakdown).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                
                return (
                  <div key={region} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2 sm:mr-3 flex-shrink-0`}></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{region}</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-xs sm:text-sm text-gray-600">{count}</span>
                      <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${colors[index % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingAnalytics; 