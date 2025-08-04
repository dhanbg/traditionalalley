// Test script to verify /api/user-orders endpoint functionality
const fetch = require('node-fetch');

async function testUserOrdersAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing /api/user-orders API endpoint...\n');
  
  // Test 1: GET request (should return 401 without auth)
  console.log('1. Testing GET request (without authentication):');
  try {
    const getResponse = await fetch(`${baseUrl}/api/user-orders`);
    console.log(`   Status: ${getResponse.status} ${getResponse.statusText}`);
    const getData = await getResponse.json();
    console.log(`   Response:`, getData);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n2. Testing POST request (without authentication):');
  try {
    const postResponse = await fetch(`${baseUrl}/api/user-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          test: 'data'
        }
      })
    });
    console.log(`   Status: ${postResponse.status} ${postResponse.statusText}`);
    const postData = await postResponse.json();
    console.log(`   Response:`, postData);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n3. Testing PUT request (without authentication):');
  try {
    const putResponse = await fetch(`${baseUrl}/api/user-orders?id=123`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          test: 'update'
        }
      })
    });
    console.log(`   Status: ${putResponse.status} ${putResponse.statusText}`);
    const putData = await putResponse.json();
    console.log(`   Response:`, putData);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n4. Testing unsupported method (DELETE):');
  try {
    const deleteResponse = await fetch(`${baseUrl}/api/user-orders`, {
      method: 'DELETE',
    });
    console.log(`   Status: ${deleteResponse.status} ${deleteResponse.statusText}`);
    if (deleteResponse.status === 405) {
      console.log('   ✅ Correctly returns 405 for unsupported method');
    }
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n📋 Test Summary:');
  console.log('- GET, POST, PUT should return 401 (Unauthorized) if working correctly');
  console.log('- DELETE should return 405 (Method Not Allowed)');
  console.log('- If POST returns 405, there\'s a routing/deployment issue');
}

// Run the test
testUserOrdersAPI().catch(console.error);
