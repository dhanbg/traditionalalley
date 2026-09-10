// Configuration file with fallback values
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
  apiToken: process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || '',
  
  // Check if we're using fallback values
  isUsingFallback: !process.env.NEXT_PUBLIC_API_URL || !process.env.NEXT_PUBLIC_STRAPI_API_TOKEN,
  
  // Get API headers
  getHeaders: () => ({
    'Authorization': `Bearer ${config.apiToken}`,
    'Content-Type': 'application/json'
  }),
  
  // Get full API URL for an endpoint
  getApiUrl: (endpoint) => `${config.apiUrl}/api/${endpoint}`
};

export default config; 