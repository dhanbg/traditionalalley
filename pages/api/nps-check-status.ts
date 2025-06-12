import type { NextApiRequest, NextApiResponse } from 'next';
import { npsClient, npsConfig, createAPISignature } from '../../utils/npsConfig';
import type { CheckTransactionStatusRequest, CheckTransactionStatusResponse } from '../../types/nps';

interface RequestBody {
  merchantTxnId: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
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
    const { merchantTxnId }: RequestBody = req.body;

    // Validate required fields
    if (!merchantTxnId) {
      return res.status(400).json({
        success: false,
        message: 'Merchant transaction ID is required'
      });
    }

    console.log('=== NPS TRANSACTION STATUS CHECK ===');
    console.log('MerchantTxnId:', merchantTxnId);

    // Create status check request
    const statusRequest: CheckTransactionStatusRequest = {
      MerchantId: npsConfig.merchantId,
      MerchantName: npsConfig.merchantName,
      MerchantTxnId: merchantTxnId,
      Signature: "" // Will be generated manually
    };

    // Generate signature
    const signature = createAPISignature(statusRequest);
    statusRequest.Signature = signature;

    console.log('Status check request:', statusRequest);

    const statusResponse = await npsClient.post<CheckTransactionStatusResponse>(
      '/CheckTransactionStatus',
      statusRequest
    );

    console.log('Status check response:', statusResponse.data);

    if (statusResponse.data.code !== "0") {
      return res.status(400).json({
        success: false,
        message: statusResponse.data.message || 'Failed to check transaction status',
        error: `Code: ${statusResponse.data.code}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction status retrieved successfully',
      data: statusResponse.data.data
    });

  } catch (error: any) {
    console.error('❌ Error checking NPS transaction status:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Internal server error';

    const statusCode = error.response?.status || 500;

    return res.status(statusCode).json({
      success: false,
      message: 'Failed to check transaction status',
      error: errorMessage
    });
  }
} 