"use client";
import { useState, useEffect, useMemo, useCallback, memo } from 'react';

const OrderStatusTracker = memo(function OrderStatusTracker({ ncmOrderId }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // All hooks must be called before any conditional logic (Rules of Hooks)
  const getStatusColor = useCallback((status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return 'text-green-700 bg-green-100 border-green-300';
    if (statusLower.includes('pickup') && statusLower.includes('complete')) return 'text-blue-700 bg-blue-100 border-blue-300';
    if (statusLower.includes('delivery') || statusLower.includes('pickup')) return 'text-orange-700 bg-orange-100 border-orange-300';
    if (statusLower.includes('dispatched') || statusLower.includes('arrived')) return 'text-indigo-700 bg-indigo-100 border-indigo-300';
    if (statusLower.includes('created')) return 'text-purple-700 bg-purple-100 border-purple-300';
    return 'text-gray-700 bg-gray-100 border-gray-300';
  }, []);

  const getStatusIcon = useCallback((status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return '✅';
    if (statusLower.includes('pickup') && statusLower.includes('complete')) return '📦';
    if (statusLower.includes('delivery')) return '🚚';
    if (statusLower.includes('dispatched')) return '🚛';
    if (statusLower.includes('arrived')) return '📍';
    if (statusLower.includes('pickup')) return '🔄';
    if (statusLower.includes('created')) return '📝';
    return '⚪';
  }, []);

  const getProgressPercentage = useCallback((currentIndex, totalSteps) => {
    return ((totalSteps - currentIndex) / totalSteps) * 100;
  }, []);

  const formatDateTime = useCallback((dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateTimeString;
    }
  }, []);

  // Fetch order status function
  const fetchOrderStatus = useCallback(async () => {
    if (!ncmOrderId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ncm/order-status?id=${ncmOrderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order status');
      }

      if (data.success) {
        setStatusData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch order status');
      }
    } catch (err) {
      console.error('Error fetching order status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ncmOrderId]);

  // Memoized computed values for better performance
  const progressPercentage = useMemo(() => 
    statusData?.statusHistory ? getProgressPercentage(0, statusData.statusHistory.length) : 0, 
    [statusData?.statusHistory?.length, getProgressPercentage]
  );
  const isDelivered = useMemo(() => 
    statusData?.currentStatus?.toLowerCase().includes('delivered') || false, 
    [statusData?.currentStatus]
  );

  useEffect(() => {
    fetchOrderStatus();
  }, [fetchOrderStatus]);



  if (!ncmOrderId) {
    return (
      <div className="order-status-tracker bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            🚚
          </div>
          <h3 className="text-xl font-bold text-gray-800">Delivery Tracking</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-600 text-center">📋 NCM Order ID not available for this order.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-status-tracker bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            🚚
          </div>
          <h3 className="text-xl font-bold text-gray-800">Delivery Tracking</h3>
        </div>
        <div className="bg-white rounded-lg p-6 border border-blue-200">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-500 mb-3"></div>
            <span className="text-gray-700 font-medium">Loading delivery status...</span>
            <span className="text-gray-500 text-sm mt-1">Please wait while we fetch your tracking information</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-status-tracker bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            ⚠️
          </div>
          <h3 className="text-xl font-bold text-gray-800">Delivery Tracking</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">❌</span>
            <div>
              <p className="text-red-700 font-medium">Unable to load tracking information</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!statusData || !statusData.statusHistory || statusData.statusHistory.length === 0) {
    return (
      <div className="order-status-tracker bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
            📦
          </div>
          <h3 className="text-xl font-bold text-gray-800">Delivery Tracking</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-yellow-200">
          <div className="text-center py-4">
            <span className="text-4xl mb-2 block">📋</span>
            <p className="text-gray-700 font-medium mb-1">No tracking information available</p>
            <p className="text-gray-500 text-sm">NCM Order #{ncmOrderId}</p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="order-status-tracker bg-white rounded-xl lg:rounded-2xl border border-gray-200 shadow-md lg:shadow-lg overflow-hidden transition-shadow duration-200 hover:shadow-xl mx-2 sm:mx-0">
      {/* Clean White Header */}
      <div className="relative bg-white px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
        {/* Simple clean background */}
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-sm border border-gray-200">
              <span className="text-lg sm:text-xl">{isDelivered ? '✅' : '📦'}</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 tracking-wide text-gray-800">Delivery Tracking</h3>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 border border-gray-200 text-gray-700">
                  📎 NCM #{statusData.orderId}
                </span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold shadow-sm border transition-colors duration-200 ${
              isDelivered 
                ? 'bg-emerald-500 text-white border-emerald-400' 
                : 'bg-gray-100 text-slate-700 border-gray-200'
            }`}>
              <span className="mr-1 sm:mr-2 text-sm sm:text-base">{getStatusIcon(statusData.currentStatus)}</span>
              <span className="truncate max-w-[120px] sm:max-w-none">{statusData.currentStatus}</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span className="font-medium">Delivery Progress</span>
            <span className="font-semibold">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-4 sm:h-5 border border-gray-300">
            <div 
              className={`h-4 sm:h-5 rounded-full transition-all duration-500 ease-out ${
                isDelivered ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            >
            </div>
            {progressPercentage > 15 && (
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 text-xs font-semibold text-gray-700 drop-shadow-sm hidden sm:block"
                style={{ left: `${Math.min(progressPercentage - 5, 85)}%` }}
              >
                {Math.round(progressPercentage)}%
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Premium Timeline with Enhanced Animations */}
      <div className="p-4 sm:p-6">
        <div className="relative">
          {/* Dynamic Timeline Line */}
          <div className="absolute left-7 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-blue-400 via-indigo-400 to-gray-300 rounded-full shadow-sm"></div>
          
          <div className="space-y-4 sm:space-y-6">
            {statusData.statusHistory.map((statusItem, index) => {
              const isLatest = index === 0;
              const isRecent = index < 2;
              const isCompleted = index < statusData.statusHistory.length - 1;
              
              return (
                <div key={index} className={`relative flex items-start space-x-3 sm:space-x-6 group ${
                  isLatest ? 'animate-fadeInScale' : 'animate-fadeInUp'
                }`} style={{ animationDelay: `${index * 150}ms` }}>
                  {/* Premium Status Icon with Glow Effect */}
                  <div className="relative flex items-start group cursor-pointer hover:bg-gray-50/60 rounded-xl p-3 lg:p-4 transition-colors duration-200">
                    <div className="flex-shrink-0 mr-4 lg:mr-6 relative z-10">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full border-3 flex items-center justify-center shadow-sm transition-colors duration-200 ${
                        index === 0 
                          ? `bg-emerald-500 border-emerald-400 text-white` 
                          : 'bg-gray-200 border-gray-300 text-gray-600'
                      }`}>
                        <span className={`text-sm lg:text-lg font-semibold ${
                          index === 0 ? 'text-white' : 'text-gray-600'
                        }`}>
                          {getStatusIcon(statusItem.status)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Premium Status Card */}
                    <div className={`flex-1 min-w-0 transition-colors duration-200 ${
                      index === 0 
                        ? 'bg-emerald-50 border-emerald-200 rounded-lg lg:rounded-xl p-3 lg:p-4 shadow-sm'
                        : isRecent 
                          ? 'bg-blue-50 border-blue-200 rounded-lg lg:rounded-xl p-3 lg:p-4 shadow-sm'
                          : 'bg-white border-gray-200 rounded-lg p-3 lg:p-4 shadow-sm hover:shadow-md'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold mb-1 truncate ${
                            index === 0 ? 'text-emerald-700' : isRecent ? 'text-blue-800' : 'text-gray-800'
                          }`}>
                            {statusItem.status}
                          </p>
                          
                          {/* Status Description */}
                          <p className={`text-xs leading-relaxed ${
                            index === 0 ? 'text-emerald-600' : isRecent ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {isLatest && '🎯 Most recent update'}
                            {isRecent && !isLatest && '⏱️ Recent progress'}
                            {!isRecent && '✓ Completed milestone'}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end ml-2 sm:ml-4 flex-shrink-0">
                          <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold mb-1 ${
                            index === 0 
                              ? 'bg-emerald-200 text-emerald-700'
                              : isRecent 
                                ? 'bg-blue-200 text-blue-800'
                                : 'bg-gray-200 text-gray-700'
                          }`}>
                            🕐 <span className="ml-1 hidden sm:inline">{formatDateTime(statusItem.added_time)}</span>
                            <span className="ml-1 sm:hidden">{new Date(statusItem.added_time).toLocaleDateString()}</span>
                          </div>
                          
                          {/* Time Ago Indicator */}
                          <span className="text-xs text-gray-400 font-medium">
                            {index === 0 ? 'Latest' : `Step ${statusData.statusHistory.length - index}`}
                          </span>
                        </div>
                      </div>
                      
                      {/* Latest Status Special Features */}
                      {isLatest && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-200">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-medium border shadow-sm transition-colors duration-200 ${
                              index === 0 ? 'text-emerald-700 bg-emerald-100 border-emerald-300' : getStatusColor(statusItem.status)
                            }`}>
                              {statusItem.status}
                            </span>
                          </div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Clean Summary Dashboard */}
        <div className="mt-8 pt-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 -mx-8 px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
            {/* Order ID Card */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-1">
                <div className="w-6 h-6 bg-slate-600 rounded-md flex items-center justify-center mr-2">
                  <span className="text-white text-xs">📎</span>
                </div>
                <h4 className="font-medium text-gray-700 text-xs">Order ID</h4>
              </div>
              <p className="text-sm font-bold text-slate-700 truncate">NCM #{statusData.orderId}</p>
            </div>
            
            {/* Status Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-3 rounded-lg border border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-1">
                <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center mr-2">
                  <span className="text-white text-xs">📊</span>
                </div>
                <h4 className="font-medium text-gray-700 text-xs">Status</h4>
              </div>
              <p className="text-sm font-bold text-emerald-700 truncate">{statusData.currentStatus}</p>
            </div>
            
            {/* Carrier Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-3 rounded-lg border border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-1">
                <div className="w-6 h-6 bg-amber-600 rounded-md flex items-center justify-center mr-2">
                  <span className="text-white text-xs">🚚</span>
                </div>
                <h4 className="font-medium text-gray-700 text-xs">Carrier</h4>
              </div>
              <p className="text-sm font-bold text-amber-700">NCM Logistics</p>
            </div>
            
            {/* Done Card */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-100 p-3 rounded-lg border border-violet-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-1">
                <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center mr-2">
                  <span className="text-white text-xs">{isDelivered ? '✅' : '📦'}</span>
                </div>
                <h4 className="font-medium text-gray-700 text-xs">{isDelivered ? 'Done' : 'Active'}</h4>
              </div>
              <p className="text-sm font-bold text-violet-700">Tracking Status</p>
            </div>
          </div>
          
          {/* Enhanced Footer Info */}
          {statusData.lastUpdated && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
                <p className="text-sm text-gray-600 font-medium">
                  Last updated: <span className="text-gray-800 font-semibold">{formatDateTime(statusData.lastUpdated)}</span>
                </p>
              </div>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 sm:py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button 
                onClick={fetchOrderStatus}
                className="group flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50"
              >
                <span className="mr-2 sm:mr-3 text-base sm:text-lg">🔄</span>
                <span className="text-sm sm:text-base">Refresh Status</span>
              </button>
              <button className="group flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50">
                <span className="mr-2 sm:mr-3 text-base sm:text-lg">📞</span>
                <span className="text-sm sm:text-base">Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default OrderStatusTracker;
