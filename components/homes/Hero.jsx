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
  const [imageLoaded, setImageLoaded] = useState(false);

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
        // Add a slight delay before removing blur for a smoother effect
        setTimeout(() => {
          setImageLoaded(true);
        }, 300);
      }
    };
    fetchSlides();
  }, []);

  // CSS for animated transition
  const blurStyle = {
    filter: loading || !imageLoaded ? "blur(10px)" : "blur(0px)",
    transition: "filter 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: loading ? 0.7 : 1,
    transform: loading ? "scale(1.05)" : "scale(1)",
  };

  const contentStyle = {
    opacity: loading || !imageLoaded ? 0 : 1,
    transform: loading || !imageLoaded ? "translateY(20px)" : "translateY(0)",
    transition: "opacity 0.8s ease, transform 0.8s ease"
  };

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
        {loading ? (
          <SwiperSlide>
            <div className="wrap-slider">
              <div style={{ 
                width: "100%", 
                height: "803px", 
                backgroundColor: "#f5f5f5",
                backgroundImage: "linear-gradient(110deg, #f5f5f5 30%, #e9e9e9 50%, #f5f5f5 70%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s infinite linear"
              }}></div>
              <style jsx>{`
                @keyframes shimmer {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
              `}</style>
            </div>
          </SwiperSlide>
        ) : (
          slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="wrap-slider" style={blurStyle}>
                <Image
                  alt={slide.alt}
                  src={slide.imgSrc}
                  width={1920}
                  height={803}
                  quality={100}
                  priority={index === 0 || slide.imgSrc.includes('p2_2215d1f166.jpg')}
                  onLoad={() => setImageLoaded(true)}
                />
                <div className="box-content" style={contentStyle}>
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
          ))
        )}
      </Swiper>
      <div className="wrap-pagination">
        <div className="container">
          <div className="sw-dots sw-pagination-slider type-circle white-circle justify-content-center spd55" />
        </div>
      </div>
    </section>
  );
}
