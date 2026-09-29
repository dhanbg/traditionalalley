import React from "react";
import Topbar6 from "@/components/headers/Topbar6";
import Header1 from "@/components/headers/Header1";
import Shipping from "@/components/otherPages/Shipping";
import Footer1 from "@/components/footers/Footer1";

export const metadata = {
  title: "Shipping & Delivery Information",
  description: "Learn about worldwide delivery via DHL Express and domestic shipping across Nepal with Nepal Can Move at Traditional Alley.",
  alternates: {
    canonical: "/shipping",
  },
  openGraph: {
    title: "Shipping & Delivery Information | Traditional Alley",
    description: "Learn about worldwide delivery via DHL Express and domestic shipping across Nepal with Nepal Can Move at Traditional Alley.",
    url: "https://traditionalalley.com.np/shipping",
    siteName: "Traditional Alley",
  },
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