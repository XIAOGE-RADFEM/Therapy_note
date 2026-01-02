
import React, { useRef, useState } from 'react';
import { Database, Download, Upload, Trash2, HardDrive, Lock, ShieldCheck, FileSpreadsheet, Plus, FileDown } from 'lucide-react';
import { Language, Client, Session } from '../types';
import { TRANSLATIONS } from '../constants';
import { db } from '../services/db';
import { saveFileAs, parseCSV, generateClientId } from '../utils';

interface SettingsProps {
  lang: Language;
  clients: Client[];
  sessions: Session[];
  onInitiateImport: (data: any) => void;
  onClear: () => void;
  onChangePassword: () => void;
  showMessage: (msg: string, type: 'success' | 'error') => void;
}

export const Settings: React.FC<SettingsProps> = ({ lang, clients, sessions, onInitiateImport, onClear, onChangePassword, showMessage }) => {
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clientsCount = clients.length;
  const sessionsCount = sessions.length;

  const handleExport = async () => {
    try {
      const data = await db.exportData(clients, sessions);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      await saveFileAs(blob, `therapylog-backup-${timestamp}.json`, [{ description: 'JSON Database Backup', accept: { 'application/json': ['.json'] } }]);
      showMessage('Export successful', 'success');
    } catch (e) {
      console.error('Export failed', e);
      showMessage('Failed to export data', 'error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      onInitiateImport(data);
    } catch (err) {
      showMessage('Failed to import data. Please check the file format.', 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-border">
         <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange"><HardDrive className="w-5 h-5" /></div><h2 className="text-xl font-bold text-brand-text">{t.dataStats}</h2></div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-beige-soft rounded-lg border border-brand-border flex justify-between items-center"><span className="text-brand-text-light">{t.activeClients}</span><span className="text-2xl font-bold text-brand-text">{clientsCount}</span></div>
            <div className="p-4 bg-beige-soft rounded-lg border border-brand-border flex justify-between items-center"><span className="text-brand-text-light">{t.totalSessions}</span><span className="text-2xl font-bold text-brand-text">{sessionsCount}</span></div>
         </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-border">
         <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-purple-50 rounded-lg text-purple-600"><ShieldCheck className="w-5 h-5" /></div><h2 className="text-xl font-bold text-brand-text">{t.security}</h2></div>
         <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between p-4 border border-brand-border rounded-lg hover:bg-beige-soft/30 transition-colors">
             <div className="w-full"><h3 className="font-semibold text-brand-text flex items-center gap-2"><Lock className="w-4 h-4 text-brand-text-light" />{t.changePassword}</h3><p className="text-sm text-brand-text-light mt-1 max-w-md">{t.changePasswordDesc}</p></div>
             <button onClick={onChangePassword} className="px-4 py-2 bg-white border border-brand-border text-brand-text text-sm font-medium rounded-lg hover:bg-beige-soft transition-colors shrink-0">{t.changePassword}</button>
          </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-border">
        <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Database className="w-5 h-5" /></div><h2 className="text-xl font-bold text-brand-text">{t.dataManagement}</h2></div>
        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between p-4 border border-brand-border rounded-lg hover:bg-beige-soft/30 transition-colors">
             <div className="w-full"><h3 className="font-semibold text-brand-text flex items-center gap-2"><Download className="w-4 h-4 text-brand-text-light" />{t.exportData}</h3><p className="text-sm text-brand-text-light mt-1 max-w-md">{t.exportDesc}</p></div>
             <button onClick={handleExport} className="px-4 py-2 bg-brand-text text-white text-sm font-medium rounded-lg hover:bg-brand-text/90 transition-colors shrink-0">Download JSON</button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between p-4 border border-brand-border rounded-lg hover:bg-beige-soft/30 transition-colors">
             <div className="w-full"><h3 className="font-semibold text-brand-text flex items-center gap-2"><Upload className="w-4 h-4 text-brand-text-light" />{t.importData}</h3><p className="text-sm text-brand-text-light mt-1 max-w-md">{t.importDesc}</p></div>
             <div className="shrink-0"><input type="file" ref={fileInputRef} accept=".json" onChange={handleFileChange} className="hidden" /><button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-brand-border text-brand-text text-sm font-medium rounded-lg hover:bg-beige-soft transition-colors">Select File</button></div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between p-4 border border-red-100 bg-red-50/30 rounded-lg">
             <div className="w-full"><h3 className="font-semibold text-red-700 flex items-center gap-2"><Trash2 className="w-4 h-4" />{t.clearData}</h3><p className="text-sm text-red-600/80 mt-1 max-w-md">{t.clearDesc}</p></div>
             <button onClick={onClear} className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shrink-0">{t.clearData}</button>
          </div>
        </div>
      </div>
    </div>
  );
};
