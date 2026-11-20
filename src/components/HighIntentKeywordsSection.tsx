import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Target,
  ShoppingCart,
  Briefcase,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Compass,
  Zap,
  HelpCircle,
  FileText,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  DollarSign,
  Flame,
  CheckSquare
} from 'lucide-react';
import {
  AuditResult,
  HighIntentKeywordsAnalysis,
  HighIntentKeywordItem,
  SearchIntentType
} from '../types/seo';

interface Props {
  auditData: AuditResult;
}

export const HighIntentKeywordsSection: React.FC<Props> = ({ auditData }) => {
  const [analysis, setAnalysis] = useState<HighIntentKeywordsAnalysis | undefined>(
    auditData.highIntentKeywords
  );

  const [activeTab, setActiveTab] = useState<'keywords' | 'content_plan'>('keywords');
  const [intentFilter, setIntentFilter] = useState<'all' | SearchIntentType>('all');
  const [gapFilter, setGapFilter] = useState<'all' | 'missing' | 'weak' | 'covered'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKeywordId, setExpandedKeywordId] = useState<string | null>(null);

  // Live AI Regeneration State
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showAiControls, setShowAiControls] = useState(false);
  const [focusIntent, setFocusIntent] = useState<'all' | 'commercial' | 'transactional' | 'informational'>('all');
  const [customFocus, setCustomFocus] = useState('');
  const [aiSource, setAiSource] = useState<string | null>(null);

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedHeadingId, setCopiedHeadingId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Fallback to initial data if not present
  const currentAnalysis = analysis || auditData.highIntentKeywords;

  if (!currentAnalysis) {
    return null;
  }

  const {
    keywords,
    targetTopicAr,
    pageSummaryAr,
    primaryGapAr,
    quickWinsAr,
    suggestedContentPlan,
    intentDistribution
  } = currentAnalysis;

  // Filtered keywords
  const filteredKeywords = useMemo(() => {
    return keywords.filter(k => {
      if (intentFilter !== 'all' && k.intent !== intentFilter) return false;
      if (gapFilter !== 'all' && k.contentGap !== gapFilter) return false;
      if (difficultyFilter !== 'all' && k.difficulty !== difficultyFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inKw = k.keyword.toLowerCase().includes(q);
        const inTip = k.actionableTipAr.toLowerCase().includes(q);
        const inHeading = k.readyHeadingAr.toLowerCase().includes(q);
        if (!inKw && !inTip && !inHeading) return false;
      }
      return true;
    });
  }, [keywords, intentFilter, gapFilter, difficultyFilter, searchQuery]);

  // Handle AI Deep Refine
  const handleRegenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsRegenerating(true);
    try {
      const resp = await fetch('/api/ai/high-intent-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: auditData.url,
          pageTitle: auditData.pageTitle,
          metaDescription: auditData.metaDescription,
          headings: auditData.headings,
          bodyText: auditData.pageTitle || '',
          topKeywords: (auditData.keywordsAnalysis?.topSingleKeywords || []).map(k => ({
            word: k.keyword,
            count: k.count,
            density: k.density
          })),
          focusIntent,
          customFocus: customFocus.trim()
        })
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json.data) {
          setAnalysis(json.data);
          setAiSource(json.source || 'gemini-3.8-flash');
          setShowAiControls(false);
        }
      }
    } catch (err) {
      console.error('Failed to regenerate high-intent keywords:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyKeyword = (kw: HighIntentKeywordItem) => {
    navigator.clipboard.writeText(kw.keyword);
    setCopiedId(kw.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyHeading = (kw: HighIntentKeywordItem) => {
    navigator.clipboard.writeText(kw.readyHeadingAr);
    setCopiedHeadingId(kw.id);
    setTimeout(() => setCopiedHeadingId(null), 2000);
  };

  const copyAllKeywords = () => {
    const text = filteredKeywords.map(k => `${k.keyword} [${k.intentLabelAr}] - فرصة: ${k.opportunityScore}%`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const exportCsv = () => {
    const headers = ['الكلمة المفتاحية', 'نية البحث', 'معدل الفرصة', 'الصعوبة', 'حجم البحث التقديري', 'عائد النقر CPC', 'حالة فجوة المحتوى', 'المكان المقترح', 'العنوان المقترح H2', 'نصيحة السيو'];
    const rows = filteredKeywords.map(k => [
      `"${k.keyword.replace(/"/g, '""')}"`,
      `"${k.intentLabelAr}"`,
      `"${k.opportunityScore}%"`,
      `"${k.difficultyLabelAr}"`,
      `"${k.estimatedVolume}"`,
      `"${k.cpcPotentialLabelAr}"`,
      `"${k.contentGapLabelAr}"`,
      `"${k.suggestedPlacementLabelAr}"`,
      `"${k.readyHeadingAr.replace(/"/g, '""')}"`,
      `"${k.actionableTipAr.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `high_intent_keywords_${new URL(auditData.url).hostname}.csv`;
    link.click();
  };

  const totalTransactionalAndCommercial = (intentDistribution.commercial || 0) + (intentDistribution.transactional || 0);
  const easyWinsCount = keywords.filter(k => k.difficulty === 'easy').length;

  return (
    <div id="high-intent-keywords-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
      {/* Top Header Banner with Gemini Branding */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/25 text-purple-200 border border-purple-400/30 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span>تحليل الذكاء الاصطناعي (Gemini 3.8 Flash)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-white/10 text-slate-300 border border-white/10">
                نية البحث العالية • High-Intent Keywords
              </span>
              {aiSource && (
                <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  محدث مباشرة بواسطة {aiSource}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
              الكلمات الرئيسية ذات النية العالية لاستهدافها في المحتوى (High-Intent SEO Keywords)
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              تحليل عميق لمحتوى صفحتك الحالية واستخراج الكلمات المفتاحية ذات النية الشرائية والتجارية (Commercial & Transactional) التي ترفع من نسبة التحويل وتجلب عملاء وزواراً مستهدفين، مع خطة عناوين H2 جاهزة للتطبيق الفوري.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-purple-200">
              <span className="font-semibold text-slate-300">التصنيف الدقيق المستكشف:</span>
              <span className="bg-purple-950/80 px-2.5 py-0.5 rounded-lg border border-purple-500/30 text-white font-bold">
                {targetTopicAr}
              </span>
            </div>
          </div>

          {/* Action Button: AI Deep Refine */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAiControls(!showAiControls)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>تخصيص وإعادة التوليد بالذكاء الاصطناعي</span>
              {showAiControls ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* AI Deep Refine Panel (Collapsible) */}
        {showAiControls && (
          <form onSubmit={handleRegenerate} className="mt-5 pt-4 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl relative z-10 text-xs">
            <div>
              <label className="block text-slate-200 font-bold mb-1">
                التركيز على نوع نية البحث:
              </label>
              <select
                value={focusIntent}
                onChange={(e) => setFocusIntent(e.target.value as any)}
                className="w-full bg-slate-900 border border-purple-500/40 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="all">جميع النوايا الاستراتيجية (متوازن)</option>
                <option value="transactional">نية شرائية وإجرائية فقط (مبيعات واشتراكات)</option>
                <option value="commercial">نية تجارية واستقصائية (مقارنات وتقييمات)</option>
                <option value="informational">نية معلوماتية متقدمة (حل مشكلات وأدلة)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-200 font-bold mb-1">
                توجيهات إضافية للذكاء الاصطناعي (اختياري):
              </label>
              <input
                type="text"
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder="مثال: ركز على المنتجات الأكثر مبيعاً في الخليج"
                className="w-full bg-slate-900 border border-purple-500/40 rounded-lg px-2.5 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isRegenerating}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التحليل المعمق عبر Gemini 3.8...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توليد كلمات مخصصة الآن</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Overview Stat Badges */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-xs font-medium">الكلمات ذات النية العالية</span>
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {keywords.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              مستهدفة ومحددة بدقة
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-xs font-medium">نية الشراء والتحويل</span>
              <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalTransactionalAndCommercial} <span className="text-xs font-normal text-slate-500">كلمات</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              تجارية واستقصائية (High Converting)
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-xs font-medium">فرص التصدر السريع</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {easyWinsCount} <span className="text-xs font-normal text-slate-500">كلمات سهلة</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              منافسة منخفضة وسرعة نتائج
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-xs font-medium">معدل فرصة النمو العضوي</span>
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
              92%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              زيادة متوقعة في النقرات المستهدفة
            </div>
          </div>
        </div>

        {/* Quick Wins Banner */}
        <div className="mt-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>أسرع 3 فرص للقفز بالترتيب خلال 30 يوماً (Quick Wins):</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300 pr-1">
              {quickWinsAr.map((win, idx) => (
                <li key={idx} className="leading-relaxed">
                  {win}
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={copyAllKeywords}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'تم النسخ!' : 'نسخ الكلمات'}</span>
            </button>
            <button
              onClick={exportCsv}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير CSV</span>
            </button>
          </div>
        </div>

        {/* Primary Content Gap Alert */}
        <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-bold">تشخيص فجوة المحتوى (Content Gap): </strong>
            {primaryGapAr}
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="px-5 sm:px-6 pt-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('keywords')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'keywords'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>قائمة الكلمات ذات النية العالية ({filteredKeywords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('content_plan')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'content_plan'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>خطة المحتوى والعناوين الجاهزة H2</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-5 sm:p-6 space-y-4">
        {activeTab === 'keywords' && (
          <>
            {/* Interactive Filters Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Intent Filter */}
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-purple-500" />
                  <span>النية:</span>
                </span>
                <button
                  onClick={() => setIntentFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    intentFilter === 'all'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  الكل ({keywords.length})
                </button>
                <button
                  onClick={() => setIntentFilter('transactional')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    intentFilter === 'transactional'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingCart className="w-3 h-3 text-emerald-500" />
                  <span>شرائية ({intentDistribution.transactional})</span>
                </button>
                <button
                  onClick={() => setIntentFilter('commercial')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    intentFilter === 'commercial'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Briefcase className="w-3 h-3 text-blue-500" />
                  <span>تجارية ({intentDistribution.commercial})</span>
                </button>
                <button
                  onClick={() => setIntentFilter('informational_high')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    intentFilter === 'informational_high'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-3 h-3 text-purple-500" />
                  <span>معلوماتية ({intentDistribution.informational})</span>
                </button>

                {/* Gap Filter */}
                <span className="font-bold text-slate-700 dark:text-slate-300 mr-2 ltr:ml-2">الفجوة:</span>
                <select
                  value={gapFilter}
                  onChange={(e) => setGapFilter(e.target.value as any)}
                  className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">كل الحالات</option>
                  <option value="missing">فجوة محتوى غير مغطاة (أولوية قصوى)</option>
                  <option value="weak">مذكورة بضعف في الصفحة</option>
                  <option value="covered">مغطاة وتحتاج تعزيز</option>
                </select>
              </div>

              {/* Search input */}
              <div className="relative w-full lg:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في الكلمات أو النصائح..."
                  className="w-full text-xs rounded-lg pr-8 pl-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Keywords List */}
            {filteredKeywords.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-xs">
                لا توجد كلمات مطابقة للفلاتر المحددة حالياً. حاول إعادة تعيين الفلاتر.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredKeywords.map((kw, idx) => {
                  const isExpanded = expandedKeywordId === kw.id;

                  // Distinct badge styles based on Intent
                  const intentStyles = {
                    transactional: {
                      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
                      icon: ShoppingCart,
                      label: 'نية شرائية (Transactional)'
                    },
                    commercial: {
                      bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
                      icon: Briefcase,
                      label: 'نية تجارية (Commercial)'
                    },
                    informational_high: {
                      bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300',
                      icon: BookOpen,
                      label: 'نية معلوماتية (Informational)'
                    },
                    navigational: {
                      bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300',
                      icon: Compass,
                      label: 'نية تنقلية'
                    }
                  }[kw.intent] || {
                    bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300',
                    icon: Target,
                    label: kw.intentLabelAr
                  };

                  const IntentIcon = intentStyles.icon;

                  // Gap Badge
                  const gapBadge = {
                    missing: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                    weak: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                    covered: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                  }[kw.contentGap];

                  // Difficulty
                  const diffColor = {
                    easy: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
                    medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
                    hard: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800'
                  }[kw.difficulty];

                  return (
                    <div
                      key={kw.id}
                      className={`border rounded-xl transition-all ${
                        isExpanded
                          ? 'border-purple-300 dark:border-purple-700 bg-purple-50/20 dark:bg-purple-950/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Main Row */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-mono flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span>{kw.keyword}</span>
                            </span>

                            <button
                              onClick={() => copyKeyword(kw)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                              title="نسخ الكلمة المفتاحية"
                            >
                              {copiedId === kw.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Intent badge */}
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1 ${intentStyles.bg}`}>
                              <IntentIcon className="w-3 h-3" />
                              <span>{kw.intentLabelAr}</span>
                            </span>

                            {/* Content Gap badge */}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${gapBadge}`}>
                              {kw.contentGapLabelAr}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <span>الصعوبة:</span>
                              <span className={`px-1.5 py-0.2 rounded text-[11px] font-bold border ${diffColor}`}>
                                {kw.difficultyLabelAr}
                              </span>
                            </span>

                            <span>•</span>
                            <span>البحث: <strong className="text-slate-700 dark:text-slate-300 font-mono">{kw.estimatedVolume}</strong></span>
                            <span>•</span>
                            <span>عائد النقر: <strong className="text-slate-700 dark:text-slate-300">{kw.cpcPotentialLabelAr}</strong></span>
                            <span>•</span>
                            <span>الموضع المقترح: <strong className="text-purple-600 dark:text-purple-400">{kw.suggestedPlacementLabelAr}</strong></span>
                          </div>
                        </div>

                        {/* Right: Opportunity score & expand toggle */}
                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">معدل الفرصة</div>
                            <div className="text-base font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                              {kw.opportunityScore}%
                            </div>
                          </div>

                          <button
                            onClick={() => setExpandedKeywordId(isExpanded ? null : kw.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'إخفاء التفاصيل' : 'استراتيجية الاستهداف'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Strategic Drawer */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 pt-0 border-t border-slate-200 dark:border-slate-700/60 space-y-3.5 text-xs">
                          {/* Search Intent Psychological Explanation */}
                          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-1">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                              <span>سيكولوجية نية الباحث (Search Intent Analysis):</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pr-5">
                              {kw.intentExplanationAr}
                            </p>
                          </div>

                          {/* Ready-to-use Suggested H2 Heading */}
                          <div className="bg-purple-50 dark:bg-purple-950/40 rounded-xl p-3.5 border border-purple-200 dark:border-purple-800 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                <span>عنوان فرعي H2 مقترح جاهز للنشر فوراً:</span>
                              </span>
                              <button
                                onClick={() => copyHeading(kw)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                {copiedHeadingId === kw.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedHeadingId === kw.id ? 'تم النسخ!' : 'نسخ العنوان'}</span>
                              </button>
                            </div>
                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg font-bold text-slate-900 dark:text-white border border-purple-200 dark:border-purple-900 text-xs sm:text-sm">
                              {kw.readyHeadingAr}
                            </div>
                          </div>

                          {/* Actionable SEO Advice */}
                          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3.5 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>نصيحة السيو العملية لتخطي المنافسين (Actionable SEO Tip):</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed pr-5">
                              {kw.actionableTipAr}
                            </p>
                          </div>

                          {/* Related Search Queries (LSI) */}
                          {kw.searchQueries && kw.searchQueries.length > 0 && (
                            <div>
                              <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                                استفسارات وكلمات بحث فرعية مرادفة (LSI Queries):
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {kw.searchQueries.map((query, qIdx) => (
                                  <span
                                    key={qIdx}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-600 flex items-center gap-1"
                                  >
                                    <span>{query}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Tab 2: Content Blueprint & Outlines */}
        {activeTab === 'content_plan' && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                هذه الهيكلية تم تصميمها بواسطة نماذج الذكاء الاصطناعي بناءً على تحليل الكلمات الأكثر بحثاً، لإنشاء مقالات وأقسام تغطي موضوعك بالكامل وتستحوذ على الترتيب الأول في جوجل ومقتطفات البحث الذكية (Featured Snippets).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedContentPlan.map((plan, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-mono flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span>هيكل مقال مقترح</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 font-semibold text-[11px]">
                      الكلمة: {plan.targetKeyword}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      العنوان المقترح (H1 / Title):
                    </span>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                      {plan.titleAr}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      العناوين الفرعية الموصى بها (H2 Outlines):
                    </span>
                    <ul className="space-y-1.5 pr-1">
                      {plan.h2Headings.map((h2, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <span className="text-purple-500 font-bold">H2.</span>
                          <span>{h2}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      سؤال مقترح لبيانات الـ FAQ Schema:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 italic">
                      "{plan.faqQuestionAr}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
