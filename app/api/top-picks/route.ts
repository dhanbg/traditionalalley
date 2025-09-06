import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') || '*';
    
    const strapiResponse = await fetch(`${STRAPI_URL}/api/top-picks?populate=${populate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for fresh data
    });

    if (!strapiResponse.ok) {
      // Return mock data if Strapi API is not accessible (403 or other errors)
      console.warn(`Strapi API returned ${strapiResponse.status}, using mock data`);
      return NextResponse.json({
        "data": [
          {
            "id": 2,
            "documentId": "dz1njd3s9gxuk4vjmgizp1m5",
            "heading": "Top Picks",
            "subheading": "The styles everyone's loving right now.",
            "createdAt": "2025-09-04T16:10:27.474Z",
            "updatedAt": "2025-09-04T16:10:31.908Z",
            "publishedAt": "2025-09-04T16:10:31.923Z",
            "isActive": true,
            "products": [
              {
                "id": 181,
                "documentId": "upm0ch2juezchxnnrswapb1p",
                "title": "Juveniel",
                "price": 159.99,
                "oldPrice": null,
                "isOnSale": null,
                "hotSale": null,
                "countdown": null,
                "filterBrands": null,
                "tabFilterOptions": null,
                "tabFilterOptions2": null,
                "slug": null,
                "createdAt": "2025-07-11T06:26:52.819Z",
                "updatedAt": "2025-08-31T04:53:38.951Z",
                "publishedAt": "2025-08-31T04:53:39.027Z",
                "description": null,
                "weight": "3",
                "dimensions": "40x30x10 cm",
                "hsCode": "6204.43",
                "addToCart": null,
                "productGroup": null,
                "size_stocks": {
                  "M": 4,
                  "XL": 3
                },
                "isActive": true
              },
              {
                "id": 148,
                "documentId": "qyrjxg1hshlc3t6dw8vdp50w",
                "title": "Raila Hoodie",
                "price": 2,
                "oldPrice": 219.99,
                "isOnSale": false,
                "hotSale": true,
                "countdown": null,
                "filterBrands": null,
                "tabFilterOptions": [
                  "Formal Wear",
                  "Events"
                ],
                "tabFilterOptions2": [
                  "New Arrivals",
                  "Best Seller"
                ],
                "slug": null,
                "createdAt": "2025-04-24T08:57:03.714Z",
                "updatedAt": "2025-07-23T10:08:20.957Z",
                "publishedAt": "2025-07-23T10:08:21.010Z",
                "description": [
                  {
                    "type": "heading",
                    "level": 6,
                    "children": [
                      {
                        "text": "Stretch strap top",
                        "type": "text"
                      }
                    ]
                  },
                  {
                    "type": "paragraph",
                    "children": [
                      {
                        "text": "Nodding to retro styles, this Hyperbola T-shirt is defined by its off-the-shoulder design. It's spun from a green stretch cotton jersey and adorned with an embroidered AC logo on the front, a brand's signature.",
                        "type": "text"
                      }
                    ]
                  }
                ],
                "weight": "3",
                "dimensions": "10x10x10 cm",
                "hsCode": "6212.90",
                "addToCart": null,
                "productGroup": null,
                "size_stocks": null,
                "isActive": true
              }
            ]
          }
        ],
        "meta": {
          "pagination": {
            "page": 1,
            "pageSize": 25,
            "pageCount": 1,
            "total": 1
          }
        }
      });
    }

    const data = await strapiResponse.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in top-picks API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}