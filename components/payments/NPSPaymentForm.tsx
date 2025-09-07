import { useSession } from "next-auth/react";
import { useState } from "react";
import { useNPS } from "@/utils/useNPS";
import { useContextElement } from "@/context/Context";

interface NPSPaymentFormProps {
  amount: number;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  orderData?: any;
  transactionRemarks?: string;
  disabled?: boolean;
  shippingRatesObtained?: boolean;
}

export default function NPSPaymentForm({ amount, onSuccess, onError, orderData, transactionRemarks, disabled = false, shippingRatesObtained = false }: NPSPaymentFormProps) {
  const { data: session } = useSession();
  const { userCurrency } = useContextElement();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the NPS hook with proper redirect handling
  const { initiate } = useNPS({
    onSuccess: (response) => {
      console.log('NPS Payment initiated successfully, redirecting to gateway...');
      onSuccess(response);
    },
    onError: (error) => {
      console.error('NPS Payment initiation failed:', error);
      onError(error);
    },
    orderData,
    autoRedirect: true // Enable automatic redirect to Nepal payment gateway
  });

  const handlePayment = async () => {
    if (!session?.user) {
      onError({ message: "Please sign in to continue with payment" });
      return;
    }

    setIsLoading(true);
    try {
      // Generate a unique merchant transaction ID
      const merchantTxnId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentRequest = {
        amount,
        merchantTxnId,
        transactionRemarks: transactionRemarks || `Payment for order ${merchantTxnId}`,
        customer_info: {
          name: session.user.name || '',
          email: session.user.email || '',
          phone: '' // You might want to get this from user profile
        }
      };

      // Use the NPS hook to initiate payment with proper redirect
      await initiate(paymentRequest);
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nps-payment-form">
      {!shippingRatesObtained && (
        <div style={{
          background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <span style={{ color: '#856404', fontSize: '14px', fontWeight: '500' }}>
            Please calculate shipping rates before proceeding with payment
          </span>
        </div>
      )}
      
      {/* Currency conversion notice - only show in USD mode */}
      {userCurrency === 'USD' && (
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>💱</span>
          <span style={{ color: '#1565c0', fontSize: '14px', fontWeight: '500' }}>
            Your amount is converted to Nepali currency for payment processing
          </span>
        </div>
      )}
      <button
        onClick={handlePayment}
        disabled={isLoading || !session?.user || disabled || !shippingRatesObtained}
        className="tf-btn btn-fill animate-hover-btn radius-3 justify-content-center fw-6"
        style={{
          opacity: (!shippingRatesObtained || disabled) ? 0.6 : 1,
          cursor: (!shippingRatesObtained || disabled) ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? "Processing..." : `Pay Rs.${amount}`}
      </button>
    </div>
  );
}