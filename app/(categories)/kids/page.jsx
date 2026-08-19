import React from 'react';
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Kids from "@/components/Collections/Kids/Kids";

export const metadata = {
  title: "Kids Ethnic & Cultural Clothing Collection | Traditional Alley",
  description: "Browse our adorable kids fashion collection with comfortable, premium Nepali cultural wear, festive outfits, and traditional dresses for children at Traditional Alley.",
  alternates: {
    canonical: "/kids",
  },
  openGraph: {
    title: "Kids Ethnic & Cultural Clothing Collection | Traditional Alley",
    description: "Browse our adorable kids fashion collection with comfortable, premium Nepali cultural wear and festive outfits for children.",
    url: "https://traditionalalley.com.np/kids",
    siteName: "Traditional Alley",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Traditional Alley Kids Collection" }],
  },
};

export default function Page() {
  return (
    <>
      <Header1 />
      <Kids />
      <Footer1 />
    </>
  );
}