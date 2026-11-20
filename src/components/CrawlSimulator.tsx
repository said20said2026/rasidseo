import React, { useState, useMemo } from 'react';
import {
  Bot,
  Globe,
  Cpu,
  Link2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Terminal,
  Layers,
  ArrowLeftRight,
  Code2,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Info,
  Smartphone,
  Laptop,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { AuditResult } from '../types/seo';
import {
  generateCrawlSimulation,
  GooglebotUserAgentType,
  USER_AGENT_PROFILES,
  SimulatedCrawlLink,
  DynamicContentElement
} from '../utils/crawlSimulatorCalculator';

interface CrawlSimulatorProps {
  auditData: AuditResult;
}

export const CrawlSimulator: React.FC<CrawlSimulatorProps> = ({ auditData }) => {
  // Simulator Controls State
  const [userAgentType, setUserAgentType] = useState<GooglebotUserAgentType>('googlebot_smartphone');
  const [isJsEnabled, setIsJsEnabled] = useState<boolean>(true);
  const [networkMode, setNetworkMode] = useState<'fast_fiber' | 'slow_3g'>('fast_fiber');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Active Tab: 'links' | 'js_rendering' | 'crawl_log' | 'recommendations'
  const [activeTab, setActiveTab] = useState<'links' | 'js_rendering' | 'crawl_log' | 'recommendations'>('links');

  // Sub-view in JS Rendering tab: 'diff' | 'raw_html' | 'rendered_dom'
  const [jsSubView, setJsSubView] = useState<'diff' | 'raw_html' | 'rendered_dom'>('diff');

  // Filter for Internal Links tab: 'all' | 'crawlable' | 'warning' | 'uncrawlable' | 'js_masked'
  const [linkFilter, setLinkFilter] = useState<'all' | 'crawlable' | 'warning' | 'uncrawlable' | 'js_masked'>('all');

  // Compute simulation data
  const simulation = useMemo(() => {
    return generateCrawlSimulation(auditData, {
      userAgentType,
      isJsEnabled,
      networkMode
    });
  }, [auditData, userAgentType, isJsEnabled, networkMode]);

  const handleRefreshSimulation = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleCopyReport = () => {
    const reportText = `=== تقرير محاكاة زحف Googlebot (Crawl Simulator Report) ===
الموقع المستهدف: ${simulation.url}
عنوان الصفحة: ${simulation.pageTitle}
الزاحف: ${simulation.userAgent.nameAr} (${simulation.userAgent.nameEn})
User-Agent: ${simulation.userAgent.userAgentString}
معالجة JavaScript: ${simulation.isJsEnabled ? 'مفعلة (WRS Enabled)' : 'معطلة (Raw HTML Only)'}
سرعة الشبكة: ${simulation.networkMode === 'fast_fiber' ? 'سريعة (Fiber/4G)' : 'بطيئة (Slow 3G)'}

[مؤشرات الزحف]:
- درجة قابلية الزحف الكلية: ${simulation.crawlScore}/100
- زمن الريندر المقدر: ${simulation.renderTimeMs}ms (الحد الآمن: ${simulation.renderBudgetThresholdMs}ms)
- كلمات الـ Raw HTML الأولي: ${simulation.rawHtmlWordCount} كلمة
- كلمات شجرة الـ Rendered DOM: ${simulation.renderedDomWordCount} كلمة
- نسبة اعتماد المحتوى على الـ JS: ${simulation.jsContentDependencyPercent}%
- إجمالي الروابط الداخلية المفحوصة: ${simulation.totalDiscoveredLinks}
- الروابط القابلة للزحف ونقل PageRank: ${simulation.crawlableLinksCount}
- الروابط المحجوبة أو المقنعة بأزرار JS: ${simulation.jsMaskedLinksCount}
- حالة توجيهات robots.txt: ${simulation.botDirectives.robotsTxtStatus}
- توجيه meta robots: ${simulation.botDirectives.metaRobots}
- الرابط القانوني Canonical: ${simulation.botDirectives.canonicalUrl}

[أبرز التوصيات التقنية]:
${simulation.recommendations.map((r, i) => `${i + 1}. ${r.titleAr} - ${r.issueAr}`).join('\n')}

تم استخراج التقرير بواسطة راصد SEO 2026.`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    });
  };

  // Filter links
  const filteredLinks = useMemo(() => {
    return simulation.simulatedLinks.filter((link) => {
      if (linkFilter === 'crawlable') return link.crawlStatus === 'crawlable';
      if (linkFilter === 'warning') return link.crawlStatus === 'warning';
      if (linkFilter === 'uncrawlable') return link.crawlStatus === 'uncrawlable';
      if (linkFilter === 'js_masked') return link.crawlType === 'js_onclick' || link.discoveryPhase === 'post_render_js';
      return true;
    });
  }, [simulation.simulatedLinks, linkFilter]);

  return (
    <div
      id="crawl-simulator-section"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors"
    >
      {/* Top Banner / Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-lg shadow-indigo-900/40">
              <Bot className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>محاكي زحف جوجل (Googlebot Crawl Simulator)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile-First Indexing 2026</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Chromium WRS Engine
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl leading-relaxed">
                محاكاة تقنية دقيقة لكيفية تفسير عناكب بحث Googlebot لمحتوى صفحتك، مع رصد مباشر للفرق بين كود HTML الأولي
                (Raw HTML) وشجرة الـ DOM بعد تنفيذ الجافاسكريبت (WRS Rendering)، وطريقة اكتشاف الروابط الداخلية وتمرير قوة
                الـ PageRank.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleRefreshSimulation}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all border border-white/10 cursor-pointer disabled:opacity-50"
              title="إعادة تشغيل محاكاة الزحف مع الإعدادات الحالية"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-300' : ''}`} />
              <span>{isRefreshing ? 'جارٍ المحاكاة...' : 'إعادة الزحف'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white transition-all shadow-md shadow-indigo-900/50 cursor-pointer"
              title="نسخ تقرير محاكاة الزاحف إلى الحافظة"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ تقرير الزاحف</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Simulation Controls Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* User-Agent Selector */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-200 mb-1.5">
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3 text-indigo-400" />
                <span>هوية الزاحف (User-Agent):</span>
              </span>
              <span className="text-[10px] text-slate-400">{simulation.userAgent.device === 'mobile' ? 'هاتف ذكي' : 'كمبيوتر'}</span>
            </div>
            <select
              value={userAgentType}
              onChange={(e) => setUserAgentType(e.target.value as GooglebotUserAgentType)}
              className="w-full bg-slate-900 border border-indigo-700/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="googlebot_smartphone">📱 Googlebot Smartphone (الافتراضي)</option>
              <option value="googlebot_desktop">💻 Googlebot Desktop (سطح المكتب)</option>
              <option value="bingbot">🔍 Bingbot 2.0 (محرك بينغ)</option>
              <option value="chrome_user">🌐 مستخدم حقيقي (Chrome Desktop)</option>
            </select>
          </div>

          {/* JavaScript Execution Mode Toggle */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-200 mb-1.5">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-amber-400" />
                <span>معالجة الـ JavaScript (WRS):</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isJsEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {isJsEnabled ? 'الطور الثاني (WRS نشط)' : 'الطور الأول فقط (Raw HTML)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setIsJsEnabled(true)}
                className={`py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  isJsEnabled
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                تفعيل الـ JS (WRS)
              </button>
              <button
                type="button"
                onClick={() => setIsJsEnabled(false)}
                className={`py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  !isJsEnabled
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                تعطيل الـ JS (Raw HTML)
              </button>
            </div>
          </div>

          {/* Network Throttling / Latency */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-200 mb-1.5">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>سرعة الشبكة واستجابة السيرفر:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {simulation.renderTimeMs}ms ريندر
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setNetworkMode('fast_fiber')}
                className={`py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  networkMode === 'fast_fiber'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ ألياف سريعة (Fast)
              </button>
              <button
                type="button"
                onClick={() => setNetworkMode('slow_3g')}
                className={`py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  networkMode === 'slow_3g'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🐌 شبكة بطيئة (Slow 3G)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Key Googlebot Metrics Overview */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Crawl Score */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">درجة قابلية الزحف</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                simulation.crawlScore >= 85
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                  : simulation.crawlScore >= 70
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
              }`}
            >
              {simulation.crawlScore >= 85 ? 'ممتازة' : simulation.crawlScore >= 70 ? 'متوسطة' : 'تحتاج تحسين'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{simulation.crawlScore}</span>
            <span className="text-xs text-slate-400 font-bold">/100</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            جاهزية الصفحة للأرشفة السلسة بدون حواجز كودية
          </p>
        </div>

        {/* Metric 2: WRS Render Time & Budget */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ميزانية ريندر WRS</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                simulation.renderBudgetStatus === 'optimal'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                  : simulation.renderBudgetStatus === 'warning'
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
              }`}
            >
              {simulation.renderBudgetStatus === 'optimal' ? 'ضمن الحد الآمن' : 'استهلاك مرتفع'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{simulation.renderTimeMs}</span>
            <span className="text-xs text-slate-400 font-bold">ميلي ثانية</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                simulation.renderBudgetStatus === 'optimal'
                  ? 'bg-emerald-500'
                  : simulation.renderBudgetStatus === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (simulation.renderTimeMs / simulation.renderBudgetThresholdMs) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">الحد الأقصى لمهلة ريندر جوجل: 5000ms</p>
        </div>

        {/* Metric 3: Internal Links Crawlability */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">الروابط الداخلية الصالحة</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              {simulation.crawlableLinksCount}/{simulation.totalDiscoveredLinks}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {Math.round((simulation.crawlableLinksCount / (simulation.totalDiscoveredLinks || 1)) * 100)}%
            </span>
            <span className="text-xs text-slate-400 font-bold">تمرير PageRank</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {simulation.jsMaskedLinksCount > 0
              ? `⚠️ ${simulation.jsMaskedLinksCount} روابط مقنعة بأزرار JS لا يتبعها الزاحف`
              : 'كافة الروابط الداخلية قياسية وقابلة للاكتشاف الفوري'}
          </p>
        </div>

        {/* Metric 4: JavaScript Dependency */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">اعتماد المحتوى على JS</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                simulation.jsContentDependencyPercent < 15
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
              }`}
            >
              {simulation.jsContentDependencyPercent < 15 ? 'صحي (SSR/SSG)' : 'اعتماد ملحوظ'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {simulation.jsContentDependencyPercent}%
            </span>
            <span className="text-xs text-slate-400 font-bold">من الكلمات تتطلب JS</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {simulation.renderedDomWordCount - simulation.rawHtmlWordCount} كلمة مضافة عبر العميل بعد الريندر
          </p>
        </div>
      </div>

      {/* Bot Directives Overview Pills */}
      <div className="px-5 py-3 bg-indigo-50/40 dark:bg-indigo-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>توجيهات الزاحف (Bot Directives):</span>
          </span>

          <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <span className={`w-2 h-2 rounded-full ${simulation.botDirectives.robotsTxtStatus === 'allowed' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>robots.txt: {simulation.botDirectives.robotsTxtStatus === 'allowed' ? 'مسموح بالزحف' : 'محظور'}</span>
          </span>

          <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Meta Robots: {simulation.botDirectives.metaRobots}</span>
          </span>

          <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Canonical: {simulation.botDirectives.canonicalUrl.replace(/^https?:\/\//, '')}</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Engine: Chromium 128 / Evergreen WRS
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'links'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>تفسير الروابط الداخلية (Internal Links)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-mono">
            {simulation.totalDiscoveredLinks}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('js_rendering')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'js_rendering'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>تصيير الجافاسكريبت والمحتوى الديناميكي (WRS Diff)</span>
          {simulation.jsMaskedLinksCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
              تنبيه
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('crawl_log')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'crawl_log'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>سجل خطوات الزحف الحي (Crawl Waterfall)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'recommendations'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>توصيات تحسين الزحف والريندر</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
            {simulation.recommendations.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Internal Links Interpretation */}
      {activeTab === 'links' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>كيف يفسر Googlebot الروابط الداخلية المكتشفة في هذه الصفحة:</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تتبع الروابط هو شريان توزيع سلطة الصفحة (PageRank) واكتشاف المحتوى الجديد في موقعك.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setLinkFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  linkFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                الكل ({simulation.simulatedLinks.length})
              </button>
              <button
                type="button"
                onClick={() => setLinkFilter('crawlable')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  linkFilter === 'crawlable'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-slate-100'
                }`}
              >
                صالحة ({simulation.crawlableLinksCount})
              </button>
              <button
                type="button"
                onClick={() => setLinkFilter('js_masked')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  linkFilter === 'js_masked'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 hover:bg-slate-100'
                }`}
              >
                مقنعة / ديناميكية ({simulation.jsMaskedLinksCount})
              </button>
            </div>
          </div>

          {/* Links Grid / List */}
          <div className="space-y-2.5">
            {filteredLinks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">لا توجد روابط تطابق هذا الفلتر.</div>
            ) : (
              filteredLinks.map((link) => (
                <div
                  key={link.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    link.crawlStatus === 'crawlable'
                      ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
                      : link.crawlStatus === 'warning'
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {link.crawlStatus === 'crawlable' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : link.crawlStatus === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        )}

                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          "{link.anchorText}"
                        </span>

                        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60 dir-ltr">
                          {link.path}
                        </span>

                        {/* Discovery Phase Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            link.discoveryPhase === 'raw_html'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {link.discoveryPhase === 'raw_html' ? 'الطور 1: HTML أولي' : 'الطور 2: بعد معالجة JS'}
                        </span>

                        {/* PageRank Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            link.linkEquityTransferred
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {link.linkEquityTransferred ? '✓ يمرر PageRank' : '✗ لا يمرر PageRank'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 pr-6 leading-relaxed">
                        {link.explanationAr}
                      </p>
                    </div>

                    {/* Status Box */}
                    <div className="shrink-0 text-left md:text-right pr-6 md:pr-0">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          link.crawlStatus === 'crawlable'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                            : link.crawlStatus === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                        }`}
                      >
                        {link.notesAr}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: JavaScript Rendering & Content Diff */}
      {activeTab === 'js_rendering' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>مقارنة المحتوى: الـ HTML الخام مقابل الـ DOM بعد تشغيل الـ JavaScript:</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                يستخدم جوجل نظام الفهرسة ثنائي الطور (Two-Wave Indexing): تنزيل فوري للـ HTML، ثم تأجيل ريندر الـ JS إلى أن تتوفر موارد WRS.
              </p>
            </div>

            {/* Sub-view switcher */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setJsSubView('diff')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  jsSubView === 'diff'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                جدول الفروقات (Diff)
              </button>
              <button
                type="button"
                onClick={() => setJsSubView('raw_html')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  jsSubView === 'raw_html'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                كود الـ Raw HTML
              </button>
              <button
                type="button"
                onClick={() => setJsSubView('rendered_dom')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  jsSubView === 'rendered_dom'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                شجرة الـ Rendered DOM
              </button>
            </div>
          </div>

          {/* Subview Content */}
          {jsSubView === 'diff' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">الطور 1: التحميل الأولي (Raw HTML)</span>
                  <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 font-mono mt-1">
                    {simulation.rawHtmlWordCount} كلمة
                  </div>
                  <p className="text-[11px] text-indigo-900/70 dark:text-indigo-300/70 mt-1">
                    يتم استخراجها وتصنيفها فورياً في أول ثانية دون استهلاك أي وقت من ميزانية الريندر.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">الطور 2: بعد تشغيل WRS (Rendered DOM)</span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                    {simulation.renderedDomWordCount} كلمة
                  </div>
                  <p className="text-[11px] text-emerald-900/70 dark:text-emerald-300/70 mt-1">
                    إجمالي الكلمات بعد اكتمال تنفيذ حزم الـ JavaScript وهدرجة المكونات (Hydration).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">محتوى يعتمد بالكامل على الـ JS</span>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-1">
                    {simulation.jsContentDependencyPercent}%
                  </div>
                  <p className="text-[11px] text-amber-900/70 dark:text-amber-300/70 mt-1">
                    {simulation.jsContentDependencyPercent > 20
                      ? '⚠️ نسبة مرتفعة! يُفضل تحويل المحتوى النصي إلى SSR/SSG لتسريع الفهرسة.'
                      : '✓ نسبة ممتازة تضمن أرشفة المحتوى الرئيسي حتى مع تعطل السكربتات.'}
                  </p>
                </div>
              </div>

              {/* Elements Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 text-xs font-bold text-slate-700 dark:text-slate-300 grid grid-cols-12 gap-2">
                  <div className="col-span-4 sm:col-span-3">العنصر / الجزء البرمجي</div>
                  <div className="col-span-2 text-center">الـ Raw HTML</div>
                  <div className="col-span-2 text-center">الـ Rendered DOM</div>
                  <div className="col-span-4 sm:col-span-5">التأثير والتقييم من منظور Googlebot</div>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {simulation.dynamicElements.map((elem) => (
                    <div
                      key={elem.id}
                      className="p-3 text-xs grid grid-cols-12 gap-2 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="col-span-4 sm:col-span-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{elem.nameAr}</span>
                        <code className="text-[10px] text-slate-500 font-mono block truncate dir-ltr">
                          {elem.snippetHtml}
                        </code>
                      </div>

                      <div className="col-span-2 text-center">
                        {elem.inRawHtml ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" />
                            <span>موجود فوراً</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3" />
                            <span>غير موجود</span>
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 text-center">
                        {elem.inRenderedDom ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" />
                            <span>يظهر بعد الريندر</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            <span>مفقود تماماً</span>
                          </span>
                        )}
                      </div>

                      <div className="col-span-4 sm:col-span-5 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        {elem.impactExplanationAr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {jsSubView === 'raw_html' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>ما يقوم خادم الويب بإرساله فوراً في الـ Initial HTTP Response (قبل تشغيل المتصفح لأي JS):</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">حجم الاستجابة: {auditData.pageSizeKb || 45} KB</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 dir-ltr max-h-96">
{`<!DOCTYPE html>
<html lang="${auditData.lang || 'ar'}" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${auditData.pageTitle || 'عنوان الصفحة'}</title>
  <meta name="description" content="${auditData.metaDescription || 'وصف الميتا للموقع...'}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${auditData.canonicalUrl || auditData.url}" />
  ${auditData.schemasFound && auditData.schemasFound.length > 0 ? `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${auditData.schemasFound[0]}",
    "name": "${auditData.pageTitle || ''}",
    "url": "${auditData.url}"
  }
  </script>` : '<!-- No Schema found in raw HTML head -->'}
</head>
<body>
  <header>
    <nav>
      <a href="/">الرئيسية</a>
      <a href="/services">خدماتنا</a>
      <a href="/about">عنا</a>
    </nav>
  </header>
  <main>
    <h1>${auditData.pageTitle || 'العنوان الرئيسي'}</h1>
    <p>${auditData.metaDescription || 'نص المقال والفقرة الأولى في الموقع...'}</p>
    <!-- Client-side dynamically mounted container: -->
    <div id="root">
      <!-- Loading / Skeletons before JS execution -->
      <div class="skeleton-placeholder">جارٍ تحميل المحتوى والتفاعل...</div>
    </div>
  </main>
  <!-- JavaScript Bundles to be queued for WRS Execution: -->
  <script src="/assets/vendor.js" defer></script>
  <script src="/assets/app.js" defer></script>
</body>
</html>`}
              </pre>
            </div>
          )}

          {jsSubView === 'rendered_dom' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>شجرة الـ DOM النهائية بعد انتهاء مرحلة Chromium Web Rendering Service (WRS):</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">تم احتساب كافة طفرات الـ DOM (Mutations)</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 dir-ltr max-h-96">
{`<!-- Rendered DOM inside Googlebot Chromium WRS Sandbox -->
<html lang="${auditData.lang || 'ar'}" dir="rtl" class="hydrated">
<head>
  <title>${auditData.pageTitle || 'عنوان الصفحة'}</title>
  <!-- Injected Tags via React / Helmet: -->
  <meta property="og:title" content="${auditData.social.ogTitle || auditData.pageTitle || ''}" />
  <meta property="og:description" content="${auditData.social.ogDescription || auditData.metaDescription || ''}" />
</head>
<body>
  <div id="root">
    <!-- Fully Hydrated Dynamic React Tree: -->
    <div class="app-layout">
      <nav class="desktop-menu">
        ${simulation.simulatedLinks.map((l) => `<a href="${l.path}">${l.anchorText}</a>`).join('\n        ')}
      </nav>
      <section class="main-content">
        <h1>${auditData.pageTitle || 'العنوان الرئيسي'}</h1>
        <div class="dynamic-accordion" aria-expanded="true">
          <!-- Expanded dynamic content parsed by WRS -->
          <p>محتوى الأسئلة الشائعة والبيانات الدقيقة بعد اكتمال نداءات الـ API...</p>
        </div>
      </section>
      <!-- Reviews Widget Hydrated -->
      <div id="reviews-widget" class="rendered">
        <div class="review-card">تقييم 5 نجوم من العملاء المعتمدين</div>
      </div>
    </div>
  </div>
</body>
</html>`}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Crawl Waterfall & Terminal Log */}
      {activeTab === 'crawl_log' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-t-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-mono font-bold">Googlebot Crawler Live Trace Console</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Status: 200 OK | Protocol: HTTP/2 (H2)
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {simulation.crawlLog.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800/90 shadow-sm space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold">
                      {step.stepNumber}
                    </span>
                    <span className="font-bold text-white font-sans">{step.phaseAr}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400 font-mono">+{step.durationMs}ms</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        step.status === 'success'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : step.status === 'warning'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}
                    >
                      {step.status === 'success' ? 'SUCCESS' : step.status === 'warning' ? 'WARN' : 'INFO'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {step.detailsAr}
                </p>

                {step.technicalCode && (
                  <pre className="p-2 rounded bg-slate-900 text-slate-400 text-[11px] overflow-x-auto dir-ltr">
                    {step.technicalCode}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="p-5 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <h5 className="font-bold">معايير جوجل الرسمية للزحف والريندر 2026:</h5>
              <p className="leading-relaxed">
                تعتمد محركات البحث على خوارزميات توفير الطاقة وميزانية المعالجة (Green Crawling & Render Budget).
                كلما كان الموقع يخدم المحتوى النصي والروابط الداخلية في الـ HTML الأولي دون حاجة لانتظار الـ WRS، كلما
                ارتفعت سرعة فهرسة صفحاتك وتصدرت النتائج بسرعة فائقة.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {simulation.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rec.priority === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {rec.priority === 'high' ? 'أولوية عاجلة' : 'تحسين مستحسن'}
                    </span>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{rec.titleAr}</h5>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-slate-800 dark:text-slate-200">المشكلة التقنية: </strong>
                    {rec.issueAr}
                  </p>
                  <p>
                    <strong className="text-emerald-700 dark:text-emerald-400">الحل البرمجي الموصى به: </strong>
                    {rec.solutionAr}
                  </p>
                </div>

                {rec.codeSnippet && (
                  <pre className="p-3 rounded-lg bg-slate-950 text-indigo-300 text-xs font-mono overflow-x-auto dir-ltr">
                    {rec.codeSnippet}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
