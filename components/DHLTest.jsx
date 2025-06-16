import React, { useState } from 'react';
import { useDHL, dhlHelpers } from '../hooks/useDHL';

const DHLTest = () => {
  const { 
    loading, 
    error, 
    getRates, 
    createShipment, 
    trackShipment,
    validateAddress,
    getApiInfo 
  } = useDHL();

  const [results, setResults] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  // Sample data for testing
  const sampleRateData = {
    originAddress: {
      countryCode: 'NP',
      cityName: 'Kathmandu',
      postalCode: '44600',
      addressLine1: 'Traditional Alley Store, Thamel'
    },
    destinationAddress: {
      countryCode: 'AU',
      cityName: 'Sydney',
      postalCode: '2000',
      addressLine1: '123 Test Street'
    },
    packages: [{
      weight: 1.5,
      length: 20,
      width: 15,
      height: 10,
      description: 'Traditional Handicrafts',
      declaredValue: 100
    }],
    plannedShippingDate: dhlHelpers.getTomorrowDate(),
    isCustomsDeclarable: true
  };

  const sampleShipmentData = {
    ...sampleRateData,
    shipper: {
      companyName: 'Traditional Alley Pvt. Ltd.',
      fullName: 'Traditional Alley Team',
      email: 'shipping@traditionalalley.com.np',
      phone: '+977-1-4444444'
    },
    recipient: {
      companyName: 'Test Recipient Company',
      fullName: 'Test Recipient',
      email: 'recipient@example.com',
      phone: '+61-2-9999999'
    },
    productCode: 'P',
    currency: 'USD'
  };

  const handleGetRates = async () => {
    try {
      const result = await getRates(sampleRateData);
      setResults({ type: 'rates', data: result });
    } catch (err) {
      console.error('Error getting rates:', err);
    }
  };

  const handleCreateShipment = async () => {
    try {
      const result = await createShipment(sampleShipmentData);
      setResults({ type: 'shipment', data: result });
    } catch (err) {
      console.error('Error creating shipment:', err);
    }
  };

  const handleTrackShipment = async () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }
    
    try {
      const result = await trackShipment(trackingNumber);
      setResults({ type: 'tracking', data: result });
    } catch (err) {
      console.error('Error tracking shipment:', err);
    }
  };

  const handleValidateAddress = async () => {
    try {
      const result = await validateAddress('NP', 'Kathmandu', '44600');
      setResults({ type: 'validation', data: result });
    } catch (err) {
      console.error('Error validating address:', err);
    }
  };

  const handleGetApiInfo = async () => {
    try {
      const result = await getApiInfo();
      setResults({ type: 'apiInfo', data: result });
    } catch (err) {
      console.error('Error getting API info:', err);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">DHL Express API Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleGetRates}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Shipping Rates'}
        </button>

        <button
          onClick={handleCreateShipment}
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Create Test Shipment'}
        </button>

        <button
          onClick={handleValidateAddress}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Validate Address'}
        </button>

        <button
          onClick={handleGetApiInfo}
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get API Info'}
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Track Shipment</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleTrackShipment}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Track'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            Results ({results.type})
          </h3>
          <pre className="bg-white p-4 rounded border overflow-auto max-h-96 text-sm">
            {JSON.stringify(results.data, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Sample Data Used</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-1">Rate Request:</h4>
            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(sampleRateData, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium mb-1">Shipment Request:</h4>
            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(sampleShipmentData, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Note:</strong> This is a test interface for the DHL Express MyDHL API integration.</p>
        <p>Current environment: <span className="font-mono bg-gray-200 px-1 rounded">{process.env.NODE_ENV}</span></p>
        <p>Make sure your DHL credentials are properly configured in the .env file.</p>
      </div>
    </div>
  );
};

export default DHLTest; 