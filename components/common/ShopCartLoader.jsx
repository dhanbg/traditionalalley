"use client";
import React, { useState, useEffect } from "react";
import { useContextElement } from "@/context/Context";

export default function ShopCartLoader({ children }) {
  const { isCartLoading, cartLoadedOnce } = useContextElement();
  const [contentLoaded, setContentLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isCartLoading && cartLoadedOnce) {
      // Start the transition sequence
      setTimeout(() => {
        setContentLoaded(true);
      }, 100);
      
      setTimeout(() => {
        setShowContent(true);
      }, 300);
    }
  }, [isCartLoading, cartLoadedOnce]);

  // Container style with fixed dimensions to prevent layout shift
  const containerStyle = {
    minHeight: '600px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
    borderRadius: '8px'
  };

  // Blur style for smooth transition like Hero slider
  const blurStyle = {
    filter: contentLoaded ? 'blur(0px)' : 'blur(8px)',
    transition: 'filter 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: contentLoaded ? 'scale(1)' : 'scale(1.02)',
    transformOrigin: 'center',
  };

  // Skeleton overlay style with fade out effect
  const skeletonOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f9fa',
    opacity: showContent ? 0 : 1,
    visibility: showContent ? 'hidden' : 'visible',
    transition: 'opacity 0.4s ease-out, visibility 0.4s ease-out',
    zIndex: showContent ? -1 : 10,
    borderRadius: '8px'
  };

  // Content style with fade in effect
  const contentStyle = {
    opacity: showContent ? 1 : 0,
    transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    ...blurStyle
  };

  // Loading content style
  const loadingContentStyle = {
    padding: '2rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  };

  if (isCartLoading || !cartLoadedOnce) {
    return (
      <div style={containerStyle}>
        <div style={skeletonOverlayStyle}>
          <div style={loadingContentStyle}>
            {/* Cart Header Skeleton */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                height: '24px',
                width: '120px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                animation: 'shimmer 2s infinite linear'
              }} />
              <div style={{
                height: '20px',
                width: '80px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                animation: 'shimmer 2s infinite linear'
              }} />
            </div>

            {/* Cart Items Skeleton */}
            {[1, 2, 3].map((item) => (
              <div key={item} style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                animation: 'fadeIn 0.6s ease-out',
                animationDelay: `${item * 0.1}s`,
                animationFillMode: 'both'
              }}>
                {/* Product Image Skeleton */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '6px',
                  animation: 'shimmer 2s infinite linear',
                  flexShrink: 0
                }} />
                
                {/* Product Info Skeleton */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{
                    height: '18px',
                    width: '70%',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'shimmer 2s infinite linear'
                  }} />
                  <div style={{
                    height: '14px',
                    width: '50%',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'shimmer 2s infinite linear'
                  }} />
                  <div style={{
                    height: '16px',
                    width: '40%',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'shimmer 2s infinite linear'
                  }} />
                </div>

                {/* Price and Quantity Skeleton */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <div style={{
                    height: '18px',
                    width: '60px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'shimmer 2s infinite linear'
                  }} />
                  <div style={{
                    height: '32px',
                    width: '100px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'shimmer 2s infinite linear'
                  }} />
                </div>
              </div>
            ))}

            {/* Order Summary Skeleton */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginTop: '1rem'
            }}>
              <div style={{
                height: '20px',
                width: '120px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                marginBottom: '1rem',
                animation: 'shimmer 2s infinite linear'
              }} />
              
              {[1, 2, 3].map((item) => (
                <div key={item} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    height: '16px',
                    width: '80px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'shimmer 2s infinite linear'
                  }} />
                  <div style={{
                    height: '16px',
                    width: '60px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'shimmer 2s infinite linear'
                  }} />
                </div>
              ))}

              <div style={{
                height: '48px',
                width: '100%',
                backgroundColor: '#e2e8f0',
                borderRadius: '6px',
                marginTop: '1.5rem',
                animation: 'shimmer 2s infinite linear'
              }} />
            </div>
          </div>
        </div>
        
        {/* Actual content with blur and fade effects */}
        <div style={contentStyle}>
          {children}
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -200px 0;
            }
            100% {
              background-position: calc(200px + 100%) 0;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .shimmer-bg {
            background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
            background-size: 200px 100%;
            animation: shimmer 2s infinite linear;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
}