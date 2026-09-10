import { NextRequest, NextResponse } from 'next/server';
import { INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';
import { rewriteImageUrlsInText } from '@/utils/imageUtils';

export const revalidate = 120;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    searchParams.delete('_t');
    
    // Ensure default population if not passed
    const hasPopulate = Array.from(searchParams.keys()).some(key => key.startsWith('populate'));
    if (!hasPopulate) {
        searchParams.set('populate', '*');
    }

    const strapiUrl = `${INTERNAL_API_URL}/api/product-variants?${searchParams.toString()}`;

    // Fetch product variants directly with 5s timeout and 120s ISR caching
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        data: [],
        meta: { error: `Strapi returned ${response.status}`, detail: errorText }
      });
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
  } catch (error: any) {
    console.error('Error in product-variants API route:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
