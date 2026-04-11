'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAnalyticsData, safeGet, handleApiError } from '../../lib/api-utils';
import { filterPaymentsByDate, filterProductsByDate } from '../../lib/date-utils';
import { calculateInStock } from '../../utils/stockUtils';
import useCachedData from '../../hooks/useCachedData';

const OverviewCards = ({ tabId, dateFilter }) => {
  // Create the fetch function for cached data hook
  const fetchOverviewData = useCallback(async () => {
    if (typeof window === 'undefined') {
      throw new Error('Component must run on client side');
    }

    const data = await fetchAnalyticsData(['products', 'userBags', 'userData', 'customerReviews']);
    
    const productsData = data.products || [];
    const userBagsData = data.userBags || [];
    const usersData = data.userData || [];
    const reviewsData = data.customerReviews || [];

    // Create a map of documentId to product name for quick lookup
    const productMap = {};
    productsData.forEach(product => {
      const documentId = safeGet(product, 'documentId', null);
      const title = safeGet(product, 'title', 'Unknown Product');
      if (documentId) {
        productMap[documentId] = title;
      }
    });

    // Calculate revenue from user-bag.user_orders.payments (successful payments only)
    let totalRevenue = 0;
    let totalOrders = 0;
    let allPayments = [];

    userBagsData.forEach(userBag => {
      const userOrders = safeGet(userBag, 'user_orders', {});
      const payments = safeGet(userOrders, 'payments', []);
      
      payments.forEach(payment => {
        if (safeGet(payment, 'status', '') === 'Success') {
          allPayments.push(payment);
        }
      });
    });

    // Filter payments by date range if specified
    const filteredPayments = dateFilter && dateFilter.start && dateFilter.end 
      ? filterPaymentsByDate(allPayments, dateFilter)
      : allPayments;

    // Calculate totals from filtered payments
    filteredPayments.forEach(payment => {
      const amount = safeGet(payment, 'amount', 0);
      totalRevenue += amount;
      totalOrders += 1;
    });

    // Filter products by creation date if date filter is applied
    const filteredProducts = dateFilter && dateFilter.start && dateFilter.end
      ? filterProductsByDate(productsData, dateFilter)
      : productsData;

    // Filter customers by join date if date filter is applied
    const filteredCustomers = dateFilter && dateFilter.start && dateFilter.end
      ? usersData.filter(user => {
          const userDate = new Date(safeGet(user, 'createdAt', ''));
          return userDate >= dateFilter.start && userDate <= dateFilter.end;
        })
      : usersData;

    const totalProducts = filteredProducts.length;
    const totalCustomers = filteredCustomers.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Process product sales from filtered payments
    const productSales = {};
    filteredPayments.forEach(payment => {
      const orderData = safeGet(payment, 'orderData', {});
      const products = safeGet(orderData, 'products', []);
      
      products.forEach(product => {
        const productDocumentId = safeGet(product, 'documentId', 'Unknown Product');
        const productName = productMap[productDocumentId] || productDocumentId || 'Unknown Product';
        const quantity = safeGet(product, 'quantity', 1);
        const finalPrice = safeGet(product, 'finalPrice', 0);
        
        if (!productSales[productName]) {
          productSales[productName] = { quantity: 0, revenue: 0 };
        }
        productSales[productName].quantity += quantity;
        productSales[productName].revenue += finalPrice;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([name, data]) => ({ 
        name, 
        quantity: data.quantity, 
        revenue: data.revenue 
      }));

    // Check for low stock products using size_stocks calculation
    const lowStockProducts = productsData
      .filter(product => {
        const isInStock = calculateInStock(product);
        return !isInStock; // Show products that are out of stock
      })
      .slice(0, 5)
      .map(product => {
        const isInStock = calculateInStock(product);
        return {
          name: safeGet(product, 'title', 'Unknown Product'),
          stock: isInStock ? 'In Stock' : 'Out of Stock'
        };
      });

    // Recent orders from filtered payments
    const recentOrders = filteredPayments
      .sort((a, b) => {
        const dateA = new Date(safeGet(a, 'timestamp', ''));
        const dateB = new Date(safeGet(b, 'timestamp', ''));
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(payment => {
        const orderData = safeGet(payment, 'orderData', {});
        const receiverDetails = safeGet(orderData, 'receiver_details', {});
        const products = safeGet(orderData, 'products', []);
        
        // Map documentIds to actual product names
        const productNames = products
          .map(p => {
            const docId = safeGet(p, 'documentId', '');
            return productMap[docId] || docId || 'Unknown Product';
          })
          .join(', ');
        
        return {
          id: safeGet(payment, 'merchantTxnId', 'N/A'),
          date: safeGet(payment, 'timestamp', ''),
          customer: `${safeGet(receiverDetails, 'firstName', 'Unknown')} ${safeGet(receiverDetails, 'lastName', '')}`.trim(),
          product: productNames || 'Unknown Products',
          total: safeGet(payment, 'amount', 0)
        };
      });

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      averageOrderValue,
      topProducts,
      lowStockProducts,
      recentOrders
    };
  }, [dateFilter]);

  // Use cached data hook
  const { data: overviewData, loading, error, isFromCache } = useCachedData(
    tabId,
    dateFilter,
    fetchOverviewData
  );

  // Provide default values if data is not yet loaded
  const {
    totalRevenue = 0,
    totalOrders = 0,
    totalProducts = 0,
    totalCustomers = 0,
    averageOrderValue = 0,
    topProducts = [],
    lowStockProducts = [],
    recentOrders = []
  } = overviewData || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm animate-pulse">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading skeleton for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }



  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="text-red-600 text-xl sm:text-2xl mb-2 sm:mb-0 sm:mr-3">⚠️</span>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-red-800">Error Loading Overview Data</h3>
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
    <div className="space-y-6 lg:space-y-8">


      {/* Key Metrics Cards with enhanced animations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { 
            title: 'Total Revenue', 
            value: formatCurrency(totalRevenue).replace('NPR', '₹'),
            icon: '💰', 
            color: 'green',
            gradient: 'from-green-500 to-emerald-600'
          },
          { 
            title: 'Total Orders', 
            value: totalOrders,
            icon: '🛒', 
            color: 'blue',
            gradient: 'from-blue-500 to-cyan-600'
          },
          { 
            title: 'Total Products', 
            value: totalProducts,
            icon: '📦', 
            color: 'purple',
            gradient: 'from-purple-500 to-violet-600'
          },
          { 
            title: 'Total Customers', 
            value: totalCustomers,
            icon: '👥', 
            color: 'orange',
            gradient: 'from-orange-500 to-red-500'
          }
        ].map((metric, index) => (
          <div 
            key={metric.title}
            className="group bg-white p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 hover:border-gray-200"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'slideInUp 0.6s ease-out forwards'
            }}
          >
            <div className="flex items-center">
              <div className={`p-3 bg-gradient-to-br ${metric.gradient} rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110`}>
                <span className="text-white text-lg sm:text-xl filter drop-shadow-sm">{metric.icon}</span>
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate mb-1">{metric.title}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate group-hover:text-gray-800 transition-colors">
                  {metric.value}
                </p>
              </div>
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl transform -skew-x-12"></div>
          </div>
        ))}
      </div>

      {/* Additional Metrics with enhanced styling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Order Value */}
        <div className="group bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Average Order Value</h3>
            <div className="p-2 bg-blue-500 rounded-lg">
              <span className="text-white text-xl">📈</span>
            </div>
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {formatCurrency(averageOrderValue).replace('NPR', '₹')}
          </div>
          <p className="text-sm text-gray-600">Per order average</p>
          <div className="mt-4 h-1 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transform transition-transform duration-1000 group-hover:scale-x-110" style={{width: '75%'}}></div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="group bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
            <div className="p-2 bg-green-500 rounded-lg">
              <span className="text-white text-xl">🏆</span>
            </div>
          </div>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 3).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700 truncate">{product.name}</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(product.revenue).replace('NPR', '₹')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm">No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="group bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock Status</h3>
            <div className="p-2 bg-orange-500 rounded-lg">
              <span className="text-white text-xl">⚠️</span>
            </div>
          </div>
          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 3).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-2">{product.name}</span>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    product.stock === 'Out of Stock' 
                      ? 'bg-red-100 text-red-800 animate-pulse' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.stock}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-sm">All products well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders with enhanced styling */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <span className="text-white text-xl">📋</span>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Last {recentOrders.length} orders
            </span>
          </div>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <div 
                key={index} 
                className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-indigo-200"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInRight 0.5s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.customer} • {formatDate(order.date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(order.total).replace('NPR', '₹')}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-32">
                      {order.product}
                    </div>
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Orders</h4>
            <p className="text-sm">Orders will appear here once customers start purchasing</p>
          </div>
        )}
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .group:hover .animate-pulse {
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default OverviewCards;