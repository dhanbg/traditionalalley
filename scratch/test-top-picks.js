const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

async function testTopPicks() {
  console.log('Token:', STRAPI_API_TOKEN ? 'Loaded' : 'Missing');
  console.log('API URL:', API_URL);

  const endpoints = [
    '/api/top-picks',
    '/api/top-picks?populate=*',
    '/api/top-picks?populate[products][populate]=*&populate[product_variants][populate]=*&populate=*'
  ];

  for (const ep of endpoints) {
    try {
      const url = `${API_URL}${ep}`;
      console.log(`\n--- Fetching: ${url} ---`);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Status:', response.status);
      const data = await response.json();
      console.log('Response Structure (Keys):', Object.keys(data));
      if (data.data) {
        console.log('data field type:', typeof data.data, 'isArray:', Array.isArray(data.data));
        if (Array.isArray(data.data)) {
          console.log('Length of data:', data.data.length);
          if (data.data.length > 0) {
            console.log('First item keys:', Object.keys(data.data[0]));
            console.log('First item details:', JSON.stringify(data.data[0], null, 2).substring(0, 1000));
          }
        } else {
          console.log('data details:', JSON.stringify(data.data, null, 2).substring(0, 1000));
        }
      } else {
        console.log('Full response:', JSON.stringify(data, null, 2).substring(0, 1000));
      }
    } catch (err) {
      console.error('Failed to fetch:', err.message);
    }
  }
}

testTopPicks();
