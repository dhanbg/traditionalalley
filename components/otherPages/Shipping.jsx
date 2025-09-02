"use client";
import React, { useState, useEffect } from "react";
import { getDomesticShippingRates, getDomesticShippingZones } from '../../utils/domestic-shipping';

export default function Shipping() {
  return (
    <section className="flat-spacing-11" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
        <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <section className="shipping-policy" style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>Shipping Policy</h2>
            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
              We are committed to providing reliable and efficient shipping services to our customers worldwide. 
              Our shipping policy ensures transparency and helps you understand our delivery process with the highest satisfaction and promptness.
            </p>
          </section>

          <section className="domestic-delivery" style={{ marginBottom: '40px' }}>
            
            <div className="delivery-zones" style={{ marginTop: '30px' }}>
              <h3 style={{ marginBottom: '20px' }}>Domestic Delivery Coverage Zones</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ color: '#28a745', marginBottom: '8px' }}>Zone 1 - Major Cities</h4>
                  <p style={{ fontSize: '14px', marginBottom: '8px', lineHeight: '1.5' }}>Kathmandu, Pokhara, Lalitpur, Bhaktapur</p>
                  <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Delivery: 1-2 days</span>
                </div>
                
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ color: '#ffc107', marginBottom: '8px' }}>Zone 2 - Regional Centers</h4>
                  <p style={{ fontSize: '14px', marginBottom: '8px', lineHeight: '1.5' }}>Chitwan, Butwal, Dharan, Biratnagar, Nepalgunj</p>
                  <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Delivery: 2-3 days</span>
                </div>
                
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h4 style={{ color: '#dc3545', marginBottom: '8px' }}>Zone 3 - Remote Areas</h4>
                  <p style={{ fontSize: '14px', marginBottom: '8px', lineHeight: '1.5' }}>Karnali Province, Far Western Province, Mountain Districts</p>
                  <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Delivery: 3-5 days</span>
                </div>
              </div>
            </div>
          </section>
          
          <section className="delivery-options" style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>International Delivery Options</h2>
            <p style={{ marginBottom: '25px', fontStyle: 'italic', color: '#666', lineHeight: '1.6' }}>The following delivery options are available for international shipping only:</p>
            <div className="delivery-types" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div className="express-delivery" style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '10px' }}>International Express Courier</h3>
                <p style={{ marginBottom: '10px' }}>Premium and faster international delivery option for urgent shipments like documents, samples, or small parcels.</p>
                <div style={{ padding: '8px 12px', backgroundColor: '#e8f5e8', borderRadius: '4px', marginBottom: '10px' }}>
                  <strong style={{ color: '#28a745' }}>Delivery Time: 5-6 days</strong>
                </div>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <li>Reliable and secure door-to-door delivery</li>
                  <li>Ideal for time-sensitive shipments</li>
                  <li>Real-time tracking available</li>
                </ul>
              </div>
              <div className="economy-delivery" style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '10px' }}>International Economy Courier</h3>
                <p style={{ marginBottom: '10px' }}>Cost-effective international shipping solution where urgency takes a backseat to cost efficiency.</p>
                <div style={{ padding: '8px 12px', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '10px' }}>
                  <strong style={{ color: '#856404' }}>Delivery Time: 10-15 days</strong>
                </div>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <li>Affordable pricing for standard shipments</li>
                  <li>Consolidated shipping routes for cost savings</li>
                  <li>Reliable delivery with standard transit times</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="shipping-charges" style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>Shipping Charges</h2>
            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
              Shipping rates depend on various factors such as package weight, dimensions after packaging, size, and destination country.
            </p>
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h4>Pricing Factors:</h4>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                <li>Package weight and dimensions</li>
                <li>Destination country and location</li>
                <li>Service type (Express vs Economy)</li>
                <li>Shipping method (Air, Land, or Sea freight)</li>
              </ul>
              <p style={{ marginTop: '10px', fontStyle: 'italic' }}>Contact us for accurate pricing based on your specific requirements.</p>
            </div>
          </section>

          <section className="domestic-features" style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>Why Choose Our Delivery</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '25px' }}>
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>🚚</div>
                <h4 style={{ marginBottom: '10px', color: '#d4af37' }}>Nationwide Coverage</h4>
                <p style={{ lineHeight: '1.6', margin: '0', fontSize: '14px' }}>Delivery to all 77 districts of Nepal, including remote mountainous regions and rural areas.</p>
              </div>
              

              
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>📱</div>
                <h4 style={{ marginBottom: '10px', color: '#d4af37' }}>Real-time Tracking</h4>
                <p style={{ lineHeight: '1.6', margin: '0', fontSize: '14px' }}>Advanced tracking system with SMS notifications at every delivery milestone.</p>
              </div>
              
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>🛡️</div>
                <h4 style={{ marginBottom: '10px', color: '#d4af37' }}>Secure Handling</h4>
                <p style={{ lineHeight: '1.6', margin: '0', fontSize: '14px' }}>Professional packaging and careful handling with insurance coverage for valuable items.</p>
              </div>
            </div>
            

          </section>
          



        </div>
          </div>
        </div>
      </div>
    </section>
  );
}