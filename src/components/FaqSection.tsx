import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Search,
  Sparkles,
  MessageCircle,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  FileCode2,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FaqItem {
  id: string;
  category: 'audit' | 'tips' | 'keywords' | 'general';
  categoryLabelAr: string;
  question: string;
  answer: string;
  codeSnippet?: string;
  tags: string[];
}

interface FaqSectionProps {
  onContactClick?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onContactClick }) => {
  const { t, isRtl } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<'all' | 'audit' | 'tips' | 'keywords' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});

  const faqList: FaqItem[] = useMemo(() => [
    {
      id: 'faq-1',
      category: 'audit',
      categoryLabelAr: 'فحص الموقع',
      question: 'كيف أبدأ فحص موقعي أو مدونتي واكتشاف الأخطاء الفنية؟',
      answer: 'كل ما عليك فعله هو إدخال رابط موقعك أو مدونتك (مثال: https://example.com) في الحقل المخصص أعلى الصفحة والضغط على زر "فحص فوري". يقوم النظام بالاتصال بالخادم واختبار أكثر من 20 معياراً تقنياً وداخلياً يشمل سرعة الاستجابة، وسوم الميتا، عناوين H1-H6، فحص ملف Robots.txt وخريطة Sitemap، والصور والروابط المعطلة، وعرض تقرير تفاعلي فوري بنسبة النتيجة.',
      tags: ['بدء الفحص', 'رابط الموقع', 'التقرير']
    },
    {
      id: 'faq-2',
      category: 'tips',
      categoryLabelAr: 'التلميحات الذكية',
      question: 'ما هي ميزة "التلميحات الذكية (Smart Tips)" وكيف أستخدم الحلول البرمجية الجاهزة؟',
      answer: 'بجانب كل نتيجة فحص تحتوي على خطأ أو تنبيه، ستجد زراً بارزاً بعنوان "تلميح ذكي فوري". عند النقر عليه، تُعرض لك نصيحة فورية مخصصة تشرح السياق التقني للخطأ وتقدم حلولاً برمجية جاهزة للنسخ بنقرة واحدة لمنصات HTML5 و Next.js و WordPress دون الحاجة للبحث الطويل.',
      tags: ['تلميحات ذكية', 'أكواد جاهزة', 'حلول برمجية']
    },
    {
      id: 'faq-3',
      category: 'tips',
      categoryLabelAr: 'سيو الصور',
      question: 'كيف أصلح مشكلة الصور التي تفتقر للنص البديل (Missing Alt) وما الصيغة الموصى بها؟',
      answer: 'توصي خوارزميات جوجل والذكاء الاصطناعي بإضافة السمة alt لكل صورة توضيحية لكتابة محتوى وصفي دقيق وممثل للصورة يتضمن الكلمات المفتاحية الأساسية، مما يمكن عناكب البحث من فهرستها وجلب آلاف الزيارات المجانية من بحث صور جوجل (Google Images):',
      codeSnippet: '<img src="pic.gif" alt="نص الكلمات المفتاحية الدقيق والوصفي الذي يمثل الصورة." />',
      tags: ['نصوص بديلة', 'سيو الصور', 'img alt']
    },
    {
      id: 'faq-4',
      category: 'keywords',
      categoryLabelAr: 'الكلمات المفتاحية',
      question: 'كيف أستفيد من قسم "الكلمات المفتاحية الأكثر بحثاً في جوجل (SEO Keywords)"؟',
      answer: 'يقدم هذا القسم تحليلاً حياً لأكثر الكلمات الدلالية بحثاً في Google المتعلقة بموضوع موقعك، موضحاً حجم البحث الشهري، ومستوى الصعوبة والمنافسة (KD%)، ومتوسط سعر النقرة الإعلانية (CPC)، ونية الباحث (تجارية، شرائية، أو معلوماتية)، بالإضافة إلى اقتراحات إكمال جوجل التلقائي (Google Autocomplete) وإمكانية تصديرها كملف CSV أو نسخها فوراً.',
      tags: ['أكثر بحثاً', 'حجم البحث', 'Google Keywords']
    },
    {
      id: 'faq-5',
      category: 'audit',
      categoryLabelAr: 'مؤشرات الأداء',
      question: 'كيف تؤثر مؤشرات أداء الويب الأساسية (Core Web Vitals) على ترتيب موقعي؟',
      answer: 'تُعد مؤشرات Core Web Vitals (مثل LCP لقياس سرعة تحميل أكبر عنصر مرئي، و FID/INP لقياس سرعة التفاعل، و CLS لقياس الثبات البصري) معيار ترتيب رسمي في خوارزميات جوجل. المواقع التي تحقق نتائج خضراء تمنح زوارها تجربة ممتازة وتتصدر نتائج البحث على حساب المواقع البطيئة.',
      tags: ['Core Web Vitals', 'LCP', 'CLS', 'السرعة']
    },
    {
      id: 'faq-6',
      category: 'tips',
      categoryLabelAr: 'العناوين وهيكل الصفحة',
      question: 'ما هي القاعدة الذهبية لوسوم العناوين H1 و H2 و H3 في معايير جوجل 2026؟',
      answer: 'يجب أن تحتوي كل صفحة أو مقال على وسم H1 واحد فقط يعبر عن الموضوع الأساسي بدقة ووضوح. تُستخدم وسوم H2 لتفريع الأقسام والمحاور الرئيسية، بينما تُخصص وسوم H3 للنقاط الفرعية والشروحات التفصيلية. تجنب ترك وسم H1 فارغاً أو تكراره أكثر من مرة في نفس الصفحة.',
      tags: ['H1', 'H2', 'هيكل العناوين']
    },
    {
      id: 'faq-7',
      category: 'general',
      categoryLabelAr: 'التصدير والمشاركة',
      question: 'كيف أقوم بتصدير تقرير الفحص والمهام المعلقة أو مشاركته مع فريق العمل والعملاء؟',
      answer: 'توفر المنصة عدة خيارات تصدير مرنة: يمكنك تنزيل تقرير الفحص كملف PDF احترافي جاهز للطباعة، أو تصدير قائمة التحقق والمهام المعلقة كملف PDF أو CSV لفرق التطوير، بالإضافة إلى إمكانية تصدير البيانات الكاملة كـ JSON لاستيرادها في برامج التحليل، ومشاركة التقرير عبر 10 شبكات تواصل اجتماعي.',
      tags: ['تصدير PDF', 'تصدير CSV', 'مشاركة']
    },
    {
      id: 'faq-8',
      category: 'general',
      categoryLabelAr: 'التوافق والمنصات',
      question: 'هل تدعم المنصة مواقع ووردبريس والمتاجر الإلكترونية (سلة، زد، شوبيفاي)؟',
      answer: 'نعم بالكامل! راصد سيو متوافق مع كافة المنصات البرمجية وإطارات العمل، بما في ذلك مواقع WordPress و Next.js و React و Laravel، ومتاجر سلة، زد، Shopify، ومتاجر WooCommerce والمواقع البرمجية الخاصة.',
      tags: ['ووردبريس', 'سلة', 'زد', 'Shopify']
    },
    {
      id: 'faq-9',
      category: 'general',
      categoryLabelAr: 'اللغات العالمية',
      question: 'هل تدعم المنصة لغات أخرى غير العربية؟',
      answer: 'نعم! تدعم المنصة 60 لغة عالمية رسمية مع التبديل التلقائي لاتجاه الواجهة (RTL/LTR) والترجمة الفورية لجميع المعايير والتقارير. يمكنك اختيار لغتك المفضلة من القائمة المنسدلة في الشريط العلوي للموقع في أي وقت.',
      tags: ['اللغات', '60 لغة', 'RTL/LTR']
    }
  ], []);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqList.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesQ = item.question.toLowerCase().includes(q);
        const matchesA = item.answer.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesQ && !matchesA && !matchesTags) return false;
      }
      return true;
    });
  }, [faqList, activeCategory, searchQuery]);

  const handleCopyAnswer = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackGiven((prev) => ({ ...prev, [id]: type }));
  };

  return (
    <section
      id="faq-section"
      className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 transition-colors"
      aria-label="قسم الأسئلة الشائعة"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Block */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('nav.faq', 'الأسئلة الشائعة')} وإرشادات السيو • FAQ</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            كل ما تحتاج معرفته عن فحص السيو وأدوات راصد
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            إجابات شاملة ومباشرة على أكثر الاستفسارات التقنية شيوعاً حول تدقيق المواقع، تحسين محركات البحث، وتوليد الأكواد البرمجية المعتمدة لعام 2026.
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category Chips */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs font-bold shrink-0">
              {[
                { id: 'all', label: 'كافة الأسئلة' },
                { id: 'audit', label: 'فحص الموقع' },
                { id: 'tips', label: 'التلميحات وسيو الصور' },
                { id: 'keywords', label: 'الكلمات المفتاحية' },
                { id: 'general', label: 'عام والتوافق' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Live Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الأسئلة..."
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                لم يتم العثور على سؤال يطابق بحثك
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                جرب صياغة استفسارك بكلمات أخرى أو اختر "كافة الأسئلة" أعلاه.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              const feedback = feedbackGiven[faq.id];

              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 overflow-hidden transition-all shadow-2xs hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Question Header Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    aria-expanded={isExpanded}
                    className="w-full text-right p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                        ؟
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {faq.question}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hidden sm:inline">
                        {faq.categoryLabelAr}
                      </span>
                      <div className={`w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : ''}`}>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Answer Body */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 space-y-3 animate-in fade-in duration-150">
                      <p className="pt-2">{faq.answer}</p>

                      {/* Optional Code Snippet */}
                      {faq.codeSnippet && (
                        <div className="space-y-1 pt-1">
                          <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs dir-ltr text-left overflow-x-auto shadow-inner select-all border border-slate-800">
                            {faq.codeSnippet}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions inside FAQ Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                        {/* Copy Answer */}
                        <button
                          type="button"
                          onClick={() => handleCopyAnswer(faq.id, faq.answer + (faq.codeSnippet ? '\n' + faq.codeSnippet : ''))}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {copiedId === faq.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[11px] font-semibold">{copiedId === faq.id ? 'تم نسخ الإجابة!' : 'نسخ الإجابة'}</span>
                        </button>

                        {/* Was this helpful feedback */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>هل كانت هذه الإجابة مفيدة؟</span>
                          <button
                            type="button"
                            onClick={() => handleFeedback(faq.id, 'up')}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${feedback === 'up' ? 'text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950' : 'hover:text-emerald-500'}`}
                            title="نعم، مفيدة"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(faq.id, 'down')}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${feedback === 'down' ? 'text-rose-500 font-bold bg-rose-50 dark:bg-rose-950' : 'hover:text-rose-500'}`}
                            title="بحاجة لتوضيح أكثر"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Direct Help CTA Card */}
        <div className="max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-indigo-950/20 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-indigo-500" />
              <span>لم تجد إجابة لسؤالك التقني؟</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              فريق خبراء السيو والدعم الفني في راصد سيو جاهز لمساعدتك في تحليل موقعك وحل مشكلات الفهرسة والتصدر في جوجل.
            </p>
          </div>

          {onContactClick && (
            <button
              type="button"
              onClick={onContactClick}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 active:scale-95 cursor-pointer shrink-0"
            >
              تواصل مع الدعم الفني
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
