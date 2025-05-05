"use client";
import { slides } from "@/data/singleProductSliders";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { useEffect, useRef, useState, useMemo } from "react";
import { Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

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

  const lightboxRef = useRef(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  
  // Function to open lightbox manually
  const openLightbox = (index) => {
    if (lightboxRef.current) {
      lightboxRef.current.loadAndOpen(index);
    }
  };
  
  useEffect(() => {
    // Initialize PhotoSwipeLightbox
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#gallery-swiper-started",
      children: ".pswp-item",
      pswpModule: () => import("photoswipe"),
    });

    lightbox.init();

    // Store the lightbox instance in the ref for later use
    lightboxRef.current = lightbox;

    // Cleanup: destroy the lightbox when the component unmounts
    return () => {
      lightbox.destroy();
      lightboxRef.current = null;
    };
  }, []);
  
  // Function to get the image URL for the selected color
  const getColorImageUrl = (colorName) => {
    // Check if we have color objects with imgSrc property in the slideItems
    const colorObj = slideItems.find(item => 
      item.color && item.color.toLowerCase() === colorName.toLowerCase() && item.imgSrc
    );
    
    // Return the color's image URL if found, otherwise use the first item
    return colorObj?.imgSrc || firstItem;
  };
  
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
        onSwiper={setThumbsSwiper}
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
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
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
        thumbs={{ swiper: thumbsSwiper }}
        modules={[Thumbs]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => {
          if (items[swiper.activeIndex]) {
            setActiveIndex(swiper.activeIndex);
            if (items[swiper.activeIndex]?.color) {
              setActiveColor(items[swiper.activeIndex].color.toLowerCase());
            }
          }
        }}
        style={{ maxHeight: '531px' }}
      >
        {items.map((slide, index) => (
          <SwiperSlide key={index} className="swiper-slide" data-color={slide.color || "gray"}>
            <a
              href={slide.src}
              target="_blank"
              className="pswp-item"
              data-pswp-width={slide.width}
              data-pswp-height={slide.height}
              onClick={(e) => {
                e.preventDefault();
                openLightbox(index);
              }}
              style={{ 
                cursor: 'pointer', 
                display: 'block',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Image
                className="lazyload"
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
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
