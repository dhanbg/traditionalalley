# DHL Express API Integration

This document provides comprehensive information about the DHL Express API integration in Traditional Alley.

## Overview

The DHL Express integration provides access to all 15 DHL Express APIs, enabling complete shipping management functionality including:

- Rate calculation for domestic and international shipments
- Shipment creation with automatic label generation
- Real-time shipment tracking
- Pickup request management
- Document handling (commercial invoices, proof of delivery)
- Landed cost calculation
- Capability validation

## Setup

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# DHL Express API Configuration
DHL_API_BASE_URL=https://api-mock.dhl.com/mydhlapi
DHL_API_USERNAME=your_dhl_username
DHL_API_PASSWORD=your_dhl_password
DHL_ACCOUNT_NUMBER=your_dhl_account_number
DHL_API_VERSION=2.12.0
```

### Production vs Sandbox

- **Sandbox URL**: `https://api-mock.dhl.com/mydhlapi`
- **Production URL**: `https://api.dhl.com/mydhlapi`

## Available APIs

### 1. Rate Calculation

#### Single Piece Rates
```javascript
// GET /api/dhl/rates
const rates = await fetch('/api/dhl/rates?' + new URLSearchParams({
  destinationCountryCode: 'US',
  destinationCityName: 'New York',
  weight: '1.5',
  length: '20',
  width: '15',
  height: '10',
  isCustomsDeclarable: 'true'
}));
```

#### Multi-piece Rates
```javascript
// POST /api/dhl/rates
const rates = await fetch('/api/dhl/rates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(shipmentData)
});
```

### 2. Shipment Creation

```javascript
// POST /api/dhl/shipments
const shipment = await fetch('/api/dhl/shipments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plannedShippingDateAndTime: '2024-01-15T14:00:00GMT+05:45',
    productCode: 'P',
    customerDetails: {
      shipperDetails: { /* shipper info */ },
      receiverDetails: { /* recipient info */ }
    },
    content: {
      packages: [{ /* package details */ }]
    }
  })
});
```

### 3. Shipment Tracking

#### Single Shipment
```javascript
// GET /api/dhl/tracking?trackingNumber=9356579890
const tracking = await fetch('/api/dhl/tracking?trackingNumber=9356579890');
```

#### Multiple Shipments
```javascript
// GET /api/dhl/tracking?trackingNumbers=9356579890,4818240420
const tracking = await fetch('/api/dhl/tracking?trackingNumbers=9356579890,4818240420');
```

### 4. Pickup Management

#### Create Pickup Request
```javascript
// POST /api/dhl/pickups
const pickup = await fetch('/api/dhl/pickups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(pickupData)
});
```

#### Update Pickup Request
```javascript
// PATCH /api/dhl/pickups?pickupRequestId=123
const updatedPickup = await fetch('/api/dhl/pickups?pickupRequestId=123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedPickupData)
});
```

#### Cancel Pickup Request
```javascript
// DELETE /api/dhl/pickups?pickupRequestId=123
const cancelResult = await fetch('/api/dhl/pickups?pickupRequestId=123', {
  method: 'DELETE'
});
```

### 5. Document Management

#### Get Proof of Delivery
```javascript
// GET /api/dhl/documents?shipmentTrackingNumber=9356579890&documentType=proof-of-delivery
const proofOfDelivery = await fetch('/api/dhl/documents?' + new URLSearchParams({
  shipmentTrackingNumber: '9356579890',
  documentType: 'proof-of-delivery'
}));
```

#### Get Shipment Images
```javascript
// GET /api/dhl/documents?shipmentTrackingNumber=9356579890&documentType=image
const shipmentImage = await fetch('/api/dhl/documents?' + new URLSearchParams({
  shipmentTrackingNumber: '9356579890',
  documentType: 'image'
}));
```

#### Upload Commercial Invoice
```javascript
// PATCH /api/dhl/documents?shipmentTrackingNumber=9356579890&uploadType=commercial-invoice
const uploadResult = await fetch('/api/dhl/documents?' + new URLSearchParams({
  shipmentTrackingNumber: '9356579890',
  uploadType: 'commercial-invoice'
}), {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(invoiceData)
});
```

### 6. Landed Cost Calculation

```javascript
// POST /api/dhl/landed-cost
const landedCost = await fetch('/api/dhl/landed-cost', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(landedCostData)
});
```

### 7. Capability Validation

```javascript
// GET /api/dhl/capabilities?destinationCountryCode=US&destinationCityName=New York
const capabilities = await fetch('/api/dhl/capabilities?' + new URLSearchParams({
  destinationCountryCode: 'US',
  destinationCityName: 'New York'
}));
```

## React Components

### DHLShipping Component

A comprehensive React component that provides a complete UI for DHL shipping operations:

```jsx
import DHLShipping from '@/components/DHLShipping';

function ShippingPage() {
  const handleShippingComplete = (shipmentData) => {
    console.log('Shipment created:', shipmentData);
    // Handle successful shipment creation
  };

  return (
    <DHLShipping 
      orderData={orderData}
      onShippingComplete={handleShippingComplete}
    />
  );
}
```

### useDHL Hook

A custom React hook for DHL operations:

```jsx
import { useDHL } from '@/hooks/useDHL';

function MyComponent() {
  const {
    loading,
    error,
    getRates,
    trackShipment,
    createShipment,
    clearError
  } = useDHL();

  const handleGetRates = async () => {
    try {
      const rates = await getRates({
        destinationCountryCode: 'US',
        destinationCityName: 'New York',
        weight: 1.5,
        length: 20,
        width: 15,
        height: 10,
        isCustomsDeclarable: true
      });
      console.log('Rates:', rates);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleGetRates}>Get Rates</button>
    </div>
  );
}
```

## Service Classes

### DHLExpressService

The main service class handles all DHL API interactions:

```javascript
import DHLExpressService from '@/lib/dhl-service';

const dhlService = new DHLExpressService();

// Get rates
const rates = await dhlService.getRatesOnepiece(rateParams);

// Create shipment
const shipment = await dhlService.createShipment(shipmentData);

// Track shipment
const tracking = await dhlService.trackSingleShipment('9356579890');
```

## Test Data

### Test Tracking Numbers

For testing purposes, use these tracking numbers:

- `9356579890`
- `4818240420`
- `5584773180`
- `5786694550`
- `2449648740`
- `5980622760`
- `5980622970`
- `5980623180`
- `5980770460`
- `6781059250`

### Sample Rate Request

```javascript
const rateParams = {
  originCountryCode: 'NP',
  originCityName: 'Kathmandu',
  destinationCountryCode: 'US',
  destinationCityName: 'New York',
  weight: 1.5,
  length: 20,
  width: 15,
  height: 10,
  plannedShippingDate: '2024-01-15',
  isCustomsDeclarable: true,
  unitOfMeasurement: 'metric'
};
```

### Sample Shipment Data

```javascript
const shipmentData = {
  plannedShippingDateAndTime: '2024-01-15T14:00:00GMT+05:45',
  pickup: { isRequested: false },
  productCode: 'P',
  customerDetails: {
    shipperDetails: {
      postalAddress: {
        postalCode: '44600',
        cityName: 'Kathmandu',
        countryCode: 'NP',
        addressLine1: 'Traditional Alley Office'
      },
      contactInformation: {
        email: 'shipping@traditionalalley.com',
        phone: '+977-1-4444444',
        companyName: 'Traditional Alley',
        fullName: 'Shipping Manager'
      }
    },
    receiverDetails: {
      postalAddress: {
        postalCode: '10001',
        cityName: 'New York',
        countryCode: 'US',
        addressLine1: '123 Main Street'
      },
      contactInformation: {
        email: 'customer@example.com',
        phone: '+1-555-123-4567',
        companyName: 'Customer Company',
        fullName: 'John Doe'
      }
    }
  },
  content: {
    packages: [{
      typeCode: '2BP',
      weight: 1.5,
      dimensions: {
        length: 20,
        width: 15,
        height: 10
      }
    }],
    isCustomsDeclarable: true,
    declaredValue: 100,
    declaredValueCurrency: 'USD'
  }
};
```

## Error Handling

All API endpoints return a consistent error format:

```javascript
{
  success: false,
  error: {
    message: "Error description",
    code: "ERROR_CODE",
    details: { /* additional error details */ }
  },
  status: 400
}
```

## Product Codes

Common DHL Express product codes:

- `P` - Express Worldwide
- `D` - Express 12:00
- `T` - Express 10:30
- `N` - Express 9:00
- `U` - Express Easy
- `K` - Express Envelope
- `L` - Logistics Services
- `G` - Domestic Express

## Value Added Services

Common service codes for additional services:

- `II` - Insurance
- `PZ` - Hold for Pickup
- `YK` - Saturday Delivery
- `PL` - Paperless Trade
- `WY` - Waybill Message
- `XB` - Express Envelope

## Best Practices

1. **Rate Shopping**: Always get rates before creating shipments
2. **Error Handling**: Implement proper error handling for all API calls
3. **Validation**: Validate addresses and package dimensions before API calls
4. **Caching**: Cache rates for similar shipments to reduce API calls
5. **Logging**: Log all API interactions for debugging and monitoring
6. **Testing**: Use sandbox environment for development and testing

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify username/password in environment variables
2. **Invalid Address**: Ensure country codes and city names are correct
3. **Package Dimensions**: Check weight and dimension limits
4. **Service Availability**: Use capability validation to check service availability

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will log all API requests and responses to the console.

## Support

For DHL API support:
- Documentation: https://developer.dhl.com/
- Support: Contact your DHL account manager

For integration support:
- Check the API logs in your application
- Verify environment variables
- Test with provided test data 