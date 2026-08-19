import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Products from "@/components/products/Products";
import Link from "next/link";
import React from "react";

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
  const title = `${formattedName} Collection | Traditional Alley`;
  const description = `Explore the ${formattedName} collection at Traditional Alley. Shop authentic Nepali ethnic wear, handcrafted traditional outfits, and modern cultural designs with worldwide shipping.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/collections/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://traditionalalley.com.np/collections/${slug}`,
      siteName: 'Traditional Alley',
      type: 'website',
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
          alt: `${formattedName} Collection - Traditional Alley`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/logo.png'],
    },
  };
}

export default async function CollectionPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const formattedName = formatCollectionName(slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://traditionalalley.com.np",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: "https://traditionalalley.com.np/collections",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: formattedName,
        item: `https://traditionalalley.com.np/collections/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
      <Products collection={slug} />
      <Footer1 />
    </>
  );
}