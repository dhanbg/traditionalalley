import { useState, useCallback } from 'react';
import axios from 'axios';

export const useDHL = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (endpoint, method = 'POST', data = null, params = null) => {
    setLoading(true);
    setError(null);

    try {
      const config = {
        method,
        url: `/api/dhl${endpoint}`,
        ...(data && { data }),
        ...(params && { params })
      };

      const response = await axios(config);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get shipping rates
  const getRates = useCallback(async (rateData) => {
    return await apiCall('/rates', 'POST', rateData);
  }, [apiCall]);

  // Create shipment
  const createShipment = useCallback(async (shipmentData) => {
    return await apiCall('/shipments', 'POST', shipmentData);
  }, [apiCall]);

  // Track single shipment
  const trackShipment = useCallback(async (trackingNumber) => {
    return await apiCall('/tracking', 'GET', null, { trackingNumber });
  }, [apiCall]);

  // Track multiple shipments
  const trackMultipleShipments = useCallback(async (trackingNumbers) => {
    return await apiCall('/tracking', 'POST', { trackingNumbers });
  }, [apiCall]);

  // Get landed cost
  const getLandedCost = useCallback(async (landedCostData) => {
    return await apiCall('/landed-cost', 'POST', landedCostData);
  }, [apiCall]);

  // Request pickup
  const requestPickup = useCallback(async (pickupData) => {
    return await apiCall('/pickups', 'POST', pickupData);
  }, [apiCall]);

  // Validate single address
  const validateAddress = useCallback(async (countryCode, cityName, postalCode = '') => {
    return await apiCall('/capabilities', 'GET', null, { countryCode, cityName, postalCode });
  }, [apiCall]);

  // Validate multiple addresses
  const validateMultipleAddresses = useCallback(async (addresses) => {
    return await apiCall('/capabilities', 'POST', { addresses });
  }, [apiCall]);

  // Get API documentation
  const getApiInfo = useCallback(async () => {
    return await apiCall('', 'GET');
  }, [apiCall]);

  return {
    loading,
    error,
    getRates,
    createShipment,
    trackShipment,
    trackMultipleShipments,
    getLandedCost,
    requestPickup,
    validateAddress,
    validateMultipleAddresses,
    getApiInfo
  };
};

// Helper functions for common use cases
export const dhlHelpers = {
  // Format address for DHL API
  formatAddress: (address) => ({
    countryCode: address.countryCode?.toUpperCase(),
    cityName: address.cityName,
    postalCode: address.postalCode || '',
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || '',
    addressLine3: address.addressLine3 || ''
  }),

  // Format contact information
  formatContact: (contact) => ({
    fullName: contact.fullName,
    email: contact.email,
    phone: contact.phone,
    companyName: contact.companyName || ''
  }),

  // Format package information
  formatPackage: (pkg) => ({
    weight: parseFloat(pkg.weight),
    length: parseFloat(pkg.length),
    width: parseFloat(pkg.width),
    height: parseFloat(pkg.height),
    description: pkg.description,
    declaredValue: parseFloat(pkg.declaredValue || 0),
    quantity: parseInt(pkg.quantity || 1),
    hsCode: pkg.hsCode || '999999'
  }),

  // Validate required fields for rates
  validateRateRequest: (data) => {
    const errors = [];
    
    if (!data.originAddress) errors.push('Origin address is required');
    if (!data.destinationAddress) errors.push('Destination address is required');
    if (!data.packages || !Array.isArray(data.packages) || data.packages.length === 0) {
      errors.push('At least one package is required');
    }
    if (!data.plannedShippingDate) errors.push('Planned shipping date is required');

    // Validate addresses
    ['originAddress', 'destinationAddress'].forEach(addressType => {
      if (data[addressType]) {
        if (!data[addressType].countryCode) errors.push(`${addressType} country code is required`);
        if (!data[addressType].cityName) errors.push(`${addressType} city name is required`);
        if (!data[addressType].postalCode) errors.push(`${addressType} postal code is required`);
      }
    });

    // Validate packages
    if (data.packages && Array.isArray(data.packages)) {
      data.packages.forEach((pkg, index) => {
        if (!pkg.weight || pkg.weight <= 0) errors.push(`Package ${index + 1}: weight is required and must be greater than 0`);
        if (!pkg.length || pkg.length <= 0) errors.push(`Package ${index + 1}: length is required and must be greater than 0`);
        if (!pkg.width || pkg.width <= 0) errors.push(`Package ${index + 1}: width is required and must be greater than 0`);
        if (!pkg.height || pkg.height <= 0) errors.push(`Package ${index + 1}: height is required and must be greater than 0`);
      });
    }

    return errors;
  },

  // Validate required fields for shipment
  validateShipmentRequest: (data) => {
    const errors = dhlHelpers.validateRateRequest(data);
    
    if (!data.shipper) errors.push('Shipper information is required');
    if (!data.recipient) errors.push('Recipient information is required');

    // Validate contact information
    ['shipper', 'recipient'].forEach(contactType => {
      if (data[contactType]) {
        if (!data[contactType].fullName) errors.push(`${contactType} full name is required`);
        if (!data[contactType].email) errors.push(`${contactType} email is required`);
        if (!data[contactType].phone) errors.push(`${contactType} phone is required`);
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data[contactType].email && !emailRegex.test(data[contactType].email)) {
          errors.push(`${contactType} email format is invalid`);
        }
      }
    });

    // Validate packages have descriptions for shipments
    if (data.packages && Array.isArray(data.packages)) {
      data.packages.forEach((pkg, index) => {
        if (!pkg.description) errors.push(`Package ${index + 1}: description is required for shipments`);
      });
    }

    return errors;
  },

  // Format date for DHL API
  formatDate: (date) => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    if (typeof date === 'string') {
      return new Date(date).toISOString().split('T')[0];
    }
    return date;
  },

  // Get tomorrow's date (minimum for shipping)
  getTomorrowDate: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },

  // Common product codes
  productCodes: {
    'P': 'DHL Express Worldwide',
    'U': 'DHL Express Worldwide (Documents)',
    'D': 'DHL Express 9:00',
    'T': 'DHL Express 10:30',
    'E': 'DHL Express 12:00',
    'Y': 'DHL Express Envelope',
    'H': 'DHL Economy Select'
  },

  // Common country codes for Nepal region
  countryCodes: {
    'NP': 'Nepal',
    'IN': 'India',
    'CN': 'China',
    'US': 'United States',
    'AU': 'Australia',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'JP': 'Japan',
    'SG': 'Singapore',
    'HK': 'Hong Kong'
  }
};

export default useDHL; 