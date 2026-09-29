import { NextResponse } from 'next/server';
import { INTERNAL_API_URL, STRAPI_API_TOKEN, API_URL } from '@/utils/urls';
import { getBestImageUrl } from '@/utils/imageUtils';

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
 * Strips HTML tags and trims whitespace for clean descriptions
 */
function stripHtml(input: any): string {
  if (!input) return 'Authentic traditional Nepali clothing and modern fashion by Traditional Alley.';
  
  let text = '';
  if (typeof input === 'string') {
    text = input;
  } else if (Array.isArray(input)) {
    // Strapi 5 rich text blocks
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
 * Resolves a full absolute HTTPS URL for product images
 */
function resolveFullImageUrl(imgObj: any): string {
  if (!imgObj) return 'https://www.traditionalalley.com.np/logo.png';
  
  // If string
  if (typeof imgObj === 'string') {
    if (imgObj.startsWith('http')) return imgObj;
    if (imgObj.startsWith('/uploads/')) return `${API_URL}${imgObj}`;
    return `https://www.traditionalalley.com.np${imgObj.startsWith('/') ? '' : '/'}${imgObj}`;
  }

  // Handle Strapi format objects
  const target = Array.isArray(imgObj) ? imgObj[0] : imgObj;
  if (!target) return 'https://www.traditionalalley.com.np/logo.png';
  
  const rawUrl = target.formats?.large?.url || target.formats?.medium?.url || target.url;
  if (!rawUrl) return 'https://www.traditionalalley.com.np/logo.png';

  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xml'; // 'xml' (default) or 'csv'

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

    // Build items list (products + variants)
    const feedItems: any[] = [];

    for (const p of activeProducts) {
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

      // 1. Add main product
      feedItems.push({
        id: mainId,
        itemGroupId: null,
        title,
        description: desc,
        link,
        imageLink: imageUrl,
        additionalImages,
        availability: inStock ? 'in stock' : 'out of stock',
        price: `${price.toFixed(2)} USD`,
        salePrice: oldPrice && oldPrice > price ? `${price.toFixed(2)} USD` : null,
        brand: 'Traditional Alley',
        condition: 'new',
        googleCategory: 'Apparel & Accessories > Clothing',
        productType: category,
        color: typeof p.color === 'string' ? p.color : p.color?.name || null
      });

      // 2. Add product variants if present
      if (Array.isArray(p.product_variants) && p.product_variants.length > 0) {
        for (const v of p.product_variants) {
          if (v.isActive === false) continue;
          const variantId = v.documentId || String(v.id);
          const variantTitle = v.title || `${title} - ${v.color?.name || v.color || 'Variant'}`;
          const variantImage = resolveFullImageUrl(v.imgSrc || p.imgSrc);
          const variantPrice = parseFloat(v.price) || price;
          const variantOldPrice = v.oldPrice ? parseFloat(v.oldPrice) : oldPrice;
          const variantColor = typeof v.color === 'string' ? v.color : v.color?.name || null;

          feedItems.push({
            id: variantId,
            itemGroupId: mainId,
            title: variantTitle,
            description: desc,
            link: `${link}?variant=${variantId}`,
            imageLink: variantImage,
            additionalImages,
            availability: inStock ? 'in stock' : 'out of stock',
            price: `${variantPrice.toFixed(2)} USD`,
            salePrice: variantOldPrice && variantOldPrice > variantPrice ? `${variantPrice.toFixed(2)} USD` : null,
            brand: 'Traditional Alley',
            condition: 'new',
            googleCategory: 'Apparel & Accessories > Clothing',
            productType: category,
            color: variantColor
          });
        }
      }
    }

    // Return CSV format if requested
    if (format === 'csv') {
      const csvHeaders = [
        'id',
        'title',
        'description',
        'availability',
        'condition',
        'price',
        'link',
        'image_link',
        'brand',
        'google_product_category',
        'item_group_id',
        'color'
      ];

      const csvRows = feedItems.map(item => [
        `"${item.id}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        `"${item.availability}"`,
        `"${item.condition}"`,
        `"${item.price}"`,
        `"${item.link}"`,
        `"${item.imageLink}"`,
        `"${item.brand}"`,
        `"${item.googleCategory}"`,
        item.itemGroupId ? `"${item.itemGroupId}"` : '""',
        item.color ? `"${item.color.replace(/"/g, '""')}"` : '""'
      ].join(','));

      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="facebook-catalog-feed.csv"',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      });
    }

    // Default: Return standard RSS 2.0 XML Feed for Meta Catalog
    const xmlItems = feedItems.map(item => `
    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title><![CDATA[${item.title}]]></g:title>
      <g:description><![CDATA[${item.description}]]></g:description>
      <g:link>${escapeXml(item.link)}</g:link>
      <g:image_link>${escapeXml(item.imageLink)}</g:image_link>
      ${item.additionalImages.map((img: string) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n      ')}
      <g:brand>${escapeXml(item.brand)}</g:brand>
      <g:condition>${item.condition}</g:condition>
      <g:availability>${item.availability}</g:availability>
      <g:price>${item.price}</g:price>
      ${item.salePrice ? `<g:sale_price>${item.salePrice}</g:sale_price>` : ''}
      <g:google_product_category>${escapeXml(item.googleCategory)}</g:google_product_category>
      <g:product_type><![CDATA[${item.productType}]]></g:product_type>
      ${item.itemGroupId ? `<g:item_group_id>${escapeXml(item.itemGroupId)}</g:item_group_id>` : ''}
      ${item.color ? `<g:color><![CDATA[${item.color}]]></g:color>` : ''}
    </item>`).join('');

    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Traditional Alley Products</title>
    <link>https://www.traditionalalley.com.np</link>
    <description>Authentic Nepali Fashion &amp; Traditional Clothing Catalog</description>
${xmlItems}
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
    console.error('❌ [FACEBOOK-FEED] Error generating product feed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
