import { NextResponse } from 'next/server';
import DHLExpressService from '@/lib/dhl-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dhlService = new DHLExpressService();

    const params = {
      originCountryCode: searchParams.get('originCountryCode') || 'NP',
      originCityName: searchParams.get('originCityName') || 'Kathmandu',
      destinationCountryCode: searchParams.get('destinationCountryCode'),
      destinationCityName: searchParams.get('destinationCityName'),
      weight: parseFloat(searchParams.get('weight')),
      length: parseFloat(searchParams.get('length')),
      width: parseFloat(searchParams.get('width')),
      height: parseFloat(searchParams.get('height')),
      plannedShippingDate: searchParams.get('plannedShippingDate') || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCustomsDeclarable: searchParams.get('isCustomsDeclarable') === 'true',
      unitOfMeasurement: searchParams.get('unitOfMeasurement') || 'metric'
    };

    // Validate required parameters
    if (!params.destinationCountryCode || !params.destinationCityName || !params.weight) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            message: 'Missing required parameters: destinationCountryCode, destinationCityName, weight',
            code: 'MISSING_PARAMS'
          }
        },
        { status: 400 }
      );
    }

    // Log request parameters for debugging
    console.log('DHL Rates Request Parameters:', params);

    const result = await dhlService.getRatesOnepiece(params);
    
    // Check if the result indicates an error
    if (!result.success) {
      console.error('DHL Rates API Error:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error
        },
        { status: result.status || 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('DHL Rates API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: {
          message: error.message || 'Failed to retrieve rates',
          code: 'API_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const dhlService = new DHLExpressService();
    const shipmentData = await request.json();

    // Log request data for debugging
    console.log('DHL Multi-piece Rates Request Data:', JSON.stringify(shipmentData).substring(0, 500) + '...');

    const result = await dhlService.getRatesMultipiece(shipmentData);
    
    // Check if the result indicates an error
    if (!result.success) {
      console.error('DHL Multi-piece Rates API Error:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error
        },
        { status: result.status || 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('DHL Multi-piece Rates API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: {
          message: error.message || 'Failed to retrieve multi-piece rates',
          code: 'API_ERROR'
        }
      },
      { status: 500 }
    );
  }
} 