"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getVariantAwareTitle } from "../../utils/titleUtils";
import CountdownTimer from "../common/Countdown";
import { useContextElement } from "@/context/Context";
import { fetchDataFromApi } from "@/utils/api";
import { PRODUCT_BY_DOCUMENT_ID_API } from "@/utils/urls";
import { getBestImageUrl } from "@/utils/imageUtils";
import PriceDisplay from "@/components/common/PriceDisplay";
import TopPicksEmptyCart from "@/components/common/TopPicksEmptyCart";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

const discounts = [
  {
    discount: "10% OFF",
    details: "For all orders from 200$",
    code: "Mo234231",
  },
  {
    discount: "10% OFF",
    details: "For all orders from 200$",
    code: "Mo234231",
  },
  {
    discount: "10% OFF",
    details: "For all orders from 200$",
    code: "Mo234231",
  },
];

// Define a default shipping option with zero price
const shippingOptions = [
  {
    id: "free",
    label: "Free Shipping",
    price: 0.0,
  }
];

// Function to get small format image URL from product image object
const getThumbnailImageUrl = (imgSrc) => {
  // Return null if no image source provided - let component handle fallback
  if (!imgSrc) return null;
  
  // If it's already a string URL, check if we can convert it to small format
  if (typeof imgSrc === 'string') {
    // If it contains medium_ or large_, replace with small_
    if (imgSrc.includes('/medium_') || imgSrc.includes('/large_')) {
      return imgSrc.replace(/\/(medium|large)_/, '/small_');
    }
    // If it's a regular upload URL without size prefix, add small_ prefix
    if (imgSrc.includes('/uploads/') && !imgSrc.includes('/small_') && !imgSrc.includes('/medium_') && !imgSrc.includes('/large_') && !imgSrc.includes('/thumbnail_')) {
      return imgSrc.replace('/uploads/', '/uploads/small_');
    }
    return imgSrc;
  }
  
  // If it's an object with formats, prioritize small format
  if (imgSrc && typeof imgSrc === 'object') {
    // Prioritize small format for better performance in cart
    if (imgSrc.formats && imgSrc.formats.small && imgSrc.formats.small.url) {
      return imgSrc.formats.small.url.startsWith('http') 
        ? imgSrc.formats.small.url 
        : `${API_URL}${imgSrc.formats.small.url}`;
    }
    // Fallback to thumbnail if small not available
    else if (imgSrc.formats && imgSrc.formats.thumbnail && imgSrc.formats.thumbnail.url) {
      return imgSrc.formats.thumbnail.url.startsWith('http') 
        ? imgSrc.formats.thumbnail.url 
        : `${API_URL}${imgSrc.formats.thumbnail.url}`;
    }
    // Fallback to medium if neither small nor thumbnail available
    else if (imgSrc.formats && imgSrc.formats.medium && imgSrc.formats.medium.url) {
      return imgSrc.formats.medium.url.startsWith('http') 
        ? imgSrc.formats.medium.url 
        : `${API_URL}${imgSrc.formats.medium.url}`;
    }
    // Fallback to original URL with small_ prefix added
    else if (imgSrc.url) {
      let originalUrl = imgSrc.url.startsWith('http') 
        ? imgSrc.url 
        : `${API_URL}${imgSrc.url}`;
      
      // Try to convert original URL to small format
      if (originalUrl.includes('/medium_') || originalUrl.includes('/large_')) {
        return originalUrl.replace(/\/(medium|large)_/, '/small_');
      }
      // If it's a regular upload URL, add small_ prefix
      else if (originalUrl.includes('/uploads/') && !originalUrl.includes('/small_') && !originalUrl.includes('/medium_') && !originalUrl.includes('/large_') && !originalUrl.includes('/thumbnail_')) {
        return originalUrl.replace('/uploads/', '/uploads/small_');
      }
      return originalUrl;
    }
  }
  
  // Return null if nothing works - let component handle fallback
  return null;
};

export default function ShopCart() {
  const [activeDiscountIndex, setActiveDiscountIndex] = useState(1);
  const [selectedOption, setSelectedOption] = useState(shippingOptions[0]);
  const [showTopPicks, setShowTopPicks] = useState(false);
  const {
    cartProducts,
    setCartProducts,
    updateQuantity,
    removeFromCart,
    totalPrice,
    selectedCartItems,
    toggleCartItemSelection,
    selectAllCartItems,
    getSelectedCartItems,
    getSelectedItemsTotal,
    isCartLoading,
    cartLoadedOnce
  } = useContextElement();
  const [selectedColors, setSelectedColors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  const [isAgreed, setIsAgreed] = useState(false);
  
  // State for tracking oldPrice update status
  const [updateStatus, setUpdateStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  
  // Add state to store products with updated oldPrice values
  const [productsWithOldPrice, setProductsWithOldPrice] = useState({});

  // Build product detail URL with preferred variant when applicable
  const buildProductDetailHref = (item) => {
    const baseId = item.baseProductId || item.documentId;
    const variantId = item?.variantInfo?.documentId || item?.variantInfo?.variantId || null;
    return `/product-detail/${baseId}${variantId ? `?variant=${variantId}` : ''}`;
  };
  
  // Fetch product details for each cart item to get accurate oldPrice
  useEffect(() => {
    async function fetchProductDetails() {
      const updatedProducts = {};
      
      for (const product of cartProducts) {
        if (product.documentId) {
          try {
            // Only use direct API fetch with documentId
            const productEndpoint = `/api/products?filters[documentId][$eq]=${product.documentId}`;
            
            const response = await fetchDataFromApi(productEndpoint);
            
            if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
              const productData = response.data[0];
              
              // Check if oldPrice exists in the API response
              if (productData.oldPrice) {
                updatedProducts[product.id] = {
                  ...product,
                  oldPrice: parseFloat(productData.oldPrice)
                };
              }
            }
          } catch (error) {
            // Silent error handling
          }
        }
      }
      
      setProductsWithOldPrice(updatedProducts);
    }
    
    if (cartProducts.length > 0) {
      fetchProductDetails();
    }
  }, [cartProducts]);
  
  useEffect(() => {
    const initialColors = {};
    const initialSizes = {};
    
    cartProducts.forEach(product => {
      if (product.colors && product.colors.length > 0) {
        const colorName = typeof product.colors[0] === 'string' 
          ? product.colors[0] 
          : (product.colors[0].name || '');
        initialColors[product.id] = colorName;
      }
      
      if (product.sizes && product.sizes.length > 0) {
        initialSizes[product.id] = product.sizes[0];
      }
    });
    
    setSelectedColors(initialColors);
    setSelectedSizes(initialSizes);
  }, [cartProducts]);
  
  const handleColorChange = (productId, color) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: color
    }));
  };
  
  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const setQuantity = (id, quantity) => {
    // Don't allow quantities less than 1
    if (quantity < 1) return;
    
    // Use the updateQuantity function from Context
    updateQuantity(id, quantity);
  };
  
  const removeItem = (id, cartDocumentId) => {
    removeFromCart(id, cartDocumentId);
  };
  
  const handleOptionChange = (elm) => {
    setSelectedOption(elm);
  };

  // Function to update product oldPrice in the database
  const updateProductOldPrice = async (productId, documentId, oldPrice) => {
    try {
      setUpdateStatus({ loading: true, success: false, error: null });
      
      // Call our API endpoint to update the product
      const response = await fetch('/api/update-product-old-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          documentId,
          oldPrice
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }
      
      const data = await response.json();
      
      setUpdateStatus({ loading: false, success: true, error: null });
      
      // Refresh cart products to show the updated oldPrice
      setCartProducts(prevProducts => 
        prevProducts.map(product => {
          if ((product.id == productId) || 
              (product.documentId === documentId)) {
            return {
              ...product,
              oldPrice: parseFloat(oldPrice)
            };
          }
          return product;
        })
      );
    } catch (error) {
      setUpdateStatus({ loading: false, success: false, error: error.message });
    }
  };

  // Calculate subtotal: sum of oldPrice (if available) or price, times quantity
  const subtotal = cartProducts.reduce((acc, product) => {
    const fetchedProduct = productsWithOldPrice[product.id];
    const priceToUse = fetchedProduct?.oldPrice ? parseFloat(fetchedProduct.oldPrice) : parseFloat(product.price);
    return acc + priceToUse * product.quantity;
  }, 0);

  // Calculate actual total: sum of price * quantity
  const actualTotal = cartProducts.reduce((acc, product) => acc + parseFloat(product.price) * product.quantity, 0);

  // Calculate total discounts: subtotal - actualTotal (if positive)
  const totalDiscounts = subtotal > actualTotal ? subtotal - actualTotal : 0;

  // Check if all items are selected
  const areAllItemsSelected = cartProducts.length > 0 && cartProducts.every(product => selectedCartItems[product.id] !== false);
  
  // Handler for the "select all" checkbox
  const handleSelectAll = (e) => {
    selectAllCartItems(e.target.checked);
  };
  
  // Calculate selected items count
  const selectedItemsCount = getSelectedCartItems().length;

  return (
    <>
      <section className="flat-spacing">
        <div className="container">
          {updateStatus.loading && (
            <div className="alert alert-info" role="alert">
              Updating product price...
            </div>
          )}
          {updateStatus.success && (
            <div className="alert alert-success" role="alert">
              Product price updated successfully! The original price will now be permanently saved.
            </div>
          )}
          {updateStatus.error && (
            <div className="alert alert-danger" role="alert">
              Error updating product price: {updateStatus.error}
            </div>
          )}
          
          <div className="row g-4">
            <div className="col-xl-8">
              {isCartLoading ? (
                <div className="cart-loading text-center py-5 bg-white rounded-4 shadow-sm">
                  <div className="spinner-border text-dark" role="status">
                    <span className="visually-hidden">Loading cart...</span>
                  </div>
                  <p className="mt-3 text-secondary fw-500">Loading your cart...</p>
                </div>
              ) : cartProducts.length ? (
                <form onSubmit={(e) => e.preventDefault()}>
                  {/* Minimal Select All Top Bar */}
                  <div className="minimal-cart-header d-flex justify-content-between align-items-center mb-3 p-3 bg-white rounded-4 shadow-sm">
                    <label className="d-flex align-items-center gap-3 cursor-pointer m-0 select-all-label">
                      <div className="modern-checkbox" onClick={(e) => { e.preventDefault(); selectAllCartItems(!areAllItemsSelected); }}>
                        <input 
                          type="checkbox" 
                          className="tf-check-rounded"
                          checked={areAllItemsSelected}
                          readOnly
                          id="select-all-products"
                          style={{ display: 'none' }}
                        />
                        <span className="custom-checkmark"></span>
                      </div>
                      <span className="fw-600 text-dark" style={{ fontSize: '15px' }}>
                        Select All Items ({selectedItemsCount}/{cartProducts.length})
                      </span>
                    </label>
                  </div>

                  {/* Minimal Cart Item Cards List */}
                  <div className="minimal-cart-list d-flex flex-column gap-3">
                    {cartProducts.map((elm, i) => {
                      const categoryName = elm.category || elm.productType || elm.variantInfo?.category || "Traditional Alley";
                      const variantSpecs = [elm.selectedSize || elm.variantInfo?.size, elm.selectedColor || elm.variantInfo?.color].filter(Boolean).join(' ');

                      return (
                        <div key={elm.id || i} className="minimal-cart-card p-3 p-md-4 bg-white rounded-4 shadow-sm position-relative d-flex align-items-center gap-3 gap-md-4">
                          {/* Selection Checkbox */}
                          <div className="cart-item-checkbox flex-shrink-0">
                            <label className="modern-checkbox" onClick={(e) => { e.preventDefault(); toggleCartItemSelection(elm.id); }}>
                              <input 
                                type="checkbox" 
                                className="tf-check-rounded"
                                checked={selectedCartItems[elm.id] !== undefined ? selectedCartItems[elm.id] : (elm.isSelected !== undefined ? elm.isSelected : true)}
                                readOnly
                                id={`select-product-${elm.id}`}
                                style={{ display: 'none' }}
                              />
                              <span className="custom-checkmark"></span>
                            </label>
                          </div>

                          {/* Product Image */}
                          <Link href={buildProductDetailHref(elm)} className="minimal-cart-img-wrapper flex-shrink-0">
                            {!isCartLoading && (elm.variantInfo?.imgSrc || elm.imgSrc) ? (
                              <Image
                                alt={getVariantAwareTitle(elm)}
                                src={getThumbnailImageUrl(elm.variantInfo?.imgSrc || elm.imgSrc) || '/images/products/default-product.jpg'}
                                width={120}
                                height={120}
                                priority={true}
                                loading="eager"
                                className="minimal-cart-img rounded-3"
                                style={{ objectFit: 'cover' }}
                                unoptimized={false}
                                onError={(e) => {
                                  e.target.src = '/images/products/default-product.jpg';
                                }}
                              />
                            ) : (
                              <div className="minimal-cart-img-placeholder rounded-3 bg-light d-flex align-items-center justify-content-center">
                                <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                              </div>
                            )}
                          </Link>

                          {/* Details & Actions Content */}
                          <div className="minimal-cart-details flex-grow-1 min-w-0 d-flex flex-column gap-2">
                            {/* Top row: Category & Variant specs */}
                            <div className="d-flex justify-content-between align-items-start gap-2">
                              <span className="minimal-category text-uppercase text-muted fw-500" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                                {categoryName}
                              </span>
                              {variantSpecs && (
                                <span className="minimal-variant text-muted text-end fw-500" style={{ fontSize: '13px' }}>
                                  {variantSpecs}
                                </span>
                              )}
                            </div>

                            {/* Middle row: Title */}
                            <Link href={buildProductDetailHref(elm)} className="minimal-title text-dark fw-600 text-decoration-none text-truncate" style={{ fontSize: '16px', lineHeight: '1.3' }}>
                              {getVariantAwareTitle(elm)}
                            </Link>

                            {/* Bottom row: Price & Controls */}
                            <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                              <div className="minimal-price text-dark fw-700" style={{ fontSize: '18px' }}>
                                <PriceDisplay 
                                  price={elm.price * elm.quantity}
                                  oldPrice={productsWithOldPrice[elm.id]?.oldPrice ? productsWithOldPrice[elm.id].oldPrice * elm.quantity : (elm.oldPrice ? elm.oldPrice * elm.quantity : null)}
                                  className="text-dark fw-700"
                                  size="normal"
                                />
                              </div>

                              <div className="d-flex align-items-center gap-3">
                                {/* Quantity Pill */}
                                <div className="minimal-qty-pill d-flex align-items-center bg-light px-3 py-1 rounded-3">
                                  <button 
                                    type="button" 
                                    className="qty-btn border-0 bg-transparent text-secondary p-0 fw-600 fs-5"
                                    onClick={() => setQuantity(elm.id, elm.quantity - 1)}
                                    style={{ width: '24px', lineHeight: '1', cursor: 'pointer' }}
                                  >
                                    -
                                  </button>
                                  <span className="qty-val px-2 fw-600 text-dark" style={{ minWidth: '24px', textAlign: 'center', fontSize: '14px' }}>
                                    {elm.quantity}
                                  </span>
                                  <button 
                                    type="button" 
                                    className="qty-btn border-0 bg-transparent text-secondary p-0 fw-600 fs-5"
                                    onClick={() => setQuantity(elm.id, elm.quantity + 1)}
                                    style={{ width: '24px', lineHeight: '1', cursor: 'pointer' }}
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Trash Delete Button */}
                                <button 
                                  type="button" 
                                  className="minimal-delete-btn border-0 d-flex align-items-center justify-content-center rounded-circle"
                                  onClick={() => removeItem(elm.id, elm.cartDocumentId)}
                                  aria-label="Remove item"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </form>
              ) : (
                <div className="empty-cart-section bg-white p-5 rounded-4 shadow-sm text-center">
                  {!showTopPicks ? (
                    <div className="empty-cart text-center py-4">
                      <div className="empty-cart-icon mb-3 text-muted" style={{ fontSize: '48px' }}>
                        🛒
                      </div>
                      <h3 className="mb-2 fw-600">Your cart is empty</h3>
                      <p className="text-secondary mb-4">Add some products to your cart to continue shopping</p>
                      <button 
                        className="tf-btn rounded-3 px-4 py-2"
                        onClick={() => setShowTopPicks(true)}
                      >
                        <span className="text">Shop Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="top-picks-section text-start">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0 fw-600">Top Picks for You</h3>
                        <button 
                          className="btn btn-outline-secondary btn-sm rounded-3"
                          onClick={() => setShowTopPicks(false)}
                        >
                          Back to Cart
                        </button>
                      </div>
                      <TopPicksEmptyCart isModal={false} maxProducts={8} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="col-xl-4">
              {isCartLoading ? (
                <div className="cart-summary-loading text-center p-4 bg-white rounded-4 shadow-sm">
                  <div className="spinner-border spinner-border-sm text-dark" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-secondary">Loading cart summary...</p>
                </div>
              ) : (
                <div className="fl-sidebar-cart sticky-top" style={{ top: '20px' }}>
                  <div className="box-order bg-white p-4 rounded-4 shadow-sm border-0">
                    <h5 className="title fw-700 text-dark mb-4" style={{ fontSize: '18px' }}>Order Summary</h5>
                    <div className="subtotal text-button d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                      <span className="text-secondary fw-500">Selected Items</span>
                      <span className="fw-600 text-dark">{selectedItemsCount}/{cartProducts.length}</span>
                    </div>
                    <div className="subtotal text-button d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                      <span className="text-secondary fw-500">Subtotal</span>
                      <span className="total fw-600 text-dark">
                        <PriceDisplay 
                          price={getSelectedItemsTotal()}
                          className="text-button fw-600"
                          size="normal"
                        />
                      </span>
                    </div>
                    <div className="discount text-button d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                      <span className="text-secondary fw-500">Total Discounts</span>
                      <span className="total text-success fw-600">$0.00</span>
                    </div>
                    <div className="total-order d-flex justify-content-between align-items-center py-3 my-2">
                      <div>
                        <span className="fw-700 text-dark d-block" style={{ fontSize: '16px' }}>Total</span>
                        <span className="text-muted" style={{ fontSize: '12px' }}>(Without Shipping Charges)</span>
                      </div>
                      <span className="total fw-700 text-dark" style={{ fontSize: '20px' }}>
                        <PriceDisplay 
                          price={getSelectedItemsTotal()}
                          className="text-button fw-700"
                          size="normal"
                        />
                      </span>
                    </div>
                    <div className="box-progress-checkout mt-3">
                      <fieldset className="check-agree mb-3 d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          id="check-agree"
                          className="tf-check-rounded"
                          checked={isAgreed}
                          onChange={e => setIsAgreed(e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <label htmlFor="check-agree" className="m-0 text-secondary" style={{ fontSize: '13px', cursor: 'pointer' }}>
                          I agree with the&nbsp;
                          <Link href={`/term-of-use`} className="text-dark fw-600 text-underline">terms and conditions</Link>
                        </label>
                      </fieldset>
                      <Link 
                        href={isAgreed && selectedItemsCount > 0 ? "/checkout" : "#"} 
                        className="tf-btn w-100 py-3 rounded-3 fw-600 justify-content-center" 
                        style={{ 
                          pointerEvents: (isAgreed && selectedItemsCount > 0) ? 'auto' : 'none', 
                          opacity: (isAgreed && selectedItemsCount > 0) ? 1 : 0.5,
                          backgroundColor: '#1c1c1e',
                          color: '#ffffff',
                          fontSize: '15px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        Process To Checkout
                      </Link>
                      {selectedItemsCount === 0 && (
                        <div className="text-warning mt-2 text-center" style={{ fontSize: '13px' }}>
                          Please select at least one product
                        </div>
                      )}
                      <p className="text-center mt-3 mb-0">
                        <Link href="/shop-default-grid" className="text-secondary fw-500 text-decoration-none hover-dark" style={{ fontSize: '13px' }}>
                          Or continue shopping →
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <style jsx>{`
        .minimal-cart-card {
          border: 1px solid #f0f0f4;
          transition: all 0.2s ease;
        }
        .minimal-cart-card:hover {
          border-color: #e2e2e8;
          box-shadow: 0 4px 16px rgba(0,0,0,0.05) !important;
        }
        .minimal-cart-img-wrapper {
          width: 84px;
          height: 84px;
          overflow: hidden;
          position: relative;
          background-color: #f8f9fa;
          border-radius: 12px;
        }
        .minimal-cart-img {
          width: 100%;
          height: 100%;
          transition: transform 0.3s ease;
        }
        .minimal-cart-card:hover .minimal-cart-img {
          transform: scale(1.04);
        }
        .minimal-cart-img-placeholder {
          width: 100%;
          height: 100%;
        }
        .minimal-qty-pill {
          background-color: #f2f2f7;
          border: 1px solid #e5e5ea;
          border-radius: 10px;
        }
        .qty-btn:hover {
          color: #000 !important;
        }
        .minimal-delete-btn {
          width: 38px;
          height: 38px;
          background-color: #fdeded;
          color: #e53935;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .minimal-delete-btn:hover {
          background-color: #fcc;
          color: #d32f2f;
          transform: scale(1.05);
        }
        .modern-checkbox {
          display: inline-block;
          position: relative;
          cursor: pointer;
          width: 22px;
          height: 22px;
        }
        .modern-checkbox input[type="checkbox"]:checked + .custom-checkmark {
          background: #1c1c1e;
          border-color: #1c1c1e;
        }
        .custom-checkmark {
          display: block;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 2px solid #ccc;
          background: #fff;
          transition: all 0.2s ease;
          position: relative;
        }
        .modern-checkbox input[type="checkbox"]:checked + .custom-checkmark:after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 6px;
          height: 11px;
          border: solid #fff;
          border-width: 0 2.5px 2.5px 0;
          border-radius: 1px;
          transform: rotate(45deg);
        }
        @media (max-width: 576px) {
          .minimal-cart-card {
            padding: 12px !important;
          }
          .minimal-cart-img-wrapper {
            width: 70px;
            height: 70px;
          }
          .minimal-title {
            font-size: 14px !important;
          }
          .minimal-price {
            font-size: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
