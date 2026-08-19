import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Link from "next/link";
import Topbar6 from "@/components/headers/Topbar6";
import About from "@/components/otherPages/About";
import Team from "@/components/otherPages/Team";
import Testimonials from "@/components/otherPages/Testimonials";
import React from "react";

export const metadata = {
  title: "About Us | Traditional Alley - Authentic Nepali Ethnic Wear",
  description: "Learn about Traditional Alley, Nepal's premier traditional clothing brand. Discover our heritage, craftsmanship, and commitment to authentic Nepali fashion and worldwide delivery.",
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    title: "About Us | Traditional Alley - Authentic Nepali Ethnic Wear",
    description: "Learn about Traditional Alley, Nepal's premier traditional clothing brand. Discover our heritage, craftsmanship, and commitment to authentic Nepali fashion.",
    url: "https://traditionalalley.com.np/about-us",
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
        style={{ 
          backgroundImage: "url(/images/section/page-title.jpg)",
          height: "250px",
          minHeight: "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div className="container-full" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%"
        }}>
          <div className="row">
            <div className="col-12">
              <h1 className="heading text-center">About Our Store</h1>
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
                <li>About Our Store</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <About />
      <Team />
      <Testimonials />
      <Footer1 />
    </>
  );
}
