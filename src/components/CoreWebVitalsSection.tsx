import React, { useState, useMemo, useCallback } from 'react';
import {
  Gauge,
  Zap,
  MousePointerClick,
  Layers,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  RotateCcw,
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react';
import { CoreWebVitalsAnalysis, CoreWebVitalsMetric, CWVStatus } from '../types/seo';
import { calculateCoreWebVitals } from '../utils/cwvCalculator';
import { LivePerformanceMonitor } from './LivePerformanceMonitor';

interface CoreWebVitalsSectionProps {
  analysis?: CoreWebVitalsAnalysis;
  pageUrl: string;
  loadTimeMs?: number;
  pageSizeKb?: number;
}

export const CoreWebVitalsSection: React.FC<CoreWebVitalsSectionProps> = ({
  analysis: initialAnalysis,
  pageUrl,
  loadTimeMs = 450,
  pageSizeKb = 500
}) => {
  // Device mode: mobile or desktop (Google defaults to mobile-first indexing)
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  
  // Selected metric tab for detailed deep dive
  const [activeMetricTab, setActiveMetricTab] = useState<'lcp' | 'fid' | 'cls' | 'inp' | 'ttfb'>('lcp');

  // Copy code feedback
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<string | null>(null);

  // Live Performance Monitor synchronized state
  const [simulatedFromMonitor, setSimulatedFromMonitor] = useState<{
    analysis: CoreWebVitalsAnalysis;
    hasActiveSimulations: boolean;
  } | null>(null);

  // Stable callback with identity preservation to prevent re-render loops
  const handleSimulatedAnalysisChange = useCallback(
    (simAnalysis: CoreWebVitalsAnalysis, hasActive: boolean) => {
      setSimulatedFromMonitor((prev) => {
        if (!hasActive && (!prev || !prev.hasActiveSimulations)) {
          return prev;
        }
        if (
          prev?.hasActiveSimulations === hasActive &&
          prev?.analysis?.overallScore === simAnalysis.overallScore &&
          prev?.analysis?.metrics?.lcp?.value === simAnalysis.metrics.lcp.value
        ) {
          return prev;
        }
        return {
          analysis: simAnalysis,
          hasActiveSimulations: hasActive
        };
      });
    },
    []
  );

  // Compute or adapt analysis based on device toggle or live monitor simulations
  const activeAnalysis = useMemo(() => {
    // If Live Performance Monitor has active simulations, reflect them across the entire section in real-time
    if (simulatedFromMonitor?.hasActiveSimulations && simulatedFromMonitor.analysis) {
      return simulatedFromMonitor.analysis;
    }

    if (device !== 'mobile' || !initialAnalysis) {
      return calculateCoreWebVitals({
        loadTimeMs,
        pageSizeKb,
        totalImages: 12,
        imagesWithoutDimensions: 6,
        scriptsCount: 10,
        cssCount: 3,
        domElementsCount: 850,
        device
      });
    }

    return initialAnalysis;
  }, [simulatedFromMonitor, initialAnalysis, device, loadTimeMs, pageSizeKb]);

  if (!activeAnalysis) return null;

  const { metrics, overallStatus, overallScore, summaryAr } = activeAnalysis;
  const currentMetric = metrics[activeMetricTab] || metrics.lcp;

  const handleCopy = (snippet: string, key: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetIndex(key);
    setTimeout(() => setCopiedSnippetIndex(null), 2000);
  };


  const getStatusColor = (status: CWVStatus) => {
    switch (status) {
      case 'good':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-700 dark:text-emerald-300',
          badge: 'bg-emerald-500 text-white',
          labelAr: 'جيد (Good)',
          barColor: 'bg-emerald-500'
        };
      case 'needs_improvement':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-300',
          badge: 'bg-amber-500 text-white',
          labelAr: 'بحاجة لتحسين',
          barColor: 'bg-amber-500'
        };
      case 'poor':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800',
          text: 'text-rose-700 dark:text-rose-300',
          badge: 'bg-rose-500 text-white',
          labelAr: 'ضعيف (Poor)',
          barColor: 'bg-rose-500'
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors space-y-6">
      {/* 1. Header & Google Evaluation Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Gauge className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              مؤشرات أداء الويب الأساسية (Google Core Web Vitals)
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                getStatusColor(overallStatus).badge
              }`}
            >
              {overallStatus === 'good'
                ? 'اجتاز المعايير بنجاح'
                : overallStatus === 'needs_improvement'
                ? 'يحتاج إلى تحسينات'
                : 'أداء بحاجة لتدخل عاجل'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            المعايير المعتمدة رسمياً من قِبل Google لقياس تجربة المستخدم الحقيقية: سرعة التحميل الأولي (LCP)، والاستجابة للتفاعل (FID / INP)، والاستقرار البصري لمنع اهتزاز الصفحة (CLS).
          </p>
        </div>

        {/* Controls: Device Mode & External PageSpeed Tool */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Device Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                device === 'mobile'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>الهاتف الجوال (Mobile)</span>
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                device === 'desktop'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>سطح المكتب</span>
            </button>
          </div>

          {/* Quick jump to Live Performance Monitor */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('live-performance-monitor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>مراقب الأداء الفوري (Live)</span>
            {simulatedFromMonitor?.hasActiveSimulations && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            )}
          </button>

          {/* Google PageSpeed Insights External Link */}
          <a
            href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(pageUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
          >
            <span>اختبار PageSpeed</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Active Real-time Simulation Notice Banner */}
      {simulatedFromMonitor?.hasActiveSimulations && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">
              المؤشرات المعروضة أدناه تعكس المحاكاة اللحظية لتحسينات السرعة المطبقة من لوحة 'مراقب الأداء الفوري'
            </span>
          </div>
          <span className="text-[11px] font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-mono shrink-0">
            محاكاة نشطة
          </span>
        </div>
      )}

      {/* 2. Executive Summary Alert */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
          getStatusColor(overallStatus).bg
        } ${getStatusColor(overallStatus).border}`}
      >
        <div className="shrink-0 mt-0.5">
          {overallStatus === 'good' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : overallStatus === 'needs_improvement' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          )}
        </div>
        <div className="text-xs leading-relaxed flex-1">
          <p className={`font-bold ${getStatusColor(overallStatus).text}`}>{summaryAr}</p>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {activeAnalysis.recommendationsSummaryAr}
          </p>
        </div>
        <div className="text-center pl-2 shrink-0 border-r border-slate-200 dark:border-slate-700/60 pr-3">
          <span className="text-[10px] text-slate-400 block font-medium">درجة الأداء</span>
          <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
            {overallScore}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </span>
        </div>
      </div>

      {/* 3. The 3 Primary Core Web Vitals Cards (LCP, FID, CLS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: LCP */}
        <div
          onClick={() => setActiveMetricTab('lcp')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMetricTab === 'lcp'
              ? 'ring-2 ring-indigo-500 shadow-md border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800/90'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                LCP (أكبر رسم للمحتوى)
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                getStatusColor(metrics.lcp.status).badge
              }`}
            >
              {getStatusColor(metrics.lcp.status).labelAr}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
              {metrics.lcp.value}
            </span>
            <span className="text-xs font-bold text-slate-500">ثانية</span>
            <span className="text-[11px] text-slate-400 mr-auto font-mono">
              الهدف: ≤ 2.5 ث
            </span>
          </div>

          {/* Visual Threshold Bar */}
          <div className="space-y-1 mt-3">
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div className="w-[40%] bg-emerald-500" title="جيد (أقل من 2.5 ثانية)" />
              <div className="w-[30%] bg-amber-500" title="يحتاج تحسين (2.5 - 4.0 ثانية)" />
              <div className="w-[30%] bg-rose-500" title="ضعيف (أكثر من 4.0 ثانية)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0ث</span>
              <span>2.5ث</span>
              <span>4.0ث</span>
              <span>+</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
            {metrics.lcp.categoryAr}
          </p>
        </div>

        {/* Card 2: FID */}
        <div
          onClick={() => setActiveMetricTab('fid')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMetricTab === 'fid'
              ? 'ring-2 ring-indigo-500 shadow-md border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800/90'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                FID (تأخير الإدخال الأول)
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                getStatusColor(metrics.fid.status).badge
              }`}
            >
              {getStatusColor(metrics.fid.status).labelAr}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
              {metrics.fid.value}
            </span>
            <span className="text-xs font-bold text-slate-500">مللي ثانية</span>
            <span className="text-[11px] text-slate-400 mr-auto font-mono">
              الهدف: ≤ 100 م.ث
            </span>
          </div>

          {/* Visual Threshold Bar */}
          <div className="space-y-1 mt-3">
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div className="w-[33%] bg-emerald-500" title="جيد (أقل من 100 مللي ثانية)" />
              <div className="w-[33%] bg-amber-500" title="يحتاج تحسين (100 - 300 مللي ثانية)" />
              <div className="w-[34%] bg-rose-500" title="ضعيف (أكثر من 300 مللي ثانية)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0</span>
              <span>100</span>
              <span>300</span>
              <span>+</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
            {metrics.fid.categoryAr}
          </p>
        </div>

        {/* Card 3: CLS */}
        <div
          onClick={() => setActiveMetricTab('cls')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMetricTab === 'cls'
              ? 'ring-2 ring-indigo-500 shadow-md border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800/90'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                CLS (التحول التراكمي للتخطيط)
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                getStatusColor(metrics.cls.status).badge
              }`}
            >
              {getStatusColor(metrics.cls.status).labelAr}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-2">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
              {metrics.cls.value}
            </span>
            <span className="text-xs font-bold text-slate-500">نقطة</span>
            <span className="text-[11px] text-slate-400 mr-auto font-mono">
              الهدف: ≤ 0.1
            </span>
          </div>

          {/* Visual Threshold Bar */}
          <div className="space-y-1 mt-3">
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div className="w-[30%] bg-emerald-500" title="جيد (أقل من 0.1)" />
              <div className="w-[30%] bg-amber-500" title="يحتاج تحسين (0.1 - 0.25)" />
              <div className="w-[40%] bg-rose-500" title="ضعيف (أكثر من 0.25)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.0</span>
              <span>0.10</span>
              <span>0.25</span>
              <span>+</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
            {metrics.cls.categoryAr}
          </p>
        </div>
      </div>

      {/* 4. Secondary Companion Metrics Strip (INP, TTFB, FCP) */}
      <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
        {/* INP */}
        <div
          onClick={() => setActiveMetricTab('inp')}
          className={`p-2 rounded-lg cursor-pointer transition-colors ${
            activeMetricTab === 'inp' ? 'bg-indigo-50 dark:bg-indigo-950/60' : 'hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>INP (تفاعل الإطار التالي)</span>
            <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${getStatusColor(metrics.inp?.status || 'good').badge}`}>
              {metrics.inp?.value} م.ث
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">معيار الاستجابة الأحدث من جوجل</span>
        </div>

        {/* TTFB */}
        <div
          onClick={() => setActiveMetricTab('ttfb')}
          className={`p-2 rounded-lg cursor-pointer transition-colors ${
            activeMetricTab === 'ttfb' ? 'bg-indigo-50 dark:bg-indigo-950/60' : 'hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>TTFB (زمن أول بايت)</span>
            <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${getStatusColor(metrics.ttfb?.status || 'good').badge}`}>
              {metrics.ttfb?.value} م.ث
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">استجابة السيرفر وشبكة الاستضافة</span>
        </div>

        {/* FCP */}
        <div className="p-2 rounded-lg">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>FCP (أول رسم للمحتوى)</span>
            <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${getStatusColor(metrics.fcp?.status || 'good').badge}`}>
              {metrics.fcp?.value} ث
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">بداية ظهور أول عنصر مرئي</span>
        </div>
      </div>

      {/* 5. Deep-Dive Inspector: Metric Details, Diagnostics & Actionable Optimization Guides */}
      <div className="bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
        {/* Navigation Tabs for Details */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            شرح وتطوير المؤشر:
          </span>
          <button
            onClick={() => setActiveMetricTab('lcp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeMetricTab === 'lcp'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            LCP (سرعة التحميل)
          </button>
          <button
            onClick={() => setActiveMetricTab('fid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeMetricTab === 'fid'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            FID (الاستجابة للتفاعل)
          </button>
          <button
            onClick={() => setActiveMetricTab('cls')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeMetricTab === 'cls'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            CLS (الثبات البصري)
          </button>
          <button
            onClick={() => setActiveMetricTab('inp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeMetricTab === 'inp'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            INP (التفاعل الشامل)
          </button>
          <button
            onClick={() => setActiveMetricTab('ttfb')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeMetricTab === 'ttfb'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            TTFB (الخادم)
          </button>
        </div>

        {/* Metric Explanation & SEO Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                ماذا يقيس {currentMetric.name} ({currentMetric.fullNameEn})؟
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentMetric.descriptionAr}
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                تأثير هذا المؤشر على تصدر محركات البحث (Google SEO)
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentMetric.impactOnSeoAr}
            </p>
          </div>
        </div>

        {/* Current Page Diagnostics */}
        {currentMetric.diagnosticsAr && currentMetric.diagnosticsAr.length > 0 && (
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              تشخيصات الصفحة الممسوحة الخاصة بمؤشر {currentMetric.name}:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {currentMetric.diagnosticsAr.map((diag, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold shrink-0">•</span>
                  <span>{diag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actionable Step-by-Step Optimization Guides */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            كيفية تحسين مؤشر {currentMetric.name} وتطوير سرعة تحميل الصفحات عملياً:
          </h4>

          <div className="space-y-3">
            {currentMetric.optimizationGuides.map((guide, gIdx) => {
              const snippetKey = `${currentMetric.id}-${gIdx}`;
              return (
                <div
                  key={gIdx}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">
                        {gIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {guide.titleAr}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          guide.difficulty === 'easy'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : guide.difficulty === 'medium'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                        }`}
                      >
                        {guide.difficulty === 'easy'
                          ? 'سهل التطبيق'
                          : guide.difficulty === 'medium'
                          ? 'متوسط الصعوبة'
                          : 'متقدم برمجياً'}
                      </span>

                      {guide.expectedGainAr && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                          {guide.expectedGainAr}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pr-7">
                    {guide.actionAr}
                  </p>

                  {/* Ready-to-copy Code Snippet */}
                  {guide.codeSnippet && (
                    <div className="mr-7 relative group">
                      <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 text-left dir-ltr">
                        <pre>{guide.codeSnippet}</pre>
                      </div>
                      <button
                        onClick={() => handleCopy(guide.codeSnippet!, snippetKey)}
                        className="absolute top-2 right-2 px-2.5 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1 border border-slate-700 cursor-pointer shadow-xs"
                      >
                        {copiedSnippetIndex === snippetKey ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-300" />
                            <span>نسخ الكود</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Live Performance Monitor Panel (لوحة مراقب أداء فوري) */}
      <div id="live-performance-monitor">
        <LivePerformanceMonitor
          pageUrl={pageUrl}
          initialLoadTimeMs={loadTimeMs}
          initialPageSizeKb={pageSizeKb}
          device={device}
          onSimulatedAnalysisChange={handleSimulatedAnalysisChange}
        />
      </div>
    </div>
  );
};
