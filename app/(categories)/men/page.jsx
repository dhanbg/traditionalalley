import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";
import Men from "@/components/Collections/Men/Men";

export const metadata = {
  title: "Men's Nepali Fashion & Traditional Attire | Traditional Alley",
  description: "Explore our premium men's collection featuring authentic Nepali Daura Suruwal, Dhaka coats, ethnic blazers, and contemporary styles. Shop quality menswear at Traditional Alley.",
  alternates: {
    canonical: "/men",
  },
  openGraph: {
    title: "Men's Nepali Fashion & Traditional Attire | Traditional Alley",
    description: "Explore our premium men's collection featuring authentic Nepali Daura Suruwal, Dhaka coats, ethnic blazers, and contemporary styles.",
    url: "https://traditionalalley.com.np/men",
    siteName: "Traditional Alley",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Traditional Alley Men Collection" }],
  },
};

export default function page() {
  return (
    <>
      <Header1 />
      <Men />
      <Footer1 />
    </>
  );
}
