import { useState } from "react";
import axios, { AxiosError } from "axios";
import { KHALTI_CONFIG } from "./khaltiConfig";
import type {
  PaymentRequest,
  PaymentInitiateResponse,
  PaymentLookupResponse,
  UseKhaltiOptions,
  PaymentData,
  OrderData,
} from "../types/khalti";
import { updateUserBagWithPayment, fetchDataFromApi, saveCashPaymentOrder } from "./api";
const { generateLocalTimestamp } = require('./timezone');

export function useKhalti({
  onSuccess,
  onError,
  autoRedirect = true,
  userBagDocumentId,
  orderData,
}: UseKhaltiOptions & { userBagDocumentId?: string } = {}) {
  const [pidx, setPidx] = useState<string | null>(null);
  const [initiationError, setInitiationError] = useState<Error | null>(null);
  const [statusError, setStatusError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initiate = async (data: PaymentRequest) => {
    setIsLoading(true);
    setInitiationError(null);
    try {
      const response = await axios.post<PaymentInitiateResponse>(
        "/api/khalti-initiate",
        data
      );
      const paymentResponse = response.data;
      setPidx(paymentResponse.pidx);
      
      if (userBagDocumentId && paymentResponse.pidx) {
        try {
          const paymentData: PaymentData = {
            provider: "khalti",
            pidx: paymentResponse.pidx,
            transactionId: "",
            amount: data.amount,
            status: "Initiated",
            purchaseOrderId: data.purchase_order_id,
            purchaseOrderName: data.purchase_order_name,
            mobile: data.customer_info?.phone,
            timestamp: generateLocalTimestamp(),
          };
          
          await updateUserBagWithPayment(userBagDocumentId, paymentData);
          console.log("Payment initiation data saved to user-bag");

          // Save order data if provided
          if (orderData) {
            await saveCashPaymentOrder(userBagDocumentId, orderData);
            console.log("Order data saved to user-bag during payment initiation");
          }
        } catch (saveError) {
          console.error("Error saving payment initiation data:", saveError);
        }
      }
      
      if (autoRedirect) {
        window.location.href = paymentResponse.payment_url;
      }
      return paymentResponse;
    } catch (error) {
      setInitiationError(error as Error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!pidx) throw new Error("Payment ID not found");
    setIsLoading(true);
    setStatusError(null);
    try {
      const response = await axios.post<PaymentLookupResponse>(
        `${KHALTI_CONFIG.baseUrl}/epayment/lookup/`,
        { pidx },
        {
          headers: {
            Authorization: `Key ${KHALTI_CONFIG.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      const paymentStatus = response.data;
      if (paymentStatus.status === "Completed") {
        onSuccess?.(paymentStatus);
      }
      return paymentStatus;
    } catch (error) {
      setStatusError(error as Error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserBagDocumentId = async (clerkUserId: string): Promise<string | null> => {
    try {
      const currentUserData = await fetchDataFromApi(
        `/api/user-datas?filters[clerkUserId][$eq]=${clerkUserId}&populate=user_bag`
      );

      if (!currentUserData?.data || currentUserData.data.length === 0) {
        console.error("User data not found");
        return null;
      }

      const userData = currentUserData.data[0];
      const userBag = userData.user_bag;

      if (!userBag || !userBag.documentId) {
        console.error("User bag not found");
        return null;
      }

      return userBag.documentId;
    } catch (error) {
      console.error("Error getting user bag documentId:", error);
      return null;
    }
  };

  return {
    initiate,
    checkPaymentStatus,
    getUserBagDocumentId,
    pidx,
    initiationError,
    statusError,
    isLoading,
  };
} 