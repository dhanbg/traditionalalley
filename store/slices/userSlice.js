import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },

        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },

        updateUserPreferences: (state, action) => {
            if (state.user) {
                state.user.preferences = {
                    ...state.user.preferences,
                    ...action.payload,
                };
            }
        },
    },
});

export const { setUser, clearUser, updateUserPreferences } = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserPreferences = (state) => state.user.user?.preferences;

export default userSlice.reducer;
