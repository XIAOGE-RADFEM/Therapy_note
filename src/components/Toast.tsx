
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-600' : 'bg-red-600';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 transform translate-y-0 opacity-100">
      <div className={`w-full ${bgColor} text-white shadow-lg`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm md:text-base">{message}</span>
            </div>
            <button 
                onClick={onClose} 
                className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close notification"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};
