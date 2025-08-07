import { getDeliveryCharges } from '../../../utils/ncm-api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to, type = 'Pickup' } = req.query;
    console.log('NCM API Request params:', { from, to, type });
    console.log('Environment check:', {
      hasBaseUrl: !!process.env.NCM_API_BASE_URL,
      hasToken: !!process.env.NCM_API_TOKEN,
      baseUrl: process.env.NCM_API_BASE_URL
    });

    if (!from || !to) {
      return res.status(400).json({ 
        success: false, 
        error: 'From and to branches are required' 
      });
    }

    const response = await getDeliveryCharges(from, to, type);
    console.log('NCM API response:', response);
    
    // Extract charge from NCM API response
    const baseCharge = response.charge || response.charges?.charge || '0.00';
    
    // Add Rs. 50 surcharge to every branch delivery in Nepal
    const finalCharge = parseFloat(baseCharge) + 50;
    
    res.status(200).json({ 
      success: true, 
      charge: finalCharge,
      baseCharge: parseFloat(baseCharge),
      surcharge: 50,
      rawResponse: response 
    });
  } catch (error) {
    console.error('NCM Shipping Rate API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch shipping rates',
      details: error.message 
    });
  }
}
