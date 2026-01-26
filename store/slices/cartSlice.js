import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { fetchDataFromApi, createData, updateData, deleteData } from '@/utils/api';
import { getImageUrl } from '@/utils/imageUtils';
import { validateCartStock } from '@/utils/stockValidation';

// Helper function to generate unique cart item ID
const generateCartItemId = (productId, size, variantId) => {
    let id = productId;
    if (variantId) {
        id += `-variant-${variantId}`;
    }
    if (size) {
        id += `-size-${size}`;
    }
    return id;
};

// Helper to get optimized image URL
const getOptimizedImageUrl = (imgSrcObject) => {
    if (!imgSrcObject) return '/images/placeholder.png';

    if (imgSrcObject.formats?.small?.url) {
        return getImageUrl(imgSrcObject.formats.small.url);
    } else if (imgSrcObject.formats?.thumbnail?.url) {
        return getImageUrl(imgSrcObject.formats.thumbnail.url);
    } else if (imgSrcObject.url) {
        return getImageUrl(imgSrcObject.url);
    }

    return '/images/placeholder.png';
};

// Async thunk for loading cart from backend
export const loadCartFromBackend = createAsyncThunk(
    'cart/loadFromBackend',
    async (userId, { rejectWithValue }) => {
        try {
            console.log('🔄 Loading cart from backend for user:', userId);

            // First, get the user's bag ID
            const userData = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${userId}&populate=user_bag`);

            console.log('📦 User data response:', userData);

            if (!userData?.data || userData.data.length === 0) {
                console.log('⚠️ No user data found');
                return [];
            }

            const currentUser = userData.data[0];
            const userDocumentId = currentUser.documentId;
            console.log('👤 User documentId:', userDocumentId);

            // Fetch cart items directly by user_datum
            const cartsResponse = await fetchDataFromApi(
                `/api/carts?filters[user_datum][documentId][$eq]${userDocumentId}&populate=product,product_variant`
            );

            console.log('🛒 Carts response:', cartsResponse);

            const cartItems = cartsResponse?.data || [];
            console.log('📊 Found cart items:', cartItems.length);

            // Transform cart items to frontend format
            const transformedCart = cartItems.map(cartItem => {
                const attrs = cartItem.attributes || {};
                const product = attrs.product?.data?.attributes || {};
                const productDocumentId = attrs.product?.data?.documentId || product.documentId;

                // Build unique ID matching what addProductToCart creates
                const uniqueId = generateCartItemId(
                    productDocumentId,
                    attrs.size,
                    attrs.variantInfo?.variantId
                );

                return {
                    id: uniqueId,
                    documentId: productDocumentId,
                    baseProductId: productDocumentId,
                    title: product.title || 'Product',
                    price: parseFloat(product.price || 0),
                    oldPrice: product.oldPrice ? parseFloat(product.oldPrice) : null,
                    quantity: parseInt(attrs.quantity || 1),
                    selectedSize: attrs.size || null,
                    imgSrc: getOptimizedImageUrl(product.imgSrc),
                    colors: product.colors || [],
                    sizes: product.sizes || [],
                    weight: product.weight || null,
                    variantInfo: attrs.variantInfo || null,
                    backendId: cartItem.id,
                    backendDocumentId: cartItem.documentId,
                };
            });

            console.log('✅ Transformed cart items:', transformedCart);
            return transformedCart;
        } catch (error) {
            console.error('Error loading cart from backend:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for syncing cart item to backend
export const syncCartItemToBackend = createAsyncThunk(
    'cart/syncItemToBackend',
    async ({ userId, cartItem }, { rejectWithValue }) => {
        try {
            // Get user data
            const userData = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${userId}&populate=user_bag`);

            if (!userData?.data || userData.data.length === 0) {
                throw new Error('User not found');
            }

            const currentUser = userData.data[0];
            let userBagData = currentUser?.attributes?.user_bag?.data;

            // If user bag doesn't exist, check if there's an orphaned bag for this user
            if (!userBagData) {
                console.log('📦 No bag linked, searching for existing bag...');
                try {
                    // Check if a bag exists for this user_datum but isn't linked
                    const existingBagResponse = await fetchDataFromApi(
                        `/api/user-bags?filters[user_datum][documentId][$eq]=${currentUser.documentId}`
                    );

                    if (existingBagResponse?.data && existingBagResponse.data.length > 0) {
                        // Found an existing bag, link it to user_data
                        console.log('🔗 Found existing bag, linking to user_data...');
                        userBagData = existingBagResponse.data[0];

                        await updateData(`/api/user-data/${currentUser.documentId}`, {
                            data: {
                                user_bag: userBagData.documentId
                            }
                        });
                        console.log('✅ Existing bag linked to user_data');
                    } else {
                        // No bag exists, create a new one
                        console.log('📦 Creating new user bag for user:', userId);
                        const bagPayload = {
                            data: {
                                user_datum: currentUser.documentId
                            }
                        };
                        const bagResponse = await createData('/api/user-bags', bagPayload);
                        userBagData = bagResponse?.data;
                        console.log('✅ User bag created:', userBagData?.documentId);

                        // Link the new bag to user_data
                        if (userBagData?.documentId) {
                            console.log('🔗 Linking new bag to user_data...');
                            await updateData(`/api/user-data/${currentUser.documentId}`, {
                                data: {
                                    user_bag: userBagData.documentId
                                }
                            });
                            console.log('✅ User_data updated with bag reference');
                        }
                    }
                } catch (bagError) {
                    console.error('Error managing user bag:', bagError);
                    throw new Error('Failed to manage user bag');
                }
            }

            const userBagDocumentId = userBagData.documentId || userBagData.attributes?.documentId;

            // Create cart item payload matching Strapi cart schema
            const cartPayload = {
                data: {
                    product: cartItem.documentId, // Relation to product
                    quantity: cartItem.quantity,
                    size: cartItem.selectedSize,
                    user_bag: userBagDocumentId,
                    user_datum: currentUser.documentId,
                    variantInfo: cartItem.variantInfo, // JSON field
                    // product_variant will be set if there's a variantId
                    ...(cartItem.variantInfo?.variantId && {
                        product_variant: cartItem.variantInfo.variantId
                    })
                }
            };

            // Create cart item in backend using /api/carts (not /api/cart-products)
            const response = await createData('/api/carts', cartPayload);

            return {
                ...cartItem,
                backendId: response?.data?.id,
                backendDocumentId: response?.data?.documentId || response?.data?.attributes?.documentId,
            };
        } catch (error) {
            console.error('Error syncing cart item to backend:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for removing cart item from backend
export const removeCartItemFromBackend = createAsyncThunk(
    'cart/removeFromBackend',
    async (backendDocumentId, { rejectWithValue }) => {
        try {
            await deleteData('/api/carts', backendDocumentId);
            return backendDocumentId;
        } catch (error) {
            console.error('Error removing cart item from backend:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for updating cart item quantity in backend
export const updateCartItemQuantityInBackend = createAsyncThunk(
    'cart/updateQuantityInBackend',
    async ({ backendDocumentId, quantity }, { rejectWithValue }) => {
        try {
            await updateData('/api/carts', backendDocumentId, {
                data: { quantity }
            });
            return { backendDocumentId, quantity };
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    items: [],
    selectedItems: {},
    totalPrice: 0,
    isLoading: false,
    isCartLoading: true,
    cartLoadedOnce: false,
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addProductToCart: (state, action) => {
            const { product } = action.payload;

            // Check if product already exists
            const existingIndex = state.items.findIndex(item => item.id === product.id);

            if (existingIndex === -1) {
                state.items.push(product);
                // Auto-select new items
                state.selectedItems[product.id] = true;
            }

            // Recalculate total
            state.totalPrice = state.items.reduce((acc, item) =>
                acc + (item.price * item.quantity), 0
            );
        },

        removeProductFromCart: (state, action) => {
            const { id } = action.payload;
            state.items = state.items.filter(item => item.id !== id);

            // Remove from selection
            delete state.selectedItems[id];

            // Recalculate total
            state.totalPrice = state.items.reduce((acc, item) =>
                acc + (item.price * item.quantity), 0
            );
        },

        increaseQuantity: (state, action) => {
            const { id } = action.payload;
            const item = state.items.find(item => item.id === id);

            if (item) {
                item.quantity += 1;

                // Recalculate total
                state.totalPrice = state.items.reduce((acc, item) =>
                    acc + (item.price * item.quantity), 0
                );
            }
        },

        decreaseQuantity: (state, action) => {
            const { id } = action.payload;
            const item = state.items.find(item => item.id === id);

            if (item && item.quantity > 1) {
                item.quantity -= 1;

                // Recalculate total
                state.totalPrice = state.items.reduce((acc, item) =>
                    acc + (item.price * item.quantity), 0
                );
            }
        },

        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find(item => item.id === id);

            if (item) {
                item.quantity = Math.max(1, quantity);

                // Recalculate total
                state.totalPrice = state.items.reduce((acc, item) =>
                    acc + (item.price * item.quantity), 0
                );
            }
        },

        toggleItemSelection: (state, action) => {
            const { id } = action.payload;
            state.selectedItems[id] = !state.selectedItems[id];
        },

        selectAllItems: (state, action) => {
            const { selectAll } = action.payload;
            state.items.forEach(item => {
                state.selectedItems[item.id] = selectAll;
            });
        },

        clearCart: (state) => {
            state.items = [];
            state.selectedItems = {};
            state.totalPrice = 0;
        },

        setCartLoading: (state, action) => {
            state.isCartLoading = action.payload;
        },

        setCartLoadedOnce: (state, action) => {
            state.cartLoadedOnce = action.payload;
        },

        restoreSelections: (state, action) => {
            const { selections } = action.payload;
            // Only restore selections for items that exist in cart
            const validSelections = {};
            Object.keys(selections).forEach(itemId => {
                if (state.items.some(item => item.id === itemId)) {
                    validSelections[itemId] = selections[itemId];
                }
            });
            state.selectedItems = { ...state.selectedItems, ...validSelections };
        },
    },

    extraReducers: (builder) => {
        builder
            // Load cart from backend
            .addCase(loadCartFromBackend.pending, (state) => {
                state.isLoading = true;
                state.isCartLoading = true;
            })
            .addCase(loadCartFromBackend.fulfilled, (state, action) => {
                state.items = action.payload;
                state.isLoading = false;
                state.isCartLoading = false;
                state.cartLoadedOnce = true;

                // Auto-select all loaded items (preserve existing selections)
                action.payload.forEach(item => {
                    // Only auto-select if not already in selectedItems
                    if (!(item.id in state.selectedItems)) {
                        state.selectedItems[item.id] = true;
                    }
                });

                // Recalculate total
                state.totalPrice = state.items.reduce((acc, item) =>
                    acc + (item.price * item.quantity), 0
                );
            })
            .addCase(loadCartFromBackend.rejected, (state, action) => {
                state.isLoading = false;
                state.isCartLoading = false;
                state.cartLoadedOnce = true;
                state.error = action.payload;
            })

            // Sync item to backend
            .addCase(syncCartItemToBackend.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })

            // Remove from backend
            .addCase(removeCartItemFromBackend.fulfilled, (state, action) => {
                // Item already removed from local state, just cleanup if needed
            })

            // Update quantity in backend
            .addCase(updateCartItemQuantityInBackend.fulfilled, (state, action) => {
                // Quantity already updated in local state
            });
    },
});

export const {
    addProductToCart,
    removeProductFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    toggleItemSelection,
    selectAllItems,
    clearCart,
    setCartLoading,
    setCartLoadedOnce,
    restoreSelections,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectSelectedItems = (state) => state.cart.selectedItems;
export const selectTotalPrice = (state) => state.cart.totalPrice;
export const selectIsCartLoading = (state) => state.cart.isCartLoading;
export const selectCartLoadedOnce = (state) => state.cart.cartLoadedOnce;

// Memoized selectors to prevent unnecessary re-renders
export const selectSelectedCartItems = createSelector(
    [selectCartItems, selectSelectedItems],
    (items, selectedItems) => items.filter(item => selectedItems[item.id])
);

export const selectSelectedItemsTotal = createSelector(
    [selectSelectedCartItems],
    (selectedItems) => selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
);

export default cartSlice.reducer;
