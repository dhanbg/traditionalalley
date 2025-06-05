"use client";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, Suspense, useState } from "react";
import { fetchDataFromApi, updateUserBagWithPayment } from "@/utils/api";
const { generateLocalTimestamp } = require("@/utils/timezone");
import type { PaymentData, PaymentLookupResponse } from "@/types/khalti";
import axios from "axios";

// Wrapper component that uses searchParams
const KhaltiCallbackContent = () => {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingStatus, setProcessingStatus] = useState("Processing your payment...");

  // Extract payment data from URL parameters
  const purchaseOrderName = searchParams?.get("purchase_order_name") || "";
  const amount = searchParams?.get("amount") || "";
  const purchaseOrderId = searchParams?.get("purchase_order_id") || "";
  const transactionId = searchParams?.get("transaction_id") || "";
  const mobile = searchParams?.get("mobile") || "";
  const status = searchParams?.get("status") || "";
  const pidx = searchParams?.get("pidx") || "";

  useEffect(() => {
    console.log("=== KHALTI CALLBACK REACHED ===");
    console.log("Status:", status);
    console.log("PIDX:", pidx);
    console.log("User:", user?.id);

    const savePaymentData = async () => {
      // Show user-friendly status updates
      if (status === "Completed") {
        setProcessingStatus("✅ Payment successful! Saving your order...");
      } else if (status === "User canceled") {
        setProcessingStatus("❌ Payment was cancelled");
        setTimeout(() => {
          window.location.href = "/?payment=cancelled";
        }, 2000);
        return;
      } else {
        setProcessingStatus("⏳ Verifying payment status...");
      }

      // Only require user and pidx
      if (!user || !pidx) {
        console.log("Missing required data:", { user: !!user, pidx: !!pidx });
        setProcessingStatus("❌ Missing payment information");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
        return;
      }

      try {
        // Find the user's bag
        const currentUserData = await fetchDataFromApi(
          `/api/user-datas?filters[clerkUserId][$eq]=${user.id}&populate=user_bag`
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

        setProcessingStatus("🔍 Verifying payment with Khalti...");

        // Get the most up-to-date payment status from Khalti
        let paymentLookupData: PaymentLookupResponse | null = null;
        try {
          console.log("Looking up payment status for pidx:", pidx);
          const lookupResponse = await axios.post<PaymentLookupResponse>('/api/khalti-lookup', { pidx });
          paymentLookupData = lookupResponse.data;
          console.log("Khalti lookup response:", paymentLookupData);
        } catch (lookupError) {
          console.error("Error looking up payment status:", lookupError);
          // Continue with URL parameters if lookup fails
        }

        // Use lookup data if available, otherwise fall back to URL parameters
        const finalPaymentData = {
          pidx: pidx,
          transactionId: paymentLookupData?.transaction_id || transactionId || "",
          amount: paymentLookupData?.total_amount || parseInt(amount) || 0,
          status: paymentLookupData?.status || status || "Initiated",
          purchaseOrderId: paymentLookupData?.purchase_order_id || purchaseOrderId,
          purchaseOrderName: paymentLookupData?.purchase_order_name || purchaseOrderName,
          mobile: paymentLookupData?.mobile || mobile || "",
        };

        console.log("Final payment data:", finalPaymentData);

        // Prepare payment data for storage
        const paymentData: PaymentData = {
          provider: "khalti",
          pidx: finalPaymentData.pidx,
          transactionId: finalPaymentData.transactionId,
          amount: finalPaymentData.amount,
          status: finalPaymentData.status,
          purchaseOrderId: finalPaymentData.purchaseOrderId,
          purchaseOrderName: finalPaymentData.purchaseOrderName,
          mobile: finalPaymentData.mobile,
          timestamp: generateLocalTimestamp(),
          webhook_processed: false, // This came from callback, not webhook
        };

        setProcessingStatus("💾 Saving payment information...");

        // Save payment data to user-bag
        await updateUserBagWithPayment(userBag.documentId, paymentData);
        console.log("Payment data saved successfully:", paymentData);
        
        // Show success and redirect based on payment status
        if (finalPaymentData.status === "Completed") {
          setProcessingStatus("✅ Payment completed successfully!");
          setTimeout(() => {
            window.location.href = "/account?payment=success";
          }, 2000);
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
  }, [user, transactionId, pidx, amount, status, purchaseOrderId, purchaseOrderName, mobile]);

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

// Main page component with Suspense boundary
const KhaltiCallbackPage = () => {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Loading...</p>
      </div>
    }>
      <KhaltiCallbackContent />
    </Suspense>
  );
};

export default KhaltiCallbackPage;