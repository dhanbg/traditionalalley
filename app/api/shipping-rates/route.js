import { NextResponse } from 'next/server';

// Server-side route: prefer internal Docker URL for container-to-container communication
const API_BASE_URL = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'https://admin.traditionalalley.com.np';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

// Add validation for required environment variables
if (!API_TOKEN) {
  console.error('STRAPI_API_TOKEN is not defined in environment variables');
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
          message: 'STRAPI_API_TOKEN environment variable is missing'
        },
        { status: 500 }
      );
    }
    
    const response = await fetch(strapiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
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
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
    
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
          message: 'STRAPI_API_TOKEN environment variable is missing'
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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('documentId');
    const body = await request.json().catch(() => ({}));
    const targetId = id || body?.documentId || body?.id;

    if (!targetId && !body?.documentIds) {
      return NextResponse.json({ error: 'Missing documentId or documentIds' }, { status: 400 });
    }

    if (!API_TOKEN) {
      return NextResponse.json(
        { error: 'API token not configured', message: 'STRAPI_API_TOKEN environment variable is missing' },
        { status: 500 }
      );
    }

    if (body?.documentIds && Array.isArray(body.documentIds)) {
      // Bulk delete
      let deletedCount = 0;
      for (const docId of body.documentIds) {
        const delRes = await fetch(`${API_BASE_URL}/api/shipping-rates/${docId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        if (delRes.ok) deletedCount++;
      }
      return NextResponse.json({ success: true, deletedCount });
    }

    const deleteUrl = `${API_BASE_URL}/api/shipping-rates/${targetId}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Failed to delete shipping rate', details: errorText }, { status: response.status });
    }

    const data = await response.json().catch(() => ({ success: true }));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Shipping rates DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}