/**
 * Utility functions for handling product stock calculations
 */

/**
 * Check if a product is in stock based on its size_stocks
 * @param {Object} product - The product object
 * @returns {boolean} - True if product has any available stock, false if all sizes are 0 or no stock data
 */
export const calculateInStock = (product) => {
  if (!product) return false;
  
  // Check if product has size_stocks
  if (!product.size_stocks) {
    // If no size_stocks, check if it's a simple product with stock field
    if (typeof product.stock === 'number') {
      return product.stock > 0;
    }
    // If no stock information, assume it's in stock (fallback for legacy products)
    return product.inStock !== false; // Use existing inStock if available, default to true
  }
  
  let sizeStocks = product.size_stocks;
  
  // Parse size_stocks if it's a string
  if (typeof sizeStocks === 'string') {
    try {
      sizeStocks = JSON.parse(sizeStocks);
    } catch (error) {
      console.warn('Error parsing size_stocks for product:', product.title || product.id, error);
      return product.inStock !== false; // Fallback to existing inStock or true
    }
  }
  
  // Check if sizeStocks is a valid object
  if (!sizeStocks || typeof sizeStocks !== 'object') {
    return product.inStock !== false; // Fallback to existing inStock or true
  }
  
  // Check if any size has stock > 0
  const stockValues = Object.values(sizeStocks);
  const hasStock = stockValues.some(stock => {
    const stockNumber = parseInt(stock, 10);
    return !isNaN(stockNumber) && stockNumber > 0;
  });
  
  return hasStock;
};

/**
 * Get total stock count for a product across all sizes
 * @param {Object} product - The product object
 * @returns {number} - Total stock count
 */
export const getTotalStock = (product) => {
  if (!product) return 0;
  
  // Check if product has size_stocks
  if (!product.size_stocks) {
    if (typeof product.stock === 'number') {
      return product.stock;
    }
    return 0;
  }
  
  let sizeStocks = product.size_stocks;
  
  // Parse size_stocks if it's a string
  if (typeof sizeStocks === 'string') {
    try {
      sizeStocks = JSON.parse(sizeStocks);
    } catch (error) {
      console.warn('Error parsing size_stocks for product:', product.title || product.id, error);
      return 0;
    }
  }
  
  // Check if sizeStocks is a valid object
  if (!sizeStocks || typeof sizeStocks !== 'object') {
    return 0;
  }
  
  // Sum all stock values
  const stockValues = Object.values(sizeStocks);
  const totalStock = stockValues.reduce((total, stock) => {
    const stockNumber = parseInt(stock, 10);
    return total + (isNaN(stockNumber) ? 0 : stockNumber);
  }, 0);
  
  return totalStock;
};

/**
 * Get stock for a specific size
 * @param {Object} product - The product object
 * @param {string} size - The size to check
 * @returns {number} - Stock count for the specific size
 */
export const getStockForSize = (product, size) => {
  if (!product || !size) return 0;
  
  // Check if product has size_stocks
  if (!product.size_stocks) {
    return 0;
  }
  
  let sizeStocks = product.size_stocks;
  
  // Parse size_stocks if it's a string
  if (typeof sizeStocks === 'string') {
    try {
      sizeStocks = JSON.parse(sizeStocks);
    } catch (error) {
      console.warn('Error parsing size_stocks for product:', product.title || product.id, error);
      return 0;
    }
  }
  
  // Check if sizeStocks is a valid object
  if (!sizeStocks || typeof sizeStocks !== 'object') {
    return 0;
  }
  
  const stockValue = sizeStocks[size];
  const stockNumber = parseInt(stockValue, 10);
  return isNaN(stockNumber) ? 0 : stockNumber;
};
