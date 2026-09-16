"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { fetchDataFromApi } from "@/utils/api";
import { USER_BAGS_API } from "@/utils/urls";
import Image from "next/image";
import Link from "next/link";
import OrderStatusTracker from "./OrderStatusTracker";

export default function OrderDetails() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extract orderId from URL parameters
  const orderId = searchParams.get('orderId');
  const ncmOrderId = searchParams.get('ncmOrderId');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!session?.user || !orderId) {
        setLoading(false);
        setError('Order ID not found in URL parameters');
        return;
      }

      try {
        setError(null);
        // Fetch user bags/orders and find the specific order by ID
        const response = await fetchDataFromApi(
          `${USER_BAGS_API}?filters[user_datum][authUserId][$eq]=${session.user.id}&populate=*&sort=createdAt:desc`
        );
        
        if (response.data && Array.isArray(response.data)) {
          // Find the specific order by matching the order ID
          let foundOrder = null;
          
          response.data.forEach(bag => {
            if (bag.user_orders && bag.user_orders.payments) {
              bag.user_orders.payments.forEach(payment => {
                const paymentOrderId = payment.merchantTxnId || payment.processId || `order-${Date.now()}`;
                if (paymentOrderId === orderId) {
                  const pStatus = payment.status?.toLowerCase();
                  const isSuccess = pStatus === 'success' || pStatus === 'completed' || pStatus === 'paid';
                  if (isSuccess) {
                    foundOrder = {
                      id: paymentOrderId,
                      bagId: bag.id,
                      bagName: bag.Name,
                      createdAt: payment.timestamp || bag.createdAt,
                      status: payment.status,
                      amount: payment.amount,
                      provider: payment.provider,
                      orderData: payment.orderData,
                      trackingInfo: bag.trackingInfo,
                      gatewayReferenceNo: payment.gatewayReferenceNo,
                      // Add NCM order ID if available
                      ncmOrderId: ncmOrderId || (bag.trackingInfo?.ncmOrderId)
                    };
                  }
                }
              });
            }
          });
          
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError('Order not found or access denied');
          }
        } else {
          setError('Order not found or access denied');
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [session?.user?.id, orderId]); // Only depend on user ID, not entire user object

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">
          <h3>Unable to Load Order Details</h3>
          <p>{error}</p>
          <Link href="/my-account-orders" className="tf-btn btn-fill">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-container">
        <div className="error">
          <h3>Order Not Found</h3>
          <p>The requested order could not be found.</p>
          <Link href="/my-account-orders" className="tf-btn btn-fill">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details">
      <div className="order-header">
        <h2>Order #{order.id}</h2>
        <div className="order-status">
          <span className={`status ${order.status?.toLowerCase()}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="order-info">
        <div className="order-meta">
          <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> {order.orderData?.orderSummary?.currency || 'NPR'} {Number(order.amount || 0).toFixed(2)}</p>
          <p><strong>Payment Status:</strong> {order.status}</p>
          {order.ncmOrderId && (
            <p><strong>NCM Order ID:</strong> {order.ncmOrderId}</p>
          )}
        </div>

        <div className="shipping-info">
          <h3>Shipping Address</h3>
          {order.orderData?.receiver_details ? (
            <>
              <p><strong>{order.orderData.receiver_details.name}</strong></p>
              {order.orderData.receiver_details.address?.addressLine1 && <p>{order.orderData.receiver_details.address.addressLine1}</p>}
              <p>
                {[
                  order.orderData.receiver_details.address?.cityName,
                  order.orderData.receiver_details.address?.postalCode,
                  order.orderData.receiver_details.address?.countryCode
                ].filter(Boolean).join(', ')}
              </p>
              {order.orderData.receiver_details.phone && <p>Phone: {order.orderData.receiver_details.phone}</p>}
            </>
          ) : order.shippingAddress ? (
            <>
              <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </>
          ) : (
            <p>Address information not available</p>
          )}
        </div>
      </div>

      {/* NCM Order Status Tracking */}
      {order.ncmOrderId && <OrderStatusTracker ncmOrderId={order.ncmOrderId} />}

      <div className="order-items">
        <h3>Order Items</h3>
        {(order.orderData?.products || order.orderItems || []).map((item, index) => {
          const title = item.title || item.product?.title || "Product";
          const imgSrc = item.imgSrc || item.product?.imgSrc || "/images/placeholder.jpg";
          const size = item.selectedSize || item.selectedVariant?.size;
          const color = item.selectedColor || item.selectedVariant?.color;
          const qty = item.quantity || item.pricing?.quantity || 1;
          const price = item.finalPrice ?? item.price;
          const currency = order.orderData?.orderSummary?.currency || 'NPR';

          return (
            <div key={item.id || index} className="order-item">
              <div className="item-image">
                <img
                  src={imgSrc}
                  alt={title}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: '6px' }}
                  onError={(e) => { e.target.src = "/images/placeholder.jpg"; }}
                />
              </div>
              <div className="item-details">
                <h4>{title}</h4>
                {(size || color) && (
                  <p style={{ fontSize: '13px', color: '#666', margin: '4px 0' }}>
                    {size && `Size: ${size}`}
                    {size && color && color !== 'default' && ' | '}
                    {color && color !== 'default' && `Color: ${color}`}
                  </p>
                )}
                <p>Quantity: {qty}</p>
                {price !== undefined && (
                  <p>Price: {currency} {price}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="order-actions">
        <Link href="/my-account-orders" className="tf-btn btn-outline">
          Back to Orders
        </Link>
      </div>
    </div>
  );
}
