const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { action, userId, cartId } = req.body;

    const headers = {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    };

    if (action === 'link-cart-direct') {
      // Direct API call to link cart to user
      if (!userId || !cartId) {
        return res.status(400).json({ message: 'userId and cartId are required' });
      }

      const updatePayload = {
        data: {
          user_datum: parseInt(userId)
        }
      };

      const response = await fetch(`${API_URL}/api/carts/${cartId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          success: false, 
          message: `Failed to update cart: ${response.status} ${response.statusText}`,
          error: errorText
        });
      }

      const result = await response.json();
      
      return res.status(200).json({
        success: true,
        message: `Cart ${cartId} linked to user ${userId}`,
        result
      });
    }

    if (action === 'get-current-state') {
      // Get current state of carts and users
      const cartsResponse = await fetch(`${API_URL}/api/carts?populate=*`, { headers });
      const usersResponse = await fetch(`${API_URL}/api/user-data?populate=*`, { headers });
      
      if (!cartsResponse.ok || !usersResponse.ok) {
        return res.status(500).json({ message: 'Failed to fetch data' });
      }

      const carts = await cartsResponse.json();
      const users = await usersResponse.json();

      return res.status(200).json({
        success: true,
        carts: carts.data,
        users: users.data
      });
    }

    return res.status(400).json({ message: 'Invalid action' });

  } catch (error) {
    console.error('Debug cart API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
