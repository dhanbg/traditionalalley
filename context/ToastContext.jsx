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
    console.log('removeToast called with id:', id);
    setToasts(prev => {
      const filtered = prev.filter(toast => toast.id !== id);
      console.log('Toasts after removal:', filtered);
      return filtered;
    });
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    console.log('ToastContext showToast called with:', { message, type, duration });
    const id = Date.now().toString();
    const newToast = { id, message, type, duration, isVisible: true };
    console.log('Creating toast:', newToast);

    setToasts(prev => {
      const newToasts = [...prev, newToast];
      console.log('Updated toasts state:', newToasts);
      return newToasts;
    });

    // Auto remove toast after duration + animation time
    setTimeout(() => {
      console.log('Auto-removing toast with id:', id);
      removeToast(id);
    }, duration + 500);
  }, [removeToast]);

  const showError = useCallback((message, duration) => {
    console.log('ToastContext showError called with:', { message, duration });
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
        {console.log('Rendering toasts:', toasts)}
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
            {console.log('Rendering Toast component with:', { message: toast.message, type: toast.type, isVisible: toast.isVisible })}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
