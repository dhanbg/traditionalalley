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
  const [isViewCartLoading, setIsViewCartLoading] = useState(false);
  const [showTopPicks, setShowTopPicks] = useState(false);
  
  // Build product detail URL with preferred variant when applicable
  const buildProductDetailHref = (item) => {
    const baseId = item.baseProductId || item.documentId;
    const variantId = item?.variantInfo?.documentId || item?.variantInfo?.variantId || null;
    return `/product-detail/${baseId}${variantId ? `?variant=${variantId}` : ''}`;
  };
  
  // Initialize image preloader for cart modal
  const modalImagePreloader = useCartImagePreloader(serverCartProducts, {
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
  


  // Helper function to fetch fresh variant data
  const fetchFreshVariantData = async (variantId, productDocumentId) => {
    try {
      console.log('🔄 Fetching fresh variant data for variantId:', variantId, 'productDocumentId:', productDocumentId);
      
      // Try fetching by documentId first
      let response = await fetchDataFromApi(`/api/product-variants?populate=*&filters[documentId][$eq]=${variantId}`);
      
      // If no results and variantId is numeric, try fetching by id
      if (!response.data || response.data.length === 0) {
        console.log('🔄 Trying to fetch by numeric id:', variantId);
        response = await fetchDataFromApi(`/api/product-variants?populate=*&filters[id][$eq]=${variantId}`);
      }
      
      // If still no results and we have productDocumentId, try to find variant by product relationship
      if ((!response.data || response.data.length === 0) && productDocumentId) {
        console.log('🔄 Trying to fetch variant by product relationship for product:', productDocumentId);
        response = await fetchDataFromApi(`/api/product-variants?populate=*&filters[product][documentId][$eq]=${productDocumentId}`);
        
        // If multiple variants found, log them and use the first one (you might want to add more logic here)
        if (response.data && response.data.length > 0) {
          console.log('📊 Found variants for product:', response.data.map(v => ({ id: v.id, documentId: v.documentId })));
          // For now, use the first variant found
        }
      }
      
      if (response.data && response.data.length > 0) {
        const freshData = response.data[0];
        console.log('✅ Fresh variant data fetched:', {
          documentId: freshData.documentId,
          id: freshData.id,
          imgUrl: freshData.imgSrc?.formats?.small?.url
        });
        return freshData;
      }
      console.log('❌ No fresh variant data found for variantId:', variantId);
    } catch (error) {
      console.error('Error fetching fresh variant data:', error);
    }
    return null;
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
                
                // Determine the appropriate image URL based on available formats
                // Prioritize small format for cart display for better performance
                let imgSrcUrl = null;
                if (productData.imgSrc && productData.imgSrc.formats && productData.imgSrc.formats.small && productData.imgSrc.formats.small.url) {
                  imgSrcUrl = getImageUrl(productData.imgSrc.formats.small.url);
                } else if (productData.imgSrc && productData.imgSrc.formats && productData.imgSrc.formats.thumbnail && productData.imgSrc.formats.thumbnail.url) {
                  imgSrcUrl = getImageUrl(productData.imgSrc.formats.thumbnail.url);
                } else {
                  imgSrcUrl = getImageUrl(productData.imgSrc);
                }
                let imgHoverUrl = null;
                if (productData.imgHover && productData.imgHover.formats && productData.imgHover.formats.small && productData.imgHover.formats.small.url) {
                  imgHoverUrl = getImageUrl(productData.imgHover.formats.small.url);
                } else if (productData.imgHover && productData.imgHover.formats && productData.imgHover.formats.thumbnail && productData.imgHover.formats.thumbnail.url) {
                  imgHoverUrl = getImageUrl(productData.imgHover.formats.thumbnail.url);
                } else {
                  imgHoverUrl = getImageUrl(productData.imgHover);
                }
                
                // Parse variant information if available
                let variantInfo = null;
                let cartItemId = productDocId || cart.product.id;
                let title = cart.product.title;
                
                if (cart.variantInfo) {
                  try {
                    // Check if variantInfo is already an object (not a string)
                    if (typeof cart.variantInfo === 'object' && cart.variantInfo !== null) {
                      variantInfo = cart.variantInfo;
                    } else if (typeof cart.variantInfo === 'string') {
                      // Only try to parse if it's a string and not "[object Object]"
                      if (cart.variantInfo !== "[object Object]" && cart.variantInfo.trim() !== "") {
                        variantInfo = JSON.parse(cart.variantInfo);
                      } else {
                        console.warn("Skipping invalid variantInfo string:", cart.variantInfo);
                        variantInfo = null;
                      }
                    }
                    
                    if (variantInfo) {
                      // Fetch fresh variant data if variantId exists
                      if (variantInfo.isVariant && variantInfo.variantId) {
                        try {
                          const freshVariantData = await fetchFreshVariantData(variantInfo.variantId, productDocId);
                          if (freshVariantData) {
                            // Update variant info with fresh data
                            if (freshVariantData.imgSrc) {
                              variantInfo.imgSrc = freshVariantData.imgSrc;
                            }
                            // Update title if available
                            if (freshVariantData.title) {
                              variantInfo.title = freshVariantData.title;
                            }
                          }
                        } catch (error) {
                          console.error('Error fetching fresh variant data:', error);
                        }
                      }
                      
                      // Reconstruct the variant-specific cart item ID using documentId (same as when adding to cart)
                      if (variantInfo.isVariant && (variantInfo.documentId || variantInfo.variantId)) {
                        // Use documentId first (preferred), then fall back to variantId for backward compatibility
                        const variantIdentifier = variantInfo.documentId || variantInfo.variantId;
                        cartItemId = `${productDocId || cart.product.id}-variant-${variantIdentifier}`;
                        console.log('🔧 Reconstructed cart item ID for variant:', {
                          cartItemId,
                          productDocId,
                          variantIdentifier,
                          variantInfo: {
                            documentId: variantInfo.documentId,
                            variantId: variantInfo.variantId,
                            isVariant: variantInfo.isVariant
                          }
                        });
                      }
                      
                      // Use variant-specific title and image
                      if (variantInfo.title && variantInfo.isVariant) {
                        title = `${cart.product.title} - ${variantInfo.title}`;
                      }
                      
                      // Handle variant-specific image with proper format selection
                      if (variantInfo.imgSrc) {
                        // Apply same small format logic to variant images
                        if (variantInfo.imgSrc.formats && variantInfo.imgSrc.formats.small && variantInfo.imgSrc.formats.small.url) {
                          const smallUrl = variantInfo.imgSrc.formats.small.url;
                          imgSrcUrl = smallUrl.startsWith('http') ? smallUrl : `${API_URL}${smallUrl}`;
                        } else if (variantInfo.imgSrc.formats && variantInfo.imgSrc.formats.thumbnail && variantInfo.imgSrc.formats.thumbnail.url) {
                          const thumbnailUrl = variantInfo.imgSrc.formats.thumbnail.url;
                          imgSrcUrl = thumbnailUrl.startsWith('http') ? thumbnailUrl : `${API_URL}${thumbnailUrl}`;
                        } else if (variantInfo.imgSrc.url) {
                          const mainUrl = variantInfo.imgSrc.url;
                          imgSrcUrl = mainUrl.startsWith('http') ? mainUrl : `${API_URL}${mainUrl}`;
                        } else if (typeof variantInfo.imgSrc === 'string') {
                          // If it's already a string URL, use it as is
                          imgSrcUrl = variantInfo.imgSrc;
                        } else {
                          imgSrcUrl = getImageUrl(variantInfo.imgSrc);
                        }
                      }

                    }
                  } catch (parseError) {
                    console.error("Error parsing variant info:", parseError, "Raw value:", cart.variantInfo);
                    variantInfo = null;
                  }
                }
                
                // Add size to cart item ID if available (for unique identification)
                if (cart.size) {
                  cartItemId = `${cartItemId}-size-${cart.size}`;
                }
                
                // Create a cart product object with all needed details
                const productWithQuantity = {
                  id: cartItemId, // Use variant-specific ID
                  baseProductId: productDocId || cart.product.id, // Keep reference to base product documentId
                  documentId: productDocId,
                  title: title,
                  price: cart.product.price,
                  quantity: cart.quantity,
                  imgSrc: imgSrcUrl,
                  imgHover: imgHoverUrl,
                  cartId: cart.id,
                  cartDocumentId: cart.documentId,
                  // Add color and size data
                  colors: productData.colors || [],
                  sizes: productData.sizes || productData.filterSizes || [],
                  selectedSize: cart.size || null, // Include selected size
                  variantInfo: variantInfo // Include variant info
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
          
          // Merge server data with local cart instead of replacing entirely
          // This prevents newly added items from disappearing during server sync
          setCartProducts(prevCartProducts => {
            // Create a map of server products by ID for quick lookup
            const serverProductsMap = new Map();
            productsWithDetails.forEach(product => {
              serverProductsMap.set(product.id, product);
            });
            
            // Start with server products as the base
            const mergedProducts = [...productsWithDetails];
            
            // Add any local products that aren't in server data yet
            // (these are likely recently added items that haven't synced yet)
            prevCartProducts.forEach(localProduct => {
              if (!serverProductsMap.has(localProduct.id)) {
                mergedProducts.push(localProduct);
              }
            });
            
            return mergedProducts;
          });
          
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
            const userDocumentId = userData.documentId || userData.attributes?.documentId;
            
            const cartResponse = await fetchDataFromApi(
              `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`
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
                
                // Get image URLs, prefer small format for cart display
                let imgSrcUrl = null;
                if (productAttrs.imgSrc && productAttrs.imgSrc.formats && productAttrs.imgSrc.formats.small && productAttrs.imgSrc.formats.small.url) {
                  const smallUrl = productAttrs.imgSrc.formats.small.url;
                  imgSrcUrl = smallUrl.startsWith('http') ? smallUrl : `${API_URL}${smallUrl}`;
                } else if (productAttrs.imgSrc && productAttrs.imgSrc.formats && productAttrs.imgSrc.formats.thumbnail && productAttrs.imgSrc.formats.thumbnail.url) {
                  const thumbnailUrl = productAttrs.imgSrc.formats.thumbnail.url;
                  imgSrcUrl = thumbnailUrl.startsWith('http') ? thumbnailUrl : `${API_URL}${thumbnailUrl}`;
                } else {
                  imgSrcUrl = getImageUrl(productAttrs.imgSrc);
                }
                let imgHoverUrl = null;
                if (productAttrs.imgHover && productAttrs.imgHover.formats && productAttrs.imgHover.formats.small && productAttrs.imgHover.formats.small.url) {
                  const smallUrl = productAttrs.imgHover.formats.small.url;
                  imgHoverUrl = smallUrl.startsWith('http') ? smallUrl : `${API_URL}${smallUrl}`;
                } else if (productAttrs.imgHover && productAttrs.imgHover.formats && productAttrs.imgHover.formats.thumbnail && productAttrs.imgHover.formats.thumbnail.url) {
                  const thumbnailUrl = productAttrs.imgHover.formats.thumbnail.url;
                  imgHoverUrl = thumbnailUrl.startsWith('http') ? thumbnailUrl : `${API_URL}${thumbnailUrl}`;
                } else {
                  imgHoverUrl = getImageUrl(productAttrs.imgHover);
                }
                
                // Parse variant information if available
                let variantInfo = null;
                let cartItemId = productDocId || productId;
                let title = productAttrs.title || 'Product Item';
                
                if (cart.attributes.variantInfo) {
                  try {
                    // Check if variantInfo is already an object (not a string)
                    if (typeof cart.attributes.variantInfo === 'object' && cart.attributes.variantInfo !== null) {
                      variantInfo = cart.attributes.variantInfo;
                    } else if (typeof cart.attributes.variantInfo === 'string') {
                      // Only try to parse if it's a string and not "[object Object]"
                      if (cart.attributes.variantInfo !== "[object Object]" && cart.attributes.variantInfo.trim() !== "") {
                        variantInfo = JSON.parse(cart.attributes.variantInfo);
                      } else {
                        console.warn("Skipping invalid variantInfo string:", cart.attributes.variantInfo);
                        variantInfo = null;
                      }
                    }
                    
                    if (variantInfo) {
                      // Fetch fresh variant data if variantId exists
                      if (variantInfo.isVariant && variantInfo.variantId) {
                        try {
                          const freshVariantData = await fetchFreshVariantData(variantInfo.variantId, productDocId);
                          if (freshVariantData) {
                            // Update variant info with fresh data
                            if (freshVariantData.imgSrc) {
                              variantInfo.imgSrc = freshVariantData.imgSrc;
                            }
                            // Update title if available
                            if (freshVariantData.title) {
                              variantInfo.title = freshVariantData.title;
                            }
                          }
                        } catch (error) {
                          console.error('Error fetching fresh variant data:', error);
                        }
                      }
                      
                      // Reconstruct the variant-specific cart item ID using documentId
                      if (variantInfo.isVariant && variantInfo.variantId) {
                        cartItemId = `${productDocId || productId}-variant-${variantInfo.variantId}`;
                      }
                      
                      // Use variant-specific title and image
                      if (variantInfo.title && variantInfo.isVariant) {
                        title = `${productAttrs.title || 'Product Item'} - ${variantInfo.title}`;
                      }
                      
                      // Handle variant-specific image with proper format selection
                      if (variantInfo.imgSrc) {
                        // Apply same small format logic to variant images
                        if (variantInfo.imgSrc.formats && variantInfo.imgSrc.formats.small && variantInfo.imgSrc.formats.small.url) {
                          const smallUrl = variantInfo.imgSrc.formats.small.url;
                          imgSrcUrl = smallUrl.startsWith('http') ? smallUrl : `${API_URL}${smallUrl}`;
                        } else if (variantInfo.imgSrc.formats && variantInfo.imgSrc.formats.thumbnail && variantInfo.imgSrc.formats.thumbnail.url) {
                          const thumbnailUrl = variantInfo.imgSrc.formats.thumbnail.url;
                          imgSrcUrl = thumbnailUrl.startsWith('http') ? thumbnailUrl : `${API_URL}${thumbnailUrl}`;
                        } else if (variantInfo.imgSrc.url) {
                          const mainUrl = variantInfo.imgSrc.url;
                          imgSrcUrl = mainUrl.startsWith('http') ? mainUrl : `${API_URL}${mainUrl}`;
                        } else if (typeof variantInfo.imgSrc === 'string') {
                          imgSrcUrl = variantInfo.imgSrc;
                        } else {
                          imgSrcUrl = getImageUrl(variantInfo.imgSrc);
                        }
                      }
                    }
                  } catch (parseError) {
                    console.error("Error parsing variant info:", parseError, "Raw value:", cart.attributes.variantInfo);
                    variantInfo = null;
                  }
                }
                
                // Create cart product object
                const productWithQuantity = {
                  id: cartItemId, // Use variant-specific ID
                  baseProductId: productDocId || productId, // Keep reference to base product documentId
                  documentId: productDocId,
                  title: title,
                  price: parseFloat(productAttrs.price) || 0,
                  quantity: cart.attributes.quantity || 1,
                  imgSrc: imgSrcUrl,
                  cartId: cart.id,
                  cartDocumentId: cart.attributes.documentId,
                  colors: productAttrs.colors || [],
                  sizes: productAttrs.sizes || productAttrs.filterSizes || [],
                  selectedSize: cart.attributes.size || null, // Include selected size
                  variantInfo: variantInfo // Include variant info
                };
                
                productsWithDetails.push(productWithQuantity);
                totalPrice += productWithQuantity.price * productWithQuantity.quantity;
              }
              
              setServerCartProducts(productsWithDetails);
              setServerTotalPrice(totalPrice);
              
              // Also merge with context cart to ensure consistency
              setCartProducts(prevCartProducts => {
                // Create a map of server products by ID for quick lookup
                const serverProductsMap = new Map();
                productsWithDetails.forEach(product => {
                  serverProductsMap.set(product.id, product);
                });
                
                // Start with server products as the base
                const mergedProducts = [...productsWithDetails];
                
                // Add any local products that aren't in server data yet
                // (these are likely recently added items that haven't synced yet)
                prevCartProducts.forEach(localProduct => {
                  if (!serverProductsMap.has(localProduct.id)) {
                    mergedProducts.push(localProduct);
                  }
                });
                
                return mergedProducts;
              });
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

  // Get selected cart items functionality
  const {
    selectedCartItems,
    toggleCartItemSelection,
    getSelectedCartItems,
    getSelectedItemsTotal
  } = useContextElement();
  
  // Get all cart products first
  const allCartProducts = user 
    ? serverCartProducts.length > 0 
      ? serverCartProducts 
      : cartProducts // Only fall back to context cart products if server cart is empty
    : cartProducts; // Use local cart for guest users
  
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
                        {serverCartLoading ? (
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