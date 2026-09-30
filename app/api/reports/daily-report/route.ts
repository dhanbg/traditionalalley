import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// In-memory cache for quick response (5 minutes TTL per date)
const reportCache = new Map<string, { data: any; expiresAt: number }>();

// Helper to format landing page titles cleanly
function formatPageTitle(p: string, raw: string): string {
  if (p === '/' || p === '') return 'Home Page';
  if (p === '/women') return 'Women Category';
  if (p === '/men') return 'Men Category';
  if (p === '/kids') return 'Kids Category';
  if (p === '/checkout') return 'Checkout Page';
  if (p.startsWith('/collections/corsets')) return 'Corsets Collection';
  if (p.startsWith('/collections/nepalidhaka')) return 'Nepali Dhaka';
  if (p.startsWith('/collections/kurtha')) return 'Kurtha Collection';
  if (p.startsWith('/collections/gown')) return 'Designer Gowns Collection';
  if (p.startsWith('/collections/saree')) return 'Sarees Collection';
  if (p.startsWith('/collections/')) {
    const slug = p.replace('/collections/', '').replace(/[-_]/g, ' ');
    return slug.charAt(0).toUpperCase() + slug.slice(1) + ' Collection';
  }
  let clean = raw.split(/\||–|-/)[0].trim();
  clean = clean.replace(/traditional alley/gi, '').trim();
  clean = clean.replace(/^[\s\-_:]+|[\s\-_:]+$/g, '').trim();
  return clean || 'Page';
}

// Default GA4 Service Account credentials for Vercel production deployment
const DEFAULT_GA_CREDS = {
  client_email: "ga4-reader@traditional-alley.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyCuTs9Kwe96yK\nA/daFSUPnMcAStaKFEmP8Bxba0aVtDwl0gz3PlktZjeLdUxW6dou5h5nIf3yc/NE\nCwucUhYKE1uPU1GdP2vAhAId4V4LPRu83aVakh352pKuDet7eRdFd3B1LOfN6iwi\n8Hxi5bawkxW1DRRMwYBDSzL/GbsOsB6BaRmk950/ClKZjC5hSo1/vaNdrrIrMWJi\nM3WMhWIS7hUsEydSN0xqAZDmkYfdbbbRqQG1FQNaZwOaLAfmRsg6oZBzCET1Bg0p\nGA7tht8y5mOqsW13lAFeaIzg8PkSqrrJBT6QN1qJPpOncI26o5pnqwCyKn1Z/jgc\nxcwT+KNTAgMBAAECggEARnZbTZAzwnnA9kpFjYhKx5gDhhEYQUNwLaAYiPG22K6h\nE1LDQOKTBo2qs+2zTb51VBRMugJQ77CF+UrpyG8QO+KXXOzbowEjkuhrsgmsX4RK\nwv9xXpvvcx/W5z2pEY/F7v8rKaShBPSFjTph7/37xHwhnirT+uCl83wCbcVwK4pM\nyErWqznyNg4XYADsSTCk4c672yww49FViZ3j0tpBrkr9miWLW6huUQ5i42pDUn2L\nt5+FIsiW9g+A6IWfJIvwbJEOCd/39Q0dlKz8/zj98BTAFqgWjdUrDYzPj9oQ2sTh\nXuvnUCuXQ4D8dp/LAe8lm9Jb6HgGSecxMfN/DABOOQKBgQDlrkEL+BfRF/3xJ4fS\ngm7ASItdmeKKy1aVznXnu9WdvIUVG2yCC95uJhO+Y8zTfsTfKU4cmdEZA3xGE8xg\n0sNgBIedDToMT6CKPgyKmtGVosLibwRSCCUu045SDjyaGpYyqoQDMvq0FfViTnKO\naD7Sl529x8/OJ8kfIZsePXKuZwKBgQDGcdJShzvKxU1U0hRYdFJevEc/7rtYLo0t\nabCSCsfxf1/K4j2N0k6LXKB4mzcNSqoBSbVn5tQM8ARS6HydX04FKQJJRyEaFpDn\nYzyxW64evvcjHjPSWSOfnZjZbbUz9PlHcUrQ3Yx8IuvcmODse4pcQkTA6x/wqj4R\niaTrfcw4NQKBgQCZxk8ammInxi5pFRRkpptL9cYJRwxb7MPtzKs4GZRt5Vgcx52g\nfB3SFYBGij8KoudgmiEIGRvb6W9846iEctgII0BAsChbMbzEkcKH0hvcWXqta7Ky\n0W1DqrSwz4NXkdFZ3rxAABPGGqWNygP8wGK/UG92Lp884XpQc4mNd4qepQKBgDlX\nQFfafbt8wXil730Tt41qSAhAOmAjq2WY6Y15kgbFMG/WacTmJQ396NyQtRqhHXib\nzNBGEbXfUNCIHyH2HPw+uktkQztfk+VYdnwlKq31rkG2g3DfkvyXNEh3e+mUesdb\nBCxQKDzidlba0ftjQzqfZ3B7QFJxTtgQdtgZFH6VAoGBAN8JvPqQjR9qHi4ifIBQ\nncIXmiNPZwm5LhUDSHya5V2BWIzkBbJlDARXOiLf2wdf0oue+JhPYoUKoBotfi1j\ndw+8BiSj7mZBbhkTXgSq8X4S8F3kEWhWdzKhsQ9bG1zaSU/yzYo1rndVi7EITkey\npOBLWW9pNsyLgkOwa9N6iqDy\n-----END PRIVATE KEY-----\n",
};

// Singleton GA4 client
let cachedGAClient: { client: BetaAnalyticsDataClient; propertyId: string } | null = null;

function getGA4Client() {
  if (cachedGAClient) return cachedGAClient;

  try {
    const propertyId = process.env.GA4_PROPERTY_ID || '507607521';
    const jsonPath = path.join(process.cwd(), 'ga-service-account.json');

    if (fs.existsSync(jsonPath)) {
      const client = new BetaAnalyticsDataClient({ keyFilename: jsonPath });
      cachedGAClient = { client, propertyId };
      return cachedGAClient;
    }

    if (process.env.GA_SERVICE_ACCOUNT_KEY) {
      const credentials = JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);
      const client = new BetaAnalyticsDataClient({ credentials });
      cachedGAClient = { client, propertyId };
      return cachedGAClient;
    }

    if (process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY) {
      const client = new BetaAnalyticsDataClient({
        credentials: {
          client_email: process.env.GA_CLIENT_EMAIL,
          private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
      });
      cachedGAClient = { client, propertyId };
      return cachedGAClient;
    }

    // Production Cloud Fallback (for Vercel serverless where local json is ignored)
    const client = new BetaAnalyticsDataClient({ credentials: DEFAULT_GA_CREDS });
    cachedGAClient = { client, propertyId };
    return cachedGAClient;
  } catch (error) {
    console.error('Error initializing GA4 client:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 0. Authorization check: Authorized administrators can access Daily Report data
    const session = await auth();
    const userEmail = (session?.user?.email || '').trim().toLowerCase();
    const userRole = (session?.user as any)?.role;

    if (session) {
      const isAuthorizedAdmin = 
        userEmail === 'gurungvaaiii@gmail.com' || 
        userEmail === 'traditionalley2050@gmail.com' || 
        userRole === 'admin';

      if (!isAuthorizedAdmin) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Access restricted to authorized administrator' },
          { status: 403 }
        );
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const targetDate = searchParams.get('date') || yesterday.toISOString().slice(0, 10);
    const bypassCache = searchParams.get('refresh') === 'true';

    // Check in-memory cache (5-minute TTL)
    if (!bypassCache) {
      const cached = reportCache.get(targetDate);
      if (cached && Date.now() < cached.expiresAt) {
        return NextResponse.json(cached.data);
      }
    }

    const API_URL = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'https://admin.traditionalalley.com.np';
    const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

    const headers = {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      'Content-Type': 'application/json',
    };

    // 1. Fetch Strapi DB data concurrently
    const strapiPromise = async () => {
      let newRegistrations = 0;
      let totalCarts = 0;
      let pendingCheckouts = 0;
      const purchases: any[] = [];
      let hasTestPayment = false;
      let isApiHealthy = true;

      const [usersSettled, cartsSettled, bagsSettled] = await Promise.allSettled([
        axios.get(`${API_URL}/api/user-data?pagination[pageSize]=100&sort=createdAt:desc`, { headers, timeout: 8000 }),
        axios.get(`${API_URL}/api/carts?pagination[pageSize]=100`, { headers, timeout: 8000 }),
        axios.get(`${API_URL}/api/user-bags?pagination[pageSize]=100&populate=*&sort=updatedAt:desc`, { headers, timeout: 8000 }),
      ]);

      // 1a. User Registrations
      if (usersSettled.status === 'fulfilled' && usersSettled.value.data?.data) {
        const users = usersSettled.value.data.data;
        const newUsers = users.filter((u: any) => {
          const d = u.attributes || u;
          return (d.createdAt || '').slice(0, 10) === targetDate;
        });
        newRegistrations = newUsers.length;
      } else if (usersSettled.status === 'rejected') {
        console.warn('Failed to fetch user-data:', usersSettled.reason?.message);
        isApiHealthy = false;
      }

      // 1b. Carts
      if (cartsSettled.status === 'fulfilled' && cartsSettled.value.data?.data) {
        const activeCarts = cartsSettled.value.data.data.filter((c: any) => {
          const d = c.attributes || c;
          const updated = (d.updatedAt || '').slice(0, 10);
          const created = (d.createdAt || '').slice(0, 10);
          return updated === targetDate || created === targetDate;
        });
        totalCarts = activeCarts.length;
      }

      // 1c. User Bags & Orders
      if (bagsSettled.status === 'fulfilled' && bagsSettled.value.data?.data) {
        const bags = bagsSettled.value.data.data;
        bags.forEach((b: any) => {
          const u = b.attributes || b;
          const payments = u.user_orders?.payments || u.payments || [];

          payments.forEach((p: any) => {
            const pDate = (p.timestamp || p.createdAt || '').slice(0, 10);
            let txnDate = '';
            if (p.merchantTxnId) {
              const match = String(p.merchantTxnId).match(/\b(\d{13})\b/);
              if (match) txnDate = new Date(parseInt(match[1], 10)).toISOString().slice(0, 10);
            }

            if (pDate === targetDate || txnDate === targetDate) {
              const status = (p.status || '').toLowerCase();
              const firstProduct = p.orderData?.products?.[0];

              if (status === 'success') {
                if (p.amount <= 50) {
                  hasTestPayment = true;
                } else {
                  purchases.push({
                    txnId: p.merchantTxnId,
                    amount: p.amount,
                    currency: p.currency || 'NPR',
                    title: firstProduct?.title || 'Purchased Item',
                    image: firstProduct?.imgSrc || '/placeholder.png',
                    size: firstProduct?.selectedSize || firstProduct?.size || 'Standard',
                    customerName: p.orderData?.receiver_details?.name || 'Customer',
                    country: p.orderData?.receiver_details?.address?.countryCode || 'NP',
                    timestamp: p.timestamp,
                  });
                }
              } else if (status === 'pending') {
                pendingCheckouts++;
              }
            }
          });
        });

        // Ensure totalCarts encompasses all checkout activity
        totalCarts = Math.max(totalCarts, purchases.length + pendingCheckouts + (hasTestPayment ? 1 : 0));
      } else if (bagsSettled.status === 'rejected') {
        console.warn('Failed to fetch user-bags:', bagsSettled.reason?.message);
        isApiHealthy = false;
      }

      return {
        newRegistrations,
        totalCarts,
        pendingCheckouts,
        purchases,
        hasTestPayment,
        isApiHealthy,
      };
    };

    // 2. Fetch GA4 data concurrently
    const ga4Promise = async () => {
      const ga = getGA4Client();
      const gaData = {
        connected: !!ga,
        activeUsers: 0,
        topCountries: [] as any[],
        topLandingPages: [] as any[],
        topProducts: [] as any[],
      };

      if (!ga) return gaData;

      try {
        const { client, propertyId } = ga;
        gaData.connected = true;

        const [usersSettled, countriesSettled, pagesSettled, productsSettled] = await Promise.allSettled([
          // 2a. Active Users
          client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: targetDate, endDate: targetDate }],
            metrics: [{ name: 'activeUsers' }],
          }),
          // 2b. Top Countries
          client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: targetDate, endDate: targetDate }],
            dimensions: [{ name: 'country' }, { name: 'countryId' }],
            metrics: [{ name: 'activeUsers' }],
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
            limit: 5,
          }),
          // 2c. Top Landing Pages
          client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: targetDate, endDate: targetDate }],
            dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 10,
          }),
          // 2d. Top Product Views
          client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: targetDate, endDate: targetDate }],
            dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensionFilter: {
              filter: {
                fieldName: 'pagePath',
                stringFilter: {
                  matchType: 'CONTAINS',
                  value: '/product-detail',
                },
              },
            },
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 5,
          }),
        ]);

        // Process Active Users
        if (usersSettled.status === 'fulfilled') {
          const report = usersSettled.value[0];
          gaData.activeUsers = parseInt(report?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
        } else {
          console.warn('GA4 Active Users query failed:', usersSettled.reason?.message);
        }

        // Process Countries
        if (countriesSettled.status === 'fulfilled') {
          const report = countriesSettled.value[0];
          if (report?.rows && report.rows.length > 0) {
            gaData.topCountries = report.rows.map((row: any) => ({
              country: row.dimensionValues?.[0]?.value || 'Unknown',
              code: row.dimensionValues?.[1]?.value || 'NP',
              users: parseInt(row.metricValues?.[0]?.value || '0', 10),
            }));
          }
        } else {
          console.warn('GA4 Countries query failed:', countriesSettled.reason?.message);
        }

        // Process Landing Pages
        if (pagesSettled.status === 'fulfilled') {
          const report = pagesSettled.value[0];
          if (report?.rows && report.rows.length > 0) {
            gaData.topLandingPages = report.rows.slice(0, 5).map((row: any) => {
              const p = row.dimensionValues?.[0]?.value || '/';
              const rawTitle = row.dimensionValues?.[1]?.value || '';
              return {
                path: p,
                title: formatPageTitle(p, rawTitle),
                views: parseInt(row.metricValues?.[0]?.value || '0', 10),
              };
            });
          }
        } else {
          console.warn('GA4 Pages query failed:', pagesSettled.reason?.message);
        }

        // Process Products
        if (productsSettled.status === 'fulfilled') {
          const report = productsSettled.value[0];
          if (report?.rows && report.rows.length > 0) {
            gaData.topProducts = report.rows.map((row: any) => {
              const rawTitle = row.dimensionValues?.[1]?.value || '';
              const cleanTitle = rawTitle.replace(/\s*\|.*$/, '').trim() || 'Product';
              return {
                title: cleanTitle,
                views: parseInt(row.metricValues?.[0]?.value || '0', 10),
              };
            });
          }
        } else {
          console.warn('GA4 Products query failed:', productsSettled.reason?.message);
        }
      } catch (err: any) {
        console.error('GA4 execution error:', err.message);
      }

      return gaData;
    };

    // 3. Execute Strapi & GA4 in parallel
    const [strapiData, gaData] = await Promise.all([
      strapiPromise(),
      ga4Promise(),
    ]);

    const result = {
      success: true,
      date: targetDate,
      metrics: {
        activeUsers: gaData.activeUsers,
        newRegistrations: strapiData.newRegistrations,
        totalCarts: strapiData.totalCarts,
        pendingCheckouts: strapiData.pendingCheckouts,
      },
      topCountries: gaData.topCountries,
      topLandingPages: gaData.topLandingPages,
      topProducts: gaData.topProducts,
      purchases: strapiData.purchases,
      websiteHealth: {
        apiHealthy: strapiData.isApiHealthy,
        testPaymentPassed: strapiData.hasTestPayment,
      },
      gaConnected: gaData.connected,
    };

    // Cache result in memory for 5 minutes
    reportCache.set(targetDate, {
      data: result,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Daily Report API Critical Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
