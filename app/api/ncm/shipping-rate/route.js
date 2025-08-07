import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const type = searchParams.get('type');

    // Validate required parameters
    if (!from || !to || !type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: from, to, type'
      }, { status: 400 });
    }

    console.log('NCM Shipping Rate Request:', { from, to, type });

    // Call NCM API directly using the production URL that works in Postman
    const ncmApiUrl = `https://portal.nepalcanmove.com/api/v1/shipping-rate?creation=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&type=${encodeURIComponent(type)}`;
    
    const response = await fetch(ncmApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('NCM API request failed:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: `NCM API request failed with status ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();
    
    console.log('NCM API Response:', data);

    // Check if the response has the expected format
    if (data && typeof data.charge !== 'undefined') {
      return NextResponse.json({
        success: true,
        charge: data.charge,
        from: from,
        to: to,
        type: type
      });
    } else {
      console.error('Unexpected NCM API response format:', data);
      return NextResponse.json({
        success: false,
        error: 'Unexpected response format from NCM API'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error getting NCM shipping rate:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
