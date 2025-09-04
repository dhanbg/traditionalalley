import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

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
    
    // Test Strapi connection
    const testUrl = `${API_BASE_URL}/api/shipping-rates?pagination[pageSize]=1`;
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