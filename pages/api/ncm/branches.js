import { getAvailableBranches } from '../../../utils/ncm-api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Fetching NCM branches...');
    console.log('Environment check:', {
      hasBaseUrl: !!process.env.NCM_API_BASE_URL,
      hasToken: !!process.env.NCM_API_TOKEN,
      baseUrl: process.env.NCM_API_BASE_URL
    });

    const branches = await getAvailableBranches();
    console.log(`Successfully fetched ${branches.length} branches from NCM API`);
    
    res.status(200).json({ 
      success: true, 
      branches: branches,
      count: branches.length
    });
  } catch (error) {
    console.error('NCM Branches API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch branches',
      details: error.message 
    });
  }
}