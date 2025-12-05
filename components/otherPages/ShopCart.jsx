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
  const areAllItemsSelected = cartProducts.length > 0 && cartProducts.every(product => selectedCartItems[product.id]);
  
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
          
          <div className="row">
            <div className="col-xl-8">
              {isCartLoading ? (
                <div className="cart-loading text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading cart...</span>
                  </div>
                  <p className="mt-3">Loading your cart...</p>
                </div>
              ) : cartProducts.length ? (
                <form onSubmit={(e) => e.preventDefault()}>
                  <table className="tf-table-page-cart">
                    <thead>
                      <tr>
                        <th style={{ width: "40px" }}>
                          <label className="modern-checkbox">
                            <input 
                              type="checkbox" 
                              className="tf-check-rounded"
                              checked={areAllItemsSelected}
                              onChange={handleSelectAll}
                              id="select-all-products"
                              style={{ display: 'none' }}
                            />
                            <span className="custom-checkmark"></span>
                          </label>
                        </th>
                        <th>Products</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {cartProducts.map((elm, i) => (
                        <tr key={i} className="tf-cart-item file-delete">
                          <td style={{ textAlign: "center" }}>
                            <label className="modern-checkbox">
                              <input 
                                type="checkbox" 
                                className="tf-check-rounded"
                                checked={selectedCartItems[elm.id] || false}
                                onChange={() => toggleCartItemSelection(elm.id)}
                                id={`select-product-${elm.id}`}
                                style={{ display: 'none' }}
                              />
                              <span className="custom-checkmark"></span>
                            </label>
                          </td>
                          <td className="tf-cart-item_product">
                            <Link
                              href={`/product-detail/${elm.documentId || elm.baseProductId}`}
                              className="img-box"
                            >
                              {!isCartLoading && (elm.variantInfo?.imgSrc || elm.imgSrc) ? (
                                <Image
                                  alt="product"
                                  src={getThumbnailImageUrl(elm.variantInfo?.imgSrc || elm.imgSrc) || '/images/products/default-product.jpg'}
                                  width={600}
                                  height={800}
                                  priority={true}
                                  loading="eager"
                                  style={{ objectFit: 'cover' }}
                                  unoptimized={false}
                                  placeholder="empty"
                                  onError={(e) => {
                                    console.log('Image failed to load:', e.target.src);
                                    e.target.src = '/images/products/default-product.jpg';
                                  }}
                                />
                              ) : (
                                <div 
                                  style={{ 
                                    width: '100%', 
                                    height: '200px', 
                                    backgroundColor: '#f8f9fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading image...</span>
                                  </div>
                                </div>
                              )}
                            </Link>
                            <div className="cart-info">
                              <Link
                                href={`/product-detail/${elm.documentId || elm.baseProductId}`}
                                className="cart-title link"
                              >
                                {getVariantAwareTitle(elm)}
                              </Link>

                              {elm.selectedSize && (
                                <div className="text-caption-2 text-secondary mb-2">
                                  Size: {elm.selectedSize}
                                </div>
                              )}
                            </div>
                          </td>
                          <td
                            data-cart-title="Price"
                            className="tf-cart-item_price text-center"
                          >
                            <div className="cart-price text-button price-on-sale">
                              <PriceDisplay 
                                price={elm.price}
                                oldPrice={productsWithOldPrice[elm.id]?.oldPrice}
                                className="text-button"
                                size="normal"
                              />
                            </div>
                          </td>
                          <td
                            data-cart-title="Quantity"
                            className="tf-cart-item_quantity"
                          >
                            <div className="wg-quantity mx-md-auto">
                              <span
                                className="btn-quantity btn-decrease"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity - 1)
                                }
                              >
                                -
                              </span>
                              <input
                                type="text"
                                className="quantity-product"
                                name="number"
                                value={elm.quantity}
                                readOnly
                              />
                              <span
                                className="btn-quantity btn-increase"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity + 1)
                                }
                              >
                                +
                              </span>
                            </div>
                          </td>
                          <td
                            data-cart-title="Total"
                            className="tf-cart-item_total text-center"
                          >
                            <div className="cart-total text-button total-price">
                              <PriceDisplay 
                                price={elm.price * elm.quantity}
                                className="text-button"
                                size="normal"
                              />
                            </div>
                          </td>
                          <td
                            data-cart-title="Remove"
                            className="remove-cart"
                            onClick={() => removeItem(elm.id, elm.cartDocumentId)}
                          >
                            <span className="remove icon icon-close" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* <div className="ip-discount-code">
                    <input type="text" placeholder="Add voucher discount" />
                    <button className="tf-btn">
                      <span className="text">Apply Code</span>
                    </button>
                  </div> */}
                  {/* <div className="group-discount">
                    {discounts.map((item, index) => (
                      <div
                        key={index}
                        className={`box-discount ${
                          activeDiscountIndex === index ? "active" : ""
                        }`}
                        onClick={() => setActiveDiscountIndex(index)}
                      >
                        <div className="discount-top">
                          <div className="discount-off">
                            <div className="text-caption-1">Discount</div>
                            <span className="sale-off text-btn-uppercase">
                              {item.discount}
                            </span>
                          </div>
                          <div className="discount-from">
                            <p className="text-caption-1">{item.details}</p>
                          </div>
                        </div>
                        <div className="discount-bot">
                          <span className="text-btn-uppercase">
                            {item.code}
                          </span>
                          <button className="tf-btn">
                            <span className="text">Apply Code</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div> */}
                </form>
              ) : (
                <div className="empty-cart-section">
                  {!showTopPicks ? (
                    <div className="empty-cart text-center">
                      <h3 className="mt-5 mb-3">Your cart is empty</h3>
                      <p className="mb-5">Add some products to your cart to continue shopping</p>
                      <button 
                        className="tf-btn"
                        onClick={() => setShowTopPicks(true)}
                      >
                        <span className="text">Shop Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="top-picks-section">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">Top Picks for You</h3>
                        <button 
                          className="btn btn-outline-secondary btn-sm"
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
                <div className="cart-summary-loading text-center">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading cart summary...</p>
                </div>
              ) : (
                <div className="fl-sidebar-cart">
                  <div className="box-order bg-surface">
                    <h5 className="title">Order Summary</h5>
                    <div className="subtotal text-button d-flex justify-content-between align-items-center">
                      <span>Selected Items ({selectedItemsCount}/{cartProducts.length})</span>
                    </div>
                    <div className="subtotal text-button d-flex justify-content-between align-items-center">
                      <span>Subtotal</span>
                      <span className="total">
                        <PriceDisplay 
                          price={getSelectedItemsTotal()}
                        className="text-button"
                        size="normal"
                      />
                    </span>
                  </div>
                  <div className="discount text-button d-flex justify-content-between align-items-center">
                    <span>Total Discounts</span>
                    <span className="total">$0.00</span>
                  </div>
                  <h5 className="total-order d-flex justify-content-between align-items-center">
                    <span>Total<br />(Without Shipping Charges)</span>
                    <span className="total">
                      <PriceDisplay 
                        price={getSelectedItemsTotal()}
                        className="text-button"
                        size="normal"
                      />
                    </span>
                  </h5>
                  <div className="box-progress-checkout">
                    <fieldset className="check-agree">
                      <input
                        type="checkbox"
                        id="check-agree"
                        className="tf-check-rounded"
                        checked={isAgreed}
                        onChange={e => setIsAgreed(e.target.checked)}
                      />
                      <label htmlFor="check-agree">
                        I agree with the&nbsp;
                        <Link href={`/term-of-use`}>terms and conditions</Link>
                      </label>
                    </fieldset>
                    <Link 
                      href={isAgreed && selectedItemsCount > 0 ? "/checkout" : "#"} 
                      className="tf-btn btn-reset" 
                      style={{ 
                        pointerEvents: (isAgreed && selectedItemsCount > 0) ? 'auto' : 'none', 
                        opacity: (isAgreed && selectedItemsCount > 0) ? 1 : 0.5 
                      }}
                    >
                      Process To Checkout
                    </Link>
                    {selectedItemsCount === 0 && (
                      <div className="text-warning mt-2 text-center">
                        Please select at least one product
                      </div>
                    )}
                    <p className="text-button text-center">
                      Or continue shopping
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
        .modern-checkbox {
          display: inline-block;
          position: relative;
          cursor: pointer;
          width: 24px;
          height: 24px;
        }
        .modern-checkbox input[type="checkbox"]:checked + .custom-checkmark {
          background: #fff;
          border-color: #22c55e;
        }
        .custom-checkmark {
          display: block;
          width: 24px;
          height: 24px;
          border-radius: 8px;
          border: 2px solid #bbb;
          background: #fff;
          transition: all 0.2s cubic-bezier(.4,2,.6,1);
          position: relative;
        }
        .modern-checkbox input[type="checkbox"]:checked + .custom-checkmark:after {
          content: '';
          position: absolute;
          left: 7px;
          top: 3px;
          width: 6px;
          height: 12px;
          border: solid #22c55e;
          border-width: 0 3px 3px 0;
          border-radius: 2px;
          transform: rotate(45deg);
          transition: border-color 0.2s;
        }
        .custom-checkmark:after {
          content: '';
          position: absolute;
          left: 7px;
          top: 3px;
          width: 6px;
          height: 12px;
          border: solid transparent;
          border-width: 0 3px 3px 0;
          border-radius: 2px;
          transform: rotate(45deg);
          transition: border-color 0.2s;
        }
      `}</style>
    </>
  );
}
