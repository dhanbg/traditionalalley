'use client';

import { useEffect, useState } from 'react';
import { useContextElement } from '@/context/Context';

export default function TestCartDeletion() {
  const { user, cartProducts } = useContextElement();
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  const runCartDeletionTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addTestResult('🧪 Starting cart deletion test...', 'info');
      
      if (!user || !user.id) {
        addTestResult('❌ No user found - please log in first', 'error');
        setIsLoading(false);
        return;
      }
      
      // Call the debug function from the context
      if (typeof window !== 'undefined' && window.debugCartDeletion) {
        addTestResult('🔧 Calling debug function from context...', 'info');
        const result = await window.debugCartDeletion();
        
        if (result.success) {
          addTestResult(`✅ ${result.message}`, 'success');
        } else {
          addTestResult(`❌ ${result.error}`, 'error');
          if (result.details) {
            addTestResult(`Details: ${JSON.stringify(result.details, null, 2)}`, 'error');
          }
        }
      } else {
        addTestResult('❌ Debug function not available', 'error');
      }
    } catch (error) {
      addTestResult(`❌ Test function error: ${error.message}`, 'error');
      console.error('Test error:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Cart Deletion Test</h1>
      
      <div className="mb-6">
        <button
          onClick={runCartDeletionTest}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? 'Running Test...' : 'Run Cart Deletion Test'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Click the button above to run the test.</p>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  result.type === 'success' ? 'bg-green-100 text-green-800' :
                  result.type === 'error' ? 'bg-red-100 text-red-800' :
                  result.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                <span className="text-xs text-gray-500">[{result.timestamp}]</span> {result.message}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800">Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2">
          <li>Make sure you are logged in</li>
          <li>Add some items to your cart</li>
          <li>Click "Run Cart Deletion Test" to test the deletion functionality</li>
          <li>Check the test results to see if cart deletion is working</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold">Current Status:</h3>
        <p>User: {user ? `${user.email} (${user.id})` : 'Not logged in'}</p>
        <p>Frontend Cart Items: {cartProducts?.length || 0}</p>
      </div>
    </div>
  );
}
