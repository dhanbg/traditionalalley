import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get NCM API credentials from environment variables
    const NCM_API_BASE_URL = process.env.NCM_API_BASE_URL || 'https://portal.nepalcanmove.com';
    const NCM_API_TOKEN = process.env.NCM_API_TOKEN;

    if (!NCM_API_TOKEN) {
      console.error('NCM API credentials not found in environment variables');
      return NextResponse.json({
        success: false,
        message: 'NCM API configuration error'
      }, { status: 500 });
    }

    // Fetch branches from NCM API
    const response = await fetch(`${NCM_API_BASE_URL}/api/v1/branchlist`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${NCM_API_TOKEN}`,
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
    
    // Parse the stringified JSON data from NCM API
    let branches = [];
    if (data && data.data && typeof data.data === 'string') {
      try {
        const branchArray = JSON.parse(data.data);
        // Convert array format to object format for easier use
        branches = branchArray.map(branch => ({
          name: branch[0],
          code: branch[1],
          municipality: branch[3],
          district: branch[4],
          region: branch[5],
          phone: branch[6],
          coordinates: branch[7]
        }));
      } catch (parseError) {
        console.error('Failed to parse NCM branch data:', parseError);
        return NextResponse.json({
          success: false,
          message: 'Failed to parse branch data'
        }, { status: 500 });
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
