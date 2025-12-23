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
    return imageObj.startsWith('http') ? imageObj : (getImageUrl(imageObj) || DEFAULT_IMAGE);
  }

  // Handle Strapi image objects with formats
  if (imageObj.formats && imageObj.formats.small && imageObj.formats.small.url) {
    const smallUrl = imageObj.formats.small.url;
    return smallUrl.startsWith('http') ? smallUrl : getImageUrl(smallUrl);
  }

  // Handle objects with direct url property
  if (imageObj.url) {
    return imageObj.url.startsWith('http') ? imageObj.url : getImageUrl(imageObj.url);
  }

  // Handle Strapi data structure with data.attributes
  if (imageObj.data && imageObj.data.attributes && imageObj.data.attributes.url) {
    const attrUrl = imageObj.data.attributes.url;
    return attrUrl.startsWith('http') ? attrUrl : getImageUrl(attrUrl);
  }

  return DEFAULT_IMAGE;
}

export default function ProductCard1({ product, gridClass = "", index = 0, onRemoveFromWishlist = null }) {

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
  const [isMobile, setIsMobile] = useState(false);
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
    // Detect mobile viewport
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



  // Helper function to get main product ID from variant product
  const getMainProductId = (product) => {
    if (!product) return null;

    // First, check if this product has a main product reference (for variants)
    // Variant products should have a 'product' field that references the main product
    if (product.product && (product.product.documentId || product.product.id)) {
      return product.product.documentId || product.product.id;
    }

    // Check if this product has a main_product field (alternative structure)
    if (product.main_product && (product.main_product.documentId || product.main_product.id)) {
      return product.main_product.documentId || product.main_product.id;
    }

    // Fallback: check if this is a variant product by looking for variant patterns in ID
    const productId = product.documentId || product.id;
    if (!productId) return null;

    // Ensure productId is a string before calling .includes()
    const productIdStr = String(productId);

    if (productIdStr.includes('-variant-') || productIdStr.includes('variant')) {
      // Try to extract main product ID from variant ID patterns
      const parts = productIdStr.split('-variant-');
      if (parts.length > 1) {
        return parts[0]; // Return the part before '-variant-'
      }
    }

    // Check if this is a variant by checking the title contains '(Variant)'
    if (product.title && product.title.includes('(Variant)')) {
      console.log('🔍 Found variant by title, but no main product reference:', {
        variantId: productId,
        title: product.title
      });
      // This is a variant but we can't determine main product ID
      // Return the current ID as fallback
    }

    // If no variant pattern found, this is likely the main product
    return productId;
  };

  const handleCartClick = () => {
    if (!user) {
      signIn();
    } else {
      // Get current product ID and main product ID for variant detection
      const currentProductId = safeProduct.documentId || safeProduct.id;
      const mainProductId = getMainProductId(safeProduct);
      const isVariant = mainProductId !== currentProductId;

      // Create unique cart ID using consistent pattern like Details1
      let uniqueCartId;
      let variantInfo = null;

      if (isVariant) {
        // For variants: use main product ID + variant ID pattern
        const baseVariantId = `${mainProductId}-variant-${currentProductId}`;
        uniqueCartId = hasAvailableSizes && selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;

        // Create variant info matching Details1 structure
        variantInfo = {
          id: currentProductId, // Use variant's documentId as the variant identifier
          documentId: currentProductId,
          variantId: currentProductId, // Add variantId for checkout matching
          title: safeProduct.title,
          imgSrc: safeProduct.imgSrc,
          imgSrcObject: safeProduct.imgSrc, // Preserve original image object
          isVariant: true, // Add this flag so cart modal can identify variants
          product_code: safeProduct.product_code // Include variant's product code
        };

        console.log('🛒 Adding variant to cart:', {
          uniqueCartId,
          isVariant,
          variantInfo,
          selectedSize
        });
      } else {
        // For main products: use documentId for consistency
        uniqueCartId = hasAvailableSizes && selectedSize ? `${currentProductId}-size-${selectedSize}` : currentProductId;

        console.log('🛒 Adding main product to cart:', {
          uniqueCartId,
          isVariant: false,
          selectedSize
        });
      }

      addProductToCart(uniqueCartId, 1, true, variantInfo, selectedSize);
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
        if (hasAvailableSizes && !isMobile) {
          setShowSizeSelection(true);
        }
      }}
      onMouseLeave={() => {
        setShowSizeSelection(false);
        setSelectedSize(''); // Reset selection when mouse leaves
      }}
      onTouchStart={(e) => {
        // On mobile, don't show size selection on touch - prefer navigation
        if (isMobile) return;
        // Only handle touch for size selection, don't interfere with navigation
        if (hasAvailableSizes && !e.target.closest('.product-img') && !e.target.closest('.title.link')) {
          setShowSizeSelection(true);
        }
      }}
      onTouchEnd={(e) => {
        // On mobile, don't show size selection on touch - prefer navigation
        if (isMobile) return;
        // Only reset size selection if not clicking on navigation elements
        if (hasAvailableSizes && !e.target.closest('.product-img') && !e.target.closest('.title.link')) {
          setTimeout(() => {
            setShowSizeSelection(false);
            setSelectedSize('');
          }, 2000);
        }
      }}
    >
      <div className="card-product-wrapper">
        <Link
          href={`/product-detail/${getMainProductId(safeProduct) || safeProduct.id}${(getMainProductId(safeProduct) !== (safeProduct.documentId || safeProduct.id)) ? `?variant=${safeProduct.documentId || safeProduct.id}` : ''}`}
          className="product-img"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            // Ensure single click navigation works on mobile
            e.stopPropagation();
          }}
        >
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
        {/* Discount badge - only show on mobile when NO hotSale marquee is active */}
        {(safeProduct.isOnSale || safeProduct.oldPrice) && isMobile && !safeProduct.hotSale && (
          <div className="on-sale-wrap">
            <span className="on-sale-item">
              -{safeProduct.price && safeProduct.oldPrice ? discountPercentage : safeProduct.salePercentage}%
            </span>
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

        {isMobile && (
          <div className="price-overlay-modern" aria-hidden="true">
            <PriceDisplay
              price={safeProduct.price}
              oldPrice={safeProduct.oldPrice}
              size="small"
              className="price-overlay"
              showConversion={false}
            />
          </div>
        )}
        {/* Size Selection on Hover - Top Right */}
        {hasAvailableSizes && showSizeSelection && isInStock && !isMobile && (
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
                  className={`size-btn-clean ${size.disabled ? 'disabled' : ''
                    } ${selectedSize === size.value ? 'selected' : ''
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
        {isInStock && !isMobile && (
          <div className="list-btn-main">
            <a
              className={`btn-main-product ${(hasAvailableSizes && !selectedSize)
                ? 'disabled'
                : ''
                }`}
              onClick={() => {
                // Get variant info for cart checking
                const currentProductId = safeProduct.documentId || safeProduct.id;
                const mainProductId = getMainProductId(safeProduct);
                const isVariant = mainProductId !== currentProductId;

                // Check if already added to cart with proper variant logic
                if (user) {
                  // Create the same unique cart ID that would be used when adding to cart
                  let uniqueCartIdToCheck;

                  if (isVariant) {
                    // For variants: use main product ID + variant ID pattern
                    const baseVariantId = `${mainProductId}-variant-${currentProductId}`;
                    uniqueCartIdToCheck = hasAvailableSizes && selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;
                  } else {
                    // For main products: use documentId for consistency
                    uniqueCartIdToCheck = hasAvailableSizes && selectedSize ? `${currentProductId}-size-${selectedSize}` : currentProductId;
                  }

                  // Check if this exact cart ID is already in cart
                  if (isAddedToCartProducts(uniqueCartIdToCheck)) {
                    return; // Already in cart, do nothing
                  }
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
                // Get variant info for cart checking
                const currentProductId = safeProduct.documentId || safeProduct.id;
                const mainProductId = getMainProductId(safeProduct);
                const isVariant = mainProductId !== currentProductId;

                // Check if already added to cart using the same logic as onClick
                if (user) {
                  // Create the same unique cart ID that would be used when adding to cart
                  let uniqueCartIdToCheck;

                  if (isVariant) {
                    // For variants: use main product ID + variant ID pattern
                    const baseVariantId = `${mainProductId}-variant-${currentProductId}`;
                    uniqueCartIdToCheck = hasAvailableSizes && selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;
                  } else {
                    // For main products: use documentId for consistency
                    uniqueCartIdToCheck = hasAvailableSizes && selectedSize ? `${currentProductId}-size-${selectedSize}` : currentProductId;
                  }

                  // Check if this exact cart ID is already in cart
                  if (isAddedToCartProducts(uniqueCartIdToCheck)) {
                    return "Already Added";
                  }

                  // Return appropriate text based on size selection
                  if (hasAvailableSizes && selectedSize) {
                    return `Add ${selectedSize} to cart`;
                  }
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
        <Link
          href={`/product-detail/${getMainProductId(safeProduct) || safeProduct.id}${(getMainProductId(safeProduct) !== (safeProduct.documentId || safeProduct.id)) ? `?variant=${safeProduct.documentId || safeProduct.id}` : ''}`}
          className="title link"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            // Ensure single click navigation works on mobile
            e.stopPropagation();
          }}
        >
          {safeProduct.title || 'Product'}
        </Link>
        {!isMobile && (
          <PriceDisplay
            price={safeProduct.price}
            oldPrice={safeProduct.oldPrice}
            className="product-card-price"
            size="normal"
            showConversion={false}
          />
        )}
        {/* Color swatches removed as requested */}
      </div>

      {/* Remove from Wishlist Button */}
      {onRemoveFromWishlist && (
        <div className="remove-from-wishlist-wrapper mt-3">
          <button
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={(e) => {
              console.log('🔴 Remove button clicked!');
              console.log('🔴 Product:', safeProduct.title);
              console.log('🔴 Product wishlistId:', safeProduct.wishlistId);
              console.log('🔴 onRemoveFromWishlist function:', typeof onRemoveFromWishlist);

              e.preventDefault();
              e.stopPropagation();

              if (typeof onRemoveFromWishlist === 'function') {
                console.log('🔴 Calling onRemoveFromWishlist...');
                onRemoveFromWishlist();
              } else {
                console.error('🔴 onRemoveFromWishlist is not a function:', onRemoveFromWishlist);
              }
            }}
            title="Remove from Wishlist"
          >
            <i className="far fa-trash-alt"></i>
            Remove from Wishlist
          </button>
        </div>
      )}
      {/* Mobile-only smaller title and price */}
      <style jsx global>{`
        @media (max-width: 768px) {
          /* Title size in product list cards */
          .card-product .card-product-info .title.link {
            font-size: 13px !important;
            line-height: 1.3;
          }

          /* Price size in product list cards (PriceDisplay component) */
          .card-product .product-card-price .price-main .current-price,
          .card-product .product-card-price .current-price {
            font-size: 13px !important;
          }
          .card-product .product-card-price .old-price {
            font-size: 12px !important;
          }

          /* Position hotSale marquee at TOP on mobile */
          .card-product .marquee-product {
            top: 0;
            bottom: auto;
            z-index: 10;
          }
        }
      `}</style>
    </div>
  );
}
