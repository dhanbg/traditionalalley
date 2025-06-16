import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['plannedPickupDateAndTime', 'address', 'contact'];
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
    for (const field of addressFields) {
      if (!body.address[field]) {
        return NextResponse.json(
          { error: `Missing required field: address.${field}` },
          { status: 400 }
        );
      }
    }

    // Validate contact fields
    const contactFields = ['fullName', 'email', 'phone'];
    for (const field of contactFields) {
      if (!body.contact[field]) {
        return NextResponse.json(
          { error: `Missing required field: contact.${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contact.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate pickup date
    const pickupDate = new Date(body.plannedPickupDateAndTime);
    const today = new Date();
    
    if (pickupDate <= today) {
      return NextResponse.json(
        { error: 'Pickup date must be in the future' },
        { status: 400 }
      );
    }

    // Validate pickup time format (should be ISO string or valid date)
    if (isNaN(pickupDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid pickup date format. Use ISO 8601 format (e.g., 2024-01-15T10:00:00Z)' },
        { status: 400 }
      );
    }

    const dhlService = new DHLExpressService();
    const pickup = await dhlService.requestPickup(body);

    return NextResponse.json({
      success: true,
      data: pickup
    });

  } catch (error) {
    console.error('DHL Pickup API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to request pickup',
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
      message: 'DHL Pickup API',
      endpoints: {
        'POST /api/dhl/pickups': 'Request a DHL Express pickup'
      },
      sampleRequest: {
        plannedPickupDateAndTime: '2024-01-15T10:00:00Z',
        closeTime: '18:00',
        location: 'reception',
        locationType: 'business',
        address: {
          countryCode: 'NP',
          cityName: 'Kathmandu',
          postalCode: '44600',
          addressLine1: '123 Main Street',
          addressLine2: 'Building A',
          addressLine3: 'Floor 2'
        },
        contact: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+977-1-1234567',
          companyName: 'Example Company'
        },
        shipments: [
          {
            shipmentID: 'SHIP123',
            productCode: 'P',
            packages: 2
          }
        ]
      }
    },
    { status: 200 }
  );
} 