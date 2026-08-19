import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Terms from "@/components/otherPages/Terms";
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Use | Traditional Alley",
  description: "Read the terms of use and store conditions for shopping authentic Nepali fashion and ethnic wear at Traditional Alley.",
  alternates: {
    canonical: "/term-of-use",
  },
  openGraph: {
    title: "Terms of Use | Traditional Alley",
    description: "Read the terms of use and store conditions for shopping authentic Nepali fashion and ethnic wear at Traditional Alley.",
    url: "https://traditionalalley.com.np/term-of-use",
    siteName: "Traditional Alley",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Traditional Alley" }],
  },
};

export default function page() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
      >
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <h1 className="heading text-center">Terms of Use</h1>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    Homepage
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>
                  <a className="link" href="#">
                    Pages
                  </a>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>Terms of Use</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Terms />
      <Footer1 />
    </>
  );
}
