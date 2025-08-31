"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import Image from "next/image";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { getImageUrl } from "@/utils/imageUtils";
import { slides as staticSlides } from "@/data/heroSlides";
import { debugApiCall, debugApiResponse, debugComponentMount } from "@/utils/debug"; 

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDetected, setMobileDetected] = useState(false);
  const videoRefs = useRef([]);
  const slideTimeoutRef = useRef(null);
  const swiperRef = useRef(null);

  // Hook to detect mobile screen size
  const checkMobile = useCallback(() => {
    const width = window.innerWidth;
    const newIsMobile = width <= 768;
    setIsMobile(newIsMobile);
    setMobileDetected(true);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [checkMobile]);

  useEffect(() => {
    debugComponentMount('Hero');
    
    // Only fetch slides after mobile detection is complete
    if (!mobileDetected) {
      return;
    }

    const fetchSlides = async () => {
      try {
        if (typeof window !== "undefined") {
          const endpoint = "/api/hero-slides?populate=*";
          
          // Debug API call
          debugApiCall(endpoint, 'GET');
          console.log('🎬 Hero - Fetching slides:', {
            endpoint,
            isMobile,
            mobileDetected,
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            timestamp: new Date().toISOString()
          });
          
          // Use Next.js API route with direct fetch
          const response = await fetch(endpoint);
          const data = await response.json();
          
          // Debug API response
          debugApiResponse(endpoint, response, data);
          console.log('🎭 Hero - API Response:', {
            success: response.ok,
            status: response.status,
            dataCount: data?.data?.length || 0,
            hasData: !!(data?.data && data.data.length > 0),
            timestamp: new Date().toISOString()
          });
          
          const transformedSlides = data.data.map((item, index) => {
            // Select media based on screen size
            const selectedMedia = isMobile && item.mobileMedia ? item.mobileMedia : item.media;
            
            console.log(`🎯 Hero - Processing slide ${index}:`, {
              documentId: item.documentId,
              isMobile,
              hasMobileMedia: !!item.mobileMedia,
              hasDesktopMedia: !!item.media,
              selectedMediaType: selectedMedia === item.mobileMedia ? 'mobile' : 'desktop',
              selectedMediaUrl: selectedMedia?.url
            });
            
            const media = selectedMedia;
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
              console.log('\n🎥 VIDEO SLIDE DETECTED:');
              console.log('📱 Screen type:', isMobile ? 'Mobile' : 'Desktop');
              console.log('🎯 Selected media:', selectedMedia === item.mobileMedia ? 'mobileMedia' : 'media');
              console.log('🔗 Original mediaUrl:', mediaUrl);
              console.log('📹 Constructed videoSrc:', result.videoSrc);
              console.log('📦 Media object:', media);
              console.log('🔍 FINAL RESULT:', {
                isMobile,
                hasMobileMedia: !!item.mobileMedia,
                selectedMobileMedia: selectedMedia === item.mobileMedia,
                videoSrc: result.videoSrc
              });
            }
            
            // Additional comprehensive logging for all media types
            console.log(`\n🎬 RENDERING SLIDE ${data.data.indexOf(item)}:`);
            console.log('📱 Current isMobile:', isMobile);
            console.log('🎯 selectedMedia === item.mobileMedia:', selectedMedia === item.mobileMedia);
            console.log('📹 Final imgSrc:', result.imgSrc);
            console.log('📹 Final videoSrc:', result.videoSrc);
            console.log('🔗 Original selectedMedia URL:', selectedMedia?.url);
            console.log('📱 Available mobileMedia URL:', item.mobileMedia?.url);
            console.log('🖥️ Available desktop media URL:', item.media?.url);
            
            if (selectedMedia === item.mobileMedia) {
              console.log('✅ CONFIRMED: Using MOBILE media for slide', data.data.indexOf(item));
            } else {
              console.log('ℹ️ CONFIRMED: Using DESKTOP media for slide', data.data.indexOf(item));
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
  }, [isMobile, mobileDetected]); // Re-fetch when isMobile changes or mobile detection completes

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

  // CSS for animated transition - Removed dark loading effect
  const blurStyle = {
    filter: !imageLoaded ? "blur(5px)" : "blur(0px)",
    transition: "filter 0.3s ease-in-out",
    opacity: !imageLoaded ? 0.9 : 1,
    transform: "scale(1)", // Removed scaling effect
  };

  const contentStyle = {
    opacity: !imageLoaded ? 0.8 : 1, // Only fade based on image load, not loading state
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    transition: 'opacity 0.3s ease' // Faster transition
  };

  // Force consistent spacing and height from Hero component side
  const heroWrapperStyle = {
    marginBottom: isMobile ? '0px' : '0px', // Remove any default margins
    paddingBottom: '0px', // Ensure no bottom padding
    height: isMobile ? '70vh' : '90vh', // Increased height to prevent cutting top content
    minHeight: isMobile ? '500px' : '700px', // Increased minimum height
    position: 'relative',
    overflow: 'visible' // Changed from hidden to visible to prevent cutting content
  };

  return (
    <section className="tf-slideshow slider-default slider-position slider-effect-fade" style={heroWrapperStyle}>
      <Swiper
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        loop={slides.length > 1} // Enable loop only if there are enough slides
        modules={[EffectFade, Autoplay, Pagination]}
        autoplay={false}
        style={{ height: '100%' }} // Ensure Swiper fills the parent container
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
        {slides.map((slide, index) => {
            return (
              <SwiperSlide key={index}>
              <div className="wrap-slider" style={{...blurStyle, height: '100%'}}>
                {slide.mediaType === 'video' && slide.videoSrc ? (
                  <>
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      width={1920}
                      height={803}
                      autoPlay
                      muted
                      playsInline
                      preload="metadata"
                      poster={slide.poster || slide.imgSrc}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: isMobile ? 'center bottom' : 'center center',
                        backgroundColor: 'transparent', // Removed black background
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
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: isMobile ? 'center bottom' : 'center center'
                    }}
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
          )
        })}
      </Swiper>
      <div className="wrap-pagination">
        <div className="container">
          <div className="sw-dots sw-pagination-slider type-circle white-circle justify-content-center spd55" />
        </div>
      </div>
    </section>
  );
}
