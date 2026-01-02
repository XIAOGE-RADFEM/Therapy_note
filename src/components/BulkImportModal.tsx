
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, ClipboardPaste, AlertTriangle, FileUp, CheckCircle } from 'lucide-react';
import { Language, Client } from '../types';
import { TRANSLATIONS } from '../constants';
import { parseCSV, normalizeDate, generateClientId } from '../utils';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (clients: Client[]) => Promise<void>;
  existingClients: Client[];
  lang: Language;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onImport, existingClients, lang }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');
  const [inputText, setInputText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
        setInputText('');
        setParsedPreview([]);
        setValidationErrors([]);
        setActiveTab('paste');
    }
  }, [isOpen]);

  // Debounced parsing when text changes
  useEffect(() => {
    const timer = setTimeout(() => {
        if (inputText.trim()) {
            parseAndValidate(inputText);
        } else {
            setParsedPreview([]);
            setValidationErrors([]);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputText]);

  if (!isOpen) return null;

  const parseAndValidate = (text: string) => {
      const rawData = parseCSV(text);
      
      const validItems: any[] = [];
      const errors: string[] = [];
      
      if (rawData.length === 0) {
           // If there is text but no rows detected
           if(text.trim().length > 0) errors.push("No valid rows detected. Ensure headers are correct.");
      } else {
          rawData.forEach((item, index) => {
              if (!item.name) return; // Skip empty rows

              const rowNum = index + 1;
              let intakeDate = normalizeDate(item.intake_date, false);
              
              if (!intakeDate && item.intake_date) {
                  errors.push(`Row ${rowNum} (${item.name}): Invalid date "${item.intake_date}". Use YYYY-MM-DD.`);
              } else if (!intakeDate) {
                  // Fallback to today for display, but flag as a default? No, just allow it.
                  intakeDate = new Date().toISOString().split('T')[0];
              }

              // Check required fields logic if needed
              
              validItems.push({ ...item, intake_date: intakeDate });
          });
      }

      setParsedPreview(validItems);
      setValidationErrors(errors);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      setInputText(text); // Setting text triggers the effect to parse
      setActiveTab('paste'); // Switch to text view so user can see/edit
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = async () => {
      if (parsedPreview.length === 0 || validationErrors.length > 0) return;
      setIsProcessing(true);

      try {
          const clientsToImport: Client[] = [];
          // We need a temporary list to generate IDs sequentially without collision
          // Start with the existing clients
          let currentList = [...existingClients];

          for (const item of parsedPreview) {
              const dob = normalizeDate(item.date_of_birth, false);
              
              // Generate ID based on currentList state
              const newId = generateClientId(currentList, item.intake_date);
              
              const newClient: Client = {
                  client_id: newId,
                  intake_date: item.intake_date,
                  name: item.name,
                  sex: item.sex || 'female',
                  date_of_birth: dob,
                  status: item.status || 'active',
                  referral_source: item.referral_source || '',
                  diagnoses: item.diagnoses || [],
                  tags: item.tags || [],
                  lang_preference: lang,
                  notes: item.notes || ''
              };
              
              clientsToImport.push(newClient);
              currentList.push(newClient); // Add to temp list so next ID is unique
          }

          await onImport(clientsToImport);
          onClose();
      } catch (e) {
          console.error(e);
          alert('Import failed. See console.');
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-brand-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-beige-soft/40 shrink-0">
          <h2 className="text-xl font-bold text-brand-text flex items-center gap-3">
            <FileUp className="w-5 h-5 text-brand-orange" />
            {t.bulkImport}
          </h2>
          <button onClick={onClose} className="text-brand-text-light hover:text-brand-text transition-colors p-1 rounded-full hover:bg-black/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-border shrink-0">
            <button 
                onClick={() => setActiveTab('paste')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'paste' ? 'border-brand-orange text-brand-orange bg-orange-50/20' : 'border-transparent text-brand-text-light hover:bg-beige-soft'}`}
            >
                <span className="flex items-center justify-center gap-2"><ClipboardPaste className="w-4 h-4"/> {t.pasteData}</span>
            </button>
            <button 
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'upload' ? 'border-brand-orange text-brand-orange bg-orange-50/20' : 'border-transparent text-brand-text-light hover:bg-beige-soft'}`}
            >
                <span className="flex items-center justify-center gap-2"><Upload className="w-4 h-4"/> {t.uploadFile}</span>
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
            
            {activeTab === 'paste' && (
                <div className="flex-1 flex flex-col min-h-0">
                    <textarea 
                        className="flex-1 w-full p-4 border border-brand-border rounded-lg bg-beige-soft font-mono text-xs focus:ring-2 focus:ring-brand-orange focus:border-transparent resize-none"
                        placeholder={t.pastePlaceholder}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                </div>
            )}

            {activeTab === 'upload' && (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange hover:bg-beige-soft transition-colors"
                >
                    <Upload className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-sm text-brand-text font-medium">{t.dragDrop} (CSV)</p>
                    <input type="file" ref={fileInputRef} accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                </div>
            )}

            {/* Preview Section */}
            {(parsedPreview.length > 0 || validationErrors.length > 0) && (
                <div className="mt-6 border-t border-brand-border pt-4 h-48 shrink-0 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm text-brand-text flex items-center gap-2">
                            {validationErrors.length > 0 
                                ? <><AlertTriangle className="w-4 h-4 text-red-500" /> {t.errorsFound}</> 
                                : <><CheckCircle className="w-4 h-4 text-green-500" /> {t.preview} ({parsedPreview.length} {t.rowsFound})</>
                            }
                        </h4>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar border border-brand-border rounded-lg bg-white">
                        {validationErrors.length > 0 ? (
                            <div className="p-4 space-y-2">
                                {validationErrors.map((err, i) => (
                                    <div key={i} className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 flex items-start">
                                        <AlertTriangle className="w-3 h-3 mr-2 shrink-0 mt-0.5" />
                                        {err}
                                    </div>
                                ))}
                                <p className="text-xs text-brand-text-light mt-2 italic">{t.fixErrors}</p>
                            </div>
                        ) : (
                            <table className="w-full text-xs text-left">
                                <thead className="bg-beige-soft text-brand-text-light sticky top-0">
                                    <tr>
                                        <th className="p-2 font-medium">Name</th>
                                        <th className="p-2 font-medium">Intake</th>
                                        <th className="p-2 font-medium">Sex</th>
                                        <th className="p-2 font-medium">Diagnosis</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedPreview.map((item, i) => (
                                        <tr key={i} className="border-b border-brand-border last:border-0 hover:bg-beige-soft/30">
                                            <td className="p-2 font-semibold text-brand-text">{item.name}</td>
                                            <td className="p-2 text-brand-text-light">{item.intake_date}</td>
                                            <td className="p-2 text-brand-text-light capitalize">{item.sex}</td>
                                            <td className="p-2 text-brand-text-light truncate max-w-[150px]">{item.diagnoses?.join(', ')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end space-x-3 border-t border-brand-border bg-beige-soft/40 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-beige-soft transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isProcessing || parsedPreview.length === 0 || validationErrors.length > 0}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-brand-orange/90 shadow-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              {isProcessing && <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>}
              {t.importClientsBtn}
            </button>
        </div>
      </div>
    </div>
  );
};
