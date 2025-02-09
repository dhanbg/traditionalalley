import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Breadcumb from "@/components/productDetails/Breadcumb";
import Descriptions1 from "@/components/productDetails/descriptions/Descriptions1";

import Details2 from "@/components/productDetails/details/Details2";
import RelatedProducts from "@/components/productDetails/RelatedProducts";
import { allProducts } from "@/data/productsWomen";
import React from "react";

export const metadata = {
  title:
    "Product Grid 01 || Traditional Alley",
  description: "Traditional Alley",
};
export default async function page({ params }) {
  const { id } = await params;

  const product = allProducts.filter((p) => p.id == id)[0] || allProducts[0];
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <Breadcumb product={product} />
      {product && <Details2 product={product} />}
      <Descriptions1 />
      <RelatedProducts />
      <Footer1 hasPaddingBottom />
    </>
  );
}
