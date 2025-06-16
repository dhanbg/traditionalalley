import axios from 'axios';

class DHLExpressService {
  constructor() {
    this.apiKey = process.env.DHL_API_KEY;
    this.apiSecret = process.env.DHL_API_SECRET;
    this.accountNumber = process.env.DHL_ACCOUNT_NUMBER;
    this.baseURL = process.env.DHL_ENVIRONMENT === 'production' 
      ? process.env.DHL_PRODUCTION_URL 
      : process.env.DHL_BASE_URL;
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('DHL API credentials are not configured');
    }

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      auth: {
        username: this.apiKey,
        password: this.apiSecret
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`DHL API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
        console.error('DHL API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get shipping rates for a shipment
   * @param {Object} rateRequest - Rate request data
   * @returns {Promise<Object>} Rate response
   */
  async getRates(rateRequest) {
    try {
      const payload = this.buildRateRequest(rateRequest);
      const response = await this.client.post('/rates', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get rates');
    }
  }

  /**
   * Create a shipment
   * @param {Object} shipmentData - Shipment data
   * @returns {Promise<Object>} Shipment response
   */
  async createShipment(shipmentData) {
    try {
      const payload = this.buildShipmentRequest(shipmentData);
      const response = await this.client.post('/shipments', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create shipment');
    }
  }

  /**
   * Track a shipment
   * @param {string} trackingNumber - DHL tracking number
   * @returns {Promise<Object>} Tracking response
   */
  async trackShipment(trackingNumber) {
    try {
      const response = await this.client.get(`/tracking?trackingNumber=${trackingNumber}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to track shipment');
    }
  }

  /**
   * Get available products for a route
   * @param {Object} productRequest - Product request data
   * @returns {Promise<Object>} Product response
   */
  async getProducts(productRequest) {
    try {
      const payload = this.buildProductRequest(productRequest);
      const response = await this.client.get('/products', { params: payload });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get products');
    }
  }

  /**
   * Get landed cost estimation
   * @param {Object} landedCostRequest - Landed cost request data
   * @returns {Promise<Object>} Landed cost response
   */
  async getLandedCost(landedCostRequest) {
    try {
      const payload = this.buildLandedCostRequest(landedCostRequest);
      const response = await this.client.post('/landed-cost', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get landed cost');
    }
  }

  /**
   * Request a pickup
   * @param {Object} pickupRequest - Pickup request data
   * @returns {Promise<Object>} Pickup response
   */
  async requestPickup(pickupRequest) {
    try {
      const payload = this.buildPickupRequest(pickupRequest);
      const response = await this.client.post('/pickups', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to request pickup');
    }
  }

  /**
   * Validate address capabilities
   * @param {Object} addressRequest - Address validation request
   * @returns {Promise<Object>} Address validation response
   */
  async validateAddress(addressRequest) {
    try {
      const params = new URLSearchParams({
        type: 'delivery',
        countryCode: addressRequest.countryCode,
        cityName: addressRequest.cityName,
        postalCode: addressRequest.postalCode || ''
      });
      
      const response = await this.client.get(`/address-validate?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to validate address');
    }
  }

  /**
   * Build rate request payload
   * @private
   */
  buildRateRequest(data) {
    return {
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            postalCode: data.originAddress.postalCode,
            cityName: data.originAddress.cityName,
            countryCode: data.originAddress.countryCode,
            addressLine1: data.originAddress.addressLine1
          }
        },
        receiverDetails: {
          postalAddress: {
            postalCode: data.destinationAddress.postalCode,
            cityName: data.destinationAddress.cityName,
            countryCode: data.destinationAddress.countryCode,
            addressLine1: data.destinationAddress.addressLine1
          }
        }
      },
      accounts: [{
        typeCode: "shipper",
        number: this.accountNumber
      }],
      plannedShippingDate: data.plannedShippingDate,
      unitOfMeasurement: "metric",
      isCustomsDeclarable: data.isCustomsDeclarable || false,
      monetaryAmount: data.packages.reduce((sum, pkg) => sum + (pkg.declaredValue || 0), 0),
      requestedPackages: data.packages.map(pkg => ({
        weight: pkg.weight,
        dimensions: {
          length: pkg.length,
          width: pkg.width,
          height: pkg.height
        }
      }))
    };
  }

  /**
   * Build shipment request payload
   * @private
   */
  buildShipmentRequest(data) {
    const shipmentRequest = {
      plannedShippingDate: data.plannedShippingDate,
      pickup: {
        isRequested: false
      },
      productCode: data.productCode || 'P',
      accounts: [{
        typeCode: "shipper",
        number: this.apiKey
      }],
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            postalCode: data.originAddress.postalCode,
            cityName: data.originAddress.cityName,
            countryCode: data.originAddress.countryCode,
            addressLine1: data.originAddress.addressLine1
          },
          contactInformation: {
            email: data.shipper.email,
            phone: data.shipper.phone,
            companyName: data.shipper.companyName,
            fullName: data.shipper.fullName
          }
        },
        receiverDetails: {
          postalAddress: {
            postalCode: data.destinationAddress.postalCode,
            cityName: data.destinationAddress.cityName,
            countryCode: data.destinationAddress.countryCode,
            addressLine1: data.destinationAddress.addressLine1
          },
          contactInformation: {
            email: data.recipient.email,
            phone: data.recipient.phone,
            companyName: data.recipient.companyName,
            fullName: data.recipient.fullName
          }
        }
      },
      content: {
        packages: data.packages.map((pkg, index) => ({
          typeCode: "2BP",
          weight: pkg.weight,
          dimensions: {
            length: pkg.length,
            width: pkg.width,
            height: pkg.height
          },
          customerReferences: [{
            value: `PKG-${index + 1}`,
            typeCode: "CU"
          }]
        })),
        isCustomsDeclarable: data.isCustomsDeclarable || false,
        declaredValue: data.packages.reduce((sum, pkg) => sum + (pkg.declaredValue || 0), 0),
        declaredValueCurrency: data.currency || 'USD',
        description: data.packages.map(pkg => pkg.description).join(', ')
      }
    };

    // Add customs declaration if required
    if (data.isCustomsDeclarable) {
      shipmentRequest.content.exportDeclaration = {
        lineItems: data.packages.map((pkg, index) => ({
          number: index + 1,
          description: pkg.description,
          price: pkg.declaredValue || 0,
          quantity: {
            value: pkg.quantity || 1,
            unitOfMeasurement: "PCS"
          },
          commodityCodes: [{
            typeCode: "outbound",
            value: pkg.hsCode || "999999"
          }],
          exportReasonType: "permanent",
          manufacturerCountry: data.originAddress.countryCode,
          weight: {
            netValue: pkg.weight,
            grossValue: pkg.weight
          }
        })),
        invoice: {
          number: `INV-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          function: "commercial"
        },
        remarks: [{
          value: "Commercial goods"
        }]
      };
    }

    return shipmentRequest;
  }

  /**
   * Build product request payload
   * @private
   */
  buildProductRequest(data) {
    return {
      accountNumber: this.accountNumber,
      originCountryCode: data.originAddress.countryCode,
      originCityName: data.originAddress.cityName,
      originPostalCode: data.originAddress.postalCode,
      destinationCountryCode: data.destinationAddress.countryCode,
      destinationCityName: data.destinationAddress.cityName,
      destinationPostalCode: data.destinationAddress.postalCode,
      weight: data.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
      length: Math.max(...data.packages.map(pkg => pkg.length)),
      width: Math.max(...data.packages.map(pkg => pkg.width)),
      height: Math.max(...data.packages.map(pkg => pkg.height)),
      plannedShippingDate: data.plannedShippingDate,
      isCustomsDeclarable: data.isCustomsDeclarable || false
    };
  }

  /**
   * Build landed cost request payload
   * @private
   */
  buildLandedCostRequest(data) {
    return {
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            postalCode: data.originAddress.postalCode,
            cityName: data.originAddress.cityName,
            countryCode: data.originAddress.countryCode
          }
        },
        receiverDetails: {
          postalAddress: {
            postalCode: data.destinationAddress.postalCode,
            cityName: data.destinationAddress.cityName,
            countryCode: data.destinationAddress.countryCode
          }
        }
      },
      accounts: [{
        typeCode: "shipper",
        number: this.accountNumber
      }],
      productCode: data.productCode || 'P',
      localProductCode: data.localProductCode,
      charges: data.charges || [],
      shipmentPurpose: "commercial",
      transportationMode: "air",
      packages: data.packages.map(pkg => ({
        weight: pkg.weight,
        dimensions: {
          length: pkg.length,
          width: pkg.width,
          height: pkg.height
        },
        items: [{
          number: 1,
          name: pkg.description,
          description: pkg.description,
          manufacturerCountry: data.originAddress.countryCode,
          partNumber: pkg.partNumber || '',
          quantity: pkg.quantity || 1,
          unitPrice: pkg.declaredValue || 0,
          unitPriceCurrencyCode: data.currency || 'USD',
          customsValue: pkg.declaredValue || 0,
          customsValueCurrencyCode: data.currency || 'USD',
          commodityCodes: [{
            typeCode: "outbound",
            value: pkg.hsCode || "999999"
          }]
        }]
      }))
    };
  }

  /**
   * Build pickup request payload
   * @private
   */
  buildPickupRequest(data) {
    return {
      plannedPickupDateAndTime: data.plannedPickupDateAndTime,
      closeTime: data.closeTime || "18:00",
      location: data.location || "reception",
      locationType: data.locationType || "business",
      accounts: [{
        typeCode: "shipper",
        number: this.accountNumber
      }],
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            postalCode: data.address.postalCode,
            cityName: data.address.cityName,
            countryCode: data.address.countryCode,
            addressLine1: data.address.addressLine1,
            addressLine2: data.address.addressLine2 || '',
            addressLine3: data.address.addressLine3 || ''
          },
          contactInformation: {
            email: data.contact.email,
            phone: data.contact.phone,
            companyName: data.contact.companyName,
            fullName: data.contact.fullName
          }
        }
      },
      shipmentDetails: data.shipments || []
    };
  }

  /**
   * Handle API errors
   * @private
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      const { status, data } = error.response;
      
      // Log detailed error information for debugging
      console.error('DHL API Error Details:', JSON.stringify(data, null, 2));
      
      let message = defaultMessage;
      if (data?.reasons && Array.isArray(data.reasons)) {
        message = data.reasons.map(reason => reason.msg || reason.message || reason.description || JSON.stringify(reason)).join(', ');
      } else if (data?.message) {
        message = data.message;
      } else if (data?.detail) {
        message = data.detail;
      }
      
      return new Error(`DHL API Error (${status}): ${message}`);
    } else if (error.request) {
      return new Error('DHL API Error: No response received from server');
    } else {
      return new Error(`DHL API Error: ${error.message}`);
    }
  }
}

export default DHLExpressService; 