import { NextResponse } from 'next/server';
import { INTERNAL_API_URL, STRAPI_API_TOKEN } from '@/utils/urls';
import { rewriteImageUrlsInText } from '@/utils/imageUtils';

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

    const token = STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN;

    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Collection not found' 
        }, { status: 404 });
      }
      throw new Error(`Strapi responded with status ${response.status}`);
    }

    // Zero-overhead string replacement on raw JSON text
    const rawText = await response.text();
    const rewritten = rewriteImageUrlsInText(rawText);

    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
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
