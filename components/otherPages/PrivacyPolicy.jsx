"use client";
import React, { useEffect, useState } from "react";

const sectionIds = [
  "information-collection",
  "information-use",
  "information-sharing",
  "data-security",
  "cookies",
  "user-rights",
];
const sections = [
  { id: 1, text: "Information Collection", scroll: "information-collection" },
  { id: 2, text: "Information Use", scroll: "information-use" },
  {
    id: 3,
    text: "Information Sharing",
    scroll: "information-sharing",
  },
  {
    id: 4,
    text: "Data Security",
    scroll: "data-security",
  },
  { id: 5, text: "Cookies Policy", scroll: "cookies" },
  { id: 6, text: "Your Rights", scroll: "user-rights" },
];

export default function PrivacyPolicy() {
  return (
    <section className="flat-spacing-11" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="right" style={{ margin: '0 auto', maxWidth: '800px', padding: '0 20px' }}>
              <h4 className="heading" style={{ marginBottom: '30px' }}>Privacy Policy</h4>
              <div className="terms-of-use-item item-scroll-target" id="information-collection" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>1. Information We Collect</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    At Traditional Alley, we collect information to provide better services to our customers. We collect information in the following ways:
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Personal Information:</strong> When you create an account, make a purchase, or contact us, we may collect personal information such as your name, email address, phone number, shipping address, and payment information.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Automatically Collected Information:</strong> We automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and pages viewed.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    <strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies to enhance your browsing experience and analyze website usage.
                  </p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="information-use" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>2. How We Use Your Information</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    We use the information we collect for various purposes, including:
                  </p>
                  <ul style={{ marginBottom: '0', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '5px' }}>Processing and fulfilling your orders</li>
                    <li style={{ marginBottom: '5px' }}>Providing customer support and responding to inquiries</li>
                    <li style={{ marginBottom: '5px' }}>Sending order confirmations, shipping updates, and other transactional communications</li>
                    <li style={{ marginBottom: '5px' }}>Improving our website, products, and services</li>
                    <li style={{ marginBottom: '5px' }}>Personalizing your shopping experience</li>
                    <li style={{ marginBottom: '5px' }}>Sending promotional emails and marketing communications (with your consent)</li>
                    <li style={{ marginBottom: '5px' }}>Preventing fraud and ensuring website security</li>
                    <li style={{ marginBottom: '0' }}>Complying with legal obligations</li>
                  </ul>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="information-sharing" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>3. Information Sharing</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Service Providers:</strong> We may share information with trusted third-party service providers who help us operate our business, such as payment processors, shipping companies, and email service providers.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Legal Requirements:</strong> We may disclose information when required by law, court order, or government request, or to protect our rights, property, or safety.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, customer information may be transferred as part of the transaction.
                  </p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="data-security" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>4. Data Security</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Encryption:</strong> We use SSL encryption to protect sensitive information during transmission.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Access Controls:</strong> We limit access to personal information to employees and contractors who need it to perform their job functions.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Regular Updates:</strong> We regularly update our security measures and monitor for potential vulnerabilities.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="cookies" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>5. Cookies Policy</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    We use cookies and similar tracking technologies to improve your browsing experience. Cookies are small text files stored on your device that help us:
                  </p>
                  <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '5px' }}>Remember your preferences and settings</li>
                    <li style={{ marginBottom: '5px' }}>Keep you logged in to your account</li>
                    <li style={{ marginBottom: '5px' }}>Analyze website traffic and usage patterns</li>
                    <li style={{ marginBottom: '5px' }}>Provide personalized content and recommendations</li>
                    <li style={{ marginBottom: '0' }}>Enable social media features</li>
                  </ul>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our website.
                  </p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="user-rights" style={{ marginBottom: '40px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>6. Your Rights</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    You have certain rights regarding your personal information:
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Access:</strong> You can request access to the personal information we hold about you.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Correction:</strong> You can request correction of inaccurate or incomplete information.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Deletion:</strong> You can request deletion of your personal information, subject to certain legal obligations.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Opt-out:</strong> You can opt-out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us directly.
                  </p>
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                    <strong>Data Portability:</strong> You can request a copy of your personal information in a structured, machine-readable format.
                  </p>
                  <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                    To exercise these rights, please contact us at contact@traditionalalley.com.np. We will respond to your request within a reasonable timeframe.
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