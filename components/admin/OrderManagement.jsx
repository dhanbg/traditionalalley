'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingShipment, setCreatingShipment] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaidOrders();
  }, []);

  const fetchPaidOrders = async () => {
    try {
      setLoading(true);
      // This would be your API endpoint to fetch paid orders
      // const response = await axios.get('/api/orders?status=paid');
      // setOrders(response.data);
      
      // Mock data for demonstration
      setOrders([
        {
          id: 1,
          orderNumber: 'ORD-2025-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+1234567890',
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            country: 'US',
            postalCode: '10001'
          },
          products: [
            { name: 'Traditional Shirt', quantity: 2, price: 25.00 },
            { name: 'Handwoven Scarf', quantity: 1, price: 15.00 }
          ],
          totalAmount: 65.00,
          shippingCost: 15.50,
          grandTotal: 80.50,
          paymentMethod: 'nps',
          orderDate: '2025-01-01T10:30:00Z',
          status: 'paid',
          trackingNumber: null
        },
        {
          id: 2,
          orderNumber: 'ORD-2025-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          customerPhone: '+9876543210',
          shippingAddress: {
            street: '456 Oak Ave',
            city: 'London',
            country: 'GB',
            postalCode: 'SW1A 1AA'
          },
          products: [
            { name: 'Traditional Dress', quantity: 1, price: 45.00 }
          ],
          totalAmount: 45.00,
          shippingCost: 12.30,
          grandTotal: 57.30,
          paymentMethod: 'cod',
          orderDate: '2025-01-01T14:45:00Z',
          status: 'paid',
          trackingNumber: null
        }
      ]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async (order) => {
    try {
      setCreatingShipment(prev => ({ ...prev, [order.id]: true }));
      setError('');

      // Prepare DHL shipment data
      const shipmentData = {
        plannedShippingDate: new Date().toISOString().split('T')[0],
        productCode: 'P',
        isCustomsDeclarable: true,
        declaredValue: order.totalAmount,
        declaredValueCurrency: 'USD',
        incoterm: 'DAP',
        exportDeclaration: {
          exportReason: 'SALE',
          invoice: {
            number: `INV-${order.orderNumber}`,
            date: new Date().toISOString().split('T')[0]
          }
        },
        originAddress: { 
          postalCode: '44600', 
          cityName: 'Kathmandu', 
          countryCode: 'NP', 
          addressLine1: 'Traditional Alley Store' 
        },
        destinationAddress: { 
          postalCode: order.shippingAddress.postalCode,
          cityName: order.shippingAddress.city,
          countryCode: order.shippingAddress.country,
          addressLine1: order.shippingAddress.street
        },
        shipper: {
          companyName: 'Traditional Alley',
          fullName: 'Anshu Kc',
          email: 'traditionalley2050@gmail.com',
          phone: '9844594187',
          countryCode: '+977'
        },
        recipient: { 
          companyName: '', 
          fullName: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone.replace(/^\+/, ''),
          countryCode: order.customerPhone.substring(0, order.customerPhone.indexOf(' ') > 0 ? order.customerPhone.indexOf(' ') : 4)
        },
        packages: order.products.map((product, index) => ({
          weight: 1,
          length: 10,
          width: 10,
          height: 10,
          description: product.name,
          declaredValue: product.price,
          quantity: product.quantity,
          commodityCode: '',
          manufacturingCountryCode: 'NP'
        }))
      };

      // Create DHL shipment
      const response = await axios.post('/api/dhl/shipments', shipmentData);
      
      if (response.data.success) {
        // Update order with tracking number
        const trackingNumber = response.data.data.shipmentTrackingNumber;
        
        // Update local state
        setOrders(prev => prev.map(o => 
          o.id === order.id 
            ? { ...o, trackingNumber, status: 'shipped' }
            : o
        ));

        alert(`Shipment created successfully! Tracking Number: ${trackingNumber}`);
        
        // Download shipping documents
        if (response.data.data.documents) {
          response.data.data.documents.forEach((doc, index) => {
            setTimeout(() => {
              downloadPdf(doc.content, `DHL-${doc.typeCode.toUpperCase()}-${trackingNumber}.pdf`);
            }, index * 1000); // Stagger downloads
          });
        }
      } else {
        throw new Error('Failed to create shipment');
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      setError(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setCreatingShipment(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const downloadPdf = (base64Content, fileName) => {
    try {
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-green-100 p-6 rounded-xl border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">📦 Order Management & DHL Shipping</h2>
        <p className="text-blue-700">Manage paid orders and create DHL shipments with one click</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">❌</span>
            <div>
              <strong className="text-red-800">Error:</strong>
              <span className="text-red-700 ml-2">{error}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Paid Orders</h3>
            <p className="text-gray-500">When customers complete their payments, orders will appear here.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'paid' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {order.status === 'paid' ? '💰 Paid' : '🚚 Shipped'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong>Customer:</strong> {order.customerName}</div>
                    <div><strong>Email:</strong> {order.customerEmail}</div>
                    <div><strong>Phone:</strong> {order.customerPhone}</div>
                    <div><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</div>
                    <div><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</div>
                  </div>

                  {order.trackingNumber && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-green-800">Tracking Number:</div>
                      <div className="text-green-700 font-mono">{order.trackingNumber}</div>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">🏠 Shipping Address</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{order.shippingAddress.street}</div>
                    <div>{order.shippingAddress.city}</div>
                    <div>{order.shippingAddress.country} {order.shippingAddress.postalCode}</div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">📦 Products</h4>
                    {order.products.map((product, index) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{product.name} x{product.quantity}</span>
                        <span>${product.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary & Actions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">💰 Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${order.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${order.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {order.status === 'paid' ? (
                      <button
                        onClick={() => createShipment(order)}
                        disabled={creatingShipment[order.id]}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                          creatingShipment[order.id]
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {creatingShipment[order.id] ? (
                          <>⏳ Creating Shipment...</>
                        ) : (
                          <>🚀 Create DHL Shipment</>
                        )}
                      </button>
                    ) : (
                      <div className="w-full py-3 px-4 bg-green-50 border border-green-200 rounded-lg text-center">
                        <span className="text-green-700 font-medium">✅ Shipment Created</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;