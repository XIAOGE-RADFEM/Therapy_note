

import { Client, Session, Language } from './types';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

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

/**
 * Strips markdown syntax to create plain text suitable for PDF generation
 */
export const stripMarkdown = (markdown: string): string => {
    if (!markdown) return '';
    return markdown
        .replace(/^---\n[\s\S]*?\n---\n/, '') // Remove frontmatter
        .replace(/#+\s/g, '') // Headers
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
        .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
        .replace(/`{3}[\s\S]*?`{3}/g, '') // Code blocks
        .replace(/`([^`]+)`/g, '$1') // Inline code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[Image]') // Images
        .replace(/^\s*[-+*]\s/gm, '• ') // List items
        .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
        .trim();
}

/**
 * Conversion of Markdown to HTML for export, supporting nested lists.
 */
export const markdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    
    // Remove frontmatter
    let content = markdown.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
    
    // Basic escaping
    content = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const lines = content.split('\n');
    let output = '';
    let listStack: number[] = []; // Stack to track indentation levels

    const formatInline = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    };

    const closeList = (targetLevel: number) => {
         while (listStack.length > 0 && listStack[listStack.length - 1] > targetLevel) {
             output += '</ul>';
             listStack.pop();
         }
    };

    lines.forEach((line) => {
        // Match list item: optional whitespace, bullet char, space, content
        const listMatch = line.match(/^(\s*)([-*+])\s+(.*)/);

        if (listMatch) {
            const indentStr = listMatch[1];
            // Normalize tabs to 2 spaces to calculate depth
            const indent = indentStr.replace(/\t/g, '  ').length;
            const itemContent = listMatch[3];

            if (listStack.length === 0) {
                // Start a new list
                output += '<ul>';
                listStack.push(indent);
            } else {
                const currentIndent = listStack[listStack.length - 1];
                if (indent > currentIndent) {
                    // Nested list
                    output += '<ul>';
                    listStack.push(indent);
                } else if (indent < currentIndent) {
                    // Close nested lists
                    closeList(indent);
                    // If we closed lists but the current level is still not in stack (weird indentation),
                    // we usually just treat it as the current level.
                }
            }
            output += `<li>${formatInline(itemContent)}</li>`;
        } else {
            // Not a list item
            if (line.trim().length === 0) {
                // Ignore empty lines to prevent breaking lists unnecessarily 
                // (or handle paragraph breaks if desired, but keeping it simple for tight lists)
            } else {
                // Close all open lists
                closeList(-1);

                // Headers
                const hMatch = line.match(/^(#{1,6})\s+(.*)/);
                if (hMatch) {
                    const level = hMatch[1].length;
                    output += `<h${level}>${formatInline(hMatch[2])}</h${level}>`;
                } else {
                    // Paragraph
                    output += `<p>${formatInline(line)}</p>`;
                }
            }
        }
    });

    // Close any lists still open at the end
    closeList(-1);

    return output;
}


/**
 * Uses File System Access API if available, otherwise falls back to standard download
 */
export async function saveFileAs(
  blob: Blob, 
  filename: string, 
  types?: {description: string, accept: Record<string, string[]>}[]
) {
    try {
        // === 插入部分开始：检测是否是 Tauri 环境 ===
        // @ts-ignore
        const isTauri = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;

        if (isTauri) {
            // 1. 转换文件过滤器格式 (Web API 格式 -> Tauri API 格式)
            // Web: { accept: { 'text/html': ['.html'] } }
            // Tauri: { extensions: ['html'] } (注意 Tauri 不需要点)
            const tauriFilters = types ? types.map(t => ({
                name: t.description,
                extensions: Object.values(t.accept).flat().map(ext => ext.replace(/^\./, '')) 
            })) : undefined;

            // 2. 调用原生保存对话框
            const path = await save({
                defaultPath: filename,
                filters: tauriFilters
            });

            // 3. 如果用户取消，path 为 null
            if (!path) return;

            // 4. 写入文件
            const buffer = await blob.arrayBuffer();
            await writeFile(path, new Uint8Array(buffer));
            
            return; // Tauri 处理完毕，直接结束，不走后面的 Web 逻辑
        }
        // === 插入部分结束 ===

        // === 下面是你原来的代码 (保留作为 Web 端回退方案) ===
        if ('showSaveFilePicker' in window) {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: filename,
                types: types
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        }
    } catch (err: any) {
        if (err.name !== 'AbortError') {
            console.error('File Save Error:', err);
            // 在 Tauri 环境下也可以弹个窗提示错误
            alert('保存失败: ' + err.message);
        } else {
            return; // User cancelled
        }
    }
    
    // Fallback (传统下载方式)
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export const generateClientId = (existingClients: Client[], intakeDate: string): string => {
  // Format: YYYYMMDD-XX
  // Ensure we have a valid date string. Fallback to today if missing.
  const validDate = intakeDate && intakeDate.match(/^\d{4}-\d{2}-\d{2}$/) 
    ? intakeDate 
    : new Date().toISOString().split('T')[0];

  const dateStr = validDate.replace(/-/g, '');
  
  // Use a more robust check to find max sequence for that day
  const relevantClients = existingClients.filter(c => c.client_id.startsWith(dateStr));
  
  let maxSeq = 0;
  relevantClients.forEach(c => {
      const parts = c.client_id.split('-');
      if (parts.length === 2) {
          const seq = parseInt(parts[1], 10);
          if (!isNaN(seq) && seq > maxSeq) {
              maxSeq = seq;
          }
      }
  });

  const nextSeq = maxSeq + 1;
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

export const getSafeDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(); // Fallback to today if no string

  // Strict check for YYYY-MM-DD format.
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10); // 1-12
    const day = parseInt(match[3], 10);
    
    // Create a UTC date to avoid timezone issues.
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Check if the constructor created a valid date from the parts.
    if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
      return date;
    }
  }
  
  return new Date();
};

export const toLocalISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Tries to convert various date string formats to YYYY-MM-DD
 * Handles timezone issues by preferring local date components for non-standard inputs.
 */
export const normalizeDate = (dateStr: string, fallbackToToday = false): string => {
  if (!dateStr) return fallbackToToday ? new Date().toISOString().split('T')[0] : '';
  
  const cleanStr = dateStr.trim();
  if (!cleanStr) return fallbackToToday ? new Date().toISOString().split('T')[0] : '';
  
  // 1. Already in YYYY-MM-DD (Standard ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) return cleanStr;
  
  // 2. Handle YYYY/MM/DD or YYYY.MM.DD manually (Common in Excel/CSV)
  const slashMatch = cleanStr.match(/^(\d{4})[\/\.](\d{1,2})[\/\.](\d{1,2})/);
  if (slashMatch) {
      const y = slashMatch[1];
      const m = slashMatch[2].padStart(2, '0');
      const d = slashMatch[3].padStart(2, '0');
      return `${y}-${m}-${d}`;
  }
  
  // 3. Try parsing flexible formats (e.g. "Jan 1 2023", "1/1/2023")
  const timestamp = Date.parse(cleanStr);
  if (!isNaN(timestamp)) {
      // FIX: Do NOT use toISOString() here.
      // Date.parse("2023/1/1") usually parses as Local Midnight.
      // toISOString() converts Local Midnight to UTC, which subtracts the timezone offset.
      // E.g. China (UTC+8) -> -8h -> Previous Day.
      // We want to extract the components exactly as they were parsed locally.
      const d = new Date(timestamp);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  }

  console.warn(`Date parsing failed for input: "${dateStr}". Falling back to today: ${fallbackToToday}`);
  
  return fallbackToToday ? new Date().toISOString().split('T')[0] : '';
};

export const formatDate = (dateStr: string, lang: Language = 'en') => {
    if (!dateStr) return '';
    const date = getSafeDate(dateStr);
    return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
    }).format(date);
}

export const calculateAge = (dobString: string): number | null => {
  if (!dobString || !dobString.match(/^\d{4}-\d{2}-\d{2}$/)) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

/**
 * Robust CSV parser that handles quoted fields.
 * Auto-detects Comma, Semicolon, or Tab delimiter.
 * Removes BOM if present.
 */
export const parseCSV = (csv: string): any[] => {
  const content = csv.replace(/^\uFEFF/, ''); // Remove BOM
  if (!content) return [];

  // Simple, robust delimiter detection
  // Count the number of delimiters in the first line.
  const firstLine = content.split('\n')[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  // Determine delimiter based on max occurrences
  let delimiter = ',';
  if (semiCount > commaCount && semiCount > tabCount) delimiter = ';';
  if (tabCount > commaCount && tabCount > semiCount) delimiter = '\t';
  
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;
  
  // State machine parser
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i+1];
    
    if (inQuotes) {
        if (char === '"' && nextChar === '"') {
            // Escaped quote inside quoted string
            currentVal += '"';
            i++; // Skip next quote
        } else if (char === '"') {
            // End of quoted string
            inQuotes = false;
        } else {
            // Regular character inside quote
            currentVal += char;
        }
    } else {
        if (char === '"') {
            // Start of quoted string
            inQuotes = true;
        } else if (char === delimiter) {
            // Field separator
            currentRow.push(currentVal);
            currentVal = '';
        } else if (char === '\n' || char === '\r') {
             // Row separator
             // Push the last value of the row
             currentRow.push(currentVal);
             
             // Only push non-empty rows (avoids trailing empty lines)
             if (currentRow.length > 0 || currentVal !== '') {
                 rows.push(currentRow);
             }
             
             currentRow = [];
             currentVal = '';
             
             // Handle CRLF (\r\n) by skipping \n
             if (char === '\r' && nextChar === '\n') {
                 i++;
             }
        } else {
            // Regular character
            currentVal += char;
        }
    }
  }
  
  // Handle the very last row if no newline at EOF
  if (currentVal || currentRow.length > 0) {
      currentRow.push(currentVal);
      if (currentRow.length > 0) {
          rows.push(currentRow);
      }
  }

  if (rows.length < 2) return [];

  // Parse headers
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  // Map rows to objects
  return rows.slice(1).map(values => {
    const obj: any = {};
    
    headers.forEach((header, i) => {
      let val = values[i] ? values[i].trim() : '';
      
      // Flexible mapping
      if (header === 'name') obj.name = val;
      else if (['intakedate', 'intake_date', 'date', 'intake date'].includes(header)) obj.intake_date = val;
      else if (['sex', 'gender'].includes(header)) obj.sex = (['male', 'female', 'other'].includes(val.toLowerCase()) ? val.toLowerCase() : 'female');
      else if (['dob', 'date_of_birth', 'birthdate', 'date of birth'].includes(header)) obj.date_of_birth = val;
      else if (header === 'status') obj.status = (['active', 'paused', 'archived'].includes(val.toLowerCase()) ? val.toLowerCase() : 'active');
      else if (['referral', 'referral_source'].includes(header)) obj.referral_source = val;
      else if (['diagnoses', 'diagnosis'].includes(header)) obj.diagnoses = val ? val.split(';').map((s: string) => s.trim()).filter(Boolean) : [];
      else if (['tags', 'tag'].includes(header)) obj.tags = val ? val.split(';').map((s: string) => s.trim()).filter(Boolean) : [];
      else if (header === 'notes') obj.notes = val;
    });
    return obj;
  }).filter(obj => obj.name); // Filter out rows without a Name
};
