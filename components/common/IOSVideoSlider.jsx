"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";

export default function IOSVideoSlider({ parentClass = "" }) {
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const apiEndpoint = '/api/instagrams?populate=*';
        const response = await fetchDataFromApi(apiEndpoint);
        setInstagramPosts(response.data || []);
      } catch (error) {
        console.error('Failed to fetch Instagram posts:', error);
        // iOS-compatible mock data with working video URLs
        const mockData = [
          {
            id: 1,
            link: 'https://instagram.com/p/test1',
            media: {
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              mime: 'video/mp4',
              alternativeText: 'Sample Instagram Video 1 - Big Buck Bunny',
              formats: {
                thumbnail: {
                  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images_480x270/BigBuckBunny.jpg'
                }
              }
            }
          },
          {
            id: 2,
            link: 'https://instagram.com/p/test2',
            media: {
              url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
              mime: 'video/mp4',
              alternativeText: 'Sample Instagram Video 2',
              formats: {
                thumbnail: {
                  url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
                }
              }
            }
          },
          {
            id: 3,
            link: 'https://instagram.com/p/test3',
            media: {
              url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=640&h=640&fit=crop',
              mime: 'image/jpeg',
              alternativeText: 'Sample Instagram Image 1'
            }
          },
          {
            id: 4,
            link: 'https://instagram.com/p/test4',
            media: {
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              mime: 'video/mp4',
              alternativeText: 'Sample Instagram Video 3',
              formats: {
                thumbnail: {
                  url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=640&h=640&fit=crop'
                }
              }
            }
          },
          {
            id: 5,
            link: 'https://instagram.com/p/test5',
            media: {
              url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=640&h=640&fit=crop',
              mime: 'image/jpeg',
              alternativeText: 'Sample Instagram Image 2'
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

  const getVisibleSlides = () => {
    if (typeof window === 'undefined') return 2;
    if (window.innerWidth >= 1200) return 5;
    if (window.innerWidth >= 768) return 3;
    return 2;
  };

  const [visibleSlides, setVisibleSlides] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      setVisibleSlides(getVisibleSlides());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxSlide = Math.max(0, instagramPosts.length - visibleSlides);

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (index) => {
    setCurrentSlide(Math.min(index, maxSlide));
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const renderMediaItem = (item, index) => {
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
    const thumbnailUrl = item.media?.formats?.thumbnail?.url;
    let posterUrl = undefined;
    
    if (thumbnailUrl) {
      if (thumbnailUrl.startsWith('http')) {
        posterUrl = thumbnailUrl;
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || API_URL;
        posterUrl = `${baseUrl}${thumbnailUrl}`;
      }
    }

    return (
      <div
        key={item.id || index}
        className="ios-gallery-item"
        style={{
          minWidth: `${100 / visibleSlides}%`,
          padding: '0 5px'
        }}
      >
        <div className="gallery-content">
          <div className="media-container">
            {isVideo ? (
              <video
                className="ios-video"
                width="100%"
                height="640"
                muted
                loop
                playsInline
                preload="metadata"
                poster={posterUrl}
                onCanPlay={(e) => {
                  // Auto-play only if user has interacted or on non-iOS
                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                  if (!isIOS) {
                    e.target.play().catch(() => {});
                  }
                }}
                onLoadedMetadata={(e) => {
                  // Ensure video is ready for iOS
                  e.target.currentTime = 0.1;
                }}
                onClick={(e) => {
                  // Manual play/pause on click for iOS
                  if (e.target.paused) {
                    e.target.play().catch(() => {});
                  } else {
                    e.target.pause();
                  }
                }}
              >
                <source src={mediaUrl} type="video/mp4" />
                <source src={mediaUrl} type={item.media?.mime || 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                className="ios-image"
                alt={item.media?.alternativeText || "Instagram post"}
                src={mediaUrl}
                width={640}
                height={640}
                style={{ objectFit: 'cover', width: '100%', height: '640px' }}
              />
            )}
          </div>
          <Link
            href={item.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="view-link"
          >
            <span className="icon icon-eye" />
            <span className="tooltip">View Instagram Post</span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <section className={parentClass}>
      <div className="container">
        <div className="heading-section text-center">
          <h3 className="heading wow fadeInUp">Explore Instagram</h3>
          <p className="subheading text-secondary wow fadeInUp">
            Elevate your wardrobe with fresh finds today!
          </p>
        </div>

        <div className="ios-slider-container">
          {loading ? (
            <div className="loading-container">
              {Array.from({ length: visibleSlides }).map((_, i) => (
                <div key={i} className="loading-item">
                  <div className="loading-placeholder">
                    Loading...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div
                className="ios-slider"
                ref={sliderRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="ios-slider-track"
                  style={{
                    transform: `translateX(-${currentSlide * (100 / visibleSlides)}%)`,
                    transition: 'transform 0.3s ease-in-out'
                  }}
                >
                  {instagramPosts.map((item, index) => renderMediaItem(item, index))}
                </div>
              </div>

              {/* Navigation buttons */}
              {currentSlide > 0 && (
                <button
                  className="slider-nav prev"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                >
                  ‹
                </button>
              )}
              {currentSlide < maxSlide && (
                <button
                  className="slider-nav next"
                  onClick={nextSlide}
                  aria-label="Next slide"
                >
                  ›
                </button>
              )}

              {/* Pagination dots */}
              <div className="slider-pagination">
                {Array.from({ length: maxSlide + 1 }).map((_, index) => (
                  <button
                    key={index}
                    className={`pagination-dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .ios-slider-container {
          position: relative;
          overflow: hidden;
          margin: 2rem 0;
        }

        .ios-slider {
          width: 100%;
          overflow: hidden;
        }

        .ios-slider-track {
          display: flex;
          width: ${instagramPosts.length * (100 / visibleSlides)}%;
        }

        .ios-gallery-item {
          flex-shrink: 0;
        }

        .gallery-content {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .media-container {
          position: relative;
          width: 100%;
          height: 640px;
          overflow: hidden;
        }

        .ios-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
        }

        .ios-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .view-link {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 12px;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
          text-decoration: none;
        }

        .gallery-content:hover .view-link {
          opacity: 1;
        }

        .slider-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          z-index: 10;
          transition: background 0.3s ease;
        }

        .slider-nav:hover {
          background: rgba(0, 0, 0, 0.9);
        }

        .slider-nav.prev {
          left: 10px;
        }

        .slider-nav.next {
          right: 10px;
        }

        .slider-pagination {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .pagination-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background: #ccc;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .pagination-dot.active {
          background: #007bff;
        }

        .loading-container {
          display: flex;
          gap: 10px;
        }

        .loading-item {
          flex: 1;
          min-width: ${100 / visibleSlides}%;
        }

        .loading-placeholder {
          width: 100%;
          height: 640px;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #666;
        }

        @media (max-width: 768px) {
          .slider-nav {
            width: 35px;
            height: 35px;
            font-size: 16px;
          }

          .media-container {
            height: 400px;
          }

          .loading-placeholder {
            height: 400px;
          }
        }
      `}</style>
    </section>
  );
}