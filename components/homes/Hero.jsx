"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";

const AUTOPLAY_DELAY_MS = 5500;

function detectMediaType(media) {
  if (!media) return "image";
  const mimeType = media.mime || "";
  const fileExt = media.ext || "";
  if (
    mimeType.startsWith("video/") ||
    [".mp4", ".webm", ".mov", ".avi"].includes(fileExt.toLowerCase())
  ) {
    return "video";
  }
  if (
    mimeType.startsWith("audio/") ||
    [".mp3", ".wav", ".ogg"].includes(fileExt.toLowerCase())
  ) {
    return "audio";
  }
  return "image";
}

function transformSlideItem(item, isMobile = false) {
  const desktopMedia = item.media || null;
  const mobileMedia = item.mobileMedia || desktopMedia;
  const activeMedia = isMobile && mobileMedia ? mobileMedia : desktopMedia;

  const desktopUrl = desktopMedia?.url || desktopMedia?.formats?.large?.url || "";
  const mobileUrl = mobileMedia?.url || mobileMedia?.formats?.large?.url || desktopUrl;
  const activeUrl = activeMedia?.url || activeMedia?.formats?.large?.url || "";
  const mediaType = detectMediaType(activeMedia);
  const fallbackImageUrl =
    item.poster?.url || item.poster?.formats?.large?.url || desktopUrl || mobileUrl;

  return {
    id: item.id,
    documentId: item.documentId,
    imgSrc: getImageUrl(mediaType === "image" ? desktopUrl : fallbackImageUrl),
    mobileImgSrc: getImageUrl(mediaType === "image" ? mobileUrl : fallbackImageUrl),
    videoSrc: mediaType === "video" ? getImageUrl(activeUrl) : null,
    audioSrc: mediaType === "audio" ? getImageUrl(activeUrl) : null,
    mediaType,
    alt: item.alt || item.productTitle || "Traditional Alley - Authentic Nepali Fashion",
    subheading: item.subheading || "",
    heading: item.heading?.replace("<br/>", "\n") || "",
    description: item.description || "",
    productTitle: item.productTitle || "",
    shortLabel: item.shortLabel || item.productTitle || "",
    price: item.price ?? null,
    isTeaser: item.isTeaser || false,
    btnText: item.btnText || "Shop This Look",
    btnUrl: item.btnUrl || "/women",
    collectionLabel: item.collectionLabel || "Explore Collection",
    collectionUrl: item.collectionUrl || null,
    poster: item.poster
      ? getImageUrl(item.poster?.url || item.poster?.formats?.large?.url)
      : getImageUrl(fallbackImageUrl),
    videoName: item.videoName || item?.mobileMedia?.name || null,
  };
}

export default function Hero({ initialSlidesRaw = null, isMobileInitial = false }) {
  const [isMobile, setIsMobile] = useState(isMobileInitial);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [fetchedSlidesRaw, setFetchedSlidesRaw] = useState(null);
  const [loading, setLoading] = useState(!Array.isArray(initialSlidesRaw));
  const [loadedVideos, setLoadedVideos] = useState(new Set());
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState(null);

  const videoRefs = useRef([]);
  const playPromisesRef = useRef([]);
  const swiperRef = useRef(null);
  const slideTimeoutRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (Array.isArray(initialSlidesRaw)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/hero-slides?populate=*");
        const data = await response.json();
        if (!cancelled) {
          setFetchedSlidesRaw(Array.isArray(data?.data) ? data.data : []);
        }
      } catch (error) {
        console.error("Failed to load hero slides:", error);
        if (!cancelled) setFetchedSlidesRaw([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialSlidesRaw]);

  const rawSource = Array.isArray(initialSlidesRaw) ? initialSlidesRaw : fetchedSlidesRaw;

  const slides = useMemo(() => {
    if (!Array.isArray(rawSource)) return [];
    return rawSource.map((item) => transformSlideItem(item, isMobile));
  }, [rawSource, isMobile]);

  const hasVideoSlides = useMemo(
    () => slides.some((slide) => slide.mediaType === "video" && slide.videoSrc),
    [slides]
  );

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setSubscribeStatus("loading");
    try {
      const response = await fetch("/api/add-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notifyEmail }),
      });
      if (response.ok) {
        setSubscribeStatus("success");
        setNotifyEmail("");
        if (typeof window !== "undefined" && window.fbq) {
          window.fbq("track", "Lead", {
            content_name: "Hero Notify Signup",
            content_category: "hero_notify",
          });
        }
        if (typeof window !== "undefined" && window.dataLayer) {
          window.dataLayer.push({ event: "generate_lead", form_name: "hero_notify" });
        }
        setTimeout(() => {
          setIsNotifyModalOpen(false);
          setSubscribeStatus(null);
        }, 3000);
      } else {
        setSubscribeStatus("error");
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      setSubscribeStatus("error");
    }
  };

  const handleSlideChange = useCallback(
    (swiper) => {
      swiperRef.current = swiper;
      const realIdx = typeof swiper.realIndex === "number" ? swiper.realIndex : swiper.activeIndex;
      setActiveSlideIndex(realIdx);

      if (slideTimeoutRef.current) {
        clearTimeout(slideTimeoutRef.current);
        slideTimeoutRef.current = null;
      }

      if (!hasVideoSlides) return;

      videoRefs.current.forEach((media, index) => {
        if (media && !media.paused) {
          if (playPromisesRef.current[index]) {
            playPromisesRef.current[index]
              .then(() => {
                if (!media.paused) media.pause();
              })
              .catch(() => {});
          } else {
            media.pause();
          }
        }
      });

      const currentSlide = slides[realIdx];
      if (currentSlide?.mediaType === "video" && currentSlide.videoSrc) {
        setLoadedVideos((prev) => new Set([...prev, realIdx]));
        const currentMedia = videoRefs.current[realIdx];
        if (currentMedia && currentMedia.tagName === "VIDEO") {
          playPromisesRef.current[realIdx] = currentMedia.play().catch(() => {});
          slideTimeoutRef.current = setTimeout(() => {
            swiperRef.current?.slideNext();
          }, 7000);
        }
      }
    },
    [hasVideoSlides, slides]
  );

  useEffect(() => {
    return () => {
      if (slideTimeoutRef.current) {
        clearTimeout(slideTimeoutRef.current);
      }
    };
  }, []);

  if (!loading && slides.length === 0) {
    return null;
  }

  const goToSlide = (idx) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (typeof swiper.slideToLoop === "function" && slides.length > 1) {
      swiper.slideToLoop(idx);
    } else {
      swiper.slideTo(idx);
    }
  };

  return (
    <>
      <section className="ta-hero-section tf-slideshow slider-default slider-position slider-effect-fade">
        <Swiper
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={850}
          spaceBetween={0}
          slidesPerView={1}
          loop={slides.length > 1}
          allowTouchMove={true}
          modules={[EffectFade, Autoplay]}
          autoplay={
            !hasVideoSlides && slides.length > 1
              ? {
                  delay: AUTOPLAY_DELAY_MS,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: !isMobile,
                }
              : false
          }
          style={{ height: "100%", width: "100%" }}
          onSlideChange={handleSlideChange}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            handleSlideChange(swiper);
          }}
        >
          {slides.map((slide, index) => {
            const HeadingTag = index === 0 ? "h1" : "h2";
            return (
              <SwiperSlide key={slide.id || index}>
                <div className="ta-hero-slide-inner">
                  {slide.mediaType === "video" && slide.videoSrc ? (
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      width={1920}
                      height={960}
                      autoPlay={index === activeSlideIndex}
                      muted
                      playsInline
                      disableRemotePlayback
                      preload={loadedVideos.has(index) || index === activeSlideIndex ? "auto" : "none"}
                      poster={slide.poster || slide.imgSrc}
                      className="ta-hero-media-img"
                      onEnded={() => swiperRef.current?.slideNext()}
                    >
                      {(loadedVideos.has(index) || index === activeSlideIndex) && (
                        <source src={slide.videoSrc} type="video/mp4" />
                      )}
                    </video>
                  ) : (
                    <div className="ta-hero-media-wrap">
                      <picture className="ta-hero-picture">
                        <source
                          media="(max-width: 767px)"
                          srcSet={slide.mobileImgSrc || slide.imgSrc}
                          width={1080}
                          height={1500}
                        />
                        <img
                          src={slide.imgSrc}
                          alt={slide.alt}
                          width={1920}
                          height={960}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          loading={index === 0 ? "eager" : "lazy"}
                          decoding={index === 0 ? "sync" : "async"}
                          className="ta-hero-media-img"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </picture>
                      {/* Subtle safety scrim for crisp typography contrast across viewports */}
                      <div className="ta-hero-scrim" aria-hidden="true" />
                    </div>
                  )}

                  {slide.isTeaser ? (
                    <div className="teaser-content-container">
                      <div className="teaser-left-content">
                        <span className="teaser-badge">{slide.subheading}</span>
                        <div className="teaser-middle-group">
                          <HeadingTag className="teaser-headline">
                            {slide.heading.split("\n").map((line, idx) => (
                              <span
                                key={idx}
                                className={line === "JERSEY" || line === "ICONIC" ? "gold-text" : ""}
                              >
                                {line}
                                <br />
                              </span>
                            ))}
                          </HeadingTag>
                          <p className="teaser-description">{slide.description}</p>
                        </div>
                        <div className="teaser-actions">
                          <Link href={slide.btnUrl || "/women"} className="teaser-btn-gold">
                            <span>{slide.btnText || "SHOP NOW"}</span>
                            <span className="arrow">→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="ta-hero-content">
                      <div className="container">
                        <div className="ta-hero-copy">
                          {slide.heading && (
                            <HeadingTag className="ta-hero-title">
                              {slide.heading.split("\n").map((line, idx) => (
                                <span key={idx} className="d-block">
                                  {line}
                                </span>
                              ))}
                            </HeadingTag>
                          )}

                          {slide.description && (
                            <p className="ta-hero-desc d-none d-md-block">{slide.description}</p>
                          )}

                          <div className="ta-hero-actions">
                            <Link href={slide.btnUrl || "/women"} className="ta-hero-cta-primary">
                              <span>{slide.btnText || "Shop This Look"}</span>
                              <ArrowUpRight size={18} strokeWidth={2.2} />
                            </Link>

                            {slide.collectionUrl && (
                              <Link
                                href={slide.collectionUrl}
                                className="ta-hero-cta-secondary d-none d-md-inline-flex"
                              >
                                <span>{slide.collectionLabel || "View Collection"}</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Desktop Glass Navigation Arrows (Top-Right Editorial Cluster) */}
        {slides.length > 1 && (
          <>
            <div className="ta-hero-nav-group d-none d-md-flex">
              <button
                type="button"
                className="ta-hero-nav"
                aria-label="Previous product slide"
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="ta-hero-nav"
                aria-label="Next product slide"
                onClick={() => swiperRef.current?.slideNext()}
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Bottom Interactive Product Rail (Desktop) & Progress Pills (Mobile) */}
            <div className="ta-hero-pagination-wrap">
              <div className="container">
                <div className="ta-hero-thumbs d-none d-md-grid">
                  {slides.map((slide, idx) => {
                    const isActive = idx === activeSlideIndex;
                    return (
                      <button
                        key={slide.id || idx}
                        type="button"
                        onClick={() => goToSlide(idx)}
                        className={`ta-hero-thumb-btn ${isActive ? "is-active" : ""}`}
                        aria-label={`Show ${slide.shortLabel || slide.productTitle || `slide ${idx + 1}`}`}
                        aria-current={isActive ? "true" : "false"}
                      >
                        <div className="ta-hero-thumb-meta">
                          <span className="ta-hero-thumb-num">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="ta-hero-thumb-name">
                            {slide.shortLabel || slide.productTitle || slide.heading}
                          </span>
                        </div>
                        <div className="ta-hero-progress-track">
                          {isActive && (
                            <div
                              key={`bar-${activeSlideIndex}`}
                              className="ta-hero-progress-fill"
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="ta-hero-mobile-dots d-flex d-md-none">
                  {slides.map((slide, idx) => {
                    const isActive = idx === activeSlideIndex;
                    return (
                      <button
                        key={slide.id || idx}
                        type="button"
                        onClick={() => goToSlide(idx)}
                        className={`ta-hero-dot-btn ${isActive ? "is-active" : ""}`}
                        aria-label={`Slide ${idx + 1}: ${slide.shortLabel || slide.productTitle}`}
                      >
                        <span className="ta-hero-dot-track">
                          {isActive && (
                            <span
                              key={`mob-bar-${activeSlideIndex}`}
                              className="ta-hero-dot-fill"
                            />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {isNotifyModalOpen && (
        <div className="teaser-modal-overlay" onClick={() => setIsNotifyModalOpen(false)}>
          <div className="teaser-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="teaser-modal-close"
              onClick={() => setIsNotifyModalOpen(false)}
              type="button"
            >
              ×
            </button>
            <div className="teaser-modal-icon">✉</div>
            <h3 className="teaser-modal-title">SOMETHING ICONIC</h3>
            <p className="teaser-modal-subtitle">
              Sign up below to receive an exclusive early notification and special access when the
              collection drops.
            </p>
            <form onSubmit={handleNotifySubmit} className="teaser-form-group">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                className="teaser-input"
                disabled={subscribeStatus === "loading"}
              />
              <button
                type="submit"
                className="teaser-modal-btn"
                disabled={subscribeStatus === "loading"}
              >
                {subscribeStatus === "loading" ? "SUBMITTING..." : "NOTIFY ME"}
              </button>
            </form>
            {subscribeStatus === "success" && (
              <p className="teaser-status-msg success">
                ✓ Thank you! You will be notified instantly.
              </p>
            )}
            {subscribeStatus === "error" && (
              <p className="teaser-status-msg error">✗ Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .ta-hero-section {
          position: relative;
          width: 100%;
          height: clamp(520px, calc(100vh - 128px), 760px);
          background: #0c0a09;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }

        .ta-hero-slide-inner {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .ta-hero-media-wrap,
        .ta-hero-picture {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .ta-hero-media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
        }

        .ta-hero-scrim {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background: linear-gradient(
            to right,
            rgba(10, 8, 7, 0.72) 0%,
            rgba(10, 8, 7, 0.32) 38%,
            rgba(10, 8, 7, 0) 60%
          );
        }

        .ta-hero-content {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          z-index: 5;
          pointer-events: none;
        }

        .ta-hero-copy {
          max-width: 440px;
          pointer-events: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 13px;
        }

        .ta-hero-title {
          font-family: var(--font-outfit, "Kumbh Sans", sans-serif);
          font-size: clamp(36px, 4.1vw, 58px);
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: -0.025em;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
        }

        .ta-hero-desc {
          font-family: var(--font-outfit, "Outfit", sans-serif);
          font-size: 15.5px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.84);
          margin: 0;
          max-width: 430px;
        }

        .ta-hero-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 4px;
        }

        .ta-hero-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          border-radius: 9999px;
          background: #ffffff;
          color: #111111 !important;
          font-family: var(--font-outfit, "Outfit", sans-serif);
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none !important;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
          transition: transform 0.25s ease, background-color 0.25s ease, color 0.25s ease !important;
        }

        .ta-hero-cta-primary:hover {
          background: #d4af37;
          color: #0b0908 !important;
          transform: translateY(-2px);
          text-decoration: none !important;
        }

        .ta-hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          padding: 12px 22px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.32);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff !important;
          font-family: var(--font-outfit, "Outfit", sans-serif);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none !important;
          transition: background-color 0.25s ease, border-color 0.25s ease !important;
        }

        .ta-hero-cta-secondary:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: #d4af37;
          color: #ffffff !important;
          text-decoration: none !important;
        }

        /* Glassmorphic Desktop Arrows (Top-Right Cluster) */
        .ta-hero-nav-group {
          position: absolute;
          top: 22px;
          right: 24px;
          z-index: 22;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ta-hero-nav {
          width: 42px !important;
          height: 42px !important;
          min-width: 42px !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 50% !important;
          border: 1px solid rgba(255, 255, 255, 0.28) !important;
          background: rgba(12, 10, 9, 0.56) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #ffffff !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer;
          opacity: 0.88;
          transition: opacity 0.25s ease, background-color 0.25s ease, border-color 0.25s ease, transform 0.25s ease !important;
        }

        .ta-hero-nav svg {
          width: 18px !important;
          height: 18px !important;
          flex-shrink: 0 !important;
          display: block;
        }

        .ta-hero-nav:hover {
          opacity: 1;
          background: rgba(212, 175, 55, 0.92) !important;
          border-color: #d4af37 !important;
          color: #111111 !important;
          transform: scale(1.06);
        }

        /* Bottom Product Thumbnails & Progress Strip */
        .ta-hero-pagination-wrap {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 16px;
          z-index: 20;
          pointer-events: none;
        }

        .ta-hero-thumbs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          padding-right: 68px;
          pointer-events: auto;
        }

        .ta-hero-thumb-btn {
          background: rgba(12, 10, 9, 0.56);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 10px;
          padding: 10px 14px;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.25s ease, border-color 0.25s ease !important;
        }

        .ta-hero-thumb-btn:hover {
          background: rgba(20, 17, 15, 0.78);
          border-color: rgba(212, 175, 55, 0.5);
        }

        .ta-hero-thumb-btn.is-active {
          background: rgba(20, 16, 13, 0.85);
          border-color: rgba(212, 175, 55, 0.72);
        }

        .ta-hero-thumb-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .ta-hero-thumb-num {
          font-family: var(--font-outfit, "Outfit", sans-serif);
          font-size: 11px;
          font-weight: 700;
          color: #d4af37;
          letter-spacing: 0.08em;
        }

        .ta-hero-thumb-name {
          font-family: var(--font-outfit, "Outfit", sans-serif);
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.86);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ta-hero-thumb-btn.is-active .ta-hero-thumb-name {
          color: #ffffff;
          font-weight: 600;
        }

        .ta-hero-progress-track {
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.16);
          border-radius: 2px;
          overflow: hidden;
        }

        .ta-hero-progress-fill {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #d4af37 0%, #f5dc82 100%);
          transform-origin: left center;
          animation: taHeroProgress ${AUTOPLAY_DELAY_MS}ms linear forwards;
        }

        /* Mobile Pagination Pills */
        .ta-hero-mobile-dots {
          justify-content: center;
          align-items: center;
          gap: 8px;
          pointer-events: auto;
        }

        .ta-hero-dot-btn {
          position: relative;
          width: 10px;
          height: 6px;
          padding: 0 !important;
          border: none;
          border-radius: 9999px;
          background: transparent;
          overflow: visible;
          cursor: pointer;
          transition: width 0.3s ease !important;
        }

        .ta-hero-dot-btn::after {
          content: "";
          position: absolute;
          inset: -14px -6px;
        }

        .ta-hero-dot-track {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.36);
          overflow: hidden;
          transition: background-color 0.3s ease !important;
        }

        .ta-hero-dot-btn.is-active {
          width: 38px;
        }

        .ta-hero-dot-btn.is-active .ta-hero-dot-track {
          background: rgba(255, 255, 255, 0.28);
        }

        .ta-hero-dot-fill {
          display: block;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #d4af37 0%, #f5dc82 100%);
          transform-origin: left center;
          animation: taHeroProgress ${AUTOPLAY_DELAY_MS}ms linear forwards;
        }

        @keyframes taHeroProgress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        /* Responsive Mobile Layout */
        @media (max-width: 767px) {
          .ta-hero-section {
            height: clamp(540px, calc(100svh - 104px), 720px);
          }

          .ta-hero-media-img {
            object-position: center 18%;
          }

          .ta-hero-scrim {
            background: linear-gradient(
              to top,
              rgba(8, 6, 5, 0.88) 0%,
              rgba(8, 6, 5, 0.48) 38%,
              rgba(8, 6, 5, 0.06) 68%,
              rgba(8, 6, 5, 0.2) 100%
            );
          }

          .ta-hero-content {
            top: auto;
            bottom: 46px;
            transform: none;
          }

          .ta-hero-content .container {
            padding-left: 20px;
            padding-right: 20px;
          }

          .ta-hero-copy {
            gap: 10px;
            max-width: 100%;
          }

          .ta-hero-title {
            font-size: clamp(28px, 7.6vw, 38px);
            line-height: 1.08;
          }

          .ta-hero-cta-primary {
            padding: 11px 22px;
            font-size: 12.5px;
          }

          .ta-hero-pagination-wrap {
            bottom: 14px;
          }
        }

        /* Legacy Teaser Modal & Content Styles */
        .teaser-content-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 12%;
          z-index: 10;
          font-family: "Outfit", "Inter", -apple-system, sans-serif;
        }
        .teaser-left-content {
          max-width: 580px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .teaser-badge {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #dfba6b;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }
        .teaser-headline {
          font-size: 4.5rem;
          font-weight: 800;
          line-height: 0.92;
          color: #ffffff;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }
        .teaser-headline span.gold-text {
          color: #dfba6b;
        }
        .teaser-description {
          font-size: 1rem;
          color: #e0e0e0;
          line-height: 1.5;
          margin-bottom: 2rem;
          max-width: 480px;
        }
        .teaser-actions {
          display: flex;
          gap: 1.2rem;
        }
        .teaser-btn-gold {
          background: #dfba6b;
          color: #111111;
          padding: 0.95rem 2.4rem;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          text-transform: uppercase;
          text-decoration: none;
        }
        .teaser-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
        }
        .teaser-modal-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 460px;
          position: relative;
          text-align: center;
        }
        .teaser-modal-close {
          position: absolute;
          top: 1.2rem;
          right: 1.2rem;
          background: transparent;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
