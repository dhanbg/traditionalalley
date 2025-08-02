const axios = require('axios');
require('dotenv').config();

async function testNcmApi() {
  try {
    // Verify environment variables
    if (!process.env.NCM_API_BASE_URL || !process.env.NCM_API_TOKEN) {
      console.error('ERROR: NCM_API_BASE_URL or NCM_API_TOKEN is missing in .env');
      return;
    }

    console.log('Testing NCM API configuration...');
    console.log(`Using base URL: ${process.env.NCM_API_BASE_URL}`);
    
    // Test branch list endpoint
    const branchUrl = `${process.env.NCM_API_BASE_URL}branchlist`;
    console.log(`\nTesting branch list endpoint: ${branchUrl}`);
    
    const response = await axios.get(branchUrl, {
      headers: {
        'Authorization': `Token ${process.env.NCM_API_TOKEN}`
      }
    });

    console.log('\n✅ Success! API response received.');
    console.log(`Status: ${response.status}`);
    
    // Check if response data contains branches array
    const responseData = response.data;
    let branches = [];
    
    try {
      // Parse the stringified JSON data
      if (responseData && responseData.data && typeof responseData.data === 'string') {
        branches = JSON.parse(responseData.data);
      } else if (Array.isArray(responseData.data)) {
        branches = responseData.data;
      }
      
      console.log(`Data received: ${branches.length} branches`);
      
      // Display first 3 branches as sample
      if (branches.length > 0) {
        console.log('\nSample branch data:');
        branches.slice(0, 3).forEach(branch => {
          console.log(`- ${branch[0]} (${branch[1]})`);
        });
      } else {
        console.log('\nNo branches found in response');
      }
    } catch (parseError) {
      console.error('\n❌ Failed to parse response data:', parseError);
      console.log('Full response:', responseData);
    }

  } catch (error) {
    console.error('\n❌ API test failed:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.log(`Status: ${error.response.status}`);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('Request:', error.request);
    } else {
      // Something happened in setting up the request
      console.log('Error:', error.message);
    }
    
    console.log('Config:', error.config);
  }
}

testNcmApi();
