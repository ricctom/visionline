import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const colors = {
    success: { bg: '#f0fff4', border: '#c6f6d5', text: '#276749', icon: '✓' },
    error:   { bg: '#fff0f0', border: '#f5c6cb', text: '#c00',    icon: '✕' },
    info:    { bg: '#f0f7ff', border: '#bee3f8', text: '#2b6cb0', icon: 'ℹ' },
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => {
          const c = colors[t.type] || colors.success;
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1px solid ${c.border}`, color: c.text,
              padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', gap: 10,
              animation: 'slideIn .2s ease',
              minWidth: 260, maxWidth: 360,
            }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{c.icon}</span>
              {t.message}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity:0 } to { transform: none; opacity:1 } }`}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
