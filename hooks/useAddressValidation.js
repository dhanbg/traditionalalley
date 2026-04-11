import { useState, useCallback } from 'react';

export const useAddressValidation = () => {
  const [validationState, setValidationState] = useState({
    isValidating: false,
    validationResult: null,
    error: null
  });

  const validateAddress = useCallback(async (addressData) => {
    const { type = 'delivery', countryCode, cityName, postalCode, addressLine1 } = addressData;

    if (!countryCode) {
      setValidationState({
        isValidating: false,
        validationResult: null,
        error: 'Country code is required for validation'
      });
      return null;
    }

    setValidationState({
      isValidating: true,
      validationResult: null,
      error: null
    });

    try {
      const params = new URLSearchParams({
        type,
        countryCode: countryCode.toUpperCase()
      });

      if (cityName) params.append('cityName', cityName);
      if (postalCode) params.append('postalCode', postalCode);
      if (addressLine1) params.append('addressLine1', addressLine1);

      const response = await fetch(`/api/dhl/address-validate?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        setValidationState({
          isValidating: false,
          validationResult: null,
          error: result.message || 'Address validation failed'
        });
        return null;
      }

      setValidationState({
        isValidating: false,
        validationResult: result,
        error: null
      });

      return result;

    } catch (error) {
      console.error('Address validation error:', error);
      setValidationState({
        isValidating: false,
        validationResult: null,
        error: 'Failed to validate address. Please try again.'
      });
      return null;
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationState({
      isValidating: false,
      validationResult: null,
      error: null
    });
  }, []);

  return {
    validateAddress,
    clearValidation,
    isValidating: validationState.isValidating,
    validationResult: validationState.validationResult,
    validationError: validationState.error,
    isAddressValid: validationState.validationResult?.isValid || false,
    serviceAvailable: validationState.validationResult?.serviceAvailable || false,
    validatedAddresses: validationState.validationResult?.validatedAddresses || [],
    warnings: validationState.validationResult?.warnings || [],
    enhancedInfo: validationState.validationResult?.enhancedInfo || null
  };
}; 