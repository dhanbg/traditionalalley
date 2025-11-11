"use client";
import React from "react";

const FAQ_ITEMS = [
  {
    id: "footer-accordion-1",
    question: "What countries do you ship to?",
    answer:
      "We ship worldwide. Shipping options and times vary by destination.",
  },
  {
    id: "footer-accordion-2",
    question: "What is your return and refund policy?",
    answer:
      "All products are non-refundable. We do not offer monetary refunds for any items purchased. However, we offer product exchanges only within 12 days of delivery, subject to our exchange conditions.",
  },
  {
    id: "footer-accordion-3",
    question: "How long does shipping take?",
    answer:
      "Domestic: Zone 1 (3–5 business days), Zone 2 (5–7), Zone 3 (6–8). International: Express (9–11 business days), Economy (16–21). Times exclude 1–2 business days for order processing and may vary due to remote areas or customs. Tracking is shared by email once dispatched.",
  },
  {
    id: "footer-accordion-4",
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa and Mastercard for international customers. In Nepal, we support payments through major local banks and mobile wallets. All payments are processed securely at checkout; we never store card details.",
  },
  {
    id: "footer-accordion-5",
    question: "How can I contact customer support?",
    answer:
      "Use the chat widget or email support@traditionalalley.com; we reply within 24–48 hours.",
  },
];

export default function FooterFaq() {
  return (
    <div
      className="footer-faqs container"
      style={{ marginBottom: "32px", paddingBottom: "32px" }}
    >
      <h4 className="mt-4 mb-3 text-center">FAQ</h4>
      <ul className="accordion-product-wrap style-faqs" id="footer-accordion-faq">
        {FAQ_ITEMS.map((item) => (
          <li key={item.id} className="accordion-product-item">
            <a
              className="accordion-title collapsed"
              data-bs-toggle="collapse"
              href={`#${item.id}`}
              role="button"
              aria-expanded="false"
              aria-controls={item.id}
            >
              <h6>{item.question}</h6>
              <span className="btn-open-sub" aria-hidden="true" />
            </a>
            <div
              id={item.id}
              className="collapse accordion-faqs-content"
              data-bs-parent="#footer-accordion-faq"
            >
              <div className="accordion-product-content">
                <p>{item.answer}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}