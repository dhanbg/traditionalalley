/**
 * Client-side stock validation utilities
 */

/**
 * Validate stock before adding/updating cart items
 * @param {string} productId - Product document ID
 * @param {string} variantId - Variant document ID (optional)
 * @param {string} selectedSize - Size to check
 * @param {number} requestedQuantity - Quantity to add/update to
 * @param {number} currentCartQuantity - Current quantity in cart (default: 0)
 * @returns {Promise<Object>} Validation result
 */
export const validateCartStock = async (productId, variantId, selectedSize, requestedQuantity, currentCartQuantity = 0) => {
  try {
    const response = await fetch('/api/validate-cart-stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        variantId,
        selectedSize,
        requestedQuantity,
        currentCartQuantity
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Stock validation failed');
    }

    return result;
  } catch (error) {
    console.error('Stock validation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to validate stock'
    };
  }
};

/**
 * Validate stock before incrementing cart quantity
 * @param {string} productId - Product document ID
 * @param {string} variantId - Variant document ID (optional)
 * @param {string} selectedSize - Size to check
 * @param {number} incrementAmount - Amount to increment by (default: 1)
 * @param {number} currentCartQuantity - Current quantity in cart
 * @returns {Promise<Object>} Validation result
 */
export const validateCartIncrement = async (productId, variantId, selectedSize, incrementAmount = 1, currentCartQuantity = 0) => {
  return validateCartStock(productId, variantId, selectedSize, incrementAmount, currentCartQuantity);
};

/**
 * Validate stock before setting cart quantity to a specific value
 * @param {string} productId - Product document ID
 * @param {string} variantId - Variant document ID (optional)
 * @param {string} selectedSize - Size to check
 * @param {number} newQuantity - New total quantity to set
 * @param {number} currentCartQuantity - Current quantity in cart
 * @returns {Promise<Object>} Validation result
 */
export const validateCartQuantityUpdate = async (productId, variantId, selectedSize, newQuantity, currentCartQuantity = 0) => {
  const quantityDifference = newQuantity - currentCartQuantity;
  
  // If reducing quantity, no stock validation needed
  if (quantityDifference <= 0) {
    return {
      success: true,
      message: 'Quantity reduction - no stock validation needed'
    };
  }
  
  return validateCartStock(productId, variantId, selectedSize, quantityDifference, currentCartQuantity);
};

/**
 * Show user-friendly error message for stock validation failures
 * @param {Object} validationResult - Result from stock validation
 * @returns {string} User-friendly error message
 */
export const getStockValidationMessage = (validationResult) => {
  if (validationResult.success) {
    return 'Stock validation passed';
  }

  // Return the error message from the validation result
  return validationResult.error || 'Stock validation failed';
};

/**
 * Check if a stock validation error suggests showing available alternatives
 * @param {Object} validationResult - Result from stock validation
 * @returns {boolean} Whether to show alternatives
 */
export const shouldShowStockAlternatives = (validationResult) => {
  return !validationResult.success && validationResult.maxAdditionalQuantity !== undefined;
};

/**
 * Get suggested action from stock validation result
 * @param {Object} validationResult - Result from stock validation
 * @returns {string|null} Suggested action or null
 */
export const getStockSuggestion = (validationResult) => {
  return validationResult.suggestedAction || null;
};
