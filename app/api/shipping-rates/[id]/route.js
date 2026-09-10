import { NextResponse } from 'next/server';
import { getStrapiInternalUrl, STRAPI_API_TOKEN } from '@/utils/urls';

const API_TOKEN = STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing shipping rate id' }, { status: 400 });
    }

    if (!API_TOKEN) {
      return NextResponse.json(
        { error: 'API token not configured', message: 'STRAPI_API_TOKEN environment variable is missing' },
        { status: 500 }
      );
    }

    const deleteUrl = `${getStrapiInternalUrl()}/api/shipping-rates/${id}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Failed to delete shipping rate', details: errorText }, { status: response.status });
    }

    const data = await response.json().catch(() => ({ success: true }));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Shipping rate DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
