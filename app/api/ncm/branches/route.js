import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get NCM API credentials from environment variables
    const NCM_API_BASE_URL = process.env.NCM_API_BASE_URL;
    const NCM_API_TOKEN = process.env.NCM_API_TOKEN;

    // Using direct NCM API URL since it's publicly accessible for branch list

    // Fetch branches from NCM API using the production URL
    const response = await fetch('https://portal.nepalcanmove.com/api/v1/branchlist', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

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
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
