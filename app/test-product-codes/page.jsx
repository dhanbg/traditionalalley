"use client";
import React, { useState, useEffect } from 'react';
import { fetchDataFromApi } from '@/utils/api';

export default function TestProductCodes() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  // Fetch some products to test with
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetchDataFromApi('/api/products?populate=*&pagination[limit]=5');
        if (response?.data) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Simulate the checkout product code logic
  const testProductCodeLogic = async () => {
    setLoading(true);
    setTestResults([]);
    
    const results = [];
    
    for (const product of products) {
      try {
        // Test main product
        const mainProductResult = {
          type: 'Main Product',
          productId: product.documentId,
          productTitle: product.title,
          productCode: product.product_code || 'NOT FOUND',
          isHardcoded: !product.product_code || product.product_code === '',
          rawData: {
            hasProductCode: !!product.product_code,
            productCodeValue: product.product_code
          }
        };
        results.push(mainProductResult);
        
        // Test variants if they exist
        if (product.product_variants && Array.isArray(product.product_variants)) {
          for (const variant of product.product_variants) {
            const variantResult = {
              type: 'Variant Product',
              productId: product.documentId,
              variantId: variant.documentId,
              productTitle: `${product.title} - ${variant.title || variant.color || 'Variant'}`,
              productCode: variant.product_code || 'NOT FOUND',
              isHardcoded: !variant.product_code || variant.product_code === '',
              rawData: {
                hasProductCode: !!variant.product_code,
                productCodeValue: variant.product_code,
                variantTitle: variant.title || variant.color
              }
            };
            results.push(variantResult);
          }
        }
        
      } catch (error) {
        results.push({
          type: 'Error',
          productId: product.documentId,
          productTitle: product.title,
          error: error.message,
          isHardcoded: true
        });
      }
    }
    
    setTestResults(results);
    setLoading(false);
  };

  const getStatusColor = (isHardcoded, hasError) => {
    if (hasError) return 'text-red-600';
    return isHardcoded ? 'text-red-600' : 'text-green-600';
  };

  const getStatusText = (isHardcoded, hasError) => {
    if (hasError) return '❌ ERROR';
    return isHardcoded ? '❌ HARDCODED/MISSING' : '✅ DYNAMIC';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          🧪 Product Code Test Suite
        </h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-2 text-blue-800">Test Purpose</h2>
          <p className="text-blue-700">
            This test verifies that product codes are properly fetched from the API data structure 
            and not hardcoded values. It checks both main products and their variants.
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={testProductCodeLogic}
            disabled={loading || products.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? '🔄 Testing...' : '🚀 Run Product Code Test'}
          </button>
          
          <p className="text-sm text-gray-600 mt-2">
            Found {products.length} products to test
          </p>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Test Results</h2>
            
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(r => !r.isHardcoded && !r.error).length}
                </div>
                <div className="text-green-700">✅ Dynamic Codes</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(r => r.isHardcoded || r.error).length}
                </div>
                <div className="text-red-700">❌ Hardcoded/Missing</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.length}
                </div>
                <div className="text-blue-700">📋 Total Tests</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Product Code</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.type === 'Main Product' ? 'bg-blue-100 text-blue-800' :
                          result.type === 'Variant Product' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.type}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="font-medium">{result.productTitle}</div>
                        {result.variantId && (
                          <div className="text-xs text-gray-500">Variant ID: {result.variantId}</div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {result.productCode || result.error || 'N/A'}
                        </code>
                      </td>
                      <td className={`border border-gray-300 px-4 py-2 font-medium ${
                        getStatusColor(result.isHardcoded, !!result.error)
                      }`}>
                        {getStatusText(result.isHardcoded, !!result.error)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-xs">
                        {result.rawData && (
                          <div>
                            <div>Has Code: {result.rawData.hasProductCode ? 'Yes' : 'No'}</div>
                            {result.rawData.variantTitle && (
                              <div>Variant: {result.rawData.variantTitle}</div>
                            )}
                          </div>
                        )}
                        {result.error && (
                          <div className="text-red-600">Error: {result.error}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final Assessment */}
            <div className={`p-4 rounded-lg border-2 ${
              testResults.some(r => r.isHardcoded || r.error) 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <h3 className="font-bold text-lg mb-2">
                🎯 Final Assessment
              </h3>
              <p className={`font-medium ${
                testResults.some(r => r.isHardcoded || r.error)
                  ? 'text-red-700'
                  : 'text-green-700'
              }`}>
                {testResults.some(r => r.isHardcoded || r.error)
                  ? '❌ FAILED: Some product codes are hardcoded, missing, or have errors'
                  : '✅ PASSED: All product codes are properly fetched from API data'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}