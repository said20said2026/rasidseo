export interface DeepArticleData {
  path: string;
  slug: string;
  category: 'articles' | 'topics' | 'features';
  categoryLabelAr: string;
  titleAr: string;
  summaryAr: string;
  readTimeAr: string;
  paragraphsAr: string[];
  keyTakeawaysAr: string[];
  relatedPaths: string[];
}

export const DEEP_ARTICLES: DeepArticleData[] = [
  {
    path: '/articles/technical-seo-checklist-2026',
    slug: 'technical-seo-checklist-2026',
    category: 'articles',
    categoryLabelAr: 'مقالات السيو المتقدمة',
    titleAr: 'الدليل الشامل لفحص السيو التقني لعام 2026 وتصدر نتائج جوجل',
    summaryAr: 'دليل شامل ومراجعات مفصلة باللغة العربية يضم أهم 15 معياراً تقنياً عبر أفضل خدمات rasidseo.site لضمان تصدر موقعك.',
    readTimeAr: '5 دقائق قراءة',
    paragraphsAr: [
      'يمثل السيو التقني (Technical SEO) البنية التحتية التي يعتمد عليها محرك بحث جوجل لفهم صفحات موقعك وفهرستها بكفاءة. مهما بلغت جودة مقالاتك، فإن أخطاء الزحف أو بطء الخادم قد تمنع موقعك من المنافسة في المراتب الأولى.',
      'تمنحك أفضل خدمات rasidseo.site فحصاً دقيقاً لملف Robots.txt وخريطة الموقع Sitemap.xml للتأكد من عدم حظر الصفحات المهمة، مع توحيد الروابط الأساسية (Canonical URLs) لمنع مشكلة تكرار المحتوى بين نسخ www وبدونها.',
      'احرص كذلك على تطبيق نصائح تحسين محركات البحث وتجربة المستخدم عبر الاعتماد على خدمة فحص سيو المواقع والتقارير الفورية في rasidseo، وتفعيل شهادة SSL (HTTPS)، واختبار سرعة الاستجابة (TTFB)، لفهم كيفية تصدر نتائج البحث في جوجل خطوة بخطوة للمبتدئين عبر الربط المنطقي بين المقالات الرئيسية والفرعية.'
    ],
    keyTakeawaysAr: [
      'التأكد من إرجاع رمز الحالة 200 OK لجميع الصفحات الأساسية وتصحيح أخطاء 404.',
      'توحيد وسم Canonical ومنع فهرسة صفحات البحث الداخلي والوسوم الفارغة.',
      'تفعيل ضغط Brotli أو Gzip وتخزين الملفات الثابتة في شبكة CDN.'
    ],
    relatedPaths: [
      '/articles/core-web-vitals-speed',
      '/articles/internal-linking-strategy',
      '/topics/schema-structured-data'
    ]
  },
  {
    path: '/articles/core-web-vitals-speed',
    slug: 'core-web-vitals-speed',
    category: 'articles',
    categoryLabelAr: 'مقالات السيو المتقدمة',
    titleAr: 'تحسين مؤشرات الويب الأساسية (Core Web Vitals) وزمن استجابة الخادم TTFB',
    summaryAr: 'أهم نصائح تحسين محركات البحث وتجربة المستخدم لتحقيق الدرجة الخضراء في مقاييس LCP و CLS و INP وتصدر النتائج.',
    readTimeAr: '4 دقائق قراءة',
    paragraphsAr: [
      'تعتمد خوارزميات جوجل الحديثة بشكل مباشر على تجربة الصفحة ومؤشرات الويب الأساسية: سرعة عرض أكبر عنصر مرئي (LCP)، واستقرار التصميم التراكمي (CLS)، وسرعة الاستجابة للتفاعل (INP).',
      'لتحقيق سرعة مثالية أقل من 2.5 ثانية في LCP، قم بتحميل الصور بصيغ حديثة مثل AVIF و WebP مع إضافة سمة fetchpriority="high" للصورة الرئيسية في أعلى الصفحة، وتفعيل التلميحات المبكرة preconnect للخطوط الخارجية.',
      'أما لتجنب إزاحة التصميم (CLS)، فاحرص على تحديد الأبعاد الصريحة width و height لكل صورة وإطار مضمن قبل انتهاء التحميل.'
    ],
    keyTakeawaysAr: [
      'تقليل زمن استجابة الخادم (TTFB) لأقل من 600ms عبر التخزين المؤقت عند الحافة.',
      'تأجيل تحميل ملفات JavaScript غير الحرجة باستخدام defer أو التحميل الديناميكي.',
      'حجز أبعاد ثابتة للصور واللافتات لمنع القفز البصري أثناء القراءة.'
    ],
    relatedPaths: [
      '/blog/image-seo-webp-avif',
      '/articles/technical-seo-checklist-2026',
      '/features/mobile-serp-simulator'
    ]
  },
  {
    path: '/articles/internal-linking-strategy',
    slug: 'internal-linking-strategy',
    category: 'articles',
    categoryLabelAr: 'مقالات السيو المتقدمة',
    titleAr: 'استراتيجية بناء الروابط الداخلية والمجموعات العنقودية (Topic Clusters)',
    summaryAr: 'كيفية توزيع قوة الصفحات (Link Equity) وربط المقالات والصفحات العميقة لزيادة مدة بقاء الزائر والأرشفة.',
    readTimeAr: '5 دقائق قراءة',
    paragraphsAr: [
      'الروابط الداخلية هي الجسور التي ترشد عناكب جوجل والزوار بين أقسام الموقع والصفحات العميقة. الصفحات المعزولة (Orphan Pages) التي لا تشير إليها أي روابط داخلية نادراً ما تحصل على ترتيب متقدم حتى لو كانت عالية الجودة.',
      'أفضل ممارسة حديثة هي نموذج Hub & Spoke: إنشاء صفحة محورية شاملة لكل موضوع رئيسي وربطها بشكل متبادل بمقالات فرعية تفصيلية داخل نفس التصنيف الموضوعي (Silo)، وهو ما يتكامل مع استراتيجيات بناء الروابط الخلفية Backlinks ذات الجودة العالية لتعزيز ثقة محركات البحث في نطاقك.',
      'تجنب تماماً النصوص الرابطة المبهمة مثل "اضغط هنا" أو "اقرأ المزيد"، واستخدم دائماً نصوصاً وصفية غنية بالكلمات المفتاحية تعبر عن محتوى الصفحة المستهدفة.'
    ],
    keyTakeawaysAr: [
      'إدراج روابط سياقية داخل فقرات المقالات وليس الاكتفاء بروابط التذييل والقوائم.',
      'ربط الصفحات العميقة والأدوات المتخصصة من الصفحة الرئيسية والمقالات عالية السلطة.',
      'استخدام نصوص رابطة وصفية متنوعة دون حشو حرفي مكرر.'
    ],
    relatedPaths: [
      '/topics/on-page-seo',
      '/features/broken-links-checker',
      '/articles/technical-seo-checklist-2026'
    ]
  },
  {
    path: '/blog/image-seo-webp-avif',
    slug: 'image-seo-webp-avif',
    category: 'articles',
    categoryLabelAr: 'المدونة وتحسين الأداء',
    titleAr: 'تحسين سيو الصور باستخدام صيغ AVIF و WebP والنصوص البديلة الدقيقة',
    summaryAr: 'دليل عملي لتقليص حجم الصور بنسبة تتجاوز 90% دون فقدان الجودة وكسب زيارات مجانية من بحث الصور.',
    readTimeAr: '4 دقائق قراءة',
    paragraphsAr: [
      'تمثل الصور غير المضغوطة السبب الأول لبطء تحميل الصفحات واستهلاك باقة الزوار على الهواتف الذكية. التحول إلى صيغتي AVIF و WebP عبر عنصر <picture> يقلل حجم الصورة بنسبة تتراوح بين 70% و95% مقارنة بصيغ JPEG و PNG التقليدية.',
      'من جهة أخرى، تعتمد محركات البحث على سمة النص البديل <img alt="..."> لفهم موضوع الصورة وفهرستها في نتائج البحث المرئية، كما تخدم قارئات الشاشة لذوي الاحتياجات البصرية.',
      'تأكد أيضاً من استخدام loading="lazy" للصور الواقعة أسفل طية العرض الأولية لتسريع ظهور الصفحة فوراً.'
    ],
    keyTakeawaysAr: [
      'استخدام عنصر <picture> لتقديم AVIF أولاً ثم WebP مع نسخة JPG احتياطية.',
      'كتابة نص بديل alt وصفي طبيعي بين 3 إلى 8 كلمات يتضمن الكلمة المستهدفة.',
      'تعيين أبعاد width و height واضحة وتفعيل التحميل الكسول للصور السفلية.'
    ],
    relatedPaths: [
      '/articles/core-web-vitals-speed',
      '/topics/on-page-seo',
      '/features/seo-code-generator'
    ]
  },
  {
    path: '/topics/on-page-seo',
    slug: 'on-page-seo',
    category: 'topics',
    categoryLabelAr: 'التصنيفات والموضوعات التقنية',
    titleAr: 'هيكلة السيو الداخلي: ضبط وسم H1 وتدرج العناوين ووسوم الميتا',
    summaryAr: 'القواعد القياسية لكتابة عنوان Title ووصف Meta Description جاذبين للنقر وبنية عناوين واضحة لمحركات البحث.',
    readTimeAr: '4 دقائق قراءة',
    paragraphsAr: [
      'يبدأ السيو الداخلي الناجح من أول سطر يراه الباحث في صفحة النتائج: وسم العنوان (Title) بطول مثالي بين 50 و60 حرفاً، متبوعاً بوصف تعريفي (Meta Description) بين 120 و155 حرفاً يحفّز النقر (CTR).',
      'داخل الصفحة، التزم بوسم H1 واحد فقط يعبر عن المحور الرئيسي، وقسّم المحتوى بوسوم H2 للأقسام الكبرى و H3 للنقاط التفصيلية ليسهل على القارئ وزاحف جوجل مسح الصفحة بسرعة.',
      'حافظ على نسبة نصية جيدة مقارنة بشيفرة HTML، ووزّع الكلمات المفتاحية ومرادفاتها الدلالية (LSI) بانسيابية طبيعية في الفقرات الأولى.'
    ],
    keyTakeawaysAr: [
      'وسم H1 وحيد في قمة المقال يضم الكلمة المفتاحية الأساسية.',
      'عدم تكرار العناوين والأوصاف التعريفية بين صفحات الموقع المختلفة.',
      'كتابة محتوى بشري غني يجيب مباشرة على نية الباحث.'
    ],
    relatedPaths: [
      '/articles/internal-linking-strategy',
      '/features/seo-code-generator',
      '/topics/schema-structured-data'
    ]
  },
  {
    path: '/topics/schema-structured-data',
    slug: 'schema-structured-data',
    category: 'topics',
    categoryLabelAr: 'التصنيفات والموضوعات التقنية',
    titleAr: 'البيانات المنظمة Schema.org JSON-LD والحصول على المقتطفات المميزة',
    summaryAr: 'كيف تساعد مخططات FAQPage و Article و Product موقعك على الظهور بنجوم التقييم والأسئلة المنسدلة في جوجل.',
    readTimeAr: '4 دقائق قراءة',
    paragraphsAr: [
      'البيانات المنظمة بصيغة JSON-LD هي لغة التخاطب الدقيقة مع محركات البحث، حيث تشرح لخوارزميات جوجل نوع الصفحة سواء كانت مقالاً، متجراً، منتجاً، أو قائمة أسئلة شائعة (FAQPage).',
      'إضافة مخطط صحيح وخالٍ من الأخطاء البرمجية تمنح نتيجتك في البحث مساحة أكبر وتفاصيل مرئية مميزة (Rich Results) مما يرفع نسبة النقر إلى الظهور بشكل ملموس.',
      'يوفّر فاحص راصد سيو مدققاً فورياً لقراءة كافة مخططات JSON-LD في موقعك واكتشاف الحقول الناقصة وتوليد بدائل جاهزة.'
    ],
    keyTakeawaysAr: [
      'اعتماد صيغة JSON-LD داخل <head> لأنها الموصى بها رسمياً من جوجل.',
      'مطابقة البيانات المنظمة مع المحتوى المرئي الفعلي داخل الصفحة.',
      'التحقق الدوري من صلاحية المخططات عبر أداة فحص السكيما.'
    ],
    relatedPaths: [
      '/features/seo-code-generator',
      '/articles/technical-seo-checklist-2026',
      '/topics/on-page-seo'
    ]
  },
  {
    path: '/topics/security-headers-csp',
    slug: 'security-headers-csp',
    category: 'topics',
    categoryLabelAr: 'التصنيفات والموضوعات التقنية',
    titleAr: 'أمان المواقع وترويسات HTTP: سياسة CSP و HSTS وحماية الزوار',
    summaryAr: 'أهمية تفعيل ترويسات Content-Security-Policy و Strict-Transport-Security في حماية الموقع وتعزيز ثقة جوجل.',
    readTimeAr: '4 دقائق قراءة',
    paragraphsAr: [
      'الأمان الرقمي عامل ترتيب رسمي لدى محركات البحث. تضمن ترويسة Content-Security-Policy (CSP) منع تشغيل أي سكربتات حقن خبيثة (XSS) بتحديد المصادر الموثوقة للسكربتات والخطوط والاتصالات بدقة.',
      'كما تمنع ترويسة Strict-Transport-Security (HSTS) محاولات اختطاف الاتصال والعودة إلى HTTP غير المشفر، بينما تحمي X-Frame-Options و frame-ancestors من هجمات خطف النقرات (Clickjacking).',
      'تأكّد من ضبط هذه الترويسات على مستوى الخادم أو ملف إعدادات الاستضافة مثل vercel.json أو Nginx.'
    ],
    keyTakeawaysAr: [
      'تجنب السماح بـ unsafe-inline و unsafe-eval داخل توجيه script-src في CSP.',
      'تفعيل X-Content-Type-Options: nosniff و Referrer-Policy لحماية خصوصية الزوار.',
      'اختبار الترويسات بشكل دوري بعد كل تحديث في البنية الخلفية.'
    ],
    relatedPaths: [
      '/articles/technical-seo-checklist-2026',
      '/features/broken-links-checker',
      '/articles/core-web-vitals-speed'
    ]
  }
];

export const DEEP_PAGE_ACTION_PATHS: Record<string, { sectionId?: string; modalPage?: 'about' | 'privacy' | 'terms' | 'contact' | 'disclaimer' | 'help'; labelAr: string }> = {
  '/': { labelAr: 'الرئيسية' },
  '/articles/how-rasidseo-works': { sectionId: 'how-it-works-section', labelAr: 'كيف يعمل راصد سيو' },
  '/features/seo-code-generator': { sectionId: 'tools-section', labelAr: 'مولد أكواد السيو' },
  '/features/broken-links-checker': { sectionId: 'results-section', labelAr: 'فاحص الروابط المعطلة' },
  '/features/mobile-serp-simulator': { sectionId: 'results-section', labelAr: 'محاكي البحث والجوال' },
  '/faq': { sectionId: 'faq-section', labelAr: 'الأسئلة الشائعة' },
  '/about': { modalPage: 'about', labelAr: 'من نحن' },
  '/privacy': { modalPage: 'privacy', labelAr: 'سياسة الخصوصية' },
  '/terms': { modalPage: 'terms', labelAr: 'شروط الخدمة' },
  '/contact': { modalPage: 'contact', labelAr: 'اتصل بنا' },
  '/help': { modalPage: 'help', labelAr: 'مركز المساعدة' },
  '/disclaimer': { modalPage: 'disclaimer', labelAr: 'إخلاء مسؤولية' }
};

export function dispatchDeepNavigation(path: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('rasid-deep-navigate', { detail: { path } }));
}
