import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserBagWithPayment } from '@/utils/api';
import type { PaymentData } from '@/types/khalti';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test payment data for the specific user-bag
    const testPaymentData: PaymentData = {
      provider: "khalti",
      pidx: "test_pidx_123456789",
      transactionId: "test_txn_987654321",
      amount: 150000, // NPR 1500.00 (amount in paisa)
      status: "Completed",
      purchaseOrderId: "order_test_001",
      purchaseOrderName: "Test Order - Traditional Items",
      mobile: "9841234567",
      timestamp: new Date().toISOString(),
    };

    // Update the specific user-bag with documentId
    const userBagDocumentId = "weejefo6hbwmxxl1pq97mejb";
    const result = await updateUserBagWithPayment(userBagDocumentId, testPaymentData);

    res.status(200).json({
      success: true,
      message: 'Payment data added to user-bag successfully',
      data: result,
      paymentData: testPaymentData
    });

  } catch (error) {
    console.error('Error updating user-bag with payment data:', error);
    res.status(500).json({ 
      error: 'Failed to update user-bag with payment data', 
      details: (error as Error).message 
    });
  }
} 