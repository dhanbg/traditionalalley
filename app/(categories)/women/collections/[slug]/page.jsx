import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Products from "@/components/products/Products";
import { categoriesData } from "@/data/catnames"; 
import Link from "next/link";
import React from "react";

export default async function Page({ params }) {
  const slug = (await params).slug;
  
  // Find the category from the categoriesData
  let categoryData;
  Object.keys(categoriesData).forEach((key) => {
    categoriesData[key].forEach((category) => {
      if (category.slug === slug) {
        categoryData = category;
      }
    });
  });

  // If the category isn't found, return a "Not Found" message or redirect
  if (!categoryData) {
    return <div>Category not found!</div>;
  }

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
              <h3 className="heading text-center">{categoryData.name}</h3>
              {/* Display the category name dynamically */}
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
                  <i className="icon-arrRight" />
                </li>
                <li>{categoryData.name}</li> {/* Dynamically set the category name */}
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
