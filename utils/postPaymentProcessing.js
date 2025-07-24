import { fetchDataFromApi, updateData } from './api';

/**
 * Post-payment processing function that replicates the "Update Stock & Delete" functionality
 * This function updates product stock and clears purchased items from cart after successful payment
 * @param {Array} selectedProducts - Array of products that were purchased
 * @param {Object} user - User object with authentication info
 * @param {Function} clearPurchasedItemsFromCart - Function to clear items from cart
 * @returns {Object} - Processing results with success/failure details
 */
export const processPostPaymentStockAndCart = async (selectedProducts, user, clearPurchasedItemsFromCart) => {
  console.log('🔄 [POST-PAYMENT] Starting post-payment stock update and cart clearing...');
  console.log('📦 [POST-PAYMENT] Products to process:', selectedProducts.length);
  console.log('🔍 [POST-PAYMENT] Input validation:', {
    hasUser: !!user,
    userId: user?.id,
    hasProducts: !!selectedProducts,
    productsLength: selectedProducts?.length,
    hasClearFunction: typeof clearPurchasedItemsFromCart === 'function'
  });
  
  if (!user?.id) {
    console.error('❌ [POST-PAYMENT] User authentication required');
    throw new Error('User authentication required for post-payment processing');
  }

  if (!selectedProducts || selectedProducts.length === 0) {
    console.error('❌ [POST-PAYMENT] No products provided');
    throw new Error('No products provided for post-payment processing');
  }

  const results = {
    stockUpdate: { success: false, results: [] },
    cartClear: { success: false },
    totalProducts: selectedProducts.length
  };

  try {
    // Step 1: Update stock first (same logic as handleUpdateStockAndDelete)
    console.log('📦 [POST-PAYMENT] Step 1: Updating product stock...');
    
    // Log each product in detail
    selectedProducts.forEach((product, index) => {
      console.log(`🔍 [POST-PAYMENT] Product ${index + 1} structure:`, {
        id: product.id,
        productId: product.productId,
        documentId: product.documentId,
        title: product.title,
        selectedSize: product.selectedSize,
        quantity: product.quantity,
        pricing: product.pricing,
        variantInfo: product.variantInfo,
        hasVariantInfo: !!product.variantInfo,
        isVariant: product.variantInfo?.isVariant,
        variantDocumentId: product.variantInfo?.documentId,
        allKeys: Object.keys(product)
      });
    });
    
    // Separate products and variants for different processing
    const mainProducts = [];
    const variantProducts = [];
    
    selectedProducts.forEach(product => {
      // Check if product is a variant by looking for variantInfo with documentId or isVariant flag
      if (product.variantInfo && (product.variantInfo.documentId || product.variantInfo.isVariant)) {
        console.log('📦 [POST-PAYMENT] Variant product detected:', {
          productId: product.productId || product.id,
          title: product.title,
          variantInfo: product.variantInfo,
          hasDocumentId: !!product.variantInfo.documentId,
          documentIdValue: product.variantInfo.documentId,
          isVariant: product.variantInfo.isVariant
        });
        variantProducts.push(product);
      } else {
        console.log('📦 [POST-PAYMENT] Main product detected:', {
          productId: product.productId || product.id,
          documentId: product.documentId,
          title: product.title,
          selectedSize: product.selectedSize,
          quantity: product.quantity
        });
        mainProducts.push(product);
      }
    });
    
    console.log('📦 Separated products:', {
      mainProducts: mainProducts.length,
      variantProducts: variantProducts.length
    });
    
    const allUpdateResults = [];
    
    // Process main products
    if (mainProducts.length > 0) {
      console.log('📦 Processing main products...');
      
      // Group main products by documentId
      const productGroups = mainProducts.reduce((groups, product) => {
        const documentId = product.documentId;
        if (!groups[documentId]) {
          groups[documentId] = [];
        }
        groups[documentId].push(product);
        return groups;
      }, {});

      // Process each main product group
      const mainProductPromises = Object.entries(productGroups).map(async ([documentId, products]) => {
        try {
          console.log('📦 Processing main product group:', {
            documentId,
            products: products.map(p => ({ 
              id: p.productId || p.id, 
              size: p.selectedSize, 
              quantity: p.quantity || p.pricing?.quantity, 
              title: p.title 
            }))
          });

          // Fetch current product data
          const productResponse = await fetchDataFromApi(
            `/api/products?filters[documentId][$eq]=${documentId}&populate=*`
          );

          if (!productResponse?.data || productResponse.data.length === 0) {
            throw new Error(`Product not found: ${documentId}`);
          }

          const currentProduct = productResponse.data[0];
          console.log('📦 Current main product data:', {
            documentId: currentProduct.documentId,
            title: currentProduct.title,
            size_stocks: currentProduct.size_stocks
          });

          if (!currentProduct.size_stocks) {
            console.warn('📦 Main product has no size_stocks field:', currentProduct.title);
            return products.map(product => ({
              success: false,
              productTitle: product.title,
              size: product.selectedSize,
              error: 'No size_stocks field found',
              type: 'main_product'
            }));
          }

          // Parse size_stocks
          let sizeStocks;
          if (typeof currentProduct.size_stocks === 'string') {
            try {
              sizeStocks = JSON.parse(currentProduct.size_stocks);
            } catch (parseError) {
              console.error('📦 Failed to parse main product size_stocks:', parseError);
              return products.map(product => ({
                success: false,
                productTitle: product.title,
                size: product.selectedSize,
                error: 'Invalid size_stocks format',
                type: 'main_product'
              }));
            }
          } else {
            sizeStocks = { ...currentProduct.size_stocks };
          }

          console.log('📦 Original main product size_stocks:', sizeStocks);

          // Update stock for all sizes
          const updateResults = [];
          const updatedSizeStocks = { ...sizeStocks };

          for (const product of products) {
            const selectedSize = product.selectedSize;
            const quantity = product.quantity || product.pricing?.quantity || 1;
            
            if (!updatedSizeStocks.hasOwnProperty(selectedSize)) {
              console.warn('📦 Size not found in main product stock:', selectedSize);
              updateResults.push({
                success: false,
                productTitle: product.title,
                size: selectedSize,
                error: `Size ${selectedSize} not found in stock`,
                type: 'main_product'
              });
              continue;
            }

            const currentStock = parseInt(updatedSizeStocks[selectedSize]) || 0;
            const newStock = Math.max(0, currentStock - quantity);

            console.log(`📦 Main product stock update: ${selectedSize} - Current: ${currentStock}, Quantity: ${quantity}, New: ${newStock}`);

            updatedSizeStocks[selectedSize] = newStock;
            updateResults.push({
              success: true,
              productTitle: product.title,
              size: selectedSize,
              oldStock: currentStock,
              newStock: newStock,
              quantityPurchased: quantity,
              type: 'main_product'
            });
          }

          // Update the main product
          const updateData = {
            data: {
              size_stocks: updatedSizeStocks
            }
          };

          const updateResponse = await updateData(`/api/products/${currentProduct.documentId}`, updateData);

          if (updateResponse && updateResponse.data) {
            console.log('✅ Main product stock updated successfully:', currentProduct.title);
            return updateResults;
          } else {
            console.error('❌ Failed to update main product stock:', currentProduct.title);
            return updateResults.map(result => ({
              ...result,
              success: false,
              error: 'Update request failed'
            }));
          }

        } catch (error) {
          console.error('❌ Error processing main product group:', error);
          return products.map(product => ({
            success: false,
            productTitle: product.title,
            size: product.selectedSize,
            error: error.message,
            type: 'main_product'
          }));
        }
      });

      const mainResults = await Promise.all(mainProductPromises);
      allUpdateResults.push(...mainResults.flat());
    }

    // Process variant products
    if (variantProducts.length > 0) {
      console.log('📦 Processing variant products...');
      
      const variantPromises = variantProducts.map(async (product) => {
        try {
          const variantDocumentId = product.variantInfo.documentId;
          const selectedSize = product.selectedSize;
          const quantity = product.quantity || product.pricing?.quantity || 1;

          console.log('📦 Processing variant product:', {
            productId: product.productId || product.id,
            title: product.title,
            variantDocumentId: variantDocumentId,
            selectedSize: selectedSize,
            quantity: quantity
          });

          // Fetch current variant data
          const variantResponse = await fetchDataFromApi(
            `/api/product-variants?filters[documentId][$eq]=${variantDocumentId}&populate=*`
          );

          if (!variantResponse?.data || variantResponse.data.length === 0) {
            throw new Error(`Variant not found: ${variantDocumentId}`);
          }

          const currentVariant = variantResponse.data[0];
          console.log('📦 Current variant data:', {
            documentId: currentVariant.documentId,
            title: currentVariant.title,
            size_stocks: currentVariant.size_stocks
          });

          if (!currentVariant.size_stocks) {
            console.warn('📦 Variant has no size_stocks field:', currentVariant.title);
            return {
              success: false,
              productTitle: product.title,
              size: selectedSize,
              error: 'No size_stocks field found',
              type: 'variant'
            };
          }

          // Parse variant size_stocks
          let variantSizeStocks;
          if (typeof currentVariant.size_stocks === 'string') {
            try {
              variantSizeStocks = JSON.parse(currentVariant.size_stocks);
            } catch (parseError) {
              console.error('📦 Failed to parse variant size_stocks:', parseError);
              return {
                success: false,
                productTitle: product.title,
                size: selectedSize,
                error: 'Invalid size_stocks format',
                type: 'variant'
              };
            }
          } else {
            variantSizeStocks = { ...currentVariant.size_stocks };
          }

          console.log('📦 Original variant size_stocks:', variantSizeStocks);

          if (!variantSizeStocks.hasOwnProperty(selectedSize)) {
            console.warn('📦 Size not found in variant stock:', selectedSize);
            return {
              success: false,
              productTitle: product.title,
              size: selectedSize,
              error: `Size ${selectedSize} not found in variant stock`,
              type: 'variant'
            };
          }

          const currentStock = parseInt(variantSizeStocks[selectedSize]) || 0;
          const newStock = Math.max(0, currentStock - quantity);

          console.log(`📦 Variant stock update: ${selectedSize} - Current: ${currentStock}, Quantity: ${quantity}, New: ${newStock}`);

          // Update the variant size_stocks
          const updatedVariantSizeStocks = {
            ...variantSizeStocks,
            [selectedSize]: newStock
          };

          const updateData = {
            data: {
              size_stocks: updatedVariantSizeStocks
            }
          };

          const updateResponse = await updateData(`/api/product-variants/${currentVariant.documentId}`, updateData);

          if (updateResponse && updateResponse.data) {
            console.log('✅ Variant stock updated successfully:', currentVariant.title);
            return {
              success: true,
              productTitle: product.title,
              size: selectedSize,
              oldStock: currentStock,
              newStock: newStock,
              quantityPurchased: quantity,
              type: 'variant'
            };
          } else {
            console.error('❌ Failed to update variant stock:', currentVariant.title);
            return {
              success: false,
              productTitle: product.title,
              size: selectedSize,
              error: 'Update request failed',
              type: 'variant'
            };
          }

        } catch (error) {
          console.error('❌ Error processing variant product:', error);
          return {
            success: false,
            productTitle: product.title,
            size: product.selectedSize,
            error: error.message,
            type: 'variant'
          };
        }
      });

      const variantResults = await Promise.all(variantPromises);
      allUpdateResults.push(...variantResults);
    }

    // Summarize stock update results
    const successfulUpdates = allUpdateResults.filter(result => result.success);
    const failedUpdates = allUpdateResults.filter(result => !result.success);

    console.log('📦 Stock update summary:', {
      total: allUpdateResults.length,
      successful: successfulUpdates.length,
      failed: failedUpdates.length
    });

    results.stockUpdate = {
      success: failedUpdates.length === 0,
      results: allUpdateResults,
      successCount: successfulUpdates.length,
      failureCount: failedUpdates.length
    };

    // Step 2: Clear purchased items from cart
    console.log('🛍 [POST-PAYMENT] Step 2: Clearing purchased items from cart...');
    console.log('🔍 [POST-PAYMENT] About to call clearPurchasedItemsFromCart with:', {
      productsCount: selectedProducts.length,
      functionType: typeof clearPurchasedItemsFromCart,
      hasFunction: !!clearPurchasedItemsFromCart
    });
    
    try {
      if (typeof clearPurchasedItemsFromCart !== 'function') {
        throw new Error('clearPurchasedItemsFromCart is not a function');
      }
      
      console.log('🚀 [POST-PAYMENT] Calling clearPurchasedItemsFromCart...');
      const cartClearResult = await clearPurchasedItemsFromCart(selectedProducts);
      console.log('✅ [POST-PAYMENT] Cart clearing completed successfully:', cartClearResult);
      results.cartClear.success = true;
      results.cartClear.result = cartClearResult;
    } catch (cartError) {
      console.error('❌ [POST-PAYMENT] Error clearing cart:', cartError);
      console.error('❌ [POST-PAYMENT] Cart error details:', {
        message: cartError.message,
        stack: cartError.stack,
        name: cartError.name
      });
      results.cartClear.success = false;
      results.cartClear.error = cartError.message;
    }

    console.log('🎉 [POST-PAYMENT] Post-payment processing completed!');
    console.log('🔍 [POST-PAYMENT] Final results:', JSON.stringify(results, null, 2));

    return results;

  } catch (error) {
    console.error('❌ Error in post-payment processing:', error);
    throw error;
  }
};
