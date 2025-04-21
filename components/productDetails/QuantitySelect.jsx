"use client";
import { useState, useEffect } from "react";

export default function QuantitySelect({
  quantity = 1,
  setQuantity = () => {},
  styleClass = "",
}) {
  const [updateMessage, setUpdateMessage] = useState("");
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  
  // Clear update message after 3 seconds
  useEffect(() => {
    if (updateMessage) {
      const timer = setTimeout(() => {
        setUpdateMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateMessage]);
  
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity === quantity) return; // No change
    if (newQuantity < 1) return; // Don't allow less than 1
    
    setUpdatingQuantity(true);
    setUpdateMessage("Updating quantity...");
    
    try {
      console.log(`QuantitySelect: Changing quantity from ${quantity} to ${newQuantity}`);
      
      // Handle both Promise and non-Promise returns from setQuantity
      const result = setQuantity(newQuantity);
      
      if (result && typeof result.then === 'function') {
        // It's a Promise
        console.log("QuantitySelect: Awaiting promise from setQuantity");
        try {
          const response = await result;
          console.log("QuantitySelect: Promise resolved with response:", response);
          setUpdateMessage("✅ Quantity updated!");
        } catch (error) {
          console.error("QuantitySelect: Promise rejected with error:", error);
          setUpdateMessage("❌ Error updating quantity");
        }
      } else {
        console.log("QuantitySelect: setQuantity did not return a Promise, result:", result);
        setUpdateMessage("✅ Quantity updated locally");
      }
      
      console.log("QuantitySelect: Quantity change completed");
    } catch (error) {
      console.error("QuantitySelect: Error updating quantity:", error);
      setUpdateMessage("❌ Error updating quantity");
    } finally {
      setUpdatingQuantity(false);
    }
  };

  return (
    <>
      <div className={`wg-quantity ${styleClass} `}>
        <span
          className={`btn-quantity btn-decrease ${updatingQuantity ? 'disabled' : ''}`}
          onClick={() => !updatingQuantity && handleQuantityChange(quantity > 1 ? quantity - 1 : quantity)}
          role="button"
          tabIndex={0}
          style={{ pointerEvents: updatingQuantity ? 'none' : 'auto' }}
        >
          -
        </span>
        <input
          className="quantity-product"
          type="number"
          name="number"
          value={quantity}
          disabled={updatingQuantity}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value > 0) {
              handleQuantityChange(value);
            }
          }}
        />
        <span
          className={`btn-quantity btn-increase ${updatingQuantity ? 'disabled' : ''}`}
          onClick={() => !updatingQuantity && handleQuantityChange(quantity + 1)}
          role="button"
          tabIndex={0}
          style={{ pointerEvents: updatingQuantity ? 'none' : 'auto' }}
        >
          +
        </span>
      </div>
      {updateMessage && (
        <div className="update-message" style={{ fontSize: '0.8rem', marginTop: '5px', color: updateMessage.includes('Error') ? 'red' : 'green' }}>
          {updateMessage}
        </div>
      )}
    </>
  );
}
