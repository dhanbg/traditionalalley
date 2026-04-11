import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['originAddress', 'destinationAddress', 'packages'];
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

    const dhlService = new DHLExpressService();
    const rates = await dhlService.getRates(body);

    return NextResponse.json({
      success: true,
      data: rates
    });

  } catch (error) {
    console.error('DHL Rates API Error:', error);
    
    // Provide user-friendly error messages
    let userMessage = error.message;
    if (error.status === 404 && error.data?.title === 'Product not found') {
      userMessage = 'No shipping services available for the selected date and route. Please try a different date or check if DHL serves this route.';
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to get shipping rates',
        message: userMessage,
        suggestion: error.suggestion || null,
        details: error.data || null
      },
      { status: error.status || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to get shipping rates.' },
    { status: 405 }
  );
} 