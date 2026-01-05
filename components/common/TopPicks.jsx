"use client";
import React, { useEffect, useState } from "react";
import ProductCard1 from "@/components/productCards/ProductCard1";
import { fetchTopPicksItems } from "@/utils/productVariantUtils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

export default function TopPicks({ initialProducts = [], initialMeta = null }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(!initialProducts.length);
  const [meta, setMeta] = useState(initialMeta);

  useEffect(() => {
    if (!initialProducts.length) {
      const loadData = async () => {
        try {
          setLoading(true);
          const items = await fetchTopPicksItems();
          setProducts(items || []);
        } catch (err) {
          console.error("Failed to load top picks", err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [initialProducts]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="top-picks-section">
      <div className="container">
        <div className="section-header text-center wow fadeInUp">
          <h2 className="section-title">
            {meta?.heading || "CURATED FOR YOU"}
          </h2>
          <p className="section-subtitle">
            {meta?.subheading || "Discover our most loved styles this season"}
          </p>
          <div className="title-underline"></div>
        </div>

        <div className="products-carousel wow fadeInUp" data-wow-delay="0.2s">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            centeredSlides={false}
            loop={products.length > 4}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".tp-prev",
              nextEl: ".tp-next",
            }}
            pagination={{
              clickable: true,
              el: ".tp-pagination",
              dynamicBullets: true,
            }}
            breakpoints={{
              576: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 25,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 30,
              }
            }}
            className="top-picks-swiper"
          >
            {products.map((product, i) => (
              <SwiperSlide key={product.id || i}>
                <div className="product-card-wrapper">
                  <ProductCard1 product={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows */}
          <button className="tp-nav-btn tp-prev" aria-label="Previous slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="tp-nav-btn tp-next" aria-label="Next slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="tp-pagination"></div>
        </div>
      </div>

      <style jsx>{`
        .top-picks-section {
          padding: 80px 0;
          background: linear-gradient(to bottom, #ffffff, #fcfcfc);
          position: relative;
          overflow: hidden;
        }

        .section-header {
          margin-bottom: 50px;
          position: relative;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #666;
          font-weight: 400;
          margin-bottom: 20px;
        }

        .title-underline {
          width: 60px;
          height: 3px;
          background: #000;
          margin: 0 auto;
          position: relative;
        }
        
        .title-underline::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: #000;
          opacity: 0.3;
          top: 4px;
          left: 4px;
        }

        .products-carousel {
          position: relative;
          padding: 0 20px;
        }

        .product-card-wrapper {
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          height: 100%;
        }

        .product-card-wrapper:hover {
          transform: translateY(-8px);
        }

        /* Custom Navigation Buttons */
        .tp-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          color: #1a1a1a;
        }

        .tp-nav-btn:hover {
          background: #000;
          color: #fff;
          border-color: #000;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          transform: translateY(-50%) scale(1.1);
        }

        .tp-prev {
          left: 0;
        }

        .tp-next {
          right: 0;
        }

        .tp-pagination {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .top-picks-section {
            padding: 50px 0;
          }

          .section-title {
            font-size: 1.8rem;
          }

          .section-subtitle {
            font-size: 0.95rem;
          }

          .tp-nav-btn {
            width: 40px;
            height: 40px;
            display: none; /* Hide arrows on mobile for cleaner look */
          }
          
          .products-carousel {
            padding: 0;
          }
        }
      `}</style>
    </section>
  );
}
