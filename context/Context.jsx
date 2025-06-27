"use client";
import { allProducts } from "@/data/productsWomen";
import { openCartModal } from "@/utils/openCartModal";
import { openWistlistModal } from "@/utils/openWishlist";
import { useUser } from "@clerk/nextjs";
import { API_URL, STRAPI_API_TOKEN, CARTS_API, USER_CARTS_API, PRODUCT_BY_DOCUMENT_ID_API } from "@/utils/urls";
import { fetchDataFromApi, createData, updateData, deleteData, getImageUrl } from "@/utils/api";
import { 
  detectUserCountry, 
  getExchangeRate, 
  getCurrencyInfo, 
  saveCurrencyPreference, 
  getSavedCurrencyPreference 
} from "@/utils/currency";

import React, { useContext, useEffect, useState } from "react";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const { user } = useUser();
  const [cartProducts, setCartProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [compareItem, setCompareItem] = useState([]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartRefreshKey, setCartRefreshKey] = useState(0);
  const [selectedCartItems, setSelectedCartItems] = useState({});
  const [isCartClearing, setIsCartClearing] = useState(false);
  const [cartClearedTimestamp, setCartClearedTimestamp] = useState(null);
  
  // Currency and location state
  const [userCountry, setUserCountry] = useState('US');
  const [userCurrency, setUserCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);
  
  // Function to toggle selection of cart items
  const toggleCartItemSelection = (id) => {
    setSelectedCartItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Function to select all cart items
  const selectAllCartItems = (selectAll = true) => {
    const newSelection = {};
    cartProducts.forEach(product => {
      newSelection[product.id] = selectAll;
    });
    setSelectedCartItems(newSelection);
  };
  
  // Get only selected cart items for checkout
  const getSelectedCartItems = () => {
    return cartProducts.filter(product => selectedCartItems[product.id]);
  };
  
  // Calculate total price of selected items
  const getSelectedItemsTotal = () => {
    return getSelectedCartItems().reduce((acc, product) => {
      return acc + (parseFloat(product.price) * product.quantity);
    }, 0);
  };

  // Currency management functions
  const initializeCurrency = async () => {
    setIsLoadingCurrency(true);
    
    try {
      // Get saved preferences first
      const savedPrefs = getSavedCurrencyPreference();
      
      // If no saved preferences, detect country
      let country = savedPrefs.country;
      let currency = savedPrefs.currency;
      
      if (!country || country === 'US') {
        country = await detectUserCountry();
      }
      
      // Set currency based on country
      if (country === 'NP' && currency !== 'NPR') {
        currency = 'NPR';
      } else if (country !== 'NP' && currency !== 'USD') {
        currency = 'USD';
      }
      
      // Get exchange rate if needed
      let rate = null;
      if (currency === 'NPR' || country === 'NP') {
        rate = await getExchangeRate();
      }
      
      // Update state
      setUserCountry(country);
      setUserCurrency(currency);
      setExchangeRate(rate);
      
      // Save preferences
      saveCurrencyPreference(currency, country);
      
    } catch (error) {
      console.error('Failed to initialize currency:', error);
      // Fallback to USD
      setUserCountry('US');
      setUserCurrency('USD');
      setExchangeRate(null);
    } finally {
      setIsLoadingCurrency(false);
    }
  };

  const setCurrency = async (newCurrency) => {
    setIsLoadingCurrency(true);
    
    try {
      let rate = exchangeRate;
      
      // Get exchange rate if switching to NPR
      if (newCurrency === 'NPR' && !rate) {
        rate = await getExchangeRate();
        setExchangeRate(rate);
      }
      
      setUserCurrency(newCurrency);
      saveCurrencyPreference(newCurrency, userCountry);
      
    } catch (error) {
      console.error('Failed to set currency:', error);
    } finally {
      setIsLoadingCurrency(false);
    }
  };

  const refreshExchangeRate = async () => {
    try {
      const rate = await getExchangeRate();
      setExchangeRate(rate);
      return rate;
    } catch (error) {
      console.error('Failed to refresh exchange rate:', error);
      return exchangeRate;
    }
  };
  
  // Initialize currency on mount
  useEffect(() => {
    initializeCurrency();
  }, []);

  // Refresh exchange rate periodically (every hour)
  useEffect(() => {
    if (userCurrency === 'NPR') {
      const interval = setInterval(() => {
        refreshExchangeRate();
      }, 3600000); // 1 hour

      return () => clearInterval(interval);
    }
  }, [userCurrency]);

  // Load compare items from localStorage on mount and validate them
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCompareItems = JSON.parse(localStorage.getItem('compareItems')) || [];
        
        // Clear localStorage if we detect the hard-coded test IDs are still there
        const containsTestIds = savedCompareItems.some(id => [55, 60, 61].includes(Number(id)));
        if (containsTestIds) {
          localStorage.removeItem('compareItems');
          setCompareItem([]);
          return;
        }
        
        // Validate that the IDs exist on the server
        const validateIds = async () => {
          try {
            // Only validate if there are items to check
            if (savedCompareItems.length === 0) return;
            
            const validIds = [];
            
            // For each ID, make a request to check if the product exists
            for (const id of savedCompareItems) {
              try {
                let response;
                
                // Different endpoint based on if it's a number or string (documentId)
                if (!isNaN(parseInt(id))) {
                  response = await fetchDataFromApi(`/api/products/${parseInt(id)}?populate=*`);
                } else {
                  response = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${id}&populate=*`);
                }
                
                // If the response has data, the product exists
                if (response && response.data) {
                  validIds.push(id);
                }
              } catch (error) {
                console.log(`Product ID ${id} is invalid, removing from compare list`);
              }
            }
            
            // Update localStorage and state with only valid IDs
            localStorage.setItem('compareItems', JSON.stringify(validIds));
            setCompareItem(validIds);
          } catch (error) {
            console.error("Error validating compare items:", error);
          }
        };
        
        // Set the state immediately with what's in localStorage
        setCompareItem(savedCompareItems);
        
        // Then validate in the background
        validateIds();
      } catch (error) {
        console.error("Error loading compare items from localStorage:", error);
        // Clear localStorage if there's an error
        localStorage.removeItem('compareItems');
        setCompareItem([]);
      }
    }
  }, []);
  
  // Save compare items to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('compareItems', JSON.stringify(compareItem));
    }
  }, [compareItem]);

  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.price;
    }, 0);
    setTotalPrice(subtotal);
    
    // Select all cart items by default when cart changes
    if (cartProducts.length > 0) {
      const initialSelection = {};
      cartProducts.forEach(product => {
        initialSelection[product.id] = true;
      });
      setSelectedCartItems(initialSelection);
    }
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
    const productIdClicked = id;
    
    // Check if product is already in cart by ID
    if (isAddedToCartProducts(id)) {
      if (isModal) {
        // Still open the cart modal to show them the product is already there
        openCartModal().catch(console.error);
      }
      return; // Exit function early
    }
    
    // Try to find the product in allProducts to get complete information
    const productInfo = allProducts.find(product => product.id === id || (product.documentId && product.documentId === id));
    let productToAdd = null;
    
    if (productInfo) {
      let imgSrc = '/images/placeholder.png';
      if (productInfo.imgSrc && productInfo.imgSrc.formats && productInfo.imgSrc.formats.small && productInfo.imgSrc.formats.small.url) {
        imgSrc = `${API_URL}${productInfo.imgSrc.formats.small.url}`;
      } else {
        imgSrc = getImageUrl(productInfo.imgSrc);
      }
      productToAdd = {
        id: productInfo.id,
        documentId: productInfo.documentId,
        title: productInfo.title,
        price: productInfo.price,
        oldPrice: productInfo.oldPrice || null,
        quantity: qty || 1,
        colors: productInfo.colors || [],
        sizes: productInfo.sizes || [],
        imgSrc: imgSrc,
        weight: productInfo.weight || null
      };
      
      console.log("Product data from allProducts:", productInfo);
      
      // Special case for Redezyyyy Shorts
      if (productToAdd.title && productToAdd.title.includes("Redezyyyy")) {
        console.log("Adding Redezyyyy Shorts to cart - checking oldPrice:", productToAdd.oldPrice);
        if (!productToAdd.oldPrice) {
          productToAdd.oldPrice = 129.99;
          console.log("Set oldPrice manually to 129.99");
        }
      }
    } else {
      // The ID might be a documentId, especially if it's a string that looks like a UUID/hash
      try {
        let productResponse = null;
        
        // Try both approaches - by numeric ID or by documentId
        if (!isNaN(parseInt(id))) {
          productResponse = await fetchDataFromApi(`/api/products/${parseInt(id)}?populate=*`);
        } else {
          productResponse = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${id}&populate=*`);
        }
        
        // Log the full response to debug
        console.log("Product response from API:", productResponse);
        
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
          
          console.log("Product data from API:", productData);
          
          // Check if imgSrc is a relation or direct field
          let imgUrl = '/images/placeholder.png';
          if (productData.imgSrc && productData.imgSrc.formats && productData.imgSrc.formats.small && productData.imgSrc.formats.small.url) {
            imgUrl = `${API_URL}${productData.imgSrc.formats.small.url}`;
          } else if (productData.imgSrc?.data?.attributes?.url) {
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
            oldPrice: productData.oldPrice ? parseFloat(productData.oldPrice) : null,
            quantity: qty || 1,
            colors: productData.colors || [],
            sizes: productData.sizes || [],
            imgSrc: imgUrl,
            weight: productData.weight || null
          };
          
          console.log("Created productToAdd:", productToAdd);
          
          // Special case for Redezyyyy Shorts
          if (productToAdd.title && productToAdd.title.includes("Redezyyyy")) {
            console.log("Adding Redezyyyy Shorts to cart - checking oldPrice:", productToAdd.oldPrice);
            if (!productToAdd.oldPrice) {
              productToAdd.oldPrice = 129.99;
              console.log("Set oldPrice manually to 129.99");
            }
          }
        }
      } catch (fetchError) {
        console.error("Error fetching product details:", fetchError);
      }
    }
    
    // If we still don't have complete product info, create a basic dummy product
    if (!productToAdd) {
      productToAdd = {
        id: id,
        documentId: typeof id === 'string' && id.length > 20 ? id : null,
        title: "Product Item",
        price: 0,
        oldPrice: null,
        quantity: qty || 1,
        colors: [],
        sizes: [],
        imgSrc: '/images/placeholder.png',
        weight: null
      };
    }
    
    if (user) {
      try {
        // Get the current logged-in user data
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
                avatar: user.imageUrl || "",
                email: user.emailAddresses?.[0]?.emailAddress || ""
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
                  setCartRefreshKey(prev => prev + 1);
                  openCartModal().catch(console.error);
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
            setCartRefreshKey(prev => prev + 1);
            openCartModal().catch(console.error);
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
            setCartRefreshKey(prev => prev + 1);
            openCartModal().catch(console.error);
          }
        } catch (createCartError) {
          console.error("Error creating cart entry:", createCartError);
          
          // Add to local cart even if server operation fails
          setCartProducts((pre) => [...pre, productToAdd]);
          
          if (isModal) {
            setCartRefreshKey(prev => prev + 1);
            openCartModal().catch(console.error);
          }
        }
      } catch (error) {
        console.error("Error in addProductToCart:", error);
        
        // Add to local cart even if an error occurs
        setCartProducts((pre) => [...pre, productToAdd]);
        
        if (isModal) {
          setCartRefreshKey(prev => prev + 1);
          openCartModal().catch(console.error);
        }
      }
    } else {
      // No user logged in, add to local cart only
      setCartProducts((pre) => [...pre, productToAdd]);
      
      if (isModal) {
        setCartRefreshKey(prev => prev + 1);
        openCartModal().catch(console.error);
      }
    }
  };

  const updateQuantity = (id, amount, isIncrement = false) => {
    const updatedProducts = cartProducts.map((item) => {
      // Try to match either by ID or documentId
      const itemMatches = item.id == id || (item.documentId && item.documentId === id);
      
      if (itemMatches) {
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
      return;
    }
    
    const finalQuantity = matchingItem.quantity;
    
    // Backend update function
    const updateBackend = async () => {
      try {
        // If we already have the cart document ID, use it directly
        if (matchingItem.cartDocumentId) {
          const updatePayload = {
            data: {
              quantity: finalQuantity
            }
          };
          
          try {
            // Use the documentId in the URL instead of numeric ID
            const updateResponse = await updateData(`/api/carts/${matchingItem.cartDocumentId}`, updatePayload);
            return;
          } catch (updateError) {
            // Continue to fallback methods
          }
        }
        
        // Get all cart items to find the correct one
        const cartResponse = await fetchDataFromApi(`/api/carts?populate=*`);
        
        if (!cartResponse?.data?.length) {
          return;
        }
        
        // Find the matching cart item
        let foundCartItem = null;
        let cartDocumentId = null;
        
        // Try to match based on product ID or documentId AND user_datum
        for (const cartItem of cartResponse.data) {
          // Skip cart items without product data
          if (!cartItem.attributes?.product?.data) continue;
          
          const productData = cartItem.attributes.product.data;
          const productId = productData.id;
          const productDocId = productData.attributes?.documentId;
          
          // Check if this cart item matches the product we're looking for
          const matchesProductId = productId == id;
          const matchesDocumentId = productDocId && matchingItem.documentId && productDocId === matchingItem.documentId;
          
          // If we have the cartId stored, prioritize exact cart item match
          if (matchingItem.cartId && cartItem.id == matchingItem.cartId) {
            foundCartItem = cartItem;
            cartDocumentId = cartItem.attributes.documentId;
            break; // Exact match found, no need to look further
          }
          
          // If we have the cartDocumentId stored, prioritize exact match
          if (matchingItem.cartDocumentId && cartItem.attributes.documentId === matchingItem.cartDocumentId) {
            foundCartItem = cartItem;
            cartDocumentId = cartItem.attributes.documentId;
            break; // Exact match found, no need to look further
          }
          
          // Otherwise use product matching as a fallback
          if ((matchesProductId || matchesDocumentId) && !foundCartItem) {
            foundCartItem = cartItem;
            cartDocumentId = cartItem.attributes.documentId;
          }
        }
        
        if (!foundCartItem || !cartDocumentId) {
          // Check if we should create a new item or just update local state
          if (matchingItem.cartId || matchingItem.cartDocumentId) {
            return;
          }
          
          // Create a new cart item since we couldn't find an existing one
          try {
            // Create cart item in the backend
            const createPayload = {
              data: {
                quantity: finalQuantity,
                product: matchingItem.id
              }
            };
            
            // Add user_datum if available
            if (user) {
              // Get user data for the current user
              const userDataResponse = await fetchDataFromApi(`/api/user-datas?filters[clerkUserId][$eq]=${user.id}`);
              
              if (userDataResponse?.data && userDataResponse.data.length > 0) {
                const userData = userDataResponse.data[0];
                createPayload.data.user_datum = userData.id;
                
                // Also check if the user has a bag
                const userBagResponse = await fetchDataFromApi(`/api/user-bags?filters[user_datum][id][$eq]=${userData.id}`);
                
                if (userBagResponse?.data && userBagResponse.data.length > 0) {
                  const userBag = userBagResponse.data[0];
                  createPayload.data.user_bag = userBag.id;
                }
              }
            }
            
            const createResponse = await createData("/api/carts", createPayload);
            
            // Update local state with the new cart ID and document ID
            if (createResponse?.data) {
              const newCartId = createResponse.data.id;
              const newCartDocumentId = createResponse.data.attributes?.documentId;
              
              setCartProducts(prev => prev.map(item => {
                if (item.id == id || (item.documentId && item.documentId === matchingItem.documentId)) {
                  return { 
                    ...item, 
                    cartId: newCartId,
                    cartDocumentId: newCartDocumentId
                  };
                }
                return item;
              }));
            }
          } catch (createError) {
            console.error("❌ Error creating new cart item:", createError);
          }
          
          return;
        }
        
        // Update the item using the document ID we found
        const updatePayload = {
          data: {
            quantity: finalQuantity
          }
        };
        
        try {
          // Use the documentId in the URL instead of numeric ID
          const updateResponse = await updateData(`/api/carts/${cartDocumentId}`, updatePayload);
          
          // Store the cart document ID for future use
          setCartProducts(prev => prev.map(item => {
            if (item.id == id || (item.documentId && item.documentId === matchingItem.documentId)) {
              return { ...item, cartDocumentId };
            }
            return item;
          }));
        } catch (updateError) {
          // Try direct fetch as last resort
          try {
            const directResponse = await fetch(`${API_URL}/api/carts/${cartDocumentId}?populate=*`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updatePayload)
            });
            
            if (directResponse.ok) {
              // Store the cart document ID for future use
              setCartProducts(prev => prev.map(item => {
                if (item.id == id || (item.documentId && item.documentId === matchingItem.documentId)) {
                  return { ...item, cartDocumentId };
                }
                return item;
              }));
            } else {
              const errorText = await directResponse.text();
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
  const addToCompareItem = async (id) => {
    // Skip empty or undefined IDs
    if (!id) {
      return;
    }
    
    // If the ID is a numeric string, convert it for consistent comparison
    let formattedId = id;
    if (!isNaN(Number(id)) && typeof id !== 'number') {
      formattedId = Number(id);
    }
    
    // Immediately reject hardcoded test IDs that we know are invalid
    if ([55, 60, 61].includes(Number(formattedId))) {
      return;
    }
    
    // Check if this ID is already in the compare list
    const isAlreadyInList = compareItem.some(existingId => {
      if (typeof existingId === 'number' && typeof formattedId === 'number') {
        return existingId === formattedId;
      }
      return String(existingId) === String(formattedId);
    });
    
    if (isAlreadyInList) {
      return;
    }
    
    // Before adding the product, verify it exists by fetching it
    try {
      let response = null;
      let productExists = false;
      let productData = null;
      
      // Try to fetch by documentId if it looks like one (longer string)
      if (typeof formattedId === 'string' && formattedId.length > 8) {
        response = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${formattedId}&populate=*`);
        productExists = response?.data && Array.isArray(response.data) && response.data.length > 0;
        if (productExists) {
          productData = response.data[0];
        }
      }
      
      // If not found by documentId, try as regular ID
      if (!productExists) {
        try {
          response = await fetchDataFromApi(`/api/products/${formattedId}?populate=*`);
          productExists = response?.data !== null && response?.data !== undefined;
          if (productExists) {
            productData = response.data;
          }
        } catch (error) {
          // Explicitly handle 404 errors
          if (error.message && error.message.includes("404")) {
            productExists = false;
          } else {
            throw error; // Re-throw other errors
          }
        }
      }
      
      if (productExists && productData) {
        // Extract the document ID if available, otherwise use the ID we have
        let idToStore = formattedId;
        if (productData.attributes?.documentId) {
          idToStore = productData.attributes.documentId;
        }
        setCompareItem(prev => [...prev, idToStore]);
      } else {
        return;
      }
    } catch (error) {
      // Don't add the product if verification failed
    }
  };
  const removeFromCompareItem = (id) => {
    // Convert numeric strings to actual numbers to ensure consistent comparison
    let formattedId = id;
    if (!isNaN(Number(id)) && typeof id !== 'number') {
      formattedId = Number(id);
    }
    
    // Filter out the matching item, accounting for type inconsistencies
    setCompareItem(prev => prev.filter(existingId => {
      if (typeof existingId === 'number' && typeof formattedId === 'number') {
        return existingId !== formattedId;
      }
      return String(existingId) !== String(formattedId);
    }));
  };
  const isAddedtoWishlist = (id) => {
    if (wishList.includes(id)) {
      return true;
    }
    return false;
  };
  const isAddedtoCompareItem = (id) => {
    // Convert numeric strings to actual numbers to ensure consistent comparison
    let formattedId = id;
    if (!isNaN(Number(id)) && typeof id !== 'number') {
      formattedId = Number(id);
    }
    
    // Check if this ID exists in the compare list
    return compareItem.some(existingId => {
      if (typeof existingId === 'number' && typeof formattedId === 'number') {
        return existingId === formattedId;
      }
      return String(existingId) === String(formattedId);
    });
  };
  
  // Load cart data from backend when user logs in
  useEffect(() => {
    // Don't load cart if currently clearing or recently cleared (within 5 seconds)
    const recentlyCleared = cartClearedTimestamp && (Date.now() - cartClearedTimestamp < 5000);
    
    if (user && !isCartClearing && !recentlyCleared) {
      const loadCartFromBackend = async () => {
        try {
          // First, get the user's data to find their user_datum ID
          const currentUserData = await fetchDataFromApi(
            `/api/user-datas?filters[clerkUserId][$eq]=${user.id}&populate=*`
          );

          if (!currentUserData?.data || currentUserData.data.length === 0) {
            console.log("User data not found, cannot load cart");
            setCartProducts([]);
            return;
          }

          const userData = currentUserData.data[0];
          const userDataId = userData.id;
          
          console.log("Loading cart for user data ID:", userDataId);
          
          // Fetch user-specific carts from backend
          const cartResponse = await fetchDataFromApi(
            `/api/carts?filters[user_datum][id][$eq]=${userDataId}&populate=*`
          );
          
          console.log("Cart response from backend:", cartResponse);
          
          if (cartResponse?.data?.length > 0) {
            // Transform backend cart items into the format expected by the UI
            const backendCarts = cartResponse.data.map(cartItem => {
              if (!cartItem || !cartItem.attributes) {
                return null; // Skip this item
              }
              
              // Safely access product data with null checks at each level
              const attributes = cartItem.attributes || {};
              const productRelation = attributes.product || {};
              const productData = productRelation.data || {};
              const productAttrs = productData.attributes || {};
              const productId = productData.id;
              
              console.log("Processing cart item:", {
                cartId: cartItem.id,
                productId,
                title: productAttrs.title,
                price: productAttrs.price,
                oldPrice: productAttrs.oldPrice
              });
              
              // Skip items without product data
              if (!productId) {
                return null;
              }
              
              const productCart = {
                id: productId,
                cartId: cartItem.id,
                cartDocumentId: attributes.documentId,
                documentId: productAttrs.documentId,
                title: productAttrs.title || "Product Item",
                price: parseFloat(productAttrs.price || 0),
                oldPrice: productAttrs.oldPrice ? parseFloat(productAttrs.oldPrice) : null,
                quantity: attributes.quantity || 1,
                colors: productAttrs.colors || [],
                sizes: productAttrs.sizes || [],
                imgSrc: getOptimizedImageUrl(productAttrs.imgSrc) || '/images/placeholder.jpg'
              };
              
              console.log("Processed cart item:", productCart);
              
              // Special handling for Redezyyyy Shorts
              if (productCart.title && productCart.title.includes("Redezyyyy")) {
                console.log("Found Redezyyyy Shorts in cart - checking oldPrice:", productCart.oldPrice);
                if (!productCart.oldPrice) {
                  console.log("Setting oldPrice to 129.00 for Redezyyyy Shorts");
                  productCart.oldPrice = 129.00;
                }
              }
              
              return productCart;
            })
            // Filter out null entries (invalid items)
            .filter(item => item !== null);
            
            // Final check for Redezyyyy Shorts product
            const redezyyyyProduct = backendCarts.find(product => 
              product.title && product.title.includes("Redezyyyy"));
            if (redezyyyyProduct) {
              console.log("Final check for Redezyyyy Shorts:", redezyyyyProduct);
              if (!redezyyyyProduct.oldPrice) {
                redezyyyyProduct.oldPrice = 129.99;
                console.log("Set oldPrice to 129.99 in final check");
              }
            }
            
            console.log("Setting cart products:", backendCarts);
            setCartProducts(backendCarts);
      } else {
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
      setCartProducts([]);
    }
  }, [user, isCartClearing, cartClearedTimestamp]);

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
      cartProducts.forEach(item => {
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
    // Clear anonymous cart data
    localStorage.removeItem("cartList");
    
    // Clear user-specific cart data (for all users)
    const localStorageKeys = Object.keys(localStorage);
    for (const key of localStorageKeys) {
      if (key.startsWith("cartList_") || key.startsWith("wishlist_")) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear wishlist data
          localStorage.removeItem("wishlist");
    
    // Clear any other localStorage items related to the app
    // We want to keep the compare items
    // localStorage.removeItem("compareItems");
    
  }, []);

  // Function to remove item from cart (both frontend and backend)
  const removeFromCart = async (id, directCartDocumentId = null) => {
    try {
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
        return;
      }
      
      // If directCartDocumentId was provided directly (first priority)
      if (directCartDocumentId) {
        try {
          await deleteData(`/api/carts/${directCartDocumentId}`);
          return;
        } catch (directIdError) {
          // If error mentions document ID not valid, try to delete by numeric ID as fallback
          if (directIdError.message && directIdError.message.includes("not valid") && cartItem.cartId) {
            try {
              await deleteData(`/api/carts/${cartItem.cartId}`);
              return;
            } catch (numericIdError) {
            }
          }
        }
      }
      
      // Try with cartDocumentId stored in the cart item object (second priority)
      if (cartItem.cartDocumentId) {
        try {
          await deleteData(`/api/carts/${cartItem.cartDocumentId}`);
          return;
        } catch (cartDocumentIdError) {
        }
      }
      
      // Try with cartId stored in the product object (third priority)
      if (cartItem.cartId) {
        try {
          // Try direct deletion by numeric ID
          await deleteData(`/api/carts/${cartItem.cartId}`);
          return;
        } catch (cartIdError) {
        }
      }
      
      // If all direct approaches failed, get user-specific carts and find the one with matching product
      // First, get the user's data to find their user_datum ID
      const currentUserData = await fetchDataFromApi(
        `/api/user-datas?filters[clerkUserId][$eq]=${user.id}&populate=*`
      );

      if (!currentUserData?.data || currentUserData.data.length === 0) {
        console.log("User data not found, cannot remove cart item");
        return;
      }

      const userData = currentUserData.data[0];
      const userDataId = userData.id;
      
      const cartResponse = await fetchDataFromApi(
        `/api/carts?filters[user_datum][id][$eq]=${userDataId}&populate=*`
      );
      
      if (cartResponse?.data?.length > 0) {
        // Find the cart item that matches our product
        let foundCartItem = null;
        
        for (const item of cartResponse.data) {
          if (!item.attributes?.product?.data) continue;
          
          const productData = item.attributes.product.data;
          
          // Match by product ID
          if (productData.id == id) {
            foundCartItem = item;
            break;
          }
          
          // Match by product documentId
          const productAttrs = productData.attributes || {};
          const backendDocumentId = productAttrs.documentId;
          const productDocumentId = cartItem.documentId;
          
          if (productDocumentId && backendDocumentId && productDocumentId === backendDocumentId) {
            foundCartItem = item;
            break;
          }
        }
        
        if (foundCartItem) {
          // We found the cart item - try to delete by documentId first if available
          const cartDocumentId = foundCartItem.attributes.documentId;
          
          if (cartDocumentId) {
            try {
              await deleteData(`/api/carts/${cartDocumentId}`);
              return;
            } catch (documentIdError) {
              // Continue to fallback method
            }
          }
          
          // Fallback to ID-based deletion
          try {
            await deleteData(`/api/carts/${foundCartItem.id}`);
          } catch (idError) {
          }
        } else {
        }
    } else {
        console.log(`Context: No carts found in backend`);
      }
    } catch (error) {
      console.error("Context: Error deleting cart item from backend:", error);
    }
  };

  // Function to clear specific purchased items from cart (both frontend and backend)
  const clearPurchasedItemsFromCart = async (purchasedProducts) => {
    try {
      console.log("🚨🚨🚨 CLEAR PURCHASED ITEMS FUNCTION CALLED 🚨🚨🚨");
      console.log("=== STARTING PURCHASED ITEMS CLEAR PROCESS ===");
      console.log("Purchased products to remove:", purchasedProducts?.length || 0);
      console.log("Purchased products data:", JSON.stringify(purchasedProducts, null, 2));
      console.log("Current cart products:", cartProducts.length);
      console.log("User ID:", user?.id);
      
      if (!purchasedProducts || purchasedProducts.length === 0) {
        console.log("No purchased products provided, nothing to clear");
        return;
      }
      
      // Set flag to prevent cart reloading during clearing process
      setIsCartClearing(true);
      
      // If user is not logged in, only clear frontend
      if (!user?.id) {
        console.log("No user logged in, clearing purchased items from frontend only");
        const remainingProducts = cartProducts.filter(cartProduct => {
          return !purchasedProducts.some(purchasedProduct => 
            cartProduct.documentId === purchasedProduct.documentId
          );
        });
        setCartProducts(remainingProducts);
        console.log("✅ Frontend purchased items cleared");
        return;
      }
      
      // First, get the user's data to find their user_datum ID
      console.log("🔍 Fetching user data to find user_datum ID...");
      const currentUserData = await fetchDataFromApi(
        `/api/user-datas?filters[clerkUserId][$eq]=${user.id}&populate=*`
      );

      if (!currentUserData?.data || currentUserData.data.length === 0) {
        console.log("User data not found, clearing purchased items from frontend only");
        const remainingProducts = cartProducts.filter(cartProduct => {
          return !purchasedProducts.some(purchasedProduct => 
            cartProduct.documentId === purchasedProduct.documentId
          );
        });
        setCartProducts(remainingProducts);
        return;
      }

      const userData = currentUserData.data[0];
      const userDataId = userData.id;
      
      console.log("Found user data ID:", userDataId);
      
      // Get cart items for this specific user
      const cartResponse = await fetchDataFromApi(
        `/api/carts?filters[user_datum][id][$eq]=${userDataId}&populate=*`
      );
      
      if (cartResponse?.data?.length > 0) {
        console.log(`Found ${cartResponse.data.length} cart items in backend for user ${user.id}`);
        
        // Filter cart items to find only the purchased ones
        const cartItemsToDelete = cartResponse.data.filter(cartItem => {
          const cartProductId = cartItem.attributes?.product?.data?.attributes?.documentId;
          return purchasedProducts.some(purchasedProduct => 
            purchasedProduct.documentId === cartProductId
          );
        });
        
        console.log(`Found ${cartItemsToDelete.length} purchased items to delete from backend`);
        
        if (cartItemsToDelete.length > 0) {
          // Delete only the purchased cart items from backend
          const deletePromises = cartItemsToDelete.map(async (cartItem) => {
            try {
              // Try to delete by documentId first if available
              const cartDocumentId = cartItem.attributes?.documentId;
              if (cartDocumentId) {
                await deleteData(`/api/carts/${cartDocumentId}`);
                console.log(`✅ Deleted purchased cart item with documentId: ${cartDocumentId}`);
              } else {
                // Fallback to ID-based deletion
                await deleteData(`/api/carts/${cartItem.id}`);
                console.log(`✅ Deleted purchased cart item with ID: ${cartItem.id}`);
              }
            } catch (error) {
              console.error(`❌ Error deleting cart item ${cartItem.id}:`, error);
              // Continue with other deletions even if one fails
            }
          });
          
          // Wait for all deletions to complete
          await Promise.allSettled(deletePromises);
          console.log("🗑️ Backend purchased items deletion completed");
        }
        
        // Verify deletion by checking remaining cart items
        console.log("🔍 Verifying purchased items deletion...");
        const verificationResponse = await fetchDataFromApi(
          `/api/carts?filters[user_datum][id][$eq]=${userDataId}&populate=*`
        );
        
        const remainingItems = verificationResponse?.data?.length || 0;
        console.log(`✅ Verification complete: ${remainingItems} items remaining in backend cart`);
      } else {
        console.log("No cart items found in backend for user:", user.id);
      }
      
      // Update frontend state to remove only purchased products
      const remainingProducts = cartProducts.filter(cartProduct => {
        return !purchasedProducts.some(purchasedProduct => 
          cartProduct.documentId === purchasedProduct.documentId
        );
      });
      
      setCartProducts(remainingProducts);
      
      // Also update selected cart items to remove purchased ones
      const updatedSelectedItems = { ...selectedCartItems };
      purchasedProducts.forEach(purchasedProduct => {
        delete updatedSelectedItems[purchasedProduct.documentId];
      });
      setSelectedCartItems(updatedSelectedItems);
      
      console.log("✅ Frontend purchased items cleared");
      
      // Set timestamp to prevent cart reloading for a period
      setCartClearedTimestamp(Date.now());
      
      console.log("=== PURCHASED ITEMS CLEAR PROCESS COMPLETED ===");
    } catch (error) {
      console.error("❌ Error clearing purchased items from cart:", error);
      // Even if backend clearing fails, try to clear frontend
      const remainingProducts = cartProducts.filter(cartProduct => {
        return !purchasedProducts.some(purchasedProduct => 
          cartProduct.documentId === purchasedProduct.documentId
        );
      });
      setCartProducts(remainingProducts);
    } finally {
      // Add a longer delay before resetting the clearing flag to prevent immediate reloading
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log("🔓 Resetting cart clearing flag after 3 second delay");
      setIsCartClearing(false);
    }
  };

  // Function to clear all items from cart (both frontend and backend) - kept for backward compatibility
  const clearCart = async () => {
    try {
      console.log("=== STARTING CART CLEAR PROCESS ===");
      console.log("Current cart products:", cartProducts.length);
      console.log("User ID:", user?.id);
      
      // Set flag to prevent cart reloading during clearing process
      setIsCartClearing(true);
      
      // Clear the frontend state immediately for responsive UI
      setCartProducts([]);
      setSelectedCartItems({});
      console.log("✅ Frontend cart state cleared");
      
      // If user is not logged in, no backend cleanup needed
      if (!user?.id) {
        console.log("No user logged in, cart cleared from frontend only");
        return;
      }
      
      // First, get the user's data to find their user_datum ID
      console.log("🔍 Fetching user data to find user_datum ID...");
      const currentUserData = await fetchDataFromApi(
        `/api/user-datas?filters[clerkUserId][$eq]=${user.id}&populate=*`
      );

      if (!currentUserData?.data || currentUserData.data.length === 0) {
        console.log("❌ User data not found, cannot clear backend cart");
        return;
      }

      const userData = currentUserData.data[0];
      const userDataId = userData.id;
      
      console.log("✅ Found user data ID:", userDataId);
      console.log("🔍 Fetching cart items for deletion...");
      
      // Get cart items for this specific user
      const cartResponse = await fetchDataFromApi(
        `/api/carts?filters[user_datum][id][$eq]=${userDataId}&populate=*`
      );
      
      console.log("Cart response:", cartResponse);
      
      if (cartResponse?.data?.length > 0) {
        console.log(`🗑️ Found ${cartResponse.data.length} cart items in backend to delete for user ${user.id}`);
        
        // Delete all cart items from backend using the same method as removeFromCart
        for (let i = 0; i < cartResponse.data.length; i++) {
          const cartItem = cartResponse.data[i];
          try {
            console.log(`🗑️ [${i + 1}/${cartResponse.data.length}] Deleting cart item:`, {
              id: cartItem.id,
              documentId: cartItem.documentId,
              attributes: cartItem.attributes
            });
            
            // Use the same deletion logic as removeFromCart
            const cartDocumentId = cartItem.attributes?.documentId;
            if (cartDocumentId) {
              try {
                await deleteData(`/api/carts/${cartDocumentId}`);
                console.log(`✅ [${i + 1}/${cartResponse.data.length}] Deleted cart item with documentId: ${cartDocumentId}`);
              } catch (documentIdError) {
                // Fallback to ID-based deletion
                await deleteData(`/api/carts/${cartItem.id}`);
                console.log(`✅ [${i + 1}/${cartResponse.data.length}] Deleted cart item with ID: ${cartItem.id} (fallback)`);
              }
            } else {
              // Direct ID-based deletion
              await deleteData(`/api/carts/${cartItem.id}`);
              console.log(`✅ [${i + 1}/${cartResponse.data.length}] Deleted cart item with ID: ${cartItem.id}`);
            }
          } catch (error) {
            console.error(`❌ [${i + 1}/${cartResponse.data.length}] Error deleting cart item ${cartItem.id}:`, error);
            // Continue with other deletions even if one fails
          }
        }
        
        console.log("✅ All cart item deletions attempted");
        
        // Add a longer delay to ensure backend is fully updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("⏳ Waited 1000ms for backend to update");
        
        // Verify deletion by checking if any items remain
        console.log("🔍 Verifying cart is empty...");
        const verificationResponse = await fetchDataFromApi(
          `/api/carts?filters[user_datum][id][$eq]=${userDataId}&populate=*`
        );
        
        if (verificationResponse?.data?.length > 0) {
          console.warn(`⚠️ Warning: ${verificationResponse.data.length} cart items still exist after deletion!`);
          console.log("Remaining items:", verificationResponse.data);
          
          // Try to delete remaining items one more time
          for (const remainingItem of verificationResponse.data) {
            try {
              await deleteData(`/api/carts/${remainingItem.id}`);
              console.log(`🔄 Retry deleted cart item with ID: ${remainingItem.id}`);
            } catch (retryError) {
              console.error(`❌ Retry failed for cart item ${remainingItem.id}:`, retryError);
            }
          }
        } else {
          console.log("✅ Verification complete: Cart is empty in backend");
        }
        
        console.log("Cart clearing completed for user:", user.id);
      } else {
        console.log("ℹ️ No cart items found in backend for user:", user.id);
      }
      
      // Set timestamp to prevent cart reloading for a period
      setCartClearedTimestamp(Date.now());
      
      console.log("=== CART CLEAR PROCESS COMPLETED ===");
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
      // Even if backend clearing fails, keep the frontend cleared
      setCartProducts([]);
      setSelectedCartItems({});
      setCartClearedTimestamp(Date.now());
    } finally {
      // Add a longer delay before resetting the clearing flag to prevent immediate reloading
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log("🔓 Resetting cart clearing flag after 3 second delay");
      setIsCartClearing(false);
    }
  };

  // Debug function for testing cart clearing (only in development)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.debugClearCart = clearCart;
  }

  // Helper function to get the most appropriate image URL, preferring smaller formats for better performance
  const getOptimizedImageUrl = (imageObj) => {
    // Default placeholder that's built into Next.js
    const defaultPlaceholder = "/vercel.svg";
    
    if (!imageObj) return defaultPlaceholder;
    
    // Handle the case where the URL is already a full URL
    if (imageObj.url && imageObj.url.startsWith("http")) {
      return imageObj.url;
    }
    
    // Prefer smaller image formats for better performance
    
    // Check for formats in the data structure used by Strapi v4
    if (imageObj.data?.attributes?.formats) {
      // Try small format first
      if (imageObj.data.attributes.formats.small?.url) {
        return `${API_URL}${imageObj.data.attributes.formats.small.url}`;
      }
      // Try thumbnail next
      if (imageObj.data.attributes.formats.thumbnail?.url) {
        return `${API_URL}${imageObj.data.attributes.formats.thumbnail.url}`;
      }
    }
    
    // Check for formats in the flattened structure
    if (imageObj.formats) {
      // Try small format first
      if (imageObj.formats.small?.url) {
        return `${API_URL}${imageObj.formats.small.url}`;
      }
      // Try thumbnail next
      if (imageObj.formats.thumbnail?.url) {
        return `${API_URL}${imageObj.formats.thumbnail.url}`;
      }
    }
    
    // Fallback to main URL if formats not available
    if (imageObj.data?.attributes?.url) {
      return `${API_URL}${imageObj.data.attributes.url}`;
    }
    
    // Handle the structure where URL is directly in the object
    if (imageObj.url) {
      return `${API_URL}${imageObj.url}`;
    }
    
    // Return placeholder if no valid URL found
    return defaultPlaceholder;
  }

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
    clearCart,
    clearPurchasedItemsFromCart,
    isCartClearing,
    cartClearedTimestamp,
    getOptimizedImageUrl,
    cartRefreshKey,
    setCartRefreshKey,
    selectedCartItems,
    toggleCartItemSelection,
    selectAllCartItems,
    getSelectedCartItems,
    getSelectedItemsTotal,
    // Currency management
    userCountry,
    userCurrency,
    exchangeRate,
    isLoadingCurrency,
    setCurrency,
    refreshExchangeRate,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}