import React, { useMemo } from 'react';
import { Client, Session, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Clock, Users, FileText, Calendar } from 'lucide-react';
import { formatDate, getSafeDate, toLocalISOString } from '../utils';

interface DashboardProps {
  clients: Client[];
  sessions: Session[];
  lang: Language;
  onClientSelect: (client: Client) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ clients, sessions, lang, onClientSelect }) => {
  const t = TRANSLATIONS[lang];

  const stats = useMemo(() => {
    const activeClientsList = clients.filter(c => c.status === 'active');
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalMinutes = completedSessions.reduce((acc, s) => acc + s.duration_min, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return { 
        totalClients: activeClientsList.length, 
        totalSessions: completedSessions.length, 
        totalHours 
    };
  }, [clients, sessions]);

  const upcomingSessions = useMemo(() => {
    // String comparison for YYYY-MM-DD is safe and avoids timezone object construction pitfalls
    // Use toLocalISOString to ensure we compare against local system date correctly
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

  const activeClients = useMemo(() => {
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

  const StatCard = ({ title, value, icon: Icon }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-border flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-brand-text-light mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-brand-text">{value}</h3>
      </div>
      <div className="p-3 rounded-full bg-beige-soft text-brand-orange">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t.totalHours} value={stats.totalHours} icon={Clock} />
        <StatCard title={t.activeClients} value={stats.totalClients} icon={Users} />
        <StatCard title={t.totalSessions} value={stats.totalSessions} icon={FileText} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-orange" />
                {t.recentActiveClients}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeClients.map(client => (
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
    </div>
  );
};