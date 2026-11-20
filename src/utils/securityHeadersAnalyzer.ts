import {
  SecurityHeadersAnalysis,
  CSPDirectiveItem,
  CSPRecommendationItem
} from '../types/seo.js';

export interface RawHeadersInput {
  hsts?: string;
  csp?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

export function analyzeSecurityHeaders(
  raw: RawHeadersInput,
  targetUrl: string
): SecurityHeadersAnalysis {
  let isHttps = false;
  try {
    isHttps = new URL(targetUrl).protocol === 'https:';
  } catch {
    isHttps = targetUrl.startsWith('https://');
  }

  // --- 1. Analyze CSP (Content Security Policy) ---
  const cspHeader = (raw.csp || '').trim();
  const cspFound = cspHeader.length > 0;

  const cspDirectivesMap: Record<string, string[]> = {};
  if (cspFound) {
    const rawDirectives = cspHeader.split(';').map(d => d.trim()).filter(Boolean);
    for (const d of rawDirectives) {
      const parts = d.split(/\s+/);
      const directiveName = parts[0]?.toLowerCase();
      if (directiveName) {
        cspDirectivesMap[directiveName] = parts.slice(1);
      }
    }
  }

  const hasUnsafeInline = cspHeader.includes("'unsafe-inline'");
  const hasUnsafeEval = cspHeader.includes("'unsafe-eval'");
  const hasWildcard = cspHeader.split(/\s+/).some(p => p === '*' || p === 'https:*');
  const hasNonce = /'nonce-[a-zA-Z0-9+/=_-]+'/i.test(cspHeader);
  const hasHash = /'(sha256|sha384|sha512)-[a-zA-Z0-9+/=_-]+'/i.test(cspHeader);
  const hasStrictDynamic = cspHeader.includes("'strict-dynamic'");

  const objectSrcValues = cspDirectivesMap['object-src'] || [];
  const defaultSrcValues = cspDirectivesMap['default-src'] || [];
  const hasObjectSrcNone = objectSrcValues.includes("'none'") || (objectSrcValues.length === 0 && defaultSrcValues.includes("'none'"));

  const baseUriValues = cspDirectivesMap['base-uri'] || [];
  const hasBaseUriSelf = baseUriValues.includes("'self'") || baseUriValues.includes("'none'");

  const frameAncestorsValues = cspDirectivesMap['frame-ancestors'] || [];
  const hasFrameAncestors = frameAncestorsValues.length > 0 && !frameAncestorsValues.includes('*');

  const hasRequireTrustedTypes = cspHeader.toLowerCase().includes('require-trusted-types-for');
  const hasViolationReporting = Boolean(cspDirectivesMap['report-uri'] || cspDirectivesMap['report-to']);

  const directiveDescriptions: Record<string, string> = {
    'default-src': 'المصدر الافتراضي لجميع أنواع الموارد غير المحددة صراحة.',
    'script-src': 'يقيد مصادر ملفات وأكواد JavaScript لمنع تنفيذ سكربتات XSS الخبيثة.',
    'style-src': 'يحدد مصادر ملفات التنسيق CSS لمنع حقن واجهات مزيفة.',
    'img-src': 'يحدد النطاقات المسموح بتحميل الصور منها.',
    'connect-src': 'يقيد جهات اتصال XHR و Fetch و WebSockets لمنع تسريب البيانات المسروقة.',
    'object-src': 'يتحكم في كائنات Flash والمكونات الإضافية القديمة (يُوصى بـ \'none\').',
    'base-uri': 'يقيد قيم وسم <base> لمنع تحويل الروابط النسبية.',
    'frame-ancestors': 'يمنع تضمين الموقع في إطارات <iframe> لحماية من هجمات Clickjacking.',
    'require-trusted-types-for': 'يفرض فحص الكائنات المنقحة قبل تمريرها لدوال الـ DOM لمنع DOM XSS.',
    'report-to': 'يحدد نقطة نهاية لاستلام تقارير انتهاكات أمان المحتوى تلقائياً.'
  };

  const directiveItems: CSPDirectiveItem[] = [];
  const importantDirectives = [
    'default-src',
    'script-src',
    'style-src',
    'img-src',
    'connect-src',
    'object-src',
    'base-uri',
    'frame-ancestors'
  ];

  for (const dName of importantDirectives) {
    const values = cspDirectivesMap[dName];
    if (values && values.length > 0) {
      let status: CSPDirectiveItem['status'] = 'secure';

      if (dName === 'script-src') {
        if (values.includes("'unsafe-inline'") || values.includes("'unsafe-eval'") || values.includes('*')) {
          status = 'unsafe';
        } else if (values.includes('https:') || values.some(v => v.includes('*.'))) {
          status = 'warning';
        }
      } else if (values.includes('*')) {
        status = 'warning';
      }

      directiveItems.push({
        directive: dName,
        values,
        status,
        descriptionAr: directiveDescriptions[dName] || 'ترويسة فرعية للتحكم في الموارد.'
      });
    } else if (cspFound) {
      // Missing specific directive
      directiveItems.push({
        directive: dName,
        values: [],
        status: dName === 'object-src' || dName === 'script-src' ? 'warning' : 'missing',
        descriptionAr: directiveDescriptions[dName] || 'غير محددة صراحة في الترويسة.'
      });
    }
  }

  // --- Comprehensive Anti-XSS Recommendations List ---
  const recommendations: CSPRecommendationItem[] = [
    {
      id: 'rec_csp_presence',
      category: 'critical',
      priority: 1,
      isFulfilled: cspFound,
      directiveName: 'default-src / script-src',
      threatTypeAr: 'حقن السكربتات الشامل (Cross-Site Scripting)',
      titleAr: 'تفعيل ترويسة سياسة أمان المحتوى (CSP) في استجابة الخادم',
      descriptionAr: cspFound
        ? 'ترويسة Content-Security-Policy مرصودة ونشطة في استجابات HTTP الخاصة بموقعك.'
        : 'الموقع يفتقر إلى ترويسة Content-Security-Policy، مما يترك المتصفح دون أي تعليمات لتقييد مصادر الأكواد البرمجية عند وقوع حقن محتوى.',
      impactAr: 'تشكل ترويسة CSP الجدار الدفاعي الأول ضد ثغرات XSS، وتمنع تنفيذ السكربتات المجهولة حتى لو نجح المخترق في تمريرها لصفحات الموقع.',
      recommendedDirective: "default-src 'self'; script-src 'self';",
      codeSnippet: `add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none'; base-uri 'self';" always;`
    },
    {
      id: 'rec_no_unsafe_inline',
      category: 'critical',
      priority: 1,
      isFulfilled: cspFound && !hasUnsafeInline,
      directiveName: 'script-src',
      threatTypeAr: 'تشغيل الأكواد المضمنة (Inline XSS & Event Handlers)',
      titleAr: "التخلص من استثناء 'unsafe-inline' واعتماد تشفير Nonce أو التجزئة (Hash)",
      descriptionAr: !cspFound
        ? "يجب تجنب إدراج 'unsafe-inline' عند صياغة ترويسة CSP."
        : hasUnsafeInline
        ? "الترويسة الحالية تحتوي على 'unsafe-inline' في توجيه script-src، مما يلغي فاعلية الحماية ضد هجمات XSS المضمنة."
        : "ممتاز! السكربتات المضمنة مقيدة ولا يوجد استثناء 'unsafe-inline' غير آمن.",
      impactAr: "إزالة 'unsafe-inline' تمنع تشغيل وسوم <script>alert(1)</script> ومعالجات الأحداث مثل <img onerror=...> الممررة في حقول الإدخال أو التعليقات.",
      recommendedDirective: "script-src 'self' 'nonce-{RANDOM_KEY}'",
      codeSnippet: `// مثال استخدام Nonce في Express / Node.js
const nonce = crypto.randomBytes(16).toString('base64');
res.setHeader('Content-Security-Policy', \`script-src 'self' 'nonce-\${nonce}';\`);`
    },
    {
      id: 'rec_no_unsafe_eval',
      category: 'critical',
      priority: 1,
      isFulfilled: cspFound && !hasUnsafeEval,
      directiveName: 'script-src',
      threatTypeAr: 'تنفيذ الأكواد الديناميكية (DOM-based XSS via eval)',
      titleAr: "حظر التقييم البرمجي 'unsafe-eval' وسد ثغرات التنفيذ الديناميكي",
      descriptionAr: !cspFound
        ? "يجب الامتناع عن تمكين 'unsafe-eval' عند تفعيل CSP."
        : hasUnsafeEval
        ? "تم رصد 'unsafe-eval' في الترويسة، مما يسمح بتشغيل نصوص برمجية مولدة ديناميكياً عبر eval() و Function()."
        : "ممتاز! التقييم البرمجي الديناميكي محظور ومحمي من استدعاءات eval() غير الآمنة.",
      impactAr: "يمنع المخترق من استغلال دوال eval() أو setTimeout(string) لتحويل المدخلات النصية الخبيثة إلى أوامر JavaScript تنفيذية.",
      recommendedDirective: "إزالة 'unsafe-eval' من توجيه script-src والاكتفاء بـ 'self' والمصادر الموثوقة",
      codeSnippet: `// تجنب استخدام eval() واعتمد المحلل الآمن:
const safeData = JSON.parse(rawJsonString);`
    },
    {
      id: 'rec_no_wildcards',
      category: 'important',
      priority: 2,
      isFulfilled: cspFound && !hasWildcard,
      directiveName: 'script-src / connect-src',
      threatTypeAr: 'تحميل موارد من نطاقات مفتوحة (Wildcard Injection)',
      titleAr: 'تجنب الرموز الشاملة (*) وتحديد النطاقات الموثوقة بدقة',
      descriptionAr: hasWildcard
        ? "الترويسة الحالية تستخدم الرمز الشامل (*) أو 'https:*'، مما يسمح بتحميل السكربتات أو إرسال البيانات لأي خادم على الإنترنت."
        : "الترويسة لا تستخدم رموزاً شاملة غير مقيدة في مسارات المصادر الحساسة.",
      impactAr: 'تحديد النطاقات بدقة يمنع المهاجم من استيراد مكتبات خبيثة من خوادم مجانية أو استغلال ثغرات JSONP على مواقع خارجية.',
      recommendedDirective: "script-src 'self' https://cdn.example.com",
      codeSnippet: `add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://trusted-cdn.com; connect-src 'self' https://api.yoursite.com;" always;`
    },
    {
      id: 'rec_object_src_none',
      category: 'important',
      priority: 2,
      isFulfilled: hasObjectSrcNone,
      directiveName: 'object-src',
      threatTypeAr: 'ثغرات الإضافات القديمة وتجاوز السياسات (Plugin-based XSS)',
      titleAr: "تعطيل كائنات الفلاش والإضافات القديمة عبر object-src 'none'",
      descriptionAr: hasObjectSrcNone
        ? "ممتاز! تم حظر كائنات الفلاش والإضافات الخارجية بنجاح عبر object-src 'none'."
        : "توجيه object-src غير مضبوط على 'none' أو مفقود، مما يفتح الباب لاستغلال كائنات Flash القديمة أو عناصر <object> / <embed>.",
      impactAr: 'إغلاق نافذة تشغيل ملفات SWF أو ملحقات المتصفح غير المدعومة التي تمكن المخترقين تاريخياً من تجاوز قيود XSS.',
      recommendedDirective: "object-src 'none'",
      codeSnippet: `object-src 'none';`
    },
    {
      id: 'rec_base_uri_self',
      category: 'important',
      priority: 2,
      isFulfilled: hasBaseUriSelf,
      directiveName: 'base-uri',
      threatTypeAr: 'اختطاف وسم القاعدة (Base-Tag Hijacking)',
      titleAr: "تقييد وسم القاعدة base-uri لمنع تحويل الروابط النسبية",
      descriptionAr: hasBaseUriSelf
        ? "ممتاز! وسم القاعدة مقيد بـ 'self' لمنع إعادة توجيه مسارات السكربتات النسبية."
        : "توجيه base-uri مفقود، مما يسمح بحقن وسم <base href='https://evil.com/'> وتحويل روابط السكربتات النسبية لخادم المهاجم.",
      impactAr: 'يضمن أن أي استدعاء نسبي لملفات JavaScript مثل <script src="/app.js"> يُحمل دائماً من خادمك الأصلي حصراً.',
      recommendedDirective: "base-uri 'self'",
      codeSnippet: `base-uri 'self';`
    },
    {
      id: 'rec_frame_ancestors',
      category: 'important',
      priority: 2,
      isFulfilled: hasFrameAncestors,
      directiveName: 'frame-ancestors',
      threatTypeAr: 'التضمين الخبيث وخطف النقرات (Clickjacking & UI Redressing)',
      titleAr: "حماية الموقع من التأطير في نوافذ خبيثة عبر frame-ancestors",
      descriptionAr: hasFrameAncestors
        ? "ممتاز! تم تحديد النطاقات المسموح لها بتضمين موقعك داخل <iframe> بنجاح."
        : "توجيه frame-ancestors غير محدد، مما قد يسمح لمواقع التصيد بتضمين صفحات موقعك لخداع المستخدمين.",
      impactAr: 'يعد البديل العصري لترويسة X-Frame-Options ويوفر تحكماً أدق في منع تأطير موقعك في صفحات احتيالية.',
      recommendedDirective: "frame-ancestors 'self'",
      codeSnippet: `frame-ancestors 'self';`
    },
    {
      id: 'rec_strict_dynamic',
      category: 'best_practice',
      priority: 3,
      isFulfilled: hasStrictDynamic,
      directiveName: 'script-src',
      threatTypeAr: 'إدارة سلاسل السكربتات المعقدة (Strict CSP Architecture)',
      titleAr: "اعتماد سياسة 'strict-dynamic' للتحكم الذكي بسلاسل التبعيات",
      descriptionAr: hasStrictDynamic
        ? "ممتاز! يتم استخدام 'strict-dynamic' لتمرير الثقة البرمجية للسكربتات التابعة المحملة بـ Nonce."
        : "توجيه 'strict-dynamic' غير مفعل. يُوصى به في التطبيقات الحديثة لتجنب الحاجة لصيانة قوائم نطاقات بيضاء طويلة ومتقلبة.",
      impactAr: 'يسمح لأي سكربت موثوق يحمل nonce ساري المفعول بتحميل مكتبات برمجية إضافية بشكل آلي دون إيقافها من الـ CSP.',
      recommendedDirective: "script-src 'nonce-{RANDOM}' 'strict-dynamic'",
      codeSnippet: `script-src 'nonce-RANDOM_BASE64' 'strict-dynamic';`
    },
    {
      id: 'rec_trusted_types',
      category: 'best_practice',
      priority: 3,
      isFulfilled: hasRequireTrustedTypes,
      directiveName: 'require-trusted-types-for',
      threatTypeAr: 'هجمات DOM XSS على واجهات التطبيق البرمجية',
      titleAr: "تفعيل الأنواع الموثوقة (Trusted Types) لحصانة متكاملة في المتصفح",
      descriptionAr: hasRequireTrustedTypes
        ? "ممتاز! تم تفعيل Trusted Types لتقييد دوال حقن الـ DOM الحساسة مثل innerHTML."
        : "توجيه require-trusted-types-for غير مفعل. يعد أعلى معايير الحماية الحديثة الموصى بها من Google للقضاء على ثغرات DOM XSS.",
      impactAr: 'يرفض المتصفح أي تمرير لنص عادي غير منقح إلى دوال الـ DOM الخطرة (مثل element.innerHTML أو script.src) ويعتمد كائنات منقحة فقط.',
      recommendedDirective: "require-trusted-types-for 'script'",
      codeSnippet: `require-trusted-types-for 'script';`
    },
    {
      id: 'rec_violation_reporting',
      category: 'best_practice',
      priority: 3,
      isFulfilled: hasViolationReporting,
      directiveName: 'report-to / report-uri',
      threatTypeAr: 'مراقبة محاولات الاختراق ورصد الانتهاكات (Incident Reporting)',
      titleAr: 'ضبط مسار لإرسال تقارير انتهاك السياسة وتحليل محاولات الحقن',
      descriptionAr: hasViolationReporting
        ? 'ممتاز! تم ضبط مسار الإبلاغ عن الانتهاكات لمراقبة أي محاولات مشبوهة لحظياً.'
        : 'لا يوجد مسار لتسجيل الانتهاكات (Reporting Endpoint)، مما يعني عدم علمك بأي محاولة حقن سكربت خبيث يتم حظرها لدى الزائر.',
      impactAr: 'يرسل المتصفح تقريراً مشفراً بصيغة JSON فور حظر أي سكربت خبيث، مما يتيح لفريق الأمن تحليل الهجوم ومعرفة مصدره فورياً.',
      recommendedDirective: "report-to csp-endpoint; or report-uri /api/csp-report;",
      codeSnippet: `report-to csp-endpoint;\n// أو التوجيه القديم المدعوم:\nreport-uri /api/csp-violations;`
    }
  ];

  // Specific CSP XSS Hardening score & grade
  let cspScore = 0;
  if (cspFound) {
    cspScore += 30; // base presence
    if (!hasUnsafeInline) cspScore += 20;
    if (!hasUnsafeEval) cspScore += 15;
    if (!hasWildcard) cspScore += 10;
    if (hasObjectSrcNone) cspScore += 10;
    if (hasBaseUriSelf) cspScore += 5;
    if (hasFrameAncestors) cspScore += 5;
    if (hasNonce || hasHash || hasStrictDynamic) cspScore += 3;
    if (hasRequireTrustedTypes || hasViolationReporting) cspScore += 2;
  }
  cspScore = Math.min(100, Math.max(0, cspScore));

  let cspGrade: SecurityHeadersAnalysis['grade'] = 'F';
  if (cspScore >= 90) cspGrade = 'A+';
  else if (cspScore >= 80) cspGrade = 'A';
  else if (cspScore >= 65) cspGrade = 'B';
  else if (cspScore >= 50) cspGrade = 'C';
  else if (cspScore >= 30) cspGrade = 'D';
  else cspGrade = 'F';

  // Determine XSS Protection status
  let xssStatus: 'protected' | 'partial' | 'vulnerable' = 'vulnerable';
  let xssBadgeAr = 'غير محمي من هجمات XSS';
  let xssDescriptionAr = 'الموقع لا يرسل ترويسة Content-Security-Policy، مما يجعله عرضة لهجمات حقن السكربتات وسرقة جلسات المستخدمين (Session Hijacking).';
  const xssRisksAr: string[] = [];

  if (!cspFound) {
    xssStatus = 'vulnerable';
    xssBadgeAr = 'معرض لخطر هجمات XSS';
    xssDescriptionAr =
      'عدم تفعيل سياسة أمان المحتوى (CSP) يتيح لأي كود برمجي خبيث يتم حقنه في الصفحة (عبر تعليق، أو حقل إدخال، أو ثغرة في مكتبة طرف ثالث) الوصول إلى ملفات تعريف الارتباط وتنفيذ أوامر بصلاحيات الزائر.';
    xssRisksAr.push('إمكانية حقن ملفات JavaScript خبيثة من نطاقات مجهولة.');
    xssRisksAr.push('سرقة بيانات الـ Cookies و tokens الجلسة للزوار والمدراء.');
    xssRisksAr.push('استغلال الموقع في هجمات إعادة التوجيه أو التعدين الخبيث.');
  } else if (hasUnsafeInline || hasUnsafeEval || hasWildcard || !cspDirectivesMap['script-src']) {
    xssStatus = 'partial';
    xssBadgeAr = 'حماية جزئية (تحتوي استثناءات خطرة)';
    xssDescriptionAr =
      'ترويسة CSP مفعلة ولكنها تحتوي على استثناءات غير آمنة مثل \'unsafe-inline\' أو نصوص برمجية غير مقيدة، مما يُضعف جدار الصد أمام هجمات XSS المتقدمة.';
    if (hasUnsafeInline) xssRisksAr.push('استخدام \'unsafe-inline\' يسمح بتنفيذ سكربتات مضمنة مباشرة داخل وسوم HTML.');
    if (hasUnsafeEval) xssRisksAr.push('استخدام \'unsafe-eval\' يسمح بدوال توليد الأكواد الديناميكية eval().');
    if (hasWildcard) xssRisksAr.push('استخدام الرمز الشامل (*) يسمح بتحميل الموارد من أي نطاق على الإنترنت دون قيود.');
  } else {
    xssStatus = 'protected';
    xssBadgeAr = 'محمي بالكامل من هجمات XSS';
    xssDescriptionAr =
      'ترويسة CSP مهيأة بشكل ممتاز وبسياسات صارمة تمنع تنفيذ أي سكربت خارجي غير موثوق به وتمنع استخراج البيانات الحساسة خارج النطاق.';
  }

  const cspFixGuideAr = !cspFound
    ? 'أضف ترويسة Content-Security-Policy عبر خادم الويب Nginx أو Apache أو Cloudflare مع حظر السكربتات المجهولة واستخدام النطاقات المعتمدة فقط.'
    : hasUnsafeInline
    ? 'تخلص من استثناء \'unsafe-inline\' عبر نقل جميع السكربتات المضمنة إلى ملفات منفصلة أو استخدام تشفير Nonce / Hash.'
    : 'حافظ على تدقيق نطاقات الـ CSP دورياً عند إضافة مكتبات برمجية جديدة.';

  // --- 2. Analyze HSTS (Strict-Transport-Security) ---
  const hstsHeader = (raw.hsts || '').trim();
  const hstsFound = hstsHeader.length > 0;

  let domain = 'example.com';
  try {
    domain = new URL(targetUrl).hostname.replace('www.', '');
  } catch {
    domain = targetUrl.replace(/^https?:\/\//, '').split('/')[0] || 'example.com';
  }

  let maxAgeSeconds: number | undefined;
  let maxAgeDays: number | undefined;
  let includeSubDomains = false;
  let preload = false;
  let isOptimalMaxAge = false;

  if (hstsFound) {
    const maxAgeMatch = hstsHeader.match(/max-age=(\d+)/i);
    if (maxAgeMatch && maxAgeMatch[1]) {
      maxAgeSeconds = parseInt(maxAgeMatch[1], 10);
      maxAgeDays = Math.round(maxAgeSeconds / 86400);
      isOptimalMaxAge = maxAgeSeconds >= 31536000; // at least 1 year
    }
    includeSubDomains = /includesubdomains/i.test(hstsHeader);
    preload = /preload/i.test(hstsHeader);
  }

  const maxAgeYears = maxAgeDays ? parseFloat((maxAgeDays / 365).toFixed(1)) : undefined;
  const subdomainsScopeAr = includeSubDomains
    ? `مطبق وشامل للنطاق الرئيسي وكافة النطاقات الفرعية (*.${domain})`
    : `مقتصر على النطاق الرئيسي فقط (${domain})، والنطاقات الفرعية (*.${domain}) غير محمية`;
  const preloadStatusAr = preload
    ? 'مؤهل للإدراج في قائمة المتصفحات المسبقة (HSTS Preload List)'
    : 'غير مؤهل لقائمة المتصفحات المسبقة (preload مفقود)';
  const validityEvaluationAr = isOptimalMaxAge
    ? `مدة ممتازة (${maxAgeDays} يوم / ${maxAgeYears} سنة) تلبي معايير الأمان العالمية وقائمة Preload`
    : (maxAgeSeconds
      ? `مدة قصيرة نسبياً (${maxAgeDays} يوم)، يُوصى برفعها إلى سنة كاملة (31536000 ثانية)`
      : 'ترويسة HSTS غير موجودة أو بدون تحديد max-age');

  let mitmStatus: 'protected' | 'partial' | 'vulnerable' = 'vulnerable';
  let mitmBadgeAr = 'غير محمي من هجمات MitM';
  let mitmDescriptionAr = 'ترويسة HSTS غير مفعلة، مما يسمح بهجمات تجريد التشفير (SSL Stripping) واعتراض البيانات في الشبكات المفتوحة.';
  const mitmRisksAr: string[] = [];

  if (!isHttps) {
    mitmStatus = 'vulnerable';
    mitmBadgeAr = 'الموقع غير مشفر (HTTP)';
    mitmDescriptionAr = 'الموقع يعمل عبر بروتوكول HTTP غير الآمن ولا يدعم HSTS، مما يعرض جميع الاتصالات للتنصت والاعتراض المباشر.';
    mitmRisksAr.push('إمكانية قراءة أي كلمات مرور أو بيانات سرية تمر عبر الشبكة.');
    mitmRisksAr.push('تعريض الزوار لعمليات تزييف المحتوى وحقن الإعلانات من مزودي الخدمة أو المخترقين.');
  } else if (!hstsFound) {
    mitmStatus = 'vulnerable';
    mitmBadgeAr = 'معرض لهجمات MitM وتجريد SSL';
    mitmDescriptionAr =
      'الموقع يدعم HTTPS لكنه يفتقر لترويسة Strict-Transport-Security (HSTS). إذا قام الزائر بكتابة عنوان الموقع بدون https:// في شبكة مقهى أو واي فاي عام، يمكن للمهاجم عبر أدوات مثل sslstrip اعتراض الطلب وتثبيت الاتصال على HTTP دون علم المستخدم.';
    mitmRisksAr.push('هجمات تجريد التشفير SSL Stripping في شبكات الواي فاي العامة.');
    mitmRisksAr.push('إمكانية سرقة كوكيز الجلسة قبل التحويل إلى HTTPS.');
    mitmRisksAr.push('انعدام الحماية للنطاقات الفرعية (Subdomains).');
  } else if (!isOptimalMaxAge || !includeSubDomains) {
    mitmStatus = 'partial';
    mitmBadgeAr = 'حماية جزئية من MitM';
    mitmDescriptionAr =
      `ترويسة HSTS مفعلة بمدة ${maxAgeDays || 0} يومًا، ولكن ينقصها تفعيل حماية النطاقات الفرعية (includeSubDomains) أو زيادة المدة إلى عام كامل (31536000 ثانية) للتأهل للقائمة المسبقة Preload.`;
    if (!isOptimalMaxAge) mitmRisksAr.push(`مدة الحفظ الحالية (${maxAgeDays || 0} يوم) أقل من المدة الموصى بها عالميًا وهي 365 يومًا (31536000s).`);
    if (!includeSubDomains) mitmRisksAr.push('النطاقات الفرعية (مثل api.domain.com أو mail.domain.com) غير مشمولة بالحماية الإلزامية.');
  } else {
    mitmStatus = 'protected';
    mitmBadgeAr = 'محمي بالكامل من هجمات MitM';
    mitmDescriptionAr =
      `ترويسة HSTS مفعلة بأعلى معايير الأمان الدولية (مدة سنة كاملة: ${maxAgeDays} يومًا) مع حماية جميع النطاقات الفرعية${preload ? ' وميزة Preload مفعلة' : ''}. يرفض المتصفح تمامًا أي محاولة للاتصال غير المشفر.`;
  }

  const hstsFixGuideAr = !hstsFound
    ? 'أضف ترويسة Strict-Transport-Security بقيمة: max-age=31536000; includeSubDomains; preload في إعدادات خادمك.'
    : !isOptimalMaxAge
    ? 'ارفع قيمة max-age لتصبح 31536000 ثانية (عام كامل) وأضف includeSubDomains لحماية شاملة.'
    : 'إعدادات HSTS مثالية ومطابقة لأفضل المعايير الأمنية.';

  // --- 3. Other security headers ---
  const xFrame = raw.xFrameOptions ? raw.xFrameOptions.trim() : undefined;
  const xContent = raw.xContentTypeOptions ? raw.xContentTypeOptions.trim() : undefined;
  const refPol = raw.referrerPolicy ? raw.referrerPolicy.trim() : undefined;
  const permPol = raw.permissionsPolicy ? raw.permissionsPolicy.trim() : undefined;

  const otherHeaders = {
    xFrameOptions: xFrame
      ? { present: true, value: xFrame, status: ('secure' as const) }
      : { present: false, status: ('missing' as const) },
    xContentTypeOptions: xContent
      ? { present: true, value: xContent, status: ('secure' as const) }
      : { present: false, status: ('missing' as const) },
    referrerPolicy: refPol
      ? { present: true, value: refPol, status: ('secure' as const) }
      : { present: false, status: ('missing' as const) },
    permissionsPolicy: permPol
      ? { present: true, value: permPol, status: ('secure' as const) }
      : { present: false, status: ('missing' as const) }
  };

  // --- 4. Overall Security Grade & Score ---
  let score = 0;
  if (isHttps) score += 20;
  if (hstsFound) {
    score += 20;
    if (isOptimalMaxAge) score += 10;
    if (includeSubDomains) score += 5;
  }
  if (cspFound) {
    score += 25;
    if (!hasUnsafeInline && !hasUnsafeEval) score += 10;
  }
  if (xFrame) score += 5;
  if (xContent) score += 5;

  score = Math.min(100, Math.max(10, score));

  let grade: SecurityHeadersAnalysis['grade'] = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  // --- 5. Production-Ready Server Configurations ---
  const serverFixConfigs = {
    nginx: `# إعدادات ترويسات الأمان الموصى بها في خادم Nginx
# أضف هذه الأسطر داخل كتلة server {} الخاصة بـ HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self';" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;`,

    apache: `# إعدادات ترويسات الأمان في ملف .htaccess لخادم Apache
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self';"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>`,

    cloudflare: `// إعداد ترويسات الأمان عبر Cloudflare Transform Rules أو Workers
export default {
  async fetch(request, env) {
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);

    // ترويسات HSTS لمنع هجمات MitM
    newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // ترويسات CSP لمنع هجمات XSS
    newHeaders.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none'; base-uri 'self';");

    newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};`,

    express: `// إعداد ترويسات الأمان في تطبيقات Node.js Express باستخدام Helmet
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);`,

    nextjs: `// إعداد ترويسات الأمان في Next.js عبر next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; object-src 'none'; base-uri 'self';"
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};`
  };

  const summaryAr =
    grade === 'A+' || grade === 'A'
      ? `درجة الأمان الحالية (${grade}) ممتازة. الموقع محصن بترويسات HSTS و CSP لحماية المستخدمين من هجمات XSS و MitM.`
      : grade === 'B' || grade === 'C'
      ? `درجة الأمان (${grade}). الموقع يمتلك بعض الترويسات الأساسية ولكنه يحتاج لضبط ترويسات CSP و HSTS لسد الثغرات المحتملة.`
      : `درجة الأمان منخفضة (${grade}). الموقع يفتقر إلى ترويسات الحماية الحرجة (CSP و HSTS)، مما يعرض بيانات الزوار لخطر هجمات MitM و XSS.`;

  return {
    score,
    grade,
    xssProtection: {
      status: xssStatus,
      badgeAr: xssBadgeAr,
      descriptionAr: xssDescriptionAr,
      cspHeaderFound: cspFound,
      rawHeader: cspHeader || undefined,
      hasUnsafeInline,
      hasUnsafeEval,
      hasWildcard,
      hasNonce,
      hasHash,
      hasStrictDynamic,
      hasObjectSrcNone,
      hasBaseUriSelf,
      hasFrameAncestors,
      hasRequireTrustedTypes,
      hasViolationReporting,
      score: cspScore,
      grade: cspGrade,
      directives: directiveItems,
      risksAr: xssRisksAr,
      recommendations,
      fixGuideAr: cspFixGuideAr
    },
    mitmProtection: {
      status: mitmStatus,
      badgeAr: mitmBadgeAr,
      descriptionAr: mitmDescriptionAr,
      hstsHeaderFound: hstsFound,
      rawHeader: hstsHeader || undefined,
      maxAgeSeconds,
      maxAgeDays,
      maxAgeYears,
      includeSubDomains,
      subdomainsScopeAr,
      preload,
      preloadStatusAr,
      isOptimalMaxAge,
      validityEvaluationAr,
      risksAr: mitmRisksAr,
      fixGuideAr: hstsFixGuideAr
    },
    otherHeaders,
    serverFixConfigs,
    summaryAr
  };
}
