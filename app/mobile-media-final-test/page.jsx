"use client";
import { useState, useEffect } from "react";
import { getImageUrl } from "@/utils/imageUtils";

export default function MobileMediaFinalTest() {
  const [testData, setTestData] = useState(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [manualWidth, setManualWidth] = useState('');

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setWindowWidth(width);
      setIsMobile(mobile);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const testMobileLogic = async (testWidth = null) => {
    const effectiveWidth = testWidth || windowWidth;
    const effectiveIsMobile = effectiveWidth <= 768;
    
    console.log('🔍 TESTING MOBILE LOGIC');
    console.log('📱 Test width:', effectiveWidth);
    console.log('📱 Is mobile:', effectiveIsMobile);
    
    try {
      const response = await fetch("/api/hero-slides?populate=*");
      const data = await response.json();
      
      const results = data.data.map((item, index) => {
        // This is the EXACT logic from Hero.jsx
        const selectedMedia = effectiveIsMobile && item.mobileMedia ? item.mobileMedia : item.media;
        const isUsingMobileMedia = selectedMedia === item.mobileMedia;
        
        console.log(`\n🔍 SLIDE ${index} ANALYSIS:`);
        console.log('🆔 Document ID:', item.documentId);
        console.log('📱 effectiveIsMobile:', effectiveIsMobile);
        console.log('📱 item.mobileMedia exists:', !!item.mobileMedia);
        console.log('🖥️ item.media exists:', !!item.media);
        console.log('🎯 Logic: effectiveIsMobile && item.mobileMedia =', effectiveIsMobile && item.mobileMedia);
        console.log('🎯 selectedMedia === item.mobileMedia:', isUsingMobileMedia);
        console.log('📹 Selected URL:', selectedMedia?.url);
        
        return {
          documentId: item.documentId,
          index,
          effectiveWidth,
          effectiveIsMobile,
          hasMobileMedia: !!item.mobileMedia,
          hasDesktopMedia: !!item.media,
          isUsingMobileMedia,
          selectedUrl: selectedMedia?.url,
          mobileUrl: item.mobileMedia?.url,
          desktopUrl: item.media?.url,
          mobileFileName: item.mobileMedia?.name,
          desktopFileName: item.media?.name,
          logicResult: effectiveIsMobile && item.mobileMedia
        };
      });
      
      setTestData({
        width: effectiveWidth,
        isMobile: effectiveIsMobile,
        slides: results,
        timestamp: new Date().toLocaleTimeString()
      });
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  useEffect(() => {
    if (windowWidth > 0) {
      testMobileLogic();
    }
  }, [windowWidth]);

  const handleManualTest = () => {
    const width = parseInt(manualWidth);
    if (width && width > 0) {
      testMobileLogic(width);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Mobile Media Final Test</h1>
        
        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{windowWidth}px</div>
              <div className="text-sm text-gray-600">Window Width</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${isMobile ? 'text-green-600' : 'text-red-600'}`}>
                {isMobile ? 'MOBILE' : 'DESKTOP'}
              </div>
              <div className="text-sm text-gray-600">Mode (≤768px = Mobile)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {testData ? testData.timestamp : 'Not tested'}
              </div>
              <div className="text-sm text-gray-600">Last Test</div>
            </div>
          </div>
        </div>

        {/* Manual Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Manual Width Test</h2>
          <div className="flex gap-4 items-center">
            <input
              type="number"
              value={manualWidth}
              onChange={(e) => setManualWidth(e.target.value)}
              placeholder="Enter width (e.g., 500, 1200)"
              className="border rounded px-3 py-2 flex-1"
            />
            <button
              onClick={handleManualTest}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Test Width
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Try testing with 500px (should use mobile media) and 1200px (should use desktop media)
          </p>
        </div>

        {/* Test Results */}
        {testData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Test Results for {testData.width}px 
                <span className={`ml-2 px-3 py-1 rounded text-sm ${testData.isMobile ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {testData.isMobile ? 'MOBILE MODE' : 'DESKTOP MODE'}
                </span>
              </h2>
              
              {testData.slides.map((slide) => (
                <div key={slide.id} className={`border-2 rounded-lg p-6 mb-6 ${
                  slide.isUsingMobileMedia ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">
                      Slide {slide.index + 1} (ID: {slide.id})
                    </h3>
                    <div className={`px-4 py-2 rounded font-semibold ${
                      slide.isUsingMobileMedia 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {slide.isUsingMobileMedia ? '📱 MOBILE MEDIA' : '🖥️ DESKTOP MEDIA'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Logic Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Width:</span>
                          <span className="font-mono">{slide.effectiveWidth}px</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Is Mobile (≤768px):</span>
                          <span className={slide.effectiveIsMobile ? 'text-green-600' : 'text-red-600'}>
                            {slide.effectiveIsMobile ? 'TRUE' : 'FALSE'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Has Mobile Media:</span>
                          <span className={slide.hasMobileMedia ? 'text-green-600' : 'text-red-600'}>
                            {slide.hasMobileMedia ? 'TRUE' : 'FALSE'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Logic Result:</span>
                          <span className={slide.logicResult ? 'text-green-600' : 'text-red-600'}>
                            {slide.logicResult ? 'USE MOBILE' : 'USE DESKTOP'}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Final Selection:</span>
                          <span className={slide.isUsingMobileMedia ? 'text-green-600' : 'text-blue-600'}>
                            {slide.isUsingMobileMedia ? 'MOBILE' : 'DESKTOP'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Media Files</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-100 rounded">
                          <div className="font-medium text-green-700">📱 Mobile Media</div>
                          <div className="text-xs break-all">{slide.mobileFileName || 'None'}</div>
                          <div className="text-xs break-all text-gray-600">{slide.mobileUrl || 'None'}</div>
                        </div>
                        <div className="p-3 bg-gray-100 rounded">
                          <div className="font-medium text-blue-700">🖥️ Desktop Media</div>
                          <div className="text-xs break-all">{slide.desktopFileName || 'None'}</div>
                          <div className="text-xs break-all text-gray-600">{slide.desktopUrl || 'None'}</div>
                        </div>
                        <div className={`p-3 rounded font-bold ${
                          slide.isUsingMobileMedia ? 'bg-green-200' : 'bg-blue-200'
                        }`}>
                          <div className={slide.isUsingMobileMedia ? 'text-green-800' : 'text-blue-800'}>
                            ✅ SELECTED: {slide.isUsingMobileMedia ? 'Mobile' : 'Desktop'}
                          </div>
                          <div className="text-xs break-all mt-1">{slide.selectedUrl}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Preview */}
                  {slide.selectedUrl && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Preview (Selected Media)</h4>
                      <video 
                        width="400" 
                        height="200" 
                        controls 
                        className="border rounded max-w-full"
                      >
                        <source src={getImageUrl(slide.selectedUrl)} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-yellow-100 rounded-lg p-6 mt-8">
          <h3 className="font-semibold mb-2">🔍 How to Test:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open browser developer tools (F12) and check Console tab for detailed logs</li>
            <li>Resize your browser window and watch the results update automatically</li>
            <li>Use the manual width test above to test specific widths</li>
            <li>Green border = Mobile media selected, Blue border = Desktop media selected</li>
            <li>The logic is: <code>isMobile && item.mobileMedia ? mobileMedia : media</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}