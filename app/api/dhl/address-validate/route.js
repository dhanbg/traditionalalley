import { NextResponse } from 'next/server';

const DHL_BASE_URL = process.env.DHL_BASE_URL || 'https://express.api.dhl.com/mydhlapi/test';
const DHL_API_KEY = process.env.DHL_API_KEY;
const DHL_API_SECRET = process.env.DHL_API_SECRET;

if (!DHL_API_KEY || !DHL_API_SECRET) {
  console.error('DHL API credentials are not configured');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'delivery'; // delivery or pickup
    const countryCode = searchParams.get('countryCode');
    const cityName = searchParams.get('cityName');
    const postalCode = searchParams.get('postalCode');
    const addressLine1 = searchParams.get('addressLine1');

    // Validate required parameters
    if (!countryCode) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Country code is required',
          message: 'Please provide a valid country code'
        },
        { status: 400 }
      );
    }

    // Build query parameters for DHL API
    const params = new URLSearchParams({
      type: type,
      countryCode: countryCode.toUpperCase()
    });

    if (cityName) params.append('cityName', cityName);
    if (postalCode) params.append('postalCode', postalCode);
    if (addressLine1) params.append('addressLine1', addressLine1);

    console.log('🔍 DHL Address Validate Request:', {
      type,
      countryCode: countryCode.toUpperCase(),
      cityName,
      postalCode,
      addressLine1
    });

    // Create Basic Auth header
    const auth = Buffer.from(`${DHL_API_KEY}:${DHL_API_SECRET}`).toString('base64');

    const response = await fetch(`${DHL_BASE_URL}/address-validate?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ DHL Address Validate Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data
      });

      return NextResponse.json(
        { 
          success: false, 
          error: `DHL API Error: ${response.status}`,
          message: data.detail || data.message || 'Address validation failed',
          dhlError: data
        },
        { status: response.status }
      );
    }

    console.log('✅ DHL Address Validate Success:', {
      addressCount: data.address?.length || 0,
      warningsCount: data.warnings?.length || 0
    });

    // Process the response
    const validationResult = {
      success: true,
      isValid: data.address && data.address.length > 0,
      validatedAddresses: data.address || [],
      warnings: data.warnings || [],
      serviceAvailable: data.address && data.address.length > 0,
      originalInput: {
        type,
        countryCode: countryCode.toUpperCase(),
        cityName,
        postalCode,
        addressLine1
      }
    };

    // Add enhanced information if address is valid
    if (validationResult.isValid && data.address[0]) {
      const mainAddress = data.address[0];
      validationResult.enhancedInfo = {
        standardizedAddress: {
          countryCode: mainAddress.countryCode,
          postalCode: mainAddress.postalCode,
          cityName: mainAddress.cityName,
          countyName: mainAddress.countyName
        },
        serviceArea: mainAddress.serviceArea ? {
          code: mainAddress.serviceArea.code,
          description: mainAddress.serviceArea.description,
          gmtOffset: mainAddress.serviceArea.GMTOffset
        } : null,
        deliveryCapability: true
      };
    }

    return NextResponse.json(validationResult);

  } catch (error) {
    console.error('💥 Address Validate API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message || 'Failed to validate address'
      },
      { status: 500 }
    );
  }
} 