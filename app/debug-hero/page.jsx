'use client';

import { useState, useEffect } from 'react';
import { fetchDataFromApi } from '@/utils/api';

export default function DebugHero() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [testMobile, setTestMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setWindowWidth(width);
      setIsMobile(mobile);
      console.log('🔍 Window resized:', { width, mobile });
    };

    // Set initial values
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log('🚀 Debug page useEffect started');
    const fetchSlides = async () => {
      try {
        console.log('🔍 About to fetch hero slides data');
        console.log('🔍 Fetching hero slides from:', '/api/hero-slides?populate=*');
        const response = await fetch('/api/hero-slides?populate=*');
        console.log('🔍 Response type:', typeof response);
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response headers:', response.headers);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 Raw response data:', data);
        console.log('🔍 Data array length:', data?.data?.length || 0);
        console.log('🔍 Setting data state with:', data);
        setData(data);
        setLoading(false);
      } catch (error) {
        console.error('🔍 Error fetching slides:', error);
        console.error('🔍 Error stack:', error.stack);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchSlides();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const effectiveIsMobile = testMobile || isMobile;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Hero Slides Debug</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Screen Detection</h2>
        <p><strong>Window Width:</strong> {windowWidth}px</p>
        <p><strong>Is Mobile (Auto):</strong> {isMobile ? 'Yes' : 'No'}</p>
        <p><strong>Test Mobile Mode:</strong> 
          <button 
            onClick={() => setTestMobile(!testMobile)}
            className={`ml-2 px-3 py-1 rounded ${testMobile ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {testMobile ? 'ON' : 'OFF'}
          </button>
        </p>
        <p><strong>Effective Mobile:</strong> {effectiveIsMobile ? 'Yes' : 'No'}</p>
        <p><strong>Breakpoint:</strong> ≤768px</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">API Response</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-64">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      {data?.data && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Slides Analysis</h2>
          {data.data.map((slide, index) => {
            const selectedMedia = effectiveIsMobile && slide.mobileMedia ? slide.mobileMedia : slide.media;
            
            return (
              <div key={slide.id} className="mb-6 p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Slide {index + 1} (ID: {slide.id})</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-600">Desktop Media</h4>
                    <p><strong>Exists:</strong> {slide.media ? 'Yes' : 'No'}</p>
                    {slide.media && (
                      <>
                        <p><strong>URL:</strong> {slide.media.url}</p>
                        <p><strong>MIME:</strong> {slide.media.mime}</p>
                        <p><strong>Extension:</strong> {slide.media.ext}</p>
                        <p><strong>Size:</strong> {slide.media.size} KB</p>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-600">Mobile Media</h4>
                    <p><strong>Exists:</strong> {slide.mobileMedia ? 'Yes' : 'No'}</p>
                    {slide.mobileMedia && (
                      <>
                        <p><strong>URL:</strong> {slide.mobileMedia.url}</p>
                        <p><strong>MIME:</strong> {slide.mobileMedia.mime}</p>
                        <p><strong>Extension:</strong> {slide.mobileMedia.ext}</p>
                        <p><strong>Size:</strong> {slide.mobileMedia.size} KB</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded">
                  <h4 className="font-medium text-yellow-800">Selected Media (Current)</h4>
                  <p><strong>Source:</strong> {effectiveIsMobile && slide.mobileMedia ? 'Mobile Media' : 'Desktop Media'}</p>
                  <p><strong>URL:</strong> {selectedMedia?.url || 'None'}</p>
                  <p><strong>MIME:</strong> {selectedMedia?.mime || 'None'}</p>
                  <p><strong>Full URL:</strong> {selectedMedia?.url ? `http://localhost:1337${selectedMedia.url}` : 'None'}</p>
                </div>
                
                {selectedMedia && selectedMedia.mime?.startsWith('video/') && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Video Preview</h4>
                    <video 
                      controls 
                      className="max-w-full h-auto"
                      style={{ maxHeight: '300px' }}
                    >
                      <source src={`http://localhost:1337${selectedMedia.url}`} type={selectedMedia.mime} />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}