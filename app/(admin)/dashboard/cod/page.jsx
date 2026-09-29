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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-xs rounded-2xl mb-5 sm:mb-6">
        <div className="px-4 sm:px-6 py-3.5 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
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
                  <span className="text-xl sm:text-2xl mr-2 flex-shrink-0">💵</span>
                  <span className="truncate">Cash on Delivery</span>
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm text-gray-500 truncate">
                  Manage COD orders, confirmations, and deliveries
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
              <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5"></span>
                {codOrders.length} Total Orders
              </div>
              <button
                onClick={fetchCODOrders}
                className="px-3 py-1.5 sm:py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 active:scale-95 transition-all text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {codOrders.length > 0 ? (
        <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
            All COD Orders ({codOrders.length})
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {currentOrders.map((order, index) => {
              // Build a deterministic, unique key per order to avoid duplicates
              const baseId = order.id || order.merchantTxnId || `cod-${order.userBag?.id}-${order.orderIndex ?? index}`;
              const orderKey = `cod-${order.userBag?.id || 'bag'}-${order.orderIndex ?? index}-${order.merchantTxnId || order.id || 'noid'}`;
              const isExpanded = expandedOrders.has(orderKey);

              return (
                <div key={orderKey} className="border border-gray-200/90 rounded-2xl p-3.5 sm:p-4 hover:shadow-xs transition-shadow duration-200 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                        {order.orderData?.receiver_details?.fullName || 'N/A'}
                      </h4>

                      <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        <span><strong className="text-gray-700 font-medium">Date:</strong> {order.timestamp ? new Date(order.timestamp).toLocaleDateString() : 'N/A'}</span>
                        <span><strong className="text-gray-700 font-medium">Amount:</strong> NPR {order.amount || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      <button
                        onClick={() => toggleOrderExpansion(orderKey)}
                        className="w-full sm:w-auto justify-center px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        {isExpanded ? (
                          <>
                            Hide Details
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            View Details
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                          <h5 className="text-xs font-semibold text-gray-700 mb-2">Products Ordered:</h5>
                          <div className="space-y-2">
                            {order.orderData.products.map((product, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm gap-1 border-b border-gray-100 last:border-0 pb-1.5 last:pb-0">
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-gray-900 block sm:inline">{product.title}</span>
                                  <div className="flex flex-wrap gap-2 text-gray-500 text-xs mt-0.5 sm:mt-0">
                                    <span>Size: {product.selectedSize || 'N/A'}</span>
                                    <span className="text-blue-600">Code: {product.product_code || product.productCode || 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="text-gray-700 font-semibold text-xs sm:text-sm">
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between w-full sm:w-auto gap-2 order-2 sm:order-1">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0 || isLoadingPagination}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    currentPage === 0 || isLoadingPagination
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95 shadow-xs'
                  }`}
                >
                  {isLoadingPagination && currentPage > 0 ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </>
                  )}
                </button>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages - 1 || isLoadingPagination}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    currentPage >= totalPages - 1 || isLoadingPagination
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95 shadow-xs'
                  }`}
                >
                  {isLoadingPagination && currentPage < totalPages - 1 ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      Next
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <span className="text-xs sm:text-sm text-gray-500 font-medium order-1 sm:order-2">
                Page {currentPage + 1} of {totalPages}
              </span>
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