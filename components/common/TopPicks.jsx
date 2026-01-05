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
          
          .products-carousel {
            padding: 0;
          }
        }
      `}</style>
    </section>
  );
}
