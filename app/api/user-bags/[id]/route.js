import { NextResponse } from 'next/server';
import { getStrapiInternalUrl } from '@/utils/urls';

const getStrapiUrl = () => getStrapiInternalUrl();
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  let strapiUrl;
  
  try {
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';

    strapiUrl = `${getStrapiUrl()}/api/user-bags/${id}?pagination[pageSize]=1000&populate=${populate}`;

    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Strapi responded with status ${response.status}`);
    }

    const userBag = await response.json();
    return NextResponse.json(userBag);
  } catch (error) {
    console.error(`Error fetching user bag ${id} from Strapi:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch user bag', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}

async function handleBagUpdate(request, id) {
  let strapiUrl;
  try {
    const body = await request.json();
    console.log(`Updating user bag ${id} with data:`, JSON.stringify(body, null, 2));

    strapiUrl = `${getStrapiUrl()}/api/user-bags/${id}`;
    const payloadToSend = JSON.stringify(body);

    // 1. Try POST with Method Override (Cloudflare-safe)
    let response = await fetch(strapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'X-HTTP-Method-Override': 'PUT',
        'X-Method-Override': 'PUT',
        'X-HTTP-Method': 'PUT'
      },
      body: payloadToSend
    });

    // 2. If blocked or method not allowed, try dedicated update endpoints
    if (!response.ok) {
      console.warn(`⚠️ [user-bag-proxy] POST override returned ${response.status}. Trying dedicated endpoint...`);
      
      const hasUserOrders = body?.data?.user_orders !== undefined || body?.user_orders !== undefined;
      const hasCod = body?.data?.cod !== undefined || body?.cod !== undefined;

      if (hasUserOrders) {
        const updateOrdersUrl = `${getStrapiUrl()}/api/user-bags/update-orders`;
        const ordersRes = await fetch(updateOrdersUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STRAPI_TOKEN}`,
          },
          body: JSON.stringify({
            documentId: id,
            user_orders: body?.data?.user_orders || body?.user_orders
          })
        });

        if (ordersRes.ok) {
          response = ordersRes;
        }
      }

      if (!response.ok && hasCod) {
        const updateCodUrl = `${getStrapiUrl()}/api/user-bags/update-cod`;
        const codRes = await fetch(updateCodUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STRAPI_TOKEN}`,
          },
          body: JSON.stringify({
            documentId: id,
            cod: body?.data?.cod || body?.cod
          })
        });

        if (codRes.ok) {
          response = codRes;
        }
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Strapi update error (${response.status}):`, errorText);
      throw new Error(`Strapi responded with status ${response.status}: ${errorText}`);
    }

    const updatedUserBag = await response.json();
    console.log(`User bag ${id} updated successfully:`, updatedUserBag);

    return NextResponse.json(updatedUserBag);
  } catch (error) {
    console.error(`Error updating user bag ${id} in Strapi:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to update user bag', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  return handleBagUpdate(request, id);
}

export async function POST(request, { params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  return handleBagUpdate(request, id);
}

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  let strapiUrl;
  
  try {
    strapiUrl = `${getStrapiUrl()}/api/user-bags/${id}`;

    const response = await fetch(strapiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'X-HTTP-Method-Override': 'DELETE',
        'X-Method-Override': 'DELETE',
        'X-HTTP-Method': 'DELETE'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Strapi responded with status ${response.status}: ${errorText}`);
    }

    const deletedUserBag = await response.json().catch(() => ({ success: true, deletedId: id }));
    return NextResponse.json(deletedUserBag);
  } catch (error) {
    console.error(`Error deleting user bag ${id} from Strapi:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to delete user bag', 
      details: error.message,
      strapiUrl: strapiUrl || null
    }, { status: 500 });
  }
}
