#!/usr/bin/env node

/**
 * Standalone Weekly Stock Report Runner
 * 
 * Can be run manually or set up on VPS Linux crontab:
 * 15 3 * * 1 cd /root/traditionalalley && node scripts/send-weekly-stock-report.js >> /root/traditionalalley/logs/weekly-stock-cron.log 2>&1
 */

const path = require('path');
const fs = require('fs');

// Load environment variables
const envPaths = [
  path.join(__dirname, '../.env.production'),
  path.join(__dirname, '../.env')
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] || '';
        value = value.trim().replace(/^['"](.*)['"]$/, '$1');
        if (!process.env[match[1]]) {
          process.env[match[1]] = value;
        }
      }
    });
  }
}

const nodemailer = require('nodemailer');

const STRAPI_BASE = process.env.STRAPI_INTERNAL_URL || process.env.STRAPI_URL || 'https://admin.traditionalalley.com.np';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || '';
const ALERT_EMAIL = process.env.STOCK_ALERT_EMAIL || process.env.SUPPORT_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'support@traditionalalley.com.np';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.spacemail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.SMTP_USER || 'support@traditionalalley.com.np',
    pass: process.env.SMTP_PASS || 'Password@support99'
  }
});

async function run() {
  console.log(`[${new Date().toISOString()}] Starting Weekly Stock Report execution...`);
  
  let page = 1;
  const pageSize = 100;
  const allProducts = [];

  while (true) {
    const url = `${STRAPI_BASE}/api/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`;
    const res = await fetch(url, {
      headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}
    });

    if (!res.ok) {
      console.error(`Failed to fetch page ${page}: HTTP ${res.status}`);
      break;
    }

    const json = await res.json();
    const items = json.data || [];
    allProducts.push(...items);

    const pagination = json.meta?.pagination;
    if (!pagination || page >= pagination.pageCount) break;
    page++;
  }

  console.log(`Total products scanned: ${allProducts.length}`);

  const outOfStockProducts = [];
  const lowStockProducts = [];
  const allZeroProducts = [];

  for (const prod of allProducts) {
    const p = prod.attributes ? { ...prod.attributes, id: prod.id, documentId: prod.documentId } : prod;
    let sizeStocks = p.size_stocks;
    if (typeof sizeStocks === 'string') {
      try { sizeStocks = JSON.parse(sizeStocks); } catch (e) {}
    }

    if (sizeStocks && typeof sizeStocks === 'object') {
      const zeroSizes = [];
      const lowSizes = [];
      const positiveSizes = [];

      for (const [size, qty] of Object.entries(sizeStocks)) {
        const n = parseInt(qty, 10);
        if (isNaN(n) || n <= 0) {
          zeroSizes.push(`${size} (0)`);
        } else if (n <= 2) {
          lowSizes.push(`${size} (${n} left)`);
          positiveSizes.push(`${size} (${n})`);
        } else {
          positiveSizes.push(`${size} (${n})`);
        }
      }

      if (positiveSizes.length === 0 && zeroSizes.length > 0) {
        allZeroProducts.push({ id: p.id, title: p.title });
      } else {
        if (zeroSizes.length > 0) outOfStockProducts.push({ id: p.id, title: p.title, zeroSizes, positiveSizes });
        if (lowSizes.length > 0) lowStockProducts.push({ id: p.id, title: p.title, lowSizes, positiveSizes });
      }
    } else if (typeof p.stock === 'number') {
      if (p.stock <= 0) allZeroProducts.push({ id: p.id, title: p.title });
      else if (p.stock <= 2) lowStockProducts.push({ id: p.id, title: p.title, lowSizes: [`Total (${p.stock} left)`], positiveSizes: [`${p.stock}`] });
    }
  }

  const totalCritical = allZeroProducts.length + outOfStockProducts.length + lowStockProducts.length;
  const isForce = process.argv.includes('--force');

  if (totalCritical === 0 && !isForce) {
    console.log(`✅ [${new Date().toISOString()}] All inventory healthy (0 out of stock, 0 low stock). Silent mode: no email needed.`);
    return;
  }

  const reportDate = new Date().toLocaleDateString('en-US', {
    timeZone: 'Asia/Kathmandu',
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const subject = `📅 [Weekly Stock Report] ${allZeroProducts.length > 0 || outOfStockProducts.length > 0 ? '⚠️ Out-of-Stock Items Detected' : '✅ Inventory Health Overview'} - ${reportDate}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #8B4513 0%, #5c2d0c 100%); color: #ffffff; padding: 28px 32px; }
        .header h1 { margin: 8px 0 0 0; font-size: 22px; color: #ffffff; }
        .tag { display: inline-block; background: rgba(255,255,255,0.25); padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #ffffff; }
        .body { padding: 32px; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
        .stat-num { font-size: 22px; font-weight: 700; margin-top: 4px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px; }
        .card-danger { background: #fef2f2; border: 1px solid #fecaca; }
        .card-warning { background: #fffbeb; border: 1px solid #fef3c7; }
        .card-success { background: #f0fdf4; border: 1px solid #bbf7d0; }
        h3 { margin-top: 0; font-size: 15px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 8px; }
        th, td { padding: 9px 12px; border: 1px solid #e2e8f0; text-align: left; }
        th { background: #f1f5f9; color: #475569; font-weight: 600; }
        .badge-danger { background: #dc2626; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; display: inline-block; }
        .badge-warning { background: #f59e0b; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; display: inline-block; }
        .btn { display: inline-block; background-color: #8B4513; color: #ffffff !important; padding: 12px 24px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 6px; margin-top: 10px; }
        .footer { padding: 18px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; background: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="tag">Weekly Automated Digest</span>
          <h1>📦 Weekly Stock & Inventory Report</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Traditional Alley Catalog Health Check • ${reportDate}</p>
        </div>

        <div class="body">
          <div class="stat-grid">
            <div class="stat-box">
              <div style="font-size: 12px; color: #64748b;">Active Products</div>
              <div class="stat-num" style="color: #0f172a;">${allProducts.length}</div>
            </div>
            <div class="stat-box">
              <div style="font-size: 12px; color: #64748b;">Out of Stock</div>
              <div class="stat-num" style="color: ${allZeroProducts.length + outOfStockProducts.length > 0 ? '#dc2626' : '#16a34a'};">
                ${allZeroProducts.length + outOfStockProducts.length}
              </div>
            </div>
            <div class="stat-box">
              <div style="font-size: 12px; color: #64748b;">Low Stock (≤ 2)</div>
              <div class="stat-num" style="color: ${lowStockProducts.length > 0 ? '#d97706' : '#16a34a'};">
                ${lowStockProducts.length}
              </div>
            </div>
          </div>

          ${allZeroProducts.length === 0 && outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? `
            <div class="card card-success">
              <h3 style="color: #166534;">🎉 Great News! All Products Fully Stocked</h3>
              <p style="margin: 0; font-size: 14px; color: #15803d;">
                Every active product in your store currently has sufficient inventory across all sizes.
              </p>
            </div>
          ` : ''}

          ${allZeroProducts.length > 0 ? `
            <div class="card card-danger">
              <h3 style="color: #991b1b;">❌ Completely Out of Stock (${allZeroProducts.length})</h3>
              <table>
                <thead><tr><th>Product</th><th>Status</th></tr></thead>
                <tbody>
                  ${allZeroProducts.map(p => `<tr><td><strong>${p.title}</strong></td><td><span class="badge-danger">All Sizes Sold Out</span></td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${outOfStockProducts.length > 0 ? `
            <div class="card card-danger">
              <h3 style="color: #991b1b;">⚠️ Products with Out-of-Stock Sizes (${outOfStockProducts.length})</h3>
              <table>
                <thead><tr><th>Product</th><th>Out of Stock Sizes</th><th>Remaining Sizes</th></tr></thead>
                <tbody>
                  ${outOfStockProducts.map(p => `<tr><td><strong>${p.title}</strong></td><td><span class="badge-danger">${p.zeroSizes.join(', ')}</span></td><td style="font-size: 13px; color: #475569;">${p.positiveSizes.join(', ')}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${lowStockProducts.length > 0 ? `
            <div class="card card-warning">
              <h3 style="color: #92400e;">📉 Low Stock Warnings (${lowStockProducts.length})</h3>
              <table>
                <thead><tr><th>Product</th><th>Low Sizes</th><th>Other Sizes</th></tr></thead>
                <tbody>
                  ${lowStockProducts.map(p => `<tr><td><strong>${p.title}</strong></td><td><span class="badge-warning">${p.lowSizes.join(', ')}</span></td><td style="font-size: 13px; color: #475569;">${p.positiveSizes.join(', ')}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://admin.traditionalalley.com.np/admin" class="btn">
              📦 Open Strapi Admin to Manage Stock
            </a>
          </div>
        </div>

        <div class="footer">
          Weekly Automated Stock Digest • Traditional Alley E-Commerce<br>
          Delivered to: ${ALERT_EMAIL} • Every Monday at 9:00 AM NPT
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Traditional Alley Stock Report" <support@traditionalalley.com.np>',
    to: ALERT_EMAIL,
    subject,
    html
  });

  console.log(`✅ Weekly stock report sent successfully! Message ID: ${info.messageId}`);
}

run().catch(err => {
  console.error('❌ Failed to run weekly stock report script:', err);
  process.exit(1);
});
