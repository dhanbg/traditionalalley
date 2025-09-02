import React from "react";
import Topbar6 from "@/components/headers/Topbar6";
import Header1 from "@/components/headers/Header1";
import OrdersFAQs from "@/components/otherPages/OrdersFAQs";
import Footer1 from "@/components/footers/Footer1";

export const metadata = {
  title: "Orders FAQs | Traditional Alley",
  description: "Frequently asked questions about orders, shipping, and returns at Traditional Alley.",
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
              <h3 className="heading text-center">Orders FAQs</h3>
            </div>
          </div>
        </div>
      </div>
      <OrdersFAQs />
      <Footer1 />
    </>
  );
}