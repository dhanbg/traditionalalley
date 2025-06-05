import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchDataFromApi, updateUserBagWithPayment } from '@/utils/api';
import type { PaymentData } from '@/types/khalti';
const { generateLocalTimestamp } = require('@/utils/timezone');

interface UserBag {
  documentId: string;
  payload?: {
    payments?: PaymentData[];
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pidx, paymentData } = req.body;

  if (!pidx || !paymentData) {
    return res.status(400).json({ error: 'pidx and paymentData are required' });
  }

  try {
    // Find all user-bags to locate the one with this pidx
    // This is a simplified approach for testing - in production you'd want proper auth
    const allUserBags = await fetchDataFromApi('/api/user-bags?populate=*');
    
    if (!allUserBags?.data || allUserBags.data.length === 0) {
      return res.status(404).json({ error: 'No user bags found' });
    }

    // Find the user bag that contains a payment with this pidx
    let targetUserBag: UserBag | null = null;
    for (const bag of allUserBags.data as UserBag[]) {
      if (bag.payload && bag.payload.payments) {
        const existingPayment = bag.payload.payments.find((p: PaymentData) => p.pidx === pidx);
        if (existingPayment) {
          targetUserBag = bag;
          break;
        }
      }
    }

    // If no existing payment found, we can't update (need to know which user this belongs to)
    if (!targetUserBag) {
      return res.status(404).json({ 
        error: 'No existing payment found with this pidx. Cannot determine which user this payment belongs to.' 
      });
    }

    // Prepare payment data for storage
    const paymentDataForStorage: PaymentData = {
      provider: "khalti",
      pidx: paymentData.pidx,
      transactionId: paymentData.transaction_id || "",
      amount: paymentData.total_amount || 0,
      status: paymentData.status || "Initiated",
      purchaseOrderId: paymentData.purchase_order_id || "",
      purchaseOrderName: paymentData.purchase_order_name || "",
      mobile: paymentData.mobile || "",
      timestamp: generateLocalTimestamp(),
    };

    // Save payment data to user-bag (this will update the existing payment)
    await updateUserBagWithPayment(targetUserBag.documentId, paymentDataForStorage);
    
    res.status(200).json({ 
      success: true, 
      message: 'Payment status updated successfully',
      paymentData: paymentDataForStorage,
      userBagId: targetUserBag.documentId
    });

  } catch (error) {
    console.error("Error manually updating payment:", error);
    res.status(500).json({ 
      error: 'Internal server error during payment update.', 
      details: (error instanceof Error) ? error.message : String(error) 
    });
  }
} 