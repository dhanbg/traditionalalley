export interface PaymentRequest {
  amount: number;
  purchase_order_id: string;
  purchase_order_name: string;
  return_url: string;
  website_url: string;
  customer_info: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface PaymentInitiateResponse {
  pidx: string;
  payment_url: string;
}

export interface PaymentLookupResponse {
  transaction_id: string;
  status: "Completed" | "Pending" | "Failed";
  total_amount: number;
  purchase_order_id: string;
  purchase_order_name: string;
  mobile?: string;
}

export interface PaymentData {
  provider: string;
  pidx: string;
  transactionId: string;
  amount: number;
  status: string;
  purchaseOrderId: string;
  purchaseOrderName: string;
  mobile?: string;
  timestamp: string;
}

export interface UserBagPayload {
  payments?: PaymentData[];
  [key: string]: any; // Allow for future extensions
}

export interface UseKhaltiOptions {
  onSuccess?: (response: PaymentLookupResponse) => void;
  onError?: (error: Error) => void;
  autoRedirect?: boolean;
  userBagDocumentId?: string;
} 