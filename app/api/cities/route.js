import { NextResponse } from 'next/server';
import { getCitiesForCountry, searchCities, validatePostalCode } from '../../../lib/countries-cities.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('country');
    const search = searchParams.get('search');
    const validatePostal = searchParams.get('validatePostal');

    if (!countryCode) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Country code is required',
          message: 'Please provide a country code parameter'
        },
        { status: 400 }
      );
    }

    let result;

    if (search) {
      // Search cities within the country
      result = searchCities(countryCode, search);
    } else {
      // Get all cities for the country
      result = getCitiesForCountry(countryCode);
    }

    // If postal code validation is requested
    let postalValidation = null;
    if (validatePostal) {
      postalValidation = {
        isValid: validatePostalCode(countryCode, validatePostal),
        postalCode: validatePostal,
        countryCode: countryCode
      };
    }

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      countryCode: countryCode,
      postalValidation: postalValidation
    });

  } catch (error) {
    console.error('Cities API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cities',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 