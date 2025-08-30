"use client";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Checkout from "@/components/otherPages/Checkout";
import CartLoadingGuard from "@/components/common/CartLoadingGuard";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <CartLoadingGuard>
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
            <h3 className="heading text-center">Check Out</h3>
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
                <Link className="link" href={`/shop-default-grid`}>
                  Shop
                </Link>
              </li>
              <li>
                <i className="icon-arrRight" />
              </li>
              <li>View Cart</li>
            </ul>
          </div>
        </div>
        <Checkout />
      </CartLoadingGuard>
      <Footer1 />
    </>
  );
}
