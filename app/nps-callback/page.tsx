"use client";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, Suspense, useState, useRef } from "react";
import { fetchDataFromApi, updateUserBagWithPayment, updateProductStock, updateData, deleteData } from "@/utils/api";
import { processPostPaymentStockAndCart } from "@/utils/postPaymentProcessing";
const { generateLocalTimestamp } = require("@/utils/timezone");
import type { NPSPaymentData } from "@/types/nps";
import { useContextElement } from "@/context/Context";

// Wrapper component that uses searchParams
const NPSCallbackContent = () => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user;
  const { clearPurchasedItemsFromCart, cartProducts, selectedCartItems } = useContextElement();
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingStatus, setProcessingStatus] = useState("🔍 Initializing payment verification...");
  const [isProcessingCoupon, setIsProcessingCoupon] = useState(false);
  const processingRef = useRef<number | null>(null);
  const autoUpdateProcessingRef = useRef<number | null>(null);
  const autoUpdateCompletedRef = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isProcessingCoupon) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isProcessingCoupon]);

  // Production-safe automatic stock update and cart cleanup using CURRENT cart data with comprehensive debug logging
  const handleAutomaticUpdateStockAndDelete = async (user: any, clearPurchasedItemsFromCart: any, paymentData?: any) => {
    if (autoUpdateCompletedRef.current) {
      console.log("🚫 Auto-update already completed, skipping");
      return true;
    }

    // Timestamp-based lock that automatically expires after 30 seconds
    const now = Date.now();
    const lockExpiry = 30000; // 30 seconds

    if (autoUpdateProcessingRef.current && (now - autoUpdateProcessingRef.current < lockExpiry)) {
      console.log(`🚫 Auto-update already in progress (${Math.round((now - autoUpdateProcessingRef.current) / 1000)}s ago), skipping`);
      return false;
    }

    // Set timestamp-based lock for auto-update
    autoUpdateProcessingRef.current = now;
    console.log(`🔒 Auto-update lock acquired at ${new Date(now).toISOString()}`);

    const debugId = `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {

      console.log(`🚀 [${debugId}] ===== AUTOMATIC UPDATE & DELETE PROCESS STARTED =====`);
      console.log(`🕐 [${debugId}] Start time: ${new Date().toISOString()}`);
      console.log(`👤 [${debugId}] User info:`, {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userType: typeof user
      });
      console.log(`🔧 [${debugId}] Function info:`, {
        hasClearFunction: !!clearPurchasedItemsFromCart,
        clearFunctionType: typeof clearPurchasedItemsFromCart,
        clearFunctionName: clearPurchasedItemsFromCart?.name
      });

      if (!user?.id) {
        console.error(`❌ [${debugId}] CRITICAL: User authentication required - aborting process`);
        console.log(`🕐 [${debugId}] Process aborted at: ${new Date().toISOString()}`);
        return; // Don't throw to avoid breaking payment flow
      }

      try {
        console.log(`🔄 [${debugId}] Starting automatic stock update and cart cleanup using CURRENT cart data...`);

        // For Guest Users: Attempt to recover User Bag ID from localStorage if not logged in
        let targetUserBagId: string | null = null;
        let userBagData: any = null;

        // SCENARIO 1: Logged-in User
        if (user?.id) {
          console.log(`🔍 [${debugId}] Step 1 (Auth): Fetching user data for logged-in user...`);
          try {
            const userDataResponse = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${user.id}&populate=*`);
            if (userDataResponse?.data && userDataResponse.data.length > 0) {
              const userData = userDataResponse.data[0];
              targetUserBagId = userData.user_bag?.documentId;
              console.log(`✅ [${debugId}] Found User Bag ID via Session: ${targetUserBagId}`);
            }
          } catch (e) {
            console.error(`❌ [${debugId}] Error fetching user data:`, e);
          }
        }

        // SCENARIO 2: Guest User (Recovery Mode)
        // If no bag found yet (guest or error), try to recover using the MerchantTxnId from payment context
        // We expect paymentData to contain the merchantTxnId if passed, or we might need to rely on localStorage lookup inside this function if not passed
        if (!targetUserBagId) {
          console.log(`ℹ️ [${debugId}] Step 1 (Guest): No session bag found. Attempting recovery...`);

          // Try to find the txnId to look up
          let txnIdToLookup = paymentData?.MerchantTxnId || paymentData?.merchantTxnId;

          // If not in paymentData, we can't recover here easily without passing it down. 
          // However, this function is called AFTER we likely processed the callback params.
          // Let's assume the caller successfully identified the bag OR we need to trust the localStorage check done earlier in the component.

          // actually, let's allow passing userBagId directly to this function
        }

        // ACTUALLY: The better approach is to let the Caller (useEffect) pass the determined userBagId 
        // overriding the internal lookup if provided.

        // Let's modify the function signature? No, let's keep it compatible but smarter.
        // If 'user' object is mock/guest, we expect it might not have ID.

        // Let's assume the caller resolved the UserBagId and passed it in user object or a new param?
        // Current signature: (user: any, clearPurchasedItemsFromCart: any, paymentData?: any)

        // Let's look for bagId in paymentData as a hack/convention
        if (paymentData?.recoveredUserBagId) {
          targetUserBagId = paymentData.recoveredUserBagId;
          console.log(`✅ [${debugId}] Using Recovered Guest Bag ID passed by caller: ${targetUserBagId}`);
        } else if (!targetUserBagId && !user?.id) {
          // Last ditch attempt: check localStorage directly if txnId is available
          const txnId = paymentData?.MerchantTxnId || paymentData?.merchantTxnId;
          if (txnId) {
            const storedBagId = localStorage.getItem(`nps_txn_${txnId}`);
            if (storedBagId) {
              targetUserBagId = storedBagId;
              console.log(`✅ [${debugId}] recovered Bag ID from storage inside function: ${targetUserBagId}`);
            }
          }
        }

        if (!targetUserBagId) {
          console.error(`❌ [${debugId}] CRITICAL: Could not determine User Bag ID (Guest or Auth). Aborting.`);
          console.log(`🕐 [${debugId}] Process aborted at: ${new Date().toISOString()}`);
          return;
        }

        try {
          console.log(`🔄 [${debugId}] Step 2: Fetching full user-bag data for ID: ${targetUserBagId}`);
          const bagResponse = await fetchDataFromApi(`/api/user-bags/${targetUserBagId}?populate=*`);

          if (!bagResponse?.data) {
            console.error(`❌ [${debugId}] User Bag not found for ID: ${targetUserBagId}`);
            return;
          }
          userBagData = bagResponse.data;
          const userDocumentId = userBagData.user_datum?.documentId; // Might be null for guests
          console.log(`✅ [${debugId}] Successfully loaded User Bag.`);


          console.log(`🔍 [${debugId}] Step 2: Fetching current cart items using user_datum relation...`);
          // For guests, we might not have userDocumentId if they have a bag but no user profile
          let cartApiUrl;
          if (userDocumentId) {
            cartApiUrl = `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`;
          } else {
            // Fallback: fetch carts directly linked to this bag if we can't search by user
            // Note: Strapi usually links carts to user_bag or user_datum. 
            // If we have the bag, we can likely get the carts from `userBagData.carts` if populated
            cartApiUrl = `/api/carts?filters[user_bag][documentId][$eq]=${targetUserBagId}&populate=*`;
          }

          console.log(`🌐 [${debugId}] Cart API URL: ${cartApiUrl}`);

          const cartFetchStart = Date.now();
          const cartResponse = await fetchDataFromApi(cartApiUrl);
          const cartFetchTime = Date.now() - cartFetchStart;

          console.log(`📊 [${debugId}] Cart fetch completed in ${cartFetchTime}ms`);
          console.log(`📦 [${debugId}] Cart response structure:`, {
            hasResponse: !!cartResponse,
            hasData: !!(cartResponse?.data),
            dataType: typeof cartResponse?.data,
            dataLength: cartResponse?.data?.length,
            responseKeys: cartResponse ? Object.keys(cartResponse) : [],
            fullResponse: cartResponse
          });

          if (!cartResponse?.data || cartResponse.data.length === 0) {
            console.log(`ℹ️ [${debugId}] No current cart items found - cart may already be empty or payment processed elsewhere`);
            console.log(`✅ [${debugId}] No action needed - cart is already clean`);
            console.log(`🕐 [${debugId}] Process completed at: ${new Date().toISOString()}`);
            console.log(`⏱️ [${debugId}] Total execution time: ${Date.now() - startTime}ms`);
            console.log(`🏁 [${debugId}] ===== AUTOMATIC UPDATE & DELETE PROCESS COMPLETED (NO ITEMS) =====`);
            return;
          }

          // Transform current cart items to selectedProducts format expected by the utility
          const currentCartItems = cartResponse.data;
          console.log(`🔄 [${debugId}] Raw cart items before transformation:`, {
            itemCount: currentCartItems.length,
            items: currentCartItems.map((item: any, index: number) => ({
              index,
              cartItemId: item.id,
              productId: item.product?.id,
              productDocumentId: item.product?.documentId,
              productTitle: item.product?.title || item.product?.name,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
              hasVariant: !!item.variant,
              variantId: item.variant?.id,
              variantDocumentId: item.variant?.documentId,
              variantTitle: item.variant?.title || item.variant?.color,
              allCartItemKeys: Object.keys(item),
              productKeys: item.product ? Object.keys(item.product) : [],
              variantKeys: item.variant ? Object.keys(item.variant) : []
            }))
          });

          const transformStart = Date.now();
          const selectedProducts = currentCartItems.map((cartItem: any, index: number) => {
            const product = cartItem.product;
            const transformed = {
              id: product.id,
              documentId: product.documentId,
              title: product.title || product.name,
              selectedSize: cartItem.size,
              quantity: cartItem.quantity,
              price: cartItem.price,
              // Check if this cart item represents a variant product
              variantInfo: cartItem.variant ? {
                documentId: cartItem.variant.documentId,
                isVariant: true,
                title: cartItem.variant.title || cartItem.variant.color
              } : null
            };

            console.log(`🔄 [${debugId}] Item ${index + 1} transformation:`, {
              original: {
                cartItemId: cartItem.id,
                productId: product.id,
                productDocumentId: product.documentId,
                size: cartItem.size,
                quantity: cartItem.quantity,
                hasVariant: !!cartItem.variant
              },
              transformed: transformed
            });

            return transformed;
          });
          const transformTime = Date.now() - transformStart;

          console.log(`🔄 [${debugId}] Cart items transformation completed in ${transformTime}ms`);
          console.log(`📊 [${debugId}] Transformed products summary:`, {
            totalItems: selectedProducts.length,
            mainProducts: selectedProducts.filter(p => !p.variantInfo).length,
            variantProducts: selectedProducts.filter(p => !!p.variantInfo).length,
            items: selectedProducts.map((p, index) => ({
              index: index + 1,
              title: p.title,
              size: p.selectedSize,
              quantity: p.quantity,
              isVariant: !!p.variantInfo,
              variantTitle: p.variantInfo?.title
            }))
          });

          if (selectedProducts.length === 0) {
            console.log(`ℹ️ [${debugId}] No products to process from current cart`);
            console.log(`🕐 [${debugId}] Process completed at: ${new Date().toISOString()}`);
            console.log(`⏱️ [${debugId}] Total execution time: ${Date.now() - startTime}ms`);
            console.log(`🏁 [${debugId}] ===== AUTOMATIC UPDATE & DELETE PROCESS COMPLETED (NO PRODUCTS) =====`);
            return;
          }

          // Use the existing processPostPaymentStockAndCart utility with CURRENT cart data
          console.log(`🚀 [${debugId}] Calling processPostPaymentStockAndCart utility...`);
          const utilityStart = Date.now();

          const utilityResult = await processPostPaymentStockAndCart(selectedProducts, user, clearPurchasedItemsFromCart, paymentData);

          const utilityTime = Date.now() - utilityStart;
          console.log(`📊 [${debugId}] Utility execution completed in ${utilityTime}ms`);
          console.log(`✅ [${debugId}] Utility result:`, {
            hasResult: !!utilityResult,
            resultType: typeof utilityResult,
            resultKeys: utilityResult ? Object.keys(utilityResult) : [],
            stockUpdateSuccess: utilityResult?.stockUpdate?.success,
            stockUpdateCount: utilityResult?.stockUpdate?.successCount,
            cartClearSuccess: utilityResult?.cartClear?.success,
            emailSendSuccess: utilityResult?.emailSend?.success,
            fullResult: utilityResult
          });

          const totalTime = Date.now() - startTime;
          console.log(`✅ [${debugId}] Automatic stock update and cart cleanup completed successfully using current cart data`);
          console.log(`🕐 [${debugId}] Process completed at: ${new Date().toISOString()}`);
          console.log(`⏱️ [${debugId}] Total execution time: ${totalTime}ms`);
          console.log(`📊 [${debugId}] Performance breakdown:`, {
            cartFetch: `${cartFetchTime}ms`,
            transformation: `${transformTime}ms`,
            utilityExecution: `${utilityTime}ms`,
            total: `${totalTime}ms`
          });
          console.log(`🏁 [${debugId}] ===== AUTOMATIC UPDATE & DELETE PROCESS COMPLETED SUCCESSFULLY =====`);

          // Mark as completed and reset processing flag
          autoUpdateCompletedRef.current = true;
          processingRef.current = null;
          return true;

        } catch (error: any) {
          const errorTime = Date.now() - startTime;
          console.error(`❌ [${debugId}] CRITICAL ERROR in automatic update and delete operation:`);
          console.error(`🕐 [${debugId}] Error occurred at: ${new Date().toISOString()}`);
          console.error(`⏱️ [${debugId}] Time before error: ${errorTime}ms`);
          console.error(`🔍 [${debugId}] Error details:`, {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            errorType: typeof error,
            errorKeys: Object.keys(error),
            fullError: error
          });
          console.error(`🌐 [${debugId}] Environment context:`, {
            userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'N/A',
            url: typeof window !== 'undefined' ? window.location?.href : 'N/A',
            timestamp: new Date().toISOString(),
            processEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'N/A'
          });


          // Step 3: Process stock updates and cart deletion
          console.log(`🔄 [${debugId}] Step 3: Calling processPostPaymentStockAndCart...`);
          const processResult = await processPostPaymentStockAndCart(
            currentCartItems,
            user || { id: 'guest', email: paymentData?.orderData?.customer_info?.email || 'guest@example.com' }, // Provide fallback user object for guests
            async (itemsToRemove: any[]) => {
              console.log(`🗑️ [${debugId}] Callback: Removing ${itemsToRemove.length} items from cart...`);
              if (clearPurchasedItemsFromCart) {
                await clearPurchasedItemsFromCart(itemsToRemove);
              }
            },
            paymentData
          );

          console.log(`✅ [${debugId}] processPostPaymentStockAndCart completed within handleAutomaticUpdateStockAndDelete`);
          console.log(`📊 [${debugId}] Result summary:`, processResult);

          const totalTime = Date.now() - startTime;
          console.log(`⏱️ [${debugId}] automatic update & delete completed in ${totalTime}ms`);

          return true;

        } catch (err: any) {
          console.error(`❌ [${debugId}] Error in Guest/Auth logic:`, err);
          return false;
        }
        // End of catch block for the main try/catch in this function
      };

      // Extract payment data from URL parameters
      // Handle both real NPS callback and mock callback parameters
      const merchantTxnId = searchParams?.get("MerchantTxnId") || searchParams?.get("merchantTxnId") || "";
      const gatewayTxnId = searchParams?.get("GatewayTxnId") || searchParams?.get("processId") || "";
      const amount = searchParams?.get("Amount") || "";
      const status = searchParams?.get("Status") || searchParams?.get("status") || "";
      const message = searchParams?.get("Message") || "";
      const isMock = searchParams?.get("mock") === "true";

      useEffect(() => {
        console.log("=== NPS CALLBACK REACHED ===");
        console.log("Status:", status);
        console.log("MerchantTxnId:", merchantTxnId);
        console.log("GatewayTxnId:", gatewayTxnId);
        console.log("Is Mock Payment:", isMock);
        console.log("User:", user?.id);

        const savePaymentData = async () => {
          // Prevent double execution ONLY if we already have user and are processing
          if (processingRef.current && user?.id) {
            console.log("🚫 [EXECUTION GUARD] Double execution prevented - already processing with user");
            return;
          }

          // For guest users, we don't wait for 'user'. 
          // We set processing flag immediately if no user is present but txnId is.
          if (!user?.id && !merchantTxnId) {
            console.log("⏳ [EXECUTION GUARD] No User and No TxnID - waiting...");
            return;
          }

          // Processing Lock Logic
          if (processingRef.current) {
            const timeSinceLock = Date.now() - processingRef.current;
            if (timeSinceLock < 10000) { // 10s debounce
              console.log("🚫 [EXECUTION GUARD] Already processing...");
              return;
            }
          }

          processingRef.current = Date.now();
          console.log("🔒 [EXECUTION GUARD] Processing locked.");

          try {
            // Show user-friendly status updates
            if (status === "SUCCESS" || (isMock && status === "success")) {
              setProcessingStatus("✅ Payment successful! Finding your order...");
            } else if (status === "FAILED") {
              setProcessingStatus("❌ Payment failed");
              setTimeout(() => {
                window.location.href = "/?payment=failed";
              }, 2000);
            } else if (status === "CANCELLED") {
              setProcessingStatus("❌ Payment was cancelled");
              setTimeout(() => {
                window.location.href = "/?payment=cancelled";
              }, 2000);
              return;
            } else if (!status && merchantTxnId && gatewayTxnId) {
              // Real NPS payment with transaction IDs but no explicit status - assume success
              console.log("Real NPS payment detected - no status but have transaction IDs, proceeding as success");
              setProcessingStatus("✅ Payment successful! Processing your order...");
            } else {
              setProcessingStatus("⏳ Verifying payment status...");
            }

            // Validate required data (for mock payments, gatewayTxnId might be processId)
            // For guests, we don't require 'user' object anymore
            const hasRequiredData = merchantTxnId && (gatewayTxnId || isMock);

            if (!hasRequiredData) {
              console.log("Missing required data:", {
                merchantTxnId: !!merchantTxnId,
                gatewayTxnId: !!gatewayTxnId,
                isMock: isMock
              });
              setProcessingStatus("❌ Missing payment information");
              setTimeout(() => {
                window.location.href = "/";
              }, 3000);
              return;
            }

            // Determine User Bag ID (Guest or Auth)
            let targetBagId: string | null = null;
            let bagData: any = null;

            if (user?.id) {
              // Logged in user: find by auth ID
              try {
                const userDataResponse = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${user.id}&populate=user_bag`);
                if (userDataResponse?.data && userDataResponse.data.length > 0) {
                  targetBagId = userDataResponse.data[0].user_bag?.documentId;
                }
              } catch (e) {
                console.error("Error finding user bag by session:", e);
              }
            }

            if (!targetBagId && merchantTxnId) {
              // Guest: Try localStorage recovery
              const storedId = localStorage.getItem(`nps_txn_${merchantTxnId}`);
              if (storedId) {
                console.log(`✅ [GUEST] Recovered Bag ID from storage: ${storedId}`);
                targetBagId = storedId;
              }
            }

            if (!targetBagId) {
              console.error("❌ Could not determine User Bag ID for transaction.");
              setProcessingStatus("❌ Could not locate your order.");
              setTimeout(() => { window.location.href = "/"; }, 3000);
              return;
            }

            // Find the user's bag with enhanced error handling
            try {
              // We have the ID, fetch it directly
              const bagResponse = await fetchDataFromApi(`/api/user-bags/${targetBagId}?populate=*`);
              if (!bagResponse?.data) throw new Error("Bag not found");

              bagData = bagResponse.data;
            } catch (fetchError) {
              console.error("❌ Error fetching user bag:", fetchError);
              setProcessingStatus("❌ Error accessing order data");
              setTimeout(() => { window.location.href = "/?payment=error"; }, 3000);
              return;
            }

            setProcessingStatus("🔍 Verifying payment with NPS...");

            let finalAmount = parseFloat(amount) || 0;
            let finalStatus = status;
            let finalProcessId = "";
            let finalInstitution = "";
            let finalInstrument = "";
            let finalServiceCharge = "";
            let finalCbsMessage = "";

            // Skip NPS API status check for mock payments since we have all data
            // Reuse existing API check logic...
            if ((!status || !amount) && !isMock) {
              try {
                console.log("Checking transaction status with NPS API...");
                const statusResponse = await fetch('/api/nps-check-status', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ merchantTxnId: merchantTxnId })
                });

                if (statusResponse.ok) {
                  const statusData = await statusResponse.json();
                  console.log("NPS status check response:", statusData);

                  if (statusData.success && statusData.data) {
                    finalAmount = parseFloat(statusData.data.Amount) || 0;
                    finalStatus = statusData.data.Status; // "Success", "Fail", or "Pending"
                    finalProcessId = statusData.data.ProcessId || "";
                    // ... extract other fields ...
                  }
                }
              } catch (error) {
                console.error("Error checking transaction status:", error);
              }
            } else if (isMock) {
              console.log("✅ Using mock payment data");
            }

            // Get orderData from existing payment record if available
            let orderData: any = null;

            // First, try to find existing payment with orderData
            const existingPayments = bagData.user_orders?.payments || [];
            const existingPayment = existingPayments.find(
              (payment: any) => payment.merchantTxnId === merchantTxnId && payment.provider === "nps"
            );

            if (existingPayment && existingPayment.orderData) {
              orderData = existingPayment.orderData;
            } else if (bagData.orderData) {
              orderData = bagData.orderData;
            }

            // Now we have the final status and amount, update the user bag
            const paymentData = {
              provider: "nps",
              merchantTxnId,
              processId: gatewayTxnId || finalProcessId,
              status: finalStatus,
              amount: finalAmount,
              // ... other fields
              orderData: orderData,
              // Pass the recovered bag ID specifically so internal functions use it
              recoveredUserBagId: targetBagId
            };

            setIsProcessingCoupon(true);
            console.log("🚫 [NAVIGATION GUARD] Coupon processing started - navigation BLOCKED");

            // Override any existing navigation attempts
            const originalLocation = window.location;
            const navigationBlocker = {
              href: originalLocation.href,
              replace: () => console.log("🚫 [NAVIGATION GUARD] Navigation blocked during coupon processing"),
              assign: () => console.log("🚫 [NAVIGATION GUARD] Navigation blocked during coupon processing")
            };

            try {
              Object.defineProperty(window, 'location', {
                value: navigationBlocker,
                writable: false,
                configurable: true
              });
            } catch (e) {
              console.log("⚠️ Could not override window.location, but proceeding...");
            }

            console.log("🔍 [COUPON DEBUG] orderData structure:", {
              hasCouponCode: !!orderData?.orderSummary?.couponCode,
              couponCode: orderData?.orderSummary?.couponCode,
              couponDiscount: orderData?.orderSummary?.couponDiscount,
              hasRootCouponCode: !!orderData?.couponCode,
              rootCouponCode: orderData?.couponCode,
              rootCouponDiscount: orderData?.couponDiscount
            });

            // Check for coupon code and ID in multiple possible locations
            const couponCode = orderData?.orderSummary?.couponCode || orderData?.couponCode;
            const couponDiscount = orderData?.orderSummary?.couponDiscount || orderData?.couponDiscount;
            const couponId = orderData?.orderSummary?.couponId || orderData?.couponId;

            console.log("🔍 [COUPON DEBUG] Final coupon detection:", {
              finalCouponCode: couponCode,
              finalCouponId: couponId,
              finalCouponDiscount: couponDiscount,
              willProceed: !!couponCode
            });

            if (couponCode) {
              console.log("🎫 [IMMEDIATE COUPON] Found coupon - applying NOW:", couponCode, "(ID:", couponId, ")");

              try {
                setProcessingStatus("🎫 Applying coupon automatically...");

                // Apply coupon using simplified approach (same as coupon-demo "Apply Directly")
                // CRITICAL FIX: Use actual couponId, not couponCode
                if (!couponId) {
                  console.error("⚠️ [IMMEDIATE COUPON] No couponId found in orderData - cannot apply coupon");
                  throw new Error("Coupon ID missing from order data");
                }

                console.log("🗺️ [IMMEDIATE COUPON] Sending API request with couponId:", couponId);

                const couponResponse = await fetch('/api/coupons/apply', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    couponId: couponId  // Send the actual numeric coupon ID
                  })
                });

                const couponResult = await couponResponse.json();
                console.log("🎫 [IMMEDIATE COUPON] Coupon application result:", couponResult);

                if (couponResult.success) {
                  console.log("✅ [IMMEDIATE COUPON] Coupon applied successfully!", couponResult.message);
                  setProcessingStatus("✅ Payment complete! Coupon usage updated.");
                } else {
                  console.error("⚠️ [IMMEDIATE COUPON] Failed to apply coupon:", couponResult.message);
                  setProcessingStatus("⚠️ Coupon application error but payment successful");
                }
              } catch (couponError) {
                console.error("⚠️ [IMMEDIATE COUPON] Error applying coupon:", couponError);
                setProcessingStatus("⚠️ Coupon application error but payment successful");
              }
            } else {
              console.log("ℹ️ [IMMEDIATE COUPON] No coupon to apply automatically");
            }

            // CRITICAL: Restore navigation and unlock
            try {
              Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true,
                configurable: true
              });
              console.log("✅ [NAVIGATION GUARD] Navigation restored after coupon processing");
            } catch (e) {
              console.log("⚠️ Could not restore window.location, using direct navigation");
            }

            setIsProcessingCoupon(false);
            console.log("✅ [NAVIGATION GUARD] Coupon processing complete - navigation UNLOCKED");

            // Mark coupon processing as complete
            couponProcessingComplete = true;
            console.log("✅ All post-payment processing completed - ready for redirect");
            setProcessingStatus("✅ Payment processing complete!");

            // Step 3: Navigation ONLY after coupon processing is complete
            console.log("🔄 Preparing redirect - finalStatus:", finalStatus);
            setTimeout(() => {
              console.log("🔄 Redirecting to success page...");
              window.location.href = "/?payment=success";
            }, 3000); // Give time to show order creation status

          } catch (orderError) {
            console.error("Error in post-payment processing:", orderError);
            setProcessingStatus("⚠️ Payment successful but failed to complete post-processing");

            // Still redirect on error, but after a longer delay
            setTimeout(() => {
              console.log("🔄 Redirecting to success page (after error)...");
              window.location.href = "/?payment=success";
            }, 5000);
          }
        } else {
          // Handle non-successful payments
          console.log("🔄 Preparing redirect - finalStatus:", finalStatus);
        if (finalStatus === "Fail" || finalStatus === "FAILED" || finalStatus === "fail") {
          setTimeout(() => {
            console.log("🔄 Redirecting to failed page...");
            window.location.href = "/?payment=failed";
          }, 3000);
        } else {
          setProcessingStatus("⏳ Payment is being processed...");
          setTimeout(() => {
            console.log("🔄 Redirecting to pending page...");
            window.location.href = "/?payment=pending";
          }, 3000);
        }
      }

        } catch (error) {
      console.error("Error saving payment data:", error);
      setProcessingStatus("❌ Error processing payment");
      setTimeout(() => {
        window.location.href = "/?payment=error";
      }, 3000);
    }
  };

  savePaymentData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user, merchantTxnId, gatewayTxnId, amount, status, message]);

// Memory cleanup effect to prevent leaks
useEffect(() => {
  return () => {
    // Clear payment processing data from memory
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('nps_payment_data');
      sessionStorage.removeItem('paymentProcessing');

      // Clear performance timings to free memory
      if (window.performance && window.performance.clearResourceTimings) {
        window.performance.clearResourceTimings();
      }

      // Clear any cached payment references
      if ((window as any).paymentCache) {
        delete (window as any).paymentCache;
      }
    }
  };
}, []);

// Show clean processing interface
return (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f9fa'
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      maxWidth: '400px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px auto'
      }}></div>

      <h2 style={{ color: '#333', marginBottom: '15px' }}>Processing Payment</h2>
      <p style={{ color: '#666', marginBottom: '20px', minHeight: '24px' }}>
        {processingStatus}
      </p>

      <p style={{ color: '#999', fontSize: '14px' }}>
        Please wait while we process your payment...
      </p>
    </div>

    <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
  </div>
);
  };

// Main component with Suspense wrapper
const NPSCallbackPage = () => {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    }>
      <NPSCallbackContent />
    </Suspense>
  );
};

export default NPSCallbackPage;