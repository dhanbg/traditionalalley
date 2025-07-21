import { useSession } from "next-auth/react";
import { useState } from "react";

interface NPSPaymentFormProps {
  amount: number;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  orderData?: any;
  transactionRemarks?: string;
}

export default function NPSPaymentForm({ amount, onSuccess, onError, orderData, transactionRemarks }: NPSPaymentFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!session?.user) {
      onError({ message: "Please sign in to continue with payment" });
      return;
    }

    setIsLoading(true);
    try {
      // Generate a unique merchant transaction ID
      const merchantTxnId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch("/api/nps-initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          merchantTxnId,
          transactionRemarks: transactionRemarks || `Payment for order ${merchantTxnId}`,
          customer_info: {
            name: session.user.name || '',
            email: session.user.email || '',
            phone: '' // You might want to get this from user profile
          },
          orderData
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        onSuccess(data);
      } else {
        onError(data);
      }
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nps-payment-form">
      <button
        onClick={handlePayment}
        disabled={isLoading || !session?.user}
        className="tf-btn btn-fill animate-hover-btn radius-3 justify-content-center fw-6"
      >
        {isLoading ? "Processing..." : `Pay $${amount} with NPS`}
      </button>
    </div>
  );
} 