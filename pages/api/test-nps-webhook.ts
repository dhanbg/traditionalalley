import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // This is a test endpoint to simulate the NPS webhook
  const testMerchantTxnId = 'TXN-' + Date.now() + '-user_test';
  const testGatewayTxnId = '100000066587';
  
  console.log('Testing NPS webhook with:', {
    MerchantTxnId: testMerchantTxnId,
    GatewayTxnId: testGatewayTxnId
  });
  
  // Make a request to our own webhook endpoint
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/nps-webhook?MerchantTxnId=${testMerchantTxnId}&GatewayTxnId=${testGatewayTxnId}`;
    
    console.log('Calling webhook URL:', webhookUrl);
    
    const response = await fetch(webhookUrl);
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    console.log('Webhook response:', {
      status: response.status,
      contentType,
      body: text
    });
    
    return res.status(200).json({
      success: true,
      webhookResponse: {
        status: response.status,
        contentType,
        body: text
      }
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
} 