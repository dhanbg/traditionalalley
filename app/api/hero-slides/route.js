import { NextResponse } from 'next/server';
import { getStrapiInternalUrl, STRAPI_API_TOKEN } from '@/utils/urls';

const STRAPI_URL = getStrapiInternalUrl();

export const revalidate = 60;

export async function GET(request) {
  try {
    const token = STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;
    if (!token) {
      console.error('❌ [hero-slides] STRAPI_API_TOKEN is missing in server environment variables.');
      return NextResponse.json(
        { error: 'Server authentication configuration missing (STRAPI_API_TOKEN)' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    searchParams.delete('_t');
    const populate = searchParams.get('populate') || '*';

    // Build query string by passing through all query params, expanding populate[media] alias
    const params = new URLSearchParams();

    // If the caller requested the media alias, expand to include media, mobileMedia, and poster
    if (searchParams.has('populate[media]')) {
      params.append('populate[media]', '*');
      params.append('populate[mobileMedia]', '*');
      params.append('populate[poster]', '*');
    } else {
      // Default populate
      params.append('populate', populate);
    }

    // Preserve any provided filters, sort, pagination, publicationState, etc.
    for (const [key, value] of searchParams.entries()) {
      if (key === 'populate' || key === 'populate[media]') continue; // already handled
      params.append(key, value);
    }

    const url = `${STRAPI_URL}/api/hero-slides?${params.toString()}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      console.error('Strapi response not ok:', response.status, response.statusText);
      throw new Error(`Strapi API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero slides', details: error.message },
      { status: 500 }
    );
  }
}