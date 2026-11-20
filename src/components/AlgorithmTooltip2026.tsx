import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  HelpCircle,
  X,
  Check,
  Copy,
  Zap,
  ShieldCheck,
  TrendingUp,
  Brain,
  Info
} from 'lucide-react';
import { AuditItem } from '../types/seo';
import {
  getAlgorithmInsightForItem,
  Algorithm2026Insight
} from '../utils/algorithm2026Insights';

interface AlgorithmTooltip2026Props {
  item: AuditItem;
}

export const AlgorithmTooltip2026: React.FC<AlgorithmTooltip2026Props> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const insight: Algorithm2026Insight = getAlgorithmInsightForItem(item);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyInsight = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `معيار: ${insight.topicAr}
عامل الترتيب في جوجل: ${insight.rankingWeightLabelAr}
أهمية المعيار في 2026: ${insight.importance2026Ar}
تحديث الخوارزمية المرتبط: ${insight.algorithmUpdateNameAr}
الأثر على الترتيب: ${insight.rankingImpactExplanationAr}
التأثير في Google AI Overviews: ${insight.aiOverviewImpactAr}
نصيحة خبراء السيو 2026: ${insight.proTip2026Ar}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getWeightColorStyles = (color: Algorithm2026Insight['rankingWeightColor']) => {
    switch (color) {
      case 'rose':
        return {
          pill: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500'
        };
      case 'amber':
        return {
          pill: 'bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500'
        };
      case 'emerald':
        return {
          pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500'
        };
      case 'cyan':
        return {
          pill: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
          dot: 'bg-cyan-500'
        };
      default:
        return {
          pill: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          dot: 'bg-indigo-500'
        };
    }
  };

  const weightStyles = getWeightColorStyles(insight.rankingWeightColor);

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      {/* Interactive Trigger Pill / Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer border ${
          isOpen
            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400/40'
            : 'bg-indigo-50/90 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80'
        }`}
        title="انقر لعرض شرح أهمية هذا المعيار ومدى تأثيره على ترتيب الموقع وفق خوارزميات جوجل 2026"
        aria-expanded={isOpen}
      >
        <Sparkles className={`w-3 h-3 ${isOpen ? 'text-amber-300 animate-spin' : 'text-indigo-500'}`} />
        <span>أثر خوارزمية 2026</span>
      </button>

      {/* Floating Interactive Popover Card */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-80 sm:w-96 max-w-[92vw] bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/80 rounded-2xl shadow-2xl z-50 p-4 text-right space-y-3 animate-in fade-in zoom-in-95 duration-150"
          style={{ filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.25))' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-600 text-white tracking-wider flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span>تحديثات جوجل 2026</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${weightStyles.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${weightStyles.dot}`} />
                  <span>{insight.rankingWeightLabelAr}</span>
                </span>
              </div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white pt-1">
                {insight.topicAr}
              </h5>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
              title="إغلاق التلميح"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 1: Why it matters in 2026 */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>لماذا يُعد هذا المعيار حيوياً في 2026؟</span>
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              {insight.importance2026Ar}
            </p>
          </div>

          {/* Section 2: Associated Algorithm Update & Ranking Impact */}
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900 dark:text-indigo-200">
                <TrendingUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>الخوارزمية المسؤولة ومدى التأثير على الترتيب:</span>
              </div>
              <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                {insight.algorithmUpdateNameAr}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {insight.rankingImpactExplanationAr}
              </p>
            </div>

            {/* AI Overviews & Gemini impact */}
            <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-purple-900 dark:text-purple-200">
                <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>التأثير في اقتباسات الذكاء الاصطناعي (Google AI Overviews):</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {insight.aiOverviewImpactAr}
              </p>
            </div>
          </div>

          {/* Section 3: Pro-tip for 2026 */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>نصيحة الخبراء لتصدر نتائج 2026:</span>
            </span>
            <p className="text-[11px] text-emerald-950 dark:text-emerald-300 leading-relaxed">
              {insight.proTip2026Ar}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
            <span className="text-slate-400 font-mono">Google Core Engine v2026</span>
            <button
              type="button"
              onClick={handleCopyInsight}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
              title="نسخ ملخص معايير خوارزمية 2026 لهذا المعيار"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>نسخ التلميح</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
