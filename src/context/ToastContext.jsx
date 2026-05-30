import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`toast-item toast-${t.type}`}
            onClick={() => removeToast(t.id)}
          >
            <span className="toast-icon">
              {t.type === 'success' ? '🙏' : t.type === 'error' ? '⚠️' : '☸'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close-btn">&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
