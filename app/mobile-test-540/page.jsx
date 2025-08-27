'use client';

import { useState, useEffect } from 'react';
import { fetchDataFromApi } from '@/utils/api';
import { getImageUrl } from '@/utils/imageUtils';

export default function MobileTest540() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [heroData, setHeroData] = useState(null);
  const [mediaAnalysis, setMediaAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mobile detection (same logic as Hero component)
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setWindowWidth(width);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch and analyze hero data
  useEffect(() => {
    const fetchAndAnalyze = async () => {
      try {
        const response = await fetchDataFromApi('/hero-slides?populate=*');
        setHeroData(response);
        
        if (response.data) {
          const analysis = response.data.map((item, index) => {
            const hasMobileMedia = !!item.mobileMedia;
            const hasDesktopMedia = !!item.media;
            
            // Exact same logic as Hero component
            const selectedMedia = isMobile && item.mobileMedia ? item.mobileMedia : item.media;
            const isUsingMobileMedia = selectedMedia === item.mobileMedia;
            
            let mediaType = 'image';
            let mediaUrl = '';
            
            if (selectedMedia?.url) {
              mediaUrl = selectedMedia.url;
              const mimeType = selectedMedia.mime || '';
              const fileExt = selectedMedia.ext || '';
              
              if (mimeType.startsWith('video/') || ['.mp4', '.webm', '.mov', '.avi'].includes(fileExt.toLowerCase())) {
                mediaType = 'video';
              } else if (mimeType.startsWith('audio/') || ['.mp3', '.wav', '.ogg'].includes(fileExt.toLowerCase())) {
                mediaType = 'audio';
              }
            }
            
            return {
              index,
              documentId: item.documentId,
              hasMobileMedia,
              hasDesktopMedia,
              isUsingMobileMedia,
              mediaType,
              mediaUrl: getImageUrl(mediaUrl),
              mobileMediaUrl: item.mobileMedia?.url ? getImageUrl(item.mobileMedia.url) : null,
              desktopMediaUrl: item.media?.url ? getImageUrl(item.media.url) : null,
              mobileMediaName: item.mobileMedia?.name || 'N/A',
              desktopMediaName: item.media?.name || 'N/A',
              heading: item.heading || 'No heading',
              subheading: item.subheading || 'No subheading'
            };
          });
          
          setMediaAnalysis(analysis);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hero data:', error);
        setLoading(false);
      }
    };
    
    if (windowWidth > 0) {
      fetchAndAnalyze();
    }
  }, [isMobile, windowWidth]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading Mobile Media Test...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Mobile Media Test - 540px Width</h1>
      
      {/* Current Status */}
      <div style={{
        backgroundColor: isMobile ? '#d4edda' : '#f8d7da',
        border: `1px solid ${isMobile ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h2>Current Status</h2>
        <p><strong>Window Width:</strong> {windowWidth}px</p>
        <p><strong>Is Mobile (≤768px):</strong> {isMobile ? '✅ YES' : '❌ NO'}</p>
        <p><strong>540px should be mobile:</strong> {540 <= 768 ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Test Result:</strong> {windowWidth === 540 && isMobile ? '🎉 CORRECT' : windowWidth === 540 ? '❌ FAILED - Not detected as mobile' : 'ℹ️ Resize to 540px to test'}</p>
      </div>

      {/* Media Analysis */}
      <div>
        <h2>Hero Slides Media Analysis</h2>
        {mediaAnalysis.length === 0 ? (
          <p>No hero slides found</p>
        ) : (
          mediaAnalysis.map((slide) => (
            <div key={slide.index} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              backgroundColor: slide.isUsingMobileMedia ? '#e8f5e8' : '#f8f9fa'
            }}>
              <h3>Slide {slide.index + 1} - {slide.heading}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4>Media Availability</h4>
                  <p>📱 Has Mobile Media: {slide.hasMobileMedia ? '✅ YES' : '❌ NO'}</p>
                  <p>🖥️ Has Desktop Media: {slide.hasDesktopMedia ? '✅ YES' : '❌ NO'}</p>
                  <p>🎯 Using Mobile Media: {slide.isUsingMobileMedia ? '✅ YES' : '❌ NO'}</p>
                  <p>📹 Media Type: {slide.mediaType}</p>
                </div>
                
                <div>
                  <h4>Media URLs</h4>
                  <p><strong>Selected URL:</strong><br/>
                    <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{slide.mediaUrl}</code>
                  </p>
                  {slide.mobileMediaUrl && (
                    <p><strong>Mobile URL:</strong><br/>
                      <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{slide.mobileMediaUrl}</code>
                    </p>
                  )}
                  {slide.desktopMediaUrl && (
                    <p><strong>Desktop URL:</strong><br/>
                      <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{slide.desktopMediaUrl}</code>
                    </p>
                  )}
                </div>
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <p><strong>Mobile Media Name:</strong> {slide.mobileMediaName}</p>
                <p><strong>Desktop Media Name:</strong> {slide.desktopMediaName}</p>
              </div>
              
              {/* Visual indicator */}
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: slide.isUsingMobileMedia ? '#d4edda' : '#fff3cd',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {slide.isUsingMobileMedia ? '📱 MOBILE MEDIA SELECTED' : '🖥️ DESKTOP MEDIA SELECTED'}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div style={{
        backgroundColor: '#e2e3e5',
        border: '1px solid #d6d8db',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '20px'
      }}>
        <h3>Test Instructions</h3>
        <ol>
          <li>Open browser developer tools (F12)</li>
          <li>Click the device toolbar icon (mobile view)</li>
          <li>Set dimensions to 540 x 1175 (or any height)</li>
          <li>Refresh this page</li>
          <li>Check if "Is Mobile" shows ✅ YES</li>
          <li>Check if slides with mobile media show "📱 MOBILE MEDIA SELECTED"</li>
        </ol>
        <p><strong>Expected Result:</strong> At 540px width, mobile media should be selected for slides that have it.</p>
      </div>
    </div>
  );
}