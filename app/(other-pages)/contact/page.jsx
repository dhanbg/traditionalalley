import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Contact2 from "@/components/otherPages/Contact2";
import React from "react";

export const metadata = {
  title: "Contact || Traditional Alley",
  description: "Traditional Alley",
};

export default function page() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d220.89288716385607!2d85.33165326745913!3d27.646615799999992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb17687d3c1077%3A0x2a49d4958a1213b2!2sJ8WJ%2BMPH%2C%20Lalitpur%2044700!5e0!3m2!1sen!2snp!4v1739266687689!5m2!1sen!2snp"
        width={600}
        height={450}
        style={{ border: 0, width: "100%" }}
        allowFullScreen=""
        loading="lazy"
      />
      <Contact2 />
      <Footer1 />
    </>
  );
}
