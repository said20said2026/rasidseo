import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Save,
  Trash2,
  Edit3,
  Copy,
  Check,
  Sparkles,
  Volume2,
  AlertCircle,
  FileText,
  Clock,
  RotateCcw,
  Plus
} from 'lucide-react';
import { AuditItem, AuditorVoiceNote } from '../types/seo';
import {
  loadAuditorNotes,
  saveAuditorNote,
  deleteAuditorNote,
  isSpeechRecognitionSupported,
  getSpeechRecognitionConstructor,
  formatAudioDuration,
  AUDITOR_QUICK_PHRASES
} from '../utils/auditorVoiceNotes';

interface AuditorVoiceNoteSectionProps {
  item: AuditItem;
  currentUrl?: string;
  onNoteSaved?: (note: AuditorVoiceNote | null) => void;
  className?: string;
}

export const AuditorVoiceNoteSection: React.FC<AuditorVoiceNoteSectionProps> = ({
  item,
  currentUrl,
  onNoteSaved,
  className = ''
}) => {
  const [savedNote, setSavedNote] = useState<AuditorVoiceNote | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // References for Web Speech API and MediaRecorder
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const speechSupported = isSpeechRecognitionSupported();

  // Load existing note on mount and when item/URL changes
  useEffect(() => {
    const existingNotes = loadAuditorNotes(currentUrl);
    const currentNote = existingNotes[item.id] || null;
    setSavedNote(currentNote);
    if (currentNote) {
      setTranscribedText(currentNote.text);
      if (currentNote.audioUrl) {
        setAudioUrl(currentNote.audioUrl);
      }
    } else {
      setTranscribedText('');
      setAudioUrl(null);
      setIsEditing(false);
    }
  }, [item.id, currentUrl]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Handle Start Recording
  const startRecording = async () => {
    setErrorMessage(null);
    setInterimText('');
    audioChunksRef.current = [];

    // 1. Initialize MediaRecorder for actual audio recording (if browser allows)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
          }
          // Stop media tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start(200);
      }
    } catch (err: any) {
      console.warn('Microphone access for audio recording was not granted or failed:', err);
    }

    // 2. Initialize Web Speech API for Arabic Voice-to-Text
    const SpeechConstructor = getSpeechRecognitionConstructor();
    if (!SpeechConstructor) {
      setErrorMessage('متصفحك الحالي لا يدعم ميزة تحويل الصوت إلى نص (Speech-to-Text). يمكنك كتابة الملاحظة يدوياً في المربع أدناه.');
      setIsEditing(true);
      return;
    }

    try {
      const recognition = new SpeechConstructor();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA'; // Arabic (Saudi Arabia / standard)

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (finalChunk) {
          setTranscribedText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalChunk.trim()}` : finalChunk.trim();
          });
        }
        setInterimText(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('تم رفض إذن الوصول للميكروفون من قِبل المتصفح. يرجى السماح بالإذن في إعدادات المتصفح.');
          stopRecording();
        } else if (event.error === 'no-speech') {
          // keep listening
        } else {
          setErrorMessage(`تنبيه من المتعرف الصوتي: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If still flagged as recording, could auto-restart if desired
      };

      recognition.start();
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setErrorMessage('تعذر بدء الاستماع الصوتي. تأكد من تشغيل الميكروفون وتجربة متصفح يدعم Web Speech API.');
      setIsRecording(false);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    setInterimText('');
    setIsEditing(true);
  };

  // Cancel Recording
  const cancelRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setInterimText('');
    setRecordingSeconds(0);
  };

  // Save Note to localStorage
  const handleSaveNote = () => {
    if (!transcribedText.trim()) return;

    const newNote: AuditorVoiceNote = {
      itemId: item.id,
      text: transcribedText.trim(),
      audioUrl: audioUrl || undefined,
      durationSeconds: recordingSeconds > 0 ? recordingSeconds : savedNote?.durationSeconds,
      createdAt: new Date().toISOString(),
      isVoiceTranscribed: true
    };

    saveAuditorNote(currentUrl, newNote);
    setSavedNote(newNote);
    setIsEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);

    if (onNoteSaved) {
      onNoteSaved(newNote);
    }
  };

  // Delete Note
  const handleDeleteNote = () => {
    deleteAuditorNote(currentUrl, item.id);
    setSavedNote(null);
    setTranscribedText('');
    setAudioUrl(null);
    setIsEditing(false);
    setRecordingSeconds(0);

    if (onNoteSaved) {
      onNoteSaved(null);
    }
  };

  // Copy Note Text
  const handleCopyNote = () => {
    const textToCopy = savedNote?.text || transcribedText;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Play/Pause Recorded Audio
  const togglePlayAudio = () => {
    if (!audioElementRef.current || !audioUrl) return;
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Append quick phrase
  const handleInsertQuickPhrase = (phraseText: string) => {
    setTranscribedText((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n- ${phraseText}` : phraseText;
    });
    setIsEditing(true);
  };

  return (
    <div className={`mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>توجيهات وملاحظات المدقق الصوتي (Voice-to-Text)</span>
              {savedNote && (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                  ملاحظة محفوظة ✓
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              سجّل توجيهاتك الصوتية باللغة العربية وسيقوم المتصفح بتحويلها إلى نص وتضمينها في تقرير هذا الخطأ.
            </span>
          </div>
        </div>

        {/* Quick Trigger Button when no active recording or edit */}
        {!isRecording && !isEditing && !savedNote && (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-xs hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            title="بدء تسجيل ملاحظة صوتية باللغة العربية لهذا المعيار"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>تسجيل صوتي للمدقق</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* ACTIVE RECORDING PANEL */}
      {isRecording && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-indigo-500/10 dark:from-rose-950/30 dark:via-amber-950/20 dark:to-indigo-950/30 border-2 border-rose-500/60 dark:border-rose-600/60 shadow-lg shadow-rose-500/10 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
              </span>
              <span className="text-xs font-black text-rose-700 dark:text-rose-300">
                جارٍ الاستماع باللغة العربية وتحويل الصوت إلى نص...
              </span>
            </div>

            {/* Timer & Sound Wave Animation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-5 bg-rose-600 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              </div>
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400">
                {formatAudioDuration(recordingSeconds)}
              </span>
            </div>
          </div>

          {/* Real-time transcribed text stream preview */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 min-h-[50px] text-xs leading-relaxed">
            {transcribedText ? (
              <span className="text-slate-900 dark:text-slate-100 font-medium">
                {transcribedText}
              </span>
            ) : null}
            {interimText && (
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold italic mr-1">
                {interimText}...
              </span>
            )}
            {!transcribedText && !interimText && (
              <span className="text-slate-400 dark:text-slate-500 italic">
                تحدث بوضوح في الميكروفون... سيظهر النص العربي هنا مباشرة في الحال.
              </span>
            )}
          </div>

          {/* Action Buttons During Recording */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              إلغاء التسجيل
            </button>
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>إنهاء واعتماد النص المكتوب</span>
            </button>
          </div>
        </div>
      )}

      {/* EDITING / REVIEW PANEL (After recording or manual edit) */}
      {!isRecording && isEditing && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/60 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
              <span>مراجعة وتعديل نص الملاحظة الصوتية:</span>
            </div>
            {speechSupported && (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Mic className="w-3 h-3" />
                <span>إضافة تسجيل صوتي آخر</span>
              </button>
            )}
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              placeholder="اكتب أو راجع نص الملاحظة الصوتية المحولة هنا..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 font-medium transition-colors"
              dir="rtl"
            />
          </div>

          {/* Audio Player Preview (if audio was recorded) */}
          {audioUrl && (
            <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/40 text-xs">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                  التسجيل الصوتي الأصلي للمدقق
                </span>
                {recordingSeconds > 0 && (
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    ({formatAudioDuration(recordingSeconds)})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <audio
                  ref={audioElementRef}
                  src={audioUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>استماع للتسجيل</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quick Suggested SEO Templates */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
              💡 عبارات شائعة مقترحة للإدراج السريع:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AUDITOR_QUICK_PHRASES.slice(0, 4).map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertQuickPhrase(phrase.text)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  title={phrase.text}
                >
                  + {phrase.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save / Cancel Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (savedNote) {
                  setTranscribedText(savedNote.text);
                  setIsEditing(false);
                } else {
                  setIsEditing(false);
                  setTranscribedText('');
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              إلغاء التعديل
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={!transcribedText.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ الملاحظة لهذا المعيار</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVED NOTE CARD (When saved and not currently editing/recording) */}
      {!isRecording && !isEditing && savedNote && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/5 to-emerald-500/5 dark:from-emerald-950/40 dark:via-indigo-950/20 dark:to-emerald-950/20 border border-emerald-300/80 dark:border-emerald-800/80 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  ملاحظة وتوجيه المدقق الصوتي المخصصة
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  <span>
                    {new Date(savedNote.createdAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {savedNote.durationSeconds ? (
                    <span>• مدة التسجيل {formatAudioDuration(savedNote.durationSeconds)}</span>
                  ) : null}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopyNote}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="نسخ نص الملاحظة"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="تعديل نص الملاحظة"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDeleteNote}
                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:text-rose-400 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="حذف الملاحظة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Note Content */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line shadow-xs">
            {savedNote.text}
          </div>

          {/* Audio Player if URL available */}
          {savedNote.audioUrl && (
            <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  الملف الصوتي المسجل
                </span>
              </div>
              <div className="flex items-center gap-2">
                <audio
                  ref={audioElementRef}
                  src={savedNote.audioUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span>إيقاف</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>تشغيل التسجيل الصوتي</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {justSaved && (
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
              <Check className="w-3 h-3" />
              <span>تم حفظ توجيه المدقق الصوتي بنجاح لهذا المعيار!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
