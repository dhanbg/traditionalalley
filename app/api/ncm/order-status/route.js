import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    // Validate order ID
    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: 'Order ID is required'
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

    console.log(`Fetching NCM order status for order ID: ${orderId}`);

    // Make request to NCM API for order status
    const ncmResponse = await fetch(
      `https://portal.nepalcanmove.com/api/v1/order/status?id=${orderId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Token ${NCM_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseText = await ncmResponse.text();
    console.log(`NCM API Response Status: ${ncmResponse.status}`);
    console.log(`NCM API Raw Response: ${responseText}`);

    // Handle different HTTP status codes
    if (ncmResponse.status === 401) {
      return NextResponse.json({
        success: false,
        message: 'Authentication failed with NCM API'
      }, { status: 401 });
    }

    if (ncmResponse.status === 400) {
      return NextResponse.json({
        success: false,
        message: 'Invalid order ID provided'
      }, { status: 400 });
    }

    if (ncmResponse.status === 404) {
      return NextResponse.json({
        success: false,
        message: 'Order not found in NCM system'
      }, { status: 404 });
    }

    if (ncmResponse.status === 500) {
      return NextResponse.json({
        success: false,
        message: 'NCM API server error'
      }, { status: 500 });
    }

    if (!ncmResponse.ok) {
      return NextResponse.json({
        success: false,
        message: `NCM API error: ${ncmResponse.status}`
      }, { status: ncmResponse.status });
    }

    // Parse JSON response
    let orderStatusData;
    try {
      orderStatusData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse NCM API response as JSON:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Invalid response from NCM API'
      }, { status: 500 });
    }

    // Validate response structure
    if (!Array.isArray(orderStatusData)) {
      console.error('NCM API returned non-array response:', orderStatusData);
      return NextResponse.json({
        success: false,
        message: 'Unexpected response format from NCM API'
      }, { status: 500 });
    }

    console.log(`Successfully fetched ${orderStatusData.length} status entries for order ${orderId}`);

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderId,
        statusHistory: orderStatusData,
        totalStatuses: orderStatusData.length,
        currentStatus: orderStatusData.length > 0 ? orderStatusData[0].status : 'Unknown',
        lastUpdated: orderStatusData.length > 0 ? orderStatusData[0].added_time : null
      }
    });

  } catch (error) {
    console.error('Error fetching NCM order status:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error while fetching order status'
    }, { status: 500 });
  }
}
