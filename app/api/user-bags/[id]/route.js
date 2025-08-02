import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = params;
  let strapiUrl;
  
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';

    // Construct the URL for the Strapi API - using documentId for Strapi CRUD
    strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/user-bags/${id}?pagination[pageSize]=100&populate=${populate}`;

    // Fetch user bag from Strapi
    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Strapi responded with status ${response.status}`);
    }

    const userBag = await response.json();
    console.log(`User bag ${id} data from Strapi:`, userBag);

    return NextResponse.json(userBag);
  } catch (error) {
    console.error(`Error fetching user bag ${id} from Strapi:`, error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    }

    return NextResponse.json({ 
      error: 'Failed to fetch user bag', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  let strapiUrl;
  
  try {
    const body = await request.json();
    console.log(`Updating user bag ${id} with data:`, JSON.stringify(body, null, 2));

    // Construct the URL for the Strapi API - using documentId for Strapi CRUD
    strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/user-bags/${id}`;

    // Log the exact payload being sent to Strapi
    const payloadToSend = JSON.stringify(body);
    console.log(`Payload being sent to Strapi:`, payloadToSend);
    console.log(`Strapi URL:`, strapiUrl);

    // Update user bag in Strapi
    // The body already contains the correct Strapi structure with { data: ... }
    const response = await fetch(strapiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      },
      body: payloadToSend
    });

    console.log(`Strapi response status: ${response.status}`);
    console.log(`Strapi response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Strapi PUT error (${response.status}):`, errorText);
      console.error(`Request payload that caused error:`, payloadToSend);
      throw new Error(`Strapi responded with status ${response.status}: ${errorText}`);
    }

    const updatedUserBag = await response.json();
    console.log(`User bag ${id} updated successfully:`, updatedUserBag);

    return NextResponse.json(updatedUserBag);
  } catch (error) {
    console.error(`Error updating user bag ${id} in Strapi:`, error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    }

    return NextResponse.json({ 
      error: 'Failed to update user bag', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  let strapiUrl;
  
  try {
    // Construct the URL for the Strapi API - using documentId for Strapi CRUD
    strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/user-bags/${id}`;

    // Delete user bag from Strapi
    const response = await fetch(strapiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Strapi DELETE error (${response.status}):`, errorText);
      throw new Error(`Strapi responded with status ${response.status}: ${errorText}`);
    }

    const deletedUserBag = await response.json();
    console.log(`User bag ${id} deleted successfully:`, deletedUserBag);

    return NextResponse.json(deletedUserBag);
  } catch (error) {
    console.error(`Error deleting user bag ${id} from Strapi:`, error.message);
    if (strapiUrl) {
      console.error('Strapi URL:', strapiUrl);
    }

    return NextResponse.json({ 
      error: 'Failed to delete user bag', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}
