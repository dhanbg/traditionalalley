import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get NCM API credentials from environment variables
    const NCM_API_BASE_URL = process.env.NCM_API_BASE_URL;
    const NCM_API_TOKEN = process.env.NCM_API_TOKEN;

    // Using direct NCM API URL since it's publicly accessible for branch list

    // Fetch branches from NCM API using the production URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://portal.nepalcanmove.com/api/v1/branchlist', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('NCM API request failed:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch branches from NCM API'
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Parse the branch data from NCM API
    let branches = [];
    if (Array.isArray(data)) {
      // Data is directly an array of branches
      branches = data.map(branch => ({
        name: branch[0] || '',
        code: branch[1] || '',
        municipality: branch[3] || '',
        district: branch[4] || '',
        region: branch[5] || '',
        phone: branch[6] || '',
        coordinates: branch[7] || ''
      }));
    } else if (data && data.data) {
      // Handle if data is wrapped in a data property
      if (typeof data.data === 'string') {
        try {
          const branchArray = JSON.parse(data.data);
          branches = branchArray.map(branch => ({
            name: branch[0] || '',
            code: branch[1] || '',
            municipality: branch[3] || '',
            district: branch[4] || '',
            region: branch[5] || '',
            phone: branch[6] || '',
            coordinates: branch[7] || ''
          }));
        } catch (parseError) {
          console.error('Failed to parse NCM branch data:', parseError);
          return NextResponse.json({
            success: false,
            message: 'Failed to parse branch data'
          }, { status: 500 });
        }
      } else if (Array.isArray(data.data)) {
        branches = data.data.map(branch => ({
          name: branch[0] || '',
          code: branch[1] || '',
          municipality: branch[3] || '',
          district: branch[4] || '',
          region: branch[5] || '',
          phone: branch[6] || '',
          coordinates: branch[7] || ''
        }));
      }
    }

    console.log(`Successfully fetched ${branches.length} branches from NCM API`);

    return NextResponse.json({
      success: true,
      branches: branches,
      count: branches.length
    });

  } catch (error) {
    console.error('Error fetching NCM branches:', error);
    
    // Handle different types of errors
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorMessage = 'NCM API request timed out. Please try again later.';
      statusCode = 408; // Request Timeout
    } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      errorMessage = 'Connection to NCM API timed out. Please try again later.';
      statusCode = 408;
    } else if (error.message && error.message.includes('fetch')) {
      errorMessage = 'Unable to connect to NCM API. Please check your internet connection.';
      statusCode = 503; // Service Unavailable
    }
    
    return NextResponse.json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: statusCode });
  }
}
