'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAnalyticsData, safeGet, handleApiError } from '../../lib/api-utils';
import { filterProductsByDate } from '../../lib/date-utils';
import useCachedData from '../../hooks/useCachedData';

const ProductAnalytics = ({ tabId, dateFilter }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const fetchProductData = useCallback(async () => {
    if (typeof window === 'undefined') {
      throw new Error('Component must run on client side');
    }

      const data = await fetchAnalyticsData(['products', 'carts', 'collections', 'categories']);
      
      const productsData = data.products || [];
      const cartsData = data.carts || [];
      const collectionsData = data.collections || [];
      const categoriesData = data.categories || [];

      // Filter products by creation date if date filter is applied
      const filteredProducts = dateFilter && dateFilter.start && dateFilter.end
        ? filterProductsByDate(productsData, dateFilter)
        : productsData;

      const totalProducts = filteredProducts.length;

      const lowStockProducts = productsData
        .filter(product => {
          const stock = safeGet(product, 'stock', 0);
          return stock > 0 && stock <= 10;
        })
        .slice(0, 10)
        .map(product => ({
          name: safeGet(product, 'title', 'Unknown Product'),
          stock: safeGet(product, 'stock', 0),
          price: safeGet(product, 'price', 0)
        }));

      const productSales = {};
      cartsData.forEach(cart => {
        const items = safeGet(cart, 'attributes.items', []);
        items.forEach(item => {
          const name = safeGet(item, 'name', 'Unknown Product');
          const quantity = safeGet(item, 'quantity', 0);
          const price = safeGet(item, 'price', 0);
          
          if (!productSales[name]) {
            productSales[name] = { quantity: 0, revenue: 0 };
          }
          productSales[name].quantity += quantity;
          productSales[name].revenue += price * quantity;
        });
      });

      const topPerformingProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(([name, data]) => ({ name, ...data }));

          // Real category distribution calculation with collection details
    const categoryDistribution = {};
    const collectionDetails = {};
    
    // Build collection to category mapping and initialize collection details
    const collectionToCategoryMap = {};
    
    collectionsData.forEach(collection => {
      const collectionId = safeGet(collection, 'id', null);
      const collectionName = safeGet(collection, 'name', 'Unknown Collection');
      const category = safeGet(collection, 'category', null);
      const categoryName = category ? safeGet(category, 'title', 'Uncategorized') : 'Uncategorized';
      
      if (collectionId) {
        collectionToCategoryMap[collectionId] = {
          categoryName,
          collectionName
        };
        
        // Initialize collection details
        collectionDetails[collectionName] = {
          id: collectionId,
          categoryName,
          productCount: 0,
          products: []
        };
      }
    });

    // Initialize main categories
    const mainCategories = ['Women', 'Men', 'Kids'];
    mainCategories.forEach(category => {
      categoryDistribution[category] = 0;
    });

    // Count products by category and build collection details (use filtered products)
    filteredProducts.forEach(product => {
      const collection = safeGet(product, 'collection', null);
      const productTitle = safeGet(product, 'title', 'Unknown Product');
      const productPrice = safeGet(product, 'price', 0);
      const productStock = safeGet(product, 'stock', 0);
      
      if (collection) {
        const collectionId = safeGet(collection, 'id', null);
        const collectionInfo = collectionToCategoryMap[collectionId];
        
        if (collectionInfo) {
          const { categoryName, collectionName } = collectionInfo;
          
          // Count for category distribution
          if (categoryDistribution.hasOwnProperty(categoryName)) {
            categoryDistribution[categoryName]++;
          } else {
            categoryDistribution[categoryName] = (categoryDistribution[categoryName] || 0) + 1;
          }
          
          // Add to collection details
          if (collectionDetails[collectionName]) {
            collectionDetails[collectionName].productCount++;
            collectionDetails[collectionName].products.push({
              title: productTitle,
              price: productPrice,
              stock: productStock
            });
          }
        }
      } else {
        // Product has no collection, count as uncategorized
        categoryDistribution['Uncategorized'] = (categoryDistribution['Uncategorized'] || 0) + 1;
      }
    });

    // Remove categories with 0 products for cleaner display
    Object.keys(categoryDistribution).forEach(category => {
      if (categoryDistribution[category] === 0) {
        delete categoryDistribution[category];
      }
    });

    // If no categories found, create a fallback
    if (Object.keys(categoryDistribution).length === 0) {
      categoryDistribution['Uncategorized'] = totalProducts;
    }

      const priceRanges = {
        'Under ₹1,000': 0,
        '₹1,000 - ₹5,000': 0,
        '₹5,000 - ₹10,000': 0,
        'Above ₹10,000': 0
      };

      filteredProducts.forEach(product => {
        const price = safeGet(product, 'price', 0);
        if (price < 1000) priceRanges['Under ₹1,000']++;
        else if (price < 5000) priceRanges['₹1,000 - ₹5,000']++;
        else if (price < 10000) priceRanges['₹5,000 - ₹10,000']++;
        else priceRanges['Above ₹10,000']++;
      });

      const recentlyAddedProducts = filteredProducts
        .sort((a, b) => {
          const dateA = new Date(safeGet(a, 'createdAt', ''));
          const dateB = new Date(safeGet(b, 'createdAt', ''));
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(product => ({
          name: safeGet(product, 'title', 'Unknown Product'),
          price: safeGet(product, 'price', 0),
          createdAt: safeGet(product, 'createdAt', ''),
          stock: safeGet(product, 'stock', 0)
        }));

      return {
        totalProducts,
        lowStockProducts,
        topPerformingProducts,
        categoryDistribution,
        collectionDetails,
        priceRangeDistribution: priceRanges,
        recentlyAddedProducts
      };
  }, [dateFilter]);

  // Use cached data hook
  const { data: productData, loading, error, isFromCache } = useCachedData(
    tabId,
    dateFilter,
    fetchProductData
  );

  // Provide default values if data is not yet loaded
  const {
    totalProducts = 0,
    lowStockProducts = [],
    topPerformingProducts = [],
    categoryDistribution = {},
    collectionDetails = {},
    priceRangeDistribution = {},
    recentlyAddedProducts = []
  } = productData || {};

  const handleCategoryClick = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const getCollectionsForCategory = (categoryName) => {
    const collections = [];
    Object.keys(collectionDetails).forEach(collectionName => {
      const collectionData = collectionDetails[collectionName];
      if (collectionData.categoryName === categoryName) {
        collections.push({
          name: collectionName,
          ...collectionData
        });
      }
    });
    return collections.sort((a, b) => b.productCount - a.productCount);
  };

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
        {/* Animated Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gradient-to-r from-purple-300 to-indigo-400 rounded-lg w-52 mb-2 animate-pulse"></div>
              <div className="h-4 bg-purple-200 rounded w-40 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-2xl">📦</span>
              </div>
              <div className="text-sm text-purple-600 bg-white px-3 py-1 rounded-full animate-pulse">
                Analyzing products...
              </div>
            </div>
          </div>
        </div>

        {/* Animated Product Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { color: 'blue', icon: '📦', label: 'Total Products', delay: '0ms' },
            { color: 'red', icon: '⚠️', label: 'Low Stock', delay: '100ms' },
            { color: 'green', icon: '⭐', label: 'Top Sellers', delay: '200ms' },
            { color: 'purple', icon: '🆕', label: 'New Items', delay: '300ms' }
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
          {/* Category Distribution Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-44 animate-pulse"></div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg animate-spin flex items-center justify-center">
                <span className="text-purple-500">📊</span>
              </div>
            </div>
            <div className="space-y-3">
              {['Women', 'Men', 'Kids'].map((category, i) => (
                <div key={category} className="border border-gray-100 rounded-lg p-3 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 bg-${['blue', 'green', 'purple'][i]}-400 rounded-full mr-3 animate-pulse`}></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-${['blue', 'green', 'purple'][i]}-400 to-${['blue', 'green', 'purple'][i]}-500 rounded-full animate-pulse`}
                          style={{ width: `${75 - i * 20}%`, animation: `slideRight 2s ease-in-out infinite ${i * 0.3}s` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Distribution Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="w-8 h-8 bg-green-100 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-green-500">💰</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { range: '₹0-500', width: '60%', color: 'green' },
                { range: '₹500-1000', width: '40%', color: 'blue' },
                { range: '₹1000+', width: '20%', color: 'purple' }
              ].map((item, i) => (
                <div key={item.range} className="animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 rounded-full`}
                      style={{ 
                        width: item.width, 
                        animation: `slideRight 2.5s ease-in-out infinite ${i * 0.4}s` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated Product Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Products Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-44 animate-pulse"></div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg animate-bounce flex items-center justify-center">
                <span className="text-yellow-500">🏆</span>
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-200 to-orange-300 rounded-lg mr-3 animate-bounce"></div>
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

          {/* Recently Added Products Skeleton */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="w-8 h-8 bg-indigo-100 rounded-lg animate-spin flex items-center justify-center">
                <span className="text-indigo-500">🆕</span>
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse" style={{ animationDelay: `${i * 120}ms` }}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-200 rounded-full mr-3 animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Loading Animations */}
        <style jsx>{`
          @keyframes slideRight {
            0% { transform: translateX(-100%); opacity: 0.5; }
            50% { transform: translateX(0%); opacity: 1; }
            100% { transform: translateX(100%); opacity: 0.5; }
          }
          
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
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
            <h3 className="text-base sm:text-lg font-semibold text-red-800">Error Loading Product Data</h3>
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


      {/* Product Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-lg sm:text-xl">📦</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Products</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-lg sm:text-xl">⚠️</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Low Stock</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-lg sm:text-xl">⭐</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Top Sellers</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{topPerformingProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow col-span-2 sm:col-span-3 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-lg sm:text-xl">🆕</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">New This Month</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{recentlyAddedProducts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Distribution with Drill-down */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Products by Category</h3>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(categoryDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count], index) => {
                const total = Object.values(categoryDistribution).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                const isExpanded = expandedCategory === category;
                const collections = getCollectionsForCategory(category);
                
                return (
                  <div key={category} className="border border-gray-100 rounded-lg">
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="flex items-center flex-1">
                        <div className="flex items-center mr-2">
                          {collections.length > 0 && (
                            <span className="text-gray-400 mr-1 text-sm">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                          )}
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2 sm:mr-3 flex-shrink-0`}></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{category}</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className="text-xs sm:text-sm text-gray-600">{count} products</span>
                        <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${colors[index % colors.length]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    {/* Collection Details */}
                    {isExpanded && collections.length > 0 && (
                      <div className="border-t border-gray-100 p-3 bg-gray-50">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Collections in {category}:</h4>
                        <div className="space-y-2">
                          {collections.map((collection, collectionIndex) => (
                            <div key={collection.name} className="bg-white p-2 rounded border">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-medium text-gray-700">{collection.name}</span>
                                <span className="text-xs text-gray-500">{collection.productCount} products</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                <div 
                                  className={`h-1.5 rounded-full ${colors[collectionIndex % colors.length]}`}
                                  style={{ width: `${count > 0 ? (collection.productCount / count) * 100 : 0}%` }}
                                ></div>
                              </div>
                              {collection.products.length > 0 && (
                                <div className="text-xs text-gray-600">
                                  <strong>Products:</strong>
                                  <div className="mt-1 space-y-1">
                                    {collection.products.slice(0, 3).map((product, productIndex) => (
                                      <div key={productIndex} className="flex justify-between">
                                        <span className="truncate mr-2">{product.title}</span>
                                        <span className="flex-shrink-0">
                                          {formatCurrency(product.price).replace('NPR', '₹')}
                                        </span>
                                      </div>
                                    ))}
                                    {collection.products.length > 3 && (
                                      <div className="text-gray-500 italic">
                                        +{collection.products.length - 3} more products...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Price Range Distribution */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Price Range Distribution</h3>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(priceRangeDistribution).map(([range, count], index) => {
              const total = Object.values(priceRangeDistribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
              
              return (
                <div key={range} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-3 h-3 rounded-full ${colors[index]} mr-2 sm:mr-3 flex-shrink-0`}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{range}</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="text-xs sm:text-sm text-gray-600">{count}</span>
                    <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${colors[index]}`}
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

      {/* Product Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            Low Stock Alert
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-600">{formatCurrency(product.price).replace('NPR', '₹')}</p>
                  </div>
                  <div className="ml-2 text-right flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.stock} left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-4">All products are well stocked</p>
            )}
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="text-green-600 mr-2">⭐</span>
            Top Performers
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
            {topPerformingProducts.length > 0 ? (
              topPerformingProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-green-600 text-xs sm:text-sm font-bold">#{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-600">Sold: {product.quantity}</p>
                    </div>
                  </div>
                  <div className="ml-2 text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      {formatCurrency(product.revenue).replace('NPR', '₹')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </div>

        {/* Recently Added Products */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow lg:col-span-2 xl:col-span-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <span className="text-purple-600 mr-2">🆕</span>
            Recently Added
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
            {recentlyAddedProducts.length > 0 ? (
              recentlyAddedProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-600">{formatDate(product.createdAt)}</p>
                  </div>
                  <div className="ml-2 text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      {formatCurrency(product.price).replace('NPR', '₹')}
                    </p>
                    <p className="text-xs text-gray-600">Stock: {product.stock}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No recent additions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalytics; 