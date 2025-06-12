// ============= NPS API Request Types =============

// Base API Request
export interface NPSBaseRequest {
  MerchantId: string;
  MerchantName: string;
  Signature: string;
}

// Get Payment Instrument Details Request
export interface GetPaymentInstrumentDetailsRequest extends NPSBaseRequest {}

// Get Service Charge Request  
export interface GetServiceChargeRequest extends NPSBaseRequest {
  Amount: string;
  InstrumentCode: string;
}

// Get Process Id Request
export interface GetProcessIdRequest extends NPSBaseRequest {
  Amount: string;
  MerchantTxnId: string;
}

// Check Transaction Status Request
export interface CheckTransactionStatusRequest extends NPSBaseRequest {
  MerchantTxnId: string;
}

// Gateway Redirect Form Data
export interface GatewayRedirectForm {
  MerchantId: string;
  MerchantName: string;
  Amount: string;
  MerchantTxnId: string;
  TransactionRemarks?: string;
  InstrumentCode?: string;
  ProcessId: string;
  ResponseUrl?: string;
  Signature: string;
}

// ============= NPS API Response Types =============

// Base API Response
export interface NPSBaseResponse {
  code: "0" | "1" | "2";
  message: string;
  errors: Array<{
    error_code: string;
    error_message: string;
  }>;
}

// Payment Instrument Details Response
export interface PaymentInstrumentDetails {
  InstitutionName: string;
  InstrumentName: string;
  InstrumentCode: string;
  InstrumentValue: string | null;
  LogoUrl: string;
  BankUrl: string;
  BankType: string;
}

export interface GetPaymentInstrumentDetailsResponse extends NPSBaseResponse {
  data: PaymentInstrumentDetails[];
}

// Service Charge Response
export interface ServiceChargeData {
  Amount: string;
  CommissionType: string;
  ChargeValue: string;
  TotalChargeAmount: number;
}

export interface GetServiceChargeResponse extends NPSBaseResponse {
  data: ServiceChargeData;
}

// Process Id Response
export interface ProcessIdData {
  ProcessId: string;
}

export interface GetProcessIdResponse extends NPSBaseResponse {
  data: ProcessIdData;
}

// Transaction Status Response
export interface TransactionStatusData {
  GatewayReferenceNo: string;
  Amount: string;
  ServiceCharge: string;
  TransactionRemarks: string;
  TransactionRemarks2: string;
  TransactionRemarks3: string;
  ProcessId: string;
  TransactionDate: string;
  MerchantTxnId: string;
  CbsMessage: string;
  Status: "Success" | "Fail" | "Pending";
  Institution: string;
  Instrument: string;
  PaymentCurrency: string;
  ExchangeRate: string;
}

export interface CheckTransactionStatusResponse extends NPSBaseResponse {
  data: TransactionStatusData;
}

// ============= Payment Integration Types =============

// Payment Request for frontend
export interface NPSPaymentRequest {
  amount: number;
  merchantTxnId: string;
  transactionRemarks?: string;
  instrumentCode?: string;
  customer_info?: {
    name: string;
    email: string;
    phone: string;
  };
}

// Payment data stored in user bag
export interface NPSPaymentData {
  provider: "nps";
  processId: string;
  merchantTxnId: string;
  gatewayReferenceNo?: string;
  amount: number;
  status: "Success" | "Fail" | "Pending";
  transactionDate?: string;
  institution?: string;
  instrument?: string;
  serviceCharge?: string;
  cbsMessage?: string;
  timestamp: string;
  webhook_processed?: boolean;
  orderData?: NPSOrderData;
}

// Order data structure
export interface NPSOrderData {
  products: Array<{
    size: string;
    color: string;
    discount: number;
    quantity: number;
    subtotal: number;
    unitPrice: number;
    documentId: string;
    finalPrice: number;
  }>;
  shippingPrice: number;
  receiver_details: {
    note: string;
    email: string;
    phone: string;
    address: {
      city: string;
      state: string;
      street: string;
      country: string;
      postalCode: string;
    };
    lastName: string;
    firstName: string;
  };
}

// User bag payload
export interface NPSUserBagPayload {
  payments?: NPSPaymentData[];
  [key: string]: any;
}

// Hook options
export interface UseNPSOptions {
  onSuccess?: (response: TransactionStatusData) => void;
  onError?: (error: Error) => void;
  autoRedirect?: boolean;
  userBagDocumentId?: string;
  orderData?: NPSOrderData;
}

// Webhook notification payload
export interface NPSWebhookPayload {
  MerchantTxnId: string;
  GatewayTxnId: string;
}

// Response URL payload
export interface NPSResponsePayload {
  MerchantTxnId: string;
  GatewayTxnId: string;
} 