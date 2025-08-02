'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NCMOrderForm = ({ onOrderCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phone2: '',
    cod_charge: '',
    address: '',
    branch: '',
    package: '',
    vref_id: ''
  });

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingBranches, setLoadingBranches] = useState(true);

  // Fetch NCM branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await axios.get('/api/ncm/branches');
      if (response.data.success && response.data.branches) {
        setBranches(response.data.branches);
      } else {
        console.error('Failed to fetch branches:', response.data);
        setErrors(prev => ({ ...prev, branches: 'Failed to load branches' }));
      }
    } catch (error) {
      console.error('Error fetching NCM branches:', error);
      setErrors(prev => ({ ...prev, branches: 'Error loading branches' }));
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Customer name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.cod_charge.trim()) newErrors.cod_charge = 'COD charge is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.branch) newErrors.branch = 'Destination branch is required';
    
    // Phone number validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // COD charge validation
    if (formData.cod_charge && isNaN(parseFloat(formData.cod_charge))) {
      newErrors.cod_charge = 'COD charge must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...formData,
        fbranch: 'Tinkune',
        cod_charge: parseFloat(formData.cod_charge)
      };

      const response = await axios.post('/api/ncm/create-order', orderData);
      
      if (response.data.success) {
        onOrderCreated && onOrderCreated(response.data);
        // Reset form
        setFormData({
          name: '',
          phone: '',
          phone2: '',
          cod_charge: '',
          address: '',
          branch: '',
          package: '',
          vref_id: ''
        });
      } else {
        setErrors({ submit: response.data.message || 'Failed to create order' });
      }
    } catch (error) {
      console.error('Error creating NCM order:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Error creating order. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create NCM Order</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter customer name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Phone
            </label>
            <input
              type="tel"
              name="phone2"
              value={formData.phone2}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter secondary phone (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              COD Charge <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cod_charge"
              value={formData.cod_charge}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cod_charge ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter COD amount"
            />
            {errors.cod_charge && <p className="text-red-500 text-xs mt-1">{errors.cod_charge}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows="3"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter customer address"
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        {/* Branch Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Branch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fbranch"
              value="Tinkune"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
            <input type="hidden" name="fbranch" value="Tinkune" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Branch <span className="text-red-500">*</span>
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.branch ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loadingBranches}
            >
              <option value="">Select destination branch</option>
              {branches.map((branch, index) => (
                <option key={index} value={branch.name}>
                  {branch.name} ({branch.district})
                </option>
              ))}
            </select>
            {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch}</p>}
          </div>
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Type
            </label>
            <input
              type="text"
              name="package"
              value={formData.package}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter package type (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Reference ID
            </label>
            <input
              type="text"
              name="vref_id"
              value={formData.vref_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter vendor reference ID (optional)"
            />
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || loadingBranches}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Order...
              </>
            ) : (
              'Create NCM Order'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NCMOrderForm;
