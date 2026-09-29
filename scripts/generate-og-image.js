const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createOgImage() {
  const width = 1200;
  const height = 630;

  // 1. Process logo.png: invert black to crisp ivory/gold (#f9f6ee)
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  const logoBuffer = await sharp(logoPath)
    .resize({ width: 700, fit: 'inside' })
    .toBuffer();

  // Create SVG overlay with text, borders, and traditional styling
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#140a0c" />
          <stop offset="50%" stop-color="#241014" />
          <stop offset="100%" stop-color="#0f0709" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#b38728" />
          <stop offset="50%" stop-color="#fbf5b7" />
          <stop offset="100%" stop-color="#aa771c" />
        </linearGradient>
        <linearGradient id="subtleGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.6" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.7"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)" />
      <rect width="${width}" height="${height}" fill="url(#subtleGlow)" />

      <!-- Ornate Outer Gold Border -->
      <rect x="30" y="30" width="1140" height="570" rx="16" fill="none" stroke="url(#goldGradient)" stroke-width="2" opacity="0.85" />
      <rect x="42" y="42" width="1116" height="546" rx="10" fill="none" stroke="url(#goldGradient)" stroke-width="1" stroke-dasharray="8 6" opacity="0.4" />

      <!-- Corner Ornaments -->
      <circle cx="30" cy="30" r="5" fill="#fbf5b7" />
      <circle cx="1170" cy="30" r="5" fill="#fbf5b7" />
      <circle cx="30" cy="600" r="5" fill="#fbf5b7" />
      <circle cx="1170" cy="600" r="5" fill="#fbf5b7" />

      <!-- Top Badge -->
      <g filter="url(#shadow)">
        <rect x="430" y="70" width="340" height="38" rx="19" fill="#1b0e11" stroke="url(#goldGradient)" stroke-width="1.5" />
        <text x="600" y="94" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="3" fill="#fbf5b7" text-anchor="middle">
          EST. LALITPUR • NEPAL
        </text>
      </g>

      <!-- Brand White Plaque for Logo -->
      <rect x="250" y="145" width="700" height="190" rx="18" fill="#ffffff" filter="url(#shadow)" opacity="0.97" />
      <rect x="254" y="149" width="692" height="182" rx="14" fill="none" stroke="url(#goldGradient)" stroke-width="1.5" opacity="0.6" />

      <!-- Taglines & Details -->
      <!-- Primary Tagline -->
      <text x="600" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5" fill="#ffffff" text-anchor="middle" filter="url(#shadow)">
        AUTHENTIC NEPALI FASHION
      </text>

      <!-- Subtitle -->
      <text x="600" y="435" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="400" letter-spacing="0.8" fill="#e8d5b5" text-anchor="middle">
        Traditional Attire • Cultural Elegance • Handcrafted Modern Wear
      </text>

      <!-- Divider -->
      <line x1="420" y1="470" x2="780" y2="470" stroke="url(#goldGradient)" stroke-width="1.5" opacity="0.7" />

      <!-- Pillars / Highlights -->
      <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="600" fill="#fbf5b7" text-anchor="middle">
        <text x="600" y="515">
          Daura Suruwal  •  Kurtha Sets  •  Bridal Lehengas  •  Handwoven Sarees
        </text>
      </g>

      <!-- Bottom Trust Row -->
      <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="500" fill="#a89a8c" text-anchor="middle">
        <text x="600" y="555">
          ✈ Worldwide Express Shipping  |  📍 Kumaripati, Lalitpur, Nepal  |  🌐 traditionalalley.com.np
        </text>
      </g>
    </svg>
  `);

  // Composite SVG and Logo together
  const ogImage = await sharp(svgOverlay)
    .composite([
      {
        input: logoBuffer,
        top: 175,
        left: 250,
      }
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  const outPathPublic = path.join(__dirname, '..', 'public', 'og-image.jpg');
  const outPathApp = path.join(__dirname, '..', 'app', 'opengraph-image.jpg');

  fs.writeFileSync(outPathPublic, ogImage);
  fs.writeFileSync(outPathApp, ogImage);

  console.log(`Successfully generated OG image: 1200x630 at ${outPathPublic} and ${outPathApp}`);
}

createOgImage().catch(console.error);
