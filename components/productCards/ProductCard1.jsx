"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "../common/Countdown";
import { useContextElement } from "@/context/Context";
import { useClerk } from "@clerk/nextjs";

// Default placeholder image
const DEFAULT_IMAGE = '/images/placeholder.jpg';

export default function ProductCard1({ product, gridClass = "" }) {
  // Ensure product has valid image properties
  const safeProduct = {
    ...product,
    imgSrc: product.imgSrc || DEFAULT_IMAGE,
    imgHover: product.imgHover || product.imgSrc || DEFAULT_IMAGE
  };
  
  // Double-check that imgSrc and imgHover are valid strings and not empty
  if (!safeProduct.imgSrc || safeProduct.imgSrc === "") {
    safeProduct.imgSrc = DEFAULT_IMAGE;
  }
  
  if (!safeProduct.imgHover || safeProduct.imgHover === "") {
    safeProduct.imgHover = safeProduct.imgSrc || DEFAULT_IMAGE;
  }
  
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
  const { openSignIn } = useClerk();

  useEffect(() => {
    // Ensure we never set an empty string as the currentImage
    setCurrentImage(safeProduct.imgSrc || DEFAULT_IMAGE);
  }, [safeProduct]);

  const handleWishlistClick = () => {
    if (!user) {
      openSignIn();
    } else {
      addToWishlist(safeProduct.id);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      openSignIn();
    } else {
      addProductToCart(safeProduct.id);
    }
  };

  return (
    <div
      className={`card-product wow fadeInUp ${gridClass} ${
        safeProduct.isOnSale ? "on-sale" : ""
      } ${safeProduct.sizes ? "card-product-size" : ""}`}
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
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
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
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
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
            <span className="on-sale-item">-{safeProduct.salePercentage}</span>
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
            <span className="on-sale-item">-25%</span>
          </div>
        ) : (
          ""
        )}
        <div className="list-product-btn">
          <a
            onClick={handleWishlistClick}
            className="box-icon wishlist btn-icon-action"
          >
            <span className="icon icon-heart" />
            <span className="tooltip">
              {user && isAddedtoWishlist(safeProduct.id)
                ? "Already Wishlisted"
                : "Wishlist"}
            </span>
          </a>
          <a
            href="#compare"
            data-bs-toggle="offcanvas"
            aria-controls="compare"
            onClick={() => addToCompareItem(safeProduct.id)}
            className="box-icon compare btn-icon-action"
          >
            <span className="icon icon-gitDiff" />
            <span className="tooltip">
              {isAddedtoCompareItem(safeProduct.id)
                ? "Already compared"
                : "Compare"}
            </span>
          </a>
          <a
            href="#quickView"
            onClick={() => setQuickViewItem(safeProduct)}
            data-bs-toggle="modal"
            className="box-icon quickview tf-btn-loading"
          >
            <span className="icon icon-eye" />
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
        <span className="price">
          {safeProduct.oldPrice && (
            <span className="old-price">${safeProduct.oldPrice.toFixed(2)}</span>
          )}{" "}
          ${safeProduct.price?.toFixed(2)}
        </span>
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
