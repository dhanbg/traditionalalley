import { fetchDataFromApi, updateData, deleteData } from './api';

/**
 * Post-payment processing function that EXACTLY replicates the "Update Stock & Delete" functionality
 * This function uses IDENTICAL logic to the working checkout button for production safety
 * @param {Array} selectedProducts - Array of products that were purchased
 * @param {Object} user - User object with authentication info
 * @param {Function} clearPurchasedItemsFromCart - Function to clear items from cart
 * @returns {Object} - Processing results with success/failure details
 */
export const processPostPaymentStockAndCart = async (selectedProducts, user, clearPurchasedItemsFromCart) => {
  // EXACT validation logic from checkout button
  if (!user?.id) {
    console.error('❌ [POST-PAYMENT] Please log in to perform this operation.');
    throw new Error('Please log in to perform this operation.');
  }

  if (selectedProducts.length === 0) {
    console.error('❌ [POST-PAYMENT] No products selected.');
    throw new Error('No products selected.');
  }

  // Calculate total quantity to be decreased (exact checkout logic)
  const totalQuantity = selectedProducts.reduce((sum, product) => sum + (product.quantity || 1), 0);

  try {
    console.log('🔄 Starting combined update stock and delete operation for:', selectedProducts.length, 'products');
    
    // Step 1: Update stock first (EXACT checkout button logic)
    console.log('📦 Step 1: Updating stock...');
    
    // Separate products and variants for different processing (EXACT logic)
    const mainProducts = [];
    const variantProducts = [];
    
    selectedProducts.forEach(product => {
      // Check if product is a variant by looking for variantInfo with documentId or isVariant flag
      if (product.variantInfo && (product.variantInfo.documentId || product.variantInfo.isVariant)) {
        console.log('📦 Variant product detected:', {
          productId: product.id,
          title: product.title,
          variantInfo: product.variantInfo,
          hasDocumentId: !!product.variantInfo.documentId,
          documentIdValue: product.variantInfo.documentId,
          isVariant: product.variantInfo.isVariant
        });
        variantProducts.push(product);
      } else {
        mainProducts.push(product);
      }
    });
    
    console.log('📦 Separated products:', {
      mainProducts: mainProducts.length,
      variantProducts: variantProducts.length
    });
    
    const allUpdateResults = [];
    
    // Process main products (EXACT checkout button logic)
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
            products: products.map(p => ({ id: p.id, size: p.selectedSize, quantity: p.quantity, title: p.title }))
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

          const updateResults = [];
          const updatedSizeStocks = { ...sizeStocks };

          for (const product of products) {
            const selectedSize = product.selectedSize;
            
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
            const quantityToDecrease = product.quantity || 1;
            console.log('📦 Processing main product size', selectedSize, '- Current stock:', currentStock, ', quantity to decrease:', quantityToDecrease);

            const newStock = Math.max(0, currentStock - quantityToDecrease);
            updatedSizeStocks[selectedSize] = newStock;

            updateResults.push({
              success: true,
              productTitle: product.title,
              size: selectedSize,
              oldStock: currentStock,
              newStock: newStock,
              quantityDecreased: quantityToDecrease,
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
      // EXACT checkout button's stock update logic - MAIN PRODUCTS
      const updateMainProductsStock = async (mainProducts) => {
        if (mainProducts.length === 0) return [];
        
        console.log('📦 [POST-PAYMENT] Processing main products...');
        
        // Group main products by documentId (EXACT checkout logic)
        const productGroups = mainProducts.reduce((groups, product) => {
          const documentId = product.documentId;
          if (!groups[documentId]) {
            groups[documentId] = [];
          }
          groups[documentId].push(product);
          return groups;
        }, {});

        // Process each main product group (EXACT checkout logic)
        const mainProductPromises = Object.entries(productGroups).map(async ([documentId, products]) => {
          try {
            console.log('📦 [POST-PAYMENT] Processing main product group:', {
              documentId,
              products: products.map(p => ({ id: p.id, size: p.selectedSize, quantity: p.quantity, title: p.title }))
            });

            // Fetch current product data (EXACT checkout endpoint)
            const productResponse = await fetchDataFromApi(
              `/api/products?filters[documentId][$eq]=${documentId}&populate=*`
            );

            if (!productResponse?.data || productResponse.data.length === 0) {
              throw new Error(`Product not found: ${documentId}`);
            }

            const currentProduct = productResponse.data[0];
            console.log('📦 [POST-PAYMENT] Current main product data:', {
              documentId: currentProduct.documentId,
              title: currentProduct.title,
              size_stocks: currentProduct.size_stocks
            });

            if (!currentProduct.size_stocks) {
              console.warn('📦 [POST-PAYMENT] Main product has no size_stocks field:', currentProduct.title);
              return products.map(product => ({
                success: false,
                productTitle: product.title,
                size: product.selectedSize,
                error: 'No size_stocks field found',
                type: 'main_product'
              }));
            }

            // Parse size_stocks (EXACT checkout logic)
            let sizeStocks;
            if (typeof currentProduct.size_stocks === 'string') {
              try {
                sizeStocks = JSON.parse(currentProduct.size_stocks);
              } catch (parseError) {
                console.error('📦 [POST-PAYMENT] Failed to parse main product size_stocks:', parseError);
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

            console.log('📦 [POST-PAYMENT] Original main product size_stocks:', sizeStocks);

            // Update stock for all sizes (EXACT checkout logic)
            const updateResults = [];
            const updatedSizeStocks = { ...sizeStocks };

            for (const product of products) {
              const selectedSize = product.selectedSize;
              
              if (!updatedSizeStocks.hasOwnProperty(selectedSize)) {
                console.warn('📦 [POST-PAYMENT] Size not found in main product stock:', selectedSize);
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
              const quantityToDecrease = product.quantity || 1;
              console.log('📦 [POST-PAYMENT] Processing main product size', selectedSize, '- Current stock:', currentStock, ', quantity to decrease:', quantityToDecrease);

              const newStock = Math.max(0, currentStock - quantityToDecrease);
              updatedSizeStocks[selectedSize] = newStock;

              updateResults.push({
                success: true,
                productTitle: product.title,
                size: selectedSize,
                oldStock: currentStock,
                newStock: newStock,
                quantityDecreased: quantityToDecrease,
                type: 'main_product'
              });
            }

            console.log('📦 [POST-PAYMENT] Final updated main product size_stocks:', updatedSizeStocks);

            // Update the main product (EXACT checkout API call)
            const updateResponse = await updateData(
              `/api/products/${currentProduct.documentId}`,
              {
                data: {
                  size_stocks: updatedSizeStocks
                }
              }
            );

            console.log('📦 [POST-PAYMENT] Main product stock update response:', updateResponse);
            return updateResults;
            
          } catch (error) {
            console.error('📦 [POST-PAYMENT] Error updating main product stock:', documentId, error);
            return products.map(product => ({
              success: false,
              productTitle: product.title,
              size: product.selectedSize,
              error: error.message,
              type: 'main_product'
            }));
          }
        });
        
        const mainProductResults = await Promise.all(mainProductPromises);
        return mainProductResults.flat();
      };

      // EXACT checkout button's stock update logic - VARIANT PRODUCTS
      const updateVariantProductsStock = async (variantProducts) => {
        if (variantProducts.length === 0) return [];
        
        console.log('📦 [POST-PAYMENT] Processing variant products...');
        
        // Group variants by documentId (EXACT checkout logic)
        const variantGroups = variantProducts.reduce((groups, product) => {
          const variantDocumentId = product.variantInfo.documentId;
          
          console.log('📦 [POST-PAYMENT] Processing variant with ID:', {
            documentId: product.variantInfo.documentId,
            finalId: variantDocumentId,
            productTitle: product.title,
            isNumericId: !isNaN(parseInt(variantDocumentId))
          });
          
          if (!groups[variantDocumentId]) {
            groups[variantDocumentId] = [];
          }
          groups[variantDocumentId].push(product);
          return groups;
        }, {});

        // Process each variant group (EXACT checkout logic)
        const variantPromises = Object.entries(variantGroups).map(async ([variantDocumentId, products]) => {
          try {
            console.log('📦 [POST-PAYMENT] Processing variant group:', {
              variantDocumentId,
              products: products.map(p => ({ id: p.id, size: p.selectedSize, quantity: p.quantity, title: p.title }))
            });

            // Fetch current variant data (EXACT checkout endpoint)
            let variantResponse;
            if (!isNaN(parseInt(variantDocumentId))) {
              console.log('📦 [POST-PAYMENT] Using numeric ID to fetch variant:', variantDocumentId);
              variantResponse = await fetchDataFromApi(
                `/api/product-variants/${variantDocumentId}?populate=*`
              );
              
              if (variantResponse?.data && !Array.isArray(variantResponse.data)) {
                variantResponse.data = [variantResponse.data];
              }
            } else {
              console.log('📦 [POST-PAYMENT] Using documentId to fetch variant:', variantDocumentId);
              variantResponse = await fetchDataFromApi(
                `/api/product-variants?filters[documentId][$eq]=${variantDocumentId}&populate=*`
              );
            }

            if (!variantResponse?.data || variantResponse.data.length === 0) {
              throw new Error(`Variant not found: ${variantDocumentId}`);
            }

            const currentVariant = variantResponse.data[0];
            console.log('📦 [POST-PAYMENT] Current variant data:', {
              documentId: currentVariant.documentId,
              title: currentVariant.title || 'Variant',
              size_stocks: currentVariant.size_stocks
            });

            if (!currentVariant.size_stocks) {
              console.warn('📦 [POST-PAYMENT] Variant has no size_stocks field:', variantDocumentId);
              return products.map(product => ({
                success: false,
                productTitle: product.title,
                size: product.selectedSize,
                error: 'No size_stocks field found in variant',
                type: 'variant'
              }));
            }

            // Parse variant size_stocks (EXACT checkout logic)
            let variantSizeStocks;
            if (typeof currentVariant.size_stocks === 'string') {
              try {
                variantSizeStocks = JSON.parse(currentVariant.size_stocks);
              } catch (parseError) {
                console.error('📦 [POST-PAYMENT] Failed to parse variant size_stocks:', parseError);
                return products.map(product => ({
                  success: false,
                  productTitle: product.title,
                  size: product.selectedSize,
                  error: 'Invalid variant size_stocks format',
                  type: 'variant'
                }));
              }
            } else {
              variantSizeStocks = { ...currentVariant.size_stocks };
            }

            console.log('📦 [POST-PAYMENT] Original variant size_stocks:', variantSizeStocks);

            // Update variant stock for all sizes (EXACT checkout logic)
            const updateResults = [];
            const updatedVariantSizeStocks = { ...variantSizeStocks };

            for (const product of products) {
              const selectedSize = product.selectedSize;
              
              if (!updatedVariantSizeStocks.hasOwnProperty(selectedSize)) {
                console.warn('📦 [POST-PAYMENT] Size not found in variant stock:', selectedSize);
                updateResults.push({
                  success: false,
                  productTitle: product.title,
                  size: selectedSize,
                  error: `Size ${selectedSize} not found in variant stock`,
                  type: 'variant',
                  variantId: variantDocumentId
                });
                continue;
              }

              const currentStock = parseInt(updatedVariantSizeStocks[selectedSize]) || 0;
              const quantityToDecrease = product.quantity || 1;
              console.log('📦 [POST-PAYMENT] Processing variant size', selectedSize, '- Current stock:', currentStock, ', quantity to decrease:', quantityToDecrease);

              const newStock = Math.max(0, currentStock - quantityToDecrease);
              updatedVariantSizeStocks[selectedSize] = newStock;

              updateResults.push({
                success: true,
                productTitle: product.title,
                size: selectedSize,
                oldStock: currentStock,
                newStock: newStock,
                quantityDecreased: quantityToDecrease,
                type: 'variant',
                variantId: variantDocumentId
              });
            }

            console.log('📦 [POST-PAYMENT] Final updated variant size_stocks:', updatedVariantSizeStocks);

            // Update the variant (EXACT checkout API call)
            const updateResponse = await updateData(
              `/api/product-variants/${currentVariant.documentId}`,
              {
                data: {
                  size_stocks: updatedVariantSizeStocks
                }
              }
            );

            console.log('📦 [POST-PAYMENT] Variant stock update response:', updateResponse);
            return updateResults;
            
          } catch (error) {
            console.error('📦 [POST-PAYMENT] Error updating variant stock:', variantDocumentId, error);
            return products.map(product => ({
              success: false,
              productTitle: product.title,
              size: product.selectedSize,
              error: error.message,
              type: 'variant'
            }));
          }
        });
        
        const variantResults = await Promise.all(variantPromises);
        return variantResults.flat();
      };

      // EXACT checkout button's cart deletion logic
      const deleteCartItemsFromBackend = async (selectedProducts, userId) => {
        console.log('🗑️ [POST-PAYMENT] Step 2: Deleting cart items from backend...');
        
        try {
          // Fetch user data with cart items (EXACT checkout logic)
          const currentUserData = await fetchDataFromApi(
            `/api/user-data?filters[authUserId][$eq]=${userId}&populate[user_bag][populate]=carts`
          );
          
          if (!currentUserData?.data || currentUserData.data.length === 0) {
            throw new Error('User data not found');
          }

          const userData = currentUserData.data[0];
          const cartItems = userData.user_bag?.carts || [];
          
          console.log('🗑️ [POST-PAYMENT] Current cart items from backend:', cartItems.length);
          
          // Find cart items to delete (EXACT checkout logic)
          const itemsToDelete = [];
          
          for (const selectedProduct of selectedProducts) {
            // Find the backend cart item that matches this frontend product
            const matchingCartItem = cartItems.find(cartItem => {
              const sizeMatch = cartItem.size === selectedProduct.selectedSize;
              return sizeMatch;
            });

            if (matchingCartItem) {
              itemsToDelete.push({
                cartItemDocumentId: matchingCartItem.documentId,
                selectedProduct: selectedProduct
              });
              console.log('✅ [POST-PAYMENT] Found cart item to delete:', {
                cartItemDocumentId: matchingCartItem.documentId,
                size: matchingCartItem.size
              });
            } else {
              console.warn('⚠️ [POST-PAYMENT] No matching backend cart item found for:', {
                selectedProductId: selectedProduct.id,
                selectedSize: selectedProduct.selectedSize
              });
            }
          }

          console.log('🗑️ [POST-PAYMENT] Items to delete:', itemsToDelete.length, itemsToDelete);

          const deleteResults = [];
          
          if (itemsToDelete.length === 0) {
            console.warn('🗑️ [POST-PAYMENT] No cart items found to delete');
          } else {
            // Delete cart items from backend (EXACT checkout logic)
            const deletePromises = itemsToDelete.map(async (item) => {
              try {
                console.log('🗑️ [POST-PAYMENT] Deleting cart item:', item.cartItemDocumentId);
                const deleteResponse = await deleteData(`/api/carts/${item.cartItemDocumentId}`);
                console.log('🗑️ [POST-PAYMENT] Delete response for', item.cartItemDocumentId, ':', deleteResponse);
                return { success: true, cartItemDocumentId: item.cartItemDocumentId };
              } catch (error) {
                console.error('🗑️ [POST-PAYMENT] Error deleting cart item:', item.cartItemDocumentId, error);
                return { success: false, cartItemDocumentId: item.cartItemDocumentId, error: error.message };
              }
            });

            const deleteResults = await Promise.all(deletePromises);
            console.log('🗑️ [POST-PAYMENT] Delete results:', deleteResults);

            const successfulDeletes = deleteResults.filter(result => result.success);
            const failedDeletes = deleteResults.filter(result => !result.success);

            console.log('🗑️ [POST-PAYMENT] Delete summary:', {
              total: deleteResults.length,
              successful: successfulDeletes.length,
              failed: failedDeletes.length
            });
            
            return {
              success: failedDeletes.length === 0,
              totalDeleted: successfulDeletes.length,
              totalFailed: failedDeletes.length,
              results: deleteResults
            };
          }
          
          return {
            success: true,
            totalDeleted: 0,
            totalFailed: 0,
            results: []
          };
          
        } catch (error) {
          console.error('🗑️ [POST-PAYMENT] Cart item deletion failed:', error);
          return {
            success: false,
            error: error.message,
            totalDeleted: 0,
            totalFailed: selectedProducts.length
          };
        }
      };

      // EXACT checkout button's 3-step process
      console.log('🔄 [POST-PAYMENT] Starting combined update stock and delete operation for:', selectedProducts.length, 'products');
      
      // Separate products and variants for different processing (EXACT checkout logic)
      const mainProducts = [];
      const variantProducts = [];
      
      selectedProducts.forEach(product => {
        // Check if product is a variant by looking for variantInfo with documentId or isVariant flag
        if (product.variantInfo && (product.variantInfo.documentId || product.variantInfo.isVariant)) {
          console.log('📦 [POST-PAYMENT] Variant product detected:', {
            productId: product.id,
            title: product.title,
            variantInfo: product.variantInfo,
            hasDocumentId: !!product.variantInfo.documentId,
            documentIdValue: product.variantInfo.documentId,
            isVariant: product.variantInfo.isVariant
          });
          variantProducts.push(product);
        } else {
          mainProducts.push(product);
        }
      });
      
      console.log('📦 [POST-PAYMENT] Separated products:', {
        mainProducts: mainProducts.length,
        variantProducts: variantProducts.length
      });
      
      const allUpdateResults = [];
      
      // Step 1: Update stock first (EXACT checkout button logic)
      console.log('📦 [POST-PAYMENT] Step 1: Updating stock...');
      
      try {
        // Process main products
        if (mainProducts.length > 0) {
          const mainProductResults = await updateMainProductsStock(mainProducts);
          allUpdateResults.push(...mainProductResults);
        }
        
        // Process variant products
        if (variantProducts.length > 0) {
          const variantResults = await updateVariantProductsStock(variantProducts);
          allUpdateResults.push(...variantResults);
        }
        
        console.log('📦 [POST-PAYMENT] All stock updates completed. Results:', allUpdateResults);
        
        const successfulStockUpdates = allUpdateResults.filter(result => result.success);
        const failedStockUpdates = allUpdateResults.filter(result => !result.success);
        
        console.log('📦 [POST-PAYMENT] Stock update summary:', {
          total: allUpdateResults.length,
          successful: successfulStockUpdates.length,
          failed: failedStockUpdates.length
        });
        
        results.stockUpdate.success = failedStockUpdates.length === 0;
        results.stockUpdate.successfulUpdates = successfulStockUpdates.length;
        results.stockUpdate.failedUpdates = failedStockUpdates.length;
        results.stockUpdate.details = allUpdateResults;
        
      } catch (stockError) {
        console.error('❌ [POST-PAYMENT] Error in stock update:', stockError);
        results.stockUpdate.success = false;
        results.stockUpdate.error = stockError.message;
      }
      
      // Step 2: Delete cart items from backend (EXACT checkout button logic)
      try {
        const cartDeletionResult = await deleteCartItemsFromBackend(selectedProducts, user.id);
        results.cartDeletion.success = cartDeletionResult.success;
        results.cartDeletion.totalDeleted = cartDeletionResult.totalDeleted;
        results.cartDeletion.totalFailed = cartDeletionResult.totalFailed;
        results.cartDeletion.details = cartDeletionResult.results;
        
        if (cartDeletionResult.error) {
          results.cartDeletion.error = cartDeletionResult.error;
        }
        
      } catch (cartError) {
        console.error('❌ [POST-PAYMENT] Error in cart deletion:', cartError);
        results.cartDeletion.success = false;
        results.cartDeletion.error = cartError.message;
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
