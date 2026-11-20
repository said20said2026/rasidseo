import React, { useState, useRef, useMemo } from 'react';
import {
  Sparkles,
  Info,
  X,
  Copy,
  Check,
  Terminal,
  RefreshCw,
  Bot
} from 'lucide-react';
import { AuditItem } from '../types/seo';
import { getAiTipForAuditItem, AiCriterionTip, CodeSnippetSolution } from '../utils/aiItemTips';
import { apiFetch } from '../utils/apiConfig';

interface ChecklistAiTipButtonProps {
  item: AuditItem;
  currentUrl?: string;
  pageTitle?: string;
  className?: string;
  buttonLabel?: string;
}

export const ChecklistAiTipButton: React.FC<ChecklistAiTipButtonProps> = ({
  item,
  currentUrl,
  pageTitle,
  className = '',
  buttonLabel = 'نصيحة AI'
}) => {
  const [showAiTip, setShowAiTip] = useState(false);
  const [copiedAiSnippet, setCopiedAiSnippet] = useState(false);
  const [customAiTip, setCustomAiTip] = useState<AiCriterionTip | null>(null);
  const [isLoadingDeepAi, setIsLoadingDeepAi] = useState(false);
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const defaultAiTip = useMemo(() => {
    return getAiTipForAuditItem(item, currentUrl, pageTitle);
  }, [item, currentUrl, pageTitle]);

  const activeAiTip = customAiTip || defaultAiTip;

  const currentSolutions = useMemo<CodeSnippetSolution[]>(() => {
    if (activeAiTip.solutions && activeAiTip.solutions.length > 0) {
      return activeAiTip.solutions;
    }
    if (activeAiTip.codeSnippet) {
      return [
        {
          title: 'قالب الكود القياسي',
          language: activeAiTip.codeLanguage || 'html',
          code: activeAiTip.codeSnippet,
          description: 'الشفرة البرمجية المباشرة الموصى بها لإصلاح هذا المعيار'
        }
      ];
    }
    return [];
  }, [activeAiTip]);

  const activeSolution = currentSolutions[selectedSolutionIndex] || currentSolutions[0] || null;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowAiTip(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowAiTip(false);
    }, 280);
  };

  const handleCopyAiSnippet = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedAiSnippet(true);
    setTimeout(() => setCopiedAiSnippet(false), 2000);
  };

  const handleRequestDeepGeminiAi = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingDeepAi(true);
    try {
      const resp = await apiFetch('/api/ai-item-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item,
          url: currentUrl,
          siteName: pageTitle
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.tip) {
          setCustomAiTip({
            ...defaultAiTip,
            ...data.tip,
            badge: data.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash AI' : defaultAiTip.badge
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch deeper AI tip:', err);
    } finally {
      setIsLoadingDeepAi(false);
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowAiTip((prev) => !prev);
        }}
        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer select-none group ${
          showAiTip
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/50'
            : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:border-indigo-400'
        }`}
        title="مرر الفأرة لعرض نصيحة الذكاء الاصطناعي لكيفية إصلاح هذا المعيار في كود الموقع"
      >
        <Sparkles className="w-3 h-3 text-amber-500 group-hover:rotate-12 transition-transform" />
        <Info className="w-3.5 h-3.5" />
        <span>{buttonLabel}</span>
      </button>

      {/* Floating AI Tip Popover */}
      {showAiTip && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 top-full mt-2 right-0 sm:right-auto sm:left-0 w-[calc(100vw-2.5rem)] sm:w-[460px] max-w-[92vw] bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-2xl p-4 sm:p-5 text-right space-y-3.5 cursor-default animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          dir="rtl"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  نصيحة الذكاء الاصطناعي السريعة (AI Quick Fix)
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  {activeAiTip.badge} • موجهة لكود الموقع
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  activeAiTip.urgencyLevel === 'critical'
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                }`}
              >
                {activeAiTip.urgencyLevel === 'critical' ? 'أولوية قصوى' : 'تحسين مستحسن'}
              </span>
              <button
                type="button"
                onClick={() => setShowAiTip(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Headline */}
          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>💡</span>
            <span>{activeAiTip.headlineAr}</span>
          </h5>

          {/* Code Diagnosis Box */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block">
              🔍 تشخيص كود الموقع الحالي:
            </span>
            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {activeAiTip.codeContextAr}
            </p>
          </div>

          {/* Step-by-Step Action */}
          <div className="space-y-1 text-xs">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>🔧</span>
              <span>خطوات التطبيق في كود الموقع:</span>
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 font-medium">
              {activeAiTip.stepByStepActionAr}
            </p>
          </div>

          {/* Multi-Solution Tabs inside AI Popover */}
          {currentSolutions.length > 1 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">
                اختر بيئة التطوير (Framework / Format):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentSolutions.map((sol, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSolutionIndex(idx)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      selectedSolutionIndex === idx
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{sol.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Code Snippet Box */}
          {(activeSolution?.code || activeAiTip.codeSnippet) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-indigo-500" />
                  <span>كود الإصلاح الجاهز ({(activeSolution?.language || activeAiTip.codeLanguage).toUpperCase()}):</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyAiSnippet(activeSolution?.code || activeAiTip.codeSnippet)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                >
                  {copiedAiSnippet ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>
              </div>
              {activeSolution?.description && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {activeSolution.description}
                </p>
              )}
              <pre
                className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-pre dir-ltr text-left border border-slate-800 select-all max-h-48"
                dir="ltr"
              >
                <code>{activeSolution?.code || activeAiTip.codeSnippet}</code>
              </pre>
              {activeAiTip.whereToPutAr && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-0.5">
                  <span>📍 مكان الوضع:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{activeAiTip.whereToPutAr}</span>
                </span>
              )}
            </div>
          )}

          {/* Expected Impact Strip */}
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-[11px] flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <span className="text-base shrink-0">📈</span>
            <span className="leading-snug">{activeAiTip.expectedImpactAr}</span>
          </div>

          {/* Pro Tip */}
          {activeAiTip.proTipAr && (
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-0.5">
              <span className="text-amber-500 text-xs shrink-0">⭐</span>
              <span>{activeAiTip.proTipAr}</span>
            </div>
          )}

          {/* Gemini AI Consultation Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleRequestDeepGeminiAi}
              disabled={isLoadingDeepAi}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoadingDeepAi ? (
                <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
              ) : (
                <Bot className="w-3 h-3 text-indigo-500" />
              )}
              <span>{isLoadingDeepAi ? 'جارٍ استشارة الذكاء الاصطناعي...' : 'تحديث النصيحة عبر Gemini AI 3.8'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
