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

      // Guest Handling: Attempt to recover User Bag ID from localStorage if not provided or logged in
      let targetUserBagId: string | null = null;

      // 1. Try to get ID from passed paymentData (most reliable if caller set it)
      if (paymentData?.recoveredUserBagId) {
        targetUserBagId = paymentData.recoveredUserBagId;
        console.log(`✅ [${debugId}] Using Recovered Guest Bag ID passed by caller: ${targetUserBagId}`);
      }

      // 2. If not found, try to find for logged-in user
      if (!targetUserBagId && user?.id) {
        console.log(`🔍 [${debugId}] Step 1 (Auth): Fetching user data for logged-in user...`);
        try {
          const userDataResponse = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${user.id}&populate=*`);
          if (userDataResponse?.data && userDataResponse.data.length > 0) {
            targetUserBagId = userDataResponse.data[0].user_bag?.documentId;
            console.log(`✅ [${debugId}] Found User Bag ID via Session: ${targetUserBagId}`);
          }
        } catch (e) {
          console.error(`❌ [${debugId}] Error fetching user data:`, e);
        }
      }

      // 3. Last resort: check localStorage based on transaction ID
      if (!targetUserBagId) {
        const txnId = paymentData?.MerchantTxnId || paymentData?.merchantTxnId;
        if (txnId) {
          const storedBagId = localStorage.getItem(`nps_txn_${txnId}`);
          if (storedBagId) {
            targetUserBagId = storedBagId;
            console.log(`✅ [${debugId}] Recovered Bag ID from storage: ${targetUserBagId}`);
          }
        }
      }

      if (!targetUserBagId) {
        console.error(`❌ [${debugId}] CRITICAL: Could not determine User Bag ID. Aborting.`);
        return;
      }

      // Fetch User Bag Data (to get userDocumentId if available)
      console.log(`🔄 [${debugId}] Step 2: Fetching full user-bag data for ID: ${targetUserBagId}`);
      const bagResponse = await fetchDataFromApi(`/api/user-bags/${targetUserBagId}?populate=*`);

      if (!bagResponse?.data) {
        console.error(`❌ [${debugId}] User Bag not found for ID: ${targetUserBagId}`);
        return;
      }
      const userBagData = bagResponse.data;
      const userDocumentId = userBagData.user_datum?.documentId;

      // Fetch Cart Items
      console.log(`🔍 [${debugId}] Step 2: Fetching current cart items...`);
      let cartApiUrl;
      if (userDocumentId) {
        cartApiUrl = `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`;
      } else {
        // Fallback for guests: fetch carts directly linked to this bag
        cartApiUrl = `/api/carts?filters[user_bag][documentId][$eq]=${targetUserBagId}&populate=*`;
      }

      const cartResponse = await fetchDataFromApi(cartApiUrl);

      if (!cartResponse?.data || cartResponse.data.length === 0) {
        console.log(`ℹ️ [${debugId}] No current cart items found - cart may already be empty.`);
        console.log(`🏁 [${debugId}] ===== AUTOMATIC UPDATE & DELETE PROCESS COMPLETED (NO ITEMS) =====`);
        return;
      }

      const currentCartItems = cartResponse.data;
      console.log(`📦 [${debugId}] Found ${currentCartItems.length} items in cart.`);

      // Transform for utility
      const selectedProducts = currentCartItems.map((cartItem: any) => ({
        id: cartItem.product.id,
        documentId: cartItem.product.documentId,
        title: cartItem.product.title || cartItem.product.name,
        selectedSize: cartItem.size,
        quantity: cartItem.quantity,
        price: cartItem.price,
        variantInfo: cartItem.variant ? {
          documentId: cartItem.variant.documentId,
          isVariant: true,
          title: cartItem.variant.title || cartItem.variant.color
        } : null
      }));

      // Call Process Utility
      console.log(`🚀 [${debugId}] Calling processPostPaymentStockAndCart utility...`);
      const processResult = await processPostPaymentStockAndCart(
        selectedProducts,
        user || { id: 'guest', email: paymentData?.orderData?.receiver_details?.email || 'guest@example.com' },
        async (itemsToRemove: any[]) => {
          console.log(`🗑️ [${debugId}] Removing ${itemsToRemove.length} items from cart...`);
          if (clearPurchasedItemsFromCart) {
            await clearPurchasedItemsFromCart(itemsToRemove);
          }
        },
        paymentData
      );

      console.log(`✅ [${debugId}] Utility completed.`);
      console.log(`📊 [${debugId}] Result:`, processResult);

      console.log(`🏁 [${debugId}] ===== AUTOMATIC UPDATE & DELETE PROCESS COMPLETED SUCCESSFULLY =====`);
      autoUpdateCompletedRef.current = true;
      processingRef.current = null;
      return true;

    } catch (error: any) {
      console.error(`❌ [${debugId}] CRITICAL ERROR in automatic update:`, error);
      // Don't throw, return false
      autoUpdateCompletedRef.current = true;
      autoUpdateProcessingRef.current = null;
      return false;
    } finally {
      if (autoUpdateProcessingRef.current) {
        autoUpdateProcessingRef.current = null;
      }
    }
  };

  // Extract payment data from URL parameters
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

    const savePaymentData = async () => {
      // Prevent double execution
      if (processingRef.current && user?.id) {
        console.log("🚫 [EXECUTION GUARD] Double execution prevented");
        return;
      }

      // For guest users, wait if NO txnId. If txnId exists, we can proceed without user.
      if (!user?.id && !merchantTxnId) {
        console.log("⏳ [EXECUTION GUARD] Waiting for info...");
        return;
      }

      // Lock Logic
      if (processingRef.current) {
        const timeSinceLock = Date.now() - processingRef.current;
        if (timeSinceLock < 10000) return; // Debounce
      }

      processingRef.current = Date.now();
      console.log("🔒 [EXECUTION GUARD] Processing locked.");

      try {
        // Status Validations
        if (status === "SUCCESS" || (isMock && status === "success")) {
          setProcessingStatus("✅ Payment successful! Finding your order...");
        } else if (status === "FAILED") {
          setProcessingStatus("❌ Payment failed");
          setTimeout(() => window.location.href = "/?payment=failed", 2000);
          return;
        } else if (status === "CANCELLED") {
          setProcessingStatus("❌ Payment was cancelled");
          setTimeout(() => window.location.href = "/?payment=cancelled", 2000);
          return;
        } else if (!status && merchantTxnId && gatewayTxnId) {
          setProcessingStatus("✅ Payment successful! Processing...");
        } else {
          setProcessingStatus("⏳ Verifying payment status...");
        }

        const hasRequiredData = merchantTxnId && (gatewayTxnId || isMock);
        if (!hasRequiredData) {
          setProcessingStatus("❌ Missing payment information");
          setTimeout(() => window.location.href = "/", 3000);
          return;
        }

        // --- FIND USER BAG ---
        let targetBagId: string | null = null;
        let bagData: any = null;

        // 1. Try Logged In
        if (user?.id) {
          try {
            const userDataResponse = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${user.id}&populate=user_bag`);
            if (userDataResponse?.data?.[0]) {
              targetBagId = userDataResponse.data[0].user_bag?.documentId;
            }
          } catch (e) {
            console.error("Error finding user bag by session:", e);
          }
        }

        // 2. Try Guest Recovery
        if (!targetBagId && merchantTxnId) {
          const storedId = localStorage.getItem(`nps_txn_${merchantTxnId}`);
          if (storedId) {
            console.log(`✅ [GUEST] Recovered Bag ID: ${storedId}`);
            targetBagId = storedId;
          }
        }

        if (!targetBagId) {
          console.error("❌ Could not determine Bag ID.");
          setProcessingStatus("❌ Could not locate your order.");
          setTimeout(() => window.location.href = "/", 3000);
          return;
        }

        // Fetch Bag Data
        try {
          const bagResponse = await fetchDataFromApi(`/api/user-bags/${targetBagId}?populate=*`);
          if (!bagResponse?.data) throw new Error("Bag not found");
          bagData = bagResponse.data;
        } catch (fetchError) {
          console.error("❌ Error fetching bag:", fetchError);
          setProcessingStatus("❌ Error accessing order data");
          setTimeout(() => window.location.href = "/?payment=error", 3000);
          return;
        }

        // --- VERIFY NPS STATUS (If real payment) ---
        let finalAmount = parseFloat(amount) || 0;
        let finalStatus = status;
        let finalProcessId = gatewayTxnId;

        if ((!status || !amount) && !isMock) {
          try {
            const statusResponse = await fetch('/api/nps-check-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ merchantTxnId })
            });
            if (statusResponse.ok) {
              const sData = await statusResponse.json();
              if (sData.success && sData.data) {
                finalAmount = parseFloat(sData.data.Amount) || 0;
                finalStatus = sData.data.Status;
                finalProcessId = sData.data.ProcessId || "";
              }
            }
          } catch (e) { console.error("NPS check failed", e); }
        }

        // --- PREPARE PAYMENT DATA ---
        // Get orderData from existing (pending) payment or bag
        let orderData: any = null;
        const existingPayments = bagData.user_orders?.payments || [];
        const existing = existingPayments.find((p: any) => p.merchantTxnId === merchantTxnId && p.provider === "nps");

        if (existing?.orderData) orderData = existing.orderData;
        else if (bagData.orderData) orderData = bagData.orderData;

        const paymentData = {
          provider: "nps",
          merchantTxnId,
          processId: finalProcessId,
          status: finalStatus,
          amount: finalAmount,
          orderData: orderData,
          recoveredUserBagId: targetBagId, // Explicitly pass for internal use
          timestamp: generateLocalTimestamp()
        };

        // SAVE
        await updateUserBagWithPayment(targetBagId, paymentData);

        // --- HANDLE SUCCESS ---
        const isSuccess = ['Success', 'SUCCESS', 'success', 'COMPLETED', 'completed'].includes(finalStatus as string);

        if (isSuccess || (isMock && finalStatus === 'success')) {
          setProcessingStatus("✅ Payment successful! Finalizing order...");

          console.log('📧 [CALLBACK] Triggering post-payment processing with email automation...');
          console.log('📧 [CALLBACK] PaymentData being passed:', {
            hasPaymentData: !!paymentData,
            hasOrderData: !!paymentData?.orderData,
            hasReceiverDetails: !!paymentData?.orderData?.receiver_details,
            receiverEmail: paymentData?.orderData?.receiver_details?.email
          });

          // NEW: Trigger email automation via API (works even if page flow is interrupted)
          try {
            console.log('🚀 [CALLBACK] Calling /api/nps-process-success...');
            const processResponse = await fetch('/api/nps-process-success', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                merchantTxnId,
                paymentData: {
                  ...paymentData,
                  recoveredUserBagId: targetBagId
                }
              })
            });

            const processResult = await processResponse.json();
            console.log('✅ [CALLBACK] Process success result:', processResult);

            if (processResult.success) {
              if (processResult.alreadyProcessed) {
                console.log('ℹ️ [CALLBACK] Payment already processed');
              } else {
                console.log('✅ [CALLBACK] Email automation completed:', {
                  stockUpdated: processResult.stockUpdated,
                  cartCleared: processResult.cartCleared,
                  emailSent: processResult.emailSent
                });
              }
            } else {
              console.error('❌ [CALLBACK] Process success failed:', processResult.error);
            }
          } catch (processError) {
            console.error('❌ [CALLBACK] Error calling process success:', processError);
            // Continue with old flow as fallback
            console.log('⚠️ [CALLBACK] Falling back to handleAutomaticUpdateStockAndDelete...');
            await handleAutomaticUpdateStockAndDelete(
              user || { id: 'guest', email: paymentData?.orderData?.receiver_details?.email || 'guest@example.com' },
              clearPurchasedItemsFromCart,
              paymentData
            );
          }

          // Coupon Handling
          setIsProcessingCoupon(true);
          const couponCode = orderData?.orderSummary?.couponCode || orderData?.couponCode;
          const couponId = orderData?.orderSummary?.couponId || orderData?.couponId;

          if (couponCode && couponId) {
            setProcessingStatus("🎫 Applying coupon...");
            try {
              await fetch('/api/coupons/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponId })
              });
              console.log("✅ Coupon applied.");
            } catch (e) { console.error("Coupon failed", e); }
          }
          setIsProcessingCoupon(false);

          // Redirect
          setTimeout(() => window.location.href = "/?payment=success", 3000);

        } else {
          // Fail
          setProcessingStatus("❌ Payment failed");
          setTimeout(() => window.location.href = "/?payment=failed", 3000);
        }

      } catch (error) {
        console.error("Error in savePaymentData:", error);
        setProcessingStatus("❌ Error processing payment");
        setTimeout(() => window.location.href = "/?payment=error", 3000);
      }
    };

    savePaymentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, merchantTxnId, gatewayTxnId, amount, status, message]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nps_payment_data');
        sessionStorage.removeItem('paymentProcessing');
      }
    };
  }, []);

  // Render
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