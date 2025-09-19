'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NCMOrderForm from './NCMOrderForm';
import NCMOrderButton from './NCMOrderButton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Removed direct email import - using API route instead
// Force recompilation - all userBag references fixed

const OrderManagement = () => {
  const [userBags, setUserBags] = useState([]);
  const [showUserBags, setShowUserBags] = useState(false);
  const [loadingUserBags, setLoadingUserBags] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showNCMForm, setShowNCMForm] = useState(false);
  const [ncmOrders, setNcmOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingPagination, setIsLoadingPagination] = useState(false);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchUserBags();
  }, []);

  // Helper function to get individual payment status
  const getPaymentStatus = (payment, userBag) => {
    // Only orders with ACTUAL "NCM Order Created" or "Shipment Created" should be in shipped tab
    // This means they must have either:
    // 1. DHL tracking info with successful shipment creation (stored in userBag.trackingInfo)
    // 2. NCM order ID (indicating NCM order was created)
    
    // Find shipment info for this payment from userBag.trackingInfo
    let shipmentInfo = null;
    let ncmOrderInfo = null;
    
    if (userBag.trackingInfo) {
      if (Array.isArray(userBag.trackingInfo)) {
        // Find DHL shipment info by merchantTxnId
        shipmentInfo = userBag.trackingInfo.find(info => 
          info.merchantTxnId === payment.merchantTxnId && info.type !== 'ncm_order'
        );
        // Find NCM order info by gatewayReferenceNo
        ncmOrderInfo = userBag.trackingInfo.find(info => 
          info.type === 'ncm_order' && 
          info.gatewayReferenceNo === payment.gatewayReferenceNo
        );
      } else if (userBag.trackingInfo.merchantTxnId === payment.merchantTxnId) {
        shipmentInfo = userBag.trackingInfo;
      }
    }
    
    const hasActualShipmentCreated = shipmentInfo && (shipmentInfo.status === 'Created' || shipmentInfo.success);
    const hasActualNCMOrderCreated = 
      (payment.ncmOrderId && payment.ncmOrderId.trim() !== '') || // Legacy check
      (ncmOrderInfo && ncmOrderInfo.ncmOrderId); // New check in trackingInfo
    
    // Debug logging to see what's happening
    console.log(`Payment ${payment.merchantTxnId} (Gateway: ${payment.gatewayReferenceNo}):`, {
      hasActualShipmentCreated,
      hasActualNCMOrderCreated,
      shipmentInfo,
      ncmOrderInfo,
      userBagTrackingInfo: userBag.trackingInfo,
      paymentStatus: payment.status
    });
    
    // ONLY return 'shipped' if there's actual proof of INDIVIDUAL payment shipment/NCM order creation
    if (hasActualShipmentCreated || hasActualNCMOrderCreated) {
      return 'shipped';
    }
    
    // Return the payment status (success, failed, pending)
    const status = payment.status?.toLowerCase();
    if (status === 'success') return 'success';
    if (status === 'fail' || status === 'failed') return 'failed';
    return 'pending';
  };

  // Sort user bags with latest orders at bottom
  const sortedUserBags = [...userBags].sort((a, b) => {
    const dateA = new Date(a.attributes?.createdAt || a.createdAt || 0);
    const dateB = new Date(b.attributes?.createdAt || b.createdAt || 0);
    return dateA - dateB; // Ascending order (oldest first, latest at bottom)
  });

  // Get all payments with their status
  const getAllPayments = () => {
    const allPayments = [];
    
    sortedUserBags.forEach(userBag => {
      if (userBag && userBag.user_orders?.payments) {
        userBag.user_orders.payments.forEach((payment, index) => {
          const status = getPaymentStatus(payment, userBag);
          allPayments.push({
            ...payment,
            userBag,
            paymentIndex: index,
            computedStatus: status
          });
        });
      }
    });
    
    // Debug: Log timestamp fields for sorting
    console.log('\n=== PAYMENT TIMESTAMPS FOR SORTING ===');
    allPayments.forEach((payment, index) => {
      console.log(`Payment ${index + 1} (${payment.orderData?.receiver_details?.fullName}):`);
      console.log('  timestamp:', payment.timestamp);
      console.log('  createdAt:', payment.createdAt);
      console.log('  userBag.createdAt:', payment.userBag.attributes?.createdAt);
    });
    
    // Sort payments by their individual timestamps (oldest first)
    allPayments.sort((a, b) => {
      const dateA = new Date(a.timestamp || a.createdAt || a.userBag.attributes?.createdAt || 0);
      const dateB = new Date(b.timestamp || b.createdAt || b.userBag.attributes?.createdAt || 0);
      console.log(`Comparing ${a.orderData?.receiver_details?.fullName} (${dateA.toISOString()}) vs ${b.orderData?.receiver_details?.fullName} (${dateB.toISOString()})`);
      return dateA - dateB;
    });
    
    console.log('\n=== FINAL SORTED ORDER ===');
    allPayments.forEach((payment, index) => {
      const sortDate = new Date(payment.timestamp || payment.createdAt || payment.userBag.attributes?.createdAt || 0);
      console.log(`${index + 1}. ${payment.orderData?.receiver_details?.fullName} - ${sortDate.toISOString()}`);
    });
    
    return allPayments;
  };

  console.log('🚀 About to call getAllPayments');
  const allPayments = getAllPayments();
  console.log('✅ getAllPayments completed, found', allPayments.length, 'payments');

  // Filter payments based on active tab
  const filteredPayments = allPayments.filter(payment => payment.computedStatus === activeTab);

  // Get counts for each tab
  const getTabCounts = () => {
    const counts = { pending: 0, success: 0, failed: 0, shipped: 0 };
    
    allPayments.forEach(payment => {
      counts[payment.computedStatus]++;
    });
    
    console.log('\n=== PAYMENT COUNTS ===');
    console.log('Total payments found:', allPayments.length);
    console.log('Tab counts:', counts);
    console.log('Expected: Success=7, Pending=5, Failed=1');
    
    return counts;
  };

  const tabCounts = getTabCounts();

  const fetchUserBags = async () => {
    setLoadingUserBags(true);
    try {
      const response = await axios.get('/api/user-bags?pagination[pageSize]=100&populate=*');
      if (response.data && response.data.data) {
        setUserBags(response.data.data); 
      }
    } catch (error) {
      console.error('Error fetching user bags:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      setError('Failed to fetch user bags. See console for details.');
    } finally {
      setLoadingUserBags(false);
    }
  };

  const createShipment = async (payment, userBagId) => {
    const { receiver_details, products } = payment.orderData;
    const { address } = receiver_details;

    const product = products[0];
    const packageInfo = product.packageInfo;

    const formData = {
      plannedShippingDate: new Date().toISOString().split('T')[0],
      productCode: 'P',
      isCustomsDeclarable: true,
      declaredValue: 0, 
      declaredValueCurrency: 'USD',
      incoterm: 'DAP',
      exportDeclaration: {
        exportReason: 'SALE',
        invoice: {
          number: `INV-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
        }
      },
      originAddress: {
        postalCode: '44600',
        cityName: 'Kathmandu',
        countryCode: 'NP',
        addressLine1: '',
      },
      destinationAddress: {
        postalCode: address.postalCode,
        cityName: address.cityName,
        countryCode: address.countryCode,
        addressLine1: address.addressLine1,
      },
      packages: [{
        weight: packageInfo.weight,
        length: packageInfo.dimensions.length,
        width: packageInfo.dimensions.width,
        height: packageInfo.dimensions.height,
        description: product.title,
        declaredValue: packageInfo.declaredValue || 0,
        commodityCode: packageInfo.commodityCode,
        quantity: 1, 
        manufacturingCountryCode: 'NP', 
      }],
      shipper: {
        companyName: 'Traditional Alley',
        fullName: 'Traditional Alley',
        email: 'traditionalley2050@gmail.com',
        phone: '9844594187',
        countryCode: '+977',
      },
      recipient: {
        fullName: receiver_details.fullName,
        email: receiver_details.email,
        phone: receiver_details.phone,
        company: receiver_details.companyName || '',
        countryCode: '', 
      },
    };

    try {
      const response = await axios.post('/api/dhl/shipments', formData);
      console.log('Shipment created:', response.data);

      const shipmentData = response.data.data;

      if (userBagId) {
        try {
          const existingBagResponse = await axios.get(`/api/user-bags/${userBagId}?populate=*`);
          const existingBag = existingBagResponse.data.data;
          
          const newTrackingInfo = {
            status: 'Created',
            success: true,
            merchantTxnId: payment.merchantTxnId,
            gatewayReferenceNo: payment.gatewayReferenceNo,
            shipmentTrackingNumber: shipmentData.shipmentTrackingNumber,
            trackingUrl: shipmentData.trackingUrl,
            pickupConfirmationNumber: shipmentData.pickupConfirmationNumber,
            dispatchConfirmationNumber: shipmentData.dispatchConfirmationNumber,
            cancelPickupUrl: shipmentData.cancelPickupUrl,
            packages: shipmentData.packages || [],
            documents: shipmentData.documents || [],
            timestamp: new Date().toISOString()
          };
          
          let updatedTrackingInfo;
          if (existingBag.trackingInfo) {
            if (Array.isArray(existingBag.trackingInfo)) {
              updatedTrackingInfo = [...existingBag.trackingInfo, newTrackingInfo];
            } else {
              updatedTrackingInfo = [existingBag.trackingInfo, newTrackingInfo];
            }
          } else {
            updatedTrackingInfo = newTrackingInfo;
          }
          
          const updatePayload = {
            data: {
              trackingInfo: updatedTrackingInfo
            }
          };
          
          const updateResponse = await axios.put(`/api/user-bags/${userBagId}`, updatePayload);
          console.log('User bag updated successfully with appended tracking info:', updateResponse.data);
          
          await fetchUserBags();
        } catch (error) {
          console.error('Error updating user bag. Status:', error.response?.status, 'Data:', error.response?.data);
          console.error('Full error object:', error);
        }
      } else {
        console.error('Cannot update user bag: userBagId is undefined');
      }

    } catch (error) {
      console.error('Error creating shipment:', error);
    }
  };

  const getShipmentInfo = (bag, merchantTxnId) => {
    if (!bag.trackingInfo) return null;
    
    if (Array.isArray(bag.trackingInfo)) {
      return bag.trackingInfo.find(info => info.merchantTxnId === merchantTxnId);
    } else if (bag.trackingInfo.merchantTxnId === merchantTxnId) {
      return bag.trackingInfo;
    }
    return null;
  };

  const getDocuments = (shipmentInfo) => {
    if (!shipmentInfo || !shipmentInfo.documents) {
      return { label: null, invoice: null };
    }
    
    const documents = shipmentInfo.documents;
    
    let label = documents.find(doc => 
      doc.typeCode === 'label' || 
      doc.typeCode === 'LABEL' || 
      doc.typeCode === 'shipmentLabel' ||
      doc.type === 'label' ||
      doc.documentType === 'label'
    );
    
    let invoice = documents.find(doc => 
      doc.typeCode === 'invoice' || 
      doc.typeCode === 'INVOICE' || 
      doc.typeCode === 'commercialInvoice' ||
      doc.type === 'invoice' ||
      doc.documentType === 'invoice'
    );
    
    return { label, invoice };
  };

  const downloadPdf = (base64Content, fileName) => {
    try {
      base64Content = base64Content.replace(/\s/g, '');
      
      const cleanBase64 = base64Content
        .replace(/\-/g, '+')
        .replace(/\_/g, '/');
      
      const padding = '='.repeat((4 - cleanBase64.length % 4) % 4);
      const base64Data = cleanBase64 + padding;
      
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to download PDF: ${error.message}`);
    }
  };

  const downloadLabel = (shipmentInfo) => {
    const { label } = getDocuments(shipmentInfo);
    
    if (label && label.content) {
      const fileName = `label_${shipmentInfo.merchantTxnId}_${shipmentInfo.shipmentTrackingNumber}.pdf`;
      downloadPdf(label.content, fileName);
    } else {
      alert('Label not available for download');
    }
  };

  const downloadInvoice = (shipmentInfo) => {
    const { invoice } = getDocuments(shipmentInfo);
    
    if (invoice && invoice.content) {
      const fileName = `invoice_${shipmentInfo.merchantTxnId}_${shipmentInfo.shipmentTrackingNumber}.pdf`;
      downloadPdf(invoice.content, fileName);
    } else {
      alert('Invoice not available for download');
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Debug logging
      console.log('formatTimeAgo called with:', dateString);
      console.log('Parsed date:', date.toISOString());
      console.log('Current time:', now.toISOString());
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date detected');
        return 'Invalid date';
      }
      
      // Calculate difference in milliseconds - always use absolute value
      const rawDiffInMs = now.getTime() - date.getTime();
      const diffInMs = Math.abs(rawDiffInMs);
      const totalSeconds = Math.floor(diffInMs / 1000);
      
      console.log('Raw time difference (ms):', rawDiffInMs);
      console.log('Absolute time difference (ms):', diffInMs);
      console.log('Total seconds:', totalSeconds);
      
      // Triple safety: ensure we never have negative values
      const seconds = Math.max(0, Math.abs(totalSeconds));
      
      console.log('Final seconds value:', seconds);
      
      // Years (365.25 days * 24 hours * 60 minutes * 60 seconds)
      if (seconds >= 31557600) {
        const years = Math.floor(seconds / 31557600);
        const result = years === 1 ? '1 year ago' : `${years} years ago`;
        console.log('Returning years:', result);
        return result;
      }
      
      // Months (30.44 days average * 24 hours * 60 minutes * 60 seconds)
      if (seconds >= 2629800) {
        const months = Math.floor(seconds / 2629800);
        const result = months === 1 ? '1 month ago' : `${months} months ago`;
        console.log('Returning months:', result);
        return result;
      }
      
      // Days
      if (seconds >= 86400) {
        const days = Math.floor(seconds / 86400);
        const result = days === 1 ? '1 day ago' : `${days} days ago`;
        console.log('Returning days:', result);
        return result;
      }
      
      // Hours
      if (seconds >= 3600) {
        const hours = Math.floor(seconds / 3600);
        const result = hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        console.log('Returning hours:', result);
        return result;
      }
      
      // Minutes
      if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const result = minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
        console.log('Returning minutes:', result);
        return result;
      }
      
      // Seconds
      if (seconds === 0) {
        console.log('Returning: Just now');
        return 'Just now';
      }
      
      const result = seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
      console.log('Returning seconds:', result);
      return result;
      
    } catch (error) {
      console.error('Error formatting time:', error, 'for dateString:', dateString);
      return 'Time error';
    }
  };

  const [error, setError] = useState('');



  // Pagination navigation functions
  const goToNextPage = async () => {
    setIsLoadingPagination(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setCurrentPage(prev => prev + 1);
    setIsLoadingPagination(false);
  };

  const goToPreviousPage = async () => {
    setIsLoadingPagination(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setCurrentPage(prev => Math.max(0, prev - 1));
    setIsLoadingPagination(false);
  };

  // Reset to first page when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  // Get proper product image (variant vs main)
  const getProductImage = (product) => {
    // If product has a selected variant with image, use variant image
    if (product.selectedVariant && product.selectedVariant.image) {
      return product.selectedVariant.image;
    }
    // If product has variant images and a selected variant, find matching variant image
    if (product.variantImages && product.selectedVariant) {
      const variantImage = product.variantImages.find(img => 
        img.variant === product.selectedVariant.size || 
        img.variant === product.selectedVariant.color
      );
      if (variantImage) {
        return variantImage.image;
      }
    }
    // Fall back to main product image
    return product.image || product.mainImage || '/images/placeholder.jpg';
  };



  // Determine if destination is Nepal
  const isNepalDestination = (payment) => {
    try {
      const countryCode = payment?.orderData?.receiver_details?.address?.countryCode || '';
      return countryCode.toUpperCase() === 'NP';
    } catch (error) {
      console.error('Error determining destination country:', error);
      return false;
    }
  };

  // Function to generate PDF only (no email)
  const generateBillOnly = async (payment) => {
    try {
      console.log('🔥 GENERATE BILL ONLY FUNCTION CALLED');
      console.log('📋 Payment data received:', JSON.stringify(payment, null, 2));
      
      // Validate payment data
      if (!payment) {
        console.error('❌ Payment data is missing');
        alert('Error: Payment data is missing');
        throw new Error('Payment data is missing');
      }
      
      // Extract orderData from payment
      const orderData = payment.orderData || {};
      console.log('📦 Order data extracted:', JSON.stringify(orderData, null, 2));
      
      // Check if receiver details exist
      const receiverDetails = orderData.receiver_details || {};
      console.log('👤 Receiver details:', JSON.stringify(receiverDetails, null, 2));
      
      // Detect if delivery is to Nepal
      const isNepal = isNepalDestination(payment);
      const currency = isNepal ? 'Rs.' : '$';
      const currencyName = isNepal ? 'NPR' : 'USD';
      
      console.log('Bill generation - Nepal destination:', isNepal, 'Currency:', currency);
      
      const doc = new jsPDF();
      
      // Add Traditional Alley logo
      let logoLoaded = false;
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = '/logo.png';
        await new Promise((resolve, reject) => {
          logoImg.onload = () => {
            // Add logo to PDF (centered at top)
            const logoWidth = 40;
            const logoHeight = 10;
            const pageWidth = doc.internal.pageSize.getWidth();
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(logoImg, 'PNG', logoX, 10, logoWidth, logoHeight);
            logoLoaded = true;
            resolve();
          };
          logoImg.onerror = () => {
            console.warn('Could not load logo, continuing without it');
            logoLoaded = false;
            resolve();
          };
        });
      } catch (error) {
        console.warn('Logo loading failed:', error);
        logoLoaded = false;
      }
      
      // Header
      let headerY = 35;
      
      // Only show title if logo is not loaded
      if (!logoLoaded) {
        doc.setFontSize(20);
        doc.setTextColor(139, 69, 19); // Brown color
        doc.text('Traditional Alley', doc.internal.pageSize.getWidth() / 2, headerY, { align: 'center' });
        headerY += 10;
      } else {
        // If logo is loaded, start from a lower position
        headerY = 30;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('INVOICE', doc.internal.pageSize.getWidth() / 2, headerY + 10, { align: 'center' });
      
      // Order Information and Customer Information in same row
      let yPosition = 60;
      const pageWidth = doc.internal.pageSize.getWidth();
      const leftColumnX = 20;
      const rightColumnX = pageWidth / 2 + 30;
      
      // Order Information (Left Column)
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Order Information', leftColumnX, yPosition);
      
      let leftYPosition = yPosition + 10;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      
      const orderSummary = orderData.orderSummary || {};
      
      const orderInfo = [
        `Order ID: ${payment.merchantTxnId || 'N/A'}`,
        `Gateway Reference: ${payment.gatewayReferenceNo || 'N/A'}`,
        `Process ID: ${payment.processId || 'N/A'}`,
        `Date: ${payment.timestamp ? new Date(payment.timestamp).toLocaleDateString() : 'N/A'}`,
        `Payment Status: ${payment.status || 'N/A'}`,
        `Payment Method: ${payment.instrument || 'N/A'}`,
        `Institution: ${payment.institution || 'N/A'}`
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
      
      // Extract data from the correct structure
      const customerDetails = orderData.receiver_details || {};
      const address = customerDetails.address || {};
      
      console.log('Customer data sources:', { orderData, customerDetails, address });
      
      const customerInfo = [
        `Name: ${customerDetails.fullName || 'N/A'}`,
        `Email: ${customerDetails.email || 'N/A'}`,
        `Phone: ${customerDetails.countryCode || ''}${customerDetails.phone || 'N/A'}`.replace(/^\+?/, '+'),
        `Address: ${address.addressLine1 || 'N/A'}`,
        `City: ${address.cityName || 'N/A'}`,
        `Postal Code: ${address.postalCode || 'N/A'}`,
        `Country: ${address.countryCode || 'N/A'}`
      ];
      
      customerInfo.forEach(info => {
        doc.text(info, rightColumnX, rightYPosition);
        rightYPosition += 6;
      });
      
      // Set yPosition to the maximum of both columns for next section with more gap
       yPosition = Math.max(leftYPosition, rightYPosition) + 25;
      
      // Products Table
      yPosition += 15;
      
      const tableData = [];
      const products = orderData.products || [];
      
      console.log('Product data sources:', { orderData, products });
      
      // Convert product prices for Nepal orders
      const { getExchangeRate } = await import('../../utils/currency');
      const exchangeRate = isNepal ? await getExchangeRate() : 1;
      
      products.forEach(item => {
        let price = item.price || 0;
        const quantity = item.quantity || 1;
        let total = item.subtotal || (price * quantity);
        
        // Convert USD prices to NPR for Nepal orders
        if (isNepal) {
          price = price * exchangeRate;
          total = total * exchangeRate;
        }
        
        console.log('Processing item:', { item, originalPrice: item.price, convertedPrice: price, quantity, total, isNepal, exchangeRate });
        
        tableData.push([
          item.title || 'N/A',
          item.productDetails?.productCode || item.productCode || 'N/A',
          item.selectedSize || 'N/A',
          item.selectedColor || 'N/A',
          quantity.toString(),
          `${currency} ${price.toFixed(2)}`,
          `${currency} ${total.toFixed(2)}`
        ]);
      });
      
      if (tableData.length === 0) {
        tableData.push(['No items found', '', '', '', '', '', '']);
      }
      
      autoTable(doc, {
        head: [['Product', 'Product Code', 'Size', 'Color', 'Quantity', 'Price', 'Total']],
        body: tableData,
        startY: yPosition,
        theme: 'striped',
        headStyles: { fillColor: [255, 229, 212], textColor: [0, 0, 0] },
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
      });
      
      // Calculation Breakdown
      let breakdownY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Order Summary', 20, breakdownY);
      
      breakdownY += 10;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      // Calculate values for breakdown
      const originalSubtotal = products.reduce((sum, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
      }, 0);
      
      const productDiscounts = orderSummary.productDiscounts || 0;
      const couponDiscount = orderSummary.couponDiscount || 0;
      const shippingCost = orderSummary.shippingCost || 0;
      const finalSubtotal = orderSummary.finalSubtotal || 0;
      
      // Convert values for Nepal orders
      let displayOriginalSubtotal = originalSubtotal;
      let displayProductDiscounts = productDiscounts;
      let displayCouponDiscount = couponDiscount;
      let displayShippingCost = shippingCost;
      
      if (isNepal) {
        displayOriginalSubtotal = originalSubtotal * exchangeRate;
        if (productDiscounts > 0) displayProductDiscounts = productDiscounts * exchangeRate;
        if (couponDiscount > 0) displayCouponDiscount = couponDiscount * exchangeRate;
        // Shipping cost is already in NPR for Nepal orders
      }
      
      // Display breakdown
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
        
        // Set color for discounts (green for savings)
        if (item.isDiscount) {
          doc.setTextColor(0, 128, 0); // Green color for discounts
        }
        
        doc.text(displayValue, doc.internal.pageSize.getWidth() - 20, breakdownY, { align: 'right' });
        
        // Reset color to black
        doc.setTextColor(0, 0, 0);
        
        breakdownY += 7; // Slightly more spacing
      });
      
      // Add separator line
      breakdownY += 5;
      doc.setLineWidth(0.5);
      doc.line(20, breakdownY, doc.internal.pageSize.getWidth() - 20, breakdownY);
      breakdownY += 10;
      
      // Total Amount
      const finalY = breakdownY;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      
      // Use payment amount as primary source, fallback to order summary total amount
      let amount = payment.amount || orderSummary.totalAmount || 0;
      
      // For Nepal orders, keep NPR amounts as-is; for international orders, convert NPR to USD
      if (!isNepal) {
        // Convert NPR amounts to USD for international readability
        if (payment.amount_npr) {
          // Convert NPR to USD for bill display using live exchange rate
          const { getExchangeRate } = await import('../../utils/currency');
          const nprToUsdRate = await getExchangeRate();
          amount = payment.amount_npr / nprToUsdRate;
        } else if (amount > 1000) {
          // If amount is large (>1000), it's likely in NPR, convert to USD
          const { getExchangeRate } = await import('../../utils/currency');
          const nprToUsdRate = await getExchangeRate();
          amount = amount / nprToUsdRate;
        }
      } else {
        // For Nepal orders, use NPR amount directly
        if (payment.amount_npr) {
          amount = payment.amount_npr;
        }
      }
      
      const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;
      
      console.log('Amount data:', { 
        orderSummaryAmount: orderSummary.totalAmount, 
        paymentAmount: payment.amount, 
        paymentAmountNPR: payment.amount_npr,
        finalAmount: amount, 
        isNepal, 
        currency 
      });
      
      doc.text(`Total Amount: ${currency} ${formattedAmount}`, 
        doc.internal.pageSize.getWidth() - 20, finalY, { align: 'right' });
      
      // Add currency note with live exchange rate
      let noteY = finalY + 10;
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(102, 102, 102);
      
      let noteText;
      if (isNepal) {
        const { getExchangeRate } = await import('../../utils/currency');
        const currentRate = await getExchangeRate();
        noteText = `Note: All amounts in NPR. Product prices converted from USD at rate 1 USD = ${currentRate.toFixed(2)} NPR`;
      } else {
        noteText = 'Note: All amounts in USD';
        if (payment.amount_npr || amount !== (payment.amount || orderSummary.totalAmount || 0)) {
          const { getExchangeRate } = await import('../../utils/currency');
          const currentRate = await getExchangeRate();
          noteText = `Note: All amounts in USD (converted from NPR at rate 1 USD = ${currentRate.toFixed(2)} NPR)`;
        }
      }
      
      doc.text(noteText, 
        doc.internal.pageSize.getWidth() - 20, noteY, { align: 'right' });
      
      // Footer
      const footerY = noteY + 15;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(102, 102, 102);
      doc.text('Thank you for shopping with Traditional Alley!', doc.internal.pageSize.getWidth() / 2, footerY, { align: 'center' });
      doc.text('For any queries, please contact us at support@traditionalalley.com', doc.internal.pageSize.getWidth() / 2, footerY + 8, { align: 'center' });
      
      // Save the PDF
      const txnId = payment.merchantTxnId || payment.attributes?.merchantTxnId || 'receipt';
      const fileName = `Traditional_Alley_Bill_${txnId}.pdf`;
      doc.save(fileName);
      
      console.log('✅ PDF generated and downloaded successfully for transaction:', txnId);
      alert('Bill downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Payment data structure:', payment);
      alert(`Error generating PDF: ${error.message}. Please check the console for more details.`);
    }
  };

  // Function to send email only
  const sendEmailOnly = async (payment) => {
    try {
      console.log('📧 SEND EMAIL ONLY FUNCTION CALLED');
      console.log('📋 Payment data received:', JSON.stringify(payment, null, 2));
      
      // Validate payment data
      if (!payment) {
        console.error('❌ Payment data is missing');
        alert('Error: Payment data is missing');
        throw new Error('Payment data is missing');
      }
      
      // Extract orderData from payment
      const orderData = payment.orderData || {};
      console.log('📦 Order data extracted:', JSON.stringify(orderData, null, 2));
      
      // Check if receiver details exist
      const receiverDetails = orderData.receiver_details || {};
      console.log('👤 Receiver details:', JSON.stringify(receiverDetails, null, 2));
      console.log('📧 Customer email found:', receiverDetails.email || 'NO EMAIL FOUND');
      
      const customerEmail = receiverDetails.email;
      
      if (!customerEmail) {
        alert('No customer email found. Cannot send invoice email.');
        return;
      }
      
      // Detect if delivery is to Nepal for currency formatting
      const isNepal = isNepalDestination(payment);
      const currency = isNepal ? 'Rs.' : '$';
      
      // Calculate amount for display
      const orderSummary = orderData.orderSummary || {};
      let amount = payment.amount || orderSummary.totalAmount || 0;
      
      // For Nepal orders, keep NPR amounts as-is; for international orders, convert NPR to USD
      if (!isNepal) {
        if (payment.amount_npr) {
          const { getExchangeRate } = await import('../../utils/currency');
          const nprToUsdRate = await getExchangeRate();
          amount = payment.amount_npr / nprToUsdRate;
        } else if (amount > 1000) {
          const { getExchangeRate } = await import('../../utils/currency');
          const nprToUsdRate = await getExchangeRate();
          amount = amount / nprToUsdRate;
        }
      } else {
        if (payment.amount_npr) {
          amount = payment.amount_npr;
        }
      }
      
      const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;
      const txnId = payment.merchantTxnId || payment.attributes?.merchantTxnId || 'receipt';
      const fileName = `Traditional_Alley_Bill_${txnId}.pdf`;
      
      console.log('📧 STARTING EMAIL SENDING PROCESS');
      console.log('✅ Customer email found, proceeding to send invoice email to:', customerEmail);
      
      // Generate PDF for email (same logic as generateBillOnly but for email purposes)
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
            console.warn('Could not load logo, continuing without it');
            logoLoaded = false;
            resolve();
          };
        });
      } catch (error) {
        console.warn('Logo loading failed:', error);
        logoLoaded = false;
      }
      
      // Generate the same PDF content as generateBillOnly
       // Header
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
       
       // Order and Customer Information
       let yPosition = headerY + 30;
       
       doc.setFontSize(12);
       doc.setTextColor(0, 0, 0);
       
       // Order details
       const txnIdDisplay = payment.merchantTxnId || payment.attributes?.merchantTxnId || 'N/A';
       doc.text(`Order ID: ${txnIdDisplay}`, 20, yPosition);
       yPosition += 8;
       
       const orderDate = payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
       doc.text(`Date: ${orderDate}`, 20, yPosition);
       yPosition += 15;
       
       // Customer details
       doc.setFontSize(14);
       doc.setTextColor(139, 69, 19);
       doc.text('Bill To:', 20, yPosition);
       yPosition += 8;
       
       doc.setFontSize(12);
       doc.setTextColor(0, 0, 0);
       
       const customerName = receiverDetails.fullName || 'N/A';
       doc.text(`Name: ${customerName}`, 20, yPosition);
       yPosition += 6;
       
       if (receiverDetails.email) {
         doc.text(`Email: ${receiverDetails.email}`, 20, yPosition);
         yPosition += 6;
       }
       
       if (receiverDetails.phone) {
         doc.text(`Phone: ${receiverDetails.phone}`, 20, yPosition);
         yPosition += 6;
       }
       
       // Address
       const address = receiverDetails.address || '';
       const city = receiverDetails.city || '';
       const state = receiverDetails.state || '';
       const country = receiverDetails.country || '';
       const postalCode = receiverDetails.postalCode || '';
       
       let fullAddress = [address, city, state, country, postalCode].filter(Boolean).join(', ');
       if (fullAddress) {
         const addressLines = doc.splitTextToSize(`Address: ${fullAddress}`, 170);
         doc.text(addressLines, 20, yPosition);
         yPosition += addressLines.length * 6;
       }
       
       yPosition += 10;
       
       // Products table
       doc.setFontSize(14);
       doc.setTextColor(139, 69, 19);
       doc.text('Items:', 20, yPosition);
       yPosition += 10;
       
       // Table headers
       doc.setFontSize(10);
       doc.setTextColor(0, 0, 0);
       doc.text('Item', 20, yPosition);
       doc.text('Qty', 120, yPosition);
       doc.text('Price', 140, yPosition);
       doc.text('Total', 170, yPosition);
       yPosition += 5;
       
       // Draw line under headers
       doc.line(20, yPosition, 190, yPosition);
       yPosition += 8;
       
       // Product items
       const products = orderData.products || [];
       let subtotal = 0;
       
       products.forEach((product) => {
         const productName = product.name || product.title || 'Unknown Product';
         const quantity = product.quantity || 1;
         const price = product.price || 0;
         const total = quantity * price;
         subtotal += total;
         
         // Handle long product names
         const nameLines = doc.splitTextToSize(productName, 90);
         doc.text(nameLines, 20, yPosition);
         doc.text(quantity.toString(), 120, yPosition);
         doc.text(`${currency} ${price.toFixed(2)}`, 140, yPosition);
         doc.text(`${currency} ${total.toFixed(2)}`, 170, yPosition);
         
         yPosition += Math.max(nameLines.length * 5, 8);
       });
       
       yPosition += 5;
       doc.line(20, yPosition, 190, yPosition);
       yPosition += 10;
       
       // Order summary
       const shipping = orderSummary.shippingCost || 0;
       const tax = orderSummary.tax || 0;
       const discount = orderSummary.discount || 0;
       const finalTotal = parseFloat(formattedAmount);
       
       doc.text(`Subtotal: ${currency} ${subtotal.toFixed(2)}`, 140, yPosition);
       yPosition += 6;
       
       if (shipping > 0) {
         doc.text(`Shipping: ${currency} ${shipping.toFixed(2)}`, 140, yPosition);
         yPosition += 6;
       }
       
       if (tax > 0) {
         doc.text(`Tax: ${currency} ${tax.toFixed(2)}`, 140, yPosition);
         yPosition += 6;
       }
       
       if (discount > 0) {
         doc.text(`Discount: -${currency} ${discount.toFixed(2)}`, 140, yPosition);
         yPosition += 6;
       }
       
       // Total
       doc.setFontSize(12);
       doc.setTextColor(139, 69, 19);
       doc.text(`Total: ${currency} ${finalTotal}`, 140, yPosition);
       
       // Footer
       yPosition += 20;
       doc.setFontSize(10);
       doc.setTextColor(100, 100, 100);
       doc.text('Thank you for your business!', doc.internal.pageSize.getWidth() / 2, yPosition, { align: 'center' });
       doc.text('Traditional Alley - Authentic Products, Delivered Worldwide', doc.internal.pageSize.getWidth() / 2, yPosition + 8, { align: 'center' });
      
      // Generate PDF with compression to reduce payload size
      // Use lower quality settings to reduce file size
      const pdfArrayBuffer = doc.output('arraybuffer');
      const pdfUint8Array = new Uint8Array(pdfArrayBuffer);
      
      // Convert to base64 with compression
      let pdfBase64 = doc.output('datauristring').split(',')[1];
      const originalSize = pdfBase64 ? pdfBase64.length : 0;
      
      console.log('📦 Original PDF Base64 size:', originalSize, 'characters');
      console.log('📦 Original estimated PDF size:', Math.round(originalSize * 0.75 / 1024), 'KB');
      
      // If PDF is too large (>2MB base64), try to compress by reducing quality
      if (originalSize > 2500000) { // ~2MB base64 limit to be safe
        console.log('⚠️ PDF too large (' + originalSize + ' chars), attempting compression...');
        
        try {
          // Method 1: Try jsPDF built-in compression
          console.log('🔄 Trying jsPDF compression...');
          let compressedBase64 = doc.output('datauristring', { compress: true }).split(',')[1];
          let compressedSize = compressedBase64 ? compressedBase64.length : 0;
          
          console.log('📦 jsPDF Compressed size:', compressedSize, 'characters');
          
          // If jsPDF compression didn't help much, try manual compression
          if (compressedSize > originalSize * 0.8) { // Less than 20% reduction
            console.log('🔄 jsPDF compression insufficient, trying manual compression...');
            
            // Create a new PDF with aggressive compression settings
            const compressedDoc = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: 'a4',
              compress: true,
              precision: 1
            });
            
            // Recreate content with smaller fonts and tighter spacing
            compressedDoc.setFontSize(8); // Smaller font
            compressedDoc.text('Invoice - Traditional Alley', 10, 15);
            compressedDoc.text('Order ID: ' + txnId, 10, 25);
            compressedDoc.text('Customer: ' + (receiverDetails.fullName || 'N/A'), 10, 35);
            compressedDoc.text('Total: ' + currency + ' ' + formattedAmount, 10, 45);
            compressedDoc.text('Items: ' + cartItems.length + ' products', 10, 55);
            compressedDoc.text('Generated: ' + new Date().toLocaleDateString(), 10, 65);
            compressedDoc.text('This is a simplified invoice due to size constraints.', 10, 80);
            compressedDoc.text('Contact support for detailed invoice if needed.', 10, 90);
            
            compressedBase64 = compressedDoc.output('datauristring').split(',')[1];
            compressedSize = compressedBase64 ? compressedBase64.length : 0;
            
            console.log('📦 Manual compressed size:', compressedSize, 'characters');
          }
          
          if (compressedSize < originalSize) {
            console.log('✅ Compression successful!');
            console.log('📉 Compression ratio:', Math.round((1 - compressedSize / originalSize) * 100) + '%');
            console.log('📦 Final compressed size:', Math.round(compressedSize * 0.75 / 1024), 'KB');
            pdfBase64 = compressedBase64;
          } else {
            console.log('⚠️ Compression did not reduce size, using original');
          }
        } catch (compressionError) {
          console.error('❌ Compression failed:', compressionError);
          console.log('📄 Using original PDF without compression');
        }
      }
      
      const finalSize = pdfBase64 ? pdfBase64.length : 0;
      
      // Check if still too large after compression (be more aggressive)
      if (finalSize > 3000000) { // ~2.25MB base64 limit
        console.error('❌ PDF still too large after compression:', finalSize, 'characters');
        console.error('📊 Final estimated size:', Math.round(finalSize * 0.75 / 1024), 'KB');
        throw new Error('PDF file is too large even after compression. Please reduce the number of items or contact support.');
      }
      
      console.log('✅ PDF size acceptable:', finalSize, 'characters (', Math.round(finalSize * 0.75 / 1024), 'KB )');
      
      // First, save the PDF to the server
      console.log('💾 Saving PDF to server...');
      const saveResponse = await fetch('/api/save-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          pdfBase64,
        }),
      });
      
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Failed to save PDF: ${saveResponse.status} - ${errorText}`);
      }
      
      const saveResult = await saveResponse.json();
      console.log('✅ PDF saved successfully:', saveResult);
      
      // Now send email with download link
      console.log('📤 Making API call to /api/send-invoice-email...');
      console.log('📋 Request payload:', {
        customerEmail,
        customerName: receiverDetails.fullName || 'Valued Customer',
        orderId: txnId,
        amount: `${currency} ${formattedAmount}`,
        fileName,
        downloadUrl: saveResult.downloadUrl
      });
      
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail,
          customerName: receiverDetails.fullName || 'Valued Customer',
          orderId: txnId,
          amount: `${currency} ${formattedAmount}`,
          fileName,
          downloadUrl: saveResult.downloadUrl,
        }),
      });
      
      console.log('📥 API Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
      
      const emailResult = await response.json();
      console.log('📧 Email API Result:', emailResult);
      
      if (emailResult.success) {
        console.log('✅ Invoice email sent successfully!');
        alert('Invoice email sent successfully!');
      } else {
        console.warn('❌ Email API returned failure:', emailResult.error);
        alert('Failed to send email: ' + (emailResult.error || 'Unknown error'));
      }
      
    } catch (error) {
      console.error('Error sending invoice email:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error.message.includes('PDF file is too large')) {
        errorMessage = 'The invoice PDF is too large to send via email. This usually happens with orders containing many items. Please try reducing the number of items or contact support for assistance.';
      } else if (error.message.includes('Failed to save PDF: 413') || error.message.includes('Request Entity Too Large')) {
        errorMessage = 'The invoice file is too large for the server to process. Please try again or contact support if the issue persists.';
      } else if (error.message.includes('Failed to save PDF')) {
        errorMessage = 'Failed to save PDF to server. Please try again or contact support.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Connection failed. Please check if the server is running and try again.';
      } else if (error.message.includes('CONNECTION_RESET')) {
        errorMessage = 'Connection was reset. Please try again.';
      } else {
        errorMessage = error.message;
      }
      
      alert('Failed to send email: ' + errorMessage);
    }
  };

  // Handle NCM order creation success
  const handleNCMOrderCreated = (orderData) => {
    console.log('NCM Order created:', orderData);
    setNcmOrders(prev => [...prev, orderData]);
    setShowNCMForm(false);
    // Show success message
    alert(`NCM Order created successfully! Order ID: ${orderData.data?.orderId || 'N/A'}`);
  };

  // Handle NCM form cancel
  const handleNCMFormCancel = () => {
    setShowNCMForm(false);
  };

  if (loadingUserBags) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading user bags...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-xl text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">📦 Order Management & DHL Shipping</h2>
        <p className="text-lg text-gray-200">Manage orders, create shipments, and download shipping documents</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <span className="font-medium">Error:</span> {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NCM Order Creation Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">NCM Order Management</h3>
          <button
            onClick={() => setShowNCMForm(!showNCMForm)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>{showNCMForm ? 'Cancel' : 'Create NCM Order'}</span>
          </button>
        </div>

        {showNCMForm && (
          <div className="mt-6">
            <NCMOrderForm 
              onOrderCreated={handleNCMOrderCreated}
              onCancel={handleNCMFormCancel}
            />
          </div>
        )}

        {/* Display created NCM orders */}
        {ncmOrders.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-800 mb-3">Recent NCM Orders</h4>
            <div className="space-y-3">
              {ncmOrders.map((order, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        Order ID: {order.data?.orderId || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Customer: {order.data?.requestData?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        COD: NPR {order.data?.requestData?.cod_charge || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Created
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Payments Section */}
      {userBags && userBags.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleTabChange('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pending ({tabCounts.pending})
                </button>
                <button
                  onClick={() => handleTabChange('success')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'success'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Success ({tabCounts.success})
                </button>
                <button
                  onClick={() => handleTabChange('failed')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'failed'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Failed ({tabCounts.failed})
                </button>
                <button
                  onClick={() => handleTabChange('shipped')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'shipped'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Shipped ({tabCounts.shipped})
                </button>
              </nav>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab === 'pending' && 'Pending Orders'}
            {activeTab === 'success' && 'Successful Orders'}
            {activeTab === 'failed' && 'Failed Orders'}
            {activeTab === 'shipped' && 'Shipped Orders'}
            (Showing {Math.min(filteredPayments.length - currentPage * ordersPerPage, ordersPerPage)} of {filteredPayments.length} - Page {currentPage + 1})
          </h3>
          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No orders with {activeTab} status.</p>
              </div>
            ) : (
              filteredPayments.slice(currentPage * ordersPerPage, (currentPage + 1) * ordersPerPage).map((payment, globalIndex) => (
                <div 
                  key={`${payment.userBag.id}-${payment.paymentIndex}-${payment.merchantTxnId}`}
                  className="border p-2 mb-2 rounded">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{payment.orderData.receiver_details.fullName}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                        <span>Order Time: {formatTimeAgo(payment.timestamp)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.computedStatus === 'success' ? 'bg-green-100 text-green-800' :
                          payment.computedStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          payment.computedStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.computedStatus.toUpperCase()}
                        </span>
                      </div>
                      {
                        payment.orderData.products && payment.orderData.products.length > 0 && (
                          <div className="mt-1 text-sm text-gray-600">
                            {payment.orderData.products.map((product, index) => (
                              <div key={index} className="mb-1">
                                <div>Product: {product.title}</div>
                                <div>Size: {
                                  product.selectedSize || 
                                  (product.selectedVariant && product.selectedVariant.size) || 
                                  'N/A'
                                }</div>
                                <div>Product Code: {
                                  product.productDetails?.productCode || 
                                  product.productCode || 
                                  'N/A'
                                }</div>
                              </div>
                            ))}
                          </div>
                        )
                      }
                    </div>
                      
                    <div className="flex flex-wrap gap-2">
                      {/* Download Bill Button */}
                      <button
                        onClick={() => {
                          console.log('📥 DOWNLOAD BILL BUTTON CLICKED');
                          console.log('📋 Payment data being passed:', JSON.stringify(payment, null, 2));
                          generateBillOnly(payment);
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <span>Download Bill</span>
                      </button>
                      
                      {/* Send Email Button */}
                      <button
                        onClick={() => {
                          console.log('📧 SEND EMAIL BUTTON CLICKED');
                          console.log('📋 Payment data being passed:', JSON.stringify(payment, null, 2));
                          sendEmailOnly(payment);
                        }}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span>Send Email</span>
                      </button>
                      
                      {(() => {
                        const shipmentInfo = getShipmentInfo(payment.userBag, payment.merchantTxnId);
                        const { label, invoice } = getDocuments(shipmentInfo);
                        const isNepal = isNepalDestination(payment);
                        
                        if (shipmentInfo) {
                          return (
                            <div key={`shipment-${payment.userBag.id}-${payment.merchantTxnId}`} className="mt-2 p-2 bg-gray-50 rounded">
                              <div className="flex items-center text-green-600 font-medium">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Shipment Created
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => downloadLabel(shipmentInfo)}
                                  disabled={!label || !label.content}
                                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                  </svg>
                                  Download Label
                                </button>
                                <button 
                                  onClick={() => downloadInvoice(shipmentInfo)}
                                  disabled={!invoice || !invoice.content}
                                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                  </svg>
                                  Download Invoice
                                </button>
                              </div>
                              <div className="text-xs text-gray-500">
                                Tracking: {shipmentInfo.shipmentTrackingNumber}
                              </div>
                              {/* Show NCM button only for Nepal orders */}
                              {isNepal && (
                                <NCMOrderButton 
                                  payment={payment} 
                                  bag={payment.userBag} 
                                  onOrderCreated={(orderData, paymentId) => {
                                    console.log('NCM Order created for payment:', paymentId, orderData);
                                    fetchUserBags();
                                  }}
                                />
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div className="flex flex-col gap-2">
                              {/* Show DHL button only for international orders */}
                              {!isNepal && (
                                <button 
                                  onClick={() => {
                                    console.log(`Creating DHL shipment for ${payment.userBag.id}`);
                                    createShipment(payment, payment.userBag.documentId);
                                  }}
                                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                  </svg>
                                  Create DHL Shipment
                                </button>
                              )}
                              
                              {/* Show NCM button only for Nepal orders */}
                              {isNepal && (
                                <NCMOrderButton 
                                  payment={payment} 
                                  bag={payment.userBag} 
                                  onOrderCreated={(orderData, paymentId) => {
                                    console.log('NCM Order created for payment:', paymentId, orderData);
                                    fetchUserBags();
                                  }}
                                />
                              )}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination Controls */}
          {filteredPayments.length > ordersPerPage && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                 onClick={goToPreviousPage}
                 disabled={currentPage === 0 || isLoadingPagination}
                 className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                   currentPage === 0 || isLoadingPagination
                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                     : 'bg-blue-500 text-white hover:bg-blue-600'
                 }`}
               >
                 {isLoadingPagination && currentPage > 0 ? (
                   <>
                     <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Loading...
                   </>
                 ) : (
                   'Previous'
                 )}
               </button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage + 1} of {Math.ceil(filteredPayments.length / ordersPerPage)}
              </span>
              
              <button
                 onClick={goToNextPage}
                 disabled={(currentPage + 1) * ordersPerPage >= filteredPayments.length || isLoadingPagination}
                 className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                   (currentPage + 1) * ordersPerPage >= filteredPayments.length || isLoadingPagination
                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                     : 'bg-blue-500 text-white hover:bg-blue-600'
                 }`}
               >
                 {isLoadingPagination && (currentPage + 1) * ordersPerPage < filteredPayments.length ? (
                   <>
                     <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Loading...
                   </>
                 ) : (
                   'Next'
                 )}
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;