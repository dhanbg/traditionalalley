"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls"; 

export default function Hero() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await fetchDataFromApi("/api/hero-slides?populate=*"); // Directly use the data returned by the function
        console.log(data); // Debugging API response
        const transformedSlides = data.data.map((item) => ({
          imgSrc: `${API_URL}${item.imgSrc?.url || item.imgSrc?.formats?.large?.url || ""}`,
          alt: item.alt || "fashion-slideshow",
          subheading: item.subheading || "",
          heading: item.heading?.replace("<br/>", "\n") || "",
          btnText: item.btnText || "Shop Now",
        }));
        setSlides(transformedSlides);
      } catch (error) {
        console.error("Failed to fetch slides:", error);
      }
    };

    fetchSlides();
  }, []);

  return (
    <section className="tf-slideshow slider-default slider-effect-fade">
      <Swiper
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        loop={slides.length > 1} // Enable loop only if there are enough slides
        modules={[EffectFade, Autoplay, Pagination]}
        autoplay={{ delay: 3000 }}
        pagination={{
          clickable: true,
          el: ".spd55",
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="wrap-slider">
              <Image
                alt={slide.alt}
                src={slide.imgSrc}
                width={1920}
                height={803}
                quality={100}
                priority
              />
              <div className="box-content">
                <div className="content-slider">
                  <div className="box-title-slider">
                    <p className="fade-item fade-item-1 subheading text-btn-uppercase text-white">
                      {slide.subheading}
                    </p>
                    <div className="fade-item fade-item-2 heading text-white title-display">
                      {slide.heading.split("\n").map((line, idx) => (
                        <span key={idx}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="fade-item fade-item-3 box-btn-slider">
                    <Link
                      href="/shop-default-grid"
                      className="tf-btn btn-fill btn-white"
                    >
                      <span className="text">{slide.btnText}</span>
                      <i className="icon icon-arrowUpRight" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="wrap-pagination">
        <div className="container">
          <div className="sw-dots sw-pagination-slider type-circle white-circle justify-content-center spd55" />
        </div>
      </div>
    </section>
  );
}
