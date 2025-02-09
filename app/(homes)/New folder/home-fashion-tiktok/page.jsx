import Blogs from "@/components/common/Blogs";
import Brands from "@/components/common/Brands";
import Features from "@/components/common/Features";
import Products4 from "@/components/common/Products4";
import Footer1 from "@/components/footers/Footer1";
import Header6 from "@/components/headers/Header6";
import Topbar2 from "@/components/headers/Topbar2";
import BannerTab from "@/components/homes/fashion-tiktok/BannerTab";
import Collections from "@/components/homes/fashion-tiktok/Collections";
import Hero from "@/components/homes/fashion-tiktok/Hero";
import MarqueeSection from "@/components/common/MarqueeSection2";
import Testimonials from "@/components/homes/fashion-tiktok/Testimonials3";
import Tiktok from "@/components/homes/fashion-tiktok/Tiktok";
import React from "react";

export const metadata = {
  title:
    "Home Fashion Tiktok || Traditional Alley",
  description: "Traditional Alley",
};

export default function page() {
  return (
    <>
      <Topbar2 />
      <Header6 />
      <Hero />
      <Collections />
      <Products4 parentClass="flat-spacing pt-0" />
      <MarqueeSection />
      <BannerTab />
      <Tiktok />
      <Testimonials />
      <Blogs parentClass="flat-spacing" />
      <Features parentClass="flat-spacing line-top-container" />
      <Brands />
      <Footer1 dark />
    </>
  );
}
