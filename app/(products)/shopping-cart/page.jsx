"use client";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import RecentProducts from "@/components/otherPages/RecentProducts";
import ShopCart from "@/components/otherPages/ShopCart";
import CartLoadingGuard from "@/components/common/CartLoadingGuard";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";

export default function ShoppingCartPage() {
  const router = useRouter();

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <CartLoadingGuard>
        <div
          className="page-title"
          style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
        >
          <div className="container">
            <h3 className="heading text-center">Shopping Cart</h3>
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
              <li>Shopping Cart</li>
            </ul>
          </div>
        </div>

        <ShopCart />
        <RecentProducts />
      </CartLoadingGuard>
      <Footer1 />
    </>
  );
}
