import {
  HighIntentKeywordsAnalysis,
  HighIntentKeywordItem,
  SearchIntentType
} from '../types/seo';

interface ContentInput {
  url: string;
  title?: string;
  description?: string;
  headings?: { h1?: string[]; h2?: string[]; h3?: string[]; sampleHeadings?: { tag: string; text: string }[] };
  bodyText?: string;
  wordCount?: number;
  topKeywords?: { word: string; count?: number; density?: number }[];
  focusIntent?: 'all' | 'commercial' | 'transactional' | 'informational';
  customFocus?: string;
}

/**
 * Intelligent rule-based High-Intent Keyword analyzer that works in offline/demo mode
 * or as a robust baseline for page content.
 */
export function generateHighIntentKeywords(input: ContentInput): HighIntentKeywordsAnalysis {
  const {
    url,
    title = '',
    description = '',
    headings = { h1: [], h2: [], h3: [] },
    bodyText = '',
    topKeywords = [],
    focusIntent = 'all'
  } = input;

  const h1Text = (headings.h1 || []).join(' ');
  const h2Text = (headings.h2 || headings.sampleHeadings?.filter(h => h.tag === 'h2').map(h => h.text) || []).join(' ');
  const combinedText = `${title} ${description} ${h1Text} ${h2Text} ${bodyText.slice(0, 3000)}`.toLowerCase();

  // Detect domain & main topic
  let targetTopic = 'السيو وتحسين محركات البحث';
  if (url.includes('tech') || combinedText.includes('تقني') || combinedText.includes('برمج') || combinedText.includes('ذكاء')) {
    targetTopic = 'التقنية والذكاء الاصطناعي والبرمجيات';
  } else if (url.includes('store') || url.includes('shop') || url.includes('boutique') || combinedText.includes('متجر') || combinedText.includes('تسوق') || combinedText.includes('عطور') || combinedText.includes('شراء')) {
    targetTopic = 'التجارة الإلكترونية والتسوق الفاخر';
  } else if (title) {
    targetTopic = title.split(/[-|–]/)[0].trim();
  }

  // High-Intent candidates based on topic
  let candidatePool: Array<{
    keyword: string;
    intent: SearchIntentType;
    intentLabelAr: string;
    intentExplanationAr: string;
    baseOpportunity: number;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedVolume: string;
    cpcPotential: 'high' | 'medium' | 'premium';
    suggestedPlacement: 'h2_heading' | 'title_meta' | 'first_paragraph' | 'faq_schema' | 'anchor_link';
    suggestedPlacementLabelAr: string;
    actionableTipAr: string;
    readyHeadingAr: string;
    searchQueries: string[];
  }> = [];

  if (targetTopic.includes('التجارة الإلكترونية') || targetTopic.includes('تسوق')) {
    candidatePool = [
      {
        keyword: 'شراء عطور فاخرة أصلية اون لاين',
        intent: 'transactional',
        intentLabelAr: 'نية شرائية مباشرة (High Transactional)',
        intentExplanationAr: 'الباحث وصل لمرحلة القرار النهائي للشراء ويبحث عن متجر موثوق يوفر دفعاً آمناً وشحناً سريعاً.',
        baseOpportunity: 94,
        difficulty: 'medium',
        estimatedVolume: '3.2K - 6.5K / شهر',
        cpcPotential: 'premium',
        suggestedPlacement: 'title_meta',
        suggestedPlacementLabelAr: 'عنوان الصفحة (Title) ووسم H1',
        actionableTipAr: 'أضف هذه العبارة في وسم <title> مع ضمانات واضحة مثل "شحن مجاني، دفع عند الاستلام، عطور أصلية 100%".',
        readyHeadingAr: 'تسوق أفضل العطور الفاخرة الأصلية مع شحن سريع وضمان أصالة',
        searchQueries: ['عطور فاخرة اون لاين', 'متجر عطور أصلي', 'أفضل أسعار العطور']
      },
      {
        keyword: 'أفضل عطور رجالية شتوية 2026 ثبات وفوحان',
        intent: 'commercial',
        intentLabelAr: 'نية تجارية استقصائية (Commercial Investigation)',
        intentExplanationAr: 'المستخدم يقيّم الخيارات الأفضل قبل إتمام الشراء، وهي ذات معدل تحويل مرتفع للغاية عبر مقالات المراجعات.',
        baseOpportunity: 91,
        difficulty: 'easy',
        estimatedVolume: '4.8K - 8.2K / شهر',
        cpcPotential: 'high',
        suggestedPlacement: 'h2_heading',
        suggestedPlacementLabelAr: 'عنوان فرعي H2 في المقال/القسم',
        actionableTipAr: 'أنشئ قسماً أو مقالاً يتضمن جدول مقارنة لأفضل 5 عطور مع روابط مباشرة (CTA) لكل منتج.',
        readyHeadingAr: 'دليل أفضل 7 عطور رجالية شتوية لعام 2026: الثبات والفوحان الفعلي',
        searchQueries: ['أفضل عطور رجالية شتوية', 'عطور ثبات وفوحان عالي', 'مقارنة عطور رجالية']
      },
      {
        keyword: 'كود خصم متجر عطور أول طلب',
        intent: 'transactional',
        intentLabelAr: 'نية شرائية تحفيزية (Transactional Coupon)',
        intentExplanationAr: 'باحث في سلة الشراء يبحث عن تخفيض لإتمام الدفع فوراً.',
        baseOpportunity: 88,
        difficulty: 'easy',
        estimatedVolume: '1.9K - 3.4K / شهر',
        cpcPotential: 'medium',
        suggestedPlacement: 'faq_schema',
        suggestedPlacementLabelAr: 'بيانات Schema للأسئلة الشائعة (FAQ)',
        actionableTipAr: 'أضف سؤالاً في قسم الـ FAQ: "هل يتوفر كود خصم للطلب الأول؟" مع وسم Schema.org ليظهر في نتائج جوجل برقم بارز.',
        readyHeadingAr: 'عروض حصرية: احصل على خصم 15% على أول طلب لك اليوم',
        searchQueries: ['كوبون خصم عطور', 'كود خصم اول طلب', 'عروض وتخفيضات العطور']
      },
      {
        keyword: 'كيف تفرق بين العطر الأصلي والتقليد',
        intent: 'informational_high',
        intentLabelAr: 'نية معلوماتية استشارية (High-Converting Informational)',
        intentExplanationAr: 'العميل متشكك، وإذا أثبت له متجرك بالأدلة العملية كيفية التمييز، ستكسب ثقته ويشتري منك مباشرة.',
        baseOpportunity: 89,
        difficulty: 'easy',
        estimatedVolume: '5.1K - 11K / شهر',
        cpcPotential: 'medium',
        suggestedPlacement: 'first_paragraph',
        suggestedPlacementLabelAr: 'مقال مدونة مخصص + مقدمة المقال',
        actionableTipAr: 'اربط هذا المقال بالمنتجات الأكثر مبيعاً عبر روابط داخلية سياقية توضح الباركود ورقم الدفعة (Batch Code).',
        readyHeadingAr: 'دليل عملي مصور: 5 علامات تكشف العطر المقلد من الأصلي فوراً',
        searchQueries: ['كشف العطر الأصلي', 'الفرق بين العطر الاصلي والتقليد', 'فحص باركود العطر']
      },
      {
        keyword: 'عطور بدائل النيش بأسعار مناسبة',
        intent: 'commercial',
        intentLabelAr: 'نية تجارية بديلة (Alternative / Comparison)',
        intentExplanationAr: 'بحث مكثف عن بدائل اقتصادية لعطور النيش باهظة الثمن، بمعدل تحويل ونقر مرتفعين جداً.',
        baseOpportunity: 86,
        difficulty: 'medium',
        estimatedVolume: '2.7K - 5.3K / شهر',
        cpcPotential: 'high',
        suggestedPlacement: 'h2_heading',
        suggestedPlacementLabelAr: 'عنوان رئيسي لتصنيف المنتجات H2',
        actionableTipAr: 'صمم صفحة تصنيف كاملة (Category Page) تستهدف بدائل النيش مع فلترة حسب النوتات العطرية.',
        readyHeadingAr: 'أقوى بدائل عطور النيش العالمية بثبات يدوم طويلاً وسعر اقتصادي',
        searchQueries: ['بدائل عطور النيش', 'عطور رخيصة تشبه النيش', 'مراجعة بدائل العطور']
      },
      {
        keyword: 'عطور مسك وطهارة ثبات 24 ساعة',
        intent: 'transactional',
        intentLabelAr: 'نية شرائية مخصصة (Niche Transactional)',
        intentExplanationAr: 'كلمة ذات دقة عالية (Long-tail) تجذب مشترين جادين يبحثون عن خصائص محددة.',
        baseOpportunity: 84,
        difficulty: 'easy',
        estimatedVolume: '1.8K - 3.9K / شهر',
        cpcPotential: 'high',
        suggestedPlacement: 'anchor_link',
        suggestedPlacementLabelAr: 'روابط داخلية سياقية وميتا الوصف',
        actionableTipAr: 'استخدم هذه العبارة كنص رابط داخلي سياقي ينقل الزائر مباشرة لصفحة منتجات المسك.',
        readyHeadingAr: 'مجموعة عطور المسك الأبيض والطهارة: نقاء وثبات يتجاوز 24 ساعة',
        searchQueries: ['مسك الطهارة الاصلي', 'عطور مسك ثابتة', 'افضل مسك ابيض']
      }
    ];
  } else {
    // Tech / Blog / General Authority Site
    candidatePool = [
      {
        keyword: 'أفضل أدوات الذكاء الاصطناعي لكتابة المقالات المتوافقة مع السيو 2026',
        intent: 'commercial',
        intentLabelAr: 'نية تجارية استقصائية (Commercial Comparison)',
        intentExplanationAr: 'الباحث يبحث عن أدوات عملية للاشتراك فيها أو استخدامها، ويمتلك نية شراء أو تجربة مباشرة.',
        baseOpportunity: 95,
        difficulty: 'medium',
        estimatedVolume: '3.6K - 7.8K / شهر',
        cpcPotential: 'premium',
        suggestedPlacement: 'h2_heading',
        suggestedPlacementLabelAr: 'عنوان H2 رئيسي في الصفحة',
        actionableTipAr: 'قم بإعداد جدول مقارنة تفاعلي يوضح المزايا والأسعار لكل أداة مع إضافة روابط إحالة أو دعوة لتجربة أداتك.',
        readyHeadingAr: 'مقارنة شاملة: أفضل 6 أدوات ذكاء اصطناعي لكتابة محتوى يتصدر جوجل في 2026',
        searchQueries: ['أدوات كتابة بالذكاء الاصطناعي', 'ذكاء اصطناعي للسيو', 'افضل اداة كتابة مقالات']
      },
      {
        keyword: 'تحليل السيو التقني للمواقع واكتشاف أخطاء الأرشفة',
        intent: 'transactional',
        intentLabelAr: 'نية إجرائية خدمية (Service Transactional)',
        intentExplanationAr: 'صاحب موقع أو مسوق يريد حل مشاكل موقعه فوراً إما بفحص مباشر أو الاستعانة بخبير أو أداة.',
        baseOpportunity: 92,
        difficulty: 'easy',
        estimatedVolume: '2.9K - 5.4K / شهر',
        cpcPotential: 'high',
        suggestedPlacement: 'title_meta',
        suggestedPlacementLabelAr: 'عنوان الصفحة (Title) وفقرة البداية',
        actionableTipAr: 'ضمن هذا المصطلح في أول 100 كلمة من الصفحة مع زر بارز (CTA) لبدء الفحص الفوري للأرشفة.',
        readyHeadingAr: 'كيف تفحص السيو التقني لموقعك وتكشف أخطاء الأرشفة في 3 دقائق مجاناً',
        searchQueries: ['فحص السيو التقني مجانا', 'حل مشاكل ارشفة جوجل', 'ادوات تحليل السيو']
      },
      {
        keyword: 'كيفية تصدر نتائج البحث في جوجل خطوة بخطوة للمبتدئين',
        intent: 'informational_high',
        intentLabelAr: 'نية معلوماتية عالية القيمة (High Informational)',
        intentExplanationAr: 'باحث يبحث عن مسار تعليمي كامل، مما يتيح لك بناء سلطة موثوقة (Topical Authority) وجمهور مخلص.',
        baseOpportunity: 88,
        difficulty: 'medium',
        estimatedVolume: '8.4K - 16.5K / شهر',
        cpcPotential: 'medium',
        suggestedPlacement: 'first_paragraph',
        suggestedPlacementLabelAr: 'مقال رئيسي (Pillar Post) وقسم FAQ',
        actionableTipAr: 'حوّل الصفحة إلى دليل إرشادي شامل مقسم إلى خطوات مرقمة مع صور توضيحية ومخططات بيانية.',
        readyHeadingAr: 'دليل التصدر الشامل: 7 خطوات عملية تضع موقعك في الصفحة الأولى لجوجل',
        searchQueries: ['تصدر نتائج البحث جوجل', 'سيو المواقع للمبتدئين', 'طريقة رفع ترتيب الموقع']
      },
      {
        keyword: 'تحسين سرعة الموقع ومؤشرات Core Web Vitals عملياً',
        intent: 'commercial',
        intentLabelAr: 'نية تجارية لحل مشكلة حرجة (Commercial Solution)',
        intentExplanationAr: 'مشاكل سرعة الموقع تؤثر على الأرباح مباشرة، لذا يبحث المديرون عن حلول سريعة أو خدمات تسريع مدفوعة.',
        baseOpportunity: 90,
        difficulty: 'easy',
        estimatedVolume: '2.1K - 4.5K / شهر',
        cpcPotential: 'high',
        suggestedPlacement: 'h2_heading',
        suggestedPlacementLabelAr: 'عنوان فرعي H2 متبوع بحلول عملية',
        actionableTipAr: 'استعرض حلول تقليل LCP وتعديل ملفات JS/CSS مع تقديم أداتك أو كود جاهز للتطبيق.',
        readyHeadingAr: 'تحسين مؤشرات أداء الويب Core Web Vitals: حل مشكلات LCP و CLS نهائياً',
        searchQueries: ['تحسين core web vitals', 'تسريع صفحات الموقع', 'حل مشكلة lcp']
      },
      {
        keyword: 'خدمة فحص سيو المواقع والتقارير الفورية',
        intent: 'transactional',
        intentLabelAr: 'نية إجرائية تجارية (Commercial Intent)',
        intentExplanationAr: 'بحث صريح عن خدمة تدقيق فورية أو تقارير سيو جاهزة للمؤسسات والشركات.',
        baseOpportunity: 87,
        difficulty: 'easy',
        estimatedVolume: '1.4K - 3.2K / شهر',
        cpcPotential: 'premium',
        suggestedPlacement: 'faq_schema',
        suggestedPlacementLabelAr: 'أسئلة شائعة FAQ + زر الفحص',
        actionableTipAr: 'استخدم نموذج استمارة أو زر فحص مجاني يجلب البريد الإلكتروني للمتابعة التسويقية التلقائية.',
        readyHeadingAr: 'احصل على تقرير سيو شامل لموقعك يكشف كافة الأخطاء والفرص المخفية',
        searchQueries: ['فحص سيو فوري', 'تقرير سيو احترافي', 'تدقيق سيو للمواقع']
      },
      {
        keyword: 'استراتيجيات بناء الروابط الخلفية Backlinks ذات الجودة العالية',
        intent: 'informational_high',
        intentLabelAr: 'نية معلوماتية متقدمة (Advanced Informational)',
        intentExplanationAr: 'موضوع عالي الصعوبة لدى مديري المواقع، ونشر محتوى قوي حوله يجلب روابط خلفية طبيعية.',
        baseOpportunity: 85,
        difficulty: 'hard',
        estimatedVolume: '3.8K - 7.1K / شهر',
        cpcPotential: 'high',
        suggestedPlacement: 'anchor_link',
        suggestedPlacementLabelAr: 'نص رابط داخلي لمقال متخصص',
        actionableTipAr: 'انشر إحصائيات حصرية أو دراسة حالة واقعية لتشجيع المدونات الأخرى على الإشارة لموقعك كمصدر موثوق.',
        readyHeadingAr: 'بناء الباك لينك في 2026: 5 استراتيجيات آمنة تتوافق مع تحديثات جوجل الأساسية',
        searchQueries: ['بناء الباك لينك', 'الحصول على روابط خلفية قوية', 'استراتيجيات السيو الخارجي']
      }
    ];
  }

  // Filter based on focusIntent if specified
  let filteredPool = candidatePool;
  if (focusIntent === 'commercial') {
    filteredPool = candidatePool.filter(c => c.intent === 'commercial');
  } else if (focusIntent === 'transactional') {
    filteredPool = candidatePool.filter(c => c.intent === 'transactional');
  } else if (focusIntent === 'informational') {
    filteredPool = candidatePool.filter(c => c.intent === 'informational_high');
  }
  if (filteredPool.length === 0) {
    filteredPool = candidatePool;
  }

  // Map to final items with Content Gap calculation
  const keywords: HighIntentKeywordItem[] = filteredPool.map((c, index) => {
    // Check if keyword or core parts exist in page content
    const kwWords = c.keyword.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matchedCount = kwWords.filter(w => combinedText.includes(w)).length;
    const matchRatio = kwWords.length > 0 ? matchedCount / kwWords.length : 0;

    let contentGap: 'missing' | 'weak' | 'covered' = 'missing';
    let contentGapLabelAr = 'فجوة محتوى (غير مغطاة إطلاقاً)';
    if (matchRatio >= 0.8) {
      contentGap = 'covered';
      contentGapLabelAr = 'مغطاة في المحتوى (تحتاج تعزيز)';
    } else if (matchRatio >= 0.3) {
      contentGap = 'weak';
      contentGapLabelAr = 'مذكورة بضعف (فرصة ذهبية)';
    }

    const difficultyLabelAr = c.difficulty === 'easy' ? 'سهل (تصدر سريع)' : c.difficulty === 'medium' ? 'متوسط الصعوبة' : 'منافسة قوية';
    const cpcPotentialLabelAr = c.cpcPotential === 'premium' ? 'عائد نقر استثنائي ($$$)' : c.cpcPotential === 'high' ? 'عائد نقر مرتفع ($$)' : 'عائد نقر معتدل ($)';

    return {
      id: `hik_${index + 1}`,
      keyword: c.keyword,
      intent: c.intent,
      intentLabelAr: c.intentLabelAr,
      intentExplanationAr: c.intentExplanationAr,
      opportunityScore: c.baseOpportunity,
      difficulty: c.difficulty,
      difficultyLabelAr,
      estimatedVolume: c.estimatedVolume,
      cpcPotential: c.cpcPotential,
      cpcPotentialLabelAr,
      contentGap,
      contentGapLabelAr,
      suggestedPlacement: c.suggestedPlacement,
      suggestedPlacementLabelAr: c.suggestedPlacementLabelAr,
      actionableTipAr: c.actionableTipAr,
      readyHeadingAr: c.readyHeadingAr,
      searchQueries: c.searchQueries
    };
  });

  const commercialCount = keywords.filter(k => k.intent === 'commercial').length;
  const transactionalCount = keywords.filter(k => k.intent === 'transactional').length;
  const informationalCount = keywords.filter(k => k.intent === 'informational_high').length;

  return {
    generatedAt: new Date().toISOString(),
    pageSummaryAr: `تم تحليل محتوى الصفحة (${title || url}) وتحديد الكلمات المفتاحية الأكثر ربحية ونية تحويل، مع التركيز على الكلمات ذات النية الشرائية والاستقصائية التي يغفل عنها المنافسون.`,
    targetTopicAr: targetTopic,
    keywords,
    intentDistribution: {
      commercial: commercialCount,
      transactional: transactionalCount,
      informational: informationalCount
    },
    primaryGapAr: 'معظم محتوى الصفحة يركز على العبارات العامة والمعلوماتية الأولية، بينما تغيب الكلمات ذات النية الإجرائية (Transactional) والمقارنات التجارية الصريحة التي تقود مباشرة إلى زيادة المبيعات والاشتراكات.',
    quickWinsAr: keywords
      .filter(k => k.difficulty === 'easy' || k.contentGap === 'missing')
      .slice(0, 3)
      .map(k => `استهداف "${k.keyword}" في وسم ${k.suggestedPlacementLabelAr} لتحقيق أسرع قفزة بالترتيب.`),
    suggestedContentPlan: [
      {
        titleAr: `دليل شامل: ${keywords[0]?.readyHeadingAr || 'أفضل الممارسات لعام 2026'}`,
        targetKeyword: keywords[0]?.keyword || targetTopic,
        h2Headings: [
          keywords[0]?.readyHeadingAr || 'مقدمة المقارنة والتقييم الشامل',
          keywords[1]?.readyHeadingAr || 'الخيارات الأفضل والأكثر ثباتاً وجودة',
          'الأسئلة الشائعة ونصائح الاختيار الذكي'
        ],
        faqQuestionAr: `ما هي أهم العوامل لاختيار ${keywords[0]?.keyword || 'الخيار الأفضل'}؟`
      },
      {
        titleAr: `خطوات عملية: ${keywords[1]?.readyHeadingAr || 'دليل المبتدئين والخبراء'}`,
        targetKeyword: keywords[1]?.keyword || targetTopic,
        h2Headings: [
          'لماذا تحتاج إلى البدء اليوم؟',
          keywords[1]?.readyHeadingAr || 'خطوات التنفيذ السريع',
          'الأخطاء الشائعة وكيفية تجنبها'
        ],
        faqQuestionAr: 'كم يستغرق ظهور النتائج بعد تطبيق هذه الخطوات؟'
      }
    ]
  };
}
