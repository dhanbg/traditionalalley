"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calculateInStock } from "@/utils/stockUtils";

// Basic color map for fallback colors
const colorMap = {
  "red": "#FF0000",
  "blue": "#0000FF",
  "green": "#008000",
  "black": "#000000",
  "white": "#FFFFFF",
  "gray": "#808080",
  "grey": "#808080",
};

export default function ColorVariantSelect({
  variants = [],
  activeVariant,
  onVariantChange,
  showColorNames = true,
  currentProductId = null
}) {
  const [selectedVariant, setSelectedVariant] = useState(activeVariant);
  const router = useRouter();

  useEffect(() => {
    if (activeVariant) {
      setSelectedVariant(activeVariant);
    }
  }, [activeVariant]);

  // Function to get color image URL or fallback to color name
  const getColorDisplay = (variant) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    
    // If color image is uploaded, use it
    if (variant.color && variant.color.url && variant.color.url.trim() !== '') {
      const colorImageUrl = variant.color.url.startsWith('http') 
        ? variant.color.url 
        : `${API_URL}${variant.color.url}`;
      
      return {
        type: 'image',
        url: colorImageUrl,
        alt: variant.color.alternativeText || 'Design'
      };
    }
    
    // Fallback to extracting color from title or using default
    const colorName = extractColorFromVariant(variant);
    const lowerColor = colorName.toLowerCase();
    
    return {
      type: 'color',
      backgroundColor: colorMap[lowerColor] || lowerColor || '#cccccc',
      name: colorName
    };
  };

  // Extract design name from variant or fallback
  const extractColorFromVariant = (variant) => {
    // First, check if there's a design field in the variant
    if (variant.design && typeof variant.design === 'string' && variant.design.trim() !== '') {
      return variant.design;
    }
    
    // For main product, show product name if available
    if (variant.isCurrentProduct && variant.title) {
      return variant.title;
    }
    
    // Try to extract from color image name
    if (variant.color?.name) {
      const filename = variant.color.name.toLowerCase();
      for (const color of Object.keys(colorMap)) {
        if (filename.includes(color)) {
          return color.charAt(0).toUpperCase() + color.slice(1);
        }
      }
    }
    
    // Try to extract from main image name
    if (variant.imgSrc) {
      const imgSrcName = typeof variant.imgSrc === 'string' ? variant.imgSrc : variant.imgSrc.name || '';
      const filename = imgSrcName.toLowerCase();
      for (const color of Object.keys(colorMap)) {
        if (filename.includes(color)) {
          return color.charAt(0).toUpperCase() + color.slice(1);
        }
      }
    }
    
    // Last resort: use a generic design name
    return 'Design';
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    
    // If this variant represents a different product, navigate to it
    if (variant.product?.documentId && variant.product.documentId !== currentProductId) {
      router.push(`/product-detail/${variant.product.documentId}`);
    } else if (onVariantChange) {
      // If it's a variant of the same product, just update the display
      onVariantChange(variant);
    }
  };

  // If no variants, don't show the color selector
  if (!variants || variants.length === 0) {
    return null;
  }

  // If only one variant (the main product), show minimal color display
  if (variants.length === 1) {
    const singleVariant = variants[0];
    const colorDisplay = getColorDisplay(singleVariant);
    // Check if this single variant is actually selected
    const isActive = (selectedVariant?.id === singleVariant.id) || 
                    (!selectedVariant && singleVariant.isCurrentProduct);
    
    return (
      <div className="variant-picker-item">
        <div className="variant-picker-values" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginLeft: '10px' }}>
          <div 
            className={`color-variant-option ${isActive ? 'active' : ''}`} 
            style={{ position: 'relative', display: 'inline-block' }}
            onClick={() => handleVariantSelect(singleVariant)}
          >
            {colorDisplay.type === 'image' && colorDisplay.url && colorDisplay.url.trim() !== '' ? (
              <img 
                src={colorDisplay.url}
                alt={colorDisplay.alt}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isActive ? '3px solid #ff6b35' : '1px solid #e0e0e0',
                  boxShadow: isActive ? '0 0 15px rgba(255, 107, 53, 0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            ) : (
              <span 
                style={{
                  backgroundColor: colorDisplay.backgroundColor || '#cccccc',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'block',
                  border: isActive ? '3px solid #ff6b35' : '1px solid #e0e0e0',
                  boxShadow: isActive ? '0 0 15px rgba(255, 107, 53, 0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            )}
            {/* Checkmark indicator for single variant - only when active */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#ff6b35',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
                }}
              >
                <svg
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="variant-picker-item">
      {variants.length > 1 && (
        <div style={{ marginBottom: '6px', marginLeft: '10px', fontSize: '13px', color: '#888', fontWeight: 500 }}>
          {variants.length} designs available:
        </div>
      )}
      <div className="variant-picker-values" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginLeft: '10px' }}>
        {variants.map((variant, index) => {
          const isActive = (selectedVariant?.id === variant.id) || 
                          (!selectedVariant && variant.isCurrentProduct);
          const colorDisplay = getColorDisplay(variant);
          return (
            <div
              key={`variant-${variant.id}-${index}`}
              className={`color-variant-option ${isActive ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <input
                id={`variant-${variant.id || index}`}
                type="radio"
                name="color-variant"
                checked={isActive}
                onChange={() => handleVariantSelect(variant)}
                style={{ display: 'none' }}
              />
              <label
                htmlFor={`variant-${variant.id || index}`}
                className={`hover-tooltip tooltip-bot radius-60 color-btn ${isActive ? "active" : ""}`}
                style={{ 
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => handleVariantSelect(variant)}
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {colorDisplay.type === 'image' && colorDisplay.url && colorDisplay.url.trim() !== '' ? (
                    <img 
                      src={colorDisplay.url}
                      alt={colorDisplay.alt}
                      className="btn-checkbox"
                      style={{
                        border: isActive ? '3px solid #ff6b35' : '1px solid #e0e0e0',
                        display: 'block',
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        minHeight: '40px',
                        maxWidth: '40px',
                        maxHeight: '40px',
                        borderRadius: '50%',
                        boxShadow: isActive ? '0 0 15px rgba(255, 107, 53, 0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <span 
                      className="btn-checkbox" 
                      style={{
                        backgroundColor: colorDisplay.backgroundColor || '#cccccc',
                        border: isActive ? '3px solid #ff6b35' : '1px solid #e0e0e0',
                        display: 'block',
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        minHeight: '40px',
                        maxWidth: '40px',
                        maxHeight: '40px',
                        borderRadius: '50%',
                        boxShadow: isActive ? '0 0 15px rgba(255, 107, 53, 0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  )}
                  {/* Unique checkmark indicator when selected */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        width: '18px',
                        height: '18px',
                        backgroundColor: '#ff6b35',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
                        animation: 'fadeInScale 0.3s ease-out'
                      }}
                    >
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {showColorNames && (
                  <span className="tooltip">
                    <span>
                      {colorDisplay.type === 'image' ? colorDisplay.alt : colorDisplay.name}
                      {variant.product?.documentId && variant.product.documentId !== currentProductId && (
                        <span><br /><small>(View this design)</small></span>
                      )}
                    </span>
                  </span>
                )}
                {!calculateInStock(variant) && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '2px',
                      height: '50px',
                      backgroundColor: '#ff0000',
                      transform: 'translate(-50%, -50%) rotate(45deg)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </label>
              {!calculateInStock(variant) && (
                <div className="out-of-stock-indicator" style={{
                  position: 'absolute',
                  bottom: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  color: '#ff0000',
                  whiteSpace: 'nowrap'
                }}>
                  Out of Stock
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}