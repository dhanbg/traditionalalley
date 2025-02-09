import Features from "@/components/common/Features";
import Products3 from "@/components/common/Products3";
import ShopGram from "@/components/common/ShopGram2";
import Testimonials from "@/components/common/Testimonials";
import Footer1 from "@/components/footers/Footer1";
import Header3 from "@/components/headers/Header3";
import Topbar3 from "@/components/headers/Topbar3";
import Blogs from "@/components/homes/fashion-classyCove/Blogs";
import Categories from "@/components/homes/fashion-classyCove/Categories";
import Collections from "@/components/homes/fashion-classyCove/Collections";
import Hero from "@/components/homes/fashion-classyCove/Hero";
import React from "react";

export const metadata = {
  title:
    "Home Fashion Classycove || Traditional Alley",
  description: "Traditional Alley",
};

export default function page() {
  return (
    <>
      <Topbar3 />
      <Header3 />
      <Hero />
      <Collections />
      <Products3 />
      <Categories />
      <Testimonials />
      <Blogs />
      <Features parentClass="flat-spacing line-top-container" />
      <ShopGram />
      <Footer1 dark />
    </>
  );
}
