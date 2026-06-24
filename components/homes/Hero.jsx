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
  const [firstMediaReady, setFirstMediaReady] = useState(false);
  const videoRefs = useRef([]);
  const playPromisesRef = useRef([]);
  const swiperRef = useRef(null);
  const slideTimeoutRef = useRef(null);

  // Campaign Teaser states & effects
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState(null); // 'loading', 'success', 'error'
  


  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setSubscribeStatus('loading');
    try {
      const response = await fetch("/api/add-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: notifyEmail }),
      });
      if (response.ok) {
        setSubscribeStatus('success');
        setNotifyEmail("");
        setTimeout(() => {
          setIsNotifyModalOpen(false);
          setSubscribeStatus(null);
        }, 3000);
      } else {
        setSubscribeStatus('error');
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      setSubscribeStatus('error');
    }
  };

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
    checkMobile(); // Run on mount to set correct mobile flag based on actual window size
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
              description: item.description || "",
              isTeaser: item.isTeaser || false,
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
              description: item.description || "",
              isTeaser: item.isTeaser || false,
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
  // - If the first slide is a video: when the first video is ready
  // - Otherwise (image/audio): when the first media is ready
  useEffect(() => {
    const firstIsVideo = slides[0]?.mediaType === 'video';
    if ((firstIsVideo && firstVideoReady) || (!firstIsVideo && firstMediaReady)) {
      setShowIntroImage(false);
    }
  }, [slides, firstVideoReady, firstMediaReady]);

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
    top: isMobile ? 'auto' : '50%',
    bottom: isMobile ? '35px' : 'auto',
    transform: isMobile ? 'none' : 'translateY(-50%)',
    transition: 'opacity 0.3s ease' // Faster transition
  };

  // Force consistent spacing and height from Hero component side
  const heroWrapperStyle = {
    marginBottom: '0px', // Remove any default margins
    paddingBottom: '0px', // Ensure no bottom padding
    height: '100vh', // Fit to screen height in both laptop and mobile
    minHeight: 'auto',
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
        {showIntroImage && slides.some(s => s.mediaType === 'video') && (
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
              src={isMobile ? 'https://4k3pbkj0o1.ucarecd.net/d5acb57b-63d3-41c6-a7f7-c4cd71f2ceb3/mobile.png' : '/images/tafall.jpg'}
              width={1920}
              height={803}
              priority

              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center'
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
                <div className="wrap-slider" style={{ ...blurStyle, height: '100%', position: 'relative' }}>
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
                        disableRemotePlayback
                        webkit-playsinline="true"
                        preload={loadedVideos.has(index) || index === activeSlideIndex ? "auto" : "none"}
                        poster={index === 0 ? (isMobile ? 'https://4k3pbkj0o1.ucarecd.net/d5acb57b-63d3-41c6-a7f7-c4cd71f2ceb3/mobile.png' : '/images/tafall.jpg') : (slide.poster || slide.imgSrc)}
                        style={{
                          width: '100%',

                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center center',
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
                              playPromisesRef.current[index] = video.play().then(() => {
                                // Mark first video as truly playing; hide overlay now
                                if (index === 0) {
                                  setFirstVideoReady(true);
                                  setFirstMediaReady(true);
                                }
                              }).catch(() => {
                                // Autoplay might be blocked; keep overlay until user interaction
                              });
                            }
                          }
                        }}
                        onPlay={() => {
                          // Fallback in case play() promise didn't resolve (Safari quirks)
                          if (index === 0 && index === activeSlideIndex) {
                            setFirstVideoReady(true);
                            setFirstMediaReady(true);
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
                        objectPosition: 'center center'
                      }}
                      onLoad={() => {
                        setImageLoaded(true);
                        if (index === 0) setFirstMediaReady(true);
                      }}
                    />
                  )}
                  {slide.isTeaser ? (
                    <div className="teaser-content-container">
                      <div className="teaser-left-content">
                        <span className="teaser-badge">
                          {slide.subheading}
                        </span>
                        
                        <div className="teaser-middle-group">
                          <h1 className="teaser-headline">
                            {slide.heading.split("\n").map((line, idx) => (
                              <span key={idx} className={(line === "JERSEY" || line === "ICONIC") ? "gold-text" : ""}>
                                {line}
                                <br />
                              </span>
                            ))}
                          </h1>
                          
                          <p className="teaser-description">
                            {slide.description}
                          </p>
                        </div>
                        
                        <div className="teaser-actions">
                          <a 
                            href="#worldcup-showcase-section" 
                            className="teaser-btn-gold"
                            onClick={(e) => {
                              e.preventDefault();
                              const element = document.getElementById("worldcup-showcase-section");
                              if (element) {
                                element.scrollIntoView({ behavior: "smooth" });
                              }
                            }}
                          >
                            <span>SHOP THE DROP</span>
                            <span className="arrow">→</span>
                          </a>
                          
                          <Link href="/women" className="teaser-btn-outline">
                            EXPLORE COLLECTION
                          </Link>
                        </div>
                        
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </section>

      {/* Subscription Modal Popup */}
      {isNotifyModalOpen && (
        <div className="teaser-modal-overlay" onClick={() => setIsNotifyModalOpen(false)}>
          <div className="teaser-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="teaser-modal-close" onClick={() => setIsNotifyModalOpen(false)}>×</button>
            <div className="teaser-modal-icon">✉</div>
            <h3 className="teaser-modal-title">SOMETHING ICONIC</h3>
            <p className="teaser-modal-subtitle">
              Sign up below to receive an exclusive early notification and special access when the collection drops.
            </p>
            <form onSubmit={handleNotifySubmit} className="teaser-form-group">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                className="teaser-input"
                disabled={subscribeStatus === 'loading'}
              />
              <button
                type="submit"
                className="teaser-modal-btn"
                disabled={subscribeStatus === 'loading'}
              >
                {subscribeStatus === 'loading' ? 'SUBMITTING...' : 'NOTIFY ME'}
              </button>
            </form>
            {subscribeStatus === 'success' && (
              <p className="teaser-status-msg success">✓ Thank you! You will be notified instantly.</p>
            )}
            {subscribeStatus === 'error' && (
              <p className="teaser-status-msg error">✗ Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      )}

      {/* Custom styles for teaser drop */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700;800&family=Outfit:wght@400;500;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

        .teaser-content-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-left: 0%;
          padding-right: 12%;
          z-index: 10;
          font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
          background: rgba(255, 255, 255, 0.02);
        }
        .teaser-left-content {
          max-width: 580px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          animation: fadeInUpTeaser 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .teaser-middle-group {
          display: contents;
        }
        @keyframes fadeInUpTeaser {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .teaser-badge {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #dfba6b;
          margin-bottom: 1.8rem;
          text-transform: uppercase;
          font-family: 'Outfit', sans-serif;
        }
        .teaser-headline {
          font-size: 5.0rem;
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.01em;
          color: #ffffff;
          margin-bottom: 1.8rem;
          text-transform: uppercase;
          font-family: 'Oswald', sans-serif;
        }
        .teaser-headline span.gold-text {
          color: #dfba6b;
          background: none;
          -webkit-background-clip: unset;
          -webkit-text-fill-color: unset;
        }
        .teaser-description {
          font-size: 1.0rem;
          color: #e0e0e0;
          line-height: 1.5;
          margin-bottom: 2.5rem;
          max-width: 480px;
          font-weight: 400;
          font-family: 'Outfit', sans-serif;
        }
        .teaser-actions {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 4.5rem;
          width: 100%;
        }
        .teaser-btn-gold {
          background: #dfba6b;
          color: #111111;
          border: none;
          padding: 1.0rem 2.8rem;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          border-radius: 0px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
          text-transform: uppercase;
        }
        .teaser-btn-gold:hover {
          background: #d4ae59;
        }
        .teaser-btn-gold .arrow {
          font-size: 1.1rem;
          transition: transform 0.3s ease;
          line-height: 1;
        }
        .teaser-btn-gold:hover .arrow {
          transform: translateX(4px);
        }
        .teaser-btn-outline {
          background: transparent;
          color: #ffffff;
          border: 1.5px solid #ffffff;
          padding: 1.0rem 2.8rem;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          border-radius: 0px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          text-transform: uppercase;
        }
        .teaser-btn-outline:hover {
          background: #111111;
          color: #ffffff;
        }
        .teaser-countdown-wrap {
          display: flex;
          align-items: center;
          gap: 0px;
          width: 100%;
          margin-top: 1.5rem;
        }
        .teaser-countdown-label {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #dfba6b;
          white-space: nowrap;
          font-family: 'Outfit', sans-serif;
          border-left: 2.5px solid #dfba6b;
          padding-left: 12px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          line-height: 1;
        }
        .teaser-countdown-divider {
          width: 1px;
          height: 35px;
          background: rgba(0, 0, 0, 0.15);
          margin-left: 1.8rem;
          margin-right: 1.8rem;
        }
        .teaser-countdown-values {
          display: flex;
          align-items: center;
          gap: 0px;
        }
        .teaser-countdown-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 50px;
        }
        .teaser-countdown-item .val {
          font-size: 2.4rem;
          font-weight: 700;
          color: #111111;
          line-height: 1;
          font-family: 'Outfit', sans-serif;
        }
        .teaser-countdown-item .lbl {
          font-size: 0.65rem;
          font-weight: 700;
          color: #111111;
          letter-spacing: 0.12em;
          margin-top: 0.4rem;
          font-family: 'Outfit', sans-serif;
        }
        .teaser-countdown-item-divider {
          width: 1px;
          height: 35px;
          background: rgba(0, 0, 0, 0.15);
          margin-left: 1.8rem;
          margin-right: 1.8rem;
        }

        /* Premium Email Modal Styles */
        .teaser-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          opacity: 0;
          animation: fadeInOverlay 0.3s ease-out forwards;
        }
        @keyframes fadeInOverlay {
          to { opacity: 1; }
        }
        .teaser-modal-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 3rem;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          position: relative;
          text-align: center;
          border: 1px solid rgba(197, 168, 128, 0.2);
          transform: translateY(20px);
          animation: slideUpCard 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: 'Outfit', sans-serif;
        }
        @keyframes slideUpCard {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .teaser-modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: transparent;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: #999999;
          transition: color 0.2s;
          line-height: 1;
        }
        .teaser-modal-close:hover {
          color: #111111;
        }
        .teaser-modal-icon {
          font-size: 2.5rem;
          color: #dfba6b;
          margin-bottom: 1rem;
        }
        .teaser-modal-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #111111;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .teaser-modal-subtitle {
          font-size: 0.95rem;
          color: #666666;
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        .teaser-form-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }
        .teaser-input {
          padding: 1rem 1.2rem;
          border: 1.5px solid #dddddd;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'Outfit', sans-serif;
        }
        .teaser-input:focus {
          border-color: #dfba6b;
        }
        .teaser-modal-btn {
          background: #111111;
          color: #ffffff;
          border: none;
          padding: 1rem;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Outfit', sans-serif;
        }
        .teaser-modal-btn:hover {
          background: #333333;
        }
        .teaser-status-msg {
          margin-top: 1rem;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .teaser-status-msg.success {
          color: #2e7d32;
        }
        .teaser-status-msg.error {
          color: #c62828;
        }

        /* Responsive rules */
        @media (max-width: 768px) {
          .teaser-content-container {
            padding-left: 6%;
            padding-right: 6%;
            padding-top: 0;
            padding-bottom: 0;
            align-items: stretch;
          }
          .teaser-left-content {
            width: 100%;
            max-width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding-top: 10px;
            padding-bottom: 0px;
          }
          .teaser-middle-group {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            flex-grow: 1;
            margin-top: 10.5rem;
            margin-bottom: 1.0rem;
          }
          .teaser-badge {
            display: none;
          }
          .tf-slideshow .subheading {
            display: none !important;
          }
          .teaser-headline {
            font-size: 3.2rem;
            margin-bottom: 0.8rem;
          }
          .teaser-description {
            display: none;
          }
          .teaser-actions {
            flex-direction: column;
            gap: 0.8rem;
            margin-bottom: 0rem;
          }
          .teaser-btn-gold {
            width: 100%;
            padding: 0.6rem 1.2rem !important;
            font-size: 0.75rem !important;
            justify-content: center;
          }
          .teaser-btn-outline {
            width: 100%;
            padding: 0.45rem 1.0rem !important;
            font-size: 0.7rem !important;
            justify-content: center;
          }
          .teaser-countdown-wrap {
            flex-direction: row;
            align-items: center;
            gap: 0px;
            margin-top: 2rem;
            width: 100%;
            flex-wrap: wrap;
          }
          .teaser-countdown-divider {
            margin-left: 0.8rem;
            margin-right: 0.8rem;
            height: 25px;
          }
          .teaser-countdown-item-divider {
            margin-left: 0.8rem;
            margin-right: 0.8rem;
            height: 25px;
          }
          .teaser-countdown-item {
            min-width: 40px;
          }
          .teaser-countdown-item .val {
            font-size: 1.6rem;
          }
          .teaser-countdown-item .lbl {
            font-size: 0.55rem;
            margin-top: 0.2rem;
          }
          .teaser-countdown-label {
            font-size: 0.7rem;
            padding-left: 8px;
            height: 14px;
          }
          .teaser-modal-card {
            padding: 2rem 1.5rem;
            margin: 1rem;
          }
        }
      `}</style>
    </>
  );
}
