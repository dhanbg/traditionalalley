import { NextResponse } from 'next/server';
import { getStrapiInternalUrl } from '@/utils/urls';

const getStrapiUrl = () => getStrapiInternalUrl();
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";

export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  try {
    const body = await request.json();
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
        let res = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${STRAPI_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          response = res;
          break;
        } else {
          lastErrorText = await res.text();
        }
      } catch (err) {
        // network error trying base
      }
    }

    if (!response) {
      return NextResponse.json({
        error: 'Failed to update cart item',
        details: lastErrorText,
        status: 400
      }, { status: 400 });
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : { success: true };
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  try {
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
        let res = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${STRAPI_TOKEN}`,
          },
        });

        if (!res.ok && res.status === 404) {
          const draftUrl = `${base}/api/carts/${id}?status=draft`;
          const draftRes = await fetch(draftUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${STRAPI_TOKEN}`,
            },
          });
          if (draftRes.ok || draftRes.status === 204) {
            res = draftRes;
          }
        }

        if (res.ok || res.status === 204) {
          response = res;
          break;
        } else {
          lastErrorText = await res.text();
        }
      } catch (err) {
        // network error
      }
    }

    if (!response) {
      return NextResponse.json({
        error: 'Failed to delete cart item',
        details: lastErrorText,
        status: 403
      }, { status: 403 });
    }

    const text = await response.text();
    let data = { success: true };
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { success: true, text };
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
