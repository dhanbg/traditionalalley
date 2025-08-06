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
        
        // Filter for shipped orders only (those with trackingInfo)
        const shippedOrders = (response.data || []).filter(bag => {
          return bag.trackingInfo && (
            (Array.isArray(bag.trackingInfo) && bag.trackingInfo.length > 0) ||
            (typeof bag.trackingInfo === 'object' && bag.trackingInfo.status)
          );
        });
        
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

  // Helper function to get tracking info display
  const getTrackingDisplay = (trackingInfo) => {
    if (Array.isArray(trackingInfo)) {
      const latestTracking = trackingInfo[trackingInfo.length - 1];
      return latestTracking.shipmentTrackingNumber || 'Tracking Available';
    }
    return trackingInfo.shipmentTrackingNumber || 'Tracking Available';
  };

  // Helper function to get total amount from payments
  const getTotalAmount = (userOrders) => {
    if (!userOrders?.payments || userOrders.payments.length === 0) return 'N/A';
    const successfulPayments = userOrders.payments.filter(p => p.status === 'Success');
    if (successfulPayments.length === 0) return 'N/A';
    return successfulPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
  };

  // Helper function to get items count
  const getItemsCount = (userOrders) => {
    if (!userOrders?.payments || userOrders.payments.length === 0) return 0;
    const successfulPayments = userOrders.payments.filter(p => p.status === 'Success');
    return successfulPayments.reduce((total, payment) => {
      const products = payment.orderData?.products || [];
      return total + products.reduce((sum, product) => sum + (product.quantity || 1), 0);
    }, 0);
  };

  return (
    <div className="orders-list">
      <h2>My Shipped Orders</h2>
      <div className="orders-container">
        {orders.map((order) => {
          const totalAmount = getTotalAmount(order.user_orders);
          const itemsCount = getItemsCount(order.user_orders);
          const trackingDisplay = getTrackingDisplay(order.trackingInfo);
          
          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h4>Order #{order.id}</h4>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-status">
                  <span className="status shipped">
                    Shipped
                  </span>
                </div>
              </div>
              
              <div className="order-details">
                <div className="order-summary">
                  <p><strong>Total:</strong> NPR {totalAmount}</p>
                  <p><strong>Items:</strong> {itemsCount}</p>
                  <p><strong>Tracking:</strong> {trackingDisplay}</p>
                </div>
                
                <div className="order-actions">
                  <Link 
                    href={`/my-account-order-details/${order.id}`}
                    className="tf-btn btn-outline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
