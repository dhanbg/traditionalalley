import { useState, useCallback } from 'react';
import axios from 'axios';

export const useDHL = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleRequest = useCallback(async (requestFn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestFn();
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRates = useCallback(async (rateRequest) => {
    return handleRequest(async () => {
      const response = await axios.post('/api/dhl/rates', rateRequest);
      return response.data.data;
    });
  }, [handleRequest]);

  const createShipment = useCallback(async (shipmentData) => {
    return handleRequest(async () => {
      const response = await axios.post('/api/dhl/shipments', shipmentData);
      return response.data.data;
    });
  }, [handleRequest]);

  const trackShipment = useCallback(async (trackingNumber) => {
    return handleRequest(async () => {
      const response = await axios.get(`/api/dhl/tracking?trackingNumber=${trackingNumber}`);
      return response.data.data;
    });
  }, [handleRequest]);

  const trackMultipleShipments = useCallback(async (trackingNumbers) => {
    return handleRequest(async () => {
      const response = await axios.post('/api/dhl/tracking', { trackingNumbers });
      return response.data.data;
    });
  }, [handleRequest]);

  const schedulePickup = useCallback(async (pickupData) => {
    return handleRequest(async () => {
      const response = await axios.post('/api/dhl/pickups', pickupData);
      return response.data.data;
    });
  }, [handleRequest]);

  const getPickupTimes = useCallback(async (pickupRequest) => {
    return handleRequest(async () => {
      const { postalCode, cityName, countryCode, addressLine1, plannedPickupDate } = pickupRequest;
      const params = new URLSearchParams({
        postalCode,
        cityName,
        countryCode,
        addressLine1,
        plannedPickupDate
      });
      const response = await axios.get(`/api/dhl/pickups?${params}`);
      return response.data.data;
    });
  }, [handleRequest]);

  const validateAddress = useCallback(async (address) => {
    return handleRequest(async () => {
      const { countryCode, postalCode, cityName } = address;
      const params = new URLSearchParams({
        type: 'address',
        countryCode,
        postalCode,
        cityName
      });
      const response = await axios.get(`/api/dhl/capabilities?${params}`);
      return response.data.data;
    });
  }, [handleRequest]);

  const getRouteCapabilities = useCallback(async (routeRequest) => {
    return handleRequest(async () => {
      const {
        originCountryCode,
        originPostalCode,
        originCityName,
        destinationCountryCode,
        destinationPostalCode,
        destinationCityName
      } = routeRequest;
      
      const params = new URLSearchParams({
        type: 'route',
        originCountryCode,
        originPostalCode,
        originCityName,
        destinationCountryCode,
        destinationPostalCode,
        destinationCityName
      });
      
      const response = await axios.get(`/api/dhl/capabilities?${params}`);
      return response.data.data;
    });
  }, [handleRequest]);

  const getLandedCost = useCallback(async (landedCostRequest) => {
    return handleRequest(async () => {
      const response = await axios.post('/api/dhl/landed-cost', landedCostRequest);
      return response.data.data;
    });
  }, [handleRequest]);

  return {
    loading,
    error,
    clearError,
    getRates,
    createShipment,
    trackShipment,
    trackMultipleShipments,
    schedulePickup,
    getPickupTimes,
    validateAddress,
    getRouteCapabilities,
    getLandedCost
  };
}; 