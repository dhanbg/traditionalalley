"use client";

import { useEffect, useRef, useState } from "react";

import { items } from "@/data/singleProductSliders";
import Image from "next/image";
import { products } from "@/data/productsWomen";
import { API_URL } from "@/utils/urls";
import { getImageUrl } from "@/utils/imageUtils";

export default function Grid5({
  activeColor = "gray",
  setActiveColor = () => {},
  firstItem,
  productImages = [],
}) {
  // Helper function to construct proper image URLs
  const getImageUrl = (imageObj) => {
    if (!imageObj) return firstItem || '/images/placeholder.jpg';
    
    // If it's already a full URL, return as is
    if (typeof imageObj === 'string') {
      if (imageObj.startsWith('http')) return imageObj;
      if (imageObj.startsWith('/uploads/')) return getImageUrl(imageObj);
      return imageObj;
    }
    
    // Handle object with url property
    if (imageObj.url) {
      if (imageObj.url.startsWith('http')) return imageObj.url;
      return getImageUrl(imageObj.url);
    }
    
    // Handle object with src property
    if (imageObj.src) {
      if (imageObj.src.startsWith('http')) return imageObj.src;
      return getImageUrl(imageObj.src);
    }
    
    return firstItem || '/images/placeholder.jpg';
  };

  // Create items from product images if available, otherwise use static items
  const createItemsFromImages = () => {
    if (productImages && productImages.length > 0) {
      return productImages.map((img, index) => {
        const imageUrl = getImageUrl(img);
        return {
          href: imageUrl,
          target: "_blank",
          scroll: activeColor, // Use activeColor for scroll reference
          zoom: imageUrl,
          src: imageUrl,
          alt: img.alt || `Product image ${index + 1}`,
          width: 600,
          height: 800,
        };
      });
    }
    
    // Fallback to static items with firstItem replacement
    const fallbackItems = [...items];
    if (firstItem) {
      fallbackItems[0].src = firstItem;
      fallbackItems[0].href = firstItem;
      fallbackItems[0].zoom = firstItem;
    }
    return fallbackItems;
  };

  const finalItems = createItemsFromImages();

  // itemsFinal2[0].src = products[0].imgSrc;

  const observerRef = useRef(null);

  const scrollToTarget = () => {
    // Find the element with the specific data-value attribute
    const heightScroll = window.scrollY;
    const targetElement = document.querySelector(
      `[data-scroll='${activeColor}']`
    );

    // Check if the element exists
    if (targetElement) {
      // Get the element's bounding rectangle
      setTimeout(() => {
        if (window.scrollY == heightScroll) {
          targetElement?.scrollIntoView({
            behavior: "smooth", // Smooth scrolling animation
            block: "center", // Center the element in the viewport
          });
        }
      }, 200);

      // Scroll only if the element is not already in view
    }
  };

  useEffect(() => {
    scrollToTarget();
  }, [activeColor]);

  useEffect(() => {
    const options = {
      rootMargin: "-50% 0px",
    };

    // Create the observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const scrollValue = entry.target.getAttribute("data-scroll");
          setActiveColor(scrollValue);
        }
      });
    }, options);

    // Observe all items
    const elements = document.querySelectorAll(".item-scroll-quickview");
    elements.forEach((el) => observer.observe(el));
    observerRef.current = observer;

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  return (
    <div className="tf-quick-view-image">
      <div className="wrap-quick-view wrapper-scroll-quickview">
        {finalItems.map((link, index) => (
          <a
            href={link.href}
            target={link.target}
            className="quickView-item item-scroll-quickview"
            data-scroll={link.scroll}
            data-pswp-width={`${link.width}px`}
            data-pswp-height={`${link.height}px`}
            key={index}
          >
            <Image
              className="lazyload"
              data-zoom={link.zoom}
              data-src={link.src}
              alt={link.alt}
              src={link.src}
              width={link.width}
              height={link.height}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
