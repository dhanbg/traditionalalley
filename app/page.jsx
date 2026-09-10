import HomePage from './HomePage';
import { localHeroSlides } from '@/data/localHeroSlides';
import { fetchDataFromApi } from '@/utils/api';
import { fetchTopPicksItems } from '@/utils/productVariantUtils';

// ✅ PERFORMANCE: Enable ISR - cache for 60 seconds
export const revalidate = 60; // Revalidate every 60 seconds

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
  // Default initial mobile flag (Hero detects client screen size on mount)
  const isMobileInitial = false;
  // ✅ PERFORMANCE: Run all 3 homepage backend requests concurrently in parallel
  // This minimizes serverless function execution time and Active CPU usage.
  const [offersResult, topPicksMetaResult, topPicksItemsResult] = await Promise.allSettled([
    // Strapi collection: offers
    fetchDataFromApi('/api/offers?populate=*'),
    // Strapi single/collection: top-picks meta
    fetchDataFromApi('/api/top-picks?fields=heading,subheading,isActive'),
    // Top picks items (products + variants)
    fetchTopPicksItems(),
  ]);

  const offersRes = offersResult.status === 'fulfilled' ? offersResult.value : null;
  const topPicksMetaRes = topPicksMetaResult.status === 'fulfilled' ? topPicksMetaResult.value : null;
  const initialTopPicks = topPicksItemsResult.status === 'fulfilled' && Array.isArray(topPicksItemsResult.value)
    ? topPicksItemsResult.value
    : [];

  // Override hero slides with local static slides using public videos
  const initialHeroSlidesRaw = Array.isArray(localHeroSlides) ? localHeroSlides : [];
  const initialOfferData = Array.isArray(offersRes?.data) && offersRes.data.length > 0 ? offersRes.data[0] : null;
  const initialTopPicksMeta = Array.isArray(topPicksMetaRes?.data) && topPicksMetaRes.data.length > 0
    ? (topPicksMetaRes.data[0]?.isActive === false ? null : { heading: topPicksMetaRes.data[0]?.heading, subheading: topPicksMetaRes.data[0]?.subheading })
    : null;
  const initialInstagramPosts = [];

  return (
    <HomePage
      initialHeroSlidesRaw={initialHeroSlidesRaw}
      initialOfferData={initialOfferData}
      initialTopPicks={initialTopPicks}
      initialTopPicksMeta={initialTopPicksMeta}
      initialInstagramPosts={initialInstagramPosts}
      isMobileInitial={isMobileInitial}
    />
  );
}