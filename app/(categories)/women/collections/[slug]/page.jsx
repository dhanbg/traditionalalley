import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Products from "@/components/products/Products";
import Link from "next/link";
import React from "react";

// Fetch collection data from API
async function getCollectionData(slug) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/collections?populate=*`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch collections');
    }
    
    const data = await response.json();
    const collections = data.data || [];
    
    // Find the collection by slug
    const collection = collections.find(col => 
      col.attributes?.slug === slug
    );
    
    return collection;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export default async function Page({ params }) {
  const slug = (await params).slug;
  
  // Fetch the collection data from API
  const collectionData = await getCollectionData(slug);

  // If the collection isn't found, return a "Not Found" message
  if (!collectionData) {
    return (
      <>
        <Topbar6 bgColor="bg-main" />
        <Header1 />
        <div className="container" style={{padding: '100px 0'}}>
          <div className="text-center">
            <h3>Collection not found!</h3>
            <p>The collection you're looking for doesn't exist.</p>
            <Link href="/" className="tf-btn btn-fill animate-hover-btn">
              Go back to homepage
            </Link>
          </div>
        </div>
        <Footer1 />
      </>
    );
  }
  
  const collectionName = collectionData.attributes?.name || 'Collection';

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
              {/* Display the collection name dynamically */}
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
                  <Link className="link" href={`/women`}>
                    Women
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
                <li>{collectionName}</li> {/* Dynamically set the collection name */}
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
