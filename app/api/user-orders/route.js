import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN;

export async function POST(request) {
  let strapiUrl;
  try {
    const body = await request.json();

    // Ensure payload matches Strapi format { data: { ... } }
    const payload = body?.data ? body : { data: body };

    strapiUrl = `${STRAPI_URL}/api/user-orders`;

    const response = await fetch(strapiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Strapi user-orders POST error:', response.status, text);
      return NextResponse.json({
        error: 'Failed to create order',
        details: text,
        status: response.status,
      }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating user order via proxy:', error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    }
    return NextResponse.json({
      error: 'Failed to create order',
      details: error.message,
      strapiUrl: strapiUrl || null,
    }, { status: 500 });
  }
}