"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "../common/Countdown";
import PriceDisplay from "../common/PriceDisplay";
import { useContextElement } from "@/context/Context";
import { useSession, signIn } from "next-auth/react";
import { getImageUrl } from "@/utils/imageUtils";

// Default placeholder image
const DEFAULT_IMAGE = '/logo.png';

function getStrapiSmallImage(imageObj) {
  if (!imageObj) return DEFAULT_IMAGE;
  
  // Handle string URLs directly
  if (typeof imageObj === 'string') {
    return getImageUrl(imageObj) || DEFAULT_IMAGE;
  }
  
  // Handle Strapi image objects with formats
  if (imageObj.formats && imageObj.formats.small && imageObj.formats.small.url) {
    return getImageUrl(imageObj.formats.small.url);
  }
  
  // Handle objects with direct url property
  if (imageObj.url) {
    return getImageUrl(imageObj.url);
  }
  
  // Handle Strapi data structure with data.attributes
  if (imageObj.data && imageObj.data.attributes && imageObj.data.attributes.url) {
    return getImageUrl(imageObj.data.attributes.url);
  }
  
  return DEFAULT_IMAGE;
}

export default function ProductCard1({ product, gridClass = "", index = 0 }) {
  // Ensure product has valid image properties
  const safeProduct = {
    ...product,
    imgSrc: getStrapiSmallImage(product.imgSrc) || DEFAULT_IMAGE,
    imgHover: getStrapiSmallImage(product.imgHover) || getStrapiSmallImage(product.imgSrc) || DEFAULT_IMAGE
  };
  
  // Double-check that imgSrc and imgHover are valid strings and not empty
  if (!safeProduct.imgSrc || safeProduct.imgSrc === "") {
    safeProduct.imgSrc = DEFAULT_IMAGE;
  }
  
  if (!safeProduct.imgHover || safeProduct.imgHover === "") {
    safeProduct.imgHover = safeProduct.imgSrc || DEFAULT_IMAGE;
  }
  
  // Calculate discount percentage
  const discountPercentage = safeProduct.price && safeProduct.oldPrice 
    ? ((safeProduct.oldPrice - safeProduct.price) / safeProduct.oldPrice * 100).toFixed(2) 
    : "25";
  
  // Check if colors are just string values and convert them
  if (safeProduct.colors && Array.isArray(safeProduct.colors) && 
      safeProduct.colors.length > 0 && typeof safeProduct.colors[0] === 'string') {
    // Convert string colors to objects with the necessary properties
    safeProduct.colors = safeProduct.colors.map(color => ({
      name: color,
      bgColor: `bg-${color.toLowerCase().replace(/\s+/g, '-')}`,
      imgSrc: safeProduct.imgSrc // Use the main product image
    }));
  }
  
  const [currentImage, setCurrentImage] = useState(safeProduct.imgSrc);
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);

  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
    setQuickViewItem,
    addProductToCart,
    isAddedToCartProducts,
    removeFromWishlist,
    user
  } = useContextElement();
  const { data: session } = useSession();

  useEffect(() => {
    // Ensure we never set an empty string as the currentImage
    setCurrentImage(safeProduct.imgSrc || DEFAULT_IMAGE);
  }, [safeProduct]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  const handleWishlistClick = (id) => {
    if (!user) {
      signIn();
    } else {
      addToWishlist(id);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      signIn();
    } else {
      addProductToCart(safeProduct.id);
    }
  };

  const handleCompareClick = (id) => {
    if (!user) {
      signIn();
    } else {
      addToCompareItem(id);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`card-product product-fade-in${inView ? ' in-view' : ''} wow fadeInUp ${gridClass} ${
        safeProduct.isOnSale ? "on-sale" : ""
      } ${safeProduct.sizes ? "card-product-size" : ""}`}
      style={{ animationDelay: `${index * 0.12 + 0.1}s` }}
    >
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${safeProduct.documentId || safeProduct.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            src={currentImage && currentImage !== "" ? currentImage : DEFAULT_IMAGE}
            alt={safeProduct.title || "Product"}
            width={600}
            height={800}
            priority={currentImage === "/images/products/womens/women-19.jpg"}
          />

          <Image
            className="lazyload img-hover"
            src={(safeProduct.imgHover && safeProduct.imgHover !== "") ? 
                 safeProduct.imgHover : 
                 (currentImage && currentImage !== "" ? currentImage : DEFAULT_IMAGE)}
            alt={safeProduct.title || "Product"}
            width={600}
            height={800}
          />
        </Link>
        {safeProduct.hotSale && (
          <div className="marquee-product bg-main">
            <div className="marquee-wrapper">
              <div className="initial-child-container">
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale {discountPercentage}% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale {discountPercentage}% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale {discountPercentage}% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale {discountPercentage}% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale {discountPercentage}% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
              </div>
            </div>
            <div className="marquee-wrapper">
              <div className="initial-child-container">
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale {discountPercentage}% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale {discountPercentage}% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale {discountPercentage}% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale {discountPercentage}% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale {discountPercentage}% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
              </div>
            </div>
          </div>
        )}
        {safeProduct.isOnSale && (
          <div className="on-sale-wrap">
            <span className="on-sale-item">-{safeProduct.price && safeProduct.oldPrice ? discountPercentage : safeProduct.salePercentage}%</span>
          </div>
        )}
        {safeProduct.sizes && (
          <div className="variant-wrap size-list">
            <ul className="variant-box">
              {safeProduct.sizes.map((size) => (
                <li key={size} className="size-item">
                  {size}
                </li>
              ))}
            </ul>
          </div>
        )}
        {safeProduct.countdown && (
          <div className="variant-wrap countdown-wrap">
            <div className="variant-box">
              <div
                className="js-countdown"
                data-timer={safeProduct.countdown}
                data-labels="D :,H :,M :,S"
              >
                <CountdownTimer />
              </div>
            </div>
          </div>
        )}
        {safeProduct.oldPrice ? (
          <div className="on-sale-wrap">
            <span className="on-sale-item">-{discountPercentage}%</span>
          </div>
        ) : (
          ""
        )}
        <div className="list-product-btn">
          <a
            href="#quick_add"
            data-bs-toggle="modal"
            className="box-icon bg_white quick-add tf-btn-loading"
            onClick={() => setQuickAddItem(safeProduct.id)}
          >
            <span className="icon icon-bag" />
            <span className="tooltip">Quick Add</span>
          </a>
          <a
            onClick={() => handleWishlistClick(safeProduct.id)}
            className="box-icon bg_white wishlist btn-icon-action"
          >
            <span
              className={`icon icon-heart ${
                isAddedtoWishlist(safeProduct.id) ? "added" : ""
              }`}
            />
            <span className="tooltip">
              {isAddedtoWishlist(safeProduct.id)
                ? "Already Wishlisted"
                : "Add to Wishlist"}
            </span>
          </a>
          <a
            href="#compare"
            data-bs-toggle="offcanvas"
            aria-controls="compare"
            onClick={() => handleCompareClick(safeProduct.id)}
            className="box-icon bg_white compare btn-icon-action"
          >
            <span
              className={`icon icon-gitDiff ${
                isAddedtoCompareItem(safeProduct.id) ? "added" : ""
              }`}
            />
            <span className="tooltip">
              {isAddedtoCompareItem(safeProduct.id)
                ? "Already Compared"
                : "Add to Compare"}
            </span>
          </a>
          <a
            href="#quick_view"
            onClick={() => setQuickViewItem(safeProduct)}
            data-bs-toggle="modal"
            className="box-icon bg_white quickview tf-btn-loading"
          >
            <span className="icon icon-view" />
            <span className="tooltip">Quick View</span>
          </a>
        </div>
        <div className="list-btn-main">
          <a
            className="btn-main-product"
            onClick={handleCartClick}
          >
            {user && isAddedToCartProducts(safeProduct.id)
              ? "Already Added"
              : "ADD TO CART"}
          </a>
        </div>
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${safeProduct.id}`} className="title link">
          {safeProduct.title}
        </Link>
        <PriceDisplay 
          price={safeProduct.price}
          oldPrice={safeProduct.oldPrice}
          className="product-card-price"
          size="normal"
          showConversion={false}
        />
        {safeProduct.colors && Array.isArray(safeProduct.colors) && safeProduct.colors.length > 0 && (
          <ul className="list-color-product">
            {safeProduct.colors.map((color, index) => {
              // Skip rendering if no image source or it's an empty string
              // Or if color isn't an object with imgSrc property
              if (!color || typeof color !== 'object' || !color.imgSrc || color.imgSrc === "") {
                return null;
              }
              
              return (
                <li
                  key={index}
                  className={`list-color-item color-swatch ${
                    currentImage == color.imgSrc ? "active" : ""
                  } ${color.bgColor == "bg-white" ? "line" : ""}`}
                  onMouseOver={() => setCurrentImage(color.imgSrc || DEFAULT_IMAGE)}
                >
                  <span className={`swatch-value ${color.bgColor}`} />
                  <Image
                    className="lazyload"
                    src={color.imgSrc && color.imgSrc !== "" ? color.imgSrc : DEFAULT_IMAGE}
                    alt={`${safeProduct.title} - ${color.name || "color variant"}`}
                    width={600}
                    height={800}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
