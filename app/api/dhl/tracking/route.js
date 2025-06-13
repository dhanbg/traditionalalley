import { NextResponse } from 'next/server';
import DHLExpressService from '@/lib/dhl-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dhlService = new DHLExpressService();

    const trackingNumber = searchParams.get('trackingNumber');
    const trackingNumbers = searchParams.get('trackingNumbers');
    
    if (!trackingNumber && !trackingNumbers) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: trackingNumber or trackingNumbers' 
        },
        { status: 400 }
      );
    }

    const trackingParams = {
      trackingView: searchParams.get('trackingView') || 'all-checkpoints',
      levelOfDetail: searchParams.get('levelOfDetail') || 'shipment'
    };

    let trackingData;
    
    if (trackingNumbers) {
      // Multiple tracking numbers
      const numbers = trackingNumbers.split(',').map(num => num.trim());
      trackingData = await dhlService.trackMultipleShipments(numbers, trackingParams);
    } else {
      // Single tracking number
      trackingData = await dhlService.trackSingleShipment(trackingNumber, trackingParams);
    }
    
    return NextResponse.json({
      success: true,
      data: trackingData
    });

  } catch (error) {
    console.error('DHL Tracking API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to track shipment' 
      },
      { status: 500 }
    );
  }
} 