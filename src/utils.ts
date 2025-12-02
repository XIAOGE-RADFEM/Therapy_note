import { Client, Session, Language } from './types';

/**
 * Calculates word count based on the specific rule:
 * Chinese characters = 1 count
 * English words (separated by space) = 1 count
 * Ignores Markdown syntax and Frontmatter
 */
export const calculateWordCount = (text: string): number => {
  if (!text) return 0;

  // 1. Remove Frontmatter (YAML block between ---)
  let content = text.replace(/^---\n[\s\S]*?\n---\n/, '');

  // 2. Remove common Markdown syntax (headers, bold, lists, etc)
  // This is a simplified stripper.
  content = content
    .replace(/#+\s/g, '') // Headers
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
    .replace(/>\s/g, '') // Blockquotes
    .replace(/`{3}[\s\S]*?`{3}/g, '') // Code blocks
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/-\s\[[x ]\]/g, '') // Task lists
    .replace(/[-*+]\s/g, ''); // Lists

  // 3. Count Chinese Characters (CJK Unified Ideographs)
  const chineseMatches = content.match(/[\u4e00-\u9fa5]/g);
  const chineseCount = chineseMatches ? chineseMatches.length : 0;

  // 4. Remove Chinese characters to count English words
  const nonChineseContent = content.replace(/[\u4e00-\u9fa5]/g, ' ');

  // 5. Count English/Latin words
  const wordMatches = nonChineseContent.match(/\b[\w-]+\b/g);
  const englishCount = wordMatches ? wordMatches.length : 0;

  return chineseCount + englishCount;
};

export const generateClientId = (existingClients: Client[], intakeDate: string): string => {
  // Format: YYYYMMDD-XX
  const dateStr = intakeDate.replace(/-/g, '');
  const clientsToday = existingClients.filter(c => c.client_id.startsWith(dateStr));
  const nextSeq = clientsToday.length + 1;
  const seqStr = nextSeq.toString().padStart(2, '0');
  return `${dateStr}-${seqStr}`;
};

export const generateSessionId = (clientId: string, existingSessions: Session[]): string => {
  const clientSessions = existingSessions.filter(s => s.client_id === clientId);
  if (clientSessions.length === 0) {
    return `${clientId}-S01`;
  }
  const maxSeq = clientSessions.reduce((max, s) => {
    const match = s.session_id.match(/-S(\d+)$/);
    const seq = match ? parseInt(match[1], 10) : 0;
    return seq > max ? seq : max;
  }, 0);
  const nextSeq = maxSeq + 1;
  const seqStr = nextSeq.toString().padStart(2, '0');
  return `${clientId}-S${seqStr}`;
};


export const extractFrontmatter = (text: string): Record<string, any> | null => {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const yaml = match[1];
  const lines = yaml.split('\n');
  const result: Record<string, any> = {};
  lines.forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      // Simple parsing
      if (value.startsWith('[') && value.endsWith(']')) {
        result[key] = value.slice(1, -1).split(',').map(s => s.trim());
      } else {
        result[key] = value;
      }
    }
  });
  return result;
};

/**
 * Parses a YYYY-MM-DD string into a Date object set to UTC midnight.
 * This ensures day/month extraction doesn't shift due to local timezone.
 */
export const getSafeDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(dateStr);
  const [year, month, day] = parts.map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Formats a Date object to YYYY-MM-DD string based on local system time.
 * This prevents shifts to previous/next day when using toISOString() in non-UTC timezones.
 */
export const toLocalISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDate = (dateStr: string, lang: Language = 'en') => {
    if (!dateStr) return '';
    
    // Parse YYYY-MM-DD manually to avoid timezone shifts
    const date = getSafeDate(dateStr);
    
    return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC' // Treat the manually constructed UTC date as UTC for display
    }).format(date);
}