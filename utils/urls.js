export const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Explicit public URL for browser images and client-side fetch, hardcoded fallback to ensure production availability
export const API_URL = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "undefined") 
  ? process.env.NEXT_PUBLIC_API_URL 
  : "https://admin.traditionalalley.com.np";

// Dedicated internal server-side Docker loopback (only used on server)
export const INTERNAL_API_URL = (typeof window === 'undefined') 
  ? (process.env.STRAPI_INTERNAL_URL || process.env.STRAPI_URL || API_URL) 
  : API_URL;

// Strapi 5 populate helpers - populate=* populates 1st level relations/media. For deep, use strictly valid syntax.
export const PRODUCT_POPULATE = "populate[imgSrc][populate]=*&populate[imgHover][populate]=*&populate[gallery][populate]=*&populate[collection][populate]=*&populate[product_variants][populate]=*&populate[customer_reviews][populate]=*";
export const COLLECTION_POPULATE = "populate[image][populate]=*&populate[category][populate]=*&populate[products][populate]=*";
export const VARIANT_POPULATE = "populate[imgSrc][populate]=*&populate[imgHover][populate]=*&populate[gallery][populate]=*&populate[product][populate][collection][populate]=*";
export const TOP_PICKS_POPULATE = "populate=*&populate[products][populate]=*&populate[product_variants][populate]=*";

// Product endpoints
export const PRODUCTS_API = `/api/products?${PRODUCT_POPULATE}`;
export const PRODUCTS_BY_CATEGORY_API = (category) => `/api/products?filters[category][$eq]=${category}&${PRODUCT_POPULATE}`;
export const PRODUCT_BY_DOCUMENT_ID_API = (documentId) => `/api/products?filters[documentId][$eq]=${documentId}&${PRODUCT_POPULATE}`;

// Collection endpoints
export const COLLECTIONS_API = `/api/collections?${COLLECTION_POPULATE}`;
export const COLLECTION_BY_SLUG_API = (slug) => `/api/collections?filters[slug][$eq]=${slug}&${COLLECTION_POPULATE}`;
export const COLLECTION_BY_DOCUMENT_ID_API = (documentId) => `/api/collections/${documentId}?${COLLECTION_POPULATE}`;

// Cart endpoints
export const CARTS_API = "/api/carts?populate=*";
export const USER_CARTS_API = (userId) => `/api/carts?filters[userId][$eq]=${userId}&populate=*`;

// Reviews endpoints
export const CUSTOMER_REVIEWS_API = "/api/customer-reviews?populate=*";
export const PRODUCT_REVIEWS_API = (productDocumentId) => `/api/customer-reviews?filters[product][documentId][$eq]=${productDocumentId}&populate=*`;

// Orders endpoints
export const ORDERS_API = "/api/orders";
export const USER_BAGS_API = "/api/user-bags";

// Search endpoint
export const SEARCH_PRODUCTS_API = (query) => `/api/products?filters[title][$containsi]=${encodeURIComponent(query)}&${PRODUCT_POPULATE}`;

// Hero slides endpoint
export const HERO_SLIDES_API = "/api/hero-slides?populate=*";
