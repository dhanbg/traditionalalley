import HomePage from './HomePage';
import { fetchDataFromApi } from '@/utils/api';
import { fetchFromStrapi } from '@/lib/analytics-api';
import { fetchTopPicksItems } from '@/utils/productVariantUtils';

export const revalidate = 0;

// Metadata for the home page
export const metadata = {
  title: 'Traditional Alley - Authentic Nepali Fashion & Traditional Clothing',
  description: 'Discover authentic Nepali traditional clothing and modern fashion at Traditional Alley. Shop premium quality ethnic wear, traditional dresses, and contemporary styles. Free shipping worldwide.',
  keywords: 'Traditional Alley, Nepali fashion, traditional clothing, ethnic wear, Nepal traditional dress, authentic Nepali clothing, traditional fashion, cultural clothing, handmade clothing Nepal',
  openGraph: {
    title: 'Traditional Alley - Authentic Nepali Fashion & Traditional Clothing',
    description: 'Discover authentic Nepali traditional clothing and modern fashion at Traditional Alley. Shop premium quality ethnic wear, traditional dresses, and contemporary styles.',
    url: 'https://traditionalalley.com.np',
    siteName: 'Traditional Alley',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Traditional Alley - Authentic Nepali Fashion',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Traditional Alley - Authentic Nepali Fashion & Traditional Clothing',
    description: 'Discover authentic Nepali traditional clothing and modern fashion at Traditional Alley. Shop premium quality ethnic wear, traditional dresses, and contemporary styles.',
    images: ['/logo.png'],
  },
};

export default async function Page() {
  // Fetch all homepage content from Strapi before rendering
  // Gate rendering until all requests resolve
  const [heroRes, offersRes, topPicksMetaRes, instagramRes] = await Promise.all([
    // Strapi collection: hero-slides
    fetchDataFromApi('/api/hero-slides?populate=*'),
    // Strapi collection: offers
    fetchDataFromApi('/api/offers?populate=*'),
    // Strapi single/collection: top-picks meta
    fetchDataFromApi('/api/top-picks?fields=heading,subheading,isActive'),
    // Fetch Instagram posts via direct Strapi call to avoid server-side relative URL issues
    fetchFromStrapi('instagrams?populate=*'),
  ]);

  const initialHeroSlidesRaw = Array.isArray(heroRes?.data) ? heroRes.data : [];
  const initialOfferData = Array.isArray(offersRes?.data) && offersRes.data.length > 0 ? offersRes.data[0] : null;
  const initialTopPicksMeta = Array.isArray(topPicksMetaRes?.data) && topPicksMetaRes.data.length > 0
    ? (topPicksMetaRes.data[0]?.isActive === false ? null : { heading: topPicksMetaRes.data[0]?.heading, subheading: topPicksMetaRes.data[0]?.subheading })
    : null;
  const initialInstagramPosts = Array.isArray(instagramRes?.data) ? instagramRes.data : [];

  // Top picks items (products + variants) require transformation; fetch separately
  const initialTopPicks = await fetchTopPicksItems();

  return (
    <HomePage
      initialHeroSlidesRaw={initialHeroSlidesRaw}
      initialOfferData={initialOfferData}
      initialTopPicks={initialTopPicks}
      initialTopPicksMeta={initialTopPicksMeta}
      initialInstagramPosts={initialInstagramPosts}
    />
  );
}