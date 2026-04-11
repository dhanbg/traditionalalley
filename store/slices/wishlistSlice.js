import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDataFromApi, createData, deleteData } from '@/utils/api';

// Async thunk for loading wishlist from backend
export const loadWishlistFromBackend = createAsyncThunk(
    'wishlist/loadFromBackend',
    async (userId, { rejectWithValue }) => {
        try {
            const userData = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${userId}&populate=user_bag.user_wishlists.product`);

            if (!userData?.data || userData.data.length === 0) {
                return [];
            }

            const currentUser = userData.data[0];
            const userBag = currentUser?.attributes?.user_bag?.data;

            if (!userBag) {
                return [];
            }

            const wishlists = userBag.attributes?.user_wishlists?.data || [];

            // Extract product IDs or documentIds
            const wishlistIds = wishlists.map(item => {
                const attrs = item.attributes || {};
                return attrs.productDocumentId || attrs.product?.data?.documentId || attrs.product?.data?.id;
            }).filter(Boolean);

            return wishlistIds;
        } catch (error) {
            console.error('Error loading wishlist from backend:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for adding to wishlist in backend
export const addToWishlistInBackend = createAsyncThunk(
    'wishlist/addToBackend',
    async ({ userId, productId }, { rejectWithValue }) => {
        try {
            const userData = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${userId}&populate=user_bag`);

            if (!userData?.data || userData.data.length === 0) {
                throw new Error('User not found');
            }

            const currentUser = userData.data[0];
            const userBagData = currentUser?.attributes?.user_bag?.data;

            if (!userBagData) {
                throw new Error('User bag not found');
            }

            const userBagDocumentId = userBagData.documentId || userBagData.attributes?.documentId;

            const wishlistPayload = {
                data: {
                    productDocumentId: productId,
                    user_bag: userBagDocumentId,
                }
            };

            await createData('/api/user-wishlists', wishlistPayload);

            return productId;
        } catch (error) {
            console.error('Error adding to wishlist in backend:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for removing from wishlist in backend
export const removeFromWishlistInBackend = createAsyncThunk(
    'wishlist/removeFromBackend',
    async ({ userId, productId }, { rejectWithValue }) => {
        try {
            const userData = await fetchDataFromApi(`/api/user-data?filters[authUserId][$eq]=${userId}&populate=user_bag.user_wishlists`);

            if (!userData?.data || userData.data.length === 0) {
                throw new Error('User not found');
            }

            const currentUser = userData.data[0];
            const userBag = currentUser?.attributes?.user_bag?.data;

            if (!userBag) {
                throw new Error('User bag not found');
            }

            const wishlists = userBag.attributes?.user_wishlists?.data || [];

            // Find the wishlist item with matching productDocumentId
            const wishlistItem = wishlists.find(item => {
                const attrs = item.attributes || {};
                return attrs.productDocumentId === productId;
            });

            if (wishlistItem) {
                const documentId = wishlistItem.documentId || wishlistItem.attributes?.documentId;
                await deleteData('/api/user-wishlists', documentId);
            }

            return productId;
        } catch (error) {
            console.error('Error removing from wishlist in backend:', error);
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    items: [],
    isLoading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        addToWishlist: (state, action) => {
            const { productId } = action.payload;
            if (!state.items.includes(productId)) {
                state.items.push(productId);
            }
        },

        removeFromWishlist: (state, action) => {
            const { productId } = action.payload;
            state.items = state.items.filter(id => id !== productId);
        },

        toggleWishlist: (state, action) => {
            const { productId } = action.payload;
            const index = state.items.indexOf(productId);

            if (index === -1) {
                state.items.push(productId);
            } else {
                state.items.splice(index, 1);
            }
        },

        clearWishlist: (state) => {
            state.items = [];
        },
    },

    extraReducers: (builder) => {
        builder
            // Load wishlist from backend
            .addCase(loadWishlistFromBackend.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadWishlistFromBackend.fulfilled, (state, action) => {
                state.items = action.payload;
                state.isLoading = false;
            })
            .addCase(loadWishlistFromBackend.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Add to backend
            .addCase(addToWishlistInBackend.fulfilled, (state, action) => {
                if (!state.items.includes(action.payload)) {
                    state.items.push(action.payload);
                }
            })

            // Remove from backend
            .addCase(removeFromWishlistInBackend.fulfilled, (state, action) => {
                state.items = state.items.filter(id => id !== action.payload);
            });
    },
});

export const {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
} = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsInWishlist = (productId) => (state) =>
    state.wishlist.items.includes(productId);
export const selectWishlistCount = (state) => state.wishlist.items.length;

export default wishlistSlice.reducer;
