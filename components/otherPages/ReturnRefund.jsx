"use client";
import React, { useEffect, useState } from "react";

const sectionIds = [
  "return-policy",
  "refund-policy",
  "return-process",
  "conditions",
  "processing-time",
];
const sections = [
  { id: 1, text: "Return Policy", scroll: "return-policy" },
  { id: 2, text: "Refund Policy", scroll: "refund-policy" },
  {
    id: 3,
    text: "Return Process",
    scroll: "return-process",
  },
  {
    id: 4,
    text: "Return Conditions",
    scroll: "conditions",
  },
  { id: 5, text: "Processing Time", scroll: "processing-time" },
];

export default function ReturnRefund() {
  return (
    <section className="flat-spacing-11" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="right" style={{ margin: '0 auto', maxWidth: '800px', padding: '0 20px' }}>
              <h4 className="heading" style={{ marginBottom: '30px' }}>Return & Refund Policy</h4>
              <div className="terms-of-use-item item-scroll-target" id="return-policy" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>1. Return Policy</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    At Traditional Alley, we want you to be completely satisfied with your purchase. We accept returns within 30 days of delivery for most items, provided they meet our return conditions.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    Items must be returned in their original condition, unworn, unwashed, and with all original tags attached. Custom-made or personalized items cannot be returned unless there is a manufacturing defect.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    Sale items, clearance items, and items purchased with special discounts may have different return policies. Please check the product page for specific return information.
                  </p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="refund-policy" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>2. Refund Policy</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    Once we receive and inspect your returned item, we will process your refund within 5-7 business days. Refunds will be issued to the original payment method used for the purchase.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Full Refund:</strong> Available for items returned within 30 days in original condition.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Store Credit:</strong> We may offer store credit for items that don't meet full refund criteria but are still in good condition.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    Shipping charges are non-refundable unless the return is due to our error (wrong item sent, defective product, etc.).
                  </p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="return-process" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>3. Return Process</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Step 1:</strong> Contact our customer service team at support@traditionalalley.com.np or call us to initiate a return request.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Step 2:</strong> We will provide you with a return authorization number and return shipping instructions.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Step 3:</strong> Package the item securely with the return authorization number and ship it back to us using the provided instructions.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    <strong>Step 4:</strong> Once we receive and process your return, we will notify you and issue your refund or store credit.
                  </p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="conditions" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>4. Return Conditions</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>
                    <strong>Eligible for Return:</strong>
                  </p>
                  <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '5px' }}>Items in original condition with tags attached</li>
                    <li style={{ marginBottom: '5px' }}>Unworn and unwashed clothing</li>
                    <li style={{ marginBottom: '5px' }}>Items returned within 30 days of delivery</li>
                    <li style={{ marginBottom: '0' }}>Items with original packaging and accessories</li>
                  </ul>
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>
                    <strong>Not Eligible for Return:</strong>
                  </p>
                  <ul style={{ marginBottom: '0', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '5px' }}>Custom-made or personalized items (unless defective)</li>
                    <li style={{ marginBottom: '5px' }}>Undergarments and intimate apparel</li>
                    <li style={{ marginBottom: '5px' }}>Items damaged by normal wear and tear</li>
                    <li style={{ marginBottom: '5px' }}>Items returned after 30 days</li>
                    <li style={{ marginBottom: '0' }}>Items without original tags or packaging</li>
                  </ul>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="processing-time" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>5. Processing Time</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Return Processing:</strong> 3-5 business days after we receive your returned item.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Refund Processing:</strong> 5-7 business days after return approval. Bank processing may take additional 3-5 business days.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Store Credit:</strong> Issued immediately after return approval and can be used for future purchases.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    We will send you email notifications at each step of the return and refund process to keep you informed of the status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}