import { getAvailableBranches } from '../../../utils/ncm-api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('NCM Branches API Request');
    console.log('Environment check:', {
      hasBaseUrl: !!process.env.NCM_API_BASE_URL,
      hasToken: !!process.env.NCM_API_TOKEN,
      baseUrl: process.env.NCM_API_BASE_URL
    });

    // Get NCM API credentials from environment variables
    const NCM_API_BASE_URL = process.env.NCM_API_BASE_URL;
    const NCM_API_TOKEN = process.env.NCM_API_TOKEN;

    if (!NCM_API_BASE_URL || !NCM_API_TOKEN) {
      console.error('NCM API credentials not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'NCM API configuration error'
      });
    }

    // Fetch branches from NCM API
    const response = await fetch(`${NCM_API_BASE_URL}/branchlist`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${NCM_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('NCM API request failed:', response.status, response.statusText);
      return res.status(response.status).json({
        success: false,
        message: 'Failed to fetch branches from NCM API'
      });
    }

    const data = await response.json();
    console.log('NCM API raw response:', data);
    
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
        return res.status(500).json({
          success: false,
          message: 'Failed to parse branch data'
        });
      }
    }

    console.log(`Successfully fetched ${branches.length} branches from NCM API`);

    res.status(200).json({
      success: true,
      branches: branches,
      count: branches.length
    });

  } catch (error) {
    console.error('Error fetching NCM branches:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      details: error.message
    });
  }
}