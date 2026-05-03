import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Ensure default population if not passed
    const hasPopulate = Array.from(searchParams.keys()).some(key => key.startsWith('populate'));
    if (!hasPopulate) {
        searchParams.set('populate', '*');
    }
    
    const strapiUrl = `${INTERNAL_API_URL}/api/product-variants?${searchParams.toString()}`;
    
    console.log('Fetching Product Variants from:', strapiUrl);
    
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
        console.error(`Strapi API returned ${strapiResponse.status} for Product Variants:`, errorText);
        return NextResponse.json({
            data: [],
            meta: { error: `Strapi returned ${strapiResponse.status}`, detail: errorText }
        });
    }

    const data = await strapiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in product-variants API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
