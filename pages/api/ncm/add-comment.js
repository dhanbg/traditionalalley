import { addOrderComment } from '../../../utils/ncm-api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, comment } = req.body;

    if (!orderId || !comment) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order ID and comment are required' 
      });
    }

    const result = await addOrderComment(orderId, comment);
    
    res.status(200).json({ 
      success: true, 
      message: result.message || 'Comment added successfully'
    });
  } catch (error) {
    console.error('NCM Add Comment API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add comment to NCM order',
      details: error.message 
    });
  }
}
