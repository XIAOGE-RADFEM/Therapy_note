import React, { useState, useMemo } from 'react';
import { Client, Session, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { toLocalISOString } from '../utils';

interface CalendarViewProps {
  clients: Client[];
  sessions: Session[];
  lang: Language;
  onSchedule: (config: { date: string }) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ clients, sessions, lang, onSchedule }) => {
  const t = TRANSLATIONS[lang];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');

  const filteredSessions = useMemo(() => {
    if (statusFilter === 'all') return sessions;
    const filteredClientIds = new Set(clients.filter(c => c.status === statusFilter).map(c => c.client_id));
    return sessions.filter(s => filteredClientIds.has(s.client_id));
  }, [sessions, clients, statusFilter]);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const sessionsByDate = useMemo(() => {
    const map: { [key: string]: (Session & { clientName: string })[] } = {};
    filteredSessions.forEach(session => {
      const dateKey = session.date;
      if (!map[dateKey]) map[dateKey] = [];
      const client = clients.find(c => c.client_id === session.client_id);
      map[dateKey].push({ ...session, clientName: client?.name || 'Unknown' });
    });
    // Sort sessions within each day by time
    Object.values(map).forEach(daySessions => {
        daySessions.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    });
    return map;
  }, [filteredSessions, clients]);
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());
  
  const today = new Date();
  const isToday = (date: Date) => date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-brand-text">
                {currentDate.toLocaleString(lang, { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} className="p-1.5 rounded text-brand-text-light hover:bg-beige-soft"><ChevronLeft size={20} /></button>
                <button onClick={handleToday} className="px-3 py-1 text-sm font-medium rounded border border-brand-border hover:bg-beige-soft">{t.today}</button>
                <button onClick={handleNextMonth} className="p-1.5 rounded text-brand-text-light hover:bg-beige-soft"><ChevronRight size={20} /></button>
            </div>
        </div>
        <div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="text-sm p-2 border border-brand-border rounded-md bg-white text-brand-text-light focus:ring-brand-orange focus:border-brand-orange">
                <option value="all">{t.status}: All</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
            </select>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-xs text-brand-text-light p-2 border-b border-brand-border">
            {day}
          </div>
        ))}
        {/* Calendar Cells */}
        {days.map(d => {
            // Fix: Use local ISO string to ensure the date key matches the system date logic
            const dateKey = toLocalISOString(d);
            const daySessions = sessionsByDate[dateKey] || [];
            return (
              <div
                key={dateKey}
                className={`relative p-2 border-t border-r border-brand-border flex flex-col group cursor-pointer hover:bg-beige-soft/50 transition-colors
                  ${d.getMonth() !== currentDate.getMonth() ? 'bg-beige-soft/40 text-gray-400' : 'bg-white'}`
                }
                onClick={() => onSchedule({ date: dateKey })}
              >
                <span className={`text-xs font-semibold ${isToday(d) ? 'bg-brand-orange text-white rounded-full w-5 h-5 flex items-center justify-center' : ''}`}>
                  {d.getDate()}
                </span>
                <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                    {daySessions.map(session => (
                        <div key={session.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate text-white
                          ${session.status === 'completed' ? 'bg-green-600' : session.status === 'cancelled' ? 'bg-gray-400' : 'bg-blue-500'}
                        `}>
                            <span className="font-bold">{session.clientName}</span> {session.time && `- ${session.time}`}
                        </div>
                    ))}
                </div>
              </div>
            )
        })}
      </div>
    </div>
  );
};