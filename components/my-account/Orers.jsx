"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchDataFromApi } from "@/utils/api";
import { USER_BAGS_API } from "@/utils/urls";
import Link from "next/link";

export default function Orders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user) return;

      try {
        const response = await fetchDataFromApi(
          `${USER_BAGS_API}?filters[user_datum][authUserId][$eq]=${session.user.id}&populate=*&sort=createdAt:desc`
        );
        
        // Check if the response contains an error
        if (response.success === false || response.error) {
          console.error("API Error:", response.error, response.detail);
          setOrders([]);
          return;
        }
        
        // Extract truly shipped orders (those with tracking info)
        const shippedOrders = [];
        (response.data || []).forEach(bag => {
          if (bag.user_orders && bag.user_orders.payments) {
            bag.user_orders.payments.forEach(payment => {
              // Only include Success payments
              if (payment.status === 'Success') {
                let hasValidTracking = false;
                let matchingTrackingInfo = null;

                if (bag.trackingInfo) {
                  if (Array.isArray(bag.trackingInfo)) {
                    // Handle array format - check each tracking info
                    bag.trackingInfo.forEach(info => {
                      // Check for DHL/courier format with packages and tracking numbers
                      if (info.packages && Array.isArray(info.packages) && 
                          info.packages.some(pkg => pkg.trackingNumber)) {
                        hasValidTracking = true;
                        matchingTrackingInfo = info;
                      }
                      // Check for NCM format matching gatewayReferenceNo
                      else if (info.ncmOrderId && info.gatewayReferenceNo && 
                               payment.gatewayReferenceNo && 
                               info.gatewayReferenceNo === payment.gatewayReferenceNo) {
                        hasValidTracking = true;
                        matchingTrackingInfo = info;
                      }
                    });
                  } else {
                    // Handle single object format
                    const info = bag.trackingInfo;
                    // Check for DHL/courier format with packages
                    if (info.packages && Array.isArray(info.packages) && 
                        info.packages.some(pkg => pkg.trackingNumber)) {
                      hasValidTracking = true;
                      matchingTrackingInfo = info;
                    }
                    // Check for direct trackingNumber
                    else if (info.trackingNumber) {
                      hasValidTracking = true;
                      matchingTrackingInfo = info;
                    }
                    // Check for NCM format matching gatewayReferenceNo
                    else if (info.ncmOrderId && info.gatewayReferenceNo && 
                             payment.gatewayReferenceNo && 
                             info.gatewayReferenceNo === payment.gatewayReferenceNo) {
                      hasValidTracking = true;
                      matchingTrackingInfo = info;
                    }
                  }
                }

                if (hasValidTracking) {
                  shippedOrders.push({
                    id: payment.merchantTxnId || payment.processId || `order-${Date.now()}`,
                    bagId: bag.id,
                    bagName: bag.Name,
                    createdAt: payment.timestamp || bag.createdAt,
                    status: payment.status,
                    amount: payment.amount,
                    provider: payment.provider,
                    orderData: payment.orderData,
                    trackingInfo: matchingTrackingInfo || bag.trackingInfo,
                    gatewayReferenceNo: payment.gatewayReferenceNo
                  });
                }
              }
            });
          }
        });
        
        // Sort by creation date (newest first)
        shippedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setOrders(shippedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session?.user?.id]); // Only depend on user ID, not entire user object

  const toggleOrderDetails = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (!orders.length) {
    return (
      <div className="no-orders">
        <h3>No shipped orders found</h3>
        <p>You don't have any shipped orders yet.</p>
        <Link href="/shop-default-grid" className="tf-btn btn-fill">
          Start Shopping
        </Link>
      </div>
    );
  }

  // Helper function to get delivery partner and tracking info
  const getDeliveryInfo = (trackingInfo) => {
    if (!trackingInfo) return { partner: 'Not assigned', trackingNumber: 'N/A' };
    
    // Handle array format
    if (Array.isArray(trackingInfo)) {
      const latestTracking = trackingInfo[trackingInfo.length - 1];
      
      // Check for NCM format
      if (latestTracking.ncmOrderId) {
        return {
          partner: 'NCM',
          trackingNumber: latestTracking.ncmOrderId
        };
      }
      
      // Check for DHL format with packages
      if (latestTracking.packages && Array.isArray(latestTracking.packages)) {
        const trackingNumber = latestTracking.packages.find(pkg => pkg.trackingNumber)?.trackingNumber;
        if (trackingNumber) {
          return {
            partner: 'DHL',
            trackingNumber: trackingNumber
          };
        }
      }
      
      // Check for direct tracking number
      if (latestTracking.shipmentTrackingNumber || latestTracking.trackingNumber) {
        return {
          partner: 'DHL', // Assume DHL for direct tracking numbers
          trackingNumber: latestTracking.shipmentTrackingNumber || latestTracking.trackingNumber
        };
      }
      
      return { partner: 'Unknown', trackingNumber: 'Available' };
    }
    
    // Handle single object format
    const info = trackingInfo;
    
    // Check for NCM format
    if (info.ncmOrderId) {
      return {
        partner: 'NCM',
        trackingNumber: info.ncmOrderId
      };
    }
    
    // Check for DHL format with packages
    if (info.packages && Array.isArray(info.packages)) {
      const trackingNumber = info.packages.find(pkg => pkg.trackingNumber)?.trackingNumber;
      if (trackingNumber) {
        return {
          partner: 'DHL',
          trackingNumber: trackingNumber
        };
      }
    }
    
    // Check for direct tracking number
    if (info.shipmentTrackingNumber || info.trackingNumber) {
      return {
        partner: 'DHL', // Assume DHL for direct tracking numbers
        trackingNumber: info.shipmentTrackingNumber || info.trackingNumber
      };
    }
    
    return { partner: 'Unknown', trackingNumber: 'Available' };
  };
  
  // Helper function to get tracking info display (kept for backwards compatibility)
  const getTrackingDisplay = (trackingInfo) => {
    const deliveryInfo = getDeliveryInfo(trackingInfo);
    return deliveryInfo.trackingNumber !== 'N/A' ? deliveryInfo.trackingNumber : 'Not shipped yet';
  };

  // Helper function to get items count from order data
  const getItemsCount = (orderData) => {
    if (!orderData?.products) return 0;
    return orderData.products.reduce((total, product) => {
      return total + (product.pricing?.quantity || 1);
    }, 0);
  };

  // Helper function to get order status display
  const getStatusDisplay = (status, trackingInfo) => {
    if (status === 'Success') {
      return trackingInfo ? 'Shipped' : 'Processing';
    }
    return status;
  };

  // Helper function to get status class
  const getStatusClass = (status, trackingInfo) => {
    if (status === 'Success') {
      return trackingInfo ? 'shipped' : 'processing';
    }
    return status.toLowerCase();
  };

  return (
    <div className="orders-list">
      <h2 style={{ marginBottom: '2rem' }}>Orders : </h2>
    
      <div className="orders-container">
        {orders.map((order) => {
          const itemsCount = getItemsCount(order.orderData);
          const deliveryInfo = getDeliveryInfo(order.trackingInfo);
          const trackingDisplay = getTrackingDisplay(order.trackingInfo);
          const statusDisplay = getStatusDisplay(order.status, order.trackingInfo);
          const statusClass = getStatusClass(order.status, order.trackingInfo);
          const isExpanded = expandedOrders.has(order.id);
          
          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h4>Order #{order.gatewayReferenceNo || order.id}</h4>

                  <p className="order-date" style={{
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
                    color: '#0277bd',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    margin: '0.5rem 0',
                    border: '1px solid #81d4fa',
                    display: 'inline-block'
                  }}>
                    📅 {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {/* Customer name removed as requested */}
                </div>
                <div className="order-status">
                  <span className={`status ${statusClass}`}>
                    {statusDisplay}
                  </span>
                </div>
              </div>
              
              <div className="order-details">
                {/* Minimal View - Always Visible */}
                <div className="order-summary-minimal">
                  <div className="minimal-info">
                     <p><strong>Total:</strong> {order.orderData?.orderSummary?.currency || 'NPR'} {order.amount}</p>
                     <p><strong>Items:</strong> {itemsCount}</p>
                     <p>
                       <strong>Tracking:</strong> 
                       <span className="tracking-number">
                         {deliveryInfo.trackingNumber}
                       </span>
                     </p>
                   </div>
                   
                   <div className="order-buttons">
                      {deliveryInfo.partner === 'NCM' && deliveryInfo.trackingNumber !== 'N/A' && (
                         <Link 
                           href={`/my-account-orders-details?orderId=${order.id}&ncmOrderId=${deliveryInfo.trackingNumber}`}
                           title="View detailed tracking"
                           style={{
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             gap: '0.5rem',
                             padding: '0.75rem 1.5rem',
                             background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                             color: 'white',
                             textDecoration: 'none',
                             borderRadius: '0.75rem',
                             fontWeight: '600',
                             fontSize: '0.875rem',
                             transition: 'all 0.3s ease',
                             boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                             border: 'none',
                             cursor: 'pointer',
                             position: 'relative',
                             overflow: 'hidden',
                             minWidth: '140px'
                           }}
                           onMouseEnter={(e) => {
                             e.target.style.transform = 'translateY(-2px)';
                             e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                             e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
                           }}
                           onMouseLeave={(e) => {
                             e.target.style.transform = 'translateY(0)';
                           }}
                         >
                           <span style={{ fontSize: '1rem' }}>📍</span>
                           <span>Track Order</span>
                         </Link>
                       )}
                       
                       {deliveryInfo.partner === 'DHL' && deliveryInfo.trackingNumber !== 'N/A' && (
                         <span 
                           title="DHL tracking coming soon"
                           style={{
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             gap: '0.5rem',
                             padding: '0.75rem 1.5rem',
                             background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                             color: 'white',
                             textDecoration: 'none',
                             borderRadius: '0.75rem',
                             fontWeight: '600',
                             fontSize: '0.875rem',
                             boxShadow: '0 4px 6px -1px rgba(107, 114, 128, 0.3)',
                             border: 'none',
                             cursor: 'not-allowed',
                             position: 'relative',
                             overflow: 'hidden',
                             minWidth: '140px',
                             opacity: '0.7'
                           }}
                         >
                           <span style={{ fontSize: '1rem' }}>📦</span>
                           <span>DHL Tracking</span>
                         </span>
                       )}
                      
                      <button 
                        onClick={() => toggleOrderDetails(order.id)}
                        className="view-details-btn"
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                </div>
                
                {/* Expanded View - Conditional */}
                {isExpanded && (
                  <div className="order-summary-expanded">
                    <div className="expanded-info">
                      {/* Enhanced Delivery Partner Info */}
                      <div className="delivery-info">
                        <p>
                          <strong>Delivery Partner:</strong> 
                          <span className={`delivery-partner ${deliveryInfo.partner.toLowerCase()}`}>
                            {deliveryInfo.partner}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {isExpanded && (
                   <>
                     {/* Enhanced Product Information */}
                     {order.orderData?.products && order.orderData.products.length > 0 && (
                       <div className="order-products-enhanced">
                         <div className="products-header">
                           <h5>📦 Order Items ({order.orderData.products.length})</h5>
                         </div>
                         <div className="products-grid">
                           {order.orderData.products.slice(0, 4).map((product, index) => (
                             <div key={index} className="product-card">
                               <div className="product-info">
                                 <h6 className="product-title">{product.title}</h6>
                                 {product.selectedVariant && (
                                   <div className="product-variant">
                                     {product.selectedVariant.size && (
                                       <span className="variant-tag">Size: {product.selectedVariant.size}</span>
                                     )}
                                     {product.selectedVariant.color && product.selectedVariant.color !== 'default' && (
                                       <span className="variant-tag">Color: {product.selectedVariant.color}</span>
                                     )}
                                   </div>
                                 )}
                                 <div className="product-pricing">
                                   <span className="quantity">Qty: {product.pricing?.quantity || 1}</span>
                                   <span className="price">{order.orderData?.orderSummary?.currency || 'NPR'} {product.pricing?.currentPrice}</span>
                                 </div>
                               </div>
                             </div>
                           ))}
                           {order.orderData.products.length > 4 && (
                             <div className="more-products-card">
                               <span className="more-text">+ {order.orderData.products.length - 4} more items</span>
                             </div>
                           )}
                         </div>
                       </div>
                     )}
                     

                   </>
                 )}
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .order-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          background: white;
        }
        
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          padding-bottom: 15px;
        }
        
        .order-summary-minimal {
          padding: 1.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }
        
        .order-summary-minimal:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .minimal-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .minimal-info p {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
          padding: 0.75rem;
          background: #f1f5f9;
          border-radius: 0.5rem;
          border-left: 4px solid #3b82f6;
        }
        
        .minimal-info p strong {
          color: #1f2937;
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .tracking-number {
          font-family: 'Courier New', monospace;
          background: #e0f2fe;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-weight: 600;
          color: #0369a1;
        }
        
        .order-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }
        
        @media (min-width: 640px) {
          .order-buttons {
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
          }
          
          .minimal-info {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (min-width: 768px) {
          .order-summary-minimal {
            padding: 2rem;
          }
          
          .minimal-info {
            gap: 1.5rem;
          }
        }
        
        .view-details-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .view-details-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .view-details-btn:hover::before {
          left: 100%;
        }
        
        .view-details-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }
        
        .view-details-btn:active {
          transform: translateY(0);
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
        }
        
        .order-summary-expanded {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          border: 1px solid #d1d5db;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          animation: expandIn 0.3s ease-out;
        }
        
        @keyframes expandIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .track-button-enhanced {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 0.875rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
            border: none;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            min-width: 140px;
          }
          
          .track-button-enhanced::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }
          
          .track-button-enhanced:hover::before {
            left: 100%;
          }
          
          .track-button-enhanced:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          }
          
          .track-button-enhanced:active {
            transform: translateY(0);
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
          }
          
          .track-button-enhanced.disabled {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            cursor: not-allowed;
            opacity: 0.7;
            box-shadow: 0 4px 6px -1px rgba(107, 114, 128, 0.3);
          }
          
          .track-button-enhanced.disabled:hover {
            transform: none;
            box-shadow: 0 4px 6px -1px rgba(107, 114, 128, 0.3);
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          }
          
          .track-button-enhanced.disabled::before {
            display: none;
          }
          
          .track-icon {
            font-size: 1rem;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
          
          @media (max-width: 639px) {
            .track-button-enhanced {
              width: 100%;
              min-width: auto;
            }
          }
          
          /* Enhanced Product Cards Styling */
          .order-products-enhanced {
            margin-top: 1.5rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border-radius: 1rem;
            border: 1px solid #e2e8f0;
          }
          
          .products-header h5 {
            margin: 0 0 1rem 0;
            color: #1e293b;
            font-size: 1.1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
          }
          
          .product-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            padding: 1rem;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          
          .product-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border-color: #3b82f6;
          }
          
          .product-info {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .product-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
            line-height: 1.4;
          }
          
          .product-variant {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          
          .variant-tag {
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
            color: #3730a3;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 500;
            border: 1px solid #c7d2fe;
          }
          
          .product-pricing {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 0.5rem;
            border-top: 1px solid #f1f5f9;
          }
          
          .quantity {
            color: #64748b;
            font-size: 0.875rem;
            font-weight: 500;
          }
          
          .price {
            color: #059669;
            font-weight: 700;
            font-size: 0.95rem;
          }
          
          .more-products-card {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border: 2px dashed #cbd5e1;
            border-radius: 0.75rem;
            padding: 2rem 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }
          
          .more-products-card:hover {
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
            border-color: #94a3b8;
          }
          
          .more-text {
            color: #64748b;
            font-weight: 600;
            font-size: 0.95rem;
          }
          
          @media (max-width: 768px) {
            .products-grid {
              grid-template-columns: 1fr;
            }
            
            .order-products-enhanced {
              padding: 1rem;
            }
            
            .product-pricing {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }
          }
        
        .order-info h4 {
          margin: 0 0 5px 0;
          color: #333;
        }
        
        .order-date, .order-customer {
          margin: 2px 0;
          color: #666;
          font-size: 14px;
        }
        
        .status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status.shipped { background: #d4edda; color: #155724; }
        .status.processing { background: #fff3cd; color: #856404; }
        .status.pending { background: #f8d7da; color: #721c24; }
        .status.success { background: #d4edda; color: #155724; }
        
        .order-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .order-summary p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .order-products, .shipping-info {
          margin: 15px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .order-products h5, .shipping-info h5 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 16px;
        }
        
        .product-item {
          display: flex;
          flex-direction: column;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        
        .product-item:last-child {
          border-bottom: none;
        }
        
        .product-title {
          font-weight: bold;
          color: #333;
        }
        
        .product-variant {
          font-size: 12px;
          color: #666;
          margin: 2px 0;
        }
        
        /* Track Button Styling - Component Level */
        .track-button {
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.375rem !important;
          padding: 0.5rem 1rem !important;
          margin-left: 0.5rem !important;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
          color: white !important;
          text-decoration: none !important;
          border-radius: 0.5rem !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          line-height: 1.25 !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3) !important;
          border: none !important;
          cursor: pointer !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
        }
        
        .track-button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.4) !important;
          color: white !important;
          text-decoration: none !important;
        }
        
        .track-button:active {
          transform: translateY(0) !important;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3) !important;
        }
        
        .track-button.disabled {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
          cursor: not-allowed !important;
          opacity: 0.7 !important;
        }
        
        .track-button.disabled:hover {
          transform: none !important;
          box-shadow: 0 4px 6px -1px rgba(107, 114, 128, 0.3) !important;
        }
        
        .product-price {
          font-weight: bold;
          color: #007bff;
        }
        
        .more-products {
          font-style: italic;
          color: #666;
          margin-top: 8px;
        }
        
        .shipping-info p {
          line-height: 1.4;
          color: #555;
        }
        
        .order-actions {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
        }
        
        @media (max-width: 768px) {
          .order-header {
            flex-direction: column;
            gap: 10px;
          }
          
          .order-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
