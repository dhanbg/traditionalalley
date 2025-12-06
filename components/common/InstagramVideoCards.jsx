"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";
import { Pagination } from "swiper/modules";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";

// Single video manager for mobile
const videoManager = {
  activeVideo: null,
  setActive(video) {
    if (this.activeVideo && this.activeVideo !== video) {
      this.activeVideo.pause();
    }
    this.activeVideo = video;
  }
};

// Autoplay Video Player - optimized to prevent disappearing videos
const AutoplayVideoPlayer = ({ src, poster, alt, index }) => {
  const videoRef = useRef(null);
  const observerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(true);
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // iOS setup
    video.muted = true;
    video.playsInline = true;
    video.defaultMuted = true;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handlePlaying = () => setIsPlaying(true);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('playing', handlePlaying);

    // Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!video) return;

          if (entry.isIntersecting) {
            if (canAutoplay) {
              if (isMobile) {
                videoManager.setActive(video);
              }

              video.play().catch(() => {
                setCanAutoplay(false);
              });
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      {
        threshold: isMobile ? 0.75 : 0.5,
        rootMargin: '0px'
      }
    );

    observerRef.current.observe(video);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (video) {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('playing', handlePlaying);
        // DON'T clear src or pause here - causes videos to disappear
      }
    };
  }, [canAutoplay, isMobile, src]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play()
        .then(() => setCanAutoplay(true))
        .catch(err => console.error('Play failed:', err));
    }
  };

  // Always show poster when not playing, with smooth transition
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        backgroundColor: '#000',
        minHeight: '300px'
      }}
      onClick={handleClick}
    >
      {/* Poster - Always rendered, controlled by opacity */}
      {poster && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            opacity: isPlaying ? 0 : 1,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            backgroundColor: '#000'
          }}
        >
          <img
            src={poster}
            alt={alt || "Video"}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      {/* Play Button */}
      {!isPlaying && !canAutoplay && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '3px' }}>
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* Video Element - ALWAYS rendered */}
      <video
        ref={videoRef}
        key={`video-${index}-${src}`}
        poster={poster}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          backgroundColor: '#000'
        }}
        muted
        loop
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        preload="metadata"
        controls={false}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
};

export default function InstagramVideoCards({ parentClass = "", initialPosts = null }) {
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const apiEndpoint = '/api/instagrams?populate=*';
        const response = await fetchDataFromApi(apiEndpoint);
        setInstagramPosts(response.data || []);
      } catch (error) {
        console.error('Failed to fetch Instagram posts:', error);
        setInstagramPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (initialPosts && Array.isArray(initialPosts) && initialPosts.length > 0) {
      setInstagramPosts(initialPosts);
      setLoading(false);
      return;
    }
    fetchInstagramPosts();
  }, [initialPosts]);

  return (
    <section className={parentClass} style={{ marginTop: '60px', marginBottom: '60px' }}>
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="heading-section text-center">
          <h3 className="heading wow fadeInUp">Explore Instagram</h3>
          <p className="subheading text-secondary wow fadeInUp">
            Elevate your wardrobe with fresh finds today!
          </p>
        </div>

        <Swiper
          dir="ltr"
          className="swiper tf-sw-shop-gallery"
          spaceBetween={10}
          breakpoints={{
            1200: { slidesPerView: 5 },
            768: { slidesPerView: 3 },
            0: { slidesPerView: 2 },
          }}
          loop={true}
          modules={[Pagination]}
          pagination={{
            clickable: true,
            el: ".spd-instagram",
          }}
        >
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SwiperSlide key={i}>
                <div className="gallery-item hover-overlay hover-img">
                  <div className="img-style">
                    <div
                      style={{
                        width: '100%',
                        height: '640px',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Loading...
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          ) : instagramPosts.length === 0 ? (
            <SwiperSlide>
              <div className="gallery-item hover-overlay hover-img">
                <div className="img-style">
                  <div
                    style={{
                      width: '100%',
                      height: '640px',
                      backgroundColor: '#fff7e6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#b36b00',
                      fontWeight: 500
                    }}
                  >
                    Instagram posts are not available right now.
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ) : (
            instagramPosts.slice(0, 5).map((item, i) => {
              let mediaUrl = '/images/placeholder.jpg';
              if (item.media?.url) {
                if (item.media.url.startsWith('http')) {
                  mediaUrl = item.media.url;
                } else {
                  const baseUrl = process.env.NEXT_PUBLIC_API_URL || API_URL;
                  mediaUrl = `${baseUrl}${item.media.url}`;
                }
              }

              const isVideo = item.media?.mime?.startsWith('video/');

              let posterSrc = mediaUrl;
              if (item.media?.formats?.thumbnail?.url) {
                const thumbUrl = item.media.formats.thumbnail.url;
                posterSrc = thumbUrl.startsWith('http')
                  ? thumbUrl
                  : `${process.env.NEXT_PUBLIC_API_URL || API_URL}${thumbUrl}`;
              } else if (item.media?.formats?.small?.url) {
                const smallUrl = item.media.formats.small.url;
                posterSrc = smallUrl.startsWith('http')
                  ? smallUrl
                  : `${process.env.NEXT_PUBLIC_API_URL || API_URL}${smallUrl}`;
              }

              return (
                <SwiperSlide key={`slide-${item.id || i}`}>
                  <div
                    className="gallery-item hover-overlay hover-img wow fadeInUp"
                    data-wow-delay={`${(i + 1) * 0.1}s`}
                    onMouseEnter={(e) => {
                      const eyeIcon = e.currentTarget.querySelector('.box-icon');
                      if (eyeIcon) {
                        eyeIcon.style.opacity = '1';
                        eyeIcon.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        const iconSpan = eyeIcon.querySelector('.icon-eye');
                        if (iconSpan) iconSpan.style.color = 'black';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const eyeIcon = e.currentTarget.querySelector('.box-icon');
                      if (eyeIcon) {
                        eyeIcon.style.opacity = '0';
                      }
                    }}
                  >
                    <div
                      className="img-style"
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        backgroundColor: '#000'
                      }}
                    >
                      {isVideo ? (
                        <AutoplayVideoPlayer
                          src={mediaUrl}
                          poster={posterSrc}
                          alt={item.media?.alternativeText || "Instagram video"}
                          index={i}
                        />
                      ) : (
                        <Image
                          className="lazyload img-hover"
                          alt={item.media?.alternativeText || "Instagram post"}
                          src={mediaUrl}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />
                      )}
                    </div>
                    <Link
                      href={item.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="box-icon hover-tooltip"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                        const iconSpan = e.currentTarget.querySelector('.icon-eye');
                        if (iconSpan) iconSpan.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        const iconSpan = e.currentTarget.querySelector('.icon-eye');
                        if (iconSpan) iconSpan.style.color = 'black';
                      }}
                    >
                      <span className="icon icon-eye" style={{ color: 'black' }} />
                      <span className="tooltip">View Instagram Post</span>
                    </Link>
                  </div>
                </SwiperSlide>
              );
            })
          )}
        </Swiper>
        <div className="d-flex d-lg-none sw-pagination-collection sw-dots type-circle justify-content-center spd-instagram" />
      </div>
    </section>
  );
}