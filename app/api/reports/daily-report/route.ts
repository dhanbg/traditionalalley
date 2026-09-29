import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';

// Helper to get Google Analytics Client if credentials exist
function getGA4Client() {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID || '507607521';

    // 1. Check for JSON file in root
    const jsonPath = path.join(process.cwd(), 'ga-service-account.json');
    if (fs.existsSync(jsonPath)) {
      const client = new BetaAnalyticsDataClient({
        keyFilename: jsonPath,
      });
      return { client, propertyId };
    }

    // 2. Check for environment variable with JSON string or credentials
    if (process.env.GA_SERVICE_ACCOUNT_KEY) {
      const credentials = JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);
      const client = new BetaAnalyticsDataClient({ credentials });
      return { client, propertyId };
    }

    if (process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY) {
      const client = new BetaAnalyticsDataClient({
        credentials: {
          client_email: process.env.GA_CLIENT_EMAIL,
          private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
      });
      return { client, propertyId };
    }

    return null;
  } catch (error) {
    console.error('Error initializing GA4 client:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 0. Authorization check: Only gurungvaaiii@gmail.com can access Daily Report data
    const session = await auth();
    const userEmail = (session?.user?.email || '').trim().toLowerCase();
    const userRole = (session?.user as any)?.role;

    if (session) {
      if (userRole !== 'admin' || userEmail !== 'gurungvaaiii@gmail.com') {
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

    // Default target date is yesterday in YYYY-MM-DD format
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const targetDate = searchParams.get('date') || yesterday.toISOString().slice(0, 10);

    const API_URL = process.env.STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'https://admin.traditionalalley.com.np';
    const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

    const headers = {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      'Content-Type': 'application/json',
    };

    // 1. FETCH DATABASE METRICS FROM STRAPI
    let newRegistrations = 0;
    let totalCarts = 0;
    let pendingCheckouts = 0;
    const purchases: any[] = [];
    let hasTestPayment = false;
    let isApiHealthy = true;

    try {
      // 1a. User Registrations on targetDate
      const usersRes = await axios.get(`${API_URL}/api/user-data?pagination[pageSize]=100&sort=createdAt:desc`, { headers });
      const users = usersRes.data?.data || [];
      const newUsers = users.filter((u: any) => {
        const d = u.attributes || u;
        return (d.createdAt || '').slice(0, 10) === targetDate;
      });
      newRegistrations = newUsers.length;
    } catch (e: any) {
      console.warn('Failed to fetch user-data:', e.message);
      isApiHealthy = false;
    }

    try {
      // 1b. Carts on targetDate
      const cartsRes = await axios.get(`${API_URL}/api/carts?pagination[pageSize]=100`, { headers }).catch(() => null);
      if (cartsRes?.data?.data) {
        const activeCarts = cartsRes.data.data.filter((c: any) => {
          const d = c.attributes || c;
          const updated = (d.updatedAt || '').slice(0, 10);
          const created = (d.createdAt || '').slice(0, 10);
          return updated === targetDate || created === targetDate;
        });
        totalCarts = activeCarts.length;
      }
    } catch (e: any) {
      console.warn('Failed to fetch carts:', e.message);
    }

    try {
      // 1c. User Bags & Orders (Payments)
      const bagsRes = await axios.get(`${API_URL}/api/user-bags?pagination[pageSize]=100&populate=*&sort=updatedAt:desc`, { headers });
      const bags = bagsRes.data?.data || [];

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

      // Carts count encompasses all active checkout bags plus carts
      totalCarts = Math.max(totalCarts, purchases.length + pendingCheckouts + (hasTestPayment ? 1 : 0));
    } catch (e: any) {
      console.warn('Failed to fetch user-bags:', e.message);
      isApiHealthy = false;
    }

    // 2. FETCH REAL GOOGLE ANALYTICS 4 DATA
    const ga = getGA4Client();
    const gaData = {
      connected: !!ga,
      activeUsers: 0,
      topCountries: [] as any[],
      topLandingPages: [] as any[],
      topProducts: [] as any[],
    };

    if (ga) {
      try {
        const { client, propertyId } = ga;
        gaData.connected = true;

        // Query Active Users
        const [usersReport] = await client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: targetDate, endDate: targetDate }],
          metrics: [{ name: 'activeUsers' }],
        });
        gaData.activeUsers = parseInt(usersReport?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);

        // Query Top Countries
        const [countryReport] = await client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: targetDate, endDate: targetDate }],
          dimensions: [{ name: 'country' }, { name: 'countryId' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 5,
        });

        if (countryReport?.rows && countryReport.rows.length > 0) {
          gaData.topCountries = countryReport.rows.map((row: any) => ({
            country: row.dimensionValues?.[0]?.value || 'Unknown',
            code: row.dimensionValues?.[1]?.value || 'NP',
            users: parseInt(row.metricValues?.[0]?.value || '0', 10),
          }));
        }

        // Query Top Pages by Views
        const [pagesReport] = await client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: targetDate, endDate: targetDate }],
          dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10,
        });

        function formatPageTitle(p: string, raw: string): string {
          if (p === '/') return 'Home Page';
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
          let clean = raw.split(/\||–/)[0].trim();
          if (clean.toLowerCase().includes('traditional alley')) {
            clean = clean.replace(/traditional alley/gi, '').trim();
          }
          return clean || 'Page';
        }

        if (pagesReport?.rows && pagesReport.rows.length > 0) {
          gaData.topLandingPages = pagesReport.rows.slice(0, 5).map((row: any) => {
            const p = row.dimensionValues?.[0]?.value || '/';
            const rawTitle = row.dimensionValues?.[1]?.value || '';
            return {
              path: p,
              title: formatPageTitle(p, rawTitle),
              views: parseInt(row.metricValues?.[0]?.value || '0', 10),
            };
          });
        }

        // Query Top Products using dimensionFilter on /product-detail
        const [productPagesReport] = await client.runReport({
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
        });

        if (productPagesReport?.rows && productPagesReport.rows.length > 0) {
          gaData.topProducts = productPagesReport.rows.map((row: any) => {
            const rawTitle = row.dimensionValues?.[1]?.value || '';
            const cleanTitle = rawTitle.replace(/\s*\|.*$/, '').trim() || 'Product';
            return {
              title: cleanTitle,
              views: parseInt(row.metricValues?.[0]?.value || '0', 10),
            };
          });
        }
      } catch (err: any) {
        console.error('GA4 API execution error:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      date: targetDate,
      metrics: {
        activeUsers: gaData.activeUsers,
        newRegistrations,
        totalCarts,
        pendingCheckouts,
      },
      topCountries: gaData.topCountries,
      topLandingPages: gaData.topLandingPages,
      topProducts: gaData.topProducts,
      purchases,
      websiteHealth: {
        apiHealthy: isApiHealthy,
        testPaymentPassed: hasTestPayment,
      },
      gaConnected: gaData.connected,
    });
  } catch (error: any) {
    console.error('Error generating daily report:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
