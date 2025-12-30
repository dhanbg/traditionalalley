"use client";
import { useState, useEffect } from "react";
import { Copy } from "lucide-react";

export default function CouponPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Show popup after 1 second
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("TA20OFF");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsVisible(false);
    }, 800);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="coupon-popup-overlay" onClick={() => setIsVisible(false)} />
      <div className="coupon-popup">
        <button
          className="close-btn"
          onClick={() => setIsVisible(false)}
        >
          ×
        </button>

        <div className="popup-content">
          <div className="header">
            <h3>🎉 New Year Sale! 🎉</h3>
            <p className="subtitle">Get Flat 20% OFF on your purchase</p>
          </div>

          <div className="coupon-box">
            <span className="code">TA20OFF</span>
            <button
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <p className="instruction">
            Copy the code above and paste it at the <strong>checkout page</strong> to avail the discount.
          </p>
        </div>
      </div>

      <style jsx>{`
        .coupon-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 10002;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.3s ease-out;
        }

        .coupon-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 10003;
          width: 90%;
          max-width: 400px;
          text-align: center;
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 2px solid #d4af37;
        }

        .close-btn {
          position: absolute;
          top: 10px;
          right: 15px;
          background: none;
          border: none;
          font-size: 28px;
          color: #666;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #000;
        }

        .header h3 {
          color: #d4af37;
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .subtitle {
          color: #666;
          margin: 0 0 25px 0;
          font-size: 16px;
        }

        .coupon-box {
          background: #f8f9fa;
          border: 2px dashed #d4af37;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 10px;
        }

        .code {
          font-family: monospace;
          font-size: 20px;
          font-weight: bold;
          color: #333;
          letter-spacing: 1px;
        }

        .copy-btn {
          background: #d4af37;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          min-width: 100px;
        }

        .copy-btn:hover {
          background: #b5952f;
          transform: translateY(-1px);
        }

        .copy-btn.copied {
          background: #28a745;
        }

        .instruction {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
          margin: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to { 
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}
