import { NextResponse } from 'next/server';
import { INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';

export const dynamic = 'force-dynamic';

// The public-facing Strapi domain for media assets
const STRAPI_PUBLIC_URL = 'https://admin.traditionalalley.com.np';

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
      result[key] = `${STRAPI_PUBLIC_URL}${value}`;
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
    const searchParams = url.searchParams;
    
    // Ensure defaults if not passed
    const hasPopulate = Array.from(searchParams.keys()).some(key => key.startsWith('populate'));
    if (!hasPopulate) {
        searchParams.set('populate', '*');
    }
    if (!searchParams.has('pagination[pageSize]')) searchParams.set('pagination[pageSize]', '100');
    searchParams.set('publicationState', 'live');

    // Construct the URL for the Strapi API using the internal docker network to bypass Cloudflare
    strapiUrl = `${INTERNAL_API_URL}/api/products?${searchParams.toString()}`;

    // Fetch products from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Strapi responded with status ${response.status}`);
    }

    const products = await response.json();

    // Rewrite /uploads/ relative image URLs to absolute Strapi URLs
    const rewritten = rewriteImageUrls(products);

    return NextResponse.json(rewritten);
  } catch (error) {
    // Log the error and the Strapi URL (without token) for debugging
    console.error('Error fetching products from Strapi:', error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    } else {
      console.error('Strapi URL not set');
    }

    return NextResponse.json({ 
      error: 'Failed to fetch products', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}