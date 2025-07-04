import type { NextApiRequest, NextApiResponse } from 'next';
import { npsClient, npsConfig, createAPISignature, createGatewaySignature } from '../../utils/npsConfig';
import { updateUserBagWithPayment } from '../../utils/api';
import type { 
  NPSPaymentRequest, 
  GetProcessIdRequest,
  GetProcessIdResponse,
  GatewayRedirectForm,
  NPSPaymentData,
  NPSOrderData
} from '../../types/nps';

interface RequestBody extends NPSPaymentRequest {
  userBagDocumentId?: string;
  orderData?: NPSOrderData;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    redirectForm?: GatewayRedirectForm;
    redirectUrl?: string;
  };
  error?: string;
  details?: any; // For debugging purposes
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { 
      amount, 
      merchantTxnId, 
      transactionRemarks,
      instrumentCode,
      customer_info,
      userBagDocumentId,
      orderData
    }: RequestBody = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!merchantTxnId) {
      return res.status(400).json({
        success: false,
        message: 'Merchant transaction ID is required'
      });
    }

    console.log('=== NPS PAYMENT INITIATION ===');
    console.log('Request body:', req.body);

    // Shorten the merchant transaction ID to avoid potential length issues
    const shortMerchantTxnId = merchantTxnId.length > 50 
      ? `TXN-${Date.now()}-${merchantTxnId.split('-').pop()}` 
      : merchantTxnId;

    console.log('Original merchantTxnId:', merchantTxnId);
    console.log('Shortened merchantTxnId:', shortMerchantTxnId);

    // Step 1: Get Process ID from NPS
    const processIdRequest: GetProcessIdRequest = {
      MerchantId: npsConfig.merchantId,
      MerchantName: npsConfig.merchantName,
      Amount: parseFloat(amount.toString()).toFixed(2), // Format with 2 decimal places
      MerchantTxnId: shortMerchantTxnId,
      Signature: "" // Will be generated manually for debugging
    };

    // Manually generate signature for debugging
    const signature = createAPISignature(processIdRequest);
    processIdRequest.Signature = signature;

    console.log('Process ID request:', processIdRequest);

    const processIdResponse = await npsClient.post<GetProcessIdResponse>(
      '/GetProcessId',
      processIdRequest
    );

    console.log('Process ID response:', processIdResponse.data);

    if (processIdResponse.data.code !== "0") {
      return res.status(400).json({
        success: false,
        message: processIdResponse.data.message || 'Failed to get process ID',
        error: `Code: ${processIdResponse.data.code}`
      });
    }

    const processId = processIdResponse.data.data.ProcessId;
    console.log('Got Process ID:', processId);

    // Save payment data to user bag if provided
    if (userBagDocumentId) {
      try {
        const paymentData: NPSPaymentData = {
          provider: "nps",
          processId: processId,
          merchantTxnId: shortMerchantTxnId,
          amount: amount,
          status: "Pending",
          timestamp: new Date().toISOString(),
          orderData: orderData, // Store order data for later use
        };

        await updateUserBagWithPayment(userBagDocumentId, paymentData);
        console.log('Payment data saved to user bag');
      } catch (error) {
        console.error('Error saving payment data to user bag:', error);
        // Don't fail the payment initiation if bag update fails
      }
    }

    // Step 2: Prepare gateway redirect form
    const host = req.headers.host;
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const responseUrl = `${protocol}://${host}/nps-callback`;

    const gatewayParams = {
      MerchantId: npsConfig.merchantId,
      MerchantName: npsConfig.merchantName,
      Amount: parseFloat(amount.toString()).toFixed(2),
      MerchantTxnId: shortMerchantTxnId,
      ProcessId: processId
    };

    const gatewaySignature = createGatewaySignature(
      gatewayParams.MerchantId,
      gatewayParams.MerchantName,
      gatewayParams.Amount,
      gatewayParams.MerchantTxnId,
      gatewayParams.ProcessId
    );

    const redirectForm: GatewayRedirectForm = {
      MerchantId: gatewayParams.MerchantId,
      MerchantName: gatewayParams.MerchantName,
      Amount: gatewayParams.Amount,
      MerchantTxnId: gatewayParams.MerchantTxnId,
      TransactionRemarks: transactionRemarks || `Payment for order ${shortMerchantTxnId}`,
      InstrumentCode: instrumentCode,
      ProcessId: processId
    };

    console.log('Gateway redirect form:', redirectForm);

    return res.status(200).json({
      success: true,
      message: 'Payment initiation successful',
      data: {
        redirectForm: redirectForm,
        redirectUrl: npsConfig.gatewayURL // Use the correct gateway URL from config
      }
    });

  } catch (error: any) {
    console.error('❌ Error initiating NPS payment:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Internal server error';

    const statusCode = error.response?.status || 500;

    return res.status(statusCode).json({
      success: false,
      message: 'Failed to initiate payment',
      error: errorMessage,
      details: error.response?.data || error.message
    });
  }
} 