import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchDataFromApi, updateUserBagWithPayment } from '@/utils/api';
import { processPostPaymentStockAndCart } from '@/utils/postPaymentProcessing';

/**
 * API endpoint to process successful NPS payments
 * Triggered after transaction status check confirms success
 * Handles stock updates, cart clearing, and email automation
 */
export async function POST(request: NextRequest) {
    try {
        console.log('🎯 [PROCESS-SUCCESS] API endpoint called');

        const session = await auth();
        const body = await request.json();
        const { merchantTxnId, paymentData } = body;

        console.log('📋 [PROCESS-SUCCESS] Request data:', {
            merchantTxnId,
            hasPaymentData: !!paymentData,
            hasSession: !!session,
            userEmail: session?.user?.email
        });

        if (!merchantTxnId) {
            return NextResponse.json(
                { success: false, error: 'Missing merchantTxnId' },
                { status: 400 }
            );
        }

        // --- FIND USER BAG ---
        let targetBagId: string | null = null;
        let bagData: any = null;

        // 1. Try logged-in user
        if (session?.user?.id) {
            console.log(`🔍 [PROCESS-SUCCESS] Finding bag for logged-in user: ${session.user.email}`);
            try {
                const userDataResponse = await fetchDataFromApi(
                    `/api/user-data?filters[authUserId][$eq]=${session.user.id}&populate=user_bag`
                );
                if (userDataResponse?.data?.[0]) {
                    targetBagId = userDataResponse.data[0].user_bag?.documentId;
                    console.log(`✅ [PROCESS-SUCCESS] Found bag ID: ${targetBagId}`);
                }
            } catch (e) {
                console.error('❌ [PROCESS-SUCCESS] Error finding user bag:', e);
            }
        }

        // 2. Try guest recovery from localStorage (passed in paymentData)
        if (!targetBagId && paymentData?.recoveredUserBagId) {
            targetBagId = paymentData.recoveredUserBagId;
            console.log(`✅ [PROCESS-SUCCESS] Using guest bag ID: ${targetBagId}`);
        }

        if (!targetBagId) {
            console.error('❌ [PROCESS-SUCCESS] Could not determine bag ID');
            return NextResponse.json(
                { success: false, error: 'Could not locate user bag' },
                { status: 404 }
            );
        }

        // Fetch bag data
        console.log(`🔄 [PROCESS-SUCCESS] Fetching bag data for: ${targetBagId}`);
        const bagResponse = await fetchDataFromApi(`/api/user-bags/${targetBagId}?populate=*`);

        if (!bagResponse?.data) {
            console.error('❌ [PROCESS-SUCCESS] Bag not found');
            return NextResponse.json(
                { success: false, error: 'User bag not found' },
                { status: 404 }
            );
        }

        bagData = bagResponse.data;
        const userDocumentId = bagData.user_datum?.documentId;

        // Check if this payment has already been processed
        const existingPayments = bagData.user_orders?.payments || [];
        const existingPayment = existingPayments.find(
            (p: any) => p.merchantTxnId === merchantTxnId && p.provider === 'nps'
        );

        if (existingPayment?.emailSent) {
            console.log('ℹ️ [PROCESS-SUCCESS] Email already sent for this payment');
            return NextResponse.json({
                success: true,
                alreadyProcessed: true,
                message: 'Payment already processed'
            });
        }

        // Fetch cart items
        console.log('🔍 [PROCESS-SUCCESS] Fetching cart items...');
        let cartApiUrl;
        if (userDocumentId) {
            cartApiUrl = `/api/carts?filters[user_datum][documentId][$eq]=${userDocumentId}&populate=*`;
        } else {
            cartApiUrl = `/api/carts?filters[user_bag][documentId][$eq]=${targetBagId}&populate=*`;
        }

        const cartResponse = await fetchDataFromApi(cartApiUrl);

        if (!cartResponse?.data || cartResponse.data.length === 0) {
            console.log('ℹ️ [PROCESS-SUCCESS] No cart items found (may already be cleared)');
            return NextResponse.json({
                success: true,
                alreadyProcessed: true,
                message: 'Cart already cleared, payment may have been processed'
            });
        }

        const currentCartItems = cartResponse.data;
        console.log(`📦 [PROCESS-SUCCESS] Found ${currentCartItems.length} cart items`);

        // Transform cart items for processing
        const selectedProducts = currentCartItems.map((cartItem: any) => ({
            id: cartItem.product.id,
            documentId: cartItem.product.documentId,
            title: cartItem.product.title || cartItem.product.name,
            selectedSize: cartItem.size,
            quantity: cartItem.quantity,
            price: cartItem.price,
            variantInfo: cartItem.variant ? {
                documentId: cartItem.variant.documentId,
                isVariant: true,
                title: cartItem.variant.title || cartItem.variant.color
            } : null
        }));

        // Process post-payment (stock, cart, email)
        console.log('🚀 [PROCESS-SUCCESS] Calling processPostPaymentStockAndCart...');

        const user = session?.user || {
            id: 'guest',
            email: paymentData?.orderData?.receiver_details?.email || 'guest@example.com'
        };

        const processResult = await processPostPaymentStockAndCart(
            selectedProducts,
            user,
            async (itemsToRemove: any[]) => {
                console.log(`🗑️ [PROCESS-SUCCESS] Deleting ${itemsToRemove.length} cart items...`);
                // Delete cart items from Strapi directly
                const { deleteData } = await import('@/utils/api');
                for (const item of currentCartItems) {
                    try {
                        await deleteData(`/api/carts/${item.documentId}`);
                    } catch (e) {
                        console.error('❌ Error deleting cart item:', e);
                    }
                }
            },
            paymentData
        );

        console.log('✅ [PROCESS-SUCCESS] Processing completed:', processResult);

        // Mark payment as processed in user bag
        if (processResult.emailSend?.success) {
            const updatedPayments = existingPayments.map((p: any) =>
                p.merchantTxnId === merchantTxnId ? { ...p, emailSent: true } : p
            );
            await updateUserBagWithPayment(targetBagId, {
                ...paymentData,
                emailSent: true
            });
        }

        return NextResponse.json({
            success: true,
            stockUpdated: processResult.stockUpdate?.success || false,
            cartCleared: processResult.cartClear?.success || false,
            emailSent: processResult.emailSend?.success || false,
            details: processResult
        });

    } catch (error: any) {
        console.error('❌ [PROCESS-SUCCESS] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
