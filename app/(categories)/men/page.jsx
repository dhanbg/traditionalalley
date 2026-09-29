import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";
import Men from "@/components/Collections/Men/Men";

export const metadata = {
  title: "Men's Nepali Fashion & Traditional Attire",
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
  twitter: {
    card: "summary_large_image",
    title: "Men's Nepali Fashion & Traditional Attire | Traditional Alley",
    description: "Explore our premium men's collection featuring authentic Nepali Daura Suruwal, Dhaka coats, ethnic blazers, and contemporary styles.",
    images: ["/logo.png"],
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
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Men's Traditional Collections",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Daura Suruwal & Coats", "url": "https://traditionalalley.com.np/collections/dauracoat" },
          { "@type": "ListItem", "position": 2, "name": "Authentic Nepali Dhaka", "url": "https://traditionalalley.com.np/collections/nepalidhaka" },
          { "@type": "ListItem", "position": 3, "name": "Ethnic Blazers", "url": "https://traditionalalley.com.np/collections/blazer" },
          { "@type": "ListItem", "position": 4, "name": "Festive & Event Wear", "url": "https://traditionalalley.com.np/collections/events" }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://traditionalalley.com.np/men#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What pieces are included in a complete Nepali Daura Suruwal set?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A classic men's Nepali traditional ensemble consists of the Daura (the traditional double-breasted upper wrap shirt with eight cords), the Suruwal (tapered trousers), and an outer Dhaka waistcoat or coat. You can also pair it with an authentic Dhaka Topi for complete ceremonial attire."
          }
        },
        {
          "@type": "Question",
          "name": "Can I order groom or groomsmen attire for a Nepali wedding outside Nepal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! Many of our wedding customers order from the US, UK, Australia, and Canada. We specialize in coordinated groom attire, matching groomsmen sets, and custom color themes with guaranteed international delivery via DHL Express."
          }
        },
        {
          "@type": "Question",
          "name": "How do I choose the correct size for a Daura Suruwal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer standard sizes from XS to XXL based on chest circumference and height. For the sharpest fit, you can also send us your chest, waist, shoulder width, arm length, and height, and our master tailors in Lalitpur will craft a customized fit."
          }
        },
        {
          "@type": "Question",
          "name": "How fast is delivery for international orders?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Standard order processing takes 2 to 3 business days, followed by DHL Express international transit of 12 to 15 business days. We recommend ordering at least 3 to 4 weeks prior to your scheduled event date."
          }
        }
      ]
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
