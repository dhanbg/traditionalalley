import Features from "@/components/common/Features";
import MarqueeSection2 from "@/components/common/MarqueeSection2";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar3 from "@/components/headers/Topbar3";
import BannerTab from "@/components/homes/New folder/activewear/BannerTab";
import Collections from "@/components/homes/New folder/activewear/Collections";
import Hero from "@/components/homes/New folder/activewear/Hero";
import Lookbook from "@/components/homes/New folder/activewear/Lookbook";
import Products from "@/components/homes/New folder/activewear/Products";
import Products2 from "@/components/homes/New folder/activewear/Products2";
import ShopGram from "@/components/homes/New folder/activewear/ShopGram";
import Testimonials from "@/components/homes/New folder/activewear/Testimonials";
import React from "react";

export const metadata = {
  title:
    "Home Active Wear || Traditional Alley",
  description: "Traditional Alley",
};

export default function page() {
  return (
    <>
      <Topbar3 />
      <Header1 fullWidth />
      <Hero />
      <MarqueeSection2 parentClass="tf-marquee border-0" />
      <Collections />
      <Products />
      <Lookbook />
      <BannerTab />
      <Products2 />
      <Testimonials />
      <Features parentClass="flat-spacing line-top-container" />
      <ShopGram />
      <Footer1 border={false} />
    </>
  );
}
