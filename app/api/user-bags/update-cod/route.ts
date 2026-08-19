import { NextRequest, NextResponse } from 'next/server';
import { getStrapiInternalUrl } from '@/utils/urls';

const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const documentId = body.documentId || body.data?.documentId;
    const cod = body.cod !== undefined ? body.cod : body.data?.cod;

    if (!documentId) {
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
    }

    console.log(`💵 [API-ROUTE] /api/user-bags/update-cod called for ${documentId}`);

    // 1. Try POST with X-HTTP-Method-Override: PUT to /api/user-bags/:id
    const putUrl = `${getStrapiInternalUrl()}/api/user-bags/${documentId}`;
    let res = await fetch(putUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'X-HTTP-Method-Override': 'PUT',
        'X-Method-Override': 'PUT',
        'X-HTTP-Method': 'PUT'
      },
      body: JSON.stringify({ data: { cod } })
    });

    // 2. If not ok, try dedicated /api/user-bags/update-cod on Strapi
    if (!res.ok) {
      const dedicatedUrl = `${getStrapiInternalUrl()}/api/user-bags/update-cod`;
      const dedicatedRes = await fetch(dedicatedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({ documentId, cod })
      });

      if (dedicatedRes.ok) {
        res = dedicatedRes;
      }
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ [API-ROUTE] Failed to update COD: ${errorText}`);
      return NextResponse.json({ error: 'Failed to update COD', details: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ [API-ROUTE] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
