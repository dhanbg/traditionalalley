import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache feed for 1 hour

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractDescription(desc, title) {
  if (!desc) return `Authentic Nepali ${title || 'clothing'} handcrafted by Traditional Alley.`;
  if (typeof desc === 'string') {
    const stripped = desc.replace(/<[^>]*>/g, '').trim();
    return stripped.slice(0, 5000) || `Authentic Nepali ${title} from Traditional Alley.`;
  }
  if (Array.isArray(desc)) {
    const text = desc
      .map(node => {
        if (typeof node === 'string') return node;
        if (node?.children && Array.isArray(node.children)) {
          return node.children.map(c => c?.text || '').join('');
        }
        return '';
      })
      .filter(Boolean)
      .join(' ')
      .trim();
    return text.slice(0, 5000) || `Authentic Nepali ${title} from Traditional Alley.`;
  }
  return `Authentic Nepali ${title} from Traditional Alley.`;
}

function resolveImageUrl(img) {
  if (!img) return null;
  const raw = img.formats?.large?.url || img.formats?.medium?.url || img.url;
  if (!raw) return null;
  return raw.startsWith('http') ? raw : `${API_URL}${raw}`;
}

export async function GET() {
  try {
    const response = await fetchDataFromApi('/api/products?pagination[pageSize]=100&populate=*');
    const products = response?.data || [];

    const activeProducts = products.filter(p => p && p.isActive !== false && p.documentId);

    const itemsXml = activeProducts.map((p) => {
      const id = p.documentId;
      const title = p.title || 'Nepali Ethnic Garment';
      const description = extractDescription(p.description, title);
      const link = `https://traditionalalley.com.np/product-detail/${id}`;
      const imageLink = resolveImageUrl(p.imgSrc) || 'https://traditionalalley.com.np/logo.png';
      
      const additionalImages = Array.isArray(p.gallery)
        ? p.gallery.map(resolveImageUrl).filter(Boolean).filter(u => u !== imageLink)
        : [];

      // Availability check
      let inStock = true;
      if (p.size_stocks && typeof p.size_stocks === 'object') {
        const totalStock = Object.values(p.size_stocks).reduce((sum, val) => sum + (Number(val) || 0), 0);
        if (totalStock === 0) inStock = false;
      }
      const availability = inStock ? 'in_stock' : 'out_of_stock';

      // Price handling
      const currentPrice = Number(p.price) || 0;
      const originalPrice = Number(p.oldPrice) || 0;
      const isOnSale = originalPrice > currentPrice;

      const priceXml = isOnSale
        ? `      <g:price>${originalPrice.toFixed(2)} USD</g:price>
      <g:sale_price>${currentPrice.toFixed(2)} USD</g:sale_price>`
        : `      <g:price>${currentPrice.toFixed(2)} USD</g:price>`;

      // Collection & Product Type
      const collectionName = p.collection?.name || p.collection?.title || 'Traditional Wear';
      const productType = `Apparel &amp; Accessories &gt; Traditional &amp; Cultural Clothing &gt; ${cleanText(collectionName)}`;

      // MPN
      const mpn = p.product_code || p.sku || id;

      const additionalImagesXml = additionalImages.slice(0, 10).map(imgUrl => (
        `      <g:additional_image_link>${cleanText(imgUrl)}</g:additional_image_link>`
      )).join('\n');

      return `    <item>
      <g:id>${cleanText(id)}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${cleanText(link)}</g:link>
      <g:image_link>${cleanText(imageLink)}</g:image_link>
${additionalImagesXml ? additionalImagesXml + '\n' : ''}      <g:availability>${availability}</g:availability>
${priceXml}
      <g:brand>Traditional Alley</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>1604</g:google_product_category>
      <g:product_type>${productType}</g:product_type>
      <g:mpn>${cleanText(mpn)}</g:mpn>
      <g:identifier_exists>yes</g:identifier_exists>
      <g:shipping>
        <g:country>NP</g:country>
        <g:service>Standard Delivery</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard International</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>AU</g:country>
        <g:service>Standard International</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>GB</g:country>
        <g:service>Standard International</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>CA</g:country>
        <g:service>Standard International</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
    </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Traditional Alley - Authentic Nepali Ethnic Wear</title>
    <link>https://traditionalalley.com.np</link>
    <description>Authentic Nepali traditional fashion, handcrafted cultural dresses, Daura Suruwal, Dhaka topis, and ethnic clothing with worldwide delivery.</description>
${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating Google Shopping Feed:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
