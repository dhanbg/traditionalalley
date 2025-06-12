import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { npsConfig, createAPISignature } from '../../utils/npsConfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== NPS API TEST ===');
    
    // Test basic API call to get payment instruments
    const testRequest = {
      MerchantId: npsConfig.merchantId,
      MerchantName: npsConfig.merchantName,
      Signature: ""
    };

    // Generate signature
    const signature = createAPISignature(testRequest);
    testRequest.Signature = signature;

    console.log('Test request:', testRequest);
    console.log('Making request to:', `${npsConfig.baseURL}/GetPaymentInstrumentDetails`);

    // Create a simple axios instance without interceptors
    const testClient = axios.create({
      baseURL: npsConfig.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      auth: {
        username: npsConfig.apiUsername,
        password: npsConfig.apiPassword,
      },
    });

    const response = await testClient.post('/GetPaymentInstrumentDetails', testRequest);
    
    console.log('NPS API Response:', response.data);
    
    return res.status(200).json({
      success: true,
      message: 'NPS API test successful',
      data: response.data,
      requestSent: testRequest
    });

  } catch (error: any) {
    console.error('NPS API test error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data,
      status: error.response?.status
    });
  }
} 