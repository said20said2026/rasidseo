import React from 'react';
import {
  BookOpen,
  Search,
  Gauge,
  Code2,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { dispatchDeepNavigation } from '../data/deepPages';

export const HowSiteWorksSection: React.FC = () => {
  const handleDeepLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    dispatchDeepNavigation(path);
  };

  const scrollToAuditInput = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      document.getElementById('audit-input')?.focus();
    }, 300);
  };

  return (
    <article
      id="how-it-works-section"
      aria-labelledby="how-it-works-heading"
      className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-16 transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-4">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>آلية عمل المنصة الذكية</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              دليل شامل (~600 كلمة)
            </span>
          </div>

          <h2
            id="how-it-works-heading"
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug"
          >
            كيف يعمل موقع راصد سيو (RasidSEO) لفحص أخطاء المواقع وتصدر نتائج البحث؟
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            رحلة تقنية متكاملة تبدأ بإدخال رابط موقعك وتنتهي بخطة إصلاح عملية وأكواد جاهزة تجعل صفحاتك مؤهلة للمرتبة الأولى في جوجل.
          </p>
        </header>

        {/* Long-form Human-Written SEO Article Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 space-y-8 text-slate-700 dark:text-slate-300 leading-loose text-sm sm:text-[15.5px]">
          <section className="space-y-3">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>1. الاتصال المباشر بالخادم ومحاكاة زحف جوجل في ثوانٍ</span>
            </h3>
            <p>
              يعتمد موقع <strong>راصد سيو (RasidSEO)</strong> على محرك تدقيق سيو تقني متطور يعمل فور إدخالك رابط الموقع أو المدونة والضغط على زر الفحص الفوري. في اللحظة الأولى، يتواصل الخادم مباشرة مع موقعك باستخدام بروتوكول جلب متزامن عالي السرعة لقياس زمن استجابة الخادم الأولي (TTFB)، والتحقق من رمز الحالة (HTTP Status Code)، وفحص صلاحية شهادة التشفير والأمان HTTPS. وبالتوازي مع قراءة الشفرة المصدرية لصفحة HTML، يختبر النظام آلياً وجود ملف التعليمات <strong>Robots.txt</strong> وخريطة الموقع <strong>Sitemap.xml</strong> للتأكد من أن عناكب محركات البحث قادرة على الوصول إلى جميع صفحاتك وفهرستها دون عوائق.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>2. التحليل الشامل لعوامل السيو الداخلي والتقني ومؤشرات السرعة</span>
            </h3>
            <p>
              بعد استلام بنية الصفحة، يبدأ محلل السيو الداخلي (On-Page SEO) بتفكيك كافة العناصر الحاسمة في ترتيب محركات البحث. يفحص النظام طول وتكوين <a href="/topics/on-page-seo" onClick={(e) => handleDeepLinkClick(e, '/topics/on-page-seo')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">عنوان الصفحة والوصف التعريفي وتدرج العناوين H1-H6</a>. كما يجري مسحاً كاملاً لجميع الصور لاكتشاف أي صور تفتقد إلى النص البديل الوصفي أو التحسين بصيغ <a href="/blog/image-seo-webp-avif" onClick={(e) => handleDeepLinkClick(e, '/blog/image-seo-webp-avif')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">الصور الحديثة WebP و AVIF</a> التي تحمي من إزاحة التصميم التراكمي (CLS).
            </p>
            <p>
              إضافةً إلى ذلك، يقيس الموقع جودة <a href="/articles/internal-linking-strategy" onClick={(e) => handleDeepLinkClick(e, '/articles/internal-linking-strategy')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">استراتيجية الروابط الداخلية والمجموعات العنقودية</a> ويفحص عينة من الروابط عبر <a href="/features/broken-links-checker" onClick={(e) => handleDeepLinkClick(e, '/features/broken-links-checker')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">أداة كشف الروابط المعطلة 404</a> التي تستنزف ميزانية الزحف. وفي جانب الأداء والأمان، يحلل <a href="/articles/core-web-vitals-speed" onClick={(e) => handleDeepLinkClick(e, '/articles/core-web-vitals-speed')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">مؤشرات الويب الأساسية Core Web Vitals</a>، ويدقق <a href="/topics/security-headers-csp" onClick={(e) => handleDeepLinkClick(e, '/topics/security-headers-csp')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">ترويسات الحماية الحرجة CSP و HSTS</a> لحماية الزوار.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <span>3. المعاينة الحية، الكلمات المفتاحية، واستخراج البيانات المنظمة</span>
            </h3>
            <p>
              لا يكتفي موقع راصد سيو بعرض أرقام مجردة، بل يوفر لك <a href="/features/mobile-serp-simulator" onClick={(e) => handleDeepLinkClick(e, '/features/mobile-serp-simulator')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">معاينة نتائج بحث جوجل ومحاكي شاشات الهواتف الذكية</a>، إلى جانب تحليل كثافة الكلمات المفتاحية واستخراج فرص الكلمات ذات نية البحث العالية. ويفحص كذلك <a href="/topics/schema-structured-data" onClick={(e) => handleDeepLinkClick(e, '/topics/schema-structured-data')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">مخططات البيانات المنظمة Schema.org JSON-LD</a> لمساعدتك في الحصول على المقتطفات المميزة في صفحات البحث.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>4. التلميحات الذكية، مولد الأكواد الجاهزة، وخطة العمل المتكاملة</span>
            </h3>
            <p>
              تتمثل القوة الحقيقية في <a href="/articles/technical-seo-checklist-2026" onClick={(e) => handleDeepLinkClick(e, '/articles/technical-seo-checklist-2026')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">الدليل الشامل لفحص السيو التقني 2026</a> في تحويل كل خطأ مكتشف إلى حل تقني مباشر قابل للتنفيذ. كما يتيح لك <a href="/features/seo-code-generator" onClick={(e) => handleDeepLinkClick(e, '/features/seo-code-generator')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">مولد أكواد السيو والميتا والـ Schema</a> إنشاء الوسوم وملفات Robots.txt بضغطة زر.
            </p>
            <p>
              ولضمان استمرارية تصدرك لنتائج البحث، يمنحك الموقع قائمة مهام تفاعلية قابلة للتصفية والتصدير بصيغ PDF و JSON و CSV، مع إمكانية جدولة الفحص الدوري لتلقي تنبيهات فورية عند أي تراجع في النتيجة أو الأداء. سواء كنت مدوناً أو صاحب متجر إلكتروني أو مطور ويب، ستجد في <a href="/faq" onClick={(e) => handleDeepLinkClick(e, '/faq')} className="text-indigo-600 dark:text-indigo-400 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600">الأسئلة الشائعة حول فحص المواقع في راصد سيو</a> دليلك اليومي لضمان موقع سريع وآمن.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>5. مقارنة النتائج التاريخية وتحسين تجربة القارئ العربي</span>
            </h3>
            <p>
              مع كل فحص جديد تجريه، يحفظ راصد سيو سجل النتيجة الزمني لتتمكن من مقارنة تطور أداء موقعك قبل الإصلاح وبعده عبر رسوم بيانية واضحة، وقياس أثر كل تعديل تقني على النتيجة الإجمالية. كما يراعي محرك التحليل خصوصية اللغة العربية وتوجيه النص من اليمين إلى اليسار (RTL)، ونسبة المحتوى النصي إلى شيفرة HTML، وجودة تجربة الاستخدام على الأجهزة المحمولة لضمان توافق تام مع سياسات الفهرسة المعتمدة للهواتف أولاً. بذلك تتحول عملية تحسين محركات البحث من تخمينات معقدة إلى خطوات دقيقة ومدروسة ترفع ترتيب صفحاتك وتضاعف الزيارات المجانية المستهدفة بشكل مستدام وطويل الأمد.
            </p>
          </section>

          {/* Bottom Summary Badges & CTA */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                فحص تقني وداخلي شامل
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                أكواد وحلول برمجية فورية
              </span>
            </div>

            <button
              type="button"
              onClick={scrollToAuditInput}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <span>ابدأ فحص موقعك مجاناً الآن</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
