import React from "react";
import Topbar6 from "@/components/headers/Topbar6";
import Header1 from "@/components/headers/Header1";
import PrivacyPolicy from "@/components/otherPages/PrivacyPolicy";
import Footer1 from "@/components/footers/Footer1";

export const metadata = {
  title: "Privacy Policy | Traditional Alley",
  description: "Learn about our privacy policy and how we protect your personal information at Traditional Alley.",
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
              <h3 className="heading text-center">Privacy Policy</h3>
            </div>
          </div>
        </div>
      </div>
      <PrivacyPolicy />
      <Footer1 />
    </>
  );
}
