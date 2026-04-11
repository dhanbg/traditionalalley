import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

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

    // First validate the coupon
    const validateResponse = await fetch(`${STRAPI_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, orderAmount, userId: session.user.id }),
    });

    const validateData = await validateResponse.json();

    if (!validateResponse.ok || !validateData.valid) {
      return NextResponse.json(
        { error: validateData.error?.message || 'Invalid coupon code' },
        { status: validateResponse.status }
      );
    }

    // If validation successful, apply the coupon directly
    const applyResponse = await fetch(`${STRAPI_URL}/api/coupons/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ couponId: validateData.coupon.id, userId: session.user.id }),
    });

    const applyData = await applyResponse.json();

    if (!applyResponse.ok) {
      return NextResponse.json(
        { error: applyData.error?.message || 'Failed to apply coupon' },
        { status: applyResponse.status }
      );
    }

    // Return success with both validation and application data
    return NextResponse.json({
      success: true,
      coupon: validateData.coupon,
      application: applyData,
      message: 'Coupon validated and applied successfully'
    });
  } catch (error) {
    console.error('Error applying coupon directly:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}