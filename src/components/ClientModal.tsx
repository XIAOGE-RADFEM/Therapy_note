
import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Tag, Activity, Globe, Plus } from 'lucide-react';
import { Language, Client } from '../types';
import { TRANSLATIONS, COMMON_DIAGNOSES } from '../constants';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  lang: Language;
  client?: Client | null; // Optional client for editing
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, lang, client }) => {
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState({
    name: '',
    sex: 'female',
    date_of_birth: '',
    intake_date: new Date().toISOString().split('T')[0],
    referral_source: '',
    status: 'active',
    lang_preference: lang,
    tags: '',
    notes: ''
  });
  
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [diagnosisInput, setDiagnosisInput] = useState('');

  // Populate form when client prop changes (Editing mode)
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        sex: client.sex || 'female',
        date_of_birth: client.date_of_birth || '',
        intake_date: client.intake_date,
        referral_source: client.referral_source,
        status: client.status,
        lang_preference: client.lang_preference,
        tags: client.tags.join(', '),
        notes: client.notes
      });
      setSelectedDiagnoses(client.diagnoses);
    } else {
      // Reset for new client
      setFormData({
        name: '',
        sex: 'female',
        date_of_birth: '',
        intake_date: new Date().toISOString().split('T')[0],
        referral_source: '',
        status: 'active',
        lang_preference: lang,
        tags: '',
        notes: ''
      });
      setSelectedDiagnoses([]);
    }
    setDiagnosisInput('');
  }, [client, lang, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addDiagnosis = (val: string) => {
    if (val && !selectedDiagnoses.includes(val)) {
        setSelectedDiagnoses([...selectedDiagnoses, val]);
    }
  };

  const removeDiagnosis = (val: string) => {
      setSelectedDiagnoses(selectedDiagnoses.filter(d => d !== val));
  };
  
  const handleDiagnosisSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value) {
          addDiagnosis(e.target.value);
          e.target.value = ''; // reset
      }
  };

  const handleDiagnosisInputKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && diagnosisInput.trim()) {
          e.preventDefault();
          addDiagnosis(diagnosisInput.trim());
          setDiagnosisInput('');
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      client_id: client?.client_id, // Pass ID back if editing
      diagnoses: selectedDiagnoses,
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-brand-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-beige-soft/40">
          <h2 className="text-xl font-bold text-brand-text flex items-center gap-3">
            <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange">
              <User className="w-5 h-5" />
            </div>
            {client ? t.editClient : t.newClient}
          </h2>
          <button onClick={onClose} className="text-brand-text-light hover:text-brand-text transition-colors p-1 rounded-full hover:bg-black/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Form Input styles */}
          <style>{`
            .form-input {
              width: 100%;
              padding: 0.5rem 0.75rem;
              border: 1px solid #EAE5E1; /* brand-border */
              border-radius: 0.5rem;
              background-color: #FBF9F6; /* beige */
              outline: none;
              transition: box-shadow 0.2s;
              height: 2.5rem; /* Standard height for all inputs */
            }
            .form-input:focus {
              box-shadow: 0 0 0 2px #D95D39; /* brand-orange */
              border-color: transparent;
            }
            .form-input-with-icon {
              padding-left: 2.25rem;
            }
          `}</style>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text-light mb-1">{t.clientName} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="form-input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-light mb-1">{t.sex}</label>
              <div className="relative">
                <select name="sex" value={formData.sex} onChange={handleChange} className="form-input">
                  <option value="female">{t.female}</option>
                  <option value="male">{t.male}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text-light mb-1">{t.dateOfBirth}</label>
              <div className="relative">
                 <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="form-input"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-light mb-1">{t.intakeDate}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="date" name="intake_date" required value={formData.intake_date} onChange={handleChange} className="form-input form-input-with-icon"/>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-brand-text-light mb-1">{t.referral}</label>
                <div className="relative">
                  <input type="text" name="referral_source" value={formData.referral_source} onChange={handleChange} className="form-input" />
                </div>
              </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-light mb-1">{t.status}</label>
              <div className="relative">
                <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
          
           <div>
              <label className="block text-sm font-medium text-brand-text-light mb-1">{t.languagePreference}</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select name="lang_preference" value={formData.lang_preference} onChange={handleChange} className="form-input form-input-with-icon">
                  <option value="zh">中文 (Chinese)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

          {/* Diagnoses with Dropdown and Custom Input */}
          <div>
            <label className="block text-sm font-medium text-brand-text-light mb-1">{t.diagnosis}</label>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select onChange={handleDiagnosisSelect} className="form-input form-input-with-icon">
                            <option value="">{t.diagnosesPlaceholder}</option>
                            {COMMON_DIAGNOSES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="w-1/3 relative">
                         <input 
                            type="text" 
                            value={diagnosisInput}
                            onChange={(e) => setDiagnosisInput(e.target.value)}
                            onKeyDown={handleDiagnosisInputKeyDown}
                            placeholder="Custom..."
                            className="form-input"
                         />
                         <button type="button" onClick={() => {if(diagnosisInput) {addDiagnosis(diagnosisInput); setDiagnosisInput('')}}} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-orange hover:bg-orange-50 rounded p-1"><Plus className="w-4 h-4"/></button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectedDiagnoses.map(d => (
                        <span key={d} className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                            {d}
                            <button type="button" onClick={() => removeDiagnosis(d)} className="ml-1 text-red-400 hover:text-red-700"><X className="w-3 h-3"/></button>
                        </span>
                    ))}
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text-light mb-1">{t.tags}</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="form-input form-input-with-icon" placeholder={t.tagsPlaceholder}/>
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-brand-text-light mb-1">{t.notes}</label>
            <div className="relative">
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="form-input resize-none" style={{height: 'auto'}}/>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-brand-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-beige-soft transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-brand-orange/90 shadow-sm transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
