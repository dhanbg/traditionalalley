'use client';

import { useState, useEffect } from 'react';

export default function TestMobileMedia() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [heroData, setHeroData] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setWindowWidth(width);
      setIsMobile(mobile);
      console.log('📱 Screen size changed:', { width, mobile });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await fetch('/api/hero-slides?populate=*');
        const data = await response.json();
        setHeroData(data);
        
        if (data.data && data.data.length > 0) {
          const firstItem = data.data[0];
          const media = isMobile && firstItem.mobileMedia ? firstItem.mobileMedia : firstItem.media;
          setSelectedMedia({
            type: isMobile && firstItem.mobileMedia ? 'mobile' : 'desktop',
            media: media,
            hasMobileMedia: !!firstItem.mobileMedia,
            hasDesktopMedia: !!firstItem.media
          });
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
      }
    };

    if (windowWidth > 0) {
      fetchHeroData();
    }
  }, [isMobile, windowWidth]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Mobile Media Test</h1>
      
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2>Screen Information</h2>
        <p><strong>Window Width:</strong> {windowWidth}px</p>
        <p><strong>Is Mobile:</strong> {isMobile ? 'Yes' : 'No'} (≤768px)</p>
        <p><strong>Breakpoint:</strong> {windowWidth <= 768 ? 'Mobile' : 'Desktop'}</p>
      </div>

      {selectedMedia && (
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h2>Selected Media</h2>
          <p><strong>Media Type Selected:</strong> {selectedMedia.type}</p>
          <p><strong>Has Mobile Media:</strong> {selectedMedia.hasMobileMedia ? 'Yes' : 'No'}</p>
          <p><strong>Has Desktop Media:</strong> {selectedMedia.hasDesktopMedia ? 'Yes' : 'No'}</p>
          
          {selectedMedia.media && (
            <div>
              <p><strong>Selected Media URL:</strong></p>
              <code style={{ 
                backgroundColor: '#fff', 
                padding: '5px', 
                borderRadius: '4px',
                display: 'block',
                marginTop: '5px',
                wordBreak: 'break-all'
              }}>
                {selectedMedia.media.url}
              </code>
              
              {selectedMedia.media.mime && (
                <p><strong>MIME Type:</strong> {selectedMedia.media.mime}</p>
              )}
            </div>
          )}
        </div>
      )}

      {heroData && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '15px', 
          borderRadius: '8px' 
        }}>
          <h2>Raw Hero Data</h2>
          <pre style={{ 
            backgroundColor: '#fff', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(heroData, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ul>
          <li>Resize your browser window to test mobile/desktop breakpoints</li>
          <li>Watch how the "Selected Media" changes based on screen size</li>
          <li>Mobile breakpoint is ≤768px</li>
          <li>Check browser console for additional debug logs</li>
        </ul>
      </div>
    </div>
  );
}