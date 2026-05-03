import { NextResponse } from 'next/server';
import { INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';

export const dynamic = 'force-dynamic';
export async function GET(request) {
  let strapiUrl;
  try {
    // Parse the URL
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Ensure defaults if not passed
    const hasPopulate = Array.from(searchParams.keys()).some(key => key.startsWith('populate'));
    if (!hasPopulate) {
        searchParams.set('populate', '*');
    }
    if (!searchParams.has('pagination[pageSize]')) searchParams.set('pagination[pageSize]', '100');
    searchParams.set('publicationState', 'live');

    // Construct the URL for the Strapi API using the internal docker network to bypass Cloudflare
    strapiUrl = `${INTERNAL_API_URL}/api/collections?${searchParams.toString()}`;

    // Fetch collections from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
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