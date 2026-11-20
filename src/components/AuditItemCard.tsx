import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Info,
  Sparkles,
  X,
  Bot,
  RefreshCw,
  Terminal,
  Zap,
  Mic,
  Code2,
  FileCode,
  Layers,
  Lightbulb,
  Tag,
  TrendingUp,
  Brain
} from 'lucide-react';
import { AuditItem } from '../types/seo';
import { apiFetch } from '../utils/apiConfig';
import {
  getAiTipForAuditItem,
  getSmartTipForAuditItem,
  AiCriterionTip,
  CodeSnippetSolution,
  SmartTipItem
} from '../utils/aiItemTips';
import { AuditorVoiceNoteSection } from './AuditorVoiceNoteSection';
import { loadAuditorNotes } from '../utils/auditorVoiceNotes';
import { CustomCategory, getCategoryColorClasses } from '../utils/customCategoriesStorage';
import { AlgorithmTooltip2026 } from './AlgorithmTooltip2026';
import { getAlgorithmInsightForItem } from '../utils/algorithm2026Insights';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedAuditItem } from '../utils/auditTranslator';

interface AuditItemCardProps {
  item: AuditItem;
  currentUrl?: string;
  pageTitle?: string;
  quickFixMode?: boolean;
  isCompletedLocally?: boolean;
  onToggleComplete?: (itemId: string) => void;
  assignedCustomCategories?: CustomCategory[];
  allCustomCategories?: CustomCategory[];
  onToggleCategoryAssignment?: (categoryId: string, itemId: string) => void;
  onFilterByCustomCategory?: (categoryId: string) => void;
}

export const AuditItemCard: React.FC<AuditItemCardProps> = ({
  item,
  currentUrl,
  pageTitle,
  quickFixMode,
  isCompletedLocally,
  onToggleComplete,
  assignedCustomCategories = [],
  allCustomCategories = [],
  onToggleCategoryAssignment,
  onFilterByCustomCategory
}) => {
  const [expanded, setExpanded] = useState(item.status !== 'pass');
  const [copied, setCopied] = useState(false);
  const [showAiTip, setShowAiTip] = useState(false);
  const [copiedAiSnippet, setCopiedAiSnippet] = useState(false);
  const [customAiTip, setCustomAiTip] = useState<AiCriterionTip | null>(null);
  const [isLoadingDeepAi, setIsLoadingDeepAi] = useState(false);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  const [voiceNotePreview, setVoiceNotePreview] = useState<string>('');
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const algorithmInsight = useMemo(() => getAlgorithmInsightForItem(item), [item]);

  useEffect(() => {
    setSelectedSolutionIndex(0);
  }, [item.id]);

  useEffect(() => {
    const checkVoiceNote = () => {
      const notes = loadAuditorNotes(currentUrl);
      if (notes[item.id]) {
        setHasVoiceNote(true);
        setVoiceNotePreview(notes[item.id].text);
      } else {
        setHasVoiceNote(false);
        setVoiceNotePreview('');
      }
    };

    checkVoiceNote();

    const handleUpdate = () => {
      checkVoiceNote();
    };

    window.addEventListener('rasid-auditor-note-updated', handleUpdate);
    return () => window.removeEventListener('rasid-auditor-note-updated', handleUpdate);
  }, [item.id, currentUrl]);

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

  const handleCopy = () => {
    if (!item.codeSnippet) return;
    navigator.clipboard.writeText(item.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const { isRtl, currentLanguage, t } = useLanguage();
  const localized = getLocalizedAuditItem(item, currentLanguage.code);

  const smartTip = useMemo(() => {
    return getSmartTipForAuditItem(item, isRtl, currentUrl, pageTitle);
  }, [item, isRtl, currentUrl, pageTitle]);
  const [copiedSmartTip, setCopiedSmartTip] = useState(false);

  const handleCopySmartTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      const textToCopy = `💡 ${isRtl ? 'التلميح الذكي' : 'Smart Tip'}: ${smartTip.badge}\n${isRtl ? 'السياق التقني للخطأ' : 'Technical Context'}: ${smartTip.technicalContext}\n${isRtl ? 'النصيحة الفورية' : 'Immediate Action'}: ${smartTip.actionableTip}${smartTip.codeSuggestion ? `\n\n${isRtl ? 'الكود المقترح' : 'Suggested Code'}:\n${smartTip.codeSuggestion}` : ''}`;
      navigator.clipboard.writeText(textToCopy);
      setCopiedSmartTip(true);
      setTimeout(() => setCopiedSmartTip(false), 2000);
    }
  };

  const statusConfig = {
    pass: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      border: 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/60',
      badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      label: isRtl ? 'ناجح ومتطابق' : 'Passed'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
      border: 'border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/15 hover:border-amber-300 dark:hover:border-amber-700/60',
      badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      label: isRtl ? 'فرصة تحسين' : 'Warning'
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
      border: 'border-rose-200 dark:border-rose-900/40 bg-rose-50/25 dark:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-700/60',
      badge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      label: isRtl ? 'خطأ حرج' : 'Critical Issue'
    }
  }[item.status];

  const impactColor = {
    'حرج': 'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60',
    'متوسط': 'text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60',
    'منخفض': 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
  }[item.impactAr];

  return (
    <div
      id={`audit-item-${item.id}`}
      className={`bg-white dark:bg-slate-900 border rounded-xl transition-all shadow-xs ${
        isCompletedLocally
          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-emerald-500/10'
          : statusConfig.border
      }`}
    >
      {/* Clickable Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Quick Fix Mode Interactive Checkbox */}
          {quickFixMode && onToggleComplete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(item.id);
              }}
              className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs ${
                isCompletedLocally
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-700'
              }`}
              title={isCompletedLocally ? 'تم الإصلاح محلياً (انقر للإلغاء)' : 'تعليم المعيار كـ تم إصلاحه في كود الموقع'}
            >
              {isCompletedLocally ? <Check className="w-4 h-4 stroke-[3]" /> : null}
            </button>
          )}

          {statusConfig.icon}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm font-bold truncate ${
                  isCompletedLocally
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {localized.title}
              </h4>
              {isCompletedLocally && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{isRtl ? 'تم الإصلاح محلياً' : 'Fixed Locally'}</span>
                </span>
              )}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusConfig.badge}`}>
                {statusConfig.label}
              </span>
              <span
                data-tooltip-id="seo-tooltip"
                data-tooltip-content={
                  item.impactAr === 'حرج'
                    ? (isRtl ? 'تأثير حرج: هذا المعيار أساسي ويؤثر مباشرة على تقييم وفهرسة الصفحة في جوجل.' : 'Critical impact: directly affects Google crawling & indexing.')
                    : item.impactAr === 'متوسط'
                    ? (isRtl ? 'تأثير متوسط: فرصة لتحسين سرعة وأرشفة الصفحة وزيادة معدل النقر CTR.' : 'Medium impact: opportunity to optimize speed, indexing, and CTR.')
                    : (isRtl ? 'تأثير منخفض: تحسين إضافي يُفضل تطبيقه.' : 'Low impact: recommended best practice.')
                }
                className={`text-[10px] font-medium px-2 py-0.5 rounded border cursor-help ${impactColor}`}
              >
                {localized.impact}
              </span>

              {/* Contextual 2026 Google Algorithm Tooltip */}
              <AlgorithmTooltip2026 item={item} />

              {/* Contextual Smart Tip Header Pill */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(true);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer hover:scale-105 shadow-2xs ${
                  smartTip.urgency === 'critical'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : smartTip.urgency === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
                title={`${isRtl ? 'التلميح الذكي: ' : 'Smart Tip: '}${smartTip.actionableTip}`}
              >
                <Lightbulb className="w-3 h-3 text-amber-500 animate-pulse shrink-0" />
                <span>{isRtl ? 'التلميح الذكي' : 'Smart Tip'}</span>
              </button>

              {/* Custom Category Badges */}
              {assignedCustomCategories.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {assignedCustomCategories.map((cat) => {
                    const cStyle = getCategoryColorClasses(cat.color);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFilterByCustomCategory?.(cat.id);
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all hover:scale-105 cursor-pointer shadow-2xs ${cStyle.badge}`}
                        title={`تصنيف مخصص: ${cat.name} (انقر للتصفية بهذا التصنيف)`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cStyle.dot}`} />
                        <span>{cat.name.split(' (')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quick Assign Custom Category Button & Dropdown */}
              {allCustomCategories.length > 0 && onToggleCategoryAssignment && (
                <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-[10px] flex items-center gap-1 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400"
                    title="إسناد هذا المعيار لتصنيف مخصص (فريق عمل / أولوية)"
                  >
                    <Tag className="w-3 h-3 text-indigo-500" />
                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">+تصنيف</span>
                  </button>

                  {showCategoryMenu && (
                    <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pb-1 border-b border-slate-100 dark:border-slate-800">
                        <span>إسناد لتصنيف مخصص:</span>
                        <button
                          onClick={() => setShowCategoryMenu(false)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-0.5">
                        {allCustomCategories.map((cat) => {
                          const isAssigned = cat.itemIds.includes(item.id);
                          const cStyle = getCategoryColorClasses(cat.color);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => onToggleCategoryAssignment(cat.id, item.id)}
                              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer text-right ${
                                isAssigned
                                  ? 'bg-indigo-50/90 dark:bg-indigo-950/70 font-bold text-indigo-900 dark:text-indigo-200'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${cStyle.dot}`} />
                                <span className="truncate text-[11px]">{cat.name}</span>
                              </div>
                              {isAssigned && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Info Icon with Hover/Click Quick Tip */}
              <div
                className="relative inline-block"
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
                  title="نصيحة سريعة من الذكاء الاصطناعي لإصلاح هذا المعيار بناءً على كود الموقع (مرر الفأرة)"
                >
                  <Sparkles className="w-3 h-3 text-amber-500 group-hover:rotate-12 transition-transform" />
                  <Info className="w-3.5 h-3.5" />
                  <span>نصيحة AI</span>
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
                            <span>
                              كود الإصلاح الجاهز ({(activeSolution?.language || activeAiTip.codeLanguage).toUpperCase()}):
                            </span>
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

              {/* Auditor Voice Note Badge / Button in Header */}
              {hasVoiceNote ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors shadow-xs cursor-pointer animate-in fade-in"
                  title={isRtl ? `ملاحظة صوتية للمدقق: "${voiceNotePreview.slice(0, 80)}..." (انقر للتفاصيل)` : `Auditor voice note: "${voiceNotePreview.slice(0, 80)}..."`}
                >
                  <Mic className="w-3 h-3 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  <span>{t('audit.voice_note', 'توجيه صوتي للمدقق')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(true);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                  title={isRtl ? "تسجيل ملاحظة صوتية للمدقق لهذا المعيار وتحويلها لنص مكتوب" : "Record auditor voice note for this audit criterion"}
                >
                  <Mic className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                  <span>{isRtl ? 'ملاحظة صوتية' : 'Voice Note'}</span>
                </button>
              )}
            </div>
            {(localized.currentValue || item.currentValue) && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-mono">
                {t('audit.current', 'الحالي:')} <span className="text-slate-700 dark:text-slate-200 font-semibold">{localized.currentValue || item.currentValue}</span>
                {(localized.idealValue || item.idealValue) && (
                  <span className="text-slate-400 dark:text-slate-500 mr-2"> · {t('audit.ideal', 'المثالي:')} {localized.idealValue || item.idealValue}</span>
                )}
              </p>
            )}

            {/* Instant Smart Tip Box (التلميح الذكي الفوري المبني على السياق التقني للخطأ) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={`mt-2.5 p-3 rounded-xl border text-xs transition-all shadow-2xs ${
                smartTip.urgency === 'critical'
                  ? 'bg-gradient-to-r from-rose-50/70 via-rose-50/30 to-slate-50/80 dark:from-rose-950/30 dark:via-rose-950/15 dark:to-slate-900 border-rose-200/90 dark:border-rose-900/60'
                  : smartTip.urgency === 'warning'
                  ? 'bg-gradient-to-r from-amber-50/70 via-amber-50/30 to-slate-50/80 dark:from-amber-950/30 dark:via-amber-950/15 dark:to-slate-900 border-amber-200/90 dark:border-amber-900/60'
                  : 'bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-slate-50/80 dark:from-emerald-950/30 dark:via-emerald-950/15 dark:to-slate-900 border-emerald-200/90 dark:border-emerald-900/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5 pb-1.5 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-black text-slate-900 dark:text-white text-xs">
                    {isRtl ? 'التلميح الذكي (Smart Tip)' : 'Smart Tip'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-200/80 dark:border-slate-700">
                    {smartTip.badge}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopySmartTip}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 bg-white/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
                  title={isRtl ? "نسخ نص التلميح الذكي للحافظة" : "Copy smart tip to clipboard"}
                >
                  {copiedSmartTip ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isRtl ? 'تم النسخ!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{isRtl ? 'نسخ النصيحة' : 'Copy Tip'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Technical Context of the Error */}
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-slate-900 dark:text-white font-bold inline-flex items-center gap-1">
                    <span>🔍</span>
                    <span>{isRtl ? 'السياق التقني للخطأ:' : 'Technical Context:'}</span>
                  </strong>{' '}
                  <span>{smartTip.technicalContext}</span>
                </p>

                {/* Instant Actionable Advice */}
                <p className="text-[11px] leading-relaxed bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg border border-black/5 dark:border-white/5">
                  <strong className="text-indigo-700 dark:text-indigo-300 font-bold inline-flex items-center gap-1">
                    <span>⚡</span>
                    <span>{isRtl ? 'النصيحة الفورية للإصلاح:' : 'Immediate Remediation:'}</span>
                  </strong>{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{smartTip.actionableTip}</span>
                </p>

                {/* Optional Quick Code Suggestion */}
                {smartTip.codeSuggestion && (
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <code className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 text-emerald-400 truncate dir-ltr text-left flex-1 border border-slate-800 select-all" dir="ltr">
                      {smartTip.codeSuggestion.split('\n')[0]}
                    </code>
                    <button
                      type="button"
                      onClick={() => setExpanded(true)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline whitespace-nowrap cursor-pointer flex items-center gap-1"
                    >
                      <span>{isRtl ? 'عرض الكود والحلول' : 'View Code & Fixes'}</span>
                      <span>&larr;</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono font-bold tabular-nums text-slate-700 dark:text-slate-300">{item.score}/100</span>
          </div>
          <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details & Fix Guide */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100/80 dark:border-slate-800 space-y-3">
          {/* Detailed explanation */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {localized.description || item.descriptionAr}
          </p>

          {/* 2026 Google Algorithm Ranking Factor Breakdown Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-indigo-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900 border border-indigo-200/90 dark:border-indigo-800/60 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-600 text-white tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{t('audit.algorithm_2026', 'تحديثات خوارزميات 2026')}</span>
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {algorithmInsight.algorithmUpdateNameAr}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                {algorithmInsight.rankingWeightLabelAr}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-indigo-900 dark:text-indigo-200 font-bold">{t('audit.why_critical_2026', 'لماذا يُعد حاسماً في 2026؟')} </strong>
              {algorithmInsight.importance2026Ar}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-indigo-100 dark:border-indigo-900/50">
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span>{t('audit.ctr_impact', 'أثر الترتيب ومعدل النقر CTR:')}</span>
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {algorithmInsight.rankingImpactExplanationAr}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Brain className="w-3 h-3 text-purple-600" />
                  <span>{t('audit.ai_overviews_impact', 'الظهور في Google AI Overviews:')}</span>
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {algorithmInsight.aiOverviewImpactAr}
                </p>
              </div>
            </div>
          </div>

          {/* Actionable fix guide */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🔧 {t('audit.fix_guide', 'طريقة الإصلاح الموصى بها:')}</span>
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {localized.fixGuide || item.fixGuideAr}
            </p>

            {/* Context-Aware AI Hints & Code Solutions Section */}
            <div className="mt-3 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900/60 dark:to-slate-900/40 p-3.5 space-y-3 shadow-xs">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        توجيهات الذكاء الاصطناعي السياقية (Context-Aware AI Hints)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {activeAiTip.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      حلول برمجية موجهة لطبيعة المعيار وكود الموقع
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      activeAiTip.urgencyLevel === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                    }`}
                  >
                    {activeAiTip.urgencyLevel === 'critical' ? 'أولوية قصوى' : 'تحسين مستحسن'}
                  </span>
                </div>
              </div>

              {/* Code Diagnosis */}
              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>تشخيص المعيار في كود الموقع:</span>
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {activeAiTip.codeContextAr}
                </p>
              </div>

              {/* Multi-Framework Solutions Switcher */}
              {currentSolutions.length > 0 && (
                <div className="space-y-2">
                  {currentSolutions.length > 1 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        بيئة التطوير / القالب:
                      </span>
                      {currentSolutions.map((sol, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSolutionIndex(idx)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            selectedSolutionIndex === idx
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Code2 className="w-3 h-3" />
                          <span>{sol.title}</span>
                          <span className="text-[9px] uppercase opacity-75 font-mono">({sol.language})</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active Solution Code Box */}
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                    <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 text-slate-300 px-3 py-1.5 text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-bold text-white">
                          {activeSolution?.title || t('audit.ready_snippet', 'كود التطبيق الجاهز')}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700 uppercase">
                          {(activeSolution?.language || activeAiTip.codeLanguage).toUpperCase()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAiSnippet(activeSolution?.code || activeAiTip.codeSnippet)}
                        className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] font-medium"
                      >
                        {copiedAiSnippet ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">{t('audit.copied', 'تم النسخ!')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t('audit.copy_code', 'نسخ الكود')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {activeSolution?.description && (
                      <div className="px-3 py-1.5 bg-slate-900/40 border-b border-slate-800/60 text-[10px] text-slate-400">
                        {activeSolution.description}
                      </div>
                    )}

                    <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre dir-ltr text-left select-all max-h-56" dir="ltr">
                      <code>{activeSolution?.code || activeAiTip.codeSnippet}</code>
                    </pre>
                  </div>

                  {activeAiTip.whereToPutAr && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 pt-0.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300">📍 مكان الوضع:</span>
                      <span>{activeAiTip.whereToPutAr}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step-by-Step Action Guide */}
              {activeAiTip.stepByStepActionAr && (
                <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-[11px] space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 block">
                    🔧 خطوات التنفيذ في الكود المصدري:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                    {activeAiTip.stepByStepActionAr}
                  </p>
                </div>
              )}

              {/* Impact & Pro Tip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <span className="text-base shrink-0">📈</span>
                  <span className="leading-snug">{activeAiTip.expectedImpactAr}</span>
                </div>
                {activeAiTip.proTipAr ? (
                  <div className="p-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                    <span className="text-amber-500 text-xs shrink-0">⭐</span>
                    <span className="leading-snug">{activeAiTip.proTipAr}</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="text-xs">💡</span>
                    <span>كود مهيأ وفق معايير جوجل لعام 2026</span>
                  </div>
                )}
              </div>

              {/* Deep Gemini Re-consultation */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleRequestDeepGeminiAi}
                  disabled={isLoadingDeepAi}
                  className="w-full py-1.5 px-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isLoadingDeepAi ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  <span>
                    {isLoadingDeepAi
                      ? 'جارٍ تحليل الكود وتوليد الحل عبر Gemini 3.8 Flash...'
                      : 'استشارة Gemini 3.8 Flash لتوليد حل برمجي مخصص بدقة'}
                  </span>
                </button>
              </div>
            </div>

            {item.id.includes('broken_external_links') && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => document.getElementById('technical-seo-broken-links')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>فتح أداة فاحص الروابط الخارجية (External Link Checker) والجدول التفاعلي لحالات 404</span>
                  <span>&larr;</span>
                </button>
              </div>
            )}

            {item.id.includes('schema') && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => document.getElementById('social-schema-inspector')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>فتح فاحص ومحلل بيانات الـ Schema.org (JSON-LD) والأخطاء الهيكلية</span>
                  <span>&larr;</span>
                </button>
              </div>
            )}

            {(item.id.includes('cwv') || item.id.includes('ttfb') || item.id.includes('speed')) && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => document.getElementById('core-web-vitals-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض قسم قياسات مؤشرات أداء الويب الأساسية (LCP, FID, CLS) ومحاكي السرعة</span>
                  <span>&larr;</span>
                </button>
              </div>
            )}

            {(item.id.includes('internal') || item.id.includes('internal_linking')) && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => document.getElementById('internal-linking-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>فتح أداة تحليل هيكل الروابط الداخلية وترابط الصفحات (Topic Clusters)</span>
                  <span>&larr;</span>
                </button>
              </div>
            )}

            {(item.id.includes('csp') || item.id.includes('hsts') || item.id.includes('security_headers')) && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => document.getElementById('security-headers-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>فتح أداة تحليل ترويسات الأمان CSP & HSTS لتفادي هجمات XSS و MitM</span>
                  <span>&larr;</span>
                </button>
              </div>
            )}

            {/* Auditor Voice Note & Speech-to-Text Section */}
            <AuditorVoiceNoteSection
              item={item}
              currentUrl={currentUrl}
              onNoteSaved={(note) => {
                setHasVoiceNote(Boolean(note));
                setVoiceNotePreview(note?.text || '');
              }}
            />

            {quickFixMode && onToggleComplete && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {isCompletedLocally ? 'تم تأشير هذا المعيار كـ مكتمل في الجلسة الحالية' : 'هل قمت بتطبيق هذا الإصلاح في كود موقعك؟'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleComplete(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isCompletedLocally
                      ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-500/20'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isCompletedLocally ? 'إلغاء التأشير (إعادة كمعلق)' : 'تعليم المعيار كـ تم إصلاحه بنجاح ✓'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
