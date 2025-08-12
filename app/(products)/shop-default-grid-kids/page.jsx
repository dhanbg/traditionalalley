import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Products from "@/components/products/Products";
import Link from "next/link";
import React, { Suspense } from "react";

export default function page({ searchParams }) {
  const collectionId = searchParams?.collectionId;
  
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
              <h3 className="heading text-center">Kids</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    Homepage
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>Kids</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={<div>Loading products...</div>}>
        <Products 
          categoryId={3} 
          categoryTitle="Kids" 
          collectionId={collectionId}
        />
      </Suspense>
      <Footer1 />
    </>
  );
}
