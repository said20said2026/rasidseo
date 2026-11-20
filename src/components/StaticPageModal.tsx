import React, { useState } from 'react';
import { X, Shield, FileText, Mail, Info, Send, CheckCircle2, MessageSquare, Globe, Sparkles, AlertCircle, HelpCircle, BookOpen, ChevronDown, ExternalLink } from 'lucide-react';

export type StaticPageType = 'about' | 'privacy' | 'terms' | 'contact' | 'disclaimer' | 'help';

interface StaticPageModalProps {
  isOpen: boolean;
  activePage: StaticPageType;
  onClose: () => void;
  onSelectPage: (page: StaticPageType) => void;
}

export const StaticPageModal: React.FC<StaticPageModalProps> = ({
  isOpen,
  activePage,
  onClose,
  onSelectPage
}) => {
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSite, setContactSite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
      setContactSite('');
    }, 800);
  };

  const navItems = [
    { id: 'about', label: 'من نحن', icon: <Info className="w-4 h-4" /> },
    { id: 'disclaimer', label: 'إخلاء مسؤولية', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'help', label: 'مركز المساعدة', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'privacy', label: 'سياسة الخصوصية', icon: <Shield className="w-4 h-4" /> },
    { id: 'terms', label: 'شروط الخدمة', icon: <FileText className="w-4 h-4" /> },
    { id: 'contact', label: 'اتصل بنا', icon: <Mail className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white text-base">
              راصد <span className="text-indigo-600 dark:text-indigo-400">سيو</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {activePage === 'about' && 'من نحن'}
              {activePage === 'disclaimer' && 'إخلاء مسؤولية'}
              {activePage === 'help' && 'مركز المساعدة والأسئلة الشائعة'}
              {activePage === 'privacy' && 'سياسة الخصوصية'}
              {activePage === 'terms' && 'شروط الخدمة'}
              {activePage === 'contact' && 'اتصل بنا وطلب المساعدة'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsSuccess(false);
                  onSelectPage(item.id as StaticPageType);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {/* 1. ABOUT US */}
          {activePage === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  عن منصة راصد سيو (RasidSEO)
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  راصد سيو هي أداة تقنية متخصصة ومستقلة صُممت لتمكين أصحاب المواقع، والمدونين، وصناع المحتوى، ومطوري الويب في العالم العربي من فحص وتدقيق أداء مواقعهم والتأكد من مطابقتها لأحدث معايير محركات البحث (Google Search Central).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1 flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                    <Globe className="w-4 h-4" />
                    <span>رؤيتنا</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    إتاحة أدوات تدقيق احترافية عالية الدقة تعادل المنصات العالمية، ومصممة خصيصاً لتفهم خصوصيات المحتوى واللغة العربية وهياكل المدونات الحديثة.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1 flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    <span>منهجية الفحص الذكية</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    دمج التحليل البرمجي لشفرة HTML وترويسات الخادم مع قوة نماذج الذكاء الاصطناعي لتقديم خطة عمل تنفيذية وليست مجرد أرقام صامتة.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">ما الذي يميز راصد سيو؟</h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  <li>فحص فوري لأكثر من 50 عاملاً برمجياً ودلالياً بدون تسجيل أو تعقيد.</li>
                  <li>مولد أكواد جاهز للتطبيق الفوري (وسوم الميتا، Schema.org، و Robots.txt).</li>
                  <li>محاكيات تفاعلية للمعاينة على جوجل وواتساب وتويتر (X).</li>
                  <li>تصدير تقرير فحص كامل بصيغة PDF ومخططات بيانية لمتابعة التحسن التاريخي.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 2. PRIVACY POLICY */}
          {activePage === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  سياسة الخصوصية
                </h3>
                <p className="text-xs text-slate-400 font-mono">آخر تحديث: 12 أكتوبر 2026</p>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <section>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">1. البيانات التي نجمعها</h4>
                  <p>
                    نحن نحترم خصوصيتك بشكل كامل. عند استخدام منصة راصد سيو لفحص موقعك، نقوم فقط بالوصول إلى الصفحات والروابط العامة المتاحة علناً عبر الإنترنت والتي تزودنا بها في حقل الفحص. لا نطلب ولا نخزن أي بيانات حساسة، أو كلمات مرور، أو ملفات خاصة بموقعك.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">2. التخزين المحلي (Local Storage)</h4>
                  <p>
                    تستخدم المنصة التخزين المحلي في متصفحك (Browser Local Storage) لحفظ سجل درجات الفحص الأخيرة للنطاق لتمكينك من متابعة مخطط التحسن البياني عبر الزمن. هذه البيانات محفوظة حصرياً على جهازك ولا تتم مشاركتها مع أي جهة خارجية.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">3. تحليل شفرة الموقع</h4>
                  <p>
                    يقوم الخادم بمحاكاة عناكب محركات البحث لقراءة ترويسات الاستجابة، ووسوم الميتا، والعناوين العامة، والصور. لا يتم تخزين شفرة الموقع المصدرية في قواعد بيانات دائمة بعد الانتهاء من جلسة الفحص.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">4. معالجة الذكاء الاصطناعي</h4>
                  <p>
                    في حال تفعيل استشارة الذكاء الاصطناعي، يتم إرسال ملخص المؤشرات المكتشفة فقط إلى نموذج التحليل لصياغة التوصيات، دون إرسال أي معلومات شخصية تخص المستخدم.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* 3. TERMS OF SERVICE */}
          {activePage === 'terms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  شروط الاستخدام والخدمة
                </h3>
                <p className="text-xs text-slate-400 font-mono">سارية المفعول لعام 2026</p>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <section>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">1. الاستخدام العادل والمصرح به</h4>
                  <p>
                    يُسمح باستخدام منصة راصد سيو لأغراض الفحص والتحليل الشخصي والتجاري للمواقع والمدونات التي تمتلكها أو لديك تفويض رسمي بفحصها. يُحظر استخدام المنصة لشن هجمات حرمان من الخدمة (DDoS) أو إغراق الخوادم بطلبات فحص غير طبيعية.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">2. إخلاء المسؤولية عن ترتيب محركات البحث</h4>
                  <p>
                    التقارير والتوصيات المقدمة في المنصة مبنية على أفضل الممارسات الموثقة لسيو المواقع (Google Search Guidelines). لا تضمن المنصة أي ترتيب محدد في نتائج البحث، إذ تخضع خوارزميات محركات البحث لتحديثات مستمرة خارجة عن سيطرة أي طرف ثالث.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">3. تطبيق الأكواد والتعديلات البرمجية</h4>
                  <p>
                    تتحمل أنت المسؤولية الكاملة عن مراجعة واختبار أي أكواد يتم توليدها بواسطة مولد الأكواد (مثل وسوم الميتا أو توجيهات .htaccess) على خادمك أو نظام إدارة المحتوى (ووردبريس، شوبيفاي، إلخ) قبل اعتمادها النهائي.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">4. التعديل والتحديثات</h4>
                  <p>
                    نحتفظ بالحق في تحديث معايير الفحص أو شروط الخدمة لمواكبة التغيرات التقنية ومعايير الويب الحديثة.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* DISCLAIMER PAGE (إخلاء مسؤولية) */}
          {activePage === 'disclaimer' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    إخلاء المسؤولية القانونية والتقنية
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    توضيح حدود الاستخدام، وطبيعة التوصيات الاسترشادية، وحقوق الملكية 2026
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>1. طبيعة الفحوصات والتوصيات الاستشارية</span>
                  </h4>
                  <p>
                    كافة الفحوصات والتقارير والدرجات التقييمية ومؤشرات الأداء الصادرة عن منصة راصد سيو (RasidSEO) تُعد أدوات استرشادية واستشارية مبنية على الممارسات القياسية الموثقة لمحركات البحث (Google Search Guidelines ومعايير Core Web Vitals). لا تضمن المنصة بأي شكل من الأشكال تحقيق موقعك لترتيب محدد أو تصدر فوري في صفحة نتائج البحث الأولى، حيث إن ترتيب المواقع يخضع لخوارزميات محركات البحث المعقدة والمتغيرة دورياً بصورة مستقلة تماماً.
                  </p>
                </section>

                <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>2. دقة الفحص الآلي وعوامل الخوادم الخارجية</span>
                  </h4>
                  <p>
                    تتم عمليات الفحص عبر جلب وقراءة كود HTML والاستجابات الشبكية للصفحة في لحظة الفحص. قد تتأثر النتائج بعوامل تقنية تابعة لخادم العميل مثل جدران الحماية (WAF / Cloudflare)، أو بطء استجابة الاستضافة، أو إجراءات حظر عناوين IP، أو أنظمة التخزين المؤقت (Cache). لا تتحمل المنصة مسؤولية أي تباين طارئ بين الفحص اللحظي والواقع الخارجي.
                  </p>
                </section>

                <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>3. المسؤولية عن تطبيق الأكواد البرمجية والتعديلات الفنية</span>
                  </h4>
                  <p>
                    الأكواد التوضيحية وشفرات الإصلاح المولدة (بما في ذلك وسوم الميتا، وترميز Schema.org، ووسوم &lt;img alt&gt;، وتوجيهات ملفات .htaccess و robots.txt) هي نماذج مقترحة لمساعدة المطورين. تقع المسؤولية الكاملة على عاتق مدير الموقع أو المطور لمراجعة واختبار الأكواد في بيئة اختبار تجريبية (Staging) قبل إدراجها في بيئة الإنتاج المباشرة (Production). لا تتحمل المنصة أي مسؤولية عن أي تعطل خادم أو تراجع في الأداء ناتج عن سوء تطبيق الشفرات.
                  </p>
                </section>

                <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>4. حاسبة عائد الاستثمار وتوقعات الأرباح المالية (SEO ROI)</span>
                  </h4>
                  <p>
                    الأرقام المالية والتقديرات المستخلصة من "حاسبة عائد الاستثمار (SEO ROI Calculator)" هي محاكاة رياضية تقريبية مبنية على المدخلات والافتراضات التي يحددها المستخدم (مثل معدل التحويل ومتوسط قيمة الطلب ومعدل نمو الزيارات). لا تمثل هذه التقديرات أي وعد أو التزام قانوني أو تعاقدي بتحقيق إيرادات أو مكاسب تجارية مؤكدة.
                  </p>
                </section>

                <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>5. الروابط الخارجية ومواقع الطرف الثالث</span>
                  </h4>
                  <p>
                    قد تتضمن تقارير الفحص روابط مرجعية لمواقع أو أدوات خارجية (مثل Google Search Central، Schema.org، وغيرها). المنصة ليست مسؤولة عن محتوى أو سياسات الخصوصية أو دقة المعلومات المقدمة في أي مواقع تابعة لأطراف ثالثة.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* HELP CENTER PAGE (مركز المساعدة) */}
          {activePage === 'help' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    مركز المساعدة والأسئلة الشائعة (FAQ)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    دليل شامل يوضح كيفية استخدام المنصة وإصلاح أخطاء السيو وتحقيق أقصى استفادة
                  </p>
                </div>
              </div>

              {/* Quick Steps Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center mb-2">1</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">فحص الموقع الفوري</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    أدخل رابط موقعك واضغط فحص لاكتشاف العيوب البرمجية ومؤشرات الأداء.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center mb-2">2</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">التلميحات الذكية</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    انقر فوق "تلميح ذكي" بجانب كل خطأ للحصول على الشفرة الجاهزة للنسخ.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-mono text-xs font-bold flex items-center justify-center mb-2">3</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">تتبع وتصدير المهام</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    تابع إنجاز التحسينات في قائمة التحقق وصدّر مهام الإصلاح المعلقة كـ PDF أو CSV.
                  </p>
                </div>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  الأسئلة الأكثر شيوعاً:
                </h4>

                {[
                  {
                    q: 'كيف أبدأ فحص موقعي أو مدونتي لأول مرة؟',
                    a: 'كل ما عليك فعله هو إدخال رابط موقعك (مثال: example.com) في الحقل المخصص أعلى الصفحة والضغط على "افحص موقعك الآن". يقوم النظام فورياً باختبار أكثر من 20 معياراً تقنياً وداخلياً يشمل العناوين H1-H6، ووسوم الميتا، وسرعة الاستجابة، والصور والروابط المعطلة.'
                  },
                  {
                    q: 'ما هي ميزة "التلميحات الذكية (Smart Tips)" وكيف أستخدمها؟',
                    a: 'بجانب كل نتيجة فحص تحتوي على خطأ أو تنبيه، ستجد زراً بارزاً بعنوان "تلميح ذكي فوري". عند الضغط عليه، ستعرض لك المنصة نصيحة فورية مخصصة تشرح السياق التقني للخطأ وتمنحك حلولاً برمجية جاهزة للنسخ لمنصات HTML و Next.js و WordPress دون الحاجة للبحث الطويل.'
                  },
                  {
                    q: 'كيف أستفيد من قائمة التحقق وتتبع المهام (SEO Checklist)؟',
                    a: 'تقوم قائمة التحقق بتجميع جميع المشاكل التقنية وتصنيفها تلقائياً حسب الأولوية. يمكنك تحديد المهام المنجزة، وحفظ التقدم، وفلترة البنود المعلقة أو تصديرها لمشاركتها مع فريق التطوير.'
                  },
                  {
                    q: 'كيف أصلح مشكلة الصور التي تفتقر للنص البديل (Missing Alt)؟',
                    a: 'توصي خوارزميات جوجل بإضافة السمة alt لكل صورة توضيحية. يمكنك استخدام الصيغة المعتمدة: <img src="pic.gif" alt="نص الكلمات المفتاحية الدقيق والوصفي الذي يمثل الصورة." /> كما يمكنك توليد الأكواد مباشرة من تبويب "وسم الصور <img alt>" داخل مولد الأكواد.'
                  },
                  {
                    q: 'كيف أقوم بتصدير ومشاركة تقرير الفحص مع فريقي أو العميل؟',
                    a: 'توفر المنصة خيارات تصدير متعددة: زر "تصدير التقرير كـ PDF" لإنشاء ملف طباعة احترافي، وزر "تصدير المهام المعلقة" لتنزيل قائمة بالعيوب المكتشفة كـ PDF أو CSV، بالإضافة إلى ميزة مشاركة الرابط أو نسخ دراسة الجدوى.'
                  },
                  {
                    q: 'هل تدعم المنصة لغات أخرى غير العربية؟',
                    a: 'نعم! تدعم المنصة 60 لغة عالمية مع التبديل التلقائي لاتجاه الواجهة (RTL/LTR). يمكنك اختيار لغتك المفضلة من القائمة المنسدلة في الشريط العلوي للموقع في أي وقت.'
                  }
                ].map((item, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full text-right p-3.5 flex items-center justify-between gap-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Direct Support CTA */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">لم تجد إجابة لسؤالك؟</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    فريق الدعم الفني جاهز للإجابة على استفساراتك التقنية وتقديم المساعدة المباشرة.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPage('contact')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  تواصل مع الدعم الفني
                </button>
              </div>
            </div>
          )}

          {/* 4. CONTACT US */}
          {activePage === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">
                  تواصل معنا
                </h3>
                <p className="text-xs text-slate-500">
                  هل لديك استفسار، اقتراح لتطوير أداة الفحص، أو واجهت مشكلة في تحليل موقعك؟ يسعدنا تواصلك معنا دائماً.
                </p>
              </div>

              {isSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">تم استلام رسالتك بنجاح!</h4>
                  <p className="text-xs text-emerald-700">
                    شكراً لتواصلك مع فريق راصد سيو. سنقوم بمراجعة استفسارك والرد عليك في أقرب وقت.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-3 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل *</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="أدخل اسمك"
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رابط موقعك (اختياري)</label>
                      <input
                        type="text"
                        value={contactSite}
                        onChange={(e) => setContactSite(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">موضوع الاستفسار *</label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      >
                        <option value="">اختر الموضوع</option>
                        <option value="technical_issue">استفسار عن خطأ برمجي في الفحص</option>
                        <option value="seo_advice">طلب استشارة سيو متقدمة</option>
                        <option value="feature_request">اقتراح ميزة جديدة للمنصة</option>
                        <option value="partnership">شراكة أو تعاون</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص الرسالة أو الاستفسار *</label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="اشرح استفسارك بالتفصيل وسيسعدنا مساعدتك..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      * الحقول المطلوبة ملزمة للرد.
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-200 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <span>جاري الإرسال...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال الرسالة الآن</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Close */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
