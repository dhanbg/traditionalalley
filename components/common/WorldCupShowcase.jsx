"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProductsWithVariantsByCollection } from "@/utils/productVariantUtils";
import { useContextElement } from "@/context/Context";
import PriceDisplay from "@/components/common/PriceDisplay";
import { useQuery } from "@tanstack/react-query";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import { ShoppingBag, Sparkles, Check } from "lucide-react";

const WORLDCUP_PRODUCTS = [
  {
    id: "wc-argentina",
    country: "Argentina",
    title: "Albiceleste Golden Edition Corset",
    description: "Luxurious light blue and white silk with elegant golden laces and championship embroidery.",
    price: 79.00,
    oldPrice: 99.00,
    image: "/images/worldcup/argentina.png",
    accentColor: "#75AADB",
    badgeBg: "linear-gradient(135deg, #75AADB 0%, #FFFFFF 50%, #75AADB 100%)",
    badgeColor: "#000000",
    tag: "Championship Edition",
    link: "/product-detail/h2mjo6wvr5al30akjd2ckq0g"
  },
  {
    id: "wc-brasil",
    country: "Brasil",
    title: "Samba Gold Silk Corset",
    description: "Vibrant yellow satin highlighted by deep forest green piping and intricate gold detailing.",
    price: 79.00,
    oldPrice: 99.00,
    image: "/images/worldcup/brasil.png",
    accentColor: "#009B3A",
    badgeBg: "linear-gradient(135deg, #FFDF00 0%, #009B3A 100%)",
    badgeColor: "#FFFFFF",
    tag: "Samba Spirit",
    link: "/product-detail/h2mjo6wvr5al30akjd2ckq0g?variant=pzquel57xs9fwyh2em5mwdp1"
  },
  {
    id: "wc-england",
    country: "England",
    title: "Three Lions Crimson Rose Corset",
    description: "Classic pristine white satin featuring hand-crafted crimson rose embroidery and refined silver accents.",
    price: 79.00,
    oldPrice: 99.00,
    image: "/images/worldcup/england.png",
    accentColor: "#E60000",
    badgeBg: "linear-gradient(135deg, #FFFFFF 0%, #E60000 100%)",
    badgeColor: "#FFFFFF",
    tag: "Heritage Edition",
    link: "/product-detail/h2mjo6wvr5al30akjd2ckq0g?variant=q5qq75tmiivn5eev43u2r5z8"
  },
  {
    id: "wc-france",
    country: "France",
    title: "Les Bleus Royal Velvet Corset",
    description: "Deep royal blue velvet with classic white-red tricolor trims and elegant gold crest embroidery.",
    price: 79.00,
    oldPrice: 99.00,
    image: "/images/worldcup/france.png",
    accentColor: "#002395",
    badgeBg: "linear-gradient(135deg, #002395 0%, #FFFFFF 50%, #ED2939 100%)",
    badgeColor: "#000000",
    tag: "Royale Fit",
    link: "/product-detail/h2mjo6wvr5al30akjd2ckq0g?variant=jthas50lwnxmnpf6c5bgamst"
  },
  {
    id: "wc-portugal",
    country: "Portugal",
    title: "Navigator Crimson Lace Corset",
    description: "Rich crimson red silk accented by deep forest green borders and intricate golden lace filigree.",
    price: 79.00,
    oldPrice: 99.00,
    image: "/images/worldcup/portugal.png",
    accentColor: "#E4262B",
    badgeBg: "linear-gradient(135deg, #127436 0%, #E4262B 100%)",
    badgeColor: "#FFFFFF",
    tag: "Luxe Navigator",
    link: "/product-detail/h2mjo6wvr5al30akjd2ckq0g?variant=jo6m01g5toy08wtb5kdar1ao"
  },
  {
    id: "wc-spain",
    country: "Spain",
    title: "La Furia Roja Scarlet Corset",
    description: "Vibrant scarlet red silk accented with golden yellow trim and traditional Spanish-inspired embroidery.",
    price: 79.00,
    oldPrice: 99.00,
    image: "/images/worldcup/spain.png",
    accentColor: "#C10E1F",
    badgeBg: "linear-gradient(135deg, #C10E1F 0%, #F1BF00 100%)",
    badgeColor: "#FFFFFF",
    tag: "Scarlet Passion",
    link: "/product-detail/h2mjo6wvr5al30akjd2ckq0g?variant=ellw39kn89wtyjqtytep638k"
  }
];

export default function WorldCupShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [addedItems, setAddedItems] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const { addProductToCart } = useContextElement();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['worldcupShowcase'],
    queryFn: async () => {
      const backendItems = await fetchProductsWithVariantsByCollection("worldcup");
      if (!backendItems || backendItems.length === 0) return WORLDCUP_PRODUCTS;
      
      const mapped = WORLDCUP_PRODUCTS.map(staticProd => {
        const matchingItem = backendItems.find(item => {
          const itemTitle = (item.title || "").toLowerCase();
          const country = staticProd.country.toLowerCase();
          if (country === 'brasil') {
            return itemTitle.includes('brasil') || itemTitle.includes('brazil');
          }
          return itemTitle.includes(country);
        });

        if (matchingItem) {
          const mainProductId = matchingItem.isMainProduct 
            ? matchingItem.documentId 
            : matchingItem.parentProductId;
          
          const link = matchingItem.isMainProduct 
            ? `/product-detail/${mainProductId}` 
            : `/product-detail/${mainProductId}?variant=${matchingItem.documentId}`;

          const priceVal = typeof matchingItem.price === 'string'
            ? parseFloat(matchingItem.price)
            : matchingItem.price;

          const oldPriceVal = matchingItem.oldPrice
            ? (typeof matchingItem.oldPrice === 'string'
              ? parseFloat(matchingItem.oldPrice)
              : matchingItem.oldPrice)
            : null;

          return {
            ...staticProd,
            title: matchingItem.title,
            price: priceVal,
            oldPrice: oldPriceVal,
            image: matchingItem.imgSrc || staticProd.image,
            imgHover: matchingItem.imgHover || matchingItem.imgSrc || staticProd.image,
            link: link,
            dbItem: matchingItem
          };
        }
        return staticProd;
      });

      return mapped;
    },
    staleTime: 5 * 60 * 1000,
  });

  const displayProducts = (products && products.length > 0) ? products : WORLDCUP_PRODUCTS;
  const activeProduct = displayProducts[activeIndex % displayProducts.length] || displayProducts[0];

  const handleAddToCart = (e, prod) => {
    e.preventDefault();
    e.stopPropagation();

    const matchingItem = prod.dbItem;
    if (!matchingItem) {
      setAddedItems(prev => ({ ...prev, [prod.id]: true }));
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [prod.id]: false }));
      }, 1800);
      return;
    }

    let sizeStocks = matchingItem.size_stocks;
    if (typeof sizeStocks === 'string') {
      try {
        sizeStocks = JSON.parse(sizeStocks);
      } catch (err) {}
    }

    let selectedSize = 'M';
    if (sizeStocks && typeof sizeStocks === 'object') {
      const availableSizes = Object.entries(sizeStocks)
        .filter(([size, qty]) => Number(qty) > 0)
        .map(([size]) => size);
      
      if (availableSizes.length > 0) {
        selectedSize = availableSizes.includes('M') ? 'M' : availableSizes[0];
      }
    }

    const isMainProduct = matchingItem.isMainProduct;
    const baseId = isMainProduct ? matchingItem.documentId : matchingItem.product?.documentId;
    
    let uniqueCartId;
    let variantInfo = null;

    if (!isMainProduct) {
      const variantId = matchingItem.documentId;
      uniqueCartId = `${baseId}-variant-${variantId}-size-${selectedSize}`;
      variantInfo = {
        id: matchingItem.id,
        documentId: matchingItem.documentId,
        variantId: matchingItem.documentId,
        color: matchingItem.colors?.[0] || null,
        imgSrc: matchingItem.imgSrc,
        imgHover: matchingItem.imgHover,
        title: matchingItem.title,
        price: matchingItem.price,
        oldPrice: matchingItem.oldPrice,
        sizes: matchingItem.sizes || [],
        gallery: matchingItem.gallery || []
      };
    } else {
      uniqueCartId = `${baseId}-size-${selectedSize}`;
    }

    const cartProductData = {
      ...matchingItem,
      id: baseId,
      imgSrc: matchingItem.imgSrc,
      imgHover: matchingItem.imgHover,
      gallery: matchingItem.gallery,
      sizes: matchingItem.sizes,
      size_stocks: matchingItem.size_stocks,
      title: matchingItem.title,
      price: matchingItem.price,
      oldPrice: matchingItem.oldPrice,
      weight: matchingItem.weight || "1"
    };

    addProductToCart(uniqueCartId, 1, true, variantInfo, selectedSize, cartProductData);

    setAddedItems(prev => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [prod.id]: false }));
    }, 1800);
  };

  const jumpToSlide = (idx) => {
    if (swiperInstance) {
      swiperInstance.slideToLoop(idx);
    }
  };

  return (
    <section id="worldcup-showcase-section" className="worldcup-modern-section">
      {/* Ambient dynamic background glow driven by active product color */}
      <div 
        className="ambient-glow"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${activeProduct?.accentColor || '#75AADB'}28 0%, rgba(255,255,255,0) 75%)`
        }}
      />

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="event-badge-wrap">
            <span className="event-badge">
              <Sparkles size={14} className="sparkle-icon" />
              WORLD CUP COUTURE
            </span>
          </div>
          <h2 className="section-title">THE CHAMPIONSHIP CORSETS</h2>
          <p className="section-subtitle">
            Celebrate the passion of the game with our limited-edition, country-themed luxury corsets.
          </p>
          <div className="title-glow-line" style={{ background: activeProduct?.accentColor || '#b8860b' }} />
        </div>

        {/* Interactive Country Selector Bar */}
        <div className="country-nav-bar">
          {displayProducts.map((prod, idx) => {
            const isActive = activeIndex % displayProducts.length === idx;
            return (
              <button
                key={prod.id}
                onClick={() => jumpToSlide(idx)}
                className={`country-tab-btn ${isActive ? 'active' : ''}`}
                style={{
                  '--accent': prod.accentColor,
                  '--badge-bg': prod.badgeBg,
                  '--badge-color': prod.badgeColor
                }}
              >
                <span className="country-dot" />
                <span className="country-name">{prod.country}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel Showcase Container */}
        <div className="carousel-stage-wrapper">
          {loading ? (
            <div className="skeleton-carousel-loader">
              <div className="skeleton-card shimmer" />
              <div className="skeleton-card shimmer main" />
              <div className="skeleton-card shimmer" />
            </div>
          ) : (
            <Swiper
              spaceBetween={isMobile ? 12 : 20}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              effect={"coverflow"}
              grabCursor={true}
              centeredSlides={true}
              loop={displayProducts.length > 2}
              slidesPerView={"auto"}
              coverflowEffect={{
                rotate: isMobile ? 6 : 12,
                stretch: 0,
                depth: isMobile ? 50 : 140,
                modifier: isMobile ? 1.1 : 1.4,
                slideShadows: false,
              }}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
              className="wc-swiper-container"
            >
              {displayProducts.map((prod, idx) => {
                const isCurrent = activeIndex % displayProducts.length === idx;
                const isAdded = addedItems[prod.id];

                return (
                  <SwiperSlide key={prod.id} className="wc-swiper-slide">
                    <div className="wc-slide-card-group">
                      <div 
                        className={`wc-card-inner ${isCurrent ? 'is-active-card' : ''}`}
                        style={{
                          '--accent': prod.accentColor,
                          '--badge-bg': prod.badgeBg,
                          '--badge-color': prod.badgeColor
                        }}
                      >
                        {/* Product Image Stage */}
                        <div className="card-media-stage">
                          <Link href={prod.link} className="image-link-wrapper">
                            <Image
                              src={prod.image}
                              alt={prod.title}
                              width={500}
                              height={500}
                              className="slide-img main-slide-img"
                              priority={idx < 3}
                            />
                            {prod.imgHover && (
                              <Image
                                src={prod.imgHover}
                                alt={prod.title}
                                width={500}
                                height={500}
                                className="slide-img hover-slide-img"
                              />
                            )}
                          </Link>
                        </div>

                        {/* Product Info */}
                        <div className="card-details">
                          <Link href={prod.link} className="title-link">
                            <h3 className="card-product-title">{prod.title}</h3>
                          </Link>
                          
                          <div className="price-status-row">
                            <div className="price-box">
                              <PriceDisplay price={prod.price} oldPrice={prod.oldPrice} size={isMobile ? "small" : "medium"} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Add Button Outside Box */}
                      <div className="outside-action-bar">
                        <button
                          onClick={(e) => handleAddToCart(e, prod)}
                          className={`modern-cart-btn-outside ${isAdded ? 'added' : ''}`}
                          style={{ '--accent': prod.accentColor }}
                        >
                          {isAdded ? (
                            <>
                              <Check size={isMobile ? 13 : 16} className="btn-icon" />
                              <span>{isMobile ? "Added" : "Added to Bag"}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={isMobile ? 13 : 16} className="btn-icon" />
                              <span>Quick Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </div>

      <style jsx>{`
        .worldcup-modern-section {
          position: relative;
          padding: 90px 0 110px 0;
          background: linear-gradient(180deg, #f7f9fc 0%, #ffffff 50%, #f4f7fa 100%);
          overflow: hidden;
          color: #1a1d26;
        }

        :global(html.dark) .worldcup-modern-section {
          background: linear-gradient(180deg, #0d0f14 0%, #151821 50%, #0b0c10 100%);
          color: #f0f3f8;
        }

        .ambient-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          transition: background 0.8s ease-in-out;
          z-index: 1;
        }

        .section-header {
          position: relative;
          z-index: 10;
          margin-bottom: 35px;
        }

        .event-badge-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 14px;
        }

        .event-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #d4af37;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.35);
          padding: 7px 18px;
          border-radius: 50px;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.1);
        }

        .sparkle-icon {
          color: #d4af37;
          animation: spinSparkle 4s linear infinite;
        }

        @keyframes spinSparkle {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }

        .section-title {
          font-size: 2.8rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #111827 0%, #374151 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        :global(html.dark) .section-title {
          background: linear-gradient(135deg, #ffffff 0%, #9ca3af 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #6b7280;
          max-width: 620px;
          margin: 0 auto 20px;
          line-height: 1.6;
        }

        :global(html.dark) .section-subtitle {
          color: #9ca3af;
        }

        .title-glow-line {
          width: 90px;
          height: 4px;
          margin: 0 auto;
          border-radius: 4px;
          transition: background 0.6s ease;
          box-shadow: 0 0 12px currentColor;
        }

        /* ───── Country Quick Navigation Bar ───── */
        .country-nav-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 40px;
          position: relative;
          z-index: 10;
        }

        .country-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 50px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.85rem;
          font-weight: 700;
          color: #4b5563;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        :global(html.dark) .country-tab-btn {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: #d1d5db;
        }

        .country-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          transition: transform 0.3s ease;
        }

        .country-tab-btn:hover {
          transform: translateY(-2px);
          border-color: var(--accent);
          color: #111827;
        }

        :global(html.dark) .country-tab-btn:hover {
          color: #ffffff;
        }

        .country-tab-btn.active {
          background: var(--badge-bg) !important;
          color: var(--badge-color) !important;
          border-color: transparent !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
          transform: translateY(-2px) scale(1.05);
        }

        .country-tab-btn.active .country-dot {
          background: var(--badge-color);
          transform: scale(1.3);
        }

        /* ───── Carousel Stage ───── */
        .carousel-stage-wrapper {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* ───── Swiper Slides & Cards ───── */
        :global(.wc-swiper-container) {
          padding: 30px 10px 60px 10px !important;
          overflow: visible !important;
        }

        :global(.wc-swiper-slide) {
          width: 360px !important;
          height: auto !important;
          transition: transform 0.4s ease;
        }

        .wc-slide-card-group {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }

        .wc-card-inner {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 20px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.05);
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(16px);
        }

        :global(html.dark) .wc-card-inner {
          background: rgba(22, 26, 35, 0.9);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
        }

        .wc-card-inner.is-active-card {
          border-color: var(--accent);
          box-shadow: 0 20px 45px var(--accent) 30, 0 10px 25px rgba(0,0,0,0.1);
        }

        :global(html.dark) .wc-card-inner.is-active-card {
          box-shadow: 0 20px 50px var(--accent) 40, 0 10px 30px rgba(0,0,0,0.6);
        }

        /* Image Stage */
        .card-media-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 4/5;
          border-radius: 16px;
          overflow: hidden;
          background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 0%, transparent 70%);
          margin-bottom: 18px;
        }

        .image-link-wrapper {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
        }

        :global(.slide-img) {
          object-fit: contain !important;
          width: 100% !important;
          height: 100% !important;
          position: absolute;
          top: 0;
          left: 0;
          transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.4s ease;
        }

        :global(.main-slide-img) {
          z-index: 1;
          opacity: 1;
        }

        :global(.hover-slide-img) {
          z-index: 2;
          opacity: 0;
        }

        .wc-card-inner:hover :global(.main-slide-img) {
          opacity: 0;
          transform: scale(1.05);
        }

        .wc-card-inner:hover :global(.hover-slide-img) {
          opacity: 1;
          transform: scale(1.05);
        }

        /* Card Details */
        .card-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .title-link {
          text-decoration: none;
        }

        .card-product-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #111827;
          line-height: 1.35;
          margin: 0;
          transition: color 0.3s ease;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.7em;
        }

        :global(html.dark) .card-product-title {
          color: #f3f4f6;
        }

        .wc-card-inner:hover .card-product-title {
          color: var(--accent);
        }

        .price-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ───── Quick Add Outside Box ───── */
        .outside-action-bar {
          width: 100%;
          padding: 0 2px;
        }

        .modern-cart-btn-outside {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          border-radius: 50px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: #111827;
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 750;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
        }

        :global(html.dark) .modern-cart-btn-outside {
          background: #ffffff;
          color: #111827;
          border-color: rgba(255, 255, 255, 0.15);
        }

        .modern-cart-btn-outside:hover {
          background: var(--accent);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px var(--accent) 50;
        }

        .modern-cart-btn-outside.added {
          background: #10b981 !important;
          color: #ffffff !important;
        }

        /* Skeleton Loader */
        .skeleton-carousel-loader {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          padding: 40px 0;
        }

        .skeleton-card {
          width: 300px;
          height: 480px;
          border-radius: 24px;
          background: #e5e7eb;
          opacity: 0.5;
        }

        .skeleton-card.main {
          width: 360px;
          height: 520px;
          opacity: 1;
        }

        :global(html.dark) .skeleton-card {
          background: #1f2937;
        }

        .shimmer {
          animation: pulseSkeleton 1.5s infinite alternate;
        }

        @keyframes pulseSkeleton {
          0% { opacity: 0.4; }
          100% { opacity: 0.8; }
        }

        /* ───── Mobile Responsiveness ───── */
        @media (max-width: 640px) {
          .section-title {
            font-size: 2.0rem;
          }
          .worldcup-modern-section {
            padding: 55px 0 65px 0;
          }
          .country-nav-bar {
            gap: 8px;
            margin-bottom: 28px;
          }
          .country-tab-btn {
            padding: 6px 14px;
            font-size: 0.78rem;
          }
          .carousel-stage-wrapper {
            padding: 0 6px;
          }

          :global(.wc-swiper-container) {
            padding: 20px 6px 40px 6px !important;
          }

          :global(.wc-swiper-slide) {
            width: 155px !important;
          }

          .wc-slide-card-group {
            gap: 8px;
          }

          .wc-card-inner {
            padding: 10px 8px 12px 8px;
            border-radius: 16px;
            border-width: 1px;
          }

          .card-media-stage {
            aspect-ratio: 4/5;
            border-radius: 10px;
            margin-bottom: 8px;
          }

          .card-details {
            gap: 4px;
          }

          .card-product-title {
            font-size: 0.78rem;
            line-height: 1.25;
            height: 2.5em;
            margin: 0;
          }

          .price-status-row {
            margin-bottom: 2px;
          }

          .modern-cart-btn-outside {
            padding: 9px 4px;
            font-size: 0.72rem;
            gap: 4px;
            border-radius: 25px;
          }
        }
      `}</style>
    </section>
  );
}
