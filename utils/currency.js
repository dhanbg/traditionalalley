// Currency utilities for dual pricing system (USD/NPR)

// Exchange rate API configuration
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const FALLBACK_USD_TO_NPR_RATE = 141.11; // Auto-updated on 2025-09-05T13:42:03.955Z // Fallback rate if API fails

// Cache for exchange rates (valid for 1 hour)
let exchangeRateCache = {
  rate: FALLBACK_USD_TO_NPR_RATE,
  timestamp: 0,
  ttl: 3600000 // 1 hour in milliseconds
};

/**
 * Detect user's country based on various methods
 * @returns {Promise<string>} Country code (NP for Nepal, others for global)
 */
export const detectUserCountry = async () => {
  try {
    // Method 1: Try to get from browser's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone === 'Asia/Kathmandu') {
      return 'NP';
    }

    // Method 2: Try to get from IP geolocation (free service)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      return data.country_code || 'US';
    } catch (ipError) {
      // Silently handle IP geolocation errors
    }

    // Method 3: Check browser language
    const language = navigator.language || navigator.languages[0];
    if (language && language.toLowerCase().includes('ne')) {
      return 'NP';
    }

    // Default to US for global users
    return 'US';
  } catch (error) {
    console.error('Country detection failed:', error);
    return 'US'; // Default fallback
  }
};

/**
 * Get current USD to NPR exchange rate
 * @returns {Promise<number>} Exchange rate
 */
export const getExchangeRate = async () => {
  const now = Date.now();

  // Return cached rate if still valid
  if (exchangeRateCache.timestamp + exchangeRateCache.ttl > now) {
    return exchangeRateCache.rate;
  }

  try {
    // Create AbortController for timeout (browser-compatible)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(EXCHANGE_API_URL, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (data.rates && data.rates.NPR) {
      exchangeRateCache = {
        rate: data.rates.NPR,
        timestamp: now,
        ttl: 3600000
      };
      return data.rates.NPR;
    }
  } catch (error) {
    // Silently handle errors and use fallback rate
    // This is expected behavior when API is unreachable or times out
    if (error.name !== 'AbortError') {
      console.warn('Exchange rate API unavailable, using fallback rate');
    }
  }

  // Return cached rate or fallback
  return exchangeRateCache.rate;
};

/**
 * Convert USD price to NPR
 * @param {number} usdPrice - Price in USD
 * @param {number} exchangeRate - Current exchange rate
 * @returns {number} Price in NPR
 */
export const convertUsdToNpr = (usdPrice, exchangeRate) => {
  if (!usdPrice || !exchangeRate) return 0;
  return Math.round(usdPrice * exchangeRate);
};

/**
 * Format price based on currency
 * @param {number} price - Price amount
 * @param {string} currency - Currency code (USD/NPR)
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD', showSymbol = true) => {
  if (!price && price !== 0) return '';

  const isNegative = price < 0;
  const absPrice = Math.abs(price);

  const formatters = {
    USD: new Intl.NumberFormat('en-US', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    NPR: new Intl.NumberFormat('en-NP', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  };

  const formatter = formatters[currency] || formatters.USD;

  let formatted;
  if (showSymbol) {
    formatted = formatter.format(absPrice);
  } else {
    // For NPR without symbol, add "Rs." prefix
    const val = formatter.format(absPrice);
    formatted = currency === 'NPR' ? `Rs. ${val}` : `$${val}`;
  }

  return isNegative ? `-${formatted}` : formatted;
};

/**
 * Get currency info based on country
 * @param {string} countryCode - Country code
 * @returns {object} Currency information
 */
export const getCurrencyInfo = (countryCode) => {
  const currencies = {
    NP: {
      code: 'NPR',
      symbol: 'Rs.',
      name: 'Nepali Rupee',
      locale: 'ne-NP'
    },
    default: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      locale: 'en-US'
    }
  };

  return currencies[countryCode] || currencies.default;
};

/**
 * Calculate price with conversion
 * @param {number} basePrice - Base price in USD
 * @param {string} targetCurrency - Target currency (USD/NPR)
 * @param {number} exchangeRate - Current exchange rate
 * @returns {object} Price information
 */
export const calculatePrice = (basePrice, targetCurrency = 'USD', exchangeRate = null) => {
  if (!basePrice) return { price: 0, currency: targetCurrency, formatted: formatPrice(0, targetCurrency) };

  let finalPrice = basePrice;

  if (targetCurrency === 'NPR' && exchangeRate) {
    finalPrice = convertUsdToNpr(basePrice, exchangeRate);
  }

  return {
    price: finalPrice,
    currency: targetCurrency,
    formatted: formatPrice(finalPrice, targetCurrency),
    originalUsd: basePrice
  };
};

/**
 * Get price display for dual currency
 * @param {number} usdPrice - Price in USD
 * @param {string} userCurrency - User's preferred currency
 * @param {number} exchangeRate - Current exchange rate
 * @returns {object} Price display information
 */
export const getDualPriceDisplay = (usdPrice, userCurrency = 'USD', exchangeRate = null) => {
  const usdDisplay = calculatePrice(usdPrice, 'USD');
  const nprDisplay = calculatePrice(usdPrice, 'NPR', exchangeRate);

  return {
    primary: userCurrency === 'NPR' ? nprDisplay : usdDisplay,
    secondary: userCurrency === 'NPR' ? usdDisplay : nprDisplay,
    showConversion: userCurrency === 'NPR',
    exchangeRate
  };
};

// Local storage keys
export const CURRENCY_STORAGE_KEY = 'user_currency_preference';
export const COUNTRY_STORAGE_KEY = 'user_country_detected';
export const EXCHANGE_RATE_STORAGE_KEY = 'usd_npr_exchange_rate';

/**
 * Save user currency preference
 * @param {string} currency - Currency code
 * @param {string} country - Country code
 */
export const saveCurrencyPreference = (currency, country) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    localStorage.setItem(COUNTRY_STORAGE_KEY, country);
  }
};

/**
 * Get saved currency preference
 * @returns {object} Saved preferences
 */
export const getSavedCurrencyPreference = () => {
  if (typeof window === 'undefined') {
    return { currency: 'USD', country: 'US' };
  }

  return {
    currency: localStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD',
    country: localStorage.getItem(COUNTRY_STORAGE_KEY) || 'US'
  };
};