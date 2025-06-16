import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['originAddress', 'destinationAddress', 'packages', 'plannedShippingDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate address fields
    const addressFields = ['countryCode', 'cityName', 'postalCode'];
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
            { error: `Invalid or missing field: packages[${i}].${field}` },
            { status: 400 }
          );
        }
      }
    }

    const dhlService = new DHLExpressService();
    const rates = await dhlService.getRates(body);

    return NextResponse.json({
      success: true,
      data: rates
    });

  } catch (error) {
    console.error('DHL Rates API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get shipping rates',
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
      message: 'DHL Rates API',
      endpoints: {
        'POST /api/dhl/rates': 'Get shipping rates for a shipment'
      }
    },
    { status: 200 }
  );
} 