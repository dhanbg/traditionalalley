"use client";
import { useState, useEffect } from "react";
import { getImageUrl } from "@/utils/imageUtils";

export default function TestHeroMobile() {
  const [testResults, setTestResults] = useState([]);
  const [currentWidth, setCurrentWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setCurrentWidth(width);
      setIsMobile(mobile);
      console.log('📱 Width changed:', width, 'isMobile:', mobile);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const testMobileMediaLogic = async () => {
      try {
        console.log('🔍 Testing mobile media logic...');
        const response = await fetch("/api/hero-slides?populate=*");
        const data = await response.json();
        
        console.log('📊 API Response:', data);
        
        const results = data.data.map((item, index) => {
          const hasMobileMedia = !!item.mobileMedia;
          const hasDesktopMedia = !!item.media;
          
          // This is the exact logic from Hero component
          const selectedMedia = isMobile && item.mobileMedia ? item.mobileMedia : item.media;
          const isUsingMobileMedia = selectedMedia === item.mobileMedia;
          
          console.log(`\n🔍 Slide ${index} (Document ID: ${item.documentId}):`);
          console.log('📱 isMobile:', isMobile);
          console.log('📱 hasMobileMedia:', hasMobileMedia);
          console.log('🖥️ hasDesktopMedia:', hasDesktopMedia);
          console.log('🎯 Condition (isMobile && item.mobileMedia):', isMobile && item.mobileMedia);
          console.log('🎯 selectedMedia === item.mobileMedia:', isUsingMobileMedia);
          console.log('📹 selectedMedia URL:', selectedMedia?.url);
          console.log('📹 mobileMedia URL:', item.mobileMedia?.url);
          console.log('📹 media URL:', item.media?.url);
          
          return {
            documentId: item.documentId,
            index,
            isMobile,
            currentWidth,
            hasMobileMedia,
            hasDesktopMedia,
            isUsingMobileMedia,
            selectedMediaUrl: selectedMedia?.url,
            mobileMediaUrl: item.mobileMedia?.url,
            desktopMediaUrl: item.media?.url,
            mobileMediaName: item.mobileMedia?.name,
            desktopMediaName: item.media?.name,
            logicCheck: {
              condition: `isMobile (${isMobile}) && item.mobileMedia (${hasMobileMedia})`,
              result: isMobile && item.mobileMedia,
              selectedType: isUsingMobileMedia ? 'Mobile Media' : 'Desktop Media'
            }
          };
        });
        
        setTestResults(results);
        console.log('🎯 Final test results:', results);
        
      } catch (error) {
        console.error('❌ Error testing mobile media:', error);
      }
    };

    if (currentWidth > 0) {
      testMobileMediaLogic();
    }
  }, [isMobile, currentWidth]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Hero Mobile Media Test</h1>
      
      <div className="bg-blue-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Current Screen Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Window Width:</strong> {currentWidth}px</p>
            <p><strong>Is Mobile:</strong> <span className={isMobile ? 'text-green-600' : 'text-red-600'}>{isMobile ? 'YES' : 'NO'}</span></p>
            <p><strong>Breakpoint:</strong> ≤ 768px</p>
          </div>
          <div>
            <p><strong>Expected Behavior:</strong></p>
            <p>• Width ≤ 768px → Use Mobile Media</p>
            <p>• Width &gt; 768px → Use Desktop Media</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {testResults.map((result) => (
          <div key={result.id} className={`border-2 p-6 rounded-lg ${
            result.isUsingMobileMedia ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'
          }`}>
            <h3 className="text-xl font-semibold mb-4">
              Slide {result.index + 1} (ID: {result.id})
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                result.isUsingMobileMedia ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
              }`}>
                {result.logicCheck.selectedType}
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="font-semibold mb-2">Media Availability:</h4>
                <p>Mobile Media: {result.hasMobileMedia ? '✅ Available' : '❌ Not Available'}</p>
                <p>Desktop Media: {result.hasDesktopMedia ? '✅ Available' : '❌ Not Available'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Selection Logic:</h4>
                <p className="text-sm">Condition: {result.logicCheck.condition}</p>
                <p className="text-sm">Result: {result.logicCheck.result ? 'TRUE' : 'FALSE'}</p>
                <p className="text-sm font-bold">Selected: {result.logicCheck.selectedType}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">File Names:</h4>
                <p className="text-xs break-all">Mobile: {result.mobileMediaName || 'None'}</p>
                <p className="text-xs break-all">Desktop: {result.desktopMediaName || 'None'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">URLs:</h4>
                <p className="text-xs break-all mb-1"><strong>Selected:</strong> {result.selectedMediaUrl}</p>
                <p className="text-xs break-all mb-1"><strong>Mobile:</strong> {result.mobileMediaUrl || 'None'}</p>
                <p className="text-xs break-all"><strong>Desktop:</strong> {result.desktopMediaUrl || 'None'}</p>
              </div>
              
              {result.selectedMediaUrl && (
                <div>
                  <h4 className="font-semibold mb-2">Preview:</h4>
                  <video 
                    width="300" 
                    height="150" 
                    controls 
                    className="border rounded max-w-full"
                    playsInline
                    muted
                  >
                    <source src={getImageUrl(result.selectedMediaUrl)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open browser developer tools (F12) and check the Console tab</li>
          <li>Resize your browser window to test mobile/desktop switching</li>
          <li>Watch the "Selected Type" badges change as you resize</li>
          <li>Mobile breakpoint is 768px - try widths like 500px and 1200px</li>
          <li>Green border = Mobile Media, Blue border = Desktop Media</li>
        </ol>
      </div>
    </div>
  );
}