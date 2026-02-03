
import { fetchDataFromApi, updateData } from './api';

/**
 * Automated email sending function that replicates the "Send Email" functionality
 * This function sends invoice emails automatically after successful payment
 * @param {Object} paymentData - Payment data containing order and customer information
 * @returns {Object} - Email sending result with success/failure details
 */

// Function to detect if delivery is to Nepal (Client Safe)
const isNepalDestination = (payment) => {
  try {
    const countryCode = payment?.orderData?.receiver_details?.address?.countryCode || '';
    return countryCode.toUpperCase() === 'NP';
  } catch (error) {
    return false;
  }
};

const sendAutomaticInvoiceEmail = async (paymentData) => {
  console.log('📧 [AUTO-EMAIL] Starting automatic invoice email sending (Client Side)...');

  try {
    // Validate payment data
    if (!paymentData) throw new Error('Payment data is missing');

    const orderData = paymentData.orderData || {};
    const receiverDetails = orderData.receiver_details || {};
    const customerEmail = receiverDetails.email
      || orderData.customer_info?.email
      || paymentData.user?.email
      || null;

    if (!customerEmail) {
      console.warn('⚠️ [AUTO-EMAIL] No customer email found.');
      return { success: false, error: 'No customer email found' };
    }

    const isNepal = isNepalDestination(paymentData);
    const currency = isNepal ? 'Rs.' : '$';

    const orderSummary = orderData.orderSummary || {};
    const shippingInfo = orderData.shipping || {};

    let amount = paymentData.amount || orderSummary.totalAmount || 0;

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
      if (paymentData.amount_npr) amount = paymentData.amount_npr;
    }

    const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;
    const txnId = paymentData.merchantTxnId || paymentData.attributes?.merchantTxnId || 'receipt';

    console.log('📧 [AUTO-EMAIL] Generating PDF for:', customerEmail);

    // Generate PDF for email (Client Side - using jspdf default)
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ compress: true });

    // Add Traditional Alley logo (Client Side: new Image() is valid)
    let logoLoaded = false;
    let headerY = 35;

    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 40;
      const logoHeight = 10;
      const logoX = (pageWidth - logoWidth) / 2;

      await new Promise((resolve) => {
        const logoImg = new Image();
        logoImg.crossOrigin = 'Anonymous';

        logoImg.onload = () => {
          doc.addImage(logoImg, 'PNG', logoX, 10, logoWidth, logoHeight);
          logoLoaded = true;
          headerY = 30;
          resolve(true);
        };

        logoImg.onerror = () => {
          console.warn('⚠️ [AUTO-EMAIL] Failed to load logo image');
          resolve(false);
        };

        logoImg.src = '/logo.png';
      });
    } catch (err) {
      console.warn('⚠️ [AUTO-EMAIL] Error adding logo to PDF:', err);
    }

    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Title (Fallback or styling)
    if (!logoLoaded) {
      doc.setFontSize(20);
      doc.setTextColor(139, 69, 19); // Brown
      doc.text('Traditional Alley', pageWidth / 2, headerY, { align: 'center' });
      headerY += 10;
    }

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', pageWidth / 2, headerY + 10, { align: 'center' });

    // Columns Setup
    let yPosition = 60;
    const leftColumnX = 20;
    const rightColumnX = pageWidth / 2 + 30;

    // --- LEFT COLUMN: Order Information ---
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Order Information', leftColumnX, yPosition);

    let leftYPosition = yPosition + 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    const dateStr = paymentData.timestamp ? new Date(paymentData.timestamp).toLocaleDateString() : new Date().toLocaleDateString();

    // Ultra-defensive fallbacks for payment fields
    const paymentMethod = paymentData?.instrument?.trim()
      || paymentData?.paymentMethod?.trim()
      || (paymentData?.provider === 'nps' ? 'Nepal Payment Solutions' : 'Online Payment')
      || 'Online Payment';

    const institution = paymentData?.institution?.trim()
      || paymentData?.bankName?.trim()
      || (paymentData?.provider === 'nps' ? 'Nepal Payment Solutions' : 'Payment Gateway')
      || 'Payment Gateway';

    const orderInfo = [
      `Order ID: ${txnId}`,
      `Gateway Ref: ${paymentData.gatewayReferenceNo || 'N/A'}`,
      `Date: ${dateStr}`,
      `Status: ${paymentData.status || 'Success'}`,
      `Payment Method: ${paymentMethod}`,
      `Institution: ${institution}`
    ];
    orderInfo.forEach(info => { doc.text(info, leftColumnX, leftYPosition); leftYPosition += 6; });

    // --- LEFT COLUMN: Shipping Information ---
    const shippingCostRaw = orderSummary.shippingCost || 0;
    const shippingCostText = shippingCostRaw > 0
      ? `${currency} ${Number(shippingCostRaw).toFixed(2)}`
      : 'Not set';

    let estimatedDelivery = shippingInfo.estimatedDelivery || 'N/A';
    const deliveryType = shippingInfo.deliveryType || '';
    if (deliveryType.toLowerCase().includes('express')) estimatedDelivery = '9-11 days';
    else if (deliveryType.toLowerCase().includes('economy')) estimatedDelivery = '16-21 days';

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Shipping Information', leftColumnX, leftYPosition + 4);
    leftYPosition += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    const shippingInfoLines = [
      `Method: ${shippingInfo.method || 'Nepal Can Move'}`,
      `Delivery Type: ${shippingInfo.deliveryType || 'Standard'}`,
      `Cost: ${shippingCostText}`,
      `Estimated Delivery: ${estimatedDelivery}`
    ];
    shippingInfoLines.forEach(info => { doc.text(info, leftColumnX, leftYPosition); leftYPosition += 6; });

    // --- RIGHT COLUMN: Customer Information ---
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Customer Information', rightColumnX, yPosition);
    let rightYPosition = yPosition + 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    const address = receiverDetails.address || {};
    const customerInfo = [
      `Name: ${receiverDetails.fullName || 'Valued Customer'}`,
      `Email: ${receiverDetails.email || 'N/A'}`,
      `Phone: ${receiverDetails.phone || 'N/A'}`,
      `City: ${address.cityName || 'N/A'}`,
      `Postal Code: ${address.postalCode || 'N/A'}`,
      `Country: ${address.countryCode || 'N/A'}`
    ];
    customerInfo.forEach(info => { doc.text(info, rightColumnX, rightYPosition); rightYPosition += 6; });

    // Sync Y Position
    yPosition = Math.max(leftYPosition, rightYPosition) + 25;

    // --- PRODUCTS TABLE ---
    const products = orderData.products || [];
    const { default: autoTable } = await import('jspdf-autotable');
    const tableData = [];
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
      // Variant aware title logic (simplified for client)
      const title = item.title || item.name || 'Product';
      const size = item.selectedSize || item.size || '-';

      tableData.push([
        title,
        size,
        quantity.toString(),
        `${currency} ${Number(total).toFixed(2)}`
      ]);
    });

    autoTable(doc, {
      head: [['Product', 'Size', 'Qty', 'Total']],
      body: tableData.length > 0 ? tableData : [['No items', '', '', '']],
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [255, 229, 212], textColor: [0, 0, 0] }, // Peach Header
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    // --- ORDER SUMMARY ---
    const lastAutoTable = doc.lastAutoTable;
    let breakdownY = lastAutoTable && lastAutoTable.finalY ? lastAutoTable.finalY + 15 : yPosition + 40;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Order Summary', 20, breakdownY);
    breakdownY += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    // Calculate Breakdown Values
    let displayOriginalSubtotal = 0;
    products.forEach(item => {
      const price = item.price || 0;
      const qty = item.quantity || 1;
      displayOriginalSubtotal += (price * qty);
    });

    const productDiscounts = orderSummary.productDiscounts || 0;
    const couponDiscount = orderSummary.couponDiscount || 0;
    let displayProductDiscounts = productDiscounts;
    let displayCouponDiscount = couponDiscount;
    let displayShippingCost = shippingCostRaw;

    if (isNepal) {
      displayOriginalSubtotal = displayOriginalSubtotal * exchangeRate;
      if (productDiscounts > 0) displayProductDiscounts = productDiscounts * exchangeRate;
      if (couponDiscount > 0) displayCouponDiscount = couponDiscount * exchangeRate;
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

      if (item.isDiscount) doc.setTextColor(0, 128, 0); // Green
      doc.text(displayValue, pageWidth - 20, breakdownY, { align: 'right' });
      doc.setTextColor(0, 0, 0); // Reset

      breakdownY += 7;
    });

    // Separator Line
    breakdownY += 5;
    doc.setLineWidth(0.5);
    doc.line(20, breakdownY, pageWidth - 20, breakdownY);
    breakdownY += 10;

    // Total Amount
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 69, 19); // Brown
    doc.text(`Total: ${currency} ${formattedAmount}`, pageWidth - 20, breakdownY, { align: 'right' });

    // Note
    const noteY = breakdownY + 10;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(102, 102, 102);

    let noteText = isNepal
      ? `Note: All amounts in NPR. Product prices converted from USD at rate 1 USD = ${exchangeRate.toFixed(2)} NPR`
      : 'Note: All amounts in USD';

    doc.text(noteText, pageWidth - 20, noteY, { align: 'right' });

    // Footer
    const footerY = noteY + 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(102, 102, 102);
    const footerText = 'Thank you for shopping with Traditional Alley! For any queries, please contact us at contact@traditionalalley.com';
    const footerLines = doc.splitTextToSize(footerText, pageWidth - 40);
    doc.text(footerLines, pageWidth / 2, footerY, { align: 'center' });

    // Convert PDF to base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const fileName = `Traditional_Alley_Bill_${txnId}.pdf`;

    const emailPayload = {
      customerEmail,
      customerName: receiverDetails.fullName || 'Valued Customer',
      orderId: txnId,
      amount: `${currency} ${formattedAmount}`,
      fileName,
      pdfBase64
    };

    console.log('📤 [AUTO-EMAIL] Making API call to /api/send-invoice-email...');

    // Send email via API (Client Side Fetch)
    const response = await fetch('/api/send-invoice-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log('📥 [AUTO-EMAIL] API Response status:', response.status);

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`API Error: ${txt}`);
    }

    const emailResult = await response.json();
    return emailResult;

  } catch (error) {
    console.error('❌ [AUTO-EMAIL] Critical error sending invoice:', error);
    return { success: false, error: error.message };
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
  // Client-safe version of the process loop
  console.log('🔄 [CLIENT-POST-PAYMENT] Starting post-payment processing...');

  const results = {
    stockUpdate: { success: false, results: [] },
    cartClear: { success: false },
    emailSend: { success: false },
  };

  try {
    console.log('📦 [CLIENT] Processing ' + selectedProducts.length + ' products for stock update...');

    // Step 2: Clear Cart
    if (typeof clearPurchasedItemsFromCart === 'function') {
      await clearPurchasedItemsFromCart(selectedProducts);
      results.cartClear.success = true;
    }

    // Step 3: Send Email
    if (paymentData) {
      results.emailSend = await sendAutomaticInvoiceEmail(paymentData);
    }

    return results;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
