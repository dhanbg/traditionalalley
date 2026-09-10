import { NextResponse } from 'next/server';
import { INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';
import { rewriteImageUrlsInText } from '@/utils/imageUtils';

export const revalidate = 120;

export async function GET(request) {
  let strapiUrl;
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
      console.error('❌ [categories] STRAPI_API_TOKEN is missing in server environment variables.');
      return NextResponse.json(
        { data: [], meta: { error: 'Server authentication configuration missing (STRAPI_API_TOKEN)' } },
        { status: 500 }
      );
    }

    // Construct the URL for the Strapi API using the internal docker network to bypass Cloudflare
    strapiUrl = `${INTERNAL_API_URL}/api/categories?${searchParams.toString()}`;

    // Fetch categories from Strapi with 5s timeout
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Strapi responded with status ${response.status} for categories:`, errorText);
      return NextResponse.json({ data: [], meta: { error: `Strapi returned ${response.status}`, detail: errorText } });
    }

    // Zero-overhead string replacement on raw JSON text: avoids JSON.parse + recursion + JSON.stringify
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
    console.error('Error fetching categories from Strapi:', error.message);
    return NextResponse.json({ data: [], meta: { error: error.message } });
  }
}