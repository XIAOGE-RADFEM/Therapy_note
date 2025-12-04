import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { CryptoService, base64ToUint8Array } from '../services/crypto';
import { Lock, X } from 'lucide-react';

interface ImportPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any, password: string) => void;
  lang: Language;
  importData: any;
}

export const ImportPasswordModal: React.FC<ImportPasswordModalProps> = ({ isOpen, onClose, onConfirm, lang, importData }) => {
  const t = TRANSLATIONS[lang];
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError('');
    setIsLoading(true);

    const { salt: saltB64, keyCheck } = importData.meta;
    if (!saltB64 || !keyCheck) {
      setError("Backup file is corrupt or invalid.");
      setIsLoading(false);
      return;
    }

    try {
      const salt = base64ToUint8Array(saltB64);
      const isCorrect = await CryptoService.verifyPassword(password, salt, keyCheck);

      if (isCorrect) {
        onConfirm(importData, password);
      } else {
        setError(t.importError);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during verification.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-brand-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-beige-soft/40">
           <h2 className="text-xl font-bold text-brand-text flex items-center gap-3">
             <Lock className="w-5 h-5 text-brand-orange" />
             {t.confirmImportTitle}
           </h2>
           <button onClick={onClose} className="text-brand-text-light hover:text-brand-text transition-colors p-1 rounded-full hover:bg-black/5">
             <X className="w-5 h-5" />
           </button>
        </div>
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          <p className="text-brand-text-light text-sm mb-4">
            {t.importDesc}
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`${t.password}...`}
            className="w-full text-center p-3 border border-brand-border rounded-lg bg-beige-soft focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
            autoFocus
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-brand-border mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-beige-soft transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-brand-orange/90 shadow-sm transition-colors disabled:bg-gray-400"
            >
              {isLoading ? '...' : t.confirmImportButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};