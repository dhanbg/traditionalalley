import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Products from "@/components/products/Products";
import Link from "next/link";
import React from "react";

export default function CollectionPage({ params }) {
  const { slug } = params;

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
              <h3 className="heading text-center">{slug.charAt(0).toUpperCase() + slug.slice(1)}</h3>
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
                <li>{slug.charAt(0).toUpperCase() + slug.slice(1)}</li>
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