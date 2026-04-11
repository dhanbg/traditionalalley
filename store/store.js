import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import currencyReducer from './slices/currencySlice';
import userReducer from './slices/userSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            cart: cartReducer,
            wishlist: wishlistReducer,
            currency: currencyReducer,
            user: userReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    // Ignore these action types for serialization checks
                    ignoredActions: ['cart/addProduct', 'cart/updateProduct'],
                    // Ignore these field paths in all actions
                    ignoredActionPaths: ['payload.timestamp'],
                    // Ignore these paths in the state
                    ignoredPaths: ['cart.lastUpdated'],
                },
            }),
        devTools: process.env.NODE_ENV !== 'production',
    });
};

// Infer the type of makeStore
export const store = makeStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export const selectCartState = (state) => state.cart;
export const selectWishlistState = (state) => state.wishlist;
export const selectCurrencyState = (state) => state.currency;
export const selectUserState = (state) => state.user;
