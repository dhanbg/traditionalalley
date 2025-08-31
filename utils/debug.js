/**
 * Debug utilities for tracking API calls and environment variables in production
 * Active in development mode by default, or in production when ENABLE_PRODUCTION_DEBUG=true
 */

// Check if debugging should be enabled
const isDebugEnabled = () => {
  return process.env.NODE_ENV === 'development' || process.env.ENABLE_PRODUCTION_DEBUG === 'true';
};

// Environment debug information
export const getEnvironmentDebug = () => {
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRAPI_API_TOKEN: process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ? '[PRESENT]' : '[MISSING]',
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Server'
  };
};

// API call debugger
export const debugApiCall = (endpoint, method = 'GET', options = {}) => {
  if (!isDebugEnabled()) return;
  
  const debugInfo = {
    endpoint,
    method,
    fullUrl: `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    options: {
      ...options,
      headers: {
        ...options.headers,
        // Mask sensitive headers for logging
        Authorization: options.headers?.Authorization ? '[PRESENT]' : '[MISSING]'
      }
    },
    environment: getEnvironmentDebug()
  };
  
  console.log(`🔍 API Debug - ${method} ${endpoint}:`, debugInfo);
  return debugInfo;
};

// API response debugger
export const debugApiResponse = (endpoint, response, data = null, error = null) => {
  if (!isDebugEnabled()) return;
  
  const debugInfo = {
    endpoint,
    status: response?.status,
    statusText: response?.statusText,
    ok: response?.ok,
    dataReceived: !!data,
    dataType: data ? typeof data : null,
    dataLength: Array.isArray(data?.data) ? data.data.length : null,
    error: error ? {
      message: error.message,
      name: error.name
    } : null,
    timestamp: new Date().toISOString()
  };
  
  const logLevel = error ? 'error' : response?.ok ? 'log' : 'warn';
  const emoji = error ? '🚨' : response?.ok ? '✅' : '⚠️';
  
  console[logLevel](`${emoji} API Response - ${endpoint}:`, debugInfo);
  
  if (data && Array.isArray(data.data)) {
    console.log(`📊 Data Preview - ${endpoint}:`, {
      totalItems: data.data.length,
      firstItem: data.data[0] || null,
      sampleFields: data.data[0] ? Object.keys(data.data[0]) : []
    });
  }
  
  return debugInfo;
};

// Media URL debugger
export const debugMediaUrl = (mediaItem, baseUrl) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const debugInfo = {
    mediaItem,
    baseUrl,
    constructedUrl: mediaItem?.url ? `${baseUrl}${mediaItem.url}` : null,
    hasUrl: !!mediaItem?.url,
    mimeType: mediaItem?.mime,
    isVideo: mediaItem?.mime?.startsWith('video/'),
    isImage: mediaItem?.mime?.startsWith('image/'),
    alternativeText: mediaItem?.alternativeText,
    timestamp: new Date().toISOString()
  };
  
  console.log('🖼️ Media URL Debug:', debugInfo);
  return debugInfo;
};

// Component mount debugger
export const debugComponentMount = (componentName, props = {}) => {
  if (!isDebugEnabled()) return;
  
  const debugInfo = {
    component: componentName,
    props: Object.keys(props),
    environment: getEnvironmentDebug(),
    timestamp: new Date().toISOString()
  };
  
  console.log(`🔧 Component Mount - ${componentName}:`, debugInfo);
  return debugInfo;
};

// Network connectivity debugger
export const debugNetworkStatus = () => {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return;
  
  const debugInfo = {
    online: navigator.onLine,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : 'Not available',
    timestamp: new Date().toISOString()
  };
  
  console.log('🌐 Network Status:', debugInfo);
  return debugInfo;
};

// Production environment checker
export const checkProductionReadiness = () => {
  const issues = [];
  
  if (!process.env.NEXT_PUBLIC_API_URL) {
    issues.push('NEXT_PUBLIC_API_URL is not set');
  }
  
  if (!process.env.NEXT_PUBLIC_STRAPI_API_TOKEN) {
    issues.push('NEXT_PUBLIC_STRAPI_API_TOKEN is not set');
  }
  
  if (process.env.NEXT_PUBLIC_API_URL?.includes('localhost')) {
    issues.push('API URL is pointing to localhost in production');
  }
  
  const readinessInfo = {
    ready: issues.length === 0,
    issues,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  if (process.env.NODE_ENV === 'development') {
    const emoji = readinessInfo.ready ? '✅' : '⚠️';
    console.log(`${emoji} Production Readiness Check:`, readinessInfo);
  }
  
  return readinessInfo;
};

// Debug panel component helper
export const createDebugPanel = (title, debugData, backgroundColor = '#f8f9fa') => {
  if (!isDebugEnabled() || !debugData) return null;
  
  return {
    style: {
      background: backgroundColor,
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '16px',
      margin: '20px auto',
      maxWidth: '1200px',
      fontSize: '12px',
      fontFamily: 'monospace',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    title: `🔍 ${title} Debug Info`,
    data: debugData
  };
};