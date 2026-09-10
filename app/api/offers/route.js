import { NextResponse } from 'next/server';

const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

export const dynamic = 'force-dynamic';
export async function GET(request) {
  let strapiUrl;
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';
    const pageSize = searchParams.get('pageSize') || '100';

    // Construct the URL for the Strapi API with proper population and publication state using internal network
    const apiUrl = process.env.STRAPI_INTERNAL_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://strapi-alley-production:1337';
    strapiUrl = `${apiUrl}/api/offers?publicationState=live&pagination[pageSize]=${pageSize}&populate=${populate}`;

    console.log('🎯 Fetching offers from Strapi:', strapiUrl);

    const headers = {};
    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }

    // Fetch offers from Strapi
    const response = await fetch(strapiUrl, {
      headers,
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Strapi responded with status ${response.status}`);
    }

    const offers = await response.json();

    return NextResponse.json(offers, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
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