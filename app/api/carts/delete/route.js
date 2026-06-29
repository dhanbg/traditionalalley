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

    const candidateBases = Array.from(new Set([
      getStrapiUrl(),
      "http://strapi-alley-production:1337",
      "http://82.25.105.70:1339",
      "http://127.0.0.1:1337",
      "http://localhost:1337"
    ])).filter(url => url && !url.includes('traditionalalley.com.np'));

    let response = null;
    let lastErrorText = '';

    for (const base of candidateBases) {
      try {
        const apiUrl = `${base}/api/carts/${id}`;
        console.log(`[cart-delete] Attempting DELETE ${apiUrl}`);
        let res = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${STRAPI_TOKEN}`,
          },
        });

        console.log(`[cart-delete] DELETE ${apiUrl} -> ${res.status}`);

        if (!res.ok && res.status === 404) {
          const draftUrl = `${base}/api/carts/${id}?status=draft`;
          console.log(`[cart-delete] Retrying draft status: ${draftUrl}`);
          const draftRes = await fetch(draftUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${STRAPI_TOKEN}`,
            },
          });
          console.log(`[cart-delete] Draft DELETE -> ${draftRes.status}`);
          if (draftRes.ok || draftRes.status === 204) {
            res = draftRes;
          }
        }

        if (res.ok || res.status === 204) {
          response = res;
          break;
        } else {
          lastErrorText = await res.text();
          console.warn(`[cart-delete] ${base} returned status ${res.status}`);
        }
      } catch (err) {
        console.warn(`[cart-delete] Network error trying ${base}: ${err.message}`);
      }
    }

    if (!response) {
      console.error(`[cart-delete] All candidate endpoints failed. Last error: ${lastErrorText}`);
      return NextResponse.json(
        {
          error: 'Failed to delete cart item',
          details: lastErrorText,
          status: 403,
        },
        { status: 403 }
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
