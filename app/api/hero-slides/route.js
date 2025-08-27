import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';
    
    // Build the query string for Strapi
    let queryString = `populate=${populate}`;
    
    // Handle specific populate parameters
    if (searchParams.has('populate[media]')) {
      queryString = 'populate[media]=*&populate[mobileMedia]=*&populate[poster]=*';
    }
    
    const url = `${STRAPI_URL}/api/hero-slides?${queryString}`;
    
    console.log('🔍 Fetching from Strapi:', url);
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store', // Disable caching for debugging
    });
    
    if (!response.ok) {
      console.error('Strapi response not ok:', response.status, response.statusText);
      throw new Error(`Strapi API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('🔍 Strapi Response:', JSON.stringify(data, null, 2));
    
    // Log each slide to check for mobileMedia
    if (data.data) {
      data.data.forEach((slide, index) => {
        console.log(`🔍 Slide ${index}:`, {
          id: slide.id,
          heading: slide.heading,
          hasMedia: !!slide.media,
          hasMobileMedia: !!slide.mobileMedia,
          media: slide.media,
          mobileMedia: slide.mobileMedia
        });
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero slides', details: error.message },
      { status: 500 }
    );
  }
}