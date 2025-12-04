import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Monitor, User, RefreshCw } from 'lucide-react';
import { Language, SessionFormat, SessionSetting, Client } from '../types';
import { TRANSLATIONS } from '../constants';
import { getSafeDate, toLocalISOString } from '../utils';

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

  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState('');

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
        });
        setIsRepeating(false);
        setRepeatDays([]);
        setEndDate('');
    }
  }, [isOpen, client, defaultDate, allClients]);


  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDay = (dayIndex: number) => {
      setRepeatDays(prev => 
          prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
      );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
        alert('Please select a client.');
        return;
    }

    const baseSession = {
      ...formData,
      duration_min: Number(formData.duration_min),
    };

    if (isRepeating && endDate && repeatDays.length > 0) {
        const sessions = [];
        // Use getSafeDate to process dates in UTC to avoid timezone shifting issues
        let current = getSafeDate(formData.date);
        const end = getSafeDate(endDate);
        
        // Safety cap
        let count = 0;
        const maxSessions = 50;

        if (end < current) {
             alert('End date must be after start date');
             return;
        }

        while (current <= end && count < maxSessions) {
            // getUTCDay() returns 0-6 for Sunday-Saturday
            if (repeatDays.includes(current.getUTCDay())) {
                sessions.push({
                    ...baseSession,
                    date: toLocalISOString(current) // Convert back to YYYY-MM-DD
                });
                count++;
            }
            // Increment day
            current.setUTCDate(current.getUTCDate() + 1);
        }
        
        if (sessions.length === 0) {
             alert('No sessions generated. Check your date range and selected days.');
             return;
        }
        onSave(sessions);

    } else {
        // Single session
        onSave(baseSession);
    }
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
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

          {/* Repeat Toggle */}
          <div className="flex items-center justify-between py-2">
              <label className="flex items-center text-sm font-medium text-brand-text cursor-pointer select-none">
                  <input type="checkbox" checked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)} className="mr-2 rounded text-brand-orange focus:ring-brand-orange" />
                  <RefreshCw className="w-4 h-4 mr-1 text-brand-text-light" />
                  {t.repeatSession}
              </label>
          </div>

          {/* Repeat Options */}
          {isRepeating && (
              <div className="bg-beige-soft/50 p-4 rounded-lg border border-brand-border space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div>
                      <label className="block text-xs font-semibold text-brand-text-light uppercase tracking-wider mb-2">{t.repeatWeekly}</label>
                      <div className="flex justify-between gap-1">
                          {[0, 1, 2, 3, 4, 5, 6].map(day => {
                              const dayLabel = (t.days as any)[day];
                              const displayLabel = lang === 'zh' ? dayLabel.slice(1, 2) : dayLabel;
                              return (
                                <button
                                    type="button"
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all flex items-center justify-center ${repeatDays.includes(day) ? 'bg-brand-orange text-white shadow-sm' : 'bg-white border border-brand-border text-brand-text-light hover:bg-beige-soft'}`}
                                >
                                    {displayLabel}
                                </button>
                              );
                          })}
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-brand-text-light uppercase tracking-wider mb-1">{t.endDate}</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required={isRepeating} className="w-full p-2 text-sm border border-brand-border rounded bg-white" />
                  </div>
              </div>
          )}

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