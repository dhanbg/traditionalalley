import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Add validation for required environment variables
if (!API_TOKEN) {
  console.error('NEXT_PUBLIC_STRAPI_API_TOKEN is not defined in environment variables');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';
    const pageSize = searchParams.get('pagination[pageSize]') || '100';
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