import { createNCMOrder } from '../../../utils/ncm-api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('NCM Order Creation Request:', req.body);
    console.log('Environment check:', {
      hasBaseUrl: !!process.env.NCM_API_BASE_URL,
      hasToken: !!process.env.NCM_API_TOKEN,
      baseUrl: process.env.NCM_API_BASE_URL
    });

    const {
      name,
      phone,
      phone2,
      cod_charge,
      address,
      fbranch,
      branch,
      package: packageName,
      vref_id,
      instruction
    } = req.body;

    // Validate required fields
    if (!name || !phone || !cod_charge || !address || !fbranch || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, phone, cod_charge, address, fbranch, branch'
      });
    }

    const orderData = {
      name,
      phone,
      phone2: phone2 || '',
      cod_charge: cod_charge.toString(),
      address,
      fbranch,
      branch,
      package: packageName || '',
      vref_id: vref_id || '',
      instruction: instruction || ''
    };

    console.log('Sending order data to NCM API:', orderData);
    
    const response = await createNCMOrder(orderData);
    console.log('NCM API response:', response);
    
    res.status(200).json({
      success: true,
      data: response,
      message: 'NCM order created successfully'
    });
    
  } catch (error) {
    console.error('NCM Order Creation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create NCM order',
      error: error.message
    });
  }
}