import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN;

export async function GET(request) {
  let strapiUrl;
  try {
    const { searchParams } = new URL(request.url);

    // Forward all search params to Strapi, including filters and populate
    const query = searchParams.toString();
    strapiUrl = `${STRAPI_URL}/api/user-data${query ? `?${query}` : ''}`;

    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Strapi responded with status ${response.status}: ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user-data from Strapi:', error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    }
    return NextResponse.json({
      error: 'Failed to fetch user-data',
      details: error.message,
      strapiUrl: strapiUrl || null,
    }, { status: 500 });
  }
}