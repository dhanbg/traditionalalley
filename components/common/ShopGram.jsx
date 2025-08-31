"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";
import { debugApiCall, debugApiResponse, debugComponentMount, checkProductionReadiness, createDebugPanel } from '../../utils/debug';
import { Pagination } from "swiper/modules";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";

export default function ShopGram({ parentClass = "" }) {
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    debugComponentMount('ShopGram');
    checkProductionReadiness();

    const fetchInstagramPosts = async () => {
      try {
        const apiEndpoint = '/api/instagrams?populate=*';
        const debugCallInfo = debugApiCall(apiEndpoint, 'GET');
        
        const response = await fetchDataFromApi(apiEndpoint);
        
        const debugResponseInfo = debugApiResponse(apiEndpoint, { ok: !!response }, response);
        
        setDebugInfo({
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          API_URL: API_URL,
          NODE_ENV: process.env.NODE_ENV,
          apiEndpoint,
          responseStatus: response ? 'success' : 'failed',
          dataCount: response?.data?.length || 0,
          hasData: !!(response?.data && response.data.length > 0),
          timestamp: new Date().toISOString()
        });
        
        setInstagramPosts(response.data || []);
      } catch (error) {
        debugApiResponse('/api/instagrams?populate=*', null, null, error);
        
        setDebugInfo({
          error: error.message,
          API_URL,
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, []);
  return (
    <section className={parentClass}>
      <div className="container">
        {/* Debug Panel - Only show in development */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🔍 ShopGram Debug Info</h4>
            <div style={{ display: 'grid', gap: '4px' }}>
              <div><strong>API_URL:</strong> {debugInfo.API_URL}</div>
              <div><strong>NEXT_PUBLIC_API_URL:</strong> {debugInfo.NEXT_PUBLIC_API_URL || 'undefined'}</div>
              <div><strong>NODE_ENV:</strong> {debugInfo.NODE_ENV}</div>
              <div><strong>API Endpoint:</strong> {debugInfo.apiEndpoint}</div>
              <div><strong>Response Status:</strong> 
                <span style={{ color: debugInfo.responseStatus === 'success' ? 'green' : 'red' }}>
                  {debugInfo.responseStatus}
                </span>
              </div>
              <div><strong>Data Count:</strong> {debugInfo.dataCount}</div>
              <div><strong>Has Data:</strong> 
                <span style={{ color: debugInfo.hasData ? 'green' : 'red' }}>
                  {debugInfo.hasData ? 'Yes' : 'No'}
                </span>
              </div>
              {debugInfo.error && (
                <div style={{ color: 'red' }}><strong>Error:</strong> {debugInfo.error}</div>
              )}
              <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
            </div>
          </div>
        )}
        
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
              const mediaUrl = item.media?.url ? `${API_URL}${item.media.url}` : '/images/placeholder.jpg';
              const isVideo = item.media?.mime?.startsWith('video/');
              
              return (
                <SwiperSlide key={item.id || i}>
                  <div
                    className="gallery-item hover-overlay hover-img wow fadeInUp"
                    data-wow-delay={`${(i + 1) * 0.1}s`}
                  >
                    <div className="img-style">
                      {isVideo ? (
                        <video
                          className="lazyload img-hover"
                          width={640}
                          height={640}
                          style={{ objectFit: 'cover' }}
                          muted
                          loop
                          autoPlay
                        >
                          <source src={mediaUrl} type={item.media.mime} />
                        </video>
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
      </div>
    </section>
  );
}
