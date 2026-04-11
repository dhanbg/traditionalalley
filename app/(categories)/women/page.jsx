import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";
import Women from "@/components/Collections/Women/Women";

export const metadata = {
  title: "Women's Fashion Collection | Traditional Alley",
  description: "Discover our exclusive women's fashion collection featuring traditional and modern clothing. Shop dresses, tops, bottoms and accessories at Traditional Alley.",
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
