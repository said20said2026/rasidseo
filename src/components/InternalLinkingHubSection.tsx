import React from 'react';
import {
  Network,
  BookOpen,
  Layers,
  Wrench,
  Building2,
  ArrowLeft,
  Compass
} from 'lucide-react';
import { DEEP_ARTICLES, dispatchDeepNavigation } from '../data/deepPages';

export const InternalLinkingHubSection: React.FC = () => {
  const articleLinks = DEEP_ARTICLES.filter((item) => item.category === 'articles');
  const topicLinks = DEEP_ARTICLES.filter((item) => item.category === 'topics');

  const toolLinks = [
    {
      path: '/features/seo-code-generator',
      title: 'أداة مولد أكواد الميتا والـ Schema والـ Robots.txt',
      desc: 'إنشاء وسوم التحسين الجاهزة للنسخ المباشر.'
    },
    {
      path: '/features/broken-links-checker',
      title: 'أداة فحص الروابط المعطلة 404 والروابط الخارجية',
      desc: 'كشف المسارات المكسورة لحماية ميزانية الزحف.'
    },
    {
      path: '/features/mobile-serp-simulator',
      title: 'محاكي نتائج بحث جوجل ومتصفحات الهواتف الذكية',
      desc: 'اختبار العرض على أجهزة iPhone و Samsung و Pixel.'
    }
  ];

  const institutionalLinks = [
    { path: '/articles/how-rasidseo-works', title: 'كيف يعمل محرك فحص راصد سيو (RasidSEO)' },
    { path: '/faq', title: 'الأسئلة الشائعة حول تدقيق وأخطاء المواقع' },
    { path: '/about', title: 'من نحن ورؤية منصة راصد سيو' },
    { path: '/help', title: 'مركز المساعدة وإرشادات استخدام الفاحص' },
    { path: '/privacy', title: 'سياسة الخصوصية وحماية البيانات' },
    { path: '/terms', title: 'شروط الخدمة وإخلاء المسؤولية' },
    { path: '/contact', title: 'تواصل مع فريق الدعم الفني' }
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    dispatchDeepNavigation(path);
  };

  return (
    <section
      id="internal-linking-hub"
      aria-labelledby="internal-linking-hub-heading"
      className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3">
            <Network className="w-3.5 h-3.5" />
            <span>خريطة الموضوعات والصفحات العميقة (Topic Silos)</span>
          </div>
          <h2
            id="internal-linking-hub-heading"
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            استكشف مقالات السيو المتخصصة والصفحات العميقة في راصد سيو
          </h2>
          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            استكشف أفضل خدمات rasidseo.site عبر شبكة روابط منظمة تمنحك دليل شامل ومراجعات مفصلة باللغة العربية، مع تطبيق عملي لأهم نصائح تحسين محركات البحث وتجربة المستخدم.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Silo 1: Deep Articles */}
          <article className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">المقالات والأدلة العميقة</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              تصفح <a href="/articles/technical-seo-checklist-2026" onClick={(e) => handleLinkClick(e, '/articles/technical-seo-checklist-2026')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline">دليل شامل ومراجعات مفصلة باللغة العربية لفحص السيو 2026</a> وأسرار تصدر البحث.
            </p>
            <ul className="space-y-2.5 mt-auto">
              {articleLinks.map((art) => (
                <li key={art.path}>
                  <a
                    href={art.path}
                    onClick={(e) => handleLinkClick(e, art.path)}
                    className="group flex items-start justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span>{art.titleAr}</span>
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400 group-hover:text-indigo-500 group-hover:-translate-x-0.5 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </article>

          {/* Silo 2: Topic Silos */}
          <article className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">التصنيفات والمحاور التقنية</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              تخصصات مترابطة تشمل <a href="/topics/on-page-seo" onClick={(e) => handleLinkClick(e, '/topics/on-page-seo')} className="text-emerald-600 dark:text-emerald-400 font-semibold underline">هيكلة السيو الداخلي H1-H6</a> والأمان والبيانات المنظمة.
            </p>
            <ul className="space-y-2.5 mt-auto">
              {topicLinks.map((topic) => (
                <li key={topic.path}>
                  <a
                    href={topic.path}
                    onClick={(e) => handleLinkClick(e, topic.path)}
                    className="group flex items-start justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span>{topic.titleAr}</span>
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400 group-hover:text-emerald-500 group-hover:-translate-x-0.5 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </article>

          {/* Silo 3: Features & Interactive Tools */}
          <article className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">الأدوات والحلول المتقدمة</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              استخدم <a href="/features/seo-code-generator" onClick={(e) => handleLinkClick(e, '/features/seo-code-generator')} className="text-amber-600 dark:text-amber-400 font-semibold underline">أفضل خدمات rasidseo.site في توليد أكواد الميتا</a> وأدوات الفحص والتوافق المباشر.
            </p>
            <ul className="space-y-3 mt-auto">
              {toolLinks.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => handleLinkClick(e, tool.path)}
                    className="group block text-xs"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between gap-1">
                      <span>{tool.title}</span>
                      <ArrowLeft className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-amber-500" />
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">{tool.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
          </article>

          {/* Silo 4: Institutional & Support Pages */}
          <article className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">الصفحات التعريفية والدعم</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              تعرف على <a href="/about" onClick={(e) => handleLinkClick(e, '/about')} className="text-sky-600 dark:text-sky-400 font-semibold underline">منصة راصد سيو</a> وسياسات الاستخدام ومركز المساعدة.
            </p>
            <ul className="space-y-2 mt-auto">
              {institutionalLinks.map((page) => (
                <li key={page.path}>
                  <a
                    href={page.path}
                    onClick={(e) => handleLinkClick(e, page.path)}
                    className="group flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-3 h-3 text-slate-400 group-hover:text-sky-500" />
                      <span>{page.title}</span>
                    </span>
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-sky-500" />
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
};
