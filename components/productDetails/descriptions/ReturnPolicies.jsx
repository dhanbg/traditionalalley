import React from "react";

export default function ReturnPolicies() {
  return (
    <div style={{ padding: "20px", lineHeight: "1.6" }}>
      <h2 style={{ marginBottom: "20px", color: "#d4af37" }}>Return & Exchange Policy</h2>
      
      <section style={{ marginBottom: "20px" }}>
        <div style={{ padding: "15px", backgroundColor: "#fff3cd", borderRadius: "6px", border: "1px solid #ffeaa7", marginBottom: "15px" }}>
          <p style={{ margin: "0", fontSize: "14px", fontWeight: "bold", color: "#856404" }}>
            ⚠️ No Refunds Available - Exchange Only Policy
          </p>
        </div>
        <p style={{ marginBottom: "15px", fontSize: "14px" }}>
          All sales are final. We offer <strong>exchanges only</strong> within <strong>12 days</strong> of delivery for items of equal or lesser value.
        </p>
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "12px", fontSize: "16px" }}>Exchange Requirements</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div>
            <h4 style={{ color: "#28a745", marginBottom: "8px", fontSize: "14px" }}>✅ Eligible Items</h4>
            <ul style={{ paddingLeft: "16px", margin: "0", fontSize: "13px" }}>
              <li style={{ marginBottom: "4px" }}>Within 12 days of delivery</li>
              <li style={{ marginBottom: "4px" }}>Original condition with tags</li>
              <li style={{ marginBottom: "0" }}>Unworn and unwashed</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#dc3545", marginBottom: "8px", fontSize: "14px" }}>❌ Not Eligible</h4>
            <ul style={{ paddingLeft: "16px", margin: "0", fontSize: "13px" }}>
              <li style={{ marginBottom: "4px" }}>After 12-day deadline</li>
              <li style={{ marginBottom: "4px" }}>Custom/personalized items</li>
              <li style={{ marginBottom: "0" }}>Intimate apparel</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "12px", fontSize: "16px" }}>How to Exchange</h3>
        <ol style={{ paddingLeft: "20px", margin: "0", fontSize: "14px" }}>
          <li style={{ marginBottom: "6px" }}>Contact support@traditionalalley.com.np within 12 days</li>
          <li style={{ marginBottom: "6px" }}>Provide order number and exchange reason</li>
          <li style={{ marginBottom: "6px" }}>Ship item back with original packaging</li>
          <li style={{ marginBottom: "0" }}>Receive replacement item (7-10 business days)</li>
        </ol>
      </section>

      <section>
        <h3 style={{ marginBottom: "12px", fontSize: "16px" }}>Processing Time</h3>
        <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
          Total processing time: <strong>7-10 business days</strong> from when we receive your return item.
        </p>
      </section>
    </div>
  );
}
