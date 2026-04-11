import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  let strapiUrl;
  try {
    const { id } = params;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';

    // Construct the URL for the Strapi API to get a specific collection by ID
    strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/collections/${id}?publicationState=live&populate=${populate}`;

    // Fetch the specific collection from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Collection not found' 
        }, { status: 404 });
      }
      throw new Error(`Strapi responded with status ${response.status}`);
    }

    const collection = await response.json();
    console.log('Collection data from Strapi:', collection);

    return NextResponse.json(collection);
  } catch (error) {
    // Log the error and the Strapi URL (without token) for debugging
    console.error('Error fetching collection from Strapi:', error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    } else {
      console.error('Strapi URL not set');
    }

    return NextResponse.json({ 
      error: 'Failed to fetch collection', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}