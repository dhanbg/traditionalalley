import BannerTab from "@/components/common/BannerTab";
import Features from "@/components/common/Features";
import MarqueeSection from "@/components/common/MarqueeSection";
import MarqueeSection2 from "@/components/common/MarqueeSection2";
import Products from "@/components/common/Products";
import ShopGram from "@/components/common/ShopGram2";
import Testimonials from "@/components/common/Testimonials";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Hero from "@/components/homes/fashion-vogueLing/Hero";
import Lookbook from "@/components/homes/fashion-vogueLing/Lookbook";
import React from "react";

export const metadata = {
  title:
    "Home Fashion Vogueling || Traditional Alley",
  description: "Traditional Alley",
};

export default function page() {
  return (
    <>
      <Header1 fullWidth />
      <Hero />
      <MarqueeSection2 />

      <Products parentClass={"flat-spacing"} />
      <BannerTab />
      <Lookbook />
      <div className="line-top-container"></div>
      <Features />
      <Testimonials parentClass="flat-spacing pt-0" />
      <ShopGram />
      <Footer1 />
    </>
  );
}
