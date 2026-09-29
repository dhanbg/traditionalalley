import React from "react";
import Topbar6 from "@/components/headers/Topbar6";
import Header1 from "@/components/headers/Header1";
import ReturnRefund from "@/components/otherPages/ReturnRefund";
import Footer1 from "@/components/footers/Footer1";

export const metadata = {
  title: "Return & Refund Policy",
  description: "Learn about our return, refund, and exchange policies for authentic Nepali clothing at Traditional Alley.",
  alternates: {
    canonical: "/return-refund",
  },
  openGraph: {
    title: "Return & Refund Policy | Traditional Alley",
    description: "Learn about our return, refund, and exchange policies for authentic Nepali clothing at Traditional Alley.",
    url: "https://traditionalalley.com.np/return-refund",
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
              <h3 className="heading text-center">Return & Refund</h3>
            </div>
          </div>
        </div>
      </div>
      <ReturnRefund />
      <Footer1 />
    </>
  );
}
