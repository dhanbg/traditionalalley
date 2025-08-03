const axios = require('axios');

console.log('🔧 DHL API Configuration Test');
console.log('============================');

// Hardcoded DHL API credentials
const DHL_CONFIG = {
  baseURL: 'https://express.api.dhl.com/mydhlapi',
  apiKey: 'apD8lO9lT9qY8e',
  apiSecret: 'E@4cP$9zM!2rW^9s',
  accountNumber: '575554290'
};

// Check credentials
console.log('📋 Checking DHL API Credentials:');
console.log(`DHL_API_BASE_URL: ${DHL_CONFIG.baseURL ? '✅ Set' : '❌ Missing'}`);
console.log(`DHL_API_KEY: ${DHL_CONFIG.apiKey ? '✅ Set' : '❌ Missing'}`);
console.log(`DHL_API_SECRET: ${DHL_CONFIG.apiSecret ? '✅ Set (hidden)' : '❌ Missing'}`);
console.log(`DHL_ACCOUNT_NUMBER: ${DHL_CONFIG.accountNumber ? '✅ Set' : '❌ Missing'}`);
console.log('');

// Simple DHL API client for testing
class DHLTestClient {
  constructor() {
    this.baseURL = DHL_CONFIG.baseURL;
    this.apiKey = DHL_CONFIG.apiKey;
    this.apiSecret = DHL_CONFIG.apiSecret;
    this.accountNumber = DHL_CONFIG.accountNumber;
    
    // Create Basic Auth header
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
    
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${credentials}`
    };
  }

  async getRates(rateRequest) {
    const payload = {
      customerDetails: {
        shipperDetails: {
          postalCode: rateRequest.originAddress.postalCode,
          cityName: rateRequest.originAddress.cityName,
          countryCode: rateRequest.originAddress.countryCode
        },
        receiverDetails: {
          postalCode: rateRequest.destinationAddress.postalCode,
          cityName: rateRequest.destinationAddress.cityName,
          countryCode: rateRequest.destinationAddress.countryCode
        }
      },
      accounts: [{
        typeCode: 'shipper',
        number: this.accountNumber
      }],
      plannedShippingDateAndTime: rateRequest.plannedShippingDate + 'T12:00:00GMT+05:45',
      unitOfMeasurement: 'metric',
      isCustomsDeclarable: rateRequest.isCustomsDeclarable || false,
      packages: rateRequest.packages?.map(pkg => ({
        weight: pkg.weight,
        dimensions: {
          length: pkg.length,
          width: pkg.width,
          height: pkg.height
        }
      })) || []
    };

    // Add monetary amount only if customs declarable
    if (rateRequest.isCustomsDeclarable) {
      payload.monetaryAmount = [
        {
          typeCode: 'declaredValue',
          value: rateRequest.packages?.reduce((total, pkg) => total + (pkg.declaredValue || 0), 0) || 0,
          currency: rateRequest.declaredValueCurrency || 'USD'
        }
      ];
    }

    console.log(' Request payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(`${this.baseURL}/rates`, payload, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw {
          message: `API Error: ${error.response.status} ${error.response.statusText}`,
          status: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        throw {
          message: 'Network error - please check your internet connection',
          code: 'NETWORK_ERROR'
        };
      } else {
        throw {
          message: error.message
        };
      }
    }
  }
}

async function testDHLRates() {
  console.log(' 🚚 Testing DHL Rate API');
  console.log('========================');
  
  const dhlClient = new DHLTestClient();
  
  // Test cases for different countries/cities
  const testCases = [
    {
      name: 'Nepal to Australia (Sydney)',
      origin: {
        postalCode: '44600',
        cityName: 'Kathmandu',
        countryCode: 'NP'
      },
      destination: {
        postalCode: '2000',
        cityName: 'Sydney',
        countryCode: 'AU'
      }
    },
    {
      name: 'Nepal to USA (New York)',
      origin: {
        postalCode: '44600',
        cityName: 'Kathmandu',
        countryCode: 'NP'
      },
      destination: {
        postalCode: '10001',
        cityName: 'New York',
        countryCode: 'US'
      }
    },
    {
      name: 'Nepal to UK (London)',
      origin: {
        postalCode: '44600',
        cityName: 'Kathmandu',
        countryCode: 'NP'
      },
      destination: {
        postalCode: 'SW1A 1AA',
        cityName: 'London',
        countryCode: 'GB'
      }
    },
    {
      name: 'Nepal to Canada (Toronto)',
      origin: {
        postalCode: '44600',
        cityName: 'Kathmandu',
        countryCode: 'NP'
      },
      destination: {
        postalCode: 'M5H 2N2',
        cityName: 'Toronto',
        countryCode: 'CA'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n 📦 Testing: ${testCase.name}`);
    console.log('─'.repeat(50));
    
    const rateRequest = {
      plannedShippingDate: getNextBusinessDay(),
      originAddress: testCase.origin,
      destinationAddress: testCase.destination,
      packages: [{
        weight: 1.5,
        length: 20,
        width: 15,
        height: 10,
        description: 'Traditional Handicraft',
        declaredValue: 100,
        quantity: 1
      }],
      isCustomsDeclarable: true,
      declaredValueCurrency: 'USD'
    };

    try {
      console.log(` 📍 Origin: ${testCase.origin.cityName}, ${testCase.origin.countryCode}`);
      console.log(` 📍 Destination: ${testCase.destination.cityName}, ${testCase.destination.countryCode}`);
      console.log(` 📦 Package: 1.5kg, 20x15x10cm, $100 value`);
      console.log(' 📊 Getting rates...');
      
      const rates = await dhlClient.getRates(rateRequest);
      
      if (rates && rates.products && rates.products.length > 0) {
        console.log(' 🎉 Success! Available services:');
        rates.products.forEach((product, index) => {
          const totalPrice = product.totalPrice?.[0];
          console.log(`  ${index + 1}. ${product.productName}`);
          console.log(`     💸 Price: ${totalPrice?.price} ${totalPrice?.currencyType}`);
          console.log(`     🚚 Delivery: ${product.deliveryCapabilities?.deliveryTypeCode || 'N/A'}`);
          if (product.deliveryCapabilities?.estimatedDeliveryDateAndTime) {
            console.log(`     🕒 Est. Delivery: ${product.deliveryCapabilities.estimatedDeliveryDateAndTime}`);
          }
        });
      } else {
        console.log(' 🤔 No rates available for this route');
      }
      
    } catch (error) {
      console.log(' 🚨 Error getting rates:');
      console.log(`   📝 Message: ${error.message}`);
      if (error.status) {
        console.log(`   📊 Status: ${error.status}`);
      }
      if (error.data) {
        console.log(`   📁 Details:`, JSON.stringify(error.data, null, 2));
      }
    }
  }
}

async function testCredentials() {
  console.log('\n 🔒 Testing DHL API Authentication');
  console.log('==================================');
  
  if (!DHL_CONFIG.baseURL || !DHL_CONFIG.apiKey || 
      !DHL_CONFIG.apiSecret || !DHL_CONFIG.accountNumber) {
    console.log(' 🚨 Missing required credentials');
    console.log('Please check the hardcoded credentials are set properly');
    return false;
  }

  const credentials = Buffer.from(`${DHL_CONFIG.apiKey}:${DHL_CONFIG.apiSecret}`).toString('base64');
  
  try {
    // Test with a simple rate request
    const response = await axios.post(`${DHL_CONFIG.baseURL}/rates`, {
      customerDetails: {
        shipperDetails: {
          postalCode: '44600',
          cityName: 'Kathmandu',
          countryCode: 'NP'
        },
        receiverDetails: {
          postalCode: '2000',
          cityName: 'Sydney',
          countryCode: 'AU'
        }
      },
      accounts: [{
        typeCode: 'shipper',
        number: DHL_CONFIG.accountNumber
      }],
      plannedShippingDateAndTime: getNextBusinessDay() + 'T12:00:00GMT+05:45',
      unitOfMeasurement: 'metric',
      isCustomsDeclarable: true,
      packages: [{
        weight: 1,
        dimensions: {
          length: 10,
          width: 10,
          height: 10
        }
      }],
      monetaryAmount: [{
        typeCode: 'declaredValue',
        value: 50,
        currency: 'USD'
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${credentials}`
      }
    });

    console.log(' 🎉 Authentication successful!');
    console.log(' 🔒 API credentials are working correctly');
    return true;
    
  } catch (error) {
    console.log(' 🚨 Authentication failed:');
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Message: ${error.response.statusText}`);
      if (error.response.status === 401) {
        console.log('   🚨 This indicates invalid API credentials');
      } else if (error.response.status === 403) {
        console.log('   🚫 This indicates insufficient permissions');
      }
      console.log(`   📁 Details:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`   📝 Error: ${error.message}`);
    }
    return false;
  }
}

function getNextBusinessDay() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // If tomorrow is Saturday (6) or Sunday (0), move to Monday
  if (tomorrow.getDay() === 6) {
    tomorrow.setDate(tomorrow.getDate() + 2);
  } else if (tomorrow.getDay() === 0) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  
  return tomorrow.toISOString().split('T')[0];
}

async function runAllTests() {
  try {
    const credentialsValid = await testCredentials();
    
    if (credentialsValid) {
      await testDHLRates();
    }
    
    console.log('\n 📊 Test Summary');
    console.log('===============');
    console.log(` 🔒 DHL API credentials: ${credentialsValid ? 'VALID' : 'INVALID'}`);
    console.log(' 📦 Rate calculation tests completed');
    
  } catch (error) {
    console.error('\n 🚨 Test failed with error:', error);
  }
}

// Run the tests
runAllTests().catch(console.error);
