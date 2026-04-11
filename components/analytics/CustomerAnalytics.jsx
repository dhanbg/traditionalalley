'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAnalyticsData, safeGet, handleApiError } from '../../lib/api-utils';
import { filterPaymentsByDate } from '../../lib/date-utils';
import useCachedData from '../../hooks/useCachedData';

const CustomerAnalytics = ({ tabId, dateFilter }) => {
  const [expandedCountry, setExpandedCountry] = useState(null);

  const fetchCustomerData = useCallback(async () => {
    if (typeof window === 'undefined') {
      throw new Error('Component must run on client side');
    }

      const data = await fetchAnalyticsData(['userData', 'userBags', 'customerReviews', 'products']);
      
      const usersData = data.userData || [];
      const userBagsData = data.userBags || [];
      const reviewsData = data.customerReviews || [];
      const productsData = data.products || [];

      // Create product mapping for reviews
      const productMap = {};
      productsData.forEach(product => {
        const documentId = safeGet(product, 'documentId', null);
        const title = safeGet(product, 'title', 'Unknown Product');
        if (documentId) {
          productMap[documentId] = title;
        }
      });

      // Filter customers by join date if date filter is applied
      const filteredCustomers = dateFilter && dateFilter.start && dateFilter.end
        ? usersData.filter(user => {
            const userDate = new Date(safeGet(user, 'createdAt', ''));
            return userDate >= dateFilter.start && userDate <= dateFilter.end;
          })
        : usersData;

      const totalCustomers = filteredCustomers.length;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newCustomersThisMonth = filteredCustomers.filter(user => {
        const createdDate = new Date(safeGet(user, 'createdAt', ''));
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }).length;

      // Create a mapping from user-bag to actual user data (real account holders)
      const userBagToUserMap = {};
      userBagsData.forEach(userBag => {
        const userDatum = safeGet(userBag, 'user_datum', null);
        if (userDatum) {
          userBagToUserMap[safeGet(userBag, 'documentId', '')] = {
            clerkUserId: safeGet(userDatum, 'clerkUserId', ''),
            firstName: safeGet(userDatum, 'firstName', 'Unknown'),
            lastName: safeGet(userDatum, 'lastName', ''),
            email: safeGet(userDatum, 'email', 'Email not available'),
          };
        }
      });

      // Calculate real customer metrics from successful payments using actual account holders
      const customerPayments = {};
      const customerOrderCounts = {};
      const locationData = {};
      const locationDetails = {};
      
      userBagsData.forEach(userBag => {
        const userOrders = safeGet(userBag, 'user_orders', {});
        const payments = safeGet(userOrders, 'payments', []);
        const userBagDocumentId = safeGet(userBag, 'documentId', '');
        const realUser = userBagToUserMap[userBagDocumentId];
        
        payments.forEach(payment => {
          if (safeGet(payment, 'status', '') === 'Success') {
            const orderData = safeGet(payment, 'orderData', {});
            const receiverDetails = safeGet(orderData, 'receiver_details', {});
            const amount = safeGet(payment, 'amount', 0);
            const address = safeGet(receiverDetails, 'address', {});
            const city = safeGet(address, 'city', 'Unknown City');
            const state = safeGet(address, 'state', 'Unknown State');
            const country = safeGet(address, 'country', 'Unknown Country');
            
            // Use real account holder information instead of checkout form data
            const customerKey = realUser 
              ? `${realUser.firstName} ${realUser.lastName}`.trim()
              : 'Unknown Customer';
            const customerClerkId = realUser ? realUser.clerkUserId : 'unknown';
            
            // Track customer payments by real account holder
            if (!customerPayments[customerKey]) {
              customerPayments[customerKey] = { 
                totalSpent: 0, 
                orderCount: 0,
                clerkUserId: customerClerkId,
                firstName: realUser?.firstName || 'Unknown',
                lastName: realUser?.lastName || '',
                email: realUser?.email || ''
              };
            }
            customerPayments[customerKey].totalSpent += amount;
            customerPayments[customerKey].orderCount += 1;
            
            // Track hierarchical location data
            // Country level
            locationData[country] = (locationData[country] || 0) + 1;
            
            // Detailed location breakdown
            if (!locationDetails[country]) {
              locationDetails[country] = {
                totalOrders: 0,
                cities: {},
                states: {}
              };
            }
            locationDetails[country].totalOrders += 1;
            
            // City level within country
            if (!locationDetails[country].cities[city]) {
              locationDetails[country].cities[city] = {
                orders: 0,
                state: state,
                customers: new Set()
              };
            }
            locationDetails[country].cities[city].orders += 1;
            locationDetails[country].cities[city].customers.add(customerKey);
            
            // State level within country
            if (state && state !== 'Unknown State') {
              locationDetails[country].states[state] = (locationDetails[country].states[state] || 0) + 1;
            }
          }
        });
      });

      // Convert customer sets to counts for serialization
      Object.keys(locationDetails).forEach(country => {
        Object.keys(locationDetails[country].cities).forEach(city => {
          locationDetails[country].cities[city].uniqueCustomers = locationDetails[country].cities[city].customers.size;
          delete locationDetails[country].cities[city].customers; // Remove Set object
        });
      });

      // Calculate top customers by total spending using real account holders
      const topCustomers = Object.entries(customerPayments)
        .sort(([,a], [,b]) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
        .map(([customerName, data]) => ({
          name: customerName,
          email: data.email || 'Email not available',
          clerkUserId: data.clerkUserId,
          firstName: data.firstName,
          lastName: data.lastName,
          orders: data.orderCount,
          totalSpent: data.totalSpent
        }));

      const totalOrders = Object.values(customerPayments).reduce((sum, customer) => sum + customer.orderCount, 0);
      const customerGrowthRate = totalCustomers > 0 ? (newCustomersThisMonth / totalCustomers) * 100 : 0;
      const averageOrdersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0;

      // Filter reviews by date if dateFilter is applied
      const filteredReviews = dateFilter && dateFilter.start && dateFilter.end
        ? reviewsData.filter(review => {
            const reviewDate = new Date(safeGet(review, 'createdAt', ''));
            return reviewDate >= dateFilter.start && reviewDate <= dateFilter.end;
          })
        : reviewsData;

      // Process real customer reviews
      const customerReviews = filteredReviews.slice(0, 5).map(review => {
        const productId = safeGet(review, 'product', {});
        const productDocumentId = safeGet(productId, 'documentId', null);
        const productName = productMap[productDocumentId] || 'Unknown Product';
        
        // Get customer name from user_data relation
        const userData = safeGet(review, 'user_data', []);
        const user = userData.length > 0 ? userData[0] : null;
        const customerName = user 
          ? `${safeGet(user, 'firstName', 'Unknown')} ${safeGet(user, 'lastName', '')}`.trim()
          : 'Anonymous';
        
        return {
          customerName,
          rating: safeGet(review, 'rating', 0),
          comment: safeGet(review, 'comments', 'No comment provided'), // 'comments' not 'review'
          date: safeGet(review, 'createdAt', ''),
          product: productName
        };
      });

      const totalReviews = filteredReviews.length;
      const averageRating = totalReviews > 0 
        ? filteredReviews.reduce((sum, review) => sum + safeGet(review, 'rating', 0), 0) / totalReviews
        : 0;

      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      filteredReviews.forEach(review => {
        const rating = safeGet(review, 'rating', 0);
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating]++;
        }
      });

      return {
        totalCustomers,
        newCustomersThisMonth,
        customerGrowthRate,
        averageOrdersPerCustomer,
        topCustomers,
        customersByLocation: locationData,
        locationDetails: locationDetails,
        customerReviews,
        reviewStats: {
          averageRating,
          totalReviews,
          ratingDistribution
        }
      };
  }, [dateFilter]);

  // Use cached data hook
  const { data: customerData, loading, error, isFromCache } = useCachedData(
    tabId,
    dateFilter,
    fetchCustomerData
  );

  // Provide default values if data is not yet loaded
  const {
    totalCustomers = 0,
    newCustomersThisMonth = 0,
    customerGrowthRate = 0,
    averageOrdersPerCustomer = 0,
    topCustomers = [],
    customersByLocation = {},
    locationDetails = {},
    customerReviews = [],
    reviewStats = {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {}
    }
  } = customerData || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount || 0);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ⭐
      </span>
    ));
  };

  const handleCountryClick = (countryName) => {
    setExpandedCountry(expandedCountry === countryName ? null : countryName);
  };

  const getCitiesForCountry = (countryName) => {
    const countryData = locationDetails[countryName];
    if (!countryData || !countryData.cities) return [];
    
    return Object.entries(countryData.cities)
      .sort(([,a], [,b]) => b.orders - a.orders)
      .map(([cityName, cityData]) => ({
        name: cityName,
        orders: cityData.orders,
        state: cityData.state,
        uniqueCustomers: cityData.uniqueCustomers
      }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Animated Header */}
        <div className="bg-gradient-to-r from-orange-50 to-red-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gradient-to-r from-orange-300 to-red-400 rounded-lg w-56 mb-2 animate-pulse"></div>
              <div className="h-4 bg-orange-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-2xl">👥</span>
              </div>
              <div className="text-sm text-orange-600 bg-white px-3 py-1 rounded-full animate-pulse">
                Analyzing customers...
              </div>
            </div>
          </div>
        </div>

        {/* Animated Customer Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { color: 'blue', icon: '👥', label: 'Total Customers', delay: '0ms' },
            { color: 'green', icon: '🆕', label: 'New This Month', delay: '100ms' },
            { color: 'purple', icon: '📈', label: 'Growth Rate', delay: '200ms' },
            { color: 'orange', icon: '🛒', label: 'Avg Orders', delay: '300ms' }
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
          {/* Customer Location Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-44 animate-pulse"></div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg animate-spin flex items-center justify-center">
                <span className="text-blue-500">🌍</span>
              </div>
            </div>
            <div className="space-y-3">
              {['Nepal', 'India', 'USA'].map((country, i) => (
                <div key={country} className="border border-gray-100 rounded-lg p-3 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-gray-400 mr-2">▶</div>
                      <div className={`w-3 h-3 bg-${['blue', 'green', 'purple'][i]}-400 rounded-full mr-3`}></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-${['blue', 'green', 'purple'][i]}-400 to-${['blue', 'green', 'purple'][i]}-500 rounded-full`}
                          style={{ width: `${80 - i * 15}%`, animation: `slideRight 2s ease-in-out infinite ${i * 0.4}s` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg animate-bounce flex items-center justify-center">
                <span className="text-yellow-500">⭐</span>
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-200 to-orange-300 rounded-full animate-bounce"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, j) => (
                            <div key={j} className="w-3 h-3 bg-yellow-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated Customer Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="w-8 h-8 bg-green-100 rounded-lg animate-bounce flex items-center justify-center">
                <span className="text-green-500">🏆</span>
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-10 h-10 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full mr-3 animate-bounce"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Engagement Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg animate-spin flex items-center justify-center">
                <span className="text-indigo-500">📊</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Engagement Rate', value: '85%', color: 'blue' },
                { label: 'Repeat Customers', value: '65%', color: 'green' },
                { label: 'Satisfaction Score', value: '4.2/5', color: 'yellow' }
              ].map((item, i) => (
                <div key={item.label} className="animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 rounded-full`}
                      style={{ 
                        width: `${75 - i * 10}%`, 
                        animation: `slideRight 2.2s ease-in-out infinite ${i * 0.3}s` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Loading Animations */}
        <style jsx>{`
          @keyframes slideRight {
            0% { transform: translateX(-100%); opacity: 0.6; }
            50% { transform: translateX(0%); opacity: 1; }
            100% { transform: translateX(100%); opacity: 0.6; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes bounce {
            0%, 100% { 
              transform: translateY(0);
              animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% { 
              transform: translateY(-25%);
              animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
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
            <h3 className="text-base sm:text-lg font-semibold text-red-800">Error Loading Customer Data</h3>
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


      {/* Customer Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-lg sm:text-xl">👥</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Customers</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-lg sm:text-xl">🆕</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">New This Month</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{newCustomersThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-lg sm:text-xl">📈</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Growth Rate</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {customerGrowthRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 text-lg sm:text-xl">🛒</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Avg Orders</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {averageOrdersPerCustomer.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Customer Location Distribution */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Customers by Location</h3>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(customersByLocation)
              .sort(([,a], [,b]) => b - a)
              .map(([country, count], index) => {
                const total = Object.values(customersByLocation).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-gray-500'];
                const isExpanded = expandedCountry === country;
                const cities = getCitiesForCountry(country);
                
                return (
                  <div key={country} className="space-y-2">
                    {/* Country Row */}
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                      onClick={() => handleCountryClick(country)}
                    >
                      <div className="flex items-center flex-1">
                        <div className="flex items-center mr-2 sm:mr-3">
                          <span className="text-sm mr-1">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} flex-shrink-0`}></div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate mr-2">🌍 {country}</span>
                          <span className="text-xs text-gray-500">({cities.length} cities)</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className="text-xs sm:text-sm text-gray-600">{count} orders</span>
                        <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${colors[index % colors.length]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Cities Breakdown */}
                    {isExpanded && (
                      <div className="ml-6 space-y-1 bg-gray-50 p-3 rounded-md">
                        <div className="text-xs font-medium text-gray-600 mb-2">Cities in {country}:</div>
                        {cities.map((city, cityIndex) => {
                          const cityPercentage = count > 0 ? (city.orders / count) * 100 : 0;
                          const cityColors = ['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-red-400'];
                          
                          return (
                            <div key={city.name} className="flex items-center justify-between py-1">
                              <div className="flex items-center flex-1">
                                <div className={`w-2 h-2 rounded-full ${cityColors[cityIndex % cityColors.length]} mr-2 flex-shrink-0`}></div>
                                <span className="text-xs text-gray-700 truncate">{city.name}</span>
                                {city.state && city.state !== 'Unknown State' && (
                                  <span className="text-xs text-gray-500 ml-1">({city.state})</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-2">
                                <span className="text-xs text-gray-600">{city.orders}</span>
                                <span className="text-xs text-gray-500">|</span>
                                <span className="text-xs text-blue-600">{city.uniqueCustomers} customers</span>
                                <div className="w-12 h-1 bg-gray-200 rounded-full">
                                  <div
                                    className={`h-1 rounded-full ${cityColors[cityIndex % cityColors.length]}`}
                                    style={{ width: `${cityPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-400 w-6 text-right">{cityPercentage.toFixed(0)}%</span>
                              </div>
                            </div>
                          );
                        })}
                        {cities.length === 0 && (
                          <div className="text-xs text-gray-500 text-center py-2">No city data available</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Review Ratings Distribution */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Review Ratings</h3>
          <div className="mb-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {reviewStats.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-1">
              {renderStars(Math.round(reviewStats.averageRating))}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Based on {reviewStats.totalReviews} reviews
            </p>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviewStats.ratingDistribution[rating] || 0;
              const total = reviewStats.totalReviews;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center">
                  <span className="text-xs sm:text-sm text-gray-600 w-3">{rating}</span>
                  <span className="text-yellow-400 mx-1 text-sm">⭐</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Customers */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="text-gold-600 mr-2">🏆</span>
            Top Customers
          </h3>
          <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
            ℹ️ Shows actual account holders, not checkout recipients
          </p>
          <div className="space-y-2 sm:space-y-3">
            {topCustomers.length > 0 ? (
              topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-blue-600 text-sm sm:text-base font-bold">#{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                      <p className="text-xs text-gray-600 truncate">{customer.email}</p>
                    </div>
                  </div>
                  <div className="ml-2 text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{customer.orders} orders</p>
                    <p className="text-xs text-green-600 font-medium">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No customer data available</p>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="text-yellow-600 mr-2">💬</span>
            Recent Reviews
          </h3>
          <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto">
            {customerReviews.length > 0 ? (
              customerReviews.map((review, index) => (
                <div key={index} className="p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 mr-2">{review.customerName}</span>
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 mb-1 line-clamp-2">
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-500">Product: {review.product}</p>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No reviews available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics; 