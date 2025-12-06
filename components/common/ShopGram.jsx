"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Pagination } from "swiper/modules";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";

// Single video manager
const videoManager = {
  activeVideo: null,
  setActive(video) {
    if (this.activeVideo && this.activeVideo !== video) {
      this.activeVideo.pause();
    }
    this.activeVideo = video;
  }
};

// Autoplay Video Player
const AutoplayVideoPlayer = ({ src, poster, alt }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (isMobile) videoManager.setActive(video);
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        });
      },
      { threshold: isMobile ? 0.75 : 0.5 }
    );

    const handlePlay = () => {
      setIsPlaying(true);
      setShowPoster(false);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setShowPoster(true);
    };

    video.addEventListener('playing', handlePlay);
    video.addEventListener('pause', handlePause);
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.removeEventListener('playing', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isMobile]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      isPlaying ? video.pause() : video.play();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '640px',
        cursor: 'pointer',
        backgroundColor: '#000'
      }}
      onClick={handleClick}
    >
      {showPoster && poster && (
        <img
          src={poster}
          alt={alt || "Video"}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        muted
        loop
        playsInline
        webkit-playsinline="true"
        preload="metadata"
      />
    </div>
  );
};

export default function ShopGram({ parentClass = "" }) {
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
        const mockData = [
          {
            id: 1,
            link: 'https://instagram.com/p/test1',
            media: {
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              mime: 'video/mp4',
              alternativeText: 'Sample Video 1',
              formats: {
                thumbnail: {
                  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images_480x270/BigBuckBunny.jpg'
                }
              }
            }
          }
        ];
        setInstagramPosts(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, []);

  return (
    <section className={parentClass}>
      <div className="container">
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
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spb222" }}
        >
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SwiperSlide key={i}>
                <div className="gallery-item hover-overlay hover-img">
                  <div className="img-style" style={{ height: '640px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Loading...
                  </div>
                </div>
              </SwiperSlide>
            ))
          ) : (
            instagramPosts.slice(0, 5).map((item, i) => {
              let mediaUrl = '/images/placeholder.jpg';
              if (item.media?.url) {
                mediaUrl = item.media.url.startsWith('http')
                  ? item.media.url
                  : `${process.env.NEXT_PUBLIC_API_URL || API_URL}${item.media.url}`;
              }

              const isVideo = item.media?.mime?.startsWith('video/');

              let posterSrc = mediaUrl;
              if (item.media?.formats?.thumbnail?.url) {
                const thumbUrl = item.media.formats.thumbnail.url;
                posterSrc = thumbUrl.startsWith('http')
                  ? thumbUrl
                  : `${process.env.NEXT_PUBLIC_API_URL || API_URL}${thumbUrl}`;
              }

              return (
                <SwiperSlide key={item.id || i}>
                  <div className="gallery-item hover-overlay hover-img wow fadeInUp" data-wow-delay={`${(i + 1) * 0.1}s`}>
                    <div className="img-style">
                      {isVideo ? (
                        <AutoplayVideoPlayer
                          src={mediaUrl}
                          poster={posterSrc}
                          alt={item.media?.alternativeText || "Instagram video"}
                        />
                      ) : (
                        <img
                          className="lazyload img-hover"
                          alt={item.media?.alternativeText || "Instagram post"}
                          src={mediaUrl}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      )}
                    </div>
                    <Link
                      href={item.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="box-icon hover-tooltip"
                    >
                      <span className="icon icon-eye" />
                      <span className="tooltip">View Instagram Post</span>
                    </Link>
                  </div>
                </SwiperSlide>
              );
            })
          )}
          <div className="sw-pagination-gallery sw-dots type-circle justify-content-center spb222"></div>
        </Swiper>
      </div>
    </section>
  );
}
