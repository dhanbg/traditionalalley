import { NextResponse } from 'next/server';
import DHLExpressService from '../../../../lib/dhl-service.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'address' or 'route'
    
    if (!type || !['address', 'route'].includes(type)) {
      return NextResponse.json(
        { error: 'Missing or invalid type parameter. Use "address" or "route"' },
        { status: 400 }
      );
    }

    const dhlService = new DHLExpressService();

    if (type === 'address') {
      // Address validation
      const countryCode = searchParams.get('countryCode');
      const postalCode = searchParams.get('postalCode');
      const cityName = searchParams.get('cityName');
      
      if (!countryCode || !postalCode || !cityName) {
        return NextResponse.json(
          { error: 'Missing required parameters for address validation: countryCode, postalCode, cityName' },
          { status: 400 }
        );
      }

      const address = {
        countryCode,
        postalCode,
        cityName
      };

      const validation = await dhlService.validateAddress(address);

      return NextResponse.json({
        success: true,
        data: validation
      });

    } else if (type === 'route') {
      // Route capabilities
      const originCountryCode = searchParams.get('originCountryCode');
      const originPostalCode = searchParams.get('originPostalCode');
      const originCityName = searchParams.get('originCityName');
      const destinationCountryCode = searchParams.get('destinationCountryCode');
      const destinationPostalCode = searchParams.get('destinationPostalCode');
      const destinationCityName = searchParams.get('destinationCityName');
      
      if (!originCountryCode || !originPostalCode || !originCityName ||
          !destinationCountryCode || !destinationPostalCode || !destinationCityName) {
        return NextResponse.json(
          { 
            error: 'Missing required parameters for route capabilities: originCountryCode, originPostalCode, originCityName, destinationCountryCode, destinationPostalCode, destinationCityName' 
          },
          { status: 400 }
        );
      }

      const routeRequest = {
        originCountryCode,
        originPostalCode,
        originCityName,
        destinationCountryCode,
        destinationPostalCode,
        destinationCityName
      };

      const capabilities = await dhlService.getCapabilities(routeRequest);

      return NextResponse.json({
        success: true,
        data: capabilities
      });
    }

  } catch (error) {
    console.error('DHL Capabilities API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get capabilities',
        message: error.message,
        details: error.data || null
      },
      { status: error.status || 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to check capabilities.' },
    { status: 405 }
  );
} 