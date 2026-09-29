"use client";
import React, { useState } from "react";
import Link from "next/link";

const CATEGORY_FAQS = {
  women: {
    heading: "Women's Traditional Nepali Fashion Guide & FAQs",
    subheading: "Everything you need to know about our handcrafted ethnic wear, custom sizing, and international delivery.",
    description:
      "Traditional Alley is dedicated to preserving Nepal's rich textile heritage through contemporary women's fashion. Our women's collection highlights handwoven Palpali Dhaka, luxurious velvet, pure silk, and fine embroidery crafted into elegant Dhaka corsets, classic Kurtha Suruwal sets, majestic bridal lehengas, and fusion party wear. Each piece is designed for celebratory comfort, cultural authenticity, and enduring elegance.",
    items: [
      {
        id: "women-faq-1",
        question: "What types of authentic Nepali women's clothing does Traditional Alley offer?",
        answer:
          "Traditional Alley offers a versatile range of authentic Nepali garments, including handwoven Dhaka corsets and crop tops, classic and modern Kurtha Suruwal sets, bridal and reception lehengas, ethnic sarees, designer gowns, and contemporary co-ord sets. All items are made using genuine Nepali textiles and artisan craftsmanship.",
      },
      {
        id: "women-faq-2",
        question: "Can I request custom measurements or bespoke sizing for dresses and lehengas?",
        answer:
          "Yes! We provide made-to-measure custom tailoring for all our women's outfits. You can submit your exact bust, waist, hip, and length measurements through our Custom Order option or WhatsApp support (+977-9844594187) for a tailored bespoke fit.",
      },
      {
        id: "women-faq-3",
        question: "How should I care for handcrafted Dhaka and velvet garments?",
        answer:
          "Because authentic Nepali Dhaka and embroidered velvet feature delicate handwoven threads and metallic zari work, we recommend professional dry cleaning. For light storage, keep garments in breathable cotton bags away from direct moisture and sunlight.",
      },
      {
        id: "women-faq-4",
        question: "Do you offer international shipping for weddings and cultural events abroad?",
        answer:
          "Yes, we ship worldwide via DHL Express to the United States, Australia, United Kingdom, Canada, Europe, Japan, and the Middle East. Express delivery typically arrives within 12 to 15 business days with end-to-end tracking provided upon dispatch.",
      },
    ],
  },
  men: {
    heading: "Men's Nepali Traditional Attire Guide & FAQs",
    subheading: "Complete information on Daura Suruwal sets, Dhaka coats, groom attire, and bespoke tailoring.",
    description:
      "Celebrate Nepali national pride and timeless elegance with Traditional Alley's men's collection. Handcrafted from premium fabrics, our Daura Suruwal, heritage Dhaka coats, and modern ethnic blazers offer refined structure and distinguished cultural appeal. Whether you're dressing for a traditional Nepali wedding (Bihabhoj), Bratabandha, graduation ceremony, or festive gathering, our garments ensure unmatched dignity and comfort.",
    items: [
      {
        id: "men-faq-1",
        question: "What pieces are included in a complete Nepali Daura Suruwal set?",
        answer:
          "A classic men's Nepali traditional ensemble consists of the Daura (the traditional double-breasted upper wrap shirt with eight cords), the Suruwal (tapered trousers), and an outer Dhaka waistcoat or coat. You can also pair it with an authentic Dhaka Topi for complete ceremonial attire.",
      },
      {
        id: "men-faq-2",
        question: "Can I order groom or groomsmen attire for a Nepali wedding outside Nepal?",
        answer:
          "Absolutely! Many of our wedding customers order from the US, UK, Australia, and Canada. We specialize in coordinated groom attire, matching groomsmen sets, and custom color themes with guaranteed international delivery via DHL Express.",
      },
      {
        id: "men-faq-3",
        question: "How do I choose the correct size for a Daura Suruwal?",
        answer:
          "We offer standard sizes from XS to XXL based on chest circumference and height. For the sharpest fit, you can also send us your chest, waist, shoulder width, arm length, and height, and our master tailors in Lalitpur will craft a customized fit.",
      },
      {
        id: "men-faq-4",
        question: "How fast is delivery for international orders?",
        answer:
          "Standard order processing takes 2 to 3 business days, followed by DHL Express international transit of 12 to 15 business days. We recommend ordering at least 3 to 4 weeks prior to your scheduled event date.",
      },
    ],
  },
};

export default function CategoryFaq({ type = "women" }) {
  const content = CATEGORY_FAQS[type] || CATEGORY_FAQS.women;
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (id) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <section className="flat-spacing" style={{ backgroundColor: "#fbf9f6", marginTop: "40px", padding: "60px 0" }}>
      <div className="container">
        {/* SEO Header & Topical Guide */}
        <div className="row justify-content-center text-center mb_30">
          <div className="col-lg-10">
            <h2 className="heading mb_16" style={{ fontSize: "28px", fontWeight: "600" }}>
              {content.heading}
            </h2>
            <p className="text-secondary mb_24" style={{ fontSize: "16px", maxWidth: "800px", margin: "0 auto" }}>
              {content.subheading}
            </p>
            <div
              className="text-secondary-2"
              style={{
                fontSize: "14px",
                lineHeight: "1.75",
                backgroundColor: "#ffffff",
                padding: "24px 30px",
                borderRadius: "12px",
                border: "1px solid #ebe5df",
                textAlign: "left",
                marginBottom: "32px",
              }}
            >
              <p style={{ margin: 0 }}>{content.description}</p>
            </div>
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h3 className="text-title mb_20 text-center" style={{ fontSize: "20px" }}>
              Frequently Asked Questions
            </h3>
            <ul className="accordion-product-wrap style-faqs" style={{ borderTop: "1px solid #e5e5e5" }}>
              {content.items.map((item) => {
                const isOpen = openItem === item.id;
                return (
                  <li key={item.id} className="accordion-product-item" style={{ borderBottom: "1px solid #e5e5e5" }}>
                    <button
                      type="button"
                      className={`accordion-title ${isOpen ? "" : "collapsed"}`}
                      onClick={() => toggleItem(item.id)}
                      aria-expanded={isOpen}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "18px 0",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <h4 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#181818" }}>
                        {item.question}
                      </h4>
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: "300",
                          transform: isOpen ? "rotate(45deg)" : "none",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div className="accordion-product-content" style={{ padding: "0 0 18px 0", color: "#666" }}>
                        <p style={{ fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{item.answer}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Quick Links Cross-Navigation */}
            <div className="text-center mt_40">
              <Link href="/collections" className="tf-btn btn-fill" style={{ marginRight: "12px" }}>
                <span className="text text-button">Browse All Collections</span>
              </Link>
              <Link href="/contact" className="tf-btn btn-line">
                <span className="text text-button">Custom Order Inquiries</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
