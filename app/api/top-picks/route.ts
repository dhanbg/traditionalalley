import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { API_URL, INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';

function rewriteImageUrls(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(rewriteImageUrls);
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      result[key] = `${API_URL}${value}`;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = rewriteImageUrls(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Ensure default population if not passed, but preserve all incoming params
    const hasPopulate = Array.from(searchParams.keys()).some(key => key.startsWith('populate'));
    if (!hasPopulate) {
      // Use the optimized Strapi 5 population for Top Picks
      searchParams.set('populate[products][populate]', '*');
      searchParams.set('populate[product_variants][populate]', '*');
      searchParams.set('populate', '*');
    }
    
    const strapiUrl = `${INTERNAL_API_URL}/api/top-picks?${searchParams.toString()}`;
    
    console.log('Fetching Top Picks from:', strapiUrl);
    
    const strapiResponse = await fetch(strapiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      },
      cache: 'no-store', 
    });

    if (!strapiResponse.ok) {
        const errorText = await strapiResponse.text();
        console.error(`Strapi API returned ${strapiResponse.status} for Top Picks:`, errorText);
        
        // Return 200 with error info or mock data to avoid breaking the UI completely, 
        // but ensure we know it failed.
        return NextResponse.json({
            data: [],
            meta: { error: `Strapi returned ${strapiResponse.status}`, detail: errorText }
        });
    }

    const data = await strapiResponse.json();
    return NextResponse.json(rewriteImageUrls(data));
  } catch (error) {
    console.error('Error in top-picks API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}