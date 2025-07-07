"use client";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, Suspense, useState } from "react";
import { fetchDataFromApi, updateUserBagWithPayment } from "@/utils/api";
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
  const merchantTxnId = searchParams?.get("MerchantTxnId") || "";
  const gatewayTxnId = searchParams?.get("GatewayTxnId") || "";
  const amount = searchParams?.get("Amount") || "";
  const status = searchParams?.get("Status") || "";
  const message = searchParams?.get("Message") || "";

  useEffect(() => {
    console.log("=== NPS CALLBACK REACHED ===");
    console.log("Status:", status);
    console.log("MerchantTxnId:", merchantTxnId);
    console.log("GatewayTxnId:", gatewayTxnId);
    console.log("User:", user?.id);

    const savePaymentData = async () => {
      try {
        // Show user-friendly status updates
        if (status === "SUCCESS") {
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
        } else {
          setProcessingStatus("⏳ Verifying payment status...");
        }

        // Only require user and transaction IDs
        if (!user || !merchantTxnId || !gatewayTxnId) {
          console.log("Missing required data:", { 
            user: !!user, 
            merchantTxnId: !!merchantTxnId, 
            gatewayTxnId: !!gatewayTxnId 
          });
          setProcessingStatus("❌ Missing payment information");
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
          return;
        }

        // Find the user's bag
        const currentUserData = await fetchDataFromApi(
          `/api/user-datas?filters[authUserId][$eq]=${user.id}&populate=user_bag`
        );

        if (!currentUserData?.data || currentUserData.data.length === 0) {
          console.log("User data not found");
          setProcessingStatus("❌ User account not found");
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
          return;
        }

        const userData = currentUserData.data[0];
        const userBag = userData.user_bag;

        if (!userBag || !userBag.documentId) {
          console.log("User bag not found");
          setProcessingStatus("❌ User shopping bag not found");
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
          return;
        }

        setProcessingStatus("🔍 Verifying payment with NPS...");

        // If we don't have status/amount from URL, check with NPS API
        let finalAmount = parseFloat(amount) || 0;
        let finalStatus = status;
        let finalProcessId = "";
        let finalInstitution = "";
        let finalInstrument = "";
        let finalServiceCharge = "";
        let finalCbsMessage = "";

        if (!status || !amount) {
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
        }

        // Prepare payment data for storage
        const paymentData: NPSPaymentData = {
          provider: "nps",
          processId: finalProcessId,
          merchantTxnId: merchantTxnId,
          gatewayReferenceNo: gatewayTxnId,
          amount: finalAmount,
          status: finalStatus === "Success" ? "Success" : finalStatus === "Fail" ? "Fail" : "Pending",
          institution: finalInstitution,
          instrument: finalInstrument,
          serviceCharge: finalServiceCharge,
          cbsMessage: finalCbsMessage,
          timestamp: generateLocalTimestamp(),
          webhook_processed: false, // This came from callback, not webhook
        };

        setProcessingStatus("💾 Saving payment information...");

        // Save payment data to user-bag
        await updateUserBagWithPayment(userBag.documentId, paymentData);
        console.log("Payment data saved successfully:", paymentData);
        
        // If payment is successful, create the order
        if (finalStatus === "Success" || finalStatus === "SUCCESS") {
          setProcessingStatus("📦 Creating your order...");
          
          try {
            // Fetch the user bag to get the stored order data
            const bagWithPayments = await fetchDataFromApi(`/api/user-bags/${userBag.documentId}?populate=*`);
            
            console.log("=== DEBUGGING ORDER DATA RETRIEVAL ===");
            console.log("Full bag data:", bagWithPayments.data);
            console.log("Bag user_orders:", bagWithPayments.data?.user_orders);
            console.log("Payments in user_orders:", bagWithPayments.data?.user_orders?.payments);
            
            // Payments are stored in user_orders.payments, not directly in data.payments
            if (bagWithPayments?.data?.user_orders?.payments) {
              console.log("Looking for payment with merchantTxnId:", merchantTxnId);
              
              // Find the payment data that matches this transaction
              const matchingPayment = bagWithPayments.data.user_orders.payments.find(
                (payment) => {
                  console.log("Checking payment:", {
                    paymentMerchantTxnId: payment.merchantTxnId,
                    paymentProvider: payment.provider,
                    hasOrderData: !!payment.orderData,
                    orderDataKeys: payment.orderData ? Object.keys(payment.orderData) : null
                  });
                  return payment.merchantTxnId === merchantTxnId && payment.provider === "nps";
                }
              );
              
              console.log("Matching payment found:", !!matchingPayment);
              if (matchingPayment) {
                console.log("Matching payment details:", matchingPayment);
                console.log("Order data in matching payment:", matchingPayment.orderData);
              }
              
              if (matchingPayment && matchingPayment.orderData) {
                console.log("Found matching payment with order data:", matchingPayment);
                
                // No need to update orderData since payment status is already handled in the main payment object
                console.log("Order data available:", matchingPayment.orderData);
                console.log("Payment data:", paymentData);
                
                // Clear only the purchased items from the cart after successful payment
                setProcessingStatus("🛒 Removing purchased items from cart...");
                console.log("=== ATTEMPTING TO CLEAR PURCHASED ITEMS FROM CART AFTER PAYMENT ===");
                console.log("User ID:", user?.id);
                console.log("ClearPurchasedItemsFromCart function available:", typeof clearPurchasedItemsFromCart);
                console.log("Order data products:", matchingPayment.orderData?.products);
                console.log("Full order data:", JSON.stringify(matchingPayment.orderData, null, 2));
                
                try {
                  // Extract the purchased products from the order data
                  const purchasedProducts = matchingPayment.orderData?.products || [];
                  console.log("Purchased products to remove from cart:", purchasedProducts.length);
                  
                  if (purchasedProducts.length > 0) {
                    await clearPurchasedItemsFromCart(purchasedProducts);
                    console.log("✅ Purchased items cleared successfully from cart after payment");
                  } else {
                    console.log("⚠️ No purchased products found in order data");
                  }
                } catch (cartError) {
                  console.error("❌ Error clearing purchased items from cart after payment:", cartError);
                  // Don't fail the entire process if cart clearing fails
                }
                
                setProcessingStatus("✅ Payment successful!");
              } else if (matchingPayment && !matchingPayment.orderData) {
                console.warn("Found matching payment but no order data");
                setProcessingStatus("⚠️ Payment successful but order data missing from payment record");
              } else {
                console.warn("No matching payment found");
                console.log("Available payments:", bagWithPayments.data.user_orders.payments);
                setProcessingStatus("⚠️ Payment successful but matching payment record not found");
              }
            } else {
              console.warn("No payments found in user bag user_orders");
              console.log("Bag structure:", bagWithPayments.data);
              setProcessingStatus("⚠️ Payment successful but no payments in bag");
            }
          } catch (orderError) {
            console.error("Error creating order:", orderError);
            setProcessingStatus("⚠️ Payment successful but failed to create order");
          }
        }
        
        // Show success and redirect based on payment status
        if (finalStatus === "Success" || finalStatus === "SUCCESS") {
          setTimeout(() => {
            window.location.href = "/?payment=success";
          }, 3000); // Give time to show order creation status
        } else if (finalStatus === "Fail" || finalStatus === "FAILED") {
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