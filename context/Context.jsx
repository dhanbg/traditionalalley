"use client";
import { allProducts } from "@/data/productsWomen";
import { openCartModal } from "@/utils/openCartModal";
import { openWistlistModal } from "@/utils/openWishlist";
import { useSession } from "next-auth/react";
import { API_URL, STRAPI_API_TOKEN, CARTS_API, USER_CARTS_API, PRODUCT_BY_DOCUMENT_ID_API } from "@/utils/urls";
import { fetchDataFromApi, createData, updateData, deleteData } from "@/utils/api";
import { getImageUrl } from "@/utils/imageUtils";
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
  const { data: session } = useSession();
  const user = session?.user;
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
  
  // Add cart loading state
  const [isCartLoading, setIsCartLoading] = useState(true); // Start as loading
  const [cartLoadedOnce, setCartLoadedOnce] = useState(false);
  
  // Currency and location state
  const [userCountry, setUserCountry] = useState('US');
  const [userCurrency, setUserCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);
  
  // Add this flag
  const [userCreationAttempted, setUserCreationAttempted] = useState(false);
  
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

  // Initialize cart loading state based on user presence and ensure user exists in backend
  useEffect(() => {
    if (user) {
      // Check if we've already attempted user creation for this specific user in this session
      const userCreationKey = `userCreated_${user.id}`;
      const hasAttemptedCreation = sessionStorage.getItem(userCreationKey) === 'true';
      
      if (!hasAttemptedCreation) {
        console.log("User signed in:", user.email);
        
        if (!cartLoadedOnce) {
          setIsCartLoading(true);
        }
        
        // Ensure user exists in backend when they sign in (only once per session per user)
        const ensureUserExists = async () => {
          try {
            // Mark as attempted before API call to prevent race conditions
            sessionStorage.setItem(userCreationKey, 'true');
            setUserCreationAttempted(true);
            
            console.log(`🔍 Attempting user creation check for: ${user.email}`);
            const response = await fetch('/api/user-management', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            const result = await response.json();
            console.log(`✅ User management result:`, result);
            
          } catch (error) {
            console.error('Error ensuring user exists:', error);
            // Reset the flag if there was an error so it can be retried
            sessionStorage.removeItem(userCreationKey);
            setUserCreationAttempted(false);
          }
        };
        
        ensureUserExists();
      } else {
        console.log(`✅ User creation already attempted for ${user.email} in this session`);
        setUserCreationAttempted(true);
      }
    } else {
      // If no user, we don't need to load cart from backend
      setIsCartLoading(false);
      setCartLoadedOnce(true);
      // Note: We don't reset userCreationAttempted here because we want to keep 
      // the sessionStorage flag intact until the browser session ends
    }
  }, [user, cartLoadedOnce]);

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

  // Check if a specific product size is already in the cart
  const isProductSizeInCart = (productDocumentId, selectedSize, variantId = null) => {
    if (!productDocumentId || !selectedSize) return false;
    
    return cartProducts.some(cartItem => {
      // Check if the base product matches
      const productMatches = cartItem.documentId === productDocumentId || 
                           cartItem.baseProductId === productDocumentId;
      
      // Check if the size matches
      const sizeMatches = cartItem.selectedSize === selectedSize;
      
      // Check if variant matches (if looking for a variant)
      let variantMatches = true;
      if (variantId) {
        // For variant products, check if the variant info matches
        if (cartItem.variantInfo && cartItem.variantInfo.variantId) {
          variantMatches = cartItem.variantInfo.variantId === variantId;
        } else {
          variantMatches = false;
        }
      } else {
        // For non-variant products, make sure the cart item is also not a variant
        variantMatches = !cartItem.variantInfo || !cartItem.variantInfo.isVariant;
      }
      
      return productMatches && sizeMatches && variantMatches;
    });
  };

  const isAddedToCartProducts = (id) => {
    if (!id) return false;
    // Since we now generate a consistent unique ID (including variant and size),
    // we can simply check for its existence in the cart.
    return cartProducts.some((item) => item.id === id);
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
  
  const addProductToCart = async (id, qty, isModal = true, variantInfo = null, selectedSize = null) => {
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
    // For unique cart IDs, extract the base product documentId
    let baseProductId = id;
    if (typeof id === 'string') {
      // Handle size-specific IDs: "productId-size-M" or "productId-variant-X-size-M"
      if (id.includes('-size-')) {
        baseProductId = id.split('-size-')[0];
      }
      // Handle variant IDs after size extraction
      if (baseProductId.includes('-variant-')) {
        baseProductId = baseProductId.split('-variant-')[0];
      }
    }
    
    const productInfo = allProducts.find(product => 
      product.documentId === baseProductId || 
      product.id === baseProductId || 
      (product.documentId && product.documentId === baseProductId)
    );
    let productToAdd = null;
    
    if (productInfo) {
      let imgSrc = '/images/placeholder.png';
      let title = productInfo.title;
      
      // Use variant info if provided
      if (variantInfo) {
        if (variantInfo.imgSrcObject) {
          // Use the original image object to get thumbnail
          imgSrc = getOptimizedImageUrl(variantInfo.imgSrcObject);
        } else if (variantInfo.imgSrc) {
          imgSrc = variantInfo.imgSrc;
        }
        if (variantInfo.title && variantInfo.isVariant) {
          title = `${productInfo.title} - ${variantInfo.title}`;
        }
      } else {
        // Use original logic for non-variant products
        if (productInfo.imgSrc && productInfo.imgSrc.formats && productInfo.imgSrc.formats.small && productInfo.imgSrc.formats.small.url) {
          imgSrc = getImageUrl(productInfo.imgSrc.formats.small.url);
        } else {
          imgSrc = getImageUrl(productInfo.imgSrc);
        }
      }
      
      productToAdd = {
        id: id, // Use the full variant ID
        baseProductId: baseProductId, // Keep reference to base product
        documentId: productInfo.documentId,
        title: title,
        price: productInfo.price,
        oldPrice: productInfo.oldPrice || null,
        quantity: qty || 1,
        colors: productInfo.colors || [],
        sizes: productInfo.sizes || [],
        selectedSize: selectedSize, // Add selected size
        imgSrc: imgSrc,
        weight: productInfo.weight || null,
        // Add variant information
        variantInfo: variantInfo
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
        if (!isNaN(parseInt(baseProductId))) {
          productResponse = await fetchDataFromApi(`/api/products/${parseInt(baseProductId)}?populate=*`);
        } else {
          productResponse = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${baseProductId}&populate=*`);
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
          let title = productData.title || 'Product Item';
          
          // Use variant info if provided
          if (variantInfo) {
            if (variantInfo.imgSrcObject) {
              // Use the original image object to get thumbnail
              imgUrl = getOptimizedImageUrl(variantInfo.imgSrcObject);
            } else if (variantInfo.imgSrc) {
              // Check if variantInfo.imgSrc is already a full URL
              if (typeof variantInfo.imgSrc === 'string' && variantInfo.imgSrc.startsWith('http')) {
                imgUrl = variantInfo.imgSrc;
              } else {
                // If it's an object, use getOptimizedImageUrl
                imgUrl = getOptimizedImageUrl(variantInfo.imgSrc);
              }
            }
            if (variantInfo.title && variantInfo.isVariant) {
              title = `${productData.title || 'Product Item'} - ${variantInfo.title}`;
            }
          } else {
            // Use original logic for non-variant products
            if (productData.imgSrc && productData.imgSrc.formats && productData.imgSrc.formats.small && productData.imgSrc.formats.small.url) {
              imgUrl = getImageUrl(productData.imgSrc.formats.small.url);
            } else if (productData.imgSrc?.data?.attributes?.url) {
              imgUrl = getImageUrl(productData.imgSrc.data.attributes.url);
            } else if (productData.imgSrc?.url) {
              imgUrl = getImageUrl(productData.imgSrc.url);
            } else if (typeof productData.imgSrc === 'string') {
              imgUrl = productData.imgSrc;
            } else if (productData.gallery && productData.gallery.length > 0) {
              // Try to use first gallery image if no main image
              const galleryImg = productData.gallery[0];
              imgUrl = getImageUrl(galleryImg.url || galleryImg.formats?.thumbnail?.url || '');
            }
          }
          
          productToAdd = {
            id: id, // Use the full variant ID
            baseProductId: baseProductId, // Keep reference to base product
            documentId: productData.documentId,
            title: title,
            price: parseFloat(productData.price) || 0,
            oldPrice: productData.oldPrice ? parseFloat(productData.oldPrice) : null,
            quantity: qty || 1,
            colors: productData.colors || [],
            sizes: productData.sizes || [],
            selectedSize: selectedSize, // Add selected size
            imgSrc: imgUrl,
            weight: productData.weight || null,
            // Add variant information
            variantInfo: variantInfo
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
      let title = "Product Item";
      let imgSrc = '/images/placeholder.png';
      
      // Use variant info if provided
      if (variantInfo) {
        if (variantInfo.imgSrc) {
          imgSrc = variantInfo.imgSrc;
        }
        if (variantInfo.title) {
          title = variantInfo.isVariant ? `Product Item - ${variantInfo.title}` : variantInfo.title;
        }
      }
      
      productToAdd = {
        id: id,
        baseProductId: baseProductId,
        documentId: typeof baseProductId === 'string' && baseProductId.length > 20 ? baseProductId : null,
        title: title,
        price: 0,
        oldPrice: null,
        quantity: qty || 1,
        colors: [],
        sizes: [],
        selectedSize: selectedSize, // Add selected size
        imgSrc: imgSrc,
        weight: null,
        variantInfo: variantInfo
      };
    }
    
    if (user) {
      try {
        // Get the current logged-in user data
        const currentUserData = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${user.id}&populate=user_bag`);
        
        // If the user doesn't exist in our system, they should be created by the user-management API first
        if (!currentUserData?.data || currentUserData.data.length === 0) {
          console.warn(`⚠️ User data not found for ${user.email} (ID: ${user.id}). User should be created by user-management API first.`);
          
          // Add to local cart only and let the user-management API create the user
          setCartProducts((pre) => [...pre, productToAdd]);
          
          if (isModal) {
            setCartRefreshKey(prev => prev + 1);
            openCartModal().catch(console.error);
          }
          
          return;
        }
        
        // Extract the current user data
        const currentUser = currentUserData?.data?.[0];
        const currentUserId = currentUser?.id;
        const currentUserDocumentId = currentUser?.attributes?.documentId || currentUser?.documentId;
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
            const existingBags = await fetchDataFromApi(`/api/user-bags?filters[user_datum][documentId][$eq]=${currentUserDocumentId}&populate=*`);
            
            if (existingBags.data && existingBags.data.length > 0) {
              userBag = existingBags.data[0];
              console.log(`Found existing user bag: ${userBag.id}`);
            }
          } catch (bagCheckError) {
            console.error("Error checking for existing bags:", bagCheckError);
          }
        }
        
        // Create a user-bag if none exists (this should be rare since user-management API creates bags)
        if (!userBag) {
          console.log("No user bag found, creating a new one");
          
          // Get user name from current user data
          const firstName = currentUserAttrs.firstName || user.name?.split(' ')[0] || "User";
          const lastName = currentUserAttrs.lastName || user.name?.split(' ').slice(1).join(' ') || "";
          
          try {
            const userBagPayload = {
              data: {
                Name: `${firstName} ${lastName}`.trim(),
                user_datum: currentUserDocumentId // Use documentId instead of numeric ID
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
              user_datum: currentUserDocumentId // Use documentId instead of numeric ID
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
          
          // Add product to payload - use base product documentId for backend
          const productDocumentIdForBackend = productToAdd.baseProductId || productToAdd.documentId || productToAdd.id;
          
          // Find product by documentId to get the numeric ID for backend
          try {
            const productResponse = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${productDocumentIdForBackend}&populate=*`);
            if (productResponse?.data && productResponse.data.length > 0) {
              completeCartPayload.data.product = productResponse.data[0].id;
            } else if (!isNaN(parseInt(productDocumentIdForBackend))) {
              // Fallback to numeric ID if documentId lookup fails
              completeCartPayload.data.product = parseInt(productDocumentIdForBackend);
            }
          } catch (error) {
            console.error("Error finding product by documentId:", error);
            if (!isNaN(parseInt(productDocumentIdForBackend))) {
              completeCartPayload.data.product = parseInt(productDocumentIdForBackend);
            }
          }
          
          // Add variant information to the cart payload if available
          if (productToAdd.variantInfo) {
            if (typeof productToAdd.variantInfo === 'object') {
              // If it's an object, stringify it
              completeCartPayload.data.variantInfo = JSON.stringify(productToAdd.variantInfo);
            } else {
              // If it's already a string, use it as is
              completeCartPayload.data.variantInfo = productToAdd.variantInfo;
            }
          }
          
          // Add selected size to the cart payload if available
          if (productToAdd.selectedSize) {
            completeCartPayload.data.size = productToAdd.selectedSize;
            console.log("Adding size to cart payload:", productToAdd.selectedSize);
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
      // Try to match either by ID (including variant IDs) or documentId
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
            const productDocumentIdForBackend = matchingItem.baseProductId || matchingItem.documentId || matchingItem.id;
            const createPayload = {
              data: {
                quantity: finalQuantity
              }
            };
            
            // Find product by documentId to get numeric ID for backend
            try {
              const productResponse = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${productDocumentIdForBackend}&populate=*`);
              if (productResponse?.data && productResponse.data.length > 0) {
                createPayload.data.product = productResponse.data[0].id;
              } else if (!isNaN(parseInt(productDocumentIdForBackend))) {
                createPayload.data.product = parseInt(productDocumentIdForBackend);
              }
            } catch (error) {
              console.error("Error finding product by documentId:", error);
              if (!isNaN(parseInt(productDocumentIdForBackend))) {
                createPayload.data.product = parseInt(productDocumentIdForBackend);
              }
            }
            
            // Add variant information if available
            if (matchingItem.variantInfo && typeof matchingItem.variantInfo === 'object') {
              createPayload.data.variantInfo = JSON.stringify(matchingItem.variantInfo);
            }
            
            // Add selected size if available
            if (matchingItem.selectedSize) {
              createPayload.data.size = matchingItem.selectedSize;
            }
            
            // Add user_datum if available
            if (user) {
              // Get user data for the current user
              const userDataResponse = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${user.id}`);
              
              if (userDataResponse?.data && userDataResponse.data.length > 0) {
                const userData = userDataResponse.data[0];
                const userDocumentId = userData.attributes?.documentId || userData.documentId;
                createPayload.data.user_datum = userDocumentId; // Use documentId instead of numeric ID
                
                // Also check if the user has a bag
                const userBagResponse = await fetchDataFromApi(`/api/user-bags?filters[user_datum][documentId][$eq]=${userDocumentId}`);
                
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
    
    // Reset cart loaded state when user changes
    if (user && !cartLoadedOnce) {
      setIsCartLoading(true);
    }
    
    if (user && !isCartClearing && !recentlyCleared) {
      const loadCartFromBackend = async () => {
        try {
          // Set loading state when starting to load cart
          setIsCartLoading(true);
          
          // First, get the user's data to find their user_datum ID
          const currentUserData = await fetchDataFromApi(
            `/api/user-data?filters[authUserId][$eq]=${user.id}&populate=*`
          );

          if (!currentUserData?.data || currentUserData.data.length === 0) {
            console.log("User data not found, cannot load cart");
            setCartProducts([]);
            setIsCartLoading(false);
            setCartLoadedOnce(true);
            return;
          }

          const userData = currentUserData.data[0];
          const userDataId = userData.id;
          const userDocumentId = userData.documentId || userData.attributes?.documentId;
          
          console.log("🔍 Loading cart for user:", {
            userDataId,
            userDocumentId,
            email: userData.email || userData.attributes?.email,
            authUserId: userData.authUserId || userData.attributes?.authUserId
          });
          
          // First, let's check what cart items exist in total
          const allCartsResponse = await fetchDataFromApi(`/api/carts?populate=*`);
          console.log("📦 All cart items in backend:", allCartsResponse?.data?.map(item => ({
            cartId: item.id,
            cartDocumentId: item.documentId,
            userDatumId: item.user_datum?.id || 'NULL',
            userDatumDocumentId: item.user_datum?.documentId || 'NULL',
            productTitle: item.product?.title || 'Unknown',
            quantity: item.quantity
          })));
          
          // Fetch user-specific carts from backend using documentId (more reliable than numeric ID)
          const cartResponse = await fetchDataFromApi(
            `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`
          );
          
          console.log(`🛒 Cart response for user ${userDataId}:`, cartResponse);
          console.log("📊 Cart items found:", cartResponse?.data?.length || 0);
          
          // AUTO-FIX: If no cart items found for user, check for orphaned items and link them
          if (cartResponse?.data?.length === 0 && allCartsResponse?.data?.length > 0) {
            console.log("🔧 No cart items found for user, checking for orphaned items...");
            const orphanedCarts = allCartsResponse.data.filter(cart => !cart.user_datum?.id);
            
            if (orphanedCarts.length > 0) {
              console.log(`🔗 Found ${orphanedCarts.length} orphaned cart items, attempting to link to user ${userDataId}`);
              
              // Try to link orphaned carts to current user using documentIds
              for (const orphanedCart of orphanedCarts) {
                try {
                  const linkPayload = {
                    data: {
                      user_datum: userDocumentId // Use documentId instead of numeric ID
                    }
                  };
                  
                  console.log(`🔗 Linking cart ${orphanedCart.documentId} to user ${userDocumentId}`);
                  const linkResult = await updateData(`/api/carts/${orphanedCart.documentId}`, linkPayload);
                  console.log(`✅ Successfully linked cart ${orphanedCart.documentId}`);
                } catch (linkError) {
                  console.error(`❌ Failed to link cart ${orphanedCart.documentId}:`, linkError);
                }
              }
              
              // Re-fetch cart data after linking
              console.log("🔄 Re-fetching cart data after linking...");
              const updatedCartResponse = await fetchDataFromApi(
                `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`
              );
              
              console.log("🔄 Updated cart response:", updatedCartResponse);
              
              if (updatedCartResponse?.data?.length > 0) {
                // Use the updated response
                cartResponse.data = updatedCartResponse.data;
                console.log(`✅ Successfully linked and loaded ${updatedCartResponse.data.length} cart items`);
              }
            }
          }
          
          if (cartResponse?.data?.length > 0) {
            // Transform backend cart items into the format expected by the UI
            const backendCarts = cartResponse.data.map((cartItem, index) => {
              try {
                if (!cartItem) {
                  return null; // Skip this item
                }
                
                // The cart item data is directly on the object, not nested under attributes
                const productRelation = cartItem.product || {};
                const productData = productRelation; // Direct access, no .data property
                const productAttrs = productData; // Direct access, no .attributes property
                const productId = productData.id;
                
                // Processing cart item silently
                
                // Skip items without product data
                if (!productId) {
                  return null;
              }
              
              // Parse variant information if available
              let variantInfo = null;
              let cartItemId = productAttrs.documentId || productId;
              let title = productAttrs.title || "Product Item";
              let imgSrc = getOptimizedImageUrl(productAttrs.imgSrc) || '/logo.png';
              
              if (cartItem.variantInfo) {
                try {
                  // Check if variantInfo is already an object (not a string)
                  if (typeof cartItem.variantInfo === 'object' && cartItem.variantInfo !== null) {
                    variantInfo = cartItem.variantInfo;
                  } else if (typeof cartItem.variantInfo === 'string') {
                    // Only try to parse if it's a string and not "[object Object]"
                    if (cartItem.variantInfo !== "[object Object]" && cartItem.variantInfo.trim() !== "") {
                      variantInfo = JSON.parse(cartItem.variantInfo);
                    } else {
                      console.warn("Skipping invalid variantInfo string:", cartItem.variantInfo);
                      variantInfo = null;
                    }
                  }
                  
                  if (variantInfo) {
                    // Reconstruct the variant-specific cart item ID using documentId
                    if (variantInfo.isVariant && variantInfo.variantId) {
                      cartItemId = `${productAttrs.documentId || productId}-variant-${variantInfo.variantId}`;
                    }
                    
                    // Use variant-specific title and image
                    if (variantInfo.title && variantInfo.isVariant) {
                      title = `${productAttrs.title || "Product Item"} - ${variantInfo.title}`;
                    }
                    
                    if (variantInfo.imgSrcObject) {
                      // Use the original image object to get thumbnail
                      imgSrc = getOptimizedImageUrl(variantInfo.imgSrcObject);
                    } else if (variantInfo.imgSrc) {
                      // Check if variantInfo.imgSrc is already a full URL
                      if (typeof variantInfo.imgSrc === 'string' && variantInfo.imgSrc.startsWith('http')) {
                        imgSrc = variantInfo.imgSrc;
                      } else {
                        // If it's an object, use getOptimizedImageUrl
                        imgSrc = getOptimizedImageUrl(variantInfo.imgSrc);
                      }
                    }
                  }
                } catch (parseError) {
                  console.error("Error parsing variant info:", parseError, "Raw value:", cartItem.variantInfo);
                  variantInfo = null;
                }
              }

              // Keep the cart item ID simple - don't modify it with size
              // The size checking logic will handle product+size combinations
              
              const productCart = {
                id: cartItemId, // Use variant-specific ID
                baseProductId: productAttrs.documentId || productId, // Keep reference to base product documentId
                cartId: cartItem.id,
                cartDocumentId: cartItem.documentId,
                documentId: productAttrs.documentId,
                title: title,
                price: parseFloat(productAttrs.price || 0),
                oldPrice: productAttrs.oldPrice ? parseFloat(productAttrs.oldPrice) : null,
                quantity: cartItem.quantity || 1,
                colors: productAttrs.colors || [],
                sizes: productAttrs.sizes || [],
                selectedSize: cartItem.size || null, // Include selected size from backend
                imgSrc: imgSrc,
                variantInfo: variantInfo // Include variant info
              };
              
              // Cart item processed successfully
              
              // Special handling for Redezyyyy Shorts
              if (productCart.title && productCart.title.includes("Redezyyyy")) {
                console.log("Found Redezyyyy Shorts in cart - checking oldPrice:", productCart.oldPrice);
                if (!productCart.oldPrice) {
                  console.log("Setting oldPrice to 129.00 for Redezyyyy Shorts");
                  productCart.oldPrice = 129.00;
                }
              }
              
              return productCart;
              } catch (error) {
                console.error("Error processing cart item:", error, cartItem);
                return null; // Skip this item if there's an error
              }
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
        } finally {
          // Always set loading to false and mark as loaded once
          setIsCartLoading(false);
          setCartLoadedOnce(true);
        }
      };
      
      loadCartFromBackend();
    } else {
      // User logged out, clear the cart
      setCartProducts([]);
      // If no user, we're not loading and consider it loaded
      setIsCartLoading(false);
      setCartLoadedOnce(true);
    }
  }, [user?.id, isCartClearing, cartClearedTimestamp]); // Only trigger when user ID changes, not entire user object

  // Remove localStorage saving for cart data
  useEffect(() => {
    // We're no longer saving cart data to localStorage
    // All data will be stored only in the backend
  }, [cartProducts, user?.id]); // Only depend on user ID, not entire user object
  
  // Remove localStorage loading for wishlist
  useEffect(() => {
    // We're no longer loading wishlist data from localStorage
  }, [user?.id]); // Only depend on user ID, not entire user object

  // Remove localStorage saving for wishlist
  useEffect(() => {
    // We're no longer saving wishlist to localStorage
  }, [wishList, user?.id]); // Only depend on user ID, not entire user object

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
        // Filter out the item with matching id (including variant IDs)
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
        `/api/user-data?filters[authUserId][$eq]=${user.id}&populate=*`
      );

      if (!currentUserData?.data || currentUserData.data.length === 0) {
        console.log("User data not found, cannot remove cart item");
        return;
      }

      const userData = currentUserData.data[0];
      const userDocumentId = userData.documentId || userData.attributes?.documentId;
      
      const cartResponse = await fetchDataFromApi(
        `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`
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
        `/api/user-data?filters[authUserId][$eq]=${user.id}&populate=*`
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
      const userDocumentId = userData.documentId || userData.attributes?.documentId;
      
      console.log("Found user document ID:", userDocumentId);
      
      // Get cart items for this specific user
      const cartResponse = await fetchDataFromApi(
        `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`
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
          `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`
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
        `/api/user-data?filters[authUserId][$eq]=${user.id}&populate=*`
      );

      if (!currentUserData?.data || currentUserData.data.length === 0) {
        console.log("❌ User data not found, cannot clear backend cart");
        return;
      }

      const userData = currentUserData.data[0];
      const userDocumentId = userData.documentId || userData.attributes?.documentId;
      
      console.log("✅ Found user document ID:", userDocumentId);
      console.log("🔍 Fetching cart items for deletion...");
      
      // Get cart items for this specific user
      const cartResponse = await fetchDataFromApi(
        `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`
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
          `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`
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
      // Try thumbnail first for cart items
      if (imageObj.data.attributes.formats.thumbnail?.url) {
        return `${API_URL}${imageObj.data.attributes.formats.thumbnail.url}`;
      }
      // Try small format as fallback
      if (imageObj.data.attributes.formats.small?.url) {
        return `${API_URL}${imageObj.data.attributes.formats.small.url}`;
      }
    }
    
    // Check for formats in the flattened structure
    if (imageObj.formats) {
      // Try thumbnail first for cart items
      if (imageObj.formats.thumbnail?.url) {
        return `${API_URL}${imageObj.formats.thumbnail.url}`;
      }
      // Try small format as fallback
      if (imageObj.formats.small?.url) {
        return `${API_URL}${imageObj.formats.small.url}`;
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

  // Cleanup effect for when component unmounts (browser closes)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear user creation flags when browser is closing
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('userCreated_')) {
          sessionStorage.removeItem(key);
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.addEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Function to manually clear user creation attempts (for debugging)
  const clearUserCreationFlags = () => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('userCreated_')) {
        sessionStorage.removeItem(key);
        console.log(`🧹 Cleared user creation flag: ${key}`);
      }
    });
    setUserCreationAttempted(false);
  };

  const contextElement = {
    user,
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    isProductSizeInCart, // Add the new function
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
    // Cart loading states
    isCartLoading,
    cartLoadedOnce,
    // Currency management
    userCountry,
    userCurrency,
    exchangeRate,
    isLoadingCurrency,
    setCurrency,
    refreshExchangeRate,
    clearUserCreationFlags,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}