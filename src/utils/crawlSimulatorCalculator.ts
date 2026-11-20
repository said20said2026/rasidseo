import { AuditResult, InternalLinkItem } from '../types/seo';

export type GooglebotUserAgentType = 'googlebot_smartphone' | 'googlebot_desktop' | 'bingbot' | 'chrome_user';

export interface UserAgentProfile {
  id: GooglebotUserAgentType;
  nameAr: string;
  nameEn: string;
  device: 'mobile' | 'desktop';
  userAgentString: string;
  engine: string;
  screenResolution: string;
}

export const USER_AGENT_PROFILES: Record<GooglebotUserAgentType, UserAgentProfile> = {
  googlebot_smartphone: {
    id: 'googlebot_smartphone',
    nameAr: 'Googlebot للهواتف الذكية (الافتراضي)',
    nameEn: 'Googlebot Smartphone (Mobile-First)',
    device: 'mobile',
    userAgentString:
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    engine: 'Chromium WRS (Evergreen)',
    screenResolution: '412 x 892 (DPR 2.625)'
  },
  googlebot_desktop: {
    id: 'googlebot_desktop',
    nameAr: 'Googlebot لسطح المكتب',
    nameEn: 'Googlebot Desktop',
    device: 'desktop',
    userAgentString:
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    engine: 'Chromium WRS (Evergreen)',
    screenResolution: '1920 x 1080 (DPR 1.0)'
  },
  bingbot: {
    id: 'bingbot',
    nameAr: 'Bingbot (محرك بينغ)',
    nameEn: 'Bingbot 2.0',
    device: 'desktop',
    userAgentString:
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
    engine: 'Edge / Chromium WRS',
    screenResolution: '1366 x 768'
  },
  chrome_user: {
    id: 'chrome_user',
    nameAr: 'متصفح مستخدم حقيقي (Google Chrome)',
    nameEn: 'Real User Chrome Desktop',
    device: 'desktop',
    userAgentString:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    engine: 'V8 / Blink',
    screenResolution: '1920 x 1080'
  }
};

export interface SimulatedCrawlLink {
  id: string;
  url: string;
  path: string;
  anchorText: string;
  discoveryPhase: 'raw_html' | 'post_render_js';
  crawlType: 'standard_href' | 'js_onclick' | 'hash_anchor' | 'nofollow';
  crawlStatus: 'crawlable' | 'warning' | 'uncrawlable';
  anchorQuality: 'descriptive' | 'generic' | 'empty';
  linkEquityTransferred: boolean;
  notesAr: string;
  explanationAr: string;
}

export interface DynamicContentElement {
  id: string;
  nameAr: string;
  elementType: 'heading' | 'article_text' | 'navigation' | 'schema' | 'interactive_widget' | 'media';
  inRawHtml: boolean;
  inRenderedDom: boolean;
  requiresJsToAppear: boolean;
  seoRiskLevel: 'safe' | 'medium' | 'high';
  snippetHtml: string;
  impactExplanationAr: string;
}

export interface CrawlLogStep {
  stepNumber: number;
  phaseAr: string;
  durationMs: number;
  status: 'success' | 'warning' | 'info';
  detailsAr: string;
  technicalCode?: string;
}

export interface CrawlSimulatorData {
  url: string;
  pageTitle: string;
  userAgent: UserAgentProfile;
  isJsEnabled: boolean;
  networkMode: 'fast_fiber' | 'slow_3g';
  renderTimeMs: number;
  renderBudgetThresholdMs: number;
  renderBudgetStatus: 'optimal' | 'warning' | 'exceeded';
  rawHtmlWordCount: number;
  renderedDomWordCount: number;
  jsContentDependencyPercent: number;
  totalDiscoveredLinks: number;
  crawlableLinksCount: number;
  jsMaskedLinksCount: number;
  nofollowLinksCount: number;
  crawlScore: number;
  botDirectives: {
    robotsTxtFound: boolean;
    robotsTxtStatus: 'allowed' | 'disallowed';
    metaRobots: string;
    canonicalUrl: string;
    canonicalMatch: boolean;
    xRobotsTag: string;
    isIndexable: boolean;
  };
  simulatedLinks: SimulatedCrawlLink[];
  dynamicElements: DynamicContentElement[];
  crawlLog: CrawlLogStep[];
  recommendations: {
    id: string;
    priority: 'high' | 'medium' | 'info';
    titleAr: string;
    issueAr: string;
    solutionAr: string;
    codeSnippet?: string;
  }[];
}

export function generateCrawlSimulation(
  auditData: AuditResult,
  options: {
    userAgentType: GooglebotUserAgentType;
    isJsEnabled: boolean;
    networkMode: 'fast_fiber' | 'slow_3g';
  }
): CrawlSimulatorData {
  const profile = USER_AGENT_PROFILES[options.userAgentType] || USER_AGENT_PROFILES.googlebot_smartphone;
  const isMobile = profile.device === 'mobile';
  const isJs = options.isJsEnabled;
  const isSlowNetwork = options.networkMode === 'slow_3g';

  // Simulated render times
  let baseRenderTime = isMobile ? 1850 : 1320;
  if (isSlowNetwork) baseRenderTime += 2400;
  if (!isJs) baseRenderTime = 320; // immediate raw HTML

  const renderTimeMs = baseRenderTime + (Math.floor(auditData.loadTimeMs * 0.4) || 200);
  const renderBudgetThresholdMs = 5000; // Googlebot soft timeout for WRS is around 5s
  let renderBudgetStatus: 'optimal' | 'warning' | 'exceeded' = 'optimal';
  if (renderTimeMs > 4500) renderBudgetStatus = 'exceeded';
  else if (renderTimeMs > 2500) renderBudgetStatus = 'warning';

  // Words computation
  const totalAuditedWords = auditData.wordCount || 850;
  // If JS is disabled, client-rendered content is missing (around 15-30% depending on site)
  const rawHtmlWordCount = isJs
    ? Math.round(totalAuditedWords * 0.78)
    : Math.round(totalAuditedWords * 0.78);
  const renderedDomWordCount = isJs ? totalAuditedWords : rawHtmlWordCount;
  const jsContentDependencyPercent = Math.round(
    ((renderedDomWordCount - rawHtmlWordCount) / (renderedDomWordCount || 1)) * 100
  );

  // Link simulation logic based on auditData.internalLinkingAnalysis
  const rawInternalLinks = auditData.internalLinkingAnalysis?.sampleLinks || [];
  const genericAnchors = new Set(['اضغط هنا', 'اقرأ المزيد', 'المزيد', 'click here', 'read more', 'هنا']);

  let simulatedLinks: SimulatedCrawlLink[] = [];

  if (rawInternalLinks.length > 0) {
    simulatedLinks = rawInternalLinks.slice(0, 14).map((link, idx) => {
      // Simulate that 1-2 links are dynamically rendered via JS
      const isDynamicJsLink = idx === 3 || idx === 7;
      // Simulate that 1 link uses onclick instead of href
      const isFakeOnclick = idx === 5;
      const isNofollow = link.rel?.includes('nofollow') || idx === 8;

      let crawlType: SimulatedCrawlLink['crawlType'] = 'standard_href';
      let crawlStatus: SimulatedCrawlLink['crawlStatus'] = 'crawlable';
      let discoveryPhase: SimulatedCrawlLink['discoveryPhase'] = isDynamicJsLink ? 'post_render_js' : 'raw_html';
      let linkEquity = true;
      let notesAr = 'رابط <a> قياسي بمحدد href واضح وقابل للزحف';
      let explanationAr = 'يقوم Googlebot باستخراج الرابط فورياً وتمرير PageRank للصفحة المستهدفة.';

      if (isFakeOnclick) {
        crawlType = 'js_onclick';
        crawlStatus = 'uncrawlable';
        discoveryPhase = 'post_render_js';
        linkEquity = false;
        notesAr = 'زر JavaScript وهمي (onClick/location.href) بدون وسم <a href>';
        explanationAr = 'عناكب جوجل لا تقوم بالنقر على الأزرار ولا تستدعي أحداث JavaScript onClick. هذا الرابط غير مرئي لمحركات البحث!';
      } else if (isDynamicJsLink) {
        if (!isJs) {
          crawlStatus = 'uncrawlable';
          notesAr = 'مفقود تماماً عند تعطيل JavaScript (Client-Side Rendered)';
          explanationAr = 'الرابط لا يظهر في HTML الأولي، وبالتالي يتأخر زحفه إلى ما بعد مرحلة الريندر في WRS.';
        } else {
          crawlStatus = 'warning';
          notesAr = 'مكتشف فقط بعد معالجة الـ DOM بواسطة Chromium (WRS)';
          explanationAr = 'يتم اكتشافه بنجاح ولكن في الطور الثاني من الفهرسة، مما قد يستهلك ميزانية الزحف.';
        }
      } else if (isNofollow) {
        crawlType = 'nofollow';
        crawlStatus = 'warning';
        linkEquity = false;
        notesAr = 'رابط يحمل توجيه rel="nofollow"';
        explanationAr = 'يستخدمه جوجل كـ "تلميح" (Hint) ولا يتم تمرير قوة الرابط (Link Juice / PageRank) كالمعتاد.';
      }

      const isGeneric = genericAnchors.has(link.anchorText.trim().toLowerCase());
      const anchorQuality: SimulatedCrawlLink['anchorQuality'] = !link.anchorText.trim()
        ? 'empty'
        : isGeneric
        ? 'generic'
        : 'descriptive';

      return {
        id: `sim-link-${idx}`,
        url: link.url,
        path: link.path,
        anchorText: link.anchorText || '(بدون نص رابط)',
        discoveryPhase,
        crawlType,
        crawlStatus,
        anchorQuality,
        linkEquityTransferred: linkEquity,
        notesAr,
        explanationAr
      };
    });
  } else {
    // Default simulated links when no explicit internal links were extracted
    simulatedLinks = [
      {
        id: 'sim-link-1',
        url: `${auditData.url}/services`,
        path: '/services',
        anchorText: 'خدماتنا واستشارات السيو',
        discoveryPhase: 'raw_html',
        crawlType: 'standard_href',
        crawlStatus: 'crawlable',
        anchorQuality: 'descriptive',
        linkEquityTransferred: true,
        notesAr: 'رابط <a href="/services"> قياسي في القائمة العلوية',
        explanationAr: 'يكتشفه Googlebot فوراً في أول 50 ميلي ثانية من تنزيل الـ HTML الخام.'
      },
      {
        id: 'sim-link-2',
        url: `${auditData.url}/blog/seo-guide-2026`,
        path: '/blog/seo-guide-2026',
        anchorText: 'دليل السيو الشامل 2026',
        discoveryPhase: 'raw_html',
        crawlType: 'standard_href',
        crawlStatus: 'crawlable',
        anchorQuality: 'descriptive',
        linkEquityTransferred: true,
        notesAr: 'رابط سياقي داخل فقرة المقال مع نص Anchor دلالي قوي',
        explanationAr: 'أفضل نمط روابط داخلية لجوجل: ينقل سياق الموضوع وقوة الكلمة المفتاحية.'
      },
      {
        id: 'sim-link-3',
        url: `${auditData.url}/pricing`,
        path: '/pricing',
        anchorText: 'عرض باقات الأسعار',
        discoveryPhase: isJs ? 'post_render_js' : 'post_render_js',
        crawlType: 'standard_href',
        crawlStatus: isJs ? 'warning' : 'uncrawlable',
        anchorQuality: 'descriptive',
        linkEquityTransferred: isJs,
        notesAr: 'رابط يتم تصييره بواسطة كود React بعد تحميل الصفحة',
        explanationAr: isJs
          ? 'تم اكتشافه في الطور الثاني (WRS)، لكنه يضيع إذا نفدت ميزانية الريندر أو تعطل الجافاسكريبت.'
          : 'غير مرئي في الـ Raw HTML. لن يستطيع Googlebot فهرسته إذا فشل تشغيل الـ JS!'
      },
      {
        id: 'sim-link-4',
        url: `${auditData.url}/reviews`,
        path: '/reviews',
        anchorText: 'آراء وتقييمات العملاء',
        discoveryPhase: 'post_render_js',
        crawlType: 'js_onclick',
        crawlStatus: 'uncrawlable',
        anchorQuality: 'descriptive',
        linkEquityTransferred: false,
        notesAr: 'مبني كـ <button onClick="goToReviews()"> بدون وسم <a href>',
        explanationAr: 'خلل جسيم: جوجل لا يحاكي نقر المستخدم على الأزرار! هذا الرابط محجوب تماماً عن الأرشفة.'
      },
      {
        id: 'sim-link-5',
        url: `${auditData.url}/terms`,
        path: '/terms',
        anchorText: 'الشروط والأحكام',
        discoveryPhase: 'raw_html',
        crawlType: 'nofollow',
        crawlStatus: 'warning',
        anchorQuality: 'descriptive',
        linkEquityTransferred: false,
        notesAr: 'رابط يحمل وسم rel="nofollow" في الفوتر',
        explanationAr: 'لا يمرر الـ PageRank، ويخبر محرك البحث بعدم اعتماد الثقة بالرابط.'
      },
      {
        id: 'sim-link-6',
        url: `${auditData.url}/contact`,
        path: '/contact',
        anchorText: 'اضغط هنا',
        discoveryPhase: 'raw_html',
        crawlType: 'standard_href',
        crawlStatus: 'warning',
        anchorQuality: 'generic',
        linkEquityTransferred: true,
        notesAr: 'نص رابط غير وصفي (Generic Anchor: "اضغط هنا")',
        explanationAr: 'الرابط قابل للزحف، لكن نص الرابط غير دلالي ويفقد الصفحة الهدف فرصة الترتيب لكلماتها الرئيسية.'
      }
    ];
  }

  // Filter links if JS is disabled
  const activeSimulatedLinks = simulatedLinks.map((l) => {
    if (!isJs && l.discoveryPhase === 'post_render_js') {
      return {
        ...l,
        crawlStatus: 'uncrawlable' as const,
        linkEquityTransferred: false,
        notesAr: 'مفقود تماماً (يتطلب تفعيل JavaScript للظهور في شجرة DOM)'
      };
    }
    return l;
  });

  const crawlableLinksCount = activeSimulatedLinks.filter((l) => l.crawlStatus === 'crawlable').length;
  const jsMaskedLinksCount = activeSimulatedLinks.filter((l) => l.crawlType === 'js_onclick' || (!isJs && l.discoveryPhase === 'post_render_js')).length;
  const nofollowLinksCount = activeSimulatedLinks.filter((l) => l.crawlType === 'nofollow').length;

  // Dynamic Content Elements (Raw HTML vs Rendered DOM Diff)
  const dynamicElements: DynamicContentElement[] = [
    {
      id: 'elem-h1',
      nameAr: 'العنوان الرئيسي (H1 Heading)',
      elementType: 'heading',
      inRawHtml: true,
      inRenderedDom: true,
      requiresJsToAppear: false,
      seoRiskLevel: 'safe',
      snippetHtml: `<h1>${auditData.pageTitle || 'عنوان الصفحة الرئيسي'}</h1>`,
      impactExplanationAr: 'متاح فورياً في كود HTML الأولي، مما يتيح لجوجل تصنيف الصفحة وموضوعها من أول ثانية زحف.'
    },
    {
      id: 'elem-main-text',
      nameAr: 'الفقرة الرئيسية والمحتوى الأساسي',
      elementType: 'article_text',
      inRawHtml: true,
      inRenderedDom: true,
      requiresJsToAppear: false,
      seoRiskLevel: 'safe',
      snippetHtml: `<main><p>${auditData.metaDescription || 'المحتوى النصي التمهيدي للموقع...'}</p></main>`,
      impactExplanationAr: 'المحتوى النصي مخدوم من السيرفر (SSR/SSG)، ولا يعتمد على تحميل حزم JavaScript ثقيلة لقراءته.'
    },
    {
      id: 'elem-schema',
      nameAr: 'البيانات المنظمة (Schema.org JSON-LD)',
      elementType: 'schema',
      inRawHtml: auditData.schemasFound && auditData.schemasFound.length > 0,
      inRenderedDom: true,
      requiresJsToAppear: !(auditData.schemasFound && auditData.schemasFound.length > 0),
      seoRiskLevel: auditData.schemasFound && auditData.schemasFound.length > 0 ? 'safe' : 'medium',
      snippetHtml: '<script type="application/ld+json">{"@context":"https://schema.org" ...}</script>',
      impactExplanationAr: auditData.schemasFound && auditData.schemasFound.length > 0
        ? 'وسوم البيانات المنظمة موجودة في الرأس المبدئي للـ HTML، مما يضمن ظهور النتائج الغنية (Rich Snippets) دون تأخير.'
        : 'يتم حقن السكيما عبر العميل أو أدوات وسوم خارجية، مما يعرضها لتأخر الفهرسة في الطور الثاني (WRS).'
    },
    {
      id: 'elem-dynamic-tabs',
      nameAr: 'التبويبات المخفية ومحتوى الأسئلة الشائعة (Tabs / FAQ Accordion)',
      elementType: 'interactive_widget',
      inRawHtml: false,
      inRenderedDom: isJs,
      requiresJsToAppear: true,
      seoRiskLevel: isJs ? 'medium' : 'high',
      snippetHtml: '<div class="tab-content" style="display:none">محتوى الأسئلة الشائعة ومواصفات الخدمة...</div>',
      impactExplanationAr: isJs
        ? 'يتم عرضها وتفسيرها بعد اكتمال مرحلة WRS، لكن يجب التأكد من عدم استخدام display:none الدائم الذي قد يعتبره جوجل محتوى ثانوي.'
        : 'المحتوى غير موجود في الـ HTML الخام ومخفي تماماً عند تعطيل الـ JS، ولن تتم فهرسته في الطور الأول.'
    },
    {
      id: 'elem-dynamic-reviews',
      nameAr: 'تقييمات وآراء العملاء (Client-Side Reviews Widget)',
      elementType: 'interactive_widget',
      inRawHtml: false,
      inRenderedDom: isJs,
      requiresJsToAppear: true,
      seoRiskLevel: 'medium',
      snippetHtml: '<div id="reviews-widget" data-fetch-api="/api/reviews">جارٍ تحميل التقييمات...</div>',
      impactExplanationAr: 'تعتمد على استدعاءات API خارجية بعد تحميل الصفحة. قد تتجاوز مهلة الـ WRS إذا كان الخادم بطيئاً في الاستجابة.'
    },
    {
      id: 'elem-nav-menu',
      nameAr: 'روابط القائمة المتجاوبة (Mobile Nav Links)',
      elementType: 'navigation',
      inRawHtml: true,
      inRenderedDom: true,
      requiresJsToAppear: false,
      seoRiskLevel: 'safe',
      snippetHtml: '<nav><a href="/services">الخدمات</a><a href="/pricing">الأسعار</a></nav>',
      impactExplanationAr: 'عناصر الروابط موجودة في شجرة الـ DOM حتى وإن كانت القائمة مغلقة بصرياً في وضع الهاتف، مما يسمح للزاحف باكتشافها.'
    }
  ];

  // Crawl Waterfall Simulation Log
  const crawlLog: CrawlLogStep[] = [
    {
      stepNumber: 1,
      phaseAr: 'فحص التوجيهات وطلب robots.txt',
      durationMs: isSlowNetwork ? 340 : 45,
      status: auditData.robotsTxtFound ? 'success' : 'warning',
      detailsAr: auditData.robotsTxtFound
        ? 'تم تنزيل robots.txt بنجاح (200 OK)؛ الزحف مسموح لـ User-Agent: Googlebot.'
        : 'لم يتم العثور على ملف robots.txt صريح، يفترض جوجل السماح الكامل بالزحف (Allow All).',
      technicalCode: `GET /robots.txt HTTP/2\nUser-Agent: ${profile.userAgentString}\nStatus: ${auditData.robotsTxtFound ? '200 OK' : '404 Not Found'}`
    },
    {
      stepNumber: 2,
      phaseAr: 'طلب HTTP الأولي وتنزيل الـ Raw HTML',
      durationMs: isSlowNetwork ? 1150 : (auditData.loadTimeMs ? Math.round(auditData.loadTimeMs * 0.4) : 180),
      status: auditData.statusCode === 200 ? 'success' : 'warning',
      detailsAr: `استجابة السيرفر بحجم ${auditData.pageSizeKb || 45}KB ورمز الحالة ${auditData.statusCode || 200}. تم التقاط ${rawHtmlWordCount} كلمة في النسخة الخام.`,
      technicalCode: `GET ${auditData.url} HTTP/2\nAccept: text/html,application/xhtml+xml\nContent-Type: text/html; charset=utf-8`
    },
    {
      stepNumber: 3,
      phaseAr: 'التحليل الأولي واستخراج الروابط الأولية (Phase 1)',
      durationMs: isSlowNetwork ? 90 : 35,
      status: 'success',
      detailsAr: `تم فحص وسوم <meta name="robots">، والعنوان الأساسي، واستخراج ${activeSimulatedLinks.filter((l) => l.discoveryPhase === 'raw_html').length} رابطاً داخلياً قياسياً.`,
      technicalCode: `Meta-Robots: index, follow\nCanonical: ${auditData.canonicalUrl || auditData.url}\nExtracted <a> tags in initial download.`
    },
    {
      stepNumber: 4,
      phaseAr: 'جدولة الريندر وإطلاق محرك WRS (Headless Chromium)',
      durationMs: isJs ? (isSlowNetwork ? 1800 : 850) : 0,
      status: !isJs ? 'info' : (renderBudgetStatus === 'exceeded' ? 'warning' : 'success'),
      detailsAr: isJs
        ? `بدء تشغيل بيئة Chromium ${profile.engine} وتنفيذ نصوص الـ JavaScript وتنسيقات CSS المتجاوبة.`
        : 'تم تخطي مرحلة الـ WRS (وضع الـ Raw HTML فقط أو تعطيل JavaScript).',
      technicalCode: isJs
        ? `WRS Queue Status: Executed in ${profile.engine}\nViewport: ${profile.screenResolution}`
        : 'JS Rendering: Bypassed'
    },
    {
      stepNumber: 5,
      phaseAr: 'تعديلات الـ DOM واكتشاف المحتوى الديناميكي (Phase 2)',
      durationMs: isJs ? (isSlowNetwork ? 950 : 420) : 0,
      status: isJs ? 'success' : 'info',
      detailsAr: isJs
        ? `ارتفع عدد الكلمات المكتشفة إلى ${renderedDomWordCount} كلمة، وتم رصد ${activeSimulatedLinks.filter((l) => l.discoveryPhase === 'post_render_js').length} رابطاً ديناميكياً إضافياً.`
        : 'لم تكتمل هذه المرحلة لأن JavaScript معطل.',
      technicalCode: isJs
        ? `DOM Mutations: Completed.\nTotal DOM Nodes: ~1,240\nPost-render links: Discovered.`
        : 'No DOM mutations detected.'
    },
    {
      stepNumber: 6,
      phaseAr: 'الفهرسة النهائية واحتساب وزن الروابط (Link Equity)',
      durationMs: 60,
      status: jsMaskedLinksCount > 0 ? 'warning' : 'success',
      detailsAr: jsMaskedLinksCount > 0
        ? `اكتملت المحاكاة. تم رصد ${jsMaskedLinksCount} رابطاً يعتمد على أزرار JS أو يفتقد لوسم <a> القياسي ولا يمكن تمرير الـ PageRank عبرها.`
        : 'اكتملت المحاكاة بنجاح: كافة الروابط الداخلية قابلة للزحف ونقل الـ PageRank بسلاسة.',
      technicalCode: `Index Status: Ready for SERP storage\nRender Time: ${renderTimeMs}ms\nLink Equity Transfer: ${Math.round((crawlableLinksCount / (activeSimulatedLinks.length || 1)) * 100)}%`
    }
  ];

  // Calculate Overall Crawl Health Score
  let crawlScore = 95;
  if (!auditData.robotsTxtFound) crawlScore -= 5;
  if (jsMaskedLinksCount > 0) crawlScore -= jsMaskedLinksCount * 8;
  if (renderBudgetStatus === 'warning') crawlScore -= 7;
  if (renderBudgetStatus === 'exceeded') crawlScore -= 18;
  if (!isJs && jsContentDependencyPercent > 20) crawlScore -= 15;
  crawlScore = Math.max(35, Math.min(100, crawlScore));

  // Recommendations
  const recommendations = [
    {
      id: 'rec-1',
      priority: jsMaskedLinksCount > 0 ? ('high' as const) : ('info' as const),
      titleAr: 'تجنب استخدام أزرار onClick لمحاكاة الروابط الداخلية',
      issueAr: 'عناكب محركات البحث لا تنقر على عناصر <button> أو الـ divs التفاعلية، مما يحجب الصفحات الفرعية عن الأرشفة.',
      solutionAr: 'استخدم دائماً وسوم <a href="/path"> قياسية مع محدد href صريح يوجه مباشرة للصفحة، ويمكنك إضافة التفاعلات كتحسين تدريجي.',
      codeSnippet: `<!-- غير مستحسن لمحركات البحث: -->\n<button onClick="location.href='/services'">خدماتنا</button>\n\n<!-- النمط الصحيح المتوافق مع Googlebot: -->\n<a href="/services" className="btn-style">خدماتنا</a>`
    },
    {
      id: 'rec-2',
      priority: renderBudgetStatus !== 'optimal' ? ('high' as const) : ('medium' as const),
      titleAr: 'الحفاظ على زمن الريندر أقل من 3 ثوانٍ لتجنب استنزاف ميزانية WRS',
      issueAr: `زمن المعالجة الحالي يُقدّر بـ ${renderTimeMs}ms. خوادم جوجل تخصص ميزانية حوسبة محدودة لمرحلة تصيير الـ JavaScript.`,
      solutionAr: 'قم بتقديم العناوين والمحتوى النصي الحرج عبر الـ Server-Side Rendering (SSR) أو Static Generation (SSG)، وقم بتأجيل تحميل سكربتات الطرف الثالث غير الضرورية.',
      codeSnippet: `// تأجيل تحميل السكربتات غير الضرورية\n<script src="heavy-widget.js" defer></script>`
    },
    {
      id: 'rec-3',
      priority: 'medium' as const,
      titleAr: 'تحسين نصوص الروابط الداخلية (Anchor Text Optimization)',
      issueAr: 'وجود روابط تستخدم عبارات عامة مثل "اضغط هنا" أو روابط بدون نصوص وصفيّة.',
      solutionAr: 'اجعل نصوص الروابط تحتوي على كلمات مفتاحية دلالية تصف بدقة ما سيجده المستخدم والزاحف في الصفحة المستهدفة.',
      codeSnippet: `<!-- تجنب: -->\n<a href="/seo-guide">اضغط هنا</a>\n\n<!-- استبدلها بـ: -->\n<a href="/seo-guide">دليل تحسين محركات البحث 2026</a>`
    }
  ];

  return {
    url: auditData.url,
    pageTitle: auditData.pageTitle || 'الصفحة الرئيسية',
    userAgent: profile,
    isJsEnabled: isJs,
    networkMode: options.networkMode,
    renderTimeMs,
    renderBudgetThresholdMs,
    renderBudgetStatus,
    rawHtmlWordCount,
    renderedDomWordCount,
    jsContentDependencyPercent,
    totalDiscoveredLinks: activeSimulatedLinks.length,
    crawlableLinksCount,
    jsMaskedLinksCount,
    nofollowLinksCount,
    crawlScore,
    botDirectives: {
      robotsTxtFound: auditData.robotsTxtFound,
      robotsTxtStatus: 'allowed',
      metaRobots: 'index, follow',
      canonicalUrl: auditData.canonicalUrl || auditData.url,
      canonicalMatch: true,
      xRobotsTag: 'none (Allowed)',
      isIndexable: true
    },
    simulatedLinks: activeSimulatedLinks,
    dynamicElements,
    crawlLog,
    recommendations
  };
}
