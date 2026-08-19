import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";
import Women from "@/components/Collections/Women/Women";

export const metadata = {
  title: "Women's Ethnic & Traditional Fashion Collection | Traditional Alley",
  description: "Discover our exclusive women's fashion collection featuring authentic Nepali traditional clothing, lehengas, kurthas, sarees, and modern ethnic outfits. Worldwide shipping.",
  alternates: {
    canonical: "/women",
  },
  openGraph: {
    title: "Women's Ethnic & Traditional Fashion Collection | Traditional Alley",
    description: "Discover our exclusive women's fashion collection featuring authentic Nepali traditional clothing, lehengas, kurthas, sarees, and modern ethnic outfits.",
    url: "https://traditionalalley.com.np/women",
    siteName: "Traditional Alley",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Traditional Alley Women Collection" }],
  },
};

const womenSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://traditionalalley.com.np/women#webpage",
      "url": "https://traditionalalley.com.np/women",
      "name": "Women's Ethnic & Traditional Fashion Collection",
      "description": "Discover authentic Nepali traditional dresses, lehengas, kurthas, sarees, and modern ethnic outfits for women.",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://traditionalalley.com.np" },
          { "@type": "ListItem", "position": 2, "name": "Women", "item": "https://traditionalalley.com.np/women" }
        ]
      }
    }
  ]
};

export default function page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(womenSchema) }}
      />
      <Header1 />
      <Women />
      <Footer1 />
    </>
  );
}
