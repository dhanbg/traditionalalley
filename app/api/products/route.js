import { NextResponse } from 'next/server';
import { API_URL, INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';

export const dynamic = 'force-dynamic';

/**
 * Recursively rewrites all /uploads/ relative URLs in Strapi JSON to absolute URLs.
 * This ensures images load correctly regardless of the NEXT_PUBLIC_API_URL env var.
 */
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
    strapiUrl = `${INTERNAL_API_URL}/api/products?${searchParams.toString()}`;

    // Fetch products from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Strapi responded with status ${response.status} for products:`, errorText);
      return NextResponse.json({ data: [], meta: { error: `Strapi returned ${response.status}`, detail: errorText } });
    }

    const products = await response.json();

    // Rewrite /uploads/ relative image URLs to absolute Strapi URLs
    const rewritten = rewriteImageUrls(products);

    return NextResponse.json(rewritten);
  } catch (error) {
    console.error('Error fetching products from Strapi:', error.message);
    return NextResponse.json({ data: [], meta: { error: error.message } });
  }
}