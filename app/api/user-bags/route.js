import { NextResponse } from 'next/server';
import { getStrapiInternalUrl } from '@/utils/urls';

export async function GET(request) {
  let strapiUrl;
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    
    // Set default query parameters if not present
    if (!searchParams.has('populate')) {
      searchParams.set('populate', '*');
    }
    if (!searchParams.has('sort')) {
      searchParams.set('sort', 'updatedAt:desc');
    }
    if (!searchParams.has('pagination[pageSize]')) {
      searchParams.set('pagination[pageSize]', '1000');
    }

    const base = getStrapiInternalUrl();
    strapiUrl = `${base}/api/user-bags?${searchParams.toString()}`;

    // Fetch user bags from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Strapi responded with status ${response.status}`);
    }

    const userBags = await response.json();

    return NextResponse.json(userBags);
  } catch (error) {
    // Log the error and the Strapi URL (without token) for debugging
    console.error('Error fetching user bags from Strapi:', error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    } else {
      console.error('Strapi URL not set');
    }

    return NextResponse.json({ 
      error: 'Failed to fetch user bags', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}

export async function POST(request) {
  let strapiUrl;
  try {
    const body = await request.json();
    const base = getStrapiInternalUrl();
    strapiUrl = `${base}/api/user-bags`;

    const response = await fetch(strapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Strapi POST user-bags error (${response.status}):`, errorText);
      throw new Error(`Strapi responded with status ${response.status}: ${errorText}`);
    }

    const newUserBag = await response.json();
    return NextResponse.json(newUserBag);
  } catch (error) {
    console.error('Error creating user bag in Strapi:', error.message);
    return NextResponse.json({ 
      error: 'Failed to create user bag', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}

