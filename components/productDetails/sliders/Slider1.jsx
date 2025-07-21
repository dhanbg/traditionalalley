"use client";
import { API_URL } from "@/utils/urls";
import { getImageUrl } from "@/utils/imageUtils";
import { slides } from "@/data/singleProductSliders";
import { useEffect, useRef, useState, useMemo } from "react";
import { Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Drift from 'drift-zoom';

export default function Slider1({
  activeColor = "gray",
  setActiveColor = () => {},
  firstItem,
  imgHover,
  gallery = [],
  slideItems = slides,
  thumbSlidePerView = 6,
  thumbSlidePerViewOnMobile = 6,
}) {
  // Use gallery if provided, or fallback to slideItems
  const useGallery = gallery && gallery.length > 0;
  
  // --- NEW: items as state, update on relevant changes ---
  const [items, setItems] = useState([]);
  const driftInstancesRef = useRef([]);
  const swiperRef = useRef(null);
  const imageRefs = useRef([]);

  useEffect(() => {
    // Helper function to generate thumbnail URL from main URL
    const generateThumbnailUrl = (mainUrl) => {
      if (!mainUrl) return mainUrl;
      
      // Convert: /uploads/DSC_05252_570f97c504.jpg
      // To: /uploads/thumbnail_DSC_05252_570f97c504.jpg
      const urlParts = mainUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      if (filename && !filename.startsWith('thumbnail_')) {
        const thumbnailFilename = `thumbnail_${filename}`;
        urlParts[urlParts.length - 1] = thumbnailFilename;
        return urlParts.join('/');
      }
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
            alt: `Gallery image ${idx + 1}`,
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
          alt: "Main product image",
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
          alt: "Product hover image",
          color: activeColor,
          width: 600,
          height: 800
        });
      }
    } else {
      newItems = [...slideItems].filter(item => item.src && typeof item.src === 'string' && item.src.trim() !== ''); // Filter out empty URLs
      if (firstItem && typeof firstItem === 'string' && firstItem.trim() !== '' && newItems[0]) {
        newItems[0].src = firstItem;
        newItems[0].thumbnailSrc = generateThumbnailUrl(firstItem); // Generate thumbnail for main product
      }
      // Add thumbnailSrc to existing items if not present
      newItems = newItems.map(item => ({
        ...item,
        thumbnailSrc: item.thumbnailSrc || generateThumbnailUrl(item.src) || item.src
      }));
    }
    setItems(newItems);
  }, [useGallery, gallery, slideItems, firstItem, imgHover]);
  
  // --- NEW: Reset Swiper to first slide on items/color change (mobile fix) ---
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
      setTimeout(() => {
        swiperRef.current.update && swiperRef.current.update();
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
          handleTouch: true,
          inlineOffsetX: 0,
          inlineOffsetY: 0,
          hoverDelay: 0,
          boundingBoxContainer: document.body
        });
        driftInstancesRef.current[index] = driftInstance;
      }
    });

    // Register swiper slide change event to update zoom
    if (swiperRef.current) {
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
              handleTouch: true,
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

  return (
    <div className="thumbs-slider">
      <Swiper
        className="swiper tf-product-media-thumbs"
        dir="ltr"
        direction="vertical"
        spaceBetween={10}
        slidesPerView={thumbSlidePerView}
        onSwiper={swiper => { swiperRef.current = swiper; }}
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
                data-src={slide.thumbnailSrc || '/logo.png'}
                alt={slide.alt}
                src={slide.thumbnailSrc || '/logo.png'}
                width={slide.width * 0.6}
                height={slide.height * 0.6}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        dir="ltr"
        className="swiper tf-product-media-main"
        id="gallery-swiper-started"
        spaceBetween={10}
        slidesPerView={1}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        style={{ 
          aspectRatio: '2/3',
          maxWidth: '400px',
          margin: '0 auto'
        }}
      >
        {items.map((slide, index) => (
          <SwiperSlide key={index} className="swiper-slide" data-color={slide.color || "gray"}>
            <div
              style={{ 
                cursor: 'pointer', 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                aspectRatio: '2/3',
                transition: 'transform 0.3s ease'
              }}
            >
              <Image
                className="lazyload drift-zoom-target"
                data-src={slide.src || '/logo.png'}
                alt={slide.alt || ""}
                src={slide.src || '/logo.png'}
                width={600}
                height={800}
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
    </div>
  );
}
