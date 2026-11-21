import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Search,
  Zap,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileCode,
  ArrowRight,
  BookOpen,
  Award,
  Globe2,
  Clock,
  Share2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { dispatchDeepNavigation } from '../data/deepPages';

export const SeoMasteryContentSection: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'technical' | 'content' | 'crawling' | 'mobile'>('all');
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleDeepLink = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    dispatchDeepNavigation(path);
  };

  const handleScrollToAudit = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const input = document.getElementById('audit-input');
    if (input) {
      input.focus();
    }
  };

  // Structured Data Schema for Search Engines (Schema.org / Google Rich Snippets)
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "دليل تصدر نتائج محركات البحث جوجل الشامل: استراتيجيات تحسين السيو التقني والداخلي",
    "description": "دليل تفصيلي مكتوب بلغة عربية بشرية احترافية يشرح خطوات تصدر نتائج بحث جوجل الأولى، تحسين مؤشرات الويب الأساسية Core Web Vitals، هندسة المحتوى، وضبط الأرشفة التقنية.",
    "inLanguage": "ar",
    "author": {
      "@type": "Organization",
      "name": "راصد سيو - RasidSEO"
    },
    "publisher": {
      "@type": "Organization",
      "name": "راصد سيو - RasidSEO",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.rasidseo.site/logo.png"
      }
    },
    "datePublished": "2026-01-01",
    "dateModified": "2026-11-21",
    "articleSection": "SEO Guide & Technical Optimization"
  };

  return (
    <article
      id="guide-section"
      className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 lg:py-20 transition-colors relative overflow-hidden"
      aria-label="دليل السيو الاحترافي لتصدر نتائج البحث"
    >
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Structured Data for Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <header className="max-w-4xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>الدليل الشامل لتحسين محركات البحث 2026</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              محدّث نوفمبر 2026 لرفع CTR (6 دقائق)
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            كيف تتصدر نتائج بحث جوجل وتضمن المرتبة الأولى لموقعك أو مدونتك؟
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            إذا كنت تبحث عن كيفية تصدر نتائج البحث في جوجل خطوة بخطوة للمبتدئين والمحترفين، فإليك دليل شامل ومراجعات مفصلة باللغة العربية يجمع بين أفضل خدمات rasidseo.site في السيو التقني (Technical SEO)، وأهم نصائح تحسين محركات البحث وتجربة المستخدم المتوافقة مع معايير جوجل الحديثة.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">0.6s</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">زمن الاستجابة المثالي (TTFB)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">100%</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">توافق أجهزة الجوال</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="block text-xl font-black text-amber-600 dark:text-amber-400 font-mono">1 فقط</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">وسم H1 رئيسي لكل صفحة</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="block text-xl font-black text-sky-600 dark:text-sky-400 font-mono">Schema</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">بيانات منظمة JSON-LD</span>
            </div>
          </div>
        </header>

        {/* Filter / Pillar Selection Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            جميع ركائز التصدر
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('technical')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'technical'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            السيو التقني والسرعة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'content'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            هندسة المحتوى والعناوين
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crawling')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'crawling'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            الزحف والأرشفة والمخططات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mobile'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            فهرسة الجوال والأمان
          </button>
        </div>

        {/* Deep Content Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Pillar 1: Technical SEO & Core Web Vitals */}
          {(activeTab === 'all' || activeTab === 'technical') && (
            <section className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">الركيزة التقنية</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    1. مؤشرات الويب الأساسية وسرعة الخادم (Core Web Vitals)
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                تعتبر سرعة تحميل الموقع وتجربة الاستجابة من أهم العوامل الحاسمة التي تعتمد عليها خوارزميات جوجل لتحديد الترتيب الأول. راجع دليلنا حول{' '}
                <a href="/articles/core-web-vitals-speed" onClick={(e) => handleDeepLink(e, '/articles/core-web-vitals-speed')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline">
                  تحسين مؤشرات الويب الأساسية Core Web Vitals
                </a>{' '}
                لتفادي ارتفاع معدل الارتداد وفقدان ثقة روبوتات الفهرسة.
              </p>

              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">تحسين استجابة الخادم الأولى (TTFB):</strong> تأكد أن الخادم يستجيب خلال أقل من 600 ميلي ثانية. استخدم شبكات توزيع المحتوى (Cloudflare CDN) وفعّل التخزين المؤقت (Edge Caching).
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">أكبر رسم للمحتوى (LCP):</strong> اجعل المحتوى المرئي الأساسي يظهر في أقل من 2.5 ثانية عبر{' '}
                    <a href="/blog/image-seo-webp-avif" onClick={(e) => handleDeepLink(e, '/blog/image-seo-webp-avif')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline">
                      تحسين الصور بصيغ WebP و AVIF
                    </a>{' '}
                    وتأجيل تحميل السكربتات غير الضرورية.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">استقرار التصميم التراكمي (CLS):</strong> حدد أبعاداً صريحة (width & height) للصور والإعلانات لمنع قفزات العناصر المفاجئة أثناء التحميل.
                  </div>
                </div>
              </div>

              {/* Code Snippet for Preconnect / Compression */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-left dir-ltr">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-mono">HTML Resource Hints</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="dns-prefetch" href="https://cdn.example.com">', 'perf-code')}
                    className="flex items-center gap-1 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'perf-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet === 'perf-code' ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
                <code className="block font-mono text-[11px] text-emerald-400 select-all overflow-x-auto whitespace-pre">
                  {'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="dns-prefetch" href="https://cdn.example.com">'}
                </code>
              </div>
            </section>
          )}

          {/* Pillar 2: On-Page SEO & Content Intent */}
          {(activeTab === 'all' || activeTab === 'content') && (
            <section className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">بنية المحتوى</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    2. هندسة السيو الداخلي وهرمية العناوين (H1-H6)
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                المحتوى الاستثنائي لا يكفي بمفرده إذا لم تفهم خوارزميات محركات البحث بنيته المنطقية. تعرّف على قواعد{' '}
                <a href="/topics/on-page-seo" onClick={(e) => handleDeepLink(e, '/topics/on-page-seo')} className="text-emerald-600 dark:text-emerald-400 font-semibold underline">
                  هيكلة السيو الداخلي وضبط وسوم العناوين H1-H6
                </a>{' '}
                وتوزيع الكلمات المفتاحية بانسيابية وفق نية الباحث.
              </p>

              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">وسم عنوان H1 رئيسي واحد:</strong> اجعل العنوان دقيقاً وجذاباً بين 40 إلى 65 حرفاً يتضمن الكلمة المفتاحية المستهدفة في أوله، ولا تكرر أكثر من وسم H1 في نفس الصفحة.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">وسوم الوصف التعريفي (Meta Description):</strong> اكتب وصفاً يقنع القارئ بالنقر (بين 120 إلى 155 حرفاً) يجيب على تساؤل المستخدم ويحتوي على دعوة لاتخاذ إجراء (Call to Action).
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">النصوص البديلة للصور (&lt;img alt&gt;):</strong> يمثل البحث الصوري رافداً ضخماً لحركة المرور. احرص على تزويد كل صورة بنص بديل دقيق يشرح محتواها بوضوح لرفع معدل الأرشفة.
                  </div>
                </div>
              </div>

              {/* Practical Image Alt Example */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-left dir-ltr">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-mono">SEO-Optimized Image Markup</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('<img src="dashboard.webp" alt="لوحة فحص وتحليل السيو التقني للمواقع والمدونات" width="800" height="450" loading="lazy">', 'img-code')}
                    className="flex items-center gap-1 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'img-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet === 'img-code' ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
                <code className="block font-mono text-[11px] text-emerald-400 select-all overflow-x-auto">
                  {'<img src="dashboard.webp" alt="لوحة فحص وتحليل السيو التقني للمواقع والمدونات" width="800" height="450" loading="lazy">'}
                </code>
              </div>
            </section>
          )}

          {/* Pillar 3: Crawling, Indexing & Structured Data */}
          {(activeTab === 'all' || activeTab === 'crawling') && (
            <section className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">الفهرسة والزحف</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    3. إدارة ميزانية الزحف وخريطة الموقع والبيانات المنظمة
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                تخصص محركات البحث وقتاً وموارداً محددة للزحف في كل موقع (Crawl Budget). اتبع{' '}
                <a href="/articles/technical-seo-checklist-2026" onClick={(e) => handleDeepLink(e, '/articles/technical-seo-checklist-2026')} className="text-amber-600 dark:text-amber-400 font-semibold underline">
                  قائمة تدقيق السيو التقني لعام 2026
                </a>{' '}
                لضمان أرشفة صفحاتك الجديدة ومنع إهدار الزحف في الصفحات المكررة.
              </p>

              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">ملف Robots.txt منضبط:</strong> اسمح بالزحف لكافة روبوتات جوجل الشرعية عبر{' '}
                    <a href="/features/seo-code-generator" onClick={(e) => handleDeepLink(e, '/features/seo-code-generator')} className="text-amber-600 dark:text-amber-400 font-semibold underline">
                      مولد ملفات Robots.txt وأكواد الميتا
                    </a>{' '}
                    مع حظر لوحات التحكم غير المفيدة.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">إصلاح الروابط المعطلة (404 Broken Links):</strong> الروابط المعطلة تؤذي تجربة المستخدم وتستنزف الزحف. استخدم{' '}
                    <a href="/features/broken-links-checker" onClick={(e) => handleDeepLink(e, '/features/broken-links-checker')} className="text-amber-600 dark:text-amber-400 font-semibold underline">
                      أداة فحص الروابط المعطلة 404
                    </a>{' '}
                    لاستبدالها أو إعادة توجيهها 301.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">البيانات المنظمة Schema.org:</strong> طالع دليل{' '}
                    <a href="/topics/schema-structured-data" onClick={(e) => handleDeepLink(e, '/topics/schema-structured-data')} className="text-amber-600 dark:text-amber-400 font-semibold underline">
                      تطبيق البيانات المنظمة JSON-LD للمقتطفات المميزة
                    </a>{' '}
                    (Article أو FAQPage أو Product).
                  </div>
                </div>
              </div>

              {/* JSON-LD Schema Example */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-left dir-ltr">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-mono">Schema.org JSON-LD FAQ</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "كيف أحسن سيو موقعي؟",\n    "acceptedAnswer": { "@type": "Answer", "text": "باتباع إرشادات السيو التقني وسرعة الصفحة." }\n  }]\n}', 'schema-code')}
                    className="flex items-center gap-1 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'schema-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet === 'schema-code' ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
                <code className="block font-mono text-[11px] text-amber-400 select-all overflow-x-auto whitespace-pre">
                  {`{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "كيف أحسن سيو موقعي؟",\n    "acceptedAnswer": { "@type": "Answer", "text": "باتباع إرشادات السيو التقني وسرعة الصفحة." }\n  }]\n}`}
                </code>
              </div>
            </section>
          )}

          {/* Pillar 4: Mobile First & Security */}
          {(activeTab === 'all' || activeTab === 'mobile') && (
            <section className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">التجربة والأمان</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    4. فهرسة الهواتف أولاً (Mobile-First) والأمان الرقمي
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                أكثر من 75% من عمليات البحث تتم عبر الهواتف الذكية، لذا نقدم لك هنا خلاصة نصائح تحسين محركات البحث وتجربة المستخدم لضمان توافق تام مع فهرسة الجوال أولاً ومنع التراجع المفاجئ في الترتيب.
              </p>

              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">تصميم متجاوب بالكامل (Viewport Tag):</strong> اضبط وسم العرض لمنع التمرير الأفقي المزعج وتأكد أن الخطوط والأزرار واضحة وسهلة النقر بالإبهام.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">شهادة أمان HTTPS وترويسات الحماية:</strong> جوجل تمنح أفضلية للمواقع التي تطبق{' '}
                    <a href="/topics/security-headers-csp" onClick={(e) => handleDeepLink(e, '/topics/security-headers-csp')} className="text-sky-600 dark:text-sky-400 font-semibold underline">
                      ترويسات الأمان CSP و HSTS لحماية الزوار
                    </a>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">بنية الربط الداخلي المحكمة (Silo Structure):</strong> اتبع{' '}
                    <a href="/articles/internal-linking-strategy" onClick={(e) => handleDeepLink(e, '/articles/internal-linking-strategy')} className="text-sky-600 dark:text-sky-400 font-semibold underline">
                      استراتيجية بناء الروابط الداخلية والمجموعات العنقودية
                    </a>{' '}
                    لتعزيز سلطة الصفحات العميقة.
                  </div>
                </div>
              </div>

              {/* Viewport Meta Tag */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-left dir-ltr">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-mono">Essential Mobile Viewport Meta</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('<meta name="viewport" content="width=device-width, initial-scale=1.0">', 'mobile-code')}
                    className="flex items-center gap-1 hover:text-white cursor-pointer"
                  >
                    {copiedSnippet === 'mobile-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet === 'mobile-code' ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
                <code className="block font-mono text-[11px] text-sky-400 select-all overflow-x-auto">
                  {'<meta name="viewport" content="width=device-width, initial-scale=1.0">'}
                </code>
              </div>
            </section>
          )}
        </div>

        {/* 30-Day Ranking Blueprint Table / Steps */}
        <section className="mb-14 p-8 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/50 text-white shadow-xl">
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 mb-2">
              <Award className="w-4 h-4" />
              خطة العمل التنفيذية
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              خارطة طريق الـ 30 يوماً لتصدر المرتبة الأولى في نتائج بحث جوجل
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              إذا طبقت هذه الخطوات الأربع بصورة منتظمة باستخدام أدوات راصد سيو، ستبدأ بملاحظة قفزة حقيقية في ظهور صفحاتك واكتساب آلاف الزيارات المجانية المستهدفة:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                W1
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">الأسبوع 1: التدقيق وإصلاح الأخطاء</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ابدأ باستخدام خدمة فحص سيو المواقع والتقارير الفورية عبر rasidseo لاكتشاف وإصلاح أخطاء الروابط المفقودة 404، وتوحيد وسوم H1، وضبط النصوص البديلة للصور.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                W2
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">الأسبوع 2: السرعة ومؤشرات الويب</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ضغط الصور بصيغ WebP، تفعيل تخزين المتصفح، تفعيل شبكة توصيل المحتوى، وتخفيض زمن استجابة الخادم TTFB إلى أقل من نصف ثانية.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-600/30 text-amber-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                W3
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">الأسبوع 3: الكلمات والربط الداخلي</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                تحديد الكلمات المفتاحية ذات نية البحث العالية، دمجها في العناوين والفقرات التمهيدية، وبناء شبكة روابط داخلية متينة إلى جانب استراتيجيات بناء الروابط الخلفية Backlinks ذات الجودة العالية لرفع موثوقية الموقع.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-sky-500/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-sky-600/30 text-sky-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                W4
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">الأسبوع 4: الأرشفة والمراقبة الدورية</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                تحديث ملف Sitemap وتقديمه إلى Google Search Console، وتفعيل خدمة المراقبة الدورية المجدولة لتتبع أي تراجع أو خلل فور حدوثه.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action: Audit Immediately */}
        <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-right sm:text-start">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              جاهز لاختبار موقعك وتطبيق معايير التصدر فوراً؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              جرّب أفضل خدمات rasidseo.site عبر خدمة فحص سيو المواقع والتقارير الفورية بإدخال رابط موقعك بالأعلى للحصول على مراجعة مفصلة مجاناً.
            </p>
          </div>

          <button
            type="button"
            onClick={handleScrollToAudit}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>ابدأ فحص موقعك الآن</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </article>
  );
};
