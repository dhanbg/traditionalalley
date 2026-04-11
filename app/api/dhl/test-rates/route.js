import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function GET() {
  try {
    console.log('Testing DHL rates with simple request...');
    
    const dhlService = new DHLExpressService();
    
    // Simple test request
    const testRequest = {
      originAddress: {
        postalCode: '44600',
        cityName: 'Kathmandu',
        countryCode: 'NP'
      },
      destinationAddress: {
        postalCode: '10001',
        cityName: 'New York',
        countryCode: 'US'
      },
      packages: [{
        weight: 1.0,
        length: 20,
        width: 15,
        height: 10
      }],
      plannedShippingDate: '2024-12-17',
      isCustomsDeclarable: false
    };

    console.log('Making DHL API call with test request...');
    const rates = await dhlService.getRates(testRequest);

    return NextResponse.json({
      success: true,
      message: 'DHL rates retrieved successfully',
      data: rates,
      productCount: rates.products?.length || 0,
      filteredToWorldwideOnly: true
    });

  } catch (error) {
    console.error('DHL Test Rates Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      details: error.response?.data,
      suggestion: 'Check the error details above for specific validation issues'
    }, { 
      status: error.response?.status || 500 
    });
  }
} 