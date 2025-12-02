export type Language = 'en' | 'zh';

export interface Client {
  client_id: string; // YYYYMMDD-XX
  intake_date: string;
  name: string;
  sex: 'female' | 'male' | 'other'; // Added sex field
  status: 'active' | 'archived' | 'paused';
  referral_source: string;
  diagnoses: string[];
  tags: string[];
  lang_preference: Language;
  notes: string;
}

export type SessionFormat = 'individual' | 'couple' | 'family' | 'group';
export type SessionSetting = 'in-person' | 'online' | 'phone';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 string
}

export interface Session {
  id?: number; // DB index
  client_id: string;
  session_id: string; // YYYYMMDD-XX-SXX
  date: string;
  time?: string; // e.g., "14:30" for scheduled sessions
  duration_min: number;
  format: SessionFormat;
  setting: SessionSetting; // New field for Online/Offline
  status: SessionStatus; // New field for scheduling
  location: string;
  diagnoses: string[];
  tags: string[];
  risk: 'low' | 'medium' | 'high';
  word_count?: number; // Optional for scheduled sessions
  content?: string; // Optional for scheduled sessions
  attachments?: Attachment[];
}

export interface StatSummary {
  totalClients: number;
  totalSessions: number;
  totalHours: number;
  totalWords: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface EncryptedData {
  id: string | number;
  payload: string;
}