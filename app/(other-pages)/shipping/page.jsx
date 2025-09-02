import React from "react";
import Topbar6 from "@/components/headers/Topbar6";
import Header1 from "@/components/headers/Header1";
import Shipping from "@/components/otherPages/Shipping";
import Footer1 from "@/components/footers/Footer1";

export const metadata = {
  title: "Shipping | Traditional Alley",
  description: "Learn about our shipping policies and delivery options at Traditional Alley.",
};

export default function page() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div className="page-title">
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <h3 className="heading text-center">Shipping</h3>
            </div>
          </div>
        </div>
      </div>
      <Shipping />
      <Footer1 />
    </>
  );
}