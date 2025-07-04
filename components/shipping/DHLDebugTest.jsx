'use client';

import { useState } from 'react';
import axios from 'axios';

const DHLDebugTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testDHLAPI = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      console.log('Testing DHL API...');
      
      const response = await axios.post('/api/dhl/debug', {
        test: 'minimal-rates-request'
      });
      
      console.log('DHL API Response:', response.data);
      setResult(response.data);
      
    } catch (err) {
      console.error('DHL API Error:', err);
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const testRatesAPI = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      console.log('Testing Rates API...');
      
      const testData = {
        plannedShippingDate: '2025-06-15',
        originAddress: {
          postalCode: '44600',
          cityName: 'Kathmandu',
          countryCode: 'NP',
          addressLine1: 'Test Address'
        },
        destinationAddress: {
          postalCode: '2000',
          cityName: 'Sydney',
          countryCode: 'AU',
          addressLine1: 'Test Destination'
        },
        packages: [{
          weight: 1,
          length: 10,
          width: 10,
          height: 10,
          description: 'Test Package',
          declaredValue: 0,
          quantity: 1
        }],
        isCustomsDeclarable: false
      };
      
      console.log('Sending test data:', testData);
      
      const response = await axios.post('/api/dhl/rates', testData);
      
      console.log('Rates API Response:', response.data);
      setResult(response.data);
      
    } catch (err) {
      console.error('Rates API Error:', err);
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await axios.get('/api/dhl/debug');
      console.log('Config check:', response.data);
      setResult(response.data);
    } catch (err) {
      console.error('Config check error:', err);
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        DHL API Debug Test
      </h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={checkConfig}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Configuration'}
        </button>

        <button
          onClick={testDHLAPI}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test DHL API Direct'}
        </button>

        <button
          onClick={testRatesAPI}
          disabled={loading}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Rates API'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Error:</h3>
          <pre className="whitespace-pre-wrap text-sm mt-2">
            {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm mt-2">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Debug Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li><strong>Check Configuration</strong> - Verify environment variables are loaded</li>
          <li><strong>Test DHL API Direct</strong> - Test minimal request directly to DHL</li>
          <li><strong>Test Rates API</strong> - Test through our rates endpoint</li>
        </ol>
        <p className="mt-2 text-sm text-gray-600">
          Open browser console (F12) to see detailed logs.
        </p>
      </div>
    </div>
  );
};

export default DHLDebugTest; 