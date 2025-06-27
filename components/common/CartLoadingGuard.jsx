"use client";
import React from "react";
import { useContextElement } from "@/context/Context";

export default function CartLoadingGuard({ children, showDebug = false, timeout = 10000 }) {
  const { isCartLoading, cartLoadedOnce, user } = useContextElement();
  const [mounted, setMounted] = React.useState(false);
  const [timedOut, setTimedOut] = React.useState(false);

  // Ensure component is mounted before showing loading state
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Timeout mechanism to prevent infinite loading
  React.useEffect(() => {
    if (mounted && user && (isCartLoading || !cartLoadedOnce)) {
      const timer = setTimeout(() => {
        setTimedOut(true);
        if (showDebug) {
          console.warn("CartLoadingGuard: Timeout reached, showing content anyway");
        }
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [mounted, user, isCartLoading, cartLoadedOnce, timeout, showDebug]);

  // Show loading screen if:
  // 1. Component is mounted AND
  // 2. User is logged in AND
  // 3. Cart is currently loading OR cart has never been loaded yet AND
  // 4. Timeout hasn't been reached
  const shouldShowLoading = mounted && user && (isCartLoading || !cartLoadedOnce) && !timedOut;

  // Debug logging (only if showDebug is true)
  React.useEffect(() => {
    if (showDebug) {
      console.log("CartLoadingGuard state:", {
        mounted,
        user: !!user,
        userId: user?.id,
        isCartLoading,
        cartLoadedOnce,
        timedOut,
        shouldShowLoading
      });
    }
  }, [mounted, user, isCartLoading, cartLoadedOnce, timedOut, shouldShowLoading, showDebug]);

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return null;
  }

  if (shouldShowLoading) {
    return (
      <div className="cart-loading-screen">
        <div className="cart-loading-container">
          <div className="cart-loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <div className="cart-loading-text">
            <h4>Loading your cart...</h4>
            <p>Please wait while we fetch your cart items from the server.</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          .cart-loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          
          .cart-loading-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 90%;
          }
          
          .cart-loading-spinner {
            margin-bottom: 1.5rem;
          }
          
          .spinner-border {
            width: 3rem;
            height: 3rem;
            border-width: 0.3em;
          }
          
          .cart-loading-text h4 {
            color: #333;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }
          
          .cart-loading-text p {
            color: #666;
            margin: 0;
            font-size: 0.9rem;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .cart-loading-container {
            animation: fadeIn 0.3s ease-out;
          }
          
          .loading-dots {
            display: flex;
            justify-content: center;
            gap: 4px;
            margin-top: 1rem;
          }
          
          .loading-dots span {
            width: 8px;
            height: 8px;
            background: #007bff;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out both;
          }
          
          .loading-dots span:nth-child(1) {
            animation-delay: -0.32s;
          }
          
          .loading-dots span:nth-child(2) {
            animation-delay: -0.16s;
          }
          
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  // If not loading, render the children
  return <>{children}</>;
} 