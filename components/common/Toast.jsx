"use client";
import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'info', isVisible = true, duration = 5000, onClose }) => {
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

  const toastStyles = {
    position: 'relative',
    zIndex: 9999,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: type === 'error' ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' :
                type === 'warning' ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' :
                type === 'success' ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
    minWidth: '320px',
    maxWidth: '400px',
    overflow: 'hidden',
    borderLeft: `4px solid ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : type === 'success' ? '#10b981' : '#6b7280'}`,
    transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
    opacity: isAnimating ? 1 : 0
  };

  const contentStyles = {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    gap: '12px'
  };

  const iconWrapperStyles = {
    flexShrink: 0,
    width: '20px',
    height: '20px',
    color: type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : type === 'success' ? '#10b981' : '#6b7280'
  };

  const messageStyles = {
    flex: 1,
    margin: 0,
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    lineHeight: '1.4'
  };

  const progressStyles = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  };

  const progressBarStyles = {
    height: '100%',
    background: type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : type === 'success' ? '#10b981' : '#6b7280',
    animation: `toast-progress ${duration}ms linear forwards`,
    transformOrigin: 'left'
  };

  return (
    <>
      <div style={toastStyles}>
        <div style={contentStyles}>
          <div style={iconWrapperStyles}>
            {getIcon()}
          </div>
          <div>
            <p style={messageStyles}>{message}</p>
          </div>
        </div>
        <div style={progressStyles}>
          <div style={progressBarStyles}></div>
        </div>
      </div>

      <style>{`
        @keyframes toast-progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Toast;
