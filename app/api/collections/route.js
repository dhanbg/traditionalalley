import { NextResponse } from 'next/server';
import { INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';
import { rewriteImageUrlsInText } from '@/utils/imageUtils';

export const revalidate = 120;

export async function GET(request) {
  try {
    // Parse the URL
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    searchParams.delete('_t');
    
    // Ensure defaults if not passed
    const hasPopulate = Array.from(searchParams.keys()).some(key => key.startsWith('populate'));
    if (!hasPopulate) {
        searchParams.set('populate', '*');
    }
    if (!searchParams.has('pagination[pageSize]') && !searchParams.has('pagination[limit]')) searchParams.set('pagination[pageSize]', '100');
    searchParams.set('publicationState', 'live');

    const token = STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;
    if (!token) {
      console.error('❌ [collections] STRAPI_API_TOKEN is missing in server environment variables.');
      return NextResponse.json(
        { data: [], meta: { error: 'Server authentication configuration missing (STRAPI_API_TOKEN)' } },
        { status: 500 }
      );
    }

    const strapiUrl = `${INTERNAL_API_URL}/api/collections?${searchParams.toString()}`;

    // Fetch collections directly with 5s timeout and 120s ISR caching
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ data: [], meta: { error: `Strapi returned ${response.status}`, detail: errorText } });
    }

    // Zero-overhead string replacement on raw JSON text
    const rawText = await response.text();
    const rewritten = rewriteImageUrlsInText(rawText);

    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching collections from Strapi:', error.message);
    return NextResponse.json({ data: [], meta: { error: error.message } });
  }
}
