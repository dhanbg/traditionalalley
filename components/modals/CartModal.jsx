"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import { products41 } from "@/data/productsWomen";
import { useSession, signIn } from "next-auth/react";
import { fetchDataFromApi, getImageUrl } from "@/utils/api";
import { PRODUCT_BY_DOCUMENT_ID_API, API_URL } from "@/utils/urls";
import { useRouter } from "next/navigation";
import PriceDisplay from "@/components/common/PriceDisplay";

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
  } = useContextElement();
  const { data: session } = useSession();
  const [userCarts, setUserCarts] = useState([]);
  const [serverCartProducts, setServerCartProducts] = useState([]);
  const [serverCartLoading, setServerCartLoading] = useState(true);
  const [serverTotalPrice, setServerTotalPrice] = useState(0);
  const [currentOpenPopup, setCurrentOpenPopup] = useState("");
  const [isModalInert, setIsModalInert] = useState(true);
  const router = useRouter();
  const [isAgreed, setIsAgreed] = useState(false);

  const removeItem = (id, cartDocumentId) => {
    // Find the item in the cart to confirm it exists before removing
    const itemToRemove = displayProducts.find(item => 
      item.id == id || 
      (item.documentId === id) || 
      (item.cartDocumentId === cartDocumentId)
    );
    
    if (itemToRemove) {
      // Remove from local state immediately for a responsive UI
      // This ensures the item disappears from the cart modal right away
      setServerCartProducts(prev => prev.filter(product => 
        product.id != id && 
        product.documentId !== id && 
        product.cartDocumentId !== cartDocumentId
      ));
      
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
    closeCartModal();
    router.push('/shopping-cart');
  };

  // Handle Checkout navigation
  const handleCheckout = () => {
    closeCartModal();
    router.push('/checkout');
  };

  // Handle Continue Shopping
  const handleContinueShopping = () => {
    closeCartModal();
    router.push('/shop-default-grid');
  };

  // Fetch user's carts from API
  useEffect(() => {
    // Don't load cart if currently clearing or recently cleared (within 5 seconds)
    const recentlyCleared = cartClearedTimestamp && (Date.now() - cartClearedTimestamp < 5000);
    
    if (user && !isCartClearing && !recentlyCleared) {
      const fetchUserCarts = async () => {
        try {
          setServerCartLoading(true);
          // Fetch carts data from the API
          const response = await fetchDataFromApi(`/api/carts?populate=*`);
          
          // Filter carts based on the current user's authUserId
          const currentUserCarts = response.data.filter(
            cart => cart.user_datum && cart.user_datum.authUserId === user.id
          );
          
          // Update state with user's carts
          setUserCarts(currentUserCarts);
          
          // Array to hold the complete product details
          const productsWithDetails = [];
          let totalPrice = 0;
          
          // For each cart, fetch the complete product details
          for (const cart of currentUserCarts) {
            const productDocId = cart.product?.documentId;
            
            if (productDocId) {
              try {
                // Fetch product details using the documentId
                const productDetails = await fetchDataFromApi(PRODUCT_BY_DOCUMENT_ID_API(productDocId));
                
                // The response will now be an array of products, get the first one
                const productData = productDetails.data && productDetails.data.length > 0 
                  ? productDetails.data[0] 
                  : null;
                
                if (!productData) {
                  continue;
                }
                
                // Get image URLs, prefer small format
                let imgSrcUrl = null;
                if (productData.imgSrc && productData.imgSrc.formats && productData.imgSrc.formats.small && productData.imgSrc.formats.small.url) {
                  imgSrcUrl = `${API_URL}${productData.imgSrc.formats.small.url}`;
                } else {
                  imgSrcUrl = getImageUrl(productData.imgSrc);
                }
                let imgHoverUrl = null;
                if (productData.imgHover && productData.imgHover.formats && productData.imgHover.formats.small && productData.imgHover.formats.small.url) {
                  imgHoverUrl = `${API_URL}${productData.imgHover.formats.small.url}`;
                } else {
                  imgHoverUrl = getImageUrl(productData.imgHover);
                }
                
                // Create a cart product object with all needed details
                const productWithQuantity = {
                  id: cart.product.id,
                  documentId: productDocId,
                  title: cart.product.title,
                  price: cart.product.price,
                  quantity: cart.quantity,
                  imgSrc: imgSrcUrl,
                  imgHover: imgHoverUrl,
                  cartId: cart.id,
                  cartDocumentId: cart.documentId,
                  // Add color and size data
                  colors: productData.colors || [],
                  sizes: productData.sizes || productData.filterSizes || []
                };
                
                // Add product to array
                productsWithDetails.push(productWithQuantity);
                
                // Add to total price
                totalPrice += cart.product.price * cart.quantity;
              } catch (error) {
              }
            }
          }
          
          // Update state with products and total price
          setServerCartProducts(productsWithDetails);
          setServerTotalPrice(totalPrice);
          setServerCartLoading(false);
          
          // Replace the context cartProducts with our server data
          setCartProducts(productsWithDetails);
          
        } catch (error) {
          setServerCartLoading(false);
        }
      };
      
      fetchUserCarts();
    }
  }, [user, setCartProducts, cartRefreshKey, isCartClearing, cartClearedTimestamp]);

  // Handle modal accessibility
  useEffect(() => {
    const modal = document.getElementById('shoppingCart');
    
    if (!modal) return;
    
    const handleModalShow = () => {
      setIsModalInert(false);
      
      // Refresh cart data when modal opens
      const recentlyCleared = cartClearedTimestamp && (Date.now() - cartClearedTimestamp < 5000);
      
      if (user && !isCartClearing && !recentlyCleared) {
        // Force a refresh of server cart data when the modal opens
        const refreshCartData = async () => {
          try {
            setServerCartLoading(true);
            
            // First, get the user's data to find their user_datum ID
            const currentUserData = await fetchDataFromApi(
              `/api/user-data?filters[authUserId][$eq]=${user.id}&populate=*`
            );

            if (!currentUserData?.data || currentUserData.data.length === 0) {
              setServerCartLoading(false);
              return;
            }

            const userData = currentUserData.data[0];
            const userDataId = userData.id;
            
            const cartResponse = await fetchDataFromApi(
              `/api/carts?filters[user_datum][id][$eq]=${userDataId}&populate=*`
            );
            
            if (cartResponse?.data?.length > 0) {
              // Process cart data...
              // Update with fresh data from server
              const productsWithDetails = [];
              let totalPrice = 0;
              
              for (const cart of cartResponse.data) {
                // Skip carts without product data
                if (!cart.attributes?.product?.data) continue;
                
                const productData = cart.attributes.product.data;
                const productId = productData.id;
                const productDocId = productData.attributes?.documentId;
                
                // Match current user's cart items
                const productAttrs = productData.attributes || {};
                
                // Get image URLs, prefer small format
                let imgSrcUrl = null;
                if (productAttrs.imgSrc && productAttrs.imgSrc.formats && productAttrs.imgSrc.formats.small && productAttrs.imgSrc.formats.small.url) {
                  imgSrcUrl = `${API_URL}${productAttrs.imgSrc.formats.small.url}`;
                } else {
                  imgSrcUrl = getImageUrl(productAttrs.imgSrc);
                }
                let imgHoverUrl = null;
                if (productAttrs.imgHover && productAttrs.imgHover.formats && productAttrs.imgHover.formats.small && productAttrs.imgHover.formats.small.url) {
                  imgHoverUrl = `${API_URL}${productAttrs.imgHover.formats.small.url}`;
                } else {
                  imgHoverUrl = getImageUrl(productAttrs.imgHover);
                }
                
                // Create cart product object
                const productWithQuantity = {
                  id: productId,
                  documentId: productDocId,
                  title: productAttrs.title || 'Product Item',
                  price: parseFloat(productAttrs.price) || 0,
                  quantity: cart.attributes.quantity || 1,
                  imgSrc: imgSrcUrl,
                  cartId: cart.id,
                  cartDocumentId: cart.attributes.documentId,
                  colors: productAttrs.colors || [],
                  sizes: productAttrs.sizes || productAttrs.filterSizes || []
                };
                
                productsWithDetails.push(productWithQuantity);
                totalPrice += productWithQuantity.price * productWithQuantity.quantity;
              }
              
              setServerCartProducts(productsWithDetails);
              setServerTotalPrice(totalPrice);
            }
            
            setServerCartLoading(false);
          } catch (error) {
            setServerCartLoading(false);
          }
        };
        
        refreshCartData();
      } else {
        // For guest users, use local cart products
      }
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

  // For a more consistent experience, prefer serverCartProducts when available
  const displayProducts = user 
    ? serverCartProducts.length > 0 
      ? serverCartProducts 
      : cartProducts // Only fall back to context cart products if server cart is empty
    : cartProducts; // Use local cart for guest users
  
  // Get selected cart items functionality
  const {
    selectedCartItems,
    toggleCartItemSelection,
    getSelectedCartItems,
    getSelectedItemsTotal
  } = useContextElement();
  
  // Calculate total price from the actual displayed products
  const displayTotalPrice = displayProducts.reduce((total, product) => {
    return total + (product.price * product.quantity);
  }, 0);
  
  // Calculate selected items
  const selectedItemsCount = getSelectedCartItems().length;
  const selectedItemsTotal = getSelectedItemsTotal();

  return (
    <div 
      className="modal fullRight fade modal-shopping-cart" 
      id="shoppingCart"
      tabIndex="-1"
      inert={isModalInert}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          {/* <div className="tf-minicart-recommendations">
            <h6 className="title">You May Also Like</h6>
            <div className="wrap-recommendations">
              <div className="list-cart">
                {products41.map((product, index) => (
                  <div className="list-cart-item" key={index}>
                    <div className="image">
                      <Image
                        className="lazyload"
                        data-src={product.imgSrc}
                        alt={product.alt}
                        src={product.imgSrc}
                        width={600}
                        height={800}
                      />
                    </div>
                    <div className="content">
                      <div className="name">
                        <Link
                          className="link text-line-clamp-1"
                          href="/product-detail"
                        >
                          {product.title}
                        </Link>
                      </div>
                      <div className="cart-item-bot">
                        <div className="text-button price">
                          <PriceDisplay 
                            price={product.price}
                            className="text-button"
                            size="small"
                          />
                        </div>
                        <a
                          className="link text-button"
                          onClick={() => addProductToCart(product.id, 1, false)}
                        >
                          {isAddedToCartProducts(product.id)
                            ? "Already Added"
                            : "Add to cart"}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
          <div className="d-flex flex-column flex-grow-1 h-100">
            <div className="header">
              <h5 className="title" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                Shopping Cart
                <span style={{
                  marginTop: 4,
                  display: 'block',
                  position: 'static',
                  width: '120%',
                  height: '4px',
                  background: 'linear-gradient(90deg, #25D366 0%, #181818 100%)',
                  borderRadius: '2px',
                  transform: 'scaleX(1)',
                  transition: 'transform 0.4s cubic-bezier(.4,2,.6,1)',
                  zIndex: 1,
                  animation: 'cartTitleUnderlineAnim 1s cubic-bezier(.4,2,.6,1)'
                }} />
              </h5>
              <style>{`
                @keyframes cartTitleUnderlineAnim {
                  0% { transform: scaleX(0.7); }
                  100% { transform: scaleX(1); }
                }
              `}</style>
              <span
                className="icon-close icon-close-popup"
                data-bs-dismiss="modal"
              />
            </div>
            <div className="wrap">
              {!user ? (
                <div className="p-4 text-center">
                  <p className="mb-4">Please sign in to view your shopping cart.</p>
                  <button 
                    className="btn-style-2 w-100 radius-4"
                                          onClick={() => signIn()}
                  >
                    <span className="text-btn-uppercase">Sign In</span>
                  </button>
                  <div className="mt-3">
                    <Link
                      href="/shop-default-grid"
                      className="text-btn-uppercase"
                      onClick={(e) => {
                        e.preventDefault();
                        handleContinueShopping();
                      }}
                    >
                      Or continue shopping
                    </Link>
                  </div>
                </div>
              ) : (
                <>
              {/* <div className="tf-mini-cart-threshold">
                <div className="tf-progress-bar">
                  <div
                    className="value"
                    style={{ width: "0%" }}
                    data-progress={75}
                  >
                    <i className="icon icon-shipping" />
                  </div>
                </div>
                <div className="text-caption-1">
                  Congratulations! You've got free shipping!
                </div>
              </div> */}
              <div className="tf-mini-cart-wrap">
                <div className="tf-mini-cart-main">
                  <div className="tf-mini-cart-sroll">
                        {serverCartLoading ? (
                          <div className="p-4 text-center">
                            Loading your cart...
                          </div>
                        ) : displayProducts.length ? (
                      <div className="tf-mini-cart-items">
                            {displayProducts.map((product, i) => (
                          <div
                            key={i}
                            className="tf-mini-cart-item file-delete"
                          >
                            <div style={{ marginRight: "10px" }}>
                              <label className="modern-checkbox">
                                <input 
                                  type="checkbox" 
                                  className="tf-check-rounded"
                                  checked={selectedCartItems[product.id] || false}
                                  onChange={() => toggleCartItemSelection(product.id)}
                                  id={`select-mini-product-${product.id}`}
                                  style={{ display: 'none' }}
                                />
                                <span className="custom-checkmark"></span>
                              </label>
                            </div>
                            <div className="tf-mini-cart-image">
                              <img
                                className="cart-product-img"
                                data-src={product.imgSrc}
                                src={product.imgSrc}
                                alt={product.title}
                                width={80}
                                height={100}
                                style={{ objectFit: "cover", borderRadius: "8px" }}
                              />
                            </div>
                            <div className="tf-mini-cart-info flex-grow-1">
                              <div className="mb_12 d-flex align-items-center justify-content-between flex-wrap gap-12">
                                <div className="text-title">
                                  <Link
                                        href={`/product-detail/${product.documentId}`}
                                    className="link text-line-clamp-1"
                                  >
                                    {product.title}
                                  </Link>
                                </div>
                                <div
                                  className="text-button tf-btn-remove remove"
                                  onClick={() => removeItem(product.id, product.cartDocumentId)}
                                >
                                  Remove
                                </div>
                              </div>
                              <div className="d-flex align-items-center justify-content-between flex-wrap gap-12">
                                <div className="text-button">
                                  {product.quantity} X <PriceDisplay 
                                    price={product.price}
                                    className="text-button"
                                    size="small"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4">
                        Your Cart is empty. Start adding favorite products to
                        cart!{" "}
                            <Link 
                              className="btn-line" 
                              href="/shop-default-grid"
                              onClick={(e) => {
                                e.preventDefault();
                                handleContinueShopping();
                              }}
                            >
                          Explore Products
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                <div className="tf-mini-cart-bottom-wrap" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: '32px', padding: '16px 0 16px 60px', borderTop: '1px solid #eee', marginTop: 16 }}>
                  {/* Left: Selected Items & Subtotal */}
                  <div className="tf-cart-summary-vertical" style={{ minWidth: 180, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h5 className="text-secondary-2">Selected Items: </h5>
                        <h5 className="text-secondary-2">Subtotal: </h5>
                    </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginLeft: 40, marginTop: 4 }}>
                        <h5 className="text-button">{selectedItemsCount}/{displayProducts.length}</h5>
                        <h5 className="text-button">
                          <PriceDisplay 
                            price={selectedItemsTotal}
                            className="text-button"
                            size="normal"
                          />
                        </h5>
                    </div>
                    </div>
                  </div>
                  {/* Right: Buttons */}
                  <div className="tf-group-button d-flex flex-column gap-2 custom-cart-btn-group" style={{ minWidth: 160, alignItems: 'center', justifyContent: 'center' }}>
                          <button
                      className="btn-style-1 view-cart custom-cart-btn"
                      style={{ width: '100%', maxWidth: 200, marginRight: 30, marginLeft: 100 }}
                            onClick={handleViewCart}
                      >
                      <span className="text-btn-uppercase">View Cart</span>
                          </button>
                          <button
                      className="btn-style-2 checkout custom-cart-btn"
                      style={{ width: '100%', maxWidth: 200, marginRight: 30, marginLeft: 100 }}
                      onClick={handleCheckout}
                      disabled={selectedItemsCount === 0}
                    >
                      <span className="text-btn-uppercase">
                        {selectedItemsCount === 0 ? 'Select Items' : 'Check Out'}
                      </span>
                          </button>
                    </div>
                    </div>
                {/* Remove openable sections so they take no space */}
                {/*
                <div className="tf-mini-cart-tool">
                <div
                  className={`tf-mini-cart-tool-openable ${
                    currentOpenPopup == "add-note" ? "open" : ""
                  }`}
                >
                    ...Note openable content...
                </div>
                <div
                  className={`tf-mini-cart-tool-openable ${
                    currentOpenPopup == "estimate-shipping" ? "open" : ""
                      }`}
                >
                    ...Shipping openable content...
                </div>
                <div
                  className={`tf-mini-cart-tool-openable ${
                    currentOpenPopup == "add-coupon" ? "open" : ""
                      }`}
                >
                    ...Coupon openable content...
                        </div>
                        </div>
                */}
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-cart-btn-group {
          margin-top: 12px;
        }
        .custom-cart-btn {
          height: 44px;
          min-width: 120px;
          border-radius: 6px !important;
          font-weight: 600;
          font-size: 16px;
          transition: background 0.2s, color 0.2s;
        }
        .custom-cart-btn.view-cart {
          background: #fff;
          color: #181818;
          border: 1.5px solid #181818;
        }
        .custom-cart-btn.view-cart:hover {
          background: #181818;
          color: #fff;
        }
        .custom-cart-btn.checkout {
          background: #181818;
          color: #fff;
          border: 1.5px solid #181818;
        }
        .custom-cart-btn.checkout:hover {
          background: #25D366;
          color: #181818;
          border: 1.5px solid #25D366;
        }
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
    </div>
  );
}
