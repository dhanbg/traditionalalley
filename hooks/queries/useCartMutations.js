import { useMutation } from '@tanstack/react-query';
import { validateCartStock } from '@/utils/stockValidation';
import { fetchDataFromApi, createData } from '@/utils/api';
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
            let userBagData = currentUser?.attributes?.user_bag?.data || currentUser?.user_bag;

            if (!userBagData) {
                // Return silently if bag isn't ready yet
                return null;
            }

            const userBagDocumentId = userBagData.documentId || userBagData.attributes?.documentId;

            const variantIdentifier = cartItem.variantInfo?.variantId || cartItem.variantInfo?.documentId || cartItem.variantInfo?.id;

            const cartPayload = {
                data: {
                    product: cartItem.baseProductId || cartItem.documentId,
                    quantity: cartItem.quantity,
                    size: cartItem.selectedSize,
                    user_bag: userBagDocumentId,
                    user_datum: currentUser.documentId,
                    variantInfo: cartItem.variantInfo,
                    ...(variantIdentifier && {
                        product_variant: variantIdentifier
                    })
                }
            };

            const response = await createData('/api/carts', cartPayload);
            return response;
        },
        onError: (error) => {
            console.error('Error syncing cart item to Strapi in background:', error);
        }
    });
};
