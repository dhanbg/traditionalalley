import type { NextApiRequest, NextApiResponse } from 'next';
import { npsConfig } from '../../utils/npsConfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== NPS CONFIG TEST ===');
    
    // Test configuration values (without sensitive data)
    const configTest = {
      baseURL: npsConfig.baseURL,
      gatewayURL: npsConfig.gatewayURL,
      merchantId: npsConfig.merchantId,
      merchantName: npsConfig.merchantName,
      apiUsername: npsConfig.apiUsername,
      hasSecretKey: !!npsConfig.secretKey,
      hasApiPassword: !!npsConfig.apiPassword,
    };
    
    console.log('NPS Config:', configTest);
    
    return res.status(200).json({
      success: true,
      message: 'NPS configuration test',
      config: configTest,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasNpsBaseUrl: !!process.env.NPS_BASE_URL,
        hasNpsMerchantId: !!process.env.NPS_MERCHANT_ID,
        hasNpsSecretKey: !!process.env.NPS_SECRET_KEY,
      }
    });

  } catch (error: any) {
    console.error('Config test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 