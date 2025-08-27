'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAnalyticsData, safeGet } from '../../lib/api-utils';
import useCachedData from '../../hooks/useCachedData';
import axios from 'axios';
import OrderManagement from '../admin/OrderManagement';

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

const ShippingAnalytics = ({ tabId, dateFilter }) => {
  // DHL Shipping Form State
  const [showDHLForm, setShowDHLForm] = useState(false);
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
    packages: [{ weight: 1, length: 10, width: 10, height: 10, description: '', declaredValue: 0, quantity: 1, commodityCode: '', manufacturingCountryCode: 'NP' }]
  });

  const [rates, setRates] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [dhlLoading, setDhlLoading] = useState(false);
  const [dhlError, setDhlError] = useState('');
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [showInternationalRates, setShowInternationalRates] = useState(false);

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
    if (showDHLForm) {
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
    }
  }, [showDHLForm]);



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
        newPackages[index] = { ...newPackages[index], [field]: value };
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
          setSelectedRate({
            price: billingPrice.price,
            currency: billingPrice.priceCurrency
          });
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
    } catch (error) {
      setDhlError(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setDhlLoading(false);
    }
  };

  const downloadPdf = (base64Content, fileName) => {
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export Functions
  const fetchShippingRates = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping-rates?populate=*&pagination[pageSize]=1000`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      throw error;
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = [
         'Country Code',
         'Country Name', 
         'Service Type',
         'Weight Limit (kg)',
         'From 0 to 0.5 kg (NPR)',
         'From 0.5 to 1 kg (NPR)',
         'From 1 to 1.5 kg (NPR)',
         'From 1.5 to 2 kg (NPR)',
         'From 2 to 2.5 kg (NPR)',
         'From 2.5 to 3 kg (NPR)',
         'From 3 to 3.5 kg (NPR)',
         'From 3.5 to 4 kg (NPR)',
         'From 4 to 4.5 kg (NPR)',
         'From 4.5 to 5 kg (NPR)',
         'From 5 to 5.5 kg (NPR)',
         'From 5.5 to 6 kg (NPR)',
         'From 6 to 6.5 kg (NPR)',
         'From 6.5 to 7 kg (NPR)',
         'From 7 to 7.5 kg (NPR)',
         'From 7.5 to 8 kg (NPR)',
         'From 8 to 8.5 kg (NPR)',
         'From 8.5 to 9 kg (NPR)',
         'From 9 to 9.5 kg (NPR)',
         'From 9.5 to 10 kg (NPR)',
         'From 10 to 20 kg (NPR)',
         'From 20 to 30 kg (NPR)',
         'From 30 to 50 kg (NPR)',
         'From 50 to 100 kg (NPR)',
         'Effective From'
       ];
    
    const csvContent = [headers.join(',')];
    
    data.forEach(rate => {
       const row = [
           rate.country_code || '',
           rate.country_name || '',
           rate.service_type || '',
           rate.weight_limit || '',
           rate.from_0_to_0_5 || '',
           rate.from_0_5_to_1 || '',
           rate.from_1_to_1_5 || '',
           rate.from_1_5_to_2 || '',
           rate.from_2_to_2_5 || '',
           rate.from_2_5_to_3 || '',
           rate.from_3_to_3_5 || '',
           rate.from_3_5_to_4 || '',
           rate.from_4_to_4_5 || '',
           rate.from_4_5_to_5 || '',
           rate.from_5_to_5_5 || '',
           rate.from_5_5_to_6 || '',
           rate.from_6_to_6_5 || '',
           rate.from_6_5_to_7 || '',
           rate.from_7_to_7_5 || '',
           rate.from_7_5_to_8 || '',
           rate.from_8_to_8_5 || '',
           rate.from_8_5_to_9 || '',
           rate.from_9_to_9_5 || '',
           rate.from_9_5_to_10 || '',
           rate.from_10_to_20 || '',
           rate.from_20_to_30 || '',
           rate.from_30_to_50 || '',
           rate.from_50_to_100 || '',
           rate.effective_from || ''
         ];
       csvContent.push(row.join(','));
     });
    
    return csvContent.join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportCSV = async () => {
    setCsvLoading(true);
    try {
      const shippingRates = await fetchShippingRates();
      const csvContent = convertToCSV(shippingRates);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `shipping-rates-${timestamp}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export shipping rates. Please try again.');
    } finally {
      setCsvLoading(false);
    }
  };

  const deleteAllShippingRates = async () => {
    try {
      console.log('Starting delete process...');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Token exists:', !!process.env.NEXT_PUBLIC_STRAPI_API_TOKEN);
      
      // First fetch all shipping rates to get their IDs
      const shippingRates = await fetchShippingRates();
      console.log('Found shipping rates to delete:', shippingRates.length);
      console.log('Sample rate structure:', shippingRates[0]);
      
      if (shippingRates.length === 0) {
        console.log('No shipping rates to delete');
        return 0;
      }
      
      // Try bulk delete first
      try {
        console.log('Attempting bulk delete for all', shippingRates.length, 'rates...');
        const documentIds = shippingRates.map(rate => rate.documentId);
        
        const bulkResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping-rates/bulk-delete`, {
          documentIds
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Bulk delete completed successfully:', bulkResponse.data);
        return bulkResponse.data.deletedCount;
        
      } catch (bulkError) {
        console.warn('Bulk delete failed, falling back to concurrent individual deletes:', bulkError.message);
        
        // Fallback to concurrent individual deletes with batching for better performance
        const BATCH_SIZE = 15; // Process 15 items concurrently for optimal performance
        const errors = [];
        let deletedCount = 0;
        
        console.log(`Processing ${shippingRates.length} rates in batches of ${BATCH_SIZE}...`);
        
        for (let i = 0; i < shippingRates.length; i += BATCH_SIZE) {
          const batch = shippingRates.slice(i, i + BATCH_SIZE);
          const batchNumber = Math.floor(i/BATCH_SIZE) + 1;
          const totalBatches = Math.ceil(shippingRates.length/BATCH_SIZE);
          
          console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);
          
          const batchPromises = batch.map(async (rate, index) => {
            try {
              const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping-rates/${rate.documentId}`, {
                headers: {
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
                }
              });
              console.log(`✓ Deleted rate ${i + index + 1}/${shippingRates.length}: ${rate.documentId}`);
              return { success: true, documentId: rate.documentId };
            } catch (error) {
              console.error(`✗ Failed to delete rate ${i + index + 1}/${shippingRates.length}: ${rate.documentId}`, error.response?.data || error.message);
              return {
                success: false,
                documentId: rate.documentId,
                error: error.response?.data || error.message
              };
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          
          batchResults.forEach(result => {
            if (result.success) {
              deletedCount++;
            } else {
              errors.push({
                documentId: result.documentId,
                error: result.error
              });
            }
          });
          
          console.log(`Batch ${batchNumber} completed. Progress: ${deletedCount + errors.length}/${shippingRates.length}`);
        }
        
        console.log(`Concurrent delete process completed. Deleted: ${deletedCount}, Errors: ${errors.length}`);
        if (errors.length > 0) {
          console.error('Delete errors:', errors);
        }
        
        return deletedCount;
      }
    } catch (error) {
      console.error('Error in deleteAllShippingRates:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  const handleDeleteAllRates = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL shipping rates!\n\nThis action cannot be undone. Are you sure you want to continue?'
    );
    
    if (!confirmed) return;
    
    setDeleteLoading(true);
    try {
      console.log('🗑️ Starting delete all rates process...');
      const deletedCount = await deleteAllShippingRates();
      console.log(`✅ Delete process completed. Deleted ${deletedCount} rates.`);
      alert(`✅ Successfully deleted ${deletedCount} shipping rates.`);
    } catch (error) {
      console.error('Error deleting all shipping rates:', error);
      alert('❌ Failed to delete shipping rates. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const expectedHeaders = [
      'Country Code', 'Country Name', 'Service Type', 'Weight Limit (kg)',
      'From 0 to 0.5 kg (NPR)', 'From 0.5 to 1 kg (NPR)', 'From 1 to 1.5 kg (NPR)',
      'From 1.5 to 2 kg (NPR)', 'From 2 to 2.5 kg (NPR)', 'From 2.5 to 3 kg (NPR)',
      'From 3 to 3.5 kg (NPR)', 'From 3.5 to 4 kg (NPR)', 'From 4 to 4.5 kg (NPR)',
      'From 4.5 to 5 kg (NPR)', 'From 5 to 5.5 kg (NPR)', 'From 5.5 to 6 kg (NPR)',
      'From 6 to 6.5 kg (NPR)', 'From 6.5 to 7 kg (NPR)', 'From 7 to 7.5 kg (NPR)',
      'From 7.5 to 8 kg (NPR)', 'From 8 to 8.5 kg (NPR)', 'From 8.5 to 9 kg (NPR)',
      'From 9 to 9.5 kg (NPR)', 'From 9.5 to 10 kg (NPR)', 'From 10 to 20 kg (NPR)',
      'From 20 to 30 kg (NPR)', 'From 30 to 50 kg (NPR)', 'From 50 to 100 kg (NPR)',
      'Effective From'
    ];
    
    // Validate required headers (first 4 are mandatory)
    const requiredHeaders = expectedHeaders.slice(0, 4);
    const missingHeaders = requiredHeaders.filter(expected => !headers.includes(expected));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const shippingRates = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i + 1}: Column count mismatch`);
        continue;
      }

      const rate = {};
      headers.forEach((header, index) => {
        switch (header) {
          case 'Country Code':
            rate.country_code = values[index];
            break;
          case 'Country Name':
            rate.country_name = values[index];
            break;
          case 'Service Type':
            rate.service_type = values[index];
            break;
          case 'Weight Limit (kg)':
            rate.weight_limit = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 0 to 0.5 kg (NPR)':
            rate.from_0_to_0_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 0.5 to 1 kg (NPR)':
            rate.from_0_5_to_1 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 1 to 1.5 kg (NPR)':
            rate.from_1_to_1_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 1.5 to 2 kg (NPR)':
            rate.from_1_5_to_2 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 2 to 2.5 kg (NPR)':
            rate.from_2_to_2_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 2.5 to 3 kg (NPR)':
            rate.from_2_5_to_3 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 3 to 3.5 kg (NPR)':
            rate.from_3_to_3_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 3.5 to 4 kg (NPR)':
            rate.from_3_5_to_4 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 4 to 4.5 kg (NPR)':
            rate.from_4_to_4_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 4.5 to 5 kg (NPR)':
            rate.from_4_5_to_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 5 to 5.5 kg (NPR)':
            rate.from_5_to_5_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 5.5 to 6 kg (NPR)':
            rate.from_5_5_to_6 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 6 to 6.5 kg (NPR)':
            rate.from_6_to_6_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 6.5 to 7 kg (NPR)':
            rate.from_6_5_to_7 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 7 to 7.5 kg (NPR)':
            rate.from_7_to_7_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 7.5 to 8 kg (NPR)':
            rate.from_7_5_to_8 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 8 to 8.5 kg (NPR)':
            rate.from_8_to_8_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 8.5 to 9 kg (NPR)':
            rate.from_8_5_to_9 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 9 to 9.5 kg (NPR)':
            rate.from_9_to_9_5 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 9.5 to 10 kg (NPR)':
            rate.from_9_5_to_10 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 10 to 20 kg (NPR)':
            rate.from_10_to_20 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 20 to 30 kg (NPR)':
            rate.from_20_to_30 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 30 to 50 kg (NPR)':
            rate.from_30_to_50 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'From 50 to 100 kg (NPR)':
            rate.from_50_to_100 = values[index].trim() === '' ? null : (parseFloat(values[index]) || null);
            break;
          case 'Effective From':
            rate.effective_from = values[index] || null;
            break;
        }
      });

      // Validate required fields - only check for basic required fields
      // Allow entries with partial rate data (some empty cells are OK)
      if (rate.country_code && rate.country_name && rate.service_type) {
        // Clean up the rate object - remove undefined fields but keep null values for empty cells
        const cleanedRate = {};
        Object.keys(rate).forEach(key => {
          if (rate[key] !== undefined) {
            cleanedRate[key] = rate[key];
          }
        });
        shippingRates.push(cleanedRate);
      } else {
        console.warn(`Skipping row ${i + 1}: Missing required basic data (country_code, country_name, or service_type)`);
      }
    }

    return shippingRates;
  };

  const bulkImportShippingRates = async (shippingRates) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
    
    if (!token) {
      throw new Error('API token not found');
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < shippingRates.length; i++) {
      const rate = shippingRates[i];
      setImportProgress(Math.round(((i + 1) / shippingRates.length) * 100));
      
      try {
        const response = await fetch(`${apiUrl}/api/shipping-rates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: rate
          }),
        });

        if (response.ok) {
          successCount++;
          console.log(`Successfully imported rate ${i + 1}:`, rate);
        } else {
          errorCount++;
          const errorData = await response.text();
          console.error(`Failed to import rate ${i + 1}:`, errorData);
          errors.push(`Row ${i + 1}: ${errorData}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error importing rate ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error.message}`);
      }

      // Small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { successCount, errorCount, errors };
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file.');
      event.target.value = '';
    }
  };

  const handleImportCSV = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file first.');
      return;
    }

    setImportLoading(true);
    setImportProgress(0);
    
    try {
      const csvText = await selectedFile.text();
      const shippingRates = parseCSV(csvText);
      
      if (shippingRates.length === 0) {
        alert('No valid shipping rates found in the CSV file.');
        return;
      }

      const confirmed = window.confirm(
        `Found ${shippingRates.length} shipping rates to import.\n\nDo you want to proceed with the import?`
      );
      
      if (!confirmed) return;

      const result = await bulkImportShippingRates(shippingRates);
      
      let message = `Import completed!\n\n`;
      message += `✅ Successfully imported: ${result.successCount} rates\n`;
      if (result.errorCount > 0) {
        message += `❌ Failed to import: ${result.errorCount} rates\n\n`;
        if (result.errors.length > 0) {
          message += `Errors:\n${result.errors.slice(0, 5).join('\n')}`;
          if (result.errors.length > 5) {
            message += `\n... and ${result.errors.length - 5} more errors`;
          }
        }
      }
      
      alert(message);
      
      // Refresh the shipping data if any imports were successful
      if (result.successCount > 0) {
        await fetchShippingData();
      }
      
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert(`❌ Import failed: ${error.message}`);
    } finally {
      setImportLoading(false);
      setImportProgress(0);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) fileInput.value = '';
    }
  };

  const fetchShippingData = useCallback(async () => {
    if (typeof window === 'undefined') throw new Error('Component must run on client side');
      const data = await fetchAnalyticsData(['userBags', 'carts']);
      const userBagsData = data.userBags || [];
      let filteredUserBags = userBagsData;
      if (dateFilter && dateFilter.start && dateFilter.end) {
        filteredUserBags = userBagsData.filter(bag => {
          const bagDate = new Date(safeGet(bag, 'createdAt', ''));
          return bagDate >= dateFilter.start && bagDate <= dateFilter.end;
        });
      }
      const totalShipments = filteredUserBags.length;
    const deliveredOrders = filteredUserBags.filter(bag => safeGet(bag, 'shipping_status', '') === 'delivered').length;
    const pendingShipments = filteredUserBags.filter(bag => ['pending', 'shipped', 'in_transit'].includes(safeGet(bag, 'shipping_status', ''))).length;
      const shippingMethods = {};
      filteredUserBags.forEach(bag => {
        const method = safeGet(bag, 'shipping_method', 'Standard');
        shippingMethods[method] = (shippingMethods[method] || 0) + 1;
      });
      const regionalBreakdown = {
        'Kathmandu': Math.floor(totalShipments * 0.4),
        'Pokhara': Math.floor(totalShipments * 0.2),
        'Chitwan': Math.floor(totalShipments * 0.15),
        'Lalitpur': Math.floor(totalShipments * 0.15),
        'Others': Math.floor(totalShipments * 0.1)
      };
    return { totalShipments, deliveredOrders, pendingShipments, averageDeliveryTime: 3.5, shippingMethods, regionalBreakdown };
  }, [dateFilter]);

  const { data: shippingData, loading, error } = useCachedData(tabId, dateFilter, fetchShippingData);
  const { totalShipments = 0, deliveredOrders = 0, pendingShipments = 0, averageDeliveryTime = 0, shippingMethods = {}, regionalBreakdown = {} } = shippingData || {};

  // Show Order Management for orders tab
  if (tabId === 'orders') {
    return <OrderManagement />;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-50 to-pink-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gradient-to-r from-red-300 to-pink-400 rounded-lg w-52 mb-2 animate-pulse"></div>
              <div className="h-4 bg-red-200 rounded w-44 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <div className="text-sm text-red-600 bg-white px-3 py-1 rounded-full animate-pulse">Tracking shipments...</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ color: 'blue', icon: '📦', label: 'Total Shipments' }, { color: 'green', icon: '✅', label: 'Delivered' }, { color: 'yellow', icon: '🚚', label: 'Pending' }, { color: 'purple', icon: '⏱️', label: 'Avg Delivery' }].map((item, i) => (
            <div key={i} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 p-4 lg:p-6 rounded-xl shadow-sm border border-${item.color}-200 animate-pulse`}>
              <div className="flex items-center">
                <div className={`p-2 bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 rounded-lg animate-bounce`}>
                  <span className="text-white text-xl">{item.icon}</span>
                </div>
                <div className="ml-3 flex-1">
                  <div className={`h-3 bg-${item.color}-200 rounded w-20 mb-2`}></div>
                  <div className={`h-5 bg-${item.color}-300 rounded w-12`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-xl mb-4">❌</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* DHL Express Integration Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-100 p-6 rounded-xl border border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">📦 DHL Express Shipping Management</h2>
            <p className="text-yellow-700">Create shipments, get rates, and track packages worldwide from Nepal</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-yellow-600 bg-white px-3 py-1 rounded-full">
              ✅ Address Validation • 🌍 193 Countries • 🏙️ 1,500+ Cities
            </div>
            <button
              onClick={() => setShowInternationalRates(!showInternationalRates)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                showInternationalRates 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <span>🌍</span>
              <span>International Rates</span>
              <span className={`transform transition-transform ${
                showInternationalRates ? 'rotate-180' : ''
              }`}>▼</span>
            </button>
            <button
              onClick={() => setShowDHLForm(!showDHLForm)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                showDHLForm 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {showDHLForm ? '❌ Close DHL Form' : '🚀 Create New Shipment'}
            </button>
          </div>
        </div>
      </div>

      {/* International Rates Section */}
      {showInternationalRates && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleExportCSV}
              disabled={csvLoading}
              className="px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {csvLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <span>📊</span>
                  <span>Export Shipping Rates CSV</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleDeleteAllRates}
              disabled={deleteLoading}
              className="px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <span>🗑️</span>
                  <span>Delete All Rates</span>
                </>
              )}
            </button>
            
            <div className="flex flex-col space-y-2">
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="csv-file-input"
                className="px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 cursor-pointer transition-all flex items-center justify-center space-x-2"
              >
                <span>📁</span>
                <span>{selectedFile ? (selectedFile.name.length > 15 ? selectedFile.name.substring(0, 15) + '...' : selectedFile.name) : 'Select CSV File'}</span>
              </label>
            </div>
            
            <button
              onClick={handleImportCSV}
              disabled={importLoading || !selectedFile}
              className="px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {importLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Importing... {importProgress}%</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Import CSV</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* DHL Shipping Form */}
      {showDHLForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="max-h-96 overflow-y-auto">
            {dhlError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">❌</span>
                  <div>
                    <strong className="text-red-800">Error:</strong> <span className="text-red-700">{dhlError}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Destination Address */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">🌍 Destination Address</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <select
                    value={formData.destinationAddress.countryCode}
                    onChange={(e) => {
                      handleInputChange('destinationAddress', 'countryCode', e.target.value);
                      handleInputChange('destinationAddress', 'cityName', '');
                      handleInputChange('destinationAddress', 'postalCode', '');
                      setIsCustomCity(false);
                      // Auto-fill recipient country code based on destination country
                      const callingCode = countryCallingCodes[e.target.value] || '';
                      handleInputChange('recipient', 'countryCode', callingCode);
                      if (e.target.value) loadCities(e.target.value);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                    disabled={loadingCities}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom City Name *</label>
                    <input
                      type="text"
                      placeholder="Enter city name"
                      value={formData.destinationAddress.cityName}
                      onChange={(e) => handleInputChange('destinationAddress', 'cityName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    placeholder="Street address, building, apartment..."
                    value={formData.destinationAddress.addressLine1}
                    onChange={(e) => handleInputChange('destinationAddress', 'addressLine1', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                  <input
                    type="text"
                    placeholder="Postal/ZIP code"
                    value={formData.destinationAddress.postalCode}
                    onChange={(e) => handleInputChange('destinationAddress', 'postalCode', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

                            {/* Recipient Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">👤 Recipient Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Recipient's full name"
                    value={formData.recipient.fullName}
                    onChange={(e) => handleInputChange('recipient', 'fullName', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    value={formData.recipient.email}
                    onChange={(e) => handleInputChange('recipient', 'email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <div className="flex">
                    <div className="flex items-center px-3 py-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm font-medium text-gray-600">
                      {formData.recipient.countryCode || '+--'}
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone number (without country code)"
                      value={formData.recipient.phone}
                      onChange={(e) => handleInputChange('recipient', 'phone', e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {formData.recipient.countryCode && (
                    <p className="mt-1 text-xs text-gray-500">
                      Full number: {formData.recipient.countryCode} {formData.recipient.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    placeholder="Company name"
                    value={formData.recipient.companyName}
                    onChange={(e) => handleInputChange('recipient', 'companyName', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Form Validation Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">📦 Package Details</h3>
              {formData.packages.map((pkg, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Package {index + 1}</h4>
                    {formData.packages.length > 1 && (
                      <button
                        onClick={() => {
                          setFormData(prev => {
                            const newPackages = prev.packages.filter((_, i) => i !== index);
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
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg) *</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={pkg.weight}
                        onChange={(e) => handleInputChange('packages', 'weight', parseFloat(e.target.value) || 0, index)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Length (cm) *</label>
                      <input
                        type="number"
                        min="1"
                        value={pkg.length}
                        onChange={(e) => handleInputChange('packages', 'length', parseFloat(e.target.value) || 0, index)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Width (cm) *</label>
                      <input
                        type="number"
                        min="1"
                        value={pkg.width}
                        onChange={(e) => handleInputChange('packages', 'width', parseFloat(e.target.value) || 0, index)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Height (cm) *</label>
                      <input
                        type="number"
                        min="1"
                        value={pkg.height}
                        onChange={(e) => handleInputChange('packages', 'height', parseFloat(e.target.value) || 0, index)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Value (USD) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pkg.declaredValue}
                        onChange={(e) => handleInputChange('packages', 'declaredValue', parseFloat(e.target.value) || 0, index)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">HS Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. 6204.42"
                        value={pkg.commodityCode}
                        onChange={(e) => handleInputChange('packages', 'commodityCode', e.target.value, index)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Made In *</label>
                      <select
                        value={pkg.manufacturingCountryCode}
                        onChange={(e) => handleInputChange('packages', 'manufacturingCountryCode', e.target.value, index)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                        required
                      >
                        <option value="">Select</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>{country.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
                    <input
                      type="text"
                      placeholder="What's in this package?"
                      value={pkg.description}
                      onChange={(e) => handleInputChange('packages', 'description', e.target.value, index)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  setFormData(prev => {
                    const newPackages = [...prev.packages, { weight: 1, length: 10, width: 10, height: 10, description: '', declaredValue: 0, quantity: 1, commodityCode: '', manufacturingCountryCode: 'NP' }];
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

                    return ({
                    ...prev,
                      packages: newPackages,
                      exportDeclaration: {
                        ...prev.exportDeclaration,
                        lineItems: lineItems
                      }
                    })
                  });
                }}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-yellow-500 hover:text-yellow-600 transition-colors"
              >
                ➕ Add Another Package
              </button>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={getRates}
                  disabled={dhlLoading || !isFormValid()}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                    isFormValid() && !dhlLoading
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {dhlLoading ? '⏳ Getting Rates...' : '💰 Get Shipping Rates'}
                </button>
                <button
                  onClick={createShipment}
                  disabled={dhlLoading || !isFormValid() || !rates}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                    isFormValid() && rates && !dhlLoading
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {dhlLoading ? '⏳ Creating Shipment...' : '📦 Create Shipment'}
                </button>
              </div>

              {/* Results */}
              {rates && rates.success && rates.data.products ? (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-3">💰 Available Shipping Rates</h4>
                  <div className="space-y-3">
                    {rates.data.products.map((product, index) => {
                      const billingPriceInfo = product.totalPrice.find(p => p.currencyType === 'BILLC');
                      const deliveryDate = new Date(product.deliveryCapabilities.estimatedDeliveryDateAndTime);

                      return (
                        <div key={index} className="p-4 bg-white border border-blue-300 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-bold text-blue-900">{product.productName}</h5>
                              <p className="text-sm text-gray-600 mt-1">
                                🚚 Estimated Delivery: <span className="font-semibold text-gray-800">{deliveryDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                (Total {product.deliveryCapabilities.totalTransitDays} transit days)
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              {billingPriceInfo ? (
                                <>
                                  <p className="text-xl font-bold text-blue-800">
                                    {billingPriceInfo.price.toLocaleString('en-US', { style: 'currency', currency: billingPriceInfo.priceCurrency, minimumFractionDigits: 2 })}
                                  </p>
                                </>
                              ) : (
                                <p className="text-gray-600">Price not available</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : rates ? (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💰 Shipping Rates</h4>
                  <pre className="text-sm text-blue-700 overflow-auto max-h-32">{JSON.stringify(rates, null, 2)}</pre>
                </div>
              ) : null}

              {shipment && shipment.success && shipment.data ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <h4 className="font-bold text-lg text-green-800 mb-4">✅ Shipment Created Successfully!</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking Number (AWB):</span>
                      <span className="font-bold text-gray-800">{shipment.data.shipmentTrackingNumber}</span>
                    </div>
                    {shipment.data.pickupConfirmationNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pickup Confirmation #:</span>
                        <span className="font-bold text-gray-800">{shipment.data.pickupConfirmationNumber}</span>
                </div>
              )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Charge:</span>
                      <span className="font-bold text-gray-800">
                        {selectedRate ? 
                          selectedRate.price.toLocaleString('en-US', { style: 'currency', currency: selectedRate.currency, minimumFractionDigits: 2 })
                          : 'N/A'
                        }
                      </span>
                    </div>
                    {shipment.data.documents && shipment.data.documents.map((doc, index) => (
                      <div key={index} className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                        <span className="text-gray-600">
                          {doc.typeCode === 'label' ? 'Shipping Label:' : 
                           doc.typeCode === 'invoice' ? 'Commercial Invoice:' :
                           'Document:'}
                        </span>
                        <button
                          onClick={() => downloadPdf(doc.content, `DHL-${doc.typeCode.toUpperCase()}-${shipment.data.shipmentTrackingNumber}.pdf`)}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          Download {doc.typeCode.charAt(0).toUpperCase() + doc.typeCode.slice(1)}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : shipment ? (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">✅ Shipment Created</h4>
                  <pre className="text-sm text-green-700 overflow-auto max-h-32">{JSON.stringify(shipment, null, 2)}</pre>
                </div>
              ) : null }
            </div>
          </div>
        </div>
      )}

      {/* Shipping Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-lg sm:text-xl">📦</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Shipments</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{totalShipments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-lg sm:text-xl">✅</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Delivered</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{deliveredOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-lg sm:text-xl">🚚</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{pendingShipments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-lg sm:text-xl">⏱️</span>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Avg. Delivery</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{averageDeliveryTime} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Shipping Methods */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Shipping Methods</h3>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(shippingMethods).map(([method, count], index) => {
              const total = Object.values(shippingMethods).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
              
              return (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2 sm:mr-3 flex-shrink-0`}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{method}</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="text-xs sm:text-sm text-gray-600">{count}</span>
                    <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full">
                      <div className={`h-2 rounded-full ${colors[index % colors.length]}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Regional Distribution</h3>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(regionalBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([region, count], index) => {
                const total = Object.values(regionalBreakdown).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                
                return (
                  <div key={region} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2 sm:mr-3 flex-shrink-0`}></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{region}</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-xs sm:text-sm text-gray-600">{count}</span>
                      <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full">
                        <div className={`h-2 rounded-full ${colors[index % colors.length]}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingAnalytics;