import { NextResponse } from 'next/server';
import DHLExpressService from '@/lib/dhl-service';

export async function POST(request) {
  try {
    const dhlService = new DHLExpressService();
    const shipmentData = await request.json();

    console.log('DHL Shipments API - Received request:', {
      hasShipmentData: !!shipmentData,
      productCode: shipmentData?.productCode,
      plannedShippingDate: shipmentData?.plannedShippingDateAndTime,
      packagesCount: shipmentData?.content?.packages?.length
    });

    // Validate required fields
    if (!shipmentData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing shipment data in request body' 
        },
        { status: 400 }
      );
    }

    const result = await dhlService.createShipment(shipmentData);
    
    console.log('DHL Shipments API - Success:', {
      hasResult: !!result,
      trackingNumber: result?.shipmentTrackingNumber,
      shipmentId: result?.url
    });
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('DHL Create Shipment API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create shipment',
        details: error.response?.data || null
      },
      { status: error.response?.status || 500 }
    );
  }
} 