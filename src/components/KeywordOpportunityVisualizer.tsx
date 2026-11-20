import React, { useState, useMemo } from 'react';
import {
  Cloud,
  PieChart,
  Table,
  Target,
  Sparkles,
  Search,
  Filter,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowUpRight,
  Download,
  Flame,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { AuditResult } from '../types/seo';
import {
  calculateKeywordOpportunities,
  KeywordOpportunityCloudItem,
  KeywordOpportunityAnalysis
} from '../utils/keywordOpportunityCalculator';

interface KeywordOpportunityVisualizerProps {
  auditData: AuditResult;
}

export const KeywordOpportunityVisualizer: React.FC<KeywordOpportunityVisualizerProps> = ({ auditData }) => {
  const [viewMode, setViewMode] = useState<'cloud' | 'circular' | 'table'>('cloud');
  const [filterGap, setFilterGap] = useState<'all' | 'missing' | 'weak' | 'covered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordOpportunityCloudItem | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Calculate analysis
  const analysis: KeywordOpportunityAnalysis = useMemo(() => {
    return calculateKeywordOpportunities(auditData);
  }, [auditData]);

  // Set default selected keyword to highest value missing keyword
  useMemo(() => {
    if (!selectedKeyword && analysis.highestValueKeyword) {
      setSelectedKeyword(analysis.highestValueKeyword);
    }
  }, [analysis.highestValueKeyword]);

  // Filter items
  const filteredItems = useMemo(() => {
    return analysis.items.filter((item) => {
      if (filterGap !== 'all' && item.gapStatus !== filterGap) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return item.keyword.toLowerCase().includes(q) || item.suggestedPlacementAr.toLowerCase().includes(q);
      }
      return true;
    });
  }, [analysis.items, filterGap, searchQuery]);

  const handleCopyWord = (kw: string) => {
    navigator.clipboard.writeText(kw).then(() => {
      setCopiedWord(kw);
      setTimeout(() => setCopiedWord(null), 2000);
    });
  };

  const handleExportKeywords = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(
        [
          ['الكلمة المفتاحية', 'حالة التغطية', 'درجة الفرصة', 'حجم البحث التقديري', 'الكثافة الحالية', 'المكان المقترح للتضمين', 'نصيحة السيو'].join(','),
          ...analysis.items.map((i) =>
            [
              `"${i.keyword}"`,
              `"${i.gapStatusLabelAr}"`,
              i.opportunityScore,
              `"${i.estimatedSearchVolume}"`,
              `"${i.currentDensity}%"`,
              `"${i.suggestedPlacementAr}"`,
              `"${i.actionableTipAr.replace(/"/g, '""')}"`
            ].join(',')
          )
        ].join('\n')
      );

    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `keyword_opportunities_${auditData.url.replace(/[^a-z0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyAllMissing = () => {
    const missingWords = analysis.items
      .filter((i) => i.gapStatus === 'missing')
      .map((i, idx) => `${idx + 1}. ${i.keyword} (حجم البحث: ${i.estimatedSearchVolume} - مكان الوضع: ${i.suggestedPlacementAr})`)
      .join('\n');

    navigator.clipboard.writeText(missingWords).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    });
  };

  // Circular / Donut SVG calculation
  const total = analysis.totalCount || 1;
  const missingDeg = (analysis.missingCount / total) * 360;
  const weakDeg = (analysis.weakCount / total) * 360;
  const coveredDeg = (analysis.coveredCount / total) * 360;

  // SVG parameters
  const radius = 70;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  const missingStroke = (analysis.missingCount / total) * circumference;
  const weakStroke = (analysis.weakCount / total) * circumference;
  const coveredStroke = (analysis.coveredCount / total) * circumference;

  const missingOffset = 0;
  const weakOffset = -missingStroke;
  const coveredOffset = -(missingStroke + weakStroke);

  return (
    <div
      id="keyword-opportunity-visualizer-section"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors"
    >
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-rose-500/30 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 shadow-lg shadow-amber-900/40">
              <Cloud className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>سحابة فرص الكلمات المفتاحية (Keyword Opportunity Visualizer)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>{analysis.missingCount} كلمات عالية القيمة تفتقر لها الصفحة</span>
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl leading-relaxed">
                تحليل مرئي شامل يكشف الكلمات المفتاحية الحالية للموقع ويعرضها في <strong>سحابة كلمات تفاعلية ومخطط دائري</strong>،
                مع إبراز الفرص ذات القيمة والطلب الأعلى في محركات البحث التي يجب تضمينها فوراً لرفع الزيارات وتصدر نتائج 2026.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyAllMissing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all border border-white/10 cursor-pointer"
              title="نسخ قائمة الكلمات المفتاحية المفقودة ذات القيمة العالية"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>تم نسخ الكلمات المفقودة!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكلمات المفقودة</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportKeywords}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white transition-all shadow-md shadow-indigo-900/50 cursor-pointer"
              title="تصدير مصفوفة الكلمات والفرص كملف CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير ملف الكلمات (CSV)</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher & Stats Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setViewMode('cloud')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cloud'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>سحابة الكلمات (Word Cloud)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('circular')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'circular'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>المخطط الدائري التفاعلي (Donut Chart)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>جدول المقارنة التفصيلي</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>الزيارات المحتملة: {analysis.untappedPotentialTrafficAr}</span>
            </div>
            <div className="text-slate-300 text-xs">
              إجمالي الكلمات المحللة: <strong className="text-white font-mono">{analysis.totalCount}</strong> كلمة
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">تصفية الفرص:</span>
          <button
            type="button"
            onClick={() => setFilterGap('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterGap === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
            }`}
          >
            كافة الكلمات ({analysis.totalCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterGap('missing')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              filterGap === 'missing'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>فرص مفقودة تفتقر لها الصفحة ({analysis.missingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterGap('weak')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              filterGap === 'weak'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>تغطية ضعيفة تحتاج تعزيز ({analysis.weakCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterGap('covered')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              filterGap === 'covered'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>مغطاة في الصفحة ({analysis.coveredCount})</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الكلمات أو مواضع التضمين..."
            className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="p-5 sm:p-6">
        {/* VIEW 1: WORD CLOUD */}
        {viewMode === 'cloud' && (
          <div className="space-y-6">
            {/* Visual Word Cloud Container */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 shadow-inner min-h-[380px] flex flex-wrap items-center justify-center gap-3 sm:gap-4.5 select-none relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

              {filteredItems.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-12">
                  لا توجد كلمات مفتاحية تطابق خيارات التصفية المحددة.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedKeyword?.id === item.id;
                  const isMissing = item.gapStatus === 'missing';
                  const isWeak = item.gapStatus === 'weak';

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedKeyword(item)}
                      style={{ fontSize: `${item.fontSizeRem}rem` }}
                      className={`group relative rounded-xl px-3.5 py-1.5 font-black transition-all cursor-pointer duration-200 flex items-center gap-1.5 ${
                        isSelected
                          ? 'ring-4 ring-amber-400 shadow-2xl scale-110 z-20'
                          : 'hover:scale-105 active:scale-95'
                      } ${
                        isMissing
                          ? 'bg-gradient-to-r from-rose-950/80 via-red-900/80 to-rose-900/80 text-rose-100 border-2 border-rose-500/80 hover:border-rose-400 shadow-lg shadow-rose-950/50 hover:shadow-rose-500/25'
                          : isWeak
                          ? 'bg-gradient-to-r from-amber-950/80 via-orange-950/80 to-amber-900/80 text-amber-100 border border-amber-500/70 hover:border-amber-400 shadow-md shadow-amber-950/40'
                          : 'bg-slate-900/80 text-slate-300 border border-slate-700/80 hover:border-emerald-500 hover:text-white'
                      }`}
                      title={`انقر لمعاينة بيانات الفرصة: ${item.keyword} (${item.estimatedSearchVolume})`}
                    >
                      {/* Status indicator dot */}
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isMissing
                            ? 'bg-rose-400 animate-pulse'
                            : isWeak
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />

                      <span>{item.keyword}</span>

                      {/* Small badge inside button for missing high-value */}
                      {isMissing && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white shadow-2xs mr-1">
                          مفقودة
                        </span>
                      )}

                      {/* Search Volume Pill on hover or selection */}
                      <span className="text-[10px] font-mono font-normal opacity-80 group-hover:opacity-100 bg-black/40 px-1.5 py-0.2 rounded-md">
                        {item.estimatedSearchVolume.split(' ')[0]}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Selected Keyword Detailed Inspector Card */}
            {selectedKeyword && (
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-slate-850 border border-indigo-200 dark:border-indigo-900/80 shadow-md space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          selectedKeyword.gapStatus === 'missing'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                            : selectedKeyword.gapStatus === 'weak'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                        }`}
                      >
                        {selectedKeyword.gapStatusLabelAr}
                      </span>

                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                        {selectedKeyword.intentLabelAr}
                      </span>

                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold font-mono">
                        درجة الفرصة: {selectedKeyword.opportunityScore}/100
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white pt-1">
                      {selectedKeyword.keyword}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyWord(selectedKeyword.keyword)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      {copiedWord === selectedKeyword.keyword ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الكلمة</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">حجم البحث الشهري:</span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                      {selectedKeyword.estimatedSearchVolume}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">الكثافة الحالية في الصفحة:</span>
                    <span
                      className={`text-base font-black font-mono mt-0.5 block ${
                        selectedKeyword.currentDensity === 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {selectedKeyword.currentDensity}% {selectedKeyword.currentDensity === 0 ? '(غير موجودة)' : '(موجودة)'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">الموضع المقترح للتضمين:</span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-1 block">
                      📍 {selectedKeyword.suggestedPlacementAr}
                    </span>
                  </div>
                </div>

                {/* Actionable SEO Advice */}
                <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>توجيه السيو الموصى به لتصدر هذه الكلمة في 2026:</span>
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedKeyword.actionableTipAr}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: CIRCULAR / DONUT OPPORTUNITY CHART */}
        {viewMode === 'circular' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Circular SVG Donut Chart */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                    {/* Background Track */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth={strokeWidth}
                    />

                    {/* Missing Segment (Rose / Red) */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#f43f5e"
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${missingStroke} ${circumference}`}
                      strokeDashoffset={missingOffset}
                      className="transition-all duration-700 cursor-pointer hover:opacity-85"
                      onClick={() => setFilterGap('missing')}
                    />

                    {/* Weak Segment (Amber) */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${weakStroke} ${circumference}`}
                      strokeDashoffset={weakOffset}
                      className="transition-all duration-700 cursor-pointer hover:opacity-85"
                      onClick={() => setFilterGap('weak')}
                    />

                    {/* Covered Segment (Emerald) */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${coveredStroke} ${circumference}`}
                      strokeDashoffset={coveredOffset}
                      className="transition-all duration-700 cursor-pointer hover:opacity-85"
                      onClick={() => setFilterGap('covered')}
                    />
                  </svg>

                  {/* Center Content */}
                  <div className="absolute flex flex-col items-center justify-center text-center p-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الفرص المفقودة</span>
                    <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                      {analysis.missingVolumePercentage}%
                    </span>
                    <span className="text-[10px] text-slate-400">من إجمالي البحث</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
                  انقر على أي شريحة من المخطط الدائري لتصفية الكلمات ذات الصلة فورياً.
                </p>
              </div>

              {/* Breakdown Cards & Opportunity Details */}
              <div className="lg:col-span-7 space-y-3">
                {/* Missing Segment Card */}
                <div
                  onClick={() => setFilterGap('missing')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    filterGap === 'missing'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 ring-2 ring-rose-400/40'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        فرص مفقودة تماماً (Missing High-Value Gaps)
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-mono">
                      {analysis.missingCount} كلمات ({analysis.missingVolumePercentage}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    كلمات تمتلك طلباً بحثياً مكثفاً ونوايا شراء/استفسار عالية لكنها لا تظهر إطلاقاً في محتوى الصفحة الحالي.
                  </p>
                </div>

                {/* Weak Coverage Card */}
                <div
                  onClick={() => setFilterGap('weak')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    filterGap === 'weak'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 ring-2 ring-amber-400/40'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        تغطية ضعيفة تحتاج تعزيز (Under-Optimized)
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-mono">
                      {analysis.weakCount} كلمات ({analysis.weakVolumePercentage}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    كلمات وردت بشكل عابر دون تضمينها في العناوين الرئيسية H2 أو بدون توفير إجابات متعمقة حولها.
                  </p>
                </div>

                {/* Covered Card */}
                <div
                  onClick={() => setFilterGap('covered')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    filterGap === 'covered'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-400/40'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        كلمات مغطاة بنجاح (Optimally Covered)
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-mono">
                      {analysis.coveredCount} كلمات ({analysis.coveredVolumePercentage}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    كلمات مدمجة بشكل سليم ومتوازن ضمن فقرات المحتوى وتساعد الصفحة على الاستقرار في نتائج البحث.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Word Preview under Donut */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                الكلمات التي تندرج تحت التصنيف المحدد ({filteredItems.length}):
              </h5>
              <div className="flex items-center gap-2 flex-wrap">
                {filteredItems.map((item) => (
                  <span
                    key={item.id}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                      item.gapStatus === 'missing'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                        : item.gapStatus === 'weak'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                    }`}
                  >
                    <span>{item.keyword}</span>
                    <span className="text-[10px] font-mono opacity-80">({item.estimatedSearchVolume})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: DETAILED TABLE */}
        {viewMode === 'table' && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">الكلمة المفتاحية</th>
                    <th className="p-3">حالة التغطية</th>
                    <th className="p-3">الكثافة الحالية</th>
                    <th className="p-3">حجم البحث الشهري</th>
                    <th className="p-3">درجة الفرصة</th>
                    <th className="p-3">الموضع المقترح للتضمين</th>
                    <th className="p-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              item.gapStatus === 'missing'
                                ? 'bg-rose-500'
                                : item.gapStatus === 'weak'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{item.keyword}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.gapStatus === 'missing'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : item.gapStatus === 'weak'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {item.gapStatusLabelAr}
                        </span>
                      </td>

                      <td className="p-3 font-mono">
                        {item.currentDensity}%
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.estimatedSearchVolume}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${item.opportunityScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {item.opportunityScore}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-300 text-[11px]">
                        📍 {item.suggestedPlacementAr}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleCopyWord(item.keyword)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors text-[10px] font-bold cursor-pointer"
                        >
                          {copiedWord === item.keyword ? 'تم!' : 'نسخ'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
