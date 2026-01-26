import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    detectUserCountry,
    getExchangeRate,
    getCurrencyInfo,
    saveCurrencyPreference,
    getSavedCurrencyPreference
} from '@/utils/currency';

// Async thunk for initializing currency
export const initializeCurrency = createAsyncThunk(
    'currency/initialize',
    async (_, { rejectWithValue }) => {
        try {
            // Get saved preferences first
            const savedPrefs = getSavedCurrencyPreference();

            // If no saved preferences, detect country
            let country = savedPrefs.country;
            let currency = savedPrefs.currency;

            if (!country || country === 'US') {
                country = await detectUserCountry();
            }

            // Set currency based on country
            if (country === 'NP' && currency !== 'NPR') {
                currency = 'NPR';
            } else if (country !== 'NP' && currency !== 'USD') {
                currency = 'USD';
            }

            // Get exchange rate if needed
            let rate = null;
            if (currency === 'NPR' || country === 'NP') {
                rate = await getExchangeRate();
            }

            // Save preferences
            saveCurrencyPreference(currency, country);

            return { country, currency, rate };
        } catch (error) {
            console.error('Error initializing currency:', error);
            // Fallback to USD
            return { country: 'US', currency: 'USD', rate: null };
        }
    }
);

// Async thunk for refreshing exchange rate
export const refreshExchangeRate = createAsyncThunk(
    'currency/refreshRate',
    async (_, { rejectWithValue }) => {
        try {
            const rate = await getExchangeRate();
            return rate;
        } catch (error) {
            console.error('Error refreshing exchange rate:', error);
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    country: 'US',
    currency: 'USD',
    exchangeRate: null,
    isLoading: true,
    error: null,
};

const currencySlice = createSlice({
    name: 'currency',
    initialState,
    reducers: {
        setCurrency: (state, action) => {
            const { currency } = action.payload;
            state.currency = currency;
            saveCurrencyPreference(currency, state.country);
        },

        setCountry: (state, action) => {
            const { country } = action.payload;
            state.country = country;
            saveCurrencyPreference(state.currency, country);
        },

        setExchangeRate: (state, action) => {
            state.exchangeRate = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder
            // Initialize currency
            .addCase(initializeCurrency.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(initializeCurrency.fulfilled, (state, action) => {
                state.country = action.payload.country;
                state.currency = action.payload.currency;
                state.exchangeRate = action.payload.rate;
                state.isLoading = false;
            })
            .addCase(initializeCurrency.rejected, (state, action) => {
                // Fallback to defaults
                state.country = 'US';
                state.currency = 'USD';
                state.exchangeRate = null;
                state.isLoading = false;
                state.error = action.payload;
            })

            // Refresh exchange rate
            .addCase(refreshExchangeRate.fulfilled, (state, action) => {
                state.exchangeRate = action.payload;
            })
            .addCase(refreshExchangeRate.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { setCurrency, setCountry, setExchangeRate } = currencySlice.actions;

// Selectors
export const selectCurrency = (state) => state.currency.currency;
export const selectCountry = (state) => state.currency.country;
export const selectExchangeRate = (state) => state.currency.exchangeRate;
export const selectIsLoadingCurrency = (state) => state.currency.isLoading;

export default currencySlice.reducer;
