import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.traditionalalley.com.np';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a';

export async function GET() {
  try {
    console.log('Health check - Environment variables:');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('API_TOKEN exists:', !!API_TOKEN);
    console.log('API_TOKEN length:', API_TOKEN ? API_TOKEN.length : 0);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!API_TOKEN) {
      return NextResponse.json({
        status: 'error',
        message: 'NEXT_PUBLIC_STRAPI_API_TOKEN is not configured',
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          API_BASE_URL,
          hasToken: false
        }
      }, { status: 500 });
    }
    
    // Test connection to Strapi with production URL
    const testUrl = `${API_BASE_URL}/api/shipping-rates?pagination[pageSize]=200`;
    console.log('Testing Strapi connection to:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Strapi response status:', response.status);
    console.log('Strapi response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Strapi error response:', errorText);
      
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Strapi',
        details: {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: testUrl
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          API_BASE_URL,
          hasToken: true,
          tokenLength: API_TOKEN.length
        }
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('Strapi connection successful, data length:', data.data?.length || 0);
    
    return NextResponse.json({
      status: 'success',
      message: 'Strapi connection successful',
      data: {
        recordCount: data.data?.length || 0,
        meta: data.meta
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        API_BASE_URL,
        hasToken: true,
        tokenLength: API_TOKEN.length
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        API_BASE_URL,
        hasToken: !!API_TOKEN,
        tokenLength: API_TOKEN ? API_TOKEN.length : 0
      }
    }, { status: 500 });
  }
}