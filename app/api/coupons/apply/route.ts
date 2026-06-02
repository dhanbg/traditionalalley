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
    const { couponId } = body;

    if (!couponId) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    // Call Strapi API to apply coupon with userId
    const response = await fetch(`${STRAPI_URL}/api/coupons/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({ couponId, userId: session.user.id }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to apply coupon' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error applying coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}