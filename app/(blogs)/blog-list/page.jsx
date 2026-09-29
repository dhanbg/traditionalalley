import BlogDefault from "@/components/blogs/BlogDefault";
import BlogList from "@/components/blogs/BlogList";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Fashion, Culture & Heritage Blog",
  description: "Read stories, styling guides, Nepali cultural heritage insights, and traditional fashion trends from Traditional Alley.",
  alternates: {
    canonical: "/blog-list",
  },
  openGraph: {
    title: "Fashion, Culture & Heritage Blog | Traditional Alley",
    description: "Read stories, styling guides, Nepali cultural heritage insights, and traditional fashion trends from Traditional Alley.",
    url: "https://traditionalalley.com.np/blog-list",
    siteName: "Traditional Alley",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "Traditional Alley Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fashion, Culture & Heritage Blog | Traditional Alley",
    description: "Read stories, styling guides, Nepali cultural heritage insights, and traditional fashion trends from Traditional Alley.",
    images: ["/og-image.jpg"],
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
              <h3 className="heading text-center">Blogs</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    Home
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>Blogs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <BlogList />
      <Footer1 />
    </>
  );
}
