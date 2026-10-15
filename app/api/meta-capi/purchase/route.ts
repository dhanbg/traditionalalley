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

        const isAdminEmail = 
            userData?.email === 'gurungvaaiii@gmail.com' ||
            userData?.email === 'traditionalley2050@gmail.com';

        const rawValue = typeof customData?.value === 'number'
            ? customData.value
            : parseFloat(customData?.value) || 0;

        const isTestAmount = rawValue === 10;

        if (isAdminEmail || isTestAmount) {
            console.log('🛡️ [META-CAPI-PURCHASE] Skipping admin test order from Meta CAPI.');
            return NextResponse.json({ success: true, skipped: true, message: 'Skipped admin test transaction' });
        }

        if (rawValue <= 0) {
            console.warn('⚠️ [META-CAPI-PURCHASE] Skipping Purchase event with zero or invalid value.');
            return NextResponse.json({ success: false, error: 'Value must be greater than 0' }, { status: 400 });
        }

        const result = await sendMetaCapiEvent({
            eventName: 'Purchase',
            eventId: eventId || `purchase-${Date.now()}`,
            clientIp,
            clientUserAgent: userAgent,
            userData: {
                ...(userData || {}),
                fbp,
                fbc
            },
            customData: {
                currency: (customData?.currency || 'NPR').toUpperCase(),
                value: parseFloat(rawValue.toFixed(2)),
                contentIds: customData?.contentIds || (customData?.contents || []).map((c: any) => String(c.id)),
                contents: customData?.contents || []
            }
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('❌ [META-CAPI-PURCHASE] Error sending CAPI purchase event:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
