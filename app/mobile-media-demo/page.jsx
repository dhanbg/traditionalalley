'use client';
import { useState, useEffect } from 'react';

export default function MobileMediaDemo() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/hero-slides?populate=*`);
        const data = await response.json();
        setApiData(data);
        console.log('API Response:', data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSelectedMedia = (slide) => {
    if (isMobile && slide.mobileMedia) {
      return {
        type: 'mobile',
        media: slide.mobileMedia,
        url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${slide.mobileMedia.url}`
      };
    }
    return {
      type: 'desktop',
      media: slide.media,
      url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}${slide.media.url}`
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading mobile media demo...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Mobile Media Selection Demo</h1>
        
        {/* Status Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Window Width:</span> {windowWidth}px
            </div>
            <div>
              <span className="font-medium">Device Mode:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                isMobile ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {isMobile ? 'Mobile' : 'Desktop'}
              </span>
            </div>
          </div>
        </div>

        {/* Slides Demo */}
        {apiData?.data?.map((slide, index) => {
          const selectedMedia = getSelectedMedia(slide);
          
          return (
            <div key={slide.documentId} className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Slide {index + 1}</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Media Selection Info */}
                <div>
                  <h4 className="font-medium mb-2">Selected Media:</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="mb-2">
                      <span className="font-medium">Type:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${
                        selectedMedia.type === 'mobile' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedMedia.type}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">File:</span> {selectedMedia.media.name}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Size:</span> {selectedMedia.media.size} KB
                    </div>
                    <div className="text-xs text-gray-600 break-all">
                      <span className="font-medium">URL:</span> {selectedMedia.url}
                    </div>
                  </div>
                </div>

                {/* Visual Placeholder */}
                <div>
                  <h4 className="font-medium mb-2">Media Preview:</h4>
                  <div className="bg-gray-200 rounded-lg p-8 text-center">
                    <svg width="200" height="120" className="mx-auto mb-4">
                      <rect width="200" height="120" fill={selectedMedia.type === 'mobile' ? '#3B82F6' : '#10B981'} rx="8"/>
                      <text x="100" y="50" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                        {selectedMedia.type === 'mobile' ? 'MOBILE' : 'DESKTOP'}
                      </text>
                      <text x="100" y="70" textAnchor="middle" fill="white" fontSize="12">
                        VIDEO
                      </text>
                      <text x="100" y="90" textAnchor="middle" fill="white" fontSize="10">
                        {selectedMedia.media.name.substring(0, 20)}...
                      </text>
                    </svg>
                    <p className="text-sm text-gray-600">
                      {selectedMedia.type === 'mobile' ? 'Mobile-optimized' : 'Desktop'} video would play here
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Media Info */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-2">Available Media:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium text-green-800">Desktop Media</div>
                    <div className="text-green-600">{slide.media.name}</div>
                    <div className="text-green-600">{slide.media.size} KB</div>
                  </div>
                  {slide.mobileMedia && (
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="font-medium text-blue-800">Mobile Media</div>
                      <div className="text-blue-600">{slide.mobileMedia.name}</div>
                      <div className="text-blue-600">{slide.mobileMedia.size} KB</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">How to Test:</h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• Resize your browser window to see mobile/desktop detection</li>
            <li>• Mobile mode activates at 768px and below</li>
            <li>• Different media files are selected based on screen size</li>
            <li>• The Hero component uses the same logic for actual video playback</li>
          </ul>
        </div>
      </div>
    </div>
  );
}