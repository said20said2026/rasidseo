import React from 'react';
import { Sparkles, ArrowRight, Lightbulb, Target, FileText } from 'lucide-react';
import { AiSeoAdvice } from '../types/seo';
import { useLanguage } from '../context/LanguageContext';

interface AiConsultantCardProps {
  advice?: AiSeoAdvice;
}

export const AiConsultantCard: React.FC<AiConsultantCardProps> = ({ advice }) => {
  const { isRtl } = useLanguage();
  if (!advice) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-indigo-900/50 shadow-lg relative overflow-hidden">
      {/* Decorative subtle ambient circle */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {isRtl ? 'استشارة الذكاء الاصطناعي الذكية (AI SEO Consultant)' : 'AI SEO Strategic Consultant'}
            </h3>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              {isRtl ? 'تشخيص استراتيجي مدعوم بنماذج Gemini لرفع ترتيب الموقع وتصدر الصفحة الأولى' : 'Strategic diagnostics powered by Gemini models for higher search ranking'}
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block">
          Gemini 3.8 Flash
        </span>
      </div>

      {/* Executive Summary */}
      <div className="mt-5 relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>{isRtl ? 'التشخيص الاستشاري الشامل:' : 'Executive Diagnostic Summary:'}</span>
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {advice.summary}
          </p>
        </div>
      </div>

      {/* 3 Core Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 relative z-10">
        {/* Priorities */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h4 className="text-xs font-bold text-rose-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-400" />
            <span>{isRtl ? 'أولويات الإصلاح العاجلة:' : 'Urgent Fix Priorities:'}</span>
          </h4>
          <ul className="space-y-2.5">
            {advice.topPriorities.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                <span className="font-mono text-rose-400 font-bold shrink-0">{idx + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Keyword Opportunities */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h4 className="text-xs font-bold text-emerald-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{isRtl ? 'فرص الكلمات المفتاحية المقترحة:' : 'Keyword Opportunities:'}</span>
          </h4>
          <ul className="space-y-2.5">
            {advice.keywordOpportunities.map((kw, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                <span className="text-emerald-400 font-bold shrink-0">✦</span>
                <span className="font-medium bg-white/5 px-2 py-0.5 rounded">{kw}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Strategy */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h4 className="text-xs font-bold text-sky-300 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>{isRtl ? 'تطوير مقالات ومحتوى المدونة:' : 'Blog & Content Strategy:'}</span>
          </h4>
          <ul className="space-y-2.5">
            {advice.blogContentSuggestions.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                <span className="text-sky-400 font-bold shrink-0">▪</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
