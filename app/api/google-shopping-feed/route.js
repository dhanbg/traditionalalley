import { fetchDataFromApi } from '@/utils/api';
import { API_URL } from '@/utils/urls';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache feed for 1 hour

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeDescription(desc) {
  if (!desc) return '';
  if (typeof desc === 'string') {
    return desc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (Array.isArray(desc)) {
    return desc
      .map((block) => {
        if (block?.children && Array.isArray(block.children)) {
          return block.children.map((c) => c.text || '').join('');
        }
        return '';
      })
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return '';
}

export async function GET() {
  const baseUrl = 'https://traditionalalley.com.np';

  try {
    const response = await fetchDataFromApi('/api/products?pagination[pageSize]=100&populate=*');
    const products = Array.isArray(response?.data) ? response.data : [];

    const activeProducts = products.filter(
      (p) => p.isActive !== false && p.documentId
    );

    const itemsXml = activeProducts.map((p) => {
      const id = p.documentId;
      const title = escapeXml(p.title || 'Nepali Ethnic Garment');
      const cleanDesc = normalizeDescription(p.description);
      const description = escapeXml(
        cleanDesc && cleanDesc.length > 10
          ? cleanDesc.substring(0, 1000)
          : `Handcrafted authentic Nepali ${p.title} from Traditional Alley.`
      );
      const link = `${baseUrl}/product-detail/${id}`;

      // Get high-res primary image
      let rawImg = p.imgSrc?.formats?.large?.url || p.imgSrc?.formats?.medium?.url || p.imgSrc?.url;
      let imageUrl = rawImg
        ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`)
        : `${baseUrl}/logo.png`;

      // Price formatted for Google Merchant (e.g., "75.00 USD")
      const priceNum = Number(p.price) || 0;
      const priceFormatted = `${priceNum.toFixed(2)} USD`;

      const mpn = escapeXml(p.product_code || p.sku || id);
      const collectionName = p.collection?.name || p.collection?.title || 'Ethnic Wear';

      // Additional gallery images
      let additionalImages = [];
      if (Array.isArray(p.gallery)) {
        additionalImages = p.gallery
          .map((img) => {
            const u = img?.formats?.large?.url || img?.formats?.medium?.url || img?.url;
            return u ? (u.startsWith('http') ? u : `${API_URL}${u}`) : null;
          })
          .filter(Boolean)
          .filter((u) => u !== imageUrl)
          .slice(0, 5);
      }

      const additionalImagesXml = additionalImages
        .map((imgUrl) => `        <g:additional_image_link>${escapeXml(imgUrl)}</g:additional_image_link>`)
        .join('\n');

      return `      <item>
        <g:id>${escapeXml(id)}</g:id>
        <g:title>${title}</g:title>
        <g:description>${description}</g:description>
        <g:link>${escapeXml(link)}</g:link>
        <g:image_link>${escapeXml(imageUrl)}</g:image_link>
${additionalImagesXml ? additionalImagesXml + '\n' : ''}        <g:condition>new</g:condition>
        <g:availability>in_stock</g:availability>
        <g:price>${priceFormatted}</g:price>
        <g:brand>Traditional Alley</g:brand>
        <g:mpn>${mpn}</g:mpn>
        <g:google_product_category>1604</g:google_product_category>
        <g:product_type>Apparel &amp; Accessories &gt; Clothing &gt; Traditional &amp; Cultural Clothing &gt; ${escapeXml(collectionName)}</g:product_type>
        <g:shipping>
          <g:country>NP</g:country>
          <g:price>0.00 USD</g:price>
        </g:shipping>
        <g:shipping>
          <g:country>US</g:country>
          <g:price>0.00 USD</g:price>
        </g:shipping>
        <g:shipping>
          <g:country>AU</g:country>
          <g:price>0.00 USD</g:price>
        </g:shipping>
        <g:shipping>
          <g:country>GB</g:country>
          <g:price>0.00 USD</g:price>
        </g:shipping>
        <g:shipping>
          <g:country>CA</g:country>
          <g:price>0.00 USD</g:price>
        </g:shipping>
      </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Traditional Alley Google Shopping Product Feed</title>
    <link>${baseUrl}</link>
    <description>Authentic Nepali Fashion, Cultural Attire, and Handcrafted Traditional Outfits</description>
${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating Google Shopping Feed:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>`,
      {
        status: 500,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      }
    );
  }
}
