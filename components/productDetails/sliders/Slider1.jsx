"use client";
import { slides } from "@/data/singleProductSliders";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { useEffect, useRef, useState } from "react";
import { Navigation, Thumbs } from "swiper/modules";
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
  
  let items = [...slideItems];
  
  // If we have a gallery from API, use that instead
  if (useGallery) {
    items = gallery.map((item, idx) => ({
      id: idx + 2, // Start from 2 to leave room for main image and hover image
      src: item.url,
      alt: `Gallery image ${idx + 1}`,
      color: activeColor,
      width: 600,
      height: 800
    }));
    
    // Add the main product image and hover image at the beginning
    // If we have a firstItem (main product image), add it at the beginning
    if (firstItem) {
      items.unshift({
        id: 0,
        src: firstItem,
        alt: "Main product image",
        color: activeColor,
        width: 600,
        height: 800
      });
    }
    
    // If we have an imgHover, add it as second item
    if (imgHover && imgHover !== firstItem) {
      items.splice(1, 0, {
        id: 1,
        src: imgHover,
        alt: "Product hover image",
        color: activeColor,
        width: 600,
        height: 800
      });
    }
  } else {
    // Using default slide items
    items[0].src = firstItem ?? items[0].src;
  }

  const lightboxRef = useRef(null);
  useEffect(() => {
    // Initialize PhotoSwipeLightbox
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#gallery-swiper-started",
      children: ".item",
      pswpModule: () => import("photoswipe"),
    });

    lightbox.init();

    // Store the lightbox instance in the ref for later use
    lightboxRef.current = lightbox;

    // Cleanup: destroy the lightbox when the component unmounts
    return () => {
      lightbox.destroy();
    };
  }, []);

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  
  // Function to get the image URL for the selected color
  const getColorImageUrl = (colorName) => {
    // Check if we have color objects with imgSrc property in the slideItems
    const colorObj = slideItems.find(item => 
      item.color && item.color.toLowerCase() === colorName.toLowerCase() && item.imgSrc
    );
    
    // Return the color's image URL if found, otherwise use the first item
    return colorObj?.imgSrc || firstItem;
  };
  
  useEffect(() => {
    if (!useGallery && !(items[activeIndex].color == activeColor)) {
      const slideIndex =
        items.filter((elm) => elm.color == activeColor)[0]?.id - 1;
      if (swiperRef.current && slideIndex !== undefined) {
        swiperRef.current.slideTo(slideIndex);
      }
    }
    
    // If the activeColor changes, update the main image with the image for that color
    if (useGallery) {
      // Find image URL for the selected color
      const colorImageUrl = getColorImageUrl(activeColor);
      
      // If we have a color-specific image, update the first item
      if (colorImageUrl && items.length > 0) {
        items[0].src = colorImageUrl;
        
        // If the swiper is initialized, slide to the first image
        if (swiperRef.current) {
          swiperRef.current.slideTo(0);
        }
      }
    }
  }, [activeColor, useGallery, items, activeIndex, firstItem]);
  
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
      >
        {items.map((slide, index) => (
          <SwiperSlide
            className="swiper-slide stagger-item"
            data-color={slide.color}
            key={index}
          >
            <div className="item" style={{ aspectRatio: '3/4' }}>
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
                  borderRadius: '8px'
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
            setActiveColor(items[swiper.activeIndex]?.color.toLowerCase());
          }
        }}
      >
        {items.map((slide, index) => (
          <SwiperSlide key={index} className="swiper-slide" data-color="gray">
            <a
              href={slide.src}
              target="_blank"
              className="item"
              data-pswp-width={slide.width}
              data-pswp-height={slide.height}
              //   onClick={() => openLightbox(index)}
            >
              <Image
                className="lazyload"
                data-src={slide.src}
                alt=""
                src={slide.src}
                width={slide.width * 0.6}
                height={slide.height * 0.6}
                style={{
                  height: '100%',
                  width: '80%',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  margin: '0 auto'
                }}
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
