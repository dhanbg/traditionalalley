// Global metadata configuration for Traditional Alley
export const metadata = {
  title: {
    default: 'Traditional Alley - Authentic Nepali Fashion & Traditional Clothing',
    template: '%s | Traditional Alley'
  },
  description: 'Discover authentic Nepali traditional clothing and modern fashion at Traditional Alley. Shop premium quality ethnic wear, traditional dresses, and contemporary styles. Free shipping worldwide.',
  keywords: [
    'Traditional Alley',
    'Nepali fashion',
    'traditional clothing',
    'ethnic wear',
    'Nepal traditional dress',
    'authentic Nepali clothing',
    'traditional fashion',
    'cultural clothing',
    'handmade clothing Nepal',
    'traditional alley nepal'
  ],
  authors: [{ name: 'Traditional Alley' }],
  creator: 'Traditional Alley',
  publisher: 'Traditional Alley',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://traditionalalley.com.np'),
  alternates: {
    canonical: '/',
  },
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
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Traditional Alley - Authentic Nepali Fashion & Traditional Clothing',
    description: 'Discover authentic Nepali traditional clothing and modern fashion at Traditional Alley. Shop premium quality ethnic wear, traditional dresses, and contemporary styles.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
};