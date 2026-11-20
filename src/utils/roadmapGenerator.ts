import {
  AuditItem,
  RoadmapPhase,
  RoadmapPhaseId,
  RoadmapTask,
  RoadmapTaskPriority,
  RoadmapTaskDifficulty,
  SeoRoadmapPlan
} from '../types/seo.js';

interface GenerateRoadmapParams {
  url: string;
  overallScore: number;
  items: AuditItem[];
  siteName?: string;
  focusPrompt?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  timeBudgetHoursPerWeek?: number;
}

/**
 * Generates an intelligent, deterministic 30-day step-by-step SEO execution roadmap
 * based on pending checklist items (errors and warnings), category deficits, and best practices.
 */
export function generateSeoRoadmapPlan({
  url,
  overallScore,
  items,
  focusPrompt = '',
}: GenerateRoadmapParams): SeoRoadmapPlan {
  let domain = 'website';
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url.replace(/^https?:\/\//, '').split('/')[0] || 'website';
  }

  // Filter pending audit items
  const pendingItems = items.filter((item) => item.status !== 'pass');
  const errorItems = pendingItems.filter((item) => item.status === 'error');
  const warningItems = pendingItems.filter((item) => item.status === 'warning');

  // Categorize pending items into the 4 roadmap phases
  const phase1Tasks: RoadmapTask[] = [];
  const phase2Tasks: RoadmapTask[] = [];
  const phase3Tasks: RoadmapTask[] = [];
  const phase4Tasks: RoadmapTask[] = [];

  // Helper to construct a task from an audit item
  const createTaskFromAuditItem = (
    item: AuditItem,
    phaseId: RoadmapPhaseId,
    weekNumber: number,
    dayNumber: number,
    customPriority?: RoadmapTaskPriority,
    customMinutes?: number
  ): RoadmapTask => {
    const isError = item.status === 'error';
    const priority: RoadmapTaskPriority =
      customPriority || (isError ? 'critical' : item.impactAr === 'حرج' ? 'high' : 'medium');

    const difficulty: RoadmapTaskDifficulty =
      item.category === 'performance' ? (isError ? 'hard' : 'medium') :
      item.category === 'technical' ? (isError ? 'medium' : 'easy') :
      'easy';

    const estimatedMinutes = customMinutes || (
      difficulty === 'hard' ? 90 :
      difficulty === 'medium' ? 45 :
      25
    );

    // Generate logical sub-steps based on fixGuideAr
    const subSteps = [
      {
        id: `${item.id}-step-1`,
        textAr: `تحديد موضع المشكلة في الصفحة أو إعدادات السيرفر: ${item.currentValue || item.titleAr}`,
        done: false
      },
      {
        id: `${item.id}-step-2`,
        textAr: item.fixGuideAr || `تطبيق الإصلاح المقترح للوصول للقيمة المثالية (${item.idealValue || 'مطابقة معايير السيو'})`,
        done: false
      },
      {
        id: `${item.id}-step-3`,
        textAr: 'إعادة الفحص والتحقق من تطبيق التغييرات واختفاء التحذير',
        done: false
      }
    ];

    let whyThisDayAr = '';
    if (phaseId === 'phase_1') {
      whyThisDayAr = 'عائق حرج يمنع أو يعطل فهرسة محركات البحث وظهور الصفحة في نتائج البحث الأولى، ويجب حله فوراً قبل أي عمل آخر.';
    } else if (phaseId === 'phase_2') {
      whyThisDayAr = 'عنصر بنيوي مباشر يحدد كيفية فهم خوارزميات جوجل لمحتوى الصفحة وسياقها الدلالي ومعدل النقر (CTR).';
    } else if (phaseId === 'phase_3') {
      whyThisDayAr = 'يؤثر مباشرة على تجربة المستخدم وسرعة التحميل ومؤشرات Core Web Vitals التي يعتمدها جوجل في ترتيب النتائج.';
    } else {
      whyThisDayAr = 'خطوة استراتيجية لتوزيع قوة الروابط، سد فجوات المحتوى، وبناء سلطة موضوعية مستدامة على المدى الطويل.';
    }

    return {
      id: `task-${item.id}`,
      phaseId,
      dayNumber,
      weekNumber,
      titleAr: `إصلاح: ${item.titleAr}`,
      descriptionAr: item.descriptionAr,
      category: item.category,
      priority,
      difficulty,
      estimatedMinutes,
      whyThisDayAr,
      expectedImpactAr: `تحسين معيار ${item.titleAr} ورفع تقييم قسم ${item.category} بمقدار +${Math.round((100 - item.score) * 0.4)} نقطة`,
      subSteps,
      codeSnippet: item.codeSnippet,
      originalAuditItemId: item.id,
      status: 'todo'
    };
  };

  // Map pending items based on category and severity
  pendingItems.forEach((item) => {
    if (
      item.category === 'security' ||
      (item.category === 'technical' && (item.id.includes('index') || item.id.includes('robots') || item.id.includes('canonical') || item.id.includes('status') || item.id.includes('ssl') || item.status === 'error')) ||
      (item.category === 'onpage' && item.id.includes('title') && item.status === 'error')
    ) {
      phase1Tasks.push(createTaskFromAuditItem(item, 'phase_1', 1, 0));
    } else if (
      item.category === 'onpage' ||
      item.category === 'social' ||
      item.id.includes('heading') ||
      item.id.includes('alt') ||
      item.id.includes('meta') ||
      item.id.includes('schema')
    ) {
      phase2Tasks.push(createTaskFromAuditItem(item, 'phase_2', 2, 0));
    } else if (
      item.category === 'performance' ||
      item.id.includes('speed') ||
      item.id.includes('lcp') ||
      item.id.includes('cls') ||
      item.id.includes('mobile') ||
      item.id.includes('cache')
    ) {
      phase3Tasks.push(createTaskFromAuditItem(item, 'phase_3', 3, 0));
    } else {
      phase4Tasks.push(createTaskFromAuditItem(item, 'phase_4', 4, 0));
    }
  });

  // Proactive / Growth Fallback tasks if any phase has few tasks
  const proactivePhase1: RoadmapTask[] = [
    {
      id: 'task-proactive-gsc',
      phaseId: 'phase_1',
      dayNumber: 2,
      weekNumber: 1,
      titleAr: 'التحقق من ملكية Google Search Console وتفعيل خريطة الموقع sitemap.xml',
      descriptionAr: 'تأكيد تفعيل أداة مشرفي المواقع من جوجل وتقديم خريطة الـ XML لضمان استكشاف وأرشفة كافة الروابط فورياً وبدون تأخير.',
      category: 'technical',
      priority: 'critical',
      difficulty: 'easy',
      estimatedMinutes: 20,
      whyThisDayAr: 'أساس المراقبة الفنية للسيو؛ بدون Search Console لا يمكنك تتبع الكلمات المفتاحية وأخطاء الزحف.',
      expectedImpactAr: 'اكتشاف أخطاء الفهرسة لحظياً وسرعة أرشفة الصفحات الجديدة بنسبة 80%',
      subSteps: [
        { id: 'p1-1', textAr: 'تسجيل الدخول إلى Google Search Console وإضافة نطاق الموقع', done: false },
        { id: 'p1-2', textAr: 'التحقق عبر DNS TXT أو وسم HTML في الـ <head>', done: false },
        { id: 'p1-3', textAr: 'إرسال رابط sitemap.xml والتحقق من حالة «تم بنجاح»', done: false }
      ],
      codeSnippet: `<meta name="google-site-verification" content="YOUR_VERIFICATION_TOKEN" />`,
      status: 'todo'
    },
    {
      id: 'task-proactive-robots',
      phaseId: 'phase_1',
      dayNumber: 4,
      weekNumber: 1,
      titleAr: 'تدقيق وتأمين ملف robots.txt وقواعد توجيه الزواحف',
      descriptionAr: 'مراجعة ملف robots.txt للتأكد من عدم حظر أي مجلدات هامة (مثل CSS/JS ومسارات المحتوى) مع السماح الصريح لبوتات جوجل بالزحف.',
      category: 'technical',
      priority: 'high',
      difficulty: 'easy',
      estimatedMinutes: 25,
      whyThisDayAr: 'خطأ بسيط في سطر Disallow كفيل بحجب الموقع كاملاً من الظهور في جوجل.',
      expectedImpactAr: 'ضمان وصول محركات البحث إلى 100% من صفحات المحتوى القيمة',
      subSteps: [
        { id: 'p1-b1', textAr: 'فحص الرابط yoursite.com/robots.txt في المتصفح', done: false },
        { id: 'p1-b2', textAr: 'التأكد من تضمين رابط الـ Sitemap في نهاية الملف', done: false },
        { id: 'p1-b3', textAr: 'استخدام أداة اختبار robots.txt في Search Console', done: false }
      ],
      codeSnippet: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://${domain}/sitemap.xml`,
      status: 'todo'
    },
    {
      id: 'task-proactive-security-headers',
      phaseId: 'phase_1',
      dayNumber: 6,
      weekNumber: 1,
      titleAr: 'تطبيق ترويسات الأمان المتقدمة (HSTS و X-Frame-Options)',
      descriptionAr: 'حماية مستخدمي الموقع من هجمات انتحال الصفحات واختطاف النقرات، مع فرض بروتوكول HTTPS الصارم عبر HSTS.',
      category: 'security',
      priority: 'medium',
      difficulty: 'easy',
      estimatedMinutes: 20,
      whyThisDayAr: 'جوجل يعطي أولوية قصوى لمواقع الويب الآمنة تماماً وخالية من الثغرات الأمنية.',
      expectedImpactAr: 'حماية الموقع بنسبة 100% من ثغرات Clickjacking وتشفير صارم للاتصال',
      subSteps: [
        { id: 'p1-s1', textAr: 'إضافة ترويسة Strict-Transport-Security على السيرفر', done: false },
        { id: 'p1-s2', textAr: 'إضافة ترويسة X-Content-Type-Options: nosniff', done: false },
        { id: 'p1-s3', textAr: 'إعادة الفحص والتأكد من الحصول على درجة أمان A+', done: false }
      ],
      codeSnippet: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\nX-Frame-Options: SAMEORIGIN\nX-Content-Type-Options: nosniff`,
      status: 'todo'
    }
  ];

  const proactivePhase2: RoadmapTask[] = [
    {
      id: 'task-proactive-h1-opt',
      phaseId: 'phase_2',
      dayNumber: 9,
      weekNumber: 2,
      titleAr: 'تحسين عنوان الصفحة H1 واستهداف الكلمة الرئيسية بنية عالية',
      descriptionAr: 'إعادة صياغة وسم H1 ليكون فريداً، جذاباً ومحتوياً على الكلمة المفتاحية الرئيسية في أوله لتحفيز نية النقر والتصدر.',
      category: 'onpage',
      priority: 'high',
      difficulty: 'easy',
      estimatedMinutes: 30,
      whyThisDayAr: 'وسم H1 هو أقوى إشارة دلالية تفهم منها روبوتات جوجل الموضوع الرئيسي للمقال أو الصفحة.',
      expectedImpactAr: 'رفع ملاءمة الكلمة المفتاحية وتحسين ظهور الصفحة في الكلمات الأساسية بنسبة 25%',
      subSteps: [
        { id: 'p2-1', textAr: 'التحقق من وجود وسم H1 واحد فقط لا غير في الصفحة', done: false },
        { id: 'p2-2', textAr: 'دمج الكلمة المفتاحية الأعلى بحثاً والنية المناسبة في العنوان', done: false },
        { id: 'p2-3', textAr: 'التأكد من أن طول العنوان بين 35 إلى 65 حرفاً', done: false }
      ],
      status: 'todo'
    },
    {
      id: 'task-proactive-schema-faq',
      phaseId: 'phase_2',
      dayNumber: 11,
      weekNumber: 2,
      titleAr: 'تضمين بيانات Schema.org المنظمة (FAQ / Article / Product)',
      descriptionAr: 'إضافة كود JSON-LD مهيكل للصفحة للحصول على النتائج المنسقة (Rich Snippets) في نتائج بحث جوجل وزيادة نسبة النقر CTR.',
      category: 'technical',
      priority: 'high',
      difficulty: 'medium',
      estimatedMinutes: 35,
      whyThisDayAr: 'النتائج الغنية ذات الأسئلة أو التقييمات تستحوذ على مساحة مضاعفة في صفحة جوجل الأولى.',
      expectedImpactAr: 'مضاعفة معدل النقر CTR بنسبة تصل إلى +30% وظهور في الميزات الخاصة',
      subSteps: [
        { id: 'p2-s1', textAr: 'تحديد نوع السكيما الأنسب (WebPage / Article / FAQPage)', done: false },
        { id: 'p2-s2', textAr: 'إدراج كود JSON-LD في وسم <head>', done: false },
        { id: 'p2-s3', textAr: 'التحقق بأداة Google Rich Results Test والتأكد من خلوه من الأخطاء', done: false }
      ],
      codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "سؤال شائع يبحث عنه عملاؤك المستهدفون؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "إجابة مباشرة وشاملة تتضمن كلماتك المفتاحية وتقدم حلاً فورياً."
      }
    }
  ]
}
</script>`,
      status: 'todo'
    },
    {
      id: 'task-proactive-images-alt',
      phaseId: 'phase_2',
      dayNumber: 13,
      weekNumber: 2,
      titleAr: 'تحسين نصوص Alt البديلة لجميع الصور وضغط أحجامها WebP',
      descriptionAr: 'تزويد جميع الصور بوسم alt وصفي معبر يتضمن سياق الصورة، وتحويل الصيغ إلى WebP خفيفة الحجم لتعزيز سيو الصور.',
      category: 'onpage',
      priority: 'medium',
      difficulty: 'easy',
      estimatedMinutes: 35,
      whyThisDayAr: 'جوجل لا يقرأ بكسلات الصور بنفس دقة النصوص، لذا فإن نصوص Alt هي بوابة تصدر بحث الصور وإمكانية الوصول.',
      expectedImpactAr: 'زيادة الزيارات القادمة من بحث الصور (Google Images) بنسبة +20%',
      subSteps: [
        { id: 'p2-i1', textAr: 'حصر الصور المفتقرة لخاصية alt="" في الصفحة', done: false },
        { id: 'p2-i2', textAr: 'كتابة وصف دقيق وواقعي لكل صورة دون حشو كلمات عشوائي', done: false },
        { id: 'p2-i3', textAr: 'تحويل الصور الثقيلة إلى تنسيق WebP خفيف وسريع التحميل', done: false }
      ],
      codeSnippet: `<img src="seo-tips.webp" alt="مخطط بياني يوضح خطوات تحسين محركات البحث في 30 يوما" loading="lazy" width="800" height="450" />`,
      status: 'todo'
    }
  ];

  const proactivePhase3: RoadmapTask[] = [
    {
      id: 'task-proactive-cwv-lcp',
      phaseId: 'phase_3',
      dayNumber: 16,
      weekNumber: 3,
      titleAr: 'تحسين سرعة تحميل العنصر الرئيسي (LCP) لأقل من 2.5 ثانية',
      descriptionAr: 'تسريع تحميل أكبر عنصر مرئي في الشاشة الأولى (سواء كان صورة بارزة أو عنواناً رئيسياً) لتجاوز تقييم Core Web Vitals.',
      category: 'performance',
      priority: 'high',
      difficulty: 'medium',
      estimatedMinutes: 45,
      whyThisDayAr: 'مقياس LCP هو المعيار الأساسي لسرعة الصفحة لدى جوجل ويؤثر مباشرة في معدل الارتداد والترتيب.',
      expectedImpactAr: 'تخفيض زمن LCP من حالة التحذير إلى النطاق الأخضر السريع (< 2.5s)',
      subSteps: [
        { id: 'p3-1', textAr: 'إضافة fetchpriority="high" على الصورة البارزة في أول الصفحة', done: false },
        { id: 'p3-2', textAr: 'استبعاد صورة الشاشة الأولى من التحميل الكسول lazy-loading', done: false },
        { id: 'p3-3', textAr: 'تفعيل التخزين المؤقت Browser Caching والضغط gzip/brotli', done: false }
      ],
      codeSnippet: `<link rel="preload" as="image" href="/hero-banner.webp" fetchpriority="high" />`,
      status: 'todo'
    },
    {
      id: 'task-proactive-cwv-cls',
      phaseId: 'phase_3',
      dayNumber: 18,
      weekNumber: 3,
      titleAr: 'منع قفزات وتغيرات التخطيط الفجائية (CLS) بتحديد أبعاد العناصر',
      descriptionAr: 'تحديد العرض والارتفاع الصريح لكافة الصور والإعلانات وحاويات الفيديو لمنع اهتزاز الصفحة أثناء التحميل.',
      category: 'performance',
      priority: 'medium',
      difficulty: 'easy',
      estimatedMinutes: 30,
      whyThisDayAr: 'انزياح العناصر المفاجئ يسبب إحباطاً كبيراً للزوار ونقر أزرار بالخطأ، مما يدفع جوجل لخفض الترتيب.',
      expectedImpactAr: 'الوصول بنتيجة التراكم التخطيطي CLS إلى الصفر أو أقل من 0.05',
      subSteps: [
        { id: 'p3-c1', textAr: 'إضافة خاصيتي width و height على كافة وسوم <img> و <iframe>', done: false },
        { id: 'p3-c2', textAr: 'حجز مساحات ثابتة عبر CSS min-height للحاويات الديناميكية', done: false },
        { id: 'p3-c3', textAr: 'فحص التخطيط على متصفح الموبايل للتأكد من استقرار العناصر', done: false }
      ],
      status: 'todo'
    },
    {
      id: 'task-proactive-defer-js',
      phaseId: 'phase_3',
      dayNumber: 20,
      weekNumber: 3,
      titleAr: 'تأجيل ملفات جافاسكريبت غير الحرجة (Defer / Async)',
      descriptionAr: 'منع أكواد البرمجة الخارجية وأكواد التتبع من حظر تصيير الصفحة عبر إضافة خاصية defer أو async.',
      category: 'performance',
      priority: 'medium',
      difficulty: 'easy',
      estimatedMinutes: 25,
      whyThisDayAr: 'تحرير الخيط الرئيسي (Main Thread) للمتصفح يمنح الزائر استجابة فورية ونقرات سريعة.',
      expectedImpactAr: 'تحسين مؤشر التفاعل INP وتسريع زمن العرض الأولي بأكثر من ثانية',
      subSteps: [
        { id: 'p3-j1', textAr: 'إضافة defer لكافة وسوم <script> غير الأساسية في الرأس', done: false },
        { id: 'p3-j2', textAr: 'نقل أدوات التتبع الثقيلة إلى ما بعد تحميل DOM', done: false },
        { id: 'p3-j3', textAr: 'إعادة قياس سرعة الصفحة والتحقق من تخفيض زمن الحظر TBT', done: false }
      ],
      codeSnippet: `<script src="/analytics.js" defer></script>`,
      status: 'todo'
    }
  ];

  const proactivePhase4: RoadmapTask[] = [
    {
      id: 'task-proactive-internal-links',
      phaseId: 'phase_4',
      dayNumber: 23,
      weekNumber: 4,
      titleAr: 'بناء وتدعيم هيكل الروابط الداخلية (Topic Clusters & Silos)',
      descriptionAr: 'ربط هذه الصفحة سياقياً بالمقالات والصفحات ذات الصلة في الموقع باستخدام نصوص روابط (Anchor Texts) وصفية ومتنوعة.',
      category: 'content',
      priority: 'high',
      difficulty: 'easy',
      estimatedMinutes: 40,
      whyThisDayAr: 'الروابط الداخلية تنقل قوة وترتيب الصفحات (PageRank) وتساعد عناكب جوجل على استكشاف المحتوى وفهم الترابط.',
      expectedImpactAr: 'رفع موثوقية الموضوع (Topical Authority) وتقليل نسبة الصفحات اليتيمة بنسبة 100%',
      subSteps: [
        { id: 'p4-1', textAr: 'إضافة 3-5 روابط داخلية ذكية من مقالات قديمة قوية إلى هذه الصفحة', done: false },
        { id: 'p4-2', textAr: 'تجنب العبارات العامة مثل "اضغط هنا" واستبدالها بنصوص وصفية مفتاحية', done: false },
        { id: 'p4-3', textAr: 'التحقق من عدم وجود روابط داخلية معطلة (404)', done: false }
      ],
      status: 'todo'
    },
    {
      id: 'task-proactive-high-intent-keywords',
      phaseId: 'phase_4',
      dayNumber: 26,
      weekNumber: 4,
      titleAr: 'استهداف الكلمات المفتاحية ذات النية العالية في العناوين الفرعية H2',
      descriptionAr: 'دمج الكلمات التجارية والشرائية المستخرجة بأداة الذكاء الاصطناعي في عناوين فرعية H2 وفقرات إجابات مباشرة.',
      category: 'content',
      priority: 'high',
      difficulty: 'medium',
      estimatedMinutes: 45,
      whyThisDayAr: 'النية العالية تعني زيارات ذات احتمالية تحويل وشراء تفوق الزيارات العادية بأضعاف مضاعفة.',
      expectedImpactAr: 'استقطاب باحثين بنية شراء حقيقية ورفع معدل التحويل والمبيعات بنسبة +35%',
      subSteps: [
        { id: 'p4-k1', textAr: 'اختيار 3 كلمات رئيسية ذات نية تجارية/شرائية من قائمة الذكاء الاصطناعي', done: false },
        { id: 'p4-k2', textAr: 'صياغة عنوان H2 مخصص لكل كلمة والإجابة على استفسار الباحث فورياً', done: false },
        { id: 'p4-k3', textAr: 'إضافة زر دعوة لإجراء (CTA) مباشر تحت كل قسم لتشجيع الإجراء المطلوب', done: false }
      ],
      status: 'todo'
    },
    {
      id: 'task-proactive-recurring-audit',
      phaseId: 'phase_4',
      dayNumber: 29,
      weekNumber: 4,
      titleAr: 'تفعيل الفحص الدوري الأسبوعي بالبريد الإلكتروني ومقارنة التقدم',
      descriptionAr: 'جدولة تقرير فحص أسبوعي تلقائي للموقع عبر المنصة لمتابعة استقرار التحسينات وتلقي تنبيهات عند حدوث أي تراجع في السكور.',
      category: 'technical',
      priority: 'medium',
      difficulty: 'easy',
      estimatedMinutes: 15,
      whyThisDayAr: 'السيو عملية مستمرة وليست مهمة لمرة واحدة؛ المراقبة تحميك من التراجعات غير المتوقعة.',
      expectedImpactAr: 'اكتشاف أي أخطاء مفاجئة قبل أن تلاحظها خوارزميات محركات البحث',
      subSteps: [
        { id: 'p4-r1', textAr: 'إدخال بريدك الإلكتروني في بطاقة جدولة الفحص الدوري بالمنصة', done: false },
        { id: 'p4-r2', textAr: 'تفعيل التنبيه عند انخفاض السكور عن 85 نقطة', done: false },
        { id: 'p4-r3', textAr: 'حفظ هذا التقرير لمقارنته مع تقرير نهاية الشهر القادم', done: false }
      ],
      status: 'todo'
    }
  ];

  // Distribute pending tasks and augment with proactive tasks
  const finalPhase1Tasks = [...phase1Tasks];
  if (finalPhase1Tasks.length < 3) {
    proactivePhase1.forEach((pt) => {
      if (!finalPhase1Tasks.some((t) => t.id === pt.id || t.titleAr.includes(pt.category))) {
        finalPhase1Tasks.push(pt);
      }
    });
  }

  const finalPhase2Tasks = [...phase2Tasks];
  if (finalPhase2Tasks.length < 3) {
    proactivePhase2.forEach((pt) => {
      if (!finalPhase2Tasks.some((t) => t.id === pt.id)) {
        finalPhase2Tasks.push(pt);
      }
    });
  }

  const finalPhase3Tasks = [...phase3Tasks];
  if (finalPhase3Tasks.length < 3) {
    proactivePhase3.forEach((pt) => {
      if (!finalPhase3Tasks.some((t) => t.id === pt.id)) {
        finalPhase3Tasks.push(pt);
      }
    });
  }

  const finalPhase4Tasks = [...phase4Tasks];
  if (finalPhase4Tasks.length < 3) {
    proactivePhase4.forEach((pt) => {
      if (!finalPhase4Tasks.some((t) => t.id === pt.id)) {
        finalPhase4Tasks.push(pt);
      }
    });
  }

  // Assign day numbers logically across 30 days
  const assignDays = (tasks: RoadmapTask[], startDay: number, endDay: number, weekNum: number) => {
    const span = endDay - startDay + 1;
    tasks.forEach((task, idx) => {
      task.weekNumber = weekNum;
      // Stagger days evenly
      const offset = tasks.length === 1 ? 2 : Math.floor((idx / Math.max(1, tasks.length - 1)) * (span - 1));
      task.dayNumber = Math.min(endDay, startDay + offset);
    });
  };

  assignDays(finalPhase1Tasks, 1, 7, 1);
  assignDays(finalPhase2Tasks, 8, 14, 2);
  assignDays(finalPhase3Tasks, 15, 21, 3);
  assignDays(finalPhase4Tasks, 22, 30, 4);

  const phases: RoadmapPhase[] = [
    {
      id: 'phase_1',
      phaseNumber: 1,
      weekLabelAr: 'الأسبوع 1 (الأيام 1 – 7)',
      titleAr: 'الإصلاحات التقنية الحرجة وإزالة عوائق الفهرسة',
      focusDescriptionAr: 'التركيز على إزالة الحظر، التحقق من ملفات التوجيه (robots.txt)، تصحيح الترويسات الأمنية، ومعالجة الروابط المعطلة 404.',
      goalAr: 'ضمان استكشاف عناكب البحث لكافة صفحات الموقع بأمان وسلاسة 100%',
      targetMetricAr: 'مؤشر الصحة التقنية +25 نقطة',
      tasks: finalPhase1Tasks
    },
    {
      id: 'phase_2',
      phaseNumber: 2,
      weekLabelAr: 'الأسبوع 2 (الأيام 8 – 14)',
      titleAr: 'تحسين البنية الداخلية والمحتوى الأساسي (On-Page & Schema)',
      focusDescriptionAr: 'إصلاح العناوين الرئيسية H1 وهيكل العناوين H2-H3، نصوص الميتا، نصوص Alt للصور، وإضافة بيانات Schema.org المنظمة.',
      goalAr: 'توضيح سياق الصفحة لخوارزميات الترتيب ورفع معدل النقر (CTR) في نتائج جوجل',
      targetMetricAr: 'مؤشر السيو الداخلي +20 نقطة ومظهر نتائج منسقة',
      tasks: finalPhase2Tasks
    },
    {
      id: 'phase_3',
      phaseNumber: 3,
      weekLabelAr: 'الأسبوع 3 (الأيام 15 – 21)',
      titleAr: 'تسريع الأداء ومؤشرات تجربة المستخدم (Core Web Vitals)',
      focusDescriptionAr: 'معالجة زمن LCP واستقرار التخطيط CLS وضغط الموارد وتأجيل أكواد JS غير الحرجة لضمان تجربة موبايل فائقة السرعة.',
      goalAr: 'اجتياز اختبارات سرعة جوجل الرسمية وتقليل معدل الارتداد (Bounce Rate)',
      targetMetricAr: 'درجة السرعة والأداء 90+ وزمن LCP < 2.5s',
      tasks: finalPhase3Tasks
    },
    {
      id: 'phase_4',
      phaseNumber: 4,
      weekLabelAr: 'الأسبوع 4 (الأيام 22 – 30)',
      titleAr: 'بناء الروابط الداخلية والنمو المستدام (Authority & Retention)',
      focusDescriptionAr: 'ربط المحتوى في مجموعات مواضيع (Topic Clusters)، استهداف الكلمات ذات النية العالية، وتفعيل الفحص الدوري الآلي.',
      goalAr: 'تعزيز السلطة الموضوعية وتحقيق قفزات ملموسة في ترتيب الكلمات المفتاحية التنافسية',
      targetMetricAr: 'ارتفاع في الزيارات العضوية بنسبة متوقعة +30% إلى +65%',
      tasks: finalPhase4Tasks
    }
  ];

  // Calculate total hours
  const allTasks = [...finalPhase1Tasks, ...finalPhase2Tasks, ...finalPhase3Tasks, ...finalPhase4Tasks];
  const totalMinutes = allTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const estimatedTotalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Projected score
  const scoreBoost = Math.min(32, Math.max(14, Math.round(pendingItems.length * 2.8)));
  const projectedScoreAfter30Days = Math.min(100, Math.max(overallScore + scoreBoost, 95));

  const executiveSummaryAr =
    `خارطة طريق تنفيذية مصممة بناءً على تحليل دقيق لـ ${items.length} معيار سيو في موقع ${domain}. ` +
    `تتضمن الخطة ${allTasks.length} مهمة عملية موزعة على 4 مراحل أسبوعية محددة بوقت إجمالي متوقع ${estimatedTotalHours} ساعة، ` +
    `تهدف إلى رفع السكور العام من ${overallScore} إلى ${projectedScoreAfter30Days}/100 وتأمين ظهور الموقع في الصفحات الأولى.`;

  const targetGrowthImpactAr =
    'تصحيح كافة الأخطاء التقنية، اجتياز معايير Core Web Vitals الرسمية، وحصد نتائج غنية (Rich Snippets) تؤدي إلى نمو متوقع في الزيارات بنسبة تتراوح بين 35% و 65% خلال 60 إلى 90 يوماً من التطبيق.';

  const keyMilestonesAr = [
    { day: 7, milestoneAr: 'إكمال المرحلة الأولى: القضاء التام على أخطاء الفهرسة والزحف والأمان' },
    { day: 14, milestoneAr: 'إكمال المرحلة الثانية: اكتمال هيكل العناوين الدلالية وتفعيل سكيما الأسئلة الشائعة' },
    { day: 21, milestoneAr: 'إكمال المرحلة الثالثة: تحول كافة مؤشرات أداء Core Web Vitals إلى النطاق الأخضر' },
    { day: 30, milestoneAr: 'إكمال المرحلة الرابعة: اكتمال شبكة الروابط الداخلية وبدء جني ثمار الزيارات العضوية' }
  ];

  return {
    id: `roadmap-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    url,
    targetDomain: domain,
    overallHealthScore: overallScore,
    projectedScoreAfter30Days,
    totalPendingItems: pendingItems.length,
    estimatedTotalHours,
    executiveSummaryAr,
    targetGrowthImpactAr,
    phases,
    keyMilestonesAr
  };
}
