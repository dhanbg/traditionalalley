/**
 * DHL API Test Script
 * Quick test to verify API credentials and connection
 */

// Import the DHL client (using require for Node.js compatibility)
const DHLExpressAPI = require('./utils/dhl-api-client.js').default;

// Test credentials
const testConfig = {
    accountNumber: '575554290',
    username: 'apD8lO9lT9qY8e',
    password: 'T#3kA^6uO!0oZ@2o',
    production: false // Using test environment
};

async function testDHLConnection() {
    console.log('🚚 Testing DHL Express API Connection...\n');
    
    try {
        // Initialize DHL client
        const dhlClient = new DHLExpressAPI(testConfig);
        console.log('✅ DHL Client initialized successfully');
        console.log(`📍 Using ${testConfig.production ? 'PRODUCTION' : 'TEST'} environment`);
        console.log(`🔑 Account Number: ${testConfig.accountNumber}\n`);

        // Test rate request
        console.log('📊 Testing Rate Request...');
        const rateRequest = {
            origin: {
                countryCode: 'US',
                cityName: 'New York',
                postalCode: '10001'
            },
            destination: {
                countryCode: 'GB',
                cityName: 'London',
                postalCode: 'SW1A 1AA'
            },
            weight: 2.5,
            dimensions: {
                length: 20,
                width: 15,
                height: 10
            },
            plannedShippingDate: '2024-12-21',
            isCustomsDeclarable: true,
            unitOfMeasurement: 'metric',
            options: {
                requestEstimatedDeliveryDate: true,
                getAllValueAddedServices: true
            }
        };

        const rates = await dhlClient.getRates(rateRequest);
        
        if (rates && rates.products) {
            console.log(`✅ Rate request successful! Found ${rates.products.length} shipping options:`);
            rates.products.forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.productName} - ${product.totalPrice?.[0]?.priceCurrency} ${product.totalPrice?.[0]?.price}`);
            });
        } else {
            console.log('⚠️  Rate request returned no products');
        }

    } catch (error) {
        console.error('❌ DHL API Test Failed:');
        console.error(`   Error: ${error.message}`);
        
        if (error.message.includes('401')) {
            console.error('   🔐 Authentication failed - check your credentials');
        } else if (error.message.includes('400')) {
            console.error('   📝 Bad request - check your request parameters');
        } else if (error.message.includes('500')) {
            console.error('   🔧 Server error - try again later');
        }
    }
}

// Run the test
testDHLConnection(); 