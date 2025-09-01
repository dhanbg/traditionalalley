import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug environment variables
    console.log('🔧 Instagram API Environment check:');
    console.log('  - STRAPI_URL:', STRAPI_URL);
    console.log('  - STRAPI_TOKEN exists:', !!STRAPI_TOKEN);
    console.log('  - NODE_ENV:', process.env.NODE_ENV);

    if (!STRAPI_URL) {
      console.error('❌ STRAPI_URL is not set');
      return res.status(500).json({ error: 'Server configuration error: STRAPI_URL missing' });
    }

    if (!STRAPI_TOKEN) {
      console.error('❌ STRAPI_TOKEN is not set');
      return res.status(500).json({ error: 'Server configuration error: STRAPI_TOKEN missing' });
    }

    const apiUrl = `${STRAPI_URL}/api/instagrams?populate=*`;
    console.log('🔗 Fetching Instagram posts from:', apiUrl);

    // Fetch Instagram posts from Strapi
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Strapi response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Strapi API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch Instagram posts from Strapi',
        details: errorText,
        status: response.status
      });
    }

    const data = await response.json();
    console.log('✅ Successfully fetched', data.data?.length || 0, 'Instagram posts');

    // Helper function to add iOS-compatible codec transformation to Cloudinary URLs
    const addH264Transform = (url) => {
      if (!url || !url.includes('cloudinary.com')) return url;
      
      // Add H.264 codec transformation for iOS compatibility
      // vc_h264 forces H.264 codec, q_auto optimizes quality
      const transformParams = 'vc_h264,q_auto';
      
      // Insert transformation parameters after '/upload/'
      return url.replace('/upload/', `/upload/${transformParams}/`);
    };

    // Process the data to ensure proper image URLs and iOS-compatible video codecs
    if (data.data) {
      data.data = data.data.map(post => {
        if (post.media?.url && !post.media.url.startsWith('http')) {
          post.media.url = `${STRAPI_URL}${post.media.url}`;
        }
        
        // Transform Cloudinary video URLs to use H.264 codec for iOS compatibility
        if (post.media?.url && post.media.url.includes('cloudinary.com') && post.media.mime === 'video/mp4') {
          post.media.url = addH264Transform(post.media.url);
          console.log('🔄 Transformed video URL for iOS compatibility:', post.media.url);
        }
        
        // Handle thumbnail formats
        if (post.media?.formats?.thumbnail?.url && !post.media.formats.thumbnail.url.startsWith('http')) {
          post.media.formats.thumbnail.url = `${STRAPI_URL}${post.media.formats.thumbnail.url}`;
        }
        
        // Handle small formats
        if (post.media?.formats?.small?.url && !post.media.formats.small.url.startsWith('http')) {
          post.media.formats.small.url = `${STRAPI_URL}${post.media.formats.small.url}`;
        }
        
        // Handle medium formats
        if (post.media?.formats?.medium?.url && !post.media.formats.medium.url.startsWith('http')) {
          post.media.formats.medium.url = `${STRAPI_URL}${post.media.formats.medium.url}`;
        }
        
        return post;
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Instagram API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}