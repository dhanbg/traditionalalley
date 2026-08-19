import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";
import Women from "@/components/Collections/Women/Women";

export const metadata = {
  title: "Women's Ethnic & Traditional Fashion Collection | Traditional Alley",
  description: "Discover our exclusive women's fashion collection featuring authentic Nepali traditional clothing, lehengas, kurthas, sarees, and modern ethnic outfits. Worldwide shipping.",
  alternates: {
    canonical: "/women",
  },
  openGraph: {
    title: "Women's Ethnic & Traditional Fashion Collection | Traditional Alley",
    description: "Discover our exclusive women's fashion collection featuring authentic Nepali traditional clothing, lehengas, kurthas, sarees, and modern ethnic outfits.",
    url: "https://traditionalalley.com.np/women",
    siteName: "Traditional Alley",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Traditional Alley Women Collection" }],
  },
};

export default function page() {
  return (
    <>
      <Header1 />
      <Women />
      <Footer1 />
    </>
  );
}
