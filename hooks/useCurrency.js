'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef } from 'react';
import {
    selectCurrency,
    selectCountry,
    selectExchangeRate,
    selectIsLoadingCurrency,
    setCurrency as setCurrencyAction,
    setCountry as setCountryAction,
    initializeCurrency as initializeCurrencyAction,
    refreshExchangeRate as refreshExchangeRateAction,
} from '@/store/slices/currencySlice';
import { getExchangeRate } from '@/utils/currency';

export const useCurrency = () => {
    const dispatch = useDispatch();
    const initialized = useRef(false);

    const userCurrency = useSelector(selectCurrency);
    const userCountry = useSelector(selectCountry);
    const exchangeRate = useSelector(selectExchangeRate);
    const isLoadingCurrency = useSelector(selectIsLoadingCurrency);

    // Initialize currency on mount (only once)
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            dispatch(initializeCurrencyAction());
        }
    }, [dispatch]);

    // Refresh exchange rate periodically (every hour)
    useEffect(() => {
        if (userCurrency === 'NPR') {
            const interval = setInterval(() => {
                dispatch(refreshExchangeRateAction());
            }, 3600000); // 1 hour

            return () => clearInterval(interval);
        }
    }, [userCurrency, dispatch]);

    const setCurrency = useCallback(async (newCurrency) => {
        let rate = exchangeRate;

        // Get exchange rate if switching to NPR
        if (newCurrency === 'NPR' && !rate) {
            try {
                rate = await getExchangeRate();
            } catch (error) {
                console.error('Error getting exchange rate:', error);
            }
        }

        dispatch(setCurrencyAction({ currency: newCurrency }));
    }, [dispatch, exchangeRate]);

    const setCountry = useCallback((country) => {
        dispatch(setCountryAction({ country }));
    }, [dispatch]);

    const refreshExchangeRate = useCallback(async () => {
        const result = await dispatch(refreshExchangeRateAction());
        return result.payload;
    }, [dispatch]);

    return {
        userCurrency,
        userCountry,
        exchangeRate,
        isLoadingCurrency,
        setCurrency,
        setCountry,
        refreshExchangeRate,
    };
};
