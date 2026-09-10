import { NextResponse } from 'next/server';
import { getStrapiInternalUrl } from '@/utils/urls';
import { rewriteImageUrlsInText } from '@/utils/imageUtils';

const STRAPI_TOKEN = STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;

export const revalidate = 300;

export async function GET() {
  try {
    const strapiUrl = getStrapiInternalUrl();
    if (!strapiUrl) {
      console.error('❌ STRAPI_URL is not set');
      return NextResponse.json({ error: 'Server configuration error: STRAPI_URL missing' }, { status: 500 });
    }

    if (!STRAPI_TOKEN) {
      console.error('❌ STRAPI_TOKEN is not set');
      return NextResponse.json({ error: 'Server configuration error: STRAPI_TOKEN missing' }, { status: 500 });
    }

    const apiUrl = `${strapiUrl}/api/instagrams?populate=*`;

    // Fetch Instagram posts from Strapi with 5s timeout
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Strapi API error:', response.status);
      return NextResponse.json({ 
        error: 'Failed to fetch Instagram posts from Strapi',
        status: response.status
      }, { status: response.status });
    }

    const rawText = await response.text();
    const rewritten = rewriteImageUrlsInText(rawText);

    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('❌ Instagram API error:', error?.message || error);
    return NextResponse.json({ 
      error: 'Internal server error',
    }, { status: 500 });
  }
}