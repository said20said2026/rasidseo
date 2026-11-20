import { AuditorVoiceNote } from '../types/seo';

/**
 * Normalizes URL into a safe storage key
 */
export function getAuditorNotesStorageKey(url?: string): string {
  if (!url) return 'rasid_auditor_notes_default';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '').replace(/[^a-zA-Z0-9_-]/g, '_');
    return `rasid_auditor_notes_${host}`;
  } catch {
    const clean = url.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `rasid_auditor_notes_${clean.slice(0, 32)}`;
  }
}

/**
 * Loads all saved auditor voice notes for a specific audited URL
 */
export function loadAuditorNotes(url?: string): Record<string, AuditorVoiceNote> {
  const key = getAuditorNotesStorageKey(url);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load auditor notes:', err);
    return {};
  }
}

/**
 * Saves or updates a specific auditor voice note
 */
export function saveAuditorNote(url: string | undefined, note: AuditorVoiceNote): void {
  const key = getAuditorNotesStorageKey(url);
  try {
    const existing = loadAuditorNotes(url);
    existing[note.itemId] = note;
    localStorage.setItem(key, JSON.stringify(existing));
    
    // Broadcast event for live UI reactivity across components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('rasid-auditor-note-updated', {
          detail: { url, note }
        })
      );
    }
  } catch (err) {
    console.warn('Failed to save auditor note:', err);
  }
}

/**
 * Deletes a specific auditor voice note
 */
export function deleteAuditorNote(url: string | undefined, itemId: string): void {
  const key = getAuditorNotesStorageKey(url);
  try {
    const existing = loadAuditorNotes(url);
    if (existing[itemId]) {
      delete existing[itemId];
      localStorage.setItem(key, JSON.stringify(existing));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('rasid-auditor-note-updated', {
            detail: { url, itemId, deleted: true }
          })
        );
      }
    }
  } catch (err) {
    console.warn('Failed to delete auditor note:', err);
  }
}

/**
 * Checks if the browser natively supports Speech Recognition (Web Speech API)
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Retrieves the browser SpeechRecognition constructor
 */
export function getSpeechRecognitionConstructor(): any {
  if (typeof window === 'undefined') return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

/**
 * Formats duration in seconds to MM:SS string
 */
export function formatAudioDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Suggested auditor quick phrases in Arabic
 */
export const AUDITOR_QUICK_PHRASES: { label: string; text: string }[] = [
  {
    label: 'وسم العنوان H1',
    text: 'يرجى مراجعة ترويسة الصفحة ووضع وسم H1 واحد فقط في قمة المحتوى مع تضمين الكلمة المفتاحية المستهدفة.'
  },
  {
    label: 'وصف الميتا',
    text: 'كتابة وصف ميتا جذاب بين 140 إلى 155 حرفاً يلخص محتوى المقال ويحتوي على دعوة واضحة لاتخاذ إجراء.'
  },
  {
    label: 'النصوص البديلة Alt',
    text: 'فحص جميع الصور المرفقة والتأكد من إضافة نصوص بديلة (Alt Tags) تصف الصورة بدقة لتعزيز الفهرسة في صور جوجل.'
  },
  {
    label: 'الروابط المعطلة 404',
    text: 'الرابط الخارجي معطل، يرجى استبداله برابط حديث أو عمل إعادة توجيه 301 للصفحة البديلة.'
  },
  {
    label: 'سرعة التحميل LCP',
    text: 'تحويل الصور لصيغة WebP الحديثة وتأجيل تحميل نصوص الجافاسكريبت غير الضرورية لتحسين مقياس LCP.'
  },
  {
    label: 'بيانات Schema',
    text: 'إضافة كود Schema.org بصيغة JSON-LD مناسب لنوع المحتوى لتمكين المقتطفات المميزة والنتائج الغنية في بحث جوجل.'
  }
];
