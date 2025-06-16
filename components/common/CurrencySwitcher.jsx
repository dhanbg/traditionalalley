"use client";
import React, { useState, useEffect } from 'react';
import { useContextElement } from '@/context/Context';
import { getCurrencyInfo } from '@/utils/currency';

export default function CurrencySwitcher({ className = "" }) {
  const { 
    userCurrency, 
    userCountry, 
    exchangeRate, 
    setCurrency,
    isLoadingCurrency 
  } = useContextElement();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const currencies = [
    {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      flag: (
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="16" height="12" rx="2" fill="#B22234"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M0 1H16V2H0V1ZM0 3H16V4H0V3ZM0 5H16V6H0V5ZM0 7H16V8H0V7ZM0 9H16V10H0V9ZM0 11H16V12H0V11Z" fill="white"/>
          <rect width="6.4" height="6" fill="#3C3B6E"/>
          <g fill="white">
            <circle cx="1.6" cy="1" r="0.3"/>
            <circle cx="3.2" cy="1" r="0.3"/>
            <circle cx="4.8" cy="1" r="0.3"/>
            <circle cx="2.4" cy="2" r="0.3"/>
            <circle cx="4" cy="2" r="0.3"/>
            <circle cx="1.6" cy="3" r="0.3"/>
            <circle cx="3.2" cy="3" r="0.3"/>
            <circle cx="4.8" cy="3" r="0.3"/>
            <circle cx="2.4" cy="4" r="0.3"/>
            <circle cx="4" cy="4" r="0.3"/>
            <circle cx="1.6" cy="5" r="0.3"/>
            <circle cx="3.2" cy="5" r="0.3"/>
            <circle cx="4.8" cy="5" r="0.3"/>
          </g>
        </svg>
      )
    },
    {
      code: 'NPR',
      symbol: 'Rs.',
      name: 'Nepali Rupee',
      flag: (
        <img src="/Flag_of_Nepal.svg" alt="Nepal Flag" style={{ width: 20, height: 15, objectFit: 'contain', display: 'block' }} />
      )
    }
  ];

  const currentCurrency = currencies.find(c => c.code === userCurrency) || currencies[0];
  
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
        <span className="currency-flag">{currentCurrency.flag}</span>
        <span className="currency-code">{currentCurrency.code}</span>
        <span className={`currency-arrow ${isOpen ? 'open' : ''}`}>
          <i className="icon icon-arrow-down"></i>
        </span>
      </div>
      
      {isOpen && (
        <div className="currency-switcher-dropdown">
          {currencies.map((currency) => (
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
              <span className="currency-flag">{currency.flag}</span>
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
          font-size: 14px;
          min-width: 80px;
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
          flex-shrink: 0;
        }

        .currency-code {
          font-weight: 500;
          color: #333;
          font-size: 14px;
          min-width: 40px;
          display: flex;
          align-items: center;
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

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .currency-switcher-trigger {
            padding: 6px 10px;
            font-size: 13px;
            min-width: 70px;
          }

          .currency-option {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
} 