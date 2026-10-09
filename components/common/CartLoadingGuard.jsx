"use client";
import React, { useState, useEffect } from "react";
import { useContextElement } from "@/context/Context";

export default function CartLoadingGuard({ children, showDebug = false, timeout = 10000 }) {
  const { isCartLoading, cartLoadedOnce, isSessionLoading } = useContextElement();
  const [mounted, setMounted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safety timeout to avoid getting stuck forever in case of network/backend errors
  useEffect(() => {
    if (isCartLoading || !cartLoadedOnce || isSessionLoading) {
      const timer = setTimeout(() => {
        setTimedOut(true);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [isCartLoading, cartLoadedOnce, isSessionLoading, timeout]);

  const shouldShowLoading = !timedOut && (!mounted || isCartLoading || !cartLoadedOnce || isSessionLoading);

  if (shouldShowLoading) {
    return <CheckoutSkeleton />;
  }

  return <>{children}</>;
}

function CheckoutSkeleton() {
  return (
    <section className="checkout-skeleton-section">
      <div className="container">
        <div className="row g-4">
          {/* Left Column: Delivery & Shipping Details Skeleton */}
          <div className="col-xl-6 col-lg-7">
            <div className="skeleton-card p-4 mb-4">
              {/* Card Header */}
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="skeleton-box skeleton-icon"></div>
                <div className="skeleton-box skeleton-heading w-40"></div>
              </div>

              {/* Form Grid Rows */}
              <div className="row g-3">
                <div className="col-md-6 col-12">
                  <div className="skeleton-box skeleton-label w-35 mb-2"></div>
                  <div className="skeleton-box skeleton-input"></div>
                </div>
                <div className="col-md-6 col-12">
                  <div className="skeleton-box skeleton-label w-45 mb-2"></div>
                  <div className="skeleton-box skeleton-input"></div>
                </div>

                <div className="col-md-6 col-12">
                  <div className="skeleton-box skeleton-label w-40 mb-2"></div>
                  <div className="skeleton-box skeleton-input"></div>
                </div>
                <div className="col-md-6 col-12">
                  <div className="skeleton-box skeleton-label w-30 mb-2"></div>
                  <div className="skeleton-box skeleton-input"></div>
                </div>

                <div className="col-md-6 col-12">
                  <div className="skeleton-box skeleton-label w-25 mb-2"></div>
                  <div className="skeleton-box skeleton-input"></div>
                </div>
                <div className="col-md-6 col-12">
                  <div className="skeleton-box skeleton-label w-35 mb-2"></div>
                  <div className="skeleton-box skeleton-input"></div>
                </div>

                <div className="col-12">
                  <div className="skeleton-box skeleton-label w-30 mb-2"></div>
                  <div className="skeleton-box skeleton-input"></div>
                </div>

                <div className="col-md-6 col-12">
                  <div className="skeleton-box skeleton-label w-35 mb-2"></div>
                  <div className="skeleton-box skeleton-input"></div>
                </div>
              </div>

              {/* Notice Banner & Action Button Skeleton */}
              <div className="skeleton-box skeleton-alert w-100 mt-4 mb-3"></div>
              <div className="skeleton-box skeleton-btn w-100"></div>
            </div>

            {/* Payment Methods Card Skeleton */}
            <div className="skeleton-card p-4">
              <div className="skeleton-box skeleton-heading w-35 mb-3"></div>
              <div className="row g-3">
                <div className="col-6">
                  <div className="skeleton-box skeleton-payment-option"></div>
                </div>
                <div className="col-6">
                  <div className="skeleton-box skeleton-payment-option"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Cart Items Skeleton */}
          <div className="col-xl-5 col-lg-5 ms-xl-auto">
            <div className="skeleton-card p-4">
              {/* Header Badge */}
              <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div className="skeleton-box skeleton-badge w-35"></div>
                <div className="skeleton-box skeleton-text w-20"></div>
              </div>

              {/* Cart Items Placeholder List */}
              <div className="cart-items-skeleton mb-4">
                {[1, 2].map((item) => (
                  <div key={item} className="d-flex gap-3 py-3 border-bottom">
                    <div className="skeleton-box skeleton-thumb"></div>
                    <div className="flex-grow-1 d-flex flex-column justify-content-center gap-2">
                      <div className="skeleton-box skeleton-text w-85"></div>
                      <div className="skeleton-box skeleton-text w-45"></div>
                      <div className="skeleton-box skeleton-text w-35"></div>
                    </div>
                    <div className="skeleton-box skeleton-price w-20 align-self-center"></div>
                  </div>
                ))}
              </div>

              {/* Order Summary Breakdown */}
              <div className="summary-breakdown d-flex flex-column gap-3 pt-2">
                <div className="d-flex justify-content-between">
                  <div className="skeleton-box skeleton-text w-30"></div>
                  <div className="skeleton-box skeleton-text w-25"></div>
                </div>
                <div className="d-flex justify-content-between">
                  <div className="skeleton-box skeleton-text w-40"></div>
                  <div className="skeleton-box skeleton-text w-20"></div>
                </div>
                <div className="d-flex justify-content-between pt-2 border-top">
                  <div className="skeleton-box skeleton-heading w-35"></div>
                  <div className="skeleton-box skeleton-heading w-30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkout-skeleton-section {
          padding: 40px 0 60px;
          min-height: 520px;
        }

        .skeleton-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
        }

        :global(html.dark) .skeleton-card {
          background: #191b22;
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
        }

        .skeleton-box {
          position: relative;
          overflow: hidden;
          background: #edeef2;
          border-radius: 6px;
        }

        :global(html.dark) .skeleton-box {
          background: #242833;
        }

        .skeleton-box::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.65),
            transparent
          );
          animation: skeletonShimmer 1.8s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }

        :global(html.dark) .skeleton-box::after {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
        }

        .skeleton-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
        }

        .skeleton-heading {
          height: 20px;
        }

        .skeleton-label {
          height: 12px;
        }

        .skeleton-input {
          height: 44px;
          border-radius: 8px;
        }

        .skeleton-alert {
          height: 42px;
          border-radius: 8px;
        }

        .skeleton-btn {
          height: 48px;
          border-radius: 8px;
        }

        .skeleton-payment-option {
          height: 54px;
          border-radius: 8px;
        }

        .skeleton-badge {
          height: 28px;
          border-radius: 6px;
        }

        .skeleton-thumb {
          width: 76px;
          height: 98px;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .skeleton-text {
          height: 13px;
        }

        .skeleton-price {
          height: 16px;
        }

        .w-20 { width: 20%; }
        .w-25 { width: 25%; }
        .w-30 { width: 30%; }
        .w-35 { width: 35%; }
        .w-40 { width: 40%; }
        .w-45 { width: 45%; }
        .w-85 { width: 85%; }

        @keyframes skeletonShimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
}