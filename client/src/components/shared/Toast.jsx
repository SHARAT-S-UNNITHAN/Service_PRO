import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export default function Toast({ 
  message, 
  type = "success", 
  isVisible, 
  onClose, 
  duration = 5000 
}) {
  useEffect(() => {
    if (isVisible && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const themes = {
    success: {
      icon: <CheckCircle2 className="text-green-600" size={20} />,
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-800",
      accent: "bg-green-500"
    },
    error: {
      icon: <AlertCircle className="text-red-600" size={20} />,
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-800",
      accent: "bg-red-500"
    },
    info: {
      icon: <Info className="text-indigo-600" size={20} />,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      text: "text-indigo-800",
      accent: "bg-indigo-500"
    }
  };

  const theme = themes[type] || themes.success;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className={`${theme.bg} ${theme.border} border rounded-[1.5rem] shadow-2xl p-4 min-w-[320px] flex items-center gap-4 relative overflow-hidden`}>
        {/* Progress bar accent */}
        <div className={`absolute bottom-0 left-0 h-1 ${theme.accent} animate-progress`} style={{ animationDuration: `${duration}ms` }}></div>
        
        <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0`}>
          {theme.icon}
        </div>
        
        <div className="flex-1">
          <p className={`${theme.text} text-sm font-bold tracking-tight`}>
            {message}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/50 rounded-lg transition-colors text-gray-400"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
