import { NextResponse } from 'next/server';
import { API_URL, INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';

export const dynamic = 'force-dynamic';

function rewriteImageUrls(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(rewriteImageUrls);
  }

  const result = {};
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

    // Construct the URL for the Strapi API using the internal docker network to bypass Cloudflare
    strapiUrl = `${INTERNAL_API_URL}/api/collections?${searchParams.toString()}`;

    // Fetch collections from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Strapi responded with status ${response.status} for collections:`, errorText);
      return NextResponse.json({ data: [], meta: { error: `Strapi returned ${response.status}`, detail: errorText } });
    }

    const collections = await response.json();

    return NextResponse.json(rewriteImageUrls(collections));
  } catch (error) {
    console.error('Error fetching collections from Strapi:', error.message);
    return NextResponse.json({ data: [], meta: { error: error.message } });
  }
}
