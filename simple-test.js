require('dotenv').config();

console.log('Testing environment variables...');
console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Token present:', process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ? 'Yes' : 'No');
console.log('Token length:', process.env.NEXT_PUBLIC_STRAPI_API_TOKEN?.length || 0);

async function simpleTest() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
    const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    
    console.log('Making API call...');
    const response = await fetch(`${API_URL}/api/carts?populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Cart items found:', data.data.length);
      
      if (data.data.length > 0) {
        console.log('First item:', {
          id: data.data[0].id,
          documentId: data.data[0].documentId,
          product: data.data[0].product?.title,
          size: data.data[0].size,
          user: data.data[0].user_datum?.email
        });
      }
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

simpleTest();
