import React, { Suspense } from 'react';
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import HeroProducts from "@/components/products/HeroProducts";
import Link from "next/link";

export const metadata = {
  title: "Hero Collection - Traditional Alley",
  description: "Discover our featured collection from hero slides",
};

export default async function HeroProductsPage({ searchParams }) {
  const params = await searchParams;
  const slideId = params?.slideId;
  const btnText = params?.btnText || "Featured Collection";
  const videoName = params?.videoName || null;

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
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
          <div className="row">
            <div className="col-12">
              <h3 className="heading text-center">{btnText}</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    Homepage
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>{btnText}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<div>Loading products...</div>}>
        <HeroProducts slideId={slideId} btnText={btnText} videoName={videoName} />
      </Suspense>
      <Footer1 />
    </>
  );
}