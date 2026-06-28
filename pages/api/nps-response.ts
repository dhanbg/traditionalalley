import type { NextApiRequest, NextApiResponse } from 'next';
import { getStrapiInternalUrl } from '@/utils/urls';

// Server-side bag ID recovery from Strapi
async function recoverBagIdFromStrapi(merchantTxnId: string): Promise<string | null> {
  try {
    const STRAPI_URL = getStrapiInternalUrl();
    const STRAPI_TOKEN = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    
    console.log(`🔍 [NPS-RESPONSE] Looking up bagId for merchantTxnId: ${merchantTxnId}`);
    
    // Search all user-bags for one with a pending payment matching this merchantTxnId
    // Sort by updatedAt:desc to search the most recently active bags first
    const url = `${STRAPI_URL}/api/user-bags?pagination[pageSize]=100&sort=updatedAt:desc`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`🔍 [NPS-RESPONSE] Strapi responded with ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const bags = data?.data || [];
    
    for (const bag of bags) {
      const orders = bag.user_orders;
      if (!orders?.payments) continue;
      
      for (const payment of orders.payments) {
        if (payment.merchantTxnId === merchantTxnId && payment.provider === 'nps') {
          console.log(`✅ [NPS-RESPONSE] Found bag ${bag.documentId} for merchantTxnId ${merchantTxnId}`);
          return bag.documentId;
        }
      }
    }
    
    console.log(`⚠️ [NPS-RESPONSE] No bag found for merchantTxnId: ${merchantTxnId}`);
    return null;
  } catch (error) {
    console.error(`❌ [NPS-RESPONSE] Error recovering bag ID:`, error);
    return null;
  }
}

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

    const merchantTxnId = (req.query.MerchantTxnId || req.query.merchantTxnId) as string;
    const gatewayTxnId = (req.query.GatewayTxnId || req.query.processId) as string;

    // Validate required parameters
    if (!merchantTxnId) {
      console.error('Missing required response parameters: merchantTxnId');
      return res.redirect('/payment-error?reason=missing-parameters');
    }

    console.log(`Processing response for merchant transaction: ${merchantTxnId}, gateway transaction: ${gatewayTxnId || 'none'}`);

    // SERVER-SIDE BAG ID RECOVERY: Look up the bag from Strapi using the merchantTxnId
    // This is reliable regardless of localStorage/session state on the client
    const recoveredBagId = await recoverBagIdFromStrapi(merchantTxnId);

    // Build callback URL with all available params, preserving all parameters sent by NPS
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (value) {
        queryParams.set(key, Array.isArray(value) ? value[0] : value);
      }
    }
    if (recoveredBagId) {
      queryParams.set("bagId", recoveredBagId);
      console.log(`✅ [NPS-RESPONSE] Including server-recovered bagId in redirect: ${recoveredBagId}`);
    } else {
      console.warn(`⚠️ [NPS-RESPONSE] Could not recover bagId server-side, client will attempt localStorage fallback`);
    }

    const callbackUrl = `/nps-callback?${queryParams.toString()}`;
    console.log(`Redirecting to callback URL: ${callbackUrl}`);

    return res.redirect(callbackUrl);

  } catch (error: any) {
    console.error('❌ Response URL processing error:', error);
    return res.redirect('/payment-error?reason=processing-error');
  }
} 