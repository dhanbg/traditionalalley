import { NextResponse } from 'next/server';
import { getStrapiInternalUrl } from '@/utils/urls';

/**
 * POST-based cart deletion endpoint.
 * 
 * Cloudflare WAF blocks HTTP DELETE requests to our domain, so we use
 * POST /api/carts/delete with { id: "documentId" } in the body.
 * The server-side code then sends the actual DELETE to Strapi via the
 * internal Docker network, bypassing Cloudflare entirely.
 */

const getStrapiUrl = () => getStrapiInternalUrl();
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";

export async function POST(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing cart item id' },
        { status: 400 }
      );
    }

    console.log(`[cart-delete] Deleting cart item: ${id}`);

    // Try standard DELETE first
    let apiUrl = `${getStrapiUrl()}/api/carts/${id}`;
    let response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
      },
    });

    console.log(`[cart-delete] DELETE ${apiUrl} -> ${response.status}`);

    // If 404, try with ?status=draft for Strapi 5 draft entries
    if (!response.ok && response.status === 404) {
      const draftUrl = `${getStrapiUrl()}/api/carts/${id}?status=draft`;
      console.log(`[cart-delete] Retrying with draft status: ${draftUrl}`);
      const draftResponse = await fetch(draftUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
        },
      });
      console.log(`[cart-delete] Draft DELETE -> ${draftResponse.status}`);
      if (draftResponse.ok || draftResponse.status === 204) {
        response = draftResponse;
      }
    }

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      console.error(`[cart-delete] Failed: ${response.status} - ${errorText}`);
      return NextResponse.json(
        {
          error: 'Failed to delete cart item',
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Handle 204 No Content or successful response
    const text = await response.text();
    let data = { success: true, deletedId: id };
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
        data.success = true;
        data.deletedId = id;
      } catch (e) {
        data = { success: true, deletedId: id };
      }
    }

    console.log(`[cart-delete] Success: deleted ${id}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[cart-delete] Internal error:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
