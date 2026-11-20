import { AuditResult } from '../types/seo.js';
import { calculateCoreWebVitals } from '../utils/cwvCalculator.js';
import { analyzeInternalLinking } from '../utils/internalLinkingAnalyzer.js';
import { analyzeSecurityHeaders } from '../utils/securityHeadersAnalyzer.js';
import { generateHighIntentKeywords } from '../utils/highIntentKeywordsAnalyzer.js';
import { generateSeoRoadmapPlan } from '../utils/roadmapGenerator.js';

export const SAMPLE_AUDITS: Record<string, AuditResult> = {
  blog: {
    url: 'https://al-arabi-tech.blog',
    analyzedAt: new Date().toISOString(),
    overallScore: 84,
    loadTimeMs: 412,
    statusCode: 200,
    isHttps: true,
    pageTitle: 'عالم التقنية والذكاء الاصطناعي | أحدث المقالات والمراجعات 2026',
    metaDescription: 'مدونة متخصصة في مراجعات الهواتف، أدوات الذكاء الاصطناعي، وتطوير الويب بمقالات حصرية ونصائح عملية للمبرمجين وصناع المحتوى التقني.',
    canonicalUrl: 'https://al-arabi-tech.blog',
    lang: 'ar',
    charset: 'utf-8',
    wordCount: 1480,
    textToHtmlRatio: 18.5,
    pageSizeKb: 132,
    robotsTxtFound: true,
    sitemapFound: true,
    schemasFound: ['BlogPosting', 'BreadcrumbList', 'WebSite'],
    securityHeaders: {
      hsts: true,
      xFrameOptions: true,
      csp: false,
      xContentType: true
    },
    headings: {
      h1: ['عالم التقنية: دليلك لأحدث الابتكارات'],
      h2Count: 6,
      h3Count: 12,
      h4Count: 0,
      sampleHeadings: [
        { tag: 'h1', text: 'عالم التقنية: دليلك لأحدث الابتكارات' },
        { tag: 'h2', text: 'أهم نماذج الذكاء الاصطناعي في عام 2026' },
        { tag: 'h2', text: 'أفضل 5 استضافات سريعة للمدونات' },
        { tag: 'h2', text: 'كيفية تحسين سيو المقالات وتصدر نتائج بحث جوجل' },
        { tag: 'h3', text: 'تحسين سرعة تحميل الصور بصيغة WebP' },
        { tag: 'h3', text: 'بناء الروابط الداخلية الاستراتيجية' }
      ]
    },
    images: {
      total: 14,
      withAlt: 11,
      withoutAlt: 3,
      missingAltSamples: [
        { src: 'https://al-arabi-tech.blog/assets/banner-ad.png' },
        { src: 'https://al-arabi-tech.blog/assets/author-avatar.jpg' },
        { src: 'https://al-arabi-tech.blog/assets/icon-arrow.svg' }
      ]
    },
    links: {
      total: 48,
      internal: 39,
      external: 9,
      nofollow: 4
    },
    social: {
      ogTitle: 'عالم التقنية والذكاء الاصطناعي | أحدث المقالات والمراجعات',
      ogDescription: 'دليلك الشامل لأحدث أدوات الذكاء الاصطناعي وتقنيات تطوير الويب مع شروحات عملية.',
      ogImage: 'https://al-arabi-tech.blog/images/og-share-cover.jpg',
      ogType: 'article',
      ogUrl: 'https://al-arabi-tech.blog',
      twitterCard: 'summary_large_image',
      twitterTitle: 'عالم التقنية والذكاء الاصطناعي',
      twitterDescription: 'دليلك الشامل لأحدث أدوات الذكاء الاصطناعي',
      twitterImage: 'https://al-arabi-tech.blog/images/og-share-cover.jpg'
    },
    categories: {
      onpage: { name: 'On-Page SEO', nameAr: 'السيو الداخلي', score: 92, passedCount: 7, warningCount: 1, errorCount: 0, weight: 25 },
      technical: { name: 'Technical SEO', nameAr: 'السيو التقني', score: 88, passedCount: 6, warningCount: 1, errorCount: 0, weight: 20 },
      content: { name: 'Content & Media', nameAr: 'المحتوى والوسائط', score: 79, passedCount: 5, warningCount: 2, errorCount: 1, weight: 20 },
      performance: { name: 'Performance', nameAr: 'السرعة والأداء', score: 86, passedCount: 4, warningCount: 1, errorCount: 0, weight: 15 },
      security: { name: 'Security', nameAr: 'الأمان والشهادات', score: 80, passedCount: 3, warningCount: 1, errorCount: 0, weight: 10 },
      social: { name: 'Social & Schema', nameAr: 'التواصل والبيانات المنظمة', score: 85, passedCount: 4, warningCount: 1, errorCount: 0, weight: 10 }
    },
    items: [
      {
        id: 'title_length',
        category: 'onpage',
        title: 'Title Tag Length',
        titleAr: 'طول عنوان الصفحة (Title Tag)',
        status: 'pass',
        score: 95,
        currentValue: '58 حرفاً',
        idealValue: '50 - 60 حرفاً',
        descriptionAr: 'عنوان الصفحة ذو طول ممتاز ويظهر كاملاً في نتائج بحث جوجل دون اقتصاص.',
        impactAr: 'حرج',
        fixGuideAr: 'العنوان مثالي ويحتوي على الكلمات المفتاحية الرئيسية للمدونة.'
      },
      {
        id: 'meta_description',
        category: 'onpage',
        title: 'Meta Description',
        titleAr: 'الوصف التعريفي (Meta Description)',
        status: 'pass',
        score: 92,
        currentValue: '138 حرفاً',
        idealValue: '120 - 160 حرفاً',
        descriptionAr: 'الوصف التعريفي جذاب، مناسب الطول، ويحفز على النقر بنسبة CTR أعلى.',
        impactAr: 'حرج',
        fixGuideAr: 'الوصف مناسب وموضح لمحتوى التدوينة بدقة.'
      },
      {
        id: 'h1_structure',
        category: 'onpage',
        title: 'H1 Heading Structure',
        titleAr: 'وسم العنوان الرئيسي (H1)',
        status: 'pass',
        score: 100,
        currentValue: 'يوجد وسم H1 واحد فقط',
        idealValue: 'وسم H1 واحد فقط لكل صفحة',
        descriptionAr: 'تم العثور على وسم H1 واحد بصورة صحيحة وبداخله نص دلالي قوي.',
        impactAr: 'حرج',
        fixGuideAr: 'لا يتطلب أي تغيير، يفضل الحفاظ على وسم H1 واحد رئيسي.'
      },
      {
        id: 'canonical',
        category: 'onpage',
        title: 'Canonical URL',
        titleAr: 'الرابط الأساسي المعياري (Canonical URL)',
        status: 'pass',
        score: 100,
        currentValue: 'https://al-arabi-tech.blog',
        idealValue: 'معرّف ويطابق الرابط الفعلي',
        descriptionAr: 'تم تعيين رابط معياري سليم لمنع تكرار المحتوى في محركات البحث.',
        impactAr: 'حرج',
        fixGuideAr: 'الوسم مفعّل بشكل صحيح في ترويسة HTML.'
      },
      {
        id: 'image_alt',
        category: 'content',
        title: 'Images Missing Alt Attributes',
        titleAr: 'صور تفتقر للنص البديل (Alt Attribute)',
        status: 'error',
        score: 60,
        currentValue: '3 صور من أصل 14 بدون نص بديل',
        idealValue: '100% من الصور تمتلك نصوص بديلة',
        descriptionAr: 'تفتقر بعض الصور إلى وسم alt مما يمنع محركات البحث ومساعدات القراءة من فهم محتواها.',
        impactAr: 'حرج',
        fixGuideAr: 'استخدم السمة <img alt> لكتابة محتوى وصفي دقيق وممثل للصورة مع الكلمات المفتاحية المستهدفة.',
        codeSnippet: '<img src="pic.gif" alt="نص الكلمات المفتاحية الدقيق والوصفي الذي يمثل الصورة." />'
      },
      {
        id: 'ssl_check',
        category: 'security',
        title: 'SSL / HTTPS Security',
        titleAr: 'شهادة الأمان والاتصال المشفر (HTTPS)',
        status: 'pass',
        score: 100,
        currentValue: 'مفعّل ونشط (HTTPS مشفر)',
        idealValue: 'HTTPS إلزامي لكافة الروابط',
        descriptionAr: 'الموقع يستخدم بروتوكول HTTPS ويقوم بتحويل الزوار بشكل آمن.',
        impactAr: 'حرج',
        fixGuideAr: 'الاتصال مشفر ومطابق لمعايير جوجل الأساسية.'
      },
      {
        id: 'robots_txt',
        category: 'technical',
        title: 'Robots.txt Availability',
        titleAr: 'ملف توجيه الروبوتات (Robots.txt)',
        status: 'pass',
        score: 100,
        currentValue: 'موجود ويعمل (200 OK)',
        idealValue: 'ملف متاح على /robots.txt',
        descriptionAr: 'تم العثور على ملف robots.txt وهو صالح ويسمح لمحركات البحث بفهرسة الموقع.',
        impactAr: 'حرج',
        fixGuideAr: 'ملف الروبوتات سليم ويحتوي على مسار خريطة الموقع.'
      },
      {
        id: 'sitemap_xml',
        category: 'technical',
        title: 'XML Sitemap',
        titleAr: 'خريطة الموقع البرمجية (Sitemap.xml)',
        status: 'pass',
        score: 100,
        currentValue: 'موجودة وقابلة للفهرسة',
        idealValue: 'خريطة محدثة بصيغة XML',
        descriptionAr: 'تم الكشف عن خريطة الموقع بنجاح، مما يساعد محركات البحث في أرشفة المقالات الجديدة سريعاً.',
        impactAr: 'حرج',
        fixGuideAr: 'تأكد من إرسال هذا الرابط إلى Google Search Console.'
      },
      {
        id: 'csp_header',
        category: 'security',
        title: 'Content Security Policy (CSP)',
        titleAr: 'سياسة أمان المحتوى (CSP Header)',
        status: 'warning',
        score: 50,
        currentValue: 'غير مفعلة في ترويسات الخادم',
        idealValue: 'ترويسة Content-Security-Policy مفعّلة',
        descriptionAr: 'عدم تفعيل ترويسة CSP يقلل من حماية الموقع ضد هجمات XSS وحقن البرمجيات الخبيثة.',
        impactAr: 'متوسط',
        fixGuideAr: 'أضف ترويسة Content-Security-Policy في إعدادات الخادم Nginx أو Cloudflare.',
        codeSnippet: 'Content-Security-Policy: default-src \'self\'; script-src \'self\' https://trustedscripts.com;'
      },
      {
        id: 'schema_markup',
        category: 'social',
        title: 'Structured Data (Schema.org)',
        titleAr: 'البيانات المنظمة للمقالات (Schema / JSON-LD)',
        status: 'pass',
        score: 95,
        currentValue: 'مكتشفة: BlogPosting, BreadcrumbList, WebSite',
        idealValue: 'بيانات منظمة مطابقة لنوع المحتوى',
        descriptionAr: 'الموقع مزود ببيانات مقالات منظمة مما يمنحه فرصة الظهور في المقتطفات المميزة من جوجل (Rich Results).',
        impactAr: 'متوسط',
        fixGuideAr: 'حافظ على تحديث حقول تاريخ النشر والكاتب تلقائياً.'
      },
      {
        id: 'ttfb_speed',
        category: 'performance',
        title: 'Server Response Time (TTFB)',
        titleAr: 'زمن استجابة الخادم (Time to First Byte)',
        status: 'pass',
        score: 88,
        currentValue: '412 مللي ثانية',
        idealValue: 'أقل من 600 مللي ثانية',
        descriptionAr: 'زمن استجابة الخادم ممتاز، مما يعزز تجربة تصفح القراء وسرعة الأرشفة.',
        impactAr: 'متوسط',
        fixGuideAr: 'السرعة ممتازة، ويمكن الاستفادة من التخزين المؤقت CDN لتحسينها أكثر.'
      },
      {
        id: 'broken_external_links_pass',
        category: 'technical',
        title: 'External Links Health (200 OK)',
        titleAr: 'سلامة الروابط الخارجية (جميع الروابط تعمل 200 OK)',
        status: 'pass',
        score: 100,
        currentValue: '5 روابط خارجية مفحوصة، لا توجد روابط 404 معطلة',
        idealValue: '100% من الروابط صالحة',
        descriptionAr: 'كافة المراجع والروابط الخارجية تعمل بسلاسة ولا ترجع صفحات مفقودة 404.',
        impactAr: 'حرج',
        fixGuideAr: 'الروابط الخارجية سليمة تماماً وتدعم موثوقية المقال.'
      }
    ],
    keywordsAnalysis: {
      totalAnalyzedWords: 842,
      uniqueWordsCount: 295,
      topSingleKeywords: [
        { keyword: 'الذكاء', count: 18, density: 2.1, type: 'single', status: 'optimal', inTitle: true, inH1: true, inMetaDesc: true },
        { keyword: 'الاصطناعي', count: 17, density: 2.0, type: 'single', status: 'optimal', inTitle: true, inH1: true, inMetaDesc: true },
        { keyword: 'التقنية', count: 14, density: 1.7, type: 'single', status: 'optimal', inTitle: true, inH1: false, inMetaDesc: true },
        { keyword: 'تطوير', count: 11, density: 1.3, type: 'single', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'المواقع', count: 9, density: 1.1, type: 'single', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'البرمجة', count: 8, density: 1.0, type: 'single', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'تحسين', count: 7, density: 0.8, type: 'single', status: 'low', inTitle: false, inH1: false, inMetaDesc: true },
        { keyword: 'محركات', count: 6, density: 0.7, type: 'single', status: 'low', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'البحث', count: 6, density: 0.7, type: 'single', status: 'low', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'جوجل', count: 5, density: 0.6, type: 'single', status: 'low', inTitle: false, inH1: false, inMetaDesc: false }
      ],
      topPhrases: [
        { keyword: 'الذكاء الاصطناعي', count: 16, density: 1.9, type: 'phrase', status: 'optimal', inTitle: true, inH1: true, inMetaDesc: true },
        { keyword: 'محركات البحث', count: 6, density: 0.7, type: 'phrase', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'تطوير المواقع', count: 5, density: 0.6, type: 'phrase', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'تحسين السيو', count: 4, density: 0.5, type: 'phrase', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false }
      ],
      recommendations: [
        {
          type: 'success',
          titleAr: 'توزيع طبيعي وخالٍ من حشو الكلمات (No Keyword Stuffing)',
          descriptionAr: 'كثافة الكلمات الرئيسية تتراوح بين 1.0% و 2.1%، وهو النطاق الذهبي الموصى به من خبراء السيو وجوجل لتفادي خوارزميات مكافحة التكرار السلبي.'
        },
        {
          type: 'success',
          titleAr: 'تطابق استراتيجي مثالي بين العنوان والمحتوى',
          descriptionAr: 'العبارة الأساسية "الذكاء الاصطناعي" مدمجة بذكاء في عنوان الصفحة (Title) ووسم H1 والوصف التعريفي مع تغطية متناغمة في الفقرات.'
        },
        {
          type: 'info',
          titleAr: 'فرصة لتعزيز مصطلحات السيو الفرعية (LSI Keywords)',
          descriptionAr: 'مصطلحات مثل "تحسين محركات البحث" و"السيو" كثافتها أقل من 1%. زيادة استخدامها في ترويسات H2 والفقرات الختامية يقوي الارتباط الدلالي.',
          actionAr: 'أضف قسماً فرعياً بعنوان "كيف يؤثر الذكاء الاصطناعي على تحسين محركات البحث في 2026".'
        },
        {
          type: 'success',
          titleAr: 'ثراء معجمي وتنوع لغوي ممتاز (35%)',
          descriptionAr: 'تنوع الكلمات الفريدة يتجاوز 35% من إجمالي المفردات، ما يدل على محتوى عميق ومفيد يلبي نية الباحث (Search Intent).'
        }
      ]
    },
    brokenLinksAnalysis: {
      totalExternalChecked: 5,
      brokenCount: 0,
      workingCount: 5,
      warningCount: 0,
      links: [
        {
          url: 'https://developers.google.com/search/docs',
          anchorText: 'دليل مطوري جوجل الرسمي',
          statusCode: 200,
          statusText: '200 OK',
          isBroken: false,
          responseTimeMs: 145,
          isNofollow: false,
          checkedAt: '2026-10-13T10:00:00.000Z'
        },
        {
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
          anchorText: 'توثيق MDN Web Docs',
          statusCode: 200,
          statusText: '200 OK',
          isBroken: false,
          responseTimeMs: 198,
          isNofollow: false,
          checkedAt: '2026-10-13T10:00:00.000Z'
        },
        {
          url: 'https://www.w3.org/standards/webdesign/htmlcss',
          anchorText: 'معايير شبكة الويب العالمية W3C',
          statusCode: 200,
          statusText: '200 OK',
          isBroken: false,
          responseTimeMs: 230,
          isNofollow: true,
          checkedAt: '2026-10-13T10:00:00.000Z'
        },
        {
          url: 'https://schema.org/TechArticle',
          anchorText: 'مخطط البيانات المنظمة Schema',
          statusCode: 200,
          statusText: '200 OK',
          isBroken: false,
          responseTimeMs: 176,
          isNofollow: false,
          checkedAt: '2026-10-13T10:00:00.000Z'
        },
        {
          url: 'https://web.dev/explore/fast',
          anchorText: 'مؤشرات أداء الويب Core Web Vitals',
          statusCode: 200,
          statusText: '200 OK',
          isBroken: false,
          responseTimeMs: 160,
          isNofollow: false,
          checkedAt: '2026-10-13T10:00:00.000Z'
        }
      ],
      summary: {
        brokenPercentage: 0,
        hasBrokenLinks: false,
        recommendationAr: 'فحص السيو التقني ممتاز! جميع الروابط الخارجية التي تم اختبارها تعمل وتستجيب برمز 200 OK.'
      }
    },
    schemaAnalysis: {
      totalScriptsFound: 2,
      totalEntitiesFound: 3,
      validCount: 2,
      warningCount: 1,
      errorCount: 0,
      detectedTypes: ['BlogPosting', 'BreadcrumbList', 'WebSite'],
      items: [
        {
          id: 'schema-sample1-blogposting',
          type: 'BlogPosting',
          context: 'https://schema.org',
          name: 'دليل السيو الشامل لعام 2026: أسرار تصدر محركات البحث',
          isValid: true,
          hasWarnings: true,
          issues: [
            {
              severity: 'info',
              property: 'dateModified',
              messageAr: 'تاريخ آخر تحديث (dateModified) غير محدد. يستحسن إضافته لإعلام عناكب البحث بحداثة التدوينة.',
              fixGuideAr: 'أضف "dateModified": "2026-03-20T10:00:00Z" لمساعدة جوجل في عرض تاريخ التحديث للمستخدمين.'
            }
          ],
          rawJson: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "دليل السيو الشامل لعام 2026: أسرار تصدر محركات البحث",
            "image": "https://tech-arabic-blog.com/images/seo-guide-2026.jpg",
            "datePublished": "2026-01-15T08:30:00Z",
            "author": {
              "@type": "Person",
              "name": "أحمد الشمري",
              "url": "https://tech-arabic-blog.com/authors/ahmed"
            },
            "publisher": {
              "@type": "Organization",
              "name": "مدونة التقنية والابتكار",
              "logo": {
                "@type": "ImageObject",
                "url": "https://tech-arabic-blog.com/logo.png"
              }
            },
            "description": "دليل عملي وتطبيقي شامل لتهيئة المواقع لمحركات البحث مع التركيز على تجربة المستخدم والذكاء الاصطناعي."
          }, null, 2),
          richResultType: 'مقتطفات غنية وظهور في خلاصات Google Discover',
          requiredFieldsMissing: [],
          recommendedFieldsMissing: ['dateModified']
        },
        {
          id: 'schema-sample1-breadcrumbs',
          type: 'BreadcrumbList',
          context: 'https://schema.org',
          name: 'مسار التصفح للمقال',
          isValid: true,
          hasWarnings: false,
          issues: [],
          rawJson: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "الرئيسية",
                "item": "https://tech-arabic-blog.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "السيو وتحسين المواقع",
                "item": "https://tech-arabic-blog.com/category/seo"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "دليل 2026",
                "item": "https://tech-arabic-blog.com/blog/seo-ultimate-guide-2026"
              }
            ]
          }, null, 2),
          richResultType: 'مسار الروابط التنقلية بدلاً من الـ URL في نتائج البحث',
          requiredFieldsMissing: [],
          recommendedFieldsMissing: []
        },
        {
          id: 'schema-sample1-website',
          type: 'WebSite',
          context: 'https://schema.org',
          name: 'مدونة التقنية والابتكار',
          isValid: true,
          hasWarnings: false,
          issues: [],
          rawJson: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "مدونة التقنية والابتكار",
            "url": "https://tech-arabic-blog.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://tech-arabic-blog.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }, null, 2),
          richResultType: 'مربع البحث في روابط أقسام الموقع (Sitelinks Searchbox)',
          requiredFieldsMissing: [],
          recommendedFieldsMissing: []
        }
      ],
      summaryAr: 'تم الكشف عن 3 ترميزات Schema.org صالحة وسليمة، مؤهلة للحصول على مقتطفات المقالات ومسارات التنقل ومربع البحث في جوجل.',
      overallStatus: 'valid'
    },
    coreWebVitals: calculateCoreWebVitals({
      loadTimeMs: 412,
      pageSizeKb: 540,
      totalImages: 14,
      imagesWithoutDimensions: 0,
      scriptsCount: 5,
      cssCount: 2,
      domElementsCount: 680,
      device: 'mobile'
    }),
    internalLinkingAnalysis: analyzeInternalLinking(
      [
        { url: 'https://al-arabi-tech.blog/', anchorText: 'الرئيسية', isContextual: false },
        { url: 'https://al-arabi-tech.blog/blog/seo-guide', anchorText: 'دليل تحسين محركات البحث الشامل', isContextual: true },
        { url: 'https://al-arabi-tech.blog/blog/core-web-vitals', anchorText: 'شرح مؤشرات أداء الويب Core Web Vitals', isContextual: true },
        { url: 'https://al-arabi-tech.blog/blog/ai-tools-2026', anchorText: 'أفضل أدوات الذكاء الاصطناعي للمطورين', isContextual: true },
        { url: 'https://al-arabi-tech.blog/blog/images-seo', anchorText: 'سيو الصور والنصوص البديلة Alt', isContextual: true },
        { url: 'https://al-arabi-tech.blog/category/seo', anchorText: 'قسم تحسين محركات البحث', isContextual: false },
        { url: 'https://al-arabi-tech.blog/category/programming', anchorText: 'قسم البرمجة وتطوير الويب', isContextual: false },
        { url: 'https://al-arabi-tech.blog/services/seo-consulting', anchorText: 'خدمات استشارات السيو الاحترافية', isContextual: true },
        { url: 'https://al-arabi-tech.blog/about', anchorText: 'من نحن وفريق العمل', isContextual: false },
        { url: 'https://al-arabi-tech.blog/contact', anchorText: 'اتصل بنا للاستفسارات', isContextual: false },
        { url: 'https://al-arabi-tech.blog/privacy', anchorText: 'سياسة الخصوصية', isContextual: false },
        { url: 'https://al-arabi-tech.blog/blog/speed-optimization', anchorText: 'تسريع صفحات الويب والـ Caching', isContextual: true },
        { url: 'https://al-arabi-tech.blog/blog/keywords-research', anchorText: 'طرق البحث عن الكلمات المفتاحية المربحة', isContextual: true },
        { url: 'https://al-arabi-tech.blog/blog/internal-linking', anchorText: 'استراتيجية بناء الروابط الداخلية', isContextual: true },
        { url: 'https://al-arabi-tech.blog/terms', anchorText: 'الشروط والأحكام', isContextual: false }
      ],
      1480,
      'https://al-arabi-tech.blog'
    ),
    securityHeadersAnalysis: analyzeSecurityHeaders(
      {
        hsts: 'max-age=31536000; includeSubDomains; preload',
        csp: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self';",
        xFrameOptions: 'SAMEORIGIN',
        xContentTypeOptions: 'nosniff',
        referrerPolicy: 'strict-origin-when-cross-origin',
        permissionsPolicy: 'geolocation=(), microphone=(), camera=()'
      },
      'https://al-arabi-tech.blog'
    ),
    highIntentKeywords: generateHighIntentKeywords({
      url: 'https://al-arabi-tech.blog',
      title: 'عالم التقنية والذكاء الاصطناعي | أحدث المقالات والمراجعات 2026',
      description: 'مدونة متخصصة في مراجعات الهواتف، أدوات الذكاء الاصطناعي، وتطوير الويب بمقالات حصرية ونصائح عملية للمبرمجين وصناع المحتوى التقني.',
      wordCount: 1480,
      headings: {
        h1: ['عالم التقنية والذكاء الاصطناعي: مستجدات ثورة التكنولوجيا 2026'],
        h2: ['مراجعة شاملة لأفضل أدوات الذكاء الاصطناعي', 'دليل اختيار الهواتف الذكية الرائدة', 'أهم النصائح لتحسين سرعة المواقع'],
        h3: ['مؤشرات الويب الأساسية Core Web Vitals', 'مقارنة نماذج اللغة الكبيرة LLMs']
      }
    }),
    aiAdvice: {
      summary: 'المدونة تتمتع ببنية سيو داخلية ممتازة وعناوين مقالات محسنة بشكل ملحوظ. التركيز الأساسي لتحقيق قفزة في الترتيب هو معالجة وسوم الصور الناقصة وتفعيل ضغط الـ WebP وبناء روابط داخلية أعمق بين المقالات ذات الصلة.',
      topPriorities: [
        'معالجة الصور الثلاث التي تفتقر لوسم alt لإتاحة فهرستها في بحث صور جوجل.',
        'تفعيل ترويسة Content Security Policy لحماية المدونة وتجنب تحذيرات الأمان.',
        'إضافة روابط داخلية (Internal Links) من المقالات الأكثر زيارة إلى التدوينات الحديثة.'
      ],
      keywordOpportunities: [
        'أفضل أدوات الذكاء الاصطناعي 2026',
        'شرح تحسين سيو المدونات باللغة العربية',
        'كيفية تسريع موقع ووردبريس بدون إضافات'
      ],
      blogContentSuggestions: [
        'إنشاء سلاسل مقالات (Pillar Posts) تربط بين 4-5 تدوينات فرعية بموضوع شامل.',
        'تضمين جدول محتويات (Table of Contents) في المقالات التي تتجاوز 1500 كلمة لتسهيل التصفح.',
        'إضافة ملخص سريع في أول 100 كلمة من المقال لزيادة فرص الاستحواذ على المقتطف المنسدل (Featured Snippet).'
      ]
    }
  },
  ecommerce_issues: {
    url: 'https://al-boutique-store.com',
    analyzedAt: new Date().toISOString(),
    overallScore: 59,
    loadTimeMs: 1420,
    statusCode: 200,
    isHttps: true,
    pageTitle: 'المتجر - الصفحة الرئيسية',
    metaDescription: '',
    canonicalUrl: '',
    lang: 'en',
    charset: 'utf-8',
    wordCount: 320,
    textToHtmlRatio: 6.2,
    pageSizeKb: 480,
    robotsTxtFound: false,
    sitemapFound: false,
    schemasFound: ['Product'],
    securityHeaders: {
      hsts: false,
      xFrameOptions: false,
      csp: false,
      xContentType: false
    },
    headings: {
      h1: ['المتجر العصري', 'عروض الموسم الجديد'],
      h2Count: 2,
      h3Count: 0,
      h4Count: 0,
      sampleHeadings: [
        { tag: 'h1', text: 'المتجر العصري' },
        { tag: 'h1', text: 'عروض الموسم الجديد' },
        { tag: 'h2', text: 'المنتجات المميزة' },
        { tag: 'h2', text: 'تواصل معنا' }
      ]
    },
    images: {
      total: 26,
      withAlt: 7,
      withoutAlt: 19,
      missingAltSamples: [
        { src: 'https://al-boutique-store.com/img/prod-120.png' },
        { src: 'https://al-boutique-store.com/img/prod-121.png' },
        { src: 'https://al-boutique-store.com/img/slider-bg.jpg' }
      ]
    },
    links: {
      total: 31,
      internal: 30,
      external: 1,
      nofollow: 0
    },
    social: {
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterCard: ''
    },
    categories: {
      onpage: { name: 'On-Page SEO', nameAr: 'السيو الداخلي', score: 45, passedCount: 2, warningCount: 2, errorCount: 4, weight: 25 },
      technical: { name: 'Technical SEO', nameAr: 'السيو التقني', score: 50, passedCount: 2, warningCount: 1, errorCount: 3, weight: 20 },
      content: { name: 'Content & Media', nameAr: 'المحتوى والوسائط', score: 48, passedCount: 2, warningCount: 2, errorCount: 2, weight: 20 },
      performance: { name: 'Performance', nameAr: 'السرعة والأداء', score: 52, passedCount: 1, warningCount: 2, errorCount: 1, weight: 15 },
      security: { name: 'Security', nameAr: 'الأمان والشهادات', score: 60, passedCount: 1, warningCount: 2, errorCount: 1, weight: 10 },
      social: { name: 'Social & Schema', nameAr: 'التواصل والبيانات المنظمة', score: 30, passedCount: 0, warningCount: 1, errorCount: 3, weight: 10 }
    },
    items: [
      {
        id: 'meta_description',
        category: 'onpage',
        title: 'Meta Description Missing',
        titleAr: 'الوصف التعريفي مفقود تماماً',
        status: 'error',
        score: 0,
        currentValue: 'غير موجود',
        idealValue: '120 - 160 حرفاً يصف المتجر',
        descriptionAr: 'لا يوجد وسم وصف تعريفي للمتجر مما يجعل جوجل يختار مقتطفاً عشوائياً يقلل من نسبة النقر.',
        impactAr: 'حرج',
        fixGuideAr: 'أضف وسم meta description جذاب يبرز ميزات المتجر والشحن السريع.',
        codeSnippet: '<meta name="description" content="تسوق أحدث الأزياء العصرية والعطور الفاخرة بأفضل الأسعار مع توصيل سريع لجميع المدن." />'
      },
      {
        id: 'h1_duplicate',
        category: 'onpage',
        title: 'Multiple H1 Tags',
        titleAr: 'تكرار وسم H1 (يوجد وسما H1)',
        status: 'error',
        score: 40,
        currentValue: 'تم العثور على 2 وسم H1',
        idealValue: 'وسم H1 واحد فريد لكل صفحة',
        descriptionAr: 'استخدام أكثر من وسم H1 يربك عناكب البحث حول الفكرة الرئيسية للصفحة.',
        impactAr: 'حرج',
        fixGuideAr: 'حوّل العنوان الثاني إلى وسم H2 واجعل وسم H1 واحداً فقط للمتجر.',
        codeSnippet: '<!-- العنوان الفرعي -->\n<h2>عروض الموسم الجديد</h2>'
      },
      {
        id: 'robots_missing',
        category: 'technical',
        title: 'Robots.txt Missing',
        titleAr: 'ملف Robots.txt مفقود',
        status: 'error',
        score: 0,
        currentValue: '404 غير موجود',
        idealValue: 'ملف متوفر على المسار الرئيسي',
        descriptionAr: 'عدم وجود ملف robots.txt يمنعك من توجيه محركات البحث واستبعاد صفحات سلة المشتريات والحسابات الخاصة.',
        impactAr: 'حرج',
        fixGuideAr: 'قم بإنشاء ملف robots.txt ورفعه إلى المجلد الرئيسي لموقعك.',
        codeSnippet: 'User-agent: *\nDisallow: /cart/\nDisallow: /checkout/\nDisallow: /admin/\n\nSitemap: https://al-boutique-store.com/sitemap.xml'
      },
      {
        id: 'schema_structural_errors',
        category: 'social',
        title: 'Schema.org Product Structural Errors',
        titleAr: 'أخطاء هيكلية في ترميز منتجات المتجر (Schema Product)',
        status: 'error',
        score: 30,
        currentValue: 'خطأين هيكليين: غياب العملة priceCurrency وصورة المنتج',
        idealValue: 'ترميز Product مكتمل بالأسعار والعملة والتقييمات',
        descriptionAr: 'تم الكشف عن ترميز Product لكنه يفتقر إلى خصائص إلزامية في جوجل (العملة ISO والصورة المباشرة) مما يمنع تفعيل مقتطفات التسوق الغنية.',
        impactAr: 'حرج',
        fixGuideAr: 'استخدم أداة فحص بيانات Schema أدناه لتصحيح حقول العملة والصورة وتوليد كود صالح.',
        codeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "قميص صيفي كلاسيكي رجالي",\n  "image": "https://al-boutique-store.com/products/shirt-blue.jpg",\n  "offers": {\n    "@type": "Offer",\n    "price": "149.00",\n    "priceCurrency": "SAR",\n    "availability": "https://schema.org/InStock"\n  }\n}\n</script>`
      },
      {
        id: 'speed_slow',
        category: 'performance',
        title: 'Slow Server TTFB',
        titleAr: 'بطء زمن استجابة الخادم',
        status: 'warning',
        score: 45,
        currentValue: '1420 مللي ثانية (1.4 ثانية)',
        idealValue: 'أقل من 600 مللي ثانية',
        descriptionAr: 'زمن التحميل مرتفع ويتجاوز ثانية ونصف، مما قد يسبب ارتداد العملاء وفقدان المبيعات.',
        impactAr: 'حرج',
        fixGuideAr: 'فعّل التخزين المؤقت (Caching) وقم بتحسين استعلامات قاعدة بيانات المنتجات واستخدام CDN.'
      },
      {
        id: 'broken_external_links',
        category: 'technical',
        title: 'Broken External Links (404 / Inaccessible)',
        titleAr: 'روابط خارجية معطلة ترجع خطأ 404 (Broken Links)',
        status: 'error',
        score: 30,
        currentValue: '2 روابط معطلة (404) من أصل 6 روابط خارجية',
        idealValue: '0 روابط خارجية معطلة 404',
        descriptionAr: 'تم اكتشاف روابط خارجية معطلة ترجع خطأ 404 Not Found أو غير قابلة للوصول، مما يضر بتجربة المستخدم وثقة محركات البحث في جودة المتجر.',
        impactAr: 'حرج',
        fixGuideAr: 'قم بتحديث الروابط المعطلة بروابط بديلة صالحة، أو احذف الرابط المعطوب فوراً لحماية السيو التقني.',
        codeSnippet: '<!-- استبدل الرابط المعطل ببديل نشط أو احذفه -->\n<a href="https://valid-partner-store.com" target="_blank">المورد المعتمد</a>'
      }
    ],
    keywordsAnalysis: {
      totalAnalyzedWords: 520,
      uniqueWordsCount: 164,
      topSingleKeywords: [
        { keyword: 'عطور', count: 26, density: 5.0, type: 'single', status: 'high', inTitle: false, inH1: true, inMetaDesc: false },
        { keyword: 'شراء', count: 19, density: 3.7, type: 'single', status: 'high', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'متجر', count: 14, density: 2.7, type: 'single', status: 'optimal', inTitle: true, inH1: true, inMetaDesc: false },
        { keyword: 'تخفيضات', count: 12, density: 2.3, type: 'single', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'ماركات', count: 8, density: 1.5, type: 'single', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'عالمية', count: 6, density: 1.2, type: 'single', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'ملابس', count: 4, density: 0.8, type: 'single', status: 'low', inTitle: false, inH1: false, inMetaDesc: false }
      ],
      topPhrases: [
        { keyword: 'عطور اصلية', count: 15, density: 2.9, type: 'phrase', status: 'high', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'شراء عطور', count: 11, density: 2.1, type: 'phrase', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false },
        { keyword: 'تخفيضات كبرى', count: 7, density: 1.3, type: 'phrase', status: 'optimal', inTitle: false, inH1: false, inMetaDesc: false }
      ],
      recommendations: [
        {
          type: 'warning',
          titleAr: 'تنبيه حرج: حشو مفرط لكلمة "عطور" و "شراء" (Keyword Stuffing)',
          descriptionAr: 'كلمة "عطور" تم تكرارها بكثافة 5.0% وكلمة "شراء" بكثافة 3.7%. هذه النسبة المرتفعة تصنف كحشو غير طبيعي قد يؤدي لعقوبة من خوارزمية جوجل لجودة المحتوى.',
          actionAr: 'خفف تكرار الكلمتين واستبدلهما بتنويعات طبيعية مثل: "روائح فاخرة"، "منتجات أصلية"، "اقتناء"، "تسوّق".'
        },
        {
          type: 'warning',
          titleAr: 'انقطاع تام بين عنوان الصفحة (Title) والكلمات الأكثر طلباً',
          descriptionAr: 'عنوان الصفحة الحالي هو "المتجر - الصفحة الرئيسية" وهو خاوٍ من كلمات "عطور" أو "ماركات"، رغم أنها المحور الأهم في الصفحة.',
          actionAr: 'عدّل عنوان الصفحة ليصبح مثلاً: "متجر البوتيك | شراء عطور فاخرة وملابس بماركات عالمية".'
        },
        {
          type: 'warning',
          titleAr: 'غياب الوصف التعريفي المخصص (Meta Description)',
          descriptionAr: 'المتجر لا يمتلك وسم meta description، مما يمنعك من استغلال عبارات مثل "عطور أصلية بخصومات 40%" لجذب النقرات في جوجل.',
          actionAr: 'أضف وصفاً تسويقياً جذاباً يحتوي على أهم العبارات المفتاحية والـ Call to Action.'
        }
      ]
    },
    brokenLinksAnalysis: {
      totalExternalChecked: 6,
      brokenCount: 2,
      workingCount: 3,
      warningCount: 1,
      links: [
        {
          url: 'https://old-partner-store-2019.com/discontinued-brand-docs',
          anchorText: 'شهادة ضمان المورد الحصري السابق',
          statusCode: 404,
          statusText: '404 Not Found',
          isBroken: true,
          errorType: 'not_found',
          responseTimeMs: 310,
          isNofollow: false,
          checkedAt: '2026-10-13T10:00:00.000Z'
        },
        {
          url: 'https://archive-discounts-club.net/expired-coupons-2021',
          anchorText: 'كوبونات الخصم الإضافية للمشتريات',
          statusCode: 404,
          statusText: '404 Not Found',
          isBroken: true,
          errorType: 'not_found',
          responseTimeMs: 275,
          isNofollow: false,
          checkedAt: '2026-10-13T10:00:00.000Z'
        },
        {
          url: 'https://global-shipping-service.fake-hub.org/tracking-portal',
          anchorText: 'بوابة تتبع الشحنات الدولية',
          statusCode: 0,
          statusText: 'انتهت المهلة (Timeout)',
          isBroken: true,
          errorType: 'timeout',
          responseTimeMs: 4000,
          isNofollow: false,
          checkedAt: '2026-10-13T10:00:00.000Z'
        },
        {
          url: 'https://restricted-partner-portal.com/private-portal',
          anchorText: 'بوابة الموردين الخاصة',
          statusCode: 403,
          statusText: '403 Forbidden',
          isBroken: false,
          errorType: 'forbidden',
          responseTimeMs: 340,
          isNofollow: true,
          checkedAt: '2026-10-13T10:00:00.000Z'
        },
        {
          url: 'https://www.trustpilot.com/review/al-boutique',
          anchorText: 'تقييمات المتجر على Trustpilot',
          statusCode: 200,
          statusText: '200 OK',
          isBroken: false,
          responseTimeMs: 185,
          isNofollow: false,
          checkedAt: '2026-10-13T10:00:00.000Z'
        },
        {
          url: 'https://www.instagram.com/boutique_style',
          anchorText: 'صفحة المتجر الرسمية على انستغرام',
          statusCode: 200,
          statusText: '200 OK',
          isBroken: false,
          responseTimeMs: 160,
          isNofollow: true,
          checkedAt: '2026-10-13T10:00:00.000Z'
        }
      ],
      summary: {
        brokenPercentage: 50,
        hasBrokenLinks: true,
        recommendationAr: 'تنبيه سيو تقني عاجل: تم رصد روابط خارجية تقود إلى صفحات 404 مفقودة. يجب تصحيحها لتجنب خفض تقييم جودة الصفحة في جوجل.'
      }
    },
    schemaAnalysis: {
      totalScriptsFound: 1,
      totalEntitiesFound: 1,
      validCount: 0,
      warningCount: 0,
      errorCount: 1,
      detectedTypes: ['Product'],
      items: [
        {
          id: 'schema-sample2-product',
          type: 'Product',
          context: 'https://schema.org',
          name: 'قميص صيفي كلاسيكي رجالي',
          isValid: false,
          hasWarnings: true,
          issues: [
            {
              severity: 'error',
              property: 'offers.priceCurrency',
              messageAr: 'عملة السعر (priceCurrency) مفقودة في كائن offers، مما يمنع جوجل من عرض سعر المنتج في نتائج التسوق.',
              fixGuideAr: 'أضف رمز العملة المعتمد من 3 أحرف، مثل "SAR" أو "AED" أو "USD".'
            },
            {
              severity: 'error',
              property: 'image',
              messageAr: 'صورة المنتج (image) مفقودة في كائن Product.',
              fixGuideAr: 'أضف رابط صورة عالية الدقة للمنتج لتأهيله لنتائج بحث Google Images وShopping.'
            },
            {
              severity: 'warning',
              property: 'aggregateRating',
              messageAr: 'تقييمات العملاء (aggregateRating) غير مضافة، وهي خاصية مفضلة لعرض النجوم الصفراء في نتائج البحث.',
              fixGuideAr: 'أضف متوسط التقييم وعدد المراجعات لجذب نقرات الباحثين.'
            }
          ],
          rawJson: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "قميص صيفي كلاسيكي رجالي",
            "description": "قميص قطني فاخر مناسب للمناسبات الصيفية والعمل اليومي",
            "offers": {
              "@type": "Offer",
              "price": "149.00",
              "availability": "https://schema.org/InStock"
            }
          }, null, 2),
          richResultType: 'مقتطف المنتج مع الأسعار والتقييمات في بحث جوجل',
          requiredFieldsMissing: ['offers.priceCurrency', 'image'],
          recommendedFieldsMissing: ['aggregateRating', 'brand']
        }
      ],
      summaryAr: 'تم الكشف عن ترميز Product يحتوي على خطأين هيكليين رئيسيين (غياب العملة والصورة) يمنعان تفعيل مقتطفات نتائج التسوق في جوجل.',
      overallStatus: 'has_errors'
    },
    coreWebVitals: calculateCoreWebVitals({
      loadTimeMs: 1420,
      pageSizeKb: 2840,
      totalImages: 24,
      imagesWithoutDimensions: 18,
      scriptsCount: 16,
      cssCount: 6,
      domElementsCount: 2100,
      device: 'mobile'
    }),
    internalLinkingAnalysis: analyzeInternalLinking(
      [
        { url: 'https://souq-al-khaleej-store.com/', anchorText: 'الرئيسية', isContextual: false },
        { url: 'https://souq-al-khaleej-store.com/shop', anchorText: 'اضغط هنا', isContextual: false },
        { url: 'https://souq-al-khaleej-store.com/products/perfume-oud', anchorText: 'المزيد', isContextual: true },
        { url: 'https://souq-al-khaleej-store.com/products/leather-bag', anchorText: 'تفاصيل أكثر', isContextual: false },
        { url: 'https://souq-al-khaleej-store.com/products/shoes', anchorText: 'هنا', isContextual: false },
        { url: 'https://souq-al-khaleej-store.com/cart', anchorText: '', isContextual: false },
        { url: 'https://souq-al-khaleej-store.com/checkout', anchorText: 'إتمام الطلب', isContextual: false }
      ],
      480,
      'https://souq-al-khaleej-store.com'
    ),
    securityHeadersAnalysis: analyzeSecurityHeaders(
      {
        hsts: undefined,
        csp: undefined,
        xFrameOptions: undefined,
        xContentTypeOptions: undefined
      },
      'http://souq-al-khaleej-store.com'
    ),
    highIntentKeywords: generateHighIntentKeywords({
      url: 'https://al-boutique-store.com',
      title: 'متجر البوتيك الفاخر | شراء عطور وأزياء أصلية',
      description: 'تسوق أفضل العطور ومستحضرات التجميل الأصلية بأسعار تنافسية مع شحن سريع ودفع عند الاستلام.',
      wordCount: 320,
      headings: {
        h1: ['المتجر الرئيسي', 'عروض التخفيضات الكبرى'],
        h2: ['أحدث المنتجات المضافة', 'العطور الأكثر مبيعاً'],
        h3: []
      }
    }),
    aiAdvice: {
      summary: 'يعاني هذا المتجر من أخطاء سيو تقنية حرجة تؤثر بشكل مباشر على الظهور في جوجل والمبيعات. أهمها غياب الوصف التعريفي، وتكرار وسم H1، وفقدان ملف robots.txt، وغياب بيانات Schema الخاصة بالمنتجات.',
      topPriorities: [
        'كتابة وصف تعريفي فريد للمتجر ولكل منتج من 130-150 حرفاً.',
        'إنشاء ملف robots.txt وخريطة sitemap.xml ورفعها فوراً.',
        'إضافة وسم alt إلى 19 صورة منتجات لظهورها في بحث الصور.',
        'تطبيق كود Schema.org بصيغة JSON-LD للمنتجات لعرض الأسعار والنجوم في جوجل.'
      ],
      keywordOpportunities: [
        'تسوق ملابس رجالية ونسائية اونلاين',
        'عروض تخفيضات الموسم مع توصيل مجاني',
        'شراء عطور أصلية بأسعار مخفضة'
      ],
      blogContentSuggestions: [
        'إنشاء قسم مدونة داخل المتجر (e.g. نصائح اختيار المقاسات، أحدث صيحات الموضة) لاجتذاب زيارات مجانية مستمرة.',
        'إضافة فقرة نصية مفيدة 150-200 كلمة أسفل كل تصنيف منتجات لتقوية السيو الداخلي.'
      ]
    }
  }
};

SAMPLE_AUDITS.blog.roadmapPlan = generateSeoRoadmapPlan({
  url: SAMPLE_AUDITS.blog.url,
  overallScore: SAMPLE_AUDITS.blog.overallScore,
  items: SAMPLE_AUDITS.blog.items
});

SAMPLE_AUDITS.ecommerce_issues.roadmapPlan = generateSeoRoadmapPlan({
  url: SAMPLE_AUDITS.ecommerce_issues.url,
  overallScore: SAMPLE_AUDITS.ecommerce_issues.overallScore,
  items: SAMPLE_AUDITS.ecommerce_issues.items
});
