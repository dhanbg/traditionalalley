'use client';
import '../../../globals.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getExchangeRate, convertUsdToNpr } from '../../../../utils/currency';

const CODManagement = () => {
  const [codOrders, setCodOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingPagination, setIsLoadingPagination] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [exchangeRate, setExchangeRate] = useState(null);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchCODOrders();
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const rate = await getExchangeRate();
      setExchangeRate(rate);
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      setExchangeRate(141.11); // Fallback rate
    }
  };

  const fetchCODOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user-bags?pagination[pageSize]=100&populate=*&sort=updatedAt:desc');
      if (response.ok) {
        const data = await response.json();
        
        const allCODOrders = [];
        
        if (data.data) {
          data.data.forEach(userBag => {
            const codArrayRaw = userBag?.cod ?? userBag?.attributes?.cod ?? [];
            const codArray = Array.isArray(codArrayRaw) ? codArrayRaw : [];
            if (codArray.length > 0) {
              const sortedCod = [...codArray]
                .sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0))
                .slice(0, 10);

              sortedCod.forEach((codOrder, index) => {
                allCODOrders.push({
                  ...codOrder,
                  userBag,
                  orderIndex: index,
                  id: codOrder.merchantTxnId || `cod-${userBag.id}-${index}`,
                  timestamp: codOrder.timestamp || codOrder.createdAt,
                  amount: codOrder.amount,
                  orderData: codOrder.orderData
                });
              });
            }
          });
        }
        
        allCODOrders.sort((a, b) => {
          const dateA = new Date(a.timestamp || 0);
          const dateB = new Date(b.timestamp || 0);
          return dateB - dateA; // latest first
        });

        setCodOrders(allCODOrders);
      } else {
        console.error('Failed to fetch COD orders');
      }
    } catch (error) {
      console.error('Error fetching COD orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const totalPages = Math.ceil(codOrders.length / ordersPerPage);
  const startIndex = currentPage * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = codOrders.slice(startIndex, endIndex);

  const goToPreviousPage = async () => {
    if (currentPage > 0) {
      setIsLoadingPagination(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentPage(currentPage - 1);
      setIsLoadingPagination(false);
    }
  };

  const goToNextPage = async () => {
    if (currentPage < totalPages - 1) {
      setIsLoadingPagination(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentPage(currentPage + 1);
      setIsLoadingPagination(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-600 text-xs font-medium">COD</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 sm:mb-8">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="ml-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-900 to-orange-700 bg-clip-text text-transparent flex items-center">
                  <span className="text-2xl mr-2">💵</span>
                  Cash on Delivery Management
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  Manage COD orders, confirmations, and deliveries
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                {codOrders.length} Total Orders
              </div>
              <button
                onClick={fetchCODOrders}
                className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {codOrders.length > 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            All COD Orders ({codOrders.length})
          </h3>

          <div className="space-y-4">
            {currentOrders.map((order, index) => {
                            // Build a deterministic, unique key per order to avoid duplicates
              const baseId = order.id || order.merchantTxnId || `cod-${order.userBag?.id}-${order.orderIndex ?? index}`;
              const orderKey = `cod-${order.userBag?.id || 'bag'}-${order.orderIndex ?? index}-${order.merchantTxnId || order.id || 'noid'}`;
              const isExpanded = expandedOrders.has(orderKey);

              return (
                <div key={orderKey} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">
                            {order.orderData?.receiver_details?.fullName || 'N/A'}
                          </h4>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {order.timestamp ? new Date(order.timestamp).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:ml-4">
                      <button
                        onClick={() => toggleOrderExpansion(orderKey)}
                        className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        {isExpanded ? (
                          <>
                            Hide Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            View Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Phone:</span> {order.orderData?.receiver_details?.phone || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Height:</span> {order.orderData?.receiver_details?.height || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> NPR {order.amount || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">City:</span> {order.orderData?.receiver_details?.address?.cityName || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Country:</span> {order.orderData?.receiver_details?.address?.countryCode || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Shipping:</span> {
                            (() => {
                              const shipping = order.orderData?.shipping;
                              
                              // Handle null or undefined
                              if (!shipping) return 'Standard';
                              
                              // Handle string type
                              if (typeof shipping === 'string') return shipping;
                              
                              // Handle object type
                              if (typeof shipping === 'object') {
                                // Access nested method properties
                                const shippingMethod = shipping.method;
                                if (!shippingMethod) return 'Standard';
                                
                                const carrier = shippingMethod.carrier || '';
                                const service = shippingMethod.service || '';
                                const deliveryType = shippingMethod.deliveryType || '';
                                const cost = shippingMethod.cost;
                                const currency = shippingMethod.currency || 'NPR';
                                
                                // Build display string
                                let displayText = '';
                                
                                // Skip COD-related carriers and services, prioritize deliveryType
                                if (carrier && deliveryType && carrier !== 'Cash on Delivery') {
                                  displayText = `${carrier} - ${deliveryType}`;
                                } else if (service && deliveryType && service !== 'Cash on Delivery' && service !== 'COD Standard') {
                                  displayText = `${service} - ${deliveryType}`;
                                } else if (deliveryType) {
                                  displayText = deliveryType;
                                } else if (carrier && carrier !== 'Cash on Delivery') {
                                  displayText = carrier;
                                } else if (service && service !== 'Cash on Delivery' && service !== 'COD Standard') {
                                  displayText = service;
                                } else {
                                  displayText = 'Standard';
                                }
                                
                                // Add cost if available
                                const costText = cost ? ` (${currency} ${cost})` : '';
                                
                                return displayText + costText;
                              }
                              
                              return 'Standard';
                            })()
                          }
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <span className="font-medium">Address:</span> {order.orderData?.receiver_details?.address?.addressLine1 || 'N/A'}
                        </div>
                      </div>

                      {order.orderData?.products && order.orderData.products.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-3">Products Ordered:</h5>
                          <div className="space-y-2">
                            {order.orderData.products.map((product, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-900">{product.title}</span>
                                  <span className="text-gray-600 ml-2">Size: {product.selectedSize}</span>
                                  <span className="text-blue-600 ml-2">Code: {product.product_code || product.productCode || 'N/A'}</span>
                                </div>
                                <div className="text-gray-600">
                                  Qty: {product.pricing?.quantity || product.quantity || 1} × NPR {
                                    exchangeRate 
                                      ? convertUsdToNpr(product.pricing?.currentPrice || product.price || 0, exchangeRate)
                                      : Math.round((product.pricing?.currentPrice || product.price || 0) * 141.11)
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}


                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 0 || isLoadingPagination}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  currentPage === 0 || isLoadingPagination
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isLoadingPagination && currentPage > 0 ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </>
                )}
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1 || isLoadingPagination}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  currentPage >= totalPages - 1 || isLoadingPagination
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isLoadingPagination && currentPage < totalPages - 1 ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
          <div className="text-6xl mb-4">💵</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No COD Orders Found</h3>
          <p className="text-gray-600 mb-4">There are currently no Cash on Delivery orders in the system.</p>
          <button
            onClick={fetchCODOrders}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            Refresh Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default function CODPage() {
  return <CODManagement />;
}