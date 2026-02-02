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

    // Try multiple email sources for better compatibility
    const customerEmail = receiverDetails.email
      || orderData.customer_info?.email
      || paymentData.user?.email
      || null;

    console.log('📧 [AUTO-EMAIL] Customer email found:', customerEmail || 'NO EMAIL FOUND');

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
    const doc = new jsPDF({ compress: true });

    // Add Traditional Alley logo (prefer JPEG for smaller filesize, fallback to PNG)
    let logoLoaded = false;
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 40;
      const logoHeight = 10;
      const logoX = (pageWidth - logoWidth) / 2;

      await new Promise((resolve) => {
        const tryPngFallback = () => {
          const pngImg = new Image();
          pngImg.crossOrigin = 'anonymous';
          pngImg.onload = () => {
            doc.addImage(pngImg, 'PNG', logoX, 10, logoWidth, logoHeight);
            logoLoaded = true;
            resolve();
          };
          pngImg.onerror = () => {
            console.warn('⚠️ [AUTO-EMAIL] Could not load PNG logo, continuing without it');
            logoLoaded = false;
            resolve();
          };
          pngImg.src = '/logo.png';
        };

        const jpegImg = new Image();
        jpegImg.crossOrigin = 'anonymous';
        jpegImg.onload = () => {
          // Use MEDIUM compression hint for JPEG embedding
          doc.addImage(jpegImg, 'JPEG', logoX, 10, logoWidth, logoHeight, undefined, 'MEDIUM');
          logoLoaded = true;
          resolve();
        };
        jpegImg.onerror = () => {
          // Fallback to PNG
          tryPngFallback();
        };
        jpegImg.src = '/logo.jpg';
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
      `Phone: ${(receiverDetails.countryCode || '')}${receiverDetails.phone || 'N/A'}`.replace(/^\+?/, '+'),
      `Height: ${receiverDetails.height || 'N/A'}`,
      `Address: ${address.addressLine1 || 'N/A'}`,
      `City: ${address.cityName || 'N/A'}`,
      `Postal Code: ${address.postalCode || 'N/A'}`,
      `Country: ${address.countryCode || 'N/A'}`
    ];

    customerInfo.forEach(info => {
      doc.text(info, rightColumnX, rightYPosition);
      rightYPosition += 6;
    });

    // Products table with identical layout to dashboard
    const products = orderData.products || [];
    const { default: autoTable } = await import('jspdf-autotable');
    const tableData = [];

    // Exchange rate handling to mirror dashboard
    const { getExchangeRate } = await import('./currency');
    const exchangeRate = isNepal ? await getExchangeRate() : 1;

    products.forEach(item => {
      let price = item.price || 0;
      const quantity = item.quantity || 1;
      let total = item.subtotal || (price * quantity);
      if (isNepal) {
        price = price * exchangeRate;
        total = total * exchangeRate;
      }
      tableData.push([
        item.title || 'N/A',
        item.productDetails?.productCode || item.productCode || 'N/A',
        item.selectedSize || 'N/A',
        quantity.toString(),
        `${currency} ${Number(price).toFixed(2)}`,
        `${currency} ${Number(total).toFixed(2)}`
      ]);
    });

    // Render table
    yPosition = Math.max(leftYPosition, rightYPosition) + 20;
    autoTable(doc, {
      head: [['Product', 'Product Code', 'Size', 'Quantity', 'Price', 'Total']],
      body: tableData.length > 0 ? tableData : [['No items found', '', '', '', '', '']],
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [255, 229, 212], textColor: [0, 0, 0] },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    // Order Summary block identical to dashboard
    let breakdownY = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : Math.max(leftYPosition, rightYPosition)) + 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Order Summary', 20, breakdownY);

    breakdownY += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const originalSubtotal = products.reduce((sum, item) => {
      const p = item.price || 0;
      const q = item.quantity || 1;
      return sum + (p * q);
    }, 0);

    const productDiscounts = orderSummary.productDiscounts || 0;
    const couponDiscount = orderSummary.couponDiscount || 0;
    const shippingCost = orderSummary.shippingCost || 0;

    let displayOriginalSubtotal = originalSubtotal;
    let displayProductDiscounts = productDiscounts;
    let displayCouponDiscount = couponDiscount;
    let displayShippingCost = shippingCost;

    if (isNepal) {
      displayOriginalSubtotal = originalSubtotal * exchangeRate;
      if (productDiscounts > 0) displayProductDiscounts = productDiscounts * exchangeRate;
      if (couponDiscount > 0) displayCouponDiscount = couponDiscount * exchangeRate;
      // Shipping stays as-is for Nepal orders
    }

    const breakdownItems = [
      { label: 'Subtotal:', value: displayOriginalSubtotal },
      ...(displayProductDiscounts > 0 ? [{ label: 'Product Discounts:', value: -displayProductDiscounts, isDiscount: true }] : []),
      ...(displayCouponDiscount > 0 ? [{ label: `Coupon Discount (${orderSummary.couponCode || 'N/A'}):`, value: -displayCouponDiscount, isDiscount: true }] : []),
      ...(displayShippingCost > 0 ? [{ label: 'Shipping Cost:', value: displayShippingCost }] : [])
    ];

    breakdownItems.forEach(item => {
      doc.text(item.label, 20, breakdownY);
      const valueText = `${currency} ${Math.abs(item.value).toFixed(2)}`;
      const displayValue = item.isDiscount ? `- ${valueText}` : valueText;
      if (item.isDiscount) {
        doc.setTextColor(0, 128, 0);
      }
      doc.text(displayValue, doc.internal.pageSize.getWidth() - 20, breakdownY, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      breakdownY += 7;
    });

    breakdownY += 5;
    doc.setLineWidth(0.5);
    doc.line(20, breakdownY, doc.internal.pageSize.getWidth() - 20, breakdownY);
    breakdownY += 10;

    // Total amount aligned to right, same as dashboard
    const finalY = breakdownY;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount: ${currency} ${formattedAmount}`,
      doc.internal.pageSize.getWidth() - 20, finalY, { align: 'right' });

    // Currency note alignment to right, matching dashboard
    let noteY = finalY + 10;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(102, 102, 102);
    let noteText;
    if (isNepal) {
      noteText = `Note: All amounts in NPR. Product prices converted from USD at rate 1 USD = ${exchangeRate.toFixed(2)} NPR`;
    } else {
      noteText = 'Note: All amounts in USD';
      if (paymentData.amount_npr || amount !== (paymentData.amount || orderSummary.totalAmount || 0)) {
        noteText = `Note: All amounts in USD (converted from NPR at rate 1 USD = ${exchangeRate.toFixed(2)} NPR)`;
      }
    }
    doc.text(noteText, doc.internal.pageSize.getWidth() - 20, noteY, { align: 'right' });

    // Footer centered
    const footerY = noteY + 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(102, 102, 102);
    const footerText = 'Thank you for shopping with Traditional Alley! For any queries, please contact us at contact@traditionalalley.com';
    const footerLines = doc.splitTextToSize(footerText, doc.internal.pageSize.getWidth() - 40);
    doc.text(footerLines, doc.internal.pageSize.getWidth() / 2, footerY, { align: 'center' });

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
  try {
    const countryCode = payment?.orderData?.receiver_details?.address?.countryCode || '';
    return countryCode.toUpperCase() === 'NP';
  } catch (error) {
    return false;
  }
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
    console.warn('⚠️ [POST-PAYMENT] No authenticated user, proceeding as guest');
  } else if (user.id === 'guest') {
    console.log('🔓 [POST-PAYMENT] Processing guest user payment');
  } else {
    console.log('🔐 [POST-PAYMENT] Processing authenticated user payment');
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
