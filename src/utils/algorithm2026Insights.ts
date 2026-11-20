import { AuditItem } from '../types/seo';

export type RankingWeightType =
  | 'critical_direct' // عامل ترتيب مباشر وحاسم
  | 'direct_ranking' // عامل ترتيب مباشر
  | 'eligibility_indexing' // معيار أهلية للفهرسة والنتائج الغنية
  | 'user_experience' // معيار تجربة المستخدم ومؤشرات الويب الأساسية
  | 'trust_eeat'; // إشارات الثقة والخبرة E-E-A-T

export interface Algorithm2026Insight {
  keyPattern: string;
  topicAr: string;
  rankingWeight: RankingWeightType;
  rankingWeightLabelAr: string;
  rankingWeightColor: 'rose' | 'amber' | 'indigo' | 'emerald' | 'cyan';
  importance2026Ar: string;
  algorithmUpdateNameAr: string;
  rankingImpactExplanationAr: string;
  aiOverviewImpactAr: string;
  proTip2026Ar: string;
}

export const ALGORITHM_2026_DATABASE: Record<string, Algorithm2026Insight> = {
  title: {
    keyPattern: 'title',
    topicAr: 'وسم العنوان الرئيسي (Title Tag)',
    rankingWeight: 'critical_direct',
    rankingWeightLabelAr: 'عامل ترتيب مباشر وحاسم (Rank Factor #1)',
    rankingWeightColor: 'rose',
    importance2026Ar:
      'يظل وسم العنوان أقوى إشارة دلالية مباشرة يعتمد عليها نموذج Gemini ومحرك Google لفهم موضوع الصفحة وتوليد عناوين نتائج البحث.',
    algorithmUpdateNameAr: 'تحديث Google Search Core & Semantic Reranking 2026',
    rankingImpactExplanationAr:
      'تطابق الكلمة المفتاحية في العنوان يرفع فرصة التصدر بنسبة 35%، بينما العناوين المضللة أو شديدة الطول يتم استبدالها تلقائياً بواسطة خوارزميات جوجل من نصوص H1.',
    aiOverviewImpactAr:
      'العناوين الواضحة ذات النوايا الدقيقة (High-Intent) هي المرجع الأول لاقتباس الصفحة في ملخصات الذكاء الاصطناعي (AI Overviews).',
    proTip2026Ar:
      'ضع الكلمة المفتاحية في أول 30 حرفاً واجعل العنوان بين 50-60 حرفاً بصيغة طبيعية تعبر عن نية البحث دون حشو.'
  },

  meta_description: {
    keyPattern: 'meta_description',
    topicAr: 'الوصف التعريفي (Meta Description)',
    rankingWeight: 'eligibility_indexing',
    rankingWeightLabelAr: 'عامل غير مباشر عبر نسبة النقر (CTR Optimizer)',
    rankingWeightColor: 'indigo',
    importance2026Ar:
      'رغم أنه ليس عامل ترتيب خوارزمي مباشر، إلا أنه المحرك الأول لرفع معدل النقر الطبيعي (Organic CTR) الذي تراقبه خوارزميات RankBrain.',
    algorithmUpdateNameAr: 'تحديث Google Snippet Generation & Intent Match 2026',
    rankingImpactExplanationAr:
      'الوصف الجذاب يرفع معدل النقر بنسبة تتجاوز 28%؛ وفي حال كان الوصف مفقوداً أو غير ملائم، تستخلص جوجل جملاً عشوائية قد تُنفر الزوار.',
    aiOverviewImpactAr:
      'يستخدمه روبوت الذكاء الاصطناعي لتأكيد سياق الصفحة واستخراج الكبسولة التلخيصية التمهيدية.',
    proTip2026Ar:
      'اكتب الوصف بين 135 و 160 حرفاً، وضمنه دعوة لاتخاذ إجراء (CTA) وقيمة فريدة يجدها القارئ داخل المقال.'
  },

  h1: {
    keyPattern: 'h1',
    topicAr: 'بنية ترويسة H1 الرئيسية',
    rankingWeight: 'direct_ranking',
    rankingWeightLabelAr: 'عامل دلالي مباشر وهيكلة المحتوى',
    rankingWeightColor: 'amber',
    importance2026Ar:
      'ترويسة H1 تحدد المحور الرئيسي للوثيقة بالنسبة لخوارزميات Passage Ranking وGemini Multi-Modal Indexing.',
    algorithmUpdateNameAr: 'تحديث Google Helpful Content & Document Hierarchy 2026',
    rankingImpactExplanationAr:
      'وجود H1 واحد وواضح يمنع تشتت الزاحف؛ تعدد وسوم H1 في نفس الصفحة يخفض وزن الكلمات المفتاحية الرئيسية ويضعف ترتيب الصفحة.',
    aiOverviewImpactAr:
      'تعتمد كبسولات AI Overviews على وسم H1 كعنوان فقرة رئيسي عند استخلاص الإجابات المباشرة.',
    proTip2026Ar:
      'تأكد من وجود H1 وحيد لكل صفحة يعبر بدقة عن محتوى المقال ويحتوي على الكلمة الرئيسية للموضوع.'
  },

  canonical: {
    keyPattern: 'canonical',
    topicAr: 'الرابط القانوني المعتمد (Canonical Tag)',
    rankingWeight: 'critical_direct',
    rankingWeightLabelAr: 'معيار حاسم لمنع ازدواجية المحتوى (Deduplication)',
    rankingWeightColor: 'rose',
    importance2026Ar:
      'يمنع تشتت سلطة الصفحة (PageRank) ويوجه زواحف جوجل للنسخة الأصلية عند وجود روابط متشابهة أو معلمات تتبع (UTM/Sorting).',
    algorithmUpdateNameAr: 'تحديث Google Indexing & Duplicate Content Consolidation 2026',
    rankingImpactExplanationAr:
      'غياب أو خطأ وسم Canonical يوزع قوة الروابط على نسخ مكررة ويهدر ميزانية الزحف وقد يؤدي لاستبعاد الصفحة من الفهرس الرئيسي.',
    aiOverviewImpactAr:
      'يضمن إسناد الإجابة المولدة بالذكاء الاصطناعي للمصدر الأصلي وليس لنسخة مكررة أو صفحة فرز.',
    proTip2026Ar:
      'استخدم دائماً روابط ذاتية (Self-Referencing Canonical) مطلقة مع بروتوكول HTTPS الكامل (https://).'
  },

  ssl: {
    keyPattern: 'ssl',
    topicAr: 'أمان وتشفير الموقع (HTTPS / SSL)',
    rankingWeight: 'critical_direct',
    rankingWeightLabelAr: 'عامل ترتيب وأمان حتمي (Security Baseline)',
    rankingWeightColor: 'rose',
    importance2026Ar:
      'تعتبر جوجل شهادة HTTPS شرطاً إلزامياً لأي صفحة مؤهلة للظهور في الصفحة الأولى؛ المواقع غير الآمنة تُحجب بتنبيهات متصفح Chrome.',
    algorithmUpdateNameAr: 'معايير أمان الويب وخوارزمية Page Experience 2026',
    rankingImpactExplanationAr:
      'المواقع التي تعمل بـ HTTP بدون تشفير تتعرض لتراجع فوري بنسبة 100% في الكلمات التنافسية، مع فقدان ثقة الزوار والـ Backlinks.',
    aiOverviewImpactAr:
      'يستبعد نظام Google AI Overviews المواقع غير المؤمنة تلقائياً من قائمة المصادر المقترحة للباحثين.',
    proTip2026Ar:
      'فعل إعادة التوجيه التلقائي 301 من HTTP إلى HTTPS، واستخدم بروتوكول TLS 1.3 مع شهادة سارية المفعول.'
  },

  robots: {
    keyPattern: 'robots',
    topicAr: 'توجيهات الزحف وملف robots.txt',
    rankingWeight: 'critical_direct',
    rankingWeightLabelAr: 'بوابة الفهرسة والزحف الأساسية (Crawl Prerequisite)',
    rankingWeightColor: 'rose',
    importance2026Ar:
      'يحدد هذا المعيار ما إذا كان مسموحاً لـ Googlebot بالدخول لموقعك وتنزيل ملفات الـ CSS والـ JS اللازمة للريندر.',
    algorithmUpdateNameAr: 'تحديث خوارزمية Googlebot Crawl Efficiency 2026',
    rankingImpactExplanationAr:
      'حظر الزحف عبر robots.txt أو وسم noindex يحجب الصفحة بالكامل من نتائج البحث مهما كانت جودة المحتوى (كارثة سيو كاملة).',
    aiOverviewImpactAr:
      'حظر جوجل من زحف ملفات الـ JS يمنع محرك Gemini من فهم المحتوى الديناميكي ويقصي الصفحة من نتائج الذكاء الاصطناعي.',
    proTip2026Ar:
      'تأكد من عدم حظر مجلدات الأصول البرمجية (/assets, /js, /css) واسمح لـ Googlebot بزحف الروابط العامة بسلاسة.'
  },

  sitemap: {
    keyPattern: 'sitemap',
    topicAr: 'خريطة الموقع البرمجية (sitemap.xml)',
    rankingWeight: 'eligibility_indexing',
    rankingWeightLabelAr: 'تسريع اكتشاف الصفحات وميزانية الزحف',
    rankingWeightColor: 'cyan',
    importance2026Ar:
      'الخريطة المحدثة هي أسرع وسيلة لإخطار جوجل بتعديلات المحتوى والصفحات الجديدة وتاريخ آخر تعديل (lastmod).',
    algorithmUpdateNameAr: 'معايير Google Lastmod & Freshness Indexing 2026',
    rankingImpactExplanationAr:
      'تساعد محرك البحث في تخصيص ميزانية الزحف للصفحات الأحدث، وترفع سرعة فهرسة المقالات الجديدة من أيام إلى ساعات.',
    aiOverviewImpactAr:
      'المحتوى الطازج المؤكد عبر sitemap.xml يحظى بأولوية قصوى في الـ Real-Time AI Search Results.',
    proTip2026Ar:
      'احرص على أتمتة خريطة الموقع وتحديث وسم <lastmod> بدقة عند تعديل المحتوى، وقدمها مباشرة في Google Search Console.'
  },

  broken_links: {
    keyPattern: 'broken',
    topicAr: 'سلامة الروابط وتجنب أخطاء 404',
    rankingWeight: 'user_experience',
    rankingWeightLabelAr: 'إشارة جودة وتجربة مستخدم (Quality Score)',
    rankingWeightColor: 'amber',
    importance2026Ar:
      'كثرة الروابط المعطلة تعطي إشارة لخوارزميات الجودة بأن الموقع مهمل وغير محدث، وتهدر ميزانية الزحف.',
    algorithmUpdateNameAr: 'تحديث Google Helpful Content & Quality Evaluator 2026',
    rankingImpactExplanationAr:
      'تحويل مسار الزائر لصفحة 404 يزيد معدل الارتداد (Bounce Rate) ويقلل وقت البقاء (Dwell Time)، مما يؤدي لتراجع تدريجي في الترتيب.',
    aiOverviewImpactAr:
      'إذا احتوت صفحتك على روابط مصادر خارجية معطلة، يصنفها محرك البحث كمعلومات قديمة غير موثوقة.',
    proTip2026Ar:
      'أصلح الروابط المعطلة فوراً بتحويلها إلى مصادر بديلة نشطة أو استخدام تحويل 301 دائم للروابط الداخلية المنقولة.'
  },

  image_alt: {
    keyPattern: 'alt',
    topicAr: 'النصوص البديلة للصور (Image Alt Tags)',
    rankingWeight: 'direct_ranking',
    rankingWeightLabelAr: 'عامل سيو الصور وإمكانية الوصول (Accessibility & Visual Search)',
    rankingWeightColor: 'emerald',
    importance2026Ar:
      'يستخدمها محرك بحث جوجل لفهم موضوع الصور وأرشفتها في بحث الصور وتغذية خوارزميات Google Lens وMultimodal Search.',
    algorithmUpdateNameAr: 'تحديث Google Visual Search & Multimodal AI 2026',
    rankingImpactExplanationAr:
      'نصوص Alt الدلالية تمكن الصور من جلب آلاف الزيارات المجانية من بحث صور جوجل وترفع التوافق مع معايير ADA وWCAG.',
    aiOverviewImpactAr:
      'الصور ذات النصوص البديلة الواضحة يتم تضمينها داخل إجابات الذكاء الاصطناعي التفاعلية كإيضاحات بصرية.',
    proTip2026Ar:
      'صف المشهد بدقة في نص الـ alt مع تضمين كلمة مفتاحية بصورة طبيعية (مثل: "مخطط بياني يوضح خطوات سيو 2026").'
  },

  word_count: {
    keyPattern: 'word_count',
    topicAr: 'عمق المحتوى وكثافة الكلمات',
    rankingWeight: 'trust_eeat',
    rankingWeightLabelAr: 'مؤشر تغطية الموضوع (Topic Authority & E-E-A-T)',
    rankingWeightColor: 'emerald',
    importance2026Ar:
      'جوجل في 2026 لا تفضل المقالات القصيرة السطحية (Thin Content) التي تفشل في الإجابة الشاملة على استفسار الباحث.',
    algorithmUpdateNameAr: 'تحديث Google Helpful Content & Information Gain 2026',
    rankingImpactExplanationAr:
      'المحتوى العميق والمتكامل يستهدف مئات الكلمات الدلالية الثانوية (LSI Keywords) ويحصل على ضعف الروابط الخلفية الطبيعية.',
    aiOverviewImpactAr:
      'المقالات المتعمقة التي تقدم "مكاسب معلوماتية إضافية" (Information Gain) هي المرشح الأول لاقتباس إجابات AI Overviews.',
    proTip2026Ar:
      'احرص على ألا يقل المحتوى عن 600-1200 كلمة حسب نوع الصفحة، مع تغطية كافة الأسئلة المتفرعة وجداول المقارنة.'
  },

  keyword_density: {
    keyPattern: 'keyword',
    topicAr: 'توزيع الكلمات المفتاحية ومكافحة الحشو',
    rankingWeight: 'direct_ranking',
    rankingWeightLabelAr: 'سلامة السيو ومكافحة السلوك المضلل (Anti-Spam)',
    rankingWeightColor: 'amber',
    importance2026Ar:
      'خوارزميات معالجة اللغة الطبيعية (NLP) في جوجل تفهم المرادفات والسياق الدلالي؛ حشو الكلمات ممارسة قديمة تسبب عقوبات فورية.',
    algorithmUpdateNameAr: 'تحديث خوارزميات مكافحة السبام Google SpamBrain 2026',
    rankingImpactExplanationAr:
      'الكثافة المثلى (1% - 2.5%) تؤكد موضوعية المقال، بينما تجاوز 3.5% يعرض الصفحة لعقوبة انخفاض الترتيب بتهمة Keyword Stuffing.',
    aiOverviewImpactAr:
      'نماذج الذكاء الاصطناعي تفضل المقالات المكتوبة بلغة بشرية انسيابية وتستبعد النصوص المحشوة آلياً.',
    proTip2026Ar:
      'استخدم مرادفات لغوية وتعبيرات LSI بدلاً من تكرار نفس الكلمة الحرفية في كل جملة.'
  },

  internal_linking: {
    keyPattern: 'internal_link',
    topicAr: 'بنية الروابط الداخلية وتدفق PageRank',
    rankingWeight: 'critical_direct',
    rankingWeightLabelAr: 'عامل ترتيب وتوزيع سلطة الموقع (Link Equity)',
    rankingWeightColor: 'rose',
    importance2026Ar:
      'الروابط الداخلية هي الطريقة التي يوزع بها موقعك قوة الدومين وسلطة الروابط الخارجية على كافة المقالات والصفحات العميقة.',
    algorithmUpdateNameAr: 'تحديث Google PageRank & Topical Authority Clusters 2026',
    rankingImpactExplanationAr:
      'ربط المقالات ذات الصلة ببعضها ينشئ "مجموعات موضوعية" (Topic Clusters) تجعل جوجل يصنف موقعك كمرجع ومصدر موثوق في مجاله.',
    aiOverviewImpactAr:
      'الصفحات المدعومة بروابط داخلية سياقية ذات نصوص Anchor دلالية تكتسب ثقة أعلى لدى روبوت الذكاء الاصطناعي.',
    proTip2026Ar:
      'أضف 3-5 روابط داخلية في كل مقال بنصوص Anchor دلالية واضحة تشرح سياق الصفحة المستهدفة.'
  },

  schema: {
    keyPattern: 'schema',
    topicAr: 'البيانات المنظمة (Schema.org JSON-LD)',
    rankingWeight: 'eligibility_indexing',
    rankingWeightLabelAr: 'معيار أهلية للنتائج الغنية (Rich Results & AI Overviews)',
    rankingWeightColor: 'cyan',
    importance2026Ar:
      'تمنح خوارزميات البحث فهماً برمجياً مباشراً لنوع المحتوى (مقال، منتج، تقييم، سؤال وجواب، مؤلف، منظمة) دون الحاجة للتخمين.',
    algorithmUpdateNameAr: 'معايير Google Entity Search & Structured Data 2026',
    rankingImpactExplanationAr:
      'تفعيل Schema الصحيحة يمنح موقعك نتائج بصرية بارزة (نجوم التقييم، الأسعار، الأسئلة الشائعة) مما يرفع نسبة النقر CTR بنسبة تصل إلى 40%.',
    aiOverviewImpactAr:
      'محرك Gemini يعتمد على بيانات Schema كحقائق ثابتة وموثقة (Facts Grounding) عند بناء الإجابات المباشرة للباحثين.',
    proTip2026Ar:
      'استخدم ترميز JSON-LD المعياري وتأكد من خلوه من الأخطاء الهيكلية عبر فاحص Schema المدمج في التطبيق.'
  },

  ttfb: {
    keyPattern: 'ttfb',
    topicAr: 'زمن أول بايت واستجابة السيرفر (TTFB)',
    rankingWeight: 'user_experience',
    rankingWeightLabelAr: 'مؤشر كفاءة الاستضافة وميزانية الزحف',
    rankingWeightColor: 'amber',
    importance2026Ar:
      'سرعة استجابة السيرفر تحدد كمية الصفحات التي تستطيع عناكب جوجل زحفها في اليوم الواحد (Crawl Budget).',
    algorithmUpdateNameAr: 'معايير Core Web Vitals & Server Performance 2026',
    rankingImpactExplanationAr:
      'ارتفاع TTFB لأكثر من 800ms يؤخر تحميل كافة عناصر الصفحة ويؤثر سلباً على مؤشرات LCP وINP، مما يخفض نقاط تجربة الصفحة.',
    aiOverviewImpactAr:
      'الخوادم السريعة توفر بيانات فورية لعناكب البحث في أوقات التحديثات المباشرة.',
    proTip2026Ar:
      'استخدم شبكة توصيل محتوى (Cloudflare/Fastly CDN) مع تفعيل التخزين المؤقت للصفحات وتحديث إصدار PHP/Node.js.'
  },

  cwv: {
    keyPattern: 'cwv',
    topicAr: 'مؤشرات تجربة الويب الأساسية (Core Web Vitals - LCP/CLS/INP)',
    rankingWeight: 'critical_direct',
    rankingWeightLabelAr: 'عامل ترتيب تجربة الصفحة الرسمي (Page Experience Signal)',
    rankingWeightColor: 'rose',
    importance2026Ar:
      'معيار الترتيب الرسمي لتجربة الصفحة لدى جوجل؛ يركز عام 2026 بشدة على سرعة التحميل (LCP) واستقرار العناصر (CLS) والتفاعل اللحظي (INP).',
    algorithmUpdateNameAr: 'تحديث Google Core Web Vitals & INP Benchmark 2026',
    rankingImpactExplanationAr:
      'المواقع التي تحقق مؤشرات خضراء (Good) تتفوق على منافسيها في الكلمات المتكافئة بنسبة 24% في سرعة الترتيب.',
    aiOverviewImpactAr:
      'جوجل تعطي الأولوية للمواقع السريعة والمستقرة لتوصية المستخدمين بها عبر الهواتف الذكية.',
    proTip2026Ar:
      'حافظ على LCP أقل من 2.5 ثانية، وCLS أقل من 0.1، وتجنب السكربتات التي تعيق مؤشر تفاعل الإدخال INP.'
  },

  security_headers: {
    keyPattern: 'security',
    topicAr: 'ترويسات الأمان المتقدمة (CSP & HSTS)',
    rankingWeight: 'trust_eeat',
    rankingWeightLabelAr: 'معيار سلامة البنية التحتية وحماية الزوار',
    rankingWeightColor: 'indigo',
    importance2026Ar:
      'تحمي المستخدمين من هجمات حقن السكربتات (XSS) وسرقة البيانات؛ جوجل تراقب سلامة الدومين وخلوه من الثغرات الأمنية.',
    algorithmUpdateNameAr: 'معايير أمان المتصفحات ومكافحة البرمجيات الخبيثة 2026',
    rankingImpactExplanationAr:
      'المواقع التي تُخترق أو تفتقر للحماية تصنفها جوجل كمواقع ضارة (Malicious) وتضع تحذيراً أحمر يحجب 99% من الزوار.',
    aiOverviewImpactAr:
      'الأنظمة الذكية تتجنب الاستشهاد بالمواقع غير المحمية بترويسات CSP خوفاً من تضمين روابط خبيثة.',
    proTip2026Ar:
      'أضف ترويسات Content-Security-Policy وStrict-Transport-Security على مستوى خادم الويب (Nginx/Apache).'
  },

  opengraph: {
    keyPattern: 'opengraph',
    topicAr: 'وسوم المشاركة الاجتماعية (OpenGraph & Twitter Cards)',
    rankingWeight: 'eligibility_indexing',
    rankingWeightLabelAr: 'عامل إشارات النقر غير المباشر (Social Referral Signals)',
    rankingWeightColor: 'indigo',
    importance2026Ar:
      'تتحكم في شكل الرابط والصورة الترويجية عند مشاركته على شبكات التواصل (فيسبوك، منصة X، واتساب، لينكد إن).',
    algorithmUpdateNameAr: 'تحديث Social Signals & Entity Brand Verification 2026',
    rankingImpactExplanationAr:
      'ظهور كرت احترافي يضاعف زيارات المشاركات الاجتماعية التي تعزز الـ Brand Search وشعبية الموقع أمام جوجل.',
    aiOverviewImpactAr:
      'تعتمد منصات البحث الاجتماعي وتطبيقات الذكاء الاصطناعي على وسوم OG لاستخراج الصور الترويجية للمصادر.',
    proTip2026Ar:
      'حدد دائماً og:image بدقة 1200x630 بكسل مع عنوان og:title مشوق لا يتجاوز 65 حرفاً.'
  },

  viewport: {
    keyPattern: 'viewport',
    topicAr: 'التوافق التام مع شاشات الهواتف (Mobile Viewport)',
    rankingWeight: 'critical_direct',
    rankingWeightLabelAr: 'شرط الفهرسة المتنقلة الحاسم (Mobile-First Indexing)',
    rankingWeightColor: 'rose',
    importance2026Ar:
      'جوجل تزحف وتصنف 100% من مواقع الويب عبر نسخة الهاتف الذكي (Smartphone Crawler). عدم وجود viewport يعني فشل الصفحة بالكامل.',
    algorithmUpdateNameAr: 'معايير Google Mobile-Only Indexing Mandate 2026',
    rankingImpactExplanationAr:
      'الصفحات التي لا تتجاوب مع شاشات الهواتف تفقد أهليتها للظهور في نتائج البحث على الأجهزة الذكية التي تمثل 75% من عمليات البحث.',
    aiOverviewImpactAr:
      'يتم تقييم تجربة المستخدم وقابلية القراءة على الهاتف كمعيار أساسي قبل اقتباس الموقع في بحث الذكاء الاصطناعي.',
    proTip2026Ar:
      'استخدم وسم <meta name="viewport" content="width=device-width, initial-scale=1.0"> مع أزرار لمس مريحة لا تقل عن 48px.'
  }
};

/**
 * Returns the relevant 2026 Algorithm Insight for an AuditItem based on its ID or category
 */
export function getAlgorithmInsightForItem(item: AuditItem): Algorithm2026Insight {
  const id = item.id.toLowerCase();
  const cat = item.category?.toLowerCase() || '';

  // Direct ID keyword matches
  if (id.includes('title')) return ALGORITHM_2026_DATABASE.title;
  if (id.includes('meta_description') || id.includes('description')) return ALGORITHM_2026_DATABASE.meta_description;
  if (id.includes('h1')) return ALGORITHM_2026_DATABASE.h1;
  if (id.includes('canonical')) return ALGORITHM_2026_DATABASE.canonical;
  if (id.includes('ssl') || id.includes('https')) return ALGORITHM_2026_DATABASE.ssl;
  if (id.includes('robots')) return ALGORITHM_2026_DATABASE.robots;
  if (id.includes('sitemap')) return ALGORITHM_2026_DATABASE.sitemap;
  if (id.includes('broken')) return ALGORITHM_2026_DATABASE.broken_links;
  if (id.includes('alt') || id.includes('image')) return ALGORITHM_2026_DATABASE.image_alt;
  if (id.includes('word') || id.includes('content_length')) return ALGORITHM_2026_DATABASE.word_count;
  if (id.includes('keyword') || id.includes('density') || id.includes('stuffing')) return ALGORITHM_2026_DATABASE.keyword_density;
  if (id.includes('internal_link') || id.includes('linking')) return ALGORITHM_2026_DATABASE.internal_linking;
  if (id.includes('schema') || id.includes('jsonld')) return ALGORITHM_2026_DATABASE.schema;
  if (id.includes('ttfb') || id.includes('speed') || id.includes('load')) return ALGORITHM_2026_DATABASE.ttfb;
  if (id.includes('cwv') || id.includes('lcp') || id.includes('cls') || id.includes('inp') || id.includes('fid')) return ALGORITHM_2026_DATABASE.cwv;
  if (id.includes('csp') || id.includes('hsts') || id.includes('security_headers')) return ALGORITHM_2026_DATABASE.security_headers;
  if (id.includes('opengraph') || id.includes('og') || id.includes('twitter') || id.includes('social')) return ALGORITHM_2026_DATABASE.opengraph;
  if (id.includes('viewport') || id.includes('mobile')) return ALGORITHM_2026_DATABASE.viewport;

  // Category based fallbacks
  if (cat === 'security') return ALGORITHM_2026_DATABASE.security_headers;
  if (cat === 'performance') return ALGORITHM_2026_DATABASE.cwv;
  if (cat === 'social') return ALGORITHM_2026_DATABASE.schema;
  if (cat === 'content') return ALGORITHM_2026_DATABASE.word_count;
  if (cat === 'technical') return ALGORITHM_2026_DATABASE.robots;

  // Default fallback
  return {
    keyPattern: 'general',
    topicAr: item.titleAr,
    rankingWeight: item.impactAr === 'حرج' ? 'critical_direct' : item.impactAr === 'متوسط' ? 'direct_ranking' : 'eligibility_indexing',
    rankingWeightLabelAr:
      item.impactAr === 'حرج'
        ? 'عامل جودة مباشر وحاسم (2026 Critical Metric)'
        : item.impactAr === 'متوسط'
        ? 'عامل ترتيب استراتيجي (Strategic Ranking Signal)'
        : 'تحسين إضافي لتجربة البحث (Refinement Signal)',
    rankingWeightColor: item.impactAr === 'حرج' ? 'rose' : item.impactAr === 'متوسط' ? 'amber' : 'indigo',
    importance2026Ar: `يؤثر معيار "${item.titleAr}" بشكل مباشر على تقييم جودة الصفحة في خوارزميات البحث الحديثة لعام 2026.`,
    algorithmUpdateNameAr: 'تحديثات خوارزميات جوجل وتجربة الصفحة 2026 (Google Core & Quality Systems)',
    rankingImpactExplanationAr: item.descriptionAr || 'تحقيق هذا المعيار يرفع من ثقة محرك البحث في موقعك ويعزز ترتيب الكلمات التنافسية.',
    aiOverviewImpactAr: 'يساهم هذا المعيار في تعزيز مصداقية المحتوى وضمان ظهوره في إجابات محركات البحث المعتمدة على الذكاء الاصطناعي.',
    proTip2026Ar: item.fixGuideAr || 'راجع الإرشادات البرمجية الموصى بها وطبق الإصلاح بصورة قياسية متوافقة مع توجيهات جوجل الرسمية.'
  };
}
