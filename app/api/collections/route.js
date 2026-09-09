import { NextResponse } from 'next/server';
import { API_URL } from '@/utils/urls';
import { fetchDataFromApi } from '@/utils/api';

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

    // Fetch collections from Strapi using the resilient, cached API fetcher
    const collections = await fetchDataFromApi(`/api/collections?${searchParams.toString()}`);

    if (!collections || !collections.data) {
      return NextResponse.json({ data: [], meta: { error: collections?.meta?.error || 'Failed to fetch collections' } });
    }

    return NextResponse.json(rewriteImageUrls(collections), {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching collections from Strapi:', error.message);
    return NextResponse.json({ data: [], meta: { error: error.message } });
  }
}
