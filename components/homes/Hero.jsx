"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

import "swiper/css/autoplay";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/utils/imageUtils";
 

export default function Hero({ initialSlidesRaw = null, isMobileInitial = false }) {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  // Use server-provided initial mobile flag to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState(isMobileInitial);
  const [mobileDetected, setMobileDetected] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState(new Set());
  const [videoLoadingStates, setVideoLoadingStates] = useState(new Map());
  const [showIntroImage, setShowIntroImage] = useState(true);
  const [firstVideoReady, setFirstVideoReady] = useState(false);
  const [firstVideoPlaying, setFirstVideoPlaying] = useState(false);
  const [firstMediaReady, setFirstMediaReady] = useState(false);
  const videoRefs = useRef([]);
  const playPromisesRef = useRef([]);
  const swiperRef = useRef(null);
  const slideTimeoutRef = useRef(null);

  // Function to validate video source
  const validateVideoSource = async (videoSrc) => {
    if (!videoSrc) return false;
    try {
      const response = await fetch(videoSrc, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('Video source validation failed:', error);
      return false;
    }
  };

  // Hook to detect mobile screen size
  const checkMobile = useCallback(() => {
    const width = window.innerWidth;
    const newIsMobile = width <= 768;
    setIsMobile(newIsMobile);
    setMobileDetected(true);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [checkMobile]);

  // Removed intro overlay minimum display timer; overlay hides when media is ready

  useEffect(() => {
    // Only fetch slides after mobile detection is complete
    if (!mobileDetected) {
      return;
    }

    const fetchSlides = async () => {
      try {
        if (initialSlidesRaw && Array.isArray(initialSlidesRaw)) {
          const transformedSlides = initialSlidesRaw.map((item) => {
            const selectedMedia = isMobile && item.mobileMedia ? item.mobileMedia : item.media;

            const media = selectedMedia;
            let mediaUrl = "";
            let mediaType = "image";
            let fallbackImageUrl = "";

            if (media) {
              mediaUrl = media.url || media.formats?.large?.url || "";
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

            fallbackImageUrl = item.poster?.url || item.poster?.formats?.large?.url || mediaUrl;

          return {
            id: item.id,
            documentId: item.documentId,
            imgSrc: getImageUrl(mediaType === 'image' ? mediaUrl : fallbackImageUrl),
            videoSrc: mediaType === 'video' ? getImageUrl(mediaUrl) : null,
            audioSrc: mediaType === 'audio' ? getImageUrl(mediaUrl) : null,
            mediaType,
            alt: item.alt || "fashion-slideshow",
            subheading: item.subheading || "",
            heading: item.heading?.replace("<br/>", "\n") || "",
            btnText: item.btnText || "Shop Now",
            poster: item.poster ? getImageUrl(item.poster?.url || item.poster?.formats?.large?.url) : getImageUrl(fallbackImageUrl),
            // Carry forward videoName for product filtering (prefer mobileMedia name)
            videoName: item.videoName || item?.mobileMedia?.name || null,
          };
          });
          setSlides(transformedSlides);
        } else if (typeof window !== "undefined") {
          const endpoint = "/api/hero-slides?populate=*";
          const response = await fetch(endpoint);
          const data = await response.json();
          const transformedSlides = data.data.map((item) => {
            const selectedMedia = isMobile && item.mobileMedia ? item.mobileMedia : item.media;
            const media = selectedMedia;
            let mediaUrl = "";
            let mediaType = "image";
            let fallbackImageUrl = "";
            if (media) {
              mediaUrl = media.url || media.formats?.large?.url || "";
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
            fallbackImageUrl = item.poster?.url || item.poster?.formats?.large?.url || mediaUrl;
            return {
              id: item.id,
              documentId: item.documentId,
              imgSrc: getImageUrl(mediaType === 'image' ? mediaUrl : fallbackImageUrl),
              videoSrc: mediaType === 'video' ? getImageUrl(mediaUrl) : null,
              audioSrc: mediaType === 'audio' ? getImageUrl(mediaUrl) : null,
              mediaType,
              alt: item.alt || "fashion-slideshow",
              subheading: item.subheading || "",
              heading: item.heading?.replace("<br/>", "\n") || "",
              btnText: item.btnText || "Shop Now",
              poster: item.poster ? getImageUrl(item.poster?.url || item.poster?.formats?.large?.url) : getImageUrl(fallbackImageUrl),
            };
          });
          setSlides(transformedSlides);
        }
      } catch (error) {
        // Do not use any fallback slides; only render real data
        console.error('Failed to load hero slides:', error);
        setSlides([]);
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
  }, [isMobile, mobileDetected, initialSlidesRaw]); // Re-fetch when isMobile/mobile detection changes or initial slides provided

  // Hide the intro image when appropriate:
  // - If the first slide is a video: when the first video is actually playing
  // - Otherwise (image/audio): when the first media is ready
  useEffect(() => {
    const firstIsVideo = slides[0]?.mediaType === 'video';
    if ((firstIsVideo && firstVideoPlaying) || (!firstIsVideo && firstMediaReady)) {
      setShowIntroImage(false);
    }
  }, [slides, firstVideoPlaying, firstMediaReady]);

  // Handle video/audio play/pause on slide change with lazy loading
  const handleSlideChange = (swiper) => {
    // Store swiper reference
    swiperRef.current = swiper;
    const currentIndex = swiper.activeIndex;
    setActiveSlideIndex(currentIndex);
    
    // Clear any existing timeout
    if (slideTimeoutRef.current) {
      clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = null;
    }
    
    // Pause all videos and audio safely
    videoRefs.current.forEach((media, index) => {
      if (media && !media.paused) {
        // Check if there's a pending play promise
        if (playPromisesRef.current[index]) {
          playPromisesRef.current[index].then(() => {
            if (!media.paused) {
              media.pause();
            }
          }).catch(() => {
            // Play failed, no need to pause
          });
        } else {
          media.pause();
        }
      }
    });
    
    const currentSlide = slides[currentIndex];
    
    // Load and play current video
    if (currentSlide && currentSlide.mediaType === 'video' && currentSlide.videoSrc) {
      // Mark video as should be loaded
      setLoadedVideos(prev => new Set([...prev, currentIndex]));
      
      const currentMedia = videoRefs.current[currentIndex];
      if (currentMedia && currentMedia.tagName === 'VIDEO') {
        // For video slides: wait for video to end
        playPromisesRef.current[currentIndex] = currentMedia.play().catch(() => {
          // Autoplay restrictions; rely on fallback timer below
        });
        // Fallback: advance after a fixed duration even if video is playing
        slideTimeoutRef.current = setTimeout(() => {
          handleVideoEnd();
        }, 7000);
      }
      
      // Preload next and previous videos
      const nextIndex = (currentIndex + 1) % slides.length;
      const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
      
      [nextIndex, prevIndex].forEach(index => {
        const slide = slides[index];
        if (slide && slide.mediaType === 'video' && slide.videoSrc && !loadedVideos.has(index)) {
          setTimeout(() => {
            setLoadedVideos(prev => new Set([...prev, index]));
          }, 1000); // Delay preloading to not interfere with current video
        }
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
    if (slideTimeoutRef.current) {
      clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = null;
    }
    handleVideoEnd();
  };

  // CSS for animated transition with improved loading states
  const blurStyle = {
    filter: !imageLoaded ? "blur(3px)" : "blur(0px)",
    transition: "filter 0.5s ease-in-out",
    opacity: !imageLoaded ? 0.8 : 1,
    transform: "scale(1)",
  };

  // Loading skeleton styles - REMOVED

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

  // If there are no slides after loading, do not render the hero at all
  if (!loading && slides.length === 0) {
    return null;
  }

  return (
    <>
      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        /* Video loading overlay styles - REMOVED */
      `}</style>
      
      <section className="tf-slideshow slider-default slider-position slider-effect-fade" style={heroWrapperStyle}>
      {/* Intro overlay image shown instantly before videos are ready */}
      {showIntroImage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5
          }}
        >
          <Image
            alt={"hero-intro"}
            src={isMobile ? '/images/tamfall.jpg' : '/images/tafall.jpg'}
            width={1920}
            height={803}
            priority
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: isMobile ? 'center bottom' : 'center center'
            }}
            onLoad={() => {
              setImageLoaded(true);
            }}
                  />
        </div>
      )}
      <Swiper
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        loop={slides.length > 1} // Enable loop only if there are enough slides
        modules={[EffectFade, Autoplay]}
        autoplay={false}
        style={{ height: '100%' }} // Ensure Swiper fills the parent container

        onSlideChange={handleSlideChange}
        onSwiper={(swiper) => {
              // Store swiper reference
              swiperRef.current = swiper;
              
              // Initialize first slide by calling handleSlideChange
              setTimeout(() => {
                handleSlideChange(swiper);
              }, 100);
            }}
      >
        {slides.map((slide, index) => {
            return (
              <SwiperSlide key={index}>
              <div className="wrap-slider" style={{...blurStyle, height: '100%', position: 'relative'}}>
                {/* Loading skeleton for videos - REMOVED */}
                {slide.mediaType === 'video' && slide.videoSrc ? (
                  <>
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      width={1920}
                      height={803}
                      autoPlay={index === activeSlideIndex}
                      muted
                      playsInline
                      preload={loadedVideos.has(index) || index === activeSlideIndex ? "auto" : "none"}
                      poster={index === 0 ? (isMobile ? '/images/tamfall.jpg' : '/images/tafall.jpg') : (slide.poster || slide.imgSrc)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: isMobile ? 'center bottom' : 'center center',
                        backgroundColor: 'transparent',
                      }}
                      onLoadedData={() => {
                        setImageLoaded(true);
                      }}
                      onLoadStart={async () => {
                        // Show loading state for current slide
                        setVideoLoadingStates(prev => new Map(prev.set(index, 'loading')));
                        if (index === activeSlideIndex) {
                          setImageLoaded(false);
                        }
                        
                        // Validate video source
                        if (slide.videoSrc) {
                          const isValid = await validateVideoSource(slide.videoSrc);
                          if (!isValid) {
                            console.warn(`Video source validation failed for slide ${index}:`, slide.videoSrc);
                            setVideoLoadingStates(prev => new Map(prev.set(index, 'error')));
                            if (index === activeSlideIndex) {
                              setImageLoaded(true);
                            }
                          }
                        }
                      }}
                      onCanPlay={() => {
                        // Video is ready to play
                        setVideoLoadingStates(prev => new Map(prev.set(index, 'ready')));
                        if (index === activeSlideIndex) {
                          setImageLoaded(true);
                          // Auto-play if this is the active slide and video is ready
                          const video = videoRefs.current[index];
                          if (video && video.paused) {
                            playPromisesRef.current[index] = video.play().catch(() => {});
                          }
                          // Mark first video as ready; overlay hides after min duration
                          if (index === 0) {
                            setFirstVideoReady(true);
                            // Do not hide overlay on readiness; wait for actual play event
                          }
                        }
                      }}
                      onPlaying={() => {
                        if (index === 0 && index === activeSlideIndex) {
                          setFirstVideoPlaying(true);
                        }
                      }}
                      onError={(e) => {
                        // Handle video loading errors - fallback to image
                        console.warn(`Video failed to load for slide ${index}, falling back to image. Error:`, e.target.error);
                        setVideoLoadingStates(prev => new Map(prev.set(index, 'error')));
                        if (index === activeSlideIndex) {
                          setImageLoaded(true); // Show fallback image
                          // Treat as image slide and advance after 5 seconds
                          slideTimeoutRef.current = setTimeout(() => {
                            handleVideoEnd();
                          }, 5000);
                        }
                      }}
                      onEnded={onVideoEnded}
                    >
                      {(loadedVideos.has(index) || index === activeSlideIndex) && slide.videoSrc && (
                        <>
                          <source src={slide.videoSrc} type="video/mp4" />
                          {/* Only add webm source if it's actually a webm file */}
                          {slide.videoSrc.includes('.webm') && (
                            <source src={slide.videoSrc} type="video/webm" />
                          )}
                        </>
                      )}
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
                    priority={index === 0}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: isMobile ? 'center bottom' : 'center center'
                    }}
                    onLoad={() => {
                      setImageLoaded(true);
                      if (index === 0) setFirstMediaReady(true);
                    }}
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
                        href={`/hero-products?slideId=${slide.documentId || slide.id}&btnText=${encodeURIComponent(slide.btnText)}${slide.videoName ? `&videoName=${encodeURIComponent(slide.videoName)}` : ''}`}
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
      </section>
    </>
  );
}
