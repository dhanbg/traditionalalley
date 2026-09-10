import { API_URL, INTERNAL_API_URL, getStrapiInternalUrl, STRAPI_API_TOKEN, PRODUCTS_API, COLLECTIONS_API } from "./urls"
import { generateLocalTimestamp } from './timezone';

let memoryCollections = null;
let memoryCollectionsTime = 0;
let memoryCollectionsPromise = null;
const COLLECTIONS_CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute cache TTL

export const fetchCollectionsCached = async () => {
  const now = Date.now();
  if (memoryCollections && (now - memoryCollectionsTime < COLLECTIONS_CACHE_TTL_MS)) {
    return memoryCollections;
  }
  if (memoryCollectionsPromise) {
    return memoryCollectionsPromise;
  }

  memoryCollectionsPromise = (async () => {
    try {
      const res = await fetchDataFromApi(COLLECTIONS_API);
      if (res && res.data) {
        memoryCollections = res;
        memoryCollectionsTime = Date.now();
      }
      return res || { data: [] };
    } catch (err) {
      console.error('Error fetching cached collections:', err);
      // Fallback to stale collections cache if network error
      if (memoryCollections) return memoryCollections;
      return { data: [] };
    } finally {
      memoryCollectionsPromise = null;
    }
  })();

  return memoryCollectionsPromise;
};


// Helper function to construct proper image URLs
export const getImageUrl = (imageObj) => {
  // Only return null if truly no image data is available
  if (!imageObj) return null;
  
  // If imageObj is a string, handle as direct or relative URL
  if (typeof imageObj === 'string') {
    if (imageObj.startsWith('http')) return imageObj;
    if (imageObj.startsWith('/uploads/')) return `${API_URL}${imageObj}`;
    return imageObj;
  }
  
  // Handle the case where the URL is already a full URL
  if (imageObj.url && imageObj.url.startsWith("http")) {
    return imageObj.url;
  }
  
  // Handle the structure where URL is directly in the object
  if (imageObj.url) {
    return `${API_URL}${imageObj.url}`;
  }
  
  // Handle the structure from the sample data
  if (imageObj && typeof imageObj === 'object') {
    // Try to get image URL from the formats.small path
    if (imageObj.formats && imageObj.formats.small && imageObj.formats.small.url) {
      const smallUrl = imageObj.formats.small.url;
      return smallUrl.startsWith('http') ? smallUrl : `${API_URL}${smallUrl}`;
    }
    
    // Try to get image URL from the formats.thumbnail path
    if (imageObj.formats && imageObj.formats.thumbnail && imageObj.formats.thumbnail.url) {
      const thumbnailUrl = imageObj.formats.thumbnail.url;
      return thumbnailUrl.startsWith('http') ? thumbnailUrl : `${API_URL}${thumbnailUrl}`;
    }
    
    // Try the main URL if formats not available or don't have URLs
    if (imageObj.url) {
      return imageObj.url.startsWith('http') ? imageObj.url : `${API_URL}${imageObj.url}`;
    }
  }
  
  // Return null if no valid URL found - let the component handle fallback
  return null;
}

// Helper function to get optimized image URL based on the image object structure
export const getOptimizedImageUrl = (imgObj) => {
  if (!imgObj) return null;
  
  // If the imgObj is just a string URL, return it directly
  if (typeof imgObj === 'string') {
    return imgObj;
  }
  
  let imageUrl = null;
  
  // Handle case where imgObj is a properly formatted image object from Strapi
  if (imgObj.formats) {
    // Prioritize small format for better quality
    if (imgObj.formats.small) {
      imageUrl = imgObj.formats.small.url;
    } 
    // Fall back to thumbnail format if small isn't available
    else if (imgObj.formats.thumbnail) {
      imageUrl = imgObj.formats.thumbnail.url;
    }
    // Then medium as last resort for formats
    else if (imgObj.formats.medium) {
      imageUrl = imgObj.formats.medium.url;
    }
  }
  
  // If no optimized formats are found, use the original URL
  if (!imageUrl && imgObj.url) {
    imageUrl = imgObj.url;
  }
  
  // If the URL doesn't start with http, prepend the API URL
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/images/')) {
    imageUrl = `${API_URL}${imageUrl}`;
  }
  
  return imageUrl;
};

/**
 * Detects whether an endpoint is a Next.js API route (/api/*).
 * In the browser, all /api/* requests are routed through Next.js proxy routes
 * so secret tokens are never exposed and Edge CDN caching can be utilized.
 */
export const isNextApiRoute = (endpoint) => {
  return typeof endpoint === 'string' && endpoint.split('?')[0].startsWith('/api/');
};

/**
 * Resolves the destination URL for an API request:
 *
 * 1. SERVER-SIDE: Always routes directly to Strapi (INTERNAL_API_URL).
 *    Guarantees: Server Component -> fetchDataFromApi() -> Strapi DIRECTLY.
 *    Strictly prevents Server Component -> Next.js /api route -> Strapi (function chaining).
 *    Even if a full URL like `https://traditionalalley.com.np/api/products` was passed,
 *    it strips the frontend origin and redirects directly to Strapi internal URL.
 *
 * 2. BROWSER-SIDE:
 *    - /api/* paths -> relative URL for Next.js API proxy / Vercel Edge CDN.
 *    - External http(s):// -> as-is.
 *    - Non-/api assets -> prepended with public API_URL.
 */
export const getFetchUrl = (endpoint) => {
  if (!endpoint || typeof endpoint !== 'string') return '';

  const isServer = typeof window === 'undefined';

  if (isServer) {
    // If a full frontend URL was passed on the server, rewrite to Strapi directly
    if (endpoint.includes('/api/')) {
      const apiPath = endpoint.substring(endpoint.indexOf('/api/'));
      return `${getStrapiInternalUrl()}${apiPath}`;
    }
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint; // External third-party API
    }
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${getStrapiInternalUrl()}${cleanPath}`;
  }

  // Browser-side:
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  if (endpoint.startsWith('/api/')) {
    return endpoint; // Relative URL for browser to hit Next.js API / Edge CDN
  }
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanPath}`;
};

const PUBLIC_CATALOG_PREFIXES = [
  '/api/products',
  '/api/hero-slides',
  '/api/offers',
  '/api/top-picks',
  '/api/instagrams',
  '/api/categories',
  '/api/collections',
  '/api/product-variants',
  '/api/customer-reviews',
  '/api/shipping-rates',
  '/api/countries',
  '/api/cities',
  '/api/ncm/branches',
];

export const shouldCacheEndpoint = (endpoint) => {
  if (typeof endpoint !== 'string') return false;
  const path = endpoint.split('?')[0];
  return PUBLIC_CATALOG_PREFIXES.some(prefix => path.startsWith(prefix));
};

/**
 * Detect transient network and socket closure errors (e.g. UND_ERR_SOCKET, ECONNRESET)
 * caused by stale pooled keep-alive sockets or temporary TLS handshake resets.
 */
const isTransientSocketError = (error) => {
  if (!error) return false;
  const errorName = error.name || error.cause?.name || '';
  const msg = (error.cause?.message || error.message || '').toLowerCase();
  
  // Never retry abort or timeout errors to prevent doubling Vercel Fluid Active CPU time
  if (
    errorName === 'AbortError' || 
    errorName === 'TimeoutError' || 
    msg.includes('timed out') || 
    msg.includes('timeout')
  ) {
    return false;
  }

  const code = error.cause?.code || error.code;
  return (
    code === 'ECONNRESET' ||
    code === 'UND_ERR_SOCKET' ||
    code === 'ECONNREFUSED' ||
    msg.includes('other side closed') ||
    msg.includes('socket disconnected') ||
    msg.includes('tls connection was established') ||
    msg.includes('premature close') ||
    msg.includes('socket hang up')
  );
};

/**
 * Execute fetch with controlled timeout (5s for public catalog, 10s for transactional)
 * and transparent 1x retry on transient socket errors.
 */
const executeWithRetry = async (fetchUrl, fetchOptions, timeoutMs = 5000) => {
  const isServer = typeof window === 'undefined';
  const maxAttempts = isServer ? 2 : 1; // Strict maximum 1 retry on server for socket resets

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    let controller = null;
    let timeoutId = null;

    try {
      const currentOptions = { ...fetchOptions };

      // Set up abort timeout on server side if no signal provided
      if (isServer && !currentOptions.signal && typeof AbortController !== 'undefined') {
        controller = new AbortController();
        currentOptions.signal = controller.signal;
        timeoutId = setTimeout(() => {
          controller.abort(new Error(`Strapi request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }

      const res = await fetch(fetchUrl, currentOptions);
      if (timeoutId) clearTimeout(timeoutId);
      return res;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);

      // Check if transient socket error can be retried exactly once on a fresh connection
      if (attempt < maxAttempts && isTransientSocketError(error)) {
        console.warn(`[Strapi API] Transient socket error on attempt ${attempt} (${error.cause?.code || error.message}). Retrying once on fresh socket...`);
        // Short pause (100ms) before retry to let OS TCP stack reset cleanly
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      throw error;
    }
  }
};

export const fetchDataFromApi = async (endpoint) => {
  const options = {
    method: "GET",
    headers: {
      ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
    },
  };

  try {
    // Check for known invalid product IDs to avoid unnecessary API calls
    if (endpoint.includes('/api/products/')) {
      // Extract the product ID from the endpoint
      const match = endpoint.match(/\/api\/products\/(\d+)/);
      if (match && match[1]) {
        const productId = parseInt(match[1]);
        // Immediately reject known invalid product IDs
        if ([55, 60, 61].includes(productId)) {
          const error = new Error(`HTTP error! status: 404`);
          error.status = 404;
          error.detail = { error: `Product with ID ${productId} is known to be invalid` };
          throw error;
        }
      }
    }
    
    // Make sure the endpoint is properly encoded for any special characters
    let processedEndpoint = endpoint;
    if (endpoint.startsWith('/api/carts') && !endpoint.includes('status=') && !endpoint.includes('publicationState=')) {
      const separator = endpoint.includes('?') ? '&' : '?';
      processedEndpoint = `${endpoint}${separator}status=draft&publicationState=preview`;
    }
    if (processedEndpoint.includes('?')) {
      const [basePath, queryString] = processedEndpoint.split('?');
      const params = new URLSearchParams(queryString);
      processedEndpoint = `${basePath}?${params.toString()}`;
    }

    let fetchUrl = getFetchUrl(processedEndpoint);
    const isCacheable = shouldCacheEndpoint(processedEndpoint);

    // Only add cache-busting timestamp to mutable/user-specific endpoints (cart, bag, user-data, etc.)
    // NEVER to public catalog endpoints, to allow browser and Vercel CDN caching
    if (typeof window !== 'undefined' && !isCacheable) {
      const separator = fetchUrl.includes('?') ? '&' : '?';
      fetchUrl = `${fetchUrl}${separator}_t=${Date.now()}`;
    }
    const isRoute = isNextApiRoute(processedEndpoint);
    
    const fetchOptions = { ...options };
    if (typeof window !== 'undefined') {
      if (isRoute) {
        if (!isCacheable) {
          fetchOptions.headers = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          };
        } else {
          // Public cacheable Next.js API route: omit Authorization so Vercel Edge CDN can cache
          fetchOptions.headers = {};
        }
      }
    } else if (isCacheable) {
      // Server-side cacheable Strapi fetch: force Next.js 15 Data Cache to cache despite Authorization header
      fetchOptions.cache = 'force-cache';
      fetchOptions.next = { revalidate: 60 };
    }

    // Public catalog gets 5s timeout to minimize Vercel Fluid Active CPU on serverless functions.
    // Private/authenticated/transactional endpoints get 10s.
    const timeoutMs = isCacheable ? 5000 : 10000;

    let res;
    try {
      res = await executeWithRetry(fetchUrl, fetchOptions, timeoutMs);
    } catch (networkError) {
      console.error(`[Strapi API] Network fetch failed for ${processedEndpoint}:`, networkError.message);
      // In server components (SSR/ISR/RSC), return graceful error structure rather than crashing with unhandled 500
      if (typeof window === 'undefined') {
        return {
          data: null,
          meta: { error: networkError.message },
          success: false,
        };
      }
      throw networkError;
    }
    
    if (!res.ok) {
      // Try to read the error response body
      const errorBody = await res.text();
      let errorDetail;
      
      try {
        errorDetail = JSON.parse(errorBody);
      } catch (e) {
        errorDetail = errorBody;
      }
      
      // Instead of throwing, return the error response
      return {
        success: false,
        error: `HTTP error! status: ${res.status}`,
        status: res.status,
        detail: errorDetail
      };
    }
    
    return res.json();
  } catch (error) {
    throw error;
  }
}

export const createData = async (endpoint, data) => {
  const isRoute = isNextApiRoute(endpoint);
  const headers = {
    "Content-Type": "application/json",
    ...(STRAPI_API_TOKEN && (typeof window === 'undefined' || !isRoute) ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
  };
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  };
  
  try {
    const fetchUrl = getFetchUrl(endpoint);
    const res = await fetch(fetchUrl, options);
    
    if (!res.ok) {
      // Try to get the response body to include more details
      let errorBody = null;
      try {
        errorBody = await res.text();
      } catch (e) {
        // Ignore if we can't read the body
      }
      throw new Error(`HTTP error! status: ${res.status}, body: ${errorBody}`);
    }
    
    return res.json();
  } catch (error) {
    throw error;
  }
};

export const updateData = async (endpoint, data) => {
  const fetchUrl = getFetchUrl(endpoint);
  const isRoute = isNextApiRoute(endpoint);
  
  // Cloudflare WAF blocks raw PUT/PATCH requests (403 Forbidden).
  // We send a POST request with X-HTTP-Method-Override: PUT headers.
  const headers = {
    "Content-Type": "application/json",
    "X-HTTP-Method-Override": "PUT",
    "X-Method-Override": "PUT",
    "X-HTTP-Method": "PUT",
    ...(STRAPI_API_TOKEN && (typeof window === 'undefined' || !isRoute) ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
  };
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  };
  
  try {
    let res = await fetch(fetchUrl, options);
    let responseText = await res.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      // Response is not JSON
    }

    // If method override was not accepted (405) or blocked, try dedicated endpoints
    if (!res.ok) {
      console.warn(`⚠️ [updateData] Initial POST override to ${fetchUrl} returned ${res.status}. Attempting dedicated fallback...`);

      // 1. Fallback for user-bags update
      if (endpoint.includes('/api/user-bags/')) {
        const bagIdMatch = endpoint.match(/\/api\/user-bags\/([^?]+)/);
        if (bagIdMatch && bagIdMatch[1]) {
          const bagDocumentId = bagIdMatch[1];
          const hasUserOrders = data?.data?.user_orders !== undefined || data?.user_orders !== undefined;
          const hasCod = data?.data?.cod !== undefined || data?.cod !== undefined;

          if (hasUserOrders) {
            const fallbackUrl = getFetchUrl('/api/user-bags/update-orders');
            const fallbackRes = await fetch(fallbackUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(STRAPI_API_TOKEN && typeof window === 'undefined' ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
              },
              body: JSON.stringify({
                documentId: bagDocumentId,
                user_orders: data?.data?.user_orders || data?.user_orders
              })
            });
            if (fallbackRes.ok) {
              const fbData = await fallbackRes.json();
              return fbData;
            }
          }

          if (hasCod) {
            const fallbackUrl = getFetchUrl('/api/user-bags/update-cod');
            const fallbackRes = await fetch(fallbackUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(STRAPI_API_TOKEN && typeof window === 'undefined' ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
              },
              body: JSON.stringify({
                documentId: bagDocumentId,
                cod: data?.data?.cod || data?.cod
              })
            });
            if (fallbackRes.ok) {
              const fbData = await fallbackRes.json();
              return fbData;
            }
          }
        }
      }

      // 2. Fallback for products stock update
      if (endpoint.includes('/api/products/')) {
        const prodIdMatch = endpoint.match(/\/api\/products\/([^?]+)/);
        if (prodIdMatch && prodIdMatch[1] && (data?.data?.size_stocks || data?.size_stocks)) {
          const prodDocumentId = prodIdMatch[1];
          const fallbackUrl = getFetchUrl('/api/products/update-stock');
          const fallbackRes = await fetch(fallbackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(STRAPI_API_TOKEN && typeof window === 'undefined' ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
            },
            body: JSON.stringify({
              documentId: prodDocumentId,
              size_stocks: data?.data?.size_stocks || data?.size_stocks
            })
          });
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            return fbData;
          }
        }
      }


      const error = new Error(`Update failed: ${res.statusText}`);
      error.status = res.status;
      error.detail = responseData || responseText;
      error.url = fetchUrl;
      throw error;
    }
    
    return responseData;
  } catch (error) {
    throw error;
  }
}

export const deleteData = async (endpoint) => {
  let cleanEndpoint = endpoint;
  
  try {
    // For cart deletions, use POST-based delete to bypass Cloudflare WAF
    if (cleanEndpoint.includes('/api/carts/')) {
      const cartIdMatch = cleanEndpoint.match(/\/api\/carts\/([^?]+)/);
      if (cartIdMatch && cartIdMatch[1] && cartIdMatch[1] !== 'delete' && cartIdMatch[1] !== 'delete-item') {
        const cartId = cartIdMatch[1];
        console.log(`🗑️ [deleteData] Using POST cart delete for cart ID: ${cartId}`);
        
        // Try Next.js internal delete route first if in browser
        if (typeof window !== 'undefined') {
          const res = await fetch('/api/carts/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: cartId }),
          });

          if (res.ok) {
            const resData = await res.json().catch(() => ({ success: true }));
            return resData;
          }
        }

        // Try Strapi /api/carts/delete-item
        const strapiDeleteUrl = getFetchUrl('/api/carts/delete-item');
        const strapiRes = await fetch(strapiDeleteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(STRAPI_API_TOKEN && typeof window === 'undefined' ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
          },
          body: JSON.stringify({ documentId: cartId }),
        });

        if (strapiRes.ok) {
          const sData = await strapiRes.json().catch(() => ({ success: true, deletedId: cartId }));
          return sData;
        }
      }
    }

    // Standard DELETE via POST method override
    const isRoute = isNextApiRoute(cleanEndpoint);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HTTP-Method-Override": "DELETE",
        "X-Method-Override": "DELETE",
        "X-HTTP-Method": "DELETE",
        ...(STRAPI_API_TOKEN && (typeof window === 'undefined' || !isRoute) ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
      },
    };

    let fetchUrl = getFetchUrl(cleanEndpoint);
    let res = await fetch(fetchUrl, options);
    
    // Fallback try with status=draft if 404
    if (!res.ok && res.status === 404 && cleanEndpoint.includes('/api/carts')) {
      const separator = cleanEndpoint.includes('?') ? '&' : '?';
      const draftEndpoint = `${cleanEndpoint}${separator}status=draft`;
      const draftFetchUrl = getFetchUrl(draftEndpoint);
      const draftRes = await fetch(draftFetchUrl, options);
      if (draftRes.ok) {
        res = draftRes;
      }
    }
    
    let responseText;
    try {
      responseText = await res.text();
    } catch (textError) {}
    
    let responseData;
    try {
      if (responseText && responseText.trim().length > 0) {
        responseData = JSON.parse(responseText);
      }
    } catch (parseError) {}
    
    if (!res.ok) {
      const error = new Error(`Delete failed: ${res.statusText}`);
      error.status = res.status;
      error.detail = responseData || responseText;
      error.url = fetchUrl;
      throw error;
    }
    
    return responseData || { success: true };
  } catch (error) {
    throw error;
  }
}

export const getCurrentUserCart = async (user) => {
  if (!user) {
    return { data: [] };
  }
  
  try {
    const userCartEndpoint = `/api/carts?filters[userId][$eq]=${user.id}&populate=*`;
    const cartData = await fetchDataFromApi(userCartEndpoint);
    return cartData;
  } catch (error) {
    throw error;
  }
}

export const fetchFilterOptions = async (categoryTitle) => {
  try {
    if (!categoryTitle) {
      return {
        collections: [],
        colors: [],
        sizes: [],
        availabilityOptions: [
          { id: "inStock", label: "In stock", count: 0, value: true },
          { id: "outStock", label: "Out of stock", count: 0, value: false }
        ],
        priceRange: [20, 300]
      };
    }
    
    // Properly encode the category title for the URL
    const encodedCategoryTitle = encodeURIComponent(categoryTitle);
    
    // Use a simpler query to avoid potential encoding issues
    const endpoint = `${PRODUCTS_API}&filters[collection][category][title]=${encodedCategoryTitle}`;
    
    // Fetch products for the category to extract filter options
    const response = await fetchDataFromApi(endpoint);
    
    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      return {
        collections: [],
        colors: [],
        sizes: [],
        availabilityOptions: [
          { id: "inStock", label: "In stock", count: 0, value: true },
          { id: "outStock", label: "Out of stock", count: 0, value: false }
        ],
        priceRange: [20, 300]
      };
    }

    const products = response.data;
    
    // Extract unique collections instead of brands
    const uniqueCollections = new Map();
    products.forEach(product => {
      if (product && product.collection && product.collection.id) {
        if (!uniqueCollections.has(product.collection.id)) {
          uniqueCollections.set(product.collection.id, {
            id: product.collection.id,
            documentId: product.collection.documentId,
            name: product.collection.name,
            slug: product.collection.slug,
            count: 1
          });
        } else {
          // Increment count for this collection
          const collection = uniqueCollections.get(product.collection.id);
          collection.count += 1;
          uniqueCollections.set(product.collection.id, collection);
        }
      }
    });
    
    const collections = Array.from(uniqueCollections.values());
    
    // Extract unique colors
    const uniqueColors = new Map(); // Use Map to store colors with their imgSrc
    products.forEach(product => {
      if (product && product.colors && Array.isArray(product.colors)) {
        if (product.colors.length > 0) {
          product.colors.forEach(color => {
            if (typeof color === 'string') {
              // Handle string format (fallback to CSS classes)
              if (color) {
                const className = `bg-${color.toLowerCase().replace(/\s+/g, '-')}`;
                uniqueColors.set(color, { 
                  name: color, 
                  className,
                  imgSrc: null
                });
              }
            } else if (color && typeof color === 'object') {
              // Handle object format with name and imgSrc
              if (color.name) {
                const className = `bg-${color.name.toLowerCase().replace(/\s+/g, '-')}`;
                // If this color already exists in the map but doesn't have an imgSrc, and this one does, update it
                if (!uniqueColors.has(color.name) || 
                    (color.imgSrc && !uniqueColors.get(color.name).imgSrc)) {
                  uniqueColors.set(color.name, {
                    name: color.name,
                    className: className,
                    imgSrc: color.imgSrc || null
                  });
                }
              }
            }
          });
        }
      }
    });
    
    const colors = Array.from(uniqueColors.values()).map(color => {
      return {
        name: color.name,
        className: color.name.toLowerCase() === 'white' ? `${color.className} line-black` : color.className,
        imgSrc: color.imgSrc
      };
    });
    
    // Extract unique sizes from size_stocks (only sizes with available stock)
    const uniqueSizes = new Set();
    products.forEach(product => {
      // Check main product size_stocks
      if (product && product.size_stocks && typeof product.size_stocks === 'object') {
        Object.entries(product.size_stocks).forEach(([size, stock]) => {
          if (stock > 0) { // Only include sizes with available stock
            uniqueSizes.add(size);
          }
        });
      }
      
      // Check product variants size_stocks
      if (product && product.product_variants && Array.isArray(product.product_variants)) {
        product.product_variants.forEach(variant => {
          if (variant && variant.size_stocks && typeof variant.size_stocks === 'object') {
            Object.entries(variant.size_stocks).forEach(([size, stock]) => {
              if (stock > 0) { // Only include sizes with available stock
                uniqueSizes.add(size);
              }
            });
          }
        });
      }
    });
    
    const sizes = Array.from(uniqueSizes);
    
    // Get availability options with counts
    const inStockCount = products.filter(p => p && p.inStock === true).length;
    const outOfStockCount = products.filter(p => p && p.inStock === false).length;
    
    const availabilityOptions = [
      { 
        id: "inStock", 
        label: "In stock", 
        count: inStockCount,
        value: true 
      },
      { 
        id: "outStock", 
        label: "Out of stock", 
        count: outOfStockCount,
        value: false 
      }
    ];
    
    // Determine price range
    const allPrices = products.map(p => p && typeof p.price === 'number' ? p.price : null).filter(Boolean);
    const minPrice = allPrices.length > 0 ? Math.floor(Math.min(...allPrices)) : 20;
    const maxPrice = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : 300;
    const priceRange = [minPrice, maxPrice];
    
    return {
      collections,
      colors,
      sizes,
      availabilityOptions,
      priceRange
    };
  } catch (error) {
    // Return default values on error
    return {
      collections: [],
      colors: [],
      sizes: [],
      availabilityOptions: [
        { id: "inStock", label: "In stock", count: 0, value: true },
        { id: "outStock", label: "Out of stock", count: 0, value: false }
      ],
      priceRange: [20, 300]
    };
  }
};

export const updateUserBagWithPayment = async (userBagDocumentId, paymentData) => {
  try {
    // First, fetch the current user-bag to get existing user_orders and user relation
    let currentBag = {};
    try {
      const currentBagResponse = await fetchDataFromApi(`/api/user-bags/${userBagDocumentId}?populate=user_datum`);
      if (currentBagResponse?.data) {
        currentBag = currentBagResponse.data;
      }
    } catch (fetchErr) {
      console.warn(`⚠️ [updateUserBagWithPayment] Could not fetch bag ${userBagDocumentId}:`, fetchErr.message);
    }

    const currentUserOrders = currentBag.user_orders || {};
    
    // Initialize payments array if it doesn't exist
    const existingPayments = currentUserOrders.payments || [];
    
    // Check if a payment with the same merchantTxnId already exists (NPS only)
    let existingPaymentIndex = -1;
    if (paymentData.provider === 'nps' && paymentData.merchantTxnId) {
      existingPaymentIndex = existingPayments.findIndex(payment => payment.merchantTxnId === paymentData.merchantTxnId);
    }
    
    let updatedPayments;
    if (existingPaymentIndex !== -1) {
      updatedPayments = [...existingPayments];
      updatedPayments[existingPaymentIndex] = {
        ...updatedPayments[existingPaymentIndex],
        ...paymentData,
        timestamp: generateLocalTimestamp()
      };
    } else {
      updatedPayments = [...existingPayments, paymentData];
    }
    
    const updatedUserOrders = {
      ...currentUserOrders,
      payments: updatedPayments
    };

    const updatePayload = {
      data: {
        user_orders: updatedUserOrders
      }
    };

    // 1. Try updating existing user bag
    try {
      if (userBagDocumentId) {
        const updateResponse = await updateData(`/api/user-bags/${userBagDocumentId}`, updatePayload);
        if (updateResponse && updateResponse.data) {
          console.log(`✅ [updateUserBagWithPayment] Existing bag updated successfully:`, userBagDocumentId);
          return updateResponse;
        }
      }
    } catch (updateErr) {
      console.warn(`⚠️ [updateUserBagWithPayment] Update failed, falling back to direct POST creation:`, updateErr.message);
    }

    // 2. Guaranteed Fallback: Create/save order bag via POST /api/user-bags (100% permitted by Cloudflare & Strapi)
    const createBagPayload = {
      data: {
        Name: currentBag.Name || paymentData.orderData?.receiver_details?.fullName || paymentData.orderData?.customer_info?.name || 'Customer Order',
        user_datum: currentBag.user_datum?.documentId || paymentData.authUserId || undefined,
        user_orders: updatedUserOrders,
        publishedAt: new Date().toISOString()
      }
    };

    const fallbackResponse = await createData('/api/user-bags', createBagPayload);
    console.log(`✅ [updateUserBagWithPayment] Order saved to Strapi user-bags via POST:`, fallbackResponse?.data?.documentId);
    return fallbackResponse;
    
  } catch (error) {
    console.error('❌ [updateUserBagWithPayment] Error:', error);
    throw error;
  }
};

// Note: Order record creation removed from automation per user requirements
// Automation now only performs stock updates and cart cleanup like the manual button


// Function to update product stock after successful payment
export const updateProductStock = async (purchasedProducts) => {
  const updateResults = [];
  
  for (const product of purchasedProducts) {
    try {
      // Fetch current product data to get latest stock information
      const currentProductResponse = await fetchDataFromApi(`/api/products/${product.documentId}?populate=*`);
      
      if (!currentProductResponse || !currentProductResponse.data) {
        updateResults.push({ productId: product.documentId, success: false, error: 'Product not found' });
        continue;
      }
      
      const currentProduct = currentProductResponse.data;
      
      // Determine which stock to update (product or variant)
      let stockToUpdate = null;
      let updateEndpoint = null;
      let sizeStocks = null;
      
      // Check if this is a variant product
      if (product.variantId && currentProduct.variants && currentProduct.variants.length > 0) {
        // Find the specific variant
        const variant = currentProduct.variants.find(v => v.documentId === product.variantId);
        if (variant && variant.size_stocks) {
          stockToUpdate = variant;
          updateEndpoint = `/api/variants/${variant.documentId}`;
          sizeStocks = variant.size_stocks;
        }
      }
      
      // If no variant or variant doesn't have size_stocks, use main product
      if (!stockToUpdate && currentProduct.size_stocks) {
        stockToUpdate = currentProduct;
        updateEndpoint = `/api/products/${currentProduct.documentId}`;
        sizeStocks = currentProduct.size_stocks;
      }
      
      if (!stockToUpdate || !sizeStocks) {
        updateResults.push({ productId: product.documentId, success: false, error: 'No size_stocks available' });
        continue;
      }
      
      // Parse size_stocks if it's a string
      let parsedSizeStocks = sizeStocks;
      if (typeof sizeStocks === 'string') {
        try {
          parsedSizeStocks = JSON.parse(sizeStocks);
        } catch (parseError) {
          updateResults.push({ productId: product.documentId, success: false, error: 'Invalid size_stocks format' });
          continue;
        }
      }
      
      // Get the size to update
      const sizeToUpdate = product.selectedSize || product.size;
      if (!sizeToUpdate) {
        updateResults.push({ productId: product.documentId, success: false, error: 'No size specified' });
        continue;
      }
      
      // Check if the size exists in stock
      if (!(sizeToUpdate in parsedSizeStocks)) {
        updateResults.push({ productId: product.documentId, success: false, error: `Size ${sizeToUpdate} not in stock` });
        continue;
      }
      
      // Calculate new stock
      const currentStock = parseInt(parsedSizeStocks[sizeToUpdate]) || 0;
      const quantityPurchased = parseInt(product.quantity) || 1;
      const newStock = Math.max(0, currentStock - quantityPurchased); // Ensure stock doesn't go negative
      
      // Update the size_stocks object
      const updatedSizeStocks = {
        ...parsedSizeStocks,
        [sizeToUpdate]: newStock
      };
      
      // Prepare the update data
      const stockUpdatePayload = {
        data: {
          size_stocks: updatedSizeStocks
        }
      };
      
      // Update the product or variant
      const updateResponse = await updateData(updateEndpoint, stockUpdatePayload);
      
      if (updateResponse && updateResponse.data) {
        updateResults.push({ 
          productId: product.documentId, 
          success: true, 
          size: sizeToUpdate,
          oldStock: currentStock,
          newStock: newStock,
          quantityPurchased: quantityPurchased
        });
      } else {
        updateResults.push({ productId: product.documentId, success: false, error: 'Update request failed' });
      }
      
    } catch (error) {
      updateResults.push({ productId: product.documentId, success: false, error: error.message });
    }
  }
  
  // Calculate summary
  const successCount = updateResults.filter(r => r.success).length;
  const failureCount = updateResults.filter(r => !r.success).length;
  
  return {
    totalProducts: purchasedProducts.length,
    successCount,
    failureCount,
    results: updateResults
  };
};

// Create order record in Strapi user_orders collection
export const createOrderRecord = async (orderData, userId) => {
  try {
    const fetchUrl = getFetchUrl('/api/user-orders');
    const isRoute = isNextApiRoute('/api/user-orders');
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_API_TOKEN && (typeof window === 'undefined' || !isRoute) ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        data: {
          ...orderData,
          userId: userId,
          createdAt: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export const updateUserBagWithCOD = async (userBagDocumentId, codOrderData) => {
  try {
    let currentBag = {};
    try {
      const currentBagResponse = await fetchDataFromApi(`/api/user-bags/${userBagDocumentId}?populate=user_datum`);
      if (currentBagResponse?.data) {
        currentBag = currentBagResponse.data;
      }
    } catch (fetchErr) {
      console.warn(`⚠️ [updateUserBagWithCOD] Could not fetch bag ${userBagDocumentId}:`, fetchErr.message);
    }

    const existingCodOrders = currentBag.cod || [];
    const updatedCodOrders = [...existingCodOrders, codOrderData];

    const updatePayload = {
      data: {
        cod: updatedCodOrders
      }
    };

    // 1. Try updating existing bag
    try {
      if (userBagDocumentId) {
        const updateResponse = await updateData(`/api/user-bags/${userBagDocumentId}`, updatePayload);
        if (updateResponse && updateResponse.data) {
          console.log(`✅ [updateUserBagWithCOD] Existing bag updated with COD successfully:`, userBagDocumentId);
          return updateResponse;
        }
      }
    } catch (updateErr) {
      console.warn(`⚠️ [updateUserBagWithCOD] Direct update failed, creating COD bag record via POST:`, updateErr.message);
    }

    // 2. Guaranteed Fallback: Create bag record with POST /api/user-bags (100% permitted by Cloudflare & Strapi)
    const createBagPayload = {
      data: {
        Name: currentBag.Name || codOrderData.orderData?.receiver_details?.fullName || codOrderData.orderData?.customer_info?.name || 'COD Customer Order',
        user_datum: currentBag.user_datum?.documentId || codOrderData.authUserId || undefined,
        cod: updatedCodOrders,
        publishedAt: new Date().toISOString()
      }
    };

    const fallbackResponse = await createData('/api/user-bags', createBagPayload);
    console.log(`✅ [updateUserBagWithCOD] COD order successfully saved to Strapi user-bags via POST:`, fallbackResponse?.data?.documentId);
    return fallbackResponse;
    
  } catch (error) {
    console.error('❌ [updateUserBagWithCOD] Error:', error);
    throw error;
  }
};
