import { NextResponse } from 'next/server';
import { getStrapiInternalUrl } from '@/utils/urls';

const getStrapiUrl = () => getStrapiInternalUrl();
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";

export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  try {
    const body = await request.json();
    const apiUrl = `${getStrapiUrl()}/api/carts/${id}`;

    // Send POST with Method Override for Cloudflare compatibility
    let res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'PUT',
        'X-Method-Override': 'PUT',
        'X-HTTP-Method': 'PUT'
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({
        error: 'Failed to update cart item',
        details: errorText,
        status: res.status
      }, { status: res.status });
    }

    const data = await res.json().catch(() => ({ success: true }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  try {
    // 1. Try POST with DELETE override
    const apiUrl = `${getStrapiUrl()}/api/carts/${id}`;
    let res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'X-HTTP-Method-Override': 'DELETE',
        'X-Method-Override': 'DELETE',
        'X-HTTP-Method': 'DELETE'
      },
    });

    // 2. If not ok, try dedicated /api/carts/delete-item
    if (!res.ok) {
      const dedicatedUrl = `${getStrapiUrl()}/api/carts/delete-item`;
      const dedicatedRes = await fetch(dedicatedUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: id }),
      });

      if (dedicatedRes.ok) {
        res = dedicatedRes;
      }
    }

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({
        error: 'Failed to delete cart item',
        details: errorText,
        status: res.status
      }, { status: res.status });
    }

    const data = await res.json().catch(() => ({ success: true, deletedId: id }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
