const axios = require('axios');
require('dotenv').config();

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://admin.traditionalalley.com.np";
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Test data for shipping rates
const shippingRatesData = [
  {
    service_type: "Economy",
    country_name: "India",
    country_code: "IN",
    weight_from: 0,
    weight_to: 0.5,
    rate: 2000,
    rate_per_kg: null,
    weight_limit: null,
    effective_from: null
  },
  {
    service_type: "Express",
    country_name: "USA",
    country_code: "US",
    weight_from: 0.5,
    weight_to: 2,
    rate: 3500,
    rate_per_kg: null,
    weight_limit: 10,
    effective_from: null
  },
  {
    service_type: "Economy",
    country_name: "Germany",
    country_code: "DE",
    weight_from: 1,
    weight_to: 5,
    rate: 5000,
    rate_per_kg: null,
    weight_limit: 20,
    effective_from: null
  },
  {
    service_type: "Economy",
    country_name: "Canada",
    country_code: "CA",
    weight_from: 0,
    weight_to: 1,
    rate: 2500,
    rate_per_kg: null,
    weight_limit: null,
    effective_from: null
  },
  {
    service_type: "Express",
    country_name: "UK",
    country_code: "GB",
    weight_from: 0.5,
    weight_to: 3,
    rate: 4000,
    rate_per_kg: null,
    weight_limit: 15,
    effective_from: null
  }
];

// Function to create shipping rates using axios
async function createShippingRates() {
  console.log('=== Creating Shipping Rates ===');
  console.log('API URL:', API_URL);
  console.log('Has Token:', !!STRAPI_API_TOKEN);
  console.log('');
  
  if (!STRAPI_API_TOKEN) {
    console.error('❌ STRAPI_API_TOKEN is not set in environment variables');
    return;
  }
  
  try {
    const results = [];
    
    for (let i = 0; i < shippingRatesData.length; i++) {
      const rateData = shippingRatesData[i];
      console.log(`[${i + 1}/${shippingRatesData.length}] Creating shipping rate for ${rateData.country_name} (${rateData.service_type})...`);
      
      const payload = {
        data: rateData
      };
      
      try {
        const response = await axios.post(`${API_URL}/api/shipping-rates`, payload, {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });
        
        console.log('✅ Success:', {
          id: response.data.data.id,
          documentId: response.data.data.documentId,
          country: response.data.data.country_name,
          service: response.data.data.service_type,
          rate: response.data.data.rate
        });
        results.push({ success: true, data: response.data });
      } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.response?.data || error.message;
        console.error('❌ Error:', errorMsg);
        results.push({ 
          success: false, 
          error: errorMsg, 
          data: rateData 
        });
      }
      
      // Add a small delay between requests to avoid overwhelming the server
      if (i < shippingRatesData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n=== Summary ===');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\nFailed entries:');
      results.filter(r => !r.success).forEach((result, index) => {
        console.log(`${index + 1}. ${result.data.country_name} (${result.data.service_type}): ${result.error}`);
      });
    }
    
    return results;
  } catch (error) {
    console.error('Fatal error:', error.message);
    throw error;
  }
}

// Function to fetch existing shipping rates
async function fetchShippingRates() {
  console.log('=== Fetching Shipping Rates ===');
  
  if (!STRAPI_API_TOKEN) {
    console.error('❌ STRAPI_API_TOKEN is not set in environment variables');
    return;
  }
  
  try {
    const response = await axios.get(`${API_URL}/api/shipping-rates?populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`Found ${response.data.data.length} shipping rates:`);
    
    response.data.data.forEach((rate, index) => {
      console.log(`${index + 1}. ${rate.country_name} (${rate.country_code}) - ${rate.service_type}`);
      console.log(`   Weight: ${rate.weight_from}kg - ${rate.weight_to}kg, Rate: ${rate.rate}`);
      console.log(`   ID: ${rate.id}, DocumentID: ${rate.documentId}`);
      console.log('');
    });
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.response?.data || error.message;
    console.error('❌ Error fetching shipping rates:', errorMsg);
    throw error;
  }
}

// Function to delete all shipping rates (for testing purposes)
async function deleteAllShippingRates() {
  console.log('=== Deleting All Shipping Rates ===');
  
  if (!STRAPI_API_TOKEN) {
    console.error('❌ STRAPI_API_TOKEN is not set in environment variables');
    return;
  }
  
  try {
    // First fetch all rates
    const response = await axios.get(`${API_URL}/api/shipping-rates`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const rates = response.data.data;
    console.log(`Found ${rates.length} shipping rates to delete`);
    
    for (let i = 0; i < rates.length; i++) {
      const rate = rates[i];
      console.log(`[${i + 1}/${rates.length}] Deleting ${rate.country_name} (${rate.service_type})...`);
      
      try {
        await axios.delete(`${API_URL}/api/shipping-rates/${rate.documentId}`, {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Deleted successfully');
      } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.response?.data || error.message;
        console.error('❌ Delete failed:', errorMsg);
      }
      
      // Small delay between deletions
      if (i < rates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.response?.data || error.message;
    console.error('❌ Error:', errorMsg);
    throw error;
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'create';
  
  console.log('🚢 Shipping Rates Test Tool');
  console.log('==========================');
  console.log('');
  
  try {
    switch (command) {
      case 'create':
        console.log('Command: Create shipping rates\n');
        await createShippingRates();
        break;
        
      case 'fetch':
        console.log('Command: Fetch shipping rates\n');
        await fetchShippingRates();
        break;
        
      case 'delete':
        console.log('Command: Delete all shipping rates\n');
        await deleteAllShippingRates();
        break;
        
      case 'reset':
        console.log('Command: Reset (delete all, then create new)\n');
        await deleteAllShippingRates();
        console.log('\n' + '='.repeat(50) + '\n');
        await createShippingRates();
        break;
        
      default:
        console.log('Available commands:');
        console.log('  create  - Create new shipping rates (default)');
        console.log('  fetch   - Fetch existing shipping rates');
        console.log('  delete  - Delete all shipping rates');
        console.log('  reset   - Delete all and create new rates');
        console.log('');
        console.log('Usage: node test-shipping-rates-cjs.js [command]');
        return;
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  createShippingRates,
  fetchShippingRates,
  deleteAllShippingRates,
  shippingRatesData
};