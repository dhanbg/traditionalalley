"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Slider1 from "../sliders/Slider1";
import ColorSelect from "@/components/productDetails/ColorSelect";
import ColorVariantSelect from "@/components/productDetails/ColorVariantSelect";
import SizeSelect, { getStockIndicatorForSize } from "@/components/productDetails/SizeSelect";
import QuantitySelect from "@/components/productDetails/QuantitySelect";
import { getBestImageUrl } from "@/utils/imageUtils";
import { calculateInStock } from "@/utils/stockUtils";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import CustomOrderForm from "../CustomOrderForm";
import SizeGuideModal from "../SizeGuideModal";
import { PRODUCT_REVIEWS_API } from "../../../utils/urls";
import { fetchDataFromApi } from "../../../utils/api";
import PriceDisplay from "@/components/common/PriceDisplay";

export default function Details1({ product, variants = [], preferredVariantId = null }) {
  // Helper function to process image URLs consistently
  const processImageUrl = (imgData) => {
    if (!imgData) return '/logo.png';
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    
    // If it's already a string URL, return it
    if (typeof imgData === 'string') {
      return imgData.startsWith('http') ? imgData : `${API_URL}${imgData}`;
    }
    
    // If it's a Strapi media object, extract the URL
    if (imgData.url) {
      return imgData.url.startsWith('http') ? imgData.url : `${API_URL}${imgData.url}`;
    }
    
    // Try formats if available
    if (imgData.formats) {
      if (imgData.formats.medium?.url) {
        const url = imgData.formats.medium.url;
        return url.startsWith('http') ? url : `${API_URL}${url}`;
      }
      if (imgData.formats.small?.url) {
        const url = imgData.formats.small.url;
        return url.startsWith('http') ? url : `${API_URL}${url}`;
      }
    }
    
    return '/logo.png';
  };

  // Helper function to process gallery items with thumbnails
  const processGalleryItems = (galleryArray) => {
    if (!galleryArray || !Array.isArray(galleryArray)) return [];
    
    return galleryArray.map(item => {
      if (!item) return null;
      
      // If it's already a string URL, return it directly
      if (typeof item === 'string') return item;
      
      // Create a copy of the item to avoid mutating the original
      const processedItem = { ...item };
      
      // Get the best available image URL (prefer large, fall back to medium, then small, then original)
      let bestImageUrl = null;
      
      // Try different formats in order of preference
      if (item.formats) {
        if (item.formats.large?.url) {
          bestImageUrl = item.formats.large.url;
        } else if (item.formats.medium?.url) {
          bestImageUrl = item.formats.medium.url;
        } else if (item.formats.small?.url) {
          bestImageUrl = item.formats.small.url;
        } else if (item.formats.thumbnail?.url) {
          bestImageUrl = item.formats.thumbnail.url;
        }
      }
      
      // Fall back to main URL if no formats available
      if (!bestImageUrl && item.url) {
        bestImageUrl = item.url;
      }
      
      // Only process the URL once through getBestImageUrl if we have a URL
      if (bestImageUrl) {
        // Check if it's already a complete URL
        if (bestImageUrl.startsWith('http')) {
          bestImageUrl = bestImageUrl;
        } else {
          // Only add API_URL if it's a relative URL
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
          bestImageUrl = `${API_URL}${bestImageUrl}`;
        }
      }
      
      // Update the URL if we found a valid one
      if (bestImageUrl) {
        processedItem.url = bestImageUrl;
      } else if (processedItem.url && !processedItem.url.startsWith('http')) {
        // Fallback to the old behavior if no URL was found
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
        processedItem.url = `${API_URL}${processedItem.url}`;
      }
      
      return processedItem;
    });
  };

  // Set default values for missing properties to prevent errors
  const safeProduct = {
    ...product,
    colors: product.colors || [],
    sizes: product.sizes || [],
    price: product.price || 0,
    oldPrice: product.oldPrice || null,
    imgSrc: processImageUrl(product.imgSrc) || getBestImageUrl(product.imgSrc, 'medium') || '/logo.png',
    imgHover: processImageUrl(product.imgHover) || processImageUrl(product.imgSrc) || '/logo.png',
    gallery: processGalleryItems(product.gallery || [])
  };

  const [activeColor, setActiveColor] = useState(
    safeProduct.colors && safeProduct.colors.length > 0
      ? (typeof safeProduct.colors[0] === 'string' 
          ? safeProduct.colors[0]
          : safeProduct.colors[0].name || "Gray")
      : "Gray"
  );
  const [quantity, setQuantity] = useState(1);
  const [showCustomOrderForm, setShowCustomOrderForm] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeOptions, setSizeOptions] = useState([]);
  const [sizeSelectionError, setSizeSelectionError] = useState("");
  const [shareStatus, setShareStatus] = useState(''); // 'copied', 'error', or ''

  // Memoized callback to prevent infinite re-renders
  const handleSizeChange = useCallback((val, arr) => {
    setSizeOptions(arr);
    // Clear error message when size is selected
    if (sizeSelectionError) {
      setSizeSelectionError("");
    }
  }, [sizeSelectionError]);

  // Clear size selection error after 3 seconds
  useEffect(() => {
    if (sizeSelectionError) {
      const timer = setTimeout(() => {
        setSizeSelectionError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sizeSelectionError]);

  // Combine main product and variants for selection
  let allOptions = [];
  let initialActive = null;
  
  if (variants && variants.length > 0) {
    // If there are variants, use them and mark one as current if it matches the main product
    allOptions = variants.map(variant => ({
      ...variant,
      isCurrentProduct: variant.id === safeProduct.id || 
                       variant.documentId === safeProduct.documentId ||
                       variant.id === `current-${safeProduct.id}` || 
                       variant.id === `current-${safeProduct.documentId}`
    }));
    
    // Priority-based variant selection:
    // 1. First, try to find the preferred variant from URL
    if (preferredVariantId) {
      console.log('🔍 Looking for preferred variant:', preferredVariantId);
      const preferredVariant = allOptions.find(v => 
        v.documentId === preferredVariantId ||
        v.id === preferredVariantId ||
        v.id === `current-${preferredVariantId}` ||
        (typeof v.id === 'string' && v.id.includes(preferredVariantId))
      );
      
      if (preferredVariant) {
        console.log('✅ Found preferred variant:', preferredVariant);
        initialActive = preferredVariant;
      } else {
        console.log('⚠️ Preferred variant not found, falling back to current product');
      }
    }
    
    // 2. If no preferred variant found, fall back to current product variant
    if (!initialActive) {
      initialActive = allOptions.find(v => v.isCurrentProduct) || allOptions[0];
    }
  } else if (safeProduct.color) {
    // If no variants but main product has a color, create a single option
    allOptions = [{ 
      ...safeProduct, 
      isCurrentProduct: true,
      id: safeProduct.documentId || `product-${safeProduct.id}` 
    }];
    initialActive = allOptions[0];
  }

  const [activeVariant, setActiveVariant] = useState(initialActive);
  // Initialize currentProduct with properly processed images from the start
  const [currentProduct, setCurrentProduct] = useState({
    ...safeProduct,
    imgSrc: processImageUrl(safeProduct.imgSrc) || safeProduct.imgSrc,
    imgHover: processImageUrl(safeProduct.imgHover) || processImageUrl(safeProduct.imgSrc) || safeProduct.imgHover,
    gallery: processGalleryItems(safeProduct.gallery || [])
  });
  
  // Helper function to extract design name from variant
  const extractDesignFromVariant = (variant) => {
    if (!variant) return 'Unknown';
    
    // First, check if there's a design field in the variant
    if (variant.design && typeof variant.design === 'string' && variant.design.trim() !== '') {
      return variant.design;
    }
    
    // For main product, show product name if available
    if (variant.isCurrentProduct && variant.title) {
      return variant.title;
    }
    
    // Try to extract from color image name
    if (variant.color?.name) {
      const filename = variant.color.name.toLowerCase();
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'grey', 'beige'];
      for (const color of colors) {
        if (filename.includes(color)) {
          return color.charAt(0).toUpperCase() + color.slice(1);
        }
      }
    }
    
    // Try to extract from main image name
    if (variant.imgSrc) {
      const imgSrcName = typeof variant.imgSrc === 'string' ? variant.imgSrc : variant.imgSrc.name || '';
      const filename = imgSrcName.toLowerCase();
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'grey', 'beige'];
      for (const color of colors) {
        if (filename.includes(color)) {
          return color.charAt(0).toUpperCase() + color.slice(1);
        }
      }
    }
    
    // Last resort: use a generic design name
    return 'Design';
  };
  
  // Memoize slideItems to prevent infinite re-renders
  const slideItems = useMemo(() => {
    // Map variants to slideItems format if they have imgSrc
    if (variants && variants.length > 0) {
      return variants.map((variant, index) => ({
        id: index + 1,
        src: processImageUrl(variant.imgSrc),
        alt: extractDesignFromVariant(variant),
        color: extractDesignFromVariant(variant),
        width: 600,
        height: 800,
        imgSrc: processImageUrl(variant.imgSrc)
      }));
    }
    // Fallback to original color mapping
    if (safeProduct.colors && safeProduct.colors.length > 0 && safeProduct.colors[0].imgSrc) {
      return safeProduct.colors.map((color, index) => ({
        id: index + 1,
        src: processImageUrl(color.imgSrc),
        alt: color.name,
        color: color.name,
        width: 600,
        height: 800,
        imgSrc: processImageUrl(color.imgSrc)
      }));
    }
    return undefined;
  }, [variants, safeProduct.colors]);
  
  const {
    addProductToCart,
    isAddedToCartProducts,
    isProductSizeInCart, // Add the new function
    addToWishlist,
    isAddedtoWishlist,
    isAddedtoCompareItem,
    addToCompareItem,
    cartProducts,
    updateQuantity,
    user,
  } = useContextElement();
  const { data: session } = useSession();

  useEffect(() => {
    async function getReviewCount() {
      if (!product?.documentId) return;
      try {
        const res = await fetchDataFromApi(PRODUCT_REVIEWS_API(product.documentId));
        setReviewCount(res?.data?.length || 0);
      } catch {
        setReviewCount(0);
      }
    }
    getReviewCount();
  }, [product?.documentId]);

  useEffect(() => {
    if (safeProduct.colors && safeProduct.colors.length > 0) {
      const firstColor = safeProduct.colors[0];
      setActiveColor(typeof firstColor === 'string' ? firstColor : firstColor.name || "Gray");
    }
  }, [safeProduct.colors]);

  useEffect(() => {
    if (safeProduct.sizes && safeProduct.sizes.length > 0) {
      setQuantity(1);
    }
  }, [safeProduct.sizes]);

  // Pre-initialize the zoom container to avoid delay on first hover
  useEffect(() => {
    // Create the zoom container if it doesn't exist
    let zoomContainer = document.querySelector('.tf-zoom-main');
    if (!zoomContainer) {
      zoomContainer = document.createElement('div');
      zoomContainer.className = 'tf-zoom-main';
      const productInfoWrap = document.querySelector('.tf-product-info-wrap');
      if (productInfoWrap) {
        productInfoWrap.appendChild(zoomContainer);
      }
    }
    
    // Force-trigger browser layout/reflow to ensure the container is ready
    if (zoomContainer) {
      zoomContainer.getBoundingClientRect();
    }
  }, []);

  // Add state for wishlist operations
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check if current product is in wishlist using Context
  const currentProductId = safeProduct.documentId || safeProduct.id;
  // Create unique wishlist ID that matches cart ID pattern
  const wishlistId = useMemo(() => {
    const baseId = safeProduct.documentId || safeProduct.id;
    
    if (activeVariant && !activeVariant.isCurrentProduct) {
      // For variants: include variant documentId and size for consistency with cart
      const variantIdentifier = activeVariant.documentId || activeVariant.id;
      const baseVariantId = `${baseId}-variant-${variantIdentifier}`;
      return selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;
    } else {
      // For main products: use documentId for consistency and include size in ID
      return selectedSize ? `${baseId}-size-${selectedSize}` : baseId;
    }
  }, [safeProduct, activeVariant, selectedSize]);

  // Create variant info for wishlist checking (same as cart)
  const variantInfoForWishlist = useMemo(() => {
    if (activeVariant && !activeVariant.isCurrentProduct) {
      return {
        isVariant: true,
        documentId: activeVariant.documentId || activeVariant.id,
        title: activeVariant.title,
        variantId: activeVariant.id
      };
    }
    return null;
  }, [activeVariant]);

  const isInWishlist = isAddedtoWishlist(wishlistId, variantInfoForWishlist, selectedSize);
  
  // Debug log for wishlist checking
  console.log('🔍 Details1 wishlist check:', {
    productTitle: safeProduct.title,
    wishlistId,
    variantInfoForWishlist,
    selectedSize,
    activeVariant: activeVariant?.title,
    isInWishlist,
    baseProductId: safeProduct.documentId || safeProduct.id
  });

  // Memoized check if product is out of stock (all sizes have zero quantity)
  const isOutOfStock = useMemo(() => {
    // Get the size_stocks from current context
    const currentSizeStocks = (activeVariant && activeVariant.size_stocks) ||
                             currentProduct.size_stocks ||
                             safeProduct.size_stocks;
    
    // If we have size_stocks object, check if ALL sizes have zero quantity
    if (currentSizeStocks && typeof currentSizeStocks === 'object' && !Array.isArray(currentSizeStocks)) {
      const sizeEntries = Object.entries(currentSizeStocks);
      
      if (sizeEntries.length > 0) {
        const allSizesOutOfStock = sizeEntries.every(([size, quantity]) => {
          const qty = Number(quantity) || 0;
          return qty === 0;
        });
        
        if (allSizesOutOfStock) {
          return true;
        } else {
          return false;
        }
      }
    }
    
    // If no size_stocks data, fallback to isActive check
    if (safeProduct.isActive === false) {
      return true;
    }
    
    return false;
  }, [activeVariant, currentProduct.size_stocks, safeProduct.size_stocks, safeProduct.isActive]);

  const handleWishlistClick = async () => {
    if (!user) {
      signIn();
      return;
    }
    
    if (!isOutOfStock) {
      setSizeSelectionError("This item is currently in stock. Add to cart instead!");
      return;
    }
    
    if (isInWishlist) {
      setSizeSelectionError("This item is already in your wishlist.");
      return;
    }
    
    setWishlistLoading(true);
    setSizeSelectionError(null);
    
    try {
      console.log('🚀 Details1 adding to wishlist:', {
        wishlistId,
        variantInfoForWishlist,
        selectedSize,
        productTitle: safeProduct.title,
        activeVariantTitle: activeVariant?.title
      });
      
      // Use Context's addToWishlist function with variant and size info
      await addToWishlist(wishlistId, variantInfoForWishlist, selectedSize);
      
      // Show success message
      setSizeSelectionError("✓ Added to wishlist successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSizeSelectionError(null);
      }, 3000);
    } catch (error) {
      setSizeSelectionError('Failed to add to wishlist. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      signIn();
    } else {
      // Create unique cart ID based on product, variant, and size
      let uniqueCartId;
      const baseId = safeProduct.documentId || safeProduct.id;

      if (activeVariant && !activeVariant.isCurrentProduct) {
        const baseVariantId = `${baseId}-variant-${activeVariant.id}`;
        uniqueCartId = selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;
      } else {
        uniqueCartId = selectedSize ? `${baseId}-size-${selectedSize}` : baseId;
      }

      // Prepare variant info for cart
      const variantInfo = activeVariant && !activeVariant.isCurrentProduct ? {
        id: activeVariant.id,
        documentId: activeVariant.documentId,
        color: activeVariant.color,
        imgSrc: activeVariant.imgSrc,
        imgHover: activeVariant.imgHover,
        title: activeVariant.title,
        price: activeVariant.price,
        oldPrice: activeVariant.oldPrice,
        discount: activeVariant.discount,
        sizes: activeVariant.sizes,
        gallery: activeVariant.gallery
      } : null;

      addProductToCart(uniqueCartId, quantity, true, variantInfo, selectedSize);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    
    try {
      // Copy current page URL to clipboard
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setShareStatus('copied');
      // Clear status after 2 seconds
      setTimeout(() => setShareStatus(''), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      setShareStatus('error');
      // Clear status after 3 seconds
      setTimeout(() => setShareStatus(''), 3000);
    }
  };





  // Function to get the current display title
  const getCurrentDisplayTitle = () => {
    if (activeVariant) {
      // Use variant's title if available, otherwise fallback to main product title
      return activeVariant.title || safeProduct.title || 'Untitled Product';
    }
    return safeProduct.title || 'Untitled Product';
  };

  const handleVariantChange = (variant) => {
    setActiveVariant(variant);

    // Update current product with variant data
    if (variant) {
      setCurrentProduct({
        ...safeProduct,
        imgSrc: processImageUrl(variant.imgSrc),
        imgHover: processImageUrl(variant.imgHover) || processImageUrl(variant.imgSrc),
        gallery: processGalleryItems(variant.gallery && variant.gallery.length > 0 ? variant.gallery : safeProduct.gallery),
        inStock: calculateInStock(variant),
        quantity: variant.quantity
      });
      // Update active color (extract from color image or variant info)
      const colorName = variant.color?.alternativeText || 
                       variant.color?.name ||
                       extractDesignFromVariant(variant);
      setActiveColor(colorName);
    }

    // Reset size selection
    setSelectedSize("");
    setSizeOptions([]);

    // Safely handle size_stocks
    let parsedSizeStocks = [];
    if (variant && variant.size_stocks) {
      if (typeof variant.size_stocks === "string") {
        try {
          parsedSizeStocks = JSON.parse(variant.size_stocks);
        } catch (error) {
        parsedSizeStocks = [];
      }
      } else if (Array.isArray(variant.size_stocks) || typeof variant.size_stocks === "object") {
        parsedSizeStocks = variant.size_stocks;
      }
    }
    // Ensure parsedSizeStocks is always an array
    if (!Array.isArray(parsedSizeStocks)) {
      parsedSizeStocks = [];
    }

    // Only update if different
    if (JSON.stringify(sizeOptions) !== JSON.stringify(parsedSizeStocks)) {
      setSizeOptions(parsedSizeStocks);
    }

    // Auto-select first available size if present
    const firstAvailableSize = parsedSizeStocks.find((s) => !s.disabled && s.quantity > 0);
    if (firstAvailableSize && selectedSize !== firstAvailableSize.size) {
      setSelectedSize(firstAvailableSize.size);
    }
  };

  return (
    <section className="flat-spacing">
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            {/* Product default */} 
            <div className="col-md-66">
              <div className="tf-product-media-wrap sticky-top">
                <Slider1
                  setActiveColor={setActiveColor}
                  activeColor={activeColor}
                  firstItem={currentProduct.imgSrc}
                  imgHover={currentProduct.imgHover}
                  gallery={currentProduct.gallery}
                  slideItems={slideItems}
                />
              </div>
            </div>
            {/* /Product default */}
            {/* tf-product-info-list */}
            <div className="col-md-7">
              <div className="tf-product-info-wrap position-relative mw-100p-hidden ">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-heading">
                    <div className="tf-product-info-name">
                      <div className="text text-btn-uppercase">
                        {safeProduct.category?.title || "Product"}
                      </div>
                      <h3 className="name">{getCurrentDisplayTitle()}</h3>
                      <div className="sub">
                        <div className="tf-product-info-rate">
                          <div className="list-star">
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                          </div>
                          <div className="text text-caption-1">
                            ({reviewCount} reviews)
                          </div>
                        </div>
                        {/* <div className="tf-product-info-sold">
                          <i className="icon icon-lightning" />
                          <div className="text text-caption-1">
                            18&nbsp;sold in last&nbsp;32&nbsp;hours
                          </div>
                        </div> */}
                      </div>
                    </div>
                    <div className="tf-product-info-desc">
                      <div className="tf-product-info-price">
                        <PriceDisplay 
                          price={safeProduct.price}
                          oldPrice={safeProduct.oldPrice}
                          className="price-on-sale font-2"
                          size="large"
                        />
                      </div>
                      {/* Sustainability information: Explains what "Committed" label means for eco-friendly products */}
                      {/* <p>
                        The garments labelled as Committed are products that
                        have been produced using sustainable fibres or
                        processes, reducing their environmental impact.
                      </p> */}
                      {/* <div className="tf-product-info-liveview">
                        <i className="icon icon-eye" />
                        <p className="text-caption-1">
                          <span className="liveview-count">28</span> people are
                          viewing this right now
                        </p>
                      </div> */}
                    </div>
                  </div>
                  <div className="tf-product-info-choose-option">
                    {/* Designs section */}
                    {allOptions.length > 0 ? (
                      <div className="tf-product-info-color">
                        <ColorVariantSelect 
                          variants={allOptions}
                          activeVariant={activeVariant}
                          onVariantChange={handleVariantChange}
                          showColorNames={true}
                          currentProductId={safeProduct.id}
                        />
                      </div>
                    ) : safeProduct.colors && safeProduct.colors.length > 0 && (
                      <div className="tf-product-info-color">
                        <ColorSelect 
                          activeColor={activeColor}
                          setActiveColor={setActiveColor}
                          colorOptions={
                            safeProduct.colors.map((color, index) => {
                              // Handle different color formats
                              if (typeof color === 'string') {
                                return {
                                  id: `values-${color.toLowerCase()}-${index}`,
                                  value: color,
                                  color: color.toLowerCase()
                                };
                              } else if (color.name) {
                                return {
                                  id: `values-${color.name.toLowerCase()}-${index}`,
                                  value: color.name,
                                  color: color.name.toLowerCase()
                                };
                              }
                              return {
                                id: `values-unknown-${index}`,
                                value: "Unknown",
                                color: "gray"
                              };
                            })
                          }
                        />
                      </div>
                    )}
                  
                    {/* Sizes section */}
                    {((currentProduct.size_stocks) || (activeVariant && activeVariant.size_stocks) || (safeProduct.sizes && safeProduct.sizes.length > 0)) && (
                      <div className="tf-product-info-size">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <div className="title" style={{ fontWeight: "500", display: "flex", alignItems: "center" }}>
                            Size:
                            {selectedSize && sizeOptions.length > 0 && (() => {
                              const { text, color } = getStockIndicatorForSize(sizeOptions, selectedSize);
                              return text ? (
                                <span style={{ marginLeft: 12, fontSize: 13, color, fontWeight: 500 }}>{text}</span>
                              ) : null;
                            })()}
                          </div>
                          <button 
                            onClick={() => setShowSizeGuide(true)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#000",
                              fontSize: "14px",
                              fontWeight: "500",
                              textDecoration: "underline",
                              cursor: "pointer",
                              padding: "0",
                              transition: "all 0.2s ease"
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.color = "#777";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.color = "#000";
                            }}
                          >
                            Size Guide
                          </button>
                        </div>
                        <SizeSelect 
                          sizeStocks={
                            (activeVariant && activeVariant.size_stocks) || 
                            currentProduct.size_stocks || 
                            safeProduct.size_stocks
                          }
                          sizes={
                            safeProduct.sizes ? safeProduct.sizes.map((size, index) => ({
                              id: `values-${typeof size === 'string' ? size.toLowerCase() : size}-${index}`,
                              value: typeof size === 'string' ? size : size,
                              price: safeProduct.price,
                              disabled: false,
                              quantity: 0
                            })) : []
                          }
                          productPrice={safeProduct.price}
                          selectedSize={selectedSize}
                          setSelectedSize={setSelectedSize}
                          onSelectedSizeChange={handleSizeChange}
                        />
                      </div>
                    )}

                    {/* Weight section */}
                    {/* Remove weight and dimensions display */}

                    {/* Dimensions section */}
                    {/* Remove weight and dimensions display */}

                    {/* Commented quantity section */}
                    {/* <div className="tf-product-info-quantity">
                      <div className="title mb_12">Quantity:</div>
                      <QuantitySelect
                        quantity={
                          isAddedToCartProducts(safeProduct.id)
                            ? (cartProducts.filter(
                                (elm) => elm.id == safeProduct.id
                              )[0]?.quantity || quantity)
                            : quantity
                        }
                        setQuantity={(qty) => {
                          if (isAddedToCartProducts(safeProduct.id)) {
                            return updateQuantity(safeProduct.id, qty);
                          } else {
                            setQuantity(qty);
                            return Promise.resolve();
                          }
                        }}
                      />
                    </div> */}
                    
                    {/* Size selection error message */}
                    {sizeSelectionError && (
                      <div className="alert alert-warning" role="alert" style={{ 
                        marginBottom: "16px", 
                        padding: "10px 15px", 
                        backgroundColor: "#fff3cd", 
                        color: "#856404", 
                        border: "1px solid #ffeaa7", 
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}>
                        {sizeSelectionError}
                      </div>
                    )}
                    
                    <div className="tf-product-action-btns" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div className="tf-product-info-by-btn mb_10" style={{ display: "flex", alignItems: "center" }}>
                        {/* Show either Add to Cart OR Add to Wishlist based on stock */}
                        {isOutOfStock ? (
                          // Add to Wishlist button (when out of stock)
                          <a
                            onClick={wishlistLoading ? null : handleWishlistClick}
                            className={`btn-style-2 fw-6 btn-add-to-wishlist ${
                              isInWishlist ? 'added' : ''
                            } ${
                              wishlistLoading ? 'loading' : ''
                            }`}
                            style={{ 
                              height: "46px", 
                              display: "flex", 
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 15px",
                              minWidth: "120px",
                              opacity: wishlistLoading ? 0.6 : 1,
                              cursor: wishlistLoading ? 'not-allowed' : 'pointer',
                              backgroundColor: isInWishlist ? '#dc3545' : '#28a745',
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            {wishlistLoading ? (
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '16px', height: '16px' }} />
                            ) : (
                              <span className={`icon ${isInWishlist ? 'icon-heart-fill' : 'icon-heart'} me-2`} />
                            )}
                            <span>
                              {(() => {
                                if (wishlistLoading) return "Adding...";
                                if (!user) return "Login to add to wishlist";
                                if (isInWishlist) return "In Wishlist";
                                return "Add to Wishlist";
                              })()} 
                            </span>
                          </a>
                        ) : (
                          // Add to Cart button (when in stock)
                          <a
                            onClick={safeProduct.isActive === false ? null : handleCartClick}
                            className={`btn-style-2 fw-6 btn-add-to-cart ${safeProduct.isActive === false ? 'disabled' : ''}`}
                            style={{ 
                              height: "46px", 
                              display: "flex", 
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 15px",
                              minWidth: "140px",
                              whiteSpace: "nowrap",
                              opacity: safeProduct.isActive === false ? 0.6 : 1,
                              cursor: safeProduct.isActive === false ? 'not-allowed' : 'pointer',
                              backgroundColor: safeProduct.isActive === false ? '#6c757d' : ''
                            }}
                          >
                            <span>
                              {user && (() => {
                                // Check if current product+size combination is in cart using same logic as handleCartClick
                                const baseId = safeProduct.documentId || safeProduct.id;
                                let uniqueCartIdToCheck;
                                
                                if (activeVariant && !activeVariant.isCurrentProduct) {
                                  // For variants: include variant documentId and size for consistency
                                  const variantIdentifier = activeVariant.documentId || activeVariant.id;
                                  const baseVariantId = `${baseId}-variant-${variantIdentifier}`;
                                  uniqueCartIdToCheck = selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;
                                } else {
                                  // For main products: use documentId for consistency and include size in ID
                                  uniqueCartIdToCheck = selectedSize ? `${baseId}-size-${selectedSize}` : baseId;
                                }
                                
                                const isInCart = isAddedToCartProducts(uniqueCartIdToCheck);
                                return isInCart ? "Added" : "Add to cart";
                              })() || "Add to cart"}
                            </span>
                          </a>
                        )}


                        <button 
                          onClick={() => setShowCustomOrderForm(true)}
                          className="btn-style-1 text-btn-uppercase fw-6"
                          style={{ 
                            height: "46px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            width: "auto",
                            minWidth: "140px",
                            padding: "0 25px",
                            whiteSpace: "nowrap",
                            marginLeft: "10px",
                            backgroundColor: "var(--main)",
                            color: "var(--white)",
                            border: "1px solid var(--main)",
                            fontWeight: "600",
                            position: "relative",
                            overflow: "visible"
                          }}
                          aria-label="Request Custom Order - Always Available"
                          title="Click to request a custom order for this product"
                        >
                          <span style={{ marginRight: "8px" }}>✨</span>
                          Custom Order
                        </button>
                      </div>
                    </div>
                    
                    <div className="tf-product-info-help">
                      <div className="tf-product-info-extra-link">
                        <a
                          href="#"
                          className="tf-product-extra-icon"
                        >
                          <div className="icon">
                            <i className="icon-shipping" />
                          </div>
                          <p className="text-caption-1">
                            Delivery &amp; Return
                          </p>
                        </a>

                        <a
                          href="#"
                          className="tf-product-extra-icon"
                          onClick={handleShare}
                        >
                          <div className="icon">
                            <i className="icon-share" />
                          </div>
                          <p className="text-caption-1">
                            {shareStatus === 'copied' ? 'Copied!' : 
                             shareStatus === 'error' ? 'Copy failed' : 'Share'}
                          </p>
                        </a>
                      </div>

                      <div className="tf-product-info-delivery">
                        <div className="icon">
                          <i className="icon-truck" />
                        </div>
                        <p className="text-caption-1">
                          <strong>Delivery Times:</strong><br/>
                          Domestic: Zone 1 (3-5 days), Zone 2 (5-7 days), Zone 3 (6-8 days)<br/>
                          International: Express (9-11 days), Economy (16-21 days)
                        </p>
                      </div>
                      <div className="tf-product-info-return">
                        <div className="icon">
                          <i className="icon-arrowClockwise" />
                        </div>
                        <p className="text-caption-1">
                          Exchange within <span>12 days</span> of delivery. No refunds available.
                          All sales are final.
                        </p>
                      </div>
                      {/* View Store Information section removed */}
                    </div>
                    <ul className="tf-product-info-sku">
                      {/* <li>
                        <p className="text-caption-1">Product ID:</p>
                        <p className="text-caption-1 text-1">53453412</p>
                      </li> */}
                      <li>
                        <p className="text-caption-1">Designed By:</p>
                        <p className="text-caption-1 text-1">Traditional Alley</p>
                      </li>
                      <li>
                        <p className="text-caption-1">Available:</p>
                        <p className="text-caption-1 text-1" style={{
                          color: safeProduct.isActive === false ? '#dc3545' : '#28a745'
                        }}>
                          {safeProduct.isActive === false ? 'Inactive' : 'Active'}
                        </p>
                      </li>

                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* /tf-product-info-list */}
          </div>
        </div>
      </div>
      
      {/* Size guide modal */}
      <SizeGuideModal 
        isOpen={showSizeGuide} 
        onClose={() => setShowSizeGuide(false)}
      />
      
      {/* Custom Order Form Modal */}
      <CustomOrderForm 
        isOpen={showCustomOrderForm} 
        onClose={() => setShowCustomOrderForm(false)}
        product={safeProduct}
      />
    </section>
  );
}