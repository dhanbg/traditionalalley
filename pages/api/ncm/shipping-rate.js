import { getDeliveryCharges } from '../../../utils/ncm-api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to, type = 'Pickup' } = req.query;

    if (!from || !to) {
      return res.status(400).json({ 
        success: false, 
        error: 'From and to branches are required' 
      });
    }

    const response = await getDeliveryCharges(from, to, type);
    console.log('NCM API response:', response);
    
    // Extract charge from NCM API response
    const charge = response.charge || response.charges?.charge || '0.00';
    
    res.status(200).json({ 
      success: true, 
      charge: parseFloat(charge),
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
