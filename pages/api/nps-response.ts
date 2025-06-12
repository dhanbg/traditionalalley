import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // NPS sends GET requests with query parameters for response URL
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    console.log('=== NPS RESPONSE URL RECEIVED ===');
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);

    const { MerchantTxnId, GatewayTxnId } = req.query;

    // Validate required parameters
    if (!MerchantTxnId || !GatewayTxnId) {
      console.error('Missing required response parameters');
      // Redirect to a generic error page or home page
      return res.redirect('/payment/error?reason=missing-parameters');
    }

    const merchantTxnId = MerchantTxnId as string;
    const gatewayTxnId = GatewayTxnId as string;

    console.log(`Processing response for merchant transaction: ${merchantTxnId}, gateway transaction: ${gatewayTxnId}`);

    // Redirect to the NPS callback page with the transaction details
    // This will handle the payment processing and show the result to the user
    const callbackUrl = `/nps-callback?MerchantTxnId=${encodeURIComponent(merchantTxnId)}&GatewayTxnId=${encodeURIComponent(gatewayTxnId)}`;
    
    console.log(`Redirecting to callback URL: ${callbackUrl}`);
    
    return res.redirect(callbackUrl);

  } catch (error: any) {
    console.error('❌ Response URL processing error:', error);
    
    // Redirect to error page with error information
    return res.redirect('/payment/error?reason=processing-error');
  }
} 