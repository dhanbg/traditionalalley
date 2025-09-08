import HomePage from './HomePage';

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

export default function Page() {
  return <HomePage />;
}