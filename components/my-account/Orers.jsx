"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchDataFromApi } from "@/utils/api";
import { ORDERS_API } from "@/utils/urls";
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
          `${ORDERS_API}?filters[authUserId][$eq]=${session.user.id}&populate=*&sort=createdAt:desc`
        );
        setOrders(response.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
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
        <h3>No orders found</h3>
        <p>You haven't placed any orders yet.</p>
        <Link href="/shop-default-grid" className="tf-btn btn-fill">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-list">
      <h2>My Orders</h2>
      <div className="orders-container">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h4>Order #{order.id}</h4>
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="order-status">
                <span className={`status ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="order-details">
              <div className="order-summary">
                <p><strong>Total:</strong> ${order.totalAmount}</p>
                <p><strong>Items:</strong> {order.orderItems?.length || 0}</p>
                <p><strong>Payment:</strong> {order.paymentStatus}</p>
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
        ))}
      </div>
    </div>
  );
}
