'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NCMOrderButton = ({ payment, bag, onOrderCreated }) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    branch: ''
  });
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [error, setError] = useState('');

  // Fetch NCM branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Auto-select destination branch based on cityName when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && payment?.orderData?.receiver_details?.address?.cityName && !formData.branch) {
      const cityName = payment.orderData.receiver_details.address.cityName.toLowerCase();
      
      // Find matching branch by cityName
      const matchingBranch = branches.find(branch => 
        branch.name.toLowerCase().includes(cityName) || 
        branch.district.toLowerCase().includes(cityName)
      );
      
      if (matchingBranch) {
        setFormData(prev => ({
          ...prev,
          branch: matchingBranch.name
        }));
        console.log(`Auto-selected branch: ${matchingBranch.name} for city: ${payment.orderData.receiver_details.address.cityName}`);
      } else {
        console.log(`No matching branch found for city: ${payment.orderData.receiver_details.address.cityName}`);
      }
    }
  }, [branches, payment?.orderData?.receiver_details?.address?.cityName, formData.branch]);

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await axios.get('/api/ncm/branches');
      if (response.data.success && response.data.branches) {
        setBranches(response.data.branches);
      } else {
        console.error('Failed to fetch branches:', response.data);
      }
    } catch (error) {
      console.error('Error fetching NCM branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const calculateCODCharge = () => {
    return 0; // Always return 0 since we don't do COD
  };

  const handleCreateOrder = async () => {
    // Defensive checks
    if (!setLoading || !setError || !setShowForm || !setFormData) {
      console.error('State setters not available');
      return;
    }

    // Validate required data
    if (!formData.branch) {
      setError('Please select destination branch');
      console.error('No branch selected:', formData);
      return;
    }

    if (!payment?.orderData?.receiver_details) {
      setError('Missing receiver details');
      console.error('Missing receiver details:', payment);
      return;
    }

    if (!payment.merchantTxnId) {
      setError('Missing merchant transaction ID');
      console.error('Missing merchantTxnId:', payment);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const orderData = {
        name: payment.orderData.receiver_details.fullName,
        phone: payment.orderData.receiver_details.phone,
        cod_charge: calculateCODCharge(),
        address: `${payment.orderData.receiver_details.address.addressLine1}, ${payment.orderData.receiver_details.address.cityName}`,
        fbranch: 'Tinkune',
        branch: formData.branch,
        package: 'Clothing',
        vref_id: payment.gatewayReferenceNo || payment.merchantTxnId
      };

      console.log('Sending NCM order data:', orderData);
      console.log('Selected branch:', formData.branch);
      console.log('Payment data:', payment);

      const response = await axios.post('/api/ncm/create-order', orderData);
      console.log('NCM API response:', response.data);
      
      if (response.data.success) {
        // Save NCM order info to user bag
        if (bag && bag.documentId) {
          console.log('Bag and documentId available. Updating trackingInfo for bag:', bag.documentId);
          console.log('Updating user bag with gatewayReferenceNo:', payment.gatewayReferenceNo);
          const newEntry = {
            type: 'ncm_order',
            status: 'created',
            gatewayReferenceNo: payment.gatewayReferenceNo,
            ncmOrderId: response.data.data.orderId,
            timestamp: new Date().toISOString()
          };
          console.log('New trackingInfo entry:', newEntry);

          const currentTrackingInfo = Array.isArray(bag.trackingInfo) ? bag.trackingInfo : [];
          const updatedTrackingInfo = [...currentTrackingInfo, newEntry];
          console.log('Updated trackingInfo:', updatedTrackingInfo);

          try {
            const updateResponse = await axios.put(`/api/user-bags/${bag.documentId}`, {
              data: {
                trackingInfo: updatedTrackingInfo
              }
            });
            console.log('User bag updated with NCM order info:', updateResponse.data);
          } catch (error) {
            console.error('Failed to update user bag with NCM order info:', error);
          }
        } else {
          console.log('Bag or bag.documentId not available. Cannot update trackingInfo. Bag:', bag);
        }

        if (onOrderCreated) {
          onOrderCreated(response.data, payment.merchantTxnId);
        }
        setShowForm(false);
        setFormData({ branch: '' });
      } else {
        setError(response.data.message || 'Failed to create NCM order');
      }
    } catch (err) {
      console.error('Error creating NCM order:', err);
      console.error('Error response status:', err.response?.status);
      console.error('Error response data:', err.response?.data);
      console.error('Error response headers:', err.response?.headers);
      
      try {
        let errorMessage = 'Error creating NCM order';
        if (err && typeof err === 'object') {
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
          } else if (err.message) {
            errorMessage = err.message;
          }
        }
        setError(errorMessage);
      } catch (setErrorErr) {
        console.error('Error setting error state:', setErrorErr);
      }
    } finally {
      try {
        setLoading(false);
      } catch (finallyErr) {
        console.error('Error in finally block:', finallyErr);
      }
    }
  };

  // Check if NCM order already exists for this payment by looking for gatewayReferenceNo in trackingInfo
  const ncmOrderEntry = bag.trackingInfo?.find(entry => 
    entry.type === 'ncm_order' && 
    entry.gatewayReferenceNo === payment.gatewayReferenceNo
  );

  if (ncmOrderEntry) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center text-orange-600 font-medium text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          NCM Order Created
        </div>
        <div className="text-xs text-gray-500">
          Order ID: {ncmOrderEntry.ncmOrderId}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Create NCM Order
        </button>
      ) : (
        <div className="absolute top-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10 w-80">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Create NCM Order</h4>
            <button
              onClick={() => {
                setShowForm(false);
                setError('');
                setFormData({ branch: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 p-2 rounded text-xs">
              <div><strong>Customer:</strong> {payment.orderData.receiver_details.fullName}</div>
              <div><strong>Phone:</strong> {payment.orderData.receiver_details.phone}</div>
              <div><strong>COD Amount:</strong> NPR {calculateCODCharge()}</div>
              <div><strong>From:</strong> Tinkune</div>
              <div><strong>Destination Branch:</strong> {formData.branch}</div>
              <div><strong>Package Type:</strong> Clothing</div>
              <div><strong>Vendor Reference ID:</strong> {payment.gatewayReferenceNo}</div>
            </div>

            {error && (
              <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded text-sm disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Order'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setError('');
                  setFormData({ branch: '' });
                }}
                className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NCMOrderButton;
