import HomePage from './HomePage';
import { localHeroSlides } from '@/data/localHeroSlides';
import { fetchDataFromApi } from '@/utils/api';
import { fetchTopPicksItems } from '@/utils/productVariantUtils';

// ✅ PERFORMANCE: Enable ISR - cache for 60 seconds
export const revalidate = 60; // Revalidate every 60 seconds

// Metadata for the home page
export const metadata = {
  title: {
    absolute: 'Traditional Alley - Authentic Nepali Fashion & Traditional Clothing',
  },
  alternates: {
    canonical: '/',
  },
  description: 'Discover authentic Nepali traditional clothing and modern fashion at Traditional Alley. Shop premium quality ethnic wear, traditional dresses, and contemporary styles. Free shipping worldwide.',
  keywords: 'Traditional Alley, Nepali fashion, traditional clothing, ethnic wear, Nepal traditional dress, authentic Nepali clothing, traditional fashion, cultural clothing, handmade clothing Nepal',
  openGraph: {
    title: 'Traditional Alley - Authentic Nepali Fashion & Traditional Clothing',
    description: 'Discover authentic Nepali traditional clothing and modern fashion at Traditional Alley. Shop premium quality ethnic wear, traditional dresses, and contemporary styles.',
    url: 'https://traditionalalley.com.np',
    siteName: 'Traditional Alley',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Traditional Alley - Authentic Nepali Fashion & Cultural Attire',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@_traditional_alley',
    creator: '@_traditional_alley',
    title: 'Traditional Alley - Authentic Nepali Fashion & Traditional Clothing',
    description: 'Discover authentic Nepali traditional clothing and modern fashion at Traditional Alley. Shop premium quality ethnic wear, traditional dresses, and contemporary styles.',
    images: ['/og-image.jpg'],
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

  const homeCollectionsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Popular Ethnic Fashion Collections',
    description: 'Explore popular Nepali traditional clothing collections at Traditional Alley',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: "Women's Ethnic Wear",
        url: 'https://traditionalalley.com.np/women',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: "Men's Traditional Attire & Daura Suruwal",
        url: 'https://traditionalalley.com.np/men',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: "Kids' Cultural Clothing",
        url: 'https://traditionalalley.com.np/kids',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Kurtha & Tunics Collection',
        url: 'https://traditionalalley.com.np/collections/kurtha',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Nepali Dhaka Collection',
        url: 'https://traditionalalley.com.np/collections/nepalidhaka',
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: 'Bridal & Party Lehenga',
        url: 'https://traditionalalley.com.np/collections/lehenga',
      },
      {
        '@type': 'ListItem',
        position: 7,
        name: 'Ethnic Corsets',
        url: 'https://traditionalalley.com.np/collections/corsets',
      },
      {
        '@type': 'ListItem',
        position: 8,
        name: 'Traditional Saree Sets',
        url: 'https://traditionalalley.com.np/collections/sareesets',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeCollectionsJsonLd) }}
      />
      <HomePage
        initialHeroSlidesRaw={initialHeroSlidesRaw}
        initialOfferData={initialOfferData}
        initialTopPicks={initialTopPicks}
        initialTopPicksMeta={initialTopPicksMeta}
        initialInstagramPosts={initialInstagramPosts}
        isMobileInitial={isMobileInitial}
      />
    </>
  );
}