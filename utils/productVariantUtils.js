import { fetchDataFromApi } from "./api";
import { getBestImageUrl } from "./imageUtils";

const DEFAULT_IMAGE = '/logo.png';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

/**
 * Fetch products with their variants and return them as separate items for listing pages
 * @param {string} apiEndpoint - The API endpoint to fetch products from
 * @returns {Array} Array of products and variants as separate items
 */
export async function fetchProductsWithVariants(apiEndpoint) {
  try {
    // Fetch main products
    const productsResponse = await fetchDataFromApi(apiEndpoint);
    
    if (!productsResponse.data || productsResponse.data.length === 0) {
      return [];
    }

    const allItems = [];

    // Process each product
    for (const rawProduct of productsResponse.data) {
      if (!rawProduct) continue;

      // Transform main product
      const transformedProduct = transformProductForListing(rawProduct);
      
      // Only include active products
      if (transformedProduct.isActive !== false) {
        allItems.push({
          ...transformedProduct,
          itemType: 'product', // Mark as main product
          parentProductId: rawProduct.documentId,
          isMainProduct: true
        });
      }

      // Fetch variants for this product
      try {
        const variantsResponse = await fetchDataFromApi(
          `/api/product-variants?filters[product][documentId][$eq]=${rawProduct.documentId}&populate=*`
        );

        if (variantsResponse.data && variantsResponse.data.length > 0) {
          // Transform each variant as a separate item
          for (const rawVariant of variantsResponse.data) {
            const transformedVariant = transformVariantForListing(rawVariant, rawProduct);
            
            // Only include active variants
            if (transformedVariant.isActive !== false) {
              allItems.push({
                ...transformedVariant,
                itemType: 'variant', // Mark as variant
                parentProductId: rawProduct.documentId,
                isMainProduct: false
              });
            }
          }
        }
      } catch (variantError) {
        // Silently handle variants not found - this is expected for products without variants
        if (variantError.status !== 404) {
          console.error(`Error fetching variants for product ${rawProduct.documentId}:`, variantError);
        }
      }
    }

    return allItems;
  } catch (error) {
    console.error('Error fetching products with variants:', error);
    return [];
  }
}

/**
 * Transform a raw product from API to listing format
 * @param {Object} rawProduct - Raw product data from API
 * @returns {Object} Transformed product for listing
 */
function transformProductForListing(rawProduct) {
  if (!rawProduct) return null;

  // Get main image URL with fallback
  const imgSrc = getBestImageUrl(rawProduct.imgSrc, 'medium') || DEFAULT_IMAGE;
  
  // Get hover image URL with fallback to main image
  const imgHover = getBestImageUrl(rawProduct.imgHover, 'medium') || imgSrc;
  
  // Process gallery images if available
  const gallery = Array.isArray(rawProduct.gallery) 
    ? rawProduct.gallery
        .filter(img => img != null)
        .map(img => ({
          id: img.id || img.documentId || 0,
          url: getBestImageUrl(img, 'medium') || DEFAULT_IMAGE
        }))
    : [];

  // Process colors
  let processedColors = [];
  if (Array.isArray(rawProduct.colors)) {
    processedColors = rawProduct.colors.map(color => {
      if (typeof color === 'object' && color.name) {
        return {
          name: color.name,
          bgColor: `bg-${color.name.toLowerCase().replace(/\s+/g, '-')}`,
          imgSrc: color.imgSrc || imgSrc
        };
      } else if (typeof color === 'string') {
        return {
          name: color,
          bgColor: `bg-${color.toLowerCase().replace(/\s+/g, '-')}`,
          imgSrc: imgSrc
        };
      }
      return null;
    }).filter(Boolean);
  }

  return {
    id: rawProduct.documentId,
    documentId: rawProduct.documentId,
    title: rawProduct.title || "Untitled Product",
    price: rawProduct.price || 0,
    oldPrice: rawProduct.oldPrice || null,
    imgSrc,
    imgHover,
    gallery,
    colors: processedColors,
    sizes: rawProduct.sizes || [],
    size_stocks: rawProduct.size_stocks,
    tabFilterOptions: rawProduct.tabFilterOptions || [],
    isActive: rawProduct.isActive === true,
    isOnSale: !!rawProduct.oldPrice,
    salePercentage: rawProduct.salePercentage || "25%",
    category: rawProduct.collection?.category?.title || null,
    collection: rawProduct.collection?.title || null
  };
}

/**
 * Transform a raw variant from API to listing format
 * @param {Object} rawVariant - Raw variant data from API
 * @param {Object} parentProduct - Parent product data for context
 * @returns {Object} Transformed variant for listing
 */
function transformVariantForListing(rawVariant, parentProduct) {
  if (!rawVariant || !parentProduct) return null;

  // Get variant image URL with fallback
  const imgSrc = getBestImageUrl(rawVariant.imgSrc, 'medium') || DEFAULT_IMAGE;
  
  // Get hover image URL with fallback to main image
  const imgHover = getBestImageUrl(rawVariant.imgHover, 'medium') || imgSrc;
  
  // Process gallery images if available
  const gallery = Array.isArray(rawVariant.gallery) 
    ? rawVariant.gallery
        .filter(img => img != null)
        .map(img => ({
          id: img.id || img.documentId || 0,
          url: getBestImageUrl(img, 'medium') || DEFAULT_IMAGE
        }))
    : [];

  // Handle variant color
  let variantColor = null;
  if (rawVariant.color) {
    variantColor = {
      name: rawVariant.color.name || 'Variant',
      bgColor: `bg-${(rawVariant.color.name || 'variant').toLowerCase().replace(/\s+/g, '-')}`,
      imgSrc: getBestImageUrl(rawVariant.color, 'medium') || imgSrc
    };
  }

  // Create a title that includes the variant info
  const variantTitle = rawVariant.design 
    ? `${parentProduct.title} - ${rawVariant.design}`
    : `${parentProduct.title} (Variant)`;

  return {
    id: rawVariant.documentId,
    documentId: rawVariant.documentId,
    title: variantTitle,
    price: parentProduct.price || 0, // Use parent product price
    oldPrice: parentProduct.oldPrice || null,
    imgSrc,
    imgHover,
    gallery,
    colors: variantColor ? [variantColor] : [],
    sizes: parentProduct.sizes || [], // Use parent product sizes
    size_stocks: rawVariant.size_stocks || parentProduct.size_stocks,
    tabFilterOptions: parentProduct.tabFilterOptions || [],
    isActive: rawVariant.isActive !== false,
    isOnSale: !!parentProduct.oldPrice,
    salePercentage: parentProduct.salePercentage || "25%",
    category: parentProduct.collection?.category?.title || null,
    collection: parentProduct.collection?.title || null,
    design: rawVariant.design,
    variantId: rawVariant.documentId
  };
}

/**
 * Fetch products with variants for a specific category
 * @param {string} categoryTitle - Category title to filter by
 * @returns {Array} Array of products and variants as separate items
 */
export async function fetchProductsWithVariantsByCategory(categoryTitle) {
  const apiEndpoint = `/api/products?populate=*&filters[collection][category][title][$eq]=${categoryTitle}`;
  return fetchProductsWithVariants(apiEndpoint);
}

/**
 * Fetch products with variants for tab filtering (like Boss Lady, Juvenile, etc.)
 * @param {string} categoryTitle - Category title to filter by (e.g., "Women")
 * @returns {Array} Array of products and variants as separate items
 */
export async function fetchProductsWithVariantsForTabs(categoryTitle = "Women") {
  const apiEndpoint = `/api/products?populate=*&filters[collection][category][title][$eq]=${categoryTitle}`;
  return fetchProductsWithVariants(apiEndpoint);
}

/**
 * Search through products and variants with a query string
 * @param {string} searchQuery - The search query
 * @returns {Array} Array of matching products and variants as separate items
 */
export async function searchProductsWithVariants(searchQuery) {
  try {
    if (!searchQuery || !searchQuery.trim()) {
      return [];
    }

    // Search through products
    const searchEndpoint = `/api/products?populate=*&filters[$or][0][title][$containsi]=${searchQuery}&filters[$or][1][description][$containsi]=${searchQuery}`;
    const allItems = await fetchProductsWithVariants(searchEndpoint);
    
    // Filter results to only include active items
    return allItems.filter(item => item.isActive !== false);
  } catch (error) {
    console.error('Error searching products with variants:', error);
    return [];
  }
}

/**
 * Fetch a single product with its variants by product ID
 * @param {string} productId - The product document ID
 * @returns {Array} Array containing the product and its variants as separate items
 */
export async function fetchSingleProductWithVariants(productId) {
  try {
    if (!productId) {
      return [];
    }

    const apiEndpoint = `/api/products?filters[documentId][$eq]=${productId}&populate=*`;
    return fetchProductsWithVariants(apiEndpoint);
  } catch (error) {
    console.error('Error fetching single product with variants:', error);
    return [];
  }
}
