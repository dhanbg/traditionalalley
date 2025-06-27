"use client";
import React from 'react';
import { useContextElement } from '@/context/Context';
import { getDualPriceDisplay, formatPrice } from '@/utils/currency';

export default function PriceDisplay({ 
  price, 
  oldPrice = null, 
  className = "",
  showConversion = false,
  size = "normal" // normal, small, large
}) {
  const { userCurrency, exchangeRate } = useContextElement();
  
  if (!price && price !== 0) return null;

  // Get price display information
  const priceInfo = getDualPriceDisplay(price, userCurrency, exchangeRate);
  const oldPriceInfo = oldPrice ? getDualPriceDisplay(oldPrice, userCurrency, exchangeRate) : null;
  
  // Calculate discount percentage
  const discountPercentage = oldPrice && price 
    ? ((oldPrice - price) / oldPrice * 100).toFixed(0) 
    : null;

  const sizeClasses = {
    small: 'price-display-small',
    normal: 'price-display-normal', 
    large: 'price-display-large'
  };

  return (
    <div className={`price-display ${sizeClasses[size]} ${className}`}>
      <div className="price-main">
        {/* Old Price (if exists) */}
        {oldPriceInfo && (
          <span className="old-price">
            {oldPriceInfo.primary.formatted}
          </span>
        )}
        
        {/* Current Price */}
        <span className="current-price">
          {priceInfo.primary.formatted}
        </span>
        
        {/* Discount Badge */}
        {discountPercentage && (
          <span className="discount-badge">
            -{discountPercentage}%
          </span>
        )}
      </div>
      
      {/* Conversion Info for NPR users */}
      {showConversion && priceInfo.showConversion && priceInfo.secondary && (
        <div className="price-conversion">
          <small className="conversion-text">
            ≈ {priceInfo.secondary.formatted}
            {oldPriceInfo && oldPriceInfo.secondary && (
              <span className="conversion-old">
                {" "}(was {oldPriceInfo.secondary.formatted})
              </span>
            )}
          </small>
        </div>
      )}

      <style jsx>{`
        .price-display {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .price-main {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .current-price {
          font-weight: 600;
          color: #333;
        }

        .old-price {
          text-decoration: line-through;
          color: #999;
          font-weight: 400;
        }

        .discount-badge {
          background: #ff4444;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .price-conversion {
          margin-top: 2px;
        }

        .conversion-text {
          color: #666;
          font-size: 12px;
          font-style: italic;
        }

        .conversion-old {
          color: #999;
        }

        /* Size variations */
        .price-display-small .current-price {
          font-size: 14px !important;
          line-height: 1.4 !important;
        }

        .price-display-small .old-price {
          font-size: 12px !important;
          line-height: 1.4 !important;
        }

        .price-display-small .conversion-text {
          font-size: 10px !important;
          line-height: 1.4 !important;
        }

        .price-display-small .discount-badge {
          font-size: 9px !important;
          padding: 1px 4px;
          line-height: 1.2 !important;
        }

        .price-display-normal .current-price {
          font-size: 16px !important;
          line-height: 1.4 !important;
        }

        .price-display-normal .old-price {
          font-size: 14px !important;
          line-height: 1.4 !important;
        }

        .price-display-large .current-price {
          font-size: 24px !important;
          line-height: 1.4 !important;
        }

        .price-display-large .old-price {
          font-size: 20px !important;
          line-height: 1.4 !important;
        }

        .price-display-large .conversion-text {
          font-size: 14px !important;
          line-height: 1.4 !important;
        }

        .price-display-large .discount-badge {
          font-size: 12px !important;
          padding: 4px 8px;
          line-height: 1.2 !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .price-display-large .current-price {
            font-size: 20px;
          }

          .price-display-large .old-price {
            font-size: 16px;
          }

          .price-main {
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
} 