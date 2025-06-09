import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useKhalti } from "../../utils/useKhalti";
import type { OrderData } from "../../types/khalti";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface KhaltiPaymentFormProps {
  product: Product;
  orderData?: OrderData;
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

const KhaltiPaymentForm = ({ product, orderData, formData }: KhaltiPaymentFormProps) => {
  const { user } = useUser();
  const [userBagDocumentId, setUserBagDocumentId] = useState<string | null>(null);
  
  const { initiate, initiationError, isLoading, getUserBagDocumentId } = useKhalti({
    onSuccess: (response) => {
      // Let Khalti handle the redirect naturally - don't override it
      console.log("Payment initiated successfully:", response);
    },
    onError: (error) => {
      console.error("Payment error:", error.message);
    },
    userBagDocumentId: userBagDocumentId || undefined,
    orderData: orderData, // Pass order data to the hook
  });

  // Get user's bag documentId when component mounts
  useEffect(() => {
    const fetchUserBagId = async () => {
      if (user?.id) {
        try {
          const bagDocumentId = await getUserBagDocumentId(user.id);
          setUserBagDocumentId(bagDocumentId);
          console.log("User bag documentId:", bagDocumentId);
        } catch (error) {
          console.error("Error fetching user bag documentId:", error);
        }
      }
    };

    fetchUserBagId();
  }, [user, getUserBagDocumentId]);

  const handlePayment = () => {
    if (product && user) {
      // Validate required form fields if formData is provided
      if (formData) {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'street'];
        const missingFields = requiredFields.filter(field => !formData[field]?.trim());
        
        if (missingFields.length > 0) {
          alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
          return;
        }
      }

      // Use form data if available, otherwise fall back to user data
      const customerName = formData 
        ? `${formData.firstName} ${formData.lastName}`.trim()
        : `${user.firstName || ""} ${user.lastName || ""}`.trim();
      
      const customerEmail = formData?.email || user.primaryEmailAddress?.emailAddress || "";
      const customerPhone = formData?.phone || "";
      
      // Get the current domain dynamically
      const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      
      const paymentRequest = {
        amount: product.price * 100, // NPR to paisa
        purchase_order_id: `order-${product.id}-${Date.now()}-${user.id}`,
        purchase_order_name: product.name,
        customer_info: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        return_url: `${currentDomain}/khalti-callback`,
        website_url: currentDomain,
      };
      
      console.log("=== INITIATING KHALTI PAYMENT ===");
      console.log("Payment request:", paymentRequest);
      console.log("Return URL:", paymentRequest.return_url);
      console.log("Order data:", orderData);
      
      initiate(paymentRequest);
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
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing payment...
          </span>
        ) : (
          `Pay with Khalti`
        )}
      </button>

      {/* Login warning if not logged in */}
      {!user && (
        <p className="mt-3 text-xs text-red-500 text-center">
          Please log in to make a payment
        </p>
      )}
    </>
  );
};

export default KhaltiPaymentForm;