'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestDHLPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/dhl/test-rates');
      setResult(response.data);
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        details: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">DHL Express Worldwide Test</h1>
      
      <button 
        onClick={testRates}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test DHL Rates (Worldwide Only)'}
      </button>

      {result && (
        <div className="mt-6 p-4 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">
            {result.success ? '✅ Success' : '❌ Error'}
          </h2>
          
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 