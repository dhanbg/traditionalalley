import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/utils/urls';
import { fetchDataFromApi } from '@/utils/api';

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
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    searchParams.delete('_t');
    
    // Ensure default population if not passed
    const hasPopulate = Array.from(searchParams.keys()).some(key => key.startsWith('populate'));
    if (!hasPopulate) {
        searchParams.set('populate', '*');
    }

    const data = await fetchDataFromApi(`/api/product-variants?${searchParams.toString()}`);

    if (!data || !data.data) {
      return NextResponse.json({
        data: [],
        meta: { error: data?.meta?.error || 'Failed to fetch product variants' }
      });
    }

    return NextResponse.json(rewriteImageUrls(data), {
      headers: {
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
