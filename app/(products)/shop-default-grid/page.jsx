import React, { Suspense } from 'react';
import Products from "@/components/products/Products";

export const metadata = {
  title: "Shop All Authentic Nepali Clothing & Ethnic Wear | Traditional Alley",
  description: "Browse our complete catalog of authentic Nepali dresses, Dhaka tops, Kurthas, bridal lehengas, Daura Suruwal, and contemporary traditional accessories with worldwide shipping.",
  alternates: {
    canonical: "/shop-default-grid",
  },
  openGraph: {
    title: "Shop All Authentic Nepali Clothing & Ethnic Wear | Traditional Alley",
    description: "Browse our complete catalog of authentic Nepali dresses, Dhaka tops, Kurthas, bridal lehengas, and Daura Suruwal.",
    url: "https://traditionalalley.com.np/shop-default-grid",
    siteName: "Traditional Alley",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Traditional Alley Storefront" }],
  },
};

const shopSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://traditionalalley.com.np/shop-default-grid#webpage",
      "url": "https://traditionalalley.com.np/shop-default-grid",
      "name": "Shop All Authentic Nepali Traditional Clothing",
      "description": "Discover all products, traditional ethnic wear, and modern Nepali fashion at Traditional Alley.",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://traditionalalley.com.np" },
          { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://traditionalalley.com.np/shop-default-grid" }
        ]
      }
    }
  ]
};

export default function ShopDefaultGrid() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopSchema) }}
      />
      <div
        className="page-title"
        style={{ 
          backgroundImage: "url(/images/section/page-title.jpg)",
          height: "250px",
          minHeight: "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div className="container" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%"
        }}>
          <h1 className="text-3xl font-bold text-white mb-2">All Products</h1>
          <p className="text-white">Discover our complete collection of traditional clothing and accessories</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center py-8">Loading products...</div>}>
          <Products />
        </Suspense>
      </div>
    </>
  );
}
