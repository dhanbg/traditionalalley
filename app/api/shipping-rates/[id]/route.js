import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'https://admin.traditionalalley.com.np';
const API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;

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

    const deleteUrl = `${API_BASE_URL}/api/shipping-rates/${id}`;
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
