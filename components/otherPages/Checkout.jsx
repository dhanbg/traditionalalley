"use client";

import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import NPSPaymentForm from "../payments/NPSPaymentForm";
import DHLShippingForm from "../shipping/DHLShippingForm";
import { fetchDataFromApi, updateData, updateUserBagWithPayment, createOrderRecord, updateProductStock, deleteData } from "@/utils/api";
import { processPostPaymentStockAndCart } from "@/utils/postPaymentProcessing";
import { useSession } from "next-auth/react";
import PriceDisplay from "@/components/common/PriceDisplay";
import { convertUsdToNpr, getExchangeRate } from "@/utils/currency";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

// Function to get thumbnail image URL from product image object
const getThumbnailImageUrl = (imgSrc) => {
  // If it's already a string URL, return as is
  if (typeof imgSrc === 'string') {
    return imgSrc;
  }
  
  // If it's an object with formats, try to get thumbnail
  if (imgSrc && typeof imgSrc === 'object') {
    if (imgSrc.formats && imgSrc.formats.thumbnail && imgSrc.formats.thumbnail.url) {
      return imgSrc.formats.thumbnail.url.startsWith('http') 
        ? imgSrc.formats.thumbnail.url 
        : `${API_URL}${imgSrc.formats.thumbnail.url}`;
    }
    // Fallback to small if thumbnail not available
    else if (imgSrc.formats && imgSrc.formats.small && imgSrc.formats.small.url) {
      return imgSrc.formats.small.url.startsWith('http') 
        ? imgSrc.formats.small.url 
        : `${API_URL}${imgSrc.formats.small.url}`;
    }
    // Fallback to medium if small not available
    else if (imgSrc.formats && imgSrc.formats.medium && imgSrc.formats.medium.url) {
      return imgSrc.formats.medium.url.startsWith('http') 
        ? imgSrc.formats.medium.url 
        : `${API_URL}${imgSrc.formats.medium.url}`;
    }
    // Fallback to original URL
    else if (imgSrc.url) {
      return imgSrc.url.startsWith('http') 
        ? imgSrc.url 
        : `${API_URL}${imgSrc.url}`;
    }
  }
  
  // Return fallback image if nothing works
  return '/images/products/default-product.jpg';
};

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
export default function Checkout() {
  const [activeDiscountIndex, setActiveDiscountIndex] = useState(1);
  const { 
    cartProducts, 
    totalPrice, 
    getSelectedCartItems, 
    getSelectedItemsTotal,
    selectedCartItems,
    clearPurchasedItemsFromCart,
    userCurrency
  } = useContextElement();
  
  const { data: session } = useSession();
  const user = session?.user;
  
  // Memoize selected products to prevent infinite re-renders
  const selectedProducts = useMemo(() => {
    return cartProducts.filter(product => selectedCartItems[product.id]);
  }, [cartProducts, selectedCartItems]);

  // Add state to store products with updated oldPrice values
  const [productsWithOldPrice, setProductsWithOldPrice] = useState({});

  // Add state for selected payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('nps');

  // Add state for DHL shipping
  const [shippingCost, setShippingCost] = useState(0);
  const [trackingNumber, setTrackingNumber] = useState('');

  // Add state for loading and success states
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isLoadingProductDetails, setIsLoadingProductDetails] = useState(false);

  // Add state for NPR conversion
  const [nprExchangeRate, setNprExchangeRate] = useState(null);


  
  // Add state for combined update and delete operation
  const [isProcessingUpdateAndDelete, setIsProcessingUpdateAndDelete] = useState(false);

  // Function to handle both stock update and cart deletion
  const handleUpdateStockAndDelete = async () => {
    if (!user?.id) {
      alert('Please log in to perform this operation.');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('No products selected.');
      return;
    }

    // Calculate total quantity to be decreased
    const totalQuantity = selectedProducts.reduce((sum, product) => sum + (product.quantity || 1), 0);
    
    setIsProcessingUpdateAndDelete(true);

    try {
      console.log('🔄 Starting combined update stock and delete operation for:', selectedProducts.length, 'products');
      
      // Step 1: Update stock first
      console.log('📦 Step 1: Updating stock...');
      
      // Separate products and variants for different processing
      const mainProducts = [];
      const variantProducts = [];
      
      selectedProducts.forEach(product => {
        // Check if product is a variant by looking for variantInfo with documentId or isVariant flag
        if (product.variantInfo && (product.variantInfo.documentId || product.variantInfo.isVariant)) {
          console.log('📦 Variant product detected:', {
            productId: product.id,
            title: product.title,
            variantInfo: product.variantInfo,
            hasDocumentId: !!product.variantInfo.documentId,
            documentIdValue: product.variantInfo.documentId,
            isVariant: product.variantInfo.isVariant
          });
          variantProducts.push(product);
        } else {
          mainProducts.push(product);
        }
      });
      
      console.log('📦 Separated products:', {
        mainProducts: mainProducts.length,
        variantProducts: variantProducts.length
      });
      
      const allUpdateResults = [];
      
      // Process main products
      if (mainProducts.length > 0) {
        console.log('📦 Processing main products...');
        
        // Group main products by documentId
        const productGroups = mainProducts.reduce((groups, product) => {
          const documentId = product.documentId;
          if (!groups[documentId]) {
            groups[documentId] = [];
          }
          groups[documentId].push(product);
          return groups;
        }, {});

        // Process each main product group
        const mainProductPromises = Object.entries(productGroups).map(async ([documentId, products]) => {
          try {
            console.log('📦 Processing main product group:', {
              documentId,
              products: products.map(p => ({ id: p.id, size: p.selectedSize, quantity: p.quantity, title: p.title }))
            });

            // Fetch current product data
            const productResponse = await fetchDataFromApi(
              `/api/products?filters[documentId][$eq]=${documentId}&populate=*`
            );

            if (!productResponse?.data || productResponse.data.length === 0) {
              throw new Error(`Product not found: ${documentId}`);
            }

            const currentProduct = productResponse.data[0];
            console.log('📦 Current main product data:', {
              documentId: currentProduct.documentId,
              title: currentProduct.title,
              size_stocks: currentProduct.size_stocks
            });

            if (!currentProduct.size_stocks) {
              console.warn('📦 Main product has no size_stocks field:', currentProduct.title);
              return products.map(product => ({
                success: false,
                productTitle: product.title,
                size: product.selectedSize,
                error: 'No size_stocks field found',
                type: 'main_product'
              }));
            }

            // Parse size_stocks
            let sizeStocks;
            if (typeof currentProduct.size_stocks === 'string') {
              try {
                sizeStocks = JSON.parse(currentProduct.size_stocks);
              } catch (parseError) {
                console.error('📦 Failed to parse main product size_stocks:', parseError);
                return products.map(product => ({
                  success: false,
                  productTitle: product.title,
                  size: product.selectedSize,
                  error: 'Invalid size_stocks format',
                  type: 'main_product'
                }));
              }
            } else {
              sizeStocks = { ...currentProduct.size_stocks };
            }

            console.log('📦 Original main product size_stocks:', sizeStocks);

            // Update stock for all sizes
            const updateResults = [];
            const updatedSizeStocks = { ...sizeStocks };

            for (const product of products) {
              const selectedSize = product.selectedSize;
              
              if (!updatedSizeStocks.hasOwnProperty(selectedSize)) {
                console.warn('📦 Size not found in main product stock:', selectedSize);
                updateResults.push({
                  success: false,
                  productTitle: product.title,
                  size: selectedSize,
                  error: `Size ${selectedSize} not found in stock`,
                  type: 'main_product'
                });
                continue;
              }

              const currentStock = parseInt(updatedSizeStocks[selectedSize]) || 0;
              const quantityToDecrease = product.quantity || 1;
              console.log('📦 Processing main product size', selectedSize, '- Current stock:', currentStock, ', quantity to decrease:', quantityToDecrease);

              const newStock = Math.max(0, currentStock - quantityToDecrease);
              updatedSizeStocks[selectedSize] = newStock;

              updateResults.push({
                success: true,
                productTitle: product.title,
                size: selectedSize,
                oldStock: currentStock,
                newStock: newStock,
                quantityDecreased: quantityToDecrease,
                type: 'main_product'
              });
            }

            console.log('📦 Final updated main product size_stocks:', updatedSizeStocks);

            // Update the main product
            const updateResponse = await updateData(
              `/api/products/${currentProduct.documentId}`,
              {
                data: {
                  size_stocks: updatedSizeStocks
                }
              }
            );

            console.log('📦 Main product stock update response:', updateResponse);
            return updateResults;
            
          } catch (error) {
            console.error('📦 Error updating main product stock:', documentId, error);
            return products.map(product => ({
              success: false,
              productTitle: product.title,
              size: product.selectedSize,
              error: error.message,
              type: 'main_product'
            }));
          }
        });
        
        const mainProductResults = await Promise.all(mainProductPromises);
        allUpdateResults.push(...mainProductResults.flat());
      }
      
      // Process variant products
      if (variantProducts.length > 0) {
        console.log('📦 Processing variant products...');
        
        // Group variants by documentId (use documentId as the unique identifier)
        const variantGroups = variantProducts.reduce((groups, product) => {
          // Use documentId from variantInfo as the unique identifier for the variant
          const variantDocumentId = product.variantInfo.documentId;
          
          console.log('📦 Processing variant with ID:', {
            documentId: product.variantInfo.documentId,
            finalId: variantDocumentId,
            productTitle: product.title,
            isNumericId: !isNaN(parseInt(variantDocumentId))
          });
          console.log('📦 Grouping variant by documentId:', {
            variantDocumentId,
            variantInfo: product.variantInfo
          });
          if (!groups[variantDocumentId]) {
            groups[variantDocumentId] = [];
          }
          groups[variantDocumentId].push(product);
          return groups;
        }, {});

        // Process each variant group
        const variantPromises = Object.entries(variantGroups).map(async ([variantDocumentId, products]) => {
          try {
            console.log('📦 Processing variant group:', {
              variantDocumentId,
              products: products.map(p => ({ id: p.id, size: p.selectedSize, quantity: p.quantity, title: p.title }))
            });
            
            // Fetch current variant data
            console.log('📦 Fetching variant data for:', variantDocumentId);
            
            // If variantDocumentId is numeric, we need to fetch by ID first to get documentId
            let variantResponse;
            if (!isNaN(parseInt(variantDocumentId))) {
              console.log('📦 Using numeric ID to fetch variant:', variantDocumentId);
              variantResponse = await fetchDataFromApi(
                `/api/product-variants/${variantDocumentId}?populate=*`
              );
              // Convert single object response to array format for consistency
              if (variantResponse?.data && !Array.isArray(variantResponse.data)) {
                variantResponse.data = [variantResponse.data];
              }
            } else {
              console.log('📦 Using documentId to fetch variant:', variantDocumentId);
              variantResponse = await fetchDataFromApi(
                `/api/product-variants?filters[documentId][$eq]=${variantDocumentId}&populate=*`
              );
            }

            if (!variantResponse?.data || variantResponse.data.length === 0) {
              throw new Error(`Variant not found: ${variantDocumentId}`);
            }

            const currentVariant = variantResponse.data[0];
            console.log('📦 Current variant data:', {
              documentId: currentVariant.documentId,
              title: currentVariant.title || 'Variant',
              size_stocks: currentVariant.size_stocks
            });

            if (!currentVariant.size_stocks) {
              console.warn('📦 Variant has no size_stocks field:', variantDocumentId);
              return products.map(product => ({
                success: false,
                productTitle: product.title,
                size: product.selectedSize,
                error: 'No size_stocks field found in variant',
                type: 'variant'
              }));
            }

            // Parse variant size_stocks
            let variantSizeStocks;
            if (typeof currentVariant.size_stocks === 'string') {
              try {
                variantSizeStocks = JSON.parse(currentVariant.size_stocks);
              } catch (parseError) {
                console.error('📦 Failed to parse variant size_stocks:', parseError);
                return products.map(product => ({
                  success: false,
                  productTitle: product.title,
                  size: product.selectedSize,
                  error: 'Invalid variant size_stocks format',
                  type: 'variant'
                }));
              }
            } else {
              variantSizeStocks = { ...currentVariant.size_stocks };
            }

            console.log('📦 Original variant size_stocks:', variantSizeStocks);

            // Update variant stock for all sizes
            const updateResults = [];
            const updatedVariantSizeStocks = { ...variantSizeStocks };

            for (const product of products) {
              const selectedSize = product.selectedSize;
              
              if (!updatedVariantSizeStocks.hasOwnProperty(selectedSize)) {
                console.warn('📦 Size not found in variant stock:', selectedSize);
                updateResults.push({
                  success: false,
                  productTitle: product.title,
                  size: selectedSize,
                  error: `Size ${selectedSize} not found in variant stock`,
                  type: 'variant'
                });
                continue;
              }

              const currentStock = parseInt(updatedVariantSizeStocks[selectedSize]) || 0;
              const quantityToDecrease = product.quantity || 1;
              console.log('📦 Processing variant size', selectedSize, '- Current stock:', currentStock, ', quantity to decrease:', quantityToDecrease);

              const newStock = Math.max(0, currentStock - quantityToDecrease);
              updatedVariantSizeStocks[selectedSize] = newStock;

              updateResults.push({
                success: true,
                productTitle: product.title,
                size: selectedSize,
                oldStock: currentStock,
                newStock: newStock,
                quantityDecreased: quantityToDecrease,
                type: 'variant',
                variantId: variantDocumentId
              });
            }

            console.log('📦 Final updated variant size_stocks:', updatedVariantSizeStocks);

            // Update the variant
            const updateResponse = await updateData(
              `/api/product-variants/${currentVariant.documentId}`,
              {
                data: {
                  size_stocks: updatedVariantSizeStocks
                }
              }
            );

            console.log('📦 Variant stock update response:', updateResponse);
            return updateResults;
            
          } catch (error) {
            console.error('📦 Error updating variant stock:', variantDocumentId, error);
            return products.map(product => ({
              success: false,
              productTitle: product.title,
              size: product.selectedSize,
              error: error.message,
              type: 'variant'
            }));
          }
        });
        
        const variantResults = await Promise.all(variantPromises);
        allUpdateResults.push(...variantResults.flat());
      }
      
      console.log('📦 All stock updates completed. Results:', allUpdateResults);
      
      const successfulStockUpdates = allUpdateResults.filter(result => result.success);
      const failedStockUpdates = allUpdateResults.filter(result => !result.success);
      
      console.log('📦 Stock update summary:', {
        total: allUpdateResults.length,
        successful: successfulStockUpdates.length,
        failed: failedStockUpdates.length,
        mainProducts: allUpdateResults.filter(r => r.type === 'main_product').length,
        variants: allUpdateResults.filter(r => r.type === 'variant').length
      });

      // Step 2: Delete cart items
      console.log('🗑️ Step 2: Deleting cart items...');
      
      // Get user bag documentId
      const userBagDocumentId = await getUserBagDocumentId();
      
      if (!userBagDocumentId) {
        throw new Error('User bag not found');
      }

      console.log('🗑️ User bag documentId:', userBagDocumentId);

      // Get current user data with cart items
      const currentUserData = await fetchDataFromApi(
        `/api/user-data?filters[authUserId][$eq]=${user.id}&populate=user_bag.carts`
      );
      
      if (!currentUserData?.data || currentUserData.data.length === 0) {
        throw new Error('User data not found');
      }

      const userData = currentUserData.data[0];
      const cartItems = userData.user_bag?.carts || [];
      
      console.log('🗑️ Current cart items from backend:', cartItems.length);
      
      // Find cart items to delete
      const itemsToDelete = [];
      
      for (const selectedProduct of selectedProducts) {
        const frontendCartProduct = cartProducts.find(cp => cp.id === selectedProduct.id);
        
        if (!frontendCartProduct) {
          console.warn('⚠️ No frontend cart product found for selected product:', selectedProduct.id);
          continue;
        }
        
        // Find the backend cart item that matches this frontend product
        const matchingCartItem = cartItems.find(cartItem => {
          const sizeMatch = cartItem.size === frontendCartProduct.selectedSize;
          return sizeMatch;
        });

        if (matchingCartItem) {
          itemsToDelete.push({
            cartItemDocumentId: matchingCartItem.documentId,
            selectedProduct: selectedProduct,
            frontendProduct: frontendCartProduct
          });
          console.log('✅ Found cart item to delete:', {
            cartItemDocumentId: matchingCartItem.documentId,
            size: matchingCartItem.size
          });
        } else {
          console.warn('⚠️ No matching backend cart item found for:', {
            selectedProductId: selectedProduct.id,
            frontendProductSize: frontendCartProduct.selectedSize
          });
        }
      }

      console.log('🗑️ Items to delete:', itemsToDelete.length, itemsToDelete);

      if (itemsToDelete.length === 0) {
        console.warn('🗑️ No cart items found to delete');
      } else {
        // Delete cart items from backend
        const deletePromises = itemsToDelete.map(async (item) => {
          try {
            console.log('🗑️ Deleting cart item:', item.cartItemDocumentId);
            const deleteResponse = await deleteData(`/api/carts/${item.cartItemDocumentId}`);
            console.log('🗑️ Delete response for', item.cartItemDocumentId, ':', deleteResponse);
            return { success: true, cartItemDocumentId: item.cartItemDocumentId };
          } catch (error) {
            console.error('🗑️ Error deleting cart item:', item.cartItemDocumentId, error);
            return { success: false, cartItemDocumentId: item.cartItemDocumentId, error: error.message };
          }
        });

        const deleteResults = await Promise.all(deletePromises);
        console.log('🗑️ Delete results:', deleteResults);

        const successfulDeletes = deleteResults.filter(result => result.success);
        const failedDeletes = deleteResults.filter(result => !result.success);

        console.log('🗑️ Delete summary:', {
          total: deleteResults.length,
          successful: successfulDeletes.length,
          failed: failedDeletes.length
        });
      }

      // Step 3: Clear purchased items from cart context
      console.log('🔄 Step 3: Clearing items from cart context...');
      
      const purchasedProducts = selectedProducts.map(product => ({
        documentId: product.documentId,
        variantId: product.variantInfo?.documentId,
        selectedSize: product.selectedSize,
        quantity: product.quantity,
        title: product.title
      }));
      
      await clearPurchasedItemsFromCart(purchasedProducts);
      
      // Show success message
      const stockSuccessCount = successfulStockUpdates.length;
      const stockFailCount = failedStockUpdates.length;
      
      let message = `Operation completed!\n`;
      message += `✅ Stock updated for ${stockSuccessCount} item(s)\n`;
      if (stockFailCount > 0) {
        message += `❌ Stock update failed for ${stockFailCount} item(s)\n`;
      }
      message += `✅ Items removed from cart`;
      
      alert(message);
      
      console.log('🔄 Combined operation completed successfully');
      
    } catch (error) {
      console.error('🔄 Error in combined update and delete operation:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessingUpdateAndDelete(false);
    }
  };

  // Add state for receiverDetails
  const [receiverDetails, setReceiverDetails] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    countryCode: "",
    address: {
      addressLine1: "",
      cityName: "",
      countryCode: "",
      postalCode: ""
    }
  });

  // Debug: Log when productsWithOldPrice changes
  useEffect(() => {
    console.log('productsWithOldPrice updated:', productsWithOldPrice);
  }, [productsWithOldPrice]);



  // Function to get user's bag documentId
  const getUserBagDocumentId = async () => {
    if (!user?.id) return null;
    
    try {
      const currentUserData = await fetchDataFromApi(
        `/api/user-data?filters[authUserId][$eq]=${user.id}&populate=user_bag`
      );

      if (!currentUserData?.data || currentUserData.data.length === 0) {
        console.error("User data not found");
        return null;
      }

      const userData = currentUserData.data[0];
      const userBag = userData.user_bag;

      if (!userBag || !userBag.documentId) {
        console.error("User bag not found");
        return null;
      }

      return userBag.documentId;
    } catch (error) {
      console.error("Error getting user bag documentId:", error);
      return null;
    }
  };

  // Function to handle cash payment order
  const handleCashPaymentOrder = async () => {
    if (!user) {
      alert('Please log in to place an order');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('No products selected for checkout');
      return;
    }

    if (shippingCost === 0) {
      alert('Please get shipping rates first by filling out the shipping form and clicking "Get Shipping Rates"');
      return;
    }

    setIsProcessingOrder(true);

    try {
      const userBagDocumentId = await getUserBagDocumentId();
      
      if (!userBagDocumentId) {
        throw new Error('User bag not found');
      }

      // Map selected products to enhanced order format
      const products = selectedProducts.map(product => {
        const fetchedProduct = productsWithOldPrice[product.id];
        const unitPrice = parseFloat(product.price);
        const oldPrice = fetchedProduct?.oldPrice ? parseFloat(fetchedProduct.oldPrice) : unitPrice;
        const subtotal = oldPrice * product.quantity;
        const discount = oldPrice > unitPrice ? ((oldPrice - unitPrice) / oldPrice) * 100 : 0;
        const finalPrice = unitPrice * product.quantity;

        // Get the actual selected size and color from the product
        const availableSize = product.selectedSize || 
                            (product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M");
        const availableColor = product.selectedColor || 
                             (product.colors && product.colors.length > 0 
                               ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name || "default")
                               : "default");
        
        console.log(`📦 Processing product for order:`, {
          productId: product.id,
          documentId: product.documentId,
          title: product.title,
          selectedSize: availableSize,
          selectedColor: availableColor,
          variantInfo: product.variantInfo
        });

        return {
          // Basic Product Info
          productId: product.id,
          documentId: product.documentId,
          variantId: product.variantInfo?.documentId || null, // Add variant ID for matching
          title: product.title || product.name || "Product",
          description: product.description || fetchedProduct?.description || "",
          category: fetchedProduct?.category || product.category || "",
          collection: fetchedProduct?.collection || product.collection || "",
          brand: fetchedProduct?.brand || "Traditional Alley",
          sku: fetchedProduct?.sku || product.sku || `SKU-${product.documentId}`,
          
          // Size and variant info for cart matching
          selectedSize: availableSize,
          selectedColor: availableColor,
          
          // Variant Details
          selectedVariant: {
            size: availableSize,
            color: availableColor,
            variantSku: `${fetchedProduct?.sku || product.sku || `SKU-${product.documentId}`}-${availableSize}-${availableColor}`
          },
          
          // Pricing Details
          pricing: {
            originalPrice: oldPrice,
            currentPrice: unitPrice,
            discountPercentage: Math.round(discount),
            discountAmount: oldPrice - unitPrice,
            quantity: product.quantity,
            subtotal: subtotal,
            finalPrice: finalPrice
          },
          
          // Shipping & Package Details
          packageInfo: {
            weight: fetchedProduct?.weight || 1, // kg (now using parsed value from Strapi)
            dimensions: fetchedProduct?.dimensions || {
              length: 10, // cm (fallback if no parsed dimensions available)
              width: 10, // cm
              height: 10 // cm
            },
            declaredValue: unitPrice,
            commodityCode: fetchedProduct?.hsCode || "",
            manufacturingCountry: "Nepal",
            manufacturingCountryCode: "NP",
            productType: fetchedProduct?.productType || "General Merchandise",
            isFragile: fetchedProduct?.isFragile || false,
            requiresSpecialHandling: fetchedProduct?.requiresSpecialHandling || false
          },
          
          // Admin Reference
          adminNotes: {
            stockLocation: fetchedProduct?.stockLocation || "Main Warehouse",
            supplier: fetchedProduct?.supplier || "Traditional Alley",
            lastUpdated: fetchedProduct?.updatedAt || new Date().toISOString(),
            internalNotes: fetchedProduct?.internalNotes || ""
          }
        };
      });

      // Prepare comprehensive order data for admin use
      const orderData = {
        // Order Summary
        orderSummary: {
          totalItems: selectedProducts.reduce((sum, product) => sum + product.quantity, 0),
          totalProducts: selectedProducts.length,
          subtotal: actualTotal,
          shippingCost: shippingCost,
          totalAmount: actualTotal + shippingCost,
          currency: "NPR",
          orderDate: new Date().toISOString(),
          orderTimezone: "Asia/Kathmandu"
        },
        
        // Complete Product Details for Admin
        products: products,
        
        // Comprehensive Shipping Details for Admin
        shipping: {
          // Shipping Method & Cost
          method: {
            carrier: "Cash on Delivery", // COD carrier
            service: "COD Standard",
            estimatedDays: receiverDetails.address.country === "Nepal" ? "3-5" : "7-10",
            cost: shippingCost,
            currency: "NPR",
            trackingAvailable: false, // COD usually doesn't have tracking
            insuranceIncluded: false, // COD payment on delivery
            signatureRequired: true // Always required for COD
          },
          
          // Package Details for Shipping Label
          package: {
            totalWeight: selectedProducts.reduce((total, product) => {
              const fetchedProduct = productsWithOldPrice[product.id];
              return total + ((fetchedProduct?.weight || 1) * product.quantity); // Now using parsed weight from Strapi
            }, 0),
            totalVolume: selectedProducts.reduce((total, product) => {
              const fetchedProduct = productsWithOldPrice[product.id];
              // Use parsed dimensions object or fallback to 10x10x10
              const dimensions = fetchedProduct?.dimensions || { length: 10, width: 10, height: 10 };
              const volume = dimensions.length * dimensions.width * dimensions.height;
              return total + ((volume * product.quantity) / 1000000); // Convert cm³ to m³
            }, 0),
            packageType: "Box",
            packagingMaterial: "Cardboard Box with Bubble Wrap",
            specialInstructions: receiverDetails.note || "",
            declaredValue: actualTotal,
            contentDescription: `Traditional Alley Products - ${selectedProducts.length} items (COD)`,
            dangerousGoods: false,
            customsDeclaration: receiverDetails.address.country !== "Nepal"
          },
          
          // Admin Processing Info
          processing: {
            warehouseLocation: "Kathmandu Main Warehouse",
            expectedPackingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
            expectedShipDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
            priorityLevel: actualTotal > 20000 ? "High" : actualTotal > 10000 ? "Medium" : "Normal",
            packingInstructions: "Handle with care. Traditional items may be fragile. COD - Collect payment on delivery.",
            qualityCheckRequired: actualTotal > 15000,
            photographRequired: actualTotal > 25000, // Photo documentation for high-value orders
            adminAssigned: null, // To be assigned by admin
            packingNotes: "COD Order - Payment to be collected upon delivery",
            codAmount: actualTotal + shippingCost // Amount to collect
          }
        },
        
        // Legacy fields for backward compatibility
        shippingPrice: shippingCost,
        receiver_details: receiverDetails
      };

      // Create COD payment record
      const codPaymentData = {
        provider: "cod",
        merchantTxnId: `COD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: actualTotal + shippingCost,
        status: "Pending", // COD orders are pending until payment is received
        timestamp: new Date().toISOString(),
        orderData: orderData
      };

      // Save COD order to user bag
      await updateUserBagWithPayment(userBagDocumentId, codPaymentData);

      console.log('COD order saved:', codPaymentData);
      
      // Create individual order record in Strapi user_orders collection for COD
      console.log("=== CREATING COD ORDER RECORD IN STRAPI USER_ORDERS COLLECTION ===");
      
      try {
        const orderRecord = await createOrderRecord(codPaymentData, user?.id);
        if (orderRecord) {
          console.log("✅ COD Order record created successfully:", orderRecord.data?.documentId);
          console.log("COD Order details:", {
            orderId: orderRecord.data?.orderId,
            totalAmount: orderRecord.data?.totalAmount,
            productCount: orderRecord.data?.productSummary?.totalProducts,
            customerName: orderRecord.data?.customerInfo?.fullName,
            paymentMethod: "Cash on Delivery",
            codAmount: orderRecord.data?.processingInfo?.codAmount
          });
        } else {
          console.warn("⚠️ COD Order record creation returned null");
        }
      } catch (orderRecordError) {
        console.error("❌ Error creating COD order record:", orderRecordError);
        // Don't fail the entire process if order record creation fails
      }
      
      // Process post-payment stock update and cart clearing (same as "Update Stock & Delete" button)
      console.log("=== STARTING POST-PAYMENT PROCESSING FOR COD ORDER (STOCK UPDATE & CART CLEARING) ===");
      
      try {
        const purchasedProducts = orderData.products || [];
        console.log("Products to process:", purchasedProducts.length);
        
        if (purchasedProducts.length > 0) {
          // Use the same logic as the "Update Stock & Delete" button
          const processingResult = await processPostPaymentStockAndCart(
            purchasedProducts, 
            user, 
            clearPurchasedItemsFromCart
          );
          
          console.log("✅ Post-payment processing completed for COD:", {
            totalProducts: processingResult.totalProducts,
            stockUpdate: {
              success: processingResult.stockUpdate.success,
              successCount: processingResult.stockUpdate.successCount,
              failureCount: processingResult.stockUpdate.failureCount
            },
            cartClear: {
              success: processingResult.cartClear.success
            }
          });
          
          // Log results for admin visibility
          if (processingResult.stockUpdate.success && processingResult.cartClear.success) {
            console.log(`✅ COD Order: Stock updated for ${processingResult.stockUpdate.successCount} products and cart cleared`);
          } else if (processingResult.stockUpdate.success) {
            console.log(`✅ COD Order: Stock updated but cart clearing ${processingResult.cartClear.success ? 'succeeded' : 'failed'}`);
          } else if (processingResult.cartClear.success) {
            console.log(`⚠️ COD Order: Cart cleared but ${processingResult.stockUpdate.failureCount} stock updates failed`);
          } else {
            console.log(`⚠️ COD Order: Post-payment processing completed with issues`);
          }
          
        } else {
          console.log("⚠️ No products found in order data for post-payment processing");
        }
      } catch (processingError) {
        console.error("❌ Error in post-payment processing for COD:", processingError);
        // Don't fail the entire process if post-payment processing fails
      }
      
      setOrderSuccess(true);
      
      alert('Order placed successfully! Admin will create your DHL shipment and provide tracking details.');
      
    } catch (error) {
      console.error('Error processing cash payment order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessingOrder(false);
    }
  };





  // Fetch product details when selectedProducts change
  useEffect(() => {
    if (selectedProducts.length === 0 || isLoadingProductDetails) return;
    
    setIsLoadingProductDetails(true);
    
    async function fetchProductDetails() {
      try {
        const updatedProducts = {};
        
        const promises = selectedProducts.map(async (product) => {
          if (!product.documentId) return null;
          
          try {
            const productEndpoint = `/api/products?filters[documentId][$eq]=${product.documentId}`;
            console.log('Fetching product details from:', productEndpoint);
            const response = await fetchDataFromApi(productEndpoint);
            console.log('Product API response:', response);
            if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
              const productData = response.data[0];
              console.log('Product data found:', productData);
              // Parse weight from string to number (e.g., "1.5 kg" -> 1.5)
              let parsedWeight = null;
              if (productData.weight) {
                const weightMatch = productData.weight.toString().match(/([0-9.]+)/);
                parsedWeight = weightMatch ? parseFloat(weightMatch[1]) : 1; // Default to 1kg if can't parse
              }
              
              // Parse dimensions from string to object (e.g., "30x20x10 cm" -> {length: 30, width: 20, height: 10})
              let parsedDimensions = null;
              if (productData.dimensions) {
                const dimensionsMatch = productData.dimensions.toString().match(/([0-9.]+)\s*[x×]\s*([0-9.]+)\s*[x×]\s*([0-9.]+)/);
                if (dimensionsMatch) {
                  parsedDimensions = {
                    length: parseFloat(dimensionsMatch[1]),
                    width: parseFloat(dimensionsMatch[2]),
                    height: parseFloat(dimensionsMatch[3])
                  };
                } else {
                  // Fallback: try to extract single number and assume cubic
                  const singleDimMatch = productData.dimensions.toString().match(/([0-9.]+)/);
                  const dim = singleDimMatch ? parseFloat(singleDimMatch[1]) : 10; // Default to 10cm if can't parse
                  parsedDimensions = {
                    length: dim,
                    width: dim,
                    height: dim
                  };
                }
              }
              
              return {
                id: product.id,
                data: {
                  ...product,
                  oldPrice: productData.oldPrice ? parseFloat(productData.oldPrice) : null,
                  weight: parsedWeight,
                  dimensions: parsedDimensions,
                  hsCode: productData.hsCode || null,
                  // Keep original string values for reference
                  originalWeight: productData.weight,
                  originalDimensions: productData.dimensions
                }
              };
            }
            return null;
          } catch (error) {
            console.warn(`Failed to fetch details for product ${product.documentId}:`, error);
            return null;
          }
        });
        
        const results = await Promise.all(promises);
        console.log('All product fetch results:', results);
        
        // Process results without isMounted check
        console.log('Processing results...');
        results.forEach((result, index) => {
          console.log(`Processing result ${index}:`, result);
          if (result) {
            console.log(`Adding product ${result.id} to updatedProducts`);
            updatedProducts[result.id] = result.data;
          } else {
            console.log(`Result ${index} is null/undefined`);
          }
        });
        
        console.log('Updated products to set:', updatedProducts);
        console.log('Object.keys(updatedProducts):', Object.keys(updatedProducts));
        
        setProductsWithOldPrice(prev => {
          // Only update if there are actual changes
          const hasChanges = Object.keys(updatedProducts).some(
            id => !prev[id] || 
                 prev[id].oldPrice !== updatedProducts[id].oldPrice ||
                 prev[id].weight !== updatedProducts[id].weight ||
                 prev[id].dimensions !== updatedProducts[id].dimensions ||
                 prev[id].hsCode !== updatedProducts[id].hsCode
          );
          
          console.log('Has changes:', hasChanges);
          console.log('Previous state:', prev);
          console.log('New state will be:', hasChanges ? { ...prev, ...updatedProducts } : prev);
          
          return hasChanges ? { ...prev, ...updatedProducts } : prev;
        });
        
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setIsLoadingProductDetails(false);
      }
    }
    
    fetchProductDetails();
  }, [selectedProducts.length, selectedProducts.map(p => p.documentId).join(',')]); // Simpler, more stable dependency

  // Calculate subtotal: sum of oldPrice (if available) or price, times quantity
  const subtotal = selectedProducts.reduce((acc, product) => {
    const fetchedProduct = productsWithOldPrice[product.id];
    const priceToUse = fetchedProduct?.oldPrice ? parseFloat(fetchedProduct.oldPrice) : parseFloat(product.price);
    return acc + priceToUse * product.quantity;
  }, 0);

  // Calculate actual total: sum of price * quantity
  const actualTotal = selectedProducts.reduce((acc, product) => acc + parseFloat(product.price) * product.quantity, 0);

  // Helper function to calculate NPR amount for NPS payments
  const calculateNPRAmount = async (usdAmount) => {
    try {
      const rate = nprExchangeRate || await getExchangeRate();
      if (!nprExchangeRate) {
        setNprExchangeRate(rate);
      }
      return convertUsdToNpr(usdAmount, rate);
    } catch (error) {
      console.error('Failed to get exchange rate:', error);
      const fallbackRate = 134.5;
      return convertUsdToNpr(usdAmount, fallbackRate);
    }
  };

  // Calculate NPR amount for display
  const nprAmount = React.useMemo(() => {
    if (nprExchangeRate) {
      // Product total needs conversion from USD to NPR
      const productTotalNPR = convertUsdToNpr(actualTotal, nprExchangeRate);
      // Shipping cost is already in NPR, so add directly
      return productTotalNPR + shippingCost;
    }
    return actualTotal + shippingCost; // Fallback to USD if no rate available
  }, [actualTotal, shippingCost, nprExchangeRate]);

  // Effect to fetch exchange rate
  React.useEffect(() => {
    const fetchRate = async () => {
      try {
        const rate = await getExchangeRate();
        setNprExchangeRate(rate);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setNprExchangeRate(134.5); // Fallback rate
      }
    };
    
    if (!nprExchangeRate) {
      fetchRate();
    }
  }, []);

  // Calculate total discounts: subtotal - actualTotal (if positive)
  const totalDiscounts = subtotal > actualTotal ? Math.round((subtotal - actualTotal) * 100) / 100 : 0;

  // Check if cart is empty
  if (selectedProducts.length === 0) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <div className="empty-cart p-5">
                <h3 className="mb-3">No items selected for checkout</h3>
                <p className="mb-4">Please go back to your cart and select items to checkout.</p>
                <Link href="/shopping-cart" className="tf-btn">
                  <span className="text">Return to Cart</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container">
        <div className="row">
          <div className="col-xl-6">
            <div className="flat-spacing tf-page-checkout">
              <div className="wrap">
                {/* <div className="title-login">
                  <p>Already have an account?</p>{" "}
                  <Link href={`/login`} className="text-button">
                    Login here
                  </Link>
                </div>
                <form
                  className="login-box"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="grid-2">
                    <input type="text" placeholder="Your name/Email" />
                    <input type="password" placeholder="Password" />
                  </div>
                  <button className="tf-btn" type="submit">
                    <span className="text">Login</span>
                  </button>
                </form> */}
              </div>
              <div className="wrap">
                <h5 className="title">🚀 DHL Express Shipping</h5>
                <DHLShippingForm 
                  isCheckoutMode={true}
                  initialPackages={selectedProducts.reduce((acc, product) => {
                    const fetchedProduct = productsWithOldPrice[product.id];
                    
                    // Get weight and dimensions from either fetched data or original product data
                    const productData = fetchedProduct || product;
                    const weight = productData.weight || (productData.product && productData.product.weight);
                    const dimensions = productData.dimensions || (productData.product && productData.product.dimensions);
                    const hsCode = productData.hsCode || (productData.product && productData.product.hsCode);
                    
                    // Parse dimensions - handle both parsed object and string formats
                    let length = 10, width = 10, height = 10;
                    if (dimensions) {
                      // If dimensions is already a parsed object (from fetchProductDetails)
                      if (typeof dimensions === 'object' && dimensions.length && dimensions.width && dimensions.height) {
                        length = dimensions.length;
                        width = dimensions.width;
                        height = dimensions.height;
                      }
                      // If dimensions is still a string, parse it
                      else if (typeof dimensions === 'string') {
                        const dimensionMatch = dimensions.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
                        if (dimensionMatch) {
                          length = parseFloat(dimensionMatch[1]) || 10;
                          width = parseFloat(dimensionMatch[2]) || 10;
                          height = parseFloat(dimensionMatch[3]) || 10;
                        }
                      }
                    }
                    
                    // Parse weight - handle both parsed numeric and string formats
                    let parsedWeight = 1;
                    if (weight) {
                      // If weight is already a parsed number (from fetchProductDetails)
                      if (typeof weight === 'number') {
                        parsedWeight = weight;
                      }
                      // If weight is still a string, parse it
                      else {
                        const weightMatch = weight.toString().match(/(\d+(?:\.\d+)?)/);
                        if (weightMatch) {
                          let weightValue = parseFloat(weightMatch[1]);
                          if (weight.toString().toLowerCase().includes('g') && !weight.toString().toLowerCase().includes('kg')) {
                            weightValue = weightValue / 1000;
                          }
                          parsedWeight = weightValue || 1;
                        }
                      }
                    }

                    const productQuantity = product.quantity || 1;

                    // Create a separate package for each quantity
                    for (let i = 0; i < productQuantity; i++) {
                      const packageData = {
                        weight: parsedWeight,
                        length: length,
                        width: width,
                        height: height,
                        description: product.title || (product.product && product.product.title) || 'Product',
                        declaredValue: parseFloat(product.price) || (product.product && parseFloat(product.product.price)) || 0,
                        quantity: 1, // Each package is now a single item
                        commodityCode: hsCode || '', // Use the product's HS code
                        manufacturingCountryCode: 'NP'
                      };
                      acc.push(packageData);
                    }
                    
                    return acc;
                  }, [])}
                  onRateCalculated={(rateInfo) => {
                    console.log('Rate calculated:', rateInfo);
                    setShippingCost(rateInfo.price);
                  }}
                  onReceiverChange={setReceiverDetails}
                />
              </div>
              <div className="wrap">
                {/* Discount Coupons Section */}
                <div className="discount-section" style={{ marginTop: '40px', marginBottom: '20px', borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
                  <h5 className="title" style={{ marginBottom: '15px' }}>Discount Coupons</h5>
                <div className="sec-discount">
                  <Swiper
                    dir="ltr"
                    className="swiper tf-sw-categories"
                    slidesPerView={2.25} // data-preview="2.25"
                    breakpoints={{
                      1024: {
                        slidesPerView: 2.25, // data-tablet={3}
                      },
                      768: {
                        slidesPerView: 3, // data-tablet={3}
                      },
                      640: {
                        slidesPerView: 2.5, // data-mobile-sm="2.5"
                      },
                      0: {
                        slidesPerView: 1.2, // data-mobile="1.2"
                      },
                    }}
                    spaceBetween={20}
                  >
                    {discounts.map((item, index) => (
                      <SwiperSlide key={index}>
                        <div
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
                        </div>{" "}
                      </SwiperSlide>
                    ))}
                  </Swiper>
                    <div className="ip-discount-code" style={{ marginTop: '15px', marginBottom: '10px' }}>
                      <input type="text" placeholder="Add voucher discount" style={{ borderRadius: '4px', borderColor: '#ddd' }} />
                      <button className="tf-btn" style={{ marginLeft: '10px' }}>
                      <span className="text">Apply Code</span>
                    </button>
                  </div>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                    Discount code is only used for orders with a total value of
                    products over $500.00
                  </p>
                </div>
                  
                  {/* Order Summary */}
                  <div className="order-summary-section" style={{ marginTop: '30px', marginBottom: '20px', borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
                    <h5 className="title" style={{ marginBottom: '15px' }}>Order Summary</h5>
                <div className="sec-total-price">
                  <div className="top">
                        <div className="item d-flex align-items-center justify-content-between text-button" style={{ marginBottom: '10px' }}>
                          <span>Subtotal</span>
                          <span>
                            <PriceDisplay 
                              price={subtotal}
                              className="text-button"
                              size="normal"
                            />
                          </span>
                        </div>
                        {totalDiscounts > 0.01 && (
                          <div className="item d-flex align-items-center justify-content-between text-button" style={{ marginBottom: '10px' }}>
                            <span>Total Discounts</span>
                            <span style={{ color: '#28a745' }}>
                              <PriceDisplay 
                                price={-totalDiscounts}
                                className="text-button"
                                size="normal"
                              />
                            </span>
                          </div>
                        )}
                        <div className="item d-flex align-items-center justify-content-between text-button" style={{ marginBottom: '10px' }}>
                          <span>Total (Without Shipping Charges)</span>
                          <span>
                            <PriceDisplay 
                              price={actualTotal}
                              className="text-button"
                              size="normal"
                            />
                          </span>
                        </div>
                        <div className="item d-flex align-items-center justify-content-between text-button" style={{ marginBottom: '10px' }}>
                      <span>Shipping</span>
                      <span>
                        {shippingCost > 0 ? (
                          <PriceDisplay 
                            price={shippingCost}
                            className="text-button"
                            size="normal"
                            isNPR={true}
                          />
                        ) : (
                          'Get Shipping Rates'
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="bottom">
                    <h5 className="d-flex justify-content-between">
                          <span>Grand Total</span>
                      <span className="total-price-checkout">
                        {userCurrency === 'NPR' ? (
                          <PriceDisplay 
                            price={nprAmount}
                            className="text-button"
                            size="large"
                            isNPR={true}
                          />
                        ) : (
                          <PriceDisplay 
                            price={actualTotal + (shippingCost / (nprExchangeRate || 134.5))}
                            className="text-button"
                            size="large"
                          />
                        )}
                      </span>
                    </h5>
                  </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="wrap">
                <h5 className="title">Choose payment Option:</h5>
                <form
                  className="form-payment"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="payment-box" id="payment-box">
                    <div className="payment-item">
                      <label
                        htmlFor="delivery-method"
                        className="payment-header"
                        data-bs-toggle="collapse"
                        data-bs-target="#delivery-payment"
                        aria-controls="delivery-payment"
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          className="tf-check-rounded"
                          id="delivery-method"
                          checked={selectedPaymentMethod === 'cod'}
                          onChange={() => setSelectedPaymentMethod('cod')}
                        />
                        <span className="text-title">Cash on delivery</span>
                      </label>
                      <div
                        id="delivery-payment"
                        className="collapse show"
                        data-bs-parent="#payment-box"
                      />
                    </div>
                    <div className="payment-item">
                      <label
                        htmlFor="nps-method"
                        className="payment-header"
                        data-bs-toggle="collapse"
                        data-bs-target="#nps-payment"
                        aria-controls="nps-payment"
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          className="tf-check-rounded"
                          id="nps-method"
                          checked={selectedPaymentMethod === 'nps'}
                          onChange={() => setSelectedPaymentMethod('nps')}
                        />
                        <span className="text-title">Pay with NPS (NPR)</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Payment button container with fixed height to prevent jumping */}
                  <div style={{ marginTop: '20px', minHeight: '45px' }}>
                    {selectedPaymentMethod === 'nps' && (
                      nprExchangeRate ? (
                        <NPSPaymentForm 
                          amount={nprAmount}
                          onSuccess={(response) => {
                            console.log('NPS Payment Success:', response);
                            // Handle successful payment
                            if (response.success) {
                              // You can redirect to payment gateway or handle the response
                              if (response.data?.redirectUrl && response.data?.redirectForm) {
                                // Create and submit form to redirect to NPS gateway
                                const form = document.createElement('form');
                                form.method = 'POST';
                                form.action = response.data.redirectUrl;
                                
                                Object.entries(response.data.redirectForm).forEach(([key, value]) => {
                                  if (value) {
                                    const input = document.createElement('input');
                                    input.type = 'hidden';
                                    input.name = key;
                                    input.value = value;
                                    form.appendChild(input);
                                  }
                                });
                                
                                document.body.appendChild(form);
                                form.submit();
                              }
                            }
                          }}
                          onError={(error) => {
                            console.error('NPS Payment Error:', error);
                            alert(`Payment failed: ${error.message || 'Unknown error'}`);
                          }}
                          orderData={{
                            // Order Summary
                            orderSummary: {
                              totalItems: selectedProducts.reduce((sum, product) => sum + product.quantity, 0),
                              totalProducts: selectedProducts.length,
                              subtotal: actualTotal,
                              shippingCost: shippingCost,
                              totalAmount: actualTotal + shippingCost,
                              currency: "NPR",
                              orderDate: new Date().toISOString(),
                              orderTimezone: "Asia/Kathmandu"
                            },
                             
                            // Complete Product Details for Admin
                            products: selectedProducts.map(product => {
                              const fetchedProduct = productsWithOldPrice[product.id];
                              const unitPrice = parseFloat(product.price);
                              const oldPrice = fetchedProduct?.oldPrice ? parseFloat(fetchedProduct.oldPrice) : unitPrice;
                              const subtotal = oldPrice * product.quantity;
                              const discount = oldPrice > unitPrice ? ((oldPrice - unitPrice) / oldPrice) * 100 : 0;
                              const finalPrice = unitPrice * product.quantity;
                              const availableSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M";
                              const availableColor = product.colors && product.colors.length > 0 
                                ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name || "default")
                                : "default";
                               
                              return {
                                // Basic Product Info
                                productId: product.id,
                                documentId: product.documentId,
                                title: product.title || product.name || "Product",
                                description: product.description || fetchedProduct?.description || "",
                                category: fetchedProduct?.category || product.category || "",
                                collection: fetchedProduct?.collection || product.collection || "",
                                brand: fetchedProduct?.brand || "Traditional Alley",
                                sku: fetchedProduct?.sku || product.sku || `SKU-${product.documentId}`,
                                 
                                // Variant Details
                                selectedVariant: {
                                  size: availableSize,
                                  color: availableColor,
                                  variantSku: `${fetchedProduct?.sku || product.sku || `SKU-${product.documentId}`}-${availableSize}-${availableColor}`
                                },
                                 
                                // Pricing Details
                                pricing: {
                                  originalPrice: oldPrice,
                                  currentPrice: unitPrice,
                                  discountPercentage: Math.round(discount),
                                  discountAmount: oldPrice - unitPrice,
                                  quantity: product.quantity,
                                  subtotal: subtotal,
                                  finalPrice: finalPrice
                                },
                                 
                                // Shipping & Package Details
                                packageInfo: {
                                  weight: fetchedProduct?.weight || 1, // kg (now using parsed value from Strapi)
                                  dimensions: fetchedProduct?.dimensions || {
                                    length: 10, // cm (fallback if no parsed dimensions available)
                                    width: 10, // cm
                                    height: 10 // cm
                                  },
                                  declaredValue: unitPrice,
                                  commodityCode: fetchedProduct?.hsCode || "",
                                  manufacturingCountry: "Nepal",
                                  manufacturingCountryCode: "NP",
                                  productType: fetchedProduct?.productType || "General Merchandise",
                                  isFragile: fetchedProduct?.isFragile || false,
                                  requiresSpecialHandling: fetchedProduct?.requiresSpecialHandling || false
                                },
                                 
                                // Admin Reference
                                adminNotes: {
                                  stockLocation: fetchedProduct?.stockLocation || "Main Warehouse",
                                  supplier: fetchedProduct?.supplier || "Traditional Alley",
                                  lastUpdated: fetchedProduct?.updatedAt || new Date().toISOString(),
                                  internalNotes: fetchedProduct?.internalNotes || ""
                                }
                              };
                            }),
                             
                            // Comprehensive Shipping Details for Admin
                            shipping: {
                              // Shipping Method & Cost
                              method: {
                                carrier: "DHL Express", // Default carrier
                                service: receiverDetails.address.country === "Nepal" ? "Domestic Standard" : "International Express",
                                estimatedDays: receiverDetails.address.country === "Nepal" ? "2-3" : "5-7",
                                cost: shippingCost,
                                currency: "NPR",
                                trackingAvailable: true,
                                insuranceIncluded: actualTotal > 5000, // Insurance for orders > NPR 5000
                                signatureRequired: actualTotal > 10000 // Signature for orders > NPR 10000
                              },
                               
                              // Package Details for Shipping Label
                              package: {
                                totalWeight: selectedProducts.reduce((total, product) => {
                                  const fetchedProduct = productsWithOldPrice[product.id];
                                  return total + ((fetchedProduct?.weight || 1) * product.quantity);
                                }, 0),
                                totalVolume: selectedProducts.reduce((total, product) => {
                                  const fetchedProduct = productsWithOldPrice[product.id];
                                  // Use parsed dimensions object or fallback to 10x10x10
                                  const dimensions = fetchedProduct?.dimensions || { length: 10, width: 10, height: 10 };
                                  const volume = dimensions.length * dimensions.width * dimensions.height;
                                  return total + ((volume * product.quantity) / 1000000); // Convert cm³ to m³
                                }, 0),
                                packageType: "Box",
                                packagingMaterial: "Cardboard Box with Bubble Wrap",
                                specialInstructions: receiverDetails.note || "",
                                declaredValue: actualTotal,
                                contentDescription: `Traditional Alley Products - ${selectedProducts.length} items`,
                                dangerousGoods: false,
                                customsDeclaration: receiverDetails.address.country !== "Nepal"
                              },
                               
                              // Admin Processing Info
                              processing: {
                                warehouseLocation: "Kathmandu Main Warehouse",
                                expectedPackingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
                                expectedShipDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
                                priorityLevel: actualTotal > 20000 ? "High" : actualTotal > 10000 ? "Medium" : "Normal",
                                packingInstructions: "Handle with care. Traditional items may be fragile.",
                                qualityCheckRequired: actualTotal > 15000,
                                photographRequired: actualTotal > 25000, // Photo documentation for high-value orders
                                adminAssigned: null, // To be assigned by admin
                                packingNotes: ""
                              }
                            },
                             
                            // Legacy fields for backward compatibility
                            shippingPrice: shippingCost,
                            receiver_details: receiverDetails
                          }}
                          transactionRemarks={`Checkout Order - ${selectedProducts.length} items`}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <p>Loading payment information...</p>
                        </div>
                      )
                    )}
                    {selectedPaymentMethod === 'cod' && (
                      <button 
                        className="tf-btn btn-reset"
                        onClick={handleCashPaymentOrder}
                        disabled={isProcessingOrder}
                      >
                        {isProcessingOrder ? 'Processing Order...' : 'Place Order (Cash on Delivery)'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-xl-1">
            <div className="line-separation" />
          </div>
          <div className="col-xl-5">
            <div className="flat-spacing flat-sidebar-checkout">
              <div className="sidebar-checkout-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h5 className="title" style={{ 
                    position: 'relative',
                    display: 'inline-block',
                    marginBottom: '0',
                    background: 'linear-gradient(90deg, #25D366 0%, #181818 100%)',
                    color: 'white',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    Shopping Cart
                  </h5>
                  
                  {/* Combined Update Stock & Delete Button */}
                  {selectedProducts.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <button
                        onClick={handleUpdateStockAndDelete}
                        disabled={isProcessingUpdateAndDelete}
                        style={{
                          background: isProcessingUpdateAndDelete ? '#ccc' : 'linear-gradient(90deg, #6f42c1 0%, #e83e8c 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: isProcessingUpdateAndDelete ? 'not-allowed' : 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          width: '100%',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          if (!isProcessingUpdateAndDelete) {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isProcessingUpdateAndDelete) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                          }
                        }}
                      >
                        {isProcessingUpdateAndDelete ? (
                          <>
                            <span>⏳</span>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>🔄</span>
                            <span>Update Stock & Delete ({selectedProducts.length})</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className="checkout-summary-vertical" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <div className="d-flex align-items-center justify-content-between text-button">
                    <span>Selected Items</span>
                    <span>{selectedProducts.length}</span>
                  </div>
                </div>
                <div className="list-product">
                  {selectedProducts.map((elm, i) => (
                    <div key={i} className="item-product">
                      <Link
                        href={`/product-detail/${elm.id}`}
                        className="img-product"
                      >
                        <Image
                          alt="img-product"
                          src={getThumbnailImageUrl(elm.imgSrc)}
                          width={600}
                          height={800}
                        />
                      </Link>
                      <div className="content-box">
                        <div className="info">
                          <Link
                            href={`/product-detail/${elm.id}`}
                            className="name-product link text-title"
                          >
                            {elm.title}
                          </Link>
                          <div className="variant text-caption-1 text-secondary">
                            {elm.selectedSize && (
                              <span className="size">{elm.selectedSize}</span>
                            )}
                            {elm.selectedSize && elm.variantInfo && elm.variantInfo.isVariant && (
                              <span>/</span>
                            )}
                            {elm.variantInfo && elm.variantInfo.isVariant && (
                              <span className="color">{elm.variantInfo.title}</span>
                            )}
                          </div>
                        </div>
                        <div className="total-price text-button">
                          <span className="count">{elm.quantity}</span>X
                          <span className="price">
                            <PriceDisplay 
                              price={elm.price}
                              className="text-button"
                              size="small"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
