"use client";
import { useState, useEffect } from "react";

export default function DebugMobile540() {
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [testData, setTestData] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      console.log('🔍 MOBILE DEBUG - Window width:', width, 'isMobile:', mobile);
      setWindowWidth(width);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await fetch("/api/hero-slides?populate=*");
        const data = await response.json();
        
        console.log('🔍 HERO DATA DEBUG:');
        console.log('📱 isMobile:', isMobile);
        console.log('📏 Window width:', windowWidth);
        console.log('📊 API data:', data);
        
        if (data.data && data.data.length > 0) {
          const firstSlide = data.data[0];
          console.log('🎯 First slide analysis:');
          console.log('📱 Has mobileMedia:', !!firstSlide.mobileMedia);
          console.log('🖥️ Has media:', !!firstSlide.media);
          console.log('🎯 Should use mobile:', isMobile && !!firstSlide.mobileMedia);
          console.log('📱 Mobile media URL:', firstSlide.mobileMedia?.url);
          console.log('🖥️ Desktop media URL:', firstSlide.media?.url);
          
          const selectedMedia = isMobile && firstSlide.mobileMedia ? firstSlide.mobileMedia : firstSlide.media;
          console.log('✅ Selected media:', selectedMedia?.url);
          console.log('✅ Using mobile media:', selectedMedia === firstSlide.mobileMedia);
        }
        
        setTestData(data);
      } catch (error) {
        console.error('❌ Error fetching hero data:', error);
      }
    };

    if (windowWidth > 0) {
      fetchHeroData();
    }
  }, [isMobile, windowWidth]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Mobile Detection Debug (540px Test)</h1>
      <div style={{ background: '#f0f0f0', padding: '15px', marginBottom: '20px' }}>
        <p><strong>Window Width:</strong> {windowWidth}px</p>
        <p><strong>Is Mobile (≤768px):</strong> {isMobile ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Expected at 540px:</strong> ✅ YES (Mobile)</p>
      </div>
      
      {testData && testData.data && testData.data.length > 0 && (
        <div style={{ background: '#e8f4f8', padding: '15px' }}>
          <h3>First Slide Media Analysis:</h3>
          <p><strong>Has Mobile Media:</strong> {testData.data[0].mobileMedia ? '✅ YES' : '❌ NO'}</p>
          <p><strong>Has Desktop Media:</strong> {testData.data[0].media ? '✅ YES' : '❌ NO'}</p>
          <p><strong>Should Use Mobile:</strong> {isMobile && testData.data[0].mobileMedia ? '✅ YES' : '❌ NO'}</p>
          
          {testData.data[0].mobileMedia && (
            <div style={{ marginTop: '10px' }}>
              <p><strong>Mobile Media URL:</strong> {testData.data[0].mobileMedia.url}</p>
              <p><strong>Mobile Media Name:</strong> {testData.data[0].mobileMedia.name}</p>
            </div>
          )}
          
          {testData.data[0].media && (
            <div style={{ marginTop: '10px' }}>
              <p><strong>Desktop Media URL:</strong> {testData.data[0].media.url}</p>
              <p><strong>Desktop Media Name:</strong> {testData.data[0].media.name}</p>
            </div>
          )}
          
          <div style={{ marginTop: '15px', padding: '10px', background: '#d4edda', border: '1px solid #c3e6cb' }}>
            <p><strong>FINAL SELECTION:</strong></p>
            <p>Using: {isMobile && testData.data[0].mobileMedia ? 'MOBILE' : 'DESKTOP'} media</p>
            <p>URL: {(isMobile && testData.data[0].mobileMedia ? testData.data[0].mobileMedia : testData.data[0].media)?.url}</p>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Instructions: Resize your browser to 540px width and check the console logs.</p>
        <p>The mobile detection should trigger at widths ≤ 768px.</p>
      </div>
    </div>
  );
}