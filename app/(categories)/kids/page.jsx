import React from 'react'
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Kids from "@/components/Collections/Kids/Kids";

export const metadata = {
  title: "Kids Fashion Collection | Traditional Alley",
  description: "Browse our adorable kids fashion collection with comfortable and stylish clothing for children. Shop quality kids wear at Traditional Alley.",
};

export default function Page() {
  return (
    <>
      <Header1 />
      <Kids />
      <Footer1 />
    </>
  )
}