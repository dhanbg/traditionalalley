// Currency utilities for dual pricing system (NPR base / USD conversion)

// Exchange rate API configuration
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
export const FALLBACK_USD_TO_NPR_RATE = 141.11; // Standard exchange rate used in product pricing

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
    let timezone = '';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (e) {}

    // Method 1: Nepal Standard Time is unique worldwide to Nepal
    if (timezone === 'Asia/Kathmandu') {
      return 'NP';
    }

    // Method 2: Check Nepali browser language
    const language = (typeof navigator !== 'undefined' && (navigator.language || (navigator.languages && navigator.languages[0]))) || '';
    if (language.toLowerCase().includes('ne-np')) {
      return 'NP';
    }

    // Method 3: Try to get country from IP geolocation
    try {
      const response = await fetch('https://ipapi.co/json/', { timeout: 3500 });
      if (response.ok) {
        const data = await response.json();
        if (data && data.country_code) {
          return data.country_code;
        }
      }
    } catch (ipError) {
      // IP service failed or timed out
    }

    // Method 4: Fallback based on timezone
    // If timezone is recognized and NOT Asia/Kathmandu, the user is international
    if (timezone && timezone !== 'Asia/Kathmandu') {
      return 'US';
    }

    // Default fallback
    return 'NP';
  } catch (error) {
    return 'NP';
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
    const response = await fetch(EXCHANGE_API_URL, {
      timeout: 10000
    });
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
    console.warn('Failed to fetch exchange rate, using fallback:', error.message);
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
export const convertUsdToNpr = (usdPrice, exchangeRate = FALLBACK_USD_TO_NPR_RATE) => {
  if (!usdPrice || !exchangeRate) return 0;
  return Math.round(usdPrice * exchangeRate);
};

/**
 * Convert NPR price to USD
 * @param {number} nprPrice - Price in NPR
 * @param {number} exchangeRate - Current exchange rate
 * @returns {number} Price in USD
 */
export const convertNprToUsd = (nprPrice, exchangeRate = FALLBACK_USD_TO_NPR_RATE) => {
  if (!nprPrice || !exchangeRate) return 0;
  return Number((nprPrice / exchangeRate).toFixed(2));
};

/**
 * Format price based on currency
 * @param {number} price - Price amount
 * @param {string} currency - Currency code (NPR/USD)
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'NPR', showSymbol = true) => {
  if (!price && price !== 0) return '';

  const isNegative = price < 0;
  const absPrice = Math.abs(price);

  if (currency === 'NPR') {
    const formattedNum = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(absPrice);
    const result = showSymbol ? `Rs. ${formattedNum}` : formattedNum;
    return isNegative ? `-${result}` : result;
  }

  // USD
  const formattedUsd = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(absPrice);

  const result = showSymbol ? `$${formattedUsd}` : formattedUsd;
  return isNegative ? `-${result}` : result;
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
    US: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      locale: 'en-US'
    },
    default: {
      code: 'NPR',
      symbol: 'Rs.',
      name: 'Nepali Rupee',
      locale: 'ne-NP'
    }
  };

  return currencies[countryCode] || currencies.default;
};

/**
 * Calculate price with conversion from base NPR
 * @param {number} baseNprPrice - Base price in NPR from database
 * @param {string} targetCurrency - Target currency (NPR/USD)
 * @param {number} exchangeRate - Current exchange rate
 * @returns {object} Price information
 */
export const calculatePrice = (baseNprPrice, targetCurrency = 'NPR', exchangeRate = null) => {
  if (!baseNprPrice && baseNprPrice !== 0) {
    return { price: 0, currency: targetCurrency, formatted: formatPrice(0, targetCurrency) };
  }

  const rate = exchangeRate || FALLBACK_USD_TO_NPR_RATE;
  let finalPrice = baseNprPrice;

  if (targetCurrency === 'USD') {
    finalPrice = convertNprToUsd(baseNprPrice, rate);
  } else {
    finalPrice = Math.round(baseNprPrice);
  }

  return {
    price: finalPrice,
    currency: targetCurrency,
    formatted: formatPrice(finalPrice, targetCurrency),
    originalNpr: baseNprPrice
  };
};

/**
 * Get price display for dual currency (base NPR)
 * @param {number} nprPrice - Price in NPR from database
 * @param {string} userCurrency - User's preferred currency ('NPR' or 'USD')
 * @param {number} exchangeRate - Current exchange rate
 * @returns {object} Price display information
 */
export const getDualPriceDisplay = (nprPrice, userCurrency = 'NPR', exchangeRate = null) => {
  const rate = exchangeRate || FALLBACK_USD_TO_NPR_RATE;
  const nprDisplay = calculatePrice(nprPrice, 'NPR', rate);
  const usdDisplay = calculatePrice(nprPrice, 'USD', rate);

  return {
    primary: userCurrency === 'USD' ? usdDisplay : nprDisplay,
    secondary: userCurrency === 'USD' ? nprDisplay : usdDisplay,
    showConversion: userCurrency === 'USD',
    exchangeRate: rate
  };
};

// Local storage keys
export const CURRENCY_STORAGE_KEY = 'traditional_user_currency';
export const COUNTRY_STORAGE_KEY = 'traditional_user_country';
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
 * @returns {object} Saved preferences (default NPR)
 */
export const getSavedCurrencyPreference = () => {
  if (typeof window === 'undefined') {
    return { currency: null, country: null };
  }

  const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
  const savedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY);

  return {
    currency: savedCurrency || null,
    country: savedCountry || null
  };
};