import dotenv from 'dotenv';
import DHLExpressService from './lib/dhl-service.js';

// Load environment variables
dotenv.config();

async function testDHLAPI() {
  console.log('=== DHL API Debug Test ===');
  
  // Debug environment variables
  console.log('Environment check:');
  console.log('DHL_API_KEY:', process.env.DHL_API_KEY ? `${process.env.DHL_API_KEY.substring(0, 5)}...` : 'NOT SET');
  console.log('DHL_API_SECRET:', process.env.DHL_API_SECRET ? `${process.env.DHL_API_SECRET.substring(0, 5)}...` : 'NOT SET');
  console.log('DHL_BASE_URL:', process.env.DHL_BASE_URL);
  console.log('DHL_ENVIRONMENT:', process.env.DHL_ENVIRONMENT);
  console.log('');
  
  const dhlService = new DHLExpressService();
  
  // Test data similar to what the form would send
  const testShipmentData = {
    plannedShippingDate: '2025-01-20',
    originAddress: {
      postalCode: '44600',
      cityName: 'Kathmandu',
      countryCode: 'NP',
      addressLine1: 'Traditional Alley Store, Thamel'
    },
    destinationAddress: {
      postalCode: '2000',
      cityName: 'Sydney',
      countryCode: 'AU',
      addressLine1: 'Test Destination Address'
    },
    packages: [{
      weight: 1.5,
      length: 20,
      width: 15,
      height: 10,
      description: 'Traditional Handicrafts',
      declaredValue: 100,
      quantity: 1,
      hsCode: '970110'
    }],
    shipper: {
      companyName: 'Traditional Alley Pvt. Ltd.',
      fullName: 'Traditional Alley Team',
      email: 'shipping@traditionalalley.com.np',
      phone: '+977-1-4444444'
    },
    recipient: {
      companyName: 'Test Recipient Company',
      fullName: 'Test Recipient',
      email: 'recipient@example.com',
      phone: '+61-2-9999999'
    },
    productCode: 'P',
    isCustomsDeclarable: true,
    currency: 'USD'
  };

  try {
    console.log('Testing DHL address validation first...');
    const addressResult = await dhlService.validateAddress({
      countryCode: 'NP',
      cityName: 'Kathmandu',
      postalCode: '44600'
    });
    console.log('✅ Address Validation Success:', addressResult);
    
    console.log('\nTesting DHL getRates...');
    const rateResult = await dhlService.getRates(testShipmentData);
    console.log('✅ Rates Success:', rateResult);
    
    console.log('\nTesting DHL createShipment...');
    const result = await dhlService.createShipment(testShipmentData);
    console.log('✅ Shipment Success:', result);
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