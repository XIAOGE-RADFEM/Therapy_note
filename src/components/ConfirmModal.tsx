import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  lang: Language;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, lang }) => {
  const t = TRANSLATIONS[lang];
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-brand-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
          <h2 className="text-lg font-bold text-brand-text flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {title}
          </h2>
          <button onClick={onClose} className="text-brand-text-light hover:text-brand-text transition-colors p-1 rounded-full hover:bg-black/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-brand-text-light leading-relaxed">{message}</p>
        </div>

        <div className="px-6 py-4 flex items-center justify-end space-x-3 bg-beige-soft/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-beige-soft transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {t.delete}
          </button>
        </div>
      </div>
    </div>
  );
};