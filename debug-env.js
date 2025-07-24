// Debug environment variables and API connection
require('dotenv').config();

console.log('🔧 Environment Variables:');
console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('STRAPI_API_TOKEN present:', !!process.env.NEXT_PUBLIC_STRAPI_API_TOKEN);
console.log('STRAPI_API_TOKEN length:', process.env.NEXT_PUBLIC_STRAPI_API_TOKEN?.length || 0);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

async function testConnection() {
  try {
    console.log('\n🔍 Testing API connection...');
    console.log('URL:', `${API_URL}/api/user-data`);
    
    const response = await fetch(`${API_URL}/api/user-data`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Data received:', !!data);
      console.log('Users count:', data.data?.length || 0);
      
      if (data.data && data.data.length > 0) {
        console.log('First user email:', data.data[0].email);
        console.log('First user has userBag:', !!data.data[0].userBag);
      }
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testConnection();
