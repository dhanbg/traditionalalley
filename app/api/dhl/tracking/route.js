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
    const tracking = await dhlService.trackShipment(trackingNumber);

    return NextResponse.json({
      success: true,
      data: tracking
    });

  } catch (error) {
    console.error('DHL Tracking API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to track shipment',
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

    if (body.trackingNumbers.length > 30) {
      return NextResponse.json(
        { error: 'Maximum 30 tracking numbers allowed per request' },
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
    
    // Track multiple shipments
    const trackingPromises = body.trackingNumbers.map(async (trackingNumber) => {
      try {
        const result = await dhlService.trackShipment(trackingNumber);
        return {
          trackingNumber,
          success: true,
          data: result
        };
      } catch (error) {
        return {
          trackingNumber,
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.all(trackingPromises);

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('DHL Tracking API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to track shipments',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 