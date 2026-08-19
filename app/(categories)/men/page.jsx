import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";
import Men from "@/components/Collections/Men/Men";

export const metadata = {
  title: "Men's Nepali Fashion & Traditional Attire | Traditional Alley",
  description: "Explore our premium men's collection featuring authentic Nepali Daura Suruwal, Dhaka coats, ethnic blazers, and contemporary styles. Shop quality menswear at Traditional Alley.",
  alternates: {
    canonical: "/men",
  },
  openGraph: {
    title: "Men's Nepali Fashion & Traditional Attire | Traditional Alley",
    description: "Explore our premium men's collection featuring authentic Nepali Daura Suruwal, Dhaka coats, ethnic blazers, and contemporary styles.",
    url: "https://traditionalalley.com.np/men",
    siteName: "Traditional Alley",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Traditional Alley Men Collection" }],
  },
};

const menSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://traditionalalley.com.np/men#webpage",
      "url": "https://traditionalalley.com.np/men",
      "name": "Men's Nepali Fashion & Traditional Attire",
      "description": "Explore authentic Nepali Daura Suruwal, Dhaka coats, ethnic blazers, and contemporary styles for men.",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://traditionalalley.com.np" },
          { "@type": "ListItem", "position": 2, "name": "Men", "item": "https://traditionalalley.com.np/men" }
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menSchema) }}
      />
      <Header1 />
      <Men />
      <Footer1 />
    </>
  );
}
