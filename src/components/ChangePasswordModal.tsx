

import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { Lock, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (current: string, newPass: string) => Promise<void>;
  lang: Language;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onConfirm, lang }) => {
  const t = TRANSLATIONS[lang];
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    if (newPassword.length < 8) {
      setError(t.passwordTooShort);
      return;
    }
    
    setIsLoading(true);
    try {
      await onConfirm(currentPassword, newPassword);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-brand-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-beige-soft/40">
           <h2 className="text-xl font-bold text-brand-text flex items-center gap-3">
             <Lock className="w-5 h-5 text-brand-orange" />
             {t.changePasswordTitle}
           </h2>
           <button onClick={onClose} className="text-brand-text-light hover:text-brand-text transition-colors p-1 rounded-full hover:bg-black/5">
             <X className="w-5 h-5" />
           </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={`${t.currentPassword}...`}
            className="w-full p-3 border border-brand-border rounded-lg bg-beige-soft focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
            autoFocus
            required
          />
           <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={`${t.newPassword}...`}
            className="w-full p-3 border border-brand-border rounded-lg bg-beige-soft focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
            required
          />
           <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={`${t.confirmNewPassword}...`}
            className="w-full p-3 border border-brand-border rounded-lg bg-beige-soft focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
            required
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
              {isLoading ? '...' : t.changePassword}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};