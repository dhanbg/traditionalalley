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
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';

    // Construct the URL for the Strapi API to get a specific collection by ID
    strapiUrl = `${INTERNAL_API_URL}/api/collections/${id}?publicationState=live&populate=${populate}`;

    const token = STRAPI_API_TOKEN || "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";

    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
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
