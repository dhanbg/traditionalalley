import { NextResponse } from 'next/server';
import DHLExpressService from '@/lib/dhl-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dhlService = new DHLExpressService();

    const params = {
      type: searchParams.get('type') || 'pickup',
      originCountryCode: searchParams.get('originCountryCode') || 'NP',
      originCityName: searchParams.get('originCityName') || 'Kathmandu',
      destinationCountryCode: searchParams.get('destinationCountryCode'),
      destinationCityName: searchParams.get('destinationCityName'),
      shipTimestamp: searchParams.get('shipTimestamp') || new Date().toISOString(),
      accountNumber: searchParams.get('accountNumber')
    };

    // Validate required parameters
    if (!params.destinationCountryCode || !params.destinationCityName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: destinationCountryCode, destinationCityName' 
        },
        { status: 400 }
      );
    }

    const capabilities = await dhlService.validatePickupDeliveryCapabilities(params);
    
    return NextResponse.json({
      success: true,
      data: capabilities
    });

  } catch (error) {
    console.error('DHL Capabilities API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to validate capabilities' 
      },
      { status: 500 }
    );
  }
} 