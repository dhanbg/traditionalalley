"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import { products41 } from "@/data/productsWomen";
import { useSession, signIn } from "next-auth/react";
import { fetchDataFromApi } from "@/utils/api";
import { PRODUCT_BY_DOCUMENT_ID_API, API_URL } from "@/utils/urls";
import { getImageUrl } from "@/utils/imageUtils";
import { useRouter } from "nextjs-toploader/app";
import PriceDisplay from "@/components/common/PriceDisplay";
import { useCartImagePreloader } from "@/hooks/useCartImagePreloader";
import imagePreloader from "@/utils/imagePreloader";
import FallbackImage from "@/components/common/FallbackImage";
import TopPicksEmptyCart from "@/components/common/TopPicksEmptyCart";
import { getVariantAwareTitle } from "@/utils/titleUtils";

export default function CartModal() {
  const {
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    user,
    removeFromCart,
    cartRefreshKey,
    isCartClearing,
    cartClearedTimestamp,
    isCartLoading,
  } = useContextElement();
  const { data: session } = useSession();
  const [userCarts, setUserCarts] = useState([]);
  // Removed local server cart state as we now use Context state
  const [currentOpenPopup, setCurrentOpenPopup] = useState("");
  const [isModalInert, setIsModalInert] = useState(true);
  // Removed serverTotalPrice state
  const router = useRouter();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isViewCartLoading, setIsViewCartLoading] = useState(false);
  const [showTopPicks, setShowTopPicks] = useState(false);

  // Build product detail URL with preferred variant when applicable
  const buildProductDetailHref = (item) => {
    const baseId = item.baseProductId || item.documentId;
    const variantId = item?.variantInfo?.documentId || item?.variantInfo?.variantId || null;
    return `/product-detail/${baseId}${variantId ? `?variant=${variantId}` : ''}`;
  };

  // Initialize image preloader for cart modal
  const modalImagePreloader = useCartImagePreloader(cartProducts, {
    autoPreload: true,
    delay: 100,
    preloadOptions: {
      timeout: 6000,
      crossOrigin: 'anonymous'
    },
    onComplete: (stats) => {
      console.log(`🖼️ Cart modal images preloaded: ${stats.successful}/${stats.total}`);
    }
  });

  const removeItem = (id, cartDocumentId) => {
    // Find the item in the cart to confirm it exists before removing
    const itemToRemove = displayProducts.find(item =>
      item.id == id ||
      (item.documentId === id) ||
      (item.cartDocumentId === cartDocumentId)
    );

    if (itemToRemove) {
      // Use the removeFromCart function from Context to handle backend deletion
      // Context will update cartProducts state

      // Use the removeFromCart function from Context to handle backend deletion
      removeFromCart(id, cartDocumentId);
    }
  };

  // Helper function to properly close the modal
  const closeCartModal = () => {
    const modalElement = document.querySelector('.modal-shopping-cart');
    if (modalElement) {
      // Remove modal classes
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';

      // Remove body modal classes
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');

      // Remove all backdrop elements
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
    }
  };

  // Handle View Cart navigation
  const handleViewCart = () => {
    setIsViewCartLoading(true);
    closeCartModal();
    router.push('/shopping-cart');
    // Reset loading state after a short delay to allow navigation to complete
    setTimeout(() => {
      setIsViewCartLoading(false);
    }, 1500);
  };

  // Handle Checkout navigation
  const handleCheckout = () => {
    closeCartModal();
    router.push('/checkout');
  };

  // Handle Continue Shopping
  const handleContinueShopping = () => {
    if (allCartProducts.length === 0) {
      // Show top picks instead of navigating away when cart is empty
      setShowTopPicks(true);
    } else {
      closeCartModal();
      router.push('/shop-default-grid');
    }
  };

  const handleProductClick = (product) => {
    // Close modal and navigate to product page
    closeCartModal();
    router.push(`/product-detail/${product.id}`);
  };



  // Helper function to fetch fresh variant data removed as it's handled in Context

  // Fetch user's carts from API logic removed - handled by Context

  // Handle modal accessibility
  useEffect(() => {
    const modal = document.getElementById('shoppingCart');

    if (!modal) return;

    const handleModalShow = () => {
      setIsModalInert(false);

      // Refresh cart data logic removed - handled by Context
    };

    const handleModalHide = () => {
      setIsModalInert(true);
    };

    // Listen for Bootstrap modal events
    modal.addEventListener('show.bs.modal', handleModalShow);
    modal.addEventListener('hidden.bs.modal', handleModalHide);

    return () => {
      // Clean up event listeners
      modal.removeEventListener('show.bs.modal', handleModalShow);
      modal.removeEventListener('hidden.bs.modal', handleModalHide);
    };
  }, [user, cartProducts, isCartClearing, cartClearedTimestamp]);

  // Get selected cart items functionality
  const {
    selectedCartItems,
    toggleCartItemSelection,
    getSelectedCartItems,
    getSelectedItemsTotal
  } = useContextElement();

  // Get all cart products first - Context handles merging/switching
  const allCartProducts = cartProducts;

  // Filter to show only selected items in the modal
  const displayProducts = allCartProducts.filter(product => selectedCartItems[product.id]);

  // Calculate total price from only the selected displayed products
  const displayTotalPrice = displayProducts.reduce((total, product) => {
    return total + (product.price * product.quantity);
  }, 0);

  // Calculate selected items
  const selectedItemsCount = displayProducts.length;
  const selectedItemsTotal = displayTotalPrice;

  return (
    <div
      className="modal fullRight fade modal-shopping-cart"
      id="shoppingCart"
      tabIndex="-1"
      inert={isModalInert}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="wrap d-flex flex-column h-100">
            <div className="header">
              <h5 className="title">
                Selected Items
                <span className="cart-count">({displayProducts.length} of {allCartProducts.length})</span>
              </h5>
              <button
                type="button"
                className="close-cart"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="icon-close"></i>
              </button>
            </div>

            <div className="tf-mini-cart-wrap flex-grow-1">
              <div className="tf-mini-cart-main">
                <div className="tf-mini-cart-sroll">
                  {isCartLoading ? (
                    <div className="loading-container">
                      <div className="loading-spinner">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                      <p className="loading-text">Loading your cart...</p>
                    </div>
                  ) : displayProducts.length < 1 ? (
                    <div className="empty-cart-content">
                      {!showTopPicks ? (
                        <div className="empty-cart-message">
                          <div className="empty-cart-icon">
                            <i className="icon-bag2"></i>
                          </div>
                          <h6>{allCartProducts.length > 0 ? 'No items selected' : 'Your cart is empty'}</h6>
                          <p>{allCartProducts.length > 0
                            ? `You have ${allCartProducts.length} item${allCartProducts.length > 1 ? 's' : ''} in your cart. Select the items you want to purchase and they will appear here for checkout.`
                            : 'Looks like you haven\'t added any items to your cart yet.'}</p>
                          <button
                            className="tf-button-2 style-1"
                            onClick={allCartProducts.length > 0 ? handleViewCart : handleContinueShopping}
                            disabled={isViewCartLoading}
                            data-navigation={allCartProducts.length > 0 ? "view-cart" : "continue-shopping"}
                            style={{
                              ...(allCartProducts.length > 0 ? { background: '#f7d2ca', color: '#333' } : {}),
                              opacity: isViewCartLoading ? 0.7 : 1,
                              cursor: isViewCartLoading ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                          >
                            {isViewCartLoading && allCartProducts.length > 0 && (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '16px', height: '16px' }} />
                            )}
                            {allCartProducts.length > 0
                              ? (isViewCartLoading ? 'Loading...' : 'View Full Cart')
                              : 'Start Shopping'
                            }
                          </button>
                        </div>
                      ) : (
                        <div className="top-picks-modal-section">
                          <div className="top-picks-header">
                            <button
                              className="back-button"
                              onClick={() => setShowTopPicks(false)}
                            >
                              <i className="icon-arrow-left"></i> Back
                            </button>
                          </div>
                          <TopPicksEmptyCart
                            isModal={true}
                            maxProducts={4}
                            onProductClick={handleProductClick}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="cart-items-list">
                      {displayProducts.map((elm, i) => {

                        return (
                          <div className="tf-mini-cart-item" key={i}>
                            <div className="tf-mini-cart-image-section">
                              <div className="tf-mini-cart-image">
                                <Link href={buildProductDetailHref(elm)}>
                                  <FallbackImage
                                    src={elm.variantInfo?.imgSrc || elm.imgSrc}
                                    alt={getVariantAwareTitle(elm)}
                                    width={60}
                                    height={90}
                                    priority={i < 3}
                                    loading={i < 3 ? "eager" : "lazy"}
                                    preload={true}
                                    fallbackSrc="/images/placeholder.svg"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      objectPosition: "center",
                                    }}
                                  />
                                </Link>
                              </div>
                              {elm.selectedSize && (
                                <div className="size-info" style={{
                                  fontSize: '12px',
                                  color: '#666',
                                  marginTop: '4px',
                                  textAlign: 'center'
                                }}>
                                  <span className="size-label" style={{ fontWeight: '500' }}>Size:</span>
                                  <span className="size-value" style={{ marginLeft: '6px' }}>{elm.selectedSize}</span>
                                </div>
                              )}
                            </div>
                            <div className="tf-mini-cart-info">
                              <div className="name">
                                <Link
                                  className="link text-line-clamp-2"
                                  href={buildProductDetailHref(elm)}
                                >
                                  {getVariantAwareTitle(elm)}
                                </Link>
                              </div>
                              <div className="quantity-display-wrapper">
                                <span className="quantity-label">Qty:</span>
                                <span className="quantity-value">{elm.quantity}</span>
                              </div>
                            </div>
                            <div className="tf-mini-cart-right-section">
                              <div className="price-display">
                                <PriceDisplay
                                  price={elm.price * elm.quantity}
                                  className="item-total-price"
                                  size="small"
                                />
                              </div>
                              <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeItem(elm.id, elm.cartDocumentId)}
                                aria-label="Remove item"
                              >
                                <i className="icon-close"></i>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {displayProducts.length > 0 && (
                <div className="tf-mini-cart-bottom">
                  <div className="tf-mini-cart-bottom-wrap">
                    <div className="tf-cart-totals-discounts">
                      <div className="tf-cart-total">
                        <div className="tf-cart-total-title">Subtotal:</div>
                        <div className="tf-cart-total-price">
                          <PriceDisplay
                            price={displayTotalPrice}
                            className="total-price"
                            size="medium"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="tf-mini-cart-view-checkout">
                      <button
                        className="tf-button-2 style-2 w-100"
                        onClick={handleViewCart}
                        disabled={isViewCartLoading}
                        data-navigation="view-cart"
                        style={{
                          background: '#f7d2ca',
                          color: '#333',
                          opacity: isViewCartLoading ? 0.7 : 1,
                          cursor: isViewCartLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {isViewCartLoading && (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '16px', height: '16px' }} />
                        )}
                        {isViewCartLoading ? 'Loading...' : 'View Cart'}
                      </button>
                      <button
                        className="tf-button-2 style-1 w-100"
                        onClick={handleCheckout}
                      >
                        Checkout
                      </button>
                    </div>
                    <div className="continue-shopping">
                      <button
                        className="tf-button-2 style-3 w-100"
                        onClick={handleContinueShopping}
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-shopping-cart {
          --cart-primary-color: #25D366;
          --cart-secondary-color: #181818;
          --cart-border-color: #e5e5e5;
          --cart-text-color: #333;
          --cart-text-secondary: #666;
          --cart-bg-light: #f8f9fa;
        }
        
        .modal-shopping-cart .modal-content {
          height: 100vh;
          border-radius: 0;
          border: none;
          box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
        }
        
        .modal-shopping-cart .wrap {
          height: 100%;
          overflow: hidden;
        }
        
        .modal-shopping-cart .header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--cart-border-color);
          background: var(--cart-bg-light);
          flex-shrink: 0;
        }
        
        .modal-shopping-cart .header .title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: var(--cart-text-color);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .modal-shopping-cart .header .cart-count {
          font-size: 14px;
          color: var(--cart-text-secondary);
          font-weight: 400;
        }
        
        .modal-shopping-cart .close-cart {
          background: none;
          border: none;
          font-size: 18px;
          color: var(--cart-text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .modal-shopping-cart .close-cart:hover {
          background: rgba(0, 0, 0, 0.1);
          color: var(--cart-text-color);
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
        }
        
        .loading-spinner {
          margin-bottom: 16px;
        }
        
        .loading-text {
          color: var(--cart-text-secondary);
          font-size: 14px;
          margin: 0;
        }
        
        .empty-cart-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
        }
        
        .empty-cart-icon {
          font-size: 48px;
          color: var(--cart-text-secondary);
          margin-bottom: 20px;
        }
        
        .empty-cart-message h6 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--cart-text-color);
        }
        
        .empty-cart-message p {
          color: var(--cart-text-secondary);
          margin-bottom: 24px;
          font-size: 14px;
        }
        
        .tf-mini-cart-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--cart-border-color);
          transition: background-color 0.2s ease;
        }
        
        .tf-mini-cart-item:hover {
          background-color: var(--cart-bg-light);
        }
        
        .tf-mini-cart-item:last-child {
          border-bottom: none;
        }
        
        .tf-mini-cart-image-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        
        .tf-mini-cart-image {
          width: 60px;
          height: 90px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--cart-bg-light);
        }
        
        .tf-mini-cart-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        
        .tf-mini-cart-info {
          flex: 1;
          min-width: 0;
        }
        
        .tf-mini-cart-info .name {
          margin-bottom: 8px;
        }
        
        .tf-mini-cart-info .name {
          flex: 1;
          min-width: 0;
        }
        
        .tf-mini-cart-info .name .link {
          font-size: 14px;
          font-weight: 500;
          color: var(--cart-text-color);
          text-decoration: none;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .tf-mini-cart-info .name .link:hover {
          color: var(--cart-primary-color);
        }
        
        .size-info {
          margin-bottom: 8px;
        }
        
        .tf-mini-cart-right-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-shrink: 0;
          min-width: 80px;
        }
        
        .quantity-display-wrapper {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: var(--cart-bg-light);
          border-radius: 4px;
          border: 1px solid var(--cart-border-color);
          width: fit-content;
          max-width: 70px;
          flex-shrink: 0;
        }
        
        .quantity-label {
          font-size: 12px;
          color: var(--cart-text-secondary);
          font-weight: 500;
        }
        
        .quantity-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--cart-text-color);
          min-width: 20px;
          text-align: center;
        }
        
        .price-display {
          text-align: right;
          margin-bottom: 8px;
        }
        
        .item-total-price {
          font-weight: 600;
          color: var(--cart-primary-color);
          font-size: 16px;
        }
        
        .remove-btn {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
          font-size: 14px;
        }
        
        .remove-btn:hover {
          background: rgba(220, 53, 69, 0.1);
        }
        
        .tf-mini-cart-bottom {
          border-top: 1px solid var(--cart-border-color);
          background: white;
          flex-shrink: 0;
        }
        
        .tf-mini-cart-bottom-wrap {
          padding: 20px 24px;
        }
        
        .tf-cart-totals-discounts {
          margin-bottom: 20px;
        }
        
        .tf-cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--cart-bg-light);
          border-radius: 8px;
        }
        
        .tf-cart-total-title {
          font-weight: 600;
          font-size: 16px;
          color: var(--cart-text-color);
        }
        
        .total-price {
          font-weight: 700;
          font-size: 18px;
          color: var(--cart-primary-color);
        }
        
        .tf-mini-cart-view-checkout {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .tf-button-2 {
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          font-size: 14px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .tf-button-2.style-1 {
          background: var(--cart-primary-color);
          color: white;
        }
        
        .tf-button-2.style-1:hover {
          background: #1ea952;
          transform: translateY(-1px);
        }
        
        .tf-button-2.style-2 {
          background: var(--cart-secondary-color);
          color: white;
        }
        
        .tf-button-2.style-2:hover {
          background: #333;
          transform: translateY(-1px);
        }
        
        .tf-button-2.style-3 {
          background: transparent;
          color: var(--cart-text-color);
          border: 1px solid var(--cart-border-color);
        }
        
        .tf-button-2.style-3:hover {
          background: var(--cart-bg-light);
          border-color: var(--cart-text-color);
        }
        
        .w-100 {
          width: 100%;
        }
        
        .top-picks-header {
          padding: 10px 0 20px 0;
          border-bottom: 1px solid var(--cart-border-color);
          margin-bottom: 20px;
        }
        
        .back-button {
          background: none;
          border: none;
          color: var(--cart-text-secondary);
          font-size: 14px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .back-button:hover {
          background: var(--cart-bg-light);
          color: var(--cart-text-color);
        }
        
        .top-picks-modal-section {
          padding: 0;
        }
        
        @media (max-width: 768px) {
          .modal-shopping-cart .header {
            padding: 16px 20px;
          }
          
          .tf-mini-cart-item {
            padding: 16px 20px;
            gap: 12px;
          }
          
          .tf-mini-cart-image {
            width: 70px;
            height: 70px;
          }
          
          .tf-mini-cart-info .name .link {
            font-size: 13px;
          }
          
          .tf-mini-cart-right-section {
            min-width: 70px;
            gap: 8px;
          }
          
          .quantity-display-wrapper {
            max-width: 65px;
            padding: 5px 10px;
          }
          
          .tf-mini-cart-image-section {
            align-items: center;
          }
          
          .tf-mini-cart-image {
            width: 50px;
            height: 75px;
          }
          
          .price-display {
            text-align: right;
          }
          
          .item-total-price {
            font-size: 14px;
          }
          
          .remove-btn {
            padding: 6px;
            font-size: 12px;
          }
          
          .tf-mini-cart-bottom-wrap {
            padding: 16px 20px;
          }
          
          .tf-mini-cart-view-checkout {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  )
}
