import { useEffect, useCallback, useRef, useState } from 'react';
import imagePreloader, { preloadCartImages } from '../utils/imagePreloader';

/**
 * Custom hook for preloading cart images
 * @param {Array} cartProducts - Array of cart products
 * @param {Object} options - Preloading options
 * @returns {Object} Preloading state and utilities
 */
export const useCartImagePreloader = (cartProducts = [], options = {}) => {
  const [preloadingState, setPreloadingState] = useState({
    isPreloading: false,
    preloadedCount: 0,
    totalCount: 0,
    errors: [],
    completed: false
  });
  
  const preloadingRef = useRef(false);
  const lastCartHashRef = useRef('');

  // Generate a hash of cart products to detect changes
  const generateCartHash = useCallback((products) => {
    if (!Array.isArray(products) || products.length === 0) {
      return 'empty';
    }
    
    return products
      .map(p => `${p.id || p._id}-${p.variantInfo?.id || 'no-variant'}-${p.imgSrc || 'no-img'}`)
      .sort()
      .join('|');
  }, []);

  // Extract image URLs from cart products
  const extractImageUrls = useCallback((products) => {
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }

    const imageUrls = new Set();
    
    products.forEach(product => {
      // Add main product image
      if (product.imgSrc) {
        imageUrls.add(product.imgSrc);
      }
      
      // Add hover image if available
      if (product.imgHover) {
        imageUrls.add(product.imgHover);
      }
      
      // Add variant image if available
      if (product.variantInfo?.imgSrc) {
        imageUrls.add(product.variantInfo.imgSrc);
      }
      
      // Add additional variant images if available
      if (product.variantInfo?.images && Array.isArray(product.variantInfo.images)) {
        product.variantInfo.images.forEach(img => {
          if (img && typeof img === 'string') {
            imageUrls.add(img);
          } else if (img?.src) {
            imageUrls.add(img.src);
          }
        });
      }
    });

    return Array.from(imageUrls).filter(url => url && typeof url === 'string');
  }, []);

  // Preload images function
  const preloadImages = useCallback(async (products, preloadOptions = {}) => {
    if (preloadingRef.current) {
      return;
    }

    const imageUrls = extractImageUrls(products);
    
    if (imageUrls.length === 0) {
      setPreloadingState({
        isPreloading: false,
        preloadedCount: 0,
        totalCount: 0,
        errors: [],
        completed: true
      });
      return;
    }

    preloadingRef.current = true;
    
    setPreloadingState(prev => ({
      ...prev,
      isPreloading: true,
      totalCount: imageUrls.length,
      preloadedCount: 0,
      errors: [],
      completed: false
    }));

    try {
      const results = await preloadCartImages(products, {
        timeout: 8000,
        crossOrigin: 'anonymous',
        ...preloadOptions
      });

      const successful = results.filter(r => r.loaded);
      const failed = results.filter(r => !r.loaded);

      setPreloadingState({
        isPreloading: false,
        preloadedCount: successful.length,
        totalCount: imageUrls.length,
        errors: failed.map(f => ({ src: f.src, error: f.error })),
        completed: true
      });

      if (options.onComplete) {
        options.onComplete({
          successful: successful.length,
          failed: failed.length,
          total: imageUrls.length
        });
      }

    } catch (error) {
      console.error('Cart image preloading failed:', error);
      
      setPreloadingState({
        isPreloading: false,
        preloadedCount: 0,
        totalCount: imageUrls.length,
        errors: [{ src: 'unknown', error: error.message }],
        completed: true
      });

      if (options.onError) {
        options.onError(error);
      }
    } finally {
      preloadingRef.current = false;
    }
  }, [extractImageUrls, options]);

  // Auto-preload when cart products change
  useEffect(() => {
    if (!options.autoPreload) {
      return;
    }

    const currentHash = generateCartHash(cartProducts);
    
    // Only preload if cart has changed
    if (currentHash !== lastCartHashRef.current) {
      lastCartHashRef.current = currentHash;
      
      if (currentHash !== 'empty') {
        // Add small delay to avoid rapid successive calls
        const timeoutId = setTimeout(() => {
          preloadImages(cartProducts, options.preloadOptions);
        }, options.delay || 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [cartProducts, generateCartHash, preloadImages, options]);

  // Check if specific image is loaded
  const isImageLoaded = useCallback((src) => {
    return imagePreloader.isImageLoaded(src);
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return imagePreloader.getCacheStats();
  }, []);

  // Manual preload trigger
  const triggerPreload = useCallback((products = cartProducts) => {
    return preloadImages(products, options.preloadOptions);
  }, [cartProducts, preloadImages, options.preloadOptions]);

  // Clear cache
  const clearCache = useCallback(() => {
    imagePreloader.clearCache();
    setPreloadingState({
      isPreloading: false,
      preloadedCount: 0,
      totalCount: 0,
      errors: [],
      completed: false
    });
  }, []);

  return {
    // State
    ...preloadingState,
    
    // Utilities
    isImageLoaded,
    getCacheStats,
    triggerPreload,
    clearCache,
    
    // Computed values
    hasErrors: preloadingState.errors.length > 0,
    successRate: preloadingState.totalCount > 0 
      ? (preloadingState.preloadedCount / preloadingState.totalCount) * 100 
      : 0,
    
    // Image URLs for debugging
    imageUrls: extractImageUrls(cartProducts)
  };
};

/**
 * Hook for preloading images on app initialization
 * @param {Array} initialProducts - Initial products to preload
 * @param {Object} options - Preloading options
 */
export const useInitialImagePreloader = (initialProducts = [], options = {}) => {
  const [initialized, setInitialized] = useState(false);
  const initRef = useRef(false);

  const preloader = useCartImagePreloader(initialProducts, {
    autoPreload: false,
    ...options
  });

  useEffect(() => {
    if (initRef.current || !initialProducts.length) {
      return;
    }

    initRef.current = true;
    
    const initPreload = async () => {
      try {
        await preloader.triggerPreload(initialProducts);
        setInitialized(true);
        
        if (options.onInitialized) {
          options.onInitialized();
        }
      } catch (error) {
        console.error('Initial image preload failed:', error);
        setInitialized(true); // Still mark as initialized to prevent retries
      }
    };

    // Delay initial preload to not block initial render
    const timeoutId = setTimeout(initPreload, options.initDelay || 500);
    
    return () => clearTimeout(timeoutId);
  }, [initialProducts, preloader, options]);

  return {
    ...preloader,
    initialized
  };
};

export default useCartImagePreloader;