"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchDataFromApi } from "@/utils/api";
import { ORDER_DETAILS_API } from "@/utils/urls";
import Image from "next/image";
import Link from "next/link";

export default function OrderDetails({ orderId }) {
  const { data: session } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!session?.user || !orderId) return;

      try {
        const response = await fetchDataFromApi(
          `${ORDER_DETAILS_API}/${orderId}?filters[authUserId][$eq]=${session.user.id}`
        );
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [session?.user, orderId]);

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="error">Order not found</div>;
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
        </div>

        <div className="shipping-info">
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
          <p>{order.shippingAddress?.street}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
          <p>{order.shippingAddress?.country}</p>
        </div>
      </div>

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
