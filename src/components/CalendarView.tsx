
import React, { useState, useMemo } from 'react';
import { Client, Session, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';
import { toLocalISOString, getSafeDate } from '../utils';

interface CalendarViewProps {
  clients: Client[];
  sessions: Session[];
  lang: Language;
  onSchedule: (config: { date: string }) => void;
}

type ViewType = 'month' | 'week' | 'day';

export const CalendarView: React.FC<CalendarViewProps> = ({ clients, sessions, lang, onSchedule }) => {
  const t = TRANSLATIONS[lang];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [startOnMonday, setStartOnMonday] = useState(false);

  const filteredSessions = useMemo(() => {
    if (statusFilter === 'all') return sessions;
    const filteredClientIds = new Set(clients.filter(c => c.status === statusFilter).map(c => c.client_id));
    return sessions.filter(s => filteredClientIds.has(s.client_id));
  }, [sessions, clients, statusFilter]);

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

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const getWeekDays = (baseDate: Date) => {
    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay(); // 0 is Sunday, 1 is Monday...

    if (startOnMonday) {
        // If it's Sunday (0), we need to go back 6 days to get to previous Monday.
        // If it's Monday (1), we go back 0 days.
        const diff = day === 0 ? 6 : day - 1;
        startOfWeek.setDate(startOfWeek.getDate() - diff);
    } else {
        // Standard Sunday start
        startOfWeek.setDate(startOfWeek.getDate() - day);
    }
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getHeaderText = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString(lang, { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (view === 'month') {
      return currentDate.toLocaleDateString(lang, { month: 'long', year: 'numeric' });
    }
    // Week view logic
    const days = getWeekDays(currentDate);
    const start = days[0];
    const end = days[6];
    const startStr = start.toLocaleDateString(lang, { month: 'short' });
    const endStr = end.toLocaleDateString(lang, { month: 'short', year: 'numeric' });
    // Check if same month
    if (start.getMonth() === end.getMonth()) {
       return `${startStr} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${startStr} ${start.getDate()} - ${endStr}`;
  };

  // Helper to calculate style for events in time grid
  const getEventStyle = (timeStr: string, durationMin: number) => {
    if (!timeStr) return { top: 0, height: 0, display: 'none' };
    const [hours, minutes] = timeStr.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    // Assume start of day is 00:00 (0 mins) and end is 24:00 (1440 mins)
    // Scale: 60px per hour => 1px per minute
    const top = startMinutes; // 1px = 1min
    const height = durationMin;
    return { top: `${top}px`, height: `${height}px` };
  };

  // --- RENDERERS ---

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    
    const startDate = new Date(startOfMonth);
    const day = startDate.getDay();
    
    // Adjust start date to the beginning of the week grid
    if (startOnMonday) {
        const diff = day === 0 ? 6 : day - 1;
        startDate.setDate(startDate.getDate() - diff);
    } else {
        startDate.setDate(startDate.getDate() - day);
    }

    const days = [];
    // Always render 6 rows = 42 days to keep height consistent
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    
    // Weekday headers order
    const weekDayIndices = startOnMonday ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
         {/* Separate Header Row */}
         <div className="grid grid-cols-7 border-b border-brand-border bg-gray-50 shrink-0">
             {weekDayIndices.map((dayIndex) => (
                <div key={dayIndex} className="text-center py-2 text-xs font-medium text-brand-text-light">
                   {lang === 'zh' ? (t.days as any)[dayIndex] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]}
                </div>
             ))}
         </div>
         
         {/* Calendar Grid */}
         <div className="flex-1 grid grid-cols-7 grid-rows-6">
            {days.map(d => {
                const dateKey = toLocalISOString(d);
                const daySessions = sessionsByDate[dateKey] || [];
                const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                return (
                <div
                    key={dateKey}
                    onClick={() => onSchedule({ date: dateKey })}
                    className={`border-b border-r border-brand-border p-1 transition-colors hover:bg-beige-soft/30 cursor-pointer overflow-hidden
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50/50 text-gray-400'}
                    `}
                >
                    <div className="flex justify-end mb-1">
                        <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium
                            ${isToday(d) ? 'bg-brand-orange text-white' : 'text-brand-text'}
                        `}>
                            {d.getDate()}
                        </span>
                    </div>
                    <div className="space-y-1">
                        {daySessions.slice(0, 4).map(s => (
                            <div key={s.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate border-l-2 ${
                                s.status === 'completed' ? 'border-green-500 bg-green-50 text-green-700' : 
                                s.status === 'cancelled' ? 'border-gray-400 bg-gray-100 text-gray-500 line-through' :
                                'border-brand-orange bg-orange-50 text-brand-orange'
                            }`}>
                            <span className="font-semibold">{s.time}</span> {s.clientName}
                            </div>
                        ))}
                        {daySessions.length > 4 && (
                            <div className="text-[10px] text-gray-400 pl-1">
                            + {daySessions.length - 4} more
                            </div>
                        )}
                    </div>
                </div>
                )
            })}
         </div>
      </div>
    );
  };

  const renderTimeGrid = (days: Date[]) => {
    // Generate hours 0-24
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
         {/* Grid Header */}
         <div className="flex border-b border-brand-border shrink-0">
             <div className="w-16 shrink-0 bg-white border-r border-brand-border"></div> {/* Time axis header placeholder */}
             {days.map((d, i) => (
                <div key={i} className={`flex-1 text-center py-3 border-r border-brand-border bg-white ${isToday(d) ? 'bg-orange-50/30' : ''}`}>
                   <div className={`text-xs font-medium uppercase mb-0.5 ${isToday(d) ? 'text-brand-orange' : 'text-brand-text-light'}`}>
                      {lang === 'zh' ? (t.days as any)[d.getDay()] : d.toLocaleDateString(lang, { weekday: 'short' })}
                   </div>
                   <div className={`text-xl font-bold leading-none ${isToday(d) ? 'text-brand-orange' : 'text-brand-text'}`}>
                      {d.getDate()}
                   </div>
                </div>
             ))}
         </div>

         {/* Grid Body */}
         <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-16">
             <div className="flex min-h-[1440px]"> {/* 1440px = 24 hours * 60px/hr */}
                {/* Time Axis */}
                <div className="w-16 shrink-0 border-r border-brand-border bg-white text-xs text-brand-text-light">
                   {hours.map(h => (
                      <div key={h} className="h-[60px] border-b border-brand-border/50 relative">
                         <span className="absolute -top-2.5 right-2 bg-white px-1">
                            {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h-12}pm`}
                         </span>
                      </div>
                   ))}
                </div>

                {/* Days Columns */}
                {days.map((d, i) => {
                   const dateKey = toLocalISOString(d);
                   const daySessions = sessionsByDate[dateKey] || [];
                   
                   return (
                      <div 
                        key={i} 
                        className={`flex-1 border-r border-brand-border relative h-[1440px] group ${isToday(d) ? 'bg-orange-50/10' : 'bg-white'}`}
                        onClick={(e) => {
                             // Simple click to schedule at clicked time could be implemented here
                             // For now, defaulting to general schedule
                             if(e.target === e.currentTarget) onSchedule({ date: dateKey });
                        }}
                      >
                         {/* Hour Lines */}
                         {hours.map(h => (
                            <div key={h} className="h-[60px] border-b border-brand-border/30 pointer-events-none"></div>
                         ))}

                         {/* Events */}
                         {daySessions.map(s => {
                            if (!s.time) return null; // Skip unscheduled times
                            const style = getEventStyle(s.time, s.duration_min);
                            return (
                               <div
                                  key={s.id}
                                  className={`absolute left-1 right-1 rounded px-2 py-1 text-xs border-l-4 overflow-hidden shadow-sm cursor-pointer hover:brightness-95 hover:z-10 transition-all ${
                                      s.status === 'completed' ? 'bg-green-100 border-green-500 text-green-800' :
                                      s.status === 'cancelled' ? 'bg-gray-100 border-gray-400 text-gray-500 opacity-70' :
                                      'bg-orange-100 border-brand-orange text-brand-text'
                                  }`}
                                  style={style}
                                  title={`${s.time} - ${s.clientName}`}
                               >
                                  <div className="font-bold truncate">{s.clientName}</div>
                                  <div className="opacity-80 truncate">{s.time} ({s.duration_min}m)</div>
                               </div>
                            );
                         })}
                      </div>
                   );
                })}
             </div>
             
             {/* Current Time Indicator (if today) */}
             {days.some(d => isToday(d)) && (
                <div 
                   className="absolute left-16 right-0 border-t-2 border-red-400 z-20 pointer-events-none flex items-center"
                   style={{ top: `${new Date().getHours() * 60 + new Date().getMinutes()}px` }}
                >
                   <div className="w-2 h-2 bg-red-400 rounded-full -ml-1"></div>
                </div>
             )}
         </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden animate-in fade-in duration-300">
      
      {/* Main Header */}
      <div className="p-2 md:p-4 border-b border-brand-border flex items-center justify-between shrink-0 bg-white z-10">
         <div className="flex items-center gap-2 md:gap-4 flex-1 overflow-hidden">
             {/* Today Button - Smaller on mobile */}
             <button onClick={handleToday} className="px-2 md:px-4 py-1.5 text-xs md:text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-beige-soft transition-colors shadow-sm whitespace-nowrap">
                 {t.today}
             </button>
             
             {/* Nav Arrows */}
             <div className="flex items-center text-brand-text-light shrink-0">
                 <button onClick={handlePrev} className="p-1 md:p-1.5 hover:bg-beige-soft rounded-full transition-colors"><ChevronLeft className="w-5 h-5 md:w-5 md:h-5" /></button>
                 <button onClick={handleNext} className="p-1 md:p-1.5 hover:bg-beige-soft rounded-full transition-colors"><ChevronRight className="w-5 h-5 md:w-5 md:h-5" /></button>
             </div>
             
             {/* Date Title - Flexible width on mobile */}
             <h2 className="text-base md:text-xl font-bold text-brand-text tracking-tight ml-1 truncate">
                 {getHeaderText()}
             </h2>
         </div>

         <div className="flex items-center gap-1 md:gap-3 shrink-0 ml-2">
             <div className="hidden md:flex items-center p-1 bg-beige-soft rounded-lg border border-brand-border">
                 {(['month', 'week', 'day'] as ViewType[]).map(v => (
                     <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                            view === v ? 'bg-white text-brand-orange shadow-sm' : 'text-brand-text-light hover:text-brand-text'
                        }`}
                     >
                        {(t as any)[v]}
                     </button>
                 ))}
             </div>
             
             {/* Settings Dropdown */}
             <div className="relative">
                 <button 
                    onClick={() => setShowSettings(!showSettings)}
                    title={t.setting} 
                    className={`p-1.5 md:p-2 rounded-lg transition-colors ${showSettings ? 'bg-beige-soft text-brand-orange' : 'text-brand-text-light hover:bg-beige-soft'}`}
                 >
                    <Settings className="w-5 h-5 md:w-5 md:h-5" />
                 </button>
                 {showSettings && (
                     <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-brand-border z-30 p-2 animate-in fade-in zoom-in-95 duration-200">
                         <div className="px-3 py-2 border-b border-brand-border mb-1">
                             <span className="text-xs font-bold text-brand-text-light uppercase tracking-wider">{t.calendarSettings}</span>
                         </div>
                         <button 
                            onClick={() => {
                                setStartOnMonday(!startOnMonday);
                                setShowSettings(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-brand-text hover:bg-beige-soft rounded-lg"
                         >
                             <span>{t.startWeekOnMonday}</span>
                             <div className={`w-4 h-4 rounded border flex items-center justify-center ${startOnMonday ? 'bg-brand-orange border-brand-orange text-white' : 'border-gray-300'}`}>
                                 {startOnMonday && <div className="w-2 h-2 bg-white rounded-sm" />}
                             </div>
                         </button>
                     </div>
                 )}
             </div>

             {/* Click outside closer could be implemented here or globally, simplified for now */}
             {showSettings && (
                <div className="fixed inset-0 z-20" onClick={() => setShowSettings(false)}></div>
             )}
             
             <button 
                onClick={() => onSchedule({ date: toLocalISOString(currentDate) })}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-brand-orange text-white text-xs md:text-sm font-medium rounded-lg hover:bg-brand-orange/90 shadow-sm transition-colors whitespace-nowrap"
             >
                 <Plus className="w-4 h-4" />
                 <span className="hidden md:inline">{t.newEvent}</span>
                 <span className="md:hidden">New</span>
             </button>
         </div>
      </div>

      {/* Content Area */}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderTimeGrid(getWeekDays(currentDate))}
      {view === 'day' && renderTimeGrid([currentDate])}
      
    </div>
  );
};
