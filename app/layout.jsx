import "../public/scss/main.scss";
import "../public/css/custom.css"; // Custom CSS for compare products
import ClientLayout from "./ClientLayout";
import { metadata as globalMetadata } from "./metadata";
import { Bodoni_Moda, Outfit } from "next/font/google";
import Script from "next/script";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-bodoni",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata = globalMetadata;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

const jsonLdGlobal = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ClothingStore", "OnlineStore"],
      "@id": "https://traditionalalley.com.np/#organization",
      "name": "Traditional Alley",
      "url": "https://traditionalalley.com.np",
      "telephone": "+977-9844594187",
      "email": "contact@traditionalalley.com.np",
      "priceRange": "$$",
      "currenciesAccepted": "NPR, USD",
      "paymentAccepted": "Cash, Credit Card, Debit Card, eSewa, Khalti, Bank Transfer, Visa, MasterCard",
      "hasMap": "https://www.google.com/maps?cid=3047248882064954290",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "10:00",
          "closes": "19:00"
        }
      ],
      "areaServed": [
        { "@type": "City", "name": "Lalitpur" },
        { "@type": "City", "name": "Kathmandu" },
        { "@type": "City", "name": "Bhaktapur" },
        { "@type": "Country", "name": "Nepal" },
        { "@type": "Country", "name": "United States" },
        { "@type": "Country", "name": "Australia" },
        { "@type": "Country", "name": "United Kingdom" },
        { "@type": "Country", "name": "Canada" }
      ],
      "logo": {
        "@type": "ImageObject",
        "url": "https://traditionalalley.com.np/logo.png",
        "width": "600",
        "height": "150"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Hattiban",
        "addressLocality": "Lalitpur",
        "addressRegion": "Bagmati",
        "postalCode": "44700",
        "addressCountry": "NP"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 27.6466158,
        "longitude": 85.3316533
      },
      "sameAs": [
        "https://www.facebook.com/traditionalalley555/",
        "https://www.instagram.com/_traditional_alley/",
        "https://www.tiktok.com/@_traditional_alley",
        "https://www.pinterest.com/Traditionalley01/"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+977-9844594187",
        "contactType": "Customer Support",
        "email": "contact@traditionalalley.com.np",
        "areaServed": ["NP", "US", "AU", "GB", "CA"],
        "availableLanguage": ["English", "Nepali"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://traditionalalley.com.np/#website",
      "url": "https://traditionalalley.com.np",
      "name": "Traditional Alley",
      "description": "Authentic Nepali Traditional Clothing and Modern Fashion",
      "publisher": {
        "@id": "https://traditionalalley.com.np/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://traditionalalley.com.np/search-result?query={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${outfit.variable}`} suppressHydrationWarning={true}>
      <head>
        {/* Preconnect to image CDN for faster image rendering & Google Image indexing */}
        <link rel="preconnect" href="https://admin.traditionalalley.com.np" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://admin.traditionalalley.com.np" />

        {/* Global Structured Data (Organization & WebSite) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGlobal) }}
        />

        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-58N5BZ7C');`,
          }}
        />

        {/* Meta Pixel Code */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '882153701609750');
fbq('track', 'PageView');`,
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-58N5BZ7C"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Meta Pixel Code (noscript) */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=882153701609750&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code (noscript) */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
