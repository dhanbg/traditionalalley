"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";

import { Pagination } from "swiper/modules";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";

export default function ShopGram({ parentClass = "" }) {
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({
    apiCalled: false,
    apiResponse: null,
    videoCount: 0,
    videoUrls: [],
    errors: [],
    videoLoadStatus: {}
  });

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        setDebugInfo(prev => ({ ...prev, apiCalled: true }));
        const apiEndpoint = '/api/instagrams?populate=*';
        const response = await fetchDataFromApi(apiEndpoint);
        
        setDebugInfo(prev => ({ ...prev, apiResponse: response }));
        
        if (response && response.data) {
          const videoCount = response.data.filter(post => post.media?.mime?.startsWith('video/')).length;
          const videoUrls = response.data
            .filter(post => post.media?.mime?.startsWith('video/'))
            .map(post => ({
              url: post.media.url,
              mime: post.media.mime,
              size: post.media.size
            }));
          
          setDebugInfo(prev => ({ 
            ...prev, 
            videoCount,
            videoUrls
          }));
          
          setInstagramPosts(response.data);
        } else {
          setDebugInfo(prev => ({ 
            ...prev, 
            errors: [...prev.errors, 'No Instagram data received, using mock data']
          }));
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
        }
      } catch (error) {
        setDebugInfo(prev => ({ 
          ...prev, 
          errors: [...prev.errors, `Error fetching Instagram posts: ${error.message}`]
        }));
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
            el: ".spb222",
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
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                        <video
                          className="lazyload img-hover"
                          width={640}
                          height={640}
                          style={{ objectFit: 'cover' }}
                          muted
                          loop
                          playsInline
                          preload="none"
                          controls={false}
                          onClick={(e) => {
                            const video = e.target;
                            if (video.paused) {
                              video.play().catch(err => {
                                setDebugInfo(prev => ({
                                  ...prev,
                                  errors: [...prev.errors, `Video ${i + 1} play failed: ${err.message}`]
                                }));
                              });
                            } else {
                              video.pause();
                            }
                          }}
                          poster={item.media?.formats?.thumbnail?.url ? 
                            (item.media.formats.thumbnail.url.startsWith('http') ? 
                              item.media.formats.thumbnail.url : 
                              `${process.env.NEXT_PUBLIC_API_URL || API_URL}${item.media.formats.thumbnail.url}`
                            ) : undefined
                          }
                          onLoadStart={(event) => {
                            setDebugInfo(prev => ({
                              ...prev,
                              videoLoadStatus: {
                                ...prev.videoLoadStatus,
                                [`video_${i + 1}`]: { status: 'loading', url: mediaUrl, isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) }
                              }
                            }));
                            // iOS Safari video loading fix
                            if (typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
                              const video = event.target;
                              video.load();
                            }
                          }}
                          onLoadedData={() => {
                            setDebugInfo(prev => ({
                              ...prev,
                              videoLoadStatus: {
                                ...prev.videoLoadStatus,
                                [`video_${i + 1}`]: { ...prev.videoLoadStatus[`video_${i + 1}`], status: 'loaded' }
                              }
                            }));
                          }}
                          onError={(event) => {
                            setDebugInfo(prev => ({
                              ...prev,
                              videoLoadStatus: {
                                ...prev.videoLoadStatus,
                                [`video_${i + 1}`]: { ...prev.videoLoadStatus[`video_${i + 1}`], status: 'error', error: event.target.error?.message || 'Unknown error' }
                              },
                              errors: [...prev.errors, `Video ${i + 1} failed to load: ${mediaUrl}`]
                            }));
                          }}
                          onCanPlay={() => {
                            setDebugInfo(prev => ({
                              ...prev,
                              videoLoadStatus: {
                                ...prev.videoLoadStatus,
                                [`video_${i + 1}`]: { ...prev.videoLoadStatus[`video_${i + 1}`], status: 'can_play' }
                              }
                            }));
                          }}
                        >
                          <source src={mediaUrl} type="video/mp4" />
                        </video>
                        {/* Play button overlay for iOS */}
                        <div 
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            borderRadius: '50%',
                            width: '60px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '24px',
                            pointerEvents: 'none'
                          }}
                        >
                          ▶
                        </div>
                        </div>
                      ) : (
                        <Image
                          className="lazyload img-hover"
                          alt={item.media?.alternativeText || "Instagram post"}
                          src={mediaUrl}
                          width={640}
                          height={640}
                          style={{ objectFit: 'cover' }}
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
        
        {/* Debug Panel */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🔍 Debug Info</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>API Status:</strong> {debugInfo.apiCalled ? '✅ Called' : '❌ Not Called'}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Posts Received:</strong> {debugInfo.apiResponse?.data?.length || 0}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Video Count:</strong> {debugInfo.videoCount}
          </div>
          
          {debugInfo.videoUrls.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Video URLs:</strong>
              {debugInfo.videoUrls.map((video, idx) => (
                <div key={idx} style={{ marginLeft: '10px', marginTop: '5px' }}>
                  <div>🎬 Video {idx + 1}: {video.mime}</div>
                  <div style={{ wordBreak: 'break-all', color: '#6c757d' }}>{video.url}</div>
                </div>
              ))}
            </div>
          )}
          
          {Object.keys(debugInfo.videoLoadStatus).length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Video Load Status:</strong>
              {Object.entries(debugInfo.videoLoadStatus).map(([key, status]) => (
                <div key={key} style={{ marginLeft: '10px', marginTop: '5px' }}>
                  <div>{key}: {status.status} {status.isIOS ? '📱' : '💻'}</div>
                  {status.error && <div style={{ color: 'red' }}>Error: {status.error}</div>}
                </div>
              ))}
            </div>
          )}
          
          {debugInfo.errors.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Errors:</strong>
              {debugInfo.errors.map((error, idx) => (
                <div key={idx} style={{ color: 'red', marginLeft: '10px', marginTop: '5px' }}>
                  ❌ {error}
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: '10px', fontSize: '10px', color: '#6c757d' }}>
            User Agent: {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 100) + '...' : 'Server'}
          </div>
        </div>
      </div>
    </section>
  );
}
