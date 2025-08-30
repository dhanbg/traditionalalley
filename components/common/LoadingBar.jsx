"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function LoadingBar() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const progressIntervalRef = useRef(null);
  const isNavigatingRef = useRef(false);

  const startLoading = () => {
    if (isNavigatingRef.current) return; // Prevent multiple starts
    
    isNavigatingRef.current = true;
    setLoading(true);
    setProgress(0);

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Simulate progress from 0% to 90%, then wait for page load to complete to 100%
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressIntervalRef.current);
          return 90;
        }
        // Much slower progress as it gets higher for longer loading duration
        const increment = prev < 20 ? Math.random() * 8 + 3 : 
                         prev < 40 ? Math.random() * 6 + 2 : 
                         prev < 60 ? Math.random() * 4 + 1.5 :
                         prev < 80 ? Math.random() * 2 + 1 :
                         Math.random() * 1 + 0.5;
        return Math.min(prev + increment, 90);
      });
    }, 300);
  };

  const completeLoading = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    setProgress(100);
    setTimeout(() => {
      setLoading(false);
      setProgress(0);
      isNavigatingRef.current = false;
    }, 300);
  };

  useEffect(() => {
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.href && 
          !target.href.startsWith('mailto:') && 
          !target.href.startsWith('tel:') && 
          !target.href.includes('#') &&
          !target.target) {
        const currentUrl = window.location.href;
        const targetUrl = target.href;
        
        // Only trigger loading if it's a different page
        if (currentUrl !== targetUrl) {
          startLoading();
        }
      }
    };

    const handleButtonClick = (e) => {
      const button = e.target.closest('button');
      if (button) {
        // Check if button contains navigation-related text or classes
        const buttonText = button.textContent?.toLowerCase() || '';
        const buttonClass = button.className?.toLowerCase() || '';
        const navigationAttr = button.getAttribute('data-navigation');
        
        // Trigger loading for cart navigation buttons
        if (buttonText.includes('view cart') || 
            buttonText.includes('view full cart') ||
            buttonText.includes('loading...') ||
            buttonClass.includes('cart') ||
            navigationAttr === 'view-cart' ||
            navigationAttr === 'view-full-cart') {
          startLoading();
        }
      }
    };

    const handlePopState = () => {
      // Handle browser back/forward buttons
      startLoading();
    };

    // Listen for clicks and browser navigation
    document.addEventListener('click', handleLinkClick);
    document.addEventListener('click', handleButtonClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleLinkClick);
      document.removeEventListener('click', handleButtonClick);
      window.removeEventListener('popstate', handlePopState);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Complete loading when pathname changes (page actually loads)
    if (loading && isNavigatingRef.current) {
      // Longer delay to ensure page is fully rendered and loaded
      const timer = setTimeout(() => {
        completeLoading();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [pathname, loading]);

  if (!loading) return null;

  return (
    <div className="loading-bar-container">
      <div 
        className="loading-bar" 
        style={{ width: `${progress}%` }}
      />
      <style jsx>{`
        .loading-bar-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: rgba(0, 0, 0, 0.1);
          z-index: 9999;
        }
        
        .loading-bar {
          height: 100%;
          background: linear-gradient(90deg, #ff69b4, #ff1493, #c71585);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          transition: width 0.3s ease;
          border-radius: 0 2px 2px 0;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}