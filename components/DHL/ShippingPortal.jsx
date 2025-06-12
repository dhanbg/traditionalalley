'use client';

import { useState, useEffect } from 'react';

const ShippingPortal = () => {
    const [activeTab, setActiveTab] = useState('rates');
    const [loading, setLoading] = useState(false);
    
    // States for different sections
    const [rates, setRates] = useState([]);
    const [shipmentResult, setShipmentResult] = useState(null);
    const [trackingResult, setTrackingResult] = useState(null);
    const [pickupResult, setPickupResult] = useState(null);
    
    // Form states
    const [rateForm, setRateForm] = useState({
        originCountry: 'US',
        originCity: 'New York',
        originPostal: '10001',
        destCountry: 'GB',
        destCity: 'London',
        destPostal: 'SW1A 1AA',
        weight: 2.5,
        length: 20,
        width: 15,
        height: 10,
        shippingDate: '',
        customsDeclarable: true
    });

    useEffect(() => {
        // Set default shipping date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setRateForm(prev => ({
            ...prev,
            shippingDate: tomorrow.toISOString().split('T')[0]
        }));
    }, []);

    const getRates = async () => {
        setLoading(true);
        try {
            const rateRequest = {
                origin: {
                    countryCode: rateForm.originCountry,
                    cityName: rateForm.originCity,
                    postalCode: rateForm.originPostal
                },
                destination: {
                    countryCode: rateForm.destCountry,
                    cityName: rateForm.destCity,
                    postalCode: rateForm.destPostal
                },
                weight: parseFloat(rateForm.weight),
                dimensions: {
                    length: parseInt(rateForm.length),
                    width: parseInt(rateForm.width),
                    height: parseInt(rateForm.height)
                },
                plannedShippingDate: rateForm.shippingDate,
                isCustomsDeclarable: rateForm.customsDeclarable,
                unitOfMeasurement: 'metric'
            };

            // Call Strapi backend instead of DHL API directly
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dhl/rates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
                },
                body: JSON.stringify(rateRequest)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success && result.data && result.data.products) {
                setRates(result.data.products);
                console.log('✅ Rates retrieved successfully:', result.data.products);
            } else {
                console.log('⚠️ No products found in response:', result);
                setRates([]);
            }

        } catch (error) {
            console.error('Rate request failed:', error);
            alert(`Error: ${error.message}`);
            setRates([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 text-white p-8 text-center">
                <h1 className="text-3xl font-bold mb-2">🚚 DHL Express Shipping Portal</h1>
                <p className="text-lg opacity-90">Complete shipping solution with rates, tracking, and pickup scheduling</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-gray-100 border-b">
                {[
                    { id: 'rates', label: '📊 Get Rates' },
                    { id: 'ship', label: '📦 Create Shipment' },
                    { id: 'track', label: '🔍 Track Package' },
                    { id: 'pickup', label: '🚚 Schedule Pickup' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 p-4 font-medium transition-colors border-b-2 ${
                            activeTab === tab.id
                                ? 'bg-white border-red-600 text-red-600'
                                : 'border-transparent hover:bg-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
                {activeTab === 'rates' && (
                    <div>
                        {/* API Status Indicator */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-blue-800">
                                    Connected to Strapi Backend → DHL API (Test Environment)
                                </span>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                                API calls are routed through your backend to avoid CORS issues
                            </p>
                        </div>

                        {/* Shipping Details Form */}
                        <div className="bg-gray-50 p-6 rounded-lg mb-6">
                            <h3 className="text-lg font-semibold text-red-600 mb-4">📍 Shipping Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">From Country</label>
                                    <select
                                        value={rateForm.originCountry}
                                        onChange={(e) => setRateForm(prev => ({...prev, originCountry: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                    >
                                        <option value="US">United States</option>
                                        <option value="GB">United Kingdom</option>
                                        <option value="DE">Germany</option>
                                        <option value="FR">France</option>
                                        <option value="CA">Canada</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">From City</label>
                                    <input
                                        type="text"
                                        value={rateForm.originCity}
                                        onChange={(e) => setRateForm(prev => ({...prev, originCity: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                        placeholder="New York"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">From Postal Code</label>
                                    <input
                                        type="text"
                                        value={rateForm.originPostal}
                                        onChange={(e) => setRateForm(prev => ({...prev, originPostal: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                        placeholder="10001"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">To Country</label>
                                    <select
                                        value={rateForm.destCountry}
                                        onChange={(e) => setRateForm(prev => ({...prev, destCountry: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                    >
                                        <option value="GB">United Kingdom</option>
                                        <option value="US">United States</option>
                                        <option value="DE">Germany</option>
                                        <option value="FR">France</option>
                                        <option value="CA">Canada</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">To City</label>
                                    <input
                                        type="text"
                                        value={rateForm.destCity}
                                        onChange={(e) => setRateForm(prev => ({...prev, destCity: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                        placeholder="London"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">To Postal Code</label>
                                    <input
                                        type="text"
                                        value={rateForm.destPostal}
                                        onChange={(e) => setRateForm(prev => ({...prev, destPostal: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                        placeholder="SW1A 1AA"
                                    />
                                </div>
                            </div>

                            {/* Package Information */}
                            <h4 className="text-lg font-semibold text-red-600 mb-4 mt-6">📏 Package Information</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={rateForm.weight}
                                        onChange={(e) => setRateForm(prev => ({...prev, weight: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Length (cm)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={rateForm.length}
                                        onChange={(e) => setRateForm(prev => ({...prev, length: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Width (cm)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={rateForm.width}
                                        onChange={(e) => setRateForm(prev => ({...prev, width: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Height (cm)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={rateForm.height}
                                        onChange={(e) => setRateForm(prev => ({...prev, height: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Shipping Date</label>
                                    <input
                                        type="date"
                                        value={rateForm.shippingDate}
                                        onChange={(e) => setRateForm(prev => ({...prev, shippingDate: e.target.value}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Customs Declarable</label>
                                    <select
                                        value={rateForm.customsDeclarable}
                                        onChange={(e) => setRateForm(prev => ({...prev, customsDeclarable: e.target.value === 'true'}))}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Get Rates Button */}
                        <button
                            onClick={getRates}
                            disabled={loading}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Getting Rates...
                                </>
                            ) : (
                                <>
                                    📊 Get Shipping Rates
                                </>
                            )}
                        </button>

                        {/* Rates Results */}
                        {rates.length > 0 && (
                            <div className="mt-6 border-2 border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">💰 Available Shipping Options</h3>
                                <div className="space-y-4">
                                    {rates.map((rate, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-red-600 cursor-pointer transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-red-600 text-lg">{rate.productName}</h4>
                                                    <p className="text-gray-600 text-sm">
                                                        Service Code: {rate.productCode} | Network: {rate.networkTypeCode}
                                                    </p>
                                                    {rate.deliveryCapabilities && (
                                                        <p className="text-green-600 text-sm mt-1">
                                                            ✅ Estimated Delivery: {rate.deliveryCapabilities.deliveryTypeCode}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-green-600">
                                                        {rate.totalPrice?.[0]?.priceCurrency} {rate.totalPrice?.[0]?.price}
                                                    </div>
                                                    {rate.totalPrice?.[0]?.priceBreakdown && (
                                                        <p className="text-xs text-gray-500">
                                                            Base: {rate.totalPrice[0].priceBreakdown.basePrice}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ship' && (
                    <div className="text-center text-gray-500 py-20">
                        <h3 className="text-xl font-semibold mb-2">📦 Create Shipment</h3>
                        <p>Shipment creation feature coming soon...</p>
                    </div>
                )}

                {activeTab === 'track' && (
                    <div className="text-center text-gray-500 py-20">
                        <h3 className="text-xl font-semibold mb-2">🔍 Track Package</h3>
                        <p>Package tracking feature coming soon...</p>
                    </div>
                )}

                {activeTab === 'pickup' && (
                    <div className="text-center text-gray-500 py-20">
                        <h3 className="text-xl font-semibold mb-2">🚚 Schedule Pickup</h3>
                        <p>Pickup scheduling feature coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShippingPortal; 