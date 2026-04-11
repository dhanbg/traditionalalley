import axios from 'axios';
import { getAutomaticShippingDate, formatDHLDate } from './date-utils.js';

class DHLExpressService {
  constructor() {
    this.baseURL = process.env.DHL_API_BASE_URL;
    this.apiKey = process.env.DHL_API_KEY;
    this.apiSecret = process.env.DHL_API_SECRET;
    this.accountNumber = process.env.DHL_ACCOUNT_NUMBER;
    
    // Create Basic Auth header manually
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
    
    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${credentials}`
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`DHL API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Authorization Header:', config.headers.Authorization ? 'Basic ***PRESENT***' : 'MISSING');
        return config;
      },
      (error) => {
        console.error('DHL API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`DHL API Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        console.error('DHL API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get shipping rates for a shipment
   * @param {Object} rateRequest - Rate request parameters
   * @returns {Promise<Object>} Rate response
   */
  async getRates(rateRequest) {
    try {
      // Get automatic shipping date with smart defaults
      const shippingDateInfo = getAutomaticShippingDate(rateRequest.plannedShippingDate);
      
      console.log(`📅 Shipping Date: ${shippingDateInfo.dateString} (${shippingDateInfo.dayOfWeek})`);
      console.log(`📋 Date Selection: ${shippingDateInfo.reason}`);
      if (shippingDateInfo.isAutomatic) {
        console.log(`🤖 Automatically selected: ${shippingDateInfo.isToday ? 'Today' : 'Next business day'}`);
      }

      // Correct payload format based on DHL API validation errors
      const payload = {
        customerDetails: {
          shipperDetails: {
            postalCode: rateRequest.originAddress.postalCode,
            cityName: rateRequest.originAddress.cityName,
            countryCode: rateRequest.originAddress.countryCode
          },
          receiverDetails: {
            postalCode: rateRequest.destinationAddress.postalCode,
            cityName: rateRequest.destinationAddress.cityName,
            countryCode: rateRequest.destinationAddress.countryCode
          }
        },
        accounts: [{
          typeCode: 'shipper',
          number: this.accountNumber
        }],
        plannedShippingDateAndTime: shippingDateInfo.formatted,
        unitOfMeasurement: 'metric',
        isCustomsDeclarable: rateRequest.isCustomsDeclarable || false,
        packages: rateRequest.packages?.map(pkg => ({
          weight: pkg.weight,
          dimensions: {
            length: pkg.length,
            width: pkg.width,
            height: pkg.height
          }
        })) || []
      };

      // Add monetary amount only if customs declarable
      if (rateRequest.isCustomsDeclarable) {
        payload.monetaryAmount = [
          {
            typeCode: 'declaredValue',
            value: rateRequest.packages?.reduce((total, pkg) => total + (pkg.declaredValue || 0), 0) || 0,
            currency: rateRequest.declaredValueCurrency || 'USD'
          }
        ];
      }

      console.log('DHL Rates Request Payload:', JSON.stringify(payload, null, 2));

      const response = await this.client.post('/rates', payload);
      
      // Log available products and filter to DHL Express Worldwide (product code "P")
      if (response.data && response.data.products) {
        const originalProductCount = response.data.products.length;
        
        // Log all available products for debugging
        console.log('Available DHL products:');
        response.data.products.forEach((product, index) => {
          console.log(`  ${index + 1}. Code: ${product.productCode}, Name: ${product.productName}`);
        });
        
        // Show both available services from Nepal with full details
        console.log('📋 Available DHL services from Nepal:');
        response.data.products.forEach((product, index) => {
          const price = product.totalPrice?.find(p => p.currencyType === 'BILLC');
          console.log(`  ${index + 1}. ${product.productCode} - ${product.productName}`);
          console.log(`     Price: ${price?.priceCurrency} ${price?.price}`);
          console.log(`     Transit: ${product.deliveryCapabilities?.totalTransitDays} days`);
        });
        
        // For comparison purposes, let's show both services but still filter to EXPRESS WORLDWIDE as default
        if (response.data.products.length > 1) {
          const worldwideProduct = response.data.products.find(p => p.productCode === 'D');
          const expressProduct = response.data.products.find(p => p.productCode === 'T');
          
          if (worldwideProduct && expressProduct) {
            const worldwidePrice = worldwideProduct.totalPrice?.find(p => p.currencyType === 'BILLC')?.price || 0;
            const expressPrice = expressProduct.totalPrice?.find(p => p.currencyType === 'BILLC')?.price || 0;
            const difference = expressPrice - worldwidePrice;
            const percentDiff = worldwidePrice > 0 ? ((difference / worldwidePrice) * 100).toFixed(1) : 0;
            
            console.log(`💡 Price Comparison:`);
            console.log(`   EXPRESS 12:00 (T) costs ${difference.toFixed(2)} NPR more (${percentDiff}% premium)`);
          }
        }
        
        // Filter for DHL Express Worldwide (product code "D") as the preferred option
        const worldwideProducts = response.data.products.filter(product => 
          product.productCode === 'D'
        );
        
        if (worldwideProducts.length > 0) {
          response.data.products = worldwideProducts;
          console.log(`✅ Using DHL Express Worldwide (D) as the default service`);
        } else {
          console.log('⚠️  EXPRESS WORLDWIDE not found, showing all available services');
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('DHL Rates Error Details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      throw this.handleError(error, 'Failed to get shipping rates');
    }
  }

  /**
   * Create a shipment
   * @param {Object} shipmentData - Shipment data
   * @returns {Promise<Object>} Shipment response
   */
  async createShipment(shipmentData) {
    try {
      // Get automatic shipping date with smart defaults
      const shippingDateInfo = getAutomaticShippingDate(shipmentData.plannedShippingDate);
      
      console.log(`📅 Shipment Date: ${shippingDateInfo.dateString} (${shippingDateInfo.dayOfWeek})`);
      console.log(`📋 Date Selection: ${shippingDateInfo.reason}`);
      if (shippingDateInfo.isAutomatic) {
        console.log(`🤖 Automatically selected: ${shippingDateInfo.isToday ? 'Today' : 'Next business day'}`);
      }

      // Use the productCode from shipmentData or default to 'P' (EXRESS WORLDWIDE NONDOC)
      const productCode = shipmentData.productCode || 'P';
      console.log(`Using DHL product code: ${productCode}`);

      const payload = {
        plannedShippingDateAndTime: shippingDateInfo.formatted,
                pickup: {
          isRequested: true,
          closeTime: '18:00',
          location: 'reception',
          pickupDetails: {
            postalAddress: {
              postalCode: shipmentData.originAddress.postalCode,
              cityName: shipmentData.originAddress.cityName,
              countryCode: shipmentData.originAddress.countryCode,
              addressLine1: shipmentData.originAddress.addressLine1 || 'Address not specified'
            },
            contactInformation: {
              companyName: shipmentData.shipper?.companyName || 'Traditional Alley',
              fullName: shipmentData.shipper?.fullName || 'Shipper',
              email: shipmentData.shipper?.email || 'info@traditionalalley.com',
              phone: shipmentData.shipper?.phone || '+977-1-4444444'
            },
            registrationNumbers: [{
              typeCode: 'PID',
              number: shipmentData.exportDeclaration.invoice.number,
              issuerCountryCode: shipmentData.originAddress.countryCode
            }]
          }
        },
        productCode: productCode,
        accounts: [{
          typeCode: 'shipper',
          number: this.accountNumber
        }],
        customerDetails: {
          shipperDetails: {
            postalAddress: {
              postalCode: shipmentData.originAddress.postalCode,
              cityName: shipmentData.originAddress.cityName,
              countryCode: shipmentData.originAddress.countryCode,
              addressLine1: shipmentData.originAddress.addressLine1 || 'Address not specified'
            },
            contactInformation: {
              companyName: shipmentData.shipper?.companyName || 'Traditional Alley',
              fullName: shipmentData.shipper?.fullName || 'Shipper',
              email: shipmentData.shipper?.email || 'info@traditionalalley.com',
              phone: shipmentData.shipper?.phone || '+977-1-4444444'
            }
          },
          receiverDetails: {
            postalAddress: {
              postalCode: shipmentData.destinationAddress.postalCode,
              cityName: shipmentData.destinationAddress.cityName,
              countryCode: shipmentData.destinationAddress.countryCode,
              addressLine1: shipmentData.destinationAddress.addressLine1 || 'Address not specified'
            },
            contactInformation: {
              companyName: shipmentData.recipient?.companyName || 'Recipient',
              fullName: shipmentData.recipient?.fullName || 'Recipient',
              email: shipmentData.recipient?.email || 'recipient@example.com',
              phone: shipmentData.recipient?.phone || '+1-555-0123'
            }
          }
        },
        content: {
          packages: shipmentData.packages?.map(pkg => ({
            weight: pkg.weight,
            dimensions: {
              length: pkg.length,
              width: pkg.width,
              height: pkg.height
            }
          })) || [],
          isCustomsDeclarable: shipmentData.isCustomsDeclarable || false,
          declaredValue: shipmentData.packages?.reduce((total, pkg) => total + (pkg.declaredValue || 0), 0) || 0,
          declaredValueCurrency: 'USD',
          description: shipmentData.packages?.[0]?.description || 'General Merchandise',
          unitOfMeasurement: 'metric'
        },
        outputImageProperties: {
          imageOptions: [
            {
              typeCode: 'label',
              templateName: 'ECOM26_84_001',
              isRequested: true
            },
            {
              typeCode: 'invoice',
              templateName: 'COMMERCIAL_INVOICE_P_10',
              isRequested: true
            }
          ]
        }
      };

      // Add customs declaration if required
      if (shipmentData.isCustomsDeclarable && shipmentData.packages) {
        payload.content.exportDeclaration = {
          lineItems: shipmentData.packages.map(pkg => ({
            number: 1,
            description: pkg.description || 'General Merchandise',
            price: pkg.declaredValue || 0,
            quantity: {
              value: pkg.quantity || 1,
              unitOfMeasurement: 'PCS'
            },
            commodityCodes: [{
              typeCode: 'outbound',
              value: '9999999999' // Generic commodity code
            }],
            exportReasonType: 'permanent',
            manufacturerCountry: 'NP',
            weight: {
              netValue: pkg.weight,
              grossValue: pkg.weight
            }
          })),
          invoice: {
            number: `INV-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            signatureName: shipmentData.shipper?.fullName || 'Shipper',
            signatureTitle: 'Authorized Signatory'
          },
          remarks: [{
            value: 'Traditional handicrafts and cultural items from Nepal'
          }],
          additionalCharges: [{
            value: 0.001,
            typeCode: 'insurance'
          }],
          placeOfIncoterm: shipmentData.originAddress.cityName
        };
        // Add incoterm at the top level of content
        payload.content.incoterm = shipmentData.incoterm || 'DAP';
      }

      console.log('DHL Shipment Request Payload:', JSON.stringify(payload, null, 2));
      const response = await this.client.post('/shipments', payload);
      console.log('DHL Shipment Response:', response.status, response.statusText);
      console.log('DHL Shipment Response Data:', JSON.stringify(response.data, null, 2));

      // Normalize the pickup confirmation number
      const shipmentResponse = response.data;
      if (shipmentResponse.dispatchConfirmationNumber) {
        shipmentResponse.pickupConfirmationNumber = shipmentResponse.dispatchConfirmationNumber;
      }
      
      return shipmentResponse;
    } catch (error) {
      console.log('DHL Shipment API Error:', error.response?.status, error.response?.statusText);
      console.log('DHL Shipment Error Data:', JSON.stringify(error.response?.data, null, 2));
      throw this.handleError(error, 'Failed to create shipment');
    }
  }

  /**
   * Track a shipment
   * @param {string} trackingNumber - Tracking number
   * @returns {Promise<Object>} Tracking response
   */
  async trackShipment(trackingNumber) {
    try {
      console.log(`Attempting to track shipment: ${trackingNumber}`);
      const response = await this.client.get(`/track/shipments?trackingNumber=${trackingNumber}`);
      console.log('DHL Tracking Response:', response.status, response.statusText);
      return response.data;
    } catch (error) {
      console.log('DHL Tracking Error:', error.response?.status, error.response?.statusText);
      console.log('DHL Tracking Error Data:', JSON.stringify(error.response?.data, null, 2));
      
      // Handle specific tracking errors
      if (error.response?.status === 404) {
        const trackingError = new Error(`Tracking information not available for ${trackingNumber}. This is normal for newly created shipments - tracking usually becomes available within 30-60 minutes after shipment creation.`);
        trackingError.status = 404;
        trackingError.data = error.response?.data;
        trackingError.suggestion = 'Please try again in 30-60 minutes, or check if the tracking number is correct.';
        throw trackingError;
      }
      
      throw this.handleError(error, 'Failed to track shipment');
    }
  }

  /**
   * Get available pickup times
   * @param {Object} pickupRequest - Pickup request parameters
   * @returns {Promise<Object>} Pickup times response
   */
  async getPickupTimes(pickupRequest) {
    try {
      const payload = {
        pickupDetails: {
          postalAddress: {
            postalCode: pickupRequest.postalCode,
            cityName: pickupRequest.cityName,
            countryCode: pickupRequest.countryCode,
            addressLine1: pickupRequest.addressLine1
          }
        },
        plannedPickupDate: pickupRequest.plannedPickupDate
      };

      const response = await this.client.post('/pickup/capabilities', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get pickup times');
    }
  }

  /**
   * Schedule a pickup
   * @param {Object} pickupData - Pickup data
   * @returns {Promise<Object>} Pickup response
   */
  async schedulePickup(pickupData) {
    try {
      const payload = {
        plannedPickupDate: pickupData.plannedPickupDate,
        closeTime: pickupData.closeTime || '18:00',
        location: pickupData.location || 'reception',
        locationType: 'business',
        accounts: [{
          typeCode: 'shipper',
          number: this.accountNumber
        }],
        customerDetails: {
          shipperDetails: {
            postalAddress: {
              postalCode: pickupData.address.postalCode,
              cityName: pickupData.address.cityName,
              countryCode: pickupData.address.countryCode,
              addressLine1: pickupData.address.addressLine1
            },
            contactInformation: {
              companyName: pickupData.contact?.companyName || 'Traditional Alley',
              fullName: pickupData.contact?.fullName || 'Contact',
              email: pickupData.contact?.email || 'info@traditionalalley.com',
              phone: pickupData.contact?.phone || '+977-1-4444444'
            }
          }
        },
        shipmentDetails: pickupData.shipments?.map(shipment => ({
          productCode: shipment.productCode || 'P',
          isCustomsDeclarable: shipment.isCustomsDeclarable || false,
          unitOfMeasurement: 'metric',
          packages: shipment.packages?.map(pkg => ({
            weight: pkg.weight,
            dimensions: {
              length: pkg.length,
              width: pkg.width,
              height: pkg.height
            }
          })) || []
        })) || []
      };

      const response = await this.client.post('/pickup', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to schedule pickup');
    }
  }

  /**
   * Validate address
   * @param {Object} address - Address to validate
   * @returns {Promise<Object>} Address validation response
   */
  async validateAddress(address) {
    try {
      const response = await this.client.get('/address-validate', {
        params: {
          type: 'delivery',
          countryCode: address.countryCode,
          postalCode: address.postalCode,
          cityName: address.cityName
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to validate address');
    }
  }

  /**
   * Get service capabilities for a route
   * @param {Object} routeRequest - Route request parameters
   * @returns {Promise<Object>} Capabilities response
   */
  async getCapabilities(routeRequest) {
    try {
      const response = await this.client.get('/address-validate', {
        params: {
          type: 'pickup',
          originCountryCode: routeRequest.originCountryCode,
          originPostalCode: routeRequest.originPostalCode,
          originCityName: routeRequest.originCityName,
          destinationCountryCode: routeRequest.destinationCountryCode,
          destinationPostalCode: routeRequest.destinationPostalCode,
          destinationCityName: routeRequest.destinationCityName
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get service capabilities');
    }
  }

  /**
   * Get landed cost estimation
   * @param {Object} landedCostRequest - Landed cost request parameters
   * @returns {Promise<Object>} Landed cost response
   */
  async getLandedCost(landedCostRequest) {
    try {
      const payload = {
        customerDetails: {
          shipperDetails: {
            postalAddress: {
              postalCode: landedCostRequest.originAddress.postalCode,
              cityName: landedCostRequest.originAddress.cityName,
              countryCode: landedCostRequest.originAddress.countryCode
            }
          },
          receiverDetails: {
            postalAddress: {
              postalCode: landedCostRequest.destinationAddress.postalCode,
              cityName: landedCostRequest.destinationAddress.cityName,
              countryCode: landedCostRequest.destinationAddress.countryCode
            }
          }
        },
        accounts: [{
          typeCode: 'shipper',
          number: this.accountNumber
        }],
        productCode: landedCostRequest.productCode || 'P',
        plannedShippingDate: landedCostRequest.plannedShippingDate,
        unitOfMeasurement: 'metric',
        packages: landedCostRequest.packages?.map(pkg => ({
          weight: pkg.weight,
          dimensions: {
            length: pkg.length,
            width: pkg.width,
            height: pkg.height
          }
        })) || [],
        items: landedCostRequest.items?.map(item => ({
          number: item.number || 1,
          name: item.name,
          description: item.description,
          manufacturerCountry: item.manufacturerCountry || 'NP',
          partNumber: item.partNumber,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice,
          unitPriceCurrencyCode: 'USD',
          commodityCode: item.commodityCode || '9999999999'
        })) || []
      };

      const response = await this.client.post('/landed-cost', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get landed cost');
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - The error object
   * @param {string} message - Custom error message
   * @returns {Error} Formatted error
   */
  handleError(error, message) {
    if (error.response) {
      // API responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      // Handle specific DHL error cases
      if (status === 404 && data?.title === 'Product not found') {
        const apiError = new Error(`${message}: No shipping products available for the requested date/route. ${data.detail || ''}`);
        apiError.status = status;
        apiError.data = data;
        apiError.suggestion = 'Try a different shipping date (next business day) or check if the route is supported.';
        return apiError;
      }
      
      if (status === 400 && data?.reasons) {
        const reasons = data.reasons.map(r => r.msg).join(', ');
        const apiError = new Error(`${message}: ${reasons}`);
        apiError.status = status;
        apiError.data = data;
        return apiError;
      }
      
      // Generic API error
      const apiError = new Error(`${message}: ${status} ${error.response.statusText}`);
      apiError.status = status;
      apiError.data = data;
      return apiError;
    } else if (error.request) {
      // Network error
      const networkError = new Error(`${message}: Network error - please check your internet connection`);
      networkError.code = 'NETWORK_ERROR';
      return networkError;
    } else {
      // Other error
      return new Error(`${message}: ${error.message}`);
    }
  }
}

export default DHLExpressService; 