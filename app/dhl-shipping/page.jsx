'use client';

import React from 'react';
import DHLShipping from '@/components/DHLShipping';

export default function DHLShippingPage() {
  const handleShippingComplete = (shipmentData) => {
    console.log('Shipment created:', shipmentData);
    // You can add additional logic here, such as:
    // - Saving shipment data to your database
    // - Sending confirmation emails
    // - Redirecting to order confirmation page
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          DHL Express Shipping
        </h1>
        <p className="text-gray-600 mb-6">
          Manage your international shipping with DHL Express. Get rates, create shipments, 
          track packages, and manage pickup requests all in one place.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Available Services</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Get shipping rates for domestic and international deliveries</li>
            <li>• Create and manage shipments with automatic label generation</li>
            <li>• Track single or multiple shipments in real-time</li>
            <li>• Schedule and manage pickup requests</li>
            <li>• Calculate landed costs including duties and taxes</li>
            <li>• Upload and manage commercial invoices and documents</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Test Environment</h3>
          <p className="text-yellow-700">
            This integration uses DHL's sandbox environment for testing. 
            Use the provided test tracking numbers for demonstration purposes.
          </p>
        </div>
      </div>

      <DHLShipping onShippingComplete={handleShippingComplete} />
    </div>
  );
} 