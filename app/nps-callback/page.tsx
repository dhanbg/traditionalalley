"use client";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, Suspense, useState } from "react";
import { fetchDataFromApi, updateUserBagWithPayment, createOrderRecord, updateProductStock } from "@/utils/api";
import { processPostPaymentStockAndCart } from "@/utils/postPaymentProcessing";
const { generateLocalTimestamp } = require("@/utils/timezone");
import type { NPSPaymentData } from "@/types/nps";
import { useContextElement } from "@/context/Context";

// Wrapper component that uses searchParams
const NPSCallbackContent = () => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user;
  const { clearPurchasedItemsFromCart } = useContextElement();
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingStatus, setProcessingStatus] = useState("Processing your payment...");

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
      try {
        // Show user-friendly status updates
        if (status === "SUCCESS" || (isMock && status === "success")) {
          setProcessingStatus("✅ Payment successful! Saving your order...");
        } else if (status === "FAILED") {
          setProcessingStatus("❌ Payment failed");
          setTimeout(() => {
            window.location.href = "/?payment=failed";
          }, 2000);
          return;
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
        const hasRequiredData = user && merchantTxnId && (gatewayTxnId || isMock);
        
        if (!hasRequiredData) {
          console.log("Missing required data:", { 
            user: !!user, 
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

        // Find the user's bag with enhanced error handling
        let currentUserData, userData, userBag;
        
        try {
          currentUserData = await fetchDataFromApi(
            `/api/user-data?filters[authUserId][$eq]=${user.id}&populate=user_bag`
          );
          
          if (!currentUserData?.data || currentUserData.data.length === 0) {
            console.log("❌ User data not found, but payment was successful - will attempt basic processing");
            
            // For successful payments, don't fail completely - try to process what we can
            if (merchantTxnId && gatewayTxnId) {
              console.log("🔄 Payment successful but user data missing - attempting basic cart clearing");
              setProcessingStatus("⚠️ Payment successful! Clearing your cart...");
              
              try {
                // Clear cart even without full order data
                if (clearPurchasedItemsFromCart) {
                  await clearPurchasedItemsFromCart([]);
                  console.log("✅ Cart cleared successfully");
                }
                
                setProcessingStatus("✅ Payment processed successfully!");
                setTimeout(() => {
                  window.location.href = "/?payment=success";
                }, 2000);
                return;
              } catch (error) {
                console.error("Error in basic processing:", error);
              }
            }
            
            setProcessingStatus("❌ User account not found");
            setTimeout(() => {
              window.location.href = "/";
            }, 3000);
            return;
          }

          userData = currentUserData.data[0];
          userBag = userData.user_bag;
          
        } catch (fetchError) {
          console.error("❌ Error fetching user data:", fetchError);
          
          // For successful payments, don't fail completely
          if (merchantTxnId && gatewayTxnId) {
            console.log("🔄 Payment successful but data fetch failed - attempting basic processing");
            setProcessingStatus("⚠️ Payment successful! Processing...");
            
            try {
              // Clear cart even without full order data
              if (clearPurchasedItemsFromCart) {
                await clearPurchasedItemsFromCart([]);
                console.log("✅ Cart cleared successfully");
              }
              
              setProcessingStatus("✅ Payment processed successfully!");
              setTimeout(() => {
                window.location.href = "/?payment=success";
              }, 2000);
              return;
            } catch (error) {
              console.error("Error in basic processing:", error);
            }
          }
          
          setProcessingStatus("❌ Error accessing user account");
          setTimeout(() => {
            window.location.href = "/?payment=error";
          }, 3000);
          return;
        }

        if (!userBag || !userBag.documentId) {
          console.log("User bag not found");
          setProcessingStatus("❌ User shopping bag not found");
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
          return;
        }

        setProcessingStatus("🔍 Verifying payment with NPS...");

        // If we don't have status/amount from URL, check with NPS API (skip for mock payments)
        let finalAmount = parseFloat(amount) || 0;
        let finalStatus = status;
        let finalProcessId = "";
        let finalInstitution = "";
        let finalInstrument = "";
        let finalServiceCharge = "";
        let finalCbsMessage = "";

        // Skip NPS API status check for mock payments since we have all data
        if ((!status || !amount) && !isMock) {
          try {
            console.log("Checking transaction status with NPS API...");
            const statusResponse = await fetch('/api/nps-check-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                merchantTxnId: merchantTxnId
              })
            });

            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              console.log("NPS status check response:", statusData);
              
              if (statusData.success && statusData.data) {
                finalAmount = parseFloat(statusData.data.Amount) || 0;
                finalStatus = statusData.data.Status; // "Success", "Fail", or "Pending"
                finalProcessId = statusData.data.ProcessId || "";
                finalInstitution = statusData.data.Institution || "";
                finalInstrument = statusData.data.Instrument || "";
                finalServiceCharge = statusData.data.ServiceCharge || "";
                finalCbsMessage = statusData.data.CbsMessage || "";
                console.log("Updated from NPS API - Amount:", finalAmount, "Status:", finalStatus, "ProcessId:", finalProcessId, "Institution:", finalInstitution, "Instrument:", finalInstrument);
              }
            }
          } catch (error) {
            console.error("Error checking transaction status:", error);
            // Continue with callback data if API check fails
          }
        } else if (isMock) {
          console.log("✅ Using mock payment data - no NPS API check needed");
          console.log("Mock payment details:", { amount: finalAmount, status: finalStatus, merchantTxnId, gatewayTxnId });
        }

        // Get orderData from existing payment record if available
        let orderData = null;
        
        // First, try to find existing payment with orderData
        const existingPayments = userBag.user_orders?.payments || [];
        const existingPayment = existingPayments.find(
          payment => payment.merchantTxnId === merchantTxnId && payment.provider === "nps"
        );
        
        if (existingPayment && existingPayment.orderData) {
          orderData = existingPayment.orderData;
          console.log("📦 Found orderData in existing payment record:", orderData);
        } else if (userBag.orderData) {
          // Fallback to user bag orderData if available
          orderData = userBag.orderData;
          console.log("📦 Found orderData in user bag (fallback):", orderData);
        } else {
          console.log("⚠️ No orderData found in existing payment or user bag");
        }

        // Prepare payment data for storage
        const paymentData: NPSPaymentData = {
          provider: "nps",
          processId: finalProcessId,
          merchantTxnId: merchantTxnId,
          gatewayReferenceNo: gatewayTxnId,
          amount: finalAmount,
          status: (finalStatus === "Success" || finalStatus === "success") ? "Success" : (finalStatus === "Fail" || finalStatus === "fail") ? "Fail" : "Pending",
          institution: finalInstitution,
          instrument: finalInstrument,
          serviceCharge: finalServiceCharge,
          cbsMessage: finalCbsMessage,
          timestamp: generateLocalTimestamp(),
          webhook_processed: false, // This came from callback, not webhook
        };

        // Add orderData if available
        if (orderData) {
          (paymentData as any).orderData = orderData;
        }

        setProcessingStatus("💾 Saving payment information...");

        // Save payment data to user-bag
        await updateUserBagWithPayment(userBag.documentId, paymentData);
        console.log("Payment data saved successfully:", paymentData);
        
        // Create order record if payment is successful
        if (finalStatus === "Success" || finalStatus === "SUCCESS" || finalStatus === "success") {
          try {
            // Always create order record with the paymentData we have
            const orderCreationResult = await createOrderRecord({
              ...paymentData, // Include all payment data
              userId: user.id   // Add user ID to the object
            });
            
            if (orderCreationResult.success) {
              setProcessingStatus("✅ Order created successfully!");
            } else {
              setProcessingStatus("⚠️ Payment successful but order creation failed");
            }
          } catch (orderError) {
            console.error("Error creating order:", orderError);
            setProcessingStatus("⚠️ Payment successful but failed to create order");
          }
        }
        
        // Show success and redirect based on payment status
        if (finalStatus === "Success" || finalStatus === "SUCCESS" || finalStatus === "success") {
          setTimeout(() => {
            window.location.href = "/?payment=success";
          }, 3000); // Give time to show order creation status
        } else if (finalStatus === "Fail" || finalStatus === "FAILED" || finalStatus === "fail") {
          setTimeout(() => {
            window.location.href = "/?payment=failed";
          }, 3000);
        } else {
          setProcessingStatus("⏳ Payment is being processed...");
          setTimeout(() => {
            window.location.href = "/?payment=pending";
          }, 3000);
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