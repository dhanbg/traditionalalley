import { NextResponse } from 'next/server';

export async function GET(request) {
  let strapiUrl;
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';

    // Construct the URL for the Strapi API
    strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/user-bags?pagination[pageSize]=100&populate=${populate}`;

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
    console.log('User bags data from Strapi:', userBags); // Log the data

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
