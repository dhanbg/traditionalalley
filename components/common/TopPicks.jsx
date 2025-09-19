"use client";
import ProductCard1 from "@/components/productCards/ProductCard1";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { fetchTopPicksItems } from "@/utils/productVariantUtils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

const DEFAULT_IMAGE = '/logo.png';

export default function TopPicks({ parentClass = "flat-spacing-3 pt-5 pb-2" }) {
  const [topPicksData, setTopPicksData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // We're now using fetchProductsWithVariants which handles all the transformation

  // Fetch top picks data from the backend
  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        setLoading(true);
        
        // Use the new function that handles both products and variants
        const topPicksItems = await fetchTopPicksItems();
        
        if (topPicksItems && topPicksItems.length > 0) {
          setProducts(topPicksItems);
          setError(null);
        } else {
          setError("No active top picks found");
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
  }, []);

  return (
    <section className={`flat-spacing ${parentClass}`}>
      <div className="container">
        <div className="heading-section text-center wow fadeInUp" data-wow-delay="0s">
          <h3 className="heading">
            {topPicksData?.heading || "Top Picks"}
          </h3>
          {topPicksData?.subheading && (
            <p className="sub-title wow fadeInUp" data-wow-delay="0.1s">
              {topPicksData.subheading}
            </p>
          )}
        </div>
        
        <div className="flat-animate-tab wow fadeInUp" data-wow-delay="0.2s" style={{ overflow: "visible" }}>
          <div className="tab-content">
            <div className="tab-pane active show" role="tabpanel">
              {loading ? (
                <div className="text-center py-5">
                  <div className="tf-loading-spinner">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading top picks...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <p className="error-message">{error}</p>
                    <button 
                      className="btn-retry" 
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flat-collection-circle wow fadeInUp" data-wow-delay="0.3s">
                  <div dir="ltr" className="swiper tf-sw-collection">
                    <Swiper
                      slidesPerView={4} // For default screens (large screens)
                      spaceBetween={15} // Default space between slides
                      breakpoints={{
                        1200: {
                          slidesPerView: 4, // For large screens
                          spaceBetween: 20, // Larger space on larger screens
                        },
                        992: {
                          slidesPerView: 3, // For medium (tablet) screens
                          spaceBetween: 20,
                        },
                        768: {
                          slidesPerView: 2, // For mobile screens
                          spaceBetween: 15,
                        },
                        0: {
                          slidesPerView: 2, // For small mobile screens - show 2 cards per row
                          spaceBetween: 10,
                        },
                      }}
                      modules={[Pagination, Navigation]}
                      pagination={{
                        clickable: true,
                        el: ".spd-toppicks",
                      }}
                      navigation={{
                        prevEl: ".snbp-toppicks",
                        nextEl: ".snbn-toppicks",
                      }}
                    >
                      {products.length > 0 ? (
                        products.map((product, i) => (
                          <SwiperSlide key={i}>
                            <div className="product-item-wrapper wow fadeInUp" data-wow-delay={`${0.1 * (i + 1)}s`}>
                              <ProductCard1 product={product} />
                            </div>
                          </SwiperSlide>
                        ))
                      ) : (
                        <SwiperSlide>
                          <div className="col-12 text-center py-5">
                            <div className="empty-state">
                              <div className="empty-icon">🛍️</div>
                              <p className="empty-message">No top picks products found</p>
                            </div>
                          </div>
                        </SwiperSlide>
                      )}
                    </Swiper>
                    <div className="d-flex d-lg-none sw-pagination-collection sw-dots type-circle justify-content-center spd-toppicks" />
                  </div>
                  <div className="nav-prev-collection d-none d-lg-flex nav-sw style-line nav-sw-left snbp-toppicks">
                    <i className="icon icon-arrLeft" />
                  </div>
                  <div className="nav-next-collection d-none d-lg-flex nav-sw style-line nav-sw-right snbn-toppicks">
                    <i className="icon icon-arrRight" />
                  </div>
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .product-item-wrapper {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .product-item-wrapper:hover {
          transform: translateY(-5px);
        }
        .heading-section .heading {
          font-size: 2.5rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }
        .heading-section .sub-title {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .tf-loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 40px 20px;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #e43131;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .loading-text {
          color: #666;
          font-size: 14px;
          margin: 0;
        }
        .error-state {
          padding: 40px 20px;
        }
        .error-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .error-message {
          color: #dc3545;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .btn-retry {
          background: #e43131;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s ease;
        }
        .btn-retry:hover {
          background: #c82828;
        }
        .empty-state {
          padding: 60px 20px;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.5;
        }
        .empty-message {
          color: #666;
          font-size: 18px;
          margin: 0;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .heading-section .heading {
            font-size: 2rem;
          }
          .heading-section .sub-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}