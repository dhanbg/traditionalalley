// Test NCM Order Status API with order ID 13765605

async function testNCMOrderStatus() {
  const fetch = (await import('node-fetch')).default;
  const orderId = '13765605';
  
  console.log(`🧪 Testing NCM Order Status API with Order ID: ${orderId}`);
  console.log('='.repeat(60));
  
  // First test: Direct NCM API call (to verify the order exists in NCM)
  try {
    console.log('\n1️⃣ Testing Direct NCM API Call...');
    
    const NCM_API_TOKEN = process.env.NCM_API_TOKEN;
    if (!NCM_API_TOKEN) {
      console.log('❌ NCM_API_TOKEN not found in environment variables');
      return;
    }
    
    console.log(`   Using token: ${NCM_API_TOKEN.substring(0, 8)}...`);
    
    const response = await fetch(
      `https://portal.nepalcanmove.com/api/v1/order/status?id=${orderId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Token ${NCM_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`   Response Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`   Response (first 500 chars): ${responseText.substring(0, 500)}`);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log(`   ✅ Success! Found ${data.length} status entries`);
        
        if (data.length > 0) {
          console.log(`   📍 Current Status: ${data[0].status}`);
          console.log(`   📅 Last Updated: ${data[0].added_time}`);
          console.log('\n   📋 Status History:');
          data.forEach((status, index) => {
            console.log(`      ${index + 1}. ${status.status} (${status.added_time})`);
          });
        }
      } catch (parseError) {
        console.log(`   ❌ Failed to parse response as JSON: ${parseError.message}`);
      }
    } else {
      console.log(`   ❌ API Error: ${response.status} - ${responseText}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Direct API Test Failed: ${error.message}`);
  }
  
  // Second test: Our local API endpoint (once server is running)
  try {
    console.log('\n2️⃣ Testing Local API Endpoint...');
    console.log('   (Waiting for server to start...)');
    
    // Wait a bit for the server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const localResponse = await fetch(
      `http://localhost:3000/api/ncm/order-status?id=${orderId}`
    );
    
    console.log(`   Response Status: ${localResponse.status}`);
    
    const localData = await localResponse.json();
    console.log(`   Response: ${JSON.stringify(localData, null, 2)}`);
    
    if (localData.success) {
      console.log(`   ✅ Local API Success!`);
      console.log(`   📍 Current Status: ${localData.data.currentStatus}`);
      console.log(`   📊 Total Statuses: ${localData.data.totalStatuses}`);
    } else {
      console.log(`   ❌ Local API Error: ${localData.message}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Local API Test Failed: ${error.message}`);
    console.log('   (Server might not be ready yet - try running: npm run dev)');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test Complete!');
}

// Load environment variables
require('dotenv').config();

// Run the test
testNCMOrderStatus().catch(console.error);
