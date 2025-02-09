import Features from "@/components/common/Features";
import Products3 from "@/components/common/Products3";
import ShopGram from "@/components/common/ShopGram";
import Testimonials from "@/components/common/Testimonials";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar4 from "@/components/headers/Topbar4";
import Collections from "@/components/homes/fashion-glamDwell/Collections";
import Hero from "@/components/homes/fashion-glamDwell/Hero";
import Lookbook from "@/components/homes/fashion-glamDwell/Lookbook";
import React from "react";

export const metadata = {
  title:
    "Home Fashion Glamdwell || Traditional Alley",
  description: "Traditional Alley",
};

export default function page() {
  return (
    <>
      <Topbar4 />
      <Header1 />
      <Hero />
      <Collections />
      <Products3 parentClass="flat-spacing pt-0" />
      <Lookbook />
      <Testimonials parentClass="" />
      <Features parentClass="flat-spacing" />
      <div className="line-bottom-container"></div>
      <ShopGram parentClass="flat-spacing" />
      <Footer1 />
    </>
  );
}
