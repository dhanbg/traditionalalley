"use client";

import { useState, useEffect } from "react";

const defaultSizes = [
  { id: "values-s", value: "S", price: 79.99, disabled: false, quantity: 10 },
  { id: "values-m", value: "M", price: 79.99, disabled: false, quantity: 5 },
  { id: "values-l", value: "L", price: 89.99, disabled: false, quantity: 0 },
  { id: "values-xl", value: "XL", price: 89.99, disabled: false, quantity: 3 },
  { id: "values-xxl", value: "XXL", price: 89.99, disabled: true, quantity: 0 },
];

// Helper function to parse size_stocks data
function parseSizeStocks(sizeStocks) {
  if (!sizeStocks) return [];
  
  try {
    let parsedData;
    if (typeof sizeStocks === 'string') {
      parsedData = JSON.parse(sizeStocks);
    } else {
      parsedData = sizeStocks;
    }
    
    // Handle different formats
    if (Array.isArray(parsedData)) {
      // Format: [{"size": "S", "quantity": 10}, ...]
      return parsedData.map((item, index) => ({
        id: `values-${item.size?.toLowerCase() || index}`,
        value: item.size || `Size ${index + 1}`,
        quantity: item.quantity || 0,
        price: item.price || 0,
        disabled: (item.quantity || 0) === 0
      }));
    } else if (typeof parsedData === 'object') {
      // Format: {"S": 10, "M": 5, "L": 0, ...}
      return Object.entries(parsedData).map(([size, quantity]) => ({
        id: `values-${size.toLowerCase()}`,
        value: size,
        quantity: typeof quantity === 'number' ? quantity : 0,
        price: 0, // Price will be inherited from parent product
        disabled: (typeof quantity === 'number' ? quantity : 0) === 0
      }));
    }
  } catch (error) {
    console.error('Error parsing size_stocks:', error);
  }
  
  return [];
}

export function getStockIndicatorForSize(sizesArr, selectedValue) {
  if (!Array.isArray(sizesArr)) return { text: '', color: '' };
  const found = sizesArr.find(s => s.value === selectedValue);
  if (!found) return { text: '', color: '' };
  const quantity = found.quantity;
  let text = '';
  let color = '';
  if (quantity === 0) {
    text = 'Out of Stock';
    color = '#dc3545';
  } else if (quantity <= 5) {
    text = `Only ${quantity} left`;
    color = '#fd7e14';
  } else {
    text = `${quantity} in stock`;
    color = '#28a745';
  }
  return { text, color };
}

export default function SizeSelect({ sizes = defaultSizes, sizeStocks = null, productPrice = 0, selectedSize, setSelectedSize, onSelectedSizeChange }) {
  const [processedSizes, setProcessedSizes] = useState([]);

  useEffect(() => {
    let finalSizes = [];
    if (sizeStocks) {
      finalSizes = parseSizeStocks(sizeStocks);
      finalSizes = finalSizes.map(size => ({
        ...size,
        price: size.price || productPrice
      }));
    } else if (sizes && sizes.length > 0) {
      finalSizes = sizes.map(size => ({
        ...size,
        quantity: size.quantity || 0,
        disabled: size.disabled || (size.quantity === 0)
      }));
    }
    setProcessedSizes(finalSizes);
  }, [sizes, sizeStocks, productPrice]);

  const handleChange = (value) => {
    setSelectedSize(value);
    if (onSelectedSizeChange) onSelectedSizeChange(value, processedSizes);
  };

  return (
    <div className="variant-picker-item">
      <div className="variant-picker-values gap12">
        {processedSizes.map(({ id, value, price, disabled }) => (
          <div key={id} onClick={() => !disabled && handleChange(value)}>
            <input
              type="radio"
              id={id}
              checked={selectedSize === value}
              disabled={disabled}
              readOnly
            />
            <label
              className={`style-text size-btn ${disabled ? "type-disable" : ""}`}
              htmlFor={id}
              data-value={value}
              data-price={price}
              style={{
                position: "relative",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1
              }}
            >
              <span className="text-title">{value}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
