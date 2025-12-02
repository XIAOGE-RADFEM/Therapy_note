import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { CryptoService } from '../services/crypto';
import { Lock } from 'lucide-react';

interface AuthProps {
  lang: Language;
  onUnlock: (crypto: CryptoService) => void;
  needsSetup: boolean;
}

const base64ToUint8Array = (base64: string) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));
const uint8ArrayToBase64 = (array: Uint8Array) => btoa(String.fromCharCode.apply(null, Array.from(array)));


export const Auth: React.FC<AuthProps> = ({ lang, onUnlock, needsSetup }) => {
  const t = TRANSLATIONS[lang];
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    if (password.length < 8) {
      setError(t.passwordTooShort);
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const crypto = await CryptoService.create(password, salt);
      const keyCheck = await crypto.getKeyCheck();
      
      localStorage.setItem('therapylog.salt', uint8ArrayToBase64(salt));
      localStorage.setItem('therapylog.keyCheck', keyCheck);
      
      onUnlock(crypto);
    } catch (err) {
      console.error(err);
      setError(t.passwordError);
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const saltB64 = localStorage.getItem('therapylog.salt');
      const keyCheck = localStorage.getItem('therapylog.keyCheck');
      if (!saltB64 || !keyCheck) {
        setError("Encryption data missing. Cannot unlock.");
        setIsLoading(false);
        return;
      }

      const salt = base64ToUint8Array(saltB64);
      const isCorrect = await CryptoService.verifyPassword(password, salt, keyCheck);
      
      if (isCorrect) {
        const crypto = await CryptoService.create(password, salt);
        onUnlock(crypto);
      } else {
        setError(t.loginError);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-beige flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-brand-border w-full max-w-sm text-center">
        <div className="mx-auto w-16 h-16 bg-brand-orange/10 text-brand-orange flex items-center justify-center rounded-full mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-brand-text">
          {needsSetup ? t.authTitleSetup : t.authTitleLogin}
        </h1>
        <p className="text-brand-text-light mt-2 text-sm">
          {needsSetup ? t.authPromptSetup : t.authPromptLogin}
        </p>

        <form onSubmit={needsSetup ? handleSetup : handleLogin} className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`${t.password}...`}
            className="w-full text-center p-3 border border-brand-border rounded-lg bg-beige-soft focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
            autoFocus
          />
          {needsSetup && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={`${t.confirmPassword}...`}
              className="w-full text-center p-3 border border-brand-border rounded-lg bg-beige-soft focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
            />
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 text-base font-medium text-white bg-brand-orange rounded-lg hover:bg-brand-orange/90 shadow-sm transition-colors disabled:bg-gray-400"
          >
            {isLoading ? '...' : (needsSetup ? t.createAndEncrypt : t.unlock)}
          </button>
        </form>
      </div>
    </div>
  );
};