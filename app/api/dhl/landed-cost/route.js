import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['originAddress', 'destinationAddress', 'packages', 'items', 'plannedShippingDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate address fields
    const addressFields = ['postalCode', 'cityName', 'countryCode'];
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
            { error: `Invalid package ${i + 1}: ${field} must be a positive number` },
            { status: 400 }
          );
        }
      }
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required for landed cost calculation' },
        { status: 400 }
      );
    }

    const itemFields = ['name', 'description', 'quantity', 'unitPrice'];
    for (let i = 0; i < body.items.length; i++) {
      for (const field of itemFields) {
        if (!body.items[i][field]) {
          return NextResponse.json(
            { error: `Missing required field in item ${i + 1}: ${field}` },
            { status: 400 }
          );
        }
      }

      // Validate numeric fields
      if (body.items[i].quantity <= 0 || body.items[i].unitPrice <= 0) {
        return NextResponse.json(
          { error: `Invalid item ${i + 1}: quantity and unitPrice must be positive numbers` },
          { status: 400 }
        );
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

    const dhlService = new DHLExpressService();
    const landedCost = await dhlService.getLandedCost(body);

    return NextResponse.json({
      success: true,
      data: landedCost
    });

  } catch (error) {
    console.error('DHL Landed Cost API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to calculate landed cost',
        message: error.message,
        details: error.data || null
      },
      { status: error.status || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to calculate landed cost.' },
    { status: 405 }
  );
} 