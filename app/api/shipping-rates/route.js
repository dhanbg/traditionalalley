import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.traditionalalley.com.np';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a';

// Add validation for required environment variables
if (!API_TOKEN) {
  console.error('NEXT_PUBLIC_STRAPI_API_TOKEN is not defined in environment variables');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';
    const pageSize = searchParams.get('pagination[pageSize]') || '1000';
    const page = searchParams.get('pagination[page]') || '1';
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      populate,
      'pagination[pageSize]': pageSize,
      'pagination[page]': page
    });
    
    // Add any filter parameters
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filters[')) {
        queryParams.set(key, value);
      }
    }
    
    const strapiUrl = `${API_BASE_URL}/api/shipping-rates?${queryParams.toString()}`;
    
    console.log('Fetching shipping rates from Strapi:', strapiUrl);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('API_TOKEN exists:', !!API_TOKEN);
    
    if (!API_TOKEN) {
      return NextResponse.json(
        { 
          error: 'API token not configured',
          message: 'NEXT_PUBLIC_STRAPI_API_TOKEN environment variable is missing'
        },
        { status: 500 }
      );
    }
    
    const response = await fetch(strapiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strapi API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch shipping rates from Strapi',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Successfully fetched shipping rates:', data.data?.length || 0, 'rates');
    console.log('Full Strapi response:', JSON.stringify(data, null, 2));
    
    // Log detailed information about the response
    if (data.data && Array.isArray(data.data)) {
      console.log('Shipping rates data structure:', {
        totalCount: data.data.length,
        firstRate: data.data[0] ? {
          id: data.data[0].id,
          attributes: Object.keys(data.data[0].attributes || {})
        } : null,
        meta: data.meta
      });
    } else {
      console.log('Unexpected data structure:', typeof data, Object.keys(data));
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Shipping rates API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        details: error.stack
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const strapiUrl = `${API_BASE_URL}/api/shipping-rates`;
    
    console.log('Creating shipping rate in Strapi:', strapiUrl);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('API_TOKEN exists:', !!API_TOKEN);
    
    if (!API_TOKEN) {
      return NextResponse.json(
        { 
          error: 'API token not configured',
          message: 'NEXT_PUBLIC_STRAPI_API_TOKEN environment variable is missing'
        },
        { status: 500 }
      );
    }
    
    const response = await fetch(strapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strapi API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to create shipping rate in Strapi',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Successfully created shipping rate');
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Shipping rates POST API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        details: error.stack
      },
      { status: 500 }
    );
  }
}