"use client";
import React, { useState, useEffect } from 'react';
import { useContextElement } from '@/context/Context';

const CURRENCIES = [
  {
    code: 'NPR',
    symbol: 'Rs.',
    name: 'Nepali Rupee',
    flagSrc: '/Flag_of_Nepal.svg',
    flagAlt: 'Nepal Flag',
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flagSrc: '/images/country/us.svg',
    flagAlt: 'US Flag',
  },
];

function getFlagImg(currency) {
  return (
    <img
      src={currency.flagSrc}
      alt={currency.flagAlt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
        borderRadius: currency.code === 'USD' ? '2px' : undefined,
      }}
    />
  );
}

export default function CurrencySwitcher({ className = "" }) {
  const { 
    userCurrency, 
    setCurrency,
    isLoadingCurrency 
  } = useContextElement();
  
  const [isOpen, setIsOpen] = useState(false);

  const currentCurrency = CURRENCIES.find(c => c.code === userCurrency) || CURRENCIES[0];
  
  const handleCurrencyChange = (currencyCode) => {
    setCurrency(currencyCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.currency-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isLoadingCurrency) {
    return (
      <div className={`currency-switcher-loading ${className}`}>
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`currency-switcher ${className}`}>
      <div 
        className="currency-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className="currency-flag">{getFlagImg(currentCurrency)}</span>
        <span className="currency-code">{currentCurrency.code}</span>
      </div>
      
      {isOpen && (
        <div className="currency-switcher-dropdown">
          {CURRENCIES.map((currency) => (
            <div
              key={currency.code}
              className={`currency-option ${currency.code === userCurrency ? 'active' : ''}`}
              onClick={() => handleCurrencyChange(currency.code)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCurrencyChange(currency.code);
                }
              }}
            >
              <span className="currency-flag">{getFlagImg(currency)}</span>
              <span className="currency-code">{currency.code}</span>
              {currency.code === userCurrency && (
                <span className="currency-check">
                  <i className="icon icon-check"></i>
                </span>
              )}
            </div>
          ))}
          

        </div>
      )}

      <style jsx>{`
        .currency-switcher {
          position: relative;
          display: inline-block;
        }

        .currency-switcher-loading {
          display: flex;
          align-items: center;
          padding: 8px 12px;
        }

        .currency-switcher-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px !important;
          min-width: 80px;
          line-height: 1.4 !important;
        }

        .currency-switcher-trigger:hover {
          border-color: #ccc;
          background: #f8f9fa;
        }

        .currency-flag {
          width: 20px;
          height: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .currency-code {
          font-weight: 500;
          color: #333;
          font-size: 14px !important;
          min-width: 40px;
          display: flex;
          align-items: center;
          line-height: 1.4 !important;
        }

        .currency-arrow {
          display: flex;
          align-items: center;
          transition: transform 0.2s ease;
          color: #666;
        }

        .currency-arrow.open {
          transform: rotate(180deg);
        }

        .currency-switcher-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          margin-top: 4px;
          overflow: hidden;
        }

        .currency-option {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          padding: 12px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }

        .currency-option:last-child {
          border-bottom: none;
        }

        .currency-option:hover {
          background: #f8f9fa;
        }

        .currency-option.active {
          background: #e3f2fd;
        }

        .currency-check {
          margin-left: 8px;
          color: #2196f3;
          font-size: 16px;
          display: flex;
          align-items: center;
        }

        /* Mobile flag only styling - for nav positioning */
        .mobile-flag-only {
          .currency-switcher-trigger {
            gap: 0;
            padding: 6px;
            border: 1px solid rgba(0, 0, 0, 0.15);
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            justify-content: center;
            align-items: center;
            min-width: auto;
            transition: all 0.2s ease;
          }

          .currency-switcher-trigger:hover {
            background: rgba(255, 255, 255, 1);
            border-color: rgba(0, 0, 0, 0.25);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .currency-switcher-trigger .currency-code,
          .currency-switcher-trigger .currency-arrow {
            display: none;
          }

          .currency-flag {
            width: 18px;
            height: 14px;
          }

          .currency-switcher-dropdown {
            min-width: 120px;
            left: -20px;
          }
        }

        /* Responsive adjustments for regular currency switcher */
        @media (max-width: 768px) {
          .currency-switcher:not(.mobile-flag-only) .currency-switcher-trigger {
            padding: 6px 8px;
            font-size: 13px;
            min-width: auto;
            width: auto;
          }

          /* Hide currency code and arrow on small devices - show only flag */
          .currency-switcher:not(.mobile-flag-only) .currency-switcher-trigger .currency-code,
          .currency-switcher:not(.mobile-flag-only) .currency-switcher-trigger .currency-arrow {
            display: none;
          }

          .currency-switcher:not(.mobile-flag-only) .currency-switcher-trigger {
            gap: 0;
            padding: 8px;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            justify-content: center;
            align-items: center;
          }

          .currency-switcher:not(.mobile-flag-only) .currency-flag {
            width: 18px;
            height: 14px;
          }

          .currency-option {
            padding: 10px;
          }

          /* Adjust dropdown positioning for smaller trigger */
          .currency-switcher:not(.mobile-flag-only) .currency-switcher-dropdown {
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  );
} 