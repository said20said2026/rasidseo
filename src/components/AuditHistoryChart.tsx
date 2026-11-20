import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Zap,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Trash2,
  PlusCircle,
  Table,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AuditResult } from '../types/seo';
import {
  AuditHistoryRecord,
  getAuditHistory,
  recordAuditRun,
  seedRealisticHistory,
  clearAuditHistory,
  removeHistoryRecord,
  exportAuditHistoryToCsv,
  exportAuditHistoryToJson
} from '../utils/auditHistoryStorage';

export type MetricViewMode = 'score' | 'speed' | 'dual' | 'categories' | 'errors';

interface AuditHistoryChartProps {
  url: string;
  currentScore: number;
  currentSpeedMs: number;
  analyzedAt: string;
  auditData?: AuditResult;
}

export const AuditHistoryChart: React.FC<AuditHistoryChartProps> = ({
  url,
  currentScore,
  currentSpeedMs,
  analyzedAt,
  auditData
}) => {
  const { theme } = useTheme();
  const [metricView, setMetricView] = useState<MetricViewMode>('score');
  const [historyLimit, setHistoryLimit] = useState<'all' | '5' | '10'>('all');
  const [historyRecords, setHistoryRecords] = useState<AuditHistoryRecord[]>([]);
  const [showLogTable, setShowLogTable] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPointScore, setNewPointScore] = useState(currentScore);
  const [newPointSpeed, setNewPointSpeed] = useState(currentSpeedMs);
  const [newPointLabel, setNewPointLabel] = useState('تحسين جديد');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Responsive mobile screen detection (< 640px)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive tick formatter for X-Axis to prevent text collision on small screens
  const formatXAxisTick = (val: string) => {
    if (!val) return '';
    if (!isMobile) return val;
    // On small screens, remove extra suffixes like "(الآن)" or "(بداية)" to preserve space
    return val.replace(/\s*\(.*?\)/g, '').trim();
  };

  // Dynamic responsive chart container height based on mode & viewport
  const chartHeightClass = useMemo(() => {
    if (metricView === 'categories') {
      return isMobile ? 'h-80' : 'h-88';
    }
    if (metricView === 'dual') {
      return isMobile ? 'h-76' : 'h-84';
    }
    return isMobile ? 'h-72' : 'h-80';
  }, [metricView, isMobile]);

  // Extract clean hostname for display
  const hostname = useMemo(() => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    } catch {
      return url.split('/')[0] || 'example.com';
    }
  }, [url]);

  // Load and sync history from localStorage
  useEffect(() => {
    let existing = getAuditHistory(url);

    const categories = auditData?.categories
      ? {
          onpage: auditData.categories.onpage.score,
          technical: auditData.categories.technical.score,
          content: auditData.categories.content.score,
          performance: auditData.categories.performance.score,
          security: auditData.categories.security.score,
          social: auditData.categories.social.score
        }
      : {
          onpage: currentScore,
          technical: currentScore,
          content: currentScore,
          performance: currentScore,
          security: currentScore,
          social: currentScore
        };

    const criticalCount = auditData?.items?.filter((i) => i.status === 'error').length || 0;
    const warningsCount = auditData?.items?.filter((i) => i.status === 'warning').length || 0;
    const passedCount = auditData?.items?.filter((i) => i.status === 'pass').length || 0;

    const currentRecordPayload = {
      url,
      analyzedAt: analyzedAt || new Date().toISOString(),
      score: currentScore,
      speedMs: currentSpeedMs,
      pageSizeKb: auditData?.pageSizeKb || 128,
      wordCount: auditData?.wordCount || 850,
      criticalErrorsCount: criticalCount,
      warningsCount: warningsCount,
      passedCount: passedCount,
      categories,
      label: 'الفحص المباشر',
      notes: 'تم فحص الموقع وتحديث المقاييس عبر راصد سيو'
    };

    if (!existing || existing.length === 0) {
      // First time scanning this URL: seed a realistic 4-point progression to provide immediate trend insights
      existing = seedRealisticHistory(url, currentRecordPayload);
    } else {
      // Update with current scan
      existing = recordAuditRun(url, currentRecordPayload);
    }

    setHistoryRecords(existing);
  }, [url, currentScore, currentSpeedMs, analyzedAt, auditData]);

  // Filtered view based on limit
  const visibleData = useMemo(() => {
    if (historyLimit === '5') {
      return historyRecords.slice(-5);
    }
    if (historyLimit === '10') {
      return historyRecords.slice(-10);
    }
    return historyRecords;
  }, [historyRecords, historyLimit]);

  // Derived KPI calculations
  const firstPoint = historyRecords[0];
  const lastPoint = historyRecords[historyRecords.length - 1] || {
    score: currentScore,
    speedMs: currentSpeedMs,
    criticalErrorsCount: 0,
    warningsCount: 0
  };

  const scoreDiff = firstPoint ? lastPoint.score - firstPoint.score : 0;
  const speedDiff = firstPoint ? lastPoint.speedMs - firstPoint.speedMs : 0;
  const highestScore = historyRecords.length > 0 ? Math.max(...historyRecords.map((d) => d.score)) : currentScore;
  const lowestSpeedMs = historyRecords.length > 0 ? Math.min(...historyRecords.map((d) => d.speedMs)) : currentSpeedMs;
  const avgScore = historyRecords.length > 0
    ? Math.round(historyRecords.reduce((acc, curr) => acc + curr.score, 0) / historyRecords.length)
    : currentScore;

  // Handler to clear history
  const handleClearHistory = () => {
    if (window.confirm(`هل أنت متأكد من رغبتك في مسح كافة سجلات الفحص المحفوظة لنطاق ${hostname}؟`)) {
      clearAuditHistory(url);
      const reset = recordAuditRun(url, {
        url,
        analyzedAt: new Date().toISOString(),
        score: currentScore,
        speedMs: currentSpeedMs,
        pageSizeKb: auditData?.pageSizeKb || 120,
        wordCount: auditData?.wordCount || 800,
        criticalErrorsCount: 0,
        warningsCount: 0,
        passedCount: 15,
        categories: {
          onpage: currentScore,
          technical: currentScore,
          content: currentScore,
          performance: currentScore,
          security: currentScore,
          social: currentScore
        },
        label: 'بداية السجل الجديد'
      });
      setHistoryRecords(reset);
    }
  };

  // Handler to delete a specific record
  const handleDeleteRecord = (id: string) => {
    const updated = removeHistoryRecord(url, id);
    setHistoryRecords(updated);
  };

  // Handler to add a custom milestone record
  const handleAddManualPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = recordAuditRun(url, {
      url,
      analyzedAt: new Date().toISOString(),
      score: Number(newPointScore),
      speedMs: Number(newPointSpeed),
      pageSizeKb: auditData?.pageSizeKb || 120,
      wordCount: auditData?.wordCount || 800,
      criticalErrorsCount: Math.max(0, Math.round((100 - newPointScore) / 15)),
      warningsCount: Math.max(0, Math.round((100 - newPointScore) / 10)),
      passedCount: 12,
      categories: {
        onpage: newPointScore,
        technical: newPointScore,
        content: newPointScore,
        performance: Math.max(30, Math.min(100, Math.round(100 - newPointSpeed / 15))),
        security: newPointScore,
        social: newPointScore
      },
      label: newPointLabel || 'فحص تجريبي'
    });
    setHistoryRecords(newRecord);
    setShowAddModal(false);
  };

  // Export handlers
  const handleExportCsv = () => {
    const csvContent = exportAuditHistoryToCsv(historyRecords);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `seo_history_${hostname}.csv`;
    link.click();
    showToast('تم تصدير ملف CSV بنجاح');
  };

  const handleExportJson = () => {
    const jsonContent = exportAuditHistoryToJson(historyRecords);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `seo_history_${hostname}.json`;
    link.click();
    showToast('تم تصدير ملف JSON بنجاح');
  };

  const showToast = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Custom Rich Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as AuditHistoryRecord;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white p-4 rounded-xl border border-slate-700 shadow-2xl text-xs font-sans dir-rtl text-right min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
            <div>
              <span className="font-bold text-slate-200 block text-sm">{dataPoint.formattedDate}</span>
              <span className="text-[10px] text-slate-400 font-mono">{dataPoint.formattedTime}</span>
            </div>
            {dataPoint.label && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
                {dataPoint.label}
              </span>
            )}
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 font-sans text-xs">تقييم السيو العام:</span>
              <span className="font-black text-sm text-emerald-400 tabular-nums">
                {dataPoint.score} <span className="text-[10px] text-slate-400">/ 100</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 font-sans text-xs">زمن الاستجابة (TTFB):</span>
              <span className="font-bold text-sky-300 tabular-nums">{dataPoint.speedMs} ms</span>
            </div>

            {dataPoint.pageSizeKb > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300 font-sans text-xs">حجم الصفحة:</span>
                <span className="font-medium text-amber-300 tabular-nums">{dataPoint.pageSizeKb} KB</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-slate-800">
              <span className="text-slate-300 font-sans text-xs">الأخطاء والتنبيهات:</span>
              <div className="flex items-center gap-2 font-bold">
                <span className="text-rose-400 tabular-nums">{dataPoint.criticalErrorsCount} أخطاء</span>
                <span className="text-amber-400 tabular-nums">· {dataPoint.warningsCount} تنبيه</span>
              </div>
            </div>

            {dataPoint.categories && (
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-sans">
                <div className="flex justify-between text-slate-400">
                  <span>السيو الداخلي:</span>
                  <span className="font-bold text-slate-200 font-mono">{dataPoint.categories.onpage}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>التقني:</span>
                  <span className="font-bold text-slate-200 font-mono">{dataPoint.categories.technical}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>المحتوى:</span>
                  <span className="font-bold text-slate-200 font-mono">{dataPoint.categories.content}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>السرعة:</span>
                  <span className="font-bold text-slate-200 font-mono">{dataPoint.categories.performance}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const gridStroke = theme === 'dark' ? '#334155' : '#E2E8F0';
  const axisColor = theme === 'dark' ? '#94A3B8' : '#64748B';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs transition-colors relative">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shadow-indigo-200 dark:shadow-indigo-950 shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  مخطط التطور الزمني التفاعلي للسيو والسرعة (Recharts)
                </h3>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  localStorage
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تتبع مسار تحسن نطاق <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{hostname}</span> عند معالجة الأخطاء وتحديث المحتوى
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Horizontally scrollable on mobile without wrapping ugly) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto self-start lg:self-auto">
          <div className="overflow-x-auto max-w-full pb-1 -mx-1 px-1 flex items-center gap-1.5 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setMetricView('score')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  metricView === 'score'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                نقاط السيو
              </button>
              <button
                type="button"
                onClick={() => setMetricView('speed')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  metricView === 'speed'
                    ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                السرعة (ms)
              </button>
              <button
                type="button"
                onClick={() => setMetricView('dual')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  metricView === 'dual'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                المخطط المزدوج
              </button>
              <button
                type="button"
                onClick={() => setMetricView('categories')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  metricView === 'categories'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                الفئات الست
              </button>
              <button
                type="button"
                onClick={() => setMetricView('errors')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  metricView === 'errors'
                    ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                الأخطاء
              </button>
            </div>

            {/* Time Limit Filter */}
            <div className="flex items-center p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setHistoryLimit('all')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  historyLimit === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                الكل ({historyRecords.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryLimit('5')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  historyLimit === '5'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                آخر 5
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 my-4 sm:my-5">
        {/* KPI 1: Score Evolution */}
        <div className="p-2.5 sm:p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block mb-1 truncate">
            التقييم الحالي وتطوره
          </span>
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-white tabular-nums">
              {lastPoint.score}
              <span className="text-[10px] sm:text-xs text-slate-400 font-sans font-normal"> / 100</span>
            </span>
            {scoreDiff !== 0 && (
              <span
                className={`text-[10px] sm:text-xs font-bold flex items-center px-1.5 py-0.5 rounded ${
                  scoreDiff > 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                }`}
              >
                {scoreDiff > 0 ? <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />}
                {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: All-time Peak Score */}
        <div className="p-2.5 sm:p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block mb-1 truncate">
            أعلى تقييم مسجل
          </span>
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono font-black text-lg sm:text-xl text-indigo-700 dark:text-indigo-400 tabular-nums">
              {highestScore}
              <span className="text-[10px] sm:text-xs text-slate-400 font-sans font-normal"> / 100</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
              متوسط: {avgScore}
            </span>
          </div>
        </div>

        {/* KPI 3: Speed Evolution */}
        <div className="p-2.5 sm:p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block mb-1 truncate">
            زمن استجابة الخادم
          </span>
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-white tabular-nums">
              {lastPoint.speedMs}
              <span className="text-[10px] sm:text-xs text-slate-400 font-sans font-normal"> ms</span>
            </span>
            {speedDiff !== 0 && (
              <span
                className={`text-[10px] sm:text-xs font-bold flex items-center px-1.5 py-0.5 rounded ${
                  speedDiff < 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {speedDiff < 0 ? <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" /> : <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />}
                {speedDiff < 0 ? `${Math.abs(speedDiff)}ms` : `+${speedDiff}ms`}
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: Total Scans Saved */}
        <div className="p-2.5 sm:p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block mb-1 truncate">
            إجمالي الفحوصات
          </span>
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono font-black text-lg sm:text-xl text-purple-600 dark:text-purple-400 tabular-nums">
              {historyRecords.length}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <History className="w-3 h-3 text-slate-400" />
              <span>محفوظ</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Recharts Container with responsive height and zero-minimum width */}
      <div className={`${chartHeightClass} w-full pt-1 sm:pt-2`}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
          {metricView === 'score' ? (
            /* Mode 1: AreaChart for Overall SEO Score with Gradient */
            <AreaChart
              data={visibleData}
              margin={{
                top: 15,
                right: isMobile ? 6 : 16,
                left: isMobile ? -10 : 0,
                bottom: isMobile ? 12 : 5
              }}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={{ stroke: gridStroke }}
                tick={{ fill: axisColor, fontSize: isMobile ? 10 : 11 }}
                tickMargin={isMobile ? 6 : 8}
                minTickGap={isMobile ? 22 : 12}
                interval={isMobile ? 'preserveStartEnd' : 0}
                tickFormatter={formatXAxisTick}
              />
              <YAxis
                domain={[0, 100]}
                orientation="right"
                width={isMobile ? 30 : 40}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#4F46E5', fontSize: isMobile ? 10 : 11 }}
              />
              <ReferenceLine
                y={90}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{
                  value: isMobile ? 'الهدف: 90+' : 'الهدف المثالي (90+)',
                  fill: '#10B981',
                  fontSize: isMobile ? 9 : 10,
                  position: isMobile ? 'insideTopLeft' : 'insideTopRight'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                name="نقاط السيو (Score)"
                stroke="#4F46E5"
                strokeWidth={isMobile ? 2.5 : 3}
                fillOpacity={1}
                fill="url(#scoreGradient)"
                dot={{ r: isMobile ? 4 : 5, fill: '#4F46E5', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: isMobile ? 6 : 7, fill: '#3730A3', strokeWidth: 2, stroke: '#FFFFFF' }}
              />
            </AreaChart>
          ) : metricView === 'speed' ? (
            /* Mode 2: AreaChart for Load Time (Speed in ms) */
            <AreaChart
              data={visibleData}
              margin={{
                top: 15,
                right: isMobile ? 6 : 16,
                left: isMobile ? -8 : 0,
                bottom: isMobile ? 12 : 5
              }}
            >
              <defs>
                <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={{ stroke: gridStroke }}
                tick={{ fill: axisColor, fontSize: isMobile ? 10 : 11 }}
                tickMargin={isMobile ? 6 : 8}
                minTickGap={isMobile ? 22 : 12}
                interval={isMobile ? 'preserveStartEnd' : 0}
                tickFormatter={formatXAxisTick}
              />
              <YAxis
                orientation="right"
                width={isMobile ? 38 : 50}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#0284C7', fontSize: isMobile ? 10 : 11 }}
                tickFormatter={(val) => (isMobile ? `${val}` : `${val}ms`)}
              />
              <ReferenceLine
                y={600}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{
                  value: isMobile ? 'الهدف: 600ms' : 'الحد الموصى به (600ms)',
                  fill: '#F59E0B',
                  fontSize: isMobile ? 9 : 10,
                  position: isMobile ? 'insideTopLeft' : 'insideTopRight'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="speedMs"
                name="زمن الاستجابة (ms)"
                stroke="#0284C7"
                strokeWidth={isMobile ? 2.5 : 3}
                fillOpacity={1}
                fill="url(#speedGradient)"
                dot={{ r: isMobile ? 4 : 5, fill: '#0284C7', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: isMobile ? 6 : 7, fill: '#0369A1', strokeWidth: 2, stroke: '#FFFFFF' }}
              />
            </AreaChart>
          ) : metricView === 'dual' ? (
            /* Mode 3: Dual-Axis LineChart for Score & Speed */
            <LineChart
              data={visibleData}
              margin={{
                top: 15,
                right: isMobile ? 4 : 14,
                left: isMobile ? 4 : 10,
                bottom: isMobile ? 12 : 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={{ stroke: gridStroke }}
                tick={{ fill: axisColor, fontSize: isMobile ? 10 : 11 }}
                tickMargin={isMobile ? 6 : 8}
                minTickGap={isMobile ? 22 : 12}
                interval={isMobile ? 'preserveStartEnd' : 0}
                tickFormatter={formatXAxisTick}
              />
              <YAxis
                yAxisId="scoreAxis"
                domain={[0, 100]}
                orientation="right"
                width={isMobile ? 28 : 38}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#4F46E5', fontSize: isMobile ? 10 : 11 }}
              />
              <YAxis
                yAxisId="speedAxis"
                orientation="left"
                width={isMobile ? 36 : 48}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#0284C7', fontSize: isMobile ? 10 : 11 }}
                tickFormatter={(val) => (isMobile ? `${val}` : `${val}ms`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align={isMobile ? 'center' : 'left'}
                iconSize={isMobile ? 8 : 10}
                wrapperStyle={{ paddingBottom: isMobile ? '8px' : '12px', fontSize: isMobile ? '10px' : '11px' }}
              />
              <Line
                yAxisId="scoreAxis"
                type="monotone"
                dataKey="score"
                name="نقاط السيو (Score)"
                stroke="#4F46E5"
                strokeWidth={isMobile ? 2.5 : 3}
                dot={{ r: isMobile ? 3.5 : 5, fill: '#4F46E5', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: isMobile ? 5.5 : 7, fill: '#3730A3', strokeWidth: 2, stroke: '#FFFFFF' }}
              />
              <Line
                yAxisId="speedAxis"
                type="monotone"
                dataKey="speedMs"
                name="زمن الاستجابة (ms)"
                stroke="#0284C7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: isMobile ? 3 : 4, fill: '#0284C7', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: isMobile ? 5 : 6, fill: '#0369A1', strokeWidth: 2, stroke: '#FFFFFF' }}
              />
            </LineChart>
          ) : metricView === 'categories' ? (
            /* Mode 4: 6 Categories Progression Multi-Line Chart */
            <LineChart
              data={visibleData}
              margin={{
                top: 15,
                right: isMobile ? 6 : 16,
                left: isMobile ? -10 : 0,
                bottom: isMobile ? 12 : 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={{ stroke: gridStroke }}
                tick={{ fill: axisColor, fontSize: isMobile ? 10 : 11 }}
                tickMargin={isMobile ? 6 : 8}
                minTickGap={isMobile ? 22 : 12}
                interval={isMobile ? 'preserveStartEnd' : 0}
                tickFormatter={formatXAxisTick}
              />
              <YAxis
                domain={[0, 100]}
                orientation="right"
                width={isMobile ? 30 : 40}
                tickLine={false}
                axisLine={false}
                tick={{ fill: axisColor, fontSize: isMobile ? 10 : 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align={isMobile ? 'center' : 'left'}
                iconSize={isMobile ? 7 : 9}
                wrapperStyle={{
                  paddingBottom: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '10px' : '11px',
                  lineHeight: isMobile ? '18px' : '22px'
                }}
              />
              <Line type="monotone" dataKey="categories.onpage" name="الداخلي" stroke="#4F46E5" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="categories.technical" name="التقني" stroke="#06B6D4" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="categories.content" name="المحتوى" stroke="#10B981" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="categories.performance" name="الأداء" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="categories.security" name="الأمان" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="categories.social" name="التواصل" stroke="#EC4899" strokeWidth={2} dot={{ r: 2.5 }} />
            </LineChart>
          ) : (
            /* Mode 5: Critical Errors & Warnings Reduction LineChart */
            <LineChart
              data={visibleData}
              margin={{
                top: 15,
                right: isMobile ? 6 : 16,
                left: isMobile ? -10 : 0,
                bottom: isMobile ? 12 : 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={{ stroke: gridStroke }}
                tick={{ fill: axisColor, fontSize: isMobile ? 10 : 11 }}
                tickMargin={isMobile ? 6 : 8}
                minTickGap={isMobile ? 22 : 12}
                interval={isMobile ? 'preserveStartEnd' : 0}
                tickFormatter={formatXAxisTick}
              />
              <YAxis
                orientation="right"
                width={isMobile ? 28 : 38}
                tickLine={false}
                axisLine={false}
                tick={{ fill: axisColor, fontSize: isMobile ? 10 : 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align={isMobile ? 'center' : 'left'}
                iconSize={isMobile ? 8 : 10}
                wrapperStyle={{ paddingBottom: isMobile ? '8px' : '12px', fontSize: isMobile ? '10px' : '11px' }}
              />
              <Line
                type="monotone"
                dataKey="criticalErrorsCount"
                name="أخطاء حرجة"
                stroke="#EF4444"
                strokeWidth={isMobile ? 2 : 2.5}
                dot={{ r: isMobile ? 4 : 5, fill: '#EF4444', strokeWidth: 2, stroke: '#FFFFFF' }}
              />
              <Line
                type="monotone"
                dataKey="warningsCount"
                name="تنبيهات"
                stroke="#F59E0B"
                strokeWidth={isMobile ? 1.5 : 2}
                dot={{ r: isMobile ? 3 : 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#FFFFFF' }}
              />
              <Line
                type="monotone"
                dataKey="passedCount"
                name="معايير ناجحة"
                stroke="#10B981"
                strokeWidth={isMobile ? 1.5 : 2}
                dot={{ r: isMobile ? 2.5 : 3, fill: '#10B981' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Action Footer: History Actions & Management */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowLogTable(!showLogTable)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer text-xs"
          >
            <Table className="w-3.5 h-3.5" />
            <span>{showLogTable ? 'إخفاء جدول الفحوصات' : 'عرض سجل الفحوصات التفصيلي'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>إضافة فحص تجريبي</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer text-xs"
            title="تصدير السجل كملف CSV للتحليل في إكسل و Google Sheets"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer text-xs"
            title="تصدير السجل كملف JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors cursor-pointer text-xs"
            title="مسح سجل الفحص المخزن محلياً لهذا النطاق"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح السجل</span>
          </button>
        </div>
      </div>

      {/* Expandable History Log Table Drawer */}
      {showLogTable && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-500" />
              <span>سجل الفحوصات المسجلة لنطاق {hostname} ({historyRecords.length} فحص)</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              يتم الحفظ التلقائي في ذاكرة المتصفح localStorage
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                <tr>
                  <th className="py-2.5 px-3">التاريخ والوقت</th>
                  <th className="py-2.5 px-3">المحطة / الملاحظة</th>
                  <th className="py-2.5 px-3 text-center">النقاط</th>
                  <th className="py-2.5 px-3 text-center">السرعة</th>
                  <th className="py-2.5 px-3 text-center">أخطاء</th>
                  <th className="py-2.5 px-3 text-center">تنبيهات</th>
                  <th className="py-2.5 px-3 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {historyRecords.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-sans">
                      <div className="font-semibold">{item.formattedDate}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.formattedTime}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-sans text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {item.label || 'فحص'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-black ${
                          item.score >= 80
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                            : item.score >= 60
                            ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                            : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                        }`}
                      >
                        {item.score}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-sky-600 dark:text-sky-400 font-bold">
                      {item.speedMs}ms
                    </td>
                    <td className="py-2.5 px-3 text-center text-rose-500 font-bold">
                      {item.criticalErrorsCount}
                    </td>
                    <td className="py-2.5 px-3 text-center text-amber-500 font-bold">
                      {item.warningsCount}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="حذف هذا الفحص من السجل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Test Scan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>إضافة فحص تجريبي بالسجل</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              يمكنك محاكاة فحص جديد بعد تطبيق تحسينات برمجية لرؤية تفاعل مخطط Recharts وتحديث إحصائيات التطور فوراً.
            </p>

            <form onSubmit={handleAddManualPoint} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  عنوان المحطة / التحديث:
                </label>
                <input
                  type="text"
                  value={newPointLabel}
                  onChange={(e) => setNewPointLabel(e.target.value)}
                  placeholder="مثال: ترقية الخادم وتفعيل التخزين المؤقت"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300">نقاط السيو المتوقعة (Score):</label>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{newPointScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={newPointScore}
                  onChange={(e) => setNewPointScore(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300">زمن الاستجابة المتوقع (ms):</label>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{newPointSpeed} مللي ثانية</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="25"
                  value={newPointSpeed}
                  onChange={(e) => setNewPointSpeed(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs cursor-pointer"
                >
                  حفظ الفحص بالسجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
