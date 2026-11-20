import React, { useState, useMemo } from 'react';
import {
  Network,
  Link2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderTree,
  FileText,
  Layers,
  ArrowUpRight,
  Filter,
  Compass,
  TrendingUp,
  Copy,
  Check
} from 'lucide-react';
import { InternalLinkingAnalysis, InternalLinkItem } from '../types/seo';

interface Props {
  analysis?: InternalLinkingAnalysis;
  pageUrl: string;
  wordCount?: number;
}

export const InternalLinkingAnalyzer: React.FC<Props> = ({ analysis, pageUrl, wordCount = 0 }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'explorer'>('overview');
  const [filterType, setFilterType] = useState<'all' | 'contextual' | 'generic'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!analysis) {
    return null;
  }

  const {
    totalInternalLinks,
    uniqueInternalUrls,
    contextualLinksCount,
    navigationalLinksCount,
    genericAnchorCount,
    linkHealthScore,
    ratioPerThousandWords,
    clusters,
    topAnchors,
    sampleLinks,
    suggestions
  } = analysis;

  const contextualPercentage = totalInternalLinks > 0 ? Math.round((contextualLinksCount / totalInternalLinks) * 100) : 0;
  const genericPercentage = totalInternalLinks > 0 ? Math.round((genericAnchorCount / totalInternalLinks) * 100) : 0;

  // Filter links for the explorer
  const filteredLinks = useMemo(() => {
    return sampleLinks.filter(item => {
      if (filterType === 'contextual' && !item.isContextual) return false;
      if (filterType === 'generic' && !item.isGenericAnchor) return false;
      if (categoryFilter !== 'all' && item.targetCategory !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.anchorText.toLowerCase().includes(q) || item.path.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sampleLinks, filterType, categoryFilter, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60';
    return 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60';
  };

  return (
    <div id="internal-linking-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                محلل هيكل الروابط الداخلية وترابط الصفحات (Internal Linking Structure)
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getScoreColor(linkHealthScore)}`}>
                {linkHealthScore >= 80 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>صحة الترابط: {linkHealthScore}/100</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              تحليل توزيع الروابط التحريرية، فحص جودة النصوص الرابطة (Anchor Texts)، وتوصيات لبناء نموذج المجموعات العنقودية (Topic Clusters).
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>نظرة عامة والهيكل</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('suggestions')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'suggestions'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>اقتراحات الترابط ({suggestions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'explorer'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>مستكشف الروابط ({totalInternalLinks})</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
            إجمالي الروابط الداخلية
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {totalInternalLinks}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({uniqueInternalUrls} صفحة فريدة)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
            توجه الزائر لمسارات داخلية في نفس النطاق
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
            روابط سياقية في صلب النص
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 tabular-nums">
              {contextualLinksCount}
            </span>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
              ({contextualPercentage}%)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
            ضمن فقرات المقال التحريرية (الأعلى وزناً)
          </span>
        </div>

        <div className={`p-3.5 rounded-xl border ${
          genericAnchorCount > 0
            ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
            : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
        }`}>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
            نصوص روابط عامة ضعيفة
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono tabular-nums ${
              genericAnchorCount > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'
            }`}>
              {genericAnchorCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ({genericPercentage}%)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
            {genericAnchorCount > 0 ? 'مثل "اضغط هنا" أو "المزيد" تحتاج تحسين' : 'جميع الروابط تستخدم نصوصاً وصفية'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
            كثافة الروابط لكل 1000 كلمة
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
              {ratioPerThousandWords}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              رابط / 1k كلمة
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
            المعدل المثالي عالمياً: 3 إلى 5 روابط سياقية
          </span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & STRUCTURE CLUSTERS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Ratio Progress Bar: Contextual vs Navigational */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-500" />
                <span>توزيع الروابط: سياقية تحريرية مقابل روابط القوائم والتذييل</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono">
                سياقية: {contextualLinksCount} | تنقلية: {navigationalLinksCount}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-teal-500 h-full transition-all duration-500"
                style={{ width: `${contextualPercentage}%` }}
                title={`روابط سياقية: ${contextualPercentage}%`}
              />
              <div
                className="bg-indigo-400 dark:bg-indigo-600 h-full transition-all duration-500"
                style={{ width: `${100 - contextualPercentage}%` }}
                title={`روابط تنقلية: ${100 - contextualPercentage}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
                <span>روابط سياقية داخل المحتوى ({contextualPercentage}%) - تنقل PageRank عالي</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 dark:bg-indigo-600 inline-block" />
                <span>روابط القوائم والتذييل ({100 - contextualPercentage}%)</span>
              </div>
            </div>
          </div>

          {/* Topic Clusters & Sections Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>الهيكل العنقودي للصفحات المستهدفة (Topic Clusters Distribution)</span>
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {clusters.length} مجموعات موضوعية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clusters.map((cluster, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {cluster.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                      {cluster.count} رابط ({cluster.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-1.5 rounded-full"
                      style={{ width: `${cluster.percentage}%` }}
                    />
                  </div>

                  {cluster.sampleLinks.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-400 block">عينة من مسارات هذا القسم:</span>
                      {cluster.sampleLinks.slice(0, 2).map((s, sIdx) => (
                        <div key={sIdx} className="text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate bg-slate-50 dark:bg-slate-950 p-1 rounded border border-slate-100 dark:border-slate-800/60" dir="ltr">
                          {s.path}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Top Anchor Texts Breakdown */}
          {topAnchors.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-500" />
                <span>أبرز النصوص الرابطة المستخدمة في الصفحة (Top Anchor Texts)</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {topAnchors.map((anc, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                      anc.isGeneric
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-semibold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{anc.text}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold">
                      {anc.count}
                    </span>
                    {anc.isGeneric && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                        (نص عام ضعيف)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIONABLE STRATEGIC SUGGESTIONS */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-teal-500/5 border border-teal-200 dark:border-teal-800/60 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white">
                استراتيجية تعزيز ترابط صفحات الموقع الهامة (Strategic Internal Linking Plan)
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                الروابط الداخلية ليست مجرد مسارات للتنقل، بل هي الأداة الأقوى لتوزيع سلطة السيو (Internal PageRank) وإخبار محرك بحث جوجل بالصفحات الأكثر أهمية التي ترغب في تصدرها للنتائج الأولى.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {suggestions.map((sug, idx) => (
              <div
                key={sug.id || idx}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 transition-colors hover:border-teal-300 dark:hover:border-teal-800"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      sug.priority === 'high'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : sug.priority === 'medium'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      أولوية {sug.priority === 'high' ? 'عالية' : sug.priority === 'medium' ? 'متوسطة' : 'موصى بها'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {sug.titleAr}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {sug.descriptionAr}
                </p>

                <div className="p-3 bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-teal-800 dark:text-teal-300 block">
                    الخطوة العملية للتطبيق:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {sug.recommendationAr}
                  </p>
                </div>

                {sug.exampleAr && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2">
                    <span className="truncate">{sug.exampleAr}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(sug.exampleAr || '')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                      title="نسخ المثال"
                    >
                      {copiedLink === sug.exampleAr ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE LINKS EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                  filterType === 'all'
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                الكل ({sampleLinks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('contextual')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                  filterType === 'contextual'
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                سياقية فقط ({contextualLinksCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('generic')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                  filterType === 'generic'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                نصوص ضعيفة ({genericAnchorCount})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث بالنص أو المسار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Links Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">النص الرابط (Anchor Text)</th>
                    <th className="py-2.5 px-3 font-bold">مسار الصفحة المستهدفة</th>
                    <th className="py-2.5 px-3 font-bold">التصنيف العنقودي</th>
                    <th className="py-2.5 px-3 font-bold">نوع الرابط</th>
                    <th className="py-2.5 px-3 font-bold text-center">نسخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredLinks.length > 0 ? (
                    filteredLinks.map((link, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-semibold ${link.isGenericAnchor ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
                              {link.anchorText}
                            </span>
                            {link.isGenericAnchor && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                                عام
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300 truncate max-w-[240px]" dir="ltr">
                          {link.path}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {link.targetCategory}
                        </td>
                        <td className="py-2.5 px-3">
                          {link.isContextual ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              سياقي تحريري
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              قائمة / تذييل
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleCopy(link.url)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="نسخ الرابط"
                          >
                            {copiedLink === link.url ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        لا توجد روابط تطابق شروط التصفية المحددة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
