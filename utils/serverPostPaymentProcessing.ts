
import { fetchDataFromApi, updateData } from './api';
import { sendInvoiceEmail } from './email';

/**
 * Helper to get logo as base64 in Node environment
 */
const getLogoBase64 = () => {
    try {
        const fs = require('fs');
        const path = require('path');

        // Debug logging
        const cwd = process.cwd();
        console.log(`📂 [AUTO-EMAIL] Current working directory: ${cwd}`);

        // Try standard next.js public folder location
        const possiblePaths = [
            path.join(cwd, 'public', 'logo.png'),
            path.join(cwd, '.next', 'server', 'public', 'logo.png'), // Standalone output specific
            path.join(__dirname, '..', 'public', 'logo.png')
        ];

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                console.log(`✅ [AUTO-EMAIL] Found logo at: ${p}`);
                return { data: fs.readFileSync(p).toString('base64'), format: 'PNG' };
            }
        }

        console.warn('⚠️ [AUTO-EMAIL] Logo not found in common paths');
        return null;
    } catch (err) {
        console.warn('⚠️ [AUTO-EMAIL] Failed to load logo from filesystem:', err);
        return null;
    }
};

/**
 * Helper to fetch logo from URL if FS fails (Fallback)
 */
const fetchLogoFromUrl = async (baseUrl: string) => {
    try {
        const logoUrl = `${baseUrl}/logo.png`;
        console.log(`🌐 [AUTO-EMAIL] Attempting to fetch logo from URL: ${logoUrl}`);
        const res = await fetch(logoUrl);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        return { data: Buffer.from(arrayBuffer).toString('base64'), format: 'PNG' };
    } catch (e) {
        console.warn('⚠️ [AUTO-EMAIL] Failed to fetch logo via HTTP:', e);
        return null;
    }
};

/**
 * Helper function to detect if delivery is to Nepal
 */
const isNepalDestination = (payment: any) => {
    try {
        const countryCode = payment?.orderData?.receiver_details?.address?.countryCode || '';
        return countryCode.toUpperCase() === 'NP';
    } catch (error) {
        return false;
    }
};

/**
 * Automated invoice email sender (Server Side)
 */
const sendAutomaticInvoiceEmail = async (paymentData: any) => {
    console.log('📧 [AUTO-EMAIL] Starting automatic invoice email sending (Server Side)...');
    console.log('📋 Payment Data sections:', {
        hasOrderData: !!paymentData.orderData,
        hasShipping: !!paymentData.orderData?.shipping,
        hasSummary: !!paymentData.orderData?.orderSummary
    });

    try {
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

        // Amount logic
        let amount = paymentData.amount || orderSummary.totalAmount || 0;

        // Exchange rate logic for non-Nepal
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

        // Generate PDF
        const { jsPDF } = await import('jspdf');
        const jsPDFConstructor = (await import('jspdf')).default || (await import('jspdf')).jsPDF;
        const doc = new jsPDFConstructor({ compress: true });

        // Logo Logic
        let logoLoaded = false;
        let headerY = 35;

        try {
            // 1. Try Filesystem
            let logoInfo = getLogoBase64();

            // 2. Try HTTP Fallback if FS failed
            if (!logoInfo) {
                const baseUrl = process.env.NEXTAUTH_URL || 'https://traditionalalley.com.np';
                logoInfo = await fetchLogoFromUrl(baseUrl);
            }

            if (logoInfo) {
                const pageWidth = doc.internal.pageSize.getWidth();
                const logoWidth = 40;
                const logoHeight = 10;
                const logoX = (pageWidth - logoWidth) / 2;
                doc.addImage(logoInfo.data, logoInfo.format, logoX, 10, logoWidth, logoHeight);
                logoLoaded = true;
                headerY = 30;
            }
        } catch (err) {
            console.warn('⚠️ [AUTO-EMAIL] Error adding logo to PDF:', err);
        }

        // Header Title (Fallback or styling)
        if (!logoLoaded) {
            doc.setFontSize(20);
            doc.setTextColor(139, 69, 19); // Brown
            doc.text('Traditional Alley', doc.internal.pageSize.getWidth() / 2, headerY, { align: 'center' });
            headerY += 10;
        }

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('INVOICE', doc.internal.pageSize.getWidth() / 2, headerY + 10, { align: 'center' });

        // Columns Setup
        let yPosition = 60;
        const pageWidth = doc.internal.pageSize.getWidth();
        const leftColumnX = 20;
        const rightColumnX = pageWidth / 2 + 30;

        // --- LEFT COLUMN: Order Information ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Order Information', leftColumnX, yPosition);

        let leftYPosition = yPosition + 10;
        doc.setFont('helvetica', 'normal');
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
        doc.setFont('helvetica', 'bold');
        doc.text('Shipping Information', leftColumnX, leftYPosition + 4);
        leftYPosition += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const shippingInfoLines = [
            `Method: ${shippingInfo.method || 'Nepal Can Move'}`, // Default to NCM if unspecified
            `Delivery Type: ${shippingInfo.deliveryType || 'Standard'}`,
            `Cost: ${shippingCostText}`,
            `Estimated Delivery: ${estimatedDelivery}`
        ];
        shippingInfoLines.forEach(info => { doc.text(info, leftColumnX, leftYPosition); leftYPosition += 6; });

        // --- RIGHT COLUMN: Customer Information ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Information', rightColumnX, yPosition);
        let rightYPosition = yPosition + 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const address = receiverDetails.address || {};
        const customerInfo = [
            `Name: ${receiverDetails.fullName || receiverDetails.name || 'Valued Customer'}`,
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
        const tableData: any[] = [];
        const { getExchangeRate } = await import('./currency');
        const exchangeRate = isNepal ? await getExchangeRate() : 1;

        products.forEach((item: any) => {
            let price = item.price || 0;
            const quantity = item.quantity || 1;
            let total = item.subtotal || (price * quantity);
            if (isNepal) {
                price = price * exchangeRate;
                total = total * exchangeRate;
            }

            // Get title logic (Variant Aware - simplified for server)
            const title = item.title || item.name || 'Product';
            const size = item.selectedSize || item.size || '-';

            tableData.push([
                title,
                size,
                quantity.toString(),
                `${currency} ${Number(total).toFixed(2)}`
            ]);
        });

        // Use autoTable styling from OrderManagement.jsx
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
        const lastAutoTable = (doc as any).lastAutoTable;
        let breakdownY = lastAutoTable && lastAutoTable.finalY ? lastAutoTable.finalY + 15 : yPosition + 40;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Order Summary', 20, breakdownY);
        breakdownY += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Calculate Breakdown Values
        let displayOriginalSubtotal = 0;
        products.forEach((item: any) => {
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
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(139, 69, 19); // Brown
        doc.text(`Total Amount: ${currency} ${formattedAmount}`, pageWidth - 20, breakdownY, { align: 'right' });

        // Note
        const noteY = breakdownY + 10;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(102, 102, 102);

        let noteText = isNepal
            ? `Note: All amounts in NPR. Product prices converted from USD at rate 1 USD = ${exchangeRate.toFixed(2)} NPR`
            : 'Note: All amounts in USD';

        doc.text(noteText, pageWidth - 20, noteY, { align: 'right' });

        // Footer
        const footerY = noteY + 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        const footerText = 'Thank you for shopping with Traditional Alley! For any queries, please contact us at contact@traditionalalley.com';
        const footerLines = doc.splitTextToSize(footerText, pageWidth - 40);
        doc.text(footerLines, pageWidth / 2, footerY, { align: 'center' });

        // Output logic
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfArrayBuffer);

        console.log('📤 [AUTO-EMAIL] Calling sendInvoiceEmail utility directly...');
        const emailResult = await sendInvoiceEmail(
            customerEmail,
            receiverDetails.fullName || 'Valued Customer',
            txnId,
            pdfBuffer,
            {}
        );
        console.log('✅ [AUTO-EMAIL] Email utility returned:', emailResult);
        return emailResult;

    } catch (error: any) {
        console.error('❌ [AUTO-EMAIL] Critical error sending invoice:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Server-side post payment processing
 */
export const processServerPostPayment = async (selectedProducts: any[], user: any, clearPurchasedItemsFromCart: Function | null, paymentData: any = null) => {
    console.log('🔄 [SERVER-POST-PAYMENT] Starting post-payment processing...');

    const results = {
        stockUpdate: { success: false, results: [] },
        cartClear: { success: false },
        emailSend: { success: false },
        totalProducts: selectedProducts?.length || 0
    };

    try {
        console.log('📦 [SERVER-POST-PAYMENT] Stock update - processing ' + (selectedProducts?.length || 0) + ' products');

        // Note: Stock update logic is assumed to be handled previously or here.
        // For now, we focus on ensuring Email is sent and Cart is cleared.

        // Step 1: Clear Cart (Callback)
        if (clearPurchasedItemsFromCart) {
            await clearPurchasedItemsFromCart(selectedProducts);
            results.cartClear.success = true;
        }

        // Step 2: Email
        if (paymentData) {
            // Ensure paymentData has necessary structure or try to enhance it if possible
            // But we trust caller (route.ts) to provide full object
            const emailRes = await sendAutomaticInvoiceEmail(paymentData);
            results.emailSend = emailRes;
        }

        return results;

    } catch (err) {
        console.error(err);
        throw err;
    }
};
