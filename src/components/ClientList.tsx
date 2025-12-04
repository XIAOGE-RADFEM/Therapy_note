import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Client, Session, Language, SessionStatus } from '../types';
import { TRANSLATIONS } from '../constants';
import { formatDate } from '../utils';
import { Plus, Search, ChevronRight, User, Edit2, Calendar, Globe, Trash2, Monitor, Clock, Paperclip, CheckCircle, XCircle } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  sessions: Session[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string | null) => void;
  onEditClient: (client: Client) => void;
  onInitiateDelete: (clientId: string) => void;
  onInitiateSessionDelete: (sessionId: number) => void;
  onSessionClick: (session: Session) => void; 
  onNewSession: (client: Client) => void;
  onUpdateSessionStatus: (sessionId: number, status: SessionStatus) => void;
  lang: Language;
}

export const ClientList: React.FC<ClientListProps> = ({ 
  clients, 
  sessions, 
  selectedClientId,
  onSelectClient,
  onEditClient, 
  onInitiateDelete, 
  onInitiateSessionDelete, 
  onSessionClick, 
  onNewSession,
  onUpdateSessionStatus,
  lang 
}) => {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');
  const [sexFilter, setSexFilter] = useState<'all' | 'male' | 'female' | 'other'>('all');

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.client_id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSex = sexFilter === 'all' || c.sex === sexFilter;
    return matchesSearch && matchesStatus && matchesSex;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const selectedClient = clients.find(c => c.client_id === selectedClientId);
  
  const clientSessions = useMemo(() => {
     return sessions.filter(s => s.client_id === selectedClientId).sort((a,b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`));
  }, [sessions, selectedClientId]);

  const totalTherapyHours = useMemo(() => {
      if (!clientSessions) return 0;
      const totalMinutes = clientSessions
        .filter(s => s.status === 'completed')
        .reduce((acc, s) => acc + s.duration_min, 0);
      return (totalMinutes / 60).toFixed(1);
  }, [clientSessions]);
  
  const handleDeleteClientClick = () => {
    if (selectedClient) {
      onInitiateDelete(selectedClient.client_id);
    }
  };

  const handleDeleteSessionClick = (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    onInitiateSessionDelete(sessionId);
  };
  
  React.useEffect(() => {
    if (selectedClientId && !clients.find(c => c.client_id === selectedClientId)) {
      onSelectClient(null);
    }
  }, [clients, selectedClientId, onSelectClient]);

  const SessionStatusBadge = ({ session }: { session: Session }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { id, status } = session;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    if (!id || !status) return null;

    const options: SessionStatus[] = ['scheduled', 'completed', 'cancelled'];
    
    const statusMap = {
        scheduled: { text: t.scheduled, icon: Calendar, color: 'amber' },
        completed: { text: t.completed, icon: CheckCircle, color: 'green' },
        cancelled: { text: t.cancelled, icon: XCircle, color: 'gray' },
    };

    const currentStatus = statusMap[status];

    if (!currentStatus) return null;

    const handleSelect = (newStatus: SessionStatus) => {
        onUpdateSessionStatus(id, newStatus);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 cursor-pointer transition-colors
                bg-${currentStatus.color}-50 text-${currentStatus.color}-700 border-${currentStatus.color}-200
                hover:bg-${currentStatus.color}-100`}
            >
                <currentStatus.icon className="w-2.5 h-2.5" />
                {currentStatus.text}
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-28 bg-white shadow-lg border border-brand-border rounded-md py-1">
                    {options.map(option => (
                        <a
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="block px-3 py-1 text-xs text-brand-text hover:bg-beige-soft cursor-pointer"
                        >
                            {t[option as keyof typeof t] as string}
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
  }

  return (
    <div className="flex h-full gap-8">
      {/* List Column */}
      <div className="w-1/3 max-w-sm flex flex-col bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brand-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-beige-soft border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"/>
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-1/2 text-xs p-1.5 border border-brand-border rounded-md bg-white text-brand-text-light"><option value="all">{t.status}: All</option><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option></select>
            <select value={sexFilter} onChange={(e) => setSexFilter(e.target.value as any)} className="w-1/2 text-xs p-1.5 border border-brand-border rounded-md bg-white text-brand-text-light"><option value="all">{t.sex}: All</option><option value="female">{t.female}</option><option value="male">{t.male}</option><option value="other">{t.other}</option></select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredClients.map(client => (
            <div key={client.client_id} onClick={() => onSelectClient(client.client_id)} className={`p-4 cursor-pointer border-b border-brand-border hover:bg-beige-soft/50 transition-colors ${selectedClientId === client.client_id ? 'bg-beige-soft' : ''}`}>
              <div className="flex justify-between items-start">
                <span className="font-bold text-brand-text">{client.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{client.status}</span>
              </div>
               <p className="text-xs text-brand-text-light font-mono mt-1">{client.client_id}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Details Column */}
      <div className="flex-1 bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden flex flex-col">
        {selectedClient ? (
          <>
            <div className="px-8 py-6 border-b border-brand-border bg-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-brand-text text-2xl font-bold">{selectedClient.name.charAt(0).toUpperCase()}</div>
                  <div className="ml-5">
                    <h1 className="text-2xl font-bold text-brand-text flex items-center gap-3">
                      {selectedClient.name}
                      <button onClick={() => onEditClient(selectedClient)} className="p-1.5 text-brand-text-light hover:text-brand-orange hover:bg-beige-soft rounded-full transition-colors" title={t.edit}><Edit2 className="w-4 h-4" /></button>
                      <button onClick={handleDeleteClientClick} className="p-1.5 text-brand-text-light hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title={t.delete}><Trash2 className="w-4 h-4" /></button>
                    </h1>
                     <span className="flex items-center font-mono text-sm text-brand-text-light mt-1">{selectedClient.client_id}</span>
                  </div>
                </div>
                <button onClick={() => onNewSession(selectedClient)} className="flex items-center px-5 py-2.5 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 shadow-sm transition-all"><Plus className="w-4 h-4 mr-2" />{t.newSession}</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-beige-soft/50 rounded-lg p-4"><h4 className="text-xs font-semibold text-brand-text-light uppercase tracking-wider mb-3">{t.basicInfo}</h4><div className="space-y-2 text-sm">{[{ icon: Clock, label: t.totalTherapyHours, value: `${totalTherapyHours} hrs` }, { icon: User, label: t.sex, value: selectedClient.sex === 'male' ? t.male : selectedClient.sex === 'female' ? t.female : t.other }, { icon: Calendar, label: t.intakeDate, value: selectedClient.intake_date }, { icon: Globe, label: t.languagePreference, value: selectedClient.lang_preference === 'en' ? 'English' : '中文' }, { icon: Monitor, label: t.referral, value: selectedClient.referral_source || '-' }].map(item => (<div className="flex justify-between items-center" key={item.label}><span className="text-brand-text-light flex items-center"><item.icon className="w-3.5 h-3.5 mr-2"/> {item.label}</span><span className="font-medium text-brand-text">{item.value}</span></div>))}</div></div>
                <div className="bg-beige-soft/50 rounded-lg p-4"><h4 className="text-xs font-semibold text-brand-text-light uppercase tracking-wider mb-3">{t.clinicalInfo}</h4><div className="space-y-3"><div><span className="text-xs text-brand-text-light mb-1 block">{t.diagnosis}</span><div className="flex flex-wrap gap-1.5">{selectedClient.diagnoses.length > 0 ? selectedClient.diagnoses.map(d => (<span key={d} className="px-2 py-0.5 bg-white text-red-700 text-xs font-medium rounded border border-brand-border">{d}</span>)) : <span className="text-sm text-brand-text-light">-</span>}</div></div><div><span className="text-xs text-brand-text-light mb-1 block">{t.tags}</span><div className="flex flex-wrap gap-1.5">{selectedClient.tags.length > 0 ? selectedClient.tags.map(tag => (<span key={tag} className="px-2 py-0.5 bg-white text-brand-text-light text-xs font-medium rounded border border-brand-border">{tag}</span>)) : <span className="text-sm text-brand-text-light">-</span>}</div></div></div></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white p-6 custom-scrollbar">
              <h3 className="text-lg font-bold text-brand-text mb-4">{t.sessionHistory}</h3>
              <div className="space-y-3">{clientSessions.length === 0 && (<div className="text-center py-10 text-brand-text-light italic">No sessions recorded yet.</div>)}{clientSessions.map(session => (
                  <div 
                    key={session.session_id} 
                    onClick={() => session.status !== 'cancelled' && onSessionClick(session)} 
                    className={`p-4 rounded-lg border border-brand-border transition-all group flex justify-between items-center
                      ${session.status === 'cancelled'
                        ? 'bg-gray-50 cursor-not-allowed'
                        : 'bg-beige-soft/50 hover:border-brand-orange/50 hover:shadow-sm cursor-pointer'
                      }`}
                  >
                    <div className={`${session.status === 'cancelled' ? 'opacity-50' : ''}`}>
                      <p className="text-brand-text font-semibold flex items-center gap-3">
                        <span>{formatDate(session.date, lang)} {session.time && ` @ ${session.time}`}</span>
                        <SessionStatusBadge session={session} />
                        {session.attachments && session.attachments.length > 0 && (<Paperclip className="w-3 h-3 text-brand-text-light" />)}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-brand-text-light mt-2">
                         <span className="bg-white px-2 py-0.5 rounded border border-brand-border capitalize">{session.format}</span>
                         <span>{session.duration_min} min</span>
                         {session.status === 'completed' && <span>{session.word_count} words</span>}
                         <span className="font-mono text-gray-400">{session.session_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {session.id && session.status !== 'cancelled' && <button onClick={(e) => handleDeleteSessionClick(e, session.id as number)} className="p-2 text-brand-text-light rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all" title={t.delete}><Trash2 className="w-4 h-4" /></button>}
                        {session.status !== 'cancelled' && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-orange transition-colors" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-brand-text-light">
             <User className="w-16 h-16 mb-4 opacity-20" />
             <p>{t.noSelection}</p>
          </div>
        )}
      </div>
    </div>
  );
};