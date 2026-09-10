// API utility functions for handling rate limiting and common operations
import config from './config.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @deprecated Legacy retry utility. Do not use on public visitor requests or serverless functions.
 * Server execution strictly executes 1 attempt with 0 delay to protect Vercel Fluid Active CPU.
 */
export const fetchWithRetry = async (url, options = {}, maxRetries = 1) => {
  const isServer = typeof window === 'undefined';
  const effectiveRetries = isServer ? 1 : Math.min(maxRetries, 2);

  for (let i = 0; i < effectiveRetries; i++) {
    try {
      const fetchOptions = { ...options };
      // Attach a 10s fallback timeout if none provided
      if (!fetchOptions.signal && typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
        fetchOptions.signal = AbortSignal.timeout(10000);
      }

      const response = await fetch(url, fetchOptions);
      
      if (response.status === 429 && !isServer) {
        // Rate limited, short backoff in browser only
        const waitTime = Math.pow(2, i) * 500 + Math.random() * 500;
        await delay(waitTime);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (i === effectiveRetries - 1 || isServer) throw error;
      // Brief pause before retry (client-side browser only)
      await delay(500 * (i + 1));
    }
  }
};

/**
 * @deprecated Legacy sequential fetch utility for admin analytics.
 * Do not use for visitor-facing pages.
 */
export const fetchSequentially = async (urls, options = {}, delayMs = 0) => {
  const results = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await fetchWithRetry(urls[i], options, 1);
      const data = await response.json();
      results.push(data);
      
      // Add delay between requests only if explicitly requested and in browser
      if (delayMs > 0 && i < urls.length - 1 && typeof window !== 'undefined') {
        await delay(delayMs);
      }
    } catch (error) {
      results.push({ data: [], error: error.message });
    }
  }
  
  return results;
};

// Common Strapi API configuration
export const getStrapiHeaders = () => {
  const token = process.env.STRAPI_API_TOKEN;
  
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'Content-Type': 'application/json'
  };
};

// Safe data access with null checks
export const safeGet = (obj, path, defaultValue = null) => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined ? current : defaultValue;
};

// Currency formatter
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR'
  }).format(amount || 0);
};

// Common error handling
export const handleApiError = (error, componentName = 'Component') => {
  if (error.message.includes('429')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  if (error.message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};

// Validate environment variables
export const validateEnvironment = () => {
  // Only validate on client side to avoid hydration issues
  if (typeof window === 'undefined') {
    return { isValid: false, error: 'Server-side validation skipped' };
  }
  
  const requiredVars = ['NEXT_PUBLIC_API_URL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required environment variables: ${missing.join(', ')}. Please restart your Next.js dev server after setting these variables.` 
    };
  }
  
  return { isValid: true, error: null };
};

// Common Strapi endpoints
export const endpoints = {
  products: 'products?populate=*',
  carts: 'carts?populate=*',
  users: 'user-data?populate=*',
  userData: 'user-data?populate=*', // Alias for users
  reviews: 'customer-reviews?populate=*',
  customerReviews: 'customer-reviews?populate=*', // Alias for reviews
  collections: 'collections?populate=*',
  categories: 'categories?populate=*',
  userBags: 'user-bags?populate=*'
};

// Batch fetch common analytics data (used exclusively by client-side admin dashboard)
export const fetchAnalyticsData = async (endpointKeys = []) => {
  const isClient = typeof window !== 'undefined';
  const baseUrl = isClient ? '' : config.apiUrl;
  const headers = isClient ? { 'Content-Type': 'application/json' } : config.getHeaders();
  
  // Validate endpoint keys and build URLs
  const urls = endpointKeys.map(key => {
    if (!endpoints[key]) {
      console.error(`Unknown endpoint key: ${key}. Available keys:`, Object.keys(endpoints));
      throw new Error(`Unknown endpoint key: ${key}`);
    }
    return `${baseUrl}/api/${endpoints[key]}`;
  });
  
  try {
    // Parallel fetch with individual error isolation so one slow/failing query doesn't block the dashboard
    const fetchPromises = urls.map(url =>
      fetchWithRetry(url, { headers }, 1)
        .then(res => res.json())
        .catch(err => {
          console.warn(`[Analytics] Failed to fetch ${url}:`, err.message);
          return { data: [], error: err.message };
        })
    );

    const results = await Promise.all(fetchPromises);
    
    // Return data with endpoint keys
    const data = {};
    endpointKeys.forEach((key, index) => {
      data[key] = results[index]?.data || [];
    });
    
    return data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Analytics Data Fetch'));
  }
};

export default {
  fetchWithRetry,
  fetchSequentially,
  getStrapiHeaders,
  safeGet,
  formatCurrency,
  handleApiError,
  validateEnvironment,
  endpoints,
  fetchAnalyticsData
}; 