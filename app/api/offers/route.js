import { NextResponse } from 'next/server';

export async function GET(request) {
  let strapiUrl;
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';
    const pageSize = searchParams.get('pageSize') || '100';

    // Construct the URL for the Strapi API with proper population and publication state
    strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/offers?publicationState=live&pagination[pageSize]=${pageSize}&populate=${populate}`;

    console.log('🎯 Fetching offers from Strapi:', strapiUrl);

    // Fetch offers from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Strapi responded with status ${response.status}`);
    }

    const offers = await response.json();
    console.log('🎯 Offers data from Strapi:', offers);

    return NextResponse.json(offers);
  } catch (error) {
    // Log the error and the Strapi URL (without token) for debugging
    console.error('Error fetching offers from Strapi:', error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    } else {
      console.error('Strapi URL not set');
    }

    return NextResponse.json({ 
      error: 'Failed to fetch offers', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}