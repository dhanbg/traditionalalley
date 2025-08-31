/**
 * Image Preloader Utility
 * Preloads images in the background and caches them for immediate display
 */

class ImagePreloader {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Preload a single image
   * @param {string} src - Image URL to preload
   * @param {Object} options - Preload options
   * @returns {Promise} Promise that resolves when image is loaded
   */
  preloadImage(src, options = {}) {
    if (!src) return Promise.resolve(null);

    // Return cached result if available
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src));
    }

    // Return existing loading promise if already in progress
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    // Create new loading promise
    const loadingPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set crossOrigin if needed
      if (options.crossOrigin) {
        img.crossOrigin = options.crossOrigin;
      }

      img.onload = () => {
        const result = {
          src,
          loaded: true,
          error: null,
          timestamp: Date.now()
        };
        
        this.cache.set(src, result);
        this.loadingPromises.delete(src);
        resolve(result);
      };

      img.onerror = (error) => {
        const result = {
          src,
          loaded: false,
          error: error.message || 'Failed to load image',
          timestamp: Date.now()
        };
        
        this.cache.set(src, result);
        this.loadingPromises.delete(src);
        
        if (options.rejectOnError) {
          reject(result);
        } else {
          resolve(result);
        }
      };

      // Set timeout if specified
      if (options.timeout) {
        setTimeout(() => {
          if (!this.cache.has(src)) {
            img.onload = null;
            img.onerror = null;
            
            const result = {
              src,
              loaded: false,
              error: 'Timeout',
              timestamp: Date.now()
            };
            
            this.cache.set(src, result);
            this.loadingPromises.delete(src);
            
            if (options.rejectOnError) {
              reject(result);
            } else {
              resolve(result);
            }
          }
        }, options.timeout);
      }

      img.src = src;
    });

    this.loadingPromises.set(src, loadingPromise);
    return loadingPromise;
  }

  /**
   * Preload multiple images
   * @param {Array<string>} urls - Array of image URLs to preload
   * @param {Object} options - Preload options
   * @returns {Promise} Promise that resolves when all images are processed
   */
  preloadImages(urls, options = {}) {
    if (!Array.isArray(urls) || urls.length === 0) {
      return Promise.resolve([]);
    }

    const validUrls = urls.filter(url => url && typeof url === 'string');
    
    if (validUrls.length === 0) {
      return Promise.resolve([]);
    }

    const promises = validUrls.map(url => 
      this.preloadImage(url, options).catch(error => {
        console.warn('Image preload failed:', url, error);
        return { src: url, loaded: false, error: error.message || 'Unknown error' };
      })
    );

    return Promise.all(promises);
  }

  /**
   * Check if an image is cached and loaded
   * @param {string} src - Image URL to check
   * @returns {boolean} True if image is cached and loaded
   */
  isImageLoaded(src) {
    const cached = this.cache.get(src);
    return cached && cached.loaded;
  }

  /**
   * Get cached image result
   * @param {string} src - Image URL
   * @returns {Object|null} Cached result or null
   */
  getCachedImage(src) {
    return this.cache.get(src) || null;
  }

  /**
   * Clear cache entries older than specified time
   * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
   */
  clearOldCache(maxAge = 60 * 60 * 1000) {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Cleared ${keysToDelete.length} old cached images`);
    }
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const total = this.cache.size;
    let loaded = 0;
    let failed = 0;

    for (const value of this.cache.values()) {
      if (value.loaded) {
        loaded++;
      } else {
        failed++;
      }
    }

    return {
      total,
      loaded,
      failed,
      loading: this.loadingPromises.size
    };
  }
}

// Create singleton instance
const imagePreloader = new ImagePreloader();

// Auto-cleanup old cache every 30 minutes
setInterval(() => {
  imagePreloader.clearOldCache();
}, 30 * 60 * 1000);

export default imagePreloader;

// Export class for custom instances if needed
export { ImagePreloader };

/**
 * Utility function to preload cart images
 * @param {Array} cartProducts - Array of cart products with image URLs
 * @param {Object} options - Preload options
 * @returns {Promise} Promise that resolves when images are preloaded
 */
export const preloadCartImages = async (cartProducts, options = {}) => {
  if (!Array.isArray(cartProducts) || cartProducts.length === 0) {
    return [];
  }

  // Extract image URLs from cart products
  const imageUrls = [];
  
  cartProducts.forEach(product => {
    // Add main product image
    if (product.imgSrc) {
      imageUrls.push(product.imgSrc);
    }
    
    // Add hover image if available
    if (product.imgHover) {
      imageUrls.push(product.imgHover);
    }
    
    // Add variant image if available
    if (product.variantInfo && product.variantInfo.imgSrc) {
      imageUrls.push(product.variantInfo.imgSrc);
    }
  });

  // Remove duplicates
  const uniqueUrls = [...new Set(imageUrls)];
  
  console.log(`🖼️ Preloading ${uniqueUrls.length} cart images...`);
  
  try {
    const results = await imagePreloader.preloadImages(uniqueUrls, {
      timeout: 10000, // 10 second timeout
      crossOrigin: 'anonymous',
      ...options
    });
    
    const successful = results.filter(r => r.loaded).length;
    console.log(`✅ Successfully preloaded ${successful}/${uniqueUrls.length} cart images`);
    
    return results;
  } catch (error) {
    console.error('Error preloading cart images:', error);
    return [];
  }
};