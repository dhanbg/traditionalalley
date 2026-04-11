import { STRAPI_API_TOKEN } from "@/utils/urls";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { productId, documentId, oldPrice } = req.body;
    
    if (!productId && !documentId) {
      return res.status(400).json({ error: 'Either productId or documentId is required' });
    }
    
    if (!oldPrice) {
      return res.status(400).json({ error: 'oldPrice is required' });
    }
    
    // Determine which API endpoint to use based on available identifiers
    let apiUrl;
    if (documentId) {
      // Search by document ID
      apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/products?filters[documentId][$eq]=${documentId}`;
    } else {
      // Direct access by ID
      apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/products/${productId}`;
    }
    
    // First, fetch the product to get its ID if using documentId
    let productIdToUpdate = productId;
    
    if (documentId) {
      const fetchResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch product: ${fetchResponse.status}`);
      }
      
      const data = await fetchResponse.json();
      
      if (!data.data || (Array.isArray(data.data) && data.data.length === 0)) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Extract the product ID from the response
      productIdToUpdate = Array.isArray(data.data) ? data.data[0].id : data.data.id;
    }
    
    // Now update the product with the new oldPrice
    const updateUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/products/${productIdToUpdate}`;
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          oldPrice: parseFloat(oldPrice)
        }
      })
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Failed to update product: ${updateResponse.status}`);
    }
    
    const updatedData = await updateResponse.json();
    
    return res.status(200).json({ success: true, data: updatedData });
  } catch (error) {
    console.error('Error updating product oldPrice:', error);
    return res.status(500).json({ error: error.message || 'Error updating product oldPrice' });
  }
} 