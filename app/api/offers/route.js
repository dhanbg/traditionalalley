import { NextResponse } from 'next/server';
import { getStrapiInternalUrl } from '@/utils/urls';

const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

// Enable ISR caching at route level (60 seconds)
export const revalidate = 60;

export async function GET(request) {
  let strapiUrl;
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';
    const pageSize = searchParams.get('pageSize') || '100';

    // Construct the URL for the Strapi API with proper population and publication state
    const apiUrl = getStrapiInternalUrl();
    strapiUrl = `${apiUrl}/api/offers?publicationState=live&pagination[pageSize]=${pageSize}&populate=${populate}`;

    console.log('🎯 Fetching offers from Strapi:', strapiUrl);

    const headers = {};
    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }

    // Fetch offers from Strapi with 5s timeout
    const response = await fetch(strapiUrl, {
      headers,
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
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
    console.error('Error fetching offers from Strapi:', error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch offers', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}