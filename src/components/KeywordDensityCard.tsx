import React, { useState } from 'react';
import {
  FileText,
  KeyRound,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  HelpCircle,
  Hash,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart2
} from 'lucide-react';
import { KeywordDensityAnalysis, KeywordItem } from '../types/seo';

interface KeywordDensityCardProps {
  analysis?: KeywordDensityAnalysis;
  wordCount: number;
}

export const KeywordDensityCard: React.FC<KeywordDensityCardProps> = ({
  analysis,
  wordCount
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'phrases' | 'recommendations'>('single');
  const [statusFilter, setStatusFilter] = useState<'all' | 'high' | 'optimal' | 'low'>('all');
  const [showExplanation, setShowExplanation] = useState(false);

  // If no analysis is available yet, provide a fallback view
  if (!analysis || analysis.topSingleKeywords.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">تحليل كثافة الكلمات المفتاحية (Keyword Density)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">قسم المحتوى والوسائط</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          لم يتم استخراج كلمات كافية للتحليل (إجمالي الكلمات المكتشفة: {wordCount}). يرجى التأكد من أن الصفحة تحتوي على محتوى نصي كافٍ.
        </p>
      </div>
    );
  }

  const {
    totalAnalyzedWords,
    uniqueWordsCount,
    topSingleKeywords,
    topPhrases,
    recommendations
  } = analysis;

  // Filter single keywords
  const filteredSingle = topSingleKeywords.filter(k => {
    if (statusFilter === 'all') return true;
    return k.status === statusFilter;
  });

  const highCount = topSingleKeywords.filter(k => k.status === 'high').length;
  const optimalCount = topSingleKeywords.filter(k => k.status === 'optimal').length;
  const lowCount = topSingleKeywords.filter(k => k.status === 'low').length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xs">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                محلل كثافة وتوزيع الكلمات المفتاحية
              </h3>
              <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                المحتوى والوسائط
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              فحص تكرار الكلمات والعبارات، كشف الحشو السلبي (Stuffing)، ومطابقة العناوين
            </p>
          </div>
        </div>

        {/* Explain Toggle */}
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium cursor-pointer self-start sm:self-auto"
        >
          <HelpCircle className="w-4 h-4" />
          <span>ما هي الكثافة المثالية؟</span>
          {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Guide Note collapsible */}
      {showExplanation && (
        <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 animate-fadeIn">
          <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>المعيار القياسي لكثافة الكلمات المفتاحية في جوجل:</span>
          </div>
          <p>
            • <strong>النطاق الذهبي (1% - 2.5%):</strong> يدل على تركيز موضوعي سليم دون إزعاج للقارئ.
          </p>
          <p>
            • <strong>أقل من 1%:</strong> الكلمة نادرة جداً وقد تصعب على عناكب البحث استيعاب نية البحث الرئيسية.
          </p>
          <p>
            • <strong>أكثر من 3.5% (حشو سلبي Keyword Stuffing):</strong> يعرض الصفحة لعقوبة انخفاض الترتيب بموجب خوارزميات جودة المحتوى من جوجل (Google Helpful Content System).
          </p>
        </div>
      )}

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">المفردات المفحوصة</span>
          <span className="font-mono text-lg font-black text-slate-900 dark:text-white">{totalAnalyzedWords}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">بدون حروف الربط</span>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">الكلمات الفريدة</span>
          <span className="font-mono text-lg font-black text-slate-900 dark:text-white">{uniqueWordsCount}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">تنوع {Math.round((uniqueWordsCount / Math.max(1, totalAnalyzedWords)) * 100)}%</span>
        </div>

        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block mb-1">كثافة مثالية (1-2.5%)</span>
          <span className="font-mono text-lg font-black text-emerald-800 dark:text-emerald-200">{optimalCount}</span>
          <span className="text-[10px] text-emerald-600/80 block mt-0.5">كلمات متوازنة</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${
          highCount > 0
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
        }`}>
          <span className="text-[11px] block mb-1">تنبيه حشو مفرط (&gt;3.5%)</span>
          <span className="font-mono text-lg font-black">{highCount}</span>
          <span className="text-[10px] block mt-0.5">{highCount > 0 ? 'يتطلب تخفيفاً' : 'سليم وخالٍ'}</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'single'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>الكلمات الفردية ({topSingleKeywords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('phrases')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'phrases'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>العبارات الثنائية ({topPhrases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'recommendations'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>التوصيات والتحسين ({recommendations.length})</span>
          </button>
        </div>

        {/* Status filter (for single words tab) */}
        {activeTab === 'single' && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 ml-1">تصفية:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('high')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'high'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  : 'text-rose-600/70 hover:text-rose-700'
              }`}
            >
              حشو زائد ({highCount})
            </button>
            <button
              onClick={() => setStatusFilter('optimal')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'optimal'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'text-emerald-600/70 hover:text-emerald-700'
              }`}
            >
              مثالي ({optimalCount})
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Single Keywords Table */}
      {activeTab === 'single' && (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-bold">الكلمة المفتاحية</th>
                <th className="py-2.5 px-3 font-bold text-center">التكرار</th>
                <th className="py-2.5 px-3 font-bold text-center">الكثافة (%)</th>
                <th className="py-2.5 px-3 font-bold text-center">التقييم</th>
                <th className="py-2.5 px-3 font-bold text-center">العنوان (Title)</th>
                <th className="py-2.5 px-3 font-bold text-center">ترويسة H1</th>
                <th className="py-2.5 px-3 font-bold text-center">الوصف (Meta)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredSingle.map((kw, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      {kw.keyword}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-700 dark:text-slate-300">
                    {kw.count}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            kw.status === 'high'
                              ? 'bg-rose-500'
                              : kw.status === 'optimal'
                              ? 'bg-emerald-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, (kw.density / 4) * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white w-9 text-left" dir="ltr">
                        {kw.density}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        kw.status === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          : kw.status === 'optimal'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                      }`}
                    >
                      {kw.status === 'high' ? 'حشو زائد' : kw.status === 'optimal' ? 'مثالي' : 'منخفض'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {kw.inTitle ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {kw.inH1 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {kw.inMetaDesc ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: 2-Word Phrases Table */}
      {activeTab === 'phrases' && (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-bold">العبارة الثنائية (Phrase)</th>
                <th className="py-2.5 px-3 font-bold text-center">مرات الورود</th>
                <th className="py-2.5 px-3 font-bold text-center">الكثافة الدلالية</th>
                <th className="py-2.5 px-3 font-bold text-center">الحالة</th>
                <th className="py-2.5 px-3 font-bold text-center">في العنوان</th>
                <th className="py-2.5 px-3 font-bold text-center">في H1</th>
                <th className="py-2.5 px-3 font-bold text-center">في الوصف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {topPhrases.map((phrase, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                      "{phrase.keyword}"
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-700 dark:text-slate-300">
                    {phrase.count}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono font-bold text-slate-900 dark:text-white" dir="ltr">
                      {phrase.density}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        phrase.status === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          : phrase.status === 'optimal'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {phrase.status === 'high' ? 'تكرار زائد' : phrase.status === 'optimal' ? 'متوازنة' : 'خفيفة'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {phrase.inTitle ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {phrase.inH1 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {phrase.inMetaDesc ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Recommendations Panel */}
      {activeTab === 'recommendations' && (
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 transition-colors ${
                rec.type === 'warning'
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                  : rec.type === 'success'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60'
              }`}
            >
              <div className="flex items-center gap-2">
                {rec.type === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                {rec.type === 'success' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {rec.type === 'info' && (
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
                <h4
                  className={`font-bold ${
                    rec.type === 'warning'
                      ? 'text-rose-900 dark:text-rose-200'
                      : rec.type === 'success'
                      ? 'text-emerald-900 dark:text-emerald-200'
                      : 'text-indigo-900 dark:text-indigo-200'
                  }`}
                >
                  {rec.titleAr}
                </h4>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mr-6">
                {rec.descriptionAr}
              </p>
              {rec.actionAr && (
                <div className="mr-6 mt-1.5 p-2 bg-white/70 dark:bg-slate-900/70 rounded-lg border border-slate-200/60 dark:border-slate-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>خطوة الإصلاح الموصى بها: {rec.actionAr}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footnote advice */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            يتم فحص الكثافة آلياً واستبعاد أحرف الجر والروابط التلقائية لعرض الكلمات الدلالية الحقيقية فقط.
          </span>
        </div>
        <span className="font-mono text-slate-400 shrink-0 hidden sm:inline">
          Content & Media Engine
        </span>
      </div>
    </div>
  );
};
