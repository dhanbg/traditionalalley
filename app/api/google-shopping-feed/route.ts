import { NextResponse } from 'next/server';
import { INTERNAL_API_URL, STRAPI_API_TOKEN, API_URL } from '@/utils/urls';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache feed for 1 hour

/**
 * Escapes characters for XML compatibility
 */
function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Strips HTML tags and handles rich text blocks for clean descriptions
 */
function stripHtml(input: any): string {
  if (!input) return 'Authentic traditional Nepali clothing and modern fashion by Traditional Alley.';
  
  let text = '';
  if (typeof input === 'string') {
    text = input;
  } else if (Array.isArray(input)) {
    text = input.map((block: any) => {
      if (block?.children && Array.isArray(block.children)) {
        return block.children.map((c: any) => c?.text || '').join(' ');
      }
      return typeof block === 'string' ? block : '';
    }).join(' ');
  } else if (typeof input === 'object') {
    text = input.value || input.text || input.description || '';
  } else {
    try {
      text = String(input);
    } catch {
      text = '';
    }
  }

  const cleaned = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || 'Authentic traditional Nepali clothing and modern fashion by Traditional Alley.';
}

/**
 * Resolves full absolute HTTPS URL for product images
 */
function resolveFullImageUrl(imgObj: any): string {
  if (!imgObj) return 'https://www.traditionalalley.com.np/logo.png';
  
  if (typeof imgObj === 'string') {
    if (imgObj.startsWith('http')) return imgObj;
    if (imgObj.startsWith('/uploads/')) return `${API_URL}${imgObj}`;
    return `https://www.traditionalalley.com.np${imgObj.startsWith('/') ? '' : '/'}${imgObj}`;
  }

  const target = Array.isArray(imgObj) ? imgObj[0] : imgObj;
  if (!target) return 'https://www.traditionalalley.com.np/logo.png';
  
  const rawUrl = target.formats?.large?.url || target.formats?.medium?.url || target.url;
  if (!rawUrl) return 'https://www.traditionalalley.com.np/logo.png';

  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
}

export async function GET() {
  try {
    const token = STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;
    const strapiUrl = `${INTERNAL_API_URL}/api/products?pagination[pageSize]=250&populate=*&publicationState=live`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(strapiUrl, {
      headers,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Strapi returned ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const rawProducts = json.data || [];

    // Filter active products
    const activeProducts = rawProducts.filter((p: any) => p.isActive !== false);

    const itemsXml = activeProducts.map((p: any) => {
      const mainId = p.documentId || String(p.id);
      const title = p.title || 'Traditional Alley Product';
      const desc = stripHtml(p.description);
      const link = `https://www.traditionalalley.com.np/product-detail/${mainId}`;
      const imageUrl = resolveFullImageUrl(p.imgSrc);
      const price = parseFloat(p.price) || 0;
      const oldPrice = p.oldPrice ? parseFloat(p.oldPrice) : null;
      const inStock = p.inStock !== false && p.isActive !== false;
      const category = p.category?.title || p.category?.name || (typeof p.category === 'string' ? p.category : 'Women > Clothing');

      // Gallery additional images
      const additionalImages: string[] = [];
      if (Array.isArray(p.gallery)) {
        p.gallery.slice(0, 5).forEach((g: any) => {
          const gUrl = resolveFullImageUrl(g);
          if (gUrl && gUrl !== imageUrl && !additionalImages.includes(gUrl)) {
            additionalImages.push(gUrl);
          }
        });
      }

      // Sizes string
      let sizes = '';
      if (Array.isArray(p.sizes) && p.sizes.length > 0) {
        sizes = p.sizes.map((s: any) => typeof s === 'string' ? s : s?.name || '').filter(Boolean).join('/');
      } else if (p.size_stocks && typeof p.size_stocks === 'object') {
        sizes = Object.keys(p.size_stocks).join('/');
      }

      const colorVal = typeof p.color === 'string' ? p.color : p.color?.name || null;

      return `
    <item>
      <g:id>${escapeXml(mainId)}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${desc}]]></g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      ${additionalImages.map((img: string) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n      ')}
      <g:brand>Traditional Alley</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${inStock ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${price.toFixed(2)} USD</g:price>
      ${oldPrice && oldPrice > price ? `<g:sale_price>${price.toFixed(2)} USD</g:sale_price>` : ''}
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
      <g:product_type><![CDATA[${category}]]></g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:gender>female</g:gender>
      <g:age_group>adult</g:age_group>
      ${colorVal ? `<g:color><![CDATA[${colorVal}]]></g:color>` : ''}
      ${sizes ? `<g:size><![CDATA[${sizes}]]></g:size>` : ''}
    </item>`;
    }).join('');

    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Traditional Alley - Google Shopping Feed</title>
    <link>https://www.traditionalalley.com.np</link>
    <description>Authentic Nepali Fashion, Dhaka Corsets, Kurthas and Traditional Clothing</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xmlFeed, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error: any) {
    console.error('❌ [GOOGLE-SHOPPING-FEED] Error generating feed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
