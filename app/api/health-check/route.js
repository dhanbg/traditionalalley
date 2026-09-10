import { NextResponse } from 'next/server';
import { getStrapiInternalUrl, getStrapiToken } from '@/utils/urls';

export async function GET() {
  const token = getStrapiToken();

  try {
    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'STRAPI_API_TOKEN is not configured in server environment variables',
        envPresence: {
          STRAPI_API_TOKEN: Boolean(process.env.STRAPI_API_TOKEN),
          strapi_api_token: Boolean(process.env.strapi_api_token),
          STRAPI_TOKEN: Boolean(process.env.STRAPI_TOKEN),
          strapi_token: Boolean(process.env.strapi_token),
          NEXT_PUBLIC_STRAPI_API_TOKEN: Boolean(process.env.NEXT_PUBLIC_STRAPI_API_TOKEN),
        },
        hint: 'Please add STRAPI_API_TOKEN to Vercel Project Settings -> Environment Variables and redeploy.'
      }, { status: 500 });
    }

    // Ping Strapi backend
    const testUrl = `${getStrapiInternalUrl()}/api/shipping-rates?pagination[pageSize]=1`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Strapi',
        upstreamStatus: response.status,
      }, { status: response.status });
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      strapiConnected: true,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}