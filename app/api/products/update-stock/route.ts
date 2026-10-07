import { NextRequest, NextResponse } from 'next/server';
import { getStrapiInternalUrl, STRAPI_API_TOKEN } from '@/utils/urls';
import { sendStockAlertEmail, StockAlertItem } from '@/utils/email';

const STRAPI_TOKEN = STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;

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

    // Automated inventory alert: If any size drops to 0 or <= 2, notify support@traditionalalley.com.np
    try {
      let parsedStocks = size_stocks;
      if (typeof parsedStocks === 'string') {
        try { parsedStocks = JSON.parse(parsedStocks); } catch (e) {}
      }

      if (parsedStocks && typeof parsedStocks === 'object') {
        const outOfStock: StockAlertItem[] = [];
        const lowStock: StockAlertItem[] = [];

        for (const [size, qty] of Object.entries(parsedStocks)) {
          const n = parseInt(qty as string, 10);
          if (!isNaN(n)) {
            if (n <= 0) {
              outOfStock.push({
                title: body.title || `Product (${documentId || variantDocumentId})`,
                size,
                currentStock: 0,
                documentId: documentId || variantDocumentId,
                status: 'OUT_OF_STOCK'
              });
            } else if (n <= 2) {
              lowStock.push({
                title: body.title || `Product (${documentId || variantDocumentId})`,
                size,
                currentStock: n,
                documentId: documentId || variantDocumentId,
                status: 'LOW_STOCK'
              });
            }
          }
        }

        if (outOfStock.length > 0 || lowStock.length > 0) {
          if (!body.title && documentId) {
            (async () => {
              try {
                let resolvedTitle = body.title;
                const pRes = await fetch(`${getStrapiInternalUrl()}/api/products/${documentId}`, {
                  headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
                  cache: 'no-store'
                });
                if (pRes.ok) {
                  const pJson = await pRes.json();
                  resolvedTitle = pJson.data?.title;
                }
                if (resolvedTitle) {
                  outOfStock.forEach(i => i.title = resolvedTitle);
                  lowStock.forEach(i => i.title = resolvedTitle);
                }
                await sendStockAlertEmail({ outOfStockItems: outOfStock, lowStockItems: lowStock });
              } catch (e) {
                sendStockAlertEmail({ outOfStockItems: outOfStock, lowStockItems: lowStock });
              }
            })();
          } else {
            sendStockAlertEmail({ outOfStockItems: outOfStock, lowStockItems: lowStock });
          }
        }
      }
    } catch (alertError) {
      console.error('⚠️ [API-ROUTE] Stock alert trigger error:', alertError);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ [API-ROUTE] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
