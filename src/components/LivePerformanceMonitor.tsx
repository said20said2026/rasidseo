import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Gauge,
  Zap,
  Activity,
  Sliders,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ArrowDown,
  ArrowUp,
  Clock,
  Layout,
  Code,
  Image,
  Globe,
  Radio,
  FileCode,
  Maximize2,
  Flame,
  TrendingUp,
  Download
} from 'lucide-react';
import { CoreWebVitalsAnalysis, CoreWebVitalsMetric, CWVStatus } from '../types/seo';
import { calculateCoreWebVitals } from '../utils/cwvCalculator';

export interface OptimizationItem {
  id: string;
  nameAr: string;
  category: 'LCP' | 'CLS' | 'INP' | 'TTFB' | 'FCP';
  descriptionAr: string;
  impactScoreGain: number;
  timeReductionMs: number;
  clsReduction: number;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  codeSnippet: string;
  codeLang: string;
}

export const AVAILABLE_OPTIMIZATIONS: OptimizationItem[] = [
  {
    id: 'hero_preload',
    nameAr: 'التنزيل المسبق للصورة الرئيسية (Hero Image Preload)',
    category: 'LCP',
    descriptionAr: 'تضمين وسم <link rel="preload"> عالي الأولوية في ترويسة الصفحة للصورة أو البانر الرئيسي لتبكير تنزيله قبل معالجة ملفات CSS.',
    impactScoreGain: 12,
    timeReductionMs: 950,
    clsReduction: 0,
    icon: Zap,
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
    codeLang: 'html',
    codeSnippet: `<!-- إضافة الرابط في وسم <head> بأعلى الصفحة -->\n<link rel="preload" as="image" href="/assets/hero-banner.webp" fetchpriority="high" type="image/webp">`
  },
  {
    id: 'edge_cdn',
    nameAr: 'شبكة التوصيل السريع وتخزين الكاش (Edge CDN & Server Caching)',
    category: 'TTFB',
    descriptionAr: 'توزيع صفحات الموقع عبر خوادم حافة سحابية (Cloudflare / CloudFront) وتفعيل التخزين المؤقت لتقليص زمن معالجة واستجابة الخادم.',
    impactScoreGain: 14,
    timeReductionMs: 480,
    clsReduction: 0,
    icon: Globe,
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300',
    codeLang: 'apache / nginx',
    codeSnippet: `# إعدادات ترويسات الكاش الفائقة للخادم (Nginx / Cloudflare)\nadd_header Cache-Control "public, max-age=31536000, immutable";\nadd_header X-Cache-Status "HIT-EDGE";`
  },
  {
    id: 'nextgen_images',
    nameAr: 'ضغط وتحويل الصور لصيغ الجيل القادم (WebP / AVIF)',
    category: 'LCP',
    descriptionAr: 'ضغط كافة الصور بنسبة تصل إلى 60% مع اعتماد صيغتي WebP و AVIF والتحميل الكسول للصور خارج الجزء المرئي.',
    impactScoreGain: 10,
    timeReductionMs: 820,
    clsReduction: 0,
    icon: Image,
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
    codeLang: 'html',
    codeSnippet: `<picture>\n  <source srcset="/images/banner.avif" type="image/avif">\n  <source srcset="/images/banner.webp" type="image/webp">\n  <img src="/images/banner.jpg" alt="عنوان الصورة" loading="lazy" decoding="async">\n</picture>`
  },
  {
    id: 'aspect_ratio',
    nameAr: 'تثبيت أبعاد الصور والحاويات (Explicit Aspect Ratio)',
    category: 'CLS',
    descriptionAr: 'تعيين سمات العرض والارتفاع المسبقة لجميع الوسائط وحجز مساحات ثابتة عبر CSS لمنع قفز وتذبذب عناصر الصفحة أثناء التصفح.',
    impactScoreGain: 15,
    timeReductionMs: 0,
    clsReduction: 0.18,
    icon: Layout,
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    codeLang: 'css',
    codeSnippet: `/* حجز مساحة العناصر وتفادي اهتزاز التخطيط المفاجئ */\nimg, video, iframe {\n  aspect-ratio: 16 / 9;\n  width: 100%;\n  height: auto;\n}`
  },
  {
    id: 'defer_scripts',
    nameAr: 'تأجيل ملفات جافاسكريبت غير الحرجة (Defer / Async Scripts)',
    category: 'INP',
    descriptionAr: 'تأجيل تشغيل أدوات التحليل والإعلانات والمكتبات الثقيلة حتى اكتمال رسم الصفحة، مما يحرر المسار الرئيسي للمتصفح.',
    impactScoreGain: 11,
    timeReductionMs: 340,
    clsReduction: 0,
    icon: Code,
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
    codeLang: 'html',
    codeSnippet: `<!-- تأجيل السكريبتات لتسريع الاستجابة للنقر -->\n<script src="/js/analytics.js" defer></script>\n<script src="/js/chat-widget.js" async></script>`
  },
  {
    id: 'critical_css',
    nameAr: 'تضمين CSS الحرج وتبديل الخطوط (Font Display Swap)',
    category: 'FCP',
    descriptionAr: 'تضمين الستايل الأولي داخل كود HTML واستخدام خاصية font-display: swap لمنع وميض النصوص غير المرئية (FOIT).',
    impactScoreGain: 8,
    timeReductionMs: 380,
    clsReduction: 0.04,
    icon: Sparkles,
    badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950/80 dark:text-pink-300',
    codeLang: 'css',
    codeSnippet: `@font-face {\n  font-family: 'Cairo';\n  src: url('/fonts/cairo.woff2') format('woff2');\n  font-display: swap;\n}`
  }
];

export interface LivePerformanceMonitorProps {
  pageUrl: string;
  initialLoadTimeMs: number;
  initialPageSizeKb: number;
  initialDomElementsCount?: number;
  initialScriptsCount?: number;
  initialTotalImages?: number;
  initialImagesWithoutDim?: number;
  device: 'mobile' | 'desktop';
  onSimulatedAnalysisChange?: (analysis: CoreWebVitalsAnalysis, hasActiveSimulations: boolean) => void;
}

export const LivePerformanceMonitor: React.FC<LivePerformanceMonitorProps> = ({
  pageUrl,
  initialLoadTimeMs = 450,
  initialPageSizeKb = 520,
  initialDomElementsCount = 850,
  initialScriptsCount = 10,
  initialTotalImages = 12,
  initialImagesWithoutDim = 6,
  device = 'mobile',
  onSimulatedAnalysisChange
}) => {
  // Active selected optimizations state
  const [activeOptimizations, setActiveOptimizations] = useState<Record<string, boolean>>({
    hero_preload: false,
    edge_cdn: false,
    nextgen_images: false,
    aspect_ratio: false,
    defer_scripts: false,
    critical_css: false
  });

  // Real-time jitter simulator toggle (simulates real-world mobile 4G latency pulses)
  const [livePulsing, setLivePulsing] = useState<boolean>(true);
  const [pulseTick, setPulseTick] = useState<number>(0);

  // Tab for code export modal / drawer
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<string>('hero_preload');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live pulse effect every 3.5 seconds when active
  useEffect(() => {
    if (!livePulsing) return;
    const interval = setInterval(() => {
      setPulseTick((prev) => (prev + 1) % 100);
    }, 3500);
    return () => clearInterval(interval);
  }, [livePulsing]);

  // Count active fixes
  const activeFixCount = useMemo(() => {
    return Object.values(activeOptimizations).filter(Boolean).length;
  }, [activeOptimizations]);

  // Calculate baseline metrics (before optimizations)
  const baselineAnalysis = useMemo(() => {
    return calculateCoreWebVitals({
      loadTimeMs: initialLoadTimeMs,
      pageSizeKb: initialPageSizeKb,
      totalImages: initialTotalImages,
      imagesWithoutDimensions: initialImagesWithoutDim,
      scriptsCount: initialScriptsCount,
      cssCount: 3,
      domElementsCount: initialDomElementsCount,
      device
    });
  }, [
    initialLoadTimeMs,
    initialPageSizeKb,
    initialTotalImages,
    initialImagesWithoutDim,
    initialScriptsCount,
    initialDomElementsCount,
    device
  ]);

  // Calculate simulated metrics in real-time based on active optimizations
  const simulatedAnalysis = useMemo(() => {
    let simulatedLoadTime = initialLoadTimeMs;
    let simulatedPageSize = initialPageSizeKb;
    let simulatedImagesWithoutDim = initialImagesWithoutDim;
    let simulatedScripts = initialScriptsCount;
    let simulatedCssCount = 3;

    // Apply optimization impacts
    if (activeOptimizations.edge_cdn) {
      simulatedLoadTime = Math.max(90, Math.round(simulatedLoadTime * 0.35));
    }
    if (activeOptimizations.hero_preload) {
      simulatedLoadTime = Math.max(80, Math.round(simulatedLoadTime * 0.8));
    }
    if (activeOptimizations.nextgen_images) {
      simulatedPageSize = Math.max(120, Math.round(simulatedPageSize * 0.52));
    }
    if (activeOptimizations.aspect_ratio) {
      simulatedImagesWithoutDim = 0;
    }
    if (activeOptimizations.defer_scripts) {
      simulatedScripts = Math.max(2, Math.round(simulatedScripts * 0.3));
    }
    if (activeOptimizations.critical_css) {
      simulatedCssCount = 1;
      simulatedPageSize = Math.max(100, Math.round(simulatedPageSize * 0.92));
    }

    return calculateCoreWebVitals({
      loadTimeMs: simulatedLoadTime,
      pageSizeKb: simulatedPageSize,
      totalImages: initialTotalImages,
      imagesWithoutDimensions: simulatedImagesWithoutDim,
      scriptsCount: simulatedScripts,
      cssCount: simulatedCssCount,
      domElementsCount: initialDomElementsCount,
      device
    });
  }, [
    initialLoadTimeMs,
    initialPageSizeKb,
    initialTotalImages,
    initialImagesWithoutDim,
    initialScriptsCount,
    initialDomElementsCount,
    device,
    activeOptimizations
  ]);

  // Helper to compute simulated Core Web Vitals for any set of optimizations
  const computeSimulation = (opts: Record<string, boolean>, dev = device) => {
    let simulatedLoadTime = initialLoadTimeMs;
    let simulatedPageSize = initialPageSizeKb;
    let simulatedImagesWithoutDim = initialImagesWithoutDim;
    let simulatedScripts = initialScriptsCount;
    let simulatedCssCount = 3;

    if (opts.edge_cdn) {
      simulatedLoadTime = Math.max(90, Math.round(simulatedLoadTime * 0.35));
    }
    if (opts.hero_preload) {
      simulatedLoadTime = Math.max(80, Math.round(simulatedLoadTime * 0.8));
    }
    if (opts.nextgen_images) {
      simulatedPageSize = Math.max(120, Math.round(simulatedPageSize * 0.52));
    }
    if (opts.aspect_ratio) {
      simulatedImagesWithoutDim = 0;
    }
    if (opts.defer_scripts) {
      simulatedScripts = Math.max(2, Math.round(simulatedScripts * 0.3));
    }
    if (opts.critical_css) {
      simulatedCssCount = 1;
      simulatedPageSize = Math.max(100, Math.round(simulatedPageSize * 0.92));
    }

    return calculateCoreWebVitals({
      loadTimeMs: simulatedLoadTime,
      pageSizeKb: simulatedPageSize,
      totalImages: initialTotalImages,
      imagesWithoutDimensions: simulatedImagesWithoutDim,
      scriptsCount: simulatedScripts,
      cssCount: simulatedCssCount,
      domElementsCount: initialDomElementsCount,
      device: dev
    });
  };

  // Safe ref for parent callback without causing re-render cycles
  const onAnalysisChangeRef = useRef(onSimulatedAnalysisChange);
  onAnalysisChangeRef.current = onSimulatedAnalysisChange;

  // Sync if device changes while optimizations are active
  useEffect(() => {
    if (activeFixCount > 0) {
      const nextSim = computeSimulation(activeOptimizations, device);
      onAnalysisChangeRef.current?.(nextSim, true);
    }
  }, [device]);

  // Delta computations
  const scoreDelta = simulatedAnalysis.overallScore - baselineAnalysis.overallScore;
  const lcpDelta = Number((baselineAnalysis.metrics.lcp.value - simulatedAnalysis.metrics.lcp.value).toFixed(2));
  const ttfbDelta = Math.round((baselineAnalysis.metrics.ttfb?.value || 0) - (simulatedAnalysis.metrics.ttfb?.value || 0));
  const clsDelta = Number((baselineAnalysis.metrics.cls.value - simulatedAnalysis.metrics.cls.value).toFixed(3));
  const fidDelta = Math.round((baselineAnalysis.metrics.fid.value || 0) - (simulatedAnalysis.metrics.fid.value || 0));

  // Toggle single optimization (safely notifies parent in user event handler)
  const toggleOptimization = (id: string) => {
    const nextState = {
      ...activeOptimizations,
      [id]: !activeOptimizations[id]
    };
    setActiveOptimizations(nextState);

    const activeCount = Object.values(nextState).filter(Boolean).length;
    if (activeCount > 0) {
      const nextSim = computeSimulation(nextState, device);
      onAnalysisChangeRef.current?.(nextSim, true);
    } else {
      onAnalysisChangeRef.current?.(baselineAnalysis, false);
    }
  };

  // Toggle all on (safely notifies parent in user event handler)
  const handleApplyAll = () => {
    const allEnabled = Object.keys(activeOptimizations).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setActiveOptimizations(allEnabled);

    const nextSim = computeSimulation(allEnabled, device);
    onAnalysisChangeRef.current?.(nextSim, true);
  };

  // Reset all (safely notifies parent in user event handler)
  const handleResetAll = () => {
    const allDisabled = Object.keys(activeOptimizations).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean>);
    setActiveOptimizations(allDisabled);

    onAnalysisChangeRef.current?.(baselineAnalysis, false);
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getMetricBadgeStyle = (status: CWVStatus) => {
    switch (status) {
      case 'good':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
      case 'needs_improvement':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border-amber-300 dark:border-amber-800';
      case 'poor':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400 border-rose-300 dark:border-rose-800';
    }
  };

  // Waterfall timeline percentages (based on 4000ms max scale)
  const maxWaterfallScaleMs = 4000;
  const baselineLcpMs = Math.min(maxWaterfallScaleMs, (baselineAnalysis.metrics.lcp.value || 3) * 1000);
  const simulatedLcpMs = Math.min(maxWaterfallScaleMs, (simulatedAnalysis.metrics.lcp.value || 1.8) * 1000);
  const baselineTtfbMs = baselineAnalysis.metrics.ttfb?.value || 400;
  const simulatedTtfbMs = simulatedAnalysis.metrics.ttfb?.value || 100;
  const baselineFcpMs = (baselineAnalysis.metrics.fcp?.value || 1.5) * 1000;
  const simulatedFcpMs = (simulatedAnalysis.metrics.fcp?.value || 0.8) * 1000;

  const baselineBarPct = Math.min(100, Math.max(15, (baselineLcpMs / maxWaterfallScaleMs) * 100));
  const simulatedBarPct = Math.min(100, Math.max(15, (simulatedLcpMs / maxWaterfallScaleMs) * 100));
  const timeSavedMs = Math.max(0, Math.round(baselineLcpMs - simulatedLcpMs));

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-indigo-500/30 relative overflow-hidden">
      {/* Decorative ambient glowing circles */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Live Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-wide">
                مراقب أداء فوري ومحاكي الـ Web Vitals التفاعلي
              </h3>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>LIVE · محاكاة لحظية</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              جرّب تفعيل تحسينات الأداء وشاهد كيف تقفز مؤشرات Core Web Vitals في الوقت الفعلي
            </p>
          </div>
        </div>

        {/* Global Controls: Apply All, Reset, Live Pulse toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={activeFixCount === AVAILABLE_OPTIMIZATIONS.length ? handleResetAll : handleApplyAll}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              activeFixCount === AVAILABLE_OPTIMIZATIONS.length
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black shadow-emerald-500/20'
            }`}
          >
            {activeFixCount === AVAILABLE_OPTIMIZATIONS.length ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إلغاء الكل</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>تطبيق أقصى سرعة ({AVAILABLE_OPTIMIZATIONS.length})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/60 hover:bg-indigo-600 text-indigo-100 border border-indigo-400/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="توليد وتصدير شفرات برمجية لتطبيق هذه التحسينات على موقعك"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>شفرات التطبيق</span>
          </button>

          <button
            type="button"
            onClick={() => setLivePulsing(!livePulsing)}
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer border ${
              livePulsing
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={livePulsing ? 'إيقاف النبض اللحظي' : 'تفعيل النبض اللحظي'}
          >
            <Radio className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main KPI Gauges & Score Comparison Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 my-5 relative z-10">
        {/* KPI 1: Overall Score Gauge */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">درجة الأداء</span>
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-3xl font-black text-white">
              {simulatedAnalysis.overallScore}
              <span className="text-xs text-slate-400 font-sans font-normal"> /100</span>
            </div>
            {scoreDelta > 0 && (
              <span className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-500/30 animate-in fade-in">
                <ArrowUp className="w-3 h-3 ml-0.5" />+{scoreDelta}
              </span>
            )}
          </div>
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                simulatedAnalysis.overallScore >= 90
                  ? 'bg-emerald-400'
                  : simulatedAnalysis.overallScore >= 50
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${simulatedAnalysis.overallScore}%` }}
            />
          </div>
        </div>

        {/* KPI 2: LCP */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">LCP (الرسم الأكبر)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getMetricBadgeStyle(simulatedAnalysis.metrics.lcp.status)}`}>
              {simulatedAnalysis.metrics.lcp.status === 'good' ? 'جيد' : 'بحاجة تحسين'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-2xl font-black text-white">
              {simulatedAnalysis.metrics.lcp.value}
              <span className="text-xs text-slate-400 font-sans font-normal"> ث</span>
            </div>
            {lcpDelta > 0 && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                <ArrowDown className="w-3 h-3 ml-0.5" />-{lcpDelta}s
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">الهدف: ≤ 2.5 ث</span>
        </div>

        {/* KPI 3: CLS */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">CLS (الثبات البصري)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getMetricBadgeStyle(simulatedAnalysis.metrics.cls.status)}`}>
              {simulatedAnalysis.metrics.cls.status === 'good' ? 'ممتاز' : 'اهتزاز'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-2xl font-black text-white">
              {simulatedAnalysis.metrics.cls.value}
            </div>
            {clsDelta > 0 && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                <ArrowDown className="w-3 h-3 ml-0.5" />-{clsDelta}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">الهدف: ≤ 0.1</span>
        </div>

        {/* KPI 4: INP / FID */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">FID / INP (الاستجابة)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getMetricBadgeStyle(simulatedAnalysis.metrics.fid.status)}`}>
              {simulatedAnalysis.metrics.fid.status === 'good' ? 'فوري' : 'بطيء'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-2xl font-black text-white">
              {simulatedAnalysis.metrics.fid.value}
              <span className="text-xs text-slate-400 font-sans font-normal"> ms</span>
            </div>
            {fidDelta > 0 && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                <ArrowDown className="w-3 h-3 ml-0.5" />-{fidDelta}ms
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">الهدف: ≤ 100 ms</span>
        </div>

        {/* KPI 5: TTFB */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">TTFB (استجابة الخادم)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getMetricBadgeStyle(simulatedAnalysis.metrics.ttfb?.status || 'good')}`}>
              {simulatedAnalysis.metrics.ttfb?.status === 'good' ? 'سريع' : 'بطيء'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-2xl font-black text-white">
              {simulatedAnalysis.metrics.ttfb?.value}
              <span className="text-xs text-slate-400 font-sans font-normal"> ms</span>
            </div>
            {ttfbDelta > 0 && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                <ArrowDown className="w-3 h-3 ml-0.5" />-{ttfbDelta}ms
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">الهدف: ≤ 800 ms</span>
        </div>

        {/* KPI 6: FCP */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">FCP (أول رسم)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getMetricBadgeStyle(simulatedAnalysis.metrics.fcp?.status || 'good')}`}>
              {simulatedAnalysis.metrics.fcp?.status === 'good' ? 'فوري' : 'تأخير'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-2xl font-black text-white">
              {simulatedAnalysis.metrics.fcp?.value}
              <span className="text-xs text-slate-400 font-sans font-normal"> ث</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">الهدف: ≤ 1.8 ث</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">بداية ظهور المحتوى</span>
        </div>
      </div>

      {/* Simulated Visual Loading Waterfall Strip */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 my-5 relative z-10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold text-slate-200">
              مخطط شلال سرعة التحميل التفاعلي (Waterfall Timeline Simulator)
            </h4>
          </div>
          {timeSavedMs > 0 && (
            <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>وفرت {timeSavedMs} ميلي ثانية من زمن التحميل الفعلي!</span>
            </div>
          )}
        </div>

        {/* Baseline Bar vs Simulated Bar */}
        <div className="space-y-2 pt-1 font-mono text-[11px]">
          {/* Baseline Bar */}
          <div>
            <div className="flex justify-between text-slate-400 text-[10px] mb-1 font-sans">
              <span>قبل التحسين (الحالة الأصلية):</span>
              <span className="font-mono">{baselineAnalysis.metrics.lcp.value}s (بطيء)</span>
            </div>
            <div className="h-5 w-full bg-slate-900 rounded-lg overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 rounded-md transition-all duration-700 flex items-center justify-end px-2 text-[10px] font-bold text-white shadow-xs"
                style={{ width: `${baselineBarPct}%` }}
              >
                {baselineAnalysis.metrics.lcp.value}s
              </div>
            </div>
          </div>

          {/* Simulated Bar */}
          <div>
            <div className="flex justify-between text-slate-300 text-[10px] mb-1 font-sans">
              <span className="font-bold flex items-center gap-1 text-emerald-400">
                <Sparkles className="w-3 h-3" />
                <span>بعد تطبيق التعديلات المختارة ({activeFixCount} مفعلة):</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {simulatedAnalysis.metrics.lcp.value}s ({simulatedAnalysis.overallStatus === 'good' ? 'ممتاز' : 'متحسن'})
              </span>
            </div>
            <div className="h-5 w-full bg-slate-900 rounded-lg overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-md transition-all duration-700 flex items-center justify-end px-2 text-[10px] font-bold text-slate-950 shadow-xs ${
                  simulatedAnalysis.metrics.lcp.status === 'good'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                    : 'bg-gradient-to-r from-amber-400 to-amber-300'
                }`}
                style={{ width: `${simulatedBarPct}%` }}
              >
                {simulatedAnalysis.metrics.lcp.value}s
              </div>
            </div>
          </div>
        </div>

        {/* Legend milestones */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono border-t border-slate-800/80">
          <span>0ms (البداية)</span>
          <span>TTFB: ~{simulatedAnalysis.metrics.ttfb?.value}ms</span>
          <span>FCP: ~{simulatedAnalysis.metrics.fcp?.value}s</span>
          <span>LCP: ~{simulatedAnalysis.metrics.lcp.value}s</span>
          <span>الحد القياسي لـ Google: 2.5s</span>
        </div>
      </div>

      {/* Interactive Optimization Switches Grid */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>مفاتيح التحسينات الفورية (انقر لتجربة أثر كل كود على المؤشرات):</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {activeFixCount} من {AVAILABLE_OPTIMIZATIONS.length} نشط
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {AVAILABLE_OPTIMIZATIONS.map((opt) => {
            const isActive = activeOptimizations[opt.id];
            const IconComp = opt.icon;

            return (
              <div
                key={opt.id}
                onClick={() => toggleOptimization(opt.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isActive
                    ? 'bg-slate-800/95 border-emerald-500/80 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-700/70 text-slate-400'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white leading-tight">
                        {opt.nameAr}
                      </span>
                    </div>

                    <div className="shrink-0">
                      <div
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                          isActive ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                            isActive ? '-translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {opt.descriptionAr}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px]">
                  <span className="text-slate-400 font-mono">
                    يستهدف: <span className="text-slate-200 font-bold">{opt.category}</span>
                  </span>
                  <div className="flex items-center gap-1 font-bold">
                    <span className="text-emerald-400">+{opt.impactScoreGain} نقطة</span>
                    {opt.timeReductionMs > 0 && (
                      <span className="text-sky-300">· -{opt.timeReductionMs}ms</span>
                    )}
                    {opt.clsReduction > 0 && (
                      <span className="text-purple-300">· -{opt.clsReduction} CLS</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Export Drawer / Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-right dir-rtl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white">
                  شفرات تطبيق تحسينات الـ Core Web Vitals في موقعك
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 my-3 leading-relaxed">
              انسخ الأكواد التالية وأضفها إلى موقعك أو شاركها مع مطور الموقع للحصول على نفس نتائج السرعة المحاكاة فوراً:
            </p>

            {/* Sub-tabs for optimizations */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 [scrollbar-width:none]">
              {AVAILABLE_OPTIMIZATIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActiveCodeTab(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeCodeTab === opt.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.nameAr.split('(')[0].trim()}
                </button>
              ))}
            </div>

            {/* Code Box */}
            {(() => {
              const currentOpt = AVAILABLE_OPTIMIZATIONS.find((o) => o.id === activeCodeTab) || AVAILABLE_OPTIMIZATIONS[0];
              return (
                <div className="relative group">
                  <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-t-xl border border-b-0 border-slate-800 text-[11px] text-slate-400">
                    <span className="font-mono text-[10px] text-emerald-400">{currentOpt.codeLang}</span>
                    <span>{currentOpt.nameAr}</span>
                  </div>
                  <pre className="p-4 bg-slate-950 text-slate-200 rounded-b-xl font-mono text-xs overflow-x-auto border border-slate-800 dir-ltr text-left leading-relaxed">
                    <code>{currentOpt.codeSnippet}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentOpt.codeSnippet, currentOpt.id)}
                    className="absolute top-8 right-3 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedKey === currentOpt.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الكود</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
