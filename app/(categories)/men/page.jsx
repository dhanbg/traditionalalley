import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";
import Men from "@/components/Collections/Men/Men";

export const metadata = {
  title: "Men's Fashion Collection | Traditional Alley",
  description: "Explore our premium men's fashion collection with traditional and contemporary clothing. Shop shirts, pants, jackets and accessories at Traditional Alley.",
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
