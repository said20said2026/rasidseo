import { AuditItem } from '../types/seo';

export interface CodeSnippetSolution {
  title: string;
  code: string;
  language: string;
  description?: string;
}

export interface AiCriterionTip {
  badge: string;
  headlineAr: string;
  codeContextAr: string;
  stepByStepActionAr: string;
  codeSnippet?: string;
  codeLanguage: string;
  whereToPutAr: string;
  expectedImpactAr: string;
  urgencyLevel: 'critical' | 'high' | 'medium';
  proTipAr?: string;
  solutions?: CodeSnippetSolution[];
}

/**
 * Extracts a clean hostname or domain from URL
 */
function getCleanDomain(url?: string): string {
  if (!url) return 'الموقع';
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || 'الموقع';
  }
}

/**
 * Generates an intelligent, site-code-aware quick fix tip for any checklist criterion
 */
export function getAiTipForAuditItem(
  item: AuditItem,
  pageUrl?: string,
  pageTitle?: string
): AiCriterionTip {
  const domain = getCleanDomain(pageUrl);
  const cleanUrl = pageUrl || 'https://example.com/';
  const displayTitle = pageTitle && pageTitle !== 'عنوان غير معروف' ? pageTitle : `صفحة ${domain}`;
  const id = item.id.toLowerCase();
  const isError = item.status === 'error';
  const isWarning = item.status === 'warning';

  // 1. Title Tag
  if (id.includes('title')) {
    return {
      badge: 'ترويسة HTML (<head>)',
      headlineAr: isError ? 'إصلاح وسم العنوان <title> في كود الموقع' : 'تحسين بنية وسم العنوان <title>',
      codeContextAr: item.currentValue
        ? `العنوان الحالي في كود الموقع: "${item.currentValue}" (عدد الأحرف: ${item.currentValue.length}).`
        : 'لم يتم العثور على وسم <title> داخل وسم <head> في الكود المصدري.',
      stepByStepActionAr:
        '1. افتح الملف المصدري الرئيسي لقالب الموقع (مثل index.html أو header.php أو layout.tsx).\n' +
        '2. حدد وسم <title> واستبدله بالصيغة المقترحة التي تضع الكلمة المفتاحية في البداية ثم اسم البراند.\n' +
        '3. احرص على ألا يتجاوز طول العنوان 60 حرفاً لضمان ظهوره كاملاً دون اقتطاع في نتائج بحث جوجل.',
      codeSnippet: `<title>${displayTitle} | الكلمة المفتاحية المستهدفة لعام 2026</title>`,
      codeLanguage: 'html',
      whereToPutAr: 'داخل قسم <head> في قمة كود HTML وقبل وسوم الميتا',
      expectedImpactAr: 'ظهور العنوان بالكامل في جوجل ورفع نسبة النقر للظهور (CTR) بنسبة تصل إلى +28%.',
      urgencyLevel: isError ? 'critical' : isWarning ? 'high' : 'medium',
      proTipAr: 'ضع أهم كلمة يبحث عنها عملاؤك في أول 3 كلمات من العنوان لزيادة وزنها في خوارزميات جوجل.',
      solutions: [
        {
          title: 'HTML 5 (<head>)',
          language: 'html',
          description: 'هيكل وسم العنوان القياسي يدمج الكلمة الأساسية مع اسم العلامة التجارية',
          code: `<title>${displayTitle} | الكلمة المفتاحية الأساسية لعام 2026</title>`
        },
        {
          title: 'Next.js App Router (metadata)',
          language: 'typescript',
          description: 'تصدير كائن metadata في Next.js 13/14/15 داخل layout.tsx أو page.tsx',
          code: `import type { Metadata } from 'next';\n\nexport const metadata: Metadata = {\n  title: {\n    default: '${displayTitle} | المنصة الرائدة 2026',\n    template: '%s | ${domain}'\n  }\n};`
        },
        {
          title: 'React Helmet / Next.js Pages',
          language: 'tsx',
          description: 'حقن ديناميكي لوسم العنوان في تطبيقات React SPA',
          code: `<Helmet>\n  <title>${displayTitle} | الكلمة المفتاحية المستهدفة</title>\n</Helmet>`
        }
      ]
    };
  }

  // 2. Meta Description
  if (id.includes('meta_desc') || id.includes('description')) {
    return {
      badge: 'وسوم الميتا (<meta>)',
      headlineAr: isError ? 'إضافة وسم الوصف التعريفي (Meta Description)' : 'تحسين هيكل وسم الوصف التعريفي',
      codeContextAr: item.currentValue
        ? `الوصف الحالي: "${item.currentValue.slice(0, 70)}..." (الطول: ${item.currentValue.length} حرفاً).`
        : 'وسم <meta name="description"> مفقود تماماً في ترويسة الصفحة.',
      stepByStepActionAr:
        '1. أضف وسم meta description داخل عنصر <head> مباشرة أسفل وسم <title>.\n' +
        '2. اكتب ملخصاً مشوقاً بين 140 إلى 155 حرفاً يشرح القيمة التي سيحصل عليها الزائر.\n' +
        '3. اختم الوصف بعبارة حث على اتخاذ إجراء (CTA) مثل "اكتشف الآن" أو "تصفح الدليل الشامل".',
      codeSnippet: `<meta name="description" content="اكتشف كل ما يخص ${displayTitle} مع حلول متقدمة، نصائح عملية، وخطوات تطبيقية سهلة لعام 2026. تصفح التفاصيل الآن مجاناً!" />`,
      codeLanguage: 'html',
      whereToPutAr: 'داخل قسم <head> أسفل وسم <title>',
      expectedImpactAr: 'جذب انتباه الباحثين ومضاعفة معدل الزيارات العضوية بدون أي إعلانات مدفوعة.',
      urgencyLevel: isError ? 'critical' : isWarning ? 'high' : 'medium',
      proTipAr: 'تجنب تكرار نفس الوصف في أكثر من صفحة حتى لا يعتبره محرك البحث محتوى مكرراً.',
      solutions: [
        {
          title: 'HTML 5 (<head>)',
          language: 'html',
          description: 'هيكل وسم meta description القياسي بطول 140-155 حرفاً مع عبارة دعوة لاتخاذ إجراء (CTA)',
          code: `<meta\n  name="description"\n  content="اكتشف كل ما يخص ${displayTitle} مع حلول متقدمة، نصائح عملية، وخطوات تطبيقية سهلة لعام 2026. تصفح التفاصيل الآن مجاناً!"\n/>`
        },
        {
          title: 'Next.js App Router (metadata)',
          language: 'typescript',
          description: 'تعريف الوصف عبر كائن metadata الرسمي في Next.js',
          code: `import type { Metadata } from 'next';\n\nexport const metadata: Metadata = {\n  description: 'اكتشف كل ما يخص ${displayTitle} مع حلول متقدمة، نصائح عملية، وخطوات تطبيقية سهلة لعام 2026. تصفح التفاصيل الآن مجاناً!',\n};`
        },
        {
          title: 'React Helmet / Single Page App',
          language: 'tsx',
          description: 'تحديث الوصف ديناميكياً داخل تطبيقات React SPA',
          code: `<Helmet>\n  <meta\n    name="description"\n    content="اكتشف كل ما يخص ${displayTitle} مع حلول متقدمة، نصائح عملية، وخطوات تطبيقية سهلة لعام 2026. تصفح التفاصيل الآن مجاناً!"\n  />\n</Helmet>`
        }
      ]
    };
  }

  // 3. H1 Heading
  if (id.includes('h1') || id.includes('heading')) {
    return {
      badge: 'هيكل العناوين (DOM Structure)',
      headlineAr: 'ضبط التسلسل الهرمي لوسم H1 الرئيسي',
      codeContextAr: item.currentValue
        ? `الوضع الحالي في الصفحة: ${item.currentValue}`
        : 'لم يتم رصد وسم <h1> في نص الصفحة.',
      stepByStepActionAr:
        '1. ابحث في كود قالب الصفحة عن وسوم <h1> وتأكد من وجود وسم واحد فقط في قمة المحتوى.\n' +
        '2. إذا كانت هناك عناوين H1 إضافية (مثل شعار الموقع أو العناوين الجانبية)، حوّلها فوراً إلى <h2> أو <h3>.\n' +
        '3. ضمّن الكلمة المفتاحية المحورية للمقال أو الصفحة داخل نص الـ H1.',
      codeSnippet: `<header>\n  <h1>${displayTitle}</h1>\n</header>`,
      codeLanguage: 'html',
      whereToPutAr: 'في قمة المقال أو المحتوى النصي الرئيسي داخل وسم <main> أو <article>',
      expectedImpactAr: 'مساعدة عناكب جوجل في الفهم الفوري لموضوع الصفحة وتصنيفها في الكلمات ذات الصلة.',
      urgencyLevel: isError ? 'critical' : 'high',
      proTipAr: 'لا تستخدم وسم H1 لشعار الموقع في الصفحات الداخلية؛ احصره في عنوان المقال أو الخدمة.',
      solutions: [
        {
          title: 'HTML 5 Semantic Structure',
          language: 'html',
          description: 'الهيكل الدلالي القياسي لعنوان H1 الرئيسي متبوعاً بالعناوين الفرعية H2 و H3',
          code: `<article>\n  <header>\n    <!-- وسم H1 وحيد يركز على الكلمة الأساسية -->\n    <h1>${displayTitle}</h1>\n  </header>\n  \n  <section>\n    <h2>أبرز مميزات وخدمات عام 2026</h2>\n    <p>المحتوى النصي التمهيدي...</p>\n    \n    <h3>تفاصيل وحلول تطبيقية</h3>\n    <p>شرح فرعي...</p>\n  </section>\n</article>`
        },
        {
          title: 'React / Next.js Component',
          language: 'tsx',
          description: 'مكون عنوان دلالي متجاوب مع خطوط Tailwind CSS',
          code: `export function PageHeader() {\n  return (\n    <header className="mb-8">\n      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">\n        ${displayTitle}\n      </h1>\n    </header>\n  );\n}`
        }
      ]
    };
  }

  // 4. Canonical Tag
  if (id.includes('canonical')) {
    return {
      badge: 'السيو التقني (Technical SEO)',
      headlineAr: 'تثبيت الرابط المعياري (Canonical URL) لمنع تكرار المحتوى',
      codeContextAr: item.currentValue
        ? `الرابط المعياري الحالي: ${item.currentValue}`
        : 'وسم <link rel="canonical"> غير موجود في كود ترويسة الصفحة.',
      stepByStepActionAr:
        '1. أضف وسم canonical ذاتي يشير دائماً إلى الرابط الأصلي الدائم للصفحة بالبروتوكول الصحيح (https).\n' +
        '2. يحمي هذا الكود موقعك من معاقبة جوجل عند فتح الصفحة عبر معلمات تتبع (UTM Parameters) أو روابط فرعية مختلفة.',
      codeSnippet: `<link rel="canonical" href="${cleanUrl}" />`,
      codeLanguage: 'html',
      whereToPutAr: 'داخل قسم <head> قبل إغلاق الوسم </head>',
      expectedImpactAr: 'توحيد سلطة الصفحة (Page Authority) ومنع إهدار ميزانية الزحف في عناوين مكررة.',
      urgencyLevel: 'high',
      solutions: [
        {
          title: 'HTML 5 (<head>)',
          language: 'html',
          description: 'وسم الرابط المعياري المطلق مع بروتوكول HTTPS الصريح',
          code: `<link rel="canonical" href="${cleanUrl}" />`
        },
        {
          title: 'Next.js App Router (metadata)',
          language: 'typescript',
          description: 'تحديد الرابط المعياري عبر خاصية alternates في كائن metadata',
          code: `export const metadata = {\n  alternates: {\n    canonical: '${cleanUrl}',\n  },\n};`
        }
      ]
    };
  }

  // 5. Mobile Viewport
  if (id.includes('viewport')) {
    return {
      badge: 'التوافق مع الجوال (Mobile Optimization)',
      headlineAr: 'تهيئة وسم العرض للجوال (Viewport Meta Tag)',
      codeContextAr: item.currentValue
        ? `الوسم الحالي: ${item.currentValue}`
        : 'وسم viewport مفقود، مما يسبب ظهور الموقع بحجم مصغر على الهواتف الذكية.',
      stepByStepActionAr:
        '1. أضف وسم meta viewport القياسي لضبط تجاوب الموقع مع مقاسات الشاشات المختلفة.\n' +
        '2. هذا المعيار إلزامي لاجتياز اختبارات مؤشرات تجربة الصفحة (Mobile-First Indexing).',
      codeSnippet: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
      codeLanguage: 'html',
      whereToPutAr: 'كأول وسم ميتا داخل عنصر <head>',
      expectedImpactAr: 'تأهيل الموقع فورياً للفهرسة في جوجل للهواتف وتجنب رسائل الخطأ في Search Console.',
      urgencyLevel: 'critical',
      solutions: [
        {
          title: 'HTML 5 (<head>)',
          language: 'html',
          description: 'وسم viewport القياسي لضبط التجاوب ونسبة التكبير الأولي في المتصفح',
          code: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
        },
        {
          title: 'Next.js App Router (viewport)',
          language: 'typescript',
          description: 'تصدير كائن viewport الرسمي في Next.js 14/15 داخل layout.tsx',
          code: `import type { Viewport } from 'next';\n\nexport const viewport: Viewport = {\n  width: 'device-width',\n  initialScale: 1,\n  maximumScale: 5,\n  themeColor: '#4f46e5'\n};`
        }
      ]
    };
  }

  // 6. SSL / HTTPS
  if (id.includes('ssl') || id.includes('https')) {
    return {
      badge: 'الأمان والبروتوكول (HTTPS & SSL)',
      headlineAr: 'إلزام الزوار ومحركات البحث برابط HTTPS الآمن',
      codeContextAr: item.currentValue
        ? `الحالة الحالية: ${item.currentValue}`
        : 'الموقع يسمح بالوصول عبر بروتوكول HTTP غير المشفر.',
      stepByStepActionAr:
        '1. تأكد من تفعيل شهادة SSL سارية (مثل Let\'s Encrypt المجانية أو Cloudflare).\n' +
        '2. أضف كود إعادة التوجيه 301 في ملف .htaccess أو إعدادات Nginx لتحويل أي طلب http إلى https تلقائياً.',
      codeSnippet: `# في ملف .htaccess على خوادم Apache\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`,
      codeLanguage: 'apache',
      whereToPutAr: 'في ملف .htaccess في المجلد الرئيسي لموقعك أو في كتلة server في nginx.conf',
      expectedImpactAr: 'حماية بيانات الزوار واكتساب ميزة تفضيل الأمان في خوارزميات جوجل.',
      urgencyLevel: 'critical',
      solutions: [
        {
          title: 'Apache (.htaccess)',
          language: 'apache',
          description: 'تحويل 301 دائم لكافة روابط HTTP غير المشفرة إلى HTTPS',
          code: `RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`
        },
        {
          title: 'Nginx (nginx.conf)',
          language: 'nginx',
          description: 'كتلة توجيه Nginx الرسمية لإعادة التوجيه التلقائي إلى منفذ 443',
          code: `server {\n    listen 80;\n    listen [::]:80;\n    server_name ${domain} www.${domain};\n    return 301 https://$host$request_uri;\n}`
        },
        {
          title: 'Node.js Express Middleware',
          language: 'typescript',
          description: 'وسيط Express لإعادة توجيه حركة المرور إلى HTTPS في بيئات السحاب',
          code: `app.use((req, res, next) => {\n  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {\n    return res.redirect(301, \`https://\${req.header('host')}\${req.url}\`);\n  }\n  next();\n});`
        }
      ]
    };
  }

  // 7. Robots.txt
  if (id.includes('robots')) {
    const sitemapUrl = `${new URL(cleanUrl).origin}/sitemap.xml`;
    return {
      badge: 'توجيه العناكب (Crawl Directives)',
      headlineAr: 'إنشاء ملف robots.txt مع تضمين خريطة الموقع',
      codeContextAr: item.currentValue
        ? `حالة الملف الحالية: ${item.currentValue}`
        : 'ملف robots.txt غير متاح في المسار الرئيسي /robots.txt',
      stepByStepActionAr:
        '1. أنشئ ملفاً نصياً بسيطاً باسم robots.txt وارفعه في المجلد الرئيسي لموقعك (public_html).\n' +
        '2. اسمح لكافة محركات البحث بالزحف مع حظر مسارات لوحة التحكم واستدعاء رابط خريطة الموقع XML.',
      codeSnippet: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /wp-admin/\n\nSitemap: ${sitemapUrl}`,
      codeLanguage: 'txt',
      whereToPutAr: 'في المسار الجذري للموقع: /robots.txt',
      expectedImpactAr: 'تنظيم زحف بوتات جوجل وتوجيهها للمحتوى المهم وتوفير موارد الخادم.',
      urgencyLevel: 'high',
      solutions: [
        {
          title: 'ملف robots.txt القياسي',
          language: 'txt',
          description: 'ملف نصي يوضع في مجلد public_html للسماح بالفهرسة وربط خريطة الموقع',
          code: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /wp-admin/\nDisallow: /checkout/\n\nSitemap: ${sitemapUrl}`
        },
        {
          title: 'Next.js App Router (app/robots.ts)',
          language: 'typescript',
          description: 'توليد ملف robots.txt برمجياً وديناميكياً في Next.js',
          code: `import type { MetadataRoute } from 'next';\n\nexport default function robots(): MetadataRoute.Robots {\n  return {\n    rules: {\n      userAgent: '*',\n      allow: '/',\n      disallow: ['/admin/', '/api/'],\n    },\n    sitemap: '${sitemapUrl}',\n  };\n}`
        }
      ]
    };
  }

  // 8. XML Sitemap
  if (id.includes('sitemap')) {
    const sitemapUrl = `${new URL(cleanUrl).origin}/sitemap.xml`;
    return {
      badge: 'فهرسة المحتوى (XML Sitemap)',
      headlineAr: 'توليد وربط خريطة الموقع XML بـ Search Console',
      codeContextAr: item.currentValue
        ? `الوضع الحالي: ${item.currentValue}`
        : 'لم يتم العثور على خريطة الموقع في المسارات الشائعة (/sitemap.xml).',
      stepByStepActionAr:
        '1. أنشئ خريطة الموقع بصيغة XML (عبر إضافات السيو في CMS أو مولد خريطة آلي).\n' +
        '2. افتح Google Search Console وتوجه لقسم Sitemaps وأدخل رابط خريطة الموقع لتسريع الأرشفة.',
      codeSnippet: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${cleanUrl}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`,
      codeLanguage: 'xml',
      whereToPutAr: 'في المجلد الرئيسي للموقع أو عبر رابط مخصص مثل /sitemap_index.xml',
      expectedImpactAr: 'اكتشاف الصفحات والمقالات الجديدة فور نشرها وفهرستها خلال ساعات قليلة.',
      urgencyLevel: 'high',
      solutions: [
        {
          title: 'هيكل XML Sitemap القياسي',
          language: 'xml',
          description: 'ملف sitemap.xml صالح مع وسوم الأولوية وتاريخ التحديث الأخير',
          code: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${cleanUrl}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`
        },
        {
          title: 'Next.js App Router (app/sitemap.ts)',
          language: 'typescript',
          description: 'توليد ديناميكي لخريطة الموقع في Next.js متوافقة مع محركات البحث',
          code: `import type { MetadataRoute } from 'next';\n\nexport default function sitemap(): MetadataRoute.Sitemap {\n  return [\n    {\n      url: '${cleanUrl}',\n      lastModified: new Date(),\n      changeFrequency: 'daily',\n      priority: 1,\n    },\n  ];\n}`
        }
      ]
    };
  }

  // 9. Broken Links (404)
  if (id.includes('broken_external_links') || id.includes('broken_link') || id.includes('links_broken')) {
    return {
      badge: 'سلامة الروابط (Link Health)',
      headlineAr: 'إصلاح الروابط الخارجية المعطلة (404 Dead Links)',
      codeContextAr: item.currentValue
        ? `الحالة المرصودة: ${item.currentValue}`
        : 'تم رصد روابط تشير إلى صفحات غير موجودة أو معطوبة.',
      stepByStepActionAr:
        '1. افتح أداة فاحص الروابط المعطلة التفاعلية في المنصة للتعرف على عنوان الرابط المعطوب ونصه.\n' +
        '2. ادخل إلى محرر الصفحة واستبدل الرابط برابط بديل نشط، أو احذف وسم <a> مع الاحتفاظ بالنص التوضيحي.',
      codeSnippet: `<!-- استبدال الرابط المعطوب برابط موثوق ومباشر -->\n<a href="https://valid-resource.com/topic" rel="noopener noreferrer" target="_blank">\n  المرجع الموثوق والمحدث\n</a>`,
      codeLanguage: 'html',
      whereToPutAr: 'في نص المقال أو الصفحة التي تحتوي على الرابط المعطوب',
      expectedImpactAr: 'حماية تجربة المستخدم وحفظ ثقة محركات البحث وتفادي خسارة جودة المحتوى.',
      urgencyLevel: 'critical',
      solutions: [
        {
          title: 'HTML Link Tag',
          language: 'html',
          description: 'رابط آمن مع سمات الأمان noopener و noreferrer',
          code: `<a href="https://authoritative-source.org/guide" rel="noopener noreferrer" target="_blank">\n  المرجع الموثوق المحدث لعام 2026\n</a>`
        },
        {
          title: 'Next.js Link Component',
          language: 'tsx',
          description: 'استدعاء مكون Link في Next.js للروابط الخارجية الآمنة',
          code: `import Link from 'next/link';\n\n<Link \n  href="https://authoritative-source.org/guide"\n  target="_blank"\n  rel="noopener noreferrer"\n  className="text-cyan-600 hover:underline"\n>\n  المرجع التوثيقي المحدث\n</Link>`
        }
      ]
    };
  }

  // 10. Image Alt Attributes
  if (id.includes('img_alt') || id.includes('image_alt') || id.includes('images')) {
    return {
      badge: 'تهيئة الوسائط (Image SEO)',
      headlineAr: 'إضافة النصوص البديلة (alt) لصور الموقع',
      codeContextAr: item.currentValue
        ? `حالة الصور الحالية: ${item.currentValue}`
        : 'توجد صور تفتقر إلى خاصية alt في كود HTML.',
      stepByStepActionAr:
        '1. استخدم السمة <img alt> لكتابة محتوى وصفي دقيق وممثل للصورة يتضمن الكلمات المفتاحية الأساسية.\n' +
        '2. الصيغة القياسية الموصى بها في السيو: <img src="pic.gif" alt="نص الكلمات المفتاحية الدقيق والوصفي الذي يمثل الصورة." />\n' +
        '3. أضف خاصية loading="lazy" لتأجيل تحميل الصور خارج نطاق الرؤية الأول لتسريع الموقع وتحسين تجربة المستخدم.',
      codeSnippet: `<img src="pic.gif" alt="نص الكلمات المفتاحية الدقيق والوصفي الذي يمثل الصورة." loading="lazy" decoding="async" />`,
      codeLanguage: 'html',
      whereToPutAr: 'داخل وسوم <img> في كود HTML للقالب أو المقال',
      expectedImpactAr: 'ظهور صور موقعك في Google Images وجلب آلاف الزيارات المجانية المستهدفة.',
      urgencyLevel: isError ? 'critical' : 'high',
      proTipAr: 'استخدم صيغة WebP أو وسم <picture> واحرص دائماً على أن يكون نص alt واضحاً وموجزاً ويصف محتوى الصورة بدقة للقارئ ومحركات البحث.',
      solutions: [
        {
          title: 'HTML 5 القياسي (<img alt>)',
          language: 'html',
          description: 'استخدام السمة alt لكتابة محتوى وصفي غني بالكلمات المفتاحية الممثلة للصورة',
          code: `<img src="pic.gif" alt="نص الكلمات المفتاحية الدقيق والوصفي الذي يمثل الصورة." loading="lazy" decoding="async" />`
        },
        {
          title: 'Next.js Image Component',
          language: 'typescript',
          description: 'مكون next/image مع إلزامية خاصية alt لتحسين إمكانية الوصول والتوليد التلقائي لـ WebP/AVIF',
          code: `import Image from 'next/image';\n\nexport function ResponsiveImage() {\n  return (\n    <Image\n      src="/images/seo-banner.webp"\n      alt="رسم توضيحي تفصيلي يشرح خطوات تحسين السيو لمحركات البحث 2026"\n      width={800}\n      height={450}\n      loading="lazy"\n      placeholder="blur"\n      blurDataURL="data:image/svg+xml;base64,..."\n      className="rounded-xl shadow-lg"\n    />\n  );\n}`
        },
        {
          title: 'WordPress / PHP Template',
          language: 'php',
          description: 'استخراج خاصية alt ديناميكياً للصور البارزة والمرفقات في قوالب ووردبريس',
          code: `<?php\n// استدعاء الصورة البارزة مع نص alt تلقائي مأخوذ من عنوان التدوينة\nthe_post_thumbnail('large', [\n  'alt'     => esc_attr(get_the_title() . ' - دليل السيو الشامل'),\n  'loading' => 'lazy',\n  'class'   => 'rounded-2xl shadow-sm'\n]);\n?>`
        }
      ]
    };
  }

  // 11. Schema.org JSON-LD
  if (id.includes('schema') || id.includes('json_ld')) {
    return {
      badge: 'البيانات المنظمة (Structured Data)',
      headlineAr: 'تضمين كود Schema.org (JSON-LD) لنتائج البحث الثرية',
      codeContextAr: item.currentValue
        ? `حالة البيانات المنظمة: ${item.currentValue}`
        : 'كود البيانات المنظمة Schema غير مدرج في كود الصفحة.',
      stepByStepActionAr:
        '1. أضف كتلة سكربت JSON-LD توضح نوع محتوى الصفحة (مقال، موقع، منتج، أو مؤسسة).\n' +
        '2. يساعد هذا الكود محرك بحث جوجل في إظهار النجوم والأسعار والأسئلة الشائعة مباشرة في صفحة النتائج.',
      codeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "${displayTitle}",\n  "url": "${cleanUrl}",\n  "description": "منصة رائدة تقدم حلولاً احترافية لعام 2026"\n}\n</script>`,
      codeLanguage: 'json',
      whereToPutAr: 'داخل وسم <head> أو قبل إغلاق الوسم </body>',
      expectedImpactAr: 'الحصول على نتائج بحث ثرية (Rich Snippets) تزيد نقرات المستخدمين بنسبة 35%.',
      urgencyLevel: 'medium',
      solutions: [
        {
          title: 'JSON-LD WebSite Schema',
          language: 'json',
          description: 'مخطط الموقع العام مع خاصية صندوق البحث الداخلي في جوجل',
          code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "${displayTitle}",\n  "url": "${cleanUrl}",\n  "potentialAction": {\n    "@type": "SearchAction",\n    "target": "${cleanUrl}search?q={search_term_string}",\n    "query-input": "required name=search_term_string"\n  }\n}\n</script>`
        },
        {
          title: 'JSON-LD Article Schema',
          language: 'json',
          description: 'مخطط المقالات الإخبارية والمدونات لتسريع الأرشفة وظهور اسم المؤلف وتاريخ النشر',
          code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "${displayTitle}",\n  "datePublished": "${new Date().toISOString()}",\n  "dateModified": "${new Date().toISOString()}",\n  "author": {\n    "@type": "Person",\n    "name": "فريق التحرير المتخصص"\n  }\n}\n</script>`
        }
      ]
    };
  }

  // 12. Open Graph Tags
  if (id.includes('og') || id.includes('social') || id.includes('open_graph')) {
    return {
      badge: 'بطاقات المشاركة (Open Graph)',
      headlineAr: 'تهيئة وسوم المشاركة على منصات التواصل (OG Tags)',
      codeContextAr: item.currentValue
        ? `الوسوم المرصودة: ${item.currentValue}`
        : 'وسوم Open Graph غير متوفرة في كود الصفحة.',
      stepByStepActionAr:
        '1. أضف وسوم og:title و og:description و og:image و og:url داخل ترويسة الصفحة.\n' +
        '2. تضمن هذه الوسوم ظهور صورة غلاف جذابة وعنوان واضح عند مشاركة الرابط على واتساب وتويتر وفيسبوك.',
      codeSnippet: `<meta property="og:type" content="website" />\n<meta property="og:url" content="${cleanUrl}" />\n<meta property="og:title" content="${displayTitle}" />\n<meta property="og:description" content="دليل احترافي متكامل مع نصائح عملية لعام 2026." />\n<meta property="og:image" content="${new URL(cleanUrl).origin}/images/og-share-cover.jpg" />\n<meta name="twitter:card" content="summary_large_image" />`,
      codeLanguage: 'html',
      whereToPutAr: 'داخل وسم <head> في كود HTML',
      expectedImpactAr: 'ظهور بطاقة مشاركة احترافية ومضاعفة نسبة النقر والمشاركة على شبكات التواصل.',
      urgencyLevel: 'medium',
      solutions: [
        {
          title: 'HTML Open Graph & Twitter Cards',
          language: 'html',
          description: 'حزمة وسوم الميتا القياسية للشبكات الاجتماعية (Facebook, X / Twitter, WhatsApp, LinkedIn)',
          code: `<meta property="og:type" content="website" />\n<meta property="og:site_name" content="${domain}" />\n<meta property="og:url" content="${cleanUrl}" />\n<meta property="og:title" content="${displayTitle} | الإصدار المحدث 2026" />\n<meta property="og:description" content="اكتشف الدليل الشامل مع نصائح عملية وحصرية لعام 2026. تصفح الآن!" />\n<meta property="og:image" content="${new URL(cleanUrl).origin}/images/og-cover.jpg" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${displayTitle}" />`
        },
        {
          title: 'Next.js App Router OpenGraph',
          language: 'typescript',
          description: 'تصدير كائن openGraph و twitter عبر Next.js Metadata API',
          code: `export const metadata = {\n  openGraph: {\n    title: '${displayTitle}',\n    description: 'دليل احترافي متكامل لعام 2026',\n    url: '${cleanUrl}',\n    siteName: '${domain}',\n    images: [\n      {\n        url: '${new URL(cleanUrl).origin}/images/og-cover.jpg',\n        width: 1200,\n        height: 630,\n        alt: '${displayTitle}',\n      },\n    ],\n    locale: 'ar_AR',\n    type: 'website',\n  },\n  twitter: {\n    card: 'summary_large_image',\n  },\n};`
        }
      ]
    };
  }

  // 13. Server Response Time / TTFB / Speed
  if (id.includes('ttfb') || id.includes('speed') || id.includes('response_time')) {
    return {
      badge: 'سرعة الاستجابة (TTFB & Server Speed)',
      headlineAr: 'تسريع زمن استجابة الخادم وتفعيل التخزين المؤقت',
      codeContextAr: item.currentValue
        ? `زمن الاستجابة المقاس: ${item.currentValue}`
        : 'زمن استجابة الخادم يتطلب تحسيناً.',
      stepByStepActionAr:
        '1. فعّل شبكة توزيع المحتوى Cloudflare CDN مجاناً لتقريب الموقع جغرافياً من الزوار.\n' +
        '2. فعّل كود التخزين المؤقت للمتصفح (Browser Caching) لتقليل طلبات الخادم المكررة.',
      codeSnippet: `# في ملف .htaccess لتفعيل كاش المتصفح\n<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresDefault "access plus 1 month"\n  ExpiresByType text/html "access plus 1 hour"\n  ExpiresByType image/webp "access plus 1 year"\n</IfModule>`,
      codeLanguage: 'apache',
      whereToPutAr: 'في ملف .htaccess أو داخل كتلة location في nginx.conf',
      expectedImpactAr: 'خفض وقت تحميل الموقع بأكثر من 50% وتحسين تقييم Core Web Vitals.',
      urgencyLevel: isError ? 'critical' : 'high',
      solutions: [
        {
          title: 'Apache Browser Caching (.htaccess)',
          language: 'apache',
          description: 'تفعيل ترويسات انتهاء الصلاحية والتخزين المؤقت للأصول الثابتة',
          code: `<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresDefault "access plus 1 month"\n  ExpiresByType text/html "access plus 1 hour"\n  ExpiresByType text/css "access plus 1 year"\n  ExpiresByType application/javascript "access plus 1 year"\n  ExpiresByType image/webp "access plus 1 year"\n</IfModule>`
        },
        {
          title: 'Nginx FastCGI / Microcache (nginx.conf)',
          language: 'nginx',
          description: 'تخزين صفحات الويب في ذاكرة الوصول العشوائي للرد في أقل من 50ms',
          code: `location ~* \\.(jpg|jpeg|png|gif|ico|css|js|webp)$ {\n    expires 365d;\n    add_header Cache-Control "public, no-transform";\n    access_log off;\n}`
        }
      ]
    };
  }

  // 14. Core Web Vitals (LCP)
  if (id.includes('lcp') || id.includes('cwv_lcp')) {
    return {
      badge: 'مؤشرات الأداء الأساسية (Core Web Vitals - LCP)',
      headlineAr: 'تسريع تحميل العنصر الأكبر في الصفحة (LCP)',
      codeContextAr: item.currentValue
        ? `قيمة LCP الحالية: ${item.currentValue}`
        : 'سرعة رسم المحتوى الرئيسي تتطلب تحسيناً لتكون أقل من 2.5 ثانية.',
      stepByStepActionAr:
        '1. حدد الصورة أو البانر الرئيسي في الصفحة واستدعِه مسبقاً عبر وسم Preload.\n' +
        '2. استخدم خاصية fetchpriority="high" لإعطاء الأولوية القصوى لهذا العنصر قبل بقية الأكواد.',
      codeSnippet: `<!-- التنزيل المسبق للصورة الرئيسية في ترويسة الصفحة -->\n<link rel="preload" as="image" href="/hero-banner.webp" fetchpriority="high" />`,
      codeLanguage: 'html',
      whereToPutAr: 'في بداية وسم <head> قبل ملفات CSS غير الحرجة',
      expectedImpactAr: 'تحقيق نتيجة خضراء في LCP وتفادي رسائل التحذير في تقرير PageSpeed.',
      urgencyLevel: 'high',
      solutions: [
        {
          title: 'HTML 5 Preload with High Priority',
          language: 'html',
          description: 'وسم تنزيل مسبق عالي الأولوية لأكبر عنصر مرئي في النطاق الأول',
          code: `<link rel="preload" as="image" href="/hero-banner.webp" fetchpriority="high" type="image/webp" />`
        },
        {
          title: 'Next.js Image (priority)',
          language: 'tsx',
          description: 'تفعيل خاصية priority في مكون Next.js Image لتخطي التحميل الكسول',
          code: `<Image\n  src="/hero-banner.webp"\n  alt="${displayTitle}"\n  width={1200}\n  height={630}\n  priority\n  fetchPriority="high"\n  className="w-full h-auto"\n/>`
        }
      ]
    };
  }

  // 15. Core Web Vitals (CLS)
  if (id.includes('cls') || id.includes('cwv_cls') || id.includes('layout_shift')) {
    return {
      badge: 'ثبات التصميم البصري (Core Web Vitals - CLS)',
      headlineAr: 'منع قفز العناصر أثناء التحميل (Cumulative Layout Shift)',
      codeContextAr: item.currentValue
        ? `قيمة CLS الحالية: ${item.currentValue}`
        : 'يحدث اهتزاز في الصفحة أثناء تحميل الإعلانات والصور.',
      stepByStepActionAr:
        '1. أضف أبعاد width و height الصريحة لكل وسم <img> أو <iframe> في الكود المصدري.\n' +
        '2. احجز مساحات ثابتة للإعلانات أو البنرات باستخدام خاصية aspect-ratio في CSS.',
      codeSnippet: `/* حجز مساحة مسبقة لمنع قفز العناصر */\n.hero-img-container {\n  aspect-ratio: 16 / 9;\n  width: 100%;\n  background-color: #f1f5f9;\n}`,
      codeLanguage: 'css',
      whereToPutAr: 'في ملف التنسيق الرئيسي style.css أو داخل وسم <style>',
      expectedImpactAr: 'تجربة قراءة مريحة وثابتة واجتياز معيار CLS بنتيجة ممتازة (أقل من 0.1).',
      urgencyLevel: 'medium',
      solutions: [
        {
          title: 'CSS Modern Aspect-Ratio',
          language: 'css',
          description: 'تخصيص نسبة أبعاد ثابتة للصناديق والوسائط قبل تحميل ملف الصورة',
          code: `/* حجز مساحة العناصر وتفادي قفز المتصفح */\n.media-frame {\n  aspect-ratio: 16 / 9;\n  width: 100%;\n  contain-intrinsic-size: 800px 450px;\n  content-visibility: auto;\n}`
        },
        {
          title: 'HTML 5 Image Explicit Dimensions',
          language: 'html',
          description: 'كتابة أبعاد العرض والارتفاع الطبيعية للصورة مباشرة في كود HTML',
          code: `<img\n  src="/media/cover.webp"\n  alt="غلاف المقال الدلالي"\n  width="1200"\n  height="675"\n  style="max-width: 100%; height: auto;"\n/>`
        }
      ]
    };
  }

  // 16. Security Headers (CSP & HSTS)
  if (id.includes('csp') || id.includes('hsts') || id.includes('security')) {
    return {
      badge: 'ترويسات الحماية المتقدمة (Security Headers)',
      headlineAr: 'تثبيت ترويسات الأمان CSP و HSTS في الخادم',
      codeContextAr: item.currentValue
        ? `الحالة الحالية: ${item.currentValue}`
        : 'ترويسات الأمان الصارمة غير مفعّلة في استجابة الخادم.',
      stepByStepActionAr:
        '1. أضف ترويسة Strict-Transport-Security لإلزام التصفح المشفر لمدة عام كامل.\n' +
        '2. أضف ترويسة Content-Security-Policy لمنع حقن السكربتات الخبيثة (XSS).',
      codeSnippet: `# في خادم Apache عبر .htaccess\nHeader always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"\nHeader set X-Content-Type-Options "nosniff"\nHeader set X-Frame-Options "SAMEORIGIN"\nHeader set Referrer-Policy "strict-origin-when-cross-origin"`,
      codeLanguage: 'apache',
      whereToPutAr: 'في ملف .htaccess أو ملف إعدادات الخادم Nginx / Apache',
      expectedImpactAr: 'حماية موقعك من الاختراق واكتساب درجة أمان A+ في اختبارات Security Headers.',
      urgencyLevel: isError ? 'critical' : 'high',
      solutions: [
        {
          title: 'Apache (.htaccess)',
          language: 'apache',
          description: 'ترويسات الحماية الأربعة الأساسية لصد XSS و Clickjacking و Sniffing',
          code: `Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"\nHeader set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; object-src 'none'; base-uri 'self';"\nHeader set X-Content-Type-Options "nosniff"\nHeader set X-Frame-Options "SAMEORIGIN"`
        },
        {
          title: 'Nginx (nginx.conf)',
          language: 'nginx',
          description: 'توجيهات ترويسات الأمان داخل كتلة server في خادم Nginx',
          code: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\nadd_header Content-Security-Policy "default-src 'self'; object-src 'none'; base-uri 'self';" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header X-Frame-Options "SAMEORIGIN" always;`
        },
        {
          title: 'Node.js Express (Helmet.js)',
          language: 'typescript',
          description: 'حماية تطبيقات Node.js و Express باستخدام حزمة helmet الرسمية',
          code: `import helmet from 'helmet';\n\napp.use(\n  helmet({\n    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },\n    contentSecurityPolicy: {\n      directives: {\n        defaultSrc: ["'self'"],\n        scriptSrc: ["'self'", "'unsafe-inline'"],\n        objectSrc: ["'none'"],\n      },\n    },\n  })\n);`
        }
      ]
    };
  }

  // 17. Internal Linking
  if (id.includes('internal_link') || id.includes('internal')) {
    return {
      badge: 'ترابط الصفحات (Internal Link Architecture)',
      headlineAr: 'بناء شبكة روابط داخلية سياقية (Topic Clusters)',
      codeContextAr: item.currentValue
        ? `حالة الروابط الداخلية: ${item.currentValue}`
        : 'الصفحة تفتقر للروابط الداخلية السياقية التي تدعم المقالات الأخرى.',
      stepByStepActionAr:
        '1. أضف ما بين 3 إلى 5 روابط داخلية في فقرات المقال توجه القارئ لصفحات ذات صلة.\n' +
        '2. استخدم نصاً دلالياً واضحاً (Anchor Text) بدلاً من الكلمات العامة مثل "اضغط هنا".',
      codeSnippet: `<p>للاطلاع على الخطة الكاملة، يمكنك تصفح <a href="/seo-roadmap" title="خارطة طريق السيو">خارطة طريق السيو التنفيذية لمدة 30 يوماً</a>.</p>`,
      codeLanguage: 'html',
      whereToPutAr: 'في صلب المقال أو داخل أقسام المحتوى ذات العلاقة',
      expectedImpactAr: 'توزيع قوة الأرشفة (Link Equity) وخفض معدل الارتداد وزيادة وقت بقاء الزائر.',
      urgencyLevel: 'medium',
      solutions: [
        {
          title: 'HTML Semantic Anchor',
          language: 'html',
          description: 'رابط داخلي سياقي طبيعي داخل فقرة مع عنوان وصفي دقيق',
          code: `<p>\n  يمكنك أيضاً الاطلاع على دليلنا الشامل حول \n  <a href="/technical-audit" class="font-bold text-indigo-600 hover:underline" title="دليل التدقيق التقني">\n    خطوات التدقيق التقني المتقدم لأرشفة جوجل 2026\n  </a> \n  لتفادي الأخطاء الشائعة.\n</p>`
        },
        {
          title: 'Next.js App Link',
          language: 'tsx',
          description: 'مكون Next.js Link للتنقل الفوري بين المقالات المترابطة بدون إعادة تحميل',
          code: `import Link from 'next/link';\n\n<Link \n  href="/topic-cluster/keyword-guide"\n  className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"\n>\n  <span>دليل استهداف الكلمات المفتاحية الذكية</span>\n  <span>&larr;</span>\n</Link>`
        }
      ]
    };
  }

  // 18. Keyword Density & Optimization
  if (id.includes('keyword') || id.includes('stuffing')) {
    return {
      badge: 'الكلمات المفتاحية (Keyword Optimization)',
      headlineAr: 'توزيع الكلمات المفتاحية دلالياً دون حشو مفرط',
      codeContextAr: item.currentValue
        ? `كثافة الكلمات الحالية: ${item.currentValue}`
        : 'توزيع الكلمات المفتاحية يحتاج إلى موازنة دلالية في هيكل الصفحة.',
      stepByStepActionAr:
        '1. حافظ على كثافة الكلمة الرئيسية بين 1% إلى 2.5% من إجمالي عدد كلمات المقال.\n' +
        '2. وزع الكلمة في الأماكن الاستراتيجية: وسم H1، أول 100 كلمة، عنوان فرعي H2، وسم alt لصورة واحدة، والخاتمة.',
      codeSnippet: `<article>\n  <h1>الكلمة المفتاحية الرئيسية | دليل 2026</h1>\n  <p>في أول 100 كلمة نذكر الكلمة المفتاحية الرئيسية وسياقها الدلالي بدقة...</p>\n  <h2>أبرز مرادفات الكلمة (LSI Keywords)</h2>\n</article>`,
      codeLanguage: 'html',
      whereToPutAr: 'في متن المحتوى والعناوين الفرعية والمقدمة',
      expectedImpactAr: 'تفادي عقوبات حشو الكلمات (Keyword Stuffing) والتصدر في المرادفات الطبيعية.',
      urgencyLevel: 'high',
      solutions: [
        {
          title: 'قالب التوزيع الدلالي (Semantic Layout)',
          language: 'html',
          description: 'هيكل توزيع متوازن للكلمة المفتاحية عبر العناوين والمقدمة والنص البديل',
          code: `<article>\n  <!-- 1. الكلمة في العنوان الرئيسي -->\n  <h1>الدليل الشامل لتحسين السيو لعام 2026</h1>\n  \n  <!-- 2. الكلمة في أول فقرة تمهيدية -->\n  <p>\n    يعتبر <strong>تحسين السيو لعام 2026</strong> ركيزة أساسية لنمو الأعمال الرقمية...\n  </p>\n  \n  <!-- 3. مرادفات LSI في العناوين الفرعية -->\n  <h2>استراتيجيات تصدر نتائج محركات البحث</h2>\n</article>`
        }
      ]
    };
  }

  // 19. Word count / Thin content
  if (id.includes('word_count') || id.includes('content_length') || id.includes('content')) {
    return {
      badge: 'عمق المحتوى وجودته (Content Quality)',
      headlineAr: 'إثراء المحتوى النصي وتغطية الفجوات المعلوماتية',
      codeContextAr: item.currentValue
        ? `حجم المحتوى الحالي: ${item.currentValue}`
        : 'المحتوى النصي الحالي قصير مقارنة بالمواقع المتصدرة في هذا المجال.',
      stepByStepActionAr:
        '1. أضف أقساماً جديدة تجيب على الأسئلة الشائعة التي يبحث عنها الجمهور حول الموضوع.\n' +
        '2. نسّق المحتوى باستخدام نقاط وتعدادات رقمية وجداول مقارنة لتسهيل القراءة السريعة.',
      codeSnippet: `<section class="faq-section">\n  <h2>الأسئلة الشائعة حول ${displayTitle}</h2>\n  <details>\n    <summary>ما هي أهم خطوة لتحسين نتائج السيو؟</summary>\n    <p>البدء بإصلاح الأخطاء التقنية وضبط العناوين والروابط الداخلية.</p>\n  </details>\n</section>`,
      codeLanguage: 'html',
      whereToPutAr: 'في الجزء الأخير من المقال أو قبل التذييل',
      expectedImpactAr: 'تغطية نية البحث بالكامل والتصنيف في كلمات مفتاحية فرعية متعددة.',
      urgencyLevel: 'high',
      solutions: [
        {
          title: 'HTML 5 Semantic FAQ Accordion',
          language: 'html',
          description: 'قسم أسئلة شائعة دلالي مع وسوم details و summary لزيادة عمق المحتوى بدون تعقيد JavaScript',
          code: `<section class="my-8 space-y-4">\n  <h2 class="text-xl font-bold">الأسئلة الشائعة الأكثر تداولاً</h2>\n  \n  <details class="p-4 rounded-xl border border-slate-200 bg-slate-50">\n    <summary class="font-bold cursor-pointer">كيف أبدأ في تحسين أداء موقعي؟</summary>\n    <p class="mt-2 text-slate-600 leading-relaxed">\n      ابدأ بفحص ترويسات الأمان وضبط الميتا تاج وتسريع استجابة الخادم لتقليل وقت TTFB.\n    </p>\n  </details>\n</section>`
        }
      ]
    };
  }

  // Generic Fallback based on item's existing data
  const fallbackSnippet = item.codeSnippet || `<!-- تحسين معيار ${item.titleAr} -->\n<!-- راجع إرشادات التهيئة الموصى بها في تقرير السيو -->`;
  return {
    badge: `فحص ${item.category.toUpperCase()}`,
    headlineAr: `توجيه برمجي مخصص: ${item.titleAr}`,
    codeContextAr: item.currentValue
      ? `القيمة الحالية المرصودة في كود الموقع: "${item.currentValue}".`
      : 'يحتاج هذا المعيار لمراجعة سريعة في الكود المصدري.',
    stepByStepActionAr: item.fixGuideAr || 'راجع كود الصفحة وطبق أفضل ممارسات السيو المقترحة.',
    codeSnippet: fallbackSnippet,
    codeLanguage: 'html',
    whereToPutAr: 'في الملف المصدري المناسب لقالب الموقع أو ترويسة HTML',
    expectedImpactAr: 'رفع النتيجة الإجمالية للفحص والارتقاء بترتيب الصفحة في محركات البحث.',
    urgencyLevel: isError ? 'critical' : isWarning ? 'high' : 'medium',
    solutions: [
      {
        title: 'قالب الكود الموصى به',
        language: 'html',
        description: 'الشفرة البرمجية المباشرة الموصى بها لإصلاح هذا المعيار في كود الموقع',
        code: fallbackSnippet
      }
    ]
  };
}

export interface SmartTipItem {
  technicalContext: string;
  actionableTip: string;
  badge: string;
  urgency: 'critical' | 'warning' | 'pass';
  codeSuggestion?: string;
}

/**
 * Returns an instant Smart Tip built specifically around the technical context of the detected error,
 * providing actionable engineering advice rather than a generic status label.
 */
export function getSmartTipForAuditItem(
  item: AuditItem,
  isArabic: boolean = true,
  pageUrl?: string,
  pageTitle?: string
): SmartTipItem {
  const id = item.id.toLowerCase();
  const domain = getCleanDomain(pageUrl);
  const cleanUrl = pageUrl || `https://${domain}/`;
  const isPass = item.status === 'pass';
  const isError = item.status === 'error';
  const urgency = isPass ? 'pass' : isError ? 'critical' : 'warning';

  if (isArabic) {
    if (isPass) {
      return {
        badge: 'معيار متطابق ومهيأ برمجياً',
        technicalContext: `فحص كود الصفحة أظهر توافقاً دقيقاً مع المعايير القياسية لمحركات البحث (القيمة المعتمدة: ${item.currentValue || 'سليمة'}).`,
        actionableTip: 'المعيار مضبوط بكفاءة عالية؛ احرص على الحفاظ على هذا الإعداد في تحديثات القوالب والنشر القادمة لتفادي أي ارتداد في الترتيب.',
        urgency: 'pass'
      };
    }

    // 1. Headings H1
    if (id.includes('h1') || id.includes('heading')) {
      const isMultiple = (item.currentValue || '').includes('متعدد') || (item.currentValue || '').includes('عناوين H1');
      return {
        badge: 'هيكل العناوين الدلالية',
        technicalContext: isMultiple
          ? `تم رصد أكثر من وسم <h1> في شفرة DOM (${item.currentValue})، مما يشتت خوارزميات محركات البحث حول الموضوع المحوري.`
          : `شفرة الصفحة تفتقر لوسم <h1> منفرد في محتوى المقال، مما يضعف فهم Googlebot للهدف الأساسي للصفحة.`,
        actionableTip: 'احتفظ بوسم <h1> منفرد في قمة المحتوى يدمج الكلمة المستهدفة الرئيسية مع اسم علامتك، وحوّل كافة العناوين الفرعية الجانبية فوراً إلى <h2> أو <h3>.',
        codeSuggestion: `<h1>${pageTitle && pageTitle !== 'عنوان غير معروف' ? pageTitle : `دليل ${domain} الشامل لعام 2026`}</h1>`,
        urgency
      };
    }

    // 2. Images Alt
    if (id.includes('images_alt') || id.includes('alt')) {
      return {
        badge: 'أرشفة الوسائط وإمكانية الوصول',
        technicalContext: `رُصدت صور في كود الصفحة تفتقر لسمة النص البديل (${item.currentValue || 'وسم alt مفقود'})، مما يعطل أرشفتها في بحث صور جوجل ويضر بمعايير إتاحة الويب.`,
        actionableTip: 'أضف خاصية alt="وصف دقيق للمشهد" بطول 3 إلى 7 كلمات لكل وسم <img>، واحرص على وصف محتوى الصورة بوضوح دون تكرار عشوائي للكلمات المفتاحية.',
        codeSuggestion: `<img src="/images/banner.webp" alt="رسم بياني يوضح خطوات تحسين السيو التقني لعام 2026" loading="lazy" />`,
        urgency
      };
    }

    // 3. CSP Security Header
    if (id.includes('csp')) {
      return {
        badge: 'أمان استجابة الخادم (HTTP Security)',
        technicalContext: 'ترويسة Content-Security-Policy غير معلنة في استجابة الخادم، مما يفتح ثغرة محتملة لهجمات حقن السكربتات الخبيثة (XSS) وتضمين الموارد الخارجية غير المصرح بها.',
        actionableTip: 'أضف ترويسة سياسة أمان المحتوى في خادم الويب (Nginx / Cloudflare / Apache) لتحديد النطاقات المسموح بتحميل السكربتات والخطوط منها.',
        codeSuggestion: `Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com; style-src 'self' 'unsafe-inline';`,
        urgency
      };
    }

    // 4. HSTS Security Header
    if (id.includes('hsts')) {
      return {
        badge: 'تشفير النقل الصارم (HSTS)',
        technicalContext: 'غياب ترويسة Strict-Transport-Security يسمح للمتصفحات بمحاولة الاتصال عبر بروتوكول HTTP غير المشفر قبل إعادة التوجيه، مما يعرض الزوار لهجمات SSL Stripping.',
        actionableTip: 'فعّل الترويسة في استجابة الخادم مع ضبط صلاحية عام كامل وتضمين النطاقات الفرعية لتأمين الاتصال التام.',
        codeSuggestion: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
        urgency
      };
    }

    // 5. Broken Links
    if (id.includes('broken') || id.includes('404')) {
      return {
        badge: 'سلامة الروابط وميزانية الزحف',
        technicalContext: `تم اكتشاف روابط خارجية أو داخلية مكسورة ترجع كود الخطأ 404 (${item.currentValue || 'روابط معطلة'})، مما يهدر ميزانية زحف الروبوتات ويزيد معدل الارتداد.`,
        actionableTip: 'استبدل فوراً الروابط المعطلة بروابط نشطة تعمل، أو استخدم إعادة توجيه 301 للصفحة البديلة الأكثر ملاءمة لحفظ قوة أرشفة الصفحات.',
        urgency
      };
    }

    // 6. Schema.org / JSON-LD
    if (id.includes('schema') || id.includes('json_ld')) {
      return {
        badge: 'البيانات المنظمة والمقتطفات الغنية',
        technicalContext: 'الصفحة تفتقر إلى ترميز البيانات المنظمة (Structured Data) أو تحتوي أخطاء هيكلية تمنع جوجل من إدراك طبيعة المحتوى.',
        actionableTip: 'احقن كتلة سكربت JSON-LD مناسبة لطبيعة صفحتك (مثل Article للمدونات أو Organization للشركات) داخل وسم <head> لتفعيل ظهور المقتطفات الغنية (Rich Snippets).',
        codeSuggestion: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "${pageTitle || 'عنوان المقال'}",\n  "url": "${cleanUrl}"\n}\n</script>`,
        urgency
      };
    }

    // 7. Meta Description
    if (id.includes('meta_desc') || id.includes('description')) {
      return {
        badge: 'وسوم ترويسة الصفحة (SERP Snippet)',
        technicalContext: `وسم meta description الحالي (${item.currentValue || 'مفقود'}) لا يفي بالمعايير القياسية لنوافذ العرض بمحركات البحث.`,
        actionableTip: 'صِغ وصفاً تعريفي بين 120-155 حرفاً يتضمن كلمة البحث الرئيسية وعبارة تحفيزية (CTA) تدفع القارئ للنقر، وتجنب تكرار الوصف عبر صفحات الموقع.',
        codeSuggestion: `<meta name="description" content="اكتشف الدليل المتكامل لإتقان السيو لعام 2026 مع نصائح عملية وخطوات تطبيقية فورية لرفع ترتيبك في جوجل." />`,
        urgency
      };
    }

    // 8. Canonical URL
    if (id.includes('canonical')) {
      return {
        badge: 'توحيد الأرشفة (Link Equity)',
        technicalContext: 'غياب وسم canonical يجعل محركات البحث تتعامل مع الروابط ذات معلمات التتبع (مثل ?ref= أو ?utm=) كصفحات مستقلة مكررة.',
        actionableTip: 'أضف رابطاً معيارياً ذاتياً يشير إلى العنوان الدائم الأصلي للصفحة ببروتوكول HTTPS الصريح لتوحيد أوزان الروابط.',
        codeSuggestion: `<link rel="canonical" href="${cleanUrl}" />`,
        urgency
      };
    }

    // 9. Load Time / TTFB / Core Web Vitals
    if (id.includes('load_time') || id.includes('ttfb') || id.includes('cwv') || id.includes('speed')) {
      return {
        badge: 'سرعة استجابة الخادم والأداء',
        technicalContext: `زمن الاستجابة الأولي (${item.currentValue || 'مرتفع'}) يتجاوز عتبة الـ 600ms التي توصي بها جوجل لضمان تجربة تصفح سريعة.`,
        actionableTip: 'فعّل التخزين المؤقت للذاكرة (Fastly / Cloudflare Edge Caching أو Redis)، وضغط الأصول عبر Brotli، وأخّر تحميل سكربتات الطرف الثالث غير الحرجة.',
        urgency
      };
    }

    // 10. Title Tag
    if (id.includes('title')) {
      return {
        badge: 'العنوان الأساسي في نتائج البحث',
        technicalContext: `طول عنوان الصفحة أو هيكله الحالي (${item.currentValue || 'غير مثالي'}) يهدد باقتطاعه أو إضعاف وزنه في خوارزميات الترتيب.`,
        actionableTip: 'اجعل العنوان بين 45 إلى 60 حرفاً، وضع الكلمة المفتاحية في أول 3 كلمات متبوعة بفاصل وعلامتك التجارية.',
        codeSuggestion: `<title>${pageTitle || domain} | دليلك المتكامل للسيو لعام 2026</title>`,
        urgency
      };
    }

    // 11. Viewport / Mobile
    if (id.includes('viewport') || id.includes('mobile')) {
      return {
        badge: 'التوافق مع الهواتف الذكية',
        technicalContext: 'وسم العرض viewport غير مهيأ بصورة صحيحة، مما يؤدي لتصغير النصوص والعناصر على شاشات الأجهزة اللوحية والمحمولة.',
        actionableTip: 'أضف وسم meta viewport كأول وسم داخل <head> لتمكين متصفحات الجوال من ضبط مقياس العرض بنسبة 1:1 وفق معايير فهرسة الجوال أولاً.',
        codeSuggestion: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
        urgency
      };
    }

    // 12. Robots.txt
    if (id.includes('robots')) {
      return {
        badge: 'توجيه زواحف البحث (Crawl Directives)',
        technicalContext: 'ملف robots.txt يحتاج مراجعة دقيقة لضمان عدم حظر موارد CSS و JS اللازمة لتصيير الصفحة وتحديد موقع خريطة الموقع.',
        actionableTip: 'اسمح لمحرك Googlebot بالوصول للأصول البرمجية، واختم الملف برابط خريطة الموقع الصريح.',
        codeSuggestion: `User-agent: *\nAllow: /\nSitemap: ${cleanUrl}sitemap.xml`,
        urgency
      };
    }

    // 13. Sitemap.xml
    if (id.includes('sitemap')) {
      return {
        badge: 'فهرسة الصفحات والتحديثات',
        technicalContext: 'خريطة الموقع XML غير معلنة في مسارها القياسي، مما يبطئ اكتشاف محركات البحث للمقالات والتحديثات الجديدة.',
        actionableTip: 'ولّد خريطة موقع ديناميكية تضم التواريخ الدقيقة لآخر تعديل <lastmod>، وقدمها رسمياً عبر لوحة Google Search Console.',
        urgency
      };
    }

    // 14. SSL / HTTPS
    if (id.includes('ssl') || id.includes('https')) {
      return {
        badge: 'تأمين الاتصال والشهادات',
        technicalContext: 'الموقع يتيح تصفح صفحاته عبر بروتوكول HTTP غير المشفر دون إعادة توجيه صارمة.',
        actionableTip: 'ثبّت شهادة SSL حديثة وأضف كود إعادة التوجيه 301 الإجباري الدائم من http إلى https في ملف .htaccess أو إعدادات Nginx.',
        codeSuggestion: `RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`,
        urgency
      };
    }

    // Default Arabic Fallback
    return {
      badge: `تدقيق ${item.category.toUpperCase()}`,
      technicalContext: item.currentValue
        ? `الحالة البرمجية المكتشفة: "${item.currentValue}".`
        : 'رُصدت فرصة تحسين تقنية مهمة لهذا المعيار في كود الموقع.',
      actionableTip: item.fixGuideAr || 'راجع الكود المصدري وطبق توجيهات السيو الدلالية والتقنية القياسية.',
      codeSuggestion: item.codeSnippet,
      urgency
    };
  } else {
    // English version
    if (isPass) {
      return {
        badge: 'Fully Compliant Standard',
        technicalContext: `Source code audit confirms standard search engine compliance (current value: ${item.currentValue || 'valid'}).`,
        actionableTip: 'This criterion is properly configured; retain this structure during future template updates to maintain ranking stability.',
        urgency: 'pass'
      };
    }

    if (id.includes('h1') || id.includes('heading')) {
      return {
        badge: 'Semantic Hierarchy',
        technicalContext: `Multiple or missing <h1> elements detected (${item.currentValue || 'issue detected'}), diluting crawler topical clarity.`,
        actionableTip: 'Retain a single prominent <h1> containing your primary keyword at the top of the article, converting all auxiliary headings to <h2> or <h3>.',
        codeSuggestion: `<h1>${pageTitle && pageTitle !== 'عنوان غير معروف' ? pageTitle : `${domain} 2026 Guide`}</h1>`,
        urgency
      };
    }

    if (id.includes('images_alt') || id.includes('alt')) {
      return {
        badge: 'Media Accessibility & SEO',
        technicalContext: `Images detected lacking alt attributes (${item.currentValue || 'missing alt'}), blocking Google Image indexing.`,
        actionableTip: 'Add descriptive alt="precise context description" attributes (3-7 words) to all <img> tags to boost image search rank and screen reader accessibility.',
        codeSuggestion: `<img src="/images/example.webp" alt="Detailed technical illustration of SEO audit" loading="lazy" />`,
        urgency
      };
    }

    if (id.includes('csp')) {
      return {
        badge: 'HTTP Security Headers',
        technicalContext: 'Content-Security-Policy header is missing in server HTTP response, exposing the application to cross-site scripting (XSS).',
        actionableTip: 'Configure a strict Content-Security-Policy header in your web server (Nginx/Cloudflare/Apache) to whitelist authorized script and asset origins.',
        codeSuggestion: `Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com;`,
        urgency
      };
    }

    if (id.includes('hsts')) {
      return {
        badge: 'Transport Security (HSTS)',
        technicalContext: 'Strict-Transport-Security header is missing, allowing vulnerable unencrypted HTTP handshakes before redirection.',
        actionableTip: 'Enable HSTS with a one-year max-age and includeSubDomains to force browsers into persistent encrypted HTTPS connections.',
        codeSuggestion: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
        urgency
      };
    }

    if (id.includes('broken') || id.includes('404')) {
      return {
        badge: 'Crawl Health & User Trust',
        technicalContext: `Dead hyperlinks returning 404 response codes detected (${item.currentValue || 'broken links'}), wasting crawl budget.`,
        actionableTip: 'Replace dead outbound URLs with active equivalents or execute permanent 301 redirects to preserve link equity.',
        urgency
      };
    }

    if (id.includes('schema') || id.includes('json_ld')) {
      return {
        badge: 'Structured Data & Rich Snippets',
        technicalContext: 'Schema.org JSON-LD structured data is missing or unvalidated, preventing eligibility for Google Rich Results.',
        actionableTip: 'Inject a valid JSON-LD <script type="application/ld+json"> representing Article or Organization within the <head> section.',
        codeSuggestion: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "${pageTitle || 'Page Title'}",\n  "url": "${cleanUrl}"\n}\n</script>`,
        urgency
      };
    }

    // Default English fallback
    return {
      badge: `${item.category.toUpperCase()} Audit`,
      technicalContext: item.currentValue
        ? `Detected code condition: "${item.currentValue}".`
        : 'A specific technical optimization opportunity was identified for this criterion.',
      actionableTip: item.fixGuideAr || 'Review source code and apply recommended semantic and technical SEO standards.',
      codeSuggestion: item.codeSnippet,
      urgency
    };
  }
}

