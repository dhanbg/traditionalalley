import { getOrderDetails, getOrderStatus, getOrderComments } from '../../../utils/ncm-api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, type = 'details' } = req.query;

    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order ID is required' 
      });
    }

    let result;
    switch (type) {
      case 'details':
        result = await getOrderDetails(orderId);
        break;
      case 'status':
        result = await getOrderStatus(orderId);
        break;
      case 'comments':
        result = await getOrderComments(orderId);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid type. Use: details, status, or comments' 
        });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('NCM Order Status API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to fetch order ${req.query.type || 'details'}`,
      details: error.message 
    });
  }
}
