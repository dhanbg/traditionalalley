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
  { id: 1, text: "Exchange Policy", scroll: "return-policy" },
  { id: 2, text: "No Refund Policy", scroll: "refund-policy" },
  {
    id: 3,
    text: "Exchange Process",
    scroll: "return-process",
  },
  {
    id: 4,
    text: "Exchange Conditions",
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
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>1. Exchange Policy</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Important Notice:</strong> All products sold at Traditional Alley are <strong>non-refundable</strong>. We do not offer monetary refunds for any items purchased.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    However, we understand that sometimes you may need a different size or have concerns about your purchase. We offer <strong>product exchanges only</strong> under specific conditions and timeframes.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Exchange Eligibility:</strong> You must inform us of your exchange request within <strong>12 days</strong> of receiving your order. After this 12-day period, no exchanges will be accepted under any circumstances.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    All exchange requests must be initiated by contacting our customer service team. Items must be in their original condition, unworn, unwashed, and with all original tags attached.
                  </p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="refund-policy" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>2. No Refund Policy</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>No Monetary Refunds:</strong> Traditional Alley operates under a strict no-refund policy. We do not provide monetary refunds for any products purchased, regardless of the reason.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Exchange Only:</strong> Instead of refunds, we offer product exchanges for items of equal or lesser value, subject to availability and our exchange conditions.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Defective Products:</strong> In the rare case of manufacturing defects or shipping damage, we will provide a replacement item of the same product, not a monetary refund.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    <strong>Final Sale:</strong> All purchases are considered final sales. Please ensure you are satisfied with your selection before completing your purchase.
                  </p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="return-process" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>3. Exchange Process</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Step 1:</strong> Contact our customer service team at support@traditionalalley.com.np within <strong>12 days</strong> of receiving your order to initiate an exchange request.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Step 2:</strong> Provide your order number, item details, and reason for exchange. We will verify your eligibility and provide exchange authorization if approved.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Step 3:</strong> Package the item securely in its original condition with all tags attached, and ship it back to us using the provided instructions.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    <strong>Step 4:</strong> Once we receive and inspect your item, we will process the exchange and send you the replacement item, subject to availability.
                  </p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="conditions" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>4. Exchange Conditions</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>
                    <strong>Eligible for Exchange:</strong>
                  </p>
                  <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '5px' }}>Exchange request initiated within <strong>12 days</strong> of delivery</li>
                    <li style={{ marginBottom: '5px' }}>Items in original condition with all tags attached</li>
                    <li style={{ marginBottom: '5px' }}>Unworn, unwashed, and undamaged clothing</li>
                    <li style={{ marginBottom: '5px' }}>Items with original packaging and accessories</li>
                    <li style={{ marginBottom: '0' }}>Replacement item available in stock</li>
                  </ul>
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>
                    <strong>Not Eligible for Exchange:</strong>
                  </p>
                  <ul style={{ marginBottom: '0', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '5px' }}>Requests made after the 12-day deadline</li>
                    <li style={{ marginBottom: '5px' }}>Custom-made or personalized items</li>
                    <li style={{ marginBottom: '5px' }}>Undergarments and intimate apparel</li>
                    <li style={{ marginBottom: '5px' }}>Items damaged by customer use</li>
                    <li style={{ marginBottom: '5px' }}>Items without original tags or packaging</li>
                    <li style={{ marginBottom: '0' }}>Sale or clearance items (unless defective)</li>
                  </ul>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="processing-time" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>5. Processing Time</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Exchange Request Review:</strong> 1-2 business days to review and approve your exchange request after contact.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Item Inspection:</strong> 3-5 business days after we receive your returned item to inspect and verify its condition.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Replacement Shipping:</strong> 2-3 business days to process and ship your replacement item after approval.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    <strong>Total Exchange Time:</strong> Typically 7-10 business days from the time we receive your item until you receive the replacement. We will send you email notifications at each step to keep you informed of the status.
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