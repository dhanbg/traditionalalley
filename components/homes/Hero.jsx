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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await fetchDataFromApi("/api/hero-slides?populate=*");
        const transformedSlides = data.data.map((item) => ({
          imgSrc: `${API_URL}${item.imgSrc?.url || item.imgSrc?.formats?.large?.url || ""}`,
          alt: item.alt || "fashion-slideshow",
          subheading: item.subheading || "",
          heading: item.heading?.replace("<br/>", "\n") || "",
          btnText: item.btnText || "Shop Now",
        }));
        setSlides(transformedSlides);
      } catch (error) {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  if (loading) {
    return (
      <section className="tf-slideshow slider-default slider-effect-fade" style={{minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="text-center">
          <div className="spinner-border" role="status" style={{width: 60, height: 60, borderColor: '#f3f3f3', borderTopColor: '#e43131', borderWidth: 6}}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </section>
    );
  }

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
                priority={index === 0 || slide.imgSrc.includes('p2_2215d1f166.jpg')}
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
