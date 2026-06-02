import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Call Strapi API to validate coupon with userId
    const response = await fetch(`${STRAPI_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({ code, orderAmount, userId: session.user.id }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Invalid coupon code' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}