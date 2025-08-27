"use client";
import { useState, useEffect } from "react";
import { getImageUrl } from "@/utils/imageUtils";

export default function DebugMobileConsole() {
  const [logs, setLogs] = useState([]);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [slides, setSlides] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    console.log(`[${timestamp}] ${message}`);
    setLogs(prev => [...prev, logEntry]);
  };

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setWindowWidth(width);
      setIsMobile(mobile);
      addLog(`📏 Window resized: ${width}px, isMobile: ${mobile}`, 'info');
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const testMobileMedia = async () => {
    setLogs([]);
    addLog('🔍 Starting mobile media test...', 'info');
    addLog(`📱 Current state - Width: ${windowWidth}px, isMobile: ${isMobile}`, 'info');
    
    try {
      addLog('📡 Fetching hero slides...', 'info');
      const response = await fetch("/api/hero-slides?populate=*");
      const data = await response.json();
      
      addLog(`✅ API Response received: ${data.data?.length} slides`, 'success');
      
      if (data.data) {
        setSlides(data.data);
        
        data.data.forEach((item, index) => {
          addLog(`\n🔍 ANALYZING SLIDE ${index}:`, 'info');
          addLog(`🆔 Document ID: ${item.documentId}`, 'info');
          addLog(`📱 Has mobileMedia: ${!!item.mobileMedia}`, item.mobileMedia ? 'success' : 'warning');
          addLog(`🖥️ Has media: ${!!item.media}`, item.media ? 'success' : 'warning');
          
          if (item.mobileMedia) {
            addLog(`📱 Mobile media URL: ${item.mobileMedia.url}`, 'success');
            addLog(`📱 Mobile media name: ${item.mobileMedia.name}`, 'info');
          }
          
          if (item.media) {
            addLog(`🖥️ Desktop media URL: ${item.media.url}`, 'info');
            addLog(`🖥️ Desktop media name: ${item.media.name}`, 'info');
          }
          
          // Test the selection logic
          const selectedMedia = isMobile && item.mobileMedia ? item.mobileMedia : item.media;
          const isUsingMobileMedia = selectedMedia === item.mobileMedia;
          
          addLog(`🎯 Logic test: isMobile(${isMobile}) && mobileMedia(${!!item.mobileMedia}) = ${isMobile && item.mobileMedia}`, 'info');
          addLog(`🎯 Selected media: ${isUsingMobileMedia ? 'MOBILE' : 'DESKTOP'}`, isUsingMobileMedia ? 'success' : 'info');
          addLog(`📹 Final URL: ${selectedMedia?.url}`, 'info');
          
          if (isMobile && item.mobileMedia) {
            addLog(`✅ SUCCESS: Mobile media should be used for slide ${index}`, 'success');
          } else if (isMobile && !item.mobileMedia) {
            addLog(`⚠️ WARNING: Mobile mode but no mobile media available for slide ${index}`, 'warning');
          } else {
            addLog(`ℹ️ INFO: Desktop mode, using desktop media for slide ${index}`, 'info');
          }
        });
      }
    } catch (error) {
      addLog(`❌ ERROR: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    if (windowWidth > 0) {
      testMobileMedia();
    }
  }, [windowWidth, isMobile]);

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Mobile Media Debug Console</h1>
        
        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{windowWidth}px</div>
              <div className="text-sm text-gray-600">Window Width</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isMobile ? 'text-green-600' : 'text-red-600'}`}>
                {isMobile ? 'MOBILE' : 'DESKTOP'}
              </div>
              <div className="text-sm text-gray-600">Mode (≤768px)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{slides.length}</div>
              <div className="text-sm text-gray-600">Slides Loaded</div>
            </div>
            <div>
              <button
                onClick={testMobileMedia}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                🔄 Refresh Test
              </button>
            </div>
          </div>
        </div>

        {/* Console Logs */}
        <div className="bg-black rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Console Output</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-400">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex">
                  <span className="text-gray-400 mr-2">[{log.timestamp}]</span>
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Slides Preview */}
        {slides.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-semibold">Slides Preview</h2>
            {slides.map((slide, index) => {
              const selectedMedia = isMobile && slide.mobileMedia ? slide.mobileMedia : slide.media;
              const isUsingMobileMedia = selectedMedia === slide.mobileMedia;
              
              return (
                <div key={slide.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  isUsingMobileMedia ? 'border-green-500' : 'border-blue-500'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">Slide {index + 1} (ID: {slide.id})</h3>
                    <div className={`px-3 py-1 rounded text-sm font-semibold ${
                      isUsingMobileMedia 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isUsingMobileMedia ? '📱 MOBILE' : '🖥️ DESKTOP'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Media Info</h4>
                      <div className="space-y-2 text-sm">
                        <div>📱 Mobile: {slide.mobileMedia ? '✅ Available' : '❌ Not available'}</div>
                        <div>🖥️ Desktop: {slide.media ? '✅ Available' : '❌ Not available'}</div>
                        <div>🎯 Selected: {isUsingMobileMedia ? 'Mobile' : 'Desktop'}</div>
                        <div className="break-all">🔗 URL: {selectedMedia?.url}</div>
                      </div>
                    </div>
                    
                    {selectedMedia?.url && (
                      <div>
                        <h4 className="font-semibold mb-2">Preview</h4>
                        <video 
                          width="300" 
                          height="150" 
                          controls 
                          className="border rounded"
                        >
                          <source src={getImageUrl(selectedMedia.url)} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="bg-yellow-100 rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2">🔍 Debug Instructions:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Resize your browser window to test mobile/desktop switching</li>
            <li>Green border = Mobile media selected</li>
            <li>Blue border = Desktop media selected</li>
            <li>Check the console output above for detailed logic flow</li>
            <li>Click "Refresh Test" to re-run the analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}