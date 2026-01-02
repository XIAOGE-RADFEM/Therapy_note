
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
import { CryptoService, base64ToUint8Array, uint8ArrayToBase64 } from './services/crypto';
import { ScheduleSessionModal } from './components/ScheduleSessionModal';
import { CalendarView } from './components/CalendarView';
import { ImportPasswordModal } from './components/ImportPasswordModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Toast } from './components/Toast';


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
  
  const [isImportPasswordModalOpen, setIsImportPasswordModalOpen] = useState(false);
  const [dataToImport, setDataToImport] = useState<any>(null);

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Clear Data Confirmation States
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isClearDoubleConfirmOpen, setIsClearDoubleConfirmOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const inactivityTimer = useRef<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

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
     const isNewClient = !editingClient; // Check if it's a new client

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

     // Automatically open schedule modal for new clients
     if (isNewClient) {
       // We use a timeout to ensure the UI transition feels natural after the modal closes
       setTimeout(() => {
         handleOpenSchedulingModal({ client: clientToSave, date: clientToSave.intake_date });
       }, 300);
     }
  };

  const handleBulkImportClients = async (newClients: Client[]) => {
      try {
        for (const c of newClients) {
            await db.saveClient(c);
        }
        setClients(prev => [...prev, ...newClients]);
        showToast(`Successfully imported ${newClients.length} clients`, 'success');
        
        // Switch to clients tab to show the new data
        setActiveTab('clients');
        // Optionally select the first new client
        if (newClients.length > 0) {
            setSelectedClientId(newClients[0].client_id);
        }
      } catch (e) {
        console.error("Bulk import failed:", e);
        throw new Error("Database save failed");
      }
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
    // Handle both single session object and array of sessions (for recurring)
    const sessionDataList = Array.isArray(data) ? data : [data];
    const newSessions: Session[] = [];

    // Use a temporary list to calculate IDs correctly if we are adding multiple
    const currentSessionsList = [...sessions];

    for (const sessionData of sessionDataList) {
        const clientId = sessionData.client_id || schedulingModalConfig.client?.client_id;
        if (!clientId) continue;

        const newSession: Session = {
          client_id: clientId,
          session_id: generateSessionId(clientId, currentSessionsList),
          date: sessionData.date,
          time: sessionData.time,
          duration_min: sessionData.duration_min,
          format: sessionData.format,
          setting: sessionData.setting,
          location: sessionData.location,
          status: 'scheduled',
          // Default empty values for a scheduled session
          diagnoses: [],
          tags: [],
          risk: 'low',
        };
        
        const newId = await db.saveSession(newSession);
        const sessionWithId = { ...newSession, id: newId };
        
        newSessions.push(sessionWithId);
        currentSessionsList.push(sessionWithId);
    }
    
    setSessions(currentSessionsList);
    setIsSchedulingModalOpen(false);
    showToast(newSessions.length > 1 ? `${newSessions.length} sessions scheduled` : 'Session scheduled', 'success');
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
        status: 'pending_note', // CHANGED: Set to 'pending_note' (Unwritten) instead of 'completed'
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
    
    const savedSession = await handleSaveSession(sessionToUpdate);
    
    // Open editor with the newly updated session
    setCurrentSession(savedSession);
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
      showToast(TRANSLATIONS[lang].importError, 'error');
      return;
    }
    setDataToImport(data);
    setIsImportPasswordModalOpen(true);
  };

  const handleConfirmImport = async (data: any, password: string) => {
    if (!data || !password) return;
    try {
      await db.importData(data);
      
      const saltB64 = data.meta.salt;
      const salt = base64ToUint8Array(saltB64);
      const newCryptoService = await CryptoService.create(password, salt);
      db.setCrypto(newCryptoService);

      await loadData();

      setDataToImport(null);
      setIsImportPasswordModalOpen(false);
      showToast('Import successful!', 'success');
      setActiveTab('clients');
      setSelectedClientId(null);
    } catch (e: any) {
      console.error(e);
      const reason = e instanceof Error ? e.message : 'Unknown error';
      showToast(`Import failed: ${reason}`, 'error');
      setDataToImport(null);
      setIsImportPasswordModalOpen(false);
    }
  };
  
  const handleChangePassword = async (currentPass: string, newPass: string) => {
    const saltB64 = localStorage.getItem('therapylog.salt');
    const keyCheck = localStorage.getItem('therapylog.keyCheck');
    if (!saltB64 || !keyCheck) throw new Error("Security data missing");

    const salt = base64ToUint8Array(saltB64);
    const isCorrect = await CryptoService.verifyPassword(currentPass, salt, keyCheck);
    if (!isCorrect) throw new Error(TRANSLATIONS[lang].verifyError);

    const newSalt = window.crypto.getRandomValues(new Uint8Array(16));
    const newCrypto = await CryptoService.create(newPass, newSalt);
    const newKeyCheck = await newCrypto.getKeyCheck();

    // Re-encrypt database in a single transaction
    await db.reEncryptAll(clients, sessions, newCrypto);

    // Update LocalStorage
    localStorage.setItem('therapylog.salt', uint8ArrayToBase64(newSalt));
    localStorage.setItem('therapylog.keyCheck', newKeyCheck);

    showToast(TRANSLATIONS[lang].passwordChanged, 'success');
  };

  // Step 1: User clicks "Clear Data" -> Opens First Confirmation
  const handleInitiateClearData = () => {
      setIsClearConfirmOpen(true);
  };

  // Step 2: User confirms first warning -> Opens Second (Final) Confirmation
  const handleProceedToFinalClear = () => {
      setIsClearConfirmOpen(false);
      setIsClearDoubleConfirmOpen(true);
  };

  // Step 3: User confirms second warning -> Executes Clear
  const handleExecuteClearData = async () => {
    // 1. Close modal immediately to give user feedback that action is accepted
    setIsClearDoubleConfirmOpen(false);
    
    // 2. Show loading state to prevent interaction
    setIsLoading(true);

    try {
        // 3. Clear IndexedDB
        await db.clearAllData();
        
        // 4. Clear LocalStorage (encryption keys)
        localStorage.clear();
        
        // 5. Reset App State completely (Simulate a fresh reload)
        setClients([]);
        setSessions([]);
        setSelectedClientId(null);
        setCurrentSession(null);
        setIsEditingSession(false);
        setActiveTab('dashboard');
        
        // 6. Set auth status to 'needs_setup' to trigger the setup screen
        setAuthStatus('needs_setup');
        
        showToast("Data cleared successfully. Please create a new password.", "success");
    } catch (e) {
        console.error("Error clearing data:", e);
        showToast("Failed to clear data. Please try again.", "error");
    } finally {
        setIsLoading(false); 
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
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
        {activeTab === 'dashboard' && <Dashboard clients={clients} sessions={sessions} lang={lang} onClientSelect={handleClientSelectFromDashboard} onSessionSelect={handleSessionClick} />}
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
            onBulkImport={handleBulkImportClients}
            showMessage={showToast}
            lang={lang}
          />
        )}
        {activeTab === 'calendar' && <CalendarView clients={clients} sessions={sessions} lang={lang} onSchedule={handleOpenSchedulingModal} />}
        {activeTab === 'settings' && (
          <Settings 
            lang={lang} 
            clients={clients} 
            sessions={sessions} 
            onInitiateImport={handleInitiateImport} 
            onClear={handleInitiateClearData} 
            onChangePassword={() => setIsChangePasswordModalOpen(true)}
            showMessage={showToast}
          />
        )}
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
      
      {/* Clear Data Confirmation Step 1 */}
      {isClearConfirmOpen && (
        <ConfirmModal
          isOpen={isClearConfirmOpen}
          onClose={() => setIsClearConfirmOpen(false)}
          onConfirm={handleProceedToFinalClear}
          title={TRANSLATIONS[lang].confirmClearTitle}
          message={TRANSLATIONS[lang].confirmClear}
          lang={lang}
        />
      )}

      {/* Clear Data Confirmation Step 2 (Final) */}
      {isClearDoubleConfirmOpen && (
        <ConfirmModal
          isOpen={isClearDoubleConfirmOpen}
          onClose={() => setIsClearDoubleConfirmOpen(false)}
          onConfirm={handleExecuteClearData}
          title={TRANSLATIONS[lang].finalConfirmation}
          message={TRANSLATIONS[lang].confirmClearDouble}
          lang={lang}
        />
      )}

      {isImportPasswordModalOpen && (
        <ImportPasswordModal
            isOpen={isImportPasswordModalOpen}
            onClose={() => setIsImportPasswordModalOpen(false)}
            onConfirm={handleConfirmImport}
            lang={lang}
            importData={dataToImport}
        />
      )}
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
           isOpen={isChangePasswordModalOpen}
           onClose={() => setIsChangePasswordModalOpen(false)}
           onConfirm={handleChangePassword}
           lang={lang}
        />
      )}
    </>
  );
};

export default App;
