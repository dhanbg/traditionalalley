export const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://admin.traditionalalley.com.np";

// Product endpoints
export const PRODUCTS_API = "/api/products?populate=*";
export const PRODUCTS_BY_CATEGORY_API = (category) => `/api/products?filters[category][$eq]=${category}&populate=*`;
export const PRODUCT_BY_DOCUMENT_ID_API = (documentId) => `/api/products/${documentId}?populate=*`;

// Collection endpoints
export const COLLECTIONS_API = "/api/collections?populate=*";
export const COLLECTION_BY_SLUG_API = (slug) => `/api/collections?filters[slug][$eq]=${slug}&populate=*`;
export const COLLECTION_BY_DOCUMENT_ID_API = (documentId) => `/api/collections/${documentId}?populate=*`;