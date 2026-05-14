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
    setToasts((prev) => {
      // Éviter les doublons exacts (même message et type)
      const isDuplicate = prev.some(t => t.message === message && t.type === type);
      if (isDuplicate) return prev;
      
      const id = Math.random().toString(36).substring(2, 9);
      // Limiter à 3 toasts maximum pour éviter l'encombrement
      const newToasts = [...prev, { id, message, type }].slice(-3);
      
      setTimeout(() => {
        setToasts((curr) => curr.filter((t) => t.id !== id));
      }, 5000);
      
      return newToasts;
    });
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-4 min-w-[320px] max-w-[480px] w-full px-4 items-center">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="group pointer-events-auto w-full"
            >
              <div className={`
                relative flex items-start gap-4 p-5 rounded-[2rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2
                ${toast.type === 'success' ? 'border-emerald-100' : ''}
                ${toast.type === 'error' ? 'border-rose-100' : ''}
                ${toast.type === 'warning' ? 'border-amber-100' : ''}
                ${toast.type === 'info' ? 'border-blue-100' : ''}
              `}>
                <div className={`p-3 rounded-2xl flex-shrink-0 ${
                  toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  toast.type === 'error' ? 'bg-rose-50 text-rose-600' :
                  toast.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                  {toast.type === 'info' && <Info className="w-5 h-5" />}
                </div>

                <div className="flex-1 pt-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    {toast.type === 'success' ? 'Succès' : toast.type === 'error' ? 'Erreur' : 'Information'}
                  </p>
                  <p className="text-[11px] font-bold text-slate-800 leading-relaxed uppercase">
                    {toast.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Progress Bar */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: 0 }}
                  transition={{ duration: 5, ease: "linear" }}
                  className={`absolute bottom-0 left-8 right-8 h-1 rounded-full ${
                    toast.type === 'success' ? 'bg-emerald-500' :
                    toast.type === 'error' ? 'bg-rose-500' :
                    toast.type === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}
                />
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
