import { useMutation } from '@tanstack/react-query';
import { validateCartStock } from '@/utils/stockValidation';
import { fetchDataFromApi, createData, updateData } from '@/utils/api';
import { useCartStore } from '@/store/useCartStore';

export const useValidateStockMutation = (showStockError) => {
    const { removeCartItem } = useCartStore.getState();

    return useMutation({
        mutationFn: async ({ baseProductId, variantId, selectedSize, quantity, cartItem }) => {
            const result = await validateCartStock(
                baseProductId,
                variantId,
                selectedSize,
                quantity,
                0
            );
            if (!result.success) {
                throw { error: result.error, availableStock: result.availableStock, title: cartItem.title, cartItem };
            }
            return result;
        },
        onError: (err) => {
            console.warn('⚠️ Stock validation failed in background:', err);
            if (err.cartItem) {
                removeCartItem(err.cartItem.id);
            }
            if (showStockError && err.title) {
                showStockError(err.error, err.availableStock, err.title);
            }
        }
    });
};

export const useSyncCartMutation = () => {
    return useMutation({
        mutationFn: async ({ userId, cartItem }) => {
            const userData = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${userId}&populate=user_bag`);

            if (!userData?.data || userData.data.length === 0) {
                return null;
            }

            const userWithBag = userData.data.find(u => u.attributes?.user_bag?.data || u.user_bag);
            const currentUser = userWithBag || userData.data[0];
            const currentUserDocumentId = currentUser.documentId || currentUser.attributes?.documentId || currentUser.id;
            let userBagData = currentUser?.attributes?.user_bag?.data || currentUser?.user_bag;

            if (!userBagData) {
                console.log('📦 No bag linked in useSyncCartMutation, searching/creating...');
                try {
                    // Check if a bag exists for this user_datum but isn't linked
                    const existingBagResponse = await fetchDataFromApi(
                        `/api/user-bags?filters[user_datum][documentId][$eq]=${currentUserDocumentId}`
                    );

                    if (existingBagResponse?.data && existingBagResponse.data.length > 0) {
                        // Found an existing bag, link it to user_data
                        console.log('🔗 Found existing bag, linking to user_data...');
                        const foundBag = existingBagResponse.data[0];
                        userBagData = foundBag.attributes || foundBag;

                        await updateData(`/api/user-data/${currentUserDocumentId}`, {
                            data: {
                                user_bag: userBagData.documentId || foundBag.id
                            }
                        });
                        console.log('✅ Existing bag linked to user_data');
                    } else {
                        // No bag exists, create a new one
                        console.log('📦 Creating new user bag for user:', userId);
                        const firstName = currentUser.attributes?.firstName || currentUser.firstName || 'User';
                        const lastName = currentUser.attributes?.lastName || currentUser.lastName || '';
                        const bagPayload = {
                            data: {
                                Name: `${firstName} ${lastName}`.trim() || 'Shopping Bag',
                                user_datum: currentUserDocumentId
                            }
                        };
                        const bagResponse = await createData('/api/user-bags', bagPayload);
                        const rawBagData = bagResponse?.data?.attributes || bagResponse?.data || {};
                        userBagData = {
                            ...rawBagData,
                            id: bagResponse?.data?.id || rawBagData.id,
                            documentId: bagResponse?.data?.documentId || rawBagData.documentId
                        };
                        console.log('✅ User bag created:', userBagData?.documentId || userBagData?.id);

                        // Link the new bag to user_data
                        const userBagDocId = userBagData.documentId || userBagData.id;
                        if (userBagDocId) {
                            console.log('🔗 Linking new bag to user_data...');
                            await updateData(`/api/user-data/${currentUserDocumentId}`, {
                                data: {
                                    user_bag: userBagDocId
                                }
                            });
                            console.log('✅ User_data updated with bag reference');
                        }
                    }
                } catch (err) {
                    console.error('Error auto-creating or linking user bag in useSyncCartMutation:', err);
                }
            }

            const userBagDocumentId = userBagData?.documentId || userBagData?.attributes?.documentId || userBagData?.id;
            const variantIdentifier = cartItem.variantInfo?.documentId || (cartItem.variantInfo?.isVariant ? cartItem.variantInfo?.variantId : null);
            const initialProductDocId = cartItem.baseProductId || cartItem.documentId;

            const basePayload = {
                ...(initialProductDocId && { product: initialProductDocId }),
                quantity: cartItem.quantity,
                size: cartItem.selectedSize,
                user_bag: userBagDocumentId,
                user_datum: currentUserDocumentId,
                variantInfo: cartItem.variantInfo,
            };

            // Level 1: Full payload with both product and product_variant
            try {
                const fullPayload = {
                    data: {
                        ...basePayload,
                        ...(variantIdentifier && { product_variant: variantIdentifier })
                    }
                };
                return await createData('/api/carts', fullPayload);
            } catch (err1) {
                if (!err1.message?.includes('400') && !err1.message?.includes('ValidationError')) {
                    throw err1;
                }

                // Level 2: Try with product relation, without product_variant
                if (variantIdentifier && initialProductDocId) {
                    try {
                        console.warn('⚠️ Retrying cart sync without product_variant relation:', err1.message);
                        return await createData('/api/carts', { data: basePayload });
                    } catch (err2) {
                        if (!err2.message?.includes('400') && !err2.message?.includes('ValidationError')) {
                            throw err2;
                        }
                    }
                }

                // Level 3: Try without product or product_variant relations (storing item via variantInfo JSON)
                try {
                    console.warn('⚠️ Retrying cart sync without product relation due to missing Strapi document:');
                    const safePayload = { ...basePayload };
                    delete safePayload.product;
                    return await createData('/api/carts', { data: safePayload });
                } catch (err3) {
                    console.error('❌ All cart sync attempts failed:', err3);
                    throw err3;
                }
            }
        },
        onError: (error) => {
            console.error('Error syncing cart item to Strapi in background:', error);
        }
    });
};
