import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  AlertOctagon,
  X,
  ChevronLeft,
  Copy,
  Check,
  Flame,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldX
} from 'lucide-react';
import { CriticalAnalysisResult } from '../utils/criticalErrorsDetector';
import { AuditItem } from '../types/seo';

interface CriticalAuditToastProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: CriticalAnalysisResult | null;
  siteUrl: string;
  onJumpToItem: (itemId: string) => void;
}

export const CriticalAuditToast: React.FC<CriticalAuditToastProps> = ({
  isOpen,
  onClose,
  analysis,
  siteUrl,
  onJumpToItem
}) => {
  const [copied, setCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationMs = 14000; // 14 seconds auto-dismiss
  const intervalMs = 100;

  // Play subtle chime when toast opens (if not muted)
  useEffect(() => {
    if (!isOpen || !analysis?.hasCriticalErrors || isMuted) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;

        // Tone 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(580, now);
        gain1.gain.setValueAtTime(0.08, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.25);

        // Tone 2 (higher urgent chime)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(840, now + 0.12);
        gain2.gain.setValueAtTime(0.07, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.4);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [isOpen, analysis, isMuted]);

  // Progress countdown timer with pause-on-hover
  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
      return;
    }

    const step = (intervalMs / durationMs) * 100;
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(timerRef.current!);
            onClose();
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused, onClose]);

  if (!isOpen || !analysis || !analysis.hasCriticalErrors) {
    return null;
  }

  let domain = siteUrl;
  try {
    domain = new URL(siteUrl).hostname;
  } catch {
    domain = siteUrl.replace(/^https?:\/\//, '').split('/')[0];
  }

  const handleCopySummary = () => {
    const lines = [
      `🚨 تقرير الأخطاء الحرجة المكتشفة في فحص سيو لموقع: ${domain}`,
      `عدد الأخطاء الحرجة: ${analysis.totalCriticalCount}`,
      '----------------------------------------',
      ...analysis.criticalItems.map((item, idx) => {
        return `${idx + 1}. [${item.category.toUpperCase()}] ${item.titleAr || item.title}\n   - الحالة: ${item.currentValue || 'خطأ حرج'}\n   - الحل المطلوب: ${item.fixGuideAr || 'تعديل برمجي عاجل'}`;
      }),
      '----------------------------------------',
      'تم الفحص عبر راصد سيو (RasidSEO).'
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getThreatIcon = (item: AuditItem) => {
    const id = (item.id || '').toLowerCase();
    if (id.includes('robots') || id.includes('noindex')) {
      return <ShieldX className="w-4 h-4 text-rose-500 shrink-0" />;
    }
    if (item.category === 'security' || id.includes('ssl') || id.includes('https')) {
      return <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    return <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />;
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-rose-500 dark:border-rose-600 rounded-2xl shadow-2xl shadow-rose-500/20 text-right overflow-hidden transition-all animate-in slide-in-from-bottom-5 duration-300 font-sans"
    >
      {/* Top Countdown Progress Bar */}
      <div className="h-1 bg-slate-100 dark:bg-slate-800 w-full overflow-hidden">
        <div
          style={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 transition-all duration-100 ease-linear"
        />
      </div>

      <div className="p-4 sm:p-4.5 space-y-3">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Pulsing Urgency Indicator */}
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600" />
            </span>

            <span className="text-[11px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              تنبيه أخطاء حرجة فورية
            </span>

            <span className="font-mono text-[10px] font-bold text-slate-400 truncate max-w-[130px]" dir="ltr">
              {domain}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title={isMuted ? 'تفعيل تنبيه الصوت' : 'كتم تنبيه الصوت'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Dismiss Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="إغلاق التنبيه"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Threat Alert Message */}
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-snug">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>تم اكتشاف {analysis.totalCriticalCount} أخطاء حرجة تهدد أرشفة الموقع!</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            قد تؤدي هذه المشاكل فوراً إلى حظر زحف عناكب جوجل أو تحذيرات أمنية للزوار في المتصفح.
          </p>
        </div>

        {/* Threat Category Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {analysis.groups.map((group, idx) => (
            <span
              key={idx}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${group.badgeColor}`}
            >
              {group.badgeAr} ({group.items.length})
            </span>
          ))}
        </div>

        {/* Top Critical Items Preview List */}
        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
          {analysis.criticalItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition-colors group cursor-pointer text-xs"
              onClick={() => onJumpToItem(item.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                {getThreatIcon(item)}
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {item.titleAr || item.title}
                  </div>
                  {item.currentValue && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {item.currentValue}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900/60 rounded-md shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors"
              >
                معاينة
              </button>
            </div>
          ))}

          {analysis.criticalItems.length > 3 && (
            <div className="text-[10px] text-center text-slate-500 font-semibold pt-0.5">
              + و {analysis.criticalItems.length - 3} مشاكل أخرى في قائمة التقرير
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {/* Jump to first critical item */}
          <button
            type="button"
            onClick={() => {
              if (analysis.topItem) {
                onJumpToItem(analysis.topItem.id);
              }
            }}
            className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 active:scale-98 text-white shadow-sm shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>معاينة وحل الأخطاء فوراً</span>
          </button>

          {/* Copy Report */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="py-2 px-3 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="نسخ تقرير الأخطاء الحرجة لمشاركته مع المطورين"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">نسخ الملخص</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
