"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";
import "../../styles/custom-video.css";

// AutoplayVideo ensures inline, muted autoplay on iOS/Android when visible
const AutoplayVideo = ({ src, poster, className = "", style = {}, type = "video/mp4" }) => {
  const videoRef = useRef(null);
  const playPromiseRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const isiOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.muted = true;
      video.preload = "metadata";
    } catch (_) {}

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          if (isiOS) {
            try { video.load(); } catch (_) {}
          }
          playPromiseRef.current = video.play().catch(() => {
            try {
              video.setAttribute("autoplay", "");
              video.play().catch(() => {});
            } catch (_) {}
          });
        } else {
          if (playPromiseRef.current) {
            playPromiseRef.current.then(() => {
              if (!video.paused) video.pause();
            }).catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isiOS]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      className={`no-video-controls ${className}`}
      style={style}
      muted
      loop
      autoPlay
      playsInline
      preload="metadata"
      controls={false}
      disablePictureInPicture
      controlsList="nodownload noplaybackrate"
    >
      <source src={src} type={type} />
      <source src={src} type="video/mp4" />
    </video>
  );
};

export default function InstagramAutoPlayVideos({ parentClass = "", initialPosts = null, heading = "Latest Instagram Videos", subheading = "Autoplay reels — fully supported on iOS" }) {
  const [videoPosts, setVideoPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstagram = async () => {
      try {
        const apiEndpoint = "/api/instagrams?populate=*";
        const response = await fetchDataFromApi(apiEndpoint);
        const allPosts = Array.isArray(response?.data) ? response.data : [];
        const videosOnly = allPosts.filter(p => p?.media?.mime?.startsWith("video/"));
        setVideoPosts(videosOnly);
      } catch (err) {
        console.error("Failed to fetch Instagram videos:", err);
        setVideoPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (initialPosts && Array.isArray(initialPosts) && initialPosts.length > 0) {
      const videosOnly = initialPosts.filter(p => p?.media?.mime?.startsWith("video/"));
      setVideoPosts(videosOnly);
      setLoading(false);
      return;
    }

    fetchInstagram();
  }, [initialPosts]);

  return (
    <section className={parentClass} style={{ marginTop: "20px", marginBottom: "60px" }}>
      <div className="container" style={{ paddingTop: "30px", paddingBottom: "30px" }}>
        <div className="heading-section text-center">
          <h3 className="heading wow fadeInUp">{heading}</h3>
          <p className="subheading text-secondary wow fadeInUp">{subheading}</p>
        </div>
        <Swiper
          dir="ltr"
          className="swiper tf-sw-shop-gallery"
          spaceBetween={10}
          breakpoints={{
            1200: { slidesPerView: 4 },
            768: { slidesPerView: 3 },
            0: { slidesPerView: 2 },
          }}
          loop={true}
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".spd-instagram-videos" }}
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SwiperSlide key={i}>
                <div className="gallery-item hover-overlay hover-img">
                  <div className="img-style">
                    <div
                      style={{
                        width: "100%",
                        height: "560px",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Loading videos...
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          ) : videoPosts.length === 0 ? (
            <SwiperSlide>
              <div className="gallery-item hover-overlay hover-img">
                <div className="img-style">
                  <div
                    style={{
                      width: "100%",
                      height: "560px",
                      backgroundColor: "#fff7e6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#b36b00",
                      fontWeight: 500,
                    }}
                  >
                    No Instagram videos available right now.
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ) : (
            videoPosts.slice(0, 8).map((item, i) => {
              let mediaUrl = "/images/placeholder.mp4";
              if (item.media?.url) {
                mediaUrl = item.media.url.startsWith("http")
                  ? item.media.url
                  : `${process.env.NEXT_PUBLIC_API_URL || API_URL}${item.media.url}`;
              }
              const posterSrc = item.media?.formats?.thumbnail?.url
                ? (item.media.formats.thumbnail.url.startsWith("http")
                    ? item.media.formats.thumbnail.url
                    : `${process.env.NEXT_PUBLIC_API_URL || API_URL}${item.media.formats.thumbnail.url}`)
                : "/images/placeholder.jpg";

              return (
                <SwiperSlide key={item.id || i}>
                  <div className="gallery-item hover-overlay hover-img wow fadeInUp" data-wow-delay={`${(i + 1) * 0.1}s`}>
                    <div className="img-style">
                      <AutoplayVideo
                        src={mediaUrl}
                        poster={posterSrc}
                        className="lazyload img-hover"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              );
            })
          )}
        </Swiper>
        <div className="d-flex d-lg-none sw-pagination-collection sw-dots type-circle justify-content-center spd-instagram-videos" />
      </div>
    </section>
  );
}