import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Only expose non-sensitive configuration information
    const config = {
      nextauthUrl: process.env.NEXTAUTH_URL || '',
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
      // Don't expose actual secrets, just whether they exist
      googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID ? 
        process.env.GOOGLE_CLIENT_ID.substring(0, 12) + '...' : 'Not set'
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching auth config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auth configuration' },
      { status: 500 }
    );
  }
}