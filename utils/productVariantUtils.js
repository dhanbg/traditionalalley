import { fetchDataFromApi } from "./api";
import { getBestImageUrl } from "./imageUtils";

/**
 * Check if the logged-in user has used the WELCOMETOTA coupon
 * @param {string} userId - The user's ID or email
 * @returns {Promise<{hasUsed: boolean, couponData: object|null}>} Object indicating if user has used the coupon and coupon details
 */
export async function checkWelcomeCouponUsage(userId) {
  try {
    // Fetch all coupons with populated data
    const couponsResponse = await fetchDataFromApi('/api/coupons?populate=*');
    
    if (!couponsResponse.data || couponsResponse.data.length === 0) {
      return { hasUsed: false, couponData: null };
    }

    // Find the WELCOMETOTA coupon (case-insensitive)
    const welcomeCoupon = couponsResponse.data.find(coupon => 
      coupon.code && coupon.code.toLowerCase() === 'welcometota'
    );

    if (!welcomeCoupon) {
      return { hasUsed: false, couponData: null };
    }

    // Debug: Log the usedByUserData to see what's there
    console.log('🔍 DEBUG: welcomeCoupon.usedByUserData:', welcomeCoupon.usedByUserData);
    console.log('🔍 DEBUG: Current userId:', userId);
    
    // Check if the user has used this coupon
    const hasUsedCoupon = welcomeCoupon.usedByUserData && 
      welcomeCoupon.usedByUserData.some(userData => {
        console.log('🔍 DEBUG: Checking userData with ALL fields:', JSON.stringify(userData, null, 2));
        console.log('🔍 DEBUG: Object.keys(userData):', Object.keys(userData));
        console.log('🔍 DEBUG: userData.userId === userId?', userData.userId === userId);
        console.log('🔍 DEBUG: userData.userEmail === userId?', userData.userEmail === userId);
        
        // Check all possible fields that might contain the user identifier
        console.log('🔍 DEBUG: Checking possible user identifier fields:');
        console.log('  - userData.id:', userData.id);
        console.log('  - userData.documentId:', userData.documentId);
        console.log('  - userData.email:', userData.email);
        console.log('  - userData.authId:', userData.authId);
        console.log('  - userData.googleId:', userData.googleId);
        console.log('  - userData.providerId:', userData.providerId);
        
        // Fix: Check authUserId (contains Google auth ID) and email instead of non-existent userId/userEmail
        const matchesAuthId = userData.authUserId === userId;
        const matchesEmail = userData.email === userId;
        
        console.log('🔍 DEBUG: Fixed field checks:');
        console.log('  - userData.authUserId === userId?', matchesAuthId);
        console.log('  - userData.email === userId?', matchesEmail);
        
        return matchesAuthId || matchesEmail;
      });
    
    console.log('🔍 DEBUG: Final hasUsedCoupon result:', hasUsedCoupon);

    return {
      hasUsed: hasUsedCoupon,
      couponData: welcomeCoupon,
      isActive: welcomeCoupon.isActive,
      isValid: isValidCoupon(welcomeCoupon)
    };
  } catch (error) {
    console.error('Error checking WELCOMETOTA coupon usage:', error);
    return { hasUsed: false, couponData: null, error: error.message };
  }
}

/**
 * Check if a coupon is currently valid (active and within date range)
 * @param {object} coupon - The coupon object
 * @returns {boolean} True if coupon is valid
 */
function isValidCoupon(coupon) {
  if (!coupon || !coupon.isActive) {
    return false;
  }

  const now = new Date();
  const validFrom = new Date(coupon.validFrom);
  const validUntil = new Date(coupon.validUntil);

  return now >= validFrom && now <= validUntil;
}

/**
 * Get welcome coupon data for auto-selection if user hasn't used it
 * @param {string} userId - The user's ID or email
 * @returns {Promise<object|null>} Coupon data for auto-selection or null
 */
export async function getWelcomeCouponForAutoSelection(userId) {
  try {
    console.log('🔍 DEBUG: Checking welcome coupon for auto-selection, userId:', userId);
    const couponCheck = await checkWelcomeCouponUsage(userId);
    
    console.log('🔍 DEBUG: Coupon check result:', {
      hasUsed: couponCheck.hasUsed,
      isValid: couponCheck.isValid,
      isActive: couponCheck.isActive,
      hasCouponData: !!couponCheck.couponData,
      couponCode: couponCheck.couponData?.code
    });
    
    // Return coupon data only if user hasn't used it and it's valid
    if (!couponCheck.hasUsed && couponCheck.isValid && couponCheck.couponData) {
      console.log('✅ DEBUG: Returning coupon data for auto-selection');
      return {
        code: couponCheck.couponData.code,
        description: couponCheck.couponData.description,
        discountType: couponCheck.couponData.discountType,
        discountValue: couponCheck.couponData.discountValue,
        minimumOrderAmount: couponCheck.couponData.minimumOrderAmount,
        maximumDiscountAmount: couponCheck.couponData.maximumDiscountAmount,
        autoSelected: true // Flag to indicate this was auto-selected
      };
    }
    
    console.log('❌ DEBUG: Not returning coupon data - conditions not met');
    return null;
  } catch (error) {
    console.error('Error getting welcome coupon for auto-selection:', error);
    return null;
  }
}

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
    id: rawProduct.id,
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

  // Use variant title if available, otherwise fall back to main product title
  const variantTitle = rawVariant.title && rawVariant.title.trim() !== '' 
    ? rawVariant.title
    : parentProduct.title || "Untitled Product";

  return {
    id: rawVariant.id,
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
    variantId: rawVariant.documentId,
    // Add main product reference so getMainProductId can find it
    product: {
      documentId: parentProduct.documentId
    }
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

/**
 * Fetch products with variants for a specific collection by slug
 * @param {string} collectionSlug - The collection slug
 * @returns {Promise<Array>} Array of products and variants
 */
export async function fetchProductsWithVariantsByCollection(collectionSlug) {
  try {
    // First, get the collection data
    const collectionResponse = await fetchDataFromApi(`/api/collections?filters[slug][$eq]=${collectionSlug}&populate=products`);
    
    if (!collectionResponse.data || collectionResponse.data.length === 0) {
      return [];
    }

    const collection = collectionResponse.data[0];
    const products = collection.products || [];
    
    if (products.length === 0) {
      return [];
    }

    const allItems = [];

    // Process each product in the collection
    for (const product of products) {
      if (!product || !product.documentId) continue;

      try {
        // Fetch full product details
        const productResponse = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${product.documentId}&populate=*`);
        
        if (!productResponse.data || productResponse.data.length === 0) continue;
        
        const rawProduct = productResponse.data[0];
        
        // Transform main product
        const transformedProduct = transformProductForListing(rawProduct);
        
        // Only include active products
        if (transformedProduct.isActive !== false) {
          allItems.push({
            ...transformedProduct,
            itemType: 'product',
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
                  itemType: 'variant',
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
      } catch (productError) {
        console.error(`Error fetching product details for ${product.documentId}:`, productError);
      }
    }

    return allItems;
  } catch (error) {
    console.error('Error fetching collection products with variants:', error);
    return [];
  }
}
