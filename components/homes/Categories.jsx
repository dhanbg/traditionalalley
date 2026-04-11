"use client";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { getImageUrl } from "@/utils/imageUtils";
import { useRouter } from "nextjs-toploader/app";

export default function Collections() {
  const [categories, setCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [inView, setInView] = useState([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      // Set initial state
      setIsMobile(window.innerWidth < 768);
      
      // Add resize listener
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      window.addEventListener("resize", handleResize);
      
      // Cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchDataFromApi("/api/categories?populate=*");
        const transformedCategories = data.data.map((item) => ({
          imgSrc: getImageUrl(item.imgSrc[0]?.formats?.medium?.url || item.imgSrc[0]?.url || ""),
          alt: item.alt || "category-image",
          title: item.title || "",
          delay: item.delay || 0,
          imgWidth: item.imgWidth || 626,
          imgHeight: item.imgHeight || 833,
        }));
        setCategories(transformedCategories);
      } catch (error) {
        // No console.error statements
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Listen for route change events to hide the spinner
    const handleRouteChange = () => setLoading(false);
    router.events?.on?.("routeChangeComplete", handleRouteChange);
    router.events?.on?.("routeChangeError", handleRouteChange);
    return () => {
      router.events?.off?.("routeChangeComplete", handleRouteChange);
      router.events?.off?.("routeChangeError", handleRouteChange);
    };
  }, [router]);

  // Intersection Observer for animation on scroll-in-view
  useEffect(() => {
    if (!categories.length) return;
    if (typeof window === 'undefined') return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            setInView((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
          }
        });
      },
      { threshold: 0.2 }
    );
    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [categories]);

  // Use negative margins to pull Categories closer to Hero - aggressive fix
  const heroGapStyle = {
    marginTop: isMobile ? '-20px' : '0px', // Pull up on mobile to reduce gap
    paddingTop: isMobile ? '30px' : '80px', // Compensate with smaller padding
    paddingBottom: isMobile ? '60px' : '80px'
  };

  return (
    <section className="flat-spacing hero-categories-gap" style={heroGapStyle}>
      <div className={`container ${isMobile ? "px-0" : ""}`}>
        <div className="heading-section-2 wow fadeInUp text-center">
          <h3 className="heading">Explore Categories</h3>
        </div>
        <div className={isMobile ? "mobile-categories-container" : ""}>
          <Swiper
            spaceBetween={10}
            slidesPerView={3}
            breakpoints={{
              1024: { slidesPerView: 3, spaceBetween: 20, centeredSlides: false },
              768: { slidesPerView: 2, spaceBetween: 20, centeredSlides: false },
              0: { slidesPerView: 1, spaceBetween: 10, centeredSlides: true },
            }}
            className="swiper tf-sw-categories"
            modules={[Pagination]}
            pagination={{
              clickable: true,
              el: ".spd39",
            }}
            centeredSlides={isMobile}
          >
            {categories.map((category, index) => (
              <SwiperSlide key={`category-${category.id}-${index}`} className={isMobile ? "flex justify-center items-center" : ""}>
                <div
                  ref={el => cardRefs.current[index] = el}
                  data-index={index}
                  className={`collection-position-2 style-2 hover-img category-fade-in${inView.includes(index) ? ' in-view' : ''}`}
                  style={{
                    animationDelay: `${index * 0.12 + 0.1}s`,
                    width: isMobile ? "90%" : "80%",
                    height: "100%",
                    margin: isMobile ? "0 auto" : "0",
                    maxWidth: isMobile ? "300px" : "none"
                  }}
                >
                  <a className="img-style">
                    <Image
                      className="lazyload"
                      data-src={category.imgSrc}
                      alt={category.alt}
                      src={category.imgSrc}
                      width={category.imgWidth}
                      height={category.imgHeight}
                      priority={index === 0 || category.imgSrc.includes('p2_2215d1f166.jpg')}
                    />
                  </a>
                  <div className="content">
                    <Link
                      href={`/${category.title.toLowerCase()}`}
                      className="cls-btn"
                      onClick={() => setLoading(true)}
                    >
                      <h6 className="text">{category.title}</h6>
                      <i className="icon icon-arrowUpRight" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}

            <div className="sw-pagination-categories sw-dots type-circle justify-content-center spd39" />
          </Swiper>
        </div>
      </div>

      {loading && (
        <div className="category-loading-overlay">
          <div className="loading-container">
            <div className="fashion-loader">
              <div className="clothing-assembly">
                <div className="fabric-piece piece-1">
                  <div className="fabric-pattern"></div>
                </div>
                <div className="fabric-piece piece-2">
                  <div className="fabric-pattern"></div>
                </div>
                <div className="fabric-piece piece-3">
                  <div className="fabric-pattern"></div>
                </div>
                <div className="sewing-needle">
                  <div className="needle-body"></div>
                  <div className="needle-eye"></div>
                </div>
                <div className="thread-line">
                  <div className="thread-segment segment-1"></div>
                  <div className="thread-segment segment-2"></div>
                  <div className="thread-segment segment-3"></div>
                  <div className="thread-segment segment-4"></div>
                </div>
              </div>
              <div className="garment-outline">
                <div className="shirt-outline">
                  <div className="shirt-body"></div>
                  <div className="shirt-sleeve left"></div>
                  <div className="shirt-sleeve right"></div>
                  <div className="shirt-collar"></div>
                </div>
              </div>
              <div className="fashion-elements">
                <div className="button button-1"></div>
                <div className="button button-2"></div>
                <div className="button button-3"></div>
                <div className="zipper-line"></div>
              </div>
            </div>
            <p className="loading-text">Crafting Fashion...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .mobile-categories-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .category-loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, rgba(228, 49, 49, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loading-container {
          text-align: center;
          animation: fadeInScale 0.6s ease-out;
        }
        .fashion-loader {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto 30px;
        }
        .clothing-assembly {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto;
          animation: assemblyFloat 3s ease-in-out infinite;
        }
        .fabric-piece {
          position: absolute;
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #e43131, #ff6b6b);
          border-radius: 4px;
          overflow: hidden;
        }
        .fabric-pattern {
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.1) 2px,
            rgba(255, 255, 255, 0.1) 4px
          );
          animation: patternShift 2s linear infinite;
        }
        .piece-1 {
          top: 10px;
          left: 10px;
          animation: fabricFloat 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        .piece-2 {
          top: 10px;
          right: 10px;
          animation: fabricFloat 2.5s ease-in-out infinite 0.8s;
          transform-origin: center;
        }
        .piece-3 {
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          animation: fabricFloat 2.5s ease-in-out infinite 1.6s;
          transform-origin: center;
        }
        .sewing-needle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: needleStitch 1.5s ease-in-out infinite;
        }
        .needle-body {
          width: 2px;
          height: 40px;
          background: linear-gradient(to bottom, #c0c0c0, #808080);
          border-radius: 1px;
          position: relative;
        }
        .needle-eye {
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border: 1px solid #808080;
          border-radius: 50%;
          background: transparent;
        }
        .thread-line {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 2px;
        }
        .thread-segment {
          position: absolute;
          width: 15px;
          height: 2px;
          background: #e43131;
          border-radius: 1px;
        }
        .segment-1 {
          left: 0;
          animation: threadStitch 2s ease-in-out infinite;
        }
        .segment-2 {
          left: 20px;
          animation: threadStitch 2s ease-in-out infinite 0.5s;
        }
        .segment-3 {
          left: 40px;
          animation: threadStitch 2s ease-in-out infinite 1s;
        }
        .segment-4 {
          left: 60px;
          animation: threadStitch 2s ease-in-out infinite 1.5s;
        }
        .garment-outline {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.3;
          overflow: hidden;
        }
        .shirt-outline {
          position: relative;
          animation: garmentForm 4s ease-in-out infinite;
        }
        .shirt-body {
          width: 60px;
          height: 80px;
          border: 2px solid #e43131;
          border-radius: 8px 8px 4px 4px;
          background: transparent;
          position: relative;
        }
        .shirt-sleeve {
          position: absolute;
          width: 25px;
          height: 40px;
          border: 2px solid #e43131;
          border-radius: 12px;
          background: transparent;
          top: 5px;
        }
        .shirt-sleeve.left {
          left: -20px;
          animation: sleeveWave 3s ease-in-out infinite;
        }
        .shirt-sleeve.right {
          right: -20px;
          animation: sleeveWave 3s ease-in-out infinite 1.5s;
        }
        .shirt-collar {
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 15px;
          border: 2px solid #e43131;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background: transparent;
        }
        .fashion-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .button {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #e43131;
          border-radius: 50%;
          border: 1px solid #ff6b6b;
          animation: buttonShine 2s ease-in-out infinite;
        }
        .button-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }
        .button-2 {
          top: 30%;
          right: 20%;
          animation-delay: 0.7s;
        }
        .button-3 {
          bottom: 25%;
          left: 30%;
          animation-delay: 1.4s;
        }
        .zipper-line {
          position: absolute;
          top: 15%;
          right: 15%;
          width: 2px;
          height: 50px;
          background: repeating-linear-gradient(
            to bottom,
            #e43131 0px,
            #e43131 3px,
            transparent 3px,
            transparent 6px
          );
          animation: zipperMove 3s ease-in-out infinite;
        }
        .loading-text {
          font-size: 16px;
          color: #666;
          font-weight: 500;
          margin: 0;
          letter-spacing: 1px;
          background: linear-gradient(45deg, #e43131, #ff6b6b, #e43131);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShimmer 3s ease-in-out infinite;
        }
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes assemblyFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
        }
        @keyframes fabricFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-8px) rotate(5deg) scale(1.1);
            opacity: 1;
          }
        }
        @keyframes patternShift {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 8px 8px;
          }
        }
        @keyframes needleStitch {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          25% {
            transform: translate(-50%, -50%) translateY(-5px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(5px);
          }
          75% {
            transform: translate(-50%, -50%) translateY(-3px);
          }
        }
        @keyframes threadStitch {
          0%, 100% {
            opacity: 0.3;
            transform: scaleX(0.5);
          }
          50% {
            opacity: 1;
            transform: scaleX(1.2);
          }
        }
        @keyframes garmentForm {
          0%, 100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        @keyframes sleeveWave {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }
        @keyframes buttonShine {
          0%, 100% {
            box-shadow: 0 0 5px rgba(228, 49, 49, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 15px rgba(228, 49, 49, 0.8);
            transform: scale(1.3);
          }
        }
        @keyframes zipperMove {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }
        @keyframes textShimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        /* IMPORTANT: Override global flat-spacing with higher specificity */
        section.flat-spacing.hero-categories-gap {
          margin-top: 0 !important;
        }
        
        /* Desktop: maintain original spacing */
        @media (min-width: 769px) {
          section.flat-spacing.hero-categories-gap {
            padding-top: 80px !important;
            padding-bottom: 80px !important;
          }
        }
        
        /* Mobile: override global styles with !important */
        @media (max-width: 768px) {
          section.flat-spacing.hero-categories-gap {
            /* Force consistent 50px spacing on ALL mobile devices */
            padding-top: 50px !important;
            padding-bottom: 60px !important;
            min-height: auto !important;
          }
        }
        
        /* Additional mobile overrides to be absolutely sure */
        @media screen and (max-width: 768px) {
          .hero-categories-gap.flat-spacing {
            padding-top: 50px !important;
          }
        }
        
        /* Force for very specific mobile breakpoints */
        @media only screen and (max-device-width: 768px) {
          section.hero-categories-gap {
            padding-top: 50px !important;
          }
        }
        
        @media (max-width: 767px) {
          .mobile-categories-container :global(.swiper) {
            width: 100%;
            max-width: 350px;
            margin: 0 auto;
          }
          .mobile-categories-container :global(.swiper-slide) {
            display: flex !important;
            justify-content: center !important;
          }
        }
        .category-fade-in {
          opacity: 0;
          transform: translateY(40px) scale(0.96);
          filter: blur(4px);
        }
        .category-fade-in.in-view {
          animation: categoryFadeIn 1s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        @keyframes categoryFadeIn {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </section>
  );
}
