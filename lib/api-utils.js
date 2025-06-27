// API utility functions for handling rate limiting and common operations
import config from './config.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Rate limiting utility with exponential backoff
export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited, wait and retry with exponential backoff
        const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000; // Add jitter
        await delay(waitTime);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Wait before retrying on other errors
      await delay(1000 * (i + 1));
    }
  }
};

// Sequential fetch with delays to avoid rate limiting
export const fetchSequentially = async (urls, options = {}, delayMs = 500) => {
  const results = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await fetchWithRetry(urls[i], options);
      const data = await response.json();
      results.push(data);
      
      // Add delay between requests except for the last one
      if (i < urls.length - 1) {
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
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || 'a0a99c2f396b911e2237eaf95b91e03c26fe3068b560508a0f2bb51166a6b048848ad5217bd336f770bd863049b812afbf34bb54ddf6b7e5671520176e7d4b9ab7d7461850ea5dfe616e0f6107a38b2b7b092606adb47e1810a6714496871d6f17e274aa635cbbd2eab9249aa2ef0d278d614c14f0e06f5c7b0e0f33a1ebc158';
  
  return {
    'Authorization': `Bearer ${token}`,
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
  
  const requiredVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_STRAPI_API_TOKEN'];
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
  users: 'user-datas?populate=*',
  userData: 'user-datas?populate=*', // Alias for users
  reviews: 'customer-reviews?populate=*',
  customerReviews: 'customer-reviews?populate=*', // Alias for reviews
  collections: 'collections?populate=*',
  categories: 'categories?populate=*',
  userBags: 'user-bags?populate=*'
};

// Batch fetch common analytics data
export const fetchAnalyticsData = async (endpointKeys = []) => {
  const baseUrl = config.apiUrl;
  const headers = config.getHeaders();
  
  // Validate endpoint keys and build URLs
  const urls = endpointKeys.map(key => {
    if (!endpoints[key]) {
      console.error(`Unknown endpoint key: ${key}. Available keys:`, Object.keys(endpoints));
      throw new Error(`Unknown endpoint key: ${key}`);
    }
    return `${baseUrl}/api/${endpoints[key]}`;
  });
  
  try {
    const results = await fetchSequentially(urls, { headers });
    
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