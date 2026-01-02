
import React from 'react';
import { X, FileText } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS, TEMPLATES } from '../constants';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateContent: string) => void;
  lang: Language;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({ isOpen, onClose, onSelect, lang }) => {
  const t = TRANSLATIONS[lang];
  if (!isOpen) return null;

  const handleSelect = (content: string) => {
    onSelect(content);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-brand-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-beige-soft/40">
          <h2 className="text-xl font-bold text-brand-text flex items-center gap-3">
            <FileText className="w-5 h-5 text-brand-orange" />
            {t.selectTemplateTitle}
          </h2>
          <button onClick={onClose} className="text-brand-text-light hover:text-brand-text transition-colors p-1 rounded-full hover:bg-black/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-brand-text-light mb-6 text-center">{t.selectTemplatePrompt}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(TEMPLATES).map(([key, template]) => {
                const content = lang === 'zh' ? template.content_zh : template.content_en;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(content)}
                    className="text-left p-4 border border-brand-border rounded-lg hover:bg-beige-soft hover:border-brand-orange/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  >
                    <h3 className="font-semibold text-brand-text">{lang === 'zh' ? template.zh : template.en}</h3>
                    <p className="text-xs text-brand-text-light mt-1 line-clamp-2">
                      {content.trim().split('\n')[1] || 'Start with a blank note.'}
                    </p>
                  </button>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
