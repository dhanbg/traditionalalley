"use client";
import { allProducts } from "@/data/productsWomen";
import { openCartModal } from "@/utils/openCartModal";
import { openWistlistModal } from "@/utils/openWishlist";
import { useUser } from "@clerk/nextjs";
import { API_URL, STRAPI_API_TOKEN, CARTS_API, USER_CARTS_API, PRODUCT_BY_DOCUMENT_ID_API } from "@/utils/urls";
import { fetchDataFromApi, createData, updateData, deleteData } from "@/utils/api";

import React, { useContext, useEffect, useState } from "react";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const { user } = useUser();
  const [cartProducts, setCartProducts] = useState([]);
  const [wishList, setWishList] = useState([1, 2, 3]);
  const [compareItem, setCompareItem] = useState([1, 2, 3]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.price;
    }, 0);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  const isAddedToCartProducts = (id) => {
    // First check by direct ID match
    if (cartProducts.filter((elm) => elm.id == id)[0]) {
      return true;
    }
    
    // Also check by documentId
    if (typeof id === 'string' && id.length > 0) {
      // Check if the id itself is a documentId
      if (cartProducts.some(product => product.documentId === id)) {
        return true;
      }
      
      // Check if product exists in allProducts and has a matching documentId
      const productInfo = allProducts.find(product => product.id === id);
      if (productInfo && productInfo.documentId) {
        return cartProducts.some(product => product.documentId === productInfo.documentId);
      }
    }
    
    return false;
  };
  
  // Check if a product with a specific documentId already exists in the cart
  const isProductDocumentIdInCart = (documentId) => {
    if (!documentId) return false;
    
    // Check local cart first
    for (const product of cartProducts) {
      if (product.documentId === documentId) {
        return true;
      }
    }
    
    return false;
  };
  
  const addProductToCart = async (id, qty, isModal = true) => {
    // Log the product ID that was clicked
    console.log("Product ID clicked for add-to-cart:", id);
    
    // Check if product is already in cart by ID
    if (isAddedToCartProducts(id)) {
      console.log("Product already in cart:", id);
      // Optional: Show a notification to user that product is already in cart
      if (isModal) {
        // Still open the cart modal to show them the product is already there
        openCartModal();
      }
      return; // Exit function early
    }
    
    // Try to find the product in allProducts to get complete information
    const productInfo = allProducts.find(product => product.id === id || (product.documentId && product.documentId === id));
    let productToAdd = null;
    
    if (productInfo) {
      console.log("Found product in allProducts:", productInfo);
      productToAdd = {
        id: productInfo.id,
        documentId: productInfo.documentId,
        title: productInfo.title,
        price: productInfo.price,
        quantity: qty || 1,
        colors: productInfo.colors || [],
        sizes: productInfo.sizes || [],
        imgSrc: productInfo.imgSrc?.url ? 
                `${API_URL}${productInfo.imgSrc.url}` : 
                (typeof productInfo.imgSrc === 'string' ? productInfo.imgSrc : '/images/placeholder.png')
      };
    } else {
      console.log("Product not found in allProducts, fetching from API...");
      // The ID might be a documentId, especially if it's a string that looks like a UUID/hash
      try {
        let productResponse = null;
        
        // Try both approaches - by numeric ID or by documentId
        if (!isNaN(parseInt(id))) {
          productResponse = await fetchDataFromApi(`/api/products/${parseInt(id)}?populate=*`);
        } else {
          productResponse = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${id}&populate=*`);
        }
        
        // Handle different response formats
        let fetchedProduct = null;
        if (productResponse && productResponse.data) {
          if (Array.isArray(productResponse.data) && productResponse.data.length > 0) {
            fetchedProduct = productResponse.data[0];
          } else {
            fetchedProduct = productResponse.data;
          }
        }
        
        if (fetchedProduct) {
          const productData = fetchedProduct.attributes || fetchedProduct;
          
          // Check if imgSrc is a relation or direct field
          let imgUrl = '/images/placeholder.png';
          if (productData.imgSrc?.data?.attributes?.url) {
            imgUrl = `${API_URL}${productData.imgSrc.data.attributes.url}`;
          } else if (productData.imgSrc?.url) {
            imgUrl = `${API_URL}${productData.imgSrc.url}`;
          } else if (typeof productData.imgSrc === 'string') {
            imgUrl = productData.imgSrc;
          } else if (productData.gallery && productData.gallery.length > 0) {
            // Try to use first gallery image if no main image
            const galleryImg = productData.gallery[0];
            imgUrl = `${API_URL}${galleryImg.url || galleryImg.formats?.thumbnail?.url || ''}`;
          }
          
          productToAdd = {
            id: fetchedProduct.id,
            documentId: productData.documentId,
            title: productData.title || 'Product Item',
            price: parseFloat(productData.price) || 0,
            quantity: qty || 1,
            colors: productData.colors || [],
            sizes: productData.sizes || [],
            imgSrc: imgUrl
          };
          
          console.log("Created product object from API response:", productToAdd);
        }
      } catch (fetchError) {
        console.error("Error fetching product details:", fetchError);
      }
    }
    
    // If we still don't have complete product info, create a basic dummy product
    if (!productToAdd) {
      console.warn("Creating basic product info without details");
      productToAdd = {
        id: id,
        documentId: typeof id === 'string' && id.length > 20 ? id : null,
        title: "Product Item",
        price: 0,
        quantity: qty || 1,
        colors: [],
        sizes: [],
        imgSrc: '/images/placeholder.png'
      };
    }
    
    if (user) {
      try {
        // Get the current logged-in user data
        console.log(`Getting user data for current user: ${user.id}`);
        const currentUserData = await fetchDataFromApi(`/api/user-datas?filters[clerkUserId][$eq]=${user.id}&populate=user_bag`);
        
        // If the user doesn't exist in our system, we need to handle this case
        if (!currentUserData?.data || currentUserData.data.length === 0) {
          console.log(`No user data found for current user ${user.id}. Creating new user data.`);
          
          // Create a new user_data entry for this user
          try {
            const newUserPayload = {
              data: {
                firstName: user.firstName || user.username || "User",
                lastName: user.lastName || "",
                clerkUserId: user.id,
                avatar: user.imageUrl || ""
              }
            };
            
            const newUserResponse = await createData("/api/user-datas", newUserPayload);
            console.log("Created new user data:", newUserResponse);
            
            if (newUserResponse?.data?.id) {
              // Now let's create a user bag for this new user
              const userBagPayload = {
                data: {
                  Name: `${newUserPayload.data.firstName} ${newUserPayload.data.lastName}`,
                  user_datum: newUserResponse.data.id
                }
              };
              
              const userBagResponse = await createData("/api/user-bags", userBagPayload);
              console.log("Created new user bag:", userBagResponse);
              
              // Now add product to cart
              if (userBagResponse?.data?.id) {
                const cartPayload = {
                  data: {
                    quantity: qty || 1,
                    user_datum: newUserResponse.data.id,
                    user_bag: userBagResponse.data.id
                  }
                };
                
                // Add product to payload if we have a valid ID
                if (!isNaN(parseInt(productToAdd.id))) {
                  cartPayload.data.product = parseInt(productToAdd.id);
                } else if (productToAdd.documentId) {
                  // Find product by documentId
                  try {
                    const productResponse = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${productToAdd.documentId}&populate=*`);
                    if (productResponse?.data && productResponse.data.length > 0) {
                      cartPayload.data.product = productResponse.data[0].id;
                    }
                  } catch (error) {
                    console.error("Error finding product by documentId:", error);
                  }
                }
                
                const cartResponse = await createData("/api/carts", cartPayload);
                console.log("Added product to cart for new user:", cartResponse);
                
                // Add cartId and cartDocumentId to the product object
                if (cartResponse?.data) {
                  productToAdd.cartId = cartResponse.data.id;
                  productToAdd.cartDocumentId = cartResponse.data.attributes?.documentId;
                }
                
                // Add to local state
                setCartProducts((pre) => [...pre, productToAdd]);
                
                if (isModal) {
                  openCartModal();
                }
                
                return;
              }
            }
          } catch (createUserError) {
            console.error("Error creating new user data:", createUserError);
          }
        }
        
        // Extract the current user data
        const currentUser = currentUserData?.data?.[0];
        const currentUserId = currentUser?.id;
        const currentUserAttrs = currentUser?.attributes || {};
        
        if (!currentUserId) {
          console.error("Could not get current user ID");
          // Add to local cart only since we couldn't identify the user
          setCartProducts((pre) => [...pre, productToAdd]);
          
          if (isModal) {
            openCartModal();
          }
          
          return;
        }
        
        console.log(`Found current user data with ID: ${currentUserId}`);
        
        // Check if user has a user-bag
        const userBagRelation = currentUserAttrs.user_bag;
        let userBag = null;
        
        // Check for existing user-bag in response
        if (userBagRelation) {
          if (userBagRelation.data) {
            userBag = userBagRelation.data;
          } else if (userBagRelation.id) {
            userBag = userBagRelation;
          }
        }
        
        // Double-check for existing user-bag by querying directly
        if (!userBag) {
          try {
            const existingBags = await fetchDataFromApi(`/api/user-bags?filters[user_datum][id][$eq]=${currentUserId}&populate=*`);
            
            if (existingBags.data && existingBags.data.length > 0) {
              userBag = existingBags.data[0];
              console.log(`Found existing user bag: ${userBag.id}`);
            }
          } catch (bagCheckError) {
            console.error("Error checking for existing bags:", bagCheckError);
          }
        }
        
        // Create a user-bag if none exists
        if (!userBag) {
          console.log("No user bag found, creating a new one");
          
          // Get user name from current user data
          const firstName = currentUserAttrs.firstName || user.firstName || "User";
          const lastName = currentUserAttrs.lastName || user.lastName || "";
          
          try {
            const userBagPayload = {
              data: {
                Name: `${firstName} ${lastName}`.trim(),
                user_datum: currentUserId
              }
            };
            
            const userBagData = await createData("/api/user-bags", userBagPayload);
            userBag = userBagData.data;
            console.log(`Created new user bag: ${userBag.id}`);
          } catch (createBagError) {
            console.error("Error creating user bag:", createBagError);
          }
        }
        
        // Add the product to cart
        try {
          // Prepare complete cart payload
          const completeCartPayload = {
            data: {
              quantity: qty || 1,
              user_datum: currentUserId
            }
          };
          
          // Add user_bag if available
          if (userBag) {
            // Extract the ID based on structure
            let userBagId = null;
            
            if (userBag.id) {
              userBagId = userBag.id;
            } else if (userBag.data && userBag.data.id) {
              userBagId = userBag.data.id;
            }
            
            if (userBagId) {
              completeCartPayload.data.user_bag = userBagId;
            }
          }
          
          // Add product to payload
          if (!isNaN(parseInt(productToAdd.id))) {
            completeCartPayload.data.product = parseInt(productToAdd.id);
          } else if (productToAdd.documentId) {
            // Find product by documentId
            try {
              const productResponse = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${productToAdd.documentId}&populate=*`);
              if (productResponse?.data && productResponse.data.length > 0) {
                completeCartPayload.data.product = productResponse.data[0].id;
              }
            } catch (error) {
              console.error("Error finding product by documentId:", error);
            }
          }
          
          // Create cart entry
          console.log("Creating cart entry with payload:", completeCartPayload);
          const cartResponse = await createData("/api/carts", completeCartPayload);
          console.log("Added to cart:", cartResponse);
          
          // Add cartId and cartDocumentId to the product object
          if (cartResponse?.data) {
            productToAdd.cartId = cartResponse.data.id;
            productToAdd.cartDocumentId = cartResponse.data.attributes?.documentId;
          }
          
          // Add to local state
          setCartProducts((pre) => [...pre, productToAdd]);
          
          if (isModal) {
            openCartModal();
          }
        } catch (createCartError) {
          console.error("Error creating cart entry:", createCartError);
          
          // Add to local cart even if server operation fails
          setCartProducts((pre) => [...pre, productToAdd]);
          
          if (isModal) {
            openCartModal();
          }
        }
      } catch (error) {
        console.error("Error in addProductToCart:", error);
        
        // Add to local cart even if an error occurs
        setCartProducts((pre) => [...pre, productToAdd]);
        
        if (isModal) {
          openCartModal();
        }
      }
    } else {
      // No user logged in, add to local cart only
      setCartProducts((pre) => [...pre, productToAdd]);
      
      if (isModal) {
        openCartModal();
      }
    }
  };

  const updateQuantity = (id, amount, isIncrement = false) => {
    console.log("Updating quantity for ID:", id, "Amount:", amount, "IsIncrement:", isIncrement);
    
    try {
      // First, update the UI immediately for a responsive experience
      const updatedProducts = cartProducts.map((item) => {
        // Try to match either by ID or documentId
        const itemMatches = item.id == id || (item.documentId && item.documentId === id);
        
        if (itemMatches) {
          console.log("Found matching item in cart:", item);
          
          // For increment mode, add the amount to current quantity
          // For direct mode, set the quantity to the amount
          const newQuantity = isIncrement ? item.quantity + amount : amount;
          
          // Optional: Enforce minimum quantity of 1
          const finalQuantity = Math.max(1, newQuantity);
          
          // Return updated item for frontend state
          return { ...item, quantity: finalQuantity };
        }
        
        // Return unchanged item if no match
        return item;
      });
      
      // Update local state immediately
      setCartProducts(updatedProducts);
      
      // Then handle the backend update
      const matchingItem = updatedProducts.find(item => item.id == id || (item.documentId && item.documentId === id));
      
      if (!matchingItem) {
        console.error("No matching item found in cart for ID:", id);
        return;
      }
      
      const finalQuantity = matchingItem.quantity;
      console.log("Updating backend with quantity:", finalQuantity);
      
      // Backend update function
      const updateBackend = async () => {
        try {
          // If we already have the cart document ID, use it directly
          if (matchingItem.cartDocumentId) {
            console.log(`Using known cart document ID for update: ${matchingItem.cartDocumentId}`);
            const updatePayload = {
              data: {
                quantity: finalQuantity
              }
            };
            
            try {
              // Use the documentId in the URL instead of numeric ID
              const updateResponse = await updateData(`/api/carts/${matchingItem.cartDocumentId}`, updatePayload);
              console.log("✅ Backend update successful with cartDocumentId:", updateResponse);
              return;
            } catch (updateError) {
              console.error(`❌ Error updating cart with cartDocumentId ${matchingItem.cartDocumentId}:`, updateError);
              // Continue to fallback methods
            }
          }
          
          // Get all cart items to find the correct one
          console.log("Fetching current cart data to find the right cart item...");
          const cartResponse = await fetchDataFromApi(`/api/carts?populate=*`);
          
          if (!cartResponse?.data?.length) {
            console.log("No cart items found in backend");
            return;
          }
          
          console.log(`Found ${cartResponse.data.length} cart items in backend`);
          
          // Find the matching cart item
          let foundCartItem = null;
          let cartDocumentId = null;
          
          // Try to match based on product ID or documentId
          for (const cartItem of cartResponse.data) {
            // Skip cart items without product data
            if (!cartItem.attributes?.product?.data) continue;
            
            const productData = cartItem.attributes.product.data;
            const productId = productData.id;
            const productDocId = productData.attributes?.documentId;
            
            const matchesProductId = productId == id;
            const matchesDocumentId = productDocId && matchingItem.documentId && productDocId === matchingItem.documentId;
            
            if (matchesProductId || matchesDocumentId) {
              foundCartItem = cartItem;
              cartDocumentId = cartItem.attributes.documentId;
              console.log(`Found matching cart item with document ID: ${cartDocumentId}`);
              break;
            }
          }
          
          if (!foundCartItem || !cartDocumentId) {
            console.error("Could not find cart item in backend that matches product ID or documentId");
            return;
          }
          
          // Update the item using the document ID we found
          console.log(`Updating cart with document ID: ${cartDocumentId}`);
          const updatePayload = {
            data: {
              quantity: finalQuantity
            }
          };
          
          try {
            // Use the documentId in the URL instead of numeric ID
            const updateResponse = await updateData(`/api/carts/${cartDocumentId}`, updatePayload);
            console.log("✅ Backend update successful with documentId:", updateResponse);
            
            // Store the cart document ID for future use
            setCartProducts(prev => prev.map(item => {
              if (item.id == id || (item.documentId && item.documentId === matchingItem.documentId)) {
                return { ...item, cartDocumentId };
              }
              return item;
            }));
          } catch (updateError) {
            console.error(`❌ Error updating cart with documentId ${cartDocumentId}:`, updateError);
            
            // Try direct fetch as last resort
            try {
              console.log(`Last resort: direct fetch to ${API_URL}/api/carts/${cartDocumentId}`);
              
              const directResponse = await fetch(`${API_URL}/api/carts/${cartDocumentId}?populate=*`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatePayload)
              });
              
              if (directResponse.ok) {
                console.log("✅ Direct fetch update successful");
                // Store the cart document ID for future use
                setCartProducts(prev => prev.map(item => {
                  if (item.id == id || (item.documentId && item.documentId === matchingItem.documentId)) {
                    return { ...item, cartDocumentId };
                  }
                  return item;
                }));
              } else {
                const errorText = await directResponse.text();
                console.error(`❌ Direct fetch failed: ${directResponse.status}`, errorText);
              }
            } catch (directError) {
              console.error("❌ All update attempts failed:", directError);
            }
          }
        } catch (error) {
          console.error("❌ Error in backend update process:", error);
        }
      };
      
      // Fire and forget the backend update - don't block the UI
      updateBackend();
      
    } catch (error) {
      console.error("Error in updateQuantity function:", error);
    }
  };

  const addToWishlist = (id) => {
    if (!wishList.includes(id)) {
      setWishList((pre) => [...pre, id]);
      openWistlistModal();
    }
  };

  const removeFromWishlist = (id) => {
    if (wishList.includes(id)) {
      setWishList((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const addToCompareItem = (id) => {
    if (!compareItem.includes(id)) {
      setCompareItem((pre) => [...pre, id]);
    }
  };
  const removeFromCompareItem = (id) => {
    if (compareItem.includes(id)) {
      setCompareItem((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const isAddedtoWishlist = (id) => {
    if (wishList.includes(id)) {
      return true;
    }
    return false;
  };
  const isAddedtoCompareItem = (id) => {
    if (compareItem.includes(id)) {
      return true;
    }
    return false;
  };
  
  // Load cart data from backend when user logs in
  useEffect(() => {
    if (user) {
      console.log("User logged in, loading cart data from backend");
      
      const loadCartFromBackend = async () => {
        try {
          // Fetch user-specific carts from backend
          const cartResponse = await fetchDataFromApi(`/api/carts?populate=*`);
          console.log("Fetched cart data from backend:", cartResponse);
          
          if (cartResponse?.data?.length > 0) {
            // Transform backend cart items into the format expected by the UI
            const backendCarts = cartResponse.data.map(cartItem => {
              if (!cartItem || !cartItem.attributes) {
                console.log("Invalid cart item:", cartItem);
                return null; // Skip this item
              }
              
              // Safely access product data with null checks at each level
              const attributes = cartItem.attributes || {};
              const productRelation = attributes.product || {};
              const productData = productRelation.data || {};
              const productAttrs = productData.attributes || {};
              const productId = productData.id;
              
              // Skip items without product data
              if (!productId) {
                console.log(`Cart item ${cartItem.id} has no associated product, skipping`);
                return null;
              }
              
              return {
                id: productId,
                cartId: cartItem.id,
                cartDocumentId: attributes.documentId,
                documentId: productAttrs.documentId,
                title: productAttrs.title || "Product Item",
                price: productAttrs.price || 0,
                quantity: attributes.quantity || 1,
                colors: productAttrs.colors || [],
                sizes: productAttrs.sizes || []
              };
            })
            // Filter out null entries (invalid items)
            .filter(item => item !== null);
            
            console.log("Transformed cart items:", backendCarts);
            setCartProducts(backendCarts);
      } else {
            console.log("No cart items found in backend");
            setCartProducts([]);
          }
        } catch (error) {
          console.error("Error loading cart from backend:", error);
          // Set empty cart on error to avoid UI issues
          setCartProducts([]);
        }
      };
      
      loadCartFromBackend();
    } else {
      // User logged out, clear the cart
      console.log("User logged out, clearing cart");
      setCartProducts([]);
    }
  }, [user]);

  // Remove localStorage saving for cart data
  useEffect(() => {
    // We're no longer saving cart data to localStorage
    // All data will be stored only in the backend
  }, [cartProducts, user]);
  
  // Remove localStorage loading for wishlist
  useEffect(() => {
    // We're no longer loading wishlist data from localStorage
  }, [user]);

  // Remove localStorage saving for wishlist
  useEffect(() => {
    // We're no longer saving wishlist to localStorage
  }, [wishList, user]);

  // Add debug logging when cart items are added or updated
  useEffect(() => {
    if (cartProducts.length > 0) {
      console.log("Cart products updated:", cartProducts);
      cartProducts.forEach(item => {
        console.log(`Cart item ${item.id}:`, {
          id: item.id,
          documentId: item.documentId,
          quantity: item.quantity,
          hasDocumentId: !!item.documentId
        });
      });
    }
  }, [cartProducts]);
  
  // Existing useEffect for totalPrice
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.price;
    }, 0);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  // Clear all localStorage data on component mount
  useEffect(() => {
    console.log("Clearing all localStorage data");
    
    // Clear anonymous cart data
    localStorage.removeItem("cartList");
    
    // Clear user-specific cart data (for all users)
    const localStorageKeys = Object.keys(localStorage);
    for (const key of localStorageKeys) {
      if (key.startsWith("cartList_") || key.startsWith("wishlist_")) {
        localStorage.removeItem(key);
        console.log(`Removed localStorage item: ${key}`);
      }
    }
    
    // Clear wishlist data
    localStorage.removeItem("wishlist");
    
    // Clear any other localStorage items related to the app
    localStorage.removeItem("compareItems");
    
    console.log("All localStorage data cleared");
  }, []);

  // Function to remove item from cart (both frontend and backend)
  const removeFromCart = async (id, directCartDocumentId = null) => {
    try {
      console.log(`Context: Removing cart item with id: ${id}, directCartDocumentId: ${directCartDocumentId}`);
      
      // First update the local state to remove the item
      const updatedCart = cartProducts.filter(item => {
        // Filter out the item with matching id
        return item.id != id && 
               // Also check document ID if available
               (item.documentId !== id) && 
               // Also ensure we don't have the same product with a different ID format
               (item.cartDocumentId !== directCartDocumentId);
      });
      
      // Update the UI immediately
      setCartProducts(updatedCart);
      
      // Find the cart item in our state before removing it (for backend deletion)
      const cartItem = cartProducts.find(item => 
        item.id == id || 
        (item.documentId === id) || 
        (item.cartDocumentId === directCartDocumentId)
      );
      
      if (!cartItem) {
        console.log(`Context: Could not find cart item with id ${id} in local state`);
        return;
      }
      
      // If directCartDocumentId was provided directly (first priority)
      if (directCartDocumentId) {
        console.log(`Context: Using provided directCartDocumentId ${directCartDocumentId} for deletion`);
        
        try {
          await deleteData(`/api/carts/${directCartDocumentId}`);
          console.log(`Context: Successfully deleted cart item with directCartDocumentId ${directCartDocumentId}`);
          return;
        } catch (directIdError) {
          console.log(`Context: Failed to delete by provided directCartDocumentId: ${directIdError.message}`);
          
          // If error mentions document ID not valid, try to delete by numeric ID as fallback
          if (directIdError.message && directIdError.message.includes("not valid") && cartItem.cartId) {
            try {
              await deleteData(`/api/carts/${cartItem.cartId}`);
              console.log(`Context: Successfully deleted cart item by numeric ID ${cartItem.cartId} after document ID failed`);
              return;
            } catch (numericIdError) {
              console.error(`Context: Failed to delete by numeric ID after document ID failed:`, numericIdError);
            }
          }
        }
      }
      
      // Try with cartDocumentId stored in the cart item object (second priority)
      if (cartItem.cartDocumentId) {
        console.log(`Context: Using cart item's cartDocumentId ${cartItem.cartDocumentId} for deletion`);
        
        try {
          await deleteData(`/api/carts/${cartItem.cartDocumentId}`);
          console.log(`Context: Successfully deleted cart item with cartDocumentId ${cartItem.cartDocumentId}`);
          return;
        } catch (cartDocumentIdError) {
          console.error("Context: Error deleting by cartDocumentId:", cartDocumentIdError);
        }
      }
      
      // Try with cartId stored in the product object (third priority)
      if (cartItem.cartId) {
        console.log(`Context: Using stored cartId ${cartItem.cartId} for deletion`);
        
        try {
          // Try direct deletion by numeric ID
          await deleteData(`/api/carts/${cartItem.cartId}`);
          console.log(`Context: Successfully deleted cart item ${cartItem.cartId} from backend`);
          return;
        } catch (cartIdError) {
          console.log(`Context: Failed to delete by numeric ID: ${cartIdError.message}`);
        }
      }
      
      // If all direct approaches failed, get all carts and find the one with matching product
      console.log(`Context: All direct deletion approaches failed, searching in all carts...`);
      
      const cartResponse = await fetchDataFromApi(`/api/carts?populate=*`);
      
      if (cartResponse?.data?.length > 0) {
        // Find the cart item that matches our product
        let foundCartItem = null;
        
        for (const item of cartResponse.data) {
          if (!item.attributes?.product?.data) continue;
          
          const productData = item.attributes.product.data;
          
          // Match by product ID
          if (productData.id == id) {
            foundCartItem = item;
            console.log(`Context: Found cart item ${item.id} with matching product ID ${id}`);
            break;
          }
          
          // Match by product documentId
          const productAttrs = productData.attributes || {};
          const backendDocumentId = productAttrs.documentId;
          const productDocumentId = cartItem.documentId;
          
          if (productDocumentId && backendDocumentId && productDocumentId === backendDocumentId) {
            foundCartItem = item;
            console.log(`Context: Found cart item ${item.id} with matching product documentId ${backendDocumentId}`);
            break;
          }
        }
        
        if (foundCartItem) {
          // We found the cart item - try to delete by documentId first if available
          const cartDocumentId = foundCartItem.attributes.documentId;
          
          if (cartDocumentId) {
            console.log(`Context: Deleting cart item using documentId ${cartDocumentId}`);
            
            try {
              await deleteData(`/api/carts/${cartDocumentId}`);
              console.log(`Context: Successfully deleted cart item with documentId ${cartDocumentId}`);
              return;
            } catch (documentIdError) {
              console.error("Context: Error deleting by documentId:", documentIdError);
              // Continue to fallback method
            }
          }
          
          // Fallback to ID-based deletion
          console.log(`Context: Falling back to deleting cart item by ID ${foundCartItem.id}`);
          try {
            await deleteData(`/api/carts/${foundCartItem.id}`);
            console.log(`Context: Successfully deleted cart item by ID ${foundCartItem.id}`);
          } catch (idError) {
            console.error("Context: Error deleting by ID:", idError);
          }
        } else {
          console.log(`Context: Could not find matching cart item in backend to delete`);
        }
      } else {
        console.log(`Context: No carts found in backend`);
      }
    } catch (error) {
      console.error("Context: Error deleting cart item from backend:", error);
    }
  };

  const contextElement = {
    user,
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    removeFromWishlist,
    addToWishlist,
    isAddedtoWishlist,
    quickViewItem,
    wishList,
    setQuickViewItem,
    quickAddItem,
    setQuickAddItem,
    addToCompareItem,
    isAddedtoCompareItem,
    removeFromCompareItem,
    compareItem,
    setCompareItem,
    updateQuantity,
    removeFromCart,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}