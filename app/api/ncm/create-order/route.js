import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'cod_charge', 'address', 'fbranch', 'branch'];
    const missingFields = requiredFields.filter(field => {
      // Special handling for cod_charge - it might be 0 which is falsy
      if (field === 'cod_charge') {
        return body[field] === undefined || body[field] === null || body[field] === '';
      }
      return !body[field];
    });
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Get NCM API token from environment variables
    const NCM_API_TOKEN = process.env.NCM_API_TOKEN;
    if (!NCM_API_TOKEN) {
      console.error('NCM_API_TOKEN not found in environment variables');
      return NextResponse.json({
        success: false,
        message: 'NCM API configuration error'
      }, { status: 500 });
    }

    // Prepare the data for NCM API
    const ncmOrderData = {
      name: body.name,
      phone: body.phone,
      phone2: body.phone2 || '',
      cod_charge: parseFloat(body.cod_charge || '0'),
      address: body.address,
      fbranch: body.fbranch,
      branch: body.branch,
      package: body.package || '',
      vref_id: body.vref_id || ''
    };

    console.log('Creating NCM order with data:', ncmOrderData);

    // Make request to NCM API
    const NCM_API_BASE_URL = process.env.NCM_API_BASE_URL || 'https://portal.nepalcanmove.com/api/v1';
    const ncmResponse = await fetch(`${NCM_API_BASE_URL}/order/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${NCM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ncmOrderData)
    });

    const ncmResponseText = await ncmResponse.text();
    console.log('NCM API raw response:', ncmResponseText);

    let ncmData;
    try {
      ncmData = JSON.parse(ncmResponseText);
    } catch (parseError) {
      console.error('Failed to parse NCM API response:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Invalid response from NCM API',
        rawResponse: ncmResponseText
      }, { status: 500 });
    }

    if (!ncmResponse.ok) {
      console.error('NCM API error:', ncmData);
      return NextResponse.json({
        success: false,
        message: ncmData.detail || ncmData.message || 'Failed to create NCM order',
        error: ncmData
      }, { status: ncmResponse.status });
    }

    console.log('NCM order created successfully:', ncmData);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'NCM order created successfully',
      data: {
        orderId: ncmData.orderid || ncmData.id,
        orderDetails: ncmData,
        requestData: ncmOrderData
      }
    });

  } catch (error) {
    console.error('Error creating NCM order:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error while creating NCM order',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
