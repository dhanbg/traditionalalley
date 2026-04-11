// Configuration file with fallback values
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
  apiToken: process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || 'a0a99c2f396b911e2237eaf95b91e03c26fe3068b560508a0f2bb51166a6b048848ad5217bd336f770bd863049b812afbf34bb54ddf6b7e5671520176e7d4b9ab7d7461850ea5dfe616e0f6107a38b2b7b092606adb47e1810a6714496871d6f17e274aa635cbbd2eab9249aa2ef0d278d614c14f0e06f5c7b0e0f33a1ebc158',
  
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