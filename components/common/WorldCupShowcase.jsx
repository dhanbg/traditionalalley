"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProductsWithVariantsByCollection } from "@/utils/productVariantUtils";
import { useContextElement } from "@/context/Context";
import PriceDisplay from "@/components/common/PriceDisplay";

const WORLDCUP_PRODUCTS = [
  {
    id: "wc-argentina",
    country: "Argentina",
    title: "Albiceleste Golden Edition Corset",
    description: "Luxurious light blue and white silk with elegant golden laces and championship embroidery.",
    price: "$79.00",
    oldPrice: "$99.00",
    image: "/images/worldcup/argentina.png",
    accentColor: "#75AADB",
    badgeBg: "linear-gradient(135deg, #75AADB 0%, #FFFFFF 50%, #75AADB 100%)",
    badgeColor: "#003870",
    tag: "Championship Edition",
    link: "/product-detail/h2mjo6wvr5al30akjd2ckq0g"
  },
  {
    id: "wc-brasil",
    country: "Brasil",
    title: "Samba Gold Silk Corset",
    description: "Vibrant yellow satin highlighted by deep forest green piping and intricate gold detailing.",
    price: "$79.00",
    oldPrice: "$99.00",
    image: "/images/worldcup/brasil.png",
    accentColor: "#009B3A",
    badgeBg: "linear-gradient(135deg, #FFDF00 0%, #009B3A 100%)",
    badgeColor: "#000000",
    tag: "Samba Spirit",
    link: "/product-detail/h2mjo6wvr5al30akjd2ckq0g?variant=pzquel57xs9fwyh2em5mwdp1"
  },
  {
    id: "wc-england",
    country: "England",
    title: "Three Lions Crimson Rose Corset",
    description: "Classic pristine white satin featuring hand-crafted crimson rose embroidery and refined silver accents.",
    price: "$79.00",
    oldPrice: "$99.00",
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
    price: "$79.00",
    oldPrice: "$99.00",
    image: "/images/worldcup/france.png",
    accentColor: "#002395",
    badgeBg: "linear-gradient(135deg, #002395 0%, #FFFFFF 50%, #ED2939 100%)",
    badgeColor: "#FFFFFF",
    tag: "Royale Fit",
    link: "/product-detail/h2mjo6wvr5al30akjd2ckq0g?variant=jthas50lwnxmnpf6c5bgamst"
  },
  {
    id: "wc-portugal",
    country: "Portugal",
    title: "Navigator Crimson Lace Corset",
    description: "Rich crimson red silk accented by deep forest green borders and intricate golden lace filigree.",
    price: "$79.00",
    oldPrice: "$99.00",
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
    price: "$79.00",
    oldPrice: "$99.00",
    image: "/images/worldcup/spain.png",
    accentColor: "#C10E1F",
    badgeBg: "linear-gradient(135deg, #C10E1F 0%, #F1BF00 100%)",
    badgeColor: "#000000",
    tag: "Scarlet Passion",
    link: "/product-detail/h2mjo6wvr5al30akjd2ckq0g?variant=ellw39kn89wtyjqtytep638k"
  }
];

export default function WorldCupShowcase() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [products, setProducts] = useState(WORLDCUP_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { addProductToCart } = useContextElement();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const backendItems = await fetchProductsWithVariantsByCollection("worldcup");
        
        if (backendItems.length > 0) {
          const updatedProducts = WORLDCUP_PRODUCTS.map(staticProd => {
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

              // Map static item overlaying backend values
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
          setProducts(updatedProducts);
        }
      } catch (error) {
        console.error("Error loading World Cup backend data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBackendData();
  }, []);

  const handleAddToCart = (prod) => {
    const matchingItem = prod.dbItem;
    if (!matchingItem) return;

    let sizeStocks = matchingItem.size_stocks;
    if (typeof sizeStocks === 'string') {
      try {
        sizeStocks = JSON.parse(sizeStocks);
      } catch (e) {}
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

    console.log("Adding product to cart from showcase:", uniqueCartId, "size:", selectedSize);
    addProductToCart(uniqueCartId, 1, true, variantInfo, selectedSize, cartProductData);
  };

  return (
    <section id="worldcup-showcase-section" className="worldcup-section">
      <div className="container">
        <div className="section-header text-center wow fadeInUp">
          <span className="event-badge">WORLD CUP COUTURE</span>
          <h2 className="section-title">THE CHAMPIONSHIP CORSETS</h2>
          <p className="section-subtitle">
            Celebrate the passion of the game with our limited-edition, country-themed luxury corsets.
          </p>
          <div className="title-underline"></div>
        </div>

        {isMobile ? (
          <div className="mobile-grid-showcase">
            {products.map((prod, idx) => (
              <div
                key={prod.id}
                className="mobile-card"
                style={{
                  '--accent': prod.accentColor,
                  '--badge-bg': prod.badgeBg,
                  '--badge-color': prod.badgeColor,
                  animationDelay: `${idx * 0.08}s`
                }}
              >
                {/* Accent stripe */}
                <div className="mobile-card-accent" />

                {/* Image section */}
                <div className="mobile-card-img-wrap">
                  <Link href={prod.link} className="mobile-card-img-link">
                    <Image
                      src={prod.image}
                      alt={prod.title}
                      width={300}
                      height={375}
                      className="mobile-card-img"
                      priority={idx < 4}
                    />
                  </Link>
                  {/* Country tag on image */}
                  <span className="mobile-country-tag" style={{ background: prod.badgeBg, color: prod.badgeColor }}>
                    {prod.country}
                  </span>
                  {/* Quick-add overlay */}
                  <button
                    className="mobile-quick-add"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(prod);
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  </button>
                </div>

                {/* Info section */}
                <div className="mobile-card-body">
                  <Link href={prod.link} style={{ textDecoration: 'none' }}>
                    <h3 className="mobile-card-title">{prod.title}</h3>
                  </Link>
                  <div className="mobile-card-price">
                    <PriceDisplay
                      price={prod.price}
                      oldPrice={prod.oldPrice}
                      size="small"
                    />
                  </div>
                  <div className="mobile-card-footer">
                    <span className="mobile-pulse-dot" />
                    <Link href={prod.link} className="mobile-view-link">View →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {products.map((prod, idx) => {
              const isHovered = hoveredCard === prod.id;
              
              return (
                <div 
                  key={prod.id} 
                  className="product-card-wc wow fadeInUp" 
                  data-wow-delay={`${0.1 * (idx % 3)}s`}
                  onMouseEnter={() => setHoveredCard(prod.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    '--accent-color': prod.accentColor,
                    '--card-glow': isHovered ? `0 15px 35px ${prod.accentColor}25` : '0 10px 30px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div className="card-media-wrapper">
                    <div className="country-badge" style={{ background: prod.badgeBg, color: prod.badgeColor }}>
                      {prod.country}
                    </div>
                    <div className="image-container">
                      <Link href={prod.link}>
                        <Image 
                          src={prod.image} 
                          alt={prod.title}
                          width={400}
                          height={500}
                          className="product-image main-img"
                          priority={idx < 3}
                        />
                        {prod.imgHover && (
                          <Image 
                            src={prod.imgHover} 
                            alt={prod.title}
                            width={400}
                            height={500}
                            className="product-image hover-img"
                          />
                        )}
                      </Link>
                    </div>
                    <div className="glass-overlay">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(prod);
                        }} 
                        className="preorder-btn-overlay"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  <div className="card-info">
                    <Link href={prod.link} style={{ textDecoration: 'none' }}>
                      <h3 className="product-title">{prod.title}</h3>
                    </Link>
                    <div className="price-container-display">
                      <PriceDisplay
                        price={prod.price}
                        oldPrice={prod.oldPrice}
                        size="normal"
                      />
                    </div>
                    <div className="card-footer-action">
                      <div className="avail-status">
                        <span className="pulse-dot"></span>
                        Limited Release
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .worldcup-section {
          padding: 100px 0;
          background: linear-gradient(to bottom, #f4f6fa 0%, #ffffff 100%);
          color: #151821;
          position: relative;
          overflow: hidden;
        }

        .worldcup-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.3) 50%, transparent 100%);
        }

        .section-header {
          margin-bottom: 60px;
          position: relative;
          z-index: 10;
        }

        .event-badge {
          display: inline-block;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #b8860b;
          margin-bottom: 12px;
          border: 1px solid rgba(184, 134, 11, 0.3);
          padding: 6px 16px;
          border-radius: 50px;
          background: rgba(184, 134, 11, 0.05);
          animation: pulseGold 2s infinite alternate;
        }

        @keyframes pulseGold {
          0% { box-shadow: 0 0 5px rgba(184, 134, 11, 0.05); }
          100% { box-shadow: 0 0 15px rgba(184, 134, 11, 0.2); }
        }

        .section-title {
          font-size: 2.8rem;
          font-weight: 900;
          letter-spacing: -0.01em;
          margin-bottom: 15px;
          color: #151821;
          text-transform: uppercase;
        }

        .section-subtitle {
          font-size: 1.15rem;
          color: #6c7281;
          max-width: 600px;
          margin: 0 auto 25px;
          line-height: 1.6;
        }

        .title-underline {
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #b8860b, #e5c158);
          margin: 0 auto;
          border-radius: 2px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 35px;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }

        .product-card-wc {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: var(--card-glow);
        }

        .product-card-wc:hover {
          transform: translateY(-10px);
          border-color: rgba(212, 175, 55, 0.3);
        }

        .card-media-wrapper {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
          background: #f5f6fa;
        }

        .image-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        :global(.product-image) {
          object-fit: contain !important;
          width: 100%;
          height: 100%;
        }

        :global(.main-img) {
          position: relative;
          z-index: 1;
          transition: opacity 0.4s ease, transform 0.6s ease;
        }

        :global(.hover-img) {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain !important;
          opacity: 0;
          z-index: 2;
          transition: opacity 0.4s ease, transform 0.6s ease;
        }

        .product-card-wc:hover :global(.main-img) {
          opacity: 0;
          transform: scale(1.02);
        }

        .product-card-wc:hover :global(.hover-img) {
          opacity: 1;
          transform: scale(1.02);
        }

        .country-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          z-index: 5;
          font-size: 0.75rem;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 6px 14px;
          border-radius: 4px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
        }



        .glass-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 35%;
          background: linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 20px;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 4;
        }

        .product-card-wc:hover .glass-overlay {
          opacity: 1;
        }

        .preorder-btn-overlay {
          display: inline-block;
          text-decoration: none;
          background: #151821;
          color: #ffffff;
          border: none;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 10px 24px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .preorder-btn-overlay:hover {
          background: var(--accent-color);
          color: #ffffff;
          box-shadow: 0 4px 20px var(--accent-color);
        }

        .card-info {
          padding: 25px;
          background: #ffffff;
        }

        .product-title {
          font-size: 1.25rem;
          font-weight: 850;
          margin-bottom: 8px;
          color: #151821;
          line-height: 1.3;
          transition: color 0.3s ease;
        }

        .product-card-wc:hover .product-title {
          color: var(--accent-color);
        }

        .product-desc {
          font-size: 0.85rem;
          color: #6c7281;
          line-height: 1.5;
          margin-bottom: 20px;
          height: 45px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .price-container-display {
          margin-bottom: 20px;
        }

        .card-footer-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          padding-top: 15px;
        }

        .avail-status {
          font-size: 0.75rem;
          color: #6c7281;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: var(--accent-color);
          border-radius: 50%;
          display: inline-block;
          position: relative;
        }

        .pulse-dot::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: var(--accent-color);
          border-radius: 50%;
          top: 0;
          left: 0;
          animation: pulseWC 1.5s infinite;
        }

        @keyframes pulseWC {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .view-details-btn {
          display: inline-block;
          text-decoration: none;
          background: transparent;
          color: #151821;
          border: 1px solid rgba(0, 0, 0, 0.15);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 8px 18px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-details-btn:hover {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: #ffffff;
          font-weight: 800;
        }

        /* ───── Mobile 2-Column Grid Showcase ───── */
        .mobile-grid-showcase {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          padding: 0 12px;
        }

        @keyframes mobileCardIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mobile-card {
          position: relative;
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          animation: mobileCardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          display: flex;
          flex-direction: column;
        }

        /* Left accent stripe */
        .mobile-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--accent);
          border-radius: 14px 0 0 14px;
          z-index: 5;
        }

        /* Image wrapper */
        .mobile-card-img-wrap {
          display: block;
          position: relative;
          aspect-ratio: 4/5;
          background: #f5f6fa;
          overflow: hidden;
        }

        .mobile-card-img-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        :global(.mobile-card-img) {
          object-fit: contain !important;
          width: 100% !important;
          height: 100% !important;
          transition: transform 0.4s ease;
        }

        .mobile-card:active :global(.mobile-card-img) {
          transform: scale(1.03);
        }

        /* Country tag */
        .mobile-country-tag {
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 3px 8px;
          border-radius: 4px;
          z-index: 5;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
        }

        /* Quick-add bag button */
        .mobile-quick-add {
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 5;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: #151821;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-quick-add:active {
          transform: scale(0.9);
          background: var(--accent);
          color: #ffffff;
        }

        /* Card body */
        .mobile-card-body {
          padding: 10px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-grow: 1;
        }

        .mobile-card-title {
          font-size: 0.78rem;
          font-weight: 750;
          line-height: 1.3;
          color: #151821;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .mobile-card-price {
          margin-top: 2px;
        }

        .mobile-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 6px;
          border-top: 1px solid rgba(0,0,0,0.04);
        }

        .mobile-pulse-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          display: inline-block;
          position: relative;
        }

        .mobile-pulse-dot::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--accent);
          border-radius: 50%;
          top: 0;
          left: 0;
          animation: mPulse 1.8s infinite;
        }

        @keyframes mPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.8); opacity: 0; }
        }

        .mobile-view-link {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .mobile-view-link:active {
          opacity: 0.6;
        }

        /* ───── Dark Mode for Mobile Cards ───── */
        :global(html.dark) .mobile-card {
          background: #1a1d26;
          border-color: rgba(255,255,255,0.06);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        :global(html.dark) .mobile-card-img-wrap {
          background: #12141c;
        }

        :global(html.dark) .mobile-card-title {
          color: #f0f0f0;
        }

        :global(html.dark) .mobile-quick-add {
          background: #ffffff;
          color: #151821;
          border: none;
        }

        :global(html.dark) .mobile-card-footer {
          border-top-color: rgba(255,255,255,0.06);
        }

        /* Responsive Grid */
        @media (max-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
          }
          .section-title {
            font-size: 2.2rem;
          }
        }

        @media (max-width: 600px) {
          .products-grid {
            grid-template-columns: 1fr;
            gap: 25px;
            padding: 0 10px;
          }
          .section-title {
            font-size: 1.8rem;
          }
          .section-subtitle {
            font-size: 0.95rem;
          }
          .worldcup-section {
            padding: 60px 0;
            overflow: hidden;
          }
        }
      `}</style>
    </section>
  );
}
