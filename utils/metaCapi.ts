import crypto from 'crypto';

/**
 * Helper to SHA-256 hash values as required by Meta Conversions API.
 * Values must be lowercase, trimmed, with no punctuation/symbols.
 */
function hashValue(value: string | undefined | null): string | null {
    if (!value) return null;
    const cleanValue = value.trim().toLowerCase();
    return crypto.createHash('sha256').update(cleanValue).digest('hex');
}

/**
 * Helper to hash phone numbers. Meta expects only digits, including country code.
 */
function hashPhone(phone: string | undefined | null): string | null {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, ''); // Keep only digits
    if (!cleanPhone) return null;
    return crypto.createHash('sha256').update(cleanPhone).digest('hex');
}

/**
 * Helper to split full name into first and last name and hash them.
 */
function hashName(fullName: string | undefined | null): { fn: string | null; ln: string | null } {
    if (!fullName) return { fn: null, ln: null };
    const parts = fullName.trim().split(/\s+/);
    const fn = parts[0] ? hashValue(parts[0]) : null;
    const ln = parts.slice(1).join(' ') ? hashValue(parts.slice(1).join(' ')) : null;
    return { fn, ln };
}

interface MetaCapiEventOptions {
    eventName: 'Purchase' | 'InitiateCheckout' | 'AddToCart' | 'PageView';
    eventId?: string;
    clientIp?: string;
    clientUserAgent?: string;
    userData: {
        email?: string;
        phone?: string;
        fullName?: string;
        city?: string;
        zip?: string;
        countryCode?: string;
    };
    customData: {
        currency: string;
        value: number;
        contentIds: string[];
        contents: Array<{
            id: string;
            quantity: number;
            item_price: number;
        }>;
    };
}

/**
 * Sends a server-side event to Meta Conversions API (CAPI)
 */
export async function sendMetaCapiEvent(options: MetaCapiEventOptions) {
    const pixelId = process.env.META_PIXEL_ID || '1591009012395571';
    const accessToken = process.env.META_ACCESS_TOKEN;
    const testEventCode = process.env.META_TEST_EVENT_CODE;

    if (!accessToken) {
        console.warn('⚠️ [META-CAPI] Access token not configured. Skipping event transmission.');
        return { success: false, error: 'Access token not configured' };
    }

    try {
        const { fn, ln } = hashName(options.userData.fullName);
        const hashedEmail = hashValue(options.userData.email);
        const hashedPhone = hashPhone(options.userData.phone);
        const hashedCity = hashValue(options.userData.city);
        const hashedZip = hashValue(options.userData.zip);
        const hashedCountry = hashValue(options.userData.countryCode);

        // Build user data object. Fields that are null are omitted.
        const userDataPayload: Record<string, any> = {
            client_ip_address: options.clientIp || undefined,
            client_user_agent: options.clientUserAgent || undefined,
            em: hashedEmail ? [hashedEmail] : undefined,
            ph: hashedPhone ? [hashedPhone] : undefined,
            fn: fn ? [fn] : undefined,
            ln: ln ? [ln] : undefined,
            ct: hashedCity ? [hashedCity] : undefined,
            zp: hashedZip ? [hashedZip] : undefined,
            country: hashedCountry ? [hashedCountry] : undefined,
        };

        // Remove undefined keys
        Object.keys(userDataPayload).forEach(
            key => userDataPayload[key] === undefined && delete userDataPayload[key]
        );

        const eventPayload = {
            event_name: options.eventName,
            event_time: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
            event_source: 'web',
            event_id: options.eventId || `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            action_source: 'website',
            user_data: userDataPayload,
            custom_data: {
                currency: options.customData.currency.toUpperCase(),
                value: options.customData.value,
                content_type: 'product',
                contents: options.customData.contents.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    item_price: item.item_price
                })),
            }
        };

        const requestBody: Record<string, any> = {
            data: [eventPayload]
        };

        // Add test event code if provided for real-time testing in Events Manager
        if (testEventCode) {
            requestBody.test_event_code = testEventCode;
            console.log(`🧪 [META-CAPI] Using test_event_code: ${testEventCode}`);
        }

        console.log(`🚀 [META-CAPI] Dispatching server event: ${options.eventName}`, {
            eventId: eventPayload.event_id,
            hasEmail: !!userDataPayload.em,
            hasPhone: !!userDataPayload.ph,
            value: options.customData.value,
            currency: options.customData.currency
        });

        const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (response.ok) {
            console.log(`✅ [META-CAPI] Event "${options.eventName}" successfully sent. Result:`, result);
            return { success: true, result };
        } else {
            console.error(`❌ [META-CAPI] Meta Graph API returned error:`, result);
            return { success: false, error: result };
        }

    } catch (error: any) {
        console.error(`❌ [META-CAPI] Error sending CAPI event:`, error);
        return { success: false, error: error.message };
    }
}
