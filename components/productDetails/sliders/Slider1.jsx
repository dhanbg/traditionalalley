"use client";
import { API_URL } from "@/utils/urls";
import { getImageUrl } from "@/utils/imageUtils";
import { slides } from "@/data/singleProductSliders";
import { useEffect, useRef, useState } from "react";
import { Thumbs, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/zoom";
import Image from "next/image";
import Drift from 'drift-zoom';
import "@/public/css/drift-basic.min.css";
import ProductZoomModal from "../ProductZoomModal";

export default function Slider1({
  activeColor = "gray",
  setActiveColor = () => {},
  firstItem,
  imgHover,
  gallery = [],
  slideItems = slides,
  thumbSlidePerView = 6,
  thumbSlidePerViewOnMobile = 6,
  productTitle = "",
}) {
  // Use gallery if provided, or fallback to slideItems
  const useGallery = gallery && gallery.length > 0;
  
  // --- NEW: items as state, update on relevant changes ---
  const [items, setItems] = useState([]);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const driftInstancesRef = useRef([]);
  const swiperRef = useRef(null);
  const thumbsSwiperRef = useRef(null);
  const imageRefs = useRef([]);

  useEffect(() => {
    // Helper function to generate thumbnail URL from main URL
    const generateThumbnailUrl = (mainUrl) => {
      // Next.js Image component automatically optimizes and resizes images.
      // Guessing the 'thumbnail_' prefix leads to 404 errors if Strapi didn't generate it.
      return mainUrl;
    };

    let newItems;
    if (useGallery) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
      
      newItems = gallery
        .filter(item => item && (item.url || (item.formats && Object.keys(item.formats).length > 0))) // Filter valid items
        .map((item, idx) => {
          // Extract main image URL
          let mainUrl = item.url;
          if (!mainUrl && item.formats) {
            // Try to get URL from formats if direct url doesn't exist
            if (item.formats.large?.url) {
              mainUrl = item.formats.large.url;
            } else if (item.formats.medium?.url) {
              mainUrl = item.formats.medium.url;
            } else if (item.formats.small?.url) {
              mainUrl = item.formats.small.url;
            }
          }
          
          // Ensure main URL has API prefix
          if (mainUrl && !mainUrl.startsWith('http')) {
            mainUrl = getImageUrl(mainUrl);
          }
          
          // Extract thumbnail URL - create from main URL since formats are missing
          let thumbnailUrl = mainUrl; // fallback to main url
          
          // If formats are available, use them
          if (item.formats && item.formats.thumbnail && item.formats.thumbnail.url) {
            thumbnailUrl = item.formats.thumbnail.url.startsWith('http') 
              ? item.formats.thumbnail.url 
              : getImageUrl(item.formats.thumbnail.url);
          } else if (mainUrl) {
            thumbnailUrl = generateThumbnailUrl(mainUrl);
          }
          
          return {
            id: idx + 2, // Start from 2 to leave room for main image and hover image
            src: mainUrl, // Full size for main slider
            thumbnailSrc: thumbnailUrl, // Thumbnail for thumbnail slider
            alt: productTitle ? `${productTitle} - Angle Detail ${idx + 1}` : `Gallery image ${idx + 1}`,
            color: activeColor,
            width: 600,
            height: 800
          };
        });
      
      // Add the main product image and hover image at the beginning
      if (firstItem && typeof firstItem === 'string' && firstItem.trim() !== '') {
        newItems.unshift({
          id: 0,
          src: firstItem,
          thumbnailSrc: generateThumbnailUrl(firstItem), // Generate thumbnail for main product
          alt: productTitle ? `${productTitle} - Authentic Nepali Traditional Fashion` : "Main product image",
          color: activeColor,
          width: 600,
          height: 800
        });
      }
      if (imgHover && typeof imgHover === 'string' && imgHover.trim() !== '' && imgHover !== firstItem) {
        newItems.splice(1, 0, {
          id: 1,
          src: imgHover,
          thumbnailSrc: generateThumbnailUrl(imgHover), // Generate thumbnail for hover image
          alt: productTitle ? `${productTitle} - Back Angle View` : "Product hover image",
          color: activeColor,
          width: 600,
          height: 800
        });
      }
    } else {
      // When slideItems exist (variant images), don't show them in main product view
      // Only show main product images to prevent variant images from appearing in main product sub-images
      newItems = [];
      
      // Add the main product image and hover image only
      if (firstItem && typeof firstItem === 'string' && firstItem.trim() !== '') {
        newItems.push({
          id: 0,
          src: firstItem,
          thumbnailSrc: generateThumbnailUrl(firstItem),
          alt: productTitle ? `${productTitle} - Authentic Nepali Traditional Fashion` : "Main product image",
          color: activeColor,
          width: 600,
          height: 800
        });
      }
      if (imgHover && typeof imgHover === 'string' && imgHover.trim() !== '' && imgHover !== firstItem) {
        newItems.push({
          id: 1,
          src: imgHover,
          thumbnailSrc: generateThumbnailUrl(imgHover),
          alt: productTitle ? `${productTitle} - Back Angle View` : "Product hover image",
          color: activeColor,
          width: 600,
          height: 800
        });
      }
    }
    setItems(newItems);
  }, [useGallery, gallery, slideItems, firstItem, imgHover, productTitle]);
  
  // --- NEW: Reset Swiper to first slide on items/color change (mobile fix) ---
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
      setActiveSlideIndex(0);
      setTimeout(() => {
        swiperRef.current?.update && swiperRef.current.update();
      }, 100);
    }
  }, [items]);
  
  // Handle activeColor changes separately to avoid circular dependency
  useEffect(() => {
    if (swiperRef.current && !useGallery && items.length > 0) {
      setTimeout(() => {
        const slideIndex = items.filter((elm) => elm.color == activeColor)[0]?.id - 1;
        if (slideIndex !== undefined && slideIndex >= 0) {
          swiperRef.current.slideTo(slideIndex);
          setActiveSlideIndex(slideIndex);
        }
      }, 100);
    }
  }, [activeColor, useGallery]);

  // Initialize Drift zoom on images after render and when active slide changes
  useEffect(() => {
    // Clean up previous instances
    driftInstancesRef.current.forEach(instance => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
    driftInstancesRef.current = [];

    // Check if device is mobile (Drift is desktop-only, mobile uses touch zoom + modal)
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    
    // Only create zoom instances on desktop devices
    if (!isMobile) {
      // Create new instances for visible images
      imageRefs.current.forEach((imgEl, index) => {
        if (imgEl) {
          const driftInstance = new Drift(imgEl, {
            paneContainer: document.querySelector('.tf-zoom-main'),
            inlinePane: false,
            containInline: false,
            hoverBoundingBox: true,
            zoomFactor: 2.5,
            touchDelay: 100,
            sourceAttribute: 'src',
            handleTouch: false,
            inlineOffsetX: 0,
            inlineOffsetY: 0,
            hoverDelay: 0,
            boundingBoxContainer: document.body
          });
          driftInstancesRef.current[index] = driftInstance;
        }
      });
    }

    // Register swiper slide change event to update zoom (only on desktop)
    if (swiperRef.current && !isMobile) {
      swiperRef.current.on('slideChange', () => {
        // Instead of destroying all instances, just create/update for active slide
        setTimeout(() => {
          const activeIndex = swiperRef.current?.activeIndex || 0;
          const imgEl = imageRefs.current[activeIndex];
          if (imgEl && !driftInstancesRef.current[activeIndex]) {
            const driftInstance = new Drift(imgEl, {
              paneContainer: document.querySelector('.tf-zoom-main'),
              inlinePane: false,
              containInline: false,
              hoverBoundingBox: true,
              zoomFactor: 2.5,
              touchDelay: 100,
              sourceAttribute: 'src',
              handleTouch: false,
              inlineOffsetX: 0,
              inlineOffsetY: 0,
              hoverDelay: 0,
              boundingBoxContainer: document.body
            });
            driftInstancesRef.current[activeIndex] = driftInstance;
          }
        }, 50); // Reduced timeout for faster response
      });
    }

    return () => {
      // Clean up instances on component unmount
      driftInstancesRef.current.forEach(instance => {
        if (instance && typeof instance.destroy === 'function') {
          instance.destroy();
        }
      });
    };
  }, [items]);

  // Handle thumbnail click
  const handleThumbnailClick = (index) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
      setActiveSlideIndex(index);
      // Mobile-specific fix: force update after slideTo
      if (typeof window !== 'undefined' && window.innerWidth <= 991.98) {
        setTimeout(() => {
          if (swiperRef.current && swiperRef.current.update) {
            swiperRef.current.update();
          }
        }, 100);
      }
    }
  };

  const handleMainImageClick = (index) => {
    // Open full-screen modal on mobile click or if zoom is triggered
    if (typeof window !== 'undefined' && window.innerWidth <= 991) {
      setActiveSlideIndex(index);
      setIsZoomModalOpen(true);
    }
  };

  return (
    <div className="thumbs-slider">
      <Swiper
        className="swiper tf-product-media-thumbs"
        dir="ltr"
        direction="vertical"
        spaceBetween={10}
        slidesPerView={thumbSlidePerView}
        onSwiper={swiper => { thumbsSwiperRef.current = swiper; }}
        modules={[Thumbs]}
        initialSlide={1}
        breakpoints={{
          0: {
            direction: "horizontal",
            slidesPerView: thumbSlidePerViewOnMobile,
          },
          820: {
            direction: "horizontal",
            slidesPerView:
              thumbSlidePerViewOnMobile < 4
                ? thumbSlidePerViewOnMobile + 1
                : thumbSlidePerViewOnMobile,
          },
          920: {
            direction: "horizontal",
            slidesPerView:
              thumbSlidePerViewOnMobile < 4
                ? thumbSlidePerViewOnMobile + 2
                : thumbSlidePerViewOnMobile,
          },
          1020: {
            direction: "horizontal",
            slidesPerView:
              thumbSlidePerViewOnMobile < 4
                ? thumbSlidePerViewOnMobile + 2.5
                : thumbSlidePerViewOnMobile,
          },
          1200: {
            direction: "vertical",
            slidesPerView: thumbSlidePerView,
          },
        }}
        style={{ maxHeight: '531px' }}
      >
        {items.map((slide, index) => (
          <SwiperSlide
            className="swiper-slide stagger-item"
            data-color={slide.color}
            key={index}
            onClick={() => handleThumbnailClick(index)}
          >
            <div className="item" style={{ 
              aspectRatio: '3/4', 
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              margin: '8px 0 8px 8px'
            }}
            >
              <Image
                className="lazyload"
                alt={slide.alt || (productTitle ? `${productTitle} - Thumbnail` : "Authentic Nepali Traditional Fashion Thumbnail")}
                src={slide.thumbnailSrc || '/logo.png'}
                width={slide.width ? slide.width * 0.6 : 80}
                height={slide.height ? slide.height * 0.6 : 100}
                sizes="(max-width: 768px) 60px, 80px"
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: index === activeSlideIndex ? '2px solid #E43131' : '1px solid #f0f0f0',
                  transition: 'border 0.2s ease',
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <Swiper
          dir="ltr"
          className="swiper tf-product-media-main"
          id="gallery-swiper-started"
          spaceBetween={10}
          slidesPerView={1}
          modules={[Thumbs, Zoom]}
          zoom={{
            maxRatio: 3,
            minRatio: 1,
            toggle: true,
          }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
          style={{ 
            aspectRatio: '2/3',
            width: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {items.map((slide, index) => (
            <SwiperSlide key={index} className="swiper-slide" data-color={slide.color || "gray"}>
              <div
                className="swiper-zoom-container"
                onClick={() => handleMainImageClick(index)}
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  aspectRatio: '2/3',
                  transition: 'transform 0.3s ease',
                  touchAction: 'pan-y pinch-zoom',
                }}
              >
                <Image
                  className="lazyload drift-zoom-target"
                  alt={slide.alt || (productTitle ? `${productTitle} - Authentic Nepali Traditional Clothing` : "Authentic Nepali Traditional Clothing")}
                  src={slide.src || '/logo.png'}
                  width={600}
                  height={800}
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 400px"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}
                  ref={el => {
                    if (el) {
                      imageRefs.current[index] = el;
                    }
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Floating Zoom Button - Highly Visible on Mobile */}
        <button
          type="button"
          onClick={() => {
            setActiveSlideIndex(swiperRef.current?.activeIndex || 0);
            setIsZoomModalOpen(true);
          }}
          aria-label="Zoom product image"
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            zIndex: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#181818',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
            borderRadius: '24px',
            padding: '7px 13px',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: '"Outfit", sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.16)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.94)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.12)';
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E43131" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <span>Zoom</span>
        </button>
      </div>

      {/* Fullscreen Mobile Zoom Modal */}
      <ProductZoomModal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        items={items}
        initialIndex={activeSlideIndex}
        productTitle={productTitle}
      />
    </div>
  );
}

