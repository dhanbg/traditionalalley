import DHLExpressService from './lib/dhl-service.js';

async function testDHLAPI() {
  console.log('=== DHL API Debug Test ===');
  
  const dhlService = new DHLExpressService();
  
  // Test data similar to what the form would send
  const testShipmentData = {
    plannedShippingDate: '2025-06-14',
    originAddress: {
      postalCode: '44600',
      cityName: 'Kathmandu',
      countryCode: 'NP',
      addressLine1: 'Test Address'
    },
    destinationAddress: {
      postalCode: '2000',
      cityName: 'Sydney',
      countryCode: 'AU',
      addressLine1: 'Test Destination'
    },
    packages: [{
      weight: 1,
      length: 10,
      width: 10,
      height: 10,
      description: 'Test Package',
      declaredValue: 50,
      quantity: 1
    }],
    shipper: {
      companyName: 'Test Company',
      fullName: 'Test Shipper',
      email: 'test@example.com',
      phone: '+977-1-4444444'
    },
    recipient: {
      companyName: 'Test Recipient',
      fullName: 'Test Recipient',
      email: 'recipient@example.com',
      phone: '+61-2-9999999'
    },
    productCode: 'P',
    isCustomsDeclarable: true
  };

  try {
    console.log('Testing DHL createShipment...');
    const result = await dhlService.createShipment(testShipmentData);
    console.log('✅ Success:', result);
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

testDHLAPI().catch(console.error); 