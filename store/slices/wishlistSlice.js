import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadWishlistFromBackend = createAsyncThunk(
    'wishlist/loadFromBackend',
    async () => []
);

export const addToWishlistInBackend = createAsyncThunk(
    'wishlist/addToBackend',
    async ({ productId }) => productId
);

export const removeFromWishlistInBackend = createAsyncThunk(
    'wishlist/removeFromBackend',
    async ({ productId }) => productId
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
        addToWishlist: (state) => {},
        removeFromWishlist: (state) => {},
        toggleWishlist: (state) => {},
        clearWishlist: (state) => {
            state.items = [];
        },
    },
});

export const {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
} = wishlistSlice.actions;

export const selectWishlistItems = () => [];
export const selectIsInWishlist = () => () => false;
export const selectWishlistCount = () => 0;

export default wishlistSlice.reducer;
