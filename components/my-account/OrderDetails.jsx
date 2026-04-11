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
          <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
          <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
          {order.ncmOrderId && (
            <p><strong>NCM Order ID:</strong> {order.ncmOrderId}</p>
          )}
        </div>

        <div className="shipping-info">
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
          <p>{order.shippingAddress?.street}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
          <p>{order.shippingAddress?.country}</p>
        </div>
      </div>

      {/* NCM Order Status Tracking */}
      <OrderStatusTracker ncmOrderId={order.ncmOrderId} />

      <div className="order-items">
        <h3>Order Items</h3>
        {order.orderItems?.map((item) => (
          <div key={item.id} className="order-item">
            <div className="item-image">
              <Image
                src={item.product?.imgSrc || "/images/placeholder.jpg"}
                alt={item.product?.title || "Product"}
                width={80}
                height={80}
              />
            </div>
            <div className="item-details">
              <h4>{item.product?.title}</h4>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price}</p>
              <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="order-actions">
        <Link href="/my-account-orders" className="tf-btn btn-outline">
          Back to Orders
        </Link>
      </div>
    </div>
  );
}
