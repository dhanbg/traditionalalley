"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { fetchDataFromApi } from "@/utils/api";

export default function Orers() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user data with user_bag populated
        const userDataResponse = await fetchDataFromApi(
          `/api/user-datas?filters[clerkUserId][$eq]=${user.id}&populate=user_bag`
        );

        if (userDataResponse?.data && userDataResponse.data.length > 0) {
          const userData = userDataResponse.data[0];
          const userBag = userData.user_bag;

          if (userBag && userBag.user_orders && userBag.user_orders.payments) {
            // Filter only successful payments
            const successfulOrders = userBag.user_orders.payments.filter(
              payment => payment.status === "Success"
            );

            // Sort by timestamp (newest first)
            const sortedOrders = successfulOrders.sort((a, b) => 
              new Date(b.timestamp) - new Date(a.timestamp)
            );

            setOrders(sortedOrders);
          }
        }
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotalItems = (orderData) => {
    if (!orderData?.products) return 0;
    return orderData.products.reduce((total, product) => total + product.quantity, 0);
  };

  if (loading) {
    return (
      <div className="my-account-content">
        <div className="account-orders">
          <div className="text-center">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account-content">
      <div className="account-orders">
        <div className="wrap-account-order">
          {orders.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th className="fw-6">Order</th>
                  <th className="fw-6">Date</th>
                  <th className="fw-6">Total</th>
                  <th className="fw-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.merchantTxnId || index} className="tf-order-item">
                    <td>#{order.merchantTxnId?.split('-').pop() || order.processId?.split('_').pop() || `ORD${index + 1}`}</td>
                    <td>{formatDate(order.timestamp)}</td>
                    <td>${order.amount} for {calculateTotalItems(order.orderData)} items</td>
                    <td>
                      <Link
                        href={`/my-account-orders-details?orderId=${order.merchantTxnId || order.processId || index}`}
                        className="tf-btn btn-fill radius-4"
                      >
                        <span className="text">View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center">
              <h4>No orders found</h4>
              <p>You haven't placed any successful orders yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
