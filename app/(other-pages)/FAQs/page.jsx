import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import OrdersFAQs from "@/components/otherPages/OrdersFAQs";
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Frequently Asked Questions (FAQs)",
  description: "Find answers to frequently asked questions about orders, international shipping via DHL Express, sizing, payments, and returns at Traditional Alley.",
  alternates: {
    canonical: "/FAQs",
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQs) | Traditional Alley",
    description: "Find answers to frequently asked questions about orders, international shipping, sizing, payments, and returns at Traditional Alley.",
    url: "https://traditionalalley.com.np/FAQs",
    siteName: "Traditional Alley",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I place an order?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Browse our collection of authentic Nepali fashion, select your desired items, choose your size and quantity, add to cart, and proceed to checkout with shipping and payment details."
      }
    },
    {
      "@type": "Question",
      "name": "What international shipping options are available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We provide worldwide express shipping via DHL Express (typically 3 to 7 business days) and domestic shipping across Nepal through Nepal Can Move (1 to 3 business days)."
      }
    },
    {
      "@type": "Question",
      "name": "What payment methods are accepted?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We accept major credit and debit cards (Visa, MasterCard), mobile banking through NPS (Nepal Payment Solution), Khalti, and cash on delivery (COD) within Nepal."
      }
    },
    {
      "@type": "Question",
      "name": "What is the return and exchange policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We accept returns and exchanges of unworn, unwashed items in their original packaging with tags intact within 7 days of delivery."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer custom sizing or bespoke tailoring?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Traditional Alley offers custom sizing for traditional attire including bridal lehengas, Daura Suruwal, kurthas, and Dhaka sets. Contact our support via WhatsApp or email for custom requests."
      }
    }
  ]
};

export default function page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
      >
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <h3 className="heading text-center">Frequently Asked Questions</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href={`/`}>
                    Homepage
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>
                  <a className="link" href="#">
                    Pages
                  </a>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>FAQs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <OrdersFAQs />
      <Footer1 />
    </>
  );
}
