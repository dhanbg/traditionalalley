export const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

// Product endpoints
export const PRODUCTS_API = "/api/products?populate=*";
export const PRODUCTS_BY_CATEGORY_API = (category) => `/api/products?filters[category][$eq]=${category}&populate=*`;
export const PRODUCT_BY_DOCUMENT_ID_API = (documentId) => `/api/products?filters[documentId][$eq]=${documentId}&populate=*`;

// Collection endpoints
export const COLLECTIONS_API = "/api/collections?populate=*";
export const COLLECTION_BY_SLUG_API = (slug) => `/api/collections?filters[slug][$eq]=${slug}&populate=*`;
export const COLLECTION_BY_DOCUMENT_ID_API = (documentId) => `/api/collections/${documentId}?populate=*`;

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
export const SEARCH_PRODUCTS_API = (query) => `/api/products?filters[title][$containsi]=${encodeURIComponent(query)}&populate=*`;

// Hero slides endpoint
export const HERO_SLIDES_API = "/api/hero-slides?populate=*";