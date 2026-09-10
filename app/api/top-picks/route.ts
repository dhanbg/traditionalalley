import { NextRequest, NextResponse } from 'next/server';
import { INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';
import { rewriteImageUrlsInText } from '@/utils/imageUtils';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    searchParams.delete('_t');
    
    // Ensure default population if not passed, but preserve all incoming params
    const hasPopulate = Array.from(searchParams.keys()).some(key => key.startsWith('populate'));
    if (!hasPopulate) {
      // Use the optimized Strapi 5 population for Top Picks
      searchParams.set('populate[products][populate]', '*');
      searchParams.set('populate[product_variants][populate]', '*');
    }
    
    const strapiUrl = `${INTERNAL_API_URL}/api/top-picks?${searchParams.toString()}`;
    
    const strapiResponse = await fetch(strapiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });

    if (!strapiResponse.ok) {
        const errorText = await strapiResponse.text();
        console.error(`Strapi API returned ${strapiResponse.status} for Top Picks:`, errorText);
        
        return NextResponse.json({
            data: [],
            meta: { error: `Strapi returned ${strapiResponse.status}`, detail: errorText }
        });
    }

    // Zero-overhead string replacement on raw JSON text
    const rawText = await strapiResponse.text();
    const rewritten = rewriteImageUrlsInText(rawText);

    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error in top-picks API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}