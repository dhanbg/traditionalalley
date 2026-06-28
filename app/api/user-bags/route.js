import { NextResponse } from 'next/server';

export async function GET(request) {
  let strapiUrl;
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    
    // Set default query parameters if not present
    if (!searchParams.has('populate')) {
      searchParams.set('populate', '*');
    }
    if (!searchParams.has('sort')) {
      searchParams.set('sort', 'updatedAt:desc');
    }
    if (!searchParams.has('pagination[pageSize]')) {
      searchParams.set('pagination[pageSize]', '1000');
    }

    const base = process.env['STRAPI_INTERNAL_URL'] || process.env['STRAPI_URL'] || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    strapiUrl = `${base}/api/user-bags?${searchParams.toString()}`;

    // Fetch user bags from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Strapi responded with status ${response.status}`);
    }

    const userBags = await response.json();

    return NextResponse.json(userBags);
  } catch (error) {
    // Log the error and the Strapi URL (without token) for debugging
    console.error('Error fetching user bags from Strapi:', error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    } else {
      console.error('Strapi URL not set');
    }

    return NextResponse.json({ 
      error: 'Failed to fetch user bags', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}
