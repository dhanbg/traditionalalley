import React, { Suspense } from "react";
import Collections from "@/components/Collections/Women/Collections";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import Topbar6 from "@/components/headers/Topbar6";

export const metadata = {
  title: "All Collections | Traditional Alley - Nepali Ethnic & Traditional Wear",
  description: "Browse all fashion collections at Traditional Alley. Discover authentic Nepali dresses, Dhaka clothing, bridal lehengas, kurthas, daura suruwal, and contemporary ethnic styles.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "All Collections | Traditional Alley - Nepali Ethnic & Traditional Wear",
    description: "Browse all fashion collections at Traditional Alley. Discover authentic Nepali dresses, Dhaka clothing, bridal lehengas, kurthas, and daura suruwal.",
    url: "https://traditionalalley.com.np/collections",
    siteName: "Traditional Alley",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Traditional Alley Collections" }],
  },
};

export default function CollectionsPage() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div className="tf-page-title">
        <div className="container-full">
          <h1 className="heading text-center">All Collections</h1>
        </div>
        <Suspense fallback={<div className="text-center py-5">Loading collections...</div>}>
          <Collections />
        </Suspense>
      </div>
      <Footer1 />
    </>
  );
}
