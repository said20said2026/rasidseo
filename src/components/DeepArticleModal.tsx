import React from 'react';
import { X, BookOpen, Clock, CheckCircle2, ArrowLeft, Home, ChevronLeft, Sparkles } from 'lucide-react';
import { DeepArticleData, DEEP_ARTICLES, DEEP_PAGE_ACTION_PATHS, dispatchDeepNavigation } from '../data/deepPages';

interface DeepArticleModalProps {
  article: DeepArticleData | null;
  onClose: () => void;
  onStartAuditClick: () => void;
}

export const DeepArticleModal: React.FC<DeepArticleModalProps> = ({
  article,
  onClose,
  onStartAuditClick
}) => {
  if (!article) return null;

  const getLinkTitle = (path: string): string => {
    const foundArticle = DEEP_ARTICLES.find((a) => a.path === path);
    if (foundArticle) return foundArticle.titleAr;
    const foundAction = DEEP_PAGE_ACTION_PATHS[path];
    if (foundAction) return foundAction.labelAr;
    return path;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deep-article-title"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Breadcrumb Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <nav aria-label="مسار التنقل" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                dispatchDeepNavigation('/');
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-semibold"
            >
              <Home className="w-3.5 h-3.5" />
              <span>الرئيسية</span>
            </a>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{article.categoryLabelAr}</span>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[11px] text-slate-400 dir-ltr">{article.path}</span>
          </nav>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            aria-label="إغلاق المقال"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{article.categoryLabelAr}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3 h-3" />
                {article.readTimeAr}
              </span>
            </div>

            <h2 id="deep-article-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              {article.titleAr}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {article.summaryAr}
            </p>
          </header>

          <div className="space-y-4 text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-loose">
            {article.paragraphsAr.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Actionable Checklist */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>خلاصة التطبيق العملي:</span>
            </h3>
            <ul className="space-y-2">
              {article.keyTakeawaysAr.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Internal Links (Topic Cluster Cross-Linking) */}
          <div className="pt-5 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              مقالات وأدوات مرتبطة في نفس المحور (روابط داخلية)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {article.relatedPaths.map((relPath) => (
                <a
                  key={relPath}
                  href={relPath}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatchDeepNavigation(relPath);
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-all text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 group"
                >
                  <span className="line-clamp-2">{getLinkTitle(relPath)}</span>
                  <ArrowLeft className="w-3.5 h-3.5 text-indigo-500 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            العودة إلى الموقع
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartAuditClick();
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            اختبر موقعك على هذه المعايير الآن
          </button>
        </div>
      </div>
    </div>
  );
};
