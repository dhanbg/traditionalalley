# Khalti Payment Gateway Integration Documentation

**Project Type:** Next.js (with App Router) & TypeScript

This document outlines the steps and code structure for integrating the Khalti Payment Gateway into the TraditionalAlley Next.js application. The integration allows users to make payments via Khalti for their orders.

## Table of Contents

1.  **Prerequisites**
2.  **Environment Variables**
3.  **File Structure Overview**
4.  **Step-by-Step Integration**
    1.  Khalti Configuration
    2.  TypeScript Type Definitions
    3.  Server-Side API Route for Payment Initiation
    4.  Custom React Hook for Khalti Logic
    5.  Khalti Payment Form Component
    6.  Khalti Callback Page (Success/Status Page)
    7.  Integrating the Payment Form into Checkout
5.  **Workflow Overview**
6.  **Testing**
7.  **Future Enhancements / Security Considerations**

---

## 1. Prerequisites

*   A Khalti Merchant Account (Sandbox account for testing, Production account for live).
    *   Sandbox Signup: `https://dev.khalti.com/`
    *   Production Signup: `https://khalti.com/`
*   Axios library installed in the project: `pnpm install axios` (or `npm install axios` / `yarn add axios`).
*   Next.js project initialized.

---

## 2. Environment Variables

Create or update your `.env` file in the root of your `traditionalalley` project with the following Khalti secret key. **This key is used server-side and should NOT be prefixed with `NEXT_PUBLIC_`.**

```env
# .env

# ... other environment variables ...

KHALTI_SECRET_KEY=your_actual_khalti_test_secret_key_here # For sandbox
# KHALTI_SECRET_KEY=your_actual_khalti_live_secret_key_here # For production (when going live)

# Note: For the client-side khaltiConfig.ts (if baseUrl or public key were needed there),
# you would use NEXT_PUBLIC_ prefixed variables. However, for the secret key used
# in the API route, it MUST NOT be public.
```

**Important:** After adding or modifying `.env` variables, you **must restart your Next.js development server** for the changes to take effect.

---

## 3. File Structure Overview

The following files and directories will be created or modified:

```
traditionalalley/
├── app/
│   └── khalti-callback/
│       └── page.tsx        # Handles redirect from Khalti after payment
├── components/
│   ├── otherPages/
│   │   └── Checkout.jsx    # Existing checkout page, to integrate Khalti form
│   └── payments/
│       └── KhaltiPaymentForm.tsx # UI for Khalti payment
├── pages/
│   └── api/
│       └── khalti-initiate.ts # Server-side API route to securely call Khalti
├── types/
│   └── khalti.d.ts         # TypeScript definitions for Khalti
├── utils/
│   ├── khaltiConfig.ts     # Basic Khalti client-side config (e.g., URLs)
│   └── useKhalti.ts        # Custom React hook for Khalti payment logic
└── .env                      # Environment variables (contains KHALTI_SECRET_KEY)
```

---

## 4. Step-by-Step Integration

### 4.1. Khalti Configuration

This file primarily sets up the base URL for Khalti's API. The secret key handling is now server-side.

**`traditionalalley/utils/khaltiConfig.ts`**:

```typescript
import axios from "axios";

// This configuration is mostly for client-side reference if needed,
// like base URLs or public keys (if Khalti's flow required them client-side).
// The actual secret key is now used server-side.
export const KHALTI_CONFIG = {
  baseUrl: "https://dev.khalti.com/api/v2", // Sandbox environment
  // For production, change to: "https://khalti.com/api/v2"
  // secretKey: process.env.NEXT_PUBLIC_KHALTI_SECRET_KEY ?? "", // Example if public key was needed
} as const;

// This specific Axios client instance (khaltiClient) is not strictly used
// by the frontend anymore for initiating payments, as that's now proxied.
// However, it can be kept for other potential client-side Khalti calls that don't require a secret key.
export const khaltiClient = axios.create({
  baseURL: KHALTI_CONFIG.baseUrl,
  // Headers for client-side calls that might not need secret key authorization
  headers: {
    "Content-Type": "application/json",
  },
});
```

### 4.2. TypeScript Type Definitions

Define interfaces for Khalti API requests and responses to ensure type safety.

**`traditionalalley/types/khalti.d.ts`**:

```typescript
export interface PaymentRequest {
  amount: number; // Amount in paisa (1 NPR = 100 paisa)
  purchase_order_id: string; // Your unique order ID
  purchase_order_name: string; // Product or order name
  return_url: string; // Where to redirect after payment
  website_url: string; // Your website URL
  customer_info: {
    name: string;
    email: string;
    phone: string;
  };
  // Optional fields as per Khalti docs
  amount_breakdown?: Array<{ label: string; amount: number }>;
  product_details?: Array<{
    identity: string;
    name: string;
    total_price: number;
    quantity: number;
    unit_price: number;
  }>;
  merchant_username?: string;
  merchant_extra?: string;
}

export interface PaymentInitiateResponse {
  pidx: string; // Payment ID from Khalti
  payment_url: string; // URL where user will make payment
  expires_at?: string;
  expires_in?: number;
  // Include any other fields from Khalti's success response for initiate
}

export interface PaymentLookupResponse {
  pidx: string;
  total_amount: number;
  status: "Completed" | "Pending" | "Initiated" | "Refunded" | "Expired" | "User canceled" | "Failed"; // Match Khalti's status strings
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
  purchase_order_id?: string;     // Typically returned on lookup
  purchase_order_name?: string;   // Typically returned on lookup
  mobile?: string;                // Payer's Khalti ID, if available
  // Include any other fields from Khalti's lookup response
}

// This type is used by the useKhalti hook
export interface UseKhaltiOptions {
  onSuccess?: (response: PaymentLookupResponse) => void; // Callback on successful payment lookup
  onError?: (error: Error) => void; // Callback on error
  autoRedirect?: boolean; // Whether to automatically redirect to Khalti's payment_url
}
```

### 4.3. Server-Side API Route for Payment Initiation

Create a Next.js API route to securely handle the payment initiation. This route will use the `KHALTI_SECRET_KEY` from your environment variables.

**`traditionalalley/pages/api/khalti-initiate.ts`**:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import type { PaymentInitiateResponse } from '@/types/khalti'; // Adjust path if necessary

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentInitiateResponse | { error: string; details?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.KHALTI_SECRET_KEY;
  if (!secretKey) {
    console.error("Khalti secret key is not defined in environment variables.");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const khaltiApiUrl = "https://dev.khalti.com/api/v2/epayment/initiate/";
  // For production, change to: "https://khalti.com/api/v2/epayment/initiate/"

  try {
    const khaltiResponse = await fetch(khaltiApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body), // Forward the request body from the client
    });

    const data = await khaltiResponse.json();

    if (!khaltiResponse.ok) {
      console.error("Khalti API Error:", data);
      // Try to pass Khalti's error message if available
      const errorMessage = data?.detail || data?.error_key || `Khalti API responded with status ${khaltiResponse.status}`;
      return res.status(khaltiResponse.status).json({ error: errorMessage, details: JSON.stringify(data) });
    }

    res.status(200).json(data as PaymentInitiateResponse);

  } catch (error) {
    console.error("Error calling Khalti initiate API:", error);
    res.status(500).json({ error: 'Internal server error during Khalti payment initiation.', details: (error instanceof Error) ? error.message : String(error) });
  }
}
```

### 4.4. Custom React Hook for Khalti Logic

This hook manages the state for payment initiation and will call our backend API route.

**`traditionalalley/utils/useKhalti.ts`**:

```typescript
import { useState } from "react";
import axios, { AxiosError } from "axios";
// KHALTI_CONFIG can be used here if you need the baseUrl for constructing URLs, etc.
// import { KHALTI_CONFIG } from "./khaltiConfig";
import type {
  PaymentRequest,
  PaymentInitiateResponse,
  PaymentLookupResponse, // Keep for future lookup implementation
  UseKhaltiOptions,
} from "../types/khalti"; // Adjust path if necessary

export function useKhalti({
  onSuccess, // This would be used if checkPaymentStatus is implemented and called
  onError,
  autoRedirect = true,
}: UseKhaltiOptions = {}) {
  const [pidx, setPidx] = useState<string | null>(null);
  const [initiationError, setInitiationError] = useState<Error | null>(null);
  const [statusError, setStatusError] = useState<Error | null>(null); // For payment lookup
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initiate = async (data: PaymentRequest) => {
    setIsLoading(true);
    setInitiationError(null);
    try {
      // Call your own backend API route
      const response = await axios.post<PaymentInitiateResponse>(
        "/api/khalti-initiate", // Endpoint of your Next.js API route
        data
      );

      const paymentResponse = response.data;

      if (paymentResponse.pidx && paymentResponse.payment_url) {
        setPidx(paymentResponse.pidx);
        if (autoRedirect) {
          window.location.href = paymentResponse.payment_url;
        }
        return paymentResponse;
      } else {
        // Handle cases where pidx or payment_url might be missing from a successful-looking response
        const error = new Error( (paymentResponse as any)?.error || "Invalid response from payment initiation server.");
        setInitiationError(error);
        onError?.(error);
        return undefined; // Or throw error
      }

    } catch (error) {
      let processedError: Error;
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const serverErrorMessage = axiosError.response?.data?.error || axiosError.response?.data?.detail || axiosError.message;
        processedError = new Error(`Payment initiation failed: ${serverErrorMessage}`);
        console.error("Payment Initiation Axios Error:", axiosError.response?.data || axiosError.message);
      } else {
        processedError = error as Error;
        console.error("Payment Initiation General Error:", error);
      }
      setInitiationError(processedError);
      onError?.(processedError);
      return undefined; // Or throw error
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for payment status check - to be implemented securely via another backend API route
  const checkPaymentStatus = async (paymentId: string) => {
    if (!paymentId) {
      setStatusError(new Error("Payment ID (pidx) is required for status check."));
      return;
    }
    setIsLoading(true);
    setStatusError(null);
    try {
      // TODO: Implement a backend API route like /api/khalti-lookup
      // const response = await axios.post<PaymentLookupResponse>("/api/khalti-lookup", { pidx: paymentId });
      // const paymentStatus = response.data;
      // if (paymentStatus.status === "Completed") {
      //   onSuccess?.(paymentStatus);
      // }
      // return paymentStatus;
      console.warn("checkPaymentStatus is not fully implemented yet. Needs a secure backend proxy.");
      alert("Payment status check needs to be implemented via a backend API route for security.");
    } catch (error) {
      setStatusError(error as Error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiate,
    checkPaymentStatus, // Expose for future use
    pidx,
    initiationError,
    statusError,
    isLoading,
  };
}
```

### 4.5. Khalti Payment Form Component

This component provides the UI for users to enter their details and initiate payment.

**`traditionalalley/components/payments/KhaltiPaymentForm.tsx`**:

```tsx
"use client"; // This component uses useState and event handlers

import { useState } from "react";
import { useKhalti } from "../../utils/useKhalti"; // Adjust path if necessary
import type { PaymentRequest } from "../../types/khalti"; // Adjust path if necessary

interface ProductInfo {
  id: string;
  name: string;
  price: number; // Price in NPR
}

interface KhaltiPaymentFormProps {
  product: ProductInfo; // Or cart/order summary
}

const KhaltiPaymentForm = ({ product }: KhaltiPaymentFormProps) => {
  // It's good practice to get customer details from a logged-in user context or form fields
  const [customerName, setCustomerName] = useState("Test Customer"); // Placeholder
  const [customerEmail, setCustomerEmail] = useState("test@example.com"); // Placeholder
  const [customerPhone, setCustomerPhone] = useState("9800000000"); // Placeholder

  const { initiate, initiationError, isLoading } = useKhalti({
    // onSuccess callback would be for checkPaymentStatus, not directly for initiate's redirect
    onError: (error) => {
      console.error("Khalti Payment Error Hook:", error.message);
      // Display user-friendly error message, e.g., using a toast notification
      alert(`Payment Error: ${error.message}`);
    },
    autoRedirect: true, // Automatically redirect to Khalti
  });

  const handlePayment = async () => {
    if (!product || product.price <= 0) {
      alert("Invalid product or price for payment.");
      return;
    }

    const siteBaseUrl = window.location.origin; // e.g., http://localhost:3000

    const paymentRequestData: PaymentRequest = {
      amount: product.price * 100, // Convert NPR to paisa
      purchase_order_id: `TA-${product.id}-${Date.now()}`, // Ensure unique order ID
      purchase_order_name: product.name,
      customer_info: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      return_url: `${siteBaseUrl}/khalti-callback`, // Your callback page
      website_url: siteBaseUrl, // Your website's root URL
    };

    await initiate(paymentRequestData);
    // Redirection is handled by the hook if successful
  };

  return (
    <div style={{ border: '1px solid #eee', padding: '20px', marginTop: '20px' }}>
      <h4>Pay with Khalti</h4>
      {/* Basic form fields for demonstration. In a real app, these might be pre-filled or more robust. */}
      <div>
        <label>Name: </label>
        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full Name" />
      </div>
      <div style={{margin: '10px 0'}}>
        <label>Email: </label>
        <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="Email Address" />
      </div>
      <div>
        <label>Phone: </label>
        <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone Number" />
      </div>
      <button onClick={handlePayment} disabled={isLoading} style={{marginTop: '15px', padding: '10px 15px'}}>
        {isLoading ? "Processing..." : `Pay NPR ${product.price.toFixed(2)} with Khalti`}
      </button>
      {initiationError && <p style={{ color: "red", marginTop: '10px' }}>Error: {initiationError.message}</p>}
    </div>
  );
};

export default KhaltiPaymentForm;
```

### 4.6. Khalti Callback Page (Success/Status Page)

This page handles the redirect from Khalti and displays payment information based on URL query parameters. It must be a Client Component to use `useSearchParams`.

**`traditionalalley/app/khalti-callback/page.tsx`**:

```tsx
"use client"; // Marks this as a Client Component

import { useSearchParams } from "next/navigation";
import { useEffect } from "react"; // Optional: for actions like verifying payment status

// Import the hook if you plan to verify payment status on this page
// import { useKhalti } from "../../utils/useKhalti"; // Adjust path

const KhaltiCallbackPage = () => {
  const searchParams = useSearchParams();

  // Extract parameters from Khalti's callback URL
  // These are standard parameters Khalti sends back.
  const pidx = searchParams.get("pidx") || "";
  const transactionId = searchParams.get("transaction_id") || searchParams.get("txnId") || "";
  const amount = searchParams.get("amount") || ""; // Amount is in Paisa
  const mobile = searchParams.get("mobile") || "";
  const purchaseOrderId = searchParams.get("purchase_order_id") || "";
  const purchaseOrderName = searchParams.get("purchase_order_name") || "";
  const status = searchParams.get("status") || ""; // e.g., "Completed", "User canceled", "Pending"

  // Optional: Instantiate useKhalti if you want to verify payment here
  // const { checkPaymentStatus, isLoading, statusError } = useKhalti({
  //   onSuccess: (lookupResponse) => {
  //     console.log("Payment Verified Successfully:", lookupResponse);
  //     // Update UI or redirect to a final success page
  //   },
  //   onError: (error) => {
  //     console.error("Payment Verification Error:", error);
  //     // Update UI to show verification failed
  //   }
  // });

  // useEffect(() => {
  //   if (pidx && status === "Completed") {
  //     // It's highly recommended to verify the transaction status via a server-side lookup
  //     // before confirming the order to the user.
  //     // checkPaymentStatus(pidx); // Call this if implementing client-side lookup via backend proxy
  //     console.log("Payment seems completed. PIDX:", pidx, "Consider server-side verification.");
  //   } else if (pidx && status) {
  //     console.log("Payment status:", status, "PIDX:", pidx);
  //   }
  // }, [pidx, status]); // , checkPaymentStatus - add if using the effect

  const displayAmount = amount ? (Number(amount) / 100).toFixed(2) : "N/A";

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Khalti Payment Status</h2>
      {status === "Completed" && <p style={{ color: "green", fontWeight: "bold" }}>Payment Successful!</p>}
      {status === "User canceled" && <p style={{ color: "orange", fontWeight: "bold" }}>Payment Canceled by User.</p>}
      {status === "Pending" && <p style={{ color: "blue", fontWeight: "bold" }}>Payment Pending. Please wait for confirmation.</p>}
      {status && !["Completed", "User canceled", "Pending"].includes(status) && (
        <p style={{ color: "red", fontWeight: "bold" }}>Payment Status: {status}</p>
      )}

      <div style={{ marginTop: "20px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
        <p><strong>Order ID:</strong> {purchaseOrderId}</p>
        <p><strong>Product:</strong> {purchaseOrderName}</p>
        <p><strong>Amount:</strong> NPR {displayAmount}</p>
        <p><strong>Khalti Transaction ID (TID):</strong> {transactionId || "N/A"}</p>
        <p><strong>Payment ID (PIDX):</strong> {pidx || "N/A"}</p>
        <p><strong>Payer Mobile:</strong> {mobile || "N/A"}</p>
        <p><strong>Reported Status:</strong> {status || "N/A"}</p>
      </div>

      {/* {isLoading && <p>Verifying payment status...</p>}
      {statusError && <p style={{color: 'red'}}>Verification Error: {statusError.message}</p>} */}

      <div style={{ marginTop: "30px" }}>
        <a href="/">Go to Homepage</a>
      </div>
      <p style={{marginTop: "20px", fontSize: "0.9em", color: "#555"}}>
        Note: For "Completed" status, a server-side verification of the transaction using the PIDX is crucial
        before fulfilling the order to prevent fraud.
      </p>
    </div>
  );
};

export default KhaltiCallbackPage;
```

### 4.7. Integrating the Payment Form into Checkout

Modify your existing checkout page to include the `KhaltiPaymentForm`.

**`traditionalalley/components/otherPages/Checkout.jsx`**:

```jsx
"use client";

import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import KhaltiPaymentForm from "../payments/KhaltiPaymentForm"; // <--- IMPORT KHALTI FORM

const discounts = [
  // ... your existing discounts array ...
];

export default function Checkout() {
  const [activeDiscountIndex, setActiveDiscountIndex] = useState(1);
  const { cartProducts, totalPrice } = useContextElement(); // Assuming totalPrice is in NPR

  // Create a sample product object for KhaltiPaymentForm based on the cart
  // In a real scenario, you might pass the whole cart or a summary
  const khaltiProductInfo = {
    id: cartProducts.map(p => p.id).join('-') || "cart-checkout", // Example ID
    name: "Total Cart Order", // Example name
    price: totalPrice, // totalPrice from context, assumed to be in NPR
  };

  return (
    <section>
      <div className="container">
        <div className="row">
          <div className="col-xl-6">
            {/* ... your existing information form ... */}
             <div className="flat-spacing tf-page-checkout">
              {/* ... existing code ... */}
                <h5 className="title">Information</h5>
                <form className="info-box" onSubmit={(e) => e.preventDefault()}>
                 {/* ... your form inputs ... */}
                </form>
              {/* ... existing code ... */}
            </div>
          </div>
          <div className="col-xl-1">
            <div className="line-separation" />
          </div>
          <div className="col-xl-5">
            <div className="flat-spacing flat-sidebar-checkout">
              <div className="sidebar-checkout-content">
                <h5 className="title">Shopping Cart</h5>
                {/* ... your cartProducts mapping ... */}
                <div className="list-product">
                  {/* ... cart items ... */}
                </div>

                {/* ... your discount section ... */}
                <div className="sec-discount">
                    {/* ... discount code ... */}
                </div>

                <div className="sec-total-price">
                  <div className="top">
                    <div className="item d-flex align-items-center justify-content-between text-button">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="item d-flex align-items-center justify-content-between text-button">
                      <span>Discounts</span>
                      <span>-$80.00</span> {/* Example discount */}
                    </div>
                  </div>
                  <div className="bottom">
                    <h5 className="d-flex justify-content-between">
                      <span>Total</span>
                      <span className="total-price-checkout">
                        ${totalPrice.toFixed(2)} {/* Displaying total price */}
                      </span>
                    </h5>
                  </div>
                </div>

                {/* Khalti Payment Integration START */}
                {totalPrice > 0 ? ( // Only show Khalti form if there's a total price
                  <KhaltiPaymentForm product={khaltiProductInfo} />
                ) : (
                  <p>Your cart is empty or total is zero.</p>
                )}
                {/* Khalti Payment Integration END */}

                {/* Original Payment Button (Cash on Delivery) - You might want to conditionally render this or Khalti */}
                {/* Consider how you want to manage multiple payment options */}
                 <form
                  className="form-payment"
                  onSubmit={(e) => e.preventDefault()}
                  style={{marginTop: '20px'}} // Add some spacing if needed
                >
                  <div className="payment-box" id="payment-box">
                    <div className="payment-item">
                      <label
                        htmlFor="delivery-method"
                        className="payment-header"
                        // data-bs-toggle="collapse" // You may or may not need these Bootstrap attributes
                        // data-bs-target="#delivery-payment"
                        // aria-controls="delivery-payment"
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          className="tf-check-rounded"
                          id="delivery-method"
                          defaultChecked // Or manage checked state
                        />
                        <span className="text-title">Cash on delivery</span>
                      </label>
                      {/* <div
                        id="delivery-payment"
                        className="collapse show" // You may or may not need these Bootstrap attributes
                        // data-bs-parent="#payment-box"
                      /> */}
                    </div>
                  </div>
                  <button className="tf-btn btn-reset">Place Order (Cash on Delivery)</button>
                </form>


              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 5. Workflow Overview

1.  User navigates to the Checkout page.
2.  The `KhaltiPaymentForm` is displayed, typically showing customer information fields and a "Pay with Khalti" button.
3.  User fills in their details (if not pre-filled) and clicks "Pay with Khalti".
4.  The `handlePayment` function in `KhaltiPaymentForm` calls the `initiate` method from the `useKhalti` hook.
5.  The `initiate` method in `useKhalti` makes a `POST` request to your backend API route (`/api/khalti-initiate`).
6.  Your `/api/khalti-initiate` route receives the request, adds the server-side `KHALTI_SECRET_KEY` to the authorization header, and forwards the payment details to Khalti's `/epayment/initiate/` API.
7.  Khalti processes the request:
    *   If successful, it returns a `pidx` (payment ID) and `payment_url`.
    *   If failed, it returns an error.
8.  Your backend API route sends Khalti's response (or error) back to the `useKhalti` hook.
9.  If the initiation was successful and `autoRedirect` is true, the `useKhalti` hook redirects the user's browser to Khalti's `payment_url`.
10. User completes the payment on Khalti's secure portal (enters Khalti ID, MPIN, OTP).
11. After payment (or cancellation), Khalti redirects the user back to the `return_url` specified during initiation (e.g., `http://localhost:3000/khalti-callback`) with query parameters like `pidx`, `status`, `transaction_id`, etc.
12. The `app/khalti-callback/page.tsx` component mounts, reads these query parameters using `useSearchParams`, and displays the payment status to the user.
13. **Crucial Next Step (Not fully implemented in frontend hook for lookup):** On the callback page, or via a webhook, your server should make a **secure, server-to-server lookup request** to Khalti's `/epayment/lookup/` API using the `pidx` and your `KHALTI_SECRET_KEY` to verify the final transaction status before marking the order as paid and fulfilling it. **Do not rely solely on the client-side status from the redirect.**

---

## 6. Testing

*   Ensure your `KHALTI_SECRET_KEY` in `.env` is correctly set to your **Khalti Sandbox Test Secret Key**.
*   Restart your Next.js development server.
*   Navigate to your checkout page.
*   Use Khalti's official test credentials on the Khalti payment page:
    *   Test Khalti IDs: `9800000000`, `9800000001`, etc.
    *   Test MPIN: `1111`
    *   Test OTP: `987654`
*   Test different scenarios: successful payment, user cancellation.
*   Check browser console and network tabs for any errors during initiation or callback.
*   Verify that the callback page displays the correct information.

---

## 7. Future Enhancements / Security Considerations

*   **Secure Payment Lookup:**
    *   Create another backend API route (e.g., `/api/khalti-lookup`) that takes a `pidx` from the client (or a webhook).
    *   This route should then call Khalti's `/epayment/lookup/` API with your `KHALTI_SECRET_KEY` to get the authoritative transaction status.
    *   Update the `checkPaymentStatus` function in `useKhalti.ts` to call this new backend route.
    *   Call `checkPaymentStatus` on the `khalti-callback` page to verify the transaction before showing a final success message or fulfilling the order. **This is critical for security.**
*   **Webhook Integration:** For more robust status updates (especially for pending payments that later complete), consider implementing Khalti webhooks. Khalti would send a POST request to an endpoint you define on your server when a transaction status changes.
*   **Error Handling:** Enhance user-facing error messages for different failure scenarios (API errors, network issues, Khalti errors).
*   **Loading States:** Improve loading indicators during API calls.
*   **Form Validation:** Add more robust client-side and server-side validation for customer information.
*   **Order Management:** Integrate with your order management system to update order status based on verified payments.
*   **Production Setup:** When going live, change Khalti API URLs in `khaltiConfig.ts` and `khalti-initiate.ts` to production URLs, and update `KHALTI_SECRET_KEY` in `.env` to your live secret key.

---

This documentation should provide a solid foundation for understanding and maintaining the Khalti integration. Remember to prioritize the secure payment lookup as your next step. 