"use client";

import React, { useState } from "react";

const colorOptionsDefault = [
  {
    id: "values-beige",
    value: "Beige",
    color: "beige",
  },
  {
    id: "values-gray",
    value: "Gray",
    color: "gray",
  },
  {
    id: "values-grey",
    value: "Grey",
    color: "grey",
  },
];

// Map to convert color names to CSS color values
const colorMap = {
  "silver": "#C0C0C0",
  "red": "#FF0000",
  "blue": "#0000FF",
  "green": "#008000",
  "yellow": "#FFFF00",
  "purple": "#800080",
  "orange": "#FFA500",
  "pink": "#FFC0CB",
  "brown": "#A52A2A",
  "black": "#000000",
  "white": "#FFFFFF",
  "gray": "#808080",
  "grey": "#808080",
  "beige": "#F5F5DC",
};

export default function ColorSelect({
  activeColor = "",
  setActiveColor,
  colorOptions = colorOptionsDefault,
}) {
  const [activeColorDefault, setActiveColorDefault] = useState("Gray");
  
  const currentActiveColor = activeColor || activeColorDefault;

  const handleSelectColor = (value) => {
    if (setActiveColor) {
      setActiveColor(value);
    } else {
      setActiveColorDefault(value);
    }
  };

  // Function to get CSS background color style based on color name
  const getColorStyle = (colorName) => {
    const lowerColor = colorName.toLowerCase();
    if (colorMap[lowerColor]) {
      return { backgroundColor: colorMap[lowerColor] };
    }
    return { backgroundColor: lowerColor };
  };

  return (
    <div className="variant-picker-item">
      <div className="d-flex justify-content-between mb_12">
        <div className="variant-picker-label">
          Color:
          <span className="text-title variant-picker-label-value">
            {typeof currentActiveColor === 'string' ? currentActiveColor : currentActiveColor?.name || 'Unknown'}
          </span>
        </div>
      </div>
      <div className="variant-picker-values" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginLeft: '10px' }}>
        {colorOptions.map(({ id, value, color }) => {
          const isActive = (activeColor && typeof activeColor === 'string' && activeColor.toLowerCase() === color.toLowerCase()) || 
                           (!activeColor && activeColorDefault.toLowerCase() === color.toLowerCase());
          
          return (
            <React.Fragment key={id}>
              <input
                id={id}
                type="radio"
                readOnly
                checked={isActive}
                style={{ display: 'none' }}
              />
              <label
                onClick={() => {
                  handleSelectColor(value);
                }}
                className={`hover-tooltip tooltip-bot radius-60 color-btn ${isActive ? "active" : ""}`}
                htmlFor={id}
                style={{ 
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '4px'
                }}
              >
                <span 
                  className="btn-checkbox" 
                  style={{
                    ...getColorStyle(color),
                    border: isActive ? '2px solid #000' : '1px solid #e0e0e0',
                    display: 'block',
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    minHeight: '40px',
                    maxWidth: '40px',
                    maxHeight: '40px',
                    borderRadius: '50%',
                    boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
                <span className="tooltip">{value}</span>
                {isActive && (
                  <span 
                    style={{
                      position: 'absolute',
                      width: '48px',
                      height: '48px',
                      minWidth: '48px',
                      minHeight: '48px',
                      maxWidth: '48px',
                      maxHeight: '48px',
                      borderRadius: '50%',
                      border: '1px solid #000',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </label>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
