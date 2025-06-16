import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('countryCode');
    const cityName = searchParams.get('cityName');
    const postalCode = searchParams.get('postalCode');

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Missing required parameter: countryCode' },
        { status: 400 }
      );
    }

    if (!cityName) {
      return NextResponse.json(
        { error: 'Missing required parameter: cityName' },
        { status: 400 }
      );
    }

    // Validate country code format (should be 2 characters)
    if (countryCode.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid country code format. Use ISO 3166-1 alpha-2 format (e.g., NP, US, AU)' },
        { status: 400 }
      );
    }

    const addressRequest = {
      countryCode: countryCode.toUpperCase(),
      cityName,
      postalCode: postalCode || ''
    };

    const dhlService = new DHLExpressService();
    const capabilities = await dhlService.validateAddress(addressRequest);

    return NextResponse.json({
      success: true,
      data: capabilities
    });

  } catch (error) {
    console.error('DHL Capabilities API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to validate address capabilities',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['addresses'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(body.addresses) || body.addresses.length === 0) {
      return NextResponse.json(
        { error: 'At least one address is required' },
        { status: 400 }
      );
    }

    if (body.addresses.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 addresses allowed per request' },
        { status: 400 }
      );
    }

    // Validate each address
    for (let i = 0; i < body.addresses.length; i++) {
      const address = body.addresses[i];
      
      if (!address.countryCode) {
        return NextResponse.json(
          { error: `Missing countryCode for address at index ${i}` },
          { status: 400 }
        );
      }
      
      if (!address.cityName) {
        return NextResponse.json(
          { error: `Missing cityName for address at index ${i}` },
          { status: 400 }
        );
      }

      if (address.countryCode.length !== 2) {
        return NextResponse.json(
          { error: `Invalid country code format for address at index ${i}. Use ISO 3166-1 alpha-2 format` },
          { status: 400 }
        );
      }
    }

    const dhlService = new DHLExpressService();
    
    // Validate multiple addresses
    const validationPromises = body.addresses.map(async (address, index) => {
      try {
        const result = await dhlService.validateAddress({
          countryCode: address.countryCode.toUpperCase(),
          cityName: address.cityName,
          postalCode: address.postalCode || ''
        });
        return {
          index,
          address,
          success: true,
          data: result
        };
      } catch (error) {
        return {
          index,
          address,
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.all(validationPromises);

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('DHL Capabilities API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to validate address capabilities',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 