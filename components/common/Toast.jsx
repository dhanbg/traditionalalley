"use client";
import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'info', isVisible = true, duration = 3000, onClose }) => {
  console.log('Toast component rendered with:', { message, type, isVisible, duration });
  const [isAnimating, setIsAnimating] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setIsAnimating(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg className="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
        return (
          <svg className="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="toast-container toast-show" style={{ 
        position: 'relative',
        background: 'red',
        color: 'white',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '4px',
        border: '2px solid black',
        zIndex: 99999
      }}>
        <div style={{ padding: '10px', fontSize: '14px' }}>
          <strong>TOAST: {type.toUpperCase()}</strong>
          <br />
          {message}
          <br />
          <button onClick={handleClose} style={{ marginTop: '5px', padding: '2px 8px' }}>
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .toast-container {
          position: relative;
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(100%);
          opacity: 0;
        }

        .toast-show {
          transform: translateX(0);
          opacity: 1;
        }

        .toast-hide {
          transform: translateX(100%);
          opacity: 0;
        }

        .toast {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
          min-width: 320px;
          max-width: 400px;
          overflow: hidden;
          border-left: 4px solid;
        }

        .toast-error {
          border-left-color: #ef4444;
        }

        .toast-warning {
          border-left-color: #f59e0b;
        }

        .toast-success {
          border-left-color: #10b981;
        }

        .toast-content {
          display: flex;
          align-items: flex-start;
          padding: 16px;
          gap: 12px;
        }

        .toast-icon-wrapper {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
        }

        .toast-icon {
          width: 100%;
          height: 100%;
        }

        .toast-error .toast-icon {
          color: #ef4444;
        }

        .toast-warning .toast-icon {
          color: #f59e0b;
        }

        .toast-success .toast-icon {
          color: #10b981;
        }

        .toast-message {
          flex: 1;
          margin-right: 8px;
        }

        .toast-message p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
          font-weight: 500;
        }
        
        .toast-message .stock-info {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .toast-close-btn {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toast-close-btn:hover {
          color: #6b7280;
          background: #f3f4f6;
        }

        .toast-close-btn svg {
          width: 16px;
          height: 16px;
        }

        .toast-progress {
          height: 3px;
          background: #f3f4f6;
          overflow: hidden;
        }

        .toast-progress-bar {
          height: 100%;
          width: 100%;
          transform-origin: left;
          animation: toast-progress ${duration}ms linear forwards;
        }

        .toast-progress-error {
          background: #ef4444;
        }

        .toast-progress-warning {
          background: #f59e0b;
        }

        .toast-progress-success {
          background: #10b981;
        }

        @keyframes toast-progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }

        @media (max-width: 480px) {
          .toast-container {
            top: 10px;
            right: 10px;
            left: 10px;
          }

          .toast {
            min-width: auto;
            max-width: none;
          }

          .toast-content {
            padding: 14px;
          }

          .toast-message p {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
};

export default Toast;
