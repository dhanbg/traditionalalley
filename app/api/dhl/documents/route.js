import { NextResponse } from 'next/server';
import DHLExpressService from '@/lib/dhl-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dhlService = new DHLExpressService();
    
    const shipmentTrackingNumber = searchParams.get('shipmentTrackingNumber');
    const documentType = searchParams.get('documentType'); // 'proof-of-delivery' or 'image'
    
    if (!shipmentTrackingNumber || !documentType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: shipmentTrackingNumber, documentType' 
        },
        { status: 400 }
      );
    }

    let documentData;
    
    if (documentType === 'proof-of-delivery') {
      const params = {
        typeCode: searchParams.get('typeCode') || 'PLD',
        pickupDate: searchParams.get('pickupDate'),
        timestamp: searchParams.get('timestamp')
      };
      documentData = await dhlService.getElectronicProofOfDelivery(shipmentTrackingNumber, params);
    } else if (documentType === 'image') {
      const params = {
        shipmentTrackingNumber,
        typeCode: searchParams.get('typeCode') || 'waybillDoc',
        pickupDate: searchParams.get('pickupDate'),
        timestamp: searchParams.get('timestamp')
      };
      documentData = await dhlService.getImage(shipmentTrackingNumber, params);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid documentType. Use "proof-of-delivery" or "image"' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: documentData
    });

  } catch (error) {
    console.error('DHL Documents API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to retrieve document' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dhlService = new DHLExpressService();
    
    const shipmentTrackingNumber = searchParams.get('shipmentTrackingNumber');
    const uploadType = searchParams.get('uploadType'); // 'commercial-invoice' or 'plt-images'
    
    if (!shipmentTrackingNumber || !uploadType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: shipmentTrackingNumber, uploadType' 
        },
        { status: 400 }
      );
    }

    const uploadData = await request.json();
    let result;
    
    if (uploadType === 'commercial-invoice') {
      result = await dhlService.uploadCommercialInvoice(shipmentTrackingNumber, uploadData);
    } else if (uploadType === 'plt-images') {
      result = await dhlService.uploadPaperlessTradeImages(shipmentTrackingNumber, uploadData);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid uploadType. Use "commercial-invoice" or "plt-images"' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('DHL Upload Documents API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to upload document' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const dhlService = new DHLExpressService();
    const invoiceData = await request.json();

    const result = await dhlService.uploadCommercialInvoiceData(invoiceData);
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('DHL Upload Invoice Data API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to upload invoice data' 
      },
      { status: 500 }
    );
  }
} 