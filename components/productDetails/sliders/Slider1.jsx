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
  slideItems = slides,
  thumbSlidePerView = 6,
  thumbSlidePerViewOnMobile = 6,
}) {
  const items = [...slideItems];
  items[0].src = firstItem ?? items[0].src;

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
  useEffect(() => {
    if (!(items[activeIndex].color == activeColor)) {
      const slideIndex =
        items.filter((elm) => elm.color == activeColor)[0]?.id - 1;
      swiperRef.current.slideTo(slideIndex);
    }
  }, [activeColor]);
  useEffect(() => {
    setTimeout(() => {
      if (swiperRef.current) {
        swiperRef.current.slideTo(1);
        swiperRef.current.slideTo(
          items.filter((elm) => elm.color == activeColor)[0]?.id - 1
        );
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
