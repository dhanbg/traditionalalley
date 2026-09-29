import { NextRequest, NextResponse } from 'next/server';
import { sendMetaCapiEvent } from '@/utils/metaCapi';

/**
 * Server-side endpoint to trigger Meta Conversions API (CAPI) Purchase events.
 * Used for Cash on Delivery (COD) orders and direct purchase verifications.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventId, userData, customData } = body;

        const userAgent = request.headers.get('user-agent') || '';
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '';

        const fbp = request.cookies.get('_fbp')?.value || userData?.fbp;
        const fbc = request.cookies.get('_fbc')?.value || userData?.fbc;

        console.log('📦 [META-CAPI-PURCHASE] Received COD purchase event:', {
            eventId,
            amount: customData?.value,
            currency: customData?.currency || 'NPR',
            itemCount: customData?.contents?.length || 0,
            hasFbp: !!fbp,
            hasFbc: !!fbc
        });

        const result = await sendMetaCapiEvent({
            eventName: 'Purchase',
            eventId: eventId || `cod-${Date.now()}`,
            clientIp,
            clientUserAgent: userAgent,
            userData: {
                ...(userData || {}),
                fbp,
                fbc
            },
            customData: customData || {
                currency: 'NPR',
                value: 0,
                contentIds: [],
                contents: []
            }
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('❌ [META-CAPI-PURCHASE] Error sending CAPI purchase event:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
