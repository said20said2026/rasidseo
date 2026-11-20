import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Globe,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Trash2,
  X,
  FileCheck,
  ChevronDown
} from 'lucide-react';
import { AuditResult, AuditItem } from '../types/seo';
import { ScoreGauge } from './ScoreGauge';

export interface SavedReportItem {
  id: string;
  name: string;
  timestamp: number;
  data: AuditResult;
}

interface ReportComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedReports: SavedReportItem[];
  currentReport: AuditResult | null;
  onDeleteSavedReport?: (id: string) => void;
  onLoadReportIntoView?: (report: AuditResult) => void;
}

export const ReportComparisonModal: React.FC<ReportComparisonModalProps> = ({
  isOpen,
  onClose,
  savedReports,
  currentReport,
  onDeleteSavedReport,
  onLoadReportIntoView
}) => {
  // We need to compare Report A (Before / Baseline) and Report B (After / Current)
  const [selectedIdA, setSelectedIdA] = useState<string>('');
  const [selectedIdB, setSelectedIdB] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'checklist' | 'headings'>('overview');
  const [filterChangedOnly, setFilterChangedOnly] = useState(false);

  // Initialize selections when modal opens or reports change
  React.useEffect(() => {
    if (savedReports.length >= 2) {
      if (!selectedIdA || !savedReports.some((r) => r.id === selectedIdA)) {
        setSelectedIdA(savedReports[0].id);
      }
      if (!selectedIdB || !savedReports.some((r) => r.id === selectedIdB)) {
        setSelectedIdB(savedReports[1].id);
      }
    } else if (savedReports.length === 1) {
      setSelectedIdA(savedReports[0].id);
      setSelectedIdB(savedReports[0].id);
    }
  }, [savedReports, isOpen]);

  if (!isOpen) return null;

  const reportAItem = savedReports.find((r) => r.id === selectedIdA);
  const reportBItem = savedReports.find((r) => r.id === selectedIdB);

  const reportA = reportAItem?.data || null;
  const reportB = reportBItem?.data || null;

  const scoreDiff = reportA && reportB ? reportB.overallScore - reportA.overallScore : 0;
  const speedDiff = reportA && reportB ? reportA.loadTimeMs - reportB.loadTimeMs : 0; // positive is improvement (faster)

  // Map audit items by ID to compare status changes
  const allItemIds = Array.from(
    new Set([
      ...(reportA?.items.map((i) => i.id) || []),
      ...(reportB?.items.map((i) => i.id) || [])
    ])
  );

  const comparedItems = allItemIds.map((id) => {
    const itemA = reportA?.items.find((i) => i.id === id);
    const itemB = reportB?.items.find((i) => i.id === id);
    const titleAr = itemB?.titleAr || itemA?.titleAr || id;
    const category = itemB?.category || itemA?.category || 'onpage';

    let changeType: 'improved' | 'regressed' | 'same' = 'same';
    const statusWeight = (s?: string) => (s === 'pass' ? 2 : s === 'warning' ? 1 : 0);

    const weightA = itemA ? statusWeight(itemA.status) : -1;
    const weightB = itemB ? statusWeight(itemB.status) : -1;

    if (weightB > weightA) changeType = 'improved';
    else if (weightB < weightA) changeType = 'regressed';

    return {
      id,
      titleAr,
      category,
      itemA,
      itemB,
      changeType
    };
  });

  const displayedChecklist = filterChangedOnly
    ? comparedItems.filter((item) => item.changeType !== 'same')
    : comparedItems;

  const improvedCount = comparedItems.filter((i) => i.changeType === 'improved').length;
  const regressedCount = comparedItems.filter((i) => i.changeType === 'regressed').length;
  const fixedErrorsCount = comparedItems.filter(
    (i) => i.itemA?.status === 'error' && (i.itemB?.status === 'pass' || i.itemB?.status === 'warning')
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-indigo-950">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  مقارنة تقريرين لنفس الموقع جنباً إلى جنب
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                  قياس التقدم والإصلاحات
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                قارن نتائج الفحص قبل وبعد تطبيق تحسينات السيو واكتشف العناصر التي تم علاجها بنجاح.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق المقارنة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {savedReports.length < 2 ? (
            <div className="py-12 px-6 text-center max-w-lg mx-auto bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                تحتاج إلى تقريرين محفوظين على الأقل لإجراء المقارنة
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                لديك حالياً {savedReports.length} تقرير محفوظ. قم بحفظ تقرير الفحص الحالي أولاً، ثم أجرِ تعديلاتك على الموقع وأعد الفحص واحفظ التقرير الجديد لمقارنتهما معاً ورؤية مدى التطور.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
              >
                العودة للتقرير وإضافة حفظ
              </button>
            </div>
          ) : (
            <>
              {/* Selectors Bar: Report A vs Report B */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                {/* Selector A (Before / Baseline) */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                      التقرير الأول (قبل الإصلاحات - الأساس)
                    </span>
                    {reportAItem && onDeleteSavedReport && (
                      <button
                        onClick={() => onDeleteSavedReport(reportAItem.id)}
                        className="text-[11px] text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 hover:underline cursor-pointer"
                        title="حذف هذا التقرير المحفوظ"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>حذف</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={selectedIdA}
                      onChange={(e) => setSelectedIdA(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      {savedReports.map((r) => (
                        <option key={`a-${r.id}`} value={r.id}>
                          {r.name} — نقاط السيو: ({r.data.overallScore}/100) — {new Date(r.timestamp).toLocaleDateString('ar-EG')}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                  {reportA && (
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>السرعة: {reportA.loadTimeMs}ms</span>
                      <span>الأخطاء: {reportA.items.filter((i) => i.status === 'error').length}</span>
                      <span>التحذيرات: {reportA.items.filter((i) => i.status === 'warning').length}</span>
                    </div>
                  )}
                </div>

                {/* Selector B (After / Current) */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                      التقرير الثاني (بعد التحسين - المقارن)
                    </span>
                    {reportBItem && onDeleteSavedReport && (
                      <button
                        onClick={() => onDeleteSavedReport(reportBItem.id)}
                        className="text-[11px] text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 hover:underline cursor-pointer"
                        title="حذف هذا التقرير المحفوظ"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>حذف</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={selectedIdB}
                      onChange={(e) => setSelectedIdB(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                    >
                      {savedReports.map((r) => (
                        <option key={`b-${r.id}`} value={r.id}>
                          {r.name} — نقاط السيو: ({r.data.overallScore}/100) — {new Date(r.timestamp).toLocaleDateString('ar-EG')}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                  {reportB && (
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>السرعة: {reportB.loadTimeMs}ms</span>
                      <span>الأخطاء: {reportB.items.filter((i) => i.status === 'error').length}</span>
                      <span>التحذيرات: {reportB.items.filter((i) => i.status === 'warning').length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* High-level Summary Card */}
              {reportA && reportB && (
                <div className="bg-gradient-to-r from-indigo-500/10 via-emerald-500/10 to-teal-500/10 dark:from-indigo-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border border-indigo-200/60 dark:border-indigo-800/60 rounded-2xl p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    {/* Score Difference */}
                    <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        تغير نقاط السيو الإجمالية
                      </span>
                      <div className="flex items-center justify-center gap-1.5 font-black text-xl">
                        {scoreDiff > 0 ? (
                          <>
                            <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">+{scoreDiff} نقطة</span>
                          </>
                        ) : scoreDiff < 0 ? (
                          <>
                            <ArrowDownRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            <span className="text-rose-600 dark:text-rose-400">{scoreDiff} نقطة</span>
                          </>
                        ) : (
                          <>
                            <Minus className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-300">بدون تغيير</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">
                        من {reportA.overallScore} إلى {reportB.overallScore}
                      </span>
                    </div>

                    {/* Fixed Errors */}
                    <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        أخطاء حرجة تم علاجها
                      </span>
                      <div className="flex items-center justify-center gap-1.5 font-black text-xl text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{fixedErrorsCount} مشكلة</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">
                        تحسنت من خطأ إلى ناجح
                      </span>
                    </div>

                    {/* Speed Improvement */}
                    <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        فرق سرعة الخادم (TTFB)
                      </span>
                      <div className="flex items-center justify-center gap-1.5 font-black text-xl">
                        {speedDiff > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            أسرع بـ {speedDiff}ms
                          </span>
                        ) : speedDiff < 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            أبطأ بـ {Math.abs(speedDiff)}ms
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300">متطابقة ({reportA.loadTimeMs}ms)</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">
                        من {reportA.loadTimeMs}ms إلى {reportB.loadTimeMs}ms
                      </span>
                    </div>

                    {/* Net Improvements */}
                    <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        المعايير المتحسنة عموماً
                      </span>
                      <div className="flex items-center justify-center gap-2 font-black text-xl">
                        <span className="text-emerald-600 dark:text-emerald-400">+{improvedCount}</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span className="text-rose-500 text-base">-{regressedCount}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">
                        إجمالي المعايير المحللة: {comparedItems.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tabs Navigation */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    نظرة عامة على التصنيفات
                  </button>
                  <button
                    onClick={() => setActiveTab('checklist')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'checklist'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    جدول المقارنة التفصيلي ({comparedItems.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('metrics')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'metrics'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    البيانات التقنية والأمان
                  </button>
                </div>

                {activeTab === 'checklist' && (
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filterChangedOnly}
                      onChange={(e) => setFilterChangedOnly(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                    />
                    <span>إظهار المعايير التي تغيرت فقط ({improvedCount + regressedCount})</span>
                  </label>
                )}
              </div>

              {/* TAB 1: Categories Overview Side-by-Side */}
              {activeTab === 'overview' && reportA && reportB && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Report A Gauges */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                          {reportAItem?.name} (الأساس)
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                          {reportA.overallScore}/100
                        </span>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(reportA.categories).map(([key, cat]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.nameAr}</span>
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{cat.score}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full transition-all"
                                style={{ width: `${cat.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Report B Gauges */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {reportBItem?.name} (بعد التحسين)
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                          {reportB.overallScore}/100
                        </span>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(reportB.categories).map(([key, cat]) => {
                          const catA = reportA.categories[key as keyof typeof reportA.categories];
                          const diff = catA ? cat.score - catA.score : 0;
                          return (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.nameAr}</span>
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{cat.score}%</span>
                                  {diff !== 0 && (
                                    <span
                                      className={`text-[10px] font-bold px-1 rounded ${
                                        diff > 0
                                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                      }`}
                                    >
                                      {diff > 0 ? `+${diff}` : diff}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${cat.score}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Detailed Checklist Table Side-by-Side */}
              {activeTab === 'checklist' && reportA && reportB && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3 w-1/3">المعيار الفني</th>
                          <th className="p-3 w-1/4">
                            <span className="text-indigo-600 dark:text-indigo-400">التقرير الأول</span> ({reportAItem?.name})
                          </th>
                          <th className="p-3 w-1/4">
                            <span className="text-emerald-600 dark:text-emerald-400">التقرير الثاني</span> ({reportBItem?.name})
                          </th>
                          <th className="p-3 text-center">حالة التغيير</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {displayedChecklist.map(({ id, titleAr, itemA, itemB, changeType }) => {
                          const renderStatusBadge = (item?: AuditItem) => {
                            if (!item) return <span className="text-slate-400 text-[11px]">— غير متوفر —</span>;
                            if (item.status === 'pass') {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  ناجح ({item.score}%)
                                </span>
                              );
                            }
                            if (item.status === 'warning') {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  تحذير ({item.score}%)
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                خطأ حرج ({item.score}%)
                              </span>
                            );
                          };

                          return (
                            <tr
                              key={id}
                              className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                                changeType === 'improved'
                                  ? 'bg-emerald-50/30 dark:bg-emerald-950/10'
                                  : changeType === 'regressed'
                                  ? 'bg-rose-50/30 dark:bg-rose-950/10'
                                  : ''
                              }`}
                            >
                              <td className="p-3">
                                <div className="font-bold text-slate-800 dark:text-slate-200">{titleAr}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{id}</div>
                              </td>
                              <td className="p-3">
                                <div>{renderStatusBadge(itemA)}</div>
                                {itemA?.currentValue && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-mono">
                                    {itemA.currentValue}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div>{renderStatusBadge(itemB)}</div>
                                {itemB?.currentValue && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-mono">
                                    {itemB.currentValue}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {changeType === 'improved' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                                    <TrendingUp className="w-3 h-3" />
                                    تم التحسين
                                  </span>
                                ) : changeType === 'regressed' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-full">
                                    <TrendingDown className="w-3 h-3" />
                                    تراجع
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-medium">بدون تغيير</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: Technical Metrics Comparison */}
              {activeTab === 'metrics' && reportA && reportB && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Report A Technicals */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 pb-2 border-b border-slate-200 dark:border-slate-700">
                      بيانات التقرير الأول: {reportAItem?.name}
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">عنوان الصفحة Title:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[60%] truncate text-left">
                          {reportA.pageTitle || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">طول العنوان:</span>
                        <span className="font-mono">{reportA.pageTitle?.length || 0} حرف</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">عدد الكلمات:</span>
                        <span className="font-mono">{reportA.wordCount} كلمة</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">إجمالي الصور:</span>
                        <span className="font-mono">{reportA.images.total} (ناقص الوسم: {reportA.images.withoutAlt})</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">عناوين H1:</span>
                        <span className="font-mono">{reportA.headings.h1.length} عنوان</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">خريطة الموقع Sitemap:</span>
                        <span>{reportA.sitemapFound ? 'موجودة ✅' : 'مفقودة ❌'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">ملف Robots.txt:</span>
                        <span>{reportA.robotsTxtFound ? 'موجود ✅' : 'مفقود ❌'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Report B Technicals */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 pb-2 border-b border-slate-200 dark:border-slate-700">
                      بيانات التقرير الثاني: {reportBItem?.name}
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">عنوان الصفحة Title:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[60%] truncate text-left">
                          {reportB.pageTitle || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">طول العنوان:</span>
                        <span className="font-mono">{reportB.pageTitle?.length || 0} حرف</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">عدد الكلمات:</span>
                        <span className="font-mono">{reportB.wordCount} كلمة</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">إجمالي الصور:</span>
                        <span className="font-mono">{reportB.images.total} (ناقص الوسم: {reportB.images.withoutAlt})</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">عناوين H1:</span>
                        <span className="font-mono">{reportB.headings.h1.length} عنوان</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">خريطة الموقع Sitemap:</span>
                        <span>{reportB.sitemapFound ? 'موجودة ✅' : 'مفقودة ❌'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">ملف Robots.txt:</span>
                        <span>{reportB.robotsTxtFound ? 'موجود ✅' : 'مفقود ❌'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>يتم حفظ التقارير محلياً في متصفحك لتمكينك من متابعة الإصلاحات دون فقدان البيانات.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            إغلاق نافذة المقارنة
          </button>
        </div>
      </div>
    </div>
  );
};
