"use client";
import React from "react";

export default function WorldCupMarquee() {
  const marqueeStyle = {
    padding: '8px 0px',
    background: 'linear-gradient(90deg, #b8860b 0%, #e5c158 25%, #fff1b0 50%, #e5c158 75%, #b8860b 100%)',
    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.25)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 100
  };

  const textStyle = {
    fontSize: '13px',
    fontWeight: '800',
    color: '#000000',
    letterSpacing: '0.18em',
    margin: '0 25px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    textTransform: 'uppercase'
  };

  const marqueeText = [
    "⚽ Limited Edition Couture Corsets",
    "🏆 Pre-Order for Early-Bird 20% Discount",
    "✨ 6 Handcrafted Country Designs",
    "✈️ Free Worldwide Shipping",
    "🔥 Secure Your Championship Outfit Now"
  ];

  // Repeat text to fill the screen width
  const repeatedText = [...marqueeText, ...marqueeText, ...marqueeText];

  return (
    <div style={marqueeStyle}>
      <div className="marquee-container">
        <div className="marquee-track">
          {repeatedText.map((text, idx) => (
            <span key={idx} style={textStyle}>
              {text}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
        }

        .marquee-track {
          display: inline-block;
          animation: marqueeAnimation 25s linear infinite;
        }

        @keyframes marqueeAnimation {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33%, 0, 0); }
        }

        @media (max-width: 768px) {
          .marquee-track {
            animation: marqueeAnimation 15s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}
