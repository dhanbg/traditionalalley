import { NextResponse } from 'next/server';
import { API_URL } from '@/utils/urls';
import { fetchDataFromApi } from '@/utils/api';

export const revalidate = 60;

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

    // Fetch products from Strapi using the resilient, cached API fetcher
    const products = await fetchDataFromApi(`/api/products?${searchParams.toString()}`);

    if (!products || !products.data) {
      return NextResponse.json({ data: [], meta: { error: products?.meta?.error || 'Failed to fetch products' } });
    }

    // Rewrite /uploads/ relative image URLs to absolute Strapi URLs
    const rewritten = rewriteImageUrls(products);

    return NextResponse.json(rewritten, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching products from Strapi:', error.message);
    return NextResponse.json({ data: [], meta: { error: error.message } });
  }
}