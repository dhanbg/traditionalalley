import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('DHL Shipments API - Received request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    const requiredFields = ['originAddress', 'destinationAddress', 'packages', 'plannedShippingDate', 'shipper', 'recipient'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate address fields (addressLine1 can be empty, but should be provided)
    const requiredAddressFields = ['postalCode', 'cityName', 'countryCode'];
    for (const address of ['originAddress', 'destinationAddress']) {
      for (const field of requiredAddressFields) {
        if (!body[address][field]) {
          return NextResponse.json(
            { error: `Missing required field: ${address}.${field}` },
            { status: 400 }
          );
        }
      }
      // Ensure addressLine1 exists (can be empty string)
      if (body[address].addressLine1 === undefined) {
        body[address].addressLine1 = '';
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

    const packageFields = ['weight', 'length', 'width', 'height'];
    for (let i = 0; i < body.packages.length; i++) {
      for (const field of packageFields) {
        if (!body.packages[i][field] || body.packages[i][field] <= 0) {
          return NextResponse.json(
            { error: `Invalid package ${i + 1}: ${field} must be a positive number` },
            { status: 400 }
          );
        }
      }
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

    console.log('DHL Shipments API - Validation passed, creating shipment...');
    const dhlService = new DHLExpressService();
    const shipment = await dhlService.createShipment(body);
    console.log('DHL Shipments API - Shipment created successfully');

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
        details: error.data || null
      },
      { status: error.status || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create shipments.' },
    { status: 405 }
  );
} 