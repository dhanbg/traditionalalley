import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchDataFromApi, updateUserBagWithPayment } from '@/utils/api';
const { generateLocalTimestamp } = require('@/utils/timezone');
import type { PaymentData } from '@/types/khalti';

// Khalti webhook payload interface
interface KhaltiWebhookPayload {
  pidx: string;
  total_amount: number;
  status: string;
  transaction_id: string;
  fee: number;
  refunded: boolean;
  purchase_order_id: string;
  purchase_order_name: string;
  extra_merchant_params?: {
    user_id?: string;
    bag_id?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== KHALTI WEBHOOK RECEIVED ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const webhookData: KhaltiWebhookPayload = req.body;

    // Validate required fields
    if (!webhookData.pidx || !webhookData.status) {
      console.error('Missing required webhook data:', webhookData);
      return res.status(400).json({ error: 'Missing required webhook data' });
    }

    // Only process completed payments
    if (webhookData.status !== 'Completed') {
      console.log(`Payment status is ${webhookData.status}, not processing`);
      return res.status(200).json({ message: 'Payment not completed, ignored' });
    }

    // Extract user information from purchase_order_id or extra params
    // The purchase_order_id format should be: order-{productId}-{timestamp}-{userId}
    let userId: string | null = null;
    
    // Try to extract user ID from purchase_order_id
    const orderIdParts = webhookData.purchase_order_id.split('-');
    if (orderIdParts.length >= 4) {
      userId = orderIdParts[orderIdParts.length - 1]; // Last part should be user ID
    }

    // Fallback to extra merchant params if available
    if (!userId && webhookData.extra_merchant_params?.user_id) {
      userId = webhookData.extra_merchant_params.user_id;
    }

    if (!userId) {
      console.error('Could not extract user ID from webhook data');
      return res.status(400).json({ error: 'Could not identify user' });
    }

    console.log('Processing webhook for user:', userId);

    // Find the user's bag
    const currentUserData = await fetchDataFromApi(
      `/api/user-datas?filters[clerkUserId][$eq]=${userId}&populate=user_bag`
    );

    if (!currentUserData?.data || currentUserData.data.length === 0) {
      console.error('User data not found for user:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = currentUserData.data[0];
    const userBag = userData.user_bag;

    if (!userBag || !userBag.documentId) {
      console.error('User bag not found for user:', userId);
      return res.status(404).json({ error: 'User bag not found' });
    }

    console.log('Found user bag:', userBag.documentId);

    // Prepare payment data for storage
    const paymentData: PaymentData = {
      provider: "khalti",
      pidx: webhookData.pidx,
      transactionId: webhookData.transaction_id,
      amount: webhookData.total_amount,
      status: webhookData.status,
      purchaseOrderId: webhookData.purchase_order_id,
      purchaseOrderName: webhookData.purchase_order_name,
      mobile: "", // Not provided in webhook
      timestamp: generateLocalTimestamp(),
      webhook_processed: true, // Flag to indicate this came from webhook
    };

    // Save payment data to user-bag
    await updateUserBagWithPayment(userBag.documentId, paymentData);
    
    console.log('✅ Webhook payment data saved successfully:', paymentData);

    // Respond to Khalti that webhook was processed successfully
    return res.status(200).json({ 
      message: 'Webhook processed successfully',
      pidx: webhookData.pidx,
      status: webhookData.status
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 