import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['plannedPickupDate', 'address', 'contact'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate address fields
    const addressFields = ['postalCode', 'cityName', 'countryCode', 'addressLine1'];
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

    // Validate planned pickup date
    const pickupDate = new Date(body.plannedPickupDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (pickupDate < today) {
      return NextResponse.json(
        { error: 'Planned pickup date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate shipments if provided
    if (body.shipments && Array.isArray(body.shipments)) {
      for (let i = 0; i < body.shipments.length; i++) {
        const shipment = body.shipments[i];
        if (!shipment.packages || !Array.isArray(shipment.packages) || shipment.packages.length === 0) {
          return NextResponse.json(
            { error: `Shipment ${i + 1} must have at least one package` },
            { status: 400 }
          );
        }

        const packageFields = ['weight', 'length', 'width', 'height'];
        for (let j = 0; j < shipment.packages.length; j++) {
          for (const field of packageFields) {
            if (!shipment.packages[j][field] || shipment.packages[j][field] <= 0) {
              return NextResponse.json(
                { error: `Invalid package in shipment ${i + 1}, package ${j + 1}: ${field} must be a positive number` },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    const dhlService = new DHLExpressService();
    const pickup = await dhlService.schedulePickup(body);

    return NextResponse.json({
      success: true,
      data: pickup
    });

  } catch (error) {
    console.error('DHL Pickups API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to schedule pickup',
        message: error.message,
        details: error.data || null
      },
      { status: error.status || 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postalCode = searchParams.get('postalCode');
    const cityName = searchParams.get('cityName');
    const countryCode = searchParams.get('countryCode');
    const addressLine1 = searchParams.get('addressLine1');
    const plannedPickupDate = searchParams.get('plannedPickupDate');
    
    if (!postalCode || !cityName || !countryCode || !addressLine1 || !plannedPickupDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: postalCode, cityName, countryCode, addressLine1, plannedPickupDate' },
        { status: 400 }
      );
    }

    // Validate planned pickup date
    const pickupDate = new Date(plannedPickupDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (pickupDate < today) {
      return NextResponse.json(
        { error: 'Planned pickup date cannot be in the past' },
        { status: 400 }
      );
    }

    const pickupRequest = {
      postalCode,
      cityName,
      countryCode,
      addressLine1,
      plannedPickupDate
    };

    const dhlService = new DHLExpressService();
    const pickupTimes = await dhlService.getPickupTimes(pickupRequest);

    return NextResponse.json({
      success: true,
      data: pickupTimes
    });

  } catch (error) {
    console.error('DHL Pickup Times API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get pickup times',
        message: error.message,
        details: error.data || null
      },
      { status: error.status || 500 }
    );
  }
} 