import type { NextApiRequest, NextApiResponse } from 'next';
import { npsClient } from '../../utils/npsConfig';
import type { 
  GetServiceChargeRequest, 
  GetServiceChargeResponse 
} from '../../types/nps';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: GetServiceChargeResponse;
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
    const { amount, instrumentCode }: { amount: number; instrumentCode: string } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!instrumentCode) {
      return res.status(400).json({
        success: false,
        message: 'Instrument code is required'
      });
    }

    console.log('Getting service charge for amount:', amount, 'instrumentCode:', instrumentCode);

    const requestData: GetServiceChargeRequest = {
      MerchantId: process.env.NPS_MERCHANT_ID || "7536",
      MerchantName: process.env.NPS_MERCHANT_NAME || "Alley",
      Amount: amount.toString(),
      InstrumentCode: instrumentCode,
      Signature: "placeholder" // Will be calculated based on actual requirements
    };

    console.log('Service charge request:', requestData);

    const response = await npsClient.post<GetServiceChargeResponse>(
      '/GetServiceCharge',
      requestData
    );

    console.log('Service charge response:', response.data);

    if (response.data.code === "0") {
      return res.status(200).json({
        success: true,
        message: 'Service charge retrieved successfully',
        data: response.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: response.data.message || 'Failed to get service charge',
        error: `Code: ${response.data.code}`
      });
    }

  } catch (error: any) {
    console.error('Error getting service charge:', error);

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Internal server error';

    const statusCode = error.response?.status || 500;

    return res.status(statusCode).json({
      success: false,
      message: 'Failed to get service charge',
      error: errorMessage
    });
  }
} 