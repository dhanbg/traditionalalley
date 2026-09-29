import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Contact2 from "@/components/otherPages/Contact2";
import React from "react";

export const metadata = {
  title: "Contact Us - Customer Support & Inquiries",
  description: "Get in touch with Traditional Alley. Reach out for custom sizing inquiries, order support, and wholesale questions. Located in Lalitpur, Nepal with worldwide delivery.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Traditional Alley - Customer Support & Inquiries",
    description: "Get in touch with Traditional Alley. Reach out for custom sizing inquiries, order support, and wholesale questions.",
    url: "https://traditionalalley.com.np/contact",
    siteName: "Traditional Alley",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Traditional Alley" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Traditional Alley - Customer Support & Inquiries",
    description: "Get in touch with Traditional Alley. Reach out for custom sizing inquiries, order support, and wholesale questions.",
    images: ["/logo.png"],
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://traditionalalley.com.np/contact#webpage",
  url: "https://traditionalalley.com.np/contact",
  name: "Contact Traditional Alley",
  description: "Customer support, order inquiries, and wholesale questions for Traditional Alley.",
  mainEntity: {
    "@type": "LocalBusiness",
    name: "Traditional Alley",
    telephone: "+977-9844594187",
    email: "contact@traditionalalley.com.np",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hattiban",
      addressLocality: "Lalitpur",
      addressRegion: "Bagmati",
      postalCode: "44700",
      addressCountry: "NP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 27.6466158,
      longitude: 85.3316533,
    },
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://traditionalalley.com.np",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact",
        item: "https://traditionalalley.com.np/contact",
      },
    ],
  },
};

export default function page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d220.89288716385607!2d85.33165326745913!3d27.646615799999992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb17687d3c1077%3A0x2a49d4958a1213b2!2sJ8WJ%2BMPH%2C%20Lalitpur%2044700!5e0!3m2!1sen!2snp!4v1739266687689!5m2!1sen!2snp"
        width={600}
        height={450}
        style={{ border: 0, width: "100%" }}
        allowFullScreen=""
        loading="lazy"
        title="Traditional Alley Store Location"
      />
      <Contact2 />
      <Footer1 />
    </>
  );
}
