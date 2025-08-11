"use client";
import React from 'react';
import { useToast } from '@/context/ToastContext';

/**
 * Utility functions for stock-related notifications
 */
export const useStockNotifications = () => {
  const { showError, showWarning, showSuccess } = useToast();

  const showStockError = (message, availableStock = null, productName = null) => {
    let displayMessage = message;
    
    // Enhance message with product name if available
    if (productName && !message.includes(productName)) {
      displayMessage = `${productName}: ${message}`;
    }
    
    // Add stock information if available
    if (availableStock !== null && availableStock >= 0) {
      if (availableStock === 0) {
        displayMessage += ' (Out of stock)';
      } else {
        displayMessage += ` (Only ${availableStock} left)`;
      }
    }
    
    console.log('Calling showError with:', displayMessage);
    showError(displayMessage, 5000); // Show for 5 seconds
  };

  const showStockWarning = (message, availableStock = null, productName = null) => {
    let displayMessage = message;
    
    if (productName && !message.includes(productName)) {
      displayMessage = `${productName}: ${message}`;
    }
    
    if (availableStock !== null && availableStock > 0) {
      displayMessage += ` (${availableStock} available)`;
    }
    
    showWarning(displayMessage, 4000);
  };

  const showAddToCartSuccess = (productName, quantity = 1, size = null) => {
    let message = `${productName} added to cart!`;
    
    if (quantity > 1) {
      message = `${quantity}x ${productName} added to cart!`;
    }
    
    if (size) {
      message += ` (Size: ${size})`;
    }
    
    showSuccess(message, 3000);
  };

  const showQuantityUpdateSuccess = (productName, newQuantity, size = null) => {
    let message = `${productName} quantity updated to ${newQuantity}`;
    
    if (size) {
      message += ` (Size: ${size})`;
    }
    
    showSuccess(message, 2500);
  };

  return {
    showStockError,
    showStockWarning,
    showAddToCartSuccess,
    showQuantityUpdateSuccess,
    // Also expose the original toast functions
    showError,
    showWarning,
    showSuccess
  };
};

export default useStockNotifications;
