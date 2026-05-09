import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, message, 
  confirmText = "Confirmer", cancelText = "Annuler",
  type = "danger" 
}: ConfirmModalProps) {
  
  const colors = {
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-200",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200",
    info: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
  };

  const icons = {
    danger: <AlertTriangle className="w-8 h-8 text-red-500" />,
    warning: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    info: <AlertTriangle className="w-8 h-8 text-blue-500" />
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-full flex justify-end absolute top-6 right-6">
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${
                type === 'danger' ? 'bg-red-50' : type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
              }`}>
                {icons[type]}
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight leading-none">
                {title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed px-4">
                {message}
              </p>

              <div className="flex gap-4 mt-10 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 px-8 py-5 rounded-[1.5rem] bg-slate-100 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className={`flex-1 px-8 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${colors[type]}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
