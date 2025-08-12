import { NextResponse } from 'next/server';

export async function GET(request) {
  let strapiUrl;
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || 'category';
    const category = searchParams.get('category'); // Optional category filter
    const pageSize = searchParams.get('pageSize') || '100';

    // Build filters
    let filters = '';
    if (category) {
      filters = `&filters[category][title][$eq]=${encodeURIComponent(category)}`;
    }

    // Construct the URL for the Strapi API with proper population and publication state
    strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/collections?publicationState=live&pagination[pageSize]=${pageSize}&populate=*${filters}`;

    // Fetch collections from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
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