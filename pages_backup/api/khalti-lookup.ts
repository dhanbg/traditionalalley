import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pidx } = req.body;

  if (!pidx) {
    return res.status(400).json({ error: 'pidx is required' });
  }

  const secretKey = process.env.KHALTI_SECRET_KEY;
  if (!secretKey) {
    console.error("Khalti secret key is not defined in environment variables.");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const khaltiApiUrl = "https://dev.khalti.com/api/v2/epayment/lookup/";
  // For production, change to: "https://khalti.com/api/v2/epayment/lookup/"

  try {
    const khaltiResponse = await fetch(khaltiApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });

    const data = await khaltiResponse.json();

    if (!khaltiResponse.ok) {
      console.error("Khalti Lookup API Error:", data);
      const errorMessage = data?.detail || data?.error_key || `Khalti API responded with status ${khaltiResponse.status}`;
      return res.status(khaltiResponse.status).json({ error: errorMessage, details: JSON.stringify(data) });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("Error calling Khalti lookup API:", error);
    res.status(500).json({ 
      error: 'Internal server error during Khalti payment lookup.', 
      details: (error instanceof Error) ? error.message : String(error) 
    });
  }
} 