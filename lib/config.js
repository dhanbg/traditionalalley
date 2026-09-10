// Configuration file with fallback values
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
  apiToken: process.env.STRAPI_API_TOKEN || '',
  
  // Check if we're using fallback values
  isUsingFallback: !process.env.NEXT_PUBLIC_API_URL,
  
  // Get API headers
  getHeaders: () => ({
    ...(config.apiToken ? { 'Authorization': `Bearer ${config.apiToken}` } : {}),
    'Content-Type': 'application/json'
  }),
  
  // Get full API URL for an endpoint
  getApiUrl: (endpoint) => `${config.apiUrl}/api/${endpoint}`
};

export default config; 