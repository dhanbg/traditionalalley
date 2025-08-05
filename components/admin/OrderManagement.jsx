'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NCMOrderForm from './NCMOrderForm';
import NCMOrderButton from './NCMOrderButton';
// Force recompilation - all userBag references fixed

const OrderManagement = () => {
  const [userBags, setUserBags] = useState([]);
  const [showUserBags, setShowUserBags] = useState(false);
  const [loadingUserBags, setLoadingUserBags] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showNCMForm, setShowNCMForm] = useState(false);
  const [ncmOrders, setNcmOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

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
                  onClick={() => setActiveTab('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pending ({tabCounts.pending})
                </button>
                <button
                  onClick={() => setActiveTab('success')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'success'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Success ({tabCounts.success})
                </button>
                <button
                  onClick={() => setActiveTab('failed')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'failed'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Failed ({tabCounts.failed})
                </button>
                <button
                  onClick={() => setActiveTab('shipped')}
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
            ({filteredPayments.length})
          </h3>
          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No orders with {activeTab} status.</p>
              </div>
            ) : (
              filteredPayments.map((payment, globalIndex) => (
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
                              </div>
                            ))}
                          </div>
                        )
                      }
                    </div>
                      
                    <div className="flex flex-wrap gap-2">
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
        </div>
      )}
    </div>
  );
};

export default OrderManagement;