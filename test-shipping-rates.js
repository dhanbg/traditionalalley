import axios from 'axios';
import { API_URL, STRAPI_API_TOKEN } from './utils/urls.js';
import { createData } from './utils/api.js';

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

// Function to create shipping rates using the existing API utility
async function createShippingRatesWithAPI() {
  console.log('=== Creating Shipping Rates using API utility ===');
  
  try {
    const results = [];
    
    for (const rateData of shippingRatesData) {
      console.log(`Creating shipping rate for ${rateData.country_name} (${rateData.service_type})...`);
      
      const payload = {
        data: rateData
      };
      
      try {
        const result = await createData('/api/shipping-rates', payload);
        console.log('✅ Success:', result);
        results.push({ success: true, data: result });
      } catch (error) {
        console.error('❌ Error:', error.message);
        results.push({ success: false, error: error.message, data: rateData });
      }
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n=== Summary ===');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    
    return results;
  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  }
}

// Function to create shipping rates using axios directly
async function createShippingRatesWithAxios() {
  console.log('=== Creating Shipping Rates using Axios directly ===');
  
  try {
    const results = [];
    
    for (const rateData of shippingRatesData) {
      console.log(`Creating shipping rate for ${rateData.country_name} (${rateData.service_type})...`);
      
      const payload = {
        data: rateData
      };
      
      try {
        const response = await axios.post(`${API_URL}/api/shipping-rates`, payload, {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Success:', response.data);
        results.push({ success: true, data: response.data });
      } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        results.push({ 
          success: false, 
          error: error.response?.data || error.message, 
          data: rateData 
        });
      }
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n=== Summary ===');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    
    return results;
  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  }
}

// Function to fetch existing shipping rates
async function fetchShippingRates() {
  console.log('=== Fetching existing Shipping Rates ===');
  
  try {
    const response = await axios.get(`${API_URL}/api/shipping-rates?populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Existing shipping rates:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error fetching shipping rates:', error.response?.data || error.message);
    throw error;
  }
}

// Main execution function
async function main() {
  console.log('Starting Shipping Rates Test...');
  console.log('API URL:', API_URL);
  console.log('Has Token:', !!STRAPI_API_TOKEN);
  console.log('');
  
  try {
    // First, fetch existing rates
    await fetchShippingRates();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Choose which method to use (comment/uncomment as needed)
    
    // Method 1: Using existing API utility
    await createShippingRatesWithAPI();
    
    // Method 2: Using axios directly (uncomment to use)
    // await createShippingRatesWithAxios();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Fetch rates again to see the results
    console.log('Fetching updated shipping rates...');
    await fetchShippingRates();
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  createShippingRatesWithAPI,
  createShippingRatesWithAxios,
  fetchShippingRates,
  shippingRatesData
};