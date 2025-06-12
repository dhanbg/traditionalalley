import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useNPS } from "../../utils/useNPS";
import type { NPSOrderData } from "../../types/nps";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface NPSPaymentFormProps {
  product: Product;
  orderData?: NPSOrderData;
  formData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    street: string;
    state: string;
    postalCode: string;
    note: string;
  };
}

const NPSPaymentForm = ({ product, orderData, formData }: NPSPaymentFormProps) => {
  const { user } = useUser();
  const [userBagDocumentId, setUserBagDocumentId] = useState<string | null>(null);
  
  const { initiate, initiationError, isLoading, getUserBagDocumentId } = useNPS({
    onSuccess: (response) => {
      console.log("NPS payment initiated successfully:", response);
      // Payment will redirect to NPS gateway automatically
    },
    onError: (error) => {
      console.error("NPS payment error:", error.message);
      alert(`Payment failed: ${error.message}`);
    },
    autoRedirect: true, // Automatically redirect to NPS gateway
    userBagDocumentId: userBagDocumentId || undefined,
    orderData: orderData,
  });

  // Get user's bag documentId when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserBagId = async () => {
      // Don't fetch if we already have the userBagDocumentId or if user is not available
      if (!user?.id || userBagDocumentId) {
        return;
      }
      
      try {
        const bagDocumentId = await getUserBagDocumentId(user.id);
        
        // Only update state if component is still mounted and we don't already have the ID
        if (isMounted && !userBagDocumentId) {
          setUserBagDocumentId(bagDocumentId);
          console.log("User bag documentId:", bagDocumentId);
        }
      } catch (error) {
        console.error("Error fetching user bag documentId:", error);
        // Continue without user bag if it fails
      }
    };

    fetchUserBagId();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Remove getUserBagDocumentId from dependencies to prevent re-runs

  const handlePayment = async () => {
    if (!product || !user) {
      alert("Please log in to make a payment");
      return;
    }

    // Validate required form fields if formData is provided
    if (formData) {
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'street'];
      const missingFields = requiredFields.filter(field => !formData[field]?.trim());
      
      if (missingFields.length > 0) {
        alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
      }
    }

    try {
      // Use form data if available, otherwise fall back to user data
      const customerName = formData 
        ? `${formData.firstName} ${formData.lastName}`.trim()
        : `${user.firstName || ""} ${user.lastName || ""}`.trim();
      
      const customerEmail = formData?.email || user.primaryEmailAddress?.emailAddress || "";
      const customerPhone = formData?.phone || "";
      
      // Generate unique merchant transaction ID
      const merchantTxnId = `order-${product.id}-${Date.now()}-${user.id}`;
      
      const paymentRequest = {
        amount: product.price, // Amount in NPR
        merchantTxnId: merchantTxnId,
        transactionRemarks: `Payment for ${product.name}`,
        customer_info: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
      };
      
      console.log("=== INITIATING NPS PAYMENT ===");
      console.log("Payment request:", paymentRequest);
      console.log("Order data:", orderData);
      
      await initiate(paymentRequest);
      
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      // Error is already handled by the hook's onError callback
    }
  };

  return (
    <>
      {/* Error display */}
      {initiationError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">Error: {initiationError.message}</p>
        </div>
      )}

      {/* Payment button */}
      <button 
        onClick={handlePayment} 
        disabled={isLoading || !user}
        className="tf-btn btn-reset"
        style={{ 
          background: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || !user ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          transition: 'background 0.2s',
          width: '100%'
        }}
      >
        {isLoading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div 
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }}
            ></div>
            Processing payment...
          </span>
        ) : (
          `Pay with NPS (NPR ${product.price})`
        )}
      </button>

      {/* Login warning if not logged in */}
      {!user && (
        <p className="mt-3 text-xs text-red-500 text-center">
          Please log in to make a payment
        </p>
      )}

      {/* Payment info */}
      <div className="mt-3 text-xs text-gray-600 text-center">
        <p>🔒 Secure payment powered by Nepal Payment Solution</p>
        <p>You will be redirected to NPS gateway to complete the payment</p>
      </div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default NPSPaymentForm; 