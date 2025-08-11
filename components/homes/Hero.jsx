"use client";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { getImageUrl } from "@/utils/imageUtils";
import { slides as staticSlides } from "@/data/heroSlides"; 

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRefs = useRef([]);
  const slideTimeoutRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        if (typeof window !== "undefined") {
          const data = await fetchDataFromApi("/api/hero-slides?populate=*");
          const transformedSlides = data.data.map((item) => {
            const media = item.media;
            let mediaUrl = "";
            let mediaType = "image";
            let fallbackImageUrl = "";
            
            if (media) {
              // Handle media field which can contain images, videos, or audio
              mediaUrl = media.url || media.formats?.large?.url || "";
              
              // Determine media type based on MIME type or file extension
              const mimeType = media.mime || "";
              const fileExt = media.ext || "";
              
              if (mimeType.startsWith("video/") || ['.mp4', '.webm', '.mov', '.avi'].includes(fileExt.toLowerCase())) {
                mediaType = "video";
              } else if (mimeType.startsWith("audio/") || ['.mp3', '.wav', '.ogg'].includes(fileExt.toLowerCase())) {
                mediaType = "audio";
              } else {
                mediaType = "image";
              }
            }
            
            // For video/audio, we might need a fallback image
            fallbackImageUrl = item.poster?.url || item.poster?.formats?.large?.url || mediaUrl;
            
            const result = {
              imgSrc: getImageUrl(mediaType === 'image' ? mediaUrl : fallbackImageUrl),
              videoSrc: mediaType === 'video' ? getImageUrl(mediaUrl) : null,
              audioSrc: mediaType === 'audio' ? getImageUrl(mediaUrl) : null,
              mediaType: mediaType,
              alt: item.alt || "fashion-slideshow",
              subheading: item.subheading || "",
              heading: item.heading?.replace("<br/>", "\n") || "",
              btnText: item.btnText || "Shop Now",
              poster: item.poster ? getImageUrl(item.poster?.url || item.poster?.formats?.large?.url) : getImageUrl(fallbackImageUrl),
            };
            
            // Debug logging for video URLs
            if (mediaType === 'video') {
              console.log('🎥 Video slide detected:');
              console.log('Original mediaUrl:', mediaUrl);
              console.log('Constructed videoSrc:', result.videoSrc);
              console.log('Media object:', media);
            }
            
            return result;
          });
          setSlides(transformedSlides);
        }
      } catch (error) {
        console.error("Error fetching slides:", error);
        console.log("🔄 Falling back to static slides due to API error");
        // Fallback to static slides if API fails
        setSlides(staticSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
    
    // Cleanup timeout on unmount
    return () => {
      if (slideTimeoutRef.current) {
        clearTimeout(slideTimeoutRef.current);
      }
    };
  }, []);

  // Handle video/audio play/pause on slide change
  const handleSlideChange = (swiper) => {
    // Store swiper reference
    swiperRef.current = swiper;
    
    // Clear any existing timeout
    if (slideTimeoutRef.current) {
      clearTimeout(slideTimeoutRef.current);
    }
    
    // Pause all videos and audio
    videoRefs.current.forEach((media) => {
      if (media && !media.paused) {
        media.pause();
      }
    });
    
    const currentSlide = slides[swiper.activeIndex];
    const currentMedia = videoRefs.current[swiper.activeIndex];
    
    if (currentMedia && currentMedia.tagName === 'VIDEO') {
      // For video slides: wait for video to end
      currentMedia.play().catch(() => {
        // Handle autoplay restrictions - if video can't play, advance after delay
        slideTimeoutRef.current = setTimeout(() => {
          handleVideoEnd();
        }, 5000);
      });
    } else {
      // For image/audio slides: advance after 5 seconds
      slideTimeoutRef.current = setTimeout(() => {
        handleVideoEnd();
      }, 5000);
    }
  };

  const handleVideoEnd = () => {
    // Move to next slide when video ends
    if (swiperRef.current) {
      const currentIndex = swiperRef.current.activeIndex;
      const totalSlides = slides.length;
      
      // Check if we're at the last slide
      if (currentIndex === totalSlides - 1) {
        // Go back to first slide to restart the loop
        swiperRef.current.slideTo(0);
      } else {
        // Move to next slide
        swiperRef.current.slideNext();
      }
    }
  };

  // Handle video ended event
  const onVideoEnded = () => {
    handleVideoEnd();
  };

  // CSS for animated transition
  const blurStyle = {
    filter: loading || !imageLoaded ? "blur(10px)" : "blur(0px)",
    transition: "filter 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: loading ? 0.7 : 1,
    transform: loading ? "scale(1.05)" : "scale(1)",
  };

  const contentStyle = {
    opacity: loading || !imageLoaded ? 0 : 1,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    transition: 'opacity 0.8s ease, transform 0.8s ease'
  };

  return (
    <section className="tf-slideshow slider-default slider-position slider-effect-fade">
      <Swiper
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        loop={slides.length > 1} // Enable loop only if there are enough slides
        modules={[EffectFade, Autoplay, Pagination]}
        autoplay={false}
        pagination={{
          clickable: true,
          el: ".spd55",
        }}
        onSlideChange={handleSlideChange}
        onSwiper={(swiper) => {
              // Store swiper reference
              swiperRef.current = swiper;
              // Auto-play first video if it exists
              setTimeout(() => {
                const firstMedia = videoRefs.current[0];
                if (firstMedia && firstMedia.tagName === 'VIDEO') {
                  firstMedia.play().catch(() => {
                    // Auto-play failed, which is expected in some browsers
                  });
                }
                // Note: Audio elements are not auto-played for better UX
              }, 500);
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
          slides.map((slide, index) => {
            // Debug logging for each slide
            console.log(`🔍 Slide ${index}:`, {
              mediaType: slide.mediaType,
              hasVideoSrc: !!slide.videoSrc,
              videoSrc: slide.videoSrc,
              slide: slide
            });
            
            return (
            <SwiperSlide key={index}>
              <div className="wrap-slider" style={blurStyle}>
                {slide.mediaType === 'video' && slide.videoSrc ? (
                  <>
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      width={1920}
                      height={803}
                      muted
                      playsInline
                      poster={slide.poster || slide.imgSrc}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onLoadedData={() => setImageLoaded(true)}
                      onEnded={onVideoEnded}
                    >
                      <source src={slide.videoSrc} type="video/mp4" />
                      <source src={slide.videoSrc} type="video/webm" />
                      {/* Fallback image if video fails to load */}
                      <Image
                        alt={slide.alt}
                        src={slide.imgSrc}
                        width={1920}
                        height={803}
                        quality={100}
                        priority={index === 0}
                      />
                    </video>
                  </>
                ) : slide.mediaType === 'audio' && slide.audioSrc ? (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    backgroundColor: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Image
                      alt={slide.alt}
                      src={slide.poster || slide.imgSrc}
                      width={1920}
                      height={803}
                      quality={100}
                      priority={index === 0}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.5
                      }}
                      onLoad={() => setImageLoaded(true)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '320px',
                      maxWidth: '100%'
                    }}>
                      <audio
                        ref={(el) => (videoRefs.current[index] = el)}
                        controls
                        preload="metadata"
                        style={{
                          width: '100%'
                        }}
                      >
                        <source src={slide.audioSrc} type="audio/mpeg" />
                        <source src={slide.audioSrc.replace('.mp3', '.ogg')} type="audio/ogg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                ) : (
                  <Image
                    alt={slide.alt}
                    src={slide.imgSrc}
                    width={1920}
                    height={803}
                    quality={100}
                    priority={index === 0 || slide.imgSrc.includes('p2_2215d1f166.jpg')}
                    onLoad={() => setImageLoaded(true)}
                  />
                )}
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
            );
          })
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
