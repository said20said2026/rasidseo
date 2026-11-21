import React, { useState } from 'react';
import {
  BookOpen,
  CalendarClock,
  TrendingUp,
  Search,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Award
} from 'lucide-react';
import { DEEP_ARTICLES, DeepArticleData, dispatchDeepNavigation } from '../data/deepPages';

export const BlogCornerstoneSection: React.FC = () => {
  const blogArticles = DEEP_ARTICLES.filter((item) => item.category === 'articles');
  const [filterMode, setFilterMode] = useState<'all' | 'cornerstone' | 'ctr2026'>('all');
  const [selectedPath, setSelectedPath] = useState<string>(blogArticles[0]?.path || '');

  const visibleArticles = blogArticles.filter((article) => {
    if (filterMode === 'cornerstone') return article.isCornerstone;
    if (filterMode === 'ctr2026') return article.updatedAtIso.startsWith('2026');
    return true;
  });

  const activeArticle: DeepArticleData =
    visibleArticles.find((a) => a.path === selectedPath) || visibleArticles[0] || blogArticles[0];

  const handleOpenModal = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    dispatchDeepNavigation(path);
  };

  const blogArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: activeArticle.titleAr,
    description: activeArticle.summaryAr,
    inLanguage: 'ar',
    datePublished: activeArticle.publishedAtIso,
    dateModified: activeArticle.updatedAtIso,
    mainEntityOfPage: `https://www.rasidseo.site${activeArticle.path}`,
    author: {
      '@type': 'Organization',
      name: 'RasidSEO - راصد سيو'
    }
  };

  return (
    <section
      id="blog-cornerstone-section"
      aria-labelledby="blog-cornerstone-heading"
      className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-16 transition-colors"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogArticleSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <header className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span>مكتبة المدونة والمحتوى الإرشادي المرجعي (Cornerstone Content)</span>
          </div>

          <h2
            id="blog-cornerstone-heading"
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            مقالات إرشادية محدثة بأرقام 2026 لرفع معدل النقر (CTR) وتصدر البحث
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            تدوينات مرجعية مفصلة تجيب عن استفسارات الباحثين الرئيسية بهيكل عناوين فرعية واضح (H2 و H3)، ومراجعات دورية بأرقام وإحصاءات السنة الحالية لتعزيز ثقة الزائر ومحركات البحث.
          </p>

          {/* Interactive Filter Controls */}
          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
              }`}
            >
              جميع تدوينات المدونة ({blogArticles.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('cornerstone')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'cornerstone'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>مقالات مرجعية شاملة (Cornerstone)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('ctr2026')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'ctr2026'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>تحديثات 2026 لرفع CTR</span>
            </button>
          </div>
        </header>

        {/* Two-column Reader Layout: Article Selector List + Structured H2/H3 Cornerstone Article */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Article Selector Cards */}
          <div className="lg:col-span-5 space-y-3">
            {visibleArticles.map((post) => {
              const isSelected = post.path === activeArticle.path;
              return (
                <div
                  key={post.path}
                  className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/40 shadow-md'
                      : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                  onClick={() => setSelectedPath(post.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPath(post.path);
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        post.isCornerstone
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      {post.isCornerstone ? 'دليل مرجعي شامل' : 'مقال تقني محدث'}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <CalendarClock className="w-3 h-3" />
                      {post.updatedLabelAr}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug mb-1.5">
                    {post.titleAr}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                    {post.summaryAr}
                  </p>

                  <div className="flex items-center justify-between gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTimeAr}
                    </span>

                    <a
                      href={post.path}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(e, post.path);
                      }}
                      className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>فتح في نافذة مستقلة</span>
                      <ArrowLeft className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Cornerstone Article Full Structured Reader (Clear H2 & H3 Hierarchy) */}
          <article className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <header className="space-y-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>{activeArticle.updatedLabelAr}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{activeArticle.ctrBoostStatAr}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                {activeArticle.titleAr}
              </h2>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <Search className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">استفسار الباحث المستهدف: </span>
                  <span>{activeArticle.searchQueryIntentAr}</span>
                </div>
              </div>
            </header>

            {/* Year 2026 Verified Data Points for CTR */}
            {activeArticle.yearHighlights2026.length > 0 && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <h3 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
                  أرقام ومؤشرات السنة الحالية 2026 المحدثة في هذا الدليل:
                </h3>
                <ul className="space-y-1.5">
                  {activeArticle.yearHighlights2026.map((stat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{stat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Structured H2 & H3 Sections for Search Engine Crawlers */}
            <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-loose text-sm">
              {activeArticle.sectionsAr.map((sec, idx) => (
                <section key={idx} className="space-y-3">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white border-r-4 border-indigo-600 pr-3">
                    {sec.headingH2}
                  </h2>
                  <p>{sec.body}</p>

                  {sec.subSections && sec.subSections.length > 0 && (
                    <div className="space-y-3 pt-1">
                      {sec.subSections.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-1.5"
                        >
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {sub.headingH3}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {sub.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Footer Link to Full Modal View */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {activeArticle.path}
              </span>
              <a
                href={activeArticle.path}
                onClick={(e) => handleOpenModal(e, activeArticle.path)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
              >
                <span>قراءة الدليل الكامل والروابط المرتبطة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
