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

const COMMON_COLORS = [
  'black', 'white', 'gray', 'grey', 'red', 'blue', 'green', 'yellow', 
  'pink', 'purple', 'brown', 'bronze', 'gold', 'lavender', 'peach', 
  'orange', 'emerald green', 'emerald', 'sage green', 'sage', 'magenta', 
  'navy blue', 'navy', 'cream', 'beige', 'silver', 'rose', 'maroon', 
  'teal', 'mustard', 'olive', 'coral', 'turquoise', 'cyan', 'amber'
];

function toTitleCase(str: string): string {
  return str.replace(/\b\w+/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

/**
 * Intelligently extracts color name from text and color object
 */
function extractColor(text: string | null | undefined, colorObj: any): string | null {
  if (colorObj) {
    if (typeof colorObj === 'string') return toTitleCase(colorObj);
    const rawName = (colorObj.name || '').replace(/\.[^.]+$/, '').toLowerCase();
    for (const c of COMMON_COLORS) {
      if (rawName.includes(c)) return toTitleCase(c);
    }
  }

  if (!text) return null;

  // 1. Parentheses e.g. "BELLE (EMERALD GREEN)" -> "Emerald Green"
  const parenMatch = text.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const candidate = parenMatch[1].trim();
    if (!candidate.toLowerCase().includes('printed') && !candidate.toLowerCase().includes('look')) {
      return toTitleCase(candidate);
    }
  }

  // 2. Colon e.g. "LAYLA: BLACK" -> "Black"
  const colonMatch = text.match(/:\s*([^:]+)$/);
  if (colonMatch && colonMatch[1]) {
    const candidate = colonMatch[1].trim();
    if (!candidate.toLowerCase().includes('edition') && !candidate.toLowerCase().includes('classic')) {
      return toTitleCase(candidate);
    }
  }

  // 3. Keyword in text
  const lower = text.toLowerCase();
  for (const c of COMMON_COLORS) {
    const regex = new RegExp(`\\b${c}\\b`, 'i');
    if (regex.test(lower)) {
      return toTitleCase(c);
    }
  }

  return null;
}

/**
 * Extracts comma/slash-separated available sizes
 */
function extractSizes(item: any): string {
  if (item?.size_stocks && typeof item.size_stocks === 'object') {
    const available = Object.entries(item.size_stocks)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([size]) => size);
    if (available.length > 0) return available.join('/');
    return Object.keys(item.size_stocks).join('/');
  }

  if (Array.isArray(item?.sizes) && item.sizes.length > 0) {
    return item.sizes
      .map((s: any) => typeof s === 'string' ? s : s?.name || '')
      .filter(Boolean)
      .join('/');
  }

  return '';
}

/**
 * Determines stock availability
 */
function isItemInStock(item: any): boolean {
  if (item?.isActive === false) return false;
  if (item?.inStock === false) return false;
  
  if (item?.size_stocks && typeof item.size_stocks === 'object') {
    const stockValues = Object.values(item.size_stocks) as unknown[];
    const totalQty = stockValues.reduce<number>((sum, q) => sum + (Number(q) || 0), 0);
    return totalQty > 0;
  }

  return true;
}

export async function GET() {
  try {
    const token = STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || process.env.STRAPI_TOKEN;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Parallel fetch of live products and active variants
    const [productsRes, variantsRes] = await Promise.all([
      fetch(`${INTERNAL_API_URL}/api/products?pagination[pageSize]=250&populate=*&publicationState=live`, {
        headers,
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10000)
      }),
      fetch(`${INTERNAL_API_URL}/api/product-variants?pagination[pageSize]=250&populate=*&publicationState=live`, {
        headers,
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10000)
      }).catch(err => {
        console.warn('⚠️ [GOOGLE-SHOPPING-FEED] Could not fetch variants, defaulting to parent products:', err.message);
        return null;
      })
    ]);

    if (!productsRes.ok) {
      throw new Error(`Strapi returned ${productsRes.status} ${productsRes.statusText}`);
    }

    const productsJson = await productsRes.json();
    const rawProducts = productsJson.data || [];
    const activeProducts = rawProducts.filter((p: any) => p.isActive !== false);

    // Group variants by parent product documentId
    const variantsByParent: Record<string, any[]> = {};
    if (variantsRes && variantsRes.ok) {
      const variantsJson = await variantsRes.json();
      const rawVariants = variantsJson.data || [];
      for (const v of rawVariants) {
        if (v.isActive === false) continue;
        const parentId = v.product?.documentId;
        if (parentId) {
          if (!variantsByParent[parentId]) variantsByParent[parentId] = [];
          variantsByParent[parentId].push(v);
        }
      }
    }

    const itemsXml: string[] = [];

    for (const p of activeProducts) {
      const parentId = p.documentId || String(p.id);
      const parentTitle = p.title || 'Traditional Alley Product';
      const desc = stripHtml(p.description);
      const baseLink = `https://www.traditionalalley.com.np/product-detail/${parentId}`;
      const parentImageUrl = resolveFullImageUrl(p.imgSrc);
      const parentPrice = parseFloat(p.price) || 0;
      const parentOldPrice = p.oldPrice ? parseFloat(p.oldPrice) : null;
      const category = p.category?.title || p.category?.name || (typeof p.category === 'string' ? p.category : 'Women > Clothing');

      // Gallery additional images
      const parentAdditionalImages: string[] = [];
      if (Array.isArray(p.gallery)) {
        p.gallery.slice(0, 5).forEach((g: any) => {
          const gUrl = resolveFullImageUrl(g);
          if (gUrl && gUrl !== parentImageUrl && !parentAdditionalImages.includes(gUrl)) {
            parentAdditionalImages.push(gUrl);
          }
        });
      }

      const pVariants = variantsByParent[parentId] || [];
      const hasVariants = pVariants.length > 0;

      // 1. Output the main product
      const mainColor = extractColor(parentTitle, p.color);
      const mainSizes = extractSizes(p);
      const mainInStock = isItemInStock(p);

      itemsXml.push(`
    <item>
      <g:id>${escapeXml(parentId)}</g:id>
      ${hasVariants ? `<g:item_group_id>${escapeXml(parentId)}</g:item_group_id>` : ''}
      <g:title><![CDATA[${parentTitle}]]></g:title>
      <g:description><![CDATA[${desc}]]></g:description>
      <g:link>${escapeXml(baseLink)}</g:link>
      <g:image_link>${escapeXml(parentImageUrl)}</g:image_link>
      ${parentAdditionalImages.map((img: string) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n      ')}
      <g:brand>Traditional Alley</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${mainInStock ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${parentPrice.toFixed(2)} USD</g:price>
      ${parentOldPrice && parentOldPrice > parentPrice ? `<g:sale_price>${parentPrice.toFixed(2)} USD</g:sale_price>` : ''}
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
      <g:product_type><![CDATA[${category}]]></g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:gender>female</g:gender>
      <g:age_group>adult</g:age_group>
      ${mainColor ? `<g:color><![CDATA[${mainColor}]]></g:color>` : ''}
      ${mainSizes ? `<g:size><![CDATA[${mainSizes}]]></g:size>` : ''}
    </item>`);

      // 2. Output each child variant
      for (const v of pVariants) {
        const variantId = v.documentId || String(v.id);
        const variantColor = extractColor(v.title, v.color) || mainColor;
        
        let variantTitle = v.title;
        if (!variantTitle || variantTitle.trim() === '' || variantTitle === parentTitle) {
          variantTitle = variantColor ? `${parentTitle} - ${variantColor}` : `${parentTitle} - Variant`;
        }

        const variantLink = `${baseLink}?variant=${variantId}`;
        const variantImageUrl = resolveFullImageUrl(v.imgSrc) || parentImageUrl;
        const variantPrice = parseFloat(v.price) || parentPrice;
        const variantOldPrice = v.oldPrice ? parseFloat(v.oldPrice) : parentOldPrice;
        const variantInStock = isItemInStock(v);
        const variantSizes = extractSizes(v) || mainSizes;

        // Variant gallery
        const variantAdditionalImages: string[] = [];
        if (Array.isArray(v.gallery) && v.gallery.length > 0) {
          v.gallery.slice(0, 5).forEach((g: any) => {
            const gUrl = resolveFullImageUrl(g);
            if (gUrl && gUrl !== variantImageUrl && !variantAdditionalImages.includes(gUrl)) {
              variantAdditionalImages.push(gUrl);
            }
          });
        } else {
          variantAdditionalImages.push(...parentAdditionalImages);
        }

        itemsXml.push(`
    <item>
      <g:id>${escapeXml(variantId)}</g:id>
      <g:item_group_id>${escapeXml(parentId)}</g:item_group_id>
      <g:title><![CDATA[${variantTitle}]]></g:title>
      <g:description><![CDATA[${desc}]]></g:description>
      <g:link>${escapeXml(variantLink)}</g:link>
      <g:image_link>${escapeXml(variantImageUrl)}</g:image_link>
      ${variantAdditionalImages.map((img: string) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n      ')}
      <g:brand>Traditional Alley</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${variantInStock ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${variantPrice.toFixed(2)} USD</g:price>
      ${variantOldPrice && variantOldPrice > variantPrice ? `<g:sale_price>${variantPrice.toFixed(2)} USD</g:sale_price>` : ''}
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
      <g:product_type><![CDATA[${category}]]></g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:gender>female</g:gender>
      <g:age_group>adult</g:age_group>
      ${variantColor ? `<g:color><![CDATA[${variantColor}]]></g:color>` : ''}
      ${variantSizes ? `<g:size><![CDATA[${variantSizes}]]></g:size>` : ''}
    </item>`);
      }
    }

    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Traditional Alley - Google Shopping Feed</title>
    <link>https://www.traditionalalley.com.np</link>
    <description>Authentic Nepali Fashion, Dhaka Corsets, Kurthas and Traditional Clothing</description>
${itemsXml.join('')}
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
