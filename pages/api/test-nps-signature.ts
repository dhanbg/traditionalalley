import type { NextApiRequest, NextApiResponse } from 'next';
import { generateNPSSignature, createAPISignature } from '../../utils/npsConfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== NPS SIGNATURE TEST ===');
    
    // Test signature generation
    const testData = 'test123';
    const signature = generateNPSSignature(testData);
    
    // Test API signature generation
    const testParams = {
      MerchantId: '7536',
      MerchantName: 'Alley',
      Amount: '100.00',
      MerchantTxnId: 'TEST123'
    };
    
    const apiSignature = createAPISignature(testParams);
    
    console.log('Test signature:', signature);
    console.log('API signature:', apiSignature);
    
    return res.status(200).json({
      success: true,
      message: 'Signature generation test',
      results: {
        testData,
        signature,
        testParams,
        apiSignature,
        signatureLength: signature.length,
        isValidHex: /^[a-f0-9]+$/.test(signature)
      }
    });

  } catch (error: any) {
    console.error('Signature test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 