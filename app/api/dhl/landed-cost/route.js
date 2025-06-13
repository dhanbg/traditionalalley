import { NextResponse } from 'next/server';
import DHLExpressService from '@/lib/dhl-service';

export async function POST(request) {
  try {
    const dhlService = new DHLExpressService();
    const landedCostData = await request.json();

    const landedCost = await dhlService.getLandedCost(landedCostData);
    
    return NextResponse.json({
      success: true,
      data: landedCost
    });

  } catch (error) {
    console.error('DHL Landed Cost API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to calculate landed cost' 
      },
      { status: 500 }
    );
  }
} 