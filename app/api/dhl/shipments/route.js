import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'originAddress', 
      'destinationAddress', 
      'packages', 
      'plannedShippingDate',
      'shipper',
      'recipient'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate address fields
    const addressFields = ['countryCode', 'cityName', 'postalCode', 'addressLine1'];
    for (const address of ['originAddress', 'destinationAddress']) {
      for (const field of addressFields) {
        if (!body[address][field]) {
          return NextResponse.json(
            { error: `Missing required field: ${address}.${field}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate contact information
    const contactFields = ['fullName', 'email', 'phone'];
    for (const contact of ['shipper', 'recipient']) {
      for (const field of contactFields) {
        if (!body[contact][field]) {
          return NextResponse.json(
            { error: `Missing required field: ${contact}.${field}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate packages
    if (!Array.isArray(body.packages) || body.packages.length === 0) {
      return NextResponse.json(
        { error: 'At least one package is required' },
        { status: 400 }
      );
    }

    const packageFields = ['weight', 'length', 'width', 'height', 'description'];
    for (let i = 0; i < body.packages.length; i++) {
      for (const field of packageFields) {
        if (!body.packages[i][field]) {
          return NextResponse.json(
            { error: `Missing required field: packages[${i}].${field}` },
            { status: 400 }
          );
        }
      }
      
      // Validate numeric fields
      const numericFields = ['weight', 'length', 'width', 'height'];
      for (const field of numericFields) {
        if (body.packages[i][field] <= 0) {
          return NextResponse.json(
            { error: `Invalid value for packages[${i}].${field}: must be greater than 0` },
            { status: 400 }
          );
        }
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.shipper.email)) {
      return NextResponse.json(
        { error: 'Invalid shipper email format' },
        { status: 400 }
      );
    }
    if (!emailRegex.test(body.recipient.email)) {
      return NextResponse.json(
        { error: 'Invalid recipient email format' },
        { status: 400 }
      );
    }

    // Validate planned shipping date
    const shippingDate = new Date(body.plannedShippingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (shippingDate < today) {
      return NextResponse.json(
        { error: 'Planned shipping date cannot be in the past' },
        { status: 400 }
      );
    }

    const dhlService = new DHLExpressService();
    const shipment = await dhlService.createShipment(body);

    return NextResponse.json({
      success: true,
      data: shipment
    });

  } catch (error) {
    console.error('DHL Shipments API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create shipment',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'DHL Shipments API',
      endpoints: {
        'POST /api/dhl/shipments': 'Create a new DHL Express shipment'
      }
    },
    { status: 200 }
  );
} 