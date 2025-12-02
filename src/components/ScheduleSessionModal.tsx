import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Monitor, User } from 'lucide-react';
import { Language, SessionFormat, SessionSetting, Client } from '../types';
import { TRANSLATIONS } from '../constants';

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  lang: Language;
  client?: Client | null; // Pre-selected client when opening from client page
  allClients: Client[];
  defaultDate?: string; // Pre-selected date when opening from calendar
}

export const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({ isOpen, onClose, onSave, lang, client, allClients, defaultDate }) => {
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState({
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    duration_min: 50,
    format: 'individual' as SessionFormat,
    setting: 'in-person' as SessionSetting,
    location: 'Office',
  });

  useEffect(() => {
    if (isOpen) {
        setFormData({
            client_id: client?.client_id || (allClients[0]?.client_id || ''),
            date: defaultDate || new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().substring(0, 5),
            duration_min: 50,
            format: 'individual' as SessionFormat,
            setting: 'in-person' as SessionSetting,
            location: 'Office',
        })
    }
  }, [isOpen, client, defaultDate, allClients]);


  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
        alert('Please select a client.');
        return;
    }
    onSave({
      ...formData,
      duration_min: Number(formData.duration_min),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-brand-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-beige-soft/40">
          <h2 className="text-xl font-bold text-brand-text flex items-center gap-3">
            <Calendar className="w-5 h-5 text-brand-orange" />
            {t.scheduleSession}
          </h2>
          <button onClick={onClose} className="text-brand-text-light hover:text-brand-text transition-colors p-1 rounded-full hover:bg-black/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!client && (
             <div>
                <label className="block text-sm font-medium text-brand-text-light mb-1">{t.clients}</label>
                <select name="client_id" required value={formData.client_id} onChange={handleChange} className="w-full p-2 border border-brand-border rounded bg-beige-soft">
                   {allClients.map(c => <option key={c.client_id} value={c.client_id}>{c.name}</option>)}
                </select>
             </div>
          )}
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-sm font-medium text-brand-text-light mb-1">{t.date}</label><input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full p-2 border border-brand-border rounded bg-beige-soft" /></div>
             <div><label className="block text-sm font-medium text-brand-text-light mb-1">{t.time}</label><input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full p-2 border border-brand-border rounded bg-beige-soft" /></div>
          </div>
          <div><label className="block text-sm font-medium text-brand-text-light mb-1">{t.duration}</label><input type="number" name="duration_min" required value={formData.duration_min} onChange={handleChange} className="w-full p-2 border border-brand-border rounded bg-beige-soft" /></div>
          <div><label className="block text-sm font-medium text-brand-text-light mb-1">{t.format}</label><select name="format" value={formData.format} onChange={handleChange} className="w-full p-2 border border-brand-border rounded bg-beige-soft"><option value="individual">{t.individual}</option><option value="couple">{t.couple}</option><option value="family">{t.family}</option><option value="group">{t.group}</option></select></div>
          <div><label className="block text-sm font-medium text-brand-text-light mb-1">{t.setting}</label><select name="setting" value={formData.setting} onChange={handleChange} className="w-full p-2 border border-brand-border rounded bg-beige-soft"><option value="in-person">{t.inPerson}</option><option value="online">{t.online}</option><option value="phone">{t.phone}</option></select></div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-brand-border mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-beige-soft">{t.cancel}</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-brand-orange/90 shadow-sm">{t.save}</button>
          </div>
        </form>
      </div>
    </div>
  );
};