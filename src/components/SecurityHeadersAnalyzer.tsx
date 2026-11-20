import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Server,
  Code2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sliders,
  Terminal,
  Zap,
  Globe,
  Radio,
  Clock,
  Network,
  ExternalLink,
  ArrowRight,
  ListChecks,
  Filter,
  Search,
  KeyRound,
  FileText,
  ShieldPlus
} from 'lucide-react';
import { SecurityHeadersAnalysis, CSPDirectiveItem, CSPRecommendationItem } from '../types/seo';

interface Props {
  analysis?: SecurityHeadersAnalysis;
  targetUrl: string;
}

export const SecurityHeadersAnalyzer: React.FC<Props> = ({ analysis, targetUrl }) => {
  const [activeTab, setActiveTab] = useState<'threats' | 'xss-recommendations' | 'hsts' | 'directives' | 'configs' | 'simulator'>('threats');
  const [activeServerTab, setActiveServerTab] = useState<'nginx' | 'apache' | 'cloudflare' | 'express' | 'nextjs'>('nginx');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Recommendations tab state
  const [recFilter, setRecFilter] = useState<'all' | 'critical' | 'important' | 'best_practice' | 'pending' | 'fulfilled'>('all');
  const [recSearch, setRecSearch] = useState('');
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);

  const domain = useMemo(() => {
    try {
      return new URL(targetUrl).hostname.replace('www.', '');
    } catch {
      return targetUrl.replace(/^https?:\/\//, '').split('/')[0] || 'domain.com';
    }
  }, [targetUrl]);

  // Simulator State
  const [simHstsEnabled, setSimHstsEnabled] = useState(true);
  const [simHstsMaxAge, setSimHstsMaxAge] = useState(31536000); // 1 year
  const [simHstsSubdomains, setSimHstsSubdomains] = useState(true);
  const [simHstsPreload, setSimHstsPreload] = useState(true);

  const [simCspEnabled, setSimCspEnabled] = useState(true);
  const [simCspUnsafeInline, setSimCspUnsafeInline] = useState(false);
  const [simCspObjectSrcNone, setSimCspObjectSrcNone] = useState(true);
  const [simXFrameEnabled, setSimXFrameEnabled] = useState(true);
  const [simXContentEnabled, setSimXContentEnabled] = useState(true);

  if (!analysis) {
    return null;
  }

  const {
    score,
    grade,
    xssProtection,
    mitmProtection,
    otherHeaders,
    serverFixConfigs,
    summaryAr
  } = analysis;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getGradeBadge = (g: string) => {
    if (g === 'A+' || g === 'A') {
      return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
    }
    if (g === 'B' || g === 'C') {
      return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    }
    return 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700';
  };

  // Recommendation computations
  const allRecs = useMemo<CSPRecommendationItem[]>(() => {
    return xssProtection.recommendations || [];
  }, [xssProtection.recommendations]);

  const fulfilledRecsCount = useMemo(() => allRecs.filter(r => r.isFulfilled).length, [allRecs]);
  const pendingRecsCount = allRecs.length - fulfilledRecsCount;
  const criticalPendingCount = useMemo(() => allRecs.filter(r => r.category === 'critical' && !r.isFulfilled).length, [allRecs]);
  const criticalCount = useMemo(() => allRecs.filter(r => r.category === 'critical').length, [allRecs]);
  const importantCount = useMemo(() => allRecs.filter(r => r.category === 'important').length, [allRecs]);
  const bestPracticeCount = useMemo(() => allRecs.filter(r => r.category === 'best_practice').length, [allRecs]);

  const filteredRecs = useMemo(() => {
    return allRecs.filter((rec) => {
      if (recFilter === 'critical' && rec.category !== 'critical') return false;
      if (recFilter === 'important' && rec.category !== 'important') return false;
      if (recFilter === 'best_practice' && rec.category !== 'best_practice') return false;
      if (recFilter === 'pending' && rec.isFulfilled) return false;
      if (recFilter === 'fulfilled' && !rec.isFulfilled) return false;

      if (recSearch.trim()) {
        const q = recSearch.toLowerCase().trim();
        const fullContent = `${rec.titleAr} ${rec.descriptionAr} ${rec.impactAr} ${rec.recommendedDirective} ${rec.threatTypeAr} ${rec.directiveName || ''}`.toLowerCase();
        if (!fullContent.includes(q)) return false;
      }
      return true;
    });
  }, [allRecs, recFilter, recSearch]);

  // Simulator computed score
  const simScore = useMemo(() => {
    let s = 20; // base HTTPS
    if (simHstsEnabled) {
      s += 20;
      if (simHstsMaxAge >= 31536000) s += 10;
      if (simHstsSubdomains) s += 5;
    }
    if (simCspEnabled) {
      s += 25;
      if (!simCspUnsafeInline) s += 10;
    }
    if (simXFrameEnabled) s += 5;
    if (simXContentEnabled) s += 5;
    return Math.min(100, Math.max(10, s));
  }, [simHstsEnabled, simHstsMaxAge, simHstsSubdomains, simCspEnabled, simCspUnsafeInline, simXFrameEnabled, simXContentEnabled]);

  const simGrade = useMemo(() => {
    if (simScore >= 90) return 'A+';
    if (simScore >= 80) return 'A';
    if (simScore >= 70) return 'B';
    if (simScore >= 55) return 'C';
    if (simScore >= 40) return 'D';
    return 'F';
  }, [simScore]);

  return (
    <div id="security-headers-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                أداة فحص ترويسات الأمان المتقدمة: CSP & HSTS (Security Headers Analyzer)
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border font-mono ${getGradeBadge(grade)}`}>
                التقييم الأمني: {grade} ({score}/100)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              فحص شامل لتكوين ترويسة سياسة أمان المحتوى (CSP) لمنع هجمات XSS، وترويسة النقل الصارم (HSTS) لمنع هجمات MitM وتجريد التشفير.
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('threats')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'threats'
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>نظرة عامة (XSS & MitM)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('xss-recommendations')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'xss-recommendations'
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>تحليل CSP وتوصيات XSS</span>
            {pendingRecsCount > 0 ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold font-mono">
                {pendingRecsCount} إصلاحات
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold font-mono">
                محصن ✓
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hsts')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hsts'
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>فحص HSTS والنطاقات الفرعية</span>
            {mitmProtection.hstsHeaderFound ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold font-mono">
                مفعلة ✓
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold font-mono">
                مفقودة ✗
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('directives')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'directives'
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>تفاصيل الـ Directives</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('configs')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'configs'
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>أكواد الخادم (Fix Configs)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>محاكي الحماية</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 flex-wrap ${
        grade === 'A+' || grade === 'A'
          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          : grade === 'B' || grade === 'C'
          ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            {grade === 'A+' || grade === 'A' ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : grade === 'B' || grade === 'C' ? (
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            ) : (
              <ShieldX className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <div className="text-xs">
            <span className="font-bold block text-sm">{summaryAr}</span>
            <span className="text-[11px] opacity-80 mt-0.5 block">
              ترويسات HTTP الأمنية توفر خط دفاع أولي يمنع استغلال الثغرات البرمجية في متصفح الزائر قبل وصولها إلى خادمك.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('configs')}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
        >
          نسخ إعدادات الخادم فوراً &larr;
        </button>
      </div>

      {/* TAB 1: THREAT DEFENSE CARDS (XSS & MitM) */}
      {activeTab === 'threats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD 1: CSP & XSS Protection */}
            <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
              xssProtection.status === 'protected'
                ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                : xssProtection.status === 'partial'
                ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/80 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800/80 shadow-xs'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    xssProtection.status === 'protected'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                      : xssProtection.status === 'partial'
                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-600'
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                  }`}>
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      حماية سياسة أمان المحتوى (CSP) ضد هجمات XSS
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">Content-Security-Policy</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  xssProtection.status === 'protected'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                    : xssProtection.status === 'partial'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200'
                }`}>
                  {xssProtection.status === 'protected' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{xssProtection.badgeAr}</span>
                </span>
              </div>

              {/* Real explanation of XSS */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
                  <span>كيف تمنع ترويسة CSP هجمات XSS وسرقة الجلسات؟</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  هجوم Cross-Site Scripting (XSS) يحدث عندما ينجح المهاجم في حقن كود JavaScript خبيث في صفحة موقعك. عندما تكون ترويسة CSP مفعلة، يقوم المتصفح فوراً بحظر تشغيل أي كود غير معتمد صراحة ويمنع إرسال كوكيز الجلسة أو بيانات المستخدمين إلى خوادم المخترق الخارجية.
                </p>
              </div>

              {/* Status details */}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {xssProtection.descriptionAr}
              </p>

              {/* Identified Risks */}
              {xssProtection.risksAr.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block">
                    المخاطر الأمنية المرصودة في التكوين الحالي:
                  </span>
                  <ul className="space-y-1">
                    {xssProtection.risksAr.map((r, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Fix Guide */}
              <div className="p-3 bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/60 rounded-xl text-xs space-y-1">
                <span className="font-bold text-cyan-800 dark:text-cyan-300 block">
                  طريقة الإصلاح الموصى بها:
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  {xssProtection.fixGuideAr}
                </p>
              </div>

              {/* Quick Jump to Anti-XSS Recommendations */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('xss-recommendations')}
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <ListChecks className="w-3.5 h-3.5 text-rose-500" />
                  <span>استعراض قائمة التوصيات التفصيلية ضد هجمات XSS ({pendingRecsCount} توصيات نشطة)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CARD 2: HSTS & MitM Protection */}
            <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
              mitmProtection.status === 'protected'
                ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                : mitmProtection.status === 'partial'
                ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/80 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800/80 shadow-xs'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    mitmProtection.status === 'protected'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                      : mitmProtection.status === 'partial'
                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-600'
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      حماية النقل الصارم (HSTS) ضد هجمات MitM
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">Strict-Transport-Security</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  mitmProtection.status === 'protected'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                    : mitmProtection.status === 'partial'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200'
                }`}>
                  {mitmProtection.status === 'protected' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{mitmProtection.badgeAr}</span>
                </span>
              </div>

              {/* Raw Header snippet */}
              <div className="p-2.5 bg-slate-950 text-cyan-400 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-pre dir-ltr text-left border border-slate-800 select-all" dir="ltr">
                {mitmProtection.rawHeader ? (
                  `Strict-Transport-Security: ${mitmProtection.rawHeader}`
                ) : (
                  <span className="text-rose-400">Strict-Transport-Security: (الترويسة مفقودة في استجابة الخادم)</span>
                )}
              </div>

              {/* Real explanation of MitM & SSL Stripping */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
                  <span>كيف تمنع ترويسة HSTS هجمات MitM وتجريد SSL؟</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  هجوم رجل في المنتصف (Man-in-the-Middle) يحدث عندما يعترض متسلل على شبكة عامة (مثل مقهى أو مطار) طلب الزائر الأول ويجرده من التشفير (SSL Stripping) ليجبره على تصفح الموقع عبر HTTP العادي والتنصت على كلمات المرور. ترويسة HSTS تجبر المتصفح على رفض أي اتصال غير مشفر مطلقاً.
                </p>
              </div>

              {/* Key Directives Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">مدة الصلاحية (max-age)</span>
                  <span className={`font-mono font-bold text-xs ${
                    mitmProtection.isOptimalMaxAge ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {mitmProtection.maxAgeDays ? `${mitmProtection.maxAgeDays} يوم` : 'غير محدد'}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    {mitmProtection.maxAgeYears ? `${mitmProtection.maxAgeYears} سنة` : mitmProtection.maxAgeSeconds ? `${(mitmProtection.maxAgeSeconds / 86400).toFixed(0)}d` : ''}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">مسار النطاقات الفرعية</span>
                  <span className={`font-bold text-xs ${
                    mitmProtection.includeSubDomains ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}>
                    {mitmProtection.includeSubDomains ? 'مشمولة (*.' + domain + ') ✓' : 'غير مفعلة ✗'}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-mono">includeSubDomains</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">قائمة Preload</span>
                  <span className={`font-bold text-xs ${
                    mitmProtection.preload ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}>
                    {mitmProtection.preload ? 'مؤهلة ✓' : 'غير مفعلة'}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-mono">Chromium Preload</span>
                </div>
              </div>

              {/* Status details */}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {mitmProtection.descriptionAr}
              </p>

              {/* Identified Risks */}
              {mitmProtection.risksAr.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block">
                    المخاطر الأمنية المرصودة:
                  </span>
                  <ul className="space-y-1">
                    {mitmProtection.risksAr.map((r, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Fix Guide */}
              <div className="p-3 bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/60 rounded-xl text-xs space-y-1">
                <span className="font-bold text-cyan-800 dark:text-cyan-300 block">
                  طريقة الإصلاح الموصى بها:
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  {mitmProtection.fixGuideAr}
                </p>
              </div>

              {/* Deep-dive link button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('hsts')}
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>فتح فحص HSTS التخصصي وتفاصيل مدة الصلاحية وشجرة النطاقات الفرعية</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Other Security Headers Strip */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-500" />
              <span>فحص ترويسات الأمان المساندة (Complementary Defense Headers)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-mono text-[11px] font-bold block text-slate-800 dark:text-slate-200">
                  X-Frame-Options
                </span>
                <div className="flex items-center gap-1.5">
                  {otherHeaders.xFrameOptions?.present ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{otherHeaders.xFrameOptions.value}</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>مفقودة (Clickjacking)</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-mono text-[11px] font-bold block text-slate-800 dark:text-slate-200">
                  X-Content-Type
                </span>
                <div className="flex items-center gap-1.5">
                  {otherHeaders.xContentTypeOptions?.present ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>nosniff</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>مفقودة (MIME Sniff)</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-mono text-[11px] font-bold block text-slate-800 dark:text-slate-200">
                  Referrer-Policy
                </span>
                <div className="flex items-center gap-1.5">
                  {otherHeaders.referrerPolicy?.present ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 truncate">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{otherHeaders.referrerPolicy.value}</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>افتراضية المتصفح</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <span className="font-mono text-[11px] font-bold block text-slate-800 dark:text-slate-200">
                  Permissions-Policy
                </span>
                <div className="flex items-center gap-1.5">
                  {otherHeaders.permissionsPolicy?.present ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 truncate">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>مفعّلة ومخصصة</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">
                      غير محددة (موصى بها)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CONTENT-SECURITY-POLICY (CSP) ANALYSIS & ANTI-XSS RECOMMENDATIONS */}
      {activeTab === 'xss-recommendations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Hero Banner */}
          <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
            xssProtection.status === 'protected'
              ? 'bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-emerald-500/5 dark:from-emerald-950/40 dark:via-cyan-950/20 dark:to-emerald-950/30 border-emerald-300 dark:border-emerald-800'
              : xssProtection.status === 'partial'
              ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-950/30 border-amber-300 dark:border-amber-800'
              : 'bg-gradient-to-r from-rose-500/10 via-red-500/5 to-rose-500/5 dark:from-rose-950/40 dark:via-red-950/20 dark:to-rose-950/30 border-rose-300 dark:border-rose-800'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  xssProtection.status === 'protected'
                    ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                    : xssProtection.status === 'partial'
                    ? 'bg-amber-600 text-white shadow-amber-500/25'
                    : 'bg-rose-600 text-white shadow-rose-500/25'
                }`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      تحليل سياسة أمان المحتوى (CSP) وخطة التوصيات للوقاية من هجمات XSS
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                      xssProtection.status === 'protected'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                        : xssProtection.status === 'partial'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                    }`}>
                      {xssProtection.status === 'protected' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{xssProtection.badgeAr}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800">
                      تقييم CSP الأمني: {xssProtection.grade || 'F'} ({xssProtection.score || 0}/100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    فحص دقيق لكافة توجيهات CSP لمكافحة حقن السكربتات المجهولة (Stored & Reflected XSS)، وتأمين واجهات الـ DOM، وسد ثغرات الاستثناءات الخطرة.
                  </p>
                </div>
              </div>

              {/* Quick Summary Badges */}
              <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">التوصيات المستوفاة</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {fulfilledRecsCount} من أصل {allRecs.length}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">إصلاحات متبقية</span>
                  <span className={`font-bold font-mono ${pendingRecsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                    {pendingRecsCount} توصية
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Alert if pending critical recommendations exist */}
            {criticalPendingCount > 0 && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
                  <span>
                    تحذير أمني: يوجد {criticalPendingCount} توصيات حرجة غير مكتملة تعرض موقعك لخطر تنفيذ أكواد XSS مباشرة.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRecFilter('critical');
                    setRecSearch('');
                  }}
                  className="text-xs font-bold text-rose-700 dark:text-rose-300 underline cursor-pointer hover:text-rose-900"
                >
                  تصفية التوصيات الحرجة الآن &larr;
                </button>
              </div>
            )}

            {/* Current Raw Header Box */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-mono">
                  <span>ترويسة CSP الحالية المستلمة من الخادم:</span>
                </span>
                {xssProtection.rawHeader && (
                  <button
                    type="button"
                    onClick={() => handleCopy(xssProtection.rawHeader!, 'raw-csp')}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 cursor-pointer"
                  >
                    {copiedCode === 'raw-csp' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الترويسة الحالية</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="p-2.5 bg-slate-950 text-cyan-400 font-mono text-xs rounded-lg overflow-x-auto whitespace-pre dir-ltr text-left border border-slate-800 select-all" dir="ltr">
                {xssProtection.rawHeader || 'Content-Security-Policy: (الترويسة مفقودة تماماً في استجابة الخادم)'}
              </div>
            </div>
          </div>

          {/* 6 Security Defense Pillars Against XSS */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldPlus className="w-4 h-4 text-cyan-500" />
                <span>ركائز التحصين الست ضد هجمات XSS في موقعك (Security Pillars)</span>
              </h5>
              <span className="text-[11px] text-slate-400">
                المعايير الموصى بها من OWASP & Google Security
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Pillar 1 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">الأكواد المضمنة (Inline XSS)</span>
                  {!xssProtection.hasUnsafeInline && xssProtection.cspHeaderFound ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>مقيدة وآمنة</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                      <XCircle className="w-3 h-3" />
                      <span>unsafe-inline متاح</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  حظر وسوم &lt;script&gt; المضمنة ومعالجات الأحداث (onerror/onclick).
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">التقييم الديناميكي (eval)</span>
                  {!xssProtection.hasUnsafeEval && xssProtection.cspHeaderFound ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>محظور ومحمي</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                      <XCircle className="w-3 h-3" />
                      <span>unsafe-eval نشط</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  منع تشغيل الأكواد المولدة ديناميكياً عبر eval() و Function().
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">عزل النطاقات (Wildcards)</span>
                  {!xssProtection.hasWildcard && xssProtection.cspHeaderFound ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>نطاقات موثوقة</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      <span>يحتوي رموز *</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  حظر استيراد السكربتات من أي خادم مجهول على الإنترنت بدون ترخيص.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">كائنات الفلاش (object-src)</span>
                  {xssProtection.hasObjectSrcNone ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>معطلة بـ 'none'</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                      <XCircle className="w-3 h-3" />
                      <span>غير مقيدة صراحة</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  إغلاق نافذة استغلال إضافات الفلاش و Java Applet لتجاوز قيود XSS.
                </p>
              </div>

              {/* Pillar 5 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">وسم القاعدة (base-uri)</span>
                  {xssProtection.hasBaseUriSelf ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>مقيد بـ 'self'</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                      <XCircle className="w-3 h-3" />
                      <span>توجيه مفقود</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  حظر اختطاف وسم &lt;base&gt; وإعادة توجيه مسارات السكربتات النسبية.
                </p>
              </div>

              {/* Pillar 6 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">الأنواع الموثوقة (DOM XSS)</span>
                  {xssProtection.hasRequireTrustedTypes ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Trusted Types مفعلة</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                      <span>غير مفعلة (موصى بها)</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  إلزام التطبيق بفلترة مدخلات دوال innerHTML لمنع DOM XSS نهائياً.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setRecFilter('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  recFilter === 'all'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                الكل ({allRecs.length})
              </button>
              <button
                type="button"
                onClick={() => setRecFilter('critical')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                  recFilter === 'critical'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>حرجة ({criticalCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setRecFilter('important')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                  recFilter === 'important'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>هامة ({importantCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setRecFilter('best_practice')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                  recFilter === 'best_practice'
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>أفضل الممارسات ({bestPracticeCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setRecFilter('pending')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  recFilter === 'pending'
                    ? 'bg-slate-800 dark:bg-slate-700 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                بانتظار التطبيق ({pendingRecsCount})
              </button>
              <button
                type="button"
                onClick={() => setRecFilter('fulfilled')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 text-emerald-600 dark:text-emerald-400 ${
                  recFilter === 'fulfilled'
                    ? 'bg-emerald-600 text-white dark:text-white'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                المستوفاة ({fulfilledRecsCount})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={recSearch}
                onChange={(e) => setRecSearch(e.target.value)}
                placeholder="بحث في التوصيات أو التوجيهات..."
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              {recSearch && (
                <button
                  type="button"
                  onClick={() => setRecSearch('')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Recommendations Cards List */}
          <div className="space-y-3">
            {filteredRecs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  لا توجد توصيات مطابقة لمعايير التصفية الحالية
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  جرب تغيير خيار التصفية أو مسح عبارة البحث لاستعراض كافة التوصيات.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRecFilter('all');
                    setRecSearch('');
                  }}
                  className="mt-2 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  إعادة ضبط التصفية &larr;
                </button>
              </div>
            ) : (
              filteredRecs.map((rec) => {
                const isExpanded = expandedRecId === rec.id;
                return (
                  <div
                    key={rec.id}
                    className={`rounded-2xl border transition-all p-4 space-y-3 ${
                      !rec.isFulfilled
                        ? rec.category === 'critical'
                          ? 'bg-rose-50/30 dark:bg-rose-950/15 border-rose-200 dark:border-rose-900/60 shadow-xs'
                          : rec.category === 'important'
                          ? 'bg-amber-50/30 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/60 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        : 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/80 dark:border-emerald-900/50'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          rec.category === 'critical'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                            : rec.category === 'important'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800'
                        }`}>
                          {rec.category === 'critical'
                            ? '🔴 أولوية قصوى (حرجة)'
                            : rec.category === 'important'
                            ? '🟡 أولوية عالية (هامة)'
                            : '🔵 أفضل الممارسات'}
                        </span>

                        {/* Threat Vector Badge */}
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {rec.threatTypeAr}
                        </span>

                        {/* Directive Name if any */}
                        {rec.directiveName && (
                          <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                            [{rec.directiveName}]
                          </span>
                        )}
                      </div>

                      {/* Fulfillment Status */}
                      <div className="flex items-center gap-2">
                        {rec.isFulfilled ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مستوفاة في موقعك ✓</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>غير مطبقة (بحاجة لتدخل) ✗</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{rec.titleAr}</span>
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {rec.descriptionAr}
                      </p>
                    </div>

                    {/* Threat Impact Callout */}
                    <div className="p-3 bg-white dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                        <Shield className="w-3.5 h-3.5" />
                        <span>الأثر الأمني وطريقة صد هجوم XSS:</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rec.impactAr}
                      </p>
                    </div>

                    {/* Recommended Directive Line */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          صيغة التوجيه الموصى به:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(rec.recommendedDirective, `dir-${rec.id}`)}
                          className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 cursor-pointer"
                        >
                          {copiedCode === `dir-${rec.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ التوجيه</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-2 bg-slate-950 text-cyan-400 font-mono text-xs rounded-lg overflow-x-auto whitespace-pre dir-ltr text-left border border-slate-800" dir="ltr">
                        {rec.recommendedDirective}
                      </div>
                    </div>

                    {/* Expandable Code Snippet and Implementation Guide */}
                    {rec.codeSnippet && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                          className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>{isExpanded ? 'إخفاء كود التضمين' : 'عرض كود التطبيق العملي ونموذج الخادم'}</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                شفرة برمجية جاهزة للتطبيق:
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(rec.codeSnippet!, `snippet-${rec.id}`)}
                                className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 cursor-pointer"
                              >
                                {copiedCode === `snippet-${rec.id}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>تم نسخ الكود!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>نسخ الكود كاملاً</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto whitespace-pre dir-ltr text-left border border-slate-800" dir="ltr">
                              {rec.codeSnippet}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Master Strict CSP Template Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-cyan-500/5 dark:from-cyan-950/40 dark:via-indigo-950/30 dark:to-cyan-950/20 border border-cyan-300 dark:border-cyan-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                    النموذج المعتمد لسياسة CSP الصارمة (Strict CSP Master Template)
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    نموذج إنتاجي متكامل يطبق كافة توصيات OWASP و Google Security لإلغاء مخاطر XSS تماماً.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const strictCsp = "default-src 'self'; script-src 'self' 'nonce-$NONCE' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'self';";
                    handleCopy(strictCsp, 'master-strict-csp');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedCode === 'master-strict-csp' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم نسخ النموذج!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ ترويسة CSP الصارمة</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('configs')}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer flex items-center gap-1"
                >
                  <Server className="w-3.5 h-3.5 text-cyan-600" />
                  <span>توليد إعدادات الخادم &larr;</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 text-cyan-400 font-mono text-xs rounded-xl overflow-x-auto whitespace-pre dir-ltr text-left border border-slate-800 select-all" dir="ltr">
{`# إعداد ترويسة سياسة أمان المحتوى الصارمة (Strict CSP)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-$NONCE' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'self';" always;`}
            </div>
          </div>
        </div>
      )}

      {/* TAB HSTS: DETAILED HSTS & SUBDOMAINS DEEP-DIVE */}
      {activeTab === 'hsts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top HSTS Status Card */}
          <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
            mitmProtection.status === 'protected'
              ? 'bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-emerald-500/5 dark:from-emerald-950/40 dark:via-cyan-950/20 dark:to-emerald-950/30 border-emerald-300 dark:border-emerald-800'
              : mitmProtection.status === 'partial'
              ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-950/30 border-amber-300 dark:border-amber-800'
              : 'bg-gradient-to-r from-rose-500/10 via-red-500/5 to-rose-500/5 dark:from-rose-950/40 dark:via-red-950/20 dark:to-rose-950/30 border-rose-300 dark:border-rose-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  mitmProtection.status === 'protected'
                    ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                    : mitmProtection.status === 'partial'
                    ? 'bg-amber-600 text-white shadow-amber-500/25'
                    : 'bg-rose-600 text-white shadow-rose-500/25'
                }`}>
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      فحص ترويسة Strict-Transport-Security (HSTS)
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                      mitmProtection.status === 'protected'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                        : mitmProtection.status === 'partial'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                    }`}>
                      {mitmProtection.status === 'protected' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{mitmProtection.badgeAr}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    ترويسة HSTS تجبر المتصفحات على حصر الاتصال بموقعك عبر بروتوكول HTTPS المشفر حصراً وترفض التحويل إلى HTTP أو استجابة طلبات المهاجمين في الشبكات العامة.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="font-mono text-xs px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                  {mitmProtection.hstsHeaderFound ? 'الترويسة مرصودة في الـ Headers ✓' : 'الترويسة مفقودة ✗'}
                </span>
              </div>
            </div>

            {/* Raw Header Value Box */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-mono">
                  <span>القيمة الفعلية المستلمة في استجابة الخادم:</span>
                </span>
                {mitmProtection.rawHeader && (
                  <button
                    type="button"
                    onClick={() => handleCopy(mitmProtection.rawHeader!, 'raw-hsts')}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 cursor-pointer"
                  >
                    {copiedCode === 'raw-hsts' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الترويسة</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="p-2.5 bg-slate-950 text-cyan-400 font-mono text-xs rounded-lg overflow-x-auto whitespace-pre dir-ltr text-left border border-slate-800 select-all" dir="ltr">
                {mitmProtection.rawHeader || 'Strict-Transport-Security: (غير مفعلة في استجابة الخادم)'}
              </div>
            </div>
          </div>

          {/* TWO MAIN CARDS: VALIDITY DURATION & SUBDOMAIN PATH */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD 1: DURATION (max-age) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      1. فحص مدة الصلاحية (Validity Duration: max-age)
                    </h5>
                    <span className="text-[11px] text-slate-400">فترة احتفاظ متصفح الزائر بالأمر المشفر</span>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  mitmProtection.isOptimalMaxAge
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    : mitmProtection.maxAgeSeconds
                    ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300'
                    : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300'
                }`}>
                  {mitmProtection.isOptimalMaxAge ? 'مدة قياسية مثالية (سنة فأكثر)' : mitmProtection.maxAgeSeconds ? 'مدة قصيرة' : 'غير محددة'}
                </span>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">المدة بالثواني</span>
                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                    {mitmProtection.maxAgeSeconds ? mitmProtection.maxAgeSeconds.toLocaleString() : '0'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">max-age</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">المدة بالأيام</span>
                  <span className={`font-mono text-sm font-black mt-0.5 block ${
                    mitmProtection.isOptimalMaxAge ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {mitmProtection.maxAgeDays ? `${mitmProtection.maxAgeDays} يوم` : '0 يوم'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">حفظ تلقائي</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">المدة بالسنوات</span>
                  <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                    {mitmProtection.maxAgeYears ? `${mitmProtection.maxAgeYears} سنة` : mitmProtection.maxAgeDays ? `${(mitmProtection.maxAgeDays / 365).toFixed(1)} سنة` : '0'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">الهدف: 1 سنة</span>
                </div>
              </div>

              {/* Progress bar towards 1 year */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">مطابقة معيار Google Preload (31536000 ثانية):</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400">
                    {mitmProtection.isOptimalMaxAge ? '100% (مستوفى)' : mitmProtection.maxAgeSeconds ? `${Math.min(100, Math.round((mitmProtection.maxAgeSeconds / 31536000) * 100))}%` : '0%'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      mitmProtection.isOptimalMaxAge ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${mitmProtection.isOptimalMaxAge ? 100 : Math.min(100, Math.round(((mitmProtection.maxAgeSeconds || 0) / 31536000) * 100))}%`
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  {mitmProtection.validityEvaluationAr || 'يجب ألا تقل قيمة max-age عن 31536000 ثانية لضمان حماية المتصفح لمدة عام كامل.'}
                </span>
              </div>

              {/* Technical description */}
              <div className="p-3 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40 rounded-xl text-xs space-y-1">
                <span className="font-bold text-cyan-800 dark:text-cyan-300 block">
                  💡 كيف تعمل مدة الصلاحية في متصفح الزائر؟
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  عندما يزور المستخدم موقعك أول مرة، يقرأ المتصفح ترويسة HSTS ويحفظ نطاقك في جدول التشفير الداخلي. وطوال مدة {mitmProtection.maxAgeDays || 0} يوماً، لن يسمح المتصفح بإرسال أي طلب غير مشفر، حتى لو نقر الزائر على رابط قديم يبدأ بـ http://، بل يقوم بتحويله داخلياً (Internal Redirect 307) قبل الخروج للإنترنت.
                </p>
              </div>
            </div>

            {/* CARD 2: SUBDOMAIN COVERAGE (includeSubDomains) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Network className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      2. فحص مسار النطاق الفرعي (Subdomain Path: includeSubDomains)
                    </h5>
                    <span className="text-[11px] text-slate-400">تطبيق التشفير الإلزامي على كافة الفروع</span>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  mitmProtection.includeSubDomains
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300'
                }`}>
                  {mitmProtection.includeSubDomains ? 'مشمول وشامل ✓' : 'غير مشمول ✗'}
                </span>
              </div>

              {/* Status explanation */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  نطاق التغطية والمسار الفعلي:
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {mitmProtection.subdomainsScopeAr || (mitmProtection.includeSubDomains ? `مطبق على ${domain} وجميع النطاقات الفرعية (*.${domain})` : `مقتصر على ${domain} فقط`)}
                </span>
              </div>

              {/* Subdomain Hierarchy Tree Visualizer */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">
                  🗺️ خريطة مسارات الحماية للنطاقات التابعة لـ {domain}:
                </span>

                <div className="space-y-2 font-mono text-[11px]">
                  {/* Apex Domain */}
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-cyan-600" />
                      <span className="font-bold text-slate-900 dark:text-white" dir="ltr">https://{domain}</span>
                      <span className="text-[10px] text-slate-400 font-sans">(النطاق الرئيسي)</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">محمي بـ HSTS ✓</span>
                  </div>

                  {/* Subdomains */}
                  <div className="pr-4 space-y-1.5 border-r-2 border-indigo-200 dark:border-indigo-900/60 mr-2">
                    {[
                      { sub: `api.${domain}`, desc: 'واجهة برمجة التطبيقات' },
                      { sub: `cdn.${domain}`, desc: 'خوادم الملفات والوسائط' },
                      { sub: `shop.${domain}`, desc: 'بوابات الدفع والمتجر' },
                      { sub: `auth.${domain}`, desc: 'إدارة الهوية وتسجيل الدخول' }
                    ].map((s, idx) => (
                      <div key={idx} className="p-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">&larr;</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300" dir="ltr">{s.sub}</span>
                          <span className="text-[9px] text-slate-400 font-sans hidden sm:inline">({s.desc})</span>
                        </div>
                        {mitmProtection.includeSubDomains ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] font-sans flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>مشمول بالحماية</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 font-bold text-[10px] font-sans flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>عرضة للتنصت</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security Warning on missing includeSubDomains */}
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>لماذا يُعد مسار النطاق الفرعي حاسماً لمنع الاختراق؟</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  في حال عدم تضمين <code>includeSubDomains</code>، يمكن للمهاجم اعتراض طلبات أي نطاق فرعي منسي (مثل مدونة قديمة أو صفحة هبوط) عبر شبكة غير آمنة وحقن ملف تعريف ارتباط خبيث في النطاق الرئيسي (Cookie Injection)، مما يهدد جلسات المستخدمين في الموقع الأساسي.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 3: HSTS PRELOAD READINESS CHECKLIST */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                    3. فحص الجاهزية لقائمة المتصفحات المسبقة (HSTS Preload List)
                  </h5>
                  <span className="text-[11px] text-slate-400">
                    قائمة مدمجة في شفرة Google Chrome و Firefox و Safari تفرض HTTPS حتى في الزيارة الأولى
                  </span>
                </div>
              </div>

              <a
                href={`https://hstspreload.org/?domain=${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto border border-slate-200 dark:border-slate-700"
              >
                <span>فحص النطاق على hstspreload.org</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">1. تشفير HTTPS صالح</span>
                  {targetUrl.startsWith('https://') ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block">شهادة SSL سارية على النطاق الرئيسي</span>
              </div>

              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">2. مدة الصلاحية</span>
                  {mitmProtection.isOptimalMaxAge ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block">max-age &gt;= 31536000 (سنة كاملة)</span>
              </div>

              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">3. مسار النطاقات الفرعية</span>
                  {mitmProtection.includeSubDomains ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block">توجيه includeSubDomains مفعل</span>
              </div>

              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">4. توجيه Preload</span>
                  {mitmProtection.preload ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block">توجيه preload مضاف صراحة</span>
              </div>
            </div>
          </div>

          {/* CARD 4: READY-TO-DEPLOY CODE CONFIGS */}
          <div className="p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>الترويسة القياسية الموصى بها للتطبيق الفوري:</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload', 'rec-hsts')}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                {copiedCode === 'rec-hsts' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'rec-hsts' ? 'تم النسخ!' : 'نسخ الترويسة'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/60 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre dir-ltr text-left border border-slate-800" dir="ltr">
              <code>Strict-Transport-Security: max-age=31536000; includeSubDomains; preload</code>
            </pre>
            <p className="text-[11px] text-slate-400">
              يمكنك أيضاً التبديل إلى تبويب <button type="button" onClick={() => setActiveTab('configs')} className="text-cyan-400 underline font-bold cursor-pointer">أكواد الخادم (Fix Configs)</button> للحصول على التكوين الكامل لنظام خادمك (Nginx / Apache / Cloudflare).
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED DIRECTIVES BREAKDOWN */}
      {activeTab === 'directives' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-500" />
              <span>فحص توجيهات سياسة أمان المحتوى (CSP Directives Deep-Dive)</span>
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {xssProtection.directives.length} توجيهات تم فحصها
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">التوجيه (Directive)</th>
                    <th className="py-2.5 px-3 font-bold">الوصف والغرض الأمني</th>
                    <th className="py-2.5 px-3 font-bold">القيم المعرفة</th>
                    <th className="py-2.5 px-3 font-bold text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {xssProtection.directives.map((dir, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-700 dark:text-cyan-300">
                        {dir.directive}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-[280px]">
                        {dir.descriptionAr}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300" dir="ltr">
                        {dir.values.length > 0 ? dir.values.join(' ') : <span className="text-slate-400 italic">غير محدد صراحة</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {dir.status === 'secure' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                            آمن ✓
                          </span>
                        ) : dir.status === 'warning' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200">
                            تحذير ⚠
                          </span>
                        ) : dir.status === 'unsafe' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200">
                            غير آمن ✗
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                            مفقود
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SERVER FIX CONFIGURATIONS */}
      {activeTab === 'configs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span>إعدادات جاهزة لتهيئة ترويسات الأمان في خادم موقعك</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                انسخ الكود المناسب لنوع خادمك لتطبيق ترويسات HSTS و CSP لحماية فورية من هجمات XSS و MitM.
              </p>
            </div>

            {/* Server Type Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto flex-wrap">
              {(['nginx', 'apache', 'cloudflare', 'express', 'nextjs'] as const).map(srv => (
                <button
                  key={srv}
                  type="button"
                  onClick={() => setActiveServerTab(srv)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    activeServerTab === srv
                      ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {srv === 'nginx' ? 'Nginx' : srv === 'apache' ? 'Apache (.htaccess)' : srv === 'cloudflare' ? 'Cloudflare' : srv === 'express' ? 'Express (Helmet)' : 'Next.js'}
                </button>
              ))}
            </div>
          </div>

          {/* Code Block Container */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {activeServerTab === 'nginx' ? 'nginx.conf / sites-available' : activeServerTab === 'apache' ? '.htaccess' : activeServerTab === 'cloudflare' ? 'worker.js' : activeServerTab === 'express' ? 'server.ts / app.ts' : 'next.config.js'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(serverFixConfigs[activeServerTab], activeServerTab)}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
              >
                {copiedCode === activeServerTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الكود بالكامل</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 text-slate-200 overflow-x-auto text-[11.5px] leading-relaxed dir-ltr text-left" dir="ltr">
              <code>{serverFixConfigs[activeServerTab]}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE SECURITY SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="p-5 bg-gradient-to-br from-slate-50 via-slate-50/50 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-500" />
                <span>محاكي تقييم الأمان التفاعلي (Security Headers What-If Simulator)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                جرّب تفعيل وتعطيل خيارات HSTS و CSP وشاهد كيف ترتفع درجة موقعك الأمني مباشرة من F إلى A+.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">الدرجة المحاكاة</span>
                <span className="text-xs text-slate-500 font-mono">{simScore}/100 نقطة</span>
              </div>
              <div className={`px-4 py-2 rounded-xl text-lg font-black font-mono border ${getGradeBadge(simGrade)}`}>
                {simGrade}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HSTS Simulator Controls */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-500" />
                  <span>إعدادات HSTS (حماية MitM)</span>
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simHstsEnabled}
                    onChange={(e) => setSimHstsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-cyan-600" />
                </label>
              </div>

              {simHstsEnabled && (
                <div className="space-y-2.5 pt-1 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">
                      مدة الصلاحية (max-age): {Math.round(simHstsMaxAge / 86400)} يوم
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={31536000}
                      step={2592000}
                      value={simHstsMaxAge}
                      onChange={(e) => setSimHstsMaxAge(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0</span>
                      <span>6 أشهر</span>
                      <span>سنة كاملة (31536000s)</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={simHstsSubdomains}
                      onChange={(e) => setSimHstsSubdomains(e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>شمل كافة النطاقات الفرعية (includeSubDomains)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simHstsPreload}
                      onChange={(e) => setSimHstsPreload(e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>تأهيل الموقع لقائمة Preload للمتصفحات</span>
                  </label>
                </div>
              )}
            </div>

            {/* CSP Simulator Controls */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-cyan-500" />
                  <span>إعدادات CSP (حماية XSS)</span>
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simCspEnabled}
                    onChange={(e) => setSimCspEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-cyan-600" />
                </label>
              </div>

              {simCspEnabled && (
                <div className="space-y-2.5 pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!simCspUnsafeInline}
                      onChange={(e) => setSimCspUnsafeInline(!e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>حظر الأكواد المضمنة الخطرة (بدون 'unsafe-inline')</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simCspObjectSrcNone}
                      onChange={(e) => setSimCspObjectSrcNone(e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>حظر كائنات الفلاش والإضافات القديمة (object-src 'none')</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simXFrameEnabled}
                      onChange={(e) => setSimXFrameEnabled(e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>تفعيل X-Frame-Options لمنع هجمات Clickjacking</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
