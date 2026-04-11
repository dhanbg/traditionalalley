import { NextResponse } from 'next/server';

export async function GET(request) {
  let strapiUrl;
  try {
    // Parse the URL
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Ensure defaults if not passed
    if (!searchParams.has('populate')) {
        searchParams.set('populate', '*');
        searchParams.set('populate[products]', '*');
        searchParams.set('populate[category]', '*');
    }
    if (!searchParams.has('pagination[pageSize]')) searchParams.set('pagination[pageSize]', '100');
    searchParams.set('publicationState', 'live');

    // Construct the URL for the Strapi API using the public domain to completely bypass Docker network bridges
    const apiUrl = process.env.API_URL || process.env['NEXT_PUBLIC_API_URL'] || 'https://admin.traditionalalley.com.np';
    strapiUrl = `${apiUrl}/api/collections?${searchParams.toString()}`;

    // Fetch collections from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env['NEXT_PUBLIC_STRAPI_API_TOKEN']}`
      }
    });

    if (!response.ok) {
      throw new Error(`Strapi responded with status ${response.status}`);
    }

    const collections = await response.json();
    console.log('Collections data from Strapi:', collections);

    return NextResponse.json(collections);
  } catch (error) {
    // Log the error and the Strapi URL (without token) for debugging
    console.error('Error fetching collections from Strapi:', error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    } else {
      console.error('Strapi URL not set');
    }

    return NextResponse.json({ 
      error: 'Failed to fetch collections', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}