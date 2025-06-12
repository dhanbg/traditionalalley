import { useState } from "react";
import { fetchDataFromApi } from "./api";
import type { 
  NPSPaymentRequest, 
  CheckTransactionStatusRequest,
  CheckTransactionStatusResponse,
  UseNPSOptions,
  GatewayRedirectForm
} from "../types/nps";

interface NPSInitiateResponse {
  success: boolean;
  message: string;
  data?: {
    redirectForm?: GatewayRedirectForm;
    redirectUrl?: string;
  };
  error?: string;
}

interface NPSStatusResponse {
  success: boolean;
  message: string;
  data?: CheckTransactionStatusResponse;
  error?: string;
}

export const useNPS = (options: UseNPSOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [initiationError, setInitiationError] = useState<Error | null>(null);

  // Function to get user bag document ID
  const getUserBagDocumentId = async (userId: string): Promise<string> => {
    try {
      console.log('Fetching user bag for userId:', userId);
      
      // Use the correct API endpoint pattern that matches the existing codebase
      const response = await fetchDataFromApi(
        `/api/user-datas?filters[clerkUserId][$eq]=${userId}&populate=user_bag`
      );
      
      console.log('User data response:', response);
      
      if (!response?.data || response.data.length === 0) {
        throw new Error('User data not found');
      }
      
      const userData = response.data[0];
      const userBag = userData.user_bag;
      
      if (!userBag || !userBag.documentId) {
        throw new Error('User bag not found or missing documentId');
      }
      
      console.log('Found user bag documentId:', userBag.documentId);
      return userBag.documentId;
      
    } catch (error: any) {
      console.error('Error fetching user bag documentId:', error);
      throw error;
    }
  };

  // Create and submit form for gateway redirect
  const submitGatewayForm = (redirectForm: GatewayRedirectForm, gatewayUrl: string) => {
    console.log("Submitting gateway form:", redirectForm);
    
    // Create a form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = gatewayUrl;
    form.style.display = 'none';

    // Add form fields
    Object.entries(redirectForm).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value.toString();
        form.appendChild(input);
      }
    });

    // Add form to document and submit
    document.body.appendChild(form);
    form.submit();
  };

  // Initiate payment
  const initiate = async (paymentRequest: NPSPaymentRequest) => {
    try {
      setIsLoading(true);
      setInitiationError(null);

      console.log("=== INITIATING NPS PAYMENT ===");
      console.log("Payment request:", paymentRequest);

      const requestBody = {
        ...paymentRequest,
        userBagDocumentId: options.userBagDocumentId,
        orderData: options.orderData,
      };

      console.log("Request body:", requestBody);

      const response = await fetch('/api/nps-initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: NPSInitiateResponse = await response.json();
      console.log("NPS initiate response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Payment initiation failed');
      }

      if (data.data?.redirectForm && data.data?.redirectUrl) {
        // Call success callback before redirect
        if (options.onSuccess) {
          options.onSuccess(data.data as any);
        }

        // Auto redirect to gateway if enabled (default: true)
        if (options.autoRedirect !== false) {
          submitGatewayForm(data.data.redirectForm, data.data.redirectUrl);
        }

        return data.data;
      } else {
        throw new Error('Invalid response: missing redirect form or URL');
      }

    } catch (error: any) {
      console.error("NPS payment initiation error:", error);
      
      const errorObj = new Error(error.message || 'Payment initiation failed');
      setInitiationError(errorObj);
      
      if (options.onError) {
        options.onError(errorObj);
      }
      
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  };

  // Check transaction status
  const checkTransactionStatus = async (request: CheckTransactionStatusRequest): Promise<CheckTransactionStatusResponse> => {
    try {
      console.log("Checking transaction status:", request);

      const response = await fetch('/api/nps-check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: NPSStatusResponse = await response.json();
      console.log("Transaction status response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Status check failed');
      }

      if (!data.data) {
        throw new Error('Invalid response: missing transaction data');
      }

      return data.data;

    } catch (error: any) {
      console.error("Transaction status check error:", error);
      throw new Error(error.message || 'Status check failed');
    }
  };

  // Alias for compatibility
  const lookup = checkTransactionStatus;

  return {
    initiate,
    checkTransactionStatus,
    lookup,
    getUserBagDocumentId,
    isLoading,
    initiationError,
  };
}; 