import { NextRequest, NextResponse } from 'next/server';
import { getStrapiInternalUrl } from '@/utils/urls';

const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "53a5a13bf33757eb9d5d8fea2d721742ecc5ff24562b0858f073feb6818a2a9c3ba8d052e6c143222c01d504cdfd85500c307502f01655929a8c4a6b2ed84b6096e0539d71b920e84551459e3049b1f452647911330b6de4bcbcc655e727f38ace8d0802a010c75628f1d792fcf047c77efeced311b1248fc09b32e2614da62a";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const documentId = body.documentId || body.data?.documentId;
    const size_stocks = body.size_stocks !== undefined ? body.size_stocks : body.data?.size_stocks;
    const isVariant = body.isVariant || body.data?.isVariant;
    const variantDocumentId = body.variantDocumentId || body.data?.variantDocumentId;

    console.log(`📦 [API-ROUTE] /api/products/update-stock called:`, { documentId, isVariant, variantDocumentId, size_stocks });

    // 1. Try POST with X-HTTP-Method-Override: PUT to /api/products/:id or /api/product-variants/:id
    const targetEndpoint = isVariant && variantDocumentId
      ? `/api/product-variants/${variantDocumentId}`
      : `/api/products/${documentId}`;

    const putUrl = `${getStrapiInternalUrl()}${targetEndpoint}`;
    let res = await fetch(putUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'X-HTTP-Method-Override': 'PUT',
        'X-Method-Override': 'PUT',
        'X-HTTP-Method': 'PUT'
      },
      body: JSON.stringify({ data: { size_stocks } })
    });

    // 2. If not ok, try dedicated /api/products/update-stock on Strapi
    if (!res.ok) {
      const dedicatedUrl = `${getStrapiInternalUrl()}/api/products/update-stock`;
      const dedicatedRes = await fetch(dedicatedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({ documentId, size_stocks, isVariant, variantDocumentId })
      });

      if (dedicatedRes.ok) {
        res = dedicatedRes;
      }
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ [API-ROUTE] Failed to update stock: ${errorText}`);
      return NextResponse.json({ error: 'Failed to update stock', details: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ [API-ROUTE] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
