"use client";
import React, { useEffect, useState } from "react";

const sectionIds = [
  "ordering",
  "payment",
  "shipping-delivery",
  "returns-exchanges",
  "account-support",
];
const sections = [
  { id: 1, text: "Ordering", scroll: "ordering" },
  { id: 2, text: "Payment", scroll: "payment" },
  {
    id: 3,
    text: "Shipping & Delivery",
    scroll: "shipping-delivery",
  },
  {
    id: 4,
    text: "Returns & Exchanges",
    scroll: "returns-exchanges",
  },
  { id: 5, text: "Account & Support", scroll: "account-support" },
];

export default function OrdersFAQs() {
  return (
    <section className="flat-spacing-11" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="right" style={{ margin: '0 auto', maxWidth: '800px', padding: '0 20px' }}>
              <h4 className="heading" style={{ marginBottom: '30px' }}>Frequently Asked Questions</h4>
              <div className="terms-of-use-item item-scroll-target" id="ordering" style={{ marginBottom: '30px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>1. Ordering</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: How do I place an order?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Simply browse our collection, select your desired items, choose size and quantity, add to cart, and proceed to checkout. You'll need to provide shipping information and payment details to complete your order.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: Can I modify or cancel my order after placing it?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Orders can be modified or cancelled within 2 hours of placement. After this time, orders enter processing and cannot be changed. Please contact our customer service immediately if you need to make changes.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: Do I need to create an account to place an order?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: While you can checkout as a guest, creating an account allows you to track orders, save addresses, view order history, and receive exclusive offers.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: What if an item is out of stock?</strong></p>
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>A: Out of stock items will be clearly marked. You can sign up for restock notifications to be alerted when the item becomes available again.</p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="payment" style={{ marginBottom: '30px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>2. Payment</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: What payment methods do you accept?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: We accept major credit cards (Visa, MasterCard), debit cards, mobile banking, and cash on delivery (COD) for orders within Nepal.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: Is it safe to use my credit card on your website?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Yes, our website uses SSL encryption to protect your payment information. We do not store your credit card details on our servers.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: Can I pay cash on delivery?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Yes, COD is available for orders within Nepal. A small COD fee may apply depending on your location.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: What if my payment fails?</strong></p>
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>A: If your payment fails, please try again or use an alternative payment method. Contact your bank if the issue persists, or reach out to our customer service for assistance.</p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="shipping-delivery" style={{ marginBottom: '30px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>3. Shipping & Delivery</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: How long does shipping take?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Standard delivery takes 5-7 business days within Nepal. Express delivery is available for 2-3 days in major cities. Same-day delivery is available in Kathmandu Valley for orders placed before 12 PM.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: How can I track my order?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: You'll receive a tracking number via email once your order ships. You can track your package using this number on our website or the courier's website.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: What if I'm not home during delivery?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Our delivery partners will attempt delivery 2-3 times. If unsuccessful, the package will be held at the local facility for pickup, or you can reschedule delivery.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: Do you offer international shipping?</strong></p>
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>A: Yes, we ship to selected countries. International shipping takes 7-14 business days. Additional customs duties may apply depending on your country's regulations.</p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="returns-exchanges" style={{ marginBottom: '30px' }}>
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>4. Returns & Exchanges</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: What is your return policy?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: How do I return an item?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Contact our customer service to initiate a return. We'll provide a return authorization number and shipping instructions. Package the item securely and ship it back to us.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: Can I exchange an item for a different size or color?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Yes, exchanges are available subject to stock availability. The exchange process is similar to returns - contact us to initiate the exchange.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: Who pays for return shipping?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Customers are responsible for return shipping costs unless the return is due to our error (wrong item sent, defective product, etc.).</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: How long does it take to process a refund?</strong></p>
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>A: Refunds are processed within 5-7 business days after we receive and inspect your returned item. Bank processing may take additional 3-5 business days.</p>
                </div>
              </div>
              <div className="terms-of-use-item item-scroll-target" id="account-support">
                <h5 className="terms-of-use-title" style={{ marginBottom: '20px' }}>5. Account & Support</h5>
                <div className="terms-of-use-content">
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: How do I create an account?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Click on 'Sign Up' at the top of our website, provide your email address and create a password. You'll receive a confirmation email to verify your account.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: I forgot my password. How can I reset it?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: How can I contact customer service?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: You can reach us via email at support@traditionalalley.com.np, call our customer service line, or use the live chat feature on our website during business hours.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: What are your customer service hours?</strong></p>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>A: Our customer service team is available Sunday to Friday, 9 AM to 6 PM (Nepal Time). We respond to emails within 24 hours during business days.</p>
                  
                  <p style={{ marginBottom: '15px', lineHeight: '1.6' }}><strong>Q: Do you have a physical store?</strong></p>
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>A: We are primarily an online retailer, but we may have pop-up stores or participate in exhibitions. Follow our social media for updates on physical store locations and events.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}