"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@/components/common/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration, isVisible: true };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration + animation time
    setTimeout(() => {
      removeToast(id);
    }, duration + 500);
  }, [removeToast]);

  const showError = useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showSuccess = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const value = {
    showToast,
    showError,
    showWarning,
    showSuccess,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container-wrapper">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              position: 'fixed',
              top: `${20 + (index * 80)}px`,
              right: '20px',
              zIndex: 9999 - index
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              isVisible={toast.isVisible}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />

          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
