"use client";

import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import NPSPaymentForm from "../payments/NPSPaymentForm";
import DHLShippingForm from "../shipping/DHLShippingForm";
import { fetchDataFromApi, updateData, updateUserBagWithPayment } from "@/utils/api";
import { useSession } from "next-auth/react";
import PriceDisplay from "@/components/common/PriceDisplay";
import { convertUsdToNpr, getExchangeRate } from "@/utils/currency";

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
        `/api/user-datas?filters[authUserId][$eq]=${user.id}&populate=user_bag`
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

      // Prepare product order details
      const products = selectedProducts.map(product => {
        const fetchedProduct = productsWithOldPrice[product.id];
        const unitPrice = parseFloat(product.price);
        const oldPrice = fetchedProduct?.oldPrice ? parseFloat(fetchedProduct.oldPrice) : unitPrice;
        const subtotal = oldPrice * product.quantity;
        const discount = oldPrice > unitPrice ? ((oldPrice - unitPrice) / oldPrice) * 100 : 0;
        const finalPrice = unitPrice * product.quantity;

        // Get size and color from product's available options
        const availableSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M";
        const availableColor = product.colors && product.colors.length > 0 
          ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name || "default")
          : "default";

        return {
          size: availableSize,
          color: availableColor,
          discount: Math.round(discount),
          quantity: product.quantity,
          subtotal: subtotal,
          unitPrice: unitPrice,
          documentId: product.documentId,
          finalPrice: finalPrice,
          // DHL package fields
          weight: fetchedProduct?.weight || 1, // Default weight 1kg
          length: fetchedProduct?.dimensions?.length || 10, // Default dimensions
          width: fetchedProduct?.dimensions?.width || 10,
          height: fetchedProduct?.dimensions?.height || 10,
          description: product.title || product.name || "Product",
          declaredValue: unitPrice,
          commodityCode: fetchedProduct?.hsCode || "",
          manufacturingCountryCode: "NP" // Nepal
        };
      });

      // Prepare order data (removed orderStatus and paymentMethod as they're redundant with the main payment object)
      const orderData = {
        products: products,
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
      
      setOrderSuccess(true);
      
      // Clear only the purchased items from cart after successful cash on delivery order
      console.log("=== ATTEMPTING TO CLEAR PURCHASED ITEMS FROM CART AFTER COD ORDER ===");
      console.log("User ID:", user?.id);
      console.log("ClearPurchasedItemsFromCart function available:", typeof clearPurchasedItemsFromCart);
      console.log("Order data products:", orderData.products);
      
      try {
        // Extract the purchased products from the order data
        const purchasedProducts = orderData.products || [];
        console.log("Purchased products to remove from cart:", purchasedProducts.length);
        
        if (purchasedProducts.length > 0) {
          await clearPurchasedItemsFromCart(purchasedProducts);
          console.log("✅ Purchased items cleared successfully from cart after COD order");
        } else {
          console.log("⚠️ No purchased products found in order data");
        }
      } catch (cartError) {
        console.error("❌ Error clearing purchased items from cart after COD order:", cartError);
        // Don't fail the entire process if cart clearing fails
      }
      
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
              return {
                id: product.id,
                data: {
                  ...product,
                  oldPrice: productData.oldPrice ? parseFloat(productData.oldPrice) : null,
                  weight: productData.weight || null,
                  dimensions: productData.dimensions || null,
                  hsCode: productData.hsCode || null
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
                    
                    // Parse dimensions
                    let length = 10, width = 10, height = 10;
                    if (dimensions) {
                      const dimensionMatch = dimensions.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
                      if (dimensionMatch) {
                        length = parseFloat(dimensionMatch[1]) || 10;
                        width = parseFloat(dimensionMatch[2]) || 10;
                        height = parseFloat(dimensionMatch[3]) || 10;
                      }
                    }
                    
                    // Parse weight
                    let parsedWeight = 1;
                    if (weight) {
                      const weightMatch = weight.toString().match(/(\d+(?:\.\d+)?)/);
                      if (weightMatch) {
                        let weightValue = parseFloat(weightMatch[1]);
                        if (weight.toString().toLowerCase().includes('g') && !weight.toString().toLowerCase().includes('kg')) {
                          weightValue = weightValue / 1000;
                        }
                        parsedWeight = weightValue || 1;
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
                          product={{ id: "checkout", name: "Checkout Order", price: nprAmount }} 
                          orderData={{
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
                                size: availableSize,
                                color: availableColor,
                                discount: Math.round(discount),
                                quantity: product.quantity,
                                subtotal: subtotal,
                                unitPrice: unitPrice,
                                documentId: product.documentId,
                                finalPrice: finalPrice,
                                // DHL package fields
                                weight: fetchedProduct?.weight || 1, // Default weight 1kg
                                length: fetchedProduct?.dimensions?.length || 10, // Default dimensions
                                width: fetchedProduct?.dimensions?.width || 10,
                                height: fetchedProduct?.dimensions?.height || 10,
                                description: product.title || product.name || "Product",
                                declaredValue: unitPrice,
                                commodityCode: fetchedProduct?.hsCode || "",
                                manufacturingCountryCode: "NP" // Nepal
                              };
                            }),
                            shippingPrice: shippingCost,
                            receiver_details: receiverDetails
                          }}
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
                <h5 className="title" style={{ 
                  position: 'relative',
                  display: 'inline-block',
                  marginBottom: '25px',
                  background: 'linear-gradient(90deg, #25D366 0%, #181818 100%)',
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Shopping Cart
                </h5>
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
                          src={elm.imgSrc}
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
                            <span className="size">XL</span>/
                            <span className="color">Blue</span>
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
