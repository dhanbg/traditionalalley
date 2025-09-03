import React from "react";

export default function Shipping() {
  return (
    <div style={{ padding: "20px", lineHeight: "1.6" }}>
      <h2 style={{ marginBottom: "20px", color: "#d4af37" }}>Shipping</h2>
      
      <section style={{ marginBottom: "30px" }}>
        <p style={{ marginBottom: "15px", lineHeight: "1.6" }}>
          We are committed to providing reliable and efficient shipping services to our customers worldwide. 
          Our shipping policy ensures transparency and helps you understand our delivery process with the highest satisfaction and promptness.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px" }}>Domestic Delivery Coverage Zones</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px", marginBottom: "20px" }}>
          <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
            <h4 style={{ color: "#28a745", marginBottom: "8px" }}>Zone 1 - Major Cities</h4>
            <p style={{ fontSize: "14px", marginBottom: "8px", lineHeight: "1.5" }}>Kathmandu, Pokhara, Lalitpur, Bhaktapur</p>
            <span style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>Delivery: 1-2 days</span>
          </div>
          
          <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
            <h4 style={{ color: "#ffc107", marginBottom: "8px" }}>Zone 2 - Regional Centers</h4>
            <p style={{ fontSize: "14px", marginBottom: "8px", lineHeight: "1.5" }}>Chitwan, Butwal, Dharan, Biratnagar, Nepalgunj</p>
            <span style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>Delivery: 2-3 days</span>
          </div>
          
          <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
            <h4 style={{ color: "#dc3545", marginBottom: "8px" }}>Zone 3 - Remote Areas</h4>
            <p style={{ fontSize: "14px", marginBottom: "8px", lineHeight: "1.5" }}>Karnali Province, Far Western Province, Mountain Districts</p>
            <span style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>Delivery: 3-5 days</span>
          </div>
        </div>
      </section>
      
      <section style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px" }}>International Delivery Options</h3>
        <p style={{ marginBottom: "20px", fontStyle: "italic", color: "#666", lineHeight: "1.6" }}>The following delivery options are available for international shipping only:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ padding: "20px", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
            <h4 style={{ color: "#d4af37", marginBottom: "10px" }}>International Express Courier</h4>
            <p style={{ marginBottom: "10px" }}>Premium and faster international delivery option for urgent shipments like documents, samples, or small parcels.</p>
            <div style={{ padding: "8px 12px", backgroundColor: "#e8f5e8", borderRadius: "4px", marginBottom: "10px" }}>
              <strong style={{ color: "#28a745" }}>Delivery Time: 5-6 days</strong>
            </div>
            <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
              <li>Reliable and secure door-to-door delivery</li>
              <li>Ideal for time-sensitive shipments</li>
              <li>Real-time tracking available</li>
            </ul>
          </div>
          <div style={{ padding: "20px", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
            <h4 style={{ color: "#d4af37", marginBottom: "10px" }}>International Economy Courier</h4>
            <p style={{ marginBottom: "10px" }}>Cost-effective international shipping solution where urgency takes a backseat to cost efficiency.</p>
            <div style={{ padding: "8px 12px", backgroundColor: "#fff3cd", borderRadius: "4px", marginBottom: "10px" }}>
              <strong style={{ color: "#856404" }}>Delivery Time: 10-15 days</strong>
            </div>
            <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
              <li>Affordable pricing for standard shipments</li>
              <li>Consolidated shipping routes for cost savings</li>
              <li>Reliable delivery with standard transit times</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px" }}>Why Choose Our Delivery</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "2em", marginBottom: "10px" }}>🚚</div>
            <h4 style={{ marginBottom: "8px", color: "#d4af37" }}>Nationwide Coverage</h4>
            <p style={{ lineHeight: "1.6", margin: "0", fontSize: "14px" }}>Delivery to all 77 districts of Nepal, including remote mountainous regions and rural areas.</p>
          </div>
          
          <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "2em", marginBottom: "10px" }}>📱</div>
            <h4 style={{ marginBottom: "8px", color: "#d4af37" }}>Real-time Tracking</h4>
            <p style={{ lineHeight: "1.6", margin: "0", fontSize: "14px" }}>Advanced tracking system with SMS notifications at every delivery milestone.</p>
          </div>
          
          <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "2em", marginBottom: "10px" }}>🛡️</div>
            <h4 style={{ marginBottom: "8px", color: "#d4af37" }}>Secure Handling</h4>
            <p style={{ lineHeight: "1.6", margin: "0", fontSize: "14px" }}>Professional packaging and careful handling with insurance coverage for valuable items.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
