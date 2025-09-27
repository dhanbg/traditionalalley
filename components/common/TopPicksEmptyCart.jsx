"use client";
import React, { useEffect, useState } from "react";
import ProductCard1 from "@/components/productCards/ProductCard1";
import { fetchTopPicksItems } from "@/utils/productVariantUtils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

export default function TopPicksEmptyCart({ 
  isModal = false, 
  onProductClick = null,
  maxProducts = 8 
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        setLoading(true);
        const topPicksItems = await fetchTopPicksItems();
        
        if (topPicksItems && topPicksItems.length > 0) {
          setProducts(topPicksItems.slice(0, maxProducts));
          setError(null);
        } else {
          setError("No top picks found");
          setProducts([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top picks:', error);
        setError(`Error fetching top picks: ${error.message || "Unknown error"}`);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchTopPicks();
  }, [maxProducts]);

  if (loading) {
    return (
      <div className={`top-picks-empty-cart ${isModal ? 'modal-version' : 'page-version'}`}>
        <div className="loading-spinner">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="loading-text">Discovering amazing products for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`top-picks-empty-cart ${isModal ? 'modal-version' : 'page-version'}`}>
        <div className="error-state">
          <div className="error-icon">
            <span className="icon icon-alert-circle"></span>
          </div>
          <h3 className="error-title">Oops! Something went wrong</h3>
          <p className="error-message">We couldn't load our top picks right now. Please check your connection and try again.</p>
          <button 
            className="btn-retry"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`top-picks-empty-cart ${isModal ? 'modal-version' : 'page-version'}`}>
        <div className="text-center py-4">
          <p className="text-muted">No top picks available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`top-picks-empty-cart ${isModal ? 'modal-version' : 'page-version'}`}>
      <div className="top-picks-header text-center mb-4">
        <h4 className="top-picks-title">Top Picks for You</h4>
        <p className="top-picks-subtitle">Discover our most popular products</p>
      </div>
      
      <div className="top-picks-products">
        {isModal ? (
          // Modal version - simple grid layout
          <div className="modal-products-grid">
            {products.slice(0, 4).map((product, i) => (
              <div key={i} className="modal-product-item" onClick={() => onProductClick && onProductClick(product)}>
                <ProductCard1 product={product} />
              </div>
            ))}
          </div>
        ) : (
          // Page version - swiper layout
          <div className="page-products-swiper">
            <Swiper
              className="tf-sw-product-sell"
              slidesPerView={4}
              spaceBetween={30}
              breakpoints={{
                768: { slidesPerView: 2, spaceBetween: 15 },
                480: { slidesPerView: 1, spaceBetween: 15 },
              }}
              modules={[Pagination, Navigation]}
              pagination={{
                clickable: true,
                el: ".spd-toppicks-empty",
              }}
              navigation={{
                prevEl: ".snbp-toppicks-empty",
                nextEl: ".snbn-toppicks-empty",
              }}
            >
              {products.map((product, i) => (
                <SwiperSlide key={i}>
                  <div className="product-item-wrapper">
                    <ProductCard1 product={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Navigation buttons */}
            <div className="nav-sw nav-next-slider nav-next-product box-icon w_46 round snbn-toppicks-empty">
              <span className="icon icon-arrow-right" />
            </div>
            <div className="nav-sw nav-prev-slider nav-prev-product box-icon w_46 round snbp-toppicks-empty">
              <span className="icon icon-arrow-left" />
            </div>
            
            {/* Pagination */}
            <div className="d-flex d-lg-none sw-pagination-collection sw-dots type-circle justify-content-center spd-toppicks-empty" />
          </div>
        )}
      </div>
      
      <style jsx>{`
        .top-picks-empty-cart {
          width: 100%;
          font-family: inherit;
        }
        
        .top-picks-empty-cart.modal-version {
          padding: 20px;
          max-height: 75vh;
          overflow-y: auto;
        }
        
        .top-picks-empty-cart.page-version {
          padding: 60px 0;
          background: #fafafa;
          border-radius: 12px;
          margin: 20px 0;
        }
        
        .top-picks-header {
          margin-bottom: 40px;
          padding: 0 20px;
        }
        
        .top-picks-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }
        
        .modal-version .top-picks-title {
          font-size: 22px;
          margin-bottom: 8px;
        }
        
        .top-picks-subtitle {
          font-size: 16px;
          color: #666;
          margin: 0;
          font-weight: 400;
        }
        
        .modal-version .top-picks-subtitle {
          font-size: 14px;
        }
        
        .modal-products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          padding: 0 10px;
        }
        
        .modal-product-item {
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .modal-product-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .page-products-swiper {
          position: relative;
          padding: 0 20px;
        }
        
        .page-products-swiper .tf-sw-product-sell {
          padding-bottom: 50px;
        }
        
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 0;
        }
        
        .loading-spinner .spinner-border {
          width: 3rem;
          height: 3rem;
          border-width: 0.3em;
        }
        
        .loading-text {
          font-size: 16px;
          color: #666;
          margin: 15px 0 0 0;
          font-weight: 500;
        }
        
        .error-state {
          text-align: center;
          padding: 40px 20px;
        }
        
        .error-icon {
          font-size: 48px;
          color: #dc3545;
          margin-bottom: 20px;
        }
        
        .error-title {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }
        
        .error-message {
          font-size: 14px;
          color: #666;
          margin-bottom: 25px;
          line-height: 1.5;
        }
        
        .btn-retry {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .btn-retry:hover {
          background: #0056b3;
        }
        
        .nav-sw {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          background: #fff;
          border: 2px solid #e5e5e5;
          transition: all 0.3s ease;
        }
        
        .nav-sw:hover {
          background: #000;
          border-color: #000;
          color: #fff;
        }
        
        .snbn-toppicks-empty {
          right: -23px;
        }
        
        .snbp-toppicks-empty {
          left: -23px;
        }
        
        @media (max-width: 1200px) {
          .snbn-toppicks-empty {
            right: 10px;
          }
          
          .snbp-toppicks-empty {
            left: 10px;
          }
        }
        
        @media (max-width: 768px) {
          .modal-products-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .top-picks-empty-cart.modal-version {
            padding: 15px;
          }
          
          .top-picks-empty-cart.page-version {
            padding: 40px 0;
            margin: 15px 0;
          }
          
          .top-picks-title {
            font-size: 24px;
          }
          
          .modal-version .top-picks-title {
            font-size: 18px;
          }
          
          .top-picks-header {
            margin-bottom: 30px;
            padding: 0 15px;
          }
          
          .page-products-swiper {
            padding: 0 15px;
          }
          
          .nav-sw {
            display: none;
          }
        }
        
        @media (max-width: 480px) {
          .top-picks-title {
            font-size: 20px;
          }
          
          .modal-version .top-picks-title {
            font-size: 16px;
          }
          
          .top-picks-subtitle {
            font-size: 14px;
          }
          
          .modal-version .top-picks-subtitle {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}