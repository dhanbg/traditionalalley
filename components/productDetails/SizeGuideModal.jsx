"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { API_URL } from "@/utils/urls";

export default function SizeGuideModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const [enlargedImage, setEnlargedImage] = useState(false);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (enlargedImage) {
          setEnlargedImage(false);
          return;
        }
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, enlargedImage]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Image for size chart
  const sizeChartImageUrl = "/inverted_triangle.jpg";

  return (
    <>
      <div
        className="modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div
          ref={modalRef}
          className="modal-container"
          style={{
            width: "100%",
            maxWidth: "700px",
            margin: "0 20px",
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden"
          }}
        >
          <div
            className="modal-header"
            style={{
              padding: "15px 20px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h5
              className="modal-title"
              style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}
            >
              Size Guide
            </h5>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              &times;
            </button>
          </div>
          <div
            className="modal-body"
            style={{
              padding: "20px",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
          >
            <div className="size-guide-content">
              {/* Size measurement diagram */}
              <div style={{ 
                textAlign: "center", 
                marginBottom: "25px", 
                padding: "10px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px"
              }}>
                <div 
                  style={{ 
                    position: "relative", 
                    width: "100%", 
                    height: "300px", 
                    marginBottom: "10px",
                    cursor: "pointer",
                    transition: "transform 0.3s ease"
                  }}
                  onClick={() => setEnlargedImage(true)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Image 
                    src={sizeChartImageUrl}
                    alt="Body Measurement Diagram"
                    fill
                    style={{ 
                      objectFit: "contain"
                    }}
                    onError={(e) => {
                      // Fallback to a placeholder if image fails to load
                      e.target.src = "/images/placeholder.png";
                    }}
                  />
                  <div 
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      fontSize: "12px"
                    }}
                  >
                    Click to enlarge
                  </div>
                </div>
                <p style={{ 
                  fontSize: "14px", 
                  fontStyle: "italic", 
                  color: "#666",
                  margin: "0"
                }}>
                  Reference body measurement guide
                </p>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "center",
                  fontFamily: "Arial, sans-serif"
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f8f8f8",
                      borderBottom: "2px solid #ddd"
                    }}
                  >
                    <th style={{ padding: "12px", fontWeight: "600" }}>Size</th>
                    <th style={{ padding: "12px", fontWeight: "600" }}>US</th>
                    <th style={{ padding: "12px", fontWeight: "600" }}>Bust</th>
                    <th style={{ padding: "12px", fontWeight: "600" }}>Waist</th>
                    <th style={{ padding: "12px", fontWeight: "600" }}>Low Hip</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>XS</td>
                    <td style={{ padding: "12px" }}>2</td>
                    <td style={{ padding: "12px" }}>32</td>
                    <td style={{ padding: "12px" }}>24 - 25</td>
                    <td style={{ padding: "12px" }}>33 - 34</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>S</td>
                    <td style={{ padding: "12px" }}>4</td>
                    <td style={{ padding: "12px" }}>34 - 35</td>
                    <td style={{ padding: "12px" }}>26 - 27</td>
                    <td style={{ padding: "12px" }}>35 - 36</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>M</td>
                    <td style={{ padding: "12px" }}>6</td>
                    <td style={{ padding: "12px" }}>36 - 37</td>
                    <td style={{ padding: "12px" }}>28 - 29</td>
                    <td style={{ padding: "12px" }}>38 - 40</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>L</td>
                    <td style={{ padding: "12px" }}>8</td>
                    <td style={{ padding: "12px" }}>38 - 40</td>
                    <td style={{ padding: "12px" }}>30 - 31</td>
                    <td style={{ padding: "12px" }}>42 - 44</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>XL</td>
                    <td style={{ padding: "12px" }}>10</td>
                    <td style={{ padding: "12px" }}>40 - 41</td>
                    <td style={{ padding: "12px" }}>32 - 33</td>
                    <td style={{ padding: "12px" }}>45 - 47</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>XXL</td>
                    <td style={{ padding: "12px" }}>12</td>
                    <td style={{ padding: "12px" }}>42 - 43</td>
                    <td style={{ padding: "12px" }}>34 - 35</td>
                    <td style={{ padding: "12px" }}>48 - 50</td>
                  </tr>
                </tbody>
              </table>
              
              <div 
                style={{ 
                  marginTop: "20px", 
                  fontSize: "14px",
                  color: "#666" 
                }}
              >
                <p style={{ marginBottom: "10px" }}>
                  <strong>How to Measure:</strong>
                </p>
                <ul style={{ paddingLeft: "20px", lineHeight: "1.5" }}>
                  <li><strong>Bust:</strong> Measure around the fullest part of your bust, keeping the tape parallel to the floor.</li>
                  <li><strong>Waist:</strong> Measure around the narrowest part of your natural waist.</li>
                  <li><strong>Low Hip:</strong> Measure around the fullest part of your hips, about 8" below your natural waist.</li>
                </ul>
                <p style={{ marginTop: "15px", fontStyle: "italic" }}>
                  All measurements are in inches. For the best fit, we recommend taking your measurements over your undergarments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged image overlay */}
      {enlargedImage && (
        <div 
          className="enlarged-image-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
          onClick={() => setEnlargedImage(false)}
        >
          <div 
            style={{
              position: "relative",
              width: "90%",
              height: "90%",
              maxWidth: "1200px"
            }}
          >
            <Image 
              src={sizeChartImageUrl}
              alt="Body Measurement Diagram"
              fill
              style={{ 
                objectFit: "contain"
              }}
              onError={(e) => {
                e.target.src = "/images/placeholder.png";
              }}
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedImage(false);
              }}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                backgroundColor: "rgba(255,255,255,0.3)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
                lineHeight: 0
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#e53637";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
              }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}