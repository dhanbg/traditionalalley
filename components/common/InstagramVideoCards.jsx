"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";
import { Pagination } from "swiper/modules";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";

// Custom AutoplayVideo component as fallback
const AutoplayVideo = ({ src, poster, style, className, ...props }) => {
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          video.play().catch(console.error);
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      style={style}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      {...props}
    />
  );
};

export default function InstagramVideoCards({ parentClass = "" }) {
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
        // Use mock data for testing when API fails
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
              url: 'https://res.cloudinary.com/dqmhtibfm/image/upload/v1756706432/sample_image_1.jpg',
              mime: 'image/jpeg',
              alternativeText: 'Sample Instagram Image 1'
            }
          },
          {
            id: 4,
            link: 'https://instagram.com/p/test4',
            media: {
              url: 'https://res.cloudinary.com/dqmhtibfm/video/upload/v1756706432/sample_video_3.mp4',
              mime: 'video/mp4',
              alternativeText: 'Sample Instagram Video 3',
              formats: {
                thumbnail: {
                  url: 'https://res.cloudinary.com/dqmhtibfm/image/upload/v1756706432/sample_thumb_3.jpg'
                }
              }
            }
          },
          {
            id: 5,
            link: 'https://instagram.com/p/test5',
            media: {
              url: 'https://res.cloudinary.com/dqmhtibfm/image/upload/v1756706432/sample_image_2.jpg',
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
          pagination={{
            clickable: true,
            el: ".spb333",
          }}
        >
          {loading ? (
            // Loading skeleton
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
          ) : (
            instagramPosts.slice(0, 5).map((item, i) => {
              // Improved image URL construction for production
              let mediaUrl = '/images/placeholder.jpg';
              if (item.media?.url) {
                if (item.media.url.startsWith('http')) {
                  mediaUrl = item.media.url;
                } else {
                  // Use the API_URL from environment or fallback
                  const baseUrl = process.env.NEXT_PUBLIC_API_URL || API_URL;
                  mediaUrl = `${baseUrl}${item.media.url}`;
                }
              }
              const isVideo = item.media?.mime?.startsWith('video/');
              
              return (
                <SwiperSlide key={item.id || i}>
                  <div
                    className="gallery-item hover-overlay hover-img wow fadeInUp"
                    data-wow-delay={`${(i + 1) * 0.1}s`}
                  >
                    <div className="img-style">
                    {isVideo ? (
                      <AutoplayVideo
                        src={mediaUrl}
                        poster={item.media?.formats?.thumbnail?.url ? 
                          (item.media.formats.thumbnail.url.startsWith('http') ? 
                            item.media.formats.thumbnail.url : 
                            `${process.env.NEXT_PUBLIC_API_URL || API_URL}${item.media.formats.thumbnail.url}`
                          ) : undefined
                        }
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="lazyload img-hover"
                      />
                    ) : (
                      <Image
                        className="lazyload img-hover"
                        alt={item.media?.alternativeText || "Instagram post"}
                        src={mediaUrl}
                        width={640}
                        height={640}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
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
                        transition: 'opacity 0.3s ease',
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
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0';
                      }}
                    >
                      <span className="icon icon-eye" />
                      <span className="tooltip">View Instagram Post</span>
                    </Link>
                  </div>
                </SwiperSlide>
              );
            })
          )}
        </Swiper>
        
        <div className="sw-dots style-2 sw-pagination-gallery justify-content-center spb333"></div>

      </div>
    </section>
  );
}