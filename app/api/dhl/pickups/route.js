import { NextResponse } from 'next/server';
import DHLExpressService from '@/lib/dhl-service';

export async function POST(request) {
  try {
    const dhlService = new DHLExpressService();
    const pickupData = await request.json();

    const pickup = await dhlService.createPickupRequest(pickupData);
    
    return NextResponse.json({
      success: true,
      data: pickup
    });

  } catch (error) {
    console.error('DHL Create Pickup API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create pickup request' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pickupRequestId = searchParams.get('pickupRequestId');
    
    if (!pickupRequestId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: pickupRequestId' 
        },
        { status: 400 }
      );
    }

    const dhlService = new DHLExpressService();
    const pickupData = await request.json();

    const updatedPickup = await dhlService.updatePickupRequest(pickupRequestId, pickupData);
    
    return NextResponse.json({
      success: true,
      data: updatedPickup
    });

  } catch (error) {
    console.error('DHL Update Pickup API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update pickup request' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pickupRequestId = searchParams.get('pickupRequestId');
    
    if (!pickupRequestId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: pickupRequestId' 
        },
        { status: 400 }
      );
    }

    const dhlService = new DHLExpressService();
    const cancelParams = {
      cancelTime: searchParams.get('cancelTime') || new Date().toISOString()
    };

    const cancelResult = await dhlService.cancelPickupRequest(pickupRequestId, cancelParams);
    
    return NextResponse.json({
      success: true,
      data: cancelResult
    });

  } catch (error) {
    console.error('DHL Cancel Pickup API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to cancel pickup request' 
      },
      { status: 500 }
    );
  }
} 