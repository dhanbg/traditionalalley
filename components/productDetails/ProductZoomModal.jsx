/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/zoom";

export default function ProductZoomModal({
  isOpen,
  onClose,
  items = [],
  initialIndex = 0,
  productTitle = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [showHint, setShowHint] = useState(true);
  const swiperRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update active slide when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !items || items.length === 0) {
    return null;
  }

  const handleThumbnailClick = (idx) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(idx);
    }
  };

  return createPortal(
    <div
      className="product-zoom-modal-portal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "rgba(10, 10, 10, 0.98)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        animation: "zoomFadeIn 0.22s ease-out",
        touchAction: "none",
        color: "#ffffff",
      }}
    >
      <style jsx global>{`
        @keyframes zoomFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .product-zoom-modal-portal .swiper {
          width: 100%;
          height: 100%;
        }
        .product-zoom-modal-portal .swiper-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .product-zoom-modal-portal .swiper-zoom-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-zoom-modal-portal .swiper-zoom-container img {
          max-width: 100%;
          max-height: 78vh;
          object-fit: contain;
          border-radius: 8px;
          user-select: none;
          -webkit-user-drag: none;
        }
      `}</style>

      {/* Top Header / Bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          zIndex: 10,
          background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: '"Outfit", sans-serif',
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              padding: "4px 10px",
              borderRadius: "20px",
              letterSpacing: "0.5px",
            }}
          >
            {activeIndex + 1} / {items.length}
          </span>
          {productTitle && (
            <span
              style={{
                fontSize: "13px",
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 500,
                color: "#e2e8f0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "200px",
              }}
            >
              {productTitle}
            </span>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close zoom viewer"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(228, 49, 49, 0.9)",
              border: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "600",
              marginLeft: "4px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              transition: "transform 0.15s ease",
            }}
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Fullscreen Zoom Swiper */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Swiper
          dir="ltr"
          modules={[Zoom, Keyboard]}
          zoom={{
            maxRatio: 4,
            minRatio: 1,
            toggle: true,
          }}
          keyboard={{ enabled: true }}
          initialSlide={initialIndex}
          spaceBetween={16}
          slidesPerView={1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
        >
          {items.map((slide, index) => (
            <SwiperSlide key={slide.id || index}>
              <div className="swiper-zoom-container">
                <img
                  src={slide.src}
                  alt={slide.alt || `Product image ${index + 1}`}
                  loading={index === initialIndex ? "eager" : "lazy"}
                  crossOrigin="anonymous"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pinch / Double-Tap Hint */}
        {showHint && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "#ffffff",
              padding: "8px 18px",
              borderRadius: "24px",
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: '"Outfit", sans-serif',
              border: "1px solid rgba(255, 255, 255, 0.2)",
              pointerEvents: "none",
              animation: "zoomFadeIn 0.3s ease-out",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            }}
          >
            🔍 Pinch or double-tap to zoom
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {items.length > 1 && (
        <footer
          style={{
            padding: "12px 16px 20px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            zIndex: 10,
            background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
          }}
        >
          {items.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => handleThumbnailClick(idx)}
                style={{
                  width: "50px",
                  height: "65px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  padding: 0,
                  border: isSelected ? "2px solid #E43131" : "1px solid rgba(255, 255, 255, 0.3)",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  opacity: isSelected ? 1 : 0.6,
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.18s ease",
                  flexShrink: 0,
                }}
              >
                <img
                  src={item.thumbnailSrc || item.src}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </button>
            );
          })}
        </footer>
      )}
    </div>,
    document.body
  );
}
