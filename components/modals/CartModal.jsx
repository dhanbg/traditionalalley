"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import { products41 } from "@/data/productsWomen";
import { useClerk, useUser } from "@clerk/nextjs";
import { fetchDataFromApi, getImageUrl } from "@/utils/api";
import { PRODUCT_BY_DOCUMENT_ID_API, API_URL } from "@/utils/urls";
import { useRouter } from "next/navigation";

export default function CartModal() {
  const {
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    user,
    removeFromCart
  } = useContextElement();
  const { openSignIn } = useClerk();
  const [userCarts, setUserCarts] = useState([]);
  const [serverCartProducts, setServerCartProducts] = useState([]);
  const [serverCartLoading, setServerCartLoading] = useState(true);
  const [serverTotalPrice, setServerTotalPrice] = useState(0);
  const [currentOpenPopup, setCurrentOpenPopup] = useState("");
  const [isModalInert, setIsModalInert] = useState(true);
  const router = useRouter();

  const removeItem = (id, cartDocumentId) => {
    console.log(`CartModal: Removing item with ID: ${id}, cartDocumentId: ${cartDocumentId}`);
    
    // Find the item in the cart to confirm it exists before removing
    const itemToRemove = displayProducts.find(item => 
      item.id == id || 
      (item.documentId === id) || 
      (item.cartDocumentId === cartDocumentId)
    );
    
    if (itemToRemove) {
      console.log(`CartModal: Found item to remove:`, itemToRemove);
      
      // Remove from local state immediately for a responsive UI
      // This ensures the item disappears from the cart modal right away
      setServerCartProducts(prev => prev.filter(product => 
        product.id != id && 
        product.documentId !== id && 
        product.cartDocumentId !== cartDocumentId
      ));
      
      // Use the removeFromCart function from Context to handle backend deletion
      removeFromCart(id, cartDocumentId);
    } else {
      console.error(`CartModal: Could not find item with ID ${id} or cartDocumentId ${cartDocumentId} in cart`);
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
    if (user) {
      const fetchUserCarts = async () => {
        try {
          setServerCartLoading(true);
          // Fetch carts data from the API
          const response = await fetchDataFromApi(`/api/carts?populate=*`);
          
          // Filter carts based on the current user's clerkUserId
          const currentUserCarts = response.data.filter(
            cart => cart.user_datum && cart.user_datum.clerkUserId === user.id
          );
          
          // Update state with user's carts
          setUserCarts(currentUserCarts);
          
          console.log(`Found ${currentUserCarts.length} carts for user ${user.id}`);
          
          // Array to hold the complete product details
          const productsWithDetails = [];
          let totalPrice = 0;
          
          // For each cart, fetch the complete product details
          for (const cart of currentUserCarts) {
            const productDocId = cart.product?.documentId;
            console.log(`Product documentId: ${productDocId}`);
            
            if (productDocId) {
              try {
                // Fetch product details using the documentId
                const productDetails = await fetchDataFromApi(PRODUCT_BY_DOCUMENT_ID_API(productDocId));
                
                // Debug product response
                console.log("Product details for cart item:", JSON.stringify(productDetails, null, 2));
                
                // The response will now be an array of products, get the first one
                const productData = productDetails.data && productDetails.data.length > 0 
                  ? productDetails.data[0] 
                  : null;
                
                if (!productData) {
                  console.error(`No product found with documentId: ${productDocId}`);
                  continue;
                }
                
                // Log the image object structure
                console.log("Product imgSrc structure:", productData.imgSrc);
                console.log("Product imgHover structure:", productData.imgHover);
                
                // Get image URLs
                const imgSrcUrl = getImageUrl(productData.imgSrc);
                const imgHoverUrl = getImageUrl(productData.imgHover);
                
                // Debug image URLs
                console.log("Resolved image URLs:", {
                  imgSrc: imgSrcUrl,
                  imgHover: imgHoverUrl
                });
                
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
                console.error(`Error fetching product details for ${productDocId}:`, error);
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
          console.error("Error fetching user carts:", error);
          setServerCartLoading(false);
        }
      };
      
      fetchUserCarts();
    }
  }, [user, setCartProducts]);

  // Handle modal accessibility
  useEffect(() => {
    const modal = document.getElementById('shoppingCart');
    
    if (!modal) return;
    
    const handleModalShow = () => {
      setIsModalInert(false);
      
      // Refresh cart data when modal opens
      if (user) {
        // Force a refresh of server cart data when the modal opens
        const refreshCartData = async () => {
          try {
            setServerCartLoading(true);
            const cartResponse = await fetchDataFromApi(`/api/carts?populate=*`);
            
            if (cartResponse?.data?.length > 0) {
              // Process cart data...
              console.log(`CartModal: Found ${cartResponse.data.length} cart items when refreshing`);
              
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
                
                // Get image URL
                let imgUrl = '/images/placeholder.png';
                if (productAttrs.imgSrc?.url) {
                  imgUrl = `${API_URL}${productAttrs.imgSrc.url}`;
                } else if (productAttrs.gallery && productAttrs.gallery.length > 0) {
                  const galleryImg = productAttrs.gallery[0];
                  imgUrl = `${API_URL}${galleryImg.url || galleryImg.formats?.thumbnail?.url || ''}`;
                }
                
                // Create cart product object
                const productWithQuantity = {
                  id: productId,
                  documentId: productDocId,
                  title: productAttrs.title || 'Product Item',
                  price: parseFloat(productAttrs.price) || 0,
                  quantity: cart.attributes.quantity || 1,
                  imgSrc: imgUrl,
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
              console.log('CartModal: Cart data refreshed with items:', productsWithDetails);
            }
            
            setServerCartLoading(false);
          } catch (error) {
            console.error('CartModal: Error refreshing cart data:', error);
            setServerCartLoading(false);
          }
        };
        
        refreshCartData();
      } else {
        // For guest users, use local cart products
        console.log("CartModal: Modal opened for guest user - using local cart products:", cartProducts);
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
  }, [user, cartProducts]);

  // For a more consistent experience, prefer serverCartProducts when available
  const displayProducts = user 
    ? serverCartProducts.length > 0 
      ? serverCartProducts 
      : cartProducts // Only fall back to context cart products if server cart is empty
    : cartProducts; // Use local cart for guest users
  
  // Calculate total price from the actual displayed products
  const displayTotalPrice = displayProducts.reduce((total, product) => {
    return total + (product.price * product.quantity);
  }, 0);

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
                          ${product.price.toFixed(2)}
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
              <h5 className="title">Shopping Cart</h5>
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
                    onClick={openSignIn}
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
              <div className="tf-mini-cart-threshold">
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
              </div>
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
                            <div className="tf-mini-cart-image">
                              {product.imgSrc ? (
                                <Image
                                  className="lazyload"
                                  alt={product.title || "Product image"}
                                  src={product.imgSrc.startsWith('http') ? product.imgSrc : `${API_URL}${product.imgSrc}`}
                                  width={600}
                                  height={800}
                                  onError={(e) => {
                                    // Try fallback to imgHover if available
                                    if (product.imgHover) {
                                      e.target.src = product.imgHover.startsWith('http') ? product.imgHover : `${API_URL}${product.imgHover}`;
                                    } else {
                                      // Use placeholder image as final fallback
                                      e.target.src = "/images/placeholder.png";
                                    }
                                  }}
                                />
                              ) : (
                                <Image
                                  className="lazyload"
                                  alt={product.title || "Product image"}
                                  src="/images/placeholder.png"
                                  width={600}
                                  height={800}
                                />
                              )}
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
                                    <div className="text-secondary-2">Size/Color</div>
                                <div className="text-button">
                                  {product.quantity} X $
                                  {product.price.toFixed(2)}
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
                <div className="tf-mini-cart-bottom">
                  <div className="tf-mini-cart-tool">
                    <div
                      className="tf-mini-cart-tool-btn btn-add-note"
                      onClick={() => setCurrentOpenPopup("add-note")}
                    >
                      <svg
                        width={21}
                        height={20}
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_6133_36620)">
                          <path
                            d="M10 3.33325H4.16667C3.72464 3.33325 3.30072 3.50885 2.98816 3.82141C2.67559 4.13397 2.5 4.55789 2.5 4.99992V16.6666C2.5 17.1086 2.67559 17.5325 2.98816 17.8451C3.30072 18.1577 3.72464 18.3333 4.16667 18.3333H15.8333C16.2754 18.3333 16.6993 18.1577 17.0118 17.8451C17.3244 17.5325 17.5 17.1086 17.5 16.6666V10.8333"
                            stroke="#181818"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16.25 2.0832C16.5815 1.75168 17.0312 1.56543 17.5 1.56543C17.9688 1.56543 18.4185 1.75168 18.75 2.0832C19.0815 2.41472 19.2678 2.86436 19.2678 3.3332C19.2678 3.80204 19.0815 4.25168 18.75 4.5832L10.8333 12.4999L7.5 13.3332L8.33333 9.99986L16.25 2.0832Z"
                            stroke="#181818"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_6133_36620">
                            <rect
                              width={20}
                              height={20}
                              fill="white"
                              transform="translate(0.833008)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                      <div className="text-caption-1">Note</div>
                    </div>
                    <div
                      className="tf-mini-cart-tool-btn btn-estimate-shipping"
                      onClick={() => setCurrentOpenPopup("estimate-shipping")}
                    >
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.333 2.5H0.833008V13.3333H13.333V2.5Z"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.333 6.66675H16.6663L19.1663 9.16675V13.3334H13.333V6.66675Z"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4.58333 17.4999C5.73393 17.4999 6.66667 16.5672 6.66667 15.4166C6.66667 14.266 5.73393 13.3333 4.58333 13.3333C3.43274 13.3333 2.5 14.266 2.5 15.4166C2.5 16.5672 3.43274 17.4999 4.58333 17.4999Z"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.4163 17.4999C16.5669 17.4999 17.4997 16.5672 17.4997 15.4166C17.4997 14.266 16.5669 13.3333 15.4163 13.3333C14.2657 13.3333 13.333 14.266 13.333 15.4166C13.333 16.5672 14.2657 17.4999 15.4163 17.4999Z"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-caption-1">Shipping</div>
                    </div>
                    <div
                      className="tf-mini-cart-tool-btn btn-add-coupon"
                      onClick={() => setCurrentOpenPopup("add-coupon")}
                    >
                      <svg
                        width={21}
                        height={20}
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.3247 11.1751L11.3497 17.1501C11.1949 17.305 11.0111 17.428 10.8087 17.5118C10.6064 17.5957 10.3895 17.6389 10.1705 17.6389C9.95148 17.6389 9.7346 17.5957 9.53227 17.5118C9.32994 17.428 9.14613 17.305 8.99134 17.1501L1.83301 10.0001V1.66675H10.1663L17.3247 8.82508C17.6351 9.13735 17.8093 9.55977 17.8093 10.0001C17.8093 10.4404 17.6351 10.8628 17.3247 11.1751V11.1751Z"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5.99902 5.83325H6.00902"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-caption-1">Coupon</div>
                    </div>
                  </div>
                  <div className="tf-mini-cart-bottom-wrap">
                    <div className="tf-cart-totals-discounts">
                      <h5>Subtotal</h5>
                      <h5 className="tf-totals-total-value">
                            ${displayTotalPrice.toFixed(2)}
                      </h5>
                    </div>
                    <div className="tf-cart-checkbox">
                      <div className="tf-checkbox-wrapp">
                        <input
                          className=""
                          type="checkbox"
                          id="CartDrawer-Form_agree"
                          name="agree_checkbox"
                        />
                        <div>
                          <i className="icon-check" />
                        </div>
                      </div>
                      <label htmlFor="CartDrawer-Form_agree">
                        I agree with
                        <Link href={`/term-of-use`} title="Terms of Service">
                          Terms &amp; Conditions
                        </Link>
                      </label>
                    </div>
                    <div className="tf-mini-cart-view-checkout">
                          <button
                            onClick={handleViewCart}
                        className="tf-btn w-100 btn-white radius-4 has-border"
                            tabIndex={0}
                      >
                        <span className="text">View cart</span>
                          </button>
                          <button
                            onClick={handleCheckout}
                        className="tf-btn w-100 btn-fill radius-4"
                      >
                        <span className="text">Check Out</span>
                          </button>
                    </div>
                    <div className="text-center">
                      <Link
                        className="link text-btn-uppercase"
                            href="/shop-default-grid"
                            onClick={(e) => {
                              e.preventDefault();
                              handleContinueShopping();
                            }}
                      >
                        Or continue shopping
                      </Link>
                    </div>
                  </div>
                </div>
                <div
                  className={`tf-mini-cart-tool-openable ${
                    currentOpenPopup == "add-note" ? "open" : ""
                  }`}
                >
                  <div className="tf-mini-cart-tool-content">
                    <label
                      htmlFor="Cart-note"
                      className="tf-mini-cart-tool-text"
                    >
                      <span className="icon">
                        <svg
                          width={20}
                          height={20}
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_6766_32777)">
                            <path
                              d="M9.16699 3.33325H3.33366C2.89163 3.33325 2.46771 3.50885 2.15515 3.82141C1.84259 4.13397 1.66699 4.55789 1.66699 4.99992V16.6666C1.66699 17.1086 1.84259 17.5325 2.15515 17.8451C2.46771 18.1577 2.89163 18.3333 3.33366 18.3333H15.0003C15.4424 18.3333 15.8663 18.1577 16.1788 17.8451C16.4914 17.5325 16.667 17.1086 16.667 16.6666V10.8333"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15.417 2.0832C15.7485 1.75168 16.1981 1.56543 16.667 1.56543C17.1358 1.56543 17.5855 1.75168 17.917 2.0832C18.2485 2.41472 18.4348 2.86436 18.4348 3.3332C18.4348 3.80204 18.2485 4.25168 17.917 4.5832L10.0003 12.4999L6.66699 13.3332L7.50033 9.99986L15.417 2.0832Z"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_6766_32777">
                              <rect width={20} height={20} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </span>
                      <span className="text-title">Note</span>
                    </label>
                    <form
                      className="form-add-note tf-mini-cart-tool-wrap"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <fieldset className="d-flex">
                        <textarea
                          name="note"
                          id="Cart-note"
                          placeholder="Add special instructions for your order..."
                          defaultValue={""}
                        />
                      </fieldset>
                      <div className="tf-cart-tool-btns">
                        <button type="submit" className="btn-style-2 w-100">
                          <span className="text text-btn-uppercase">Save</span>
                        </button>
                        <div
                          className="text-center w-100 text-btn-uppercase tf-mini-cart-tool-close"
                          onClick={() => setCurrentOpenPopup("")}
                        >
                          Cancel
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div
                  className={`tf-mini-cart-tool-openable ${
                    currentOpenPopup == "estimate-shipping" ? "open" : ""
                      }`}
                >
                  <div className="tf-mini-cart-tool-content">
                    <label className="tf-mini-cart-tool-text">
                      <span className="icon">
                        <svg
                          width={20}
                          height={20}
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_6766_32777)">
                            <path
                              d="M9.16699 3.33325H3.33366C2.89163 3.33325 2.46771 3.50885 2.15515 3.82141C1.84259 4.13397 1.66699 4.55789 1.66699 4.99992V16.6666C1.66699 17.1086 1.84259 17.5325 2.15515 17.8451C2.46771 18.1577 2.89163 18.3333 3.33366 18.3333H15.0003C15.4424 18.3333 15.8663 18.1577 16.1788 17.8451C16.4914 17.5325 16.667 17.1086 16.667 16.6666V10.8333"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15.417 2.0832C15.7485 1.75168 16.1981 1.56543 16.667 1.56543C17.1358 1.56543 17.5855 1.75168 17.917 2.0832C18.2485 2.41472 18.4348 2.86436 18.4348 3.3332C18.4348 3.80204 18.2485 4.25168 17.917 4.5832L10.0003 12.4999L6.66699 13.3332L7.50033 9.99986L15.417 2.0832Z"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_6766_32777">
                              <rect width={20} height={20} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </span>
                      <span className="text-title">
                        Estimate shipping rates
                      </span>
                    </label>
                    <form
                      className="form-estimate-shipping tf-mini-cart-tool-wrap"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div className="mb_12">
                        <div className="text-caption-1 text-secondary mb_8">
                          Country/region
                        </div>
                        <div className="tf-select">
                          <select className="">
                            <option>United States</option>
                            <option>China</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb_12">
                        <div className="text-caption-1 text-secondary mb_8">
                          State
                        </div>
                        <div className="tf-select">
                          <select
                            className="text-title"
                            name="address[country]"
                            data-default=""
                          >
                            <option
                              value="Australia"
                              data-provinces="[['Australian Capital Territory','Australian Capital Territory'],['New South Wales','New South Wales'],['Northern Territory','Northern Territory'],['Queensland','Queensland'],['South Australia','South Australia'],['Tasmania','Tasmania'],['Victoria','Victoria'],['Western Australia','Western Australia']]"
                            >
                              Australia
                            </option>
                            <option value="Austria" data-provinces="[]">
                              Austria
                            </option>
                            <option value="Belgium" data-provinces="[]">
                              Belgium
                            </option>
                            <option
                              value="Canada"
                              data-provinces="[['Alberta','Alberta'],['British Columbia','British Columbia'],['Manitoba','Manitoba'],['New Brunswick','New Brunswick'],['Newfoundland and Labrador','Newfoundland and Labrador'],['Northwest Territories','Northwest Territories'],['Nova Scotia','Nova Scotia'],['Nunavut','Nunavut'],['Ontario','Ontario'],['Prince Edward Island','Prince Edward Island'],['Quebec','Quebec'],['Saskatchewan','Saskatchewan'],['Yukon','Yukon']]"
                            >
                              Canada
                            </option>
                            <option value="Czech Republic" data-provinces="[]">
                              Czechia
                            </option>
                            <option value="Denmark" data-provinces="[]">
                              Denmark
                            </option>
                            <option value="Finland" data-provinces="[]">
                              Finland
                            </option>
                            <option value="France" data-provinces="[]">
                              France
                            </option>
                            <option value="Germany" data-provinces="[]">
                              Germany
                            </option>
                            <option
                              value="Hong Kong"
                              data-provinces="[['Hong Kong Island','Hong Kong Island'],['Kowloon','Kowloon'],['New Territories','New Territories']]"
                            >
                              Hong Kong SAR
                            </option>
                            <option
                              value="Ireland"
                              data-provinces="[['Carlow','Carlow'],['Cavan','Cavan'],['Clare','Clare'],['Cork','Cork'],['Donegal','Donegal'],['Dublin','Dublin'],['Galway','Galway'],['Kerry','Kerry'],['Kildare','Kildare'],['Kilkenny','Kilkenny'],['Laois','Laois'],['Leitrim','Leitrim'],['Limerick','Limerick'],['Longford','Longford'],['Louth','Louth'],['Mayo','Mayo'],['Meath','Meath'],['Monaghan','Monaghan'],['Offaly','Offaly'],['Roscommon','Roscommon'],['Sligo','Sligo'],['Tipperary','Tipperary'],['Waterford','Waterford'],['Westmeath','Westmeath'],['Wexford','Wexford'],['Wicklow','Wicklow']]"
                            >
                              Ireland
                            </option>
                            <option value="Israel" data-provinces="[]">
                              Israel
                            </option>
                            <option
                              value="Italy"
                                  data-provinces="[['Agrigento','Agrigento'],['Alessandria','Alessandria'],['Ancona','Ancona'],['Aosta','Aosta Valley'],['Arezzo','Arezzo'],['Ascoli Piceno','Ascoli Piceno'],['Asti','Asti'],['Avellino','Avellino'],['Bari','Bari'],['Barletta-Andria-Trani','Barletta-Andria-Trani'],['Belluno','Belluno'],['Benevento','Benevento'],['Bergamo','Bergamo'],['Biella','Biella'],['Bologna','Bologna'],['Bolzano','South Tyrol'],['Brescia','Brescia'],['Brindisi','Brindisi'],['Cagliari','Cagliari'],['Caltanissetta','Caltanissetta'],['Campobasso','Campobasso'],['Carbonia-Iglesias','Carbonia-Iglesias'],['Caserta','Caserta'],['Catania','Catania'],['Catanzaro','Catanzaro'],['Chieti','Chieti'],['Como','Como'],['Cosenza','Cosenza'],['Cremona','Cremona'],['Crotone','Crotone'],['Cuneo','Cuneo'],['Enna','Enna'],['Fermo','Fermo'],['Ferrara','Ferrara'],['Firenze','Florence'],['Foggia','Foggia'],['Forlì-Cesena','Forlì-Cesena'],['Frosinone','Frosinone'],['Genova','Genoa'],['Gorizia','Gorizia'],['Grosseto','Grosseto'],['Imperia','Imperia'],['Isernia','Isernia'],['L'Aquila','L'Aquila'],['La Spezia','La Spezia'],['Latina','Latina'],['Lecce','Lecce'],['Lecco','Lecco'],['Livorno','Livorno'],['Lodi','Lodi'],['Lucca','Lucca'],['Macerata','Macerata'],['Mantova','Mantua'],['Massa-Carrara','Massa and Carrara'],['Matera','Matera'],['Medio Campidano','Medio Campidano'],['Messina','Messina'],['Milano','Milan'],['Modena','Modena'],['Monza e Brianza','Monza and Brianza'],['Napoli','Naples'],['Novara','Novara'],['Nuoro','Nuoro'],['Ogliastra','Ogliastra'],['Olbia-Tempio','Olbia-Tempio'],['Oristano','Oristano'],['Padova','Padua'],['Palermo','Palermo'],['Parma','Parma'],['Pavia','Pavia'],['Perugia','Perugia'],['Pesaro e Urbino','Pesaro and Urbino'],['Pescara','Pescara'],['Piacenza','Piacenza'],['Pisa','Pisa'],['Pistoia','Pistoia'],['Pordenone','Pordenone'],['Potenza','Potenza'],['Prato','Prato'],['Ragusa','Ragusa'],['Ravenna','Ravenna'],['Reggio Calabria','Reggio Calabria'],['Reggio Emilia','Reggio Emilia'],['Rieti','Rieti'],['Rimini','Rimini'],['Roma','Rome'],['Rovigo','Rovigo'],['Salerno','Salerno'],['Sassari','Sassari'],['Savona','Savona'],['Siena','Siena'],['Siracusa','Syracuse'],['Sondrio','Sondrio'],['Taranto','Taranto'],['Teramo','Teramo'],['Terni','Terni'],['Torino','Turin'],['Trapani','Trapani'],['Trento','Trentino'],['Treviso','Treviso'],['Trieste','Trieste'],['Udine','Udine'],['Varese','Varese'],['Venezia','Venice'],['Verbano-Cusio-Ossola','Verbano-Cusio-Ossola'],['Vercelli','Vercelli'],['Verona','Verona'],['Vibo Valentia','Vibo Valentia'],['Vicenza','Vicenza'],['Viterbo','Viterbo']]"
                            >
                              Italy
                            </option>
                            <option
                              value="Japan"
                              data-provinces="[['Aichi','Aichi'],['Akita','Akita'],['Aomori','Aomori'],['Chiba','Chiba'],['Ehime','Ehime'],['Fukui','Fukui'],['Fukuoka','Fukuoka'],['Fukushima','Fukushima'],['Gifu','Gifu'],['Gunma','Gunma'],['Hiroshima','Hiroshima'],['Hokkaidō','Hokkaido'],['Hyōgo','Hyogo'],['Ibaraki','Ibaraki'],['Ishikawa','Ishikawa'],['Iwate','Iwate'],['Kagawa','Kagawa'],['Kagoshima','Kagoshima'],['Kanagawa','Kanagawa'],['Kumamoto','Kumamoto'],['Kyōto','Kyoto'],['Kōchi','Kochi'],['Mie','Mie'],['Miyagi','Miyagi'],['Miyazaki','Miyazaki'],['Nagano','Nagano'],['Nagasaki','Nagasaki'],['Nara','Nara'],['Niigata','Niigata'],['Okayama','Okayama'],['Okinawa','Okinawa'],['Saga','Saga'],['Saitama','Saitama'],['Shiga','Shiga'],['Shimane','Shimane'],['Shizuoka','Shizuoka'],['Tochigi','Tochigi'],['Tokushima','Tokushima'],['Tottori','Tottori'],['Toyama','Toyama'],['Tōkyō','Tokyo'],['Wakayama','Wakayama'],['Yamagata','Yamagata'],['Yamaguchi','Yamaguchi'],['Yamanashi','Yamanashi'],['Ōita','Oita'],['Ōsaka','Osaka']]"
                            >
                              Japan
                            </option>
                            <option
                              value="Malaysia"
                              data-provinces="[['Johor','Johor'],['Kedah','Kedah'],['Kelantan','Kelantan'],['Kuala Lumpur','Kuala Lumpur'],['Labuan','Labuan'],['Melaka','Malacca'],['Negeri Sembilan','Negeri Sembilan'],['Pahang','Pahang'],['Penang','Penang'],['Perak','Perak'],['Perlis','Perlis'],['Putrajaya','Putrajaya'],['Sabah','Sabah'],['Sarawak','Sarawak'],['Selangor','Selangor'],['Terengganu','Terengganu']]"
                            >
                              Malaysia
                            </option>
                            <option value="Netherlands" data-provinces="[]">
                              Netherlands
                            </option>
                            <option
                              value="New Zealand"
                                  data-provinces="[['Auckland','Auckland'],['Bay of Plenty','Bay of Plenty'],['Canterbury','Canterbury'],['Chatham Islands','Chatham Islands'],['Gisborne','Gisborne'],['Hawke's Bay','Hawke's Bay'],['Manawatu-Wanganui','Manawatū-Whanganui'],['Marlborough','Marlborough'],['Nelson','Nelson'],['Northland','Northland'],['Otago','Otago'],['Southland','Southland'],['Taranaki','Taranaki'],['Tasman','Tasman'],['Waikato','Waikato'],['Wellington','Wellington'],['West Coast','West Coast']]"
                            >
                              New Zealand
                            </option>
                            <option value="Norway" data-provinces="[]">
                              Norway
                            </option>
                            <option value="Poland" data-provinces="[]">
                              Poland
                            </option>
                            <option
                              value="Portugal"
                              data-provinces="[['Aveiro','Aveiro'],['Açores','Azores'],['Beja','Beja'],['Braga','Braga'],['Bragança','Bragança'],['Castelo Branco','Castelo Branco'],['Coimbra','Coimbra'],['Faro','Faro'],['Guarda','Guarda'],['Leiria','Leiria'],['Lisboa','Lisbon'],['Madeira','Madeira'],['Portalegre','Portalegre'],['Porto','Porto'],['Santarém','Santarém'],['Setúbal','Setúbal'],['Viana do Castelo','Viana do Castelo'],['Vila Real','Vila Real'],['Viseu','Viseu'],['Évora','Évora']]"
                            >
                              Portugal
                            </option>
                            <option value="Singapore" data-provinces="[]">
                              Singapore
                            </option>
                            <option
                              value="South Korea"
                              data-provinces="[['Busan','Busan'],['Chungbuk','North Chungcheong'],['Chungnam','South Chungcheong'],['Daegu','Daegu'],['Daejeon','Daejeon'],['Gangwon','Gangwon'],['Gwangju','Gwangju City'],['Gyeongbuk','North Gyeongsang'],['Gyeonggi','Gyeonggi'],['Gyeongnam','South Gyeongsang'],['Incheon','Incheon'],['Jeju','Jeju'],['Jeonbuk','North Jeolla'],['Jeonnam','South Jeolla'],['Sejong','Sejong'],['Seoul','Seoul'],['Ulsan','Ulsan']]"
                            >
                              South Korea
                            </option>
                            <option
                              value="Spain"
                              data-provinces="[['A Coruña','A Coruña'],['Albacete','Albacete'],['Alicante','Alicante'],['Almería','Almería'],['Asturias','Asturias Province'],['Badajoz','Badajoz'],['Balears','Balears Province'],['Barcelona','Barcelona'],['Burgos','Burgos'],['Cantabria','Cantabria Province'],['Castellón','Castellón'],['Ceuta','Ceuta'],['Ciudad Real','Ciudad Real'],['Cuenca','Cuenca'],['Cáceres','Cáceres'],['Cádiz','Cádiz'],['Córdoba','Córdoba'],['Girona','Girona'],['Granada','Granada'],['Guadalajara','Guadalajara'],['Guipúzcoa','Gipuzkoa'],['Huelva','Huelva'],['Huesca','Huesca'],['Jaén','Jaén'],['La Rioja','La Rioja Province'],['Las Palmas','Las Palmas'],['León','León'],['Lleida','Lleida'],['Lugo','Lugo'],['Madrid','Madrid Province'],['Melilla','Melilla'],['Murcia','Murcia'],['Málaga','Málaga'],['Navarra','Navarra'],['Ourense','Ourense'],['Palencia','Palencia'],['Pontevedra','Pontevedra'],['Salamanca','Salamanca'],['Santa Cruz de Tenerife','Santa Cruz de Tenerife'],['Segovia','Segovia'],['Sevilla','Seville'],['Soria','Soria'],['Tarragona','Tarragona'],['Teruel','Teruel'],['Toledo','Toledo'],['Valencia','Valencia'],['Valladolid','Valladolid'],['Vizcaya','Biscay'],['Zamora','Zamora'],['Zaragoza','Zaragoza'],['Álava','Álava'],['Ávila','Ávila']]"
                            >
                              Spain
                            </option>
                            <option value="Sweden" data-provinces="[]">
                              Sweden
                            </option>
                            <option value="Switzerland" data-provinces="[]">
                              Switzerland
                            </option>
                            <option
                              value="United Arab Emirates"
                              data-provinces="[['Abu Dhabi','Abu Dhabi'],['Ajman','Ajman'],['Dubai','Dubai'],['Fujairah','Fujairah'],['Ras al-Khaimah','Ras al-Khaimah'],['Sharjah','Sharjah'],['Umm al-Quwain','Umm al-Quwain']]"
                            >
                              United Arab Emirates
                            </option>
                            <option
                              value="United Kingdom"
                              data-provinces="[['British Forces','British Forces'],['England','England'],['Northern Ireland','Northern Ireland'],['Scotland','Scotland'],['Wales','Wales']]"
                            >
                              United Kingdom
                            </option>
                            <option
                              value="United States"
                              data-provinces="[['Alabama','Alabama'],['Alaska','Alaska'],['American Samoa','American Samoa'],['Arizona','Arizona'],['Arkansas','Arkansas'],['Armed Forces Americas','Armed Forces Americas'],['Armed Forces Europe','Armed Forces Europe'],['Armed Forces Pacific','Armed Forces Pacific'],['California','California'],['Colorado','Colorado'],['Connecticut','Connecticut'],['Delaware','Delaware'],['District of Columbia','Washington DC'],['Federated States of Micronesia','Micronesia'],['Florida','Florida'],['Georgia','Georgia'],['Guam','Guam'],['Hawaii','Hawaii'],['Idaho','Idaho'],['Illinois','Illinois'],['Indiana','Indiana'],['Iowa','Iowa'],['Kansas','Kansas'],['Kentucky','Kentucky'],['Louisiana','Louisiana'],['Maine','Maine'],['Marshall Islands','Marshall Islands'],['Maryland','Maryland'],['Massachusetts','Massachusetts'],['Michigan','Michigan'],['Minnesota','Minnesota'],['Mississippi','Mississippi'],['Missouri','Missouri'],['Montana','Montana'],['Nebraska','Nebraska'],['Nevada','Nevada'],['New Hampshire','New Hampshire'],['New Jersey','New Jersey'],['New Mexico','New Mexico'],['New York','New York'],['North Carolina','North Carolina'],['North Dakota','North Dakota'],['Northern Mariana Islands','Northern Mariana Islands'],['Ohio','Ohio'],['Oklahoma','Oklahoma'],['Oregon','Oregon'],['Palau','Palau'],['Pennsylvania','Pennsylvania'],['Puerto Rico','Puerto Rico'],['Rhode Island','Rhode Island'],['South Carolina','South Carolina'],['South Dakota','South Dakota'],['Tennessee','Tennessee'],['Texas','Texas'],['Utah','Utah'],['Vermont','Vermont'],['Virgin Islands','U.S. Virgin Islands'],['Virginia','Virginia'],['Washington','Washington'],['West Virginia','West Virginia'],['Wisconsin','Wisconsin'],['Wyoming','Wyoming']]"
                            >
                              United States
                            </option>
                            <option value="Vietnam" data-provinces="[]">
                              Vietnam
                            </option>
                          </select>
                        </div>
                      </div>
                          <div className="mb_12">
                        <div className="text-caption-1 text-secondary mb_8">
                          Postal/Zip Code
                        </div>
                        <input
                          className=""
                          type="text"
                          placeholder={100000}
                          name="text"
                          tabIndex={2}
                          defaultValue=""
                          aria-required="true"
                          required
                        />
                          </div>
                      <div className="tf-cart-tool-btns">
                        <button type="submit" className="btn-style-2 w-100">
                          <span className="text text-btn-uppercase">
                            Calculator
                          </span>
                        </button>
                        <div
                          className="text-center w-100 text-btn-uppercase tf-mini-cart-tool-close"
                          onClick={() => setCurrentOpenPopup("")}
                        >
                          Cancel
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div
                  className={`tf-mini-cart-tool-openable ${
                    currentOpenPopup == "add-coupon" ? "open" : ""
                      }`}
                >
                  <div className="tf-mini-cart-tool-content">
                    <label className="tf-mini-cart-tool-text">
                      <span className="icon">
                        <svg
                          width={20}
                          height={20}
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_6766_32777)">
                            <path
                              d="M9.16699 3.33325H3.33366C2.89163 3.33325 2.46771 3.50885 2.15515 3.82141C1.84259 4.13397 1.66699 4.55789 1.66699 4.99992V16.6666C1.66699 17.1086 1.84259 17.5325 2.15515 17.8451C2.46771 18.1577 2.89163 18.3333 3.33366 18.3333H15.0003C15.4424 18.3333 15.8663 18.1577 16.1788 17.8451C16.4914 17.5325 16.667 17.1086 16.667 16.6666V10.8333"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15.417 2.0832C15.7485 1.75168 16.1981 1.56543 16.667 1.56543C17.1358 1.56543 17.5855 1.75168 17.917 2.0832C18.2485 2.41472 18.4348 2.86436 18.4348 3.3332C18.4348 3.80204 18.2485 4.25168 17.917 4.5832L10.0003 12.4999L6.66699 13.3332L7.50033 9.99986L15.417 2.0832Z"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_6766_32777">
                              <rect width={20} height={20} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </span>
                      <span className="text-title">Add A Coupon Code</span>
                    </label>
                    <form
                      className="form-add-coupon tf-mini-cart-tool-wrap"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <fieldset className="">
                        <div className="text-caption-1 text-secondary mb_8">
                          Enter Code
                        </div>
                        <input
                          className=""
                          type="text"
                          placeholder="Discount code"
                          name="text"
                          tabIndex={2}
                          defaultValue=""
                          aria-required="true"
                          required
                        />
                      </fieldset>
                      <div className="tf-cart-tool-btns">
                        <button type="submit" className="btn-style-2 w-100">
                          <span className="text text-btn-uppercase">Save</span>
                        </button>
                        <div
                          className="text-center w-100 text-btn-uppercase tf-mini-cart-tool-close"
                          onClick={() => setCurrentOpenPopup("")}
                        >
                          Cancel
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
