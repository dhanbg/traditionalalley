"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getImageUrl } from "@/utils/imageUtils";

export default function DebugMobileMedia() {
  const [slides, setSlides] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [loading, setLoading] = useState(true);

  // Hook to detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const newIsMobile = width <= 768;
      console.log('📱 Window width:', width, 'isMobile:', newIsMobile);
      setWindowWidth(width);
      setIsMobile(newIsMobile);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch("/api/hero-slides?populate=*");
        const data = await response.json();
        
        console.log('🔍 DEBUG MOBILE MEDIA');
        console.log('📱 Current isMobile:', isMobile);
        console.log('📊 Window width:', windowWidth);
        console.log('📋 API Data:', data);
        
        const processedSlides = data.data.map((item, index) => {
          console.log(`\n🔍 Processing slide ${index}:`);
          console.log('🆔 Item Document ID:', item.documentId);
          console.log('📱 Has mobileMedia:', !!item.mobileMedia);
          console.log('🖥️ Has media:', !!item.media);
          console.log('📱 mobileMedia object:', item.mobileMedia);
          console.log('🖥️ media object:', item.media);
          
          // Select media based on screen size
          const selectedMedia = isMobile && item.mobileMedia ? item.mobileMedia : item.media;
          console.log('🎯 Selected media:', selectedMedia);
          console.log('🎯 Selection logic: isMobile =', isMobile, '&& item.mobileMedia =', !!item.mobileMedia, '? mobileMedia : media');
          
          return {
            documentId: item.documentId,
            heading: item.heading || `Slide ${index + 1}`,
            isMobile,
            windowWidth,
            hasMobileMedia: !!item.mobileMedia,
            hasMedia: !!item.media,
            selectedMedia: selectedMedia,
            mobileMediaUrl: item.mobileMedia?.url,
            mediaUrl: item.media?.url,
            finalUrl: selectedMedia?.url
          };
        });
        
        setSlides(processedSlides);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, [isMobile, windowWidth]); // Re-fetch when screen size changes

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Loading Mobile Media Debug...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Mobile Media Debug Page</h1>
      
      <div className="bg-blue-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Screen Info</h2>
        <p><strong>Window Width:</strong> {windowWidth}px</p>
        <p><strong>Is Mobile:</strong> {isMobile ? 'YES' : 'NO'}</p>
        <p><strong>Mobile Breakpoint:</strong> ≤ 768px</p>
      </div>

      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div key={slide.id} className="border p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Slide {index + 1} (ID: {slide.id})</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold">Media Status:</h4>
                <p>Has Mobile Media: {slide.hasMobileMedia ? '✅' : '❌'}</p>
                <p>Has Desktop Media: {slide.hasMedia ? '✅' : '❌'}</p>
                <p>Current Selection: {slide.isMobile && slide.hasMobileMedia ? 'Mobile Media' : 'Desktop Media'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold">URLs:</h4>
                <p className="text-sm break-all">Mobile: {slide.mobileMediaUrl || 'None'}</p>
                <p className="text-sm break-all">Desktop: {slide.mediaUrl || 'None'}</p>
                <p className="text-sm break-all font-bold">Selected: {slide.finalUrl || 'None'}</p>
              </div>
            </div>
            
            {slide.finalUrl && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Preview:</h4>
                {slide.finalUrl.includes('.mp4') ? (
                  <video 
                    width="400" 
                    height="200" 
                    controls 
                    className="border rounded"
                    style={{ maxWidth: '100%' }}
                  >
                    <source src={getImageUrl(slide.finalUrl)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Image
                    src={getImageUrl(slide.finalUrl)}
                    alt={slide.heading}
                    width={400}
                    height={200}
                    className="border rounded"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <p>1. Resize your browser window to test mobile/desktop switching</p>
        <p>2. Check the console for detailed debug logs</p>
        <p>3. Mobile breakpoint is set at 768px and below</p>
      </div>
    </div>
  );
}