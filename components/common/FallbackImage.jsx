"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import imagePreloader from '@/utils/imagePreloader';

/**
 * FallbackImage component with preloading support and error handling
 * @param {Object} props - Component props
 * @param {string} props.src - Primary image source
 * @param {string} props.fallbackSrc - Fallback image source
 * @param {string} props.alt - Alt text for the image
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 * @param {string} props.className - CSS classes
 * @param {Object} props.style - Inline styles
 * @param {boolean} props.preload - Whether to preload the image
 * @param {Function} props.onLoad - Callback when image loads
 * @param {Function} props.onError - Callback when image fails to load
 * @param {Object} props.imageProps - Additional props to pass to Next.js Image
 */
const FallbackImage = ({
  src,
  fallbackSrc = '/images/placeholder.jpg',
  alt = 'Product Image',
  width,
  height,
  className = '',
  style = {},
  preload = false,
  onLoad,
  onError,
  ...imageProps
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Preload image if requested
  useEffect(() => {
    if (preload && src && !isPreloaded) {
      imagePreloader.preloadImage(src, {
        timeout: 8000,
        crossOrigin: 'anonymous'
      }).then((result) => {
        setIsPreloaded(true);
        if (!result.loaded) {
          console.warn('Image preload failed:', src, result.error);
          // Don't set error here, let the Image component handle it
        }
      }).catch((error) => {
        console.warn('Image preload error:', src, error);
        setIsPreloaded(true);
      });
    }
  }, [src, preload, isPreloaded]);

  // Reset state when src changes
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setIsLoading(true);
      setHasError(false);
      setIsPreloaded(false);
    }
  }, [src, currentSrc]);

  const handleLoad = (event) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) {
      onLoad(event);
    }
  };

  const handleError = (event) => {
    setIsLoading(false);
    
    // If we haven't tried the fallback yet, try it
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      console.warn('Image failed to load, trying fallback:', currentSrc, '→', fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      return;
    }
    
    // If fallback also failed or no fallback provided
    setHasError(true);
    console.error('Image and fallback failed to load:', src, fallbackSrc);
    
    if (onError) {
      onError(event);
    }
  };

  // Show loading state if preloading is enabled and image isn't preloaded yet
  const showLoadingState = preload && !isPreloaded && isLoading;

  return (
    <div 
      className={`fallback-image-container ${className}`} 
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style
      }}
    >
      {/* Loading placeholder */}
      {showLoadingState && (
        <div 
          className="image-loading-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            borderRadius: 'inherit'
          }}
        >
          <div 
            className="loading-spinner"
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid #e0e0e0',
              borderTop: '2px solid #666',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>
      )}
      
      {/* Error placeholder */}
      {hasError && (
        <div 
          className="image-error-placeholder"
          style={{
            width: width || '100%',
            height: height || '200px',
            backgroundColor: '#f8f8f8',
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '14px',
            borderRadius: '4px'
          }}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ marginBottom: '8px', opacity: 0.5 }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          <span>Image not available</span>
        </div>
      )}
      
      {/* Actual image */}
      {!hasError && (
        <Image
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: showLoadingState ? 0 : 1,
            transition: 'opacity 0.3s ease',
            ...imageProps.style
          }}
          {...imageProps}
        />
      )}
      
      {/* CSS for loading spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FallbackImage;

/**
 * Hook for using FallbackImage with cart products
 * @param {Array} cartProducts - Array of cart products
 * @returns {Object} Utilities for handling cart images
 */
export const useCartImageFallback = (cartProducts = []) => {
  const [failedImages, setFailedImages] = useState(new Set());
  
  const handleImageError = (src) => {
    setFailedImages(prev => new Set([...prev, src]));
  };
  
  const isImageFailed = (src) => {
    return failedImages.has(src);
  };
  
  const resetFailedImages = () => {
    setFailedImages(new Set());
  };
  
  // Reset failed images when cart products change
  useEffect(() => {
    resetFailedImages();
  }, [cartProducts]);
  
  return {
    handleImageError,
    isImageFailed,
    resetFailedImages,
    failedImagesCount: failedImages.size
  };
};