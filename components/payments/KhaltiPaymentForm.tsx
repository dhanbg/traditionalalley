import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useKhalti } from "../../utils/useKhalti";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface KhaltiPaymentFormProps {
  product: Product;
}

const KhaltiPaymentForm = ({ product }: KhaltiPaymentFormProps) => {
  const { user } = useUser();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [userBagDocumentId, setUserBagDocumentId] = useState<string | null>(null);
  
  const { initiate, initiationError, isLoading, getUserBagDocumentId } = useKhalti({
    onSuccess: (response) => {
      window.location.href = `/khalti-callback?purchase_order_id=${response.purchase_order_id}`;
    },
    onError: (error) => {
      console.error("Payment error:", error.message);
    },
    userBagDocumentId: userBagDocumentId || undefined,
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

  // Pre-fill customer info if user is logged in
  useEffect(() => {
    if (user) {
      setCustomerName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
      setCustomerEmail(user.primaryEmailAddress?.emailAddress || "");
      // Phone number would need to be stored in user profile or entered manually
    }
  }, [user]);

  const handlePayment = () => {
    if (product) {
      const paymentRequest = {
        amount: product.price * 100, // NPR to paisa
        purchase_order_id: `order-${product.id}-${Date.now()}`,
        purchase_order_name: product.name,
        customer_info: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        return_url: "http://localhost:3000/khalti-callback",
        website_url: "http://localhost:3000",
      };
      initiate(paymentRequest);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
      
      {/* User bag status */}
      {user && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            User: {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-gray-600">
            Bag ID: {userBagDocumentId || "Loading..."}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input 
            type="text"
            value={customerName} 
            onChange={e => setCustomerName(e.target.value)} 
            placeholder="Enter your full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input 
            type="email"
            value={customerEmail} 
            onChange={e => setCustomerEmail(e.target.value)} 
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input 
            type="tel"
            value={customerPhone} 
            onChange={e => setCustomerPhone(e.target.value)} 
            placeholder="Enter your phone number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Product info */}
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-sm font-medium">Product: {product.name}</p>
        <p className="text-sm text-gray-600">Amount: NPR {product.price}</p>
      </div>

      {/* Error display */}
      {initiationError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">Error: {initiationError.message}</p>
        </div>
      )}

      {/* Payment button */}
      <button 
        onClick={handlePayment} 
        disabled={isLoading || !customerName || !customerEmail || !customerPhone}
        className="w-full mt-6 bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing payment...
          </span>
        ) : (
          `Pay NPR ${product.price} with Khalti`
        )}
      </button>

      {/* Note about payment tracking */}
      {userBagDocumentId && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          Payment details will be saved to your account for tracking
        </p>
      )}
    </div>
  );
};

export default KhaltiPaymentForm; 