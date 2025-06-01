"use client";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";
import { useRouter } from "next/navigation";

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
          imgSrc: `${API_URL}${item.imgSrc[0]?.formats?.medium?.url || item.imgSrc[0]?.url || ""}`,
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

  return (
    <section className="flat-spacing">
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
              <SwiperSlide key={category.id || index} className={isMobile ? "flex justify-center items-center" : ""}>
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
          <span className="category-spinner" />
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
          background: rgba(255,255,255,0.7);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .category-spinner {
          display: inline-block;
          width: 60px;
          height: 60px;
          border: 6px solid #f3f3f3;
          border-top: 6px solid #e43131;
          border-radius: 50%;
          animation: category-spin 1s linear infinite;
        }
        @keyframes category-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
