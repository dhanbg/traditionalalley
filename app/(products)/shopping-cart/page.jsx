"use client";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import RecentProducts from "@/components/otherPages/RecentProducts";
import ShopCart from "@/components/otherPages/ShopCart";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ShoppingCartPage() {
  const router = useRouter();
  const [hasReloaded, setHasReloaded] = useState(false);
  
  // Auto-reload the page once after initial load
  useEffect(() => {
    // Check if we've already reloaded the page in this session
    const hasAlreadyReloaded = localStorage.getItem('cartPageReloaded');
    
    // If we haven't reloaded yet and the state doesn't show we've reloaded
    if (!hasAlreadyReloaded && !hasReloaded) {
      console.log("Shopping cart page loaded, scheduling refresh in 300ms...");
      
      const refreshTimer = setTimeout(() => {
        console.log("Refreshing shopping cart page...");
        // Set flag in localStorage before reload
        localStorage.setItem('cartPageReloaded', 'true');
        setHasReloaded(true);
        window.location.reload();
      }, 300);
      
      return () => clearTimeout(refreshTimer);
    } else {
      // Already reloaded, just update the state
      setHasReloaded(true);
      console.log("Shopping cart page already reloaded once, not reloading again");
    }
    
    // Clear the reload flag when leaving the page
    return () => {
      if (hasReloaded) {
        localStorage.removeItem('cartPageReloaded');
      }
    };
  }, [hasReloaded]);

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
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
      <Footer1 />
    </>
  );
}
