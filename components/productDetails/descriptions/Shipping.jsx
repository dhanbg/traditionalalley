import React from "react";

export default function Shipping() {
  return (
    <div style={{ padding: "20px", lineHeight: "1.6" }}>
      <h2 style={{ marginBottom: "20px", color: "#d4af37" }}>Shipping Information</h2>
      
      {/* Desktop Layout - Side by Side */}
      <div className="shipping-container" style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "30px", 
        padding: "20px", 
        backgroundColor: "#f9f9f9", 
        borderRadius: "8px"
      }}>
        {/* Domestic Delivery Section */}
        <section>
          <h3 style={{ marginBottom: "12px", fontSize: "16px", color: "#333" }}>Domestic Delivery</h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef" }}>
              <h4 style={{ color: "#28a745", marginBottom: "4px", fontSize: "13px" }}>Major Cities</h4>
              <p style={{ fontSize: "11px", margin: "0", color: "#666" }}>1-2 days delivery</p>
            </div>
            <div style={{ padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef" }}>
              <h4 style={{ color: "#ffc107", marginBottom: "4px", fontSize: "13px" }}>Regional Areas</h4>
              <p style={{ fontSize: "11px", margin: "0", color: "#666" }}>2-3 days delivery</p>
            </div>
            <div style={{ padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #e9ecef" }}>
              <h4 style={{ color: "#dc3545", marginBottom: "4px", fontSize: "13px" }}>Remote Areas</h4>
              <p style={{ fontSize: "11px", margin: "0", color: "#666" }}>3-5 days delivery</p>
            </div>
          </div>
          
          {/* Domestic Key Features */}
          <div style={{ marginTop: "15px" }}>
            <h4 style={{ marginBottom: "8px", fontSize: "14px", color: "#555" }}>Key Features</h4>
            <ul style={{ paddingLeft: "16px", margin: "0", fontSize: "12px" }}>
              <li style={{ marginBottom: "4px" }}>Nationwide coverage to all 77 districts</li>
              <li style={{ marginBottom: "4px" }}>Real-time tracking with SMS notifications</li>
              <li style={{ marginBottom: "0" }}>Secure packaging and insurance coverage</li>
            </ul>
          </div>
        </section>



        {/* International Delivery Section */}
        <section>
          <h3 style={{ marginBottom: "12px", fontSize: "16px", color: "#333" }}>International Delivery</h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ padding: "10px", border: "1px solid #e0e0e0", borderRadius: "6px", backgroundColor: "#fff" }}>
              <h4 style={{ color: "#d4af37", marginBottom: "4px", fontSize: "13px" }}>Express Service</h4>
              <p style={{ fontSize: "11px", margin: "0", color: "#666" }}>5-6 days • Premium delivery</p>
            </div>
            <div style={{ padding: "10px", border: "1px solid #e0e0e0", borderRadius: "6px", backgroundColor: "#fff" }}>
              <h4 style={{ color: "#d4af37", marginBottom: "4px", fontSize: "13px" }}>Economy Service</h4>
              <p style={{ fontSize: "11px", margin: "0", color: "#666" }}>10-15 days • Cost-effective</p>
            </div>
          </div>
          
          {/* International Key Features */}
          <div style={{ marginTop: "15px" }}>
            <h4 style={{ marginBottom: "8px", fontSize: "14px", color: "#555" }}>International Features</h4>
            <ul style={{ paddingLeft: "16px", margin: "0", fontSize: "12px" }}>
              <li style={{ marginBottom: "4px" }}>Global tracking with real-time updates</li>
              <li style={{ marginBottom: "4px" }}>Customs clearance assistance</li>
              <li style={{ marginBottom: "4px" }}>Door-to-door delivery service</li>
              <li style={{ marginBottom: "4px" }}>SMS & email delivery notifications</li>
              <li style={{ marginBottom: "0" }}>Secure handling of fragile items</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Mobile Layout - Stacked */}
       <style jsx>{`
         @media (max-width: 768px) {
           .shipping-container {
             gap: 20px !important;
           }
           .shipping-container section > div {
             flex-direction: column !important;
           }
         }
       `}</style>
    </div>
  );
}
