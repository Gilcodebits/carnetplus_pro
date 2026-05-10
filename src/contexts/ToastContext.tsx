import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none items-center w-full max-w-md px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full"
            >
              <div className={`
                flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20
                ${toast.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-200/20' : ''}
                ${toast.type === 'error' ? 'bg-rose-600 text-white shadow-rose-200/20' : ''}
                ${toast.type === 'warning' ? 'bg-rose-600 text-white shadow-rose-200/20' : ''}
                ${toast.type === 'info' ? 'bg-blue-600 text-white shadow-blue-200/20' : ''}
              `}>
                <div className="p-2 bg-white/20 rounded-xl">
                  {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                  {toast.type === 'info' && <Info className="w-5 h-5" />}
                </div>
                <p className="flex-1 font-black text-[11px] uppercase tracking-[0.1em]">{toast.message}</p>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
