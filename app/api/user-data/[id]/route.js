import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const STRAPI_URL = process.env['STRAPI_INTERNAL_URL'] || process.env['STRAPI_URL'] || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN;

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const apiUrl = `${STRAPI_URL}/api/user-data/${id}${queryString ? `?${queryString}` : ''}`;

    console.log(`🔗 [PROXY] Fetching user-data ${id} from:`, apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [PROXY] Strapi user-data GET ${id} error:`, response.status, errorText);
      return NextResponse.json({
        error: 'Failed to fetch user-data',
        details: errorText,
        status: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`❌ [PROXY] Internal error fetching user-data ${id}:`, error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const apiUrl = `${STRAPI_URL}/api/user-data/${id}`;

    console.log(`🔗 [PROXY] Updating user-data ${id} in Strapi`);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [PROXY] Strapi user-data PUT ${id} error:`, response.status, errorText);
      return NextResponse.json({
        error: 'Failed to update user-data',
        details: errorText,
        status: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`❌ [PROXY] Internal error updating user-data ${id}:`, error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const apiUrl = `${STRAPI_URL}/api/user-data/${id}`;

    console.log(`🔗 [PROXY] Deleting user-data ${id} in Strapi`);

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [PROXY] Strapi user-data DELETE ${id} error:`, response.status, errorText);
      return NextResponse.json({
        error: 'Failed to delete user-data',
        details: errorText,
        status: response.status
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`❌ [PROXY] Internal error deleting user-data ${id}:`, error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
