import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function BannerCountdown({ initialOfferData = null }) {
  
  // State declarations
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Sale status state
  const [saleStatus, setSaleStatus] = useState('upcoming'); // 'upcoming', 'active', 'ended'

  // Countdown Timer Effect
  useEffect(() => {
    // Only start countdown if offerData is available
    if (!offerData || (!offerData.start_date && !offerData.end_date)) {
      return;
    }
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      
      // Parse dates in local timezone to avoid UTC conversion issues
      let startDate = null;
      let endDate = null;
      
      if (offerData.start_date) {
        // If date only (YYYY-MM-DD), append local time to avoid UTC interpretation
        const startDateStr = offerData.start_date.includes('T') ? offerData.start_date : `${offerData.start_date}T00:00:00`;
        startDate = new Date(startDateStr).getTime();
      }
      
      if (offerData.end_date) {
        // If date only (YYYY-MM-DD), append end of day to avoid UTC interpretation  
        const endDateStr = offerData.end_date.includes('T') ? offerData.end_date : `${offerData.end_date}T23:59:59`;
        endDate = new Date(endDateStr).getTime();
      }
      
      let targetDate;
      let status;
      
      // Determine sale status and target date
      if (startDate && now < startDate) {
        // Sale hasn't started yet
        targetDate = startDate;
        status = 'upcoming';
      } else if (endDate && now < endDate) {
        // Sale is active
        targetDate = endDate;
        status = 'active';
      } else {
        // Sale has ended
        status = 'ended';
        setSaleStatus(status);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      setSaleStatus(status);
      
      // Calculate time remaining
      const distance = targetDate - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [offerData]); // Dependency on offerData to restart when data loads

  // Add CSS animation for pulse effect and responsive styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
      }
      
      .banner-countdown-responsive {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 0 20px;
        gap: 0;
      }
      
      .banner-countdown-responsive.three-images {
        justify-content: center;
        gap: 40px;
      }
      
      .text-size-reduced h3 {
        font-size: 1.5rem !important;
      }
      
      .text-size-reduced p {
        font-size: 0.8rem !important;
      }
      
      .text-size-reduced .tf-btn {
        font-size: 0.75rem !important;
        padding: 6px 12px !important;
      }
      

      
      @media (max-width: 1024px) {
        .banner-countdown-responsive {
          flex-direction: column;
          gap: 30px;
          padding: 20px;
        }
        
        .banner-countdown-responsive.three-images {
          gap: 20px;
        }
        
        .banner-img {
          order: -1;
          margin-bottom: 20px;
        }
        
        .banner-img img {
          height: 250px !important;
        }
        
        .banner-left h3 {
          font-size: 1.4rem !important;
          text-align: center;
        }
        
        .banner-left p {
          text-align: center;
          font-size: 0.85rem !important;
        }
        

      }
      
      @media (max-width: 768px) {
         .banner-countdown-responsive {
           padding: 15px;
           gap: 20px;
         }
         
         .banner-img {
           display: flex;
           flex-direction: row;
           gap: 8px;
           justify-content: center;
           flex-wrap: wrap;
         }
         
         .banner-img > div {
           flex: 1;
           min-width: 120px;
           max-width: 180px;
         }
         
         .banner-img img {
           height: 180px !important;
           width: 100% !important;
           margin: 0 auto;
         }
        
        .banner-left {
           text-align: center;
         }
         
         .banner-left h3 {
           font-size: 1.2rem !important;
           flex-direction: column;
           gap: 10px !important;
           justify-content: center;
         }
        
        .banner-left .discount-badge {
          width: 50px !important;
          height: 50px !important;
        }
        
        .banner-left .discount-badge span:first-child {
          font-size: 12px !important;
        }
        
        .banner-left .discount-badge span:last-child {
          font-size: 6px !important;
        }
        

      }
      
      .countdown-timer {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      
      .countdown-item {
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        color: white;
        padding: 10px 8px;
        border-radius: 8px;
        text-align: center;
        min-width: 60px;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        animation: pulse 2s infinite;
      }
      
      .countdown-number {
        font-size: 1.5rem;
        font-weight: bold;
        display: block;
        line-height: 1;
      }
      
      .countdown-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 2px;
        display: block;
      }
      
      @media (max-width: 768px) {
        .countdown-timer {
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .countdown-item {
          padding: 8px 6px;
          min-width: 50px;
        }
        
        .countdown-number {
          font-size: 1.2rem;
        }
        
        .countdown-label {
          font-size: 0.6rem;
        }
      }
      
      @media (max-width: 480px) {
         .banner-countdown-responsive {
           padding: 10px;
           gap: 15px;
         }
         
         .banner-img {
           gap: 6px;
           flex-wrap: nowrap;
         }
         
         .banner-img > div {
           min-width: 100px;
           max-width: 140px;
         }
         
         .banner-img img {
           height: 140px !important;
           width: 100% !important;
         }
        
        .banner-left {
           text-align: center;
         }
         
         .banner-left h3 {
           font-size: 1rem !important;
           gap: 8px !important;
        }
        
        .countdown-timer {
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .countdown-item {
          padding: 6px 4px;
          min-width: 45px;
        }
        
        .countdown-number {
          font-size: 1rem;
        }
        
        .countdown-label {
          font-size: 0.55rem;
           justify-content: center;
         }
        
        .banner-left .discount-badge {
          width: 40px !important;
          height: 40px !important;
        }
        
        .banner-left .discount-badge span:first-child {
          font-size: 10px !important;
        }
        
        .banner-left .discount-badge span:last-child {
          font-size: 5px !important;
        }
        
        .banner-left p {
          font-size: 0.75rem !important;
        }
        
        .tf-btn {
          font-size: 0.7rem !important;
          padding: 6px 10px !important;
        }
        

      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const fetchOfferData = async () => {
      try {
        const endpoint = '/api/offers?populate=*';
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch offer data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const firstOffer = data.data && data.data.length > 0 ? data.data[0] : null;
        if (firstOffer) {
          setOfferData(firstOffer);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (initialOfferData) {
      setOfferData(initialOfferData);
      setLoading(false);
      return;
    }
    fetchOfferData();
  }, [initialOfferData]);



  // Get banner images URLs (max 3 images)
  const getBannerImages = () => {
    if (!offerData?.banner_image || offerData.banner_image.length === 0) {
      // No fallback: only return real images from the offer data
      return [];
    }
    
    // Limit to maximum 3 images
    const images = offerData.banner_image.slice(0, 3).map((image, index) => {
      const processedUrl = image.url.startsWith('http') ? image.url : `${process.env.NEXT_PUBLIC_API_URL}${image.url}`;
      
      return {
        url: processedUrl,
        alternativeText: image.alternativeText || "banner"
      };
    });
    
    return images;
  };

  // Get responsive column classes based on image count
  const getImageColumnClass = () => {
    const imageCount = getBannerImages().length;
    switch (imageCount) {
      case 1:
        return "col-lg-2 col-md-3 col-sm-4";
      case 2:
        return "col-lg-3 col-md-4 col-sm-6";
      case 3:
      default:
        return "col-lg-4 col-md-6 col-sm-8";
    }
  };

  // Get text column class based on image count
  const getTextColumnClass = () => {
    const imageCount = getBannerImages().length;
    switch (imageCount) {
      case 1:
        return "col-lg-7 col-md-6 col-sm-5";
      case 2:
        return "col-lg-6 col-md-5 col-sm-4";
      case 3:
      default:
        return "col-lg-5 col-md-4 col-sm-3";
    }
  };

  // Get text size class based on image count
  const getTextSizeClass = () => {
    const imageCount = getBannerImages().length;
    return imageCount > 2 ? 'text-size-reduced' : '';
  };

  // Show loading state
  if (loading) {
    // Do not render loading placeholders on homepage offers
    return null;
  }
  
  // Early return if offer exists and is not active
  if (offerData && offerData.isActive === false) {
    return null;
  }

  // Don't render if offer is not active
  if (offerData && !offerData.isActive) {
    return null;
  }

  // Show error state or fallback to default content
  if (error || !offerData) {
    // Do not render fallback content for offers
    return null;
  }

  return (
    <>
      <section className="bg-surface" style={{ marginBottom: '60px' }}>
        <div className={`banner-countdown-responsive ${getBannerImages().length > 2 ? 'three-images' : ''}`}>
        {getBannerImages().length > 2 ? (
          // Layout for 3+ images: images on left, content + timer centered on right
          <>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="banner-img" style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', maxWidth: '100%', overflow: 'hidden' }}>
                {(() => {
                  const bannerImages = getBannerImages();
                  
                  return bannerImages.map((image, index) => {
                    return (
                      <div key={index} style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '300px' }}>
                        <Image
                          className="lazyload"
                          data-src={image.url}
                          alt={image.alternativeText}
                          src={image.url}
                          width={607}
                          height={655}
                          style={{ 
                            width: '100%',
                            height: '350px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div className={`banner-left ${getTextSizeClass()}`}>
                <div className="box-title" style={{ marginBottom: '24px' }}>
                  {/* Sale Status Message */}
                  <div className="text-center wow fadeInUp" style={{ marginBottom: '15px' }}>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '600',
                      color: saleStatus === 'upcoming' ? '#007bff' : saleStatus === 'active' ? '#28a745' : '#dc3545',
                      margin: '0'
                    }}>
                      {saleStatus === 'upcoming' && '🎉 Sale Starts In:'}
                      {saleStatus === 'active' && '⏰ Sale Ends In:'}
                      {saleStatus === 'ended' && '😞 Sale Has Ended'}
                    </p>
                  </div>
                  
                  {/* Countdown Timer */}
                  {saleStatus !== 'ended' && (
                    <div className="countdown-timer wow fadeInUp">
                      <div className="countdown-item">
                        <span className="countdown-number">{timeLeft.days}</span>
                        <span className="countdown-label">Days</span>
                      </div>
                      <div className="countdown-item">
                        <span className="countdown-number">{timeLeft.hours}</span>
                        <span className="countdown-label">Hours</span>
                      </div>
                      <div className="countdown-item">
                        <span className="countdown-number">{timeLeft.minutes}</span>
                        <span className="countdown-label">Min</span>
                      </div>
                      <div className="countdown-item">
                        <span className="countdown-number">{timeLeft.seconds}</span>
                        <span className="countdown-label">Sec</span>
                      </div>
                    </div>
                  )}
                  <h3 className="wow fadeInUp" style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center', lineHeight: '1.2' }}>
                    <div className="discount-badge" style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                      animation: 'pulse 2s infinite',
                      flexShrink: 0,
                      padding: '2px'
                    }}>
                      <span style={{ fontSize: '14px', lineHeight: '0.9', textAlign: 'center', margin: '0' }}>{offerData.discount_percentage}%</span>
                      <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'center', margin: '0', marginTop: '1px' }}>OFF</span>
                    </div>
                    <span>Limited-Time Deals On!</span>
                  </h3>
                  <p className="text-secondary wow fadeInUp" style={{ fontSize: '0.9rem' }}>
                    {offerData.description}
                  </p>
                </div>
                <div className="btn-banner wow fadeInUp">
                  <Link 
                    href={offerData.button_link || `/shop-default-grid`} 
                    className="tf-btn btn-fill"
                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  >
                    <span className="text">{offerData.button_text}</span>
                    <i className="icon icon-arrowUpRight" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Original layout for 1-2 images
          <>
            <div style={{ flex: '0 0 auto' }}>
              <div className={`banner-left ${getTextSizeClass()}`}>
                <div className="box-title" style={{ marginBottom: '24px' }}>
                  {/* Countdown Timer */}
                  <div className="countdown-timer wow fadeInUp">
                    <div className="countdown-item">
                      <span className="countdown-number">{timeLeft.days}</span>
                      <span className="countdown-label">Days</span>
                    </div>
                    <div className="countdown-item">
                      <span className="countdown-number">{timeLeft.hours}</span>
                      <span className="countdown-label">Hours</span>
                    </div>
                    <div className="countdown-item">
                      <span className="countdown-number">{timeLeft.minutes}</span>
                      <span className="countdown-label">Min</span>
                    </div>
                    <div className="countdown-item">
                      <span className="countdown-number">{timeLeft.seconds}</span>
                      <span className="countdown-label">Sec</span>
                    </div>
                  </div>
                  
                  <h3 className="wow fadeInUp" style={{ marginBottom: '16px' }}>{offerData.title}</h3>
                  <p className="text-secondary wow fadeInUp">
                    {offerData.description}
                  </p>
                </div>
                <div className="btn-banner wow fadeInUp">
                  <Link 
                    href={offerData.button_link || `/shop-default-grid`} 
                    className="tf-btn btn-fill"
                  >
                    <span className="text">{offerData.button_text}</span>
                    <i className="icon icon-arrowUpRight" />
                  </Link>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="banner-img" style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', maxWidth: '100%', overflow: 'hidden' }}>
                {getBannerImages().map((image, index) => (
                   <div key={index} style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '300px' }}>
                    <Image
                       className="lazyload"
                       data-src={image.url}
                       alt={image.alternativeText}
                       src={image.url}
                       width={607}
                       height={655}
                       style={{ 
                         width: '100%',
                         height: '350px',
                         objectFit: 'cover',
                         borderRadius: '8px'
                       }}
                    />
                  </div>
                ))}
              </div>
            </div>

          </>
        )}
        </div>
      </section>
    </>
  );
}
