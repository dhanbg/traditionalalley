"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_URL } from "@/utils/urls";
import { getImageUrl } from "@/utils/api";

export default function CustomOrderForm({ isOpen, onClose, product }) {
  const modalRef = useRef(null);
  const [showEnlargedImage, setShowEnlargedImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    email: "",
    customizationType: "",
    chestSize: "",
    waistSize: "",
    hipSize: "",
    shoulderSize: "",
    height: "",
    desiredColor: "",
  });

  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showColorInput, setShowColorInput] = useState(false);
  const [showWhatsappLink, setShowWhatsappLink] = useState(false);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (showEnlargedImage) {
          setShowEnlargedImage(false);
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
  }, [isOpen, onClose, showEnlargedImage]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTypeSelection = (type) => {
    setFormData({ ...formData, customizationType: type });
    setShowMeasurements(type === "1");
    setShowColorInput(type === "2");
    setShowWhatsappLink(type === "3");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a formatted message with form data
    let message = `*New Custom Order Request*\n\n`;
    message += `*Name:* ${formData.name}\n`;
    message += `*Address:* ${formData.address}\n`;
    message += `*Contact:* ${formData.contactNumber}\n`;
    message += `*Email:* ${formData.email}\n`;
    
    // Add customization type
    const customizationType = formData.customizationType === "1" 
      ? "Size/Measurement Customization" 
      : formData.customizationType === "2" 
        ? "Color Customization" 
        : "Other Customization";
    
    message += `*Customization Type:* ${customizationType}\n\n`;
    
    // Add size information if provided
    if (showMeasurements && formData.customizationType === "1") {
      message += `*Measurements:*\n`;
      message += formData.chestSize ? `Chest: ${formData.chestSize}\n` : '';
      message += formData.waistSize ? `Waist: ${formData.waistSize}\n` : '';
      message += formData.hipSize ? `Hip: ${formData.hipSize}\n` : '';
      message += formData.shoulderSize ? `Shoulder: ${formData.shoulderSize}\n` : '';
      message += formData.height ? `Height: ${formData.height}\n` : '';
      message += '\n';
    }
    
    // Add color information if provided
    if (showColorInput && formData.customizationType === "2") {
      message += `*Desired Color:* ${formData.desiredColor}\n\n`;
    }

    // Add product details if available
    if (product) {
      message += `*Product Details*\n`;
      message += `Product Name: ${product.title}\n`;
      message += `Price: $${product.price.toFixed(2)}\n\n`;
      
      // Add product image link if available
      if (product.imgSrc) {
        message += `Click to view image: \n${product.imgSrc} \n\n`;
      }
      
      // Add product page link - safely handle window object for SSR
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://traditionalalley.com.np';
        const productLink = `${origin}/product-detail/${product.id}`;
        message += `Product Link: ${productLink}\n\n`;
      } catch (error) {
        // Fallback if window is not available
        const productLink = `https://traditionalalley.com.np/product-detail/${product.id}`;
        message += `Product Link: ${productLink}\n\n`;
      }
    }
    
    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL with the message
    const whatsappUrlWithMessage = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrlWithMessage, '_blank');
    
    // Close the form after submission
    onClose();
  };

  const handleImageClick = () => {
    setShowEnlargedImage(true);
  };

  if (!isOpen) return null;

  // WhatsApp number - replace with your actual WhatsApp number
  const whatsappNumber = "+9779844594187";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  // Image for size customization
  const sizeChartImageUrl = `${API_URL}/uploads/inverted_triangle_bacba040fd.jpg`;

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
          justifyContent: "center",
        }}
      >
        <div
          ref={modalRef}
          className="modal-container"
          style={{
            width: "100%",
            maxWidth: "550px",
            margin: "0 20px",
            maxHeight: "90vh",
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              className="modal-header"
              style={{
                padding: "15px 20px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h5
                className="modal-title"
                style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}
              >
                Custom Order?
              </h5>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>
            <div
              className="modal-body"
              style={{
                padding: "15px 20px",
                maxHeight: "calc(90vh - 130px)",
                overflowY: "auto",
              }}
            >
              <form onSubmit={handleSubmit}>
                <div className="text-center" style={{ marginBottom: "20px" }}>
                  <h4 style={{ fontWeight: "500", fontSize: "16px" }}>
                    Fill up the form & send us your queries:
                  </h4>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    margin: "0 -10px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      flex: "0 0 50%",
                      padding: "0 10px",
                      marginBottom: "15px",
                    }}
                  >
                    <label
                      htmlFor="name"
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Name:
                    </label>
                    <input
                      type="text"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div
                    style={{
                      flex: "0 0 50%",
                      padding: "0 10px",
                      marginBottom: "15px",
                    }}
                  >
                    <label
                      htmlFor="address"
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Address:
                    </label>
                    <input
                      type="text"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    margin: "0 -10px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      flex: "0 0 50%",
                      padding: "0 10px",
                      marginBottom: "15px",
                    }}
                  >
                    <label
                      htmlFor="contactNumber"
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Contact Number:
                    </label>
                    <input
                      type="tel"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div
                    style={{
                      flex: "0 0 50%",
                      padding: "0 10px",
                      marginBottom: "15px",
                    }}
                  >
                    <label
                      htmlFor="email"
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Email Id:
                    </label>
                    <input
                      type="email"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Type of customization:
                  </label>
                  <div style={{ marginBottom: "8px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="customizationType"
                        value="1"
                        checked={formData.customizationType === "1"}
                        onChange={() => handleTypeSelection("1")}
                        style={{ marginRight: "10px" }}
                      />
                      <span style={{ fontSize: "14px" }}>
                        1. Size Customization
                      </span>
                    </label>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="customizationType"
                        value="2"
                        checked={formData.customizationType === "2"}
                        onChange={() => handleTypeSelection("2")}
                        style={{ marginRight: "10px" }}
                      />
                      <span style={{ fontSize: "14px" }}>
                        2. Color Customization
                      </span>
                    </label>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="customizationType"
                        value="3"
                        checked={formData.customizationType === "3"}
                        onChange={() => handleTypeSelection("3")}
                        style={{ marginRight: "10px" }}
                      />
                      <span style={{ fontSize: "14px" }}>
                        3. Different type of customization
                      </span>
                    </label>
                  </div>
                </div>

                {showMeasurements && (
                  <div style={{ marginBottom: "15px" }}>
                    <h5 style={{ marginBottom: "12px", fontWeight: "500", fontSize: "14px" }}>Please provide your measurements:</h5>
                    
                    <div style={{ 
                      textAlign: "center", 
                      marginBottom: "15px",
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
                        onClick={handleImageClick}
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
                          alt="Size Measurement Chart" 
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
                        fontSize: "13px", 
                        color: "#666", 
                        fontStyle: "italic",
                        margin: "0"
                      }}>
                        Please use this chart as a reference for taking measurements
                      </p>
                    </div>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", margin: "0 -10px" }}>
                      <div
                        style={{
                          flex: "0 0 50%",
                          padding: "0 10px",
                          marginBottom: "15px",
                        }}
                      >
                        <label
                          htmlFor="chestSize"
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            fontSize: "14px",
                          }}
                        >
                          Chest:
                        </label>
                        <input
                          type="text"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                          }}
                          id="chestSize"
                          name="chestSize"
                          value={formData.chestSize}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div
                        style={{
                          flex: "0 0 50%",
                          padding: "0 10px",
                          marginBottom: "15px",
                        }}
                      >
                        <label
                          htmlFor="waistSize"
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            fontSize: "14px",
                          }}
                        >
                          Waist:
                        </label>
                        <input
                          type="text"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                          }}
                          id="waistSize"
                          name="waistSize"
                          value={formData.waistSize}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div
                        style={{
                          flex: "0 0 50%",
                          padding: "0 10px",
                          marginBottom: "15px",
                        }}
                      >
                        <label
                          htmlFor="hipSize"
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            fontSize: "14px",
                          }}
                        >
                          Hip:
                        </label>
                        <input
                          type="text"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                          }}
                          id="hipSize"
                          name="hipSize"
                          value={formData.hipSize}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div
                        style={{
                          flex: "0 0 50%",
                          padding: "0 10px",
                          marginBottom: "15px",
                        }}
                      >
                        <label
                          htmlFor="shoulderSize"
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            fontSize: "14px",
                          }}
                        >
                          Shoulder:
                        </label>
                        <input
                          type="text"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                          }}
                          id="shoulderSize"
                          name="shoulderSize"
                          value={formData.shoulderSize}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div
                        style={{
                          flex: "0 0 50%",
                          padding: "0 10px",
                          marginBottom: "15px",
                        }}
                      >
                        <label
                          htmlFor="height"
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            fontSize: "14px",
                          }}
                        >
                          Height (from Head to Toe):
                        </label>
                        <input
                          type="text"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                          }}
                          id="height"
                          name="height"
                          value={formData.height}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {showColorInput && (
                  <div style={{ marginBottom: "15px" }}>
                    <label
                      htmlFor="desiredColor"
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Type your desired color:
                    </label>
                    <input
                      type="text"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                      id="desiredColor"
                      name="desiredColor"
                      value={formData.desiredColor}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                {showWhatsappLink && (
                  <div style={{ textAlign: "center", marginBottom: "15px" }}>
                    <p style={{ marginBottom: "12px", fontSize: "14px" }}>
                      Connect with us on WhatsApp messenger for further
                      assistance:
                    </p>
                    <Link
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        backgroundColor: "#25D366",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        textDecoration: "none",
                        fontWeight: "500",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      className="whatsapp-button-hover"
                    >
                      Chat with us on WhatsApp
                    </Link>
                    <style jsx global>{`
                      .whatsapp-button-hover {
                        position: relative;
                        z-index: 1;
                      }
                      .whatsapp-button-hover:before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
                        transition: left 0.7s ease;
                        z-index: -1;
                      }
                      .whatsapp-button-hover:hover {
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        transform: translateY(-2px);
                      }
                      .whatsapp-button-hover:hover:before {
                        left: 100%;
                      }
                    `}</style>
                  </div>
                )}

                {!showWhatsappLink && (
                  <div style={{ marginBottom: "15px" }}>
                    <p style={{ marginBottom: "8px", fontSize: "14px" }}>
                      Or chat our team for further assistance:
                    </p>
                    <Link
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#25D366",
                        textDecoration: "none",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      Contact us on WhatsApp
                    </Link>
                  </div>
                )}

                <div
                  style={{
                    borderTop: "1px solid #eee",
                    padding: "15px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: "1px solid #000000",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "14px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#000000";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.color = "#000000";
                    }}
                  >
                    Cancel
                  </button>
                  {!showWhatsappLink && (
                    <button
                      type="submit"
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#000",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.backgroundColor = "#444";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.backgroundColor = "#000";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      Submit Query
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Image Overlay */}
      {showEnlargedImage && (
        <div className="enlarged-image-overlay" style={{ 
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
        onClick={() => setShowEnlargedImage(false)}
        >
          <div style={{ position: "relative", width: "90%", height: "90%", maxWidth: "1200px" }}>
            <Image 
              src={sizeChartImageUrl}
              alt="Size Measurement Chart" 
              fill
              style={{ objectFit: "contain" }}
              onError={(e) => {
                e.target.src = "/images/placeholder.png";
              }}
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowEnlargedImage(false);
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
