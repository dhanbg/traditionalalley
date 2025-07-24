import { API_URL, STRAPI_API_TOKEN, PRODUCTS_API } from "./urls"
import { generateLocalTimestamp } from './timezone';

// Helper function to construct proper image URLs
export const getImageUrl = (imageObj) => {
  // Default placeholder that's built into Next.js
  const defaultPlaceholder = "/vercel.svg";
  
  if (!imageObj) return defaultPlaceholder;
  
  // If imageObj is a string, handle as direct or relative URL
  if (typeof imageObj === 'string') {
    if (imageObj.startsWith('http')) return imageObj;
    if (imageObj.startsWith('/uploads/')) return `${API_URL}${imageObj}`;
    return imageObj;
  }
  
  // Handle the case where the URL is already a full URL
  if (imageObj.url && imageObj.url.startsWith("http")) {
    return imageObj.url;
  }
  
  // Handle the structure where URL is directly in the object
  if (imageObj.url) {
    return `${API_URL}${imageObj.url}`;
  }
  
  // Handle the structure from the sample data
  if (imageObj && typeof imageObj === 'object') {
    // Try to get image URL from the formats.small path
    if (imageObj.formats && imageObj.formats.small && imageObj.formats.small.url) {
      return `${API_URL}${imageObj.formats.small.url}`;
    }
    
    // Try to get image URL from the formats.thumbnail path
    if (imageObj.formats && imageObj.formats.thumbnail && imageObj.formats.thumbnail.url) {
      return `${API_URL}${imageObj.formats.thumbnail.url}`;
    }
    
    // Try the main URL if formats not available or don't have URLs
    if (imageObj.url) {
      return `${API_URL}${imageObj.url}`;
    }
  }
  
  // Return placeholder if no valid URL found
  return defaultPlaceholder;
}

// Helper function to get optimized image URL based on the image object structure
export const getOptimizedImageUrl = (imgObj) => {
  if (!imgObj) return null;
  
  // If the imgObj is just a string URL, return it directly
  if (typeof imgObj === 'string') {
    return imgObj;
  }
  
  let imageUrl = null;
  
  // Handle case where imgObj is a properly formatted image object from Strapi
  if (imgObj.formats) {
    // Prioritize small format for better quality
    if (imgObj.formats.small) {
      imageUrl = imgObj.formats.small.url;
    } 
    // Fall back to thumbnail format if small isn't available
    else if (imgObj.formats.thumbnail) {
      imageUrl = imgObj.formats.thumbnail.url;
    }
    // Then medium as last resort for formats
    else if (imgObj.formats.medium) {
      imageUrl = imgObj.formats.medium.url;
    }
  }
  
  // If no optimized formats are found, use the original URL
  if (!imageUrl && imgObj.url) {
    imageUrl = imgObj.url;
  }
  
  // If the URL doesn't start with http, prepend the API URL
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/images/')) {
    imageUrl = `${API_URL}${imageUrl}`;
  }
  
  return imageUrl;
};

export const fetchDataFromApi = async (endpoint) => {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
  }

  try {
    // Check for known invalid product IDs to avoid unnecessary API calls
    if (endpoint.includes('/api/products/')) {
      // Extract the product ID from the endpoint
      const match = endpoint.match(/\/api\/products\/(\d+)/);
      if (match && match[1]) {
        const productId = parseInt(match[1]);
        // Immediately reject known invalid product IDs
        if ([55, 60, 61].includes(productId)) {
          const error = new Error(`HTTP error! status: 404`);
          error.status = 404;
          error.detail = { error: `Product with ID ${productId} is known to be invalid` };
          throw error;
        }
      }
    }
    
    // Make sure the endpoint is properly encoded for any special characters
    // Only encode the part after the query params to avoid double-encoding the ? and = characters
    let processedEndpoint = endpoint;
    if (endpoint.includes('?')) {
      const [basePath, queryString] = endpoint.split('?');
      // Split by & to process each param individually
      const queryParams = queryString.split('&').map(param => {
        const [key, value] = param.split('=');
        // Only encode the value part, not the key or operators
        if (value.includes('[') || value.includes(']')) {
          // Don't encode operators like [$eq]
          return param;
        } else {
          return `${key}=${encodeURIComponent(value)}`;
        }
      });
      processedEndpoint = `${basePath}?${queryParams.join('&')}`;
    }

    console.log(`🌐 Fetching from: ${API_URL}${processedEndpoint}`);

    const res = await fetch(`${API_URL}${processedEndpoint}`, options);
    
    if (!res.ok) {
      // Try to read the error response body
      const errorBody = await res.text();
      let errorDetail;
      
      try {
        errorDetail = JSON.parse(errorBody);
      } catch (e) {
        errorDetail = errorBody;
      }
      
      const error = new Error(`HTTP error! status: ${res.status}`);
      error.status = res.status;
      error.detail = errorDetail;
      throw error;
    }
    
    return res.json();
  } catch (error) {
    throw error;
  }
}

export const createData = async (endpoint, data) => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }
  
  try {
    const res = await fetch(`${API_URL}${endpoint}`, options)
    
    if (!res.ok) {
      // Try to read the error response body
      const errorBody = await res.text();
      let errorDetail;
      
      try {
        errorDetail = JSON.parse(errorBody);
      } catch (e) {
        errorDetail = errorBody;
      }
      
      const error = new Error(`Create failed: ${res.statusText}`);
      error.status = res.status;
      error.detail = errorDetail;
      throw error;
    }
    
    return res.json()
  } catch (error) {
    throw error;
  }
}

export const updateData = async (endpoint, data) => {
  const options = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  
  try {
    // Send the request
    const res = await fetch(`${API_URL}${endpoint}`, options);
    
    // Get the response text for parsing
    const responseText = await res.text();
    
    // Try to parse the response as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      // Response is not JSON
    }
    
    // Check if the request was successful
    if (!res.ok) {
      const error = new Error(`Update failed: ${res.statusText}`);
      error.status = res.status;
      error.detail = responseData || responseText;
      error.url = `${API_URL}${endpoint}`;
      throw error;
    }
    
    return responseData;
  } catch (error) {
    throw error;
  }
}

export const deleteData = async (endpoint) => {
  const options = {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
  };
  
  let cleanEndpoint = endpoint;
  
  try {
    // Send the delete request
    const res = await fetch(`${API_URL}${cleanEndpoint}`, options);
    
    // Get response text if possible
    let responseText;
    try {
      responseText = await res.text();
    } catch (textError) {
      // Could not get response text
    }
    
    // Try to parse response as JSON
    let responseData;
    try {
      if (responseText && responseText.length > 0) {
        responseData = JSON.parse(responseText);
      }
    } catch (parseError) {
      // Response is not JSON
    }
    
    // Check if the request was successful
    if (!res.ok) {
      const error = new Error(`Delete failed: ${res.statusText}`);
      error.status = res.status;
      error.detail = responseData || responseText;
      error.url = `${API_URL}${cleanEndpoint}`;
      throw error;
    }
    
    return responseData || { success: true };
  } catch (error) {
    throw error;
  }
}

export const getCurrentUserCart = async (user) => {
  if (!user) {
    return { data: [] };
  }
  
  try {
    const userCartEndpoint = `/api/carts?filters[userId][$eq]=${user.id}&populate=*`;
    const cartData = await fetchDataFromApi(userCartEndpoint);
    return cartData;
  } catch (error) {
    throw error;
  }
}

export const fetchFilterOptions = async (categoryTitle) => {
  try {
    if (!categoryTitle) {
      return {
        collections: [],
        colors: [],
        sizes: [],
        availabilityOptions: [
          { id: "inStock", label: "In stock", count: 0, value: true },
          { id: "outStock", label: "Out of stock", count: 0, value: false }
        ],
        priceRange: [20, 300]
      };
    }
    
    // Properly encode the category title for the URL
    const encodedCategoryTitle = encodeURIComponent(categoryTitle);
    
    // Use a simpler query to avoid potential encoding issues
    const endpoint = `${PRODUCTS_API}&filters[collection][category][title]=${encodedCategoryTitle}`;
    
    // Fetch products for the category to extract filter options
    const response = await fetchDataFromApi(endpoint);
    
    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      return {
        collections: [],
        colors: [],
        sizes: [],
        availabilityOptions: [
          { id: "inStock", label: "In stock", count: 0, value: true },
          { id: "outStock", label: "Out of stock", count: 0, value: false }
        ],
        priceRange: [20, 300]
      };
    }

    const products = response.data;
    
    // Extract unique collections instead of brands
    const uniqueCollections = new Map();
    products.forEach(product => {
      if (product && product.collection && product.collection.id) {
        if (!uniqueCollections.has(product.collection.id)) {
          uniqueCollections.set(product.collection.id, {
            id: product.collection.id,
            documentId: product.collection.documentId,
            name: product.collection.name,
            slug: product.collection.slug,
            count: 1
          });
        } else {
          // Increment count for this collection
          const collection = uniqueCollections.get(product.collection.id);
          collection.count += 1;
          uniqueCollections.set(product.collection.id, collection);
        }
      }
    });
    
    const collections = Array.from(uniqueCollections.values());
    
    // Extract unique colors
    const uniqueColors = new Map(); // Use Map to store colors with their imgSrc
    products.forEach(product => {
      if (product && product.colors && Array.isArray(product.colors)) {
        if (product.colors.length > 0) {
          product.colors.forEach(color => {
            if (typeof color === 'string') {
              // Handle string format (fallback to CSS classes)
              if (color) {
                const className = `bg-${color.toLowerCase().replace(/\s+/g, '-')}`;
                uniqueColors.set(color, { 
                  name: color, 
                  className,
                  imgSrc: null
                });
              }
            } else if (color && typeof color === 'object') {
              // Handle object format with name and imgSrc
              if (color.name) {
                const className = `bg-${color.name.toLowerCase().replace(/\s+/g, '-')}`;
                // If this color already exists in the map but doesn't have an imgSrc, and this one does, update it
                if (!uniqueColors.has(color.name) || 
                    (color.imgSrc && !uniqueColors.get(color.name).imgSrc)) {
                  uniqueColors.set(color.name, {
                    name: color.name,
                    className: className,
                    imgSrc: color.imgSrc || null
                  });
                }
              }
            }
          });
        }
      }
    });
    
    const colors = Array.from(uniqueColors.values()).map(color => {
      return {
        name: color.name,
        className: color.name.toLowerCase() === 'white' ? `${color.className} line-black` : color.className,
        imgSrc: color.imgSrc
      };
    });
    
    // Extract unique sizes
    const uniqueSizes = new Set();
    products.forEach(product => {
      if (product && product.sizes && Array.isArray(product.sizes)) {
        if (product.sizes.length > 0) {
          if (typeof product.sizes[0] === 'string') {
            product.sizes.forEach(size => {
              if (size) uniqueSizes.add(size);
            });
          } else if (typeof product.sizes[0] === 'object') {
            product.sizes.forEach(size => {
              if (size && size.name) uniqueSizes.add(size.name);
            });
          }
        }
      }
    });
    
    const sizes = Array.from(uniqueSizes);
    
    // Get availability options with counts
    const inStockCount = products.filter(p => p && p.inStock === true).length;
    const outOfStockCount = products.filter(p => p && p.inStock === false).length;
    
    const availabilityOptions = [
      { 
        id: "inStock", 
        label: "In stock", 
        count: inStockCount,
        value: true 
      },
      { 
        id: "outStock", 
        label: "Out of stock", 
        count: outOfStockCount,
        value: false 
      }
    ];
    
    // Determine price range
    const allPrices = products.map(p => p && typeof p.price === 'number' ? p.price : null).filter(Boolean);
    const minPrice = allPrices.length > 0 ? Math.floor(Math.min(...allPrices)) : 20;
    const maxPrice = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : 300;
    const priceRange = [minPrice, maxPrice];
    
    return {
      collections,
      colors,
      sizes,
      availabilityOptions,
      priceRange
    };
  } catch (error) {
    // Return default values on error
    return {
      collections: [],
      colors: [],
      sizes: [],
      availabilityOptions: [
        { id: "inStock", label: "In stock", count: 0, value: true },
        { id: "outStock", label: "Out of stock", count: 0, value: false }
      ],
      priceRange: [20, 300]
    };
  }
};

export const updateUserBagWithPayment = async (userBagDocumentId, paymentData) => {
  try {
    // First, fetch the current user-bag to get existing user_orders
    const currentBagResponse = await fetchDataFromApi(`/api/user-bags/${userBagDocumentId}?populate=*`);
    
    if (!currentBagResponse || !currentBagResponse.data) {
      throw new Error(`User bag with documentId ${userBagDocumentId} not found`);
    }

    const currentBag = currentBagResponse.data;
    const currentUserOrders = currentBag.user_orders || {};
    
    // Initialize payments array if it doesn't exist
    const existingPayments = currentUserOrders.payments || [];
    
    // Check if a payment with the same merchantTxnId already exists (NPS only)
    let existingPaymentIndex = -1;
    let paymentIdentifier = '';
    
    if (paymentData.provider === 'nps' && paymentData.merchantTxnId) {
      existingPaymentIndex = existingPayments.findIndex(payment => payment.merchantTxnId === paymentData.merchantTxnId);
      paymentIdentifier = paymentData.merchantTxnId;
    }
    
    let updatedPayments;
    if (existingPaymentIndex !== -1) {
      // Update existing payment
      updatedPayments = [...existingPayments];
      updatedPayments[existingPaymentIndex] = {
        ...updatedPayments[existingPaymentIndex],
        ...paymentData,
        timestamp: generateLocalTimestamp() // Update timestamp for the update
      };
      console.log(`Updating existing payment with identifier: ${paymentIdentifier}`);
    } else {
      // Add new payment
      updatedPayments = [...existingPayments, paymentData];
      console.log(`Adding new payment with identifier: ${paymentIdentifier}`);
    }
    
    // Update the user_orders
    const updatedUserOrders = {
      ...currentUserOrders,
      payments: updatedPayments
    };

    // Update the user-bag with the new user_orders
    const updatePayload = {
      data: {
        user_orders: updatedUserOrders
      }
    };

    const updateResponse = await updateData(`/api/user-bags/${userBagDocumentId}`, updatePayload);
    
    console.log('Successfully updated user-bag with payment data:', updateResponse);
    return updateResponse;
    
  } catch (error) {
    console.error('Error updating user-bag with payment data:', error);
    throw error;
  }
};

// Create individual order record in Strapi user_orders collection
export const createOrderRecord = async (paymentData, userAuthId) => {
  try {
    console.log('Creating order record for payment:', paymentData.merchantTxnId || paymentData.provider);
    
    // Prepare order data for Strapi user_orders collection
    const orderRecord = {
      // Order identification
      orderId: paymentData.merchantTxnId || `${paymentData.provider.toUpperCase()}-${Date.now()}`,
      orderNumber: paymentData.merchantTxnId || `${paymentData.provider.toUpperCase()}-${Date.now()}`,
      
      // Payment information
      paymentProvider: paymentData.provider,
      paymentStatus: paymentData.status,
      totalAmount: paymentData.amount,
      currency: "NPR",
      
      // Timestamps
      orderDate: paymentData.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // User reference
      authUserId: userAuthId,
      
      // Complete order data with shipping and product details
      orderData: paymentData.orderData || {},
      
      // Extract key information for easy admin access (prioritize receiver_details over legacy shipping.receiver)
      customerInfo: (paymentData.orderData?.receiver_details ? {
                     firstName: paymentData.orderData.receiver_details.firstName,
                     lastName: paymentData.orderData.receiver_details.lastName,
                     fullName: `${paymentData.orderData.receiver_details.firstName || ''} ${paymentData.orderData.receiver_details.lastName || ''}`.trim(),
                     email: paymentData.orderData.receiver_details.email,
                     phone: paymentData.orderData.receiver_details.phone,
                     alternatePhone: paymentData.orderData.receiver_details.alternatePhone || ""
                   } : {}) || 
                   paymentData.orderData?.shipping?.receiver?.personalInfo || {},
      
      shippingAddress: (paymentData.orderData?.receiver_details?.address ? {
                        street: paymentData.orderData.receiver_details.address.street,
                        city: paymentData.orderData.receiver_details.address.city,
                        state: paymentData.orderData.receiver_details.address.state || "",
                        postalCode: paymentData.orderData.receiver_details.address.postalCode,
                        country: paymentData.orderData.receiver_details.address.country,
                        countryCode: paymentData.orderData.receiver_details.address.country === "Nepal" ? "NP" : 
                                    paymentData.orderData.receiver_details.address.country === "India" ? "IN" : 
                                    paymentData.orderData.receiver_details.address.country === "United States" ? "US" : 
                                    paymentData.orderData.receiver_details.address.country === "Canada" ? "CA" : 
                                    paymentData.orderData.receiver_details.address.country === "Australia" ? "AU" : 
                                    paymentData.orderData.receiver_details.address.country === "United Kingdom" ? "GB" : "XX",
                        fullAddress: `${paymentData.orderData.receiver_details.address.street}, ${paymentData.orderData.receiver_details.address.city}, ${paymentData.orderData.receiver_details.address.state ? paymentData.orderData.receiver_details.address.state + ', ' : ''}${paymentData.orderData.receiver_details.address.postalCode}, ${paymentData.orderData.receiver_details.address.country}`,
                        addressType: paymentData.orderData.receiver_details.addressType || "Home",
                        landmark: paymentData.orderData.receiver_details.landmark || ""
                      } : {}) || 
                      paymentData.orderData?.shipping?.receiver?.address || {},
      
      shippingMethod: paymentData.orderData?.shipping?.method || 
                     (paymentData.provider === 'nps' ? {
                       carrier: "NPS Payment",
                       service: "NPS Standard",
                       estimatedDays: paymentData.orderData?.receiver_details?.address?.country === "Nepal" ? "3-5" : "7-10",
                       cost: paymentData.orderData?.shippingPrice || 0,
                       currency: "NPR",
                       trackingAvailable: true,
                       insuranceIncluded: true,
                       signatureRequired: true
                     } : {}) || {},
      
      packageDetails: paymentData.orderData?.shipping?.package || 
                     (paymentData.orderData?.products ? {
                       totalWeight: paymentData.orderData.products.reduce((total, product) => {
                         return total + ((product.packageInfo?.weight || 1) * (product.pricing?.quantity || product.quantity || 1));
                       }, 0),
                       packageType: "Box",
                       packagingMaterial: "Cardboard Box with Bubble Wrap",
                       specialInstructions: paymentData.orderData.receiver_details?.note || "",
                       declaredValue: paymentData.amount || 0,
                       contentDescription: `Traditional Alley Products - ${paymentData.orderData.products.length} items (${paymentData.provider.toUpperCase()})`,
                       dangerousGoods: false,
                       customsDeclaration: paymentData.orderData.receiver_details?.address?.country !== "Nepal"
                     } : {}) || {},
      
      processingInfo: paymentData.orderData?.shipping?.processing || 
                     (paymentData.provider === 'cod' ? {
                       codAmount: paymentData.amount
                     } : {
                       warehouseLocation: "Kathmandu Main Warehouse",
                       expectedPackingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                       expectedShipDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                       priorityLevel: paymentData.amount > 20000 ? "High" : paymentData.amount > 10000 ? "Medium" : "Normal",
                       packingInstructions: `Handle with care. Traditional items may be fragile. Payment via ${paymentData.provider.toUpperCase()}.`,
                       qualityCheckRequired: paymentData.amount > 15000,
                       photographRequired: paymentData.amount > 25000,
                       adminAssigned: null,
                       packingNotes: `${paymentData.provider.toUpperCase()} Payment Order`
                     }) || {},
      
      // Product summary for quick reference
      productSummary: {
        totalItems: paymentData.orderData?.orderSummary?.totalItems || 0,
        totalProducts: paymentData.orderData?.orderSummary?.totalProducts || 0,
        products: paymentData.orderData?.products?.map(product => ({
          productId: product.productId || product.documentId,
          title: product.title,
          sku: product.sku,
          quantity: product.pricing?.quantity || product.quantity || 1,
          unitPrice: product.pricing?.currentPrice || product.unitPrice,
          totalPrice: product.pricing?.finalPrice || product.finalPrice,
          variant: product.selectedVariant || { size: product.size, color: product.color }
        })) || []
      },
      
      // Admin workflow fields
      adminStatus: "pending", // pending, processing, shipped, delivered, cancelled
      adminAssigned: null,
      adminNotes: "",
      trackingNumber: null,
      shippingCarrier: paymentData.orderData?.shipping?.method?.carrier || null,
      
      // Legacy compatibility
      legacyPaymentData: paymentData
    };
    
    console.log('Order record prepared:', {
      orderId: orderRecord.orderId,
      paymentProvider: orderRecord.paymentProvider,
      totalAmount: orderRecord.totalAmount,
      customerName: orderRecord.customerInfo?.fullName,
      productCount: orderRecord.productSummary?.totalProducts
    });
    
    // Create the order record in Strapi
    const createResponse = await createData('/api/user-orders', {
      data: orderRecord
    });
    
    console.log('✅ Order record created successfully:', createResponse.data?.documentId);
    return createResponse;
    
  } catch (error) {
    console.error('❌ Error creating order record:', error);
    // Don't throw error - order creation failure shouldn't break payment flow
    return null;
  }
};

// Function to update product stock after successful payment
export const updateProductStock = async (purchasedProducts) => {
  console.log('=== STARTING PRODUCT STOCK UPDATE ===');
  console.log('Products to update:', purchasedProducts.length);
  
  const updateResults = [];
  
  for (const product of purchasedProducts) {
    try {
      console.log(`Updating stock for product: ${product.title} (${product.documentId})`);
      console.log(`Size: ${product.selectedSize || product.size}, Quantity purchased: ${product.quantity}`);
      
      // Fetch current product data to get latest stock information
      const currentProductResponse = await fetchDataFromApi(`/api/products/${product.documentId}?populate=*`);
      
      if (!currentProductResponse || !currentProductResponse.data) {
        console.error(`❌ Failed to fetch current product data for ${product.documentId}`);
        updateResults.push({ productId: product.documentId, success: false, error: 'Product not found' });
        continue;
      }
      
      const currentProduct = currentProductResponse.data;
      console.log('Current product data fetched:', currentProduct.documentId);
      
      // Determine which stock to update (product or variant)
      let stockToUpdate = null;
      let updateEndpoint = null;
      let sizeStocks = null;
      
      // Check if this is a variant product
      if (product.variantId && currentProduct.variants && currentProduct.variants.length > 0) {
        // Find the specific variant
        const variant = currentProduct.variants.find(v => v.documentId === product.variantId);
        if (variant && variant.size_stocks) {
          console.log('Updating variant stock:', variant.documentId);
          stockToUpdate = variant;
          updateEndpoint = `/api/variants/${variant.documentId}`;
          sizeStocks = variant.size_stocks;
        }
      }
      
      // If no variant or variant doesn't have size_stocks, use main product
      if (!stockToUpdate && currentProduct.size_stocks) {
        console.log('Updating main product stock:', currentProduct.documentId);
        stockToUpdate = currentProduct;
        updateEndpoint = `/api/products/${currentProduct.documentId}`;
        sizeStocks = currentProduct.size_stocks;
      }
      
      if (!stockToUpdate || !sizeStocks) {
        console.warn(`⚠️ No size_stocks found for product ${product.documentId}`);
        updateResults.push({ productId: product.documentId, success: false, error: 'No size_stocks available' });
        continue;
      }
      
      // Parse size_stocks if it's a string
      let parsedSizeStocks = sizeStocks;
      if (typeof sizeStocks === 'string') {
        try {
          parsedSizeStocks = JSON.parse(sizeStocks);
        } catch (parseError) {
          console.error(`❌ Error parsing size_stocks for ${product.documentId}:`, parseError);
          updateResults.push({ productId: product.documentId, success: false, error: 'Invalid size_stocks format' });
          continue;
        }
      }
      
      // Get the size to update
      const sizeToUpdate = product.selectedSize || product.size;
      if (!sizeToUpdate) {
        console.warn(`⚠️ No size specified for product ${product.documentId}`);
        updateResults.push({ productId: product.documentId, success: false, error: 'No size specified' });
        continue;
      }
      
      // Check if the size exists in stock
      if (!(sizeToUpdate in parsedSizeStocks)) {
        console.warn(`⚠️ Size ${sizeToUpdate} not found in stock for product ${product.documentId}`);
        updateResults.push({ productId: product.documentId, success: false, error: `Size ${sizeToUpdate} not in stock` });
        continue;
      }
      
      // Calculate new stock
      const currentStock = parseInt(parsedSizeStocks[sizeToUpdate]) || 0;
      const quantityPurchased = parseInt(product.quantity) || 1;
      const newStock = Math.max(0, currentStock - quantityPurchased); // Ensure stock doesn't go negative
      
      console.log(`Stock update: ${sizeToUpdate} - Current: ${currentStock}, Purchased: ${quantityPurchased}, New: ${newStock}`);
      
      // Update the size_stocks object
      const updatedSizeStocks = {
        ...parsedSizeStocks,
        [sizeToUpdate]: newStock
      };
      
      // Prepare the update data
      const updateData = {
        data: {
          size_stocks: updatedSizeStocks
        }
      };
      
      // Update the product or variant
      const updateResponse = await updateData(updateEndpoint, updateData);
      
      if (updateResponse && updateResponse.data) {
        console.log(`✅ Stock updated successfully for ${product.documentId} - ${sizeToUpdate}: ${newStock}`);
        updateResults.push({ 
          productId: product.documentId, 
          success: true, 
          size: sizeToUpdate,
          oldStock: currentStock,
          newStock: newStock,
          quantityPurchased: quantityPurchased
        });
      } else {
        console.error(`❌ Failed to update stock for ${product.documentId}`);
        updateResults.push({ productId: product.documentId, success: false, error: 'Update request failed' });
      }
      
    } catch (error) {
      console.error(`❌ Error updating stock for product ${product.documentId}:`, error);
      updateResults.push({ productId: product.documentId, success: false, error: error.message });
    }
  }
  
  // Log summary
  const successCount = updateResults.filter(r => r.success).length;
  const failureCount = updateResults.filter(r => !r.success).length;
  
  console.log('=== STOCK UPDATE SUMMARY ===');
  console.log(`Total products: ${purchasedProducts.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Failed to update: ${failureCount}`);
  
  if (failureCount > 0) {
    console.log('Failed updates:', updateResults.filter(r => !r.success));
  }
  
  return {
    totalProducts: purchasedProducts.length,
    successCount,
    failureCount,
    results: updateResults
  };
};
