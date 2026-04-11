"use client";
import React from "react";
import { useContextElement } from "@/context/Context";
import CartLoadingGuard from "@/components/common/CartLoadingGuard";

export default function TestCartLoadingPage() {
  const { 
    user, 
    isCartLoading, 
    cartLoadedOnce, 
    cartProducts,
    totalPrice 
  } = useContextElement();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Cart Loading Test Page</h1>
      
      <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>Cart Loading State Debug</h2>
        <p><strong>User logged in:</strong> {user ? "Yes" : "No"}</p>
        <p><strong>User ID:</strong> {user?.id || "N/A"}</p>
        <p><strong>Is cart loading:</strong> {isCartLoading ? "Yes" : "No"}</p>
        <p><strong>Cart loaded once:</strong> {cartLoadedOnce ? "Yes" : "No"}</p>
        <p><strong>Cart items count:</strong> {cartProducts.length}</p>
        <p><strong>Total price:</strong> ${totalPrice.toFixed(2)}</p>
      </div>

      <CartLoadingGuard showDebug={true}>
        <div style={{ padding: "1rem", backgroundColor: "#f0f8ff", borderRadius: "8px" }}>
          <h2>Protected Content (Only shows when cart is loaded)</h2>
          <p>This content should only appear after the cart has been fully loaded from the backend.</p>
          
          {cartProducts.length > 0 ? (
            <div>
              <h3>Cart Items:</h3>
              <ul>
                {cartProducts.map((item, index) => (
                  <li key={index}>
                    {item.title} - Quantity: {item.quantity} - Price: ${item.price}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>
      </CartLoadingGuard>
    </div>
  );
} 