import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Products from "@/components/products/Products";
import { fetchDataFromApi } from "@/utils/api";
import { fetchProductsWithVariantsByCollection } from "@/utils/productVariantUtils";
import Link from "next/link";
import React, { Suspense } from "react";

// Cache men collection pages at edge CDN for 5 minutes
export const revalidate = 300;

export default async function Page({ params }) {
  const slug = (await params).slug;
  
  // Fetch collection metadata and initial products in parallel
  let collection = null;
  let initialProducts = [];
  try {
    const [collectionRes, productsRes] = await Promise.all([
      fetchDataFromApi(`/api/collections?filters[slug][$eq]=${slug}&populate=*`),
      fetchProductsWithVariantsByCollection(slug).catch(() => []),
    ]);
    if (collectionRes.data && collectionRes.data.length > 0) {
      collection = collectionRes.data[0];
    }
    initialProducts = productsRes || [];
  } catch (error) {
    console.error("Error fetching collection:", error);
  }

  // If the collection isn't found, return a "Not Found" message
  if (!collection) {
    return (
      <>
        <Topbar6 bgColor="bg-main" />
        <Header1 />
        <div className="container py-5 text-center">
          <h2>Collection not found</h2>
          <p>Sorry, the collection you are looking for does not exist or has been removed.</p>
          <Link href="/men" className="btn btn-primary mt-3">
            Back to Men's Collections
          </Link>
        </div>
        <Footer1 />
      </>
    );
  }

  const collectionName = collection.name || collection.attributes?.name || "Collection";

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
      >
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <h3 className="heading text-center">{collectionName}</h3>
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
                  <Link className="link" href={`/men`}>
                    Men
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>{collectionName}</li>
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