import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pidx } = await request.json();

    if (!pidx) {
      return NextResponse.json({ error: 'pidx is required' }, { status: 400 });
    }

    const secretKey = process.env.KHALTI_SECRET_KEY;
    if (!secretKey) {
      console.error("Khalti secret key is not defined in environment variables.");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const khaltiApiUrl = "https://dev.khalti.com/api/v2/epayment/lookup/";
    // For production, change to: "https://khalti.com/api/v2/epayment/lookup/"

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
      return NextResponse.json(
        { error: errorMessage, details: JSON.stringify(data) },
        { status: khaltiResponse.status }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Error calling Khalti lookup API:", error);
    return NextResponse.json(
      { 
        error: 'Internal server error during Khalti payment lookup.', 
        details: (error instanceof Error) ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 