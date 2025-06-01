"use client";
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
    let newItems;
    if (useGallery) {
      newItems = gallery.map((item, idx) => ({
        id: idx + 2, // Start from 2 to leave room for main image and hover image
        src: item.url,
        alt: `Gallery image ${idx + 1}`,
        color: activeColor,
        width: 600,
        height: 800
      }));
      // Add the main product image and hover image at the beginning
      if (firstItem) {
        newItems.unshift({
          id: 0,
          src: firstItem,
          alt: "Main product image",
          color: activeColor,
          width: 600,
          height: 800
        });
      }
      if (imgHover && imgHover !== firstItem) {
        newItems.splice(1, 0, {
          id: 1,
          src: imgHover,
          alt: "Product hover image",
          color: activeColor,
          width: 600,
          height: 800
        });
      }
    } else {
      newItems = [...slideItems];
      newItems[0].src = firstItem ?? newItems[0].src;
    }
    setItems(newItems);
  }, [useGallery, gallery, slideItems, firstItem, imgHover, activeColor]);
  
  // --- NEW: Reset Swiper to first slide on items/color change (mobile fix) ---
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
      setTimeout(() => {
        swiperRef.current.update && swiperRef.current.update();
      }, 100);
    }
  }, [items, activeColor]);
  
  useEffect(() => {
    setTimeout(() => {
      if (swiperRef.current && !useGallery) {
        swiperRef.current.slideTo(1);
        const slideIndex = items.filter((elm) => elm.color == activeColor)[0]?.id - 1;
        if (slideIndex !== undefined) {
          swiperRef.current.slideTo(slideIndex);
        }
      }
    });
  }, []);

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
                data-src={slide.src}
                alt={slide.alt}
                src={slide.src}
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
        style={{ maxHeight: '531px' }}
      >
        {items.map((slide, index) => (
          <SwiperSlide key={index} className="swiper-slide" data-color={slide.color || "gray"}>
            <div
              style={{ 
                cursor: 'pointer', 
                display: 'block',
                transition: 'transform 0.3s ease'
              }}
            >
              <Image
                className="lazyload drift-zoom-target"
                data-src={slide.src}
                alt={slide.alt || ""}
                src={slide.src}
                width={600}
                height={800}
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '3/4',
                  objectFit: 'contain',
                  margin: '0 auto',
                  maxHeight: '531px',
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
