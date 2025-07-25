"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Slider1 from "../sliders/Slider1";
import ColorSelect from "@/components/productDetails/ColorSelect";
import ColorVariantSelect from "@/components/productDetails/ColorVariantSelect";
import SizeSelect, { getStockIndicatorForSize } from "@/components/productDetails/SizeSelect";
import QuantitySelect from "@/components/productDetails/QuantitySelect";
import { getBestImageUrl } from "@/utils/imageUtils";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import CustomOrderForm from "../CustomOrderForm";
import SizeGuideModal from "../SizeGuideModal";
import { PRODUCT_REVIEWS_API } from "../../../utils/urls";
import { fetchDataFromApi } from "../../../utils/api";
import PriceDisplay from "@/components/common/PriceDisplay";

export default function Details1({ product, variants = [] }) {
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
      const bestImageUrl = getBestImageUrl(item, 'large') || 
                         getBestImageUrl(item, 'medium') || 
                         getBestImageUrl(item, 'small') || 
                         getBestImageUrl(item);
      
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
    imgSrc: getBestImageUrl(product.imgSrc, 'medium') || '/logo.png',
    imgHover: product.imgHover || product.imgSrc || '/logo.png',
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
    initialActive = allOptions.find(v => v.isCurrentProduct) || allOptions[0];
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
  const [currentProduct, setCurrentProduct] = useState(safeProduct);
  
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

  const handleWishlistClick = () => {
    if (!user) {
      signIn();
    } else {
      // Use the same unique ID logic as cart for consistency
      let uniqueId;
      if (activeVariant && !activeVariant.isCurrentProduct) {
        const baseVariantId = `${safeProduct.documentId || safeProduct.id}-variant-${activeVariant.id}`;
        uniqueId = selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;
      } else {
        uniqueId = selectedSize ? `${safeProduct.documentId || safeProduct.id}-size-${selectedSize}` : safeProduct.documentId || safeProduct.id;
      }
      addToWishlist(uniqueId);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      signIn();
    } else {
      // Check if the entire product is inactive
      if (safeProduct.isActive === false) {
        setSizeSelectionError("This product is currently unavailable and cannot be added to cart.");
        return;
      }
      
      // Check if sizes are available and no size is selected
      const hasAvailableSizes = (currentProduct.size_stocks) || 
                                (activeVariant && activeVariant.size_stocks) || 
                                (safeProduct.sizes && safeProduct.sizes.length > 0);
      
      if (hasAvailableSizes && !selectedSize) {
        // Show an alert or notification that size selection is required
        setSizeSelectionError("Please select a size before adding to cart.");
        return;
      }
      
      // Check if the selected size is out of stock
      if (selectedSize && sizeOptions.length > 0) {
        const selectedSizeOption = sizeOptions.find(s => s.value === selectedSize);
        if (selectedSizeOption && selectedSizeOption.quantity === 0) {
          setSizeSelectionError(`Size ${selectedSize} is currently out of stock. Please select a different size.`);
          return;
        }
      }
      
      // Create unique ID that includes size information
      let uniqueCartId;
      let variantInfo = null;
      
      const baseId = safeProduct.documentId || safeProduct.id;

      if (activeVariant && !activeVariant.isCurrentProduct) {
        // For variants: include variant documentId and size for consistency
        const variantIdentifier = activeVariant.documentId || activeVariant.id;
        const baseVariantId = `${baseId}-variant-${variantIdentifier}`;
        uniqueCartId = selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;
        
        // Debug the activeVariant structure
        console.log('🔍 ActiveVariant structure for cart:', {
          id: activeVariant.id,
          documentId: activeVariant.documentId,
          hasDocumentId: !!activeVariant.documentId,
          title: activeVariant.title,
          fullObject: activeVariant
        });
        
        variantInfo = {
          isVariant: true,
          documentId: activeVariant.documentId || activeVariant.id, // Use documentId as primary identifier
          title: activeVariant.title || extractDesignFromVariant(activeVariant),
          imgSrc: processImageUrl(activeVariant.imgSrc),
          imgSrcObject: activeVariant.imgSrc // Preserve original image object for thumbnail extraction
        };
        
        console.log('🛒 Created variantInfo for cart:', variantInfo);
      } else {
        // For main products: use documentId for consistency and include size in ID
        uniqueCartId = selectedSize ? `${baseId}-size-${selectedSize}` : baseId;
      }
      
      console.log('🎯 Generated uniqueCartId for cart:', uniqueCartId);
      addProductToCart(uniqueCartId, quantity, true, variantInfo, selectedSize);
    }
  };

  const handleCompareClick = () => {
    if (!user) {
      signIn();
    } else {
      // Use the same unique ID logic as cart for consistency
      let uniqueId;
      const baseId = safeProduct.documentId || safeProduct.id;

      if (activeVariant && !activeVariant.isCurrentProduct) {
        const baseVariantId = `${baseId}-variant-${activeVariant.id}`;
        uniqueId = selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;
      } else {
        uniqueId = selectedSize ? `${baseId}-size-${selectedSize}` : baseId;
      }
      addToCompareItem(uniqueId);
    }
  };



  // Function to get the current display title
  const getCurrentDisplayTitle = () => {
    if (activeVariant) {
      return extractDesignFromVariant(activeVariant);
    }
    return safeProduct.title;
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
        inStock: variant.inStock,
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
          console.error("Error parsing variant size_stocks:", error, variant.size_stocks);
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
                        <a
                          onClick={safeProduct.isActive === false ? null : handleCartClick}
                          className={`btn-style-2 fw-6 btn-add-to-cart ${safeProduct.isActive === false ? 'disabled' : ''}`}
                          style={{ 
                            height: "46px", 
                            display: "flex", 
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 15px",
                            minWidth: "120px",
                            opacity: safeProduct.isActive === false ? 0.6 : 1,
                            cursor: safeProduct.isActive === false ? 'not-allowed' : 'pointer',
                            backgroundColor: safeProduct.isActive === false ? '#6c757d' : ''
                          }}
                        >
                          <span>
                            {user && (() => {
                              // Check if current product+size combination is in cart
                              if (!selectedSize) {
                                // If no size is selected, don't show as added
                                return "Add to cart";
                              }
                              
                              // Use the new cart checking function
                              const productDocumentId = safeProduct.documentId;
                              const variantId = (activeVariant && !activeVariant.isCurrentProduct) ? activeVariant.id : null;
                              const isInCart = isProductSizeInCart(productDocumentId, selectedSize, variantId);
                              
                              return isInCart ? "Added" : "Add to cart";
                            })() || "Add to cart"}
                          </span>
                        </a>
                        <a
                          href="#compare"
                          data-bs-toggle="offcanvas"
                          aria-controls="compare"
                          onClick={handleCompareClick}
                          className="box-icon hover-tooltip compare btn-icon-action"
                        >
                          <span className="icon icon-gitDiff" />
                          <span className="tooltip text-caption-2">
                            {(() => {
                              // Check compare status - use same logic as cart
                              if (!selectedSize) {
                                return "Compare";
                              }
                              
                              const productDocumentId = safeProduct.documentId;
                              const variantId = (activeVariant && !activeVariant.isCurrentProduct) ? activeVariant.id : null;
                              
                              // For compare, we still use the old ID-based logic since compare doesn't store size info
                              let checkId;
                              const baseId = safeProduct.documentId || safeProduct.id;
                              if (activeVariant && !activeVariant.isCurrentProduct) {
                                const baseVariantId = `${baseId}-variant-${activeVariant.id}`;
                                checkId = selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;
                              } else {
                                checkId = selectedSize ? `${baseId}-size-${selectedSize}` : baseId;
                              }
                              
                              return isAddedtoCompareItem(checkId) ? "Already Compared" : "Compare";
                            })()}
                          </span>
                        </a>
                        <a
                          onClick={handleWishlistClick}
                          className="box-icon hover-tooltip text-caption-2 wishlist btn-icon-action"
                          style={{ height: "46px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <span className="icon icon-heart" />
                          <span className="tooltip text-caption-2">
                            {user && (() => {
                              // Check wishlist status - use same logic as cart
                              if (!selectedSize) {
                                return "Wishlist";
                              }
                              
                              const productDocumentId = safeProduct.documentId;
                              const variantId = (activeVariant && !activeVariant.isCurrentProduct) ? activeVariant.id : null;
                              
                              // For wishlist, we still use the old ID-based logic since wishlist doesn't store size info
                              let checkId;
                              const baseId = safeProduct.documentId || safeProduct.id;
                              if (activeVariant && !activeVariant.isCurrentProduct) {
                                const baseVariantId = `${baseId}-variant-${activeVariant.id}`;
                                checkId = selectedSize ? `${baseVariantId}-size-${selectedSize}` : baseVariantId;
                              } else {
                                checkId = selectedSize ? `${baseId}-size-${selectedSize}` : baseId;
                              }
                              
                              return isAddedtoWishlist(checkId) ? "Already Wishlisted" : "Wishlist";
                            })()}
                          </span>
                        </a>
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
                            marginLeft: "10px"
                          }}
                        >
                          Custom Order
                        </button>
                      </div>
                    </div>
                    
                    <div className="tf-product-info-help">
                      <div className="tf-product-info-extra-link">
                        <a
                          href="#delivery_return"
                          data-bs-toggle="modal"
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
                          href="#ask_question"
                          data-bs-toggle="modal"
                          className="tf-product-extra-icon"
                        >
                          <div className="icon">
                            <i className="icon-question" />
                          </div>
                          <p className="text-caption-1">Ask A Question</p>
                        </a>
                        <a
                          href="#share_social"
                          data-bs-toggle="modal"
                          className="tf-product-extra-icon"
                        >
                          <div className="icon">
                            <i className="icon-share" />
                          </div>
                          <p className="text-caption-1">Share</p>
                        </a>
                      </div>
                      <div className="tf-product-info-time">
                        <div className="icon">
                          <i className="icon-timer" />
                        </div>
                        <p className="text-caption-1">
                          Estimated Delivery:&nbsp;&nbsp;<span>12-26 days</span>
                          (International), <span>3-6 days</span> (United States)
                        </p>
                      </div>
                      <div className="tf-product-info-return">
                        <div className="icon">
                          <i className="icon-arrowClockwise" />
                        </div>
                        <p className="text-caption-1">
                          Return within <span>45 days</span> of purchase. Duties
                          &amp; taxes are non-refundable.
                        </p>
                      </div>
                      <div className="dropdown dropdown-store-location">
                        <div
                          className="dropdown-title dropdown-backdrop"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                        >
                          <div className="tf-product-info-view link">
                            <div className="icon">
                              <i className="icon-map-pin" />
                            </div>
                            <span>View Store Information</span>
                          </div>
                        </div>
                        <div className="dropdown-menu dropdown-menu-end">
                          <div className="dropdown-content">
                            <div className="dropdown-content-heading">
                              <h5>Store Location</h5>
                              <i className="icon icon-close" />
                            </div>
                            <div className="line-bt" />
                            <div>
                              <h6>Fashion Traditional Alley</h6>
                              <p>Pickup available. Usually ready in 24 hours</p>
                            </div>
                            <div>
                              <p>766 Rosalinda Forges Suite 044,</p>
                              <p>Gracielahaven, Oregon</p>
                            </div>
                          </div>
                        </div>
                      </div>
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
                      <li>
                        <p className="text-caption-1">Categories:</p>
                        <p className="text-caption-1">
                          <a href="#" className="text-1 link">
                            Clothes
                          </a>
                          ,
                          <a href="#" className="text-1 link">
                            women
                          </a>
                          ,
                          <a href="#" className="text-1 link">
                            T-shirt
                          </a>
                        </p>
                      </li>
                    </ul>
                    <div className="tf-product-info-guranteed">
                      <div className="text-title">Guranteed safe checkout:</div>
                      <div className="tf-payment">
                        <img
                          alt="NPS"
                          src="/nps.png"
                          className="w-16 h-8 object-contain"
                        />
                      </div>
                    </div>
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
