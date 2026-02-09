'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useContextElement } from '@/context/Context';
import { formatPrice, convertUsdToNpr } from '@/utils/currency';

// Country calling codes mapping
const countryCallingCodes = {
  'AF': '+93', 'AL': '+355', 'DZ': '+213', 'AD': '+376', 'AO': '+244', 'AG': '+1',
  'AR': '+54', 'AM': '+374', 'AU': '+61', 'AT': '+43', 'AZ': '+994', 'BS': '+1',
  'BH': '+973', 'BD': '+880', 'BB': '+1', 'BY': '+375', 'BE': '+32', 'BZ': '+501',
  'BJ': '+229', 'BT': '+975', 'BO': '+591', 'BA': '+387', 'BW': '+267', 'BR': '+55',
  'BN': '+673', 'BG': '+359', 'BF': '+226', 'BI': '+257', 'KH': '+855', 'CM': '+237',
  'CA': '+1', 'CV': '+238', 'CF': '+236', 'TD': '+235', 'CL': '+56', 'CN': '+86',
  'CO': '+57', 'KM': '+269', 'CG': '+242', 'CD': '+243', 'CR': '+506', 'CI': '+225',
  'HR': '+385', 'CU': '+53', 'CY': '+357', 'CZ': '+420', 'DK': '+45', 'DJ': '+253',
  'DM': '+1', 'DO': '+1', 'EC': '+593', 'EG': '+20', 'SV': '+503', 'GQ': '+240',
  'ER': '+291', 'EE': '+372', 'SZ': '+268', 'ET': '+251', 'FJ': '+679', 'FI': '+358',
  'FR': '+33', 'GA': '+241', 'GM': '+220', 'GE': '+995', 'DE': '+49', 'GH': '+233',
  'GR': '+30', 'GD': '+1', 'GT': '+502', 'GN': '+224', 'GW': '+245', 'GY': '+592',
  'HT': '+509', 'HN': '+504', 'HK': '+852', 'HU': '+36', 'IS': '+354', 'IN': '+91',
  'ID': '+62', 'IR': '+98', 'IQ': '+964', 'IE': '+353', 'IL': '+972', 'IT': '+39',
  'JM': '+1', 'JP': '+81', 'JO': '+962', 'KZ': '+7', 'KE': '+254', 'KI': '+686',
  'KP': '+850', 'KR': '+82', 'KW': '+965', 'KG': '+996', 'LA': '+856', 'LV': '+371',
  'LB': '+961', 'LS': '+266', 'LR': '+231', 'LY': '+218', 'LI': '+423', 'LT': '+370',
  'LU': '+352', 'MO': '+853', 'MK': '+389', 'MG': '+261', 'MW': '+265', 'MY': '+60',
  'MV': '+960', 'ML': '+223', 'MT': '+356', 'MH': '+692', 'MR': '+222', 'MU': '+230',
  'MX': '+52', 'FM': '+691', 'MD': '+373', 'MC': '+377', 'MN': '+976', 'ME': '+382',
  'MA': '+212', 'MZ': '+258', 'MM': '+95', 'NA': '+264', 'NR': '+674', 'NP': '+977',
  'NL': '+31', 'NZ': '+64', 'NI': '+505', 'NE': '+227', 'NG': '+234', 'NO': '+47',
  'OM': '+968', 'PK': '+92', 'PW': '+680', 'PS': '+970', 'PA': '+507', 'PG': '+675',
  'PY': '+595', 'PE': '+51', 'PH': '+63', 'PL': '+48', 'PT': '+351', 'QA': '+974',
  'RO': '+40', 'RU': '+7', 'RW': '+250', 'KN': '+1', 'LC': '+1', 'VC': '+1',
  'WS': '+685', 'SM': '+378', 'ST': '+239', 'SA': '+966', 'SN': '+221', 'RS': '+381',
  'SC': '+248', 'SL': '+232', 'SG': '+65', 'SK': '+421', 'SI': '+386', 'SB': '+677',
  'SO': '+252', 'ZA': '+27', 'SS': '+211', 'ES': '+34', 'LK': '+94', 'SD': '+249',
  'SR': '+597', 'SE': '+46', 'CH': '+41', 'SY': '+963', 'TW': '+886', 'TJ': '+992',
  'TZ': '+255', 'TH': '+66', 'TL': '+670', 'TG': '+228', 'TO': '+676', 'TT': '+1',
  'TN': '+216', 'TR': '+90', 'TM': '+993', 'TV': '+688', 'UG': '+256', 'UA': '+380',
  'AE': '+971', 'GB': '+44', 'US': '+1', 'UY': '+598', 'UZ': '+998', 'VU': '+678',
  'VA': '+39', 'VE': '+58', 'VN': '+84', 'YE': '+967', 'ZM': '+260', 'ZW': '+263'
};

const DHLShippingForm = ({ onRateCalculated, onShipmentCreated, initialPackages = [], isCheckoutMode = false, onReceiverChange }) => {
  const [formData, setFormData] = useState({
    plannedShippingDate: '',
    productCode: 'P',
    serviceType: 'Economy',
    isCustomsDeclarable: true,
    declaredValue: 0,
    declaredValueCurrency: 'USD',
    incoterm: 'DAP',
    exportDeclaration: {
      exportReason: 'SALE',
      invoice: {
        number: '',
        date: ''
      }
    },
    originAddress: { postalCode: '44600', cityName: 'Kathmandu', countryCode: 'NP', addressLine1: '' },
    destinationAddress: { postalCode: '', cityName: '', countryCode: '', addressLine1: '' },
    shipper: {
      companyName: 'Traditional Alley',
      fullName: 'Anshu Kc',
      email: 'traditionalley2050@gmail.com',
      phone: '9844594187',
      countryCode: '+977'
    },
    recipient: { companyName: '', fullName: '', email: '', phone: '', countryCode: '', height: 'No' },
    packages: initialPackages.length > 0 ? initialPackages : [{ weight: 1, length: 10, width: 10, height: 10, description: '', declaredValue: 0, quantity: 1, commodityCode: '', manufacturingCountryCode: 'NP' }]
  });

  const [rates, setRates] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [dhlLoading, setDhlLoading] = useState(false);
  const [dhlError, setDhlError] = useState('');
  const [customHeightOption, setCustomHeightOption] = useState('No');

  // Shipping rates from /api/shipping-rates endpoint
  const [shippingRates, setShippingRates] = useState([]);
  const [loadingShippingRates, setLoadingShippingRates] = useState(false);
  const [shippingRatesError, setShippingRatesError] = useState('');

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Currency context
  const { userCurrency, exchangeRate } = useContextElement();

  // Helper function to format shipping cost based on user currency
  const formatShippingCost = (nprCost) => {
    if (userCurrency === 'USD' && exchangeRate) {
      const usdCost = nprCost / exchangeRate;
      return {
        amount: usdCost,
        formatted: formatPrice(usdCost, 'USD'),
        currency: 'USD'
      };
    }
    return {
      amount: nprCost,
      formatted: formatPrice(nprCost, 'NPR'),
      currency: 'NPR'
    };
  };
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countriesError, setCountriesError] = useState('');
  const [availableServiceTypes, setAvailableServiceTypes] = useState(['Economy', 'Express']);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(false);

  // Branch search functionality
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [filteredBranches, setFilteredBranches] = useState([]);

  // Responsive helper
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const getAutomaticShippingDate = () => {
    const now = new Date();
    const cutoffHour = 13;
    if (now.getHours() < cutoffHour && now.getDay() >= 1 && now.getDay() <= 5) {
      return { date: now.toISOString().split('T')[0], isToday: true, reason: 'Available for today (before 1:00 PM cutoff)' };
    }
    const nextDay = new Date(now);
    do { nextDay.setDate(nextDay.getDate() + 1); } while (nextDay.getDay() === 0 || nextDay.getDay() === 6);
    return { date: nextDay.toISOString().split('T')[0], isToday: false, reason: 'Next business day (automatic selection)' };
  };

  useEffect(() => {
    const autoDate = getAutomaticShippingDate();
    const invoiceDate = new Date().toISOString().split('T')[0];
    const invoiceNumber = `INV-${Date.now()}`;

    setFormData(prev => ({
      ...prev,
      plannedShippingDate: autoDate.date,
      exportDeclaration: {
        ...prev.exportDeclaration,
        invoice: {
          number: invoiceNumber,
          date: invoiceDate,
        }
      }
    }));
  }, []);

  useEffect(() => {
    if (isCheckoutMode && typeof onReceiverChange === 'function') {
      onReceiverChange({
        fullName: formData.recipient.fullName || "",
        companyName: formData.recipient.companyName || "",
        email: formData.recipient.email || "",
        phone: formData.recipient.phone || "",
        countryCode: getActualCountryCode(formData.recipient.countryCode) || "",
        height: formData.recipient.height || "",
        address: {
          addressLine1: formData.destinationAddress.addressLine1 || "",
          cityName: formData.destinationAddress.cityName || "",
          countryCode: getActualCountryCode(formData.destinationAddress.countryCode) || "",
          postalCode: formData.destinationAddress.postalCode || ""
        }
      });
    }
  }, [formData.recipient, formData.destinationAddress]);

  // Update packages when initialPackages changes (when product data loads)
  useEffect(() => {
    if (initialPackages && initialPackages.length > 0) {
      console.log('Updating packages with new data:', initialPackages);
      setFormData(prev => ({
        ...prev,
        packages: initialPackages
      }));
    }
  }, [initialPackages]);

  useEffect(() => {
    const actualCountryCode = getActualCountryCode(formData.destinationAddress.countryCode);
    if (actualCountryCode === 'NP') {
      loadBranches();
    }
  }, [formData.destinationAddress.countryCode]);

  useEffect(() => {
    loadCountries();
  }, []);

  // Filter branches based on search term
  useEffect(() => {
    if (branches.length > 0) {
      const filtered = branches.filter(branch =>
        branch.name.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
        branch.district.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
        (branch.region && branch.region.toLowerCase().includes(branchSearchTerm.toLowerCase()))
      );
      setFilteredBranches(filtered);
    }
  }, [branches, branchSearchTerm]);

  // Update branch search term when cityName changes from other sources
  useEffect(() => {
    if (formData.destinationAddress.cityName && !branchSearchTerm) {
      setBranchSearchTerm(formData.destinationAddress.cityName);
    }
  }, [formData.destinationAddress.cityName]);





  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await axios.get('/api/ncm/branches', {
        timeout: 15000 // 15 second timeout
      });
      if (response.data.success) {
        setBranches(response.data.branches);
      } else {
        console.warn('NCM branches API returned unsuccessful response:', response.data.message);
        // Set empty branches array as fallback
        setBranches([]);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      // Set empty branches array as fallback
      setBranches([]);

      // Don't show error to user for branch loading failures
      // as this is not critical for the main functionality
    } finally {
      setLoadingBranches(false);
    }
  };

  // API Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  // Helper function to extract actual country code from unique identifier
  const getActualCountryCode = (uniqueId) => {
    if (!uniqueId) return '';
    // If it's already a country code (for backward compatibility)
    if (uniqueId.length === 2 && !uniqueId.includes('-')) {
      return uniqueId;
    }
    // Extract country code from unique identifier (format: "ES-spain" or "ES-canary-island")
    return uniqueId.split('-')[0];
  };

  // Helper to get country calling code
  const getCountryCallingCode = (countryCode) => {
    if (!countryCode) return '+--';
    const code = getActualCountryCode(countryCode);
    return countryCallingCodes[code] || '+--';
  };

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      setCountriesError('');

      // First, get the total count to determine number of pages
      const initialResponse = await fetch(`${API_BASE_URL}/api/shipping-rates?populate=*&pagination[pageSize]=25`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!initialResponse.ok) {
        throw new Error(`HTTP error! status: ${initialResponse.status}`);
      }

      const initialData = await initialResponse.json();
      const totalPages = initialData.meta.pagination.pageCount;

      // Fetch all pages
      const allCountries = new Set();

      for (let page = 1; page <= totalPages; page++) {
        const response = await fetch(`${API_BASE_URL}/api/shipping-rates?populate=*&pagination[page]=${page}&pagination[pageSize]=25`, {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract unique countries with unique identifiers
        data.data.forEach(item => {
          if (item.country_name && item.country_code) {
            allCountries.add(JSON.stringify({
              name: item.country_name,
              code: item.country_code,
              uniqueId: `${item.country_code}-${item.country_name.replace(/\s+/g, '-').toLowerCase()}`
            }));
          }
        });
      }

      // Convert back to array and sort
      const countriesArray = Array.from(allCountries)
        .map(item => JSON.parse(item))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Add Nepal as a hardcoded option if not already present
      const nepalExists = countriesArray.some(country => country.code === 'NP');
      if (!nepalExists) {
        countriesArray.push({
          name: 'Nepal',
          code: 'NP',
          uniqueId: 'NP-nepal'
        });
        // Re-sort after adding Nepal
        countriesArray.sort((a, b) => a.name.localeCompare(b.name));
      }

      setCountries(countriesArray);
    } catch (error) {
      console.error('Failed to load countries:', error);
      setCountriesError('Failed to load countries. Please refresh the page to try again.');
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadServiceTypes = async (countryCode, uniqueId = null) => {
    if (!countryCode) {
      setAvailableServiceTypes(['Economy', 'Express']);
      return;
    }

    try {
      setLoadingServiceTypes(true);

      const response = await fetch(`${API_BASE_URL}/api/shipping-rates?filters[country_code][$eq]=${countryCode}&populate=*`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract unique service types for this country
      const serviceTypes = new Set();
      data.data.forEach(item => {
        if (item.service_type) {
          serviceTypes.add(item.service_type);
        }
      });

      let availableTypes = Array.from(serviceTypes);

      // Special handling for Canary Islands - only Express service available
      if (uniqueId && uniqueId.includes('canary-island')) {
        availableTypes = availableTypes.filter(type =>
          type.toLowerCase().includes('express')
        );
        // Ensure at least Express is available for Canary Islands
        if (availableTypes.length === 0) {
          availableTypes = ['Express'];
        }
      }

      setAvailableServiceTypes(availableTypes);

      // Auto-select service type if only one is available
      if (availableTypes.length === 1) {
        handleInputChange('', 'serviceType', availableTypes[0]);
      } else if (availableTypes.length > 1 && !availableTypes.includes(formData.serviceType)) {
        // Reset to first available if current selection is not available
        handleInputChange('', 'serviceType', availableTypes[0]);
      }

    } catch (error) {
      console.error('Failed to load service types:', error);
      // Fallback to both options if API fails
      setAvailableServiceTypes(['Economy', 'Express']);
    } finally {
      setLoadingServiceTypes(false);
    }
  };

  const getNCMRates = async () => {
    // For NCM, we need pickup branch (origin) and destination branch
    const pickupBranch = 'SATDOBATO'; // Default pickup branch - you may want to make this configurable
    const destinationBranch = formData.destinationAddress.cityName; // This contains the selected branch name

    try {
      setDhlLoading(true);
      setDhlError('');

      // Validate required data
      if (!destinationBranch) {
        throw new Error('Please select a destination branch');
      }

      console.log('NCM Rate Request:', { from: pickupBranch, to: destinationBranch });

      const response = await axios.get('/api/ncm/shipping-rate', {
        params: {
          from: pickupBranch,
          to: destinationBranch,
          type: 'Pickup'
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data.success) {
        // Format NCM response to match DHL structure for consistency
        const ncmRate = {
          success: true,
          data: {
            products: [{
              productName: 'NCM Delivery',
              totalPrice: [{
                currencyType: 'BILLC',
                price: response.data.charge
              }],
              deliveryCapabilities: {
                estimatedDeliveryDateAndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
                totalTransitDays: '2-3'
              }
            }]
          },
          isNCM: true // Flag to identify NCM rates
        };

        setRates(ncmRate);

        // Calculate total weight for display
        const totalWeight = formData.packages.reduce((total, pkg) => {
          return total + (parseFloat(pkg.weight) || 0) * (parseInt(pkg.quantity) || 1);
        }, 0);

        // Format NCM rate for shipping rates display (to show in "Available Shipping Rates" section)
        const ncmShippingRate = {
          service_type: `${pickupBranch} ${destinationBranch}`,
          country_name: '',
          country_code: 'NP',
          weight_limit: 25, // NCM weight limit as mentioned by user
          base_rate: response.data.charge,
          additional_rate: 0,
          weight_threshold: totalWeight,
          isNCM: true
        };

        setShippingRates([ncmShippingRate]);

        // Set selected rate for pricing display
        setSelectedRate({
          price: response.data.charge,
          currency: 'NPR',
          productName: 'NCM Delivery',
          deliveryDate: ncmRate.data.products[0].deliveryCapabilities.estimatedDeliveryDateAndTime,
          transitDays: '2-3'
        });

        // Notify parent component if callback exists
        if (onRateCalculated) {
          onRateCalculated({
            price: response.data.charge,
            currency: 'NPR',
            productName: 'NCM Delivery',
            isNCM: true
          });
        }
      }
    } catch (error) {
      console.error('NCM Rate Error - Full Error Object:', error);
      console.error('NCM Rate Error - Error Details:', {
        errorType: typeof error,
        errorConstructor: error.constructor?.name,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        pickupBranch,
        destinationBranch,
        hasResponse: !!error.response,
        errorKeys: Object.keys(error || {})
      });

      // Handle different error structures
      let errorMessage = 'Failed to get NCM rates';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setDhlError(errorMessage);
    } finally {
      setDhlLoading(false);
    }
  };

  // Function to fetch shipping rates from /api/shipping-rates endpoint
  const fetchShippingRates = async (countryCode, serviceType, totalWeight) => {
    try {
      setLoadingShippingRates(true);
      setShippingRatesError('');

      console.log('Fetching shipping rates:', { countryCode, serviceType, totalWeight });

      // Use the Next.js API route which handles both local and production environments
      const response = await axios.get('/api/shipping-rates', {
        params: {
          populate: '*'
        }
      });

      console.log('Raw API response:', {
        status: response.status,
        dataExists: !!response.data,
        dataDataExists: !!(response.data && response.data.data),
        dataLength: response.data?.data?.length || 0,
        firstItem: response.data?.data?.[0] || null
      });

      if (response.data && response.data.data) {
        console.log('All shipping rates before filtering:', response.data.data.map(rate => ({
          id: rate.id,
          country_code: rate.country_code,
          service_type: rate.service_type,
          weight_limit: rate.weight_limit,
          country_name: rate.country_name
        })));

        // Filter rates based on country code and service type
        const filteredRates = response.data.data.filter(rate => {
          const matchesCountry = rate.country_code === countryCode;
          const matchesService = rate.service_type.toLowerCase() === serviceType.toLowerCase();
          // Handle null weight_limit (means no weight restriction)
          const withinWeightLimit = rate.weight_limit === null || totalWeight <= rate.weight_limit;

          console.log(`Rate ${rate.id} filtering:`, {
            rate_country: rate.country_code,
            target_country: countryCode,
            matchesCountry,
            rate_service: rate.service_type,
            target_service: serviceType,
            matchesService,
            rate_weight_limit: rate.weight_limit,
            total_weight: totalWeight,
            withinWeightLimit,
            finalMatch: matchesCountry && matchesService && withinWeightLimit
          });

          return matchesCountry && matchesService && withinWeightLimit;
        });

        console.log('Filtered shipping rates:', filteredRates);
        setShippingRates(filteredRates);

        // Calculate shipping cost based on weight
        if (filteredRates.length > 0) {
          const rate = filteredRates[0]; // Use first matching rate
          const shippingCost = calculateShippingCost(rate, totalWeight);

          // Notify parent component with calculated rate
          if (onRateCalculated) {
            onRateCalculated({
              price: shippingCost,
              currency: 'NPR',
              productName: `${rate.service_type} to ${rate.country_name}`,
              rateDetails: rate,
              totalWeight: totalWeight
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching shipping rates - Full Error:', error);
      console.error('Error fetching shipping rates - Details:', {
        errorType: typeof error,
        errorConstructor: error.constructor?.name,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          params: error.config.params
        } : null,
        stack: error.stack,
        hasResponse: !!error.response,
        hasRequest: !!error.request,
        errorKeys: Object.keys(error || {})
      });
      setShippingRatesError('Failed to fetch shipping rates');
    } finally {
      setLoadingShippingRates(false);
    }
  };

  // Function to calculate shipping cost based on weight and rate structure
  const calculateShippingCost = (rate, weight) => {
    // Handle NCM rates - they have an incremental rate structure
    if (rate.isNCM) {
      const baseRate = rate.base_rate || 0;

      // For weights up to 2kg, use base rate
      if (weight <= 2) {
        return baseRate;
      }

      // For weights 3kg and above, add base rate for each additional kg
      // Example: 3kg = 2 * baseRate, 4kg = 3 * baseRate, etc.
      const additionalKg = Math.ceil(weight) - 2; // Round up to next kg for additional weight
      return baseRate + (additionalKg * baseRate);
    }

    // Weight ranges mapping for regular DHL rates
    const weightRanges = [
      { min: 0, max: 0.5, field: 'from_0_to_0_5' },
      { min: 0.5, max: 1, field: 'from_0_5_to_1' },
      { min: 1, max: 1.5, field: 'from_1_to_1_5' },
      { min: 1.5, max: 2, field: 'from_1_5_to_2' },
      { min: 2, max: 2.5, field: 'from_2_to_2_5' },
      { min: 2.5, max: 3, field: 'from_2_5_to_3' },
      { min: 3, max: 3.5, field: 'from_3_to_3_5' },
      { min: 3.5, max: 4, field: 'from_3_5_to_4' },
      { min: 4, max: 4.5, field: 'from_4_to_4_5' },
      { min: 4.5, max: 5, field: 'from_4_5_to_5' },
      { min: 5, max: 5.5, field: 'from_5_to_5_5' },
      { min: 5.5, max: 6, field: 'from_5_5_to_6' },
      { min: 6, max: 6.5, field: 'from_6_to_6_5' },
      { min: 6.5, max: 7, field: 'from_6_5_to_7' },
      { min: 7, max: 7.5, field: 'from_7_to_7_5' },
      { min: 7.5, max: 8, field: 'from_7_5_to_8' },
      { min: 8, max: 8.5, field: 'from_8_to_8_5' },
      { min: 8.5, max: 9, field: 'from_8_5_to_9' },
      { min: 9, max: 9.5, field: 'from_9_to_9_5' },
      { min: 9.5, max: 10, field: 'from_9_5_to_10' }
    ];

    // Find the appropriate weight range
    for (const range of weightRanges) {
      if (weight > range.min && weight < range.max) {
        return rate[range.field] || 0;
      }
      // Handle exact boundary weights (e.g., 1.5kg should use the higher bracket)
      if (weight === range.max && range.max !== 10) {
        // Find the next range for boundary weights
        const nextRangeIndex = weightRanges.findIndex(r => r.min === range.max);
        if (nextRangeIndex !== -1) {
          return rate[weightRanges[nextRangeIndex].field] || 0;
        }
      }
      // Handle exact minimum weights (e.g., 1.0kg should use the 1-1.5kg bracket)
      if (weight === range.min && range.min > 0) {
        return rate[range.field] || 0;
      }
    }

    // Handle weight of exactly 0 (use first range)
    if (weight === 0) {
      return rate['from_0_to_0_5'] || 0;
    }

    // Handle weights above 10kg
    if (weight === 10) {
      return rate.from_10_to_20 || 0;
    } else if (weight > 10 && weight < 20) {
      return rate.from_10_to_20 || 0;
    } else if (weight === 20) {
      return rate.from_20_to_30 || 0;
    } else if (weight > 20 && weight < 30) {
      return rate.from_20_to_30 || 0;
    } else if (weight === 30) {
      return rate.from_30_to_50 || 0;
    } else if (weight > 30 && weight < 50) {
      return rate.from_30_to_50 || 0;
    } else if (weight === 50) {
      return rate.from_50_to_100 || 0;
    } else if (weight > 50 && weight <= 100) {
      return rate.from_50_to_100 || 0;
    }

    return 0; // Default fallback
  };

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      if (section === 'packages' && index !== null) {
        const newPackages = [...prev.packages];
        // Always ensure manufacturingCountryCode is 'NP' for Nepal
        if (field === 'manufacturingCountryCode') {
          newPackages[index] = { ...newPackages[index], [field]: 'NP' };
        } else {
          newPackages[index] = { ...newPackages[index], [field]: value };
        }
        const totalDeclaredValue = newPackages.reduce((total, pkg) => total + (parseFloat(pkg.declaredValue) || 0), 0);

        const lineItems = newPackages.map((pkg, i) => ({
          number: i + 1,
          description: pkg.description,
          price: pkg.declaredValue,
          priceCurrency: prev.declaredValueCurrency,
          quantity: {
            value: pkg.quantity,
            unitOfMeasurement: 'PCS'
          },
          commodityCode: pkg.commodityCode,
          manufacturingCountryCode: pkg.manufacturingCountryCode,
          weight: {
            netValue: pkg.weight,
            grossValue: pkg.weight
          }
        }));

        return {
          ...prev,
          packages: newPackages,
          declaredValue: totalDeclaredValue,
          exportDeclaration: {
            ...prev.exportDeclaration,
            lineItems: lineItems
          }
        };
      } else if (section) {
        return { ...prev, [section]: { ...prev[section], [field]: value } };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  // Handle branch search input changes
  const handleBranchSearchChange = (value) => {
    setBranchSearchTerm(value);
    setShowBranchDropdown(true);
    handleInputChange('destinationAddress', 'cityName', value);
  };

  // Handle branch selection from dropdown
  const handleBranchSelect = (branch) => {
    setBranchSearchTerm(branch.name);
    setShowBranchDropdown(false);
    handleInputChange('destinationAddress', 'cityName', branch.name);
  };

  // Handle input focus and blur for dropdown visibility
  const handleBranchInputFocus = () => {
    setShowBranchDropdown(true);
  };

  const handleBranchInputBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => setShowBranchDropdown(false), 200);
  };

  const isFormValid = () => {
    const { destinationAddress, serviceType, recipient } = formData;

    // Check destination address fields
    const countryValid = destinationAddress.countryCode && destinationAddress.countryCode.trim() !== '';
    const cityValid = destinationAddress.cityName && destinationAddress.cityName.trim() !== '';
    const streetValid = destinationAddress.addressLine1 && destinationAddress.addressLine1.trim() !== '';

    const actualCountryCode = getActualCountryCode(destinationAddress.countryCode);

    // Postal code is required for non-Nepal destinations (input is hidden for NP)
    const postalCodeValid = actualCountryCode === 'NP' || (destinationAddress.postalCode && destinationAddress.postalCode.trim() !== '');

    // Check recipient details
    const nameValid = recipient.fullName && recipient.fullName.trim() !== '';
    const emailValid = recipient.email && recipient.email.trim() !== '';
    const phoneValid = recipient.phone && recipient.phone.trim() !== '';

    const serviceTypeValid = actualCountryCode === 'NP' || (serviceType && serviceType.trim() !== '');

    // Require custom height inches input only when "Yes" is selected
    const heightValid = customHeightOption === 'Yes'
      ? (recipient.height && String(recipient.height).trim() !== '')
      : true;

    return countryValid && cityValid && streetValid && postalCodeValid && nameValid && emailValid && phoneValid && serviceTypeValid && heightValid;
  };

  const getRates = async () => {
    try {
      // Get country code and service type from form
      const actualCountryCode = getActualCountryCode(formData.destinationAddress.countryCode);
      const selectedServiceType = formData.serviceType || 'Economy';

      // Calculate total weight from packages
      const totalWeight = formData.packages.reduce((total, pkg) => {
        return total + (parseFloat(pkg.weight) || 0) * (parseInt(pkg.quantity) || 1);
      }, 0);

      console.log('Getting rates for:', {
        countryCode: actualCountryCode,
        serviceType: selectedServiceType,
        totalWeight: totalWeight
      });

      // Check if destination is Nepal - use NCM rates
      if (actualCountryCode === 'NP') {
        console.log('Using NCM rates for Nepal delivery');
        await getNCMRates();
      } else {
        // Use the shipping rates API for international destinations
        await fetchShippingRates(actualCountryCode, selectedServiceType, totalWeight);
      }

    } catch (error) {
      console.error('Error in getRates:', error);
      setDhlError('Failed to get shipping rates');
    }
  };

  const createShipment = async () => {
    try {
      setDhlLoading(true);
      setDhlError('');
      const response = await axios.post('/api/dhl/shipments', formData);
      setShipment(response.data);
      if (onShipmentCreated && response.data.success) {
        onShipmentCreated({
          trackingNumber: response.data.data.shipmentTrackingNumber,
          shippingCharge: selectedRate,
          documents: response.data.data.documents
        });
      }
    } catch (error) {
      setDhlError(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setDhlLoading(false);
    }
  };

  const downloadPdf = (base64Content, fileName) => {
    try {
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Global overrides for smaller, minimal design */
        div[style*="padding: 1rem"] {
          padding: 10px !important;
        }
        
        input, select, textarea {
          padding: 10px !important;
          font-size: 12px !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 8px !important;
        }
        
        label {
          font-size: 12px !important;
          color: #757575 !important;
          margin-bottom: 6px !important;
        }
        
        h2, h3, h4 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #424242 !important;
          margin-bottom: 10px !important;
        }
        
        button {
          padding: 10px 16px !important;
          font-size: 12px !important;
        }
      `}</style>
      <div style={{
        background: '#ffffff',
        padding: '14px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        border: '1px solid #e0e0e0',
        position: 'relative'
      }}>
        <div style={{ position: 'relative' }}>
          {/* Header */}
          {/* Shipping Header Removed */}

          <div>
            {dhlError && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'linear-gradient(45deg, #fef2f2, #fee2e2)',
                border: '1px solid #fecaca',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  flexShrink: 0,
                  width: '2rem',
                  height: '2rem',
                  background: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  ❌
                </div>
                <div>
                  <strong style={{ fontWeight: 600, color: '#991b1b' }}>Error:</strong>
                  <span style={{ color: '#b91c1c', marginLeft: '0.5rem' }}>{dhlError}</span>
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : (window.innerWidth >= 1024 ? '1fr 1fr' : '1fr'),
                gap: isMobile ? '1rem' : '2rem',
                width: '100%'
              }}
            >
              {/* Destination Address */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '1rem' : '1.5rem',
                  width: '100%'
                }}
              >
                {/* Destination Address Header Removed */}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '0.75rem' : '1rem',
                    width: '100%'
                  }}
                >
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#757575',
                      marginBottom: '6px'
                    }}>
                      Country *
                    </label>
                    <select
                      value={formData.destinationAddress.countryCode}
                      onChange={(e) => {
                        const selectedUniqueId = e.target.value;
                        const selectedCountry = countries.find(country => country.uniqueId === selectedUniqueId);
                        const actualCountryCode = selectedCountry ? selectedCountry.code : selectedUniqueId;

                        handleInputChange('destinationAddress', 'countryCode', selectedUniqueId);
                        handleInputChange('destinationAddress', 'cityName', '');
                        handleInputChange('destinationAddress', 'postalCode', '');
                        const callingCode = countryCallingCodes[actualCountryCode] || '';
                        handleInputChange('recipient', 'countryCode', callingCode);
                        loadServiceTypes(actualCountryCode, selectedUniqueId);
                      }}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        fontSize: '1rem',
                        background: 'white',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s'
                      }}
                      required
                      onFocus={(e) => e.target.style.borderColor = '#eab308'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="">Select Country</option>
                      {loadingCountries ? (
                        <option disabled>Loading countries...</option>
                      ) : (
                        countries.map((country, index) => (
                          <option key={`${country.uniqueId}-${index}`} value={country.uniqueId}>
                            {country.name}
                          </option>
                        ))
                      )}
                    </select>
                    {countriesError && (
                      <div style={{
                        color: '#dc2626',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem'
                      }}>
                        {countriesError}
                      </div>
                    )}
                  </div>

                  {getActualCountryCode(formData.destinationAddress.countryCode) !== 'NP' && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#757575',
                        marginBottom: '6px'
                      }}>
                        Service Type *
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => handleInputChange('', 'serviceType', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          background: 'white',
                          height: '42px',
                          boxSizing: 'border-box'
                        }}
                        required
                        disabled={loadingServiceTypes || availableServiceTypes.length === 1}
                        onFocus={(e) => e.target.style.borderColor = '#eab308'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      >
                        {loadingServiceTypes ? (
                          <option value="">Loading service types...</option>
                        ) : availableServiceTypes.length === 1 ? (
                          availableServiceTypes[0] === 'Economy' ? (
                            <option value="Economy">Economy (Express Not Available) - Auto Selected</option>
                          ) : (
                            <option value="Express">Express (Economy Not Available) - Auto Selected</option>
                          )
                        ) : (
                          availableServiceTypes.map((serviceType) => (
                            <option key={serviceType} value={serviceType}>
                              {serviceType}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  )}

                  {getActualCountryCode(formData.destinationAddress.countryCode) === 'NP' ? (
                    <div style={{ position: 'relative' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#757575',
                        marginBottom: '6px'
                      }}>
                        Destination Branch *
                      </label>
                      <input
                        type="text"
                        placeholder={loadingBranches ? 'Loading branches...' : 'Type to search branches...'}
                        value={branchSearchTerm}
                        onChange={(e) => handleBranchSearchChange(e.target.value)}
                        onFocus={handleBranchInputFocus}
                        onBlur={handleBranchInputBlur}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          background: 'white',
                          boxShadow: 'none',
                          transition: 'all 0.2s',
                          height: '42px',
                          boxSizing: 'border-box'
                        }}
                        required
                        disabled={loadingBranches}
                      />
                      {/* Dropdown for filtered branches */}
                      {showBranchDropdown && filteredBranches.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '2px solid #e5e7eb',
                          borderTop: 'none',
                          borderRadius: '0 0 0.75rem 0.75rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 1000
                        }}>
                          {filteredBranches.map((branch, index) => (
                            <div
                              key={index}
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur
                                handleBranchSelect(branch);
                              }}
                              style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                borderBottom: index < filteredBranches.length - 1 ? '1px solid #f3f4f6' : 'none',
                                transition: 'background-color 0.2s',
                                fontSize: '13px'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              <div style={{ fontWeight: 600, color: '#1f2937' }}>{branch.name}</div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {branch.district}, {branch.region.split(' - ')[1] || branch.region}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Show message when no branches match search */}
                      {showBranchDropdown && branchSearchTerm && filteredBranches.length === 0 && branches.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '2px solid #e5e7eb',
                          borderTop: 'none',
                          borderRadius: '0 0 0.75rem 0.75rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          padding: '1rem',
                          textAlign: 'center',
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          zIndex: 1000
                        }}>
                          No branches found matching "{branchSearchTerm}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#757575',
                        marginBottom: '6px'
                      }}>
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter city name"
                        value={formData.destinationAddress.cityName}
                        onChange={(e) => handleInputChange('destinationAddress', 'cityName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          background: 'white',
                          height: '42px',
                          boxSizing: 'border-box'
                        }}
                        required
                        onFocus={(e) => e.target.style.borderColor = '#eab308'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#757575',
                      marginBottom: '6px'
                    }}>
                      Street Address *
                    </label>
                    <input
                      type="text"
                      placeholder="Street address, house no..."
                      value={formData.destinationAddress.addressLine1}
                      onChange={(e) => handleInputChange('destinationAddress', 'addressLine1', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        background: 'white',
                        height: '42px',
                        boxSizing: 'border-box'
                      }}
                      required
                      onFocus={(e) => e.target.style.borderColor = '#eab308'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  {formData.destinationAddress.countryCode !== 'NP' && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#757575',
                        marginBottom: '6px'
                      }}>
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        placeholder="Postal/ZIP code"
                        value={formData.destinationAddress.postalCode}
                        onChange={(e) => handleInputChange('destinationAddress', 'postalCode', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          background: 'white',
                          height: '42px',
                          boxSizing: 'border-box'
                        }}
                        required
                        onFocus={(e) => e.target.style.borderColor = '#eab308'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient Details */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '1rem' : '1.5rem',
                  width: '100%'
                }}
              >
                {/* Recipient Details Header Removed */}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '0.75rem' : '1rem',
                    width: '100%'
                  }}
                >
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#757575',
                      marginBottom: '6px'
                    }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Recipient's full name"
                      value={formData.recipient.fullName}
                      onChange={(e) => handleInputChange('recipient', 'fullName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        height: '42px',
                        boxSizing: 'border-box'
                      }}
                      required
                      onFocus={(e) => e.target.style.borderColor = '#eab308'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#757575',
                      marginBottom: '6px'
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={formData.recipient.email}
                      onChange={(e) => handleInputChange('recipient', 'email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        height: '42px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#757575',
                      marginBottom: '6px'
                    }}>
                      Phone *
                    </label>
                    <div style={{
                      display: 'flex',
                      width: '100%',
                      height: '42px',
                      boxSizing: 'border-box',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: 'white'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        background: '#f5f5f5',
                        borderRight: '1px solid #e0e0e0',
                        fontSize: '13px',
                        color: '#757575',
                        fontWeight: 500,
                        height: '100%'
                      }}>
                        {getCountryCallingCode(formData.destinationAddress.countryCode)}
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={formData.recipient.phone}
                        onChange={(e) => handleInputChange('recipient', 'phone', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          border: 'none',
                          fontSize: '13px',
                          height: '100%',
                          outline: 'none',
                          color: '#424242'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#757575',
                      marginBottom: '6px'
                    }}>
                      Want custom height?
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="customHeightOption"
                          value="Yes"
                          checked={customHeightOption === 'Yes'}
                          onChange={() => { setCustomHeightOption('Yes'); handleInputChange('recipient', 'height', ''); }}
                        />
                        <span>Yes</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="customHeightOption"
                          value="No"
                          checked={customHeightOption === 'No'}
                          onChange={() => { setCustomHeightOption('No'); handleInputChange('recipient', 'height', 'No'); }}
                        />
                        <span>No</span>
                      </label>
                    </div>
                    {customHeightOption === 'Yes' ? (
                      <input
                        type="text"
                        placeholder="Enter height in inches"
                        value={formData.recipient.height === 'No' ? '' : formData.recipient.height}
                        onChange={(e) => handleInputChange('recipient', 'height', e.target.value)}
                        style={{
                          width: '100%',
                          fontSize: isMobile ? '1rem' : '1rem',
                          minWidth: 0,
                          padding: '0.5rem 0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          fontSize: '1rem',
                          background: 'white',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s',
                          lineHeight: '42px',
                          minHeight: '42px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#eab308'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        required
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              {!isFormValid() && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '10px',
                  background: '#fff3cd',
                  border: '1px solid #ffeeba',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#856404', fontSize: '12px', fontWeight: 600 }}>⚠</span>
                  <span style={{ color: '#856404', fontWeight: 500, fontSize: '12px' }}>
                    Please fill in all required fields to proceed
                  </span>
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : (window.innerWidth >= 640 ? 'row' : 'column'),
                gap: isMobile ? '0.75rem' : '1rem',
                width: '100%'
              }}>
                <button
                  onClick={getRates}
                  disabled={!isFormValid() || dhlLoading}
                  className="skiper-button"
                  style={{
                    flex: 1,
                    width: isMobile ? '100%' : undefined,
                    minWidth: 0,
                    position: 'relative',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    border: 'none',
                    cursor: !isFormValid() || dhlLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: !isFormValid() || dhlLoading ? '#e0e0e0' : '#424242',
                    color: !isFormValid() || dhlLoading ? '#9e9e9e' : 'white',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    if (isFormValid() && !dhlLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 66, 66, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {dhlLoading ? 'Getting Rates...' : 'Get Shipping Rates'}
                  {!dhlLoading && isFormValid() && (
                    <svg
                      style={{
                        width: '14px',
                        height: '14px',
                        transition: 'transform 0.3s ease',
                      }}
                      fill="none"
                      viewBox="0 0 10 10"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Display Shipping Rates */}
              {shippingRates && shippingRates.length > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '14px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  boxShadow: 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#424242',
                      margin: 0
                    }}>
                      Available Shipping Rates
                    </h3>
                  </div>

                  {shippingRates.map((rate, index) => {
                    const totalWeight = formData.packages.reduce((total, pkg) => {
                      return total + (parseFloat(pkg.weight) || 0) * (parseInt(pkg.quantity) || 1);
                    }, 0);
                    const shippingCost = calculateShippingCost(rate, totalWeight);

                    return (
                      <div key={index} style={{
                        padding: '1rem',
                        background: 'white',
                        borderRadius: '0.75rem',
                        border: '1px solid #e0f2fe',
                        marginBottom: index < shippingRates.length - 1 ? '1rem' : '0',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <div>
                            <h4 style={{
                              fontSize: '1.125rem',
                              fontWeight: 600,
                              color: '#0c4a6e',
                              margin: '0 0 0.25rem 0'
                            }}>
                              {rate.service_type}
                            </h4>
                            <p style={{
                              fontSize: '0.875rem',
                              color: '#64748b',
                              margin: 0
                            }}>
                              Weight: {totalWeight}kg • Country: {rate.country_code}
                            </p>
                          </div>
                          <div style={{
                            textAlign: 'right'
                          }}>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: 700,
                              color: '#0ea5e9'
                            }}>
                              {(() => {
                                const costInfo = formatShippingCost(shippingCost);
                                return costInfo.formatted;
                              })()}
                            </div>

                            <div style={{
                              fontSize: '0.75rem',
                              color: '#64748b'
                            }}>
                              Weight limit: {rate.weight_limit}kg
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Loading state for shipping rates */}
              {loadingShippingRates && (
                <div style={{
                  marginTop: '16px',
                  padding: '14px',
                  textAlign: 'center',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#757575'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #e0e0e0',
                      borderTop: '2px solid #424242',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Fetching shipping rates...
                  </div>
                </div>
              )}

              {/* Error state for shipping rates */}
              {shippingRatesError && (
                <div style={{
                  marginTop: '16px',
                  padding: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>✕</span>
                  <div>
                    <strong style={{ fontWeight: 600, color: '#991b1b', fontSize: '12px' }}>Error:</strong>
                    <span style={{ color: '#b91c1c', marginLeft: '4px', fontSize: '12px' }}>{shippingRatesError}</span>
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : (window.innerWidth >= 640 ? 'row' : 'column'),
                gap: isMobile ? '0.75rem' : '1rem',
                width: '100%',
                marginTop: '2rem'
              }}>
                {rates && rates.length > 0 && (
                  <button
                    onClick={createShipment}
                    style={{
                      flex: 1,
                      width: isMobile ? '100%' : undefined,
                      minWidth: 0,
                      position: 'relative',
                      overflow: 'hidden',
                      padding: '1rem 2rem',
                      borderRadius: '1rem',
                      fontWeight: 600,
                      fontSize: '1.125rem',
                      transition: 'all 0.3s',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      background: 'linear-gradient(45deg, #10b981, #059669)',
                      color: 'white'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                      e.target.style.background = 'linear-gradient(45deg, #059669, #047857)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      e.target.style.background = 'linear-gradient(45deg, #10b981, #059669)';
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>🚀</span>
                    Create Shipment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DHLShippingForm;