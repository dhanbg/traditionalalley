import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Contact2 from "@/components/otherPages/Contact2";
import React from "react";

export const metadata = {
  title: "Contact Traditional Alley Boutique Lalitpur | Authentic Nepali Clothing Store",
  description: "Visit Traditional Alley store in Hattiban, Lalitpur, Nepal or contact us online. Nepali traditional dress, Daura Suruwal, Dhaka sets, bridal wear, custom tailoring & worldwide delivery. Call +977-9844594187.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Traditional Alley Boutique Lalitpur | Authentic Nepali Clothing Store",
    description: "Visit Traditional Alley store in Hattiban, Lalitpur, Nepal. Authentic Nepali traditional dresses, Dhaka clothing, custom tailoring, and worldwide shipping.",
    url: "https://traditionalalley.com.np/contact",
    siteName: "Traditional Alley",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "Traditional Alley Store Lalitpur" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Traditional Alley Boutique Lalitpur | Authentic Nepali Clothing Store",
    description: "Visit Traditional Alley store in Hattiban, Lalitpur, Nepal. Authentic Nepali traditional dresses, Dhaka clothing, custom tailoring, and worldwide shipping.",
    images: ["/og-image.jpg"],
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://traditionalalley.com.np/contact#webpage",
  url: "https://traditionalalley.com.np/contact",
  name: "Contact Traditional Alley Boutique",
  description: "Store location, customer support, and order inquiries for Traditional Alley in Lalitpur, Nepal.",
  mainEntity: {
    "@type": "ClothingStore",
    "@id": "https://traditionalalley.com.np/#organization",
    name: "Traditional Alley",
    image: "https://traditionalalley.com.np/logo.png",
    telephone: "+977-9844594187",
    email: "contact@traditionalalley.com.np",
    priceRange: "$$",
    currenciesAccepted: "NPR, USD",
    paymentAccepted: "Cash, Credit Card, Debit Card, eSewa, Khalti, Bank Transfer, Visa, MasterCard",
    hasMap: "https://www.google.com/maps?cid=3047248882064954290",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "10:00",
        "closes": "19:00"
      }
    ],
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
    areaServed: ["Lalitpur", "Kathmandu", "Bhaktapur", "Nepal", "United States", "Australia", "United Kingdom", "Canada"],
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
