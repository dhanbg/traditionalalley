"use client";
import React, { useEffect, useState } from "react";
import ProductCard1 from "@/components/productCards/ProductCard1";
import { fetchTopPicksItems } from "@/utils/productVariantUtils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

export default function TopPicks({ initialProducts = [], initialMeta = null }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(!initialProducts.length);
  const [meta, setMeta] = useState(initialMeta);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Distribute products into rows based on total count
  const getProductRows = () => {
    const count = products.length;

    if (count >= 9) {
      // 3 rows of 3 products each
      return [
        products.slice(0, 3),
        products.slice(3, 6),
        products.slice(6, 9)
      ];
    } else if (count === 8) {
      // 2 rows of 4 products each
      return [
        products.slice(0, 4),
        products.slice(4, 8)
      ];
    } else if (count === 7) {
      // Row 1: 3 products, Row 2: 4 products
      return [
        products.slice(0, 3),
        products.slice(3, 7)
      ];
    } else if (count === 6) {
      // 3 rows of 2 products each
      return [
        products.slice(0, 2),
        products.slice(2, 4),
        products.slice(4, 6)
      ];
    } else if (count >= 4) {
      // 2 rows
      const half = Math.ceil(count / 2);
      return [
        products.slice(0, half),
        products.slice(half)
      ];
    } else {
      // Single row for 3 or fewer products
      return [products];
    }
  };

  if (!loading && products.length === 0) return null;

  const productRows = isMobile ? getProductRows() : [];

  return (
    <section className="top-picks-section">
      <div className="section-header text-center wow fadeInUp">
        <h2 className="section-title">
          {meta?.heading || "CURATED FOR YOU"}
        </h2>
        <p className="section-subtitle">
          {meta?.subheading || "Discover our most loved styles this season"}
        </p>
        <div className="title-underline"></div>
      </div>

      {isMobile ? (
        <div className="scroll-rows-container">
          {productRows.map((row, rowIndex) => {
            const direction = rowIndex % 2 === 0 ? 'ltr' : 'rtl';
            // Duplicate products to create infinite scroll effect
            const duplicatedRow = [...row, ...row, ...row];

            return (
              <div key={rowIndex} className={`scroll-row scroll-${direction}`}>
                <div className="scroll-track">
                  {duplicatedRow.map((product, i) => (
                    <div key={`${product.id}-${i}`} className="scroll-item">
                      <ProductCard1 product={product} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="container">
          <div className="products-carousel wow fadeInUp" data-wow-delay="0.2s">
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1.2}
              centeredSlides={false}
              loop={products.length > 4}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
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

            <div className="tp-pagination"></div>
          </div>
        </div>
      )}

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
          padding: 0 20px;
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

        .tp-pagination {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        /* Infinite Scroll Rows Layout - Full Width */
        .scroll-rows-container {
          display: flex;
          flex-direction: column;
          gap: 0;
          width: 100%;
          overflow: hidden;
          max-width: 100vw;
          margin: 0;
          padding: 0;
        }

        .scroll-row {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .scroll-track {
          display: flex;
          gap: 0;
          width: max-content;
        }

        /* Left to Right Animation */
        .scroll-ltr .scroll-track {
          animation: scrollLTR 20s linear infinite;
        }

        /* Right to Left Animation */
        .scroll-rtl .scroll-track {
          animation: scrollRTL 20s linear infinite;
        }

        @keyframes scrollLTR {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes scrollRTL {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .scroll-item {
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          background: #000;
        }

        /* Force 2:3 aspect ratio for images */
        .scroll-item :global(.card-img-wrapper),
        .scroll-item :global(.product-img),
        .scroll-item :global(.card-product-wrapper) {
          aspect-ratio: 2/3;
          width: 120px;
          height: auto;
          border-radius: 0 !important;
        }

        .scroll-item :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0 !important;
        }

        /* Minimal card styling */
        .scroll-item :global(.card-product) {
          border-radius: 0 !important;
        }
        
        .scroll-item :global(.card) {
          border: none !important;
          box-shadow: none !important;
          margin: 0 !important;
        }

        .scroll-item :global(.product-info),
        .scroll-item :global(.card-product-info) {
          display: none !important;
        }

        /* Keep rounded corners on price badges */
        .scroll-item :global(.price-overlay-modern),
        .scroll-item :global(.price-overlay-modern *),
        .scroll-item :global(.on-sale-item),
        .scroll-item :global(.price-badge) {
          border-radius: 12px !important;
        }
        
        /* Smaller price size for scroll items */
        .scroll-item :global(.price-overlay-modern) {
          padding: 2px 5px !important;
          font-size: 0.5rem !important;
        }
        
        .scroll-item :global(.price-overlay-modern .price-main) {
          gap: 2px !important;
        }
        
        .scroll-item :global(.price-overlay-modern .current-price),
        .scroll-item :global(.price-overlay-modern .price-main) {
          font-size: 0.5rem !important;
        }
        
        .scroll-item :global(.price-overlay-modern .old-price) {
          font-size: 0.45rem !important;
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
          
          .products-carousel {
            padding: 0;
          }
        }
      `}</style>
    </section>
  );
}
