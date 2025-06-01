"use client";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, Suspense } from "react";
import { fetchDataFromApi, updateUserBagWithPayment } from "@/utils/api";
import type { PaymentData } from "@/types/khalti";

// Wrapper component that uses searchParams
const KhaltiCallbackContent = () => {
  const searchParams = useSearchParams();
  const { user } = useUser();

  // Extract payment data from URL parameters
  const purchaseOrderName = searchParams?.get("purchase_order_name") || "";
  const amount = searchParams?.get("amount") || "";
  const purchaseOrderId = searchParams?.get("purchase_order_id") || "";
  const transactionId = searchParams?.get("transaction_id") || "";
  const mobile = searchParams?.get("mobile") || "";
  const status = searchParams?.get("status") || "";
  const pidx = searchParams?.get("pidx") || "";

  useEffect(() => {
    const savePaymentData = async () => {
      if (!user || !transactionId || !pidx) {
        window.location.href = "/";
        return;
      }

      try {
        // Find the user's bag
        const currentUserData = await fetchDataFromApi(
          `/api/user-datas?filters[clerkUserId][$eq]=${user.id}&populate=user_bag`
        );

        if (!currentUserData?.data || currentUserData.data.length === 0) {
          window.location.href = "/";
          return;
        }

        const userData = currentUserData.data[0];
        const userBag = userData.user_bag;

        if (!userBag || !userBag.documentId) {
          window.location.href = "/";
          return;
        }

        // Prepare payment data
        const paymentData: PaymentData = {
          provider: "khalti",
          pidx: pidx,
          transactionId: transactionId,
          amount: parseInt(amount) || 0,
          status: status,
          purchaseOrderId: purchaseOrderId,
          purchaseOrderName: purchaseOrderName,
          mobile: mobile || undefined,
          timestamp: new Date().toISOString(),
        };

        // Save payment data to user-bag
        await updateUserBagWithPayment(userBag.documentId, paymentData);
      } catch (error) {
        // Ignore error, just redirect
      } finally {
        window.location.href = "/";
      }
    };

    savePaymentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, transactionId, pidx, amount, status, purchaseOrderId, purchaseOrderName, mobile]);

  // Render nothing
  return null;
};

// Main page component with Suspense boundary
const KhaltiCallbackPage = () => {
  return (
    <Suspense fallback={<div>Loading payment information...</div>}>
      <KhaltiCallbackContent />
    </Suspense>
  );
};

export default KhaltiCallbackPage;