"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function CenterLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const [loadingTimeout, setLoadingTimeout] = useState(null);

  useEffect(() => {
    // Function to check if NextTopLoader is active
    const checkTopLoaderStatus = () => {
      const topLoader = document.querySelector('#nprogress');
      if (topLoader) {
        const isActive = topLoader.style.opacity !== '0' && topLoader.style.opacity !== '';
        setIsLoading(isActive);
      } else {
        // If nprogress element doesn't exist, ensure loading is false
        setIsLoading(false);
      }
    };

    // Function to start loading with timeout protection
    const startLoadingWithTimeout = () => {
      // Clear any existing timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      
      setIsLoading(true);
      
      // Set a maximum loading duration of 5 seconds
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setLoadingTimeout(null);
      }, 5000);
      
      setLoadingTimeout(timeout);
    };

    // Listen for link clicks that might trigger navigation
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.href && !target.href.startsWith('#') && !target.target) {
        try {
          const currentOrigin = window.location.origin;
          const linkUrl = new URL(target.href, currentOrigin);
          
          // Only show loader for internal navigation to different pages
          if (linkUrl.origin === currentOrigin && linkUrl.pathname !== window.location.pathname) {
            startLoadingWithTimeout();
          }
        } catch (error) {
          // Handle invalid URLs gracefully
          console.warn('Invalid URL:', target.href);
        }
      }
    };

    // Listen for form submissions that might trigger navigation
    const handleFormSubmit = (e) => {
      const form = e.target;
      // Skip loading for search forms or forms marked to skip loading
      if (form.dataset.skipLoading === 'true' || form.classList.contains('search-form')) {
        return;
      }
      if (form.method === 'get' || !form.action.includes('#')) {
        startLoadingWithTimeout();
      }
    };

    // Listen for browser navigation (back/forward)
    const handlePopState = () => {
      startLoadingWithTimeout();
    };

    // Add event listeners
    document.addEventListener('click', handleLinkClick);
    document.addEventListener('submit', handleFormSubmit);
    window.addEventListener('popstate', handlePopState);

    // Monitor NextTopLoader status with MutationObserver
    const observer = new MutationObserver(() => {
      checkTopLoaderStatus();
    });

    // Start observing when NextTopLoader element is available
    const startObserving = () => {
      const topLoader = document.querySelector('#nprogress');
      if (topLoader) {
        observer.observe(topLoader, {
          attributes: true,
          attributeFilter: ['style'],
          subtree: true
        });
      } else {
        // Retry after a short delay if NextTopLoader isn't ready yet
        setTimeout(startObserving, 100);
      }
    };

    startObserving();

    // Clean up
    return () => {
      document.removeEventListener('click', handleLinkClick);
      document.removeEventListener('submit', handleFormSubmit);
      window.removeEventListener('popstate', handlePopState);
      observer.disconnect();
      
      // Clear any pending timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, []);

  // Hide loader when pathname changes (route completed)
  useEffect(() => {
    // Clear any existing loading timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200); // Slightly longer delay to ensure smooth transition
    
    return () => clearTimeout(timer);
  }, [pathname, loadingTimeout]);

  if (!isLoading) return null;

  return (
    <>
      <div className="center-loader-overlay">
        <div className="loader"></div>
      </div>
      
      <style jsx>{`
        .center-loader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          pointer-events: none;
        }
        
        .loader {
          width: 50px;
          aspect-ratio: 1;
          display: grid;
          color: #514b82;
          background: 
            conic-gradient(from 90deg at 3px 3px,#0000 90deg,currentColor 0) 
            -3px -3px/calc(50% + 1.5px) calc(50% + 1.5px);
          animation: l28 2s infinite;
        }
        
        .loader::before,
        .loader::after {
          content: "";
          grid-area: 1/1;
          background: repeating-conic-gradient(#0000 0 35deg,currentColor 0 90deg);
          -webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 3px),#000 0);
          border-radius: 50%;
        }
        
        .loader::after {
          margin: 20%;
        }
        
        @keyframes l28 {
          100% {transform: rotate(1turn)}
        }
      `}</style>
    </>
  );
}