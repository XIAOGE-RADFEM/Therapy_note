

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';
import { Session, Language, SessionFormat, SessionSetting, Attachment } from '../types';
import { calculateWordCount } from '../utils';
import { TRANSLATIONS } from '../constants';
import { Save, Calendar, Clock, AlertTriangle, Users, Monitor, MapPin, Tag, Paperclip, X, Download, ChevronLeft, Undo2, Redo2, CheckCircle, ZoomIn, ZoomOut, Settings2, Eye, Upload } from 'lucide-react';

interface SessionEditorProps {
  initialSession: Session;
  onSave: (session: Session) => void;
  onCancel: () => void;
  lang: Language;
}

// --- Helper Components ---

const getBodyFromContent = (fullContent?: string): string => {
    if (!fullContent) return '';
    return fullContent.replace(/^---\n[\s\S]*?\n---\n/, '');
};

const EditorToolbarButton = ({ onClick, title, children, isActive = false, disabled = false }: any) => (
  <button onClick={onClick} disabled={disabled} className={`p-1.5 rounded text-brand-text-light disabled:text-gray-300 disabled:cursor-not-allowed ${isActive ? 'bg-beige-soft text-brand-orange' : 'hover:bg-beige-soft'}`} title={title}>
      {children}
  </button>
);

// --- Metadata Modal Component ---

interface SessionMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: {
    date: string;
    time: string;
    duration: number;
    format: SessionFormat;
    setting: SessionSetting;
    risk: 'low' | 'medium' | 'high';
    location: string;
    tags: string;
    attachments: Attachment[];
  };
  lang: Language;
}

const SessionMetadataModal: React.FC<SessionMetadataModalProps> = ({ isOpen, onClose, onSave, initialData, lang }) => {
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState(initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update local state if initialData changes (e.g. reopening modal)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) { 
            alert(`${file.name}: ${t.maxSizeWarning}`);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const newAttachment: Attachment = { id: Date.now().toString() + Math.random(), name: file.name, type: file.type, size: file.size, data: reader.result as string };
            setFormData(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment] }));
        };
        reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteAttachment = (id: string) => {
      setFormData(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== id) }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        ...formData,
        duration: Number(formData.duration) || 0 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-brand-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-beige-soft/40 shrink-0">
          <h2 className="text-xl font-bold text-brand-text flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-brand-orange" />
            {t.sessionFormat} & {t.setting}
          </h2>
          <button onClick={onClose} className="text-brand-text-light hover:text-brand-text transition-colors p-1 rounded-full hover:bg-black/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
           <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> {t.date}</label><input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange outline-none" /></div>
              <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> {t.time}</label><input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange outline-none" /></div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
               <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> {t.duration}</label><input type="number" name="duration" value={formData.duration} onChange={handleChange} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange outline-none" /></div>
               <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> {t.riskLevel}</label><select name="risk" value={formData.risk} onChange={e => setFormData(prev => ({...prev, risk: e.target.value as any}))} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange outline-none"><option value="low">{t.low}</option><option value="medium">{t.medium}</option><option value="high">{t.high}</option></select></div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Users className="w-3 h-3 mr-1"/> {t.format}</label><select name="format" value={formData.format} onChange={e => setFormData(prev => ({...prev, format: e.target.value as any}))} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange outline-none"><option value="individual">{t.individual}</option><option value="couple">{t.couple}</option><option value="family">{t.family}</option><option value="group">{t.group}</option></select></div>
              <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Monitor className="w-3 h-3 mr-1"/> {t.setting}</label><select name="setting" value={formData.setting} onChange={e => setFormData(prev => ({...prev, setting: e.target.value as any}))} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange outline-none"><option value="in-person">{t.inPerson}</option><option value="online">{t.online}</option><option value="phone">{t.phone}</option></select></div>
           </div>

           <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1"/> {t.location}</label><input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange outline-none" /></div>
           <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Tag className="w-3 h-3 mr-1"/> {t.tags}</label><input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange outline-none" placeholder="Commas..." /></div>
           
           <div className="pt-4 border-t border-brand-border">
              <label className="text-xs font-medium text-brand-text-light flex items-center mb-2"><Paperclip className="w-3 h-3 mr-1"/> {t.attachments}</label>
              
              <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mb-3 ${
                      isDragging ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-300 hover:border-brand-orange hover:bg-beige-soft'
                  }`}
              >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-text-light">
                      <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-brand-text">{t.uploadFile}</p>
                  <p className="text-xs text-brand-text-light mt-1">{t.dragDrop}</p>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
              </div>

              <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                  {formData.attachments.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-brand-border group hover:border-brand-orange/30 transition-all shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                             {/* Thumbnail or Icon */}
                             {file.type.startsWith('image/') ? (
                                 <div 
                                    className="w-10 h-10 shrink-0 rounded-md border border-brand-border overflow-hidden bg-gray-50 cursor-pointer relative group/thumb"
                                    onClick={() => {
                                       const win = window.open();
                                       if(win) win.document.write(`<body style="margin:0;background:#1a1a1a;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${file.data}" style="max-width:100%;max-height:100%;object-fit:contain;"/></body>`);
                                    }}
                                 >
                                    <img src={file.data} alt={file.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/10 transition-colors" />
                                 </div>
                             ) : (
                                 <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-gray-50 rounded-md border border-brand-border text-brand-text-light">
                                    <Paperclip className="w-5 h-5" />
                                 </div>
                             )}
                             
                             <div className="flex flex-col min-w-0">
                                 <span className="text-sm text-brand-text font-medium truncate max-w-[180px]" title={file.name}>{file.name}</span>
                                 <span className="text-[10px] text-brand-text-light">{(file.size / 1024).toFixed(1)} KB</span>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                             <a 
                                href={file.data} 
                                download={file.name} 
                                className="p-1.5 text-brand-text-light hover:text-brand-orange hover:bg-beige-soft rounded-md transition-colors" 
                                title="Download"
                             >
                                <Download className="w-4 h-4" />
                             </a>
                             
                             {file.type.startsWith('image/') && (
                                 <button 
                                    type="button" 
                                    onClick={() => {
                                        const win = window.open();
                                        if(win) win.document.write(`<body style="margin:0;background:#1a1a1a;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${file.data}" style="max-width:100%;max-height:100%;object-fit:contain;"/></body>`);
                                    }} 
                                    className="p-1.5 text-brand-text-light hover:text-brand-orange hover:bg-beige-soft rounded-md transition-colors" 
                                    title="Preview"
                                 >
                                    <Eye className="w-4 h-4" />
                                 </button>
                             )}

                             <button type="button" onClick={() => deleteAttachment(file.id)} className="p-1.5 text-brand-text-light hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                      </div>
                  ))}
              </div>
           </div>
        </form>

        <div className="px-6 py-4 flex items-center justify-end space-x-3 border-t border-brand-border bg-beige-soft/40 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-beige-soft">{t.cancel}</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-brand-orange/90 shadow-sm">{t.save}</button>
        </div>
      </div>
    </div>
  );
};

// --- Main SessionEditor Component ---

const AUTOSAVE_DELAY = 2000; // 2 seconds

export const SessionEditor: React.FC<SessionEditorProps> = ({ initialSession, onSave, onCancel, lang }) => {
  const t = TRANSLATIONS[lang];
  const autosaveTimer = useRef<number | null>(null);

  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);

  // Buffer State for Metadata
  const [metadata, setMetadata] = useState({
    date: initialSession.date,
    time: initialSession.time || '',
    duration: initialSession.duration_min,
    format: initialSession.format,
    setting: initialSession.setting || 'in-person',
    risk: initialSession.risk,
    location: initialSession.location || '',
    tags: initialSession.tags.join(', '),
    attachments: initialSession.attachments || []
  });

  const [isChanged, setIsChanged] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Markdown.configure({ html: false, transformPastedText: true, transformCopiedText: true }),
      Placeholder.configure({ placeholder: 'Write your session notes here...' }),
    ],
    content: getBodyFromContent(initialSession.content),
    editorProps: {
      attributes: {
        class: 'prose prose-stone max-w-3xl mx-auto focus:outline-none prose-headings:text-brand-orange prose-headings:font-semibold prose-h2:border-b prose-h2:border-brand-border prose-h2:pb-2 prose-strong:text-brand-text prose-strong:font-bold prose-ul:marker:text-brand-orange/70 prose-ol:marker:text-brand-orange/70 prose-blockquote:border-l-4 prose-blockquote:border-brand-orange prose-blockquote:bg-beige-soft/50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:rounded-r-md prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700',
      },
    },
    onUpdate: ({ editor }) => {
      const markdownContent = (editor.storage as any).markdown.getMarkdown();
      setWordCount(calculateWordCount(markdownContent));
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      setSaveStatus('saving');
      autosaveTimer.current = window.setTimeout(() => {
        const sessionToSave = buildSessionObject(metadata);
        onSave(sessionToSave);
        setIsChanged(false);
        setTimeout(() => setSaveStatus('saved'), 500);
      }, AUTOSAVE_DELAY);
    },
  });

  // Track metadata changes to trigger save on exit
  useEffect(() => {
     setIsChanged(true);
  }, [metadata]);

  const buildSessionObject = useCallback((currentMeta: typeof metadata) => {
    const noteBody = (editor?.storage as any)?.markdown?.getMarkdown() || '';
    const currentWordCount = calculateWordCount(noteBody);
    const finalFrontmatter = `---
client_id: ${initialSession.client_id}
session_id: ${initialSession.session_id}
date: ${currentMeta.date}
time: ${currentMeta.time}
duration_min: ${currentMeta.duration}
format: ${currentMeta.format}
setting: ${currentMeta.setting}
location: ${currentMeta.location}
risk: ${currentMeta.risk}
tags: [${currentMeta.tags}]
diagnoses: [${initialSession.diagnoses.join(', ')}]
word_count: ${currentWordCount}
---`;

    const finalContent = finalFrontmatter + '\n' + noteBody;
    return {
      ...initialSession,
      content: finalContent,
      word_count: currentWordCount,
      date: currentMeta.date,
      time: currentMeta.time,
      duration_min: Number(currentMeta.duration) || 0,
      format: currentMeta.format,
      setting: currentMeta.setting,
      risk: currentMeta.risk,
      tags: currentMeta.tags.split(',').map(t => t.trim()).filter(Boolean),
      location: currentMeta.location,
      attachments: currentMeta.attachments,
    };
  }, [editor, initialSession]);

  const handleMetadataSave = (newMetadata: any) => {
      setMetadata(newMetadata);
      // Trigger an immediate save when metadata updates
      const sessionToSave = buildSessionObject(newMetadata);
      onSave(sessionToSave);
      setSaveStatus('saved');
  };

  const handleBackClick = () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    if (isChanged) {
        const sessionToSave = buildSessionObject(metadata);
        onSave(sessionToSave);
    }
    onCancel();
  };

  const handleManualSave = () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setSaveStatus('saving');
    const sessionToSave = buildSessionObject(metadata);
    onSave(sessionToSave);
    setIsChanged(false);
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => onCancel(), 700);
  };
  
  const handleMarkAsCompleted = () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    const session = buildSessionObject(metadata);
    // @ts-ignore
    const completedSession = { ...session, status: 'completed' as const };
    onSave(completedSession);
    setIsChanged(false);
    onCancel();
  };

  const SaveStatusIndicator = () => (
    <div className="text-xs font-mono text-brand-text-light flex items-center transition-opacity">
      {saveStatus === 'saving' && <><Save className="w-3 h-3 mr-2 animate-pulse" /> {t.saving}</>}
      {saveStatus === 'saved' && <><CheckCircle className="w-3 h-3 mr-2 text-green-600" /> {t.saved}</>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-beige flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-brand-border px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
         <div className="flex items-center space-x-2 md:space-x-4">
             <button onClick={handleBackClick} className="p-2 text-brand-text-light hover:text-brand-orange hover:bg-beige-soft rounded transition-colors" title={t.back}>
                <ChevronLeft className="w-5 h-5"/>
             </button>
             
             <button 
                onClick={() => setIsMetadataModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-beige-soft border border-brand-border rounded-lg text-sm text-brand-text hover:border-brand-orange transition-colors"
                title="Edit Session Details"
             >
                <Settings2 className="w-4 h-4 text-brand-orange"/>
                <span className="hidden sm:inline font-medium">Session Info</span>
             </button>

             {editor && (
             <div className="hidden sm:flex items-center space-x-1 ml-4 border-l border-brand-border pl-4">
                 <EditorToolbarButton onClick={() => (editor.chain().focus() as any).undo().run()} disabled={!(editor.can() as any).undo()} title={t.undo}><Undo2 className="w-4 h-4"/></EditorToolbarButton>
                 <EditorToolbarButton onClick={() => (editor.chain().focus() as any).redo().run()} disabled={!(editor.can() as any).redo()} title={t.redo}><Redo2 className="w-4 h-4"/></EditorToolbarButton>
                 <div className="w-px h-4 bg-brand-border mx-2"></div>
                 <EditorToolbarButton onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.7))} title={t.zoomOut}><ZoomOut className="w-4 h-4"/></EditorToolbarButton>
                 <div className="text-xs font-mono text-brand-text-light min-w-[3ch] text-center">{Math.round(zoomLevel * 100)}%</div>
                 <EditorToolbarButton onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2.0))} title={t.zoomIn}><ZoomIn className="w-4 h-4"/></EditorToolbarButton>
             </div>
             )}
         </div>
         
         <div className="flex items-center space-x-3">
             <SaveStatusIndicator />
             <div className="text-xs font-mono text-brand-text-light bg-beige-soft px-3 py-1 rounded-full hidden sm:block">
                 {wordCount} words
             </div>
             <button onClick={handleManualSave} className="flex items-center px-4 py-1.5 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-brand-orange/90 shadow-sm transition-colors">
                 <Save className="w-4 h-4 mr-2" /> {t.save}
             </button>
         </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 h-full bg-white overflow-y-auto custom-scrollbar relative">
          <div className="min-h-full p-4 md:p-8 pb-24 md:pb-8">
            <div style={{ zoom: zoomLevel }} className="min-h-[60vh]">
                <EditorContent editor={editor} />
            </div>

            {initialSession.status !== 'completed' && (
                <div className="mt-12 mb-4 w-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 opacity-90 hover:opacity-100 transition-opacity">
                    <p className="text-sm text-brand-text-light mb-3 font-medium">{t.finishedWriting}</p>
                    <button 
                        onClick={handleMarkAsCompleted}
                        className="group flex items-center justify-center w-12 h-12 rounded-full bg-white border border-brand-border shadow-sm hover:shadow-md hover:border-green-500 hover:scale-110 transition-all duration-300"
                        title={t.markAsCompleted}
                    >
                        <CheckCircle className="w-6 h-6 text-gray-300 group-hover:text-green-500 transition-colors" />
                    </button>
                </div>
            )}
        </div>
      </div>

      <SessionMetadataModal 
          isOpen={isMetadataModalOpen}
          onClose={() => setIsMetadataModalOpen(false)}
          onSave={handleMetadataSave}
          initialData={metadata}
          lang={lang}
      />
    </div>
  );
};
