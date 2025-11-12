"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { API_URL } from "@/utils/urls";

export default function SizeGuideModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const [enlargedImage, setEnlargedImage] = useState(false);
  const [gender, setGender] = useState("women");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 576);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Ensure enlarged image overlay is closed when switching to men
  useEffect(() => {
    if (gender === "men" && enlargedImage) {
      setEnlargedImage(false);
    }
  }, [gender, enlargedImage]);

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

  // Image for size chart (Women)
  const sizeChartImageUrl = "https://admin.traditionalalley.com.np/uploads/inverted_triangle_60c890dd3e.jpg";

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
            position: "relative",
            width: "100%",
            maxWidth: isMobile ? "95%" : "700px",
            margin: isMobile ? "0 10px" : "0 20px",
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
            maxHeight: isMobile ? "90vh" : "none"
          }}
        >
          <div
            className="modal-header"
            style={{
              padding: isMobile ? "10px 12px" : "15px 20px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h5
              className="modal-title"
              style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: "600", margin: 0 }}
            >
              Size Guide
            </h5>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                fontSize: isMobile ? "22px" : "24px",
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
          {isMobile && (
            <button
              aria-label="Close size guide"
              onClick={onClose}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                backgroundColor: "rgba(0,0,0,0.05)",
                color: "#181818",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "20px",
                lineHeight: 0
              }}
            >
              &times;
            </button>
          )}
          <div
            className="modal-body"
            style={{
              padding: isMobile ? "10px" : "20px",
              maxHeight: isMobile ? "calc(90vh - 56px)" : "80vh",
              overflowY: isMobile ? "hidden" : "auto",
              overflowX: "hidden"
            }}
          >
            {/* Gender toggle */}
            <div style={{ display: "flex", gap: "8px", marginBottom: isMobile ? "12px" : "16px" }}>
              <button
                type="button"
                onClick={() => setGender("women")}
                style={{
                  padding: isMobile ? "6px 10px" : "6px 12px",
                  borderRadius: "20px",
                  border: gender === "women" ? "1px solid #181818" : "1px solid #ddd",
                  backgroundColor: gender === "women" ? "#181818" : "#fff",
                  color: gender === "women" ? "#fff" : "#181818",
                  cursor: "pointer",
                  fontSize: isMobile ? "12px" : "13px",
                  fontWeight: 600,
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  if (gender !== "women") e.currentTarget.style.backgroundColor = "#f2f2f2";
                }}
                onMouseOut={(e) => {
                  if (gender !== "women") e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                Women
              </button>
              <button
                type="button"
                onClick={() => setGender("men")}
                style={{
                  padding: isMobile ? "6px 10px" : "6px 12px",
                  borderRadius: "20px",
                  border: gender === "men" ? "1px solid #181818" : "1px solid #ddd",
                  backgroundColor: gender === "men" ? "#181818" : "#fff",
                  color: gender === "men" ? "#fff" : "#181818",
                  cursor: "pointer",
                  fontSize: isMobile ? "12px" : "13px",
                  fontWeight: 600,
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  if (gender !== "men") e.currentTarget.style.backgroundColor = "#f2f2f2";
                }}
                onMouseOut={(e) => {
                  if (gender !== "men") e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                Men
              </button>
            </div>

            <div className="size-guide-content">
              {/* Measurement diagram: visible for Women only */}
              {gender === "women" && !isMobile && (
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
                    onClick={() => !isMobile && setEnlargedImage(true)}
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
              )}

              {gender === "women" ? (
                <>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "center",
                      fontFamily: "Arial, sans-serif",
                      fontSize: isMobile ? "12px" : "14px",
                      lineHeight: isMobile ? "1.2" : "1.4"
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#f8f8f8",
                          borderBottom: "2px solid #ddd"
                        }}
                      >
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Size</th>
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>US</th>
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Bust</th>
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Waist</th>
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Low Hip</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: "500" }}>XS</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>2</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>32</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>24 - 25</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>33 - 34</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: "500" }}>S</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>4</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>34 - 35</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>26 - 27</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>35 - 36</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: "500" }}>M</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>6</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>36 - 37</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>28 - 29</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>38 - 40</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: "500" }}>L</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>8</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>38 - 40</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>30 - 31</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>42 - 44</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: "500" }}>XL</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>10</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>40 - 41</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>32 - 33</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>45 - 47</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: "500" }}>XXL</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>12</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>42 - 43</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>34 - 35</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>48 - 50</td>
                      </tr>
                    </tbody>
                  </table>

                  {!isMobile && (
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
                  )}
                </>
              ) : (
                <>
                  <h6 style={{ marginBottom: isMobile ? "8px" : "10px", fontWeight: 600 }}>Men's Slim Fit (Top)</h6>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "center",
                      fontFamily: "Arial, sans-serif",
                      fontSize: isMobile ? "12px" : "14px",
                      lineHeight: isMobile ? "1.2" : "1.4",
                      marginBottom: isMobile ? "12px" : "16px"
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#f8f8f8",
                          borderBottom: "2px solid #ddd"
                        }}
                      >
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Size</th>
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Chest</th>
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Waist</th>
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Shoulder</th>
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Sleeve Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>S</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>35-37</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>29-32</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>17</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>24.5</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>M</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>37-39</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>37-40</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>17.5</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>24.75-25</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>L</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>40-42</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>35-38</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>18.5</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>25-25.25</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>XL</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>42-44</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>38-42</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>19.5</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>25.5-25.75</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>2XL</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>44-46</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>42-45</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>20.5</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>25.75-26</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>3XL</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>46-48</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>45-47</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>21</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>26</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>4XL</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>48-51</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>47-50</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>22</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>26.5</td>
                      </tr>
                    </tbody>
                  </table>

                  <h6 style={{ marginBottom: isMobile ? "8px" : "10px", fontWeight: 600 }}>Men's Pants (Jeans)</h6>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "center",
                      fontFamily: "Arial, sans-serif",
                      fontSize: isMobile ? "12px" : "14px",
                      lineHeight: isMobile ? "1.2" : "1.4"
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#f8f8f8",
                          borderBottom: "2px solid #ddd"
                        }}
                      >
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Size</th>
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Waist (inches)</th>
                        <th style={{ padding: isMobile ? "6px" : "12px", fontWeight: "600" }}>Hip</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>S</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>28-30</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>—</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>M</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>31.5-32</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>40</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>L</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>33.5-34</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>41</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>XL</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>34.5-36</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>42</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>2XL</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>36.5-38</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>44</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>3XL</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>38.5-40</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>46</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: isMobile ? "6px" : "12px", fontWeight: 500 }}>4XL</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>40.5-42</td>
                        <td style={{ padding: isMobile ? "6px" : "12px" }}>48.5</td>
                      </tr>
                    </tbody>
                  </table>

                  {!isMobile && (
                    <div 
                      style={{ 
                        marginTop: "20px", 
                        fontSize: "14px",
                        color: "#666" 
                      }}
                    >
                      <p style={{ marginBottom: "10px" }}>
                        <strong>How to Measure (Men):</strong>
                      </p>
                      <ul style={{ paddingLeft: "20px", lineHeight: "1.5" }}>
                        <li><strong>Chest:</strong> Measure around the fullest part of the chest.</li>
                        <li><strong>Waist:</strong> Measure around the natural waistline.</li>
                        <li><strong>Shoulder:</strong> Measure from shoulder tip to shoulder tip across the back.</li>
                        <li><strong>Sleeve Length:</strong> Measure from shoulder seam to wrist.</li>
                        <li><strong>Hip (Jeans):</strong> Measure around the fullest part of the hips.</li>
                      </ul>
                      <p style={{ marginTop: "15px", fontStyle: "italic" }}>
                        All measurements are in inches.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged image overlay (Women only) */}
      {gender === "women" && enlargedImage && (
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