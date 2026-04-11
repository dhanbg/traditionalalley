"use client";
import React from 'react';
import Header1 from '@/components/headers/Header1';
import PriceDisplay from '@/components/common/PriceDisplay';
import CurrencySwitcher from '@/components/common/CurrencySwitcher';
import { useContextElement } from '@/context/Context';

export default function PricingDemo() {
  const { userCurrency, userCountry, exchangeRate, isLoadingCurrency } = useContextElement();

  const sampleProducts = [
    {
      id: 1,
      name: "Traditional Nepali Kurta",
      price: 45.99,
      oldPrice: 59.99
    },
    {
      id: 2,
      name: "Handwoven Pashmina Shawl",
      price: 89.99,
      oldPrice: null
    },
    {
      id: 3,
      name: "Tibetan Singing Bowl",
      price: 125.50,
      oldPrice: 149.99
    },
    {
      id: 4,
      name: "Nepali Tea Set",
      price: 29.99,
      oldPrice: 39.99
    }
  ];

  return (
    <>
      <Header1 />
      <div className="pricing-demo-page">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="demo-header text-center py-5">
                <h1 className="mb-4">Dual Currency Pricing System Demo</h1>
                <p className="lead mb-4">
                  Experience our smart pricing system that automatically detects your location 
                  and shows prices in your preferred currency.
                </p>
                
                <div className="currency-info-card">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <div className="info-item">
                        <strong>Detected Country:</strong> 
                        <span className="ms-2">
                          {userCountry === 'NP' ? '🇳🇵 Nepal' : '🌍 Global'}
                        </span>
                      </div>
                      <div className="info-item">
                        <strong>Current Currency:</strong> 
                        <span className="ms-2">{userCurrency}</span>
                      </div>
                      {exchangeRate && (
                        <div className="info-item">
                          <strong>Exchange Rate:</strong> 
                          <span className="ms-2">1 USD = Rs. {exchangeRate.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 text-md-end">
                      <div className="currency-switcher-demo">
                        <label className="form-label">Switch Currency:</label>
                        <CurrencySwitcher />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <h2 className="mb-4">Sample Products</h2>
              <div className="row">
                {sampleProducts.map((product) => (
                  <div key={product.id} className="col-lg-3 col-md-6 mb-4">
                    <div className="product-demo-card">
                      <div className="product-image">
                        <div className="placeholder-image">Product Image</div>
                      </div>
                      <div className="product-info">
                        <h5 className="product-name">{product.name}</h5>
                        <div className="product-pricing">
                          <PriceDisplay 
                            price={product.price}
                            oldPrice={product.oldPrice}
                            size="normal"
                            showConversion={false}
                          />
                        </div>
                        <button className="btn btn-primary btn-sm mt-2 w-100">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-12">
              <div className="features-section">
                <h2 className="mb-4">Key Features</h2>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="feature-card">
                      <div className="feature-icon">🌍</div>
                      <h5>Auto Location Detection</h5>
                      <p>Automatically detects user location using timezone, IP, and browser language.</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="feature-card">
                      <div className="feature-icon">💱</div>
                      <h5>Real-time Exchange Rates</h5>
                      <p>Uses live exchange rates with hourly updates and fallback mechanisms.</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="feature-card">
                      <div className="feature-icon">🔄</div>
                      <h5>Currency Conversion</h5>
                      <p>Shows prices in NPR for Nepali users with USD conversion for reference.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-12">
              <div className="implementation-notes">
                <h2 className="mb-4">Implementation Notes</h2>
                <div className="alert alert-info">
                  <h6>For Nepali Users (NPR):</h6>
                  <ul className="mb-0">
                    <li>Primary prices shown in Nepali Rupees (Rs.)</li>
                    <li>USD equivalent shown as reference</li>
                    <li>Exchange rate displayed in currency switcher</li>
                    <li>Automatic detection via timezone (Asia/Kathmandu) or IP location</li>
                  </ul>
                </div>
                <div className="alert alert-success">
                  <h6>For Global Users (USD):</h6>
                  <ul className="mb-0">
                    <li>Primary prices shown in US Dollars ($)</li>
                    <li>Clean, familiar pricing display</li>
                    <li>Option to switch to NPR if desired</li>
                    <li>Default currency for international customers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .pricing-demo-page {
            padding: 2rem 0;
            min-height: 100vh;
            background: #f8f9fa;
          }

          .demo-header {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
          }

          .currency-info-card {
            background: #e3f2fd;
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 2rem;
          }

          .info-item {
            margin-bottom: 0.5rem;
          }

          .currency-switcher-demo {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
          }

          .product-demo-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
            height: 100%;
          }

          .product-demo-card:hover {
            transform: translateY(-2px);
          }

          .product-image {
            height: 200px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
          }

          .placeholder-image {
            font-size: 1rem;
            color: #999;
          }

          .product-info {
            padding: 1rem;
          }

          .product-name {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #333;
          }

          .features-section {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          .feature-card {
            text-align: center;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 8px;
            height: 100%;
          }

          .feature-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
          }

          .feature-card h5 {
            color: #333;
            margin-bottom: 1rem;
          }

          .feature-card p {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 0;
          }

          .implementation-notes {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          @media (max-width: 768px) {
            .currency-switcher-demo {
              align-items: center;
              margin-top: 1rem;
            }
            
            .info-item {
              text-align: center;
            }
          }
        `}</style>
      </div>
    </>
  );
} 