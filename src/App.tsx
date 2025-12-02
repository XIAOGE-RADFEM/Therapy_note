

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { ClientModal } from './components/ClientModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Settings } from './components/Settings';
import { Client, Session, Language, SessionStatus } from './types';
import { db } from './services/db';
import { generateClientId, generateSessionId } from './utils';
import { TRANSLATIONS } from './constants';
import { SessionEditor } from './components/SessionEditor';
import { TemplateSelectionModal } from './components/TemplateSelectionModal';
import { Auth } from './components/Auth';
import { CryptoService } from './services/crypto';
import { ScheduleSessionModal } from './components/ScheduleSessionModal';
import { CalendarView } from './components/CalendarView';


const App = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [isLoading, setIsLoading] = useState(true);
  
  // App State
  const [authStatus, setAuthStatus] = useState<'checking' | 'locked' | 'unlocked' | 'needs_setup'>('checking');
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Modals and Editor State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [clientToDeleteId, setClientToDeleteId] = useState<string | null>(null);
  const [isSessionConfirmModalOpen, setIsSessionConfirmModalOpen] = useState(false);
  const [sessionToDeleteId, setSessionToDeleteId] = useState<number | null>(null);
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [sessionToConvertToNote, setSessionToConvertToNote] = useState<Session | null>(null);

  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [schedulingModalConfig, setSchedulingModalConfig] = useState<{client?: Client, date?: string}>({});
  
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [importData, setImportData] = useState<any>(null);

  const inactivityTimer = useRef<number | null>(null);


  useEffect(() => {
    const salt = localStorage.getItem('therapylog.salt');
    const keyCheck = localStorage.getItem('therapylog.keyCheck');
    if (salt && keyCheck) {
      setAuthStatus('locked');
    } else {
      setAuthStatus('needs_setup');
    }
    setIsLoading(false);
  }, []);

  const handleLogout = useCallback(() => {
    setAuthStatus('locked');
    setClients([]);
    setSessions([]);
    setSelectedClientId(null);
    setCurrentSession(null);
    setIsEditingSession(false);
    // Any other state holding sensitive data should be cleared here
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = window.setTimeout(() => {
      handleLogout();
    }, 5 * 60 * 1000); // 5 minutes
  }, [handleLogout]);

  useEffect(() => {
    if (authStatus === 'unlocked') {
      const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll'];
      events.forEach(event => window.addEventListener(event, resetInactivityTimer));
      resetInactivityTimer(); // Start the timer on login

      return () => {
        events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      };
    }
  }, [authStatus, resetInactivityTimer]);

  const handleUnlock = async (crypto: CryptoService) => {
    setIsLoading(true);
    db.setCrypto(crypto);
    setAuthStatus('unlocked');
    await loadData();
    setIsLoading(false);
  };

  const loadData = async () => {
      try {
        await db.connect();
        const { clients: loadedClients, sessions: loadedSessions } = await db.loadAndDecryptAll();
        setClients(loadedClients);
        setSessions(loadedSessions);
      } catch (e) { console.error("DB Load Error", e); } 
  };

  const handleLangToggle = () => setLang(prev => prev === 'en' ? 'zh' : 'en');
  const handleSidebarToggle = () => setIsSidebarOpen(prev => !prev);
  const openNewClientModal = () => { setEditingClient(null); setIsClientModalOpen(true); };
  const openEditClientModal = (client: Client) => { setEditingClient(client); setIsClientModalOpen(true); };

  const handleClientSelectFromDashboard = (client: Client) => {
    setSelectedClientId(client.client_id);
    setActiveTab('clients');
  };

  const handleSaveClient = async (formData: any) => {
     let clientToSave: Client;
     if (editingClient) {
       clientToSave = { ...formData, client_id: editingClient.client_id };
       setClients(clients.map(c => c.client_id === clientToSave.client_id ? clientToSave : c));
     } else {
       const newId = generateClientId(clients, formData.intake_date);
       clientToSave = { ...formData, client_id: newId };
       setClients([...clients, clientToSave]);
     }
     await db.saveClient(clientToSave);
     setIsClientModalOpen(false);
     setEditingClient(null);
     setSelectedClientId(clientToSave.client_id);
     setActiveTab('clients');
  };

  const handleInitiateDelete = (clientId: string) => { setClientToDeleteId(clientId); setIsConfirmModalOpen(true); };
  const handleConfirmDelete = async () => {
      if (!clientToDeleteId) return;
      const clientSessions = sessions.filter(s => s.client_id === clientToDeleteId);
      for (const s of clientSessions) { if (s.id) { await db.deleteSession(s.id); } }
      await db.deleteClient(clientToDeleteId);
      
      setClients(prev => prev.filter(c => c.client_id !== clientToDeleteId));
      setSessions(prev => prev.filter(s => s.client_id !== clientToDeleteId));
      setClientToDeleteId(null);
      setIsConfirmModalOpen(false);
      if (selectedClientId === clientToDeleteId) {
          setSelectedClientId(null);
      }
  };

  const handleInitiateSessionDelete = (sessionId: number) => { setSessionToDeleteId(sessionId); setIsSessionConfirmModalOpen(true); }
  const handleConfirmSessionDelete = async () => {
    if (!sessionToDeleteId) return;
    await db.deleteSession(sessionToDeleteId);
    setSessions(prev => prev.filter(s => s.id !== sessionToDeleteId));
    setSessionToDeleteId(null);
    setIsSessionConfirmModalOpen(false);
  };
  
  const handleOpenSchedulingModal = (config: {client?: Client, date?: string}) => {
    setSchedulingModalConfig(config);
    setIsSchedulingModalOpen(true);
  };
  
  const handleSaveScheduledSession = async (data: any) => {
    const clientId = data.client_id || schedulingModalConfig.client?.client_id;
    if (!clientId) return;

    const newSession: Session = {
      client_id: clientId,
      session_id: generateSessionId(clientId, sessions),
      date: data.date,
      time: data.time,
      duration_min: data.duration_min,
      format: data.format,
      setting: data.setting,
      location: data.location,
      status: 'scheduled',
      // Default empty values for a scheduled session
      diagnoses: [],
      tags: [],
      risk: 'low',
    };
    
    const newId = await db.saveSession(newSession);
    setSessions([...sessions, { ...newSession, id: newId }]);
    setIsSchedulingModalOpen(false);
  };
  
  const handleSessionClick = (session: Session) => {
    if (session.status === 'scheduled') {
      setSessionToConvertToNote(session);
      setIsTemplateModalOpen(true);
    } else {
      setCurrentSession(session);
      setIsEditingSession(true);
    }
  };
  
  const handleTemplateSelectForSession = async (templateContent: string) => {
    if (!sessionToConvertToNote || !sessionToConvertToNote.id) return;
    
    const sessionToUpdate: Session = {
        ...sessionToConvertToNote,
        status: 'completed',
        content: `---
client_id: ${sessionToConvertToNote.client_id}
session_id: ${sessionToConvertToNote.session_id}
date: ${sessionToConvertToNote.date}
duration_min: ${sessionToConvertToNote.duration_min}
format: ${sessionToConvertToNote.format}
setting: ${sessionToConvertToNote.setting}
location: ${sessionToConvertToNote.location}
risk: ${sessionToConvertToNote.risk}
tags: []
diagnoses: []
word_count: 0
---
${templateContent}`
    };
    
    await handleSaveSession(sessionToUpdate); // This will save and update state
    
    // Open editor with the newly updated session
    setCurrentSession(sessionToUpdate);
    setIsEditingSession(true);
    
    // Close modal
    setIsTemplateModalOpen(false);
    setSessionToConvertToNote(null);
  }

  const handleSaveSession = async (session: Session) => {
    const isNew = !session.id;
    const savedId = await db.saveSession(session);
    let sessionWithId = { ...session, id: savedId };

    if (isNew) {
      setSessions([...sessions, sessionWithId]);
    } else {
      setSessions(sessions.map(s => s.id === savedId ? sessionWithId : s));
    }
    setCurrentSession(sessionWithId);
    return sessionWithId;
  };

  const handleUpdateSessionStatus = async (sessionId: number, status: SessionStatus) => {
    const sessionToUpdate = sessions.find(s => s.id === sessionId);
    if (sessionToUpdate) {
        const updatedSession = { ...sessionToUpdate, status };
        await handleSaveSession(updatedSession);
    }
  };

  const handleInitiateImport = async (data: any) => {
    const isValid = await db.verifyImportData(data);
    if (!isValid) {
      alert(TRANSLATIONS[lang].importError);
      return;
    }
    
    const currentKeyCheck = localStorage.getItem('therapylog.keyCheck');
    if(data.meta.keyCheck !== currentKeyCheck) {
      alert(TRANSLATIONS[lang].importError);
      return;
    }

    setImportData(data);
    setIsImportConfirmOpen(true);
  };

  const handleConfirmImport = async () => {
    if (!importData) return;
    try {
      await db.importData(importData);
      alert('Import successful! The application will now reload.');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('An error occurred during import.');
    }
    setImportData(null);
    setIsImportConfirmOpen(false);
  };
  
  const handleClearData = () => {
     if (window.confirm(TRANSLATIONS[lang].confirmClear)) {
        db.clearAllData().then(() => {
            localStorage.clear();
            window.location.reload();
        });
     }
  };


  if (isLoading || authStatus === 'checking') {
    return <div className="fixed inset-0 bg-beige flex items-center justify-center">Loading...</div>;
  }
  
  if (authStatus === 'locked' || authStatus === 'needs_setup') {
    return <Auth lang={lang} onUnlock={handleUnlock} needsSetup={authStatus === 'needs_setup'} />;
  }

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onNewClient={openNewClientModal}
        lang={lang}
        onLangToggle={handleLangToggle}
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={handleSidebarToggle}
        onLogout={handleLogout}
      >
        {activeTab === 'dashboard' && <Dashboard clients={clients} sessions={sessions} lang={lang} onClientSelect={handleClientSelectFromDashboard} />}
        {activeTab === 'clients' && (
          <ClientList 
            clients={clients} 
            sessions={sessions}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            onEditClient={openEditClientModal}
            onInitiateDelete={handleInitiateDelete}
            onInitiateSessionDelete={handleInitiateSessionDelete}
            onNewSession={(client) => handleOpenSchedulingModal({ client })}
            onSessionClick={handleSessionClick}
            onUpdateSessionStatus={handleUpdateSessionStatus}
            lang={lang}
          />
        )}
        {activeTab === 'calendar' && <CalendarView clients={clients} sessions={sessions} lang={lang} onSchedule={handleOpenSchedulingModal} />}
        {activeTab === 'settings' && <Settings lang={lang} clientsCount={clients.length} sessionsCount={sessions.length} onInitiateImport={handleInitiateImport} onClear={handleClearData} />}
      </Layout>

      {isClientModalOpen && (
        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onSave={handleSaveClient}
          lang={lang}
          client={editingClient}
        />
      )}
      
      {isSchedulingModalOpen && (
        <ScheduleSessionModal
           isOpen={isSchedulingModalOpen}
           onClose={() => setIsSchedulingModalOpen(false)}
           onSave={handleSaveScheduledSession}
           lang={lang}
           client={schedulingModalConfig.client}
           allClients={clients}
           defaultDate={schedulingModalConfig.date}
        />
      )}

      {currentSession && isEditingSession && (
        <SessionEditor 
          key={currentSession.session_id}
          initialSession={currentSession}
          onSave={handleSaveSession}
          onCancel={() => setIsEditingSession(false)}
          lang={lang}
        />
      )}

      {isTemplateModalOpen && (
        <TemplateSelectionModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            onSelect={handleTemplateSelectForSession}
            lang={lang}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title={TRANSLATIONS[lang].deleteClientTitle}
          message={TRANSLATIONS[lang].confirmDelete}
          lang={lang}
        />
      )}
       {isSessionConfirmModalOpen && (
        <ConfirmModal
          isOpen={isSessionConfirmModalOpen}
          onClose={() => setIsSessionConfirmModalOpen(false)}
          onConfirm={handleConfirmSessionDelete}
          title={TRANSLATIONS[lang].deleteSessionTitle}
          message={TRANSLATIONS[lang].confirmDeleteSession}
          lang={lang}
        />
      )}
      {isImportConfirmOpen && (
        <ConfirmModal
            isOpen={isImportConfirmOpen}
            onClose={() => setIsImportConfirmOpen(false)}
            onConfirm={handleConfirmImport}
            title={TRANSLATIONS[lang].confirmImportTitle}
            message={TRANSLATIONS[lang].confirmImport}
            lang={lang}
        />
      )}
    </>
  );
};

export default App;