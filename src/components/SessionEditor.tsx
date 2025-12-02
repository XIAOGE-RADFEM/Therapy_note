

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';
import { Session, Language, SessionFormat, SessionSetting, Attachment } from '../types';
import { calculateWordCount } from '../utils';
import { TRANSLATIONS } from '../constants';
import { Save, Calendar, Clock, AlertTriangle, Users, Monitor, MapPin, Tag, Paperclip, X, Download, ChevronLeft, Undo2, Redo2, CheckCircle } from 'lucide-react';

interface SessionEditorProps {
  initialSession: Session;
  onSave: (session: Session) => void;
  onCancel: () => void;
  lang: Language;
}

const getBodyFromContent = (fullContent?: string): string => {
    if (!fullContent) return '';
    return fullContent.replace(/^---\n[\s\S]*?\n---\n/, '');
};

const AUTOSAVE_DELAY = 2000; // 2 seconds

export const SessionEditor: React.FC<SessionEditorProps> = ({ initialSession, onSave, onCancel, lang }) => {
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autosaveTimer = useRef<number | null>(null);

  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Metadata State
  const [date, setDate] = useState(initialSession.date);
  const [duration, setDuration] = useState(initialSession.duration_min);
  const [format, setFormat] = useState<SessionFormat>(initialSession.format);
  const [setting, setSetting] = useState<SessionSetting>(initialSession.setting || 'in-person');
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>(initialSession.risk);
  const [tags, setTags] = useState(initialSession.tags.join(', '));
  const [location, setLocation] = useState(initialSession.location || '');
  const [attachments, setAttachments] = useState<Attachment[]>(initialSession.attachments || []);
  const [isChanged, setIsChanged] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
            levels: [1, 2, 3],
        }
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Placeholder.configure({
        placeholder: 'Write your session notes here...',
      }),
    ],
    content: getBodyFromContent(initialSession.content),
    editorProps: {
      attributes: {
        class: 'prose prose-stone max-w-none focus:outline-none font-sans text-base leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const markdownContent = editor.storage.markdown.getMarkdown();
      setWordCount(calculateWordCount(markdownContent));
      
      // Debounced autosave only on text change
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
      setSaveStatus('saving');
      autosaveTimer.current = window.setTimeout(() => {
        const sessionToSave = buildSessionObject();
        onSave(sessionToSave);
        setIsChanged(false); // Reset changed status after any save
        setTimeout(() => setSaveStatus('saved'), 500);
      }, AUTOSAVE_DELAY);
    },
  });
  
  // Handle external changes to the session
  useEffect(() => {
    if (editor && initialSession.session_id !== editor.getHTML()) {
        const newBody = getBodyFromContent(initialSession.content);
        const currentEditorBody = editor.storage.markdown.getMarkdown();
        if (newBody !== currentEditorBody) {
             editor.commands.setContent(newBody, false);
        }
    }
  }, [initialSession, editor]);

  const buildSessionObject = useCallback(() => {
    const noteBody = editor?.storage.markdown.getMarkdown() || '';
    const currentWordCount = calculateWordCount(noteBody);
    const finalFrontmatter = `---
client_id: ${initialSession.client_id}
session_id: ${initialSession.session_id}
date: ${date}
duration_min: ${duration}
format: ${format}
setting: ${setting}
location: ${location}
risk: ${risk}
tags: [${tags}]
diagnoses: [${initialSession.diagnoses.join(', ')}]
word_count: ${currentWordCount}
---`;

    const finalContent = finalFrontmatter + '\n' + noteBody;
    return {
      ...initialSession,
      content: finalContent,
      word_count: currentWordCount,
      date,
      duration_min: duration,
      format,
      setting,
      risk,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      location,
      attachments,
    };
  }, [editor, date, duration, format, setting, risk, tags, location, attachments, initialSession]);
  
  // This effect tracks if metadata has changed, to ensure a save happens on exit.
  useEffect(() => {
    setIsChanged(true);
  }, [date, duration, format, setting, risk, tags, location, attachments]);

  const handleBackClick = () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    // Perform a final save on exit to capture any metadata changes
    if (isChanged) {
        const sessionToSave = buildSessionObject();
        onSave(sessionToSave);
    }
    onCancel(); // Close editor
  };

  const handleManualSave = () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setSaveStatus('saving');
    const sessionToSave = buildSessionObject();
    onSave(sessionToSave);
    setIsChanged(false);
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => onCancel(), 700);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert(t.maxSizeWarning);
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const newAttachment: Attachment = { id: Date.now().toString(), name: file.name, type: file.type, size: file.size, data: reader.result as string };
        setAttachments(prev => [...prev, newAttachment]);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteAttachment = (id: string) => {
      setAttachments(prev => prev.filter(a => a.id !== id));
  };
  
  const SaveStatusIndicator = () => (
    <div className="text-xs font-mono text-brand-text-light flex items-center transition-opacity">
      {saveStatus === 'saving' && <><Save className="w-3 h-3 mr-2 animate-pulse" /> {t.saving}</>}
      {saveStatus === 'saved' && <><CheckCircle className="w-3 h-3 mr-2 text-green-600" /> {t.saved}</>}
    </div>
  );
  
  const EditorToolbarButton = ({ onClick, title, children, isActive = false, disabled = false }: any) => (
    <button onClick={onClick} disabled={disabled} className={`p-1.5 rounded text-brand-text-light disabled:text-gray-300 disabled:cursor-not-allowed ${isActive ? 'bg-beige-soft text-brand-orange' : 'hover:bg-beige-soft'}`} title={title}>
        {children}
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 bg-beige flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-brand-border px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
         <div className="flex items-center space-x-4">
             <button onClick={handleBackClick} className="p-2 text-brand-text-light hover:text-brand-orange hover:bg-beige-soft rounded transition-colors" title={t.back}>
                <ChevronLeft className="w-5 h-5"/>
             </button>
             <h2 className="text-lg font-bold text-brand-text hidden sm:block font-mono">{initialSession.session_id}</h2>
             
             {editor && (
             <div className="flex items-center space-x-1 ml-4 border-l border-brand-border pl-4">
                 <EditorToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title={t.undo}><Undo2 className="w-4 h-4"/></EditorToolbarButton>
                 <EditorToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title={t.redo}><Redo2 className="w-4 h-4"/></EditorToolbarButton>
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

      <div className="flex-1 flex overflow-hidden">
          <div className="w-80 bg-white border-r border-brand-border p-5 overflow-y-auto space-y-6 custom-scrollbar shrink-0">
              <div className="space-y-5 pt-2">
                  <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> {t.date}</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none" /></div>
                  <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> {t.duration}</label><input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none" /></div>
                  <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Users className="w-3 h-3 mr-1"/> {t.format}</label><select value={format} onChange={e => setFormat(e.target.value as SessionFormat)} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none"><option value="individual">{t.individual}</option><option value="couple">{t.couple}</option><option value="family">{t.family}</option><option value="group">{t.group}</option></select></div>
                  <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Monitor className="w-3 h-3 mr-1"/> {t.setting}</label><select value={setting} onChange={e => setSetting(e.target.value as SessionSetting)} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none"><option value="in-person">{t.inPerson}</option><option value="online">{t.online}</option><option value="phone">{t.phone}</option></select></div>
                  <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> {t.riskLevel}</label><select value={risk} onChange={e => setRisk(e.target.value as any)} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none"><option value="low">{t.low}</option><option value="medium">{t.medium}</option><option value="high">{t.high}</option></select></div>
                  <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1"/> {t.location}</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none" /></div>
                  <div><label className="block text-xs font-medium text-brand-text-light mb-1 flex items-center"><Tag className="w-3 h-3 mr-1"/> {t.tags}</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full text-sm p-2 border border-brand-border rounded bg-beige-soft focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none" placeholder="Commas..." /></div>
                  <div className="pt-4 border-t border-brand-border"><div className="flex items-center justify-between mb-2"><label className="text-xs font-medium text-brand-text-light flex items-center"><Paperclip className="w-3 h-3 mr-1"/> {t.attachments}</label><button onClick={() => fileInputRef.current?.click()} className="text-xs text-brand-orange hover:text-brand-orange/80 font-medium">+ {t.uploadFile}</button><input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} /></div><div className="space-y-2">{attachments.length === 0 && <span className="text-xs text-gray-400 italic">No files attached</span>}{attachments.map(file => (<div key={file.id} className="flex items-center justify-between p-2 bg-beige-soft rounded border border-brand-border group"><div className="flex items-center overflow-hidden"><span className="text-xs text-brand-text truncate max-w-[120px]" title={file.name}>{file.name}</span></div><div className="flex items-center space-x-1"><a href={file.data} download={file.name} className="p-1 text-gray-400 hover:text-brand-text" title={t.download}><Download className="w-3 h-3" /></a><button onClick={() => deleteAttachment(file.id)} className="p-1 text-gray-400 hover:text-red-500" title={t.delete}><X className="w-3 h-3" /></button></div></div>))}</div></div>
              </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto custom-scrollbar p-8">
            <EditorContent editor={editor} />
          </div>
      </div>
    </div>
  );
};