import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber');
    
    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Missing required parameter: trackingNumber' },
        { status: 400 }
      );
    }

    // Validate tracking number format (basic validation)
    if (trackingNumber.length < 10 || trackingNumber.length > 35) {
      return NextResponse.json(
        { error: 'Invalid tracking number format' },
        { status: 400 }
      );
    }

    const dhlService = new DHLExpressService();
    const trackingInfo = await dhlService.trackShipment(trackingNumber);

    return NextResponse.json({
      success: true,
      data: trackingInfo
    });

  } catch (error) {
    console.error('DHL Tracking API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to track shipment',
        message: error.message,
        details: error.data || null
      },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.trackingNumbers || !Array.isArray(body.trackingNumbers)) {
      return NextResponse.json(
        { error: 'Missing required field: trackingNumbers (array)' },
        { status: 400 }
      );
    }

    if (body.trackingNumbers.length === 0) {
      return NextResponse.json(
        { error: 'At least one tracking number is required' },
        { status: 400 }
      );
    }

    if (body.trackingNumbers.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 tracking numbers allowed per request' },
        { status: 400 }
      );
    }

    // Validate each tracking number
    for (let i = 0; i < body.trackingNumbers.length; i++) {
      const trackingNumber = body.trackingNumbers[i];
      if (!trackingNumber || typeof trackingNumber !== 'string') {
        return NextResponse.json(
          { error: `Invalid tracking number at index ${i}` },
          { status: 400 }
        );
      }
      
      if (trackingNumber.length < 10 || trackingNumber.length > 35) {
        return NextResponse.json(
          { error: `Invalid tracking number format at index ${i}` },
          { status: 400 }
        );
      }
    }

    const dhlService = new DHLExpressService();
    const trackingPromises = body.trackingNumbers.map(trackingNumber => 
      dhlService.trackShipment(trackingNumber).catch(error => ({
        trackingNumber,
        error: error.message
      }))
    );

    const trackingResults = await Promise.all(trackingPromises);

    return NextResponse.json({
      success: true,
      data: trackingResults
    });

  } catch (error) {
    console.error('DHL Bulk Tracking API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to track shipments',
        message: error.message,
        details: error.data || null
      },
      { status: error.status || 500 }
    );
  }
} 