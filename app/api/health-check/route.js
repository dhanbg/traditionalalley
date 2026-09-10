import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.traditionalalley.com.np';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

export async function GET() {
  const isProd = process.env.NODE_ENV === 'production';
  const allowDebug = !isProd || process.env.ENABLE_PRODUCTION_DEBUG === 'true';

  try {
    if (!API_TOKEN) {
      if (!allowDebug) {
        return NextResponse.json({ status: 'error', message: 'Service unavailable' }, { status: 503 });
      }
      return NextResponse.json({
        status: 'error',
        message: 'STRAPI_API_TOKEN is not configured',
      }, { status: 500 });
    }

    // Ping Strapi backend
    const testUrl = `${API_BASE_URL}/api/shipping-rates?pagination[pageSize]=1`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) {
      if (!allowDebug) {
        return NextResponse.json({ status: 'error', message: 'Upstream unavailable' }, { status: 502 });
      }
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Strapi',
        upstreamStatus: response.status,
      }, { status: response.status });
    }

    // Production safe response - zero information disclosure
    if (!allowDebug) {
      return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    }

    // Development / explicitly enabled debug response
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      strapiConnected: true,
    });
  } catch (error) {
    if (!allowDebug) {
      return NextResponse.json({ status: 'error', message: 'Health check failed' }, { status: 500 });
    }

    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}