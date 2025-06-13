import { useState, useCallback } from 'react';
import axios from 'axios';

export const useDHL = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get shipping rates
  const getRates = useCallback(async (rateParams) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...rateParams,
        weight: rateParams.weight?.toString(),
        length: rateParams.length?.toString(),
        width: rateParams.width?.toString(),
        height: rateParams.height?.toString(),
        isCustomsDeclarable: rateParams.isCustomsDeclarable?.toString()
      });

      const response = await axios.get(`/api/dhl/rates?${params}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get rates';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get multi-piece rates
  const getMultiPieceRates = useCallback(async (shipmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/dhl/rates', shipmentData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get multi-piece rates';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Track shipment
  const trackShipment = useCallback(async (trackingNumber, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        trackingNumber,
        ...options
      });

      const response = await axios.get(`/api/dhl/tracking?${params}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to track shipment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Track multiple shipments
  const trackMultipleShipments = useCallback(async (trackingNumbers, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        trackingNumbers: Array.isArray(trackingNumbers) ? trackingNumbers.join(',') : trackingNumbers,
        ...options
      });

      const response = await axios.get(`/api/dhl/tracking?${params}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to track shipments';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create shipment
  const createShipment = useCallback(async (shipmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/dhl/shipments', shipmentData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create shipment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate landed cost
  const getLandedCost = useCallback(async (landedCostData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/dhl/landed-cost', landedCostData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to calculate landed cost';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create pickup request
  const createPickupRequest = useCallback(async (pickupData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/dhl/pickups', pickupData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create pickup request';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update pickup request
  const updatePickupRequest = useCallback(async (pickupRequestId, pickupData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.patch(`/api/dhl/pickups?pickupRequestId=${pickupRequestId}`, pickupData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update pickup request';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel pickup request
  const cancelPickupRequest = useCallback(async (pickupRequestId, cancelTime) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        pickupRequestId,
        cancelTime: cancelTime || new Date().toISOString()
      });

      const response = await axios.delete(`/api/dhl/pickups?${params}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to cancel pickup request';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get proof of delivery
  const getProofOfDelivery = useCallback(async (shipmentTrackingNumber, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        shipmentTrackingNumber,
        documentType: 'proof-of-delivery',
        ...options
      });

      const response = await axios.get(`/api/dhl/documents?${params}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get proof of delivery';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get shipment image/document
  const getShipmentImage = useCallback(async (shipmentTrackingNumber, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        shipmentTrackingNumber,
        documentType: 'image',
        ...options
      });

      const response = await axios.get(`/api/dhl/documents?${params}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get shipment image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload commercial invoice
  const uploadCommercialInvoice = useCallback(async (shipmentTrackingNumber, invoiceData) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        shipmentTrackingNumber,
        uploadType: 'commercial-invoice'
      });

      const response = await axios.patch(`/api/dhl/documents?${params}`, invoiceData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upload commercial invoice';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate pickup/delivery capabilities
  const validateCapabilities = useCallback(async (capabilityParams) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(capabilityParams);

      const response = await axios.get(`/api/dhl/capabilities?${params}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to validate capabilities';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Utility function to create shipment payload
  const createShipmentPayload = useCallback((shipmentDetails) => {
    const {
      plannedShippingDate,
      originAddress,
      destinationAddress,
      packages,
      shipper,
      recipient,
      productCode = 'P',
      isCustomsDeclarable = false,
      customerReferences = [],
      valueAddedServices = []
    } = shipmentDetails;

    return {
      plannedShippingDateAndTime: plannedShippingDate,
      pickup: { isRequested: false },
      productCode,
      getRateEstimates: false,
      accounts: [{ typeCode: 'shipper', number: process.env.NEXT_PUBLIC_DHL_ACCOUNT_NUMBER }],
      customerDetails: {
        shipperDetails: {
          postalAddress: originAddress,
          contactInformation: shipper
        },
        receiverDetails: {
          postalAddress: destinationAddress,
          contactInformation: recipient
        }
      },
      content: {
        packages: packages.map(pkg => ({
          typeCode: pkg.typeCode || '2BP',
          weight: parseFloat(pkg.weight),
          dimensions: {
            length: parseFloat(pkg.length),
            width: parseFloat(pkg.width),
            height: parseFloat(pkg.height)
          }
        })),
        isCustomsDeclarable,
        declaredValue: packages.reduce((sum, pkg) => sum + parseFloat(pkg.declaredValue || 0), 0),
        declaredValueCurrency: 'USD',
        exportDeclaration: isCustomsDeclarable ? {
          lineItems: packages.map(pkg => ({
            number: 1,
            description: pkg.description || 'General goods',
            price: parseFloat(pkg.declaredValue || 0),
            quantity: { value: pkg.quantity || 1, unitOfMeasurement: 'PCS' },
            commodityCodes: [{ typeCode: 'outbound', value: pkg.commodityCode || '999999' }],
            exportReasonType: 'permanent',
            manufacturerCountry: 'NP',
            weight: { netValue: parseFloat(pkg.weight), grossValue: parseFloat(pkg.weight) }
          }))
        } : undefined
      },
      customerReferences,
      valueAddedServices,
      outputImageProperties: {
        imageOptions: [{
          typeCode: 'waybillDoc',
          templateName: 'ARCH_8X4_A4_PDF',
          isRequested: true
        }],
        splitTransportAndWaybillDocLabels: false
      }
    };
  }, []);

  // Test tracking numbers for demo
  const getTestTrackingNumbers = useCallback(() => {
    return [
      '9356579890', '4818240420', '5584773180', '5786694550', '2449648740',
      '5980622760', '5980622970', '5980623180', '5980770460', '6781059250',
      '9077880070', '5786694760', '7957673080', '5786696720', '8066924740'
    ];
  }, []);

  return {
    loading,
    error,
    clearError,
    getRates,
    getMultiPieceRates,
    trackShipment,
    trackMultipleShipments,
    createShipment,
    getLandedCost,
    createPickupRequest,
    updatePickupRequest,
    cancelPickupRequest,
    getProofOfDelivery,
    getShipmentImage,
    uploadCommercialInvoice,
    validateCapabilities,
    createShipmentPayload,
    getTestTrackingNumbers
  };
}; 