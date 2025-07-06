'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Country calling codes mapping
const countryCallingCodes = {
  'AF': '+93', 'AL': '+355', 'DZ': '+213', 'AD': '+376', 'AO': '+244', 'AG': '+1',
  'AR': '+54', 'AM': '+374', 'AU': '+61', 'AT': '+43', 'AZ': '+994', 'BS': '+1',
  'BH': '+973', 'BD': '+880', 'BB': '+1', 'BY': '+375', 'BE': '+32', 'BZ': '+501',
  'BJ': '+229', 'BT': '+975', 'BO': '+591', 'BA': '+387', 'BW': '+267', 'BR': '+55',
  'BN': '+673', 'BG': '+359', 'BF': '+226', 'BI': '+257', 'KH': '+855', 'CM': '+237',
  'CA': '+1', 'CV': '+238', 'CF': '+236', 'TD': '+235', 'CL': '+56', 'CN': '+86',
  'CO': '+57', 'KM': '+269', 'CG': '+242', 'CD': '+243', 'CR': '+506', 'CI': '+225',
  'HR': '+385', 'CU': '+53', 'CY': '+357', 'CZ': '+420', 'DK': '+45', 'DJ': '+253',
  'DM': '+1', 'DO': '+1', 'EC': '+593', 'EG': '+20', 'SV': '+503', 'GQ': '+240',
  'ER': '+291', 'EE': '+372', 'SZ': '+268', 'ET': '+251', 'FJ': '+679', 'FI': '+358',
  'FR': '+33', 'GA': '+241', 'GM': '+220', 'GE': '+995', 'DE': '+49', 'GH': '+233',
  'GR': '+30', 'GD': '+1', 'GT': '+502', 'GN': '+224', 'GW': '+245', 'GY': '+592',
  'HT': '+509', 'HN': '+504', 'HK': '+852', 'HU': '+36', 'IS': '+354', 'IN': '+91',
  'ID': '+62', 'IR': '+98', 'IQ': '+964', 'IE': '+353', 'IL': '+972', 'IT': '+39',
  'JM': '+1', 'JP': '+81', 'JO': '+962', 'KZ': '+7', 'KE': '+254', 'KI': '+686',
  'KP': '+850', 'KR': '+82', 'KW': '+965', 'KG': '+996', 'LA': '+856', 'LV': '+371',
  'LB': '+961', 'LS': '+266', 'LR': '+231', 'LY': '+218', 'LI': '+423', 'LT': '+370',
  'LU': '+352', 'MO': '+853', 'MK': '+389', 'MG': '+261', 'MW': '+265', 'MY': '+60',
  'MV': '+960', 'ML': '+223', 'MT': '+356', 'MH': '+692', 'MR': '+222', 'MU': '+230',
  'MX': '+52', 'FM': '+691', 'MD': '+373', 'MC': '+377', 'MN': '+976', 'ME': '+382',
  'MA': '+212', 'MZ': '+258', 'MM': '+95', 'NA': '+264', 'NR': '+674', 'NP': '+977',
  'NL': '+31', 'NZ': '+64', 'NI': '+505', 'NE': '+227', 'NG': '+234', 'NO': '+47',
  'OM': '+968', 'PK': '+92', 'PW': '+680', 'PS': '+970', 'PA': '+507', 'PG': '+675',
  'PY': '+595', 'PE': '+51', 'PH': '+63', 'PL': '+48', 'PT': '+351', 'QA': '+974',
  'RO': '+40', 'RU': '+7', 'RW': '+250', 'KN': '+1', 'LC': '+1', 'VC': '+1',
  'WS': '+685', 'SM': '+378', 'ST': '+239', 'SA': '+966', 'SN': '+221', 'RS': '+381',
  'SC': '+248', 'SL': '+232', 'SG': '+65', 'SK': '+421', 'SI': '+386', 'SB': '+677',
  'SO': '+252', 'ZA': '+27', 'SS': '+211', 'ES': '+34', 'LK': '+94', 'SD': '+249',
  'SR': '+597', 'SE': '+46', 'CH': '+41', 'SY': '+963', 'TW': '+886', 'TJ': '+992',
  'TZ': '+255', 'TH': '+66', 'TL': '+670', 'TG': '+228', 'TO': '+676', 'TT': '+1',
  'TN': '+216', 'TR': '+90', 'TM': '+993', 'TV': '+688', 'UG': '+256', 'UA': '+380',
  'AE': '+971', 'GB': '+44', 'US': '+1', 'UY': '+598', 'UZ': '+998', 'VU': '+678',
  'VA': '+39', 'VE': '+58', 'VN': '+84', 'YE': '+967', 'ZM': '+260', 'ZW': '+263'
};

const DHLShippingForm = ({ onRateCalculated, onShipmentCreated, initialPackages = [], isCheckoutMode = false, onReceiverChange }) => {
  const [formData, setFormData] = useState({
    plannedShippingDate: '',
    productCode: 'P',
    isCustomsDeclarable: true,
    declaredValue: 0,
    declaredValueCurrency: 'USD',
    incoterm: 'DAP',
    exportDeclaration: {
      exportReason: 'SALE',
      invoice: {
        number: '',
        date: ''
      }
    },
    originAddress: { postalCode: '44600', cityName: 'Kathmandu', countryCode: 'NP', addressLine1: '' },
    destinationAddress: { postalCode: '', cityName: '', countryCode: '', addressLine1: '' },
    shipper: {
      companyName: 'Traditional Alley',
      fullName: 'Anshu Kc',
      email: 'traditionalley2050@gmail.com',
      phone: '9844594187',
      countryCode: '+977'
    },
    recipient: { companyName: '', fullName: '', email: '', phone: '', countryCode: '' },
    packages: initialPackages.length > 0 ? initialPackages : [{ weight: 1, length: 10, width: 10, height: 10, description: '', declaredValue: 0, quantity: 1, commodityCode: '', manufacturingCountryCode: 'NP' }]
  });

  const [rates, setRates] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [dhlLoading, setDhlLoading] = useState(false);
  const [dhlError, setDhlError] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);

  // Responsive helper
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const getAutomaticShippingDate = () => {
    const now = new Date();
    const cutoffHour = 13;
    if (now.getHours() < cutoffHour && now.getDay() >= 1 && now.getDay() <= 5) {
      return { date: now.toISOString().split('T')[0], isToday: true, reason: 'Available for today (before 1:00 PM cutoff)' };
    }
    const nextDay = new Date(now);
    do { nextDay.setDate(nextDay.getDate() + 1); } while (nextDay.getDay() === 0 || nextDay.getDay() === 6);
    return { date: nextDay.toISOString().split('T')[0], isToday: false, reason: 'Next business day (automatic selection)' };
  };

  useEffect(() => {
    const autoDate = getAutomaticShippingDate();
    const invoiceDate = new Date().toISOString().split('T')[0];
    const invoiceNumber = `INV-${Date.now()}`;
    
    setFormData(prev => ({ 
      ...prev, 
      plannedShippingDate: autoDate.date,
      exportDeclaration: {
        ...prev.exportDeclaration,
        invoice: {
          number: invoiceNumber,
          date: invoiceDate,
        }
      }
    }));
    loadCountries();
  }, []);

  useEffect(() => {
    if (isCheckoutMode && typeof onReceiverChange === 'function') {
      onReceiverChange({
        fullName: formData.recipient.fullName || "",
        companyName: formData.recipient.companyName || "",
        email: formData.recipient.email || "",
        phone: formData.recipient.phone || "",
        countryCode: formData.recipient.countryCode || "",
        address: {
          addressLine1: formData.destinationAddress.addressLine1 || "",
          cityName: formData.destinationAddress.cityName || "",
          countryCode: formData.destinationAddress.countryCode || "",
          postalCode: formData.destinationAddress.postalCode || ""
        }
      });
    }
  }, [formData.recipient, formData.destinationAddress]);

  // Update packages when initialPackages changes (when product data loads)
  useEffect(() => {
    if (initialPackages && initialPackages.length > 0) {
      console.log('Updating packages with new data:', initialPackages);
      setFormData(prev => ({
        ...prev,
        packages: initialPackages
      }));
    }
  }, [initialPackages]);

  const loadCountries = async () => {
    try {
      const response = await axios.get('/api/countries');
      if (response.data.success) {
        const sortedCountries = [...response.data.data].sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      }
    } catch (error) {
      console.error('Failed to load countries:', error);
      setDhlError('Failed to load countries list');
    }
  };

  const loadCities = async (countryCode) => {
    try {
      setLoadingCities(true);
      const response = await axios.get(`/api/cities?country=${countryCode}`);
      if (response.data.success) setCities(response.data.data);
    } catch (error) {
      console.error('Failed to load cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      if (section === 'packages' && index !== null) {
        const newPackages = [...prev.packages];
        // Always ensure manufacturingCountryCode is 'NP' for Nepal
        if (field === 'manufacturingCountryCode') {
          newPackages[index] = { ...newPackages[index], [field]: 'NP' };
        } else {
        newPackages[index] = { ...newPackages[index], [field]: value };
        }
        const totalDeclaredValue = newPackages.reduce((total, pkg) => total + (parseFloat(pkg.declaredValue) || 0), 0);
        
        const lineItems = newPackages.map((pkg, i) => ({
          number: i + 1,
          description: pkg.description,
          price: pkg.declaredValue,
          priceCurrency: prev.declaredValueCurrency,
          quantity: {
            value: pkg.quantity,
            unitOfMeasurement: 'PCS'
          },
          commodityCode: pkg.commodityCode,
          manufacturingCountryCode: pkg.manufacturingCountryCode,
          weight: {
            netValue: pkg.weight,
            grossValue: pkg.weight
          }
        }));

        return { 
          ...prev, 
          packages: newPackages, 
          declaredValue: totalDeclaredValue,
          exportDeclaration: {
            ...prev.exportDeclaration,
            lineItems: lineItems
          }
        };
      } else if (section) {
        return { ...prev, [section]: { ...prev[section], [field]: value } };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const isFormValid = () => {
    const { destinationAddress, shipper, recipient, packages } = formData;
    return destinationAddress.countryCode && destinationAddress.cityName && destinationAddress.addressLine1 && destinationAddress.postalCode &&
           shipper.fullName && shipper.email && shipper.phone && recipient.fullName && recipient.email && recipient.phone &&
           packages.length && packages.every(pkg => pkg.weight && pkg.description && pkg.declaredValue);
  };

  const getRates = async () => {
    try {
      setDhlLoading(true);
      setDhlError('');
      console.log('DHL Rate Request Payload:', formData);
      const response = await axios.post('/api/dhl/rates', formData);
      setRates(response.data);
      
      // Store the first rate as selected rate for pricing display
      if (response.data && response.data.success && response.data.data.products && response.data.data.products.length > 0) {
        const firstProduct = response.data.data.products[0];
        const billingPrice = firstProduct.totalPrice.find(p => p.currencyType === 'BILLC');
        if (billingPrice) {
          console.log('🔍 DHL Rate Currency Debug:', {
            currency: billingPrice.priceCurrency,
            price: billingPrice.price,
            currencyType: billingPrice.currencyType
          });
          setSelectedRate({
            price: billingPrice.price,
            currency: billingPrice.priceCurrency
          });
          if (onRateCalculated) {
            onRateCalculated({
              price: billingPrice.price,
              currency: billingPrice.priceCurrency,
              productName: firstProduct.productName,
              deliveryDate: firstProduct.deliveryCapabilities.estimatedDeliveryDateAndTime,
              transitDays: firstProduct.deliveryCapabilities.totalTransitDays
            });
          }
        }
      }
    } catch (error) {
      if (error.response) {
        console.error('DHL Rate Error Response:', error.response.data);
        setDhlError(error.response.data?.message || error.response.data?.error || 'Failed to get rates');
      } else {
        setDhlError('Failed to get rates');
      }
    } finally {
      setDhlLoading(false);
    }
  };

  const createShipment = async () => {
    try {
      setDhlLoading(true);
      setDhlError('');
      const response = await axios.post('/api/dhl/shipments', formData);
      setShipment(response.data);
      if (onShipmentCreated && response.data.success) {
        onShipmentCreated({
          trackingNumber: response.data.data.shipmentTrackingNumber,
          shippingCharge: selectedRate,
          documents: response.data.data.documents
        });
      }
    } catch (error) {
      setDhlError(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setDhlLoading(false);
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
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      padding: '2rem',
      borderRadius: '1rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '1px solid #e2e8f0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        top: '-4rem',
        right: '-4rem',
        width: '8rem',
        height: '8rem',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
        borderRadius: '50%',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-3rem',
        left: '-3rem',
        width: '6rem',
        height: '6rem',
        background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
        borderRadius: '50%',
        zIndex: 1
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
            borderRadius: '50%',
            marginBottom: '1rem',
            boxShadow: '0 10px 25px rgba(251, 191, 36, 0.3)',
            fontSize: '1.5rem'
          }}>
            🚚
          </div>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#1f2937',
            margin: '0 0 0.5rem 0'
          }}>DHL Express Shipping</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Fast, reliable worldwide delivery</p>
        </div>

        <div>
        {dhlError && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'linear-gradient(45deg, #fef2f2, #fee2e2)',
              border: '1px solid #fecaca',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                flexShrink: 0,
                width: '2rem',
                height: '2rem',
                background: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem'
              }}>
                ❌
              </div>
              <div>
                <strong style={{ fontWeight: 600, color: '#991b1b' }}>Error:</strong>
                <span style={{ color: '#b91c1c', marginLeft: '0.5rem' }}>{dhlError}</span>
            </div>
          </div>
        )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : (window.innerWidth >= 1024 ? '1fr 1fr' : '1fr'),
              gap: isMobile ? '1rem' : '2rem',
              width: '100%'
            }}
          >
          {/* Destination Address */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '1rem' : '1.5rem',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
                  borderRadius: '50%',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '1.125rem',
                  color: 'white'
                }}>
                  🌍
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  Destination Address
                </h3>
              </div>
              
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '0.75rem' : '1rem',
                  width: '100%'
                }}
              >
            <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>🏳️</span>
                    Country *
                  </label>
              <select
                value={formData.destinationAddress.countryCode}
                onChange={(e) => {
                  handleInputChange('destinationAddress', 'countryCode', e.target.value);
                  handleInputChange('destinationAddress', 'cityName', '');
                  handleInputChange('destinationAddress', 'postalCode', '');
                  setIsCustomCity(false);
                  const callingCode = countryCallingCodes[e.target.value] || '';
                  handleInputChange('recipient', 'countryCode', callingCode);
                  if (e.target.value) loadCities(e.target.value);
                }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      background: 'white',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s'
                    }}
                required
                    onFocus={(e) => e.target.style.borderColor = '#eab308'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>

            <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>🏙️</span>
                    City *
                  </label>
              <select
                value={isCustomCity ? 'custom' : formData.destinationAddress.cityName}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomCity(true);
                    handleInputChange('destinationAddress', 'cityName', '');
                  } else {
                    setIsCustomCity(false);
                    const selectedCity = cities.find(city => city.name === e.target.value);
                    if (selectedCity) {
                      handleInputChange('destinationAddress', 'cityName', selectedCity.name);
                      if (selectedCity.postal) {
                        handleInputChange('destinationAddress', 'postalCode', selectedCity.postal);
                      }
                    } else {
                       handleInputChange('destinationAddress', 'cityName', e.target.value);
                    }
                  }
                }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      background: 'white',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s'
                    }}
                required
                disabled={loadingCities}
                    onFocus={(e) => e.target.style.borderColor = '#eab308'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">{loadingCities ? 'Loading cities...' : 'Select City'}</option>
                {cities.map((city, index) => (
                  <option key={index} value={city.name}>
                    {city.name} {city.postal && `(${city.postal})`}
                  </option>
                ))}
                <option value="custom">🏙️ Enter custom city</option>
              </select>
            </div>

            {isCustomCity && (
              <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>Custom City Name *</label>
                <input
                  type="text"
                  placeholder="Enter city name"
                  value={formData.destinationAddress.cityName}
                  onChange={(e) => handleInputChange('destinationAddress', 'cityName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        fontSize: '1rem',
                        background: 'white',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s'
                      }}
                  required
                      onFocus={(e) => e.target.style.borderColor = '#eab308'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            )}

            <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>🏠</span>
                    Street Address *
                  </label>
              <input
                type="text"
                placeholder="Street address, house no..."
                value={formData.destinationAddress.addressLine1}
                onChange={(e) => handleInputChange('destinationAddress', 'addressLine1', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      background: 'white',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s'
                    }}
                required
                    onFocus={(e) => e.target.style.borderColor = '#eab308'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>📮</span>
                    Postal Code *
                  </label>
              <input
                type="text"
                placeholder="Postal/ZIP code"
                value={formData.destinationAddress.postalCode}
                onChange={(e) => handleInputChange('destinationAddress', 'postalCode', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      background: 'white',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s'
                    }}
                required
                    onFocus={(e) => e.target.style.borderColor = '#eab308'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
                </div>
            </div>
          </div>

          {/* Recipient Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '1rem' : '1.5rem',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(45deg, #10b981, #059669)',
                  borderRadius: '50%',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '1.125rem',
                  color: 'white'
                }}>
                  👤
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  Recipient Details
                </h3>
              </div>
              
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '0.75rem' : '1rem',
                  width: '100%'
                }}
              >
            <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>👨‍💼</span>
                    Full Name *
                  </label>
              <input
                type="text"
                placeholder="Recipient's full name"
                value={formData.recipient.fullName}
                onChange={(e) => handleInputChange('recipient', 'fullName', e.target.value)}
                style={{
                  width: '100%',
                  fontSize: isMobile ? '1rem' : '1rem',
                  minWidth: 0,
                  padding: '0.5rem 0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s',
                  lineHeight: '38px'
                }}
                required
                onFocus={(e) => e.target.style.borderColor = '#eab308'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>📧</span>
                    Email *
                  </label>
              <input
                type="email"
                placeholder="recipient@example.com"
                value={formData.recipient.email}
                onChange={(e) => handleInputChange('recipient', 'email', e.target.value)}
                style={{
                  width: '100%',
                  fontSize: isMobile ? '1rem' : '1rem',
                  minWidth: 0,
                  padding: '0.5rem 0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s',
                  lineHeight: '38px'
                }}
                required
                onFocus={(e) => e.target.style.borderColor = '#eab308'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>📱</span>
                    Phone *
                  </label>
                  <div style={{
                    display: 'flex',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '2px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'linear-gradient(45deg, #f9fafb, #f3f4f6)',
                      borderRight: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                  {formData.recipient.countryCode || '+--'}
                </div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.recipient.phone}
                  onChange={(e) => handleInputChange('recipient', 'phone', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.75rem',
                        border: 'none',
                        outline: 'none',
                        background: 'white',
                        lineHeight: '37px'
                      }}
                  required
                />
              </div>
            </div>

            <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>🏢</span>
                    Company (Optional)
                  </label>
              <input
                type="text"
                placeholder="Company name"
                value={formData.recipient.companyName}
                onChange={(e) => handleInputChange('recipient', 'companyName', e.target.value)}
                style={{
                  width: '100%',
                  fontSize: isMobile ? '1rem' : '1rem',
                  minWidth: 0,
                  padding: '0.5rem 0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s',
                  lineHeight: '42px',
                  minHeight: '42px'
                }}
                onFocus={(e) => e.target.style.borderColor = '#eab308'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                </div>
                </div>
                </div>

          {/* Actions */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            {!isFormValid() && (
              <div style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: 'linear-gradient(45deg, #fffbeb, #fef3c7)',
                border: '1px solid #fcd34d',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#d97706', fontSize: '1.125rem' }}>⚠️</span>
                <span style={{ color: '#92400e', fontWeight: 500 }}>
                  Please fill in all required fields to proceed
                </span>
                </div>
            )}
            
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : (window.innerWidth >= 640 ? 'row' : 'column'),
              gap: isMobile ? '0.75rem' : '1rem',
              width: '100%'
            }}>
          <button
                onClick={getRates}
                disabled={!isFormValid() || dhlLoading}
                style={{
                  flex: 1,
                  width: isMobile ? '100%' : undefined,
                  minWidth: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '1rem 2rem',
                  borderRadius: '1rem',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  transition: 'all 0.3s',
                  border: 'none',
                  cursor: !isFormValid() || dhlLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  background: !isFormValid() || dhlLoading ? '#d1d5db' : 'linear-gradient(45deg, #3b82f6, #2563eb)',
                  color: !isFormValid() || dhlLoading ? '#9ca3af' : 'white'
                }}
                onMouseOver={(e) => {
                  if (!(!isFormValid() || dhlLoading)) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                    e.target.style.background = 'linear-gradient(45deg, #2563eb, #1d4ed8)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!(!isFormValid() || dhlLoading)) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.target.style.background = 'linear-gradient(45deg, #3b82f6, #2563eb)';
                  }
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>📦</span>
                {dhlLoading ? 'Getting Rates...' : 'Get Shipping Rates'}
          </button>

              {rates && rates.length > 0 && (
              <button
                onClick={createShipment}
                  style={{
                    flex: 1,
                    width: isMobile ? '100%' : undefined,
                    minWidth: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '1rem 2rem',
                    borderRadius: '1rem',
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    transition: 'all 0.3s',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    background: 'linear-gradient(45deg, #10b981, #059669)',
                    color: 'white'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                    e.target.style.background = 'linear-gradient(45deg, #059669, #047857)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.target.style.background = 'linear-gradient(45deg, #10b981, #059669)';
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🚀</span>
                  Create Shipment
              </button>
            )}
          </div>
                        </div>
        </div>
      </div>
    </div>
  );
};

export default DHLShippingForm;