

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Client, Session, Language, SessionStatus } from '../types';
import { TRANSLATIONS } from '../constants';
import { formatDate, saveFileAs, stripMarkdown, markdownToHtml, calculateAge, parseCSV, generateClientId, normalizeDate } from '../utils';
import { Plus, Search, ChevronRight, User, Edit2, Calendar, Globe, Trash2, Monitor, Clock, Paperclip, CheckCircle, XCircle, ChevronLeft, ArrowUpDown, FileCode, SlidersHorizontal, Check, FileEdit, FileUp, Upload, FileDown, X, Filter } from 'lucide-react';
import { BulkImportModal } from './BulkImportModal';

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
  onBulkImport: (clients: Client[]) => Promise<void>;
  showMessage: (msg: string, type: 'success' | 'error') => void;
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
  onBulkImport,
  showMessage,
  lang 
}) => {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  
  // Enhanced Filtering State - Default to 'active'
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('active');
  const [sexFilter, setSexFilter] = useState<'all' | 'male' | 'female' | 'other'>('all');
  const [referralFilter, setReferralFilter] = useState<string>('all');
  const [hoursFilter, setHoursFilter] = useState<'all' | '0-5' | '5-20' | '20-50' | '50+'>('all');
  
  // Enhanced Sorting State - Default to 'recent'
  const [sortOption, setSortOption] = useState<'name' | 'newest' | 'oldest' | 'recent' | 'age' | 'intake' | 'mostHours' | 'leastHours'>('recent');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false); 
  
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setIsSortOpen(false);
      if (importRef.current && !importRef.current.contains(event.target as Node)) setIsImportDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate unique referral sources for filtering
  const referralSources = useMemo(() => {
    const sources = new Set(clients.map(c => c.referral_source).filter(Boolean));
    return Array.from(sources);
  }, [clients]);

  // Calculate total hours for each client (completed sessions only)
  const clientHoursMap = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach(c => map[c.client_id] = 0);
    sessions.forEach(s => {
        if (s.status === 'completed') {
            // FIX: Ensure duration_min is treated as a number
            map[s.client_id] = (map[s.client_id] || 0) + (Number(s.duration_min) || 0) / 60;
        }
    });
    return map;
  }, [sessions, clients]);

  // Calculate the last completed session date for each client to use in sorting
  const lastSessionMap = useMemo(() => {
    const map: Record<string, string> = {};
    sessions.forEach(s => {
        if (s.status === 'completed') {
            const currentLast = map[s.client_id];
            if (!currentLast || s.date > currentLast) {
                map[s.client_id] = s.date;
            }
        }
    });
    return map;
  }, [sessions]);

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.client_id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSex = sexFilter === 'all' || c.sex === sexFilter;
    const matchesReferral = referralFilter === 'all' || c.referral_source === referralFilter;
    
    // Hour filtering
    let matchesHours = true;
    if (hoursFilter !== 'all') {
        const h = clientHoursMap[c.client_id] || 0;
        if (hoursFilter === '0-5') matchesHours = h >= 0 && h < 5;
        else if (hoursFilter === '5-20') matchesHours = h >= 5 && h < 20;
        else if (hoursFilter === '20-50') matchesHours = h >= 20 && h < 50;
        else if (hoursFilter === '50+') matchesHours = h >= 50;
    }

    return matchesSearch && matchesStatus && matchesSex && matchesReferral && matchesHours;
  }).sort((a, b) => {
      switch (sortOption) {
          case 'newest':
              return b.client_id.localeCompare(a.client_id);
          case 'oldest':
              return a.client_id.localeCompare(b.client_id);
          case 'recent':
              const dateA = lastSessionMap[a.client_id] || '';
              const dateB = lastSessionMap[b.client_id] || '';
              // If dates are equal (or both empty), fallback to name
              if (dateA === dateB) return a.name.localeCompare(b.name, lang === 'zh' ? 'zh-CN' : 'en-US');
              // Sort newest date first
              return dateB.localeCompare(dateA);
          case 'age':
              // Sort by age (youngest first -> DOB desc)
              return (b.date_of_birth || '').localeCompare(a.date_of_birth || '');
          case 'intake':
              return b.intake_date.localeCompare(a.intake_date);
          case 'mostHours':
              return (clientHoursMap[b.client_id] || 0) - (clientHoursMap[a.client_id] || 0);
          case 'leastHours':
              return (clientHoursMap[a.client_id] || 0) - (clientHoursMap[b.client_id] || 0);
          case 'name':
          default:
              return a.name.localeCompare(b.name, lang === 'zh' ? 'zh-CN' : 'en-US');
      }
  });

  const selectedClient = clients.find(c => c.client_id === selectedClientId);
  
  const clientSessions = useMemo(() => {
     return sessions.filter(s => s.client_id === selectedClientId).sort((a,b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`));
  }, [sessions, selectedClientId]);

  const totalTherapyHours = useMemo(() => {
      if (!clientSessions) return 0;
      // FIX: Explicitly cast duration_min to Number to prevent string concatenation bugs
      const totalMinutes = clientSessions
        .filter(s => s.status === 'completed')
        .reduce((acc, s) => acc + (Number(s.duration_min) || 0), 0);
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
  
  const handleExportHTML = async () => {
    if (!selectedClient) return;

    const completedSessions = clientSessions
        .filter(s => s.status === 'completed')
        .sort((a, b) => a.date.localeCompare(b.date));

    const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.clientDetails} - ${selectedClient.name}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; line-height: 1.6; color: #333; max-width: 800px; margin: 20px auto; padding: 20px; }
        h1, h2, h3 { color: #D95D39; }
        h1 { font-size: 2em; border-bottom: 2px solid #EAE5E1; padding-bottom: 10px; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #EAE5E1; padding-bottom: 5px; margin-top: 30px;}
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; background-color: #FBF9F6; padding: 15px; border-radius: 8px; border: 1px solid #EAE5E1; margin-bottom: 30px; }
        .meta-item { display: flex; justify-content: space-between; flex-wrap: wrap; }
        .meta-item strong { color: #6B6B6B; margin-right: 5px;}
        .session { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px dashed #ccc; }
        .session-header { background-color: #F5F1ED; padding: 8px 12px; border-radius: 5px; margin-bottom: 10px; font-weight: bold; }
        .session-content { padding-left: 10px; }
        .session-content h1, .session-content h2, .session-content h3 { margin-top: 15px; font-size: 1.2em; color: #4A4A4A; }
        p { margin-top: 0; }
        ul { padding-left: 20px; }
    </style>
</head>
<body>
    <h1>${selectedClient.name} (${selectedClient.client_id})</h1>
    <h2>${t.basicInfo} & ${t.clinicalInfo}</h2>
    <div class="meta-grid">
        <div class="meta-item"><strong>${t.intakeDate}:</strong> <span>${selectedClient.intake_date}</span></div>
        <div class="meta-item"><strong>${t.totalTherapyHours}:</strong> <span>${totalTherapyHours} hrs</span></div>
        <div class="meta-item"><strong>${t.status}:</strong> <span>${selectedClient.status}</span></div>
        <div class="meta-item"><strong>${t.age}:</strong> <span>${selectedClient.date_of_birth ? calculateAge(selectedClient.date_of_birth) : '-'}</span></div>
        <div class="meta-item"><strong>${t.sex}:</strong> <span>${selectedClient.sex === 'male' ? t.male : selectedClient.sex === 'female' ? t.female : t.other}</span></div>
        <div class="meta-item"><strong>${t.languagePreference}:</strong> <span>${selectedClient.lang_preference === 'en' ? 'English' : '中文'}</span></div>
        <div class="meta-item"><strong>${t.referral}:</strong> <span>${selectedClient.referral_source || '-'}</span></div>
        <div class="meta-item"><strong>${t.diagnosis}:</strong> <span>${selectedClient.diagnoses.join(', ') || '-'}</span></div>
        <div class="meta-item"><strong>${t.tags}:</strong> <span>${selectedClient.tags.join(', ') || '-'}</span></div>
    </div>

    <h2>${t.sessionHistory}</h2>
    ${completedSessions.map(session => `
        <div class="session">
            <div class="session-header">
                ${session.date} | ${t[session.format]} | ${session.duration_min} min
            </div>
            <div class="session-content">
                ${markdownToHtml(session.content || '')}
            </div>
        </div>
    `).join('') || `<p><em>No completed sessions found.</em></p>`}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    await saveFileAs(blob, `${selectedClient.client_id}_portfolio.html`, [{
         description: 'HTML Document',
         accept: { 'text/html': ['.html'] }
    }]);
  };

  const handleDownloadTemplate = () => {
    const headers = "Name,IntakeDate,Sex,DOB,Status,Referral,Diagnoses,Tags,Notes";
    const example1 = "John Smith,2023-10-01,male,1980-01-20,active,Website,F32 Depressive Disorder,adult;cbt,Client needs focus on sleep hygiene.";
    const example2 = "Jane Doe,2023-11-15,female,1995-06-12,active,Referral,F41 Anxiety Disorder,student;online,Referral from Dr. Lee.";
    const csvContent = `${headers}\n${example1}\n${example2}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveFileAs(blob, "therapylog_client_template.csv", [{ 
        description: 'CSV Template', 
        accept: { 'text/csv': ['.csv'] } 
    }]);
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

    const options: SessionStatus[] = ['scheduled', 'pending_note', 'completed', 'cancelled'];
    
    const statusMap = {
        scheduled: { text: t.scheduled, icon: Calendar, color: 'amber' },
        pending_note: { text: t.pending_note, icon: FileEdit, color: 'blue' },
        completed: { text: t.completed, icon: CheckCircle, color: 'green' },
        cancelled: { text: t.cancelled, icon: XCircle, color: 'gray' },
    };

    const currentStatus = statusMap[status] || statusMap.scheduled;

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
                <div className="absolute z-10 mt-1 w-32 bg-white shadow-lg border border-brand-border rounded-md py-1">
                    {options.map(option => (
                        <a
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="block px-3 py-1.5 text-xs text-brand-text hover:bg-beige-soft cursor-pointer"
                        >
                            {t[option as keyof typeof t] as string}
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
  }

  // --- Components for Filter UI ---

  const FilterChip: React.FC<{ label: string, isActive: boolean, onClick: () => void, count?: number }> = ({ label, isActive, onClick, count }) => (
     <button 
        onClick={onClick}
        className={`px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1.5 ${
            isActive 
            ? 'bg-brand-orange text-white border-brand-orange' 
            : 'bg-white text-brand-text-light border-brand-border hover:border-brand-orange/50 hover:bg-orange-50/50'
        }`}
     >
         {label}
         {count !== undefined && count > 0 && <span className={`text-[10px] px-1 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>}
     </button>
  );

  const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
      <div className="mb-4 last:mb-0">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
          <div className="flex flex-wrap gap-2">
              {children}
          </div>
      </div>
  );

  const hasExtraFilters = sexFilter !== 'all' || referralFilter !== 'all' || hoursFilter !== 'all';
  
  const clearAllFilters = () => {
      setStatusFilter('active'); // Reset to default active
      setSexFilter('all');
      setReferralFilter('all');
      setHoursFilter('all');
  };

  return (
    <div className="md:flex h-full md:gap-8 relative">
      
      {/* List Column - Removed overflow-x-hidden to fix clipping */}
      <div className={`w-full md:w-1/3 md:max-w-sm flex flex-col bg-white rounded-xl border border-brand-border shadow-sm shrink-0 transition-transform duration-300 ease-in-out z-20 ${selectedClientId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
        <div className="p-3 border-b border-brand-border space-y-2 bg-white rounded-t-xl z-30">
          {/* Top Row: Search & Actions */}
          <div className="flex items-center gap-2">
              <div className="relative w-full flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder={t.search} 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full h-10 pl-9 pr-4 py-2 text-sm bg-beige-soft border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 h-10">
                   {/* Compact Filter Button */}
                  <div className="relative h-full" ref={filterRef}>
                      <button 
                        onClick={() => setIsFilterOpen(prev => !prev)} 
                        className={`w-10 h-full flex items-center justify-center border rounded-lg transition-colors relative ${isFilterOpen || hasExtraFilters ? 'bg-orange-50 border-brand-orange text-brand-orange' : 'border-brand-border hover:bg-beige-soft text-brand-text-light'}`}
                        title={t.filter}
                      >
                          <Filter className="w-4 h-4"/>
                          {hasExtraFilters && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-orange rounded-full"></span>}
                      </button>
                      {isFilterOpen && (
                          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-brand-border z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                              <div className="flex justify-between items-center mb-4">
                                  <h3 className="font-semibold text-brand-text text-sm">More Filters</h3>
                                  {hasExtraFilters && <button onClick={clearAllFilters} className="text-xs text-brand-orange hover:underline">Reset</button>}
                              </div>
                              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                                  <FilterSection title={t.filterHours}>
                                    {['all', '0-5', '5-20', '20-50', '50+'].map(h => (<FilterChip key={h} label={h === 'all' ? 'All' : (t.hoursRange as any)[h] || h} isActive={hoursFilter === h} onClick={() => setHoursFilter(h as any)} />))}
                                  </FilterSection>
                                  <FilterSection title={t.filterSex}>
                                    {['all', 'female', 'male', 'other'].map(s => (<FilterChip key={s} label={(t as any)[s] || s} isActive={sexFilter === s} onClick={() => setSexFilter(s as any)} />))}
                                  </FilterSection>
                                  <FilterSection title={t.filterReferral}>
                                    <div className="w-full flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1 border border-brand-border/50 rounded-lg bg-gray-50/50">
                                      <FilterChip label="All" isActive={referralFilter === 'all'} onClick={() => setReferralFilter('all')} />
                                      {referralSources.map(s => (<FilterChip key={s} label={s} isActive={referralFilter === s} onClick={() => setReferralFilter(s)} />))}
                                    </div>
                                  </FilterSection>
                              </div>
                          </div>
                      )}
                  </div>
                  
                  {/* Sort Button */}
                  <div className="relative h-full" ref={sortRef}>
                      <button 
                        onClick={() => setIsSortOpen(prev => !prev)} 
                        className={`w-10 h-full flex items-center justify-center border rounded-lg transition-colors relative ${isSortOpen ? 'bg-orange-50 border-brand-orange text-brand-orange' : 'border-brand-border hover:bg-beige-soft text-brand-text-light'}`}
                        title={t.sortBy}
                      >
                          <ArrowUpDown className="w-4 h-4"/>
                      </button>
                      {isSortOpen && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-brand-border z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                             {[{id: 'name', label: t.sortName}, {id: 'newest', label: t.sortNewest}, {id: 'recent', label: t.sortRecentSession}].map(s => (<button key={s.id} onClick={() => {setSortOption(s.id as any); setIsSortOpen(false)}} className={`w-full text-left text-xs px-3 py-2 flex items-center justify-between hover:bg-beige-soft ${sortOption === s.id ? 'text-brand-orange font-medium bg-orange-50' : 'text-brand-text'}`}>{s.label} {sortOption === s.id && <Check className="w-3 h-3"/>}</button>))}
                             <div className="border-t border-brand-border my-1"></div>
                             {[{id: 'mostHours', label: t.sortMostHours},{id: 'leastHours', label: t.sortLeastHours}].map(s => (<button key={s.id} onClick={() => {setSortOption(s.id as any); setIsSortOpen(false)}} className={`w-full text-left text-xs px-3 py-2 flex items-center justify-between hover:bg-beige-soft ${sortOption === s.id ? 'text-brand-orange font-medium bg-orange-50' : 'text-brand-text'}`}>{s.label} {sortOption === s.id && <Check className="w-3 h-3"/>}</button>))}
                          </div>
                      )}
                  </div>
                  
                  {/* Import */}
                  <div className="relative h-full" ref={importRef}>
                     <button 
                        onClick={() => setIsImportDropdownOpen(prev => !prev)} 
                        className="w-10 h-full flex items-center justify-center border border-brand-border rounded-lg hover:bg-beige-soft transition-colors text-brand-text-light relative" 
                        title={t.importCSV}
                     >
                        <FileUp className="w-4 h-4" />
                     </button>
                     {isImportDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-brand-border z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-200">
                             <button onClick={() => {setIsBulkImportModalOpen(true); setIsImportDropdownOpen(false);}} className="w-full text-left text-xs px-3 py-2 rounded-lg flex items-center hover:bg-beige-soft text-brand-text transition-colors"><Upload className="w-3.5 h-3.5 mr-2 text-brand-orange" />{t.importCSV}</button>
                             <button onClick={() => {handleDownloadTemplate(); setIsImportDropdownOpen(false);}} className="w-full text-left text-xs px-3 py-2 rounded-lg flex items-center hover:bg-beige-soft text-brand-text transition-colors"><FileDown className="w-3.5 h-3.5 mr-2 text-brand-text-light" />{t.downloadTemplate}</button>
                        </div>
                     )}
                  </div>
              </div>
          </div>
            
          {/* Second Row: Status Tabs */}
          <div className="flex items-center justify-between">
              <div className="flex bg-beige-soft p-0.5 rounded-lg shrink-0">
                 <button onClick={() => setStatusFilter('active')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === 'active' ? 'bg-white text-brand-orange shadow-sm' : 'text-brand-text-light hover:text-brand-text'}`}>Active</button>
                 <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === 'all' ? 'bg-white text-brand-orange shadow-sm' : 'text-brand-text-light hover:text-brand-text'}`}>All</button>
                 <button onClick={() => setStatusFilter(statusFilter === 'archived' ? 'all' : 'archived')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === 'archived' ? 'bg-white text-brand-orange shadow-sm' : 'text-brand-text-light hover:text-brand-text'}`}>Archived</button>
              </div>
          </div>
          
          {/* Active Extra Filters Pills */}
          {hasExtraFilters && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                  {hoursFilter !== 'all' && (<button onClick={() => setHoursFilter('all')} className="flex items-center text-[10px] bg-orange-50 text-brand-orange px-2 py-0.5 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors">{(t.hoursRange as any)[hoursFilter] || hoursFilter} <X className="w-3 h-3 ml-1"/></button>)}
                  {sexFilter !== 'all' && (<button onClick={() => setSexFilter('all')} className="flex items-center text-[10px] bg-orange-50 text-brand-orange px-2 py-0.5 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors">{(t as any)[sexFilter] || sexFilter} <X className="w-3 h-3 ml-1"/></button>)}
                  {referralFilter !== 'all' && (<button onClick={() => setReferralFilter('all')} className="flex items-center text-[10px] bg-orange-50 text-brand-orange px-2 py-0.5 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors">{referralFilter} <X className="w-3 h-3 ml-1"/></button>)}
                  <button onClick={clearAllFilters} className="text-[10px] text-gray-400 hover:text-brand-orange hover:underline px-1">Clear</button>
              </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 bg-white rounded-b-xl z-0">
          {filteredClients.map(client => (
            <div key={client.client_id} onClick={() => onSelectClient(client.client_id)} className={`p-4 cursor-pointer border-b border-brand-border hover:bg-beige-soft/50 transition-colors ${selectedClientId === client.client_id ? 'bg-beige-soft' : ''}`}>
              <div className="flex justify-between items-start">
                <span className="font-bold text-brand-text">{client.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{client.status}</span>
              </div>
               <div className="flex justify-between items-center mt-1">
                 <p className="text-xs text-brand-text-light font-mono">{client.client_id}</p>
                 {(clientHoursMap[client.client_id] || 0) > 0 && (
                   <span className="text-[10px] text-brand-text-light bg-white border border-brand-border px-1.5 py-0.5 rounded">
                     {(clientHoursMap[client.client_id] || 0).toFixed(1)} hrs
                   </span>
                 )}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Column */}
      <div className={`absolute inset-0 md:relative w-full md:flex-1 bg-white rounded-xl border-brand-border md:border shadow-sm overflow-hidden flex flex-col transition-transform duration-300 ease-in-out ${selectedClientId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        {selectedClient ? (
          <>
            <div className="px-4 md:px-8 py-6 border-b border-brand-border bg-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                   <button onClick={() => onSelectClient(null)} className="md:hidden p-2 mr-2 -ml-2 text-brand-text-light hover:text-brand-orange hover:bg-beige-soft rounded-full transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                   </button>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-brand-text text-xl md:text-2xl font-bold shrink-0">{selectedClient.name.charAt(0).toUpperCase()}</div>
                  <div className="ml-3 md:ml-5">
                    <h1 className="text-xl md:text-2xl font-bold text-brand-text flex items-center gap-3">
                      {selectedClient.name}
                      <button onClick={() => onEditClient(selectedClient)} className="p-1.5 text-brand-text-light hover:text-brand-orange hover:bg-beige-soft rounded-full transition-colors" title={t.edit}><Edit2 className="w-4 h-4" /></button>
                      <button onClick={handleDeleteClientClick} className="p-1.5 text-brand-text-light hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title={t.delete}><Trash2 className="w-4 h-4" /></button>
                      <button onClick={handleExportHTML} className="p-1.5 text-brand-text-light hover:text-brand-orange hover:bg-beige-soft rounded-full transition-colors" title={t.exportHTML}><FileCode className="w-4 h-4" /></button>
                    </h1>
                     <span className="flex items-center font-mono text-sm text-brand-text-light mt-1">{selectedClient.client_id}</span>
                  </div>
                </div>
                {/* Updated New Session button to be visible on mobile (icon-only) and desktop */}
                <button onClick={() => onNewSession(selectedClient)} className="flex items-center px-3 py-2 md:px-5 md:py-2.5 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 shadow-sm transition-all ml-auto md:ml-0">
                    <Plus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">{t.newSession}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-beige-soft/50 rounded-lg p-4"><h4 className="text-xs font-semibold text-brand-text-light uppercase tracking-wider mb-3">{t.basicInfo}</h4><div className="space-y-2 text-sm">{[{ icon: Clock, label: t.totalTherapyHours, value: `${totalTherapyHours} hrs` }, { icon: User, label: t.age, value: selectedClient.date_of_birth ? calculateAge(selectedClient.date_of_birth) : '-' }, { icon: User, label: t.sex, value: selectedClient.sex === 'male' ? t.male : selectedClient.sex === 'female' ? t.female : t.other }, { icon: Calendar, label: t.intakeDate, value: selectedClient.intake_date }, { icon: Globe, label: t.languagePreference, value: selectedClient.lang_preference === 'en' ? 'English' : '中文' }, { icon: Monitor, label: t.referral, value: selectedClient.referral_source || '-' }].map(item => (<div className="flex justify-between items-center" key={item.label}><span className="text-brand-text-light flex items-center"><item.icon className="w-3.5 h-3.5 mr-2"/> {item.label}</span><span className="font-medium text-brand-text">{item.value}</span></div>))}</div></div>
                <div className="bg-beige-soft/50 rounded-lg p-4"><h4 className="text-xs font-semibold text-brand-text-light uppercase tracking-wider mb-3">{t.clinicalInfo}</h4><div className="space-y-3"><div><span className="text-xs text-brand-text-light mb-1 block">{t.diagnosis}</span><div className="flex flex-wrap gap-1.5">{selectedClient.diagnoses.length > 0 ? selectedClient.diagnoses.map(d => (<span key={d} className="px-2 py-0.5 bg-white text-red-700 text-xs font-medium rounded border border-brand-border">{d}</span>)) : <span className="text-sm text-brand-text-light">-</span>}</div></div><div><span className="text-xs text-brand-text-light mb-1 block">{t.tags}</span><div className="flex flex-wrap gap-1.5">{selectedClient.tags.length > 0 ? selectedClient.tags.map(tag => (<span key={tag} className="px-2 py-0.5 bg-white text-brand-text-light text-xs font-medium rounded border border-brand-border">{tag}</span>)) : <span className="text-sm text-brand-text-light">-</span>}</div></div></div></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6 custom-scrollbar pb-28 md:pb-6">
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
             {/* FAB for New Session on mobile (kept for redundancy/convenience) */}
             <div className="absolute bottom-6 right-6 md:hidden">
              <button onClick={() => onNewSession(selectedClient)} className="w-14 h-14 bg-brand-orange text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-orange/90 transition-all active:scale-95">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-brand-text-light">
             <User className="w-16 h-16 mb-4 opacity-20" />
             <p>{t.noSelection}</p>
          </div>
        )}
      </div>

      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onImport={onBulkImport}
        existingClients={clients}
        lang={lang}
      />
    </div>
  );
};
