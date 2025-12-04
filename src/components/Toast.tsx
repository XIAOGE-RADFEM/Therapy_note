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
  const bgColor = isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const iconColor = isSuccess ? 'text-green-500' : 'text-red-500';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md animate-in fade-in slide-in-from-top-10 duration-300">
      <div className={`relative flex items-center p-4 rounded-xl shadow-lg border ${bgColor}`}>
        <div className={`mr-3 p-1 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1 text-sm font-medium text-brand-text">
          {message}
        </div>
        <button onClick={onClose} className="ml-4 p-1 rounded-full text-brand-text-light hover:bg-black/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
