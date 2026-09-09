import { NextResponse } from 'next/server';
import { countries, getCountriesByRegion, searchCountries } from '../../../lib/countries-cities.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const groupByRegion = searchParams.get('groupByRegion') === 'true';

    let result;

    if (search) {
      // Search countries
      result = searchCountries(search);
    } else if (groupByRegion) {
      // Group countries by region
      result = getCountriesByRegion();
    } else {
      // Return all countries
      result = countries;
    }

    return NextResponse.json({
      success: true,
      data: result,
      count: Array.isArray(result) ? result.length : Object.keys(result).length
    }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('Countries API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch countries',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 