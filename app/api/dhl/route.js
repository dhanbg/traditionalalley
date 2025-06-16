import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      message: 'DHL Express MyDHL API Integration',
      version: '2.13.3',
      environment: process.env.DHL_ENVIRONMENT || 'test',
      baseUrl: process.env.DHL_ENVIRONMENT === 'production' 
        ? process.env.DHL_PRODUCTION_URL 
        : process.env.DHL_BASE_URL,
      endpoints: {
        rates: {
          url: '/api/dhl/rates',
          method: 'POST',
          description: 'Get shipping rates for a shipment',
          requiredFields: ['originAddress', 'destinationAddress', 'packages', 'plannedShippingDate']
        },
        shipments: {
          url: '/api/dhl/shipments',
          method: 'POST',
          description: 'Create a new DHL Express shipment',
          requiredFields: ['originAddress', 'destinationAddress', 'packages', 'plannedShippingDate', 'shipper', 'recipient']
        },
        tracking: {
          url: '/api/dhl/tracking',
          methods: ['GET', 'POST'],
          description: 'Track DHL Express shipments',
          get: 'Single tracking: ?trackingNumber=XXXXXXXXXX',
          post: 'Multiple tracking: { "trackingNumbers": ["XXX", "YYY"] }'
        },
        landedCost: {
          url: '/api/dhl/landed-cost',
          method: 'POST',
          description: 'Get landed cost estimation for international shipments',
          requiredFields: ['originAddress', 'destinationAddress', 'packages']
        },
        pickups: {
          url: '/api/dhl/pickups',
          method: 'POST',
          description: 'Request a DHL Express pickup',
          requiredFields: ['plannedPickupDateAndTime', 'address', 'contact']
        },
        capabilities: {
          url: '/api/dhl/capabilities',
          methods: ['GET', 'POST'],
          description: 'Validate address capabilities and service availability',
          get: 'Single address: ?countryCode=XX&cityName=City&postalCode=12345',
          post: 'Multiple addresses: { "addresses": [{"countryCode": "XX", "cityName": "City"}] }'
        }
      },
      sampleRequests: {
        rates: {
          originAddress: {
            countryCode: 'NP',
            cityName: 'Kathmandu',
            postalCode: '44600',
            addressLine1: '123 Main Street'
          },
          destinationAddress: {
            countryCode: 'AU',
            cityName: 'Sydney',
            postalCode: '2000',
            addressLine1: '456 Destination Street'
          },
          packages: [{
            weight: 1.5,
            length: 20,
            width: 15,
            height: 10,
            description: 'Sample Package',
            declaredValue: 100
          }],
          plannedShippingDate: '2024-01-15',
          isCustomsDeclarable: true
        },
        shipment: {
          originAddress: {
            countryCode: 'NP',
            cityName: 'Kathmandu',
            postalCode: '44600',
            addressLine1: '123 Main Street'
          },
          destinationAddress: {
            countryCode: 'AU',
            cityName: 'Sydney',
            postalCode: '2000',
            addressLine1: '456 Destination Street'
          },
          packages: [{
            weight: 1.5,
            length: 20,
            width: 15,
            height: 10,
            description: 'Sample Package',
            declaredValue: 100,
            quantity: 1
          }],
          plannedShippingDate: '2024-01-15',
          productCode: 'P',
          isCustomsDeclarable: true,
          shipper: {
            companyName: 'Traditional Alley',
            fullName: 'John Doe',
            email: 'john@traditionalalley.com',
            phone: '+977-1-1234567'
          },
          recipient: {
            companyName: 'Recipient Company',
            fullName: 'Jane Smith',
            email: 'jane@recipient.com',
            phone: '+61-2-9876543'
          }
        }
      },
      documentation: {
        officialDocs: 'https://developer.dhl.com/api-reference/dhl-express-mydhl-api',
        authentication: 'Basic Auth using API Key and Secret',
        rateLimit: 'Varies by endpoint and account type',
        supportedCountries: 'Global coverage with DHL Express network',
        testEnvironment: 'https://express.api.dhl.com/mydhlapi/test',
        productionEnvironment: 'https://express.api.dhl.com/mydhlapi'
      }
    },
    { status: 200 }
  );
} 