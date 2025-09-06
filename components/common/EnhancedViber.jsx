"use client";
import { useState, useEffect } from "react";

const EnhancedViber = () => {
  const [showTempMessage, setShowTempMessage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    // Detect user interaction for audio autoplay compliance
    const handleUserInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // Show temporary message when page loads
    const timer = setTimeout(() => {
      setShowTempMessage(true);
      // Only play notification sound if user has interacted
      if (userInteracted) {
        playNotificationSound();
      }
    }, 2000);

    // Hide temporary message after 8 seconds
    const hideTimer = setTimeout(() => {
      setShowTempMessage(false);
    }, 10000);

    // Start periodic animation
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
      clearInterval(animationInterval);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [userInteracted]);

  const playNotificationSound = () => {
    // Only play audio if user has interacted with the page
    if (!userInteracted) {
      console.log('Audio playback skipped: User interaction required for autoplay compliance');
      return;
    }

    try {
      // Use the existing sound file from public folder
      const audio = new Audio('/sharp-pop-328170.mp3');
      audio.volume = 0.3; // Set to 30% volume for a softer sound
      audio.play().catch(error => {
        console.log('Audio playback failed:', error.name, error.message);
      });
    } catch (error) {
      console.log('Audio not supported or blocked:', error);
    }
  };

  const handleViberClick = () => {
    const viberNumber = "9844594187";
    const message = "Hi! I would like to customize a design. Can you help me?";
    const viberUrl = `viber://chat?number=${viberNumber}&text=${encodeURIComponent(message)}`;
    
    // Try to open Viber app first
    const viberWindow = window.open(viberUrl, '_blank');
    
    // If Viber app doesn't open (fallback after 2 seconds)
    setTimeout(() => {
      // Check if the window was closed immediately (indicates app didn't open)
      if (viberWindow && viberWindow.closed) {
        // Fallback: Show alert with instructions
        alert(`Viber app not found. Please:\n\n1. Install Viber app on your device\n2. Or contact us directly at: +${viberNumber}\n\nMessage: ${message}`);
      }
    }, 2000);
    
    setShowTempMessage(false);
  };

  const handleTempMessageClose = () => {
    setShowTempMessage(false);
  };

  return (
    <>
      {/* Temporary Message Popup */}
      {showTempMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            zIndex: 10001,
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            padding: '16px 20px',
            maxWidth: '280px',
            animation: 'slideInRight 0.5s ease-out',
            border: '2px solid #665CAC'
          }}
        >
          <button
            onClick={handleTempMessageClose}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#666',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
          >
            ×
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <img
              src="/viber.webp"
              alt="Viber"
              style={{ width: '24px', height: '24px', marginTop: '2px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <p style={{ 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#333'
              }}>
                Need Customization?
              </p>
              <p style={{ 
                margin: 0, 
                fontSize: '13px', 
                color: '#666',
                lineHeight: '1.4'
              }}>
                If you want to customize any of our designs, please contact us on Viber and inquiry with us!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Viber Floating Button */}
      <img
        src="/viber.webp"
        alt="Viber"
        onClick={handleViberClick}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 10000,
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(102, 92, 172, 0.4)',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isAnimating ? 'scale(1.1) rotate(10deg)' : 'scale(1)',
          animation: 'pulse 2s infinite',
          objectFit: 'cover'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 25px rgba(102, 92, 172, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = isAnimating ? 'scale(1.1) rotate(10deg)' : 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(102, 92, 172, 0.4)';
        }}
        aria-label="Chat with us on Viber"
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 4px 20px rgba(102, 92, 172, 0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(102, 92, 172, 0.6), 0 0 0 10px rgba(102, 92, 172, 0.1);
          }
          100% {
            box-shadow: 0 4px 20px rgba(102, 92, 172, 0.4);
          }
        }

        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        @media (max-width: 480px) {
          .viber-temp-message {
            right: 16px !important;
            bottom: 90px !important;
            maxWidth: 250px !important;
          }
        }
      `}</style>
    </>
  );
};

export default EnhancedViber;