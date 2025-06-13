import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DHLShipping = ({ orderData, onShippingComplete }) => {
  const [activeTab, setActiveTab] = useState('rates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // States for different functionalities
  const [ratesData, setRatesData] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [shipmentData, setShipmentData] = useState(null);
  const [pickupData, setPickupData] = useState(null);

  // Form states
  const [rateForm, setRateForm] = useState({
    destinationCountryCode: 'AU',
    destinationCityName: 'Sydney',
    weight: '1',
    length: '10',
    width: '10',
    height: '10',
    isCustomsDeclarable: false
  });

  const [trackingForm, setTrackingForm] = useState({
    trackingNumber: '',
    trackingNumbers: ''
  });

  const [shipmentForm, setShipmentForm] = useState({
    plannedShippingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    productCode: 'P',
    shipper: {
      companyName: '',
      fullName: '',
      email: '',
      phone: ''
    },
    recipient: {
      companyName: '',
      fullName: '',
      email: '',
      phone: ''
    },
    originAddress: {
      countryCode: 'NP',
      cityName: 'Kathmandu',
      postalCode: '',
      addressLine1: ''
    },
    destinationAddress: {
      countryCode: '',
      cityName: '',
      postalCode: '',
      addressLine1: ''
    },
    packages: [{
      weight: '1',
      length: '10',
      width: '10',
      height: '10',
      description: '',
      declaredValue: ''
    }]
  });

  // Get shipping rates
  const getRates = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form data
      if (!rateForm.destinationCountryCode || !rateForm.destinationCityName) {
        setError('Please enter destination country code and city name');
        setLoading(false);
        return;
      }

      const weight = parseFloat(rateForm.weight);
      const length = parseFloat(rateForm.length);
      const width = parseFloat(rateForm.width);
      const height = parseFloat(rateForm.height);

      if (weight <= 0 || length <= 0 || width <= 0 || height <= 0) {
        setError('Weight and dimensions must be positive numbers');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        destinationCountryCode: rateForm.destinationCountryCode,
        destinationCityName: rateForm.destinationCityName,
        weight: weight.toString(),
        length: length.toString(),
        width: width.toString(),
        height: height.toString(),
        isCustomsDeclarable: rateForm.isCustomsDeclarable.toString()
      });

      const response = await axios.get(`/api/dhl/rates?${params}`);
      
      if (response.data.success) {
        setRatesData(response.data.data);
        setSuccess('Rates retrieved successfully!');
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error('Rate request error:', err);
      setError(err.response?.data?.error || 'Failed to get rates');
    } finally {
      setLoading(false);
    }
  };

  // Track shipment
  const trackShipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      if (trackingForm.trackingNumber) {
        params.append('trackingNumber', trackingForm.trackingNumber);
      } else if (trackingForm.trackingNumbers) {
        params.append('trackingNumbers', trackingForm.trackingNumbers);
      } else {
        setError('Please enter tracking number(s)');
        setLoading(false);
        return;
      }

      const response = await axios.get(`/api/dhl/tracking?${params}`);
      
      if (response.data.success) {
        setTrackingData(response.data.data);
        setSuccess('Tracking information retrieved successfully!');
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to track shipment');
    } finally {
      setLoading(false);
    }
  };

  // Create shipment
  const createShipment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate required fields
      if (!shipmentForm.shipper.companyName || !shipmentForm.shipper.fullName || 
          !shipmentForm.recipient.companyName || !shipmentForm.recipient.fullName ||
          !shipmentForm.destinationAddress.countryCode || !shipmentForm.destinationAddress.cityName) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate package dimensions
      for (let i = 0; i < shipmentForm.packages.length; i++) {
        const pkg = shipmentForm.packages[i];
        const weight = parseFloat(pkg.weight);
        const length = parseFloat(pkg.length);
        const width = parseFloat(pkg.width);
        const height = parseFloat(pkg.height);

        if (weight <= 0 || length <= 0 || width <= 0 || height <= 0) {
          setError(`Package ${i + 1}: Weight and dimensions must be positive numbers`);
          setLoading(false);
          return;
        }
      }

      const payload = {
        plannedShippingDate: shipmentForm.plannedShippingDate,
        productCode: shipmentForm.productCode,
        shipper: shipmentForm.shipper,
        recipient: shipmentForm.recipient,
        originAddress: shipmentForm.originAddress,
        destinationAddress: shipmentForm.destinationAddress,
        packages: shipmentForm.packages.map(pkg => ({
          ...pkg,
          weight: parseFloat(pkg.weight),
          length: parseFloat(pkg.length),
          width: parseFloat(pkg.width),
          height: parseFloat(pkg.height),
          declaredValue: pkg.declaredValue ? parseFloat(pkg.declaredValue) : 0
        }))
      };

      const response = await axios.post('/api/dhl/shipments', payload);
      
      if (response.data.success) {
        setShipmentData(response.data.data);
        setSuccess('Shipment created successfully!');
        if (onShippingComplete) {
          onShippingComplete(response.data.data);
        }
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error('Shipment creation error:', err);
      setError(err.response?.data?.error || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  // Test tracking numbers for demo
  const testTrackingNumbers = [
    '9356579890', '4818240420', '5584773180', '5786694550', '2449648740'
  ];

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dhl-shipping-container">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">DHL Express Shipping</h3>
        </div>
        
        <div className="card-body">
          {/* Tab Navigation */}
          <div className="nav nav-tabs mb-4">
            <button 
              className={`nav-link ${activeTab === 'rates' ? 'active' : ''}`}
              onClick={() => setActiveTab('rates')}
            >
              Get Rates
            </button>
            <button 
              className={`nav-link ${activeTab === 'tracking' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracking')}
            >
              Track Shipment
            </button>
            <button 
              className={`nav-link ${activeTab === 'shipment' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipment')}
            >
              Create Shipment
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="alert alert-danger mb-3">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success mb-3">
              {success}
            </div>
          )}

          {/* Rates Tab */}
          {activeTab === 'rates' && (
            <div className="tab-content">
              <h4>Get Shipping Rates</h4>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Destination Country Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., US, GB, AU"
                      value={rateForm.destinationCountryCode}
                      onChange={(e) => setRateForm({...rateForm, destinationCountryCode: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Destination City</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., New York, London"
                      value={rateForm.destinationCityName}
                      onChange={(e) => setRateForm({...rateForm, destinationCityName: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      value={rateForm.weight}
                      onChange={(e) => setRateForm({...rateForm, weight: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Length (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={rateForm.length}
                      onChange={(e) => setRateForm({...rateForm, length: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Width (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={rateForm.width}
                      onChange={(e) => setRateForm({...rateForm, width: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={rateForm.height}
                      onChange={(e) => setRateForm({...rateForm, height: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={rateForm.isCustomsDeclarable}
                        onChange={(e) => setRateForm({...rateForm, isCustomsDeclarable: e.target.checked})}
                      />
                      <label className="form-check-label">Customs Declarable</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={getRates}
                disabled={loading}
              >
                {loading ? 'Getting Rates...' : 'Get Rates'}
              </button>

              {/* Rates Results */}
              {ratesData && (
                <div className="mt-4">
                  <h5>Available Services</h5>
                  {ratesData.products?.map((product, index) => (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">{product.productName}</h6>
                        <p className="card-text">
                          <strong>Service Code:</strong> {product.productCode}<br/>
                          <strong>Network:</strong> {product.networkTypeCode}<br/>
                          <strong>Weight:</strong> {product.weight?.provided} kg
                        </p>
                        {product.totalPrice?.map((price, priceIndex) => (
                          <div key={priceIndex} className="mb-2">
                            <strong>Price:</strong> {formatCurrency(price.price, price.priceCurrency)}
                            <small className="text-muted"> ({price.currencyType})</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="tab-content">
              <h4>Track Shipment</h4>
              <div className="mb-3">
                <label className="form-label">Single Tracking Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter tracking number"
                  value={trackingForm.trackingNumber}
                  onChange={(e) => setTrackingForm({...trackingForm, trackingNumber: e.target.value})}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Multiple Tracking Numbers (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter multiple tracking numbers separated by commas"
                  value={trackingForm.trackingNumbers}
                  onChange={(e) => setTrackingForm({...trackingForm, trackingNumbers: e.target.value})}
                />
              </div>

              <div className="mb-3">
                <small className="text-muted">
                  Test tracking numbers: {testTrackingNumbers.join(', ')}
                </small>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={trackShipment}
                disabled={loading}
              >
                {loading ? 'Tracking...' : 'Track Shipment'}
              </button>

              {/* Tracking Results */}
              {trackingData && (
                <div className="mt-4">
                  <h5>Tracking Information</h5>
                  {trackingData.shipments?.map((shipment, index) => (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">Shipment: {shipment.shipmentTrackingNumber}</h6>
                        <p><strong>Status:</strong> {shipment.status}</p>
                        <p><strong>Service:</strong> {shipment.service?.[0]?.name}</p>
                        
                        {shipment.events && (
                          <div className="mt-3">
                            <h6>Tracking Events</h6>
                            {shipment.events.map((event, eventIndex) => (
                              <div key={eventIndex} className="border-left pl-3 mb-2">
                                <strong>{event.description}</strong><br/>
                                <small className="text-muted">
                                  {formatDate(event.timestamp)} - {event.location?.address?.addressLocality}
                                </small>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shipment Creation Tab */}
          {activeTab === 'shipment' && (
            <div className="tab-content">
              <h4>Create Shipment</h4>
              
              {/* Shipping Date and Service */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Planned Shipping Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={shipmentForm.plannedShippingDate}
                    onChange={(e) => setShipmentForm({...shipmentForm, plannedShippingDate: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Service Type</label>
                  <select
                    className="form-control"
                    value={shipmentForm.productCode}
                    onChange={(e) => setShipmentForm({...shipmentForm, productCode: e.target.value})}
                  >
                    <option value="P">Express Worldwide</option>
                    <option value="D">Express 12:00</option>
                    <option value="T">Express 10:30</option>
                    <option value="N">Express 9:00</option>
                  </select>
                </div>
              </div>

              {/* Shipper Information */}
              <h5>Shipper Information</h5>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shipmentForm.shipper.companyName}
                    onChange={(e) => setShipmentForm({
                      ...shipmentForm, 
                      shipper: {...shipmentForm.shipper, companyName: e.target.value}
                    })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shipmentForm.shipper.fullName}
                    onChange={(e) => setShipmentForm({
                      ...shipmentForm, 
                      shipper: {...shipmentForm.shipper, fullName: e.target.value}
                    })}
                  />
                </div>
              </div>

              {/* Origin Address */}
              <h5>Origin Address</h5>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shipmentForm.originAddress.addressLine1}
                    onChange={(e) => setShipmentForm({
                      ...shipmentForm, 
                      originAddress: {...shipmentForm.originAddress, addressLine1: e.target.value}
                    })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shipmentForm.originAddress.postalCode}
                    onChange={(e) => setShipmentForm({
                      ...shipmentForm, 
                      originAddress: {...shipmentForm.originAddress, postalCode: e.target.value}
                    })}
                  />
                </div>
              </div>

              {/* Recipient Information */}
              <h5>Recipient Information</h5>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shipmentForm.recipient.companyName}
                    onChange={(e) => setShipmentForm({
                      ...shipmentForm, 
                      recipient: {...shipmentForm.recipient, companyName: e.target.value}
                    })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shipmentForm.recipient.fullName}
                    onChange={(e) => setShipmentForm({
                      ...shipmentForm, 
                      recipient: {...shipmentForm.recipient, fullName: e.target.value}
                    })}
                  />
                </div>
              </div>

              {/* Destination Address */}
              <h5>Destination Address</h5>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Country Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., US, GB"
                    value={shipmentForm.destinationAddress.countryCode}
                    onChange={(e) => setShipmentForm({
                      ...shipmentForm, 
                      destinationAddress: {...shipmentForm.destinationAddress, countryCode: e.target.value}
                    })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shipmentForm.destinationAddress.cityName}
                    onChange={(e) => setShipmentForm({
                      ...shipmentForm, 
                      destinationAddress: {...shipmentForm.destinationAddress, cityName: e.target.value}
                    })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shipmentForm.destinationAddress.postalCode}
                    onChange={(e) => setShipmentForm({
                      ...shipmentForm, 
                      destinationAddress: {...shipmentForm.destinationAddress, postalCode: e.target.value}
                    })}
                  />
                </div>
              </div>

              {/* Package Information */}
              <h5>Package Information</h5>
              {shipmentForm.packages.map((pkg, index) => (
                <div key={index} className="border p-3 mb-3">
                  <div className="row">
                    <div className="col-md-3">
                      <label className="form-label">Weight (kg)</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.1"
                        value={pkg.weight}
                        onChange={(e) => {
                          const newPackages = [...shipmentForm.packages];
                          newPackages[index].weight = e.target.value;
                          setShipmentForm({...shipmentForm, packages: newPackages});
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Length (cm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={pkg.length}
                        onChange={(e) => {
                          const newPackages = [...shipmentForm.packages];
                          newPackages[index].length = e.target.value;
                          setShipmentForm({...shipmentForm, packages: newPackages});
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Width (cm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={pkg.width}
                        onChange={(e) => {
                          const newPackages = [...shipmentForm.packages];
                          newPackages[index].width = e.target.value;
                          setShipmentForm({...shipmentForm, packages: newPackages});
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Height (cm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={pkg.height}
                        onChange={(e) => {
                          const newPackages = [...shipmentForm.packages];
                          newPackages[index].height = e.target.value;
                          setShipmentForm({...shipmentForm, packages: newPackages});
                        }}
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        value={pkg.description}
                        onChange={(e) => {
                          const newPackages = [...shipmentForm.packages];
                          newPackages[index].description = e.target.value;
                          setShipmentForm({...shipmentForm, packages: newPackages});
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Declared Value (USD)</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.01"
                        value={pkg.declaredValue}
                        onChange={(e) => {
                          const newPackages = [...shipmentForm.packages];
                          newPackages[index].declaredValue = e.target.value;
                          setShipmentForm({...shipmentForm, packages: newPackages});
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                className="btn btn-success"
                onClick={createShipment}
                disabled={loading}
              >
                {loading ? 'Creating Shipment...' : 'Create Shipment'}
              </button>

              {/* Shipment Results */}
              {shipmentData && (
                <div className="mt-4">
                  <h5>Shipment Created Successfully!</h5>
                  <div className="card">
                    <div className="card-body">
                      <p><strong>Tracking Number:</strong> {shipmentData.shipmentTrackingNumber}</p>
                      <p><strong>Shipment ID:</strong> {shipmentData.shipmentId}</p>
                      {shipmentData.documents && (
                        <div>
                          <strong>Documents:</strong>
                          {shipmentData.documents.map((doc, index) => (
                            <div key={index}>
                              <a href={`data:application/pdf;base64,${doc.content}`} download={`shipment-${doc.typeCode}.pdf`}>
                                Download {doc.typeCode}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dhl-shipping-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .nav-tabs {
          border-bottom: 1px solid #dee2e6;
        }
        
        .nav-link {
          background: none;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          color: #495057;
          border-bottom: 2px solid transparent;
        }
        
        .nav-link.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }
        
        .nav-link:hover {
          color: #007bff;
        }
        
        .card {
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
        
        .card-header {
          padding: 1rem 1.25rem;
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }
        
        .card-body {
          padding: 1.25rem;
        }
        
        .form-label {
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .form-control {
          display: block;
          width: 100%;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          color: #495057;
          background-color: #fff;
          border: 1px solid #ced4da;
          border-radius: 0.375rem;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .form-control:focus {
          color: #495057;
          background-color: #fff;
          border-color: #80bdff;
          outline: 0;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        .btn {
          display: inline-block;
          font-weight: 400;
          text-align: center;
          vertical-align: middle;
          cursor: pointer;
          border: 1px solid transparent;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          border-radius: 0.375rem;
          transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;
        }
        
        .btn-primary {
          color: #fff;
          background-color: #007bff;
          border-color: #007bff;
        }
        
        .btn-primary:hover {
          background-color: #0056b3;
          border-color: #004085;
        }
        
        .btn-success {
          color: #fff;
          background-color: #28a745;
          border-color: #28a745;
        }
        
        .btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        
        .alert {
          padding: 0.75rem 1.25rem;
          margin-bottom: 1rem;
          border: 1px solid transparent;
          border-radius: 0.375rem;
        }
        
        .alert-danger {
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }
        
        .alert-success {
          color: #155724;
          background-color: #d4edda;
          border-color: #c3e6cb;
        }
        
        .text-muted {
          color: #6c757d;
        }
        
        .border-left {
          border-left: 3px solid #007bff;
        }
        
        .pl-3 {
          padding-left: 1rem;
        }
        
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        
        .mb-3 {
          margin-bottom: 1rem;
        }
        
        .mt-3 {
          margin-top: 1rem;
        }
        
        .mt-4 {
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default DHLShipping; 