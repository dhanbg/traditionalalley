import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";
import Women from "@/components/Collections/Women/Women";

export const metadata = {
  title: "Women's Ethnic & Traditional Fashion Collection",
  description: "Discover our exclusive women's fashion collection featuring authentic Nepali traditional clothing, lehengas, kurthas, sarees, and modern ethnic outfits. Worldwide shipping.",
  alternates: {
    canonical: "/women",
  },
  openGraph: {
    title: "Women's Ethnic & Traditional Fashion Collection | Traditional Alley",
    description: "Discover our exclusive women's fashion collection featuring authentic Nepali traditional clothing, lehengas, kurthas, sarees, and modern ethnic outfits.",
    url: "https://traditionalalley.com.np/women",
    siteName: "Traditional Alley",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "Traditional Alley Women Collection" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Women's Ethnic & Traditional Fashion Collection | Traditional Alley",
    description: "Discover our exclusive women's fashion collection featuring authentic Nepali traditional clothing, lehengas, kurthas, sarees, and modern ethnic outfits.",
    images: ["/og-image.jpg"],
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
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Women's Traditional Collections",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ethnic Corsets", "url": "https://traditionalalley.com.np/collections/corsets" },
          { "@type": "ListItem", "position": 2, "name": "Kurtha & Tunics", "url": "https://traditionalalley.com.np/collections/kurtha" },
          { "@type": "ListItem", "position": 3, "name": "Bridal & Party Lehenga", "url": "https://traditionalalley.com.np/collections/lehenga" },
          { "@type": "ListItem", "position": 4, "name": "Traditional Dresses", "url": "https://traditionalalley.com.np/collections/dresses" },
          { "@type": "ListItem", "position": 5, "name": "Graduation Dresses", "url": "https://traditionalalley.com.np/collections/graduation" }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://traditionalalley.com.np/women#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What types of authentic Nepali women's clothing does Traditional Alley offer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Traditional Alley offers a versatile range of authentic Nepali garments, including handwoven Dhaka corsets and crop tops, classic and modern Kurtha Suruwal sets, bridal and reception lehengas, ethnic sarees, designer gowns, and contemporary co-ord sets."
          }
        },
        {
          "@type": "Question",
          "name": "Can I request custom measurements or bespoke sizing for dresses and lehengas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! We provide made-to-measure custom tailoring for all our women's outfits. You can submit your exact bust, waist, hip, and length measurements through our Custom Order option or WhatsApp support (+977-9844594187) for a tailored bespoke fit."
          }
        },
        {
          "@type": "Question",
          "name": "How should I care for handcrafted Dhaka and velvet garments?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Because authentic Nepali Dhaka and embroidered velvet feature delicate handwoven threads and metallic zari work, we recommend professional dry cleaning. For light storage, keep garments in breathable cotton bags away from direct moisture and sunlight."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer international shipping for weddings and cultural events abroad?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we ship worldwide via DHL Express to the United States, Australia, United Kingdom, Canada, Europe, Japan, and the Middle East. Express delivery typically arrives within 12 to 15 business days with end-to-end tracking provided upon dispatch."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(womenSchema) }}
      />
      <Header1 />
      <Women />
      <Footer1 />
    </>
  );
}
