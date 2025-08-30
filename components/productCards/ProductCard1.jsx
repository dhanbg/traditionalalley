"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "../common/Countdown";
import PriceDisplay from "../common/PriceDisplay";
import { useContextElement } from "@/context/Context";
import { useSession, signIn } from "next-auth/react";
import { getImageUrl } from "@/utils/imageUtils";
import { calculateInStock } from "@/utils/stockUtils";

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
  // Debug logging for size_stocks
  console.log('🔍 ProductCard1 Debug:', {
    title: product.title,
    size_stocks: product.size_stocks,
    has_size_stocks: product.size_stocks && Object.keys(product.size_stocks).length > 0
  });
  
  // Ensure product has valid image properties
  const safeProduct = {
    ...product,
    imgSrc: getStrapiSmallImage(product.imgSrc) || DEFAULT_IMAGE,
    imgHover: getStrapiSmallImage(product.imgHover) || getStrapiSmallImage(product.imgSrc) || DEFAULT_IMAGE
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
  const [showSizeSelection, setShowSizeSelection] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const cardRef = useRef(null);

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



  const handleCartClick = () => {
    if (!user) {
      signIn();
    } else {
      // Create unique cart ID that includes size information if applicable
      let cartId = safeProduct.documentId || safeProduct.id;
      if (hasAvailableSizes && selectedSize) {
        cartId = `${cartId}-size-${selectedSize}`;
      }
      addProductToCart(cartId, 1, true, null, selectedSize);
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
      className={`card-product ${gridClass} ${inView ? "animate-in" : ""} ${!isInStock ? "out-of-stock" : ""}`}
      style={{ animationDelay: `${index * 0.12 + 0.1}s` }}
      ref={cardRef}
      onMouseEnter={() => {
        if (hasAvailableSizes) {
          setShowSizeSelection(true);
        }
      }}
      onMouseLeave={() => {
        setShowSizeSelection(false);
        setSelectedSize(''); // Reset selection when mouse leaves
      }}
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
        {/* Size Selection on Hover - Top Right */}
        {hasAvailableSizes && showSizeSelection && isInStock && (
          <div className="size-selection-hover-clean" style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 10
          }}>
            <div className="size-buttons-clean" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              alignItems: 'center'
            }}>
              {availableSizes.map((size) => (
                <button
                  key={size.id}
                  className={`size-btn-clean ${
                    size.disabled ? 'disabled' : ''
                  } ${
                    selectedSize === size.value ? 'selected' : ''
                  }`}
                  onClick={() => !size.disabled && setSelectedSize(size.value)}
                  disabled={size.disabled}
                  style={{
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: selectedSize === size.value ? '1px solid #1f2937' : '1px solid #d1d5db',
                    background: selectedSize === size.value ? '#1f2937' : '#ffffff',
                    color: selectedSize === size.value ? '#ffffff' : '#374151',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: size.disabled ? 'not-allowed' : 'pointer',
                    opacity: size.disabled ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    padding: '0',
                    margin: '0',
                    boxSizing: 'border-box'
                  }}
                >
                  {size.value}
                </button>
              ))}
            </div>
          </div>
        )}
        {isInStock && (
          <div className="list-btn-main">
            <a
              className={`btn-main-product ${
                (hasAvailableSizes && !selectedSize) && !isAddedToCartProducts(safeProduct.id)
                  ? 'disabled' 
                  : ''
              }`}
              onClick={() => {
                // Check if already added to cart
                if (user && isAddedToCartProducts(safeProduct.id)) {
                  return; // Already in cart, do nothing
                }
                
                // For products with sizes, require size selection
                if (hasAvailableSizes && !selectedSize) {
                  return;
                }
                
                // Add to cart
                handleCartClick();
              }}
              style={{
                cursor: (hasAvailableSizes && !selectedSize) && !isAddedToCartProducts(safeProduct.id)
                  ? 'not-allowed' 
                  : 'pointer'
              }}
            >
              {(() => {
                // Check if already added to cart (for selected size if applicable)
                if (user && hasAvailableSizes && selectedSize) {
                  // Check if this specific size is in cart using the proper function
                  const productDocumentId = safeProduct.documentId || safeProduct.id;
                  const isThisSizeInCart = isProductSizeInCart(productDocumentId, selectedSize);
                  if (isThisSizeInCart) {
                    return "Already Added";
                  }
                  return `Add ${selectedSize} to cart`;
                }
                
                // Check if product without sizes is in cart
                if (user && !hasAvailableSizes && isAddedToCartProducts(safeProduct.id)) {
                  return "Already Added";
                }
                
                // Check if need to select size
                if (hasAvailableSizes && !selectedSize) {
                  return "Choose Size First";
                }
                
                // Default case
                return "Add to cart";
              })()} 
            </a>
          </div>
        )}
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
