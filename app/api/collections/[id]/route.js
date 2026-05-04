import { NextResponse } from 'next/server';
import { API_URL, INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';

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

export async function GET(request, { params }) {
  let strapiUrl;
  try {
    const { id } = params;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';

    // Construct the URL for the Strapi API to get a specific collection by ID
    strapiUrl = `${INTERNAL_API_URL}/api/collections/${id}?publicationState=live&populate=${populate}`;

    // Fetch the specific collection from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
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

    return NextResponse.json(rewriteImageUrls(collection));
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
