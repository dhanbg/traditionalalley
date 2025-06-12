/**
 * DHL Express - MyDHL API Client
 * Complete integration for DHL Express APIs
 */

class DHLExpressAPI {
    constructor(config) {
        this.config = {
            baseUrl: config.production ? 'https://express.api.dhl.com/mydhlapi' : 'https://api-mock.dhl.com/mydhlapi',
            accountNumber: config.accountNumber,
            username: config.username,
            password: config.password,
            version: '2.12.0',
            ...config
        };
        
        this.headers = {
            'Content-Type': 'application/json',
            'x-version': this.config.version,
            'Authorization': `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
            'Message-Reference': this.generateMessageReference(),
            'Message-Reference-Date': new Date().toUTCString()
        };
    }

    generateMessageReference() {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async makeRequest(method, endpoint, data = null, params = {}) {
        const url = new URL(`${this.config.baseUrl}${endpoint}`);
        
        // Add query parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        const options = {
            method: method.toUpperCase(),
            headers: {
                ...this.headers,
                'Message-Reference': this.generateMessageReference()
            }
        };

        if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url.toString(), options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(`DHL API Error: ${response.status} - ${responseData.message || 'Unknown error'}`);
            }

            return responseData;
        } catch (error) {
            console.error('DHL API Request Failed:', error);
            throw error;
        }
    }

    // ===== RATING APIs =====

    /**
     * Get rates for a single piece shipment
     */
    async getRates(rateRequest) {
        const params = {
            accountNumber: this.config.accountNumber,
            originCountryCode: rateRequest.origin.countryCode,
            originCityName: rateRequest.origin.cityName,
            destinationCountryCode: rateRequest.destination.countryCode,
            destinationCityName: rateRequest.destination.cityName,
            weight: rateRequest.weight,
            length: rateRequest.dimensions.length,
            width: rateRequest.dimensions.width,
            height: rateRequest.dimensions.height,
            plannedShippingDate: rateRequest.plannedShippingDate,
            isCustomsDeclarable: rateRequest.isCustomsDeclarable,
            unitOfMeasurement: rateRequest.unitOfMeasurement || 'metric',
            ...rateRequest.options
        };

        if (rateRequest.origin.postalCode) params.originPostalCode = rateRequest.origin.postalCode;
        if (rateRequest.destination.postalCode) params.destinationPostalCode = rateRequest.destination.postalCode;

        return await this.makeRequest('GET', '/rates', null, params);
    }

    /**
     * Get rates for multi-piece shipments
     */
    async getMultiPieceRates(rateRequest) {
        const payload = {
            customerDetails: rateRequest.customerDetails,
            accounts: [{
                typeCode: "shipper",
                number: this.config.accountNumber
            }],
            productCode: rateRequest.productCode,
            localProductCode: rateRequest.localProductCode,
            unitOfMeasurement: rateRequest.unitOfMeasurement || 'metric',
            isCustomsDeclarable: rateRequest.isCustomsDeclarable,
            monetaryAmount: rateRequest.monetaryAmount,
            requestEstimatedDeliveryDate: true,
            packages: rateRequest.packages,
            plannedShippingDateAndTime: rateRequest.plannedShippingDateAndTime
        };

        return await this.makeRequest('POST', '/rates', payload);
    }

    /**
     * Calculate landed cost including duties and taxes
     */
    async getLandedCost(landedCostRequest) {
        const payload = {
            customerDetails: landedCostRequest.customerDetails,
            accounts: [{
                typeCode: "shipper",
                number: this.config.accountNumber
            }],
            productCode: landedCostRequest.productCode,
            unitOfMeasurement: landedCostRequest.unitOfMeasurement || 'metric',
            isCustomsDeclarable: true,
            monetaryAmount: landedCostRequest.monetaryAmount,
            packages: landedCostRequest.packages,
            plannedShippingDateAndTime: landedCostRequest.plannedShippingDateAndTime,
            charges: landedCostRequest.charges,
            shipmentPurpose: landedCostRequest.shipmentPurpose || 'commercial'
        };

        return await this.makeRequest('POST', '/landed-cost', payload);
    }

    // ===== SHIPMENT APIs =====

    /**
     * Create a new shipment
     */
    async createShipment(shipmentRequest) {
        const payload = {
            plannedShippingDateAndTime: shipmentRequest.plannedShippingDateAndTime,
            pickup: shipmentRequest.pickup || { isRequested: false },
            productCode: shipmentRequest.productCode,
            localProductCode: shipmentRequest.localProductCode,
            getRateEstimates: shipmentRequest.getRateEstimates || false,
            accounts: [{
                typeCode: "shipper",
                number: this.config.accountNumber
            }],
            customerDetails: shipmentRequest.customerDetails,
            content: shipmentRequest.content,
            outputImageProperties: shipmentRequest.outputImageProperties || {
                encodingFormat: "pdf",
                imageOptions: [{
                    typeCode: "label",
                    templateName: "ECOM26_84_001",
                    isRequested: true
                }]
            },
            ...shipmentRequest
        };

        return await this.makeRequest('POST', '/shipments', payload);
    }

    /**
     * Upload commercial invoice data
     */
    async uploadCommercialInvoice(shipmentId, invoiceData) {
        const payload = {
            plannedShippingDate: invoiceData.plannedShippingDate,
            customerDetails: invoiceData.customerDetails,
            content: invoiceData.content
        };

        return await this.makeRequest('PATCH', `/shipments/${shipmentId}/upload-image`, payload);
    }

    // ===== TRACKING APIs =====

    /**
     * Track a single shipment
     */
    async trackShipment(trackingNumber, options = {}) {
        const params = {
            ...options
        };

        return await this.makeRequest('GET', `/shipments/${trackingNumber}/tracking`, null, params);
    }

    /**
     * Track multiple shipments
     */
    async trackMultipleShipments(trackingNumbers, options = {}) {
        const params = {
            shipmentTrackingNumber: Array.isArray(trackingNumbers) ? trackingNumbers.join(',') : trackingNumbers,
            ...options
        };

        return await this.makeRequest('GET', '/tracking', null, params);
    }

    /**
     * Get electronic proof of delivery
     */
    async getProofOfDelivery(trackingNumber, options = {}) {
        const params = {
            shipmentTrackingNumber: trackingNumber,
            ...options
        };

        return await this.makeRequest('GET', '/proof-of-delivery', null, params);
    }

    // ===== PICKUP APIs =====

    /**
     * Create a pickup booking request
     */
    async createPickup(pickupRequest) {
        const payload = {
            plannedPickupDateAndTime: pickupRequest.plannedPickupDateAndTime,
            closeTime: pickupRequest.closeTime || "18:00",
            location: pickupRequest.location || "reception",
            locationType: pickupRequest.locationType || "business",
            accounts: [{
                typeCode: "shipper",
                number: this.config.accountNumber
            }],
            customerDetails: pickupRequest.customerDetails,
            shipmentDetails: pickupRequest.shipmentDetails,
            specialInstructions: pickupRequest.specialInstructions,
            remark: pickupRequest.remark
        };

        return await this.makeRequest('POST', '/pickups', payload);
    }

    /**
     * Update pickup information
     */
    async updatePickup(pickupId, updateData) {
        return await this.makeRequest('PATCH', `/pickups/${pickupId}`, updateData);
    }

    /**
     * Cancel a pickup booking
     */
    async cancelPickup(pickupId, cancellationRequest) {
        const payload = {
            dispatchConfirmationNumber: pickupId,
            requestorName: cancellationRequest.requestorName,
            reason: cancellationRequest.reason || "001"
        };

        return await this.makeRequest('DELETE', `/pickups/${pickupId}`, payload);
    }

    /**
     * Validate pickup/delivery capabilities
     */
    async validatePickupCapabilities(validationRequest) {
        const params = {
            accountNumber: this.config.accountNumber,
            originCountryCode: validationRequest.origin.countryCode,
            originCityName: validationRequest.origin.cityName,
            destinationCountryCode: validationRequest.destination.countryCode,
            destinationCityName: validationRequest.destination.cityName,
            plannedShippingDate: validationRequest.plannedShippingDate,
            ...validationRequest.options
        };

        return await this.makeRequest('GET', '/pickups/capabilities', null, params);
    }

    // ===== UTILITY METHODS =====

    /**
     * Get image/document
     */
    async getImage(shipmentId, options = {}) {
        const params = {
            shipmentTrackingNumber: shipmentId,
            ...options
        };

        return await this.makeRequest('GET', '/image', null, params);
    }

    /**
     * Helper method to create address object
     */
    createAddress(address) {
        return {
            postalCode: address.postalCode || "",
            cityName: address.cityName,
            countryCode: address.countryCode,
            provinceCode: address.provinceCode || address.countryCode,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || "",
            addressLine3: address.addressLine3 || "",
            countyName: address.countyName || "",
            provinceName: address.provinceName || "",
            countryName: address.countryName || ""
        };
    }

    /**
     * Helper method to create contact information
     */
    createContactInfo(contact) {
        return {
            email: contact.email,
            phone: contact.phone,
            mobilePhone: contact.mobilePhone || contact.phone,
            companyName: contact.companyName || "",
            fullName: contact.fullName
        };
    }

    /**
     * Helper method to create customer details
     */
    createCustomerDetails(shipper, receiver) {
        return {
            shipperDetails: {
                postalAddress: this.createAddress(shipper.address),
                contactInformation: this.createContactInfo(shipper.contact),
                typeCode: shipper.typeCode || "business"
            },
            receiverDetails: {
                postalAddress: this.createAddress(receiver.address),
                contactInformation: this.createContactInfo(receiver.contact),
                typeCode: receiver.typeCode || "business"
            }
        };
    }

    /**
     * Helper method to create package object
     */
    createPackage(packageInfo) {
        return {
            typeCode: packageInfo.typeCode || "3BX",
            weight: packageInfo.weight,
            dimensions: {
                length: packageInfo.dimensions.length,
                width: packageInfo.dimensions.width,
                height: packageInfo.dimensions.height
            }
        };
    }
}

export default DHLExpressAPI; 