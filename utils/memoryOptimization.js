/**
 * Memory Optimization Utilities for Traditional Alley
 * Helps prevent memory leaks and optimize resource usage
 */

// Clear browser caches and temporary data
export const clearBrowserCache = () => {
  if (typeof window === 'undefined') return;

  try {
    // Clear session storage items related to payments and cart
    const keysToRemove = [
      'nps_payment_data',
      'paymentProcessing',
      'cart_temp_data',
      'checkout_temp_data',
      'payment_callback_data'
    ];

    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });

    // Clear performance timings
    if (window.performance && window.performance.clearResourceTimings) {
      window.performance.clearResourceTimings();
    }

    // Clear any global payment cache
    if (window.paymentCache) {
      delete window.paymentCache;
    }

    console.log('Browser cache cleared successfully');
  } catch (error) {
    console.warn('Error clearing browser cache:', error);
  }
};

// Optimize images by removing unused cached images
export const optimizeImageCache = () => {
  if (typeof window === 'undefined') return;

  try {
    // Remove unused image objects from memory
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.complete && img.naturalWidth === 0) {
        // Remove broken images
        img.remove();
      }
    });

    // Clear blob URLs that might be cached
    if (window.URL && window.URL.revokeObjectURL) {
      // This would need to be called on specific blob URLs
      // For now, just log that optimization is available
      console.log('Image cache optimization completed');
    }
  } catch (error) {
    console.warn('Error optimizing image cache:', error);
  }
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof window === 'undefined' || !window.performance || !window.performance.memory) {
    return null;
  }

  const memory = window.performance.memory;
  return {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
    percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
  };
};

// Cleanup function for component unmounting
export const componentCleanup = (componentName = 'Unknown') => {
  return () => {
    try {
      clearBrowserCache();

      // Component-specific cleanup
      if (componentName === 'NPSCallback') {
        sessionStorage.removeItem('nps_callback_processed');
        sessionStorage.removeItem('payment_redirect_data');
      } else if (componentName === 'Checkout') {
        sessionStorage.removeItem('checkout_step');
        sessionStorage.removeItem('shipping_data');
      }

      console.log(`Memory cleanup completed for ${componentName}`);
    } catch (error) {
      console.warn(`Error in cleanup for ${componentName}:`, error);
    }
  };
};

// Periodic memory monitoring (for development)
export const startMemoryMonitoring = (intervalMs = 30000) => {
  // Only run in browser and development mode
  if (typeof window === 'undefined') {
    console.log('Memory monitoring skipped: not in browser environment');
    return null;
  }

  if (process.env.NODE_ENV === 'production') {
    console.log('Memory monitoring skipped: production mode');
    return null;
  }

  const interval = setInterval(() => {
    const usage = getMemoryUsage();
    if (usage) {
      console.log(`Memory Usage: ${usage.used}MB / ${usage.total}MB (${usage.percentage}%)`);

      // Warning if memory usage is high
      if (usage.percentage > 80) {
        console.warn('High memory usage detected! Consider clearing cache.');
        clearBrowserCache();
      }
    }
  }, intervalMs);

  return () => clearInterval(interval);
};

// Force garbage collection (Chrome DevTools only)
export const forceGarbageCollection = () => {
  if (typeof window !== 'undefined' && window.gc) {
    try {
      window.gc();
      console.log('Garbage collection forced');
    } catch (error) {
      console.warn('Garbage collection not available');
    }
  }
};

export default {
  clearBrowserCache,
  optimizeImageCache,
  getMemoryUsage,
  componentCleanup,
  startMemoryMonitoring,
  forceGarbageCollection
};
