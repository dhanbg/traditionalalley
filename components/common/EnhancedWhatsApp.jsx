"use client";
import { useState, useEffect } from "react";

const EnhancedWhatsApp = () => {
  const [showTempMessage, setShowTempMessage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Show temporary message when page loads
    const timer = setTimeout(() => {
      setShowTempMessage(true);
      // Play notification sound
      playNotificationSound();
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
    };
  }, []);

  const playNotificationSound = () => {
    try {
      // Use the existing sound file from public folder
      const audio = new Audio('/sharp-pop-328170.mp3');
      audio.volume = 0.3; // Set to 30% volume for a softer sound
      audio.play().catch(error => {
        console.log('Audio playback failed:', error);
      });
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  };

  const handleWhatsAppClick = () => {
    const whatsappNumber = "+9779844594187";
    const message = "Hi! I would like to customize a design. Can you help me?";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
            border: '2px solid #25D366'
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
              src="/whatsapp.svg"
              alt="WhatsApp"
              style={{ width: '24px', height: '24px', marginTop: '2px' }}
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
                If you want to customize any of our designs, please go to WhatsApp and inquiry with us!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced WhatsApp Floating Button */}
      <div
        onClick={handleWhatsAppClick}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 10000,
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isAnimating ? 'scale(1.1) rotate(10deg)' : 'scale(1)',
          animation: 'pulse 2s infinite'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 25px rgba(37, 211, 102, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = isAnimating ? 'scale(1.1) rotate(10deg)' : 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.4)';
        }}
        aria-label="Chat with us on WhatsApp"
      >
        <img
          src="/whatsapp.svg"
          alt="WhatsApp"
          style={{ 
            width: '32px', 
            height: '32px', 
            display: 'block',
            filter: 'brightness(0) invert(1)' // Make icon white
          }}
        />
        
        {/* Ripple effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'translate(-50%, -50%)',
            animation: 'ripple 2s infinite'
          }}
        />
      </div>

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
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.6), 0 0 0 10px rgba(37, 211, 102, 0.1);
          }
          100% {
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
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
          .whatsapp-temp-message {
            right: 16px !important;
            bottom: 90px !important;
            maxWidth: 250px !important;
          }
        }
      `}</style>
    </>
  );
};

export default EnhancedWhatsApp;