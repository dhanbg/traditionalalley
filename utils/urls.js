export const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Explicit public URL for browser images and client-side fetch, hardcoded fallback to ensure production availability
export const API_URL = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "undefined") 
  ? process.env.NEXT_PUBLIC_API_URL 
  : "https://admin.traditionalalley.com.np";

export const getStrapiInternalUrl = () => {
  if (process.env.STRAPI_INTERNAL_URL && process.env.STRAPI_INTERNAL_URL !== "undefined") {
    return process.env.STRAPI_INTERNAL_URL;
  }
  if (process.env.STRAPI_URL && process.env.STRAPI_URL !== "undefined") {
    return process.env.STRAPI_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://82.25.105.70:1339";
};

export const INTERNAL_API_URL = getStrapiInternalUrl();


// Strapi 5 populate helpers - populate=* populates 1st level relations/media. For deep, use strictly valid syntax.
export const PRODUCT_LISTING_POPULATE = "populate[imgSrc][populate]=*&populate[imgHover][populate]=*&populate[collection][populate]=*&populate[product_variants][populate]=*";
export const PRODUCT_POPULATE = "populate[imgSrc][populate]=*&populate[imgHover][populate]=*&populate[gallery][populate]=*&populate[collection][populate]=*&populate[product_variants][populate]=*&populate[customer_reviews][populate]=*";
export const COLLECTION_POPULATE = "populate[image][populate]=*&populate[category][populate]=*&populate[products][populate][imgSrc][populate]=*&populate[products][populate][imgHover][populate]=*";
export const VARIANT_POPULATE = "populate[imgSrc][populate]=*&populate[imgHover][populate]=*&populate[gallery][populate]=*&populate[product][populate][collection][populate]=*";
export const TOP_PICKS_POPULATE = "populate[products][populate]=*&populate[product_variants][populate]=*";

// Product endpoints
export const PRODUCTS_API = `/api/products?${PRODUCT_LISTING_POPULATE}`;
export const PRODUCTS_BY_CATEGORY_API = (category) => `/api/products?filters[category][$eq]=${category}&${PRODUCT_LISTING_POPULATE}`;
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
export const SEARCH_PRODUCTS_API = (query) => `/api/products?filters[title][$containsi]=${encodeURIComponent(query)}&${PRODUCT_LISTING_POPULATE}`;

// Hero slides endpoint
export const HERO_SLIDES_API = "/api/hero-slides?populate=*";
