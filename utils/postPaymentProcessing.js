import { fetchDataFromApi, updateData } from './api';

/**
 * Automated email sending function that replicates the "Send Email" functionality
 * This function sends invoice emails automatically after successful payment
 * @param {Object} paymentData - Payment data containing order and customer information
 * @returns {Object} - Email sending result with success/failure details
 */
const sendAutomaticInvoiceEmail = async (paymentData) => {
  console.log('📧 [AUTO-EMAIL] Starting automatic invoice email sending...');
  console.log('📋 [AUTO-EMAIL] Payment data received:', JSON.stringify(paymentData, null, 2));
  
  try {
    // Validate payment data
    if (!paymentData) {
      console.error('❌ [AUTO-EMAIL] Payment data is missing');
      throw new Error('Payment data is missing');
    }
    
    // Extract orderData from payment
    const orderData = paymentData.orderData || {};
    console.log('📦 [AUTO-EMAIL] Order data extracted:', JSON.stringify(orderData, null, 2));
    
    // Check if receiver details exist
    const receiverDetails = orderData.receiver_details || {};
    console.log('👤 [AUTO-EMAIL] Receiver details:', JSON.stringify(receiverDetails, null, 2));
    console.log('📧 [AUTO-EMAIL] Customer email found:', receiverDetails.email || 'NO EMAIL FOUND');
    
    const customerEmail = receiverDetails.email;
    
    if (!customerEmail) {
      console.warn('⚠️ [AUTO-EMAIL] No customer email found. Cannot send invoice email.');
      return { success: false, error: 'No customer email found' };
    }
    
    // Detect if delivery is to Nepal for currency formatting
    const isNepal = isNepalDestination(paymentData);
    const currency = isNepal ? 'Rs.' : '$';
    
    // Calculate amount for display
    const orderSummary = orderData.orderSummary || {};
    let amount = paymentData.amount || orderSummary.totalAmount || 0;
    
    // For Nepal orders, keep NPR amounts as-is; for international orders, convert NPR to USD
    if (!isNepal) {
      if (paymentData.amount_npr) {
        const { getExchangeRate } = await import('./currency');
        const nprToUsdRate = await getExchangeRate();
        amount = paymentData.amount_npr / nprToUsdRate;
      } else if (amount > 1000) {
        const { getExchangeRate } = await import('./currency');
        const nprToUsdRate = await getExchangeRate();
        amount = amount / nprToUsdRate;
      }
    } else {
      if (paymentData.amount_npr) {
        amount = paymentData.amount_npr;
      }
    }
    
    const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;
    const txnId = paymentData.merchantTxnId || paymentData.attributes?.merchantTxnId || 'receipt';
    const fileName = `Traditional_Alley_Bill_${txnId}.pdf`;
    
    console.log('📧 [AUTO-EMAIL] Preparing to send invoice email to:', customerEmail);
    console.log('💰 [AUTO-EMAIL] Amount:', `${currency} ${formattedAmount}`);
    console.log('📄 [AUTO-EMAIL] File name:', fileName);
    
    // Generate PDF for email (simplified version for automation)
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    
    // Add Traditional Alley logo
    let logoLoaded = false;
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/logo.png';
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          const logoWidth = 40;
          const logoHeight = 10;
          const pageWidth = doc.internal.pageSize.getWidth();
          const logoX = (pageWidth - logoWidth) / 2;
          doc.addImage(logoImg, 'PNG', logoX, 10, logoWidth, logoHeight);
          logoLoaded = true;
          resolve();
        };
        logoImg.onerror = () => {
          console.warn('⚠️ [AUTO-EMAIL] Could not load logo, continuing without it');
          logoLoaded = false;
          resolve();
        };
      });
    } catch (error) {
      console.warn('⚠️ [AUTO-EMAIL] Logo loading failed:', error);
      logoLoaded = false;
    }
    
    // Generate PDF content (simplified version)
    let headerY = 35;
    
    if (!logoLoaded) {
      doc.setFontSize(20);
      doc.setTextColor(139, 69, 19);
      doc.text('Traditional Alley', doc.internal.pageSize.getWidth() / 2, headerY, { align: 'center' });
      headerY += 10;
    } else {
      headerY = 30;
    }

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', doc.internal.pageSize.getWidth() / 2, headerY + 10, { align: 'center' });
    
    // Add basic order and customer information
    let yPosition = 60;
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftColumnX = 20;
    const rightColumnX = pageWidth / 2 + 30;
    
    // Order Information (Left Column)
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Order Information', leftColumnX, yPosition);
    
    let leftYPosition = yPosition + 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    const orderInfo = [
      `Order ID: ${paymentData.merchantTxnId || 'N/A'}`,
      `Gateway Reference: ${paymentData.gatewayReferenceNo || 'N/A'}`,
      `Process ID: ${paymentData.processId || 'N/A'}`,
      `Date: ${paymentData.timestamp ? new Date(paymentData.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}`,
      `Payment Status: ${paymentData.status || 'N/A'}`,
      `Payment Method: ${paymentData.instrument || 'N/A'}`,
      `Institution: ${paymentData.institution || 'N/A'}`
    ];
    
    orderInfo.forEach(info => {
      doc.text(info, leftColumnX, leftYPosition);
      leftYPosition += 6;
    });
    
    // Customer Information (Right Column)
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Customer Information', rightColumnX, yPosition);
    
    let rightYPosition = yPosition + 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    const address = receiverDetails.address || {};
    const customerInfo = [
      `Name: ${receiverDetails.fullName || 'N/A'}`,
      `Email: ${receiverDetails.email || 'N/A'}`,
      `Phone: ${receiverDetails.contactNumber || 'N/A'}`,
      `Address: ${address.street || 'N/A'}`,
      `City: ${address.city || 'N/A'}`,
      `Country: ${address.country || 'N/A'}`,
      `Postal Code: ${address.postalCode || 'N/A'}`
    ];
    
    customerInfo.forEach(info => {
      doc.text(info, rightColumnX, rightYPosition);
      rightYPosition += 6;
    });
    
    // Add products table (simplified)
    const products = orderData.products || [];
    if (products.length > 0) {
      yPosition = Math.max(leftYPosition, rightYPosition) + 20;
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Products', leftColumnX, yPosition);
      
      yPosition += 10;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      
      products.forEach((product, index) => {
        const productText = `${index + 1}. ${product.title || 'N/A'} - Size: ${product.selectedSize || 'N/A'} - Qty: ${product.quantity || 1}`;
        doc.text(productText, leftColumnX, yPosition);
        yPosition += 6;
      });
    }
    
    // Add total amount
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount: ${currency} ${formattedAmount}`, leftColumnX, yPosition);
    
    // Convert PDF to base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    
    // Prepare email payload
    const emailPayload = {
      customerEmail,
      customerName: receiverDetails.fullName || 'Valued Customer',
      orderId: txnId,
      amount: `${currency} ${formattedAmount}`,
      fileName,
      pdfBase64
    };
    
    console.log('📤 [AUTO-EMAIL] Making API call to /api/send-invoice-email...');
    
    // Send email via API
    const response = await fetch('/api/send-invoice-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });
    
    console.log('📥 [AUTO-EMAIL] API Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [AUTO-EMAIL] API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }
    
    const emailResult = await response.json();
    console.log('📧 [AUTO-EMAIL] Email API Result:', emailResult);
    
    if (emailResult.success) {
      console.log('✅ [AUTO-EMAIL] Invoice email sent successfully!');
      return { success: true, result: emailResult };
    } else {
      console.warn('❌ [AUTO-EMAIL] Email API returned failure:', emailResult.error);
      return { success: false, error: emailResult.error || 'Unknown error' };
    }
    
  } catch (error) {
    console.error('❌ [AUTO-EMAIL] Error sending automatic invoice email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper function to detect if delivery is to Nepal
 * @param {Object} payment - Payment data
 * @returns {boolean} - True if delivery is to Nepal
 */
const isNepalDestination = (payment) => {
  const orderData = payment.orderData || {};
  const receiverDetails = orderData.receiver_details || {};
  const address = receiverDetails.address || {};
  
  // Check if country is Nepal or if it's a domestic order
  return address.country === 'Nepal' || 
         address.country === 'NP' || 
         !address.country || 
         address.country === '';
};

/**
 * Post-payment processing function that replicates the "Update Stock & Delete" functionality
 * This function updates product stock and clears purchased items from cart after successful payment
 * @param {Array} selectedProducts - Array of products that were purchased
 * @param {Object} user - User object with authentication info
 * @param {Function} clearPurchasedItemsFromCart - Function to clear items from cart
 * @param {Object} paymentData - Optional payment data for email automation
 * @returns {Object} - Processing results with success/failure details
 */
export const processPostPaymentStockAndCart = async (selectedProducts, user, clearPurchasedItemsFromCart, paymentData = null) => {
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
    emailSend: { success: false },
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
          const updatePayload = {
            data: {
              size_stocks: updatedSizeStocks
            }
          };

          const updateResponse = await updateData(`/api/products/${currentProduct.documentId}`, updatePayload);

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

          const updatePayload = {
            data: {
              size_stocks: updatedVariantSizeStocks
            }
          };

          const updateResponse = await updateData(`/api/product-variants/${currentVariant.documentId}`, updatePayload);

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

    // Step 3: Send automatic invoice email (if payment data is provided)
    if (paymentData) {
      console.log('📧 [POST-PAYMENT] Step 3: Sending automatic invoice email...');
      try {
        const emailResult = await sendAutomaticInvoiceEmail(paymentData);
        console.log('📧 [POST-PAYMENT] Email sending result:', emailResult);
        results.emailSend.success = emailResult.success;
        results.emailSend.result = emailResult.result;
        if (!emailResult.success) {
          results.emailSend.error = emailResult.error;
        }
      } catch (emailError) {
        console.error('❌ [POST-PAYMENT] Error sending automatic email:', emailError);
        results.emailSend.success = false;
        results.emailSend.error = emailError.message;
      }
    } else {
      console.log('ℹ️ [POST-PAYMENT] No payment data provided, skipping automatic email sending');
    }

    console.log('🎉 [POST-PAYMENT] Post-payment processing completed!');
    console.log('🔍 [POST-PAYMENT] Final results:', JSON.stringify(results, null, 2));

    return results;

  } catch (error) {
    console.error('❌ Error in post-payment processing:', error);
    throw error;
  }
};
