"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "../common/Countdown";

import { useContextElement } from "@/context/Context";
import { calculateInStock } from "@/utils/stockUtils";
import PriceDisplay from "@/components/common/PriceDisplay";
import { useSession, signIn } from "next-auth/react";

// Default placeholder image
const DEFAULT_IMAGE = '/images/placeholder.jpg';

export default function ProductsCards6({ product }) {
  // Ensure product has valid image properties
  const safeProduct = {
    ...product,
    imgSrc: product.imgSrc || DEFAULT_IMAGE,
    imgHover: product.imgHover || product.imgSrc || DEFAULT_IMAGE,
    colors: Array.isArray(product.colors) ? product.colors.map(color => ({
      ...color,
      imgSrc: color.imgSrc || DEFAULT_IMAGE
    })) : []
  };

  // Parse size_stocks data for size selection
  const parseSizeStocks = (sizeStocks) => {
    if (!sizeStocks) return [];

    try {
      let parsedData;
      if (typeof sizeStocks === 'string') {
        parsedData = JSON.parse(sizeStocks);
      } else {
        parsedData = sizeStocks;
      }

      if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
        // Format: {"S": 10, "M": 5, "L": 0, ...}
        return Object.entries(parsedData).map(([size, quantity]) => ({
          id: `values-${size.toLowerCase()}`,
          value: size,
          quantity: typeof quantity === 'number' ? quantity : 0,
          disabled: (typeof quantity === 'number' ? quantity : 0) === 0
        }));
      }
    } catch (error) {
      console.error('Error parsing size_stocks:', error);
    }

    return [];
  };

  const availableSizes = parseSizeStocks(safeProduct.size_stocks);
  const hasAvailableSizes = availableSizes.length > 0;

  // Calculate if product is in stock based on size_stocks
  const isInStock = calculateInStock(safeProduct);

  const [currentImage, setCurrentImage] = useState(safeProduct.imgSrc);
  const [selectedSize, setSelectedSize] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const {
    addToCompareItem,
    isAddedtoCompareItem,

    addProductToCart,
    isAddedToCartProducts,
    isProductSizeInCart,
    user
  } = useContextElement();
  const { data: session } = useSession();

  useEffect(() => {
    // Ensure we never set an empty string as the currentImage
    setCurrentImage(safeProduct.imgSrc || DEFAULT_IMAGE);
  }, [safeProduct]);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };
    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile);
      }
    };
  }, []);

  return (
    <div
      className={`card-product style-list ${!isInStock ? "out-of-stock" : ""}`}
      data-availability={isInStock ? "In stock" : "Out of stock"}
      data-brand="gucci"
    >
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${safeProduct.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            src={currentImage || DEFAULT_IMAGE}
            alt={safeProduct.title}
            width={600}
            height={800}
          />
          <Image
            className="lazyload img-hover"
            src={safeProduct.imgHover || currentImage || DEFAULT_IMAGE}
            alt={safeProduct.title}
            width={600}
            height={800}
          />
        </Link>
        {safeProduct.isOnSale && (
          <div className="on-sale-wrap">
            <span className="on-sale-item">-25%</span>
          </div>
        )}
        {!isInStock && (
          <div className="out-of-stock-notice" style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            zIndex: 15,
            backgroundColor: 'rgba(220, 53, 69, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Out of Stock
          </div>
        )}
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${safeProduct.id}`} className="title link">
          {safeProduct.title}
        </Link>
        <span className="price current-price">
          <PriceDisplay
            price={safeProduct.price}
            oldPrice={safeProduct.oldPrice}
            className="current-price"
            size="normal"
          />
        </span>
        {/* Sustainability information: Explains what "Committed" label means for eco-friendly products */}
        {/* <p className="description text-secondary text-line-clamp-2">
          The garments labelled as Committed are products that have been
          produced using sustainable fibres or processes, reducing their
          environmental impact.
        </p> */}
        <div className="variant-wrap-list">
          {safeProduct.colors && safeProduct.colors.length > 0 && (
            <ul className="list-color-product">
              {safeProduct.colors.map((color, index) => (
                <li
                  key={index}
                  className={`list-color-item color-swatch ${currentImage == color.imgSrc ? "active" : ""
                    } `}
                  onMouseOver={() => setCurrentImage(color.imgSrc || DEFAULT_IMAGE)}
                >
                  <span className={`swatch-value ${color.bgColor}`} />
                  <Image
                    className="lazyload"
                    src={color.imgSrc || DEFAULT_IMAGE}
                    alt="color variant"
                    width={600}
                    height={800}
                  />
                </li>
              ))}
            </ul>
          )}
          {hasAvailableSizes && !isMobile && (
            <div className="size-box list-product-btn">
              {availableSizes.map((size) => (
                <span
                  key={size.id}
                  className={`size-item box-icon ${size.disabled ? 'disable' : ''
                    } ${selectedSize === size.value ? 'selected' : ''
                    }`}
                  onClick={() => !size.disabled && setSelectedSize(size.value)}
                  style={{
                    cursor: size.disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: selectedSize === size.value ? '#1f2937' : '',
                    color: selectedSize === size.value ? '#ffffff' : '',
                    border: selectedSize === size.value ? '1px solid #1f2937' : ''
                  }}
                >
                  {size.value}
                </span>
              ))}
            </div>
          )}

          <a
            href="#compare"
            data-bs-toggle="offcanvas"
            aria-controls="compare"
            onClick={() => addToCompareItem(safeProduct.id)}
            className="box-icon compare btn-icon-action"
          >
            <span className="icon icon-gitDiff" />
            <span className="tooltip">
              {" "}
              {isAddedtoCompareItem(safeProduct.id)
                ? "Already compared"
                : "Compare"}
            </span>
          </a>

        </div>
      </div>
    </div>
  );
}
