import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Products from "@/components/products/Products";
import Link from "next/link";
import React, { Suspense } from "react";
import { fetchProductsWithVariantsByCollection } from "@/utils/productVariantUtils";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";

// Cache collection pages at edge CDN for 5 minutes
export const revalidate = 300;

export async function generateStaticParams() {
  return [
    { slug: 'graduation' },
    { slug: 'kurtha' },
    { slug: 'dresses' },
    { slug: 'sareesets' },
    { slug: 'corsets' },
    { slug: 'gown' },
    { slug: 'bosslady' },
    { slug: 'lehenga' },
    { slug: 'tops' },
    { slug: 'coordinates' },
    { slug: 'dauracoat' },
    { slug: 'blazer' },
    { slug: 'nepalidhaka' },
    { slug: 'events' },
    { slug: 'kids' },
  ];
}

function formatCollectionName(slug) {
  if (!slug) return "Collection";
  const nameMap = {
    graduation: "Graduation",
    kurtha: "Kurtha & Tunics",
    dresses: "Traditional Dresses",
    sareesets: "Saree Sets",
    corsets: "Ethnic Corsets",
    gown: "Designer Gowns",
    bosslady: "Boss Lady Formal Wear",
    lehenga: "Bridal & Party Lehenga",
    tops: "Tops & Blouses",
    coordinates: "Co-ord Sets",
    dauracoat: "Daura Suruwal & Coats",
    blazer: "Ethnic Blazers",
    nepalidhaka: "Authentic Nepali Dhaka",
    events: "Festive & Event Wear",
    kids: "Kids Ethnic Wear",
  };

  return nameMap[slug.toLowerCase()] || (slug.charAt(0).toUpperCase() + slug.slice(1));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const formattedName = formatCollectionName(slug);
  const collectionTitle = `${formattedName} Collection`;
  const fullTitle = `${collectionTitle} | Traditional Alley`;
  const description = `Explore the ${formattedName} collection at Traditional Alley. Shop authentic Nepali ethnic wear, handcrafted traditional outfits, and modern cultural designs with worldwide shipping.`;

  let collectionImageUrl = 'https://traditionalalley.com.np/logo.png';
  try {
    const collectionRes = await fetchDataFromApi(`/api/collections?filters[slug][$eq]=${slug}&populate=image`);
    const collData = collectionRes?.data?.find(c => c.slug === slug) || collectionRes?.data?.[0];
    if (collData?.image?.url) {
      const rawUrl = collData.image.formats?.large?.url || collData.image.formats?.medium?.url || collData.image.url;
      collectionImageUrl = rawUrl.startsWith('http') ? rawUrl : `${API_URL}${rawUrl}`;
    } else {
      const products = await fetchProductsWithVariantsByCollection(slug);
      if (products?.[0]?.imgSrc) {
        const pImg = typeof products[0].imgSrc === 'string' ? products[0].imgSrc : products[0].imgSrc?.url;
        if (pImg) {
          collectionImageUrl = pImg.startsWith('http') ? pImg : `${API_URL}${pImg}`;
        }
      }
    }
  } catch (error) {
    // Fall back to default logo
  }

  return {
    title: collectionTitle,
    description,
    alternates: {
      canonical: `/collections/${slug}`,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: `https://traditionalalley.com.np/collections/${slug}`,
      siteName: 'Traditional Alley',
      type: 'website',
      images: [
        {
          url: collectionImageUrl,
          width: 1200,
          height: 630,
          alt: `${formattedName} Collection - Traditional Alley`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [collectionImageUrl],
    },
  };
}

export default async function CollectionPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const formattedName = formatCollectionName(slug);

  // Pre-fetch products on server for instant HTML rendering and zero client API calls
  let initialProducts = [];
  try {
    initialProducts = await fetchProductsWithVariantsByCollection(slug);
  } catch (error) {
    // Silently handle fallback
  }

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://traditionalalley.com.np/collections/${slug}#webpage`,
        "url": `https://traditionalalley.com.np/collections/${slug}`,
        "name": `${formattedName} Collection - Traditional Alley`,
        "description": `Explore the ${formattedName} collection at Traditional Alley. Shop authentic Nepali ethnic wear, handcrafted traditional outfits, and modern cultural designs with worldwide shipping.`,
        "isPartOf": {
          "@id": "https://traditionalalley.com.np/#website",
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://traditionalalley.com.np",
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Collections",
              "item": "https://traditionalalley.com.np/collections",
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": formattedName,
              "item": `https://traditionalalley.com.np/collections/${slug}`,
            },
          ],
        },
        ...(initialProducts && initialProducts.length > 0 ? {
          "mainEntity": {
            "@type": "ItemList",
            "name": `${formattedName} Products`,
            "numberOfItems": initialProducts.length,
            "itemListElement": initialProducts.slice(0, 15).map((prod, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `https://traditionalalley.com.np/product-detail/${prod.documentId || prod.id}`,
              "name": prod.title || `${formattedName} Item`,
            })),
          },
        } : {}),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
      >
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <h1 className="heading text-center">{formattedName}</h1>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    Homepage
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>
                  <Link className="link" href={`/collections`}>
                    Collections
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>{formattedName}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={<div className="container py-5 text-center">Loading collection...</div>}>
        <Products collection={slug} initialProducts={initialProducts} />
      </Suspense>
      <Footer1 />
    </>
  );
}