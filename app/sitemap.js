import { fetchDataFromApi } from '@/utils/api';
import { allBlogs } from '@/data/blogs';

export const revalidate = 3600; // Revalidate sitemap hourly

export default async function sitemap() {
  const baseUrl = 'https://traditionalalley.com.np';
  const now = new Date().toISOString();

  // 1. Core Static Storefront Pages
  const staticRoutes = [
    { route: '', priority: 1.0, changeFrequency: 'daily' },
    { route: '/collections', priority: 0.9, changeFrequency: 'daily' },
    { route: '/women', priority: 0.9, changeFrequency: 'daily' },
    { route: '/men', priority: 0.9, changeFrequency: 'daily' },
    { route: '/kids', priority: 0.9, changeFrequency: 'daily' },
    { route: '/shop-default-grid', priority: 0.8, changeFrequency: 'daily' },
    { route: '/about-us', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/FAQs', priority: 0.6, changeFrequency: 'monthly' },
    { route: '/privacy-policy', priority: 0.5, changeFrequency: 'yearly' },
    { route: '/terms-conditions', priority: 0.5, changeFrequency: 'yearly' },
    { route: '/delivery-return', priority: 0.5, changeFrequency: 'monthly' },
    { route: '/size-guide', priority: 0.6, changeFrequency: 'monthly' },
  ];

  const staticUrls = staticRoutes.map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // 2. Dynamic Product Pages (from Strapi)
  let productUrls = [];
  try {
    const productsRes = await fetchDataFromApi('/api/products?pagination[pageSize]=500&fields[0]=documentId&fields[1]=updatedAt&fields[2]=isActive');
    if (productsRes && Array.isArray(productsRes.data)) {
      productUrls = productsRes.data
        .filter((item) => item.isActive !== false && item.documentId)
        .map((item) => ({
          url: `${baseUrl}/product-detail/${item.documentId}`,
          lastModified: item.updatedAt || now,
          changeFrequency: 'daily',
          priority: 0.9,
        }));
    }
  } catch (error) {
    console.error('Error generating product sitemap URLs:', error);
  }

  // 3. Known Collection Slugs & Dynamic Collections (from Strapi)
  const defaultCollectionSlugs = [
    'graduation', 'kurtha', 'dresses', 'sareesets', 'corsets', 'gown',
    'bosslady', 'lehenga', 'tops', 'coordinates', 'dauracoat', 'blazer',
    'nepalidhaka', 'events', 'kids'
  ];

  let collectionSlugsSet = new Set(defaultCollectionSlugs);
  try {
    const collectionsRes = await fetchDataFromApi('/api/collections?fields[0]=slug&fields[1]=updatedAt');
    if (collectionsRes && Array.isArray(collectionsRes.data)) {
      collectionsRes.data.forEach((col) => {
        if (col.slug) collectionSlugsSet.add(col.slug.toLowerCase());
      });
    }
  } catch (error) {
    console.error('Error fetching collection slugs for sitemap:', error);
  }

  const collectionUrls = Array.from(collectionSlugsSet).map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. Blog Posts
  const blogUrls = (allBlogs || [])
    .filter((b) => !b.isExternal && b.id)
    .map((b) => ({
      url: `${baseUrl}/blog-detail/${b.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [...staticUrls, ...collectionUrls, ...productUrls, ...blogUrls];
}
