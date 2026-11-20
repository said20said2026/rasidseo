import {
  InternalLinkingAnalysis,
  InternalLinkItem,
  InternalLinkingCluster,
  InternalLinkingSuggestion
} from '../types/seo';

const GENERIC_ANCHORS = new Set([
  'اضغط هنا',
  'إضغط هنا',
  'هنا',
  'المزيد',
  'اقرأ المزيد',
  'إقرأ المزيد',
  'قراءة المزيد',
  'التفاصيل',
  'رابط',
  'انقر هنا',
  'تابع القراءة',
  'للمزيد',
  'صفحتنا',
  'المصدر',
  'زورونا',
  'شاهد المزيد',
  'شاهد هنا',
  'اعرف أكثر',
  'اكتشف المزيد',
  'تفاصيل أكثر',
  'click here',
  'read more',
  'more',
  'here',
  'link',
  'this page',
  'website',
  'url',
  'learn more',
  'continue reading'
]);

export interface RawInternalLinkInput {
  url: string;
  anchorText: string;
  isContextual: boolean;
  rel?: string;
}

export function analyzeInternalLinking(
  rawLinks: RawInternalLinkInput[],
  wordCount: number,
  pageUrl: string,
  sampleHeadings: { tag: string; text: string }[] = []
): InternalLinkingAnalysis {
  let parsedCurrentUrl: URL | null = null;
  try {
    parsedCurrentUrl = new URL(pageUrl);
  } catch {
    // ignore
  }

  const items: InternalLinkItem[] = [];
  const uniqueUrls = new Set<string>();
  const anchorCounts: Record<string, { count: number; isGeneric: boolean }> = {};
  const categoryCounts: Record<string, { count: number; sampleLinks: { path: string; anchorText: string }[] }> = {};

  let contextualCount = 0;
  let navigationalCount = 0;
  let genericCount = 0;
  let emptyAnchorCount = 0;

  for (const raw of rawLinks) {
    let cleanPath = '/';
    try {
      const u = new URL(raw.url, pageUrl);
      cleanPath = u.pathname || '/';
      if (u.search) cleanPath += u.search;
    } catch {
      cleanPath = raw.url;
    }

    const anchor = (raw.anchorText || '').trim();
    const isAnchorEmpty = anchor.length === 0;
    const lowerAnchor = anchor.toLowerCase();
    const isGeneric = isAnchorEmpty || GENERIC_ANCHORS.has(lowerAnchor) || /^https?:\/\//i.test(lowerAnchor);

    if (isAnchorEmpty) {
      emptyAnchorCount++;
    }
    if (isGeneric) {
      genericCount++;
    }

    if (raw.isContextual) {
      contextualCount++;
    } else {
      navigationalCount++;
    }

    uniqueUrls.add(raw.url);

    // Track anchor counts
    const anchorKey = isAnchorEmpty ? '[بدون نص - رابط فارغ]' : anchor;
    if (!anchorCounts[anchorKey]) {
      anchorCounts[anchorKey] = { count: 0, isGeneric };
    }
    anchorCounts[anchorKey].count++;

    // Determine target category / silo
    let targetCategory = 'صفحات داخلية هامة';
    const pathLower = cleanPath.toLowerCase();

    if (cleanPath === '/' || cleanPath === '' || (parsedCurrentUrl && cleanPath === parsedCurrentUrl.pathname)) {
      targetCategory = 'الصفحة الرئيسية (Home)';
    } else if (
      pathLower.includes('/blog') ||
      pathLower.includes('/article') ||
      pathLower.includes('/post') ||
      pathLower.includes('/news') ||
      pathLower.includes('/مقالات')
    ) {
      targetCategory = 'المقالات والمدونة (Blog & Knowledge)';
    } else if (
      pathLower.includes('/product') ||
      pathLower.includes('/shop') ||
      pathLower.includes('/store') ||
      pathLower.includes('/item') ||
      pathLower.includes('/منتجات')
    ) {
      targetCategory = 'المنتجات والتسوق (E-commerce)';
    } else if (
      pathLower.includes('/service') ||
      pathLower.includes('/solutions') ||
      pathLower.includes('/خدمات') ||
      pathLower.includes('/features')
    ) {
      targetCategory = 'الخدمات والحلول (Services)';
    } else if (
      pathLower.includes('/about') ||
      pathLower.includes('/contact') ||
      pathLower.includes('/privacy') ||
      pathLower.includes('/terms') ||
      pathLower.includes('/faq') ||
      pathLower.includes('/من-نحن') ||
      pathLower.includes('/اتصل-بنا')
    ) {
      targetCategory = 'الصفحات المؤسسية والقانونية (About & Legal)';
    } else if (
      pathLower.includes('/category') ||
      pathLower.includes('/tag') ||
      pathLower.includes('/topics') ||
      pathLower.includes('/قسم') ||
      pathLower.includes('/تصنيف')
    ) {
      targetCategory = 'الأقسام والتصنيفات (Topic Silos)';
    }

    if (!categoryCounts[targetCategory]) {
      categoryCounts[targetCategory] = { count: 0, sampleLinks: [] };
    }
    categoryCounts[targetCategory].count++;
    if (categoryCounts[targetCategory].sampleLinks.length < 4) {
      categoryCounts[targetCategory].sampleLinks.push({
        path: cleanPath,
        anchorText: isAnchorEmpty ? '[رابط فارغ]' : anchor
      });
    }

    items.push({
      url: raw.url,
      path: cleanPath,
      anchorText: isAnchorEmpty ? '[بدون نص - رابط فارغ]' : anchor,
      targetCategory,
      isContextual: raw.isContextual,
      isGenericAnchor: isGeneric,
      rel: raw.rel
    });
  }

  const total = items.length;

  // Build clusters
  const clusters: InternalLinkingCluster[] = Object.entries(categoryCounts).map(([category, val]) => ({
    category,
    count: val.count,
    percentage: total > 0 ? Math.round((val.count / total) * 100) : 0,
    sampleLinks: val.sampleLinks
  })).sort((a, b) => b.count - a.count);

  // Top anchors sorted by frequency
  const topAnchors = Object.entries(anchorCounts)
    .map(([text, val]) => ({ text, count: val.count, isGeneric: val.isGeneric }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Calculate ratio per thousand words
  const effectiveWords = Math.max(wordCount, 150);
  const ratioPerThousandWords = Math.round(((total > 0 ? contextualCount : 0) / effectiveWords) * 1000 * 10) / 10;

  // Link health score calculation (0 - 100)
  let healthScore = 80;
  if (total === 0) {
    healthScore = 20;
  } else {
    // If generic anchors are more than 25%, penalize
    const genericRatio = genericCount / total;
    if (genericRatio > 0.35) healthScore -= 25;
    else if (genericRatio > 0.15) healthScore -= 12;

    // If contextual links are very low (< 15% of all links)
    const contextualRatio = contextualCount / total;
    if (contextualRatio < 0.15 && total > 5) healthScore -= 15;
    else if (contextualRatio > 0.35) healthScore += 10;

    // If empty anchors exist
    if (emptyAnchorCount > 0) healthScore -= Math.min(emptyAnchorCount * 3, 15);

    // If unique destination URLs are very few compared to total links (over-linking to same page)
    if (uniqueUrls.size < 3 && total > 8) healthScore -= 10;
  }
  healthScore = Math.max(15, Math.min(100, healthScore));

  // Generate strategic suggestions
  const suggestions: InternalLinkingSuggestion[] = [];

  // Suggestion 1: Topic Clusters & Hub-and-Spoke model
  const hasBlogCluster = clusters.some(c => c.category.includes('المقالات') || c.category.includes('Topic Silos'));
  suggestions.push({
    id: 'sug_topic_clusters',
    type: 'hub_spoke',
    titleAr: 'تطبيق نموذج المجموعات العنقودية (Topic Clusters & Pillar Content)',
    priority: hasBlogCluster ? 'medium' : 'high',
    descriptionAr:
      'تقسيم المحتوى إلى مقالات محورية (Pillar Pages) تغطي موضوعات شاملة، وربطها ثنائي الاتجاه بمقالات عنقودية تفصيلية (Cluster Pages) لتعزيز سلطة الموقع الموضوعية (Topical Authority).',
    recommendationAr:
      'أنشئ روابط داخلية متبادلة بين المقالات التي تعالج نفس التصنيف، وتأكد أن الصفحة الرئيسية والصفحات المحورية ترسل عصارة السيو (Link Juice) مباشرة إلى أعمق الصفحات الاستراتيجية.',
    exampleAr: 'مثال: ربط مقال "دليل السيو الشامل" بمقالات فرعية مثل "سيو الصور" و"بناء الروابط الداخلية" مع إعادة الرابط للمقال الرئيسي.'
  });

  // Suggestion 2: Anchor text optimization
  if (genericCount > 0) {
    suggestions.push({
      id: 'sug_anchors_generic',
      type: 'anchor_optimization',
      titleAr: `استبدال ${genericCount} نص رابط عام بكلمات مفتاحية وصفية ذات دلالة سيو`,
      priority: genericCount > 3 ? 'high' : 'medium',
      descriptionAr:
        'استخدام عبارات مبهمة مثل "اضغط هنا" أو "اقرأ المزيد" يحرم محركات البحث وزوار الموقع من فهم سياق الصفحة المستهدفة قبل النقر عليها.',
      recommendationAr:
        'استبدل النصوص العامة بعبارات غنية بالكلمات المفتاحية تعبر بدقة عن محتوى الصفحة الهدف (مثال: بدلاً من "اقرأ المزيد"، استخدم "تعرّف على أسعار باقات الاستضافة السحابية").',
      exampleAr: 'تجنب: <a href="/seo">اضغط هنا</a> | استخدم: <a href="/seo">خدمات تحسين محركات البحث</a>'
    });
  } else {
    suggestions.push({
      id: 'sug_anchors_optimal',
      type: 'anchor_optimization',
      titleAr: 'تنويع النصوص الرابطة (Anchor Texts) وتجنب التكرار الحرفي المفرط',
      priority: 'low',
      descriptionAr:
        'النصوص الرابطة الحالية جيدة، ولكن يُنصح دائمًا بتنويع المرادفات الطبيعية وتجنب مطابقة الكلمة المفتاحية بنسبة 100% في جميع الروابط الداخلية لتفادي الإفراط في التحسين.',
      recommendationAr:
        'استخدم خليطاً من الكلمات المفتاحية الطويلة (LSI) والأسماء التجارية والعبارات التوضيحية عند الإشارة إلى صفحاتك الرئيسية.',
      exampleAr: 'مثال: "باقات التسويق"، "أسعار الخدمات التسويقية"، "حلول التسويق الرقمي للأعمال".'
    });
  }

  // Suggestion 3: Contextual link ratio
  if (contextualCount < 3) {
    suggestions.push({
      id: 'sug_contextual_depth',
      type: 'contextual_ratio',
      titleAr: 'زيادة الروابط السياقية المضمنة في صلب المقال والفقرات (In-Content Links)',
      priority: 'high',
      descriptionAr:
        'الروابط المضمنة داخل فقرات المحتوى التحريري تمتلك وزناً وتأثيراً سيو (PageRank Weight) يفوق بكثير روابط القوائم العلوية (Navigation) وروابط التذييل (Footer).',
      recommendationAr:
        `حاليًا لديك ${contextualCount} رابط سياقي فقط في صلب المحتوى. يُنصح بإضافة 2 إلى 4 روابط تحريرية داخل الفقرات لكل 1000 كلمة ترشد القارئ إلى مقالات أو خدمات مكملة.`,
      exampleAr: 'عند ذكر استراتيجيات تسريع المواقع، ضع رابطاً لكلمة "قياس Core Web Vitals" يوجه القارئ لأداتك الخاصة.'
    });
  } else {
    suggestions.push({
      id: 'sug_contextual_balance',
      type: 'contextual_ratio',
      titleAr: 'توزيع متوازن للروابط السياقية بما يخدم مسار القارئ وتجربة الاستخدام',
      priority: 'medium',
      descriptionAr:
        `يحتوي المحتوى على ${contextualCount} رابط سياقي بمعدل ${ratioPerThousandWords} رابط لكل 1000 كلمة، وهو معدل ممتاز يشجع الزائر على البقاء لفترة أطول داخل الموقع.`,
      recommendationAr:
        'حافظ على فتح الروابط الداخلية في نفس النافذة دون إجبار القارئ على فتح تبويب جديد، مع تمييز الروابط بلون وخط سفلي واضح.',
      exampleAr: 'تأكد من فحص الروابط السياقية بانتظام لمنع تحولها إلى روابط معطلة (404 Broken Links).'
    });
  }

  // Suggestion 4: Orphan pages prevention & Silo structure
  suggestions.push({
    id: 'sug_orphan_prevention',
    type: 'orphan_prevention',
    titleAr: 'حماية الصفحات الهامة من خطر "الصفحات اليتيمة" (Orphan Pages Prevention)',
    priority: 'high',
    descriptionAr:
      'الصفحة اليتيمة هي صفحة موجودة على موقعك لكن لا يوجد أي رابط داخلي يشير إليها، مما يجعل زواحف جوجل تعجز عن أرشفتها ويفقدها تصنيفها بالكامل.',
    recommendationAr:
      'تأكد من وجود مسارات فتات الخبز (Breadcrumbs) في أعلى كل صفحة، وربط كافة الخدمات والمنتجات الجديدة من المقالات ذات الزيارات المرتفعة.',
    exampleAr: 'استخدم مسار فتات الخبز: الرئيسية > المقالات > تحسين محركات البحث > الروابط الداخلية'
  });

  return {
    totalInternalLinks: total,
    uniqueInternalUrls: uniqueUrls.size,
    contextualLinksCount: contextualCount,
    navigationalLinksCount: navigationalCount,
    genericAnchorCount: genericCount,
    emptyAnchorCount,
    linkHealthScore: healthScore,
    ratioPerThousandWords,
    clusters,
    topAnchors,
    sampleLinks: items.slice(0, 30),
    suggestions
  };
}
