

import React, { useMemo } from 'react';
import { Client, Session, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Clock, Users, FileText, Calendar, Percent, Activity, UserCheck, CheckCircle } from 'lucide-react';
import { formatDate, getSafeDate, toLocalISOString } from '../utils';

interface DashboardProps {
  clients: Client[];
  sessions: Session[];
  lang: Language;
  onClientSelect: (client: Client) => void;
  onSessionSelect: (session: Session) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ clients, sessions, lang, onClientSelect, onSessionSelect }) => {
  const t = TRANSLATIONS[lang];

  const stats = useMemo(() => {
    const activeClientsList = clients.filter(c => c.status === 'active');
    const totalClientsCount = clients.length;
    const activeClientsCount = activeClientsList.length;
    
    // Total Therapy Hours
    // FIX: Explicitly cast duration_min to Number to prevent string concatenation bug (e.g. "50"+"50" = "5050")
    const totalMinutes = sessions
        .filter(s => s.status === 'completed')
        .reduce((acc, s) => acc + (Number(s.duration_min) || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Average Sessions per Client
    const avgSessionsPerClient = totalClientsCount > 0 
      ? (sessions.length / totalClientsCount).toFixed(1) 
      : '0';

    // Unfinished Notes %
    // Definition: Sessions that are either 'pending_note' OR ('scheduled' but date is in past)
    const nowISO = toLocalISOString(new Date());
    const unfinishedNotesCount = sessions.filter(s => 
        s.status === 'pending_note' || 
        (s.status === 'scheduled' && s.date < nowISO)
    ).length;
    
    const unfinishedPercentage = sessions.length > 0
        ? Math.round((unfinishedNotesCount / sessions.length) * 100)
        : 0;

    return { 
        totalClients: totalClientsCount, 
        activeClients: activeClientsCount,
        totalHours,
        avgSessions: avgSessionsPerClient,
        unfinishedPercentage
    };
  }, [clients, sessions]);
  
  const unfinishedNotes = useMemo(() => {
    const nowISO = toLocalISOString(new Date());
    return sessions
        .filter(s =>
            s.status === 'pending_note' ||
            (s.status === 'scheduled' && s.date < nowISO)
        )
        .sort((a, b) => a.date.localeCompare(b.date)) // Sort by oldest first
        .slice(0, 10) // Limit to 10
        .map(s => {
            const client = clients.find(c => c.client_id === s.client_id);
            const isOverdue = s.status === 'scheduled' && s.date < nowISO;
            return {
                ...s,
                clientName: client?.name || s.client_id,
                reason: isOverdue ? 'Overdue' : 'Pending Note'
            };
        });
  }, [sessions, clients]);

  const upcomingSessions = useMemo(() => {
    const todayStr = toLocalISOString(new Date());

    return sessions
      .filter(s => s.status === 'scheduled' && s.date >= todayStr)
      .sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`))
      .slice(0, 5)
      .map(s => {
          const client = clients.find(c => c.client_id === s.client_id);
          return { ...s, clientName: client?.name || s.client_id };
      });
  }, [sessions, clients]);

  const recentActiveClients = useMemo(() => {
    const clientLastSession: Record<string, string> = {};
    sessions.forEach(s => {
        if (s.status === 'completed' && (!clientLastSession[s.client_id] || s.date > clientLastSession[s.client_id])) {
            clientLastSession[s.client_id] = s.date;
        }
    });

    return clients
        .filter(c => c.status === 'active' && clientLastSession[c.client_id])
        .map(c => ({ 
            ...c, 
            lastSessionDate: clientLastSession[c.client_id]
        }))
        .sort((a, b) => b.lastSessionDate.localeCompare(a.lastSessionDate))
        .slice(0, 6);
  }, [clients, sessions]);

  const StatCard = ({ title, value, icon: Icon, colorClass = "text-brand-orange" }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-border flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-brand-text-light mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-brand-text">{value}</h3>
      </div>
      <div className={`p-3 rounded-full bg-beige-soft ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard title={t.totalClients} value={stats.totalClients} icon={Users} />
        <StatCard title={t.activeClientsCount} value={stats.activeClients} icon={UserCheck} colorClass="text-green-600" />
        <StatCard title={t.totalHours} value={`${stats.totalHours} hrs`} icon={Clock} colorClass="text-purple-600" />
        <StatCard title={t.avgSessions} value={stats.avgSessions} icon={Activity} colorClass="text-blue-600" />
        <StatCard title={t.unfinishedNotes} value={`${stats.unfinishedPercentage}%`} icon={Percent} colorClass={stats.unfinishedPercentage > 20 ? "text-red-500" : "text-green-600"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-orange" />
                {t.recentActiveClients}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentActiveClients.length === 0 && <div className="md:col-span-2 text-center py-10 text-brand-text-light italic">No recent client activity.</div>}
                {recentActiveClients.map(client => (
                    <div key={client.client_id} onClick={() => onClientSelect(client)} className="bg-white p-5 rounded-xl border border-brand-border shadow-sm hover:shadow-md hover:border-brand-orange/30 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-3">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-beige-soft flex items-center justify-center text-brand-text font-bold border border-brand-border group-hover:bg-brand-orange group-hover:text-white transition-colors">{client.name.charAt(0).toUpperCase()}</div>
                                <div><h4 className="font-semibold text-brand-text group-hover:text-brand-orange transition-colors">{client.name}</h4><span className="text-xs text-brand-text-light">{client.client_id}</span></div>
                             </div>
                             <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${client.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{client.status}</span>
                        </div>
                        <div className="text-sm text-brand-text-light space-y-1 mb-4">
                             <div className="flex justify-between"><span>{t.diagnosis}:</span><span className="font-medium text-brand-text">{client.diagnoses[0] || '-'}</span></div>
                             <div className="flex justify-between"><span>Last Session:</span><span className="font-medium text-brand-text">{formatDate(client.lastSessionDate, lang)}</span></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-orange" />
                {t.upcomingSessions}
            </h3>
            <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
                {upcomingSessions.length > 0 ? (
                    <div className="divide-y divide-brand-border">
                        {upcomingSessions.map(session => {
                            const safeDate = getSafeDate(session.date);
                            return (
                                <div key={session.id} className="p-4 hover:bg-beige-soft/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-col flex items-center justify-center bg-brand-orange/10 text-brand-orange w-12 h-12 rounded-lg shrink-0">
                                            <span className="text-xs font-bold uppercase">{safeDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', timeZone: 'UTC' })}</span>
                                            <span className="text-lg font-bold leading-none">{safeDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { day: 'numeric', timeZone: 'UTC' })}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-brand-text text-sm">{session.clientName}</h4>
                                            <p className="text-xs text-brand-text-light mt-0.5 flex items-center gap-2">
                                                <span>{session.time}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="capitalize">{session.format}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span>{session.duration_min} min</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center text-brand-text-light">
                        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">{t.noUpcomingSessions}</p>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Unfinished Notes Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            {t.unfinishedNotesListTitle}
        </h3>
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
            {unfinishedNotes.length > 0 ? (
                <div className="divide-y divide-brand-border">
                    {unfinishedNotes.map(session => (
                        <div 
                            key={session.id} 
                            onClick={() => onSessionSelect(session)}
                            className="p-4 hover:bg-beige-soft/50 transition-colors cursor-pointer flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full bg-beige-soft flex items-center justify-center text-brand-text font-bold border border-brand-border group-hover:bg-brand-orange group-hover:text-white transition-colors shrink-0`}>
                                    {session.clientName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-text text-sm group-hover:text-brand-orange transition-colors">{session.clientName}</h4>
                                    <p className="text-xs text-brand-text-light mt-0.5">
                                        {t.date}: {formatDate(session.date, lang)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                               <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                   session.reason === 'Overdue' 
                                   ? 'bg-red-50 text-red-600' 
                                   : 'bg-blue-50 text-blue-600'
                               }`}>
                                   {session.reason === 'Overdue' ? t.overdue : t.pending_note}
                               </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-brand-text-light flex flex-col items-center">
                    <CheckCircle className="w-10 h-10 mb-3 text-green-400 opacity-50" />
                    <p className="text-sm">{t.noUnfinishedNotes}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
