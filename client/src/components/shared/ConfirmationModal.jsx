import React from 'react';
import { AlertTriangle, X, CheckCircle2, Info } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger" // "danger", "warning", "success", "info"
}) {
  if (!isOpen) return null;

  const themes = {
    danger: {
      icon: <AlertTriangle className="text-red-600" size={28} />,
      bg: "bg-red-50",
      border: "border-red-100",
      button: "bg-red-600 hover:bg-red-700 shadow-red-200",
      text: "text-red-600"
    },
    warning: {
      icon: <AlertTriangle className="text-amber-600" size={28} />,
      bg: "bg-amber-50",
      border: "border-amber-100",
      button: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
      text: "text-amber-600"
    },
    success: {
      icon: <CheckCircle2 className="text-green-600" size={28} />,
      bg: "bg-green-50",
      border: "border-green-100",
      button: "bg-green-600 hover:bg-green-700 shadow-green-200",
      text: "text-green-600"
    },
    info: {
      icon: <Info className="text-indigo-600" size={28} />,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      button: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
      text: "text-indigo-600"
    }
  };

  const theme = themes[type] || themes.danger;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 ${theme.bg} rounded-2xl flex items-center justify-center border ${theme.border}`}>
              {theme.icon}
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {title}
            </h3>
            <p className="text-gray-500 leading-relaxed font-medium">
              {message}
            </p>
          </div>

          <div className="mt-10 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-gray-100 text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={async () => {
                if (typeof onConfirm === 'function') {
                  await onConfirm();
                }
                onClose();
              }}
              className={`flex-1 px-6 py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 ${theme.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
