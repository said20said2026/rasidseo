import { DetectedSchemaItem, SchemaAnalysis, SchemaIssue } from '../types/seo.js';

// Arabic human-friendly mapping of schema types & their rich snippet potential
export const SCHEMA_TYPE_INFO: Record<string, { labelAr: string; richResultTypeAr: string; descriptionAr: string }> = {
  WebSite: {
    labelAr: 'موقع إلكتروني (WebSite)',
    richResultTypeAr: 'مربع البحث في روابط أقسام الموقع (Sitelinks Searchbox)',
    descriptionAr: 'يساعد محرك بحث جوجل على التعرف على اسم الموقع وعنوانه الرسمي وتفعيل مربع البحث الداخلي مباشرة في نتائج البحث.'
  },
  Organization: {
    labelAr: 'مؤسسة أو شركة (Organization)',
    richResultTypeAr: 'لوحة المعرفة (Google Knowledge Panel)',
    descriptionAr: 'يعرّف الكيان التجاري أو المؤسسي، الشعار، وحسابات التواصل الاجتماعي لتعزيز الثقة في نتائج البحث.'
  },
  Corporation: {
    labelAr: 'شركة كبرى (Corporation)',
    richResultTypeAr: 'لوحة المعرفة التجارية للشركات',
    descriptionAr: 'ترميز رسمي للشركات المساهمة والمنظمات التجارية لعرض تفاصيل الشركة والمقر الرئيسي.'
  },
  LocalBusiness: {
    labelAr: 'نشاط تجاري محلي (LocalBusiness)',
    richResultTypeAr: 'بطاقة الأعمال المحلية وخرائط جوجل',
    descriptionAr: 'يتيح ظهور ساعات العمل، العنوان، رقم الهاتف، والتقييمات في نتائج البحث المحلية وخرائط جوجل.'
  },
  Article: {
    labelAr: 'مقال عام (Article)',
    richResultTypeAr: 'مقتطفات غنية وظهور في Google Discover',
    descriptionAr: 'يمكّن المقالات من الظهور مع العنوان، صورة بارزة، تاريخ النشر، واسم الكاتب في خلاصات جوجل والنتائج المميزة.'
  },
  BlogPosting: {
    labelAr: 'تدوينة مدونة (BlogPosting)',
    richResultTypeAr: 'بطاقة مقال في نتائج البحث والمدونات',
    descriptionAr: 'مخصص لمنشورات وتدوينات المدونات لعرض تاريخ النشر وتفاصيل المحتوى والمؤلف.'
  },
  NewsArticle: {
    labelAr: 'مقال إخباري (NewsArticle)',
    richResultTypeAr: 'الأخبار الرئيسية (Top Stories) في جوجل',
    descriptionAr: 'يؤهل المقالات الإخبارية للظهور الفوري في كاروسيل "أهم الأخبار" (Top Stories).'
  },
  Product: {
    labelAr: 'منتج تجاري (Product)',
    richResultTypeAr: 'مقتطف المنتج مع الأسعار وحالة التوفر والتقييمات',
    descriptionAr: 'يعرض أسعار المنتج، توفره في المخزون، والتقييمات بالنجوم مباشرة أسفل نتيجة البحث لرفع معدل النقر (CTR).'
  },
  BreadcrumbList: {
    labelAr: 'مسار التنقل (Breadcrumbs)',
    richResultTypeAr: 'مسار الروابط التنقلية بدلاً من الـ URL الطويل',
    descriptionAr: 'يستبدل رابط الصفحة الطويل بمسار أنيق واضح (الرئيسية > القسم > المقال) في صفحات نتائج البحث.'
  },
  FAQPage: {
    labelAr: 'صفحة الأسئلة الشائعة (FAQPage)',
    richResultTypeAr: 'قوائم أسئلة وأجوبة منسدلة قابلة للطي',
    descriptionAr: 'يعرض الأسئلة الشائعة وإجاباتها مباشرة في صفحة النتائج مما يزيد من مساحة ظهور موقعك.'
  },
  Recipe: {
    labelAr: 'وصفة طعام (Recipe)',
    richResultTypeAr: 'بطاقة الوصفة مع السعرات وزمن الطهي والتقييم',
    descriptionAr: 'يُظهر بطاقة الوصفة مع صورة جذابة ومقادير وزمن التحضير والتقييمات.'
  },
  SoftwareApplication: {
    labelAr: 'تطبيق برمجي (SoftwareApplication)',
    richResultTypeAr: 'مقتطف التطبيق مع نظام التشغيل والتقييم والسعر',
    descriptionAr: 'يُبرز تطبيقات الويب أو الهواتف مع نظام التشغيل، الفئة، والتقييمات.'
  },
  WebApplication: {
    labelAr: 'تطبيق ويب (WebApplication)',
    richResultTypeAr: 'مقتطف تطبيق الويب التفاعلي',
    descriptionAr: 'يعرّف منصات وبرمجيات السحاب كخدمة SaaS وتطبيقات الويب التفاعلية.'
  },
  Event: {
    labelAr: 'فعالية أو حدث (Event)',
    richResultTypeAr: 'بطاقة الفعالية مع التواريخ والموقع الجغرافي والتذاكر',
    descriptionAr: 'يتيح للباحثين رؤية تاريخ ومكان الحدث وحجز التذاكر مباشرة.'
  },
  Person: {
    labelAr: 'شخصية أو مؤلف (Person)',
    richResultTypeAr: 'بيانات المؤلف أو الخبير لتعزيز مؤشرات E-E-A-T',
    descriptionAr: 'يوثق بيانات المؤلف، الوظيفة، ومواقع التواصل لتعزيز موثوقية المحتوى أمام خوارزميات جوجل.'
  }
};

/**
 * Validates a single JSON-LD object against Schema.org and Google Search guidelines
 */
export function validateSingleEntity(entity: any, rawJsonText?: string): DetectedSchemaItem {
  const issues: SchemaIssue[] = [];
  const type = typeof entity['@type'] === 'string' ? entity['@type'] : (Array.isArray(entity['@type']) ? entity['@type'].join(', ') : 'Unknown');
  const context = entity['@context'] ? String(entity['@context']) : undefined;
  const name = entity.name || entity.headline || entity.title || undefined;

  const rawJson = rawJsonText || JSON.stringify(entity, null, 2);

  // 1. Context validation
  if (!context) {
    issues.push({
      severity: 'error',
      property: '@context',
      messageAr: 'خاصية السياق (@context) مفقودة تماماً في كائن الـ Schema.',
      fixGuideAr: 'أضف "@context": "https://schema.org" في بداية الكائن لتحديد معيار البيانات المنظمة.'
    });
  } else if (!context.includes('schema.org')) {
    issues.push({
      severity: 'error',
      property: '@context',
      messageAr: `قيمة @context غير صحيحة (${context}). يجب أن تشير إلى schema.org.`,
      fixGuideAr: 'استخدم دائماً "https://schema.org" كقيمة معيارية.'
    });
  } else if (context.startsWith('http:')) {
    issues.push({
      severity: 'warning',
      property: '@context',
      messageAr: 'يتم استخدام بروتوكول HTTP غير المشفر في سياق schema.org بدلاً من HTTPS.',
      fixGuideAr: 'عدّل القيمة إلى "https://schema.org" لضمان التوافق مع معايير الأمان الحديثة.'
    });
  }

  // 2. Type validation
  if (!entity['@type']) {
    issues.push({
      severity: 'error',
      property: '@type',
      messageAr: 'نوع الكائن (@type) مفقود في كائن الـ Schema، مما يجعله غير قابل للتعرف بواسطة محركات البحث.',
      fixGuideAr: 'حدد نوع الكائن مثلاً: "@type": "WebSite" أو "Article" أو "Product".'
    });
  }

  const requiredMissing: string[] = [];
  const recommendedMissing: string[] = [];

  // Helper check
  const hasProp = (prop: string): boolean => {
    const val = entity[prop];
    if (val === undefined || val === null) return false;
    if (typeof val === 'string' && val.trim() === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  };

  // 3. Type-specific validations
  switch (type) {
    case 'WebSite':
      if (!hasProp('name')) {
        requiredMissing.push('name');
        issues.push({
          severity: 'error',
          property: 'name',
          messageAr: 'اسم الموقع (name) مطلوب في ترميز WebSite لتفعيل اسم الموقع في نتائج البحث.',
          fixGuideAr: 'أضف خاصية "name" تحتوي على الاسم الرسمي للعلامة التجارية أو الموقع.'
        });
      }
      if (!hasProp('url')) {
        requiredMissing.push('url');
        issues.push({
          severity: 'error',
          property: 'url',
          messageAr: 'رابط الموقع (url) مفقود في ترميز WebSite.',
          fixGuideAr: 'أضف "url": "https://example.com" برابط النطاق الأساسي.'
        });
      }
      if (!hasProp('potentialAction')) {
        recommendedMissing.push('potentialAction (SearchAction)');
        issues.push({
          severity: 'info',
          property: 'potentialAction',
          messageAr: 'يمكنك إضافة SearchAction لتمكين مربع البحث الداخلي لموقعك مباشرة في بحث جوجل.',
          fixGuideAr: 'أضف potentialAction بنوع SearchAction لتفعيل ميزة Sitelinks Searchbox.'
        });
      }
      break;

    case 'Organization':
    case 'Corporation':
    case 'LocalBusiness':
      if (!hasProp('name')) {
        requiredMissing.push('name');
        issues.push({
          severity: 'error',
          property: 'name',
          messageAr: 'اسم المنظمة أو النشاط التجاري (name) مطلوب.',
          fixGuideAr: 'حدد اسم المؤسسة القانوني أو التجاري.'
        });
      }
      if (!hasProp('url')) {
        requiredMissing.push('url');
        issues.push({
          severity: 'error',
          property: 'url',
          messageAr: 'رابط الموقع الرسمي للمؤسسة (url) مطلوب.',
          fixGuideAr: 'أضف رابط الصفحة الرئيسية للمؤسسة.'
        });
      }
      if (!hasProp('logo')) {
        recommendedMissing.push('logo');
        issues.push({
          severity: 'warning',
          property: 'logo',
          messageAr: 'شعار المؤسسة (logo) غير محدد. الشعار أساسي لظهور العلامة في لوحة المعرفة بجوجل.',
          fixGuideAr: 'أضف "logo": "https://example.com/logo.png" برابط صورة مباشر عالي الدقة.'
        });
      }
      if (type === 'LocalBusiness') {
        if (!hasProp('address')) {
          requiredMissing.push('address');
          issues.push({
            severity: 'error',
            property: 'address',
            messageAr: 'العنوان الجغرافي (address) إلزامي للأنشطة التجارية المحلية (LocalBusiness).',
            fixGuideAr: 'أضف عنوان PostalAddress مع المدينة والدولة والشارع.'
          });
        }
        if (!hasProp('telephone')) {
          recommendedMissing.push('telephone');
          issues.push({
            severity: 'warning',
            property: 'telephone',
            messageAr: 'رقم الهاتف (telephone) موصى به جداً للظهور في نتائج الاتصال السريع.',
            fixGuideAr: 'أضف رقم الهاتف مع رمز الدولة الدولي (مثال: +966...).'
          });
        }
      }
      break;

    case 'Article':
    case 'NewsArticle':
    case 'BlogPosting':
      if (!hasProp('headline')) {
        requiredMissing.push('headline');
        issues.push({
          severity: 'error',
          property: 'headline',
          messageAr: 'عنوان المقال (headline) إلزامي للمقالات لظهورها في مقتطفات الأخبار ومحرك البحث.',
          fixGuideAr: 'أضف خاصية "headline" بنص عنوان المقال (يفضل ألا يتجاوز 110 أحرف).'
        });
      }
      if (!hasProp('image')) {
        requiredMissing.push('image');
        issues.push({
          severity: 'error',
          property: 'image',
          messageAr: 'الصورة البارزة (image) إلزامية للمقالات لظهورها في المقتطفات وبطاقات Google Discover.',
          fixGuideAr: 'أضف رابط صورة بارزة بنسبة عرض إلى ارتفاع مناسبة (مثال: 16:9 أو 1200x675 بكسل).'
        });
      }
      if (!hasProp('datePublished')) {
        requiredMissing.push('datePublished');
        issues.push({
          severity: 'error',
          property: 'datePublished',
          messageAr: 'تاريخ النشر (datePublished) إلزامي وفق متطلبات جوجل للمحتوى الإخباري والمدونات.',
          fixGuideAr: 'أضف تاريخ النشر بصيغة ISO-8601 مثل "2026-03-15T08:00:00Z".'
        });
      }
      if (!hasProp('author')) {
        requiredMissing.push('author');
        issues.push({
          severity: 'warning',
          property: 'author',
          messageAr: 'بيانات الكاتب (author) مفقودة. جوجل تعتمد عليها لتقييم مؤشرات الخبرة والثقة (E-E-A-T).',
          fixGuideAr: 'أضف كائن الكاتب: "author": { "@type": "Person", "name": "اسم الكاتب" }.'
        });
      }
      if (!hasProp('dateModified')) {
        recommendedMissing.push('dateModified');
        issues.push({
          severity: 'info',
          property: 'dateModified',
          messageAr: 'تاريخ آخر تعديل (dateModified) موصى به لإعلام جوجل بحداثة المقال وتحديثه.',
          fixGuideAr: 'أضف تاريخ آخر تحديث لمساعدة جوجل في معرفة أن المحتوى محدث.'
        });
      }
      break;

    case 'Product':
      if (!hasProp('name')) {
        requiredMissing.push('name');
        issues.push({
          severity: 'error',
          property: 'name',
          messageAr: 'اسم المنتج (name) إلزامي.',
          fixGuideAr: 'أضف اسم المنتج بوضوح.'
        });
      }
      if (!hasProp('image')) {
        requiredMissing.push('image');
        issues.push({
          severity: 'error',
          property: 'image',
          messageAr: 'صورة المنتج (image) إلزامية لظهور بطاقة المنتج الغنية في نتائج التسوق.',
          fixGuideAr: 'أضف رابط صورة واضحة للمنتج.'
        });
      }
      if (!hasProp('offers') && !hasProp('aggregateRating')) {
        requiredMissing.push('offers OR aggregateRating');
        issues.push({
          severity: 'error',
          property: 'offers',
          messageAr: 'يتطلب مقتطف المنتج في جوجل توفر عروض الأسعار (offers) أو تقييمات العملاء (aggregateRating).',
          fixGuideAr: 'أضف كائن "offers" مع "price" و "priceCurrency" لعرض السعر في نتائج البحث.'
        });
      } else if (entity.offers) {
        const offers = Array.isArray(entity.offers) ? entity.offers[0] : entity.offers;
        if (!offers.price && offers.price !== 0) {
          issues.push({
            severity: 'error',
            property: 'offers.price',
            messageAr: 'سعر المنتج (price) مفقود داخل كائن offers.',
            fixGuideAr: 'حدد سعر المنتج كرقم أو نص عددي (مثال: "99.99").'
          });
        }
        if (!offers.priceCurrency) {
          issues.push({
            severity: 'error',
            property: 'offers.priceCurrency',
            messageAr: 'عملة السعر (priceCurrency) مفقودة في كائن offers.',
            fixGuideAr: 'حدد رمز العملة المعتمد من 3 أحرف وفق معيار ISO 4217 (مثال: SAR, AED, USD, EUR).'
          });
        }
      }
      break;

    case 'BreadcrumbList':
      if (!hasProp('itemListElement') || !Array.isArray(entity.itemListElement)) {
        requiredMissing.push('itemListElement');
        issues.push({
          severity: 'error',
          property: 'itemListElement',
          messageAr: 'عناصر مسار التنقل (itemListElement) مفقودة أو ليست مصفوفة.',
          fixGuideAr: 'أضف مصفوفة itemListElement تحتوي على كائنات ListItem مع position و name و item.'
        });
      } else {
        const items = entity.itemListElement;
        let hasElementIssue = false;
        items.forEach((item: any, idx: number) => {
          if (!item.name || item.position === undefined) {
            hasElementIssue = true;
          }
        });
        if (hasElementIssue) {
          issues.push({
            severity: 'warning',
            property: 'itemListElement',
            messageAr: 'بعض عناصر مسار التنقل تفتقر إلى حقل الاسم (name) أو الترتيب (position).',
            fixGuideAr: 'تأكد من أن كل عنصر يمتلك position تصاعدي واسم واضح ورابط item.'
          });
        }
      }
      break;

    case 'FAQPage':
      if (!hasProp('mainEntity') || !Array.isArray(entity.mainEntity)) {
        requiredMissing.push('mainEntity');
        issues.push({
          severity: 'error',
          property: 'mainEntity',
          messageAr: 'قائمة الأسئلة (mainEntity) مفقودة في ترميز FAQPage أو ليست مصفوفة.',
          fixGuideAr: 'أضف كائنات Question داخل مصفوفة mainEntity مع نص السؤال والإجابة المقبولة.'
        });
      } else {
        entity.mainEntity.forEach((q: any, idx: number) => {
          if (!q.name || !q.acceptedAnswer?.text) {
            issues.push({
              severity: 'warning',
              property: `mainEntity[${idx}]`,
              messageAr: `السؤال رقم ${idx + 1} يفتقر إلى نص السؤال (name) أو نص الإجابة (acceptedAnswer.text).`,
              fixGuideAr: 'تحقق من اكتمال صياغة الأسئلة والأجوبة.'
            });
          }
        });
      }
      break;

    case 'Recipe':
      if (!hasProp('name')) requiredMissing.push('name');
      if (!hasProp('image')) requiredMissing.push('image');
      if (!hasProp('recipeIngredient')) {
        recommendedMissing.push('recipeIngredient');
        issues.push({
          severity: 'warning',
          property: 'recipeIngredient',
          messageAr: 'قائمة المكونات (recipeIngredient) غير متوفرة في الوصفة.',
          fixGuideAr: 'أضف مصفوفة المكونات ليتمكن جوجل من عرضها للمستخدمين.'
        });
      }
      break;

    case 'SoftwareApplication':
    case 'WebApplication':
      if (!hasProp('name')) {
        requiredMissing.push('name');
        issues.push({
          severity: 'error',
          property: 'name',
          messageAr: 'اسم التطبيق (name) إلزامي.',
          fixGuideAr: 'أضف اسم تطبيق الويب أو البرنامج.'
        });
      }
      if (!hasProp('applicationCategory')) {
        recommendedMissing.push('applicationCategory');
        issues.push({
          severity: 'warning',
          property: 'applicationCategory',
          messageAr: 'فئة التطبيق (applicationCategory) غير محددة (مثل: BusinessApplication, UtilitiesApplication).',
          fixGuideAr: 'حدد فئة التطبيق لمساعدة جوجل في تصنيفه بالمتجر وبحث الويب.'
        });
      }
      break;

    default:
      // Generic check: check if name or headline exists
      if (!entity.name && !entity.headline && !entity.title && !entity['@id']) {
        issues.push({
          severity: 'info',
          property: 'name',
          messageAr: 'لم يتم العثور على اسم تعريفي (name أو headline) لهذا الكائن.',
          fixGuideAr: 'يستحسن إضافة اسم تعريفي أو @id لربط الكيان بوضوح في الرسم البياني للبيانات.'
        });
      }
      break;
  }

  const hasErrors = issues.some(i => i.severity === 'error');
  const hasWarnings = issues.some(i => i.severity === 'warning');
  const typeInfo = SCHEMA_TYPE_INFO[type];

  return {
    id: `schema-${type.toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`,
    type,
    context,
    name,
    isValid: !hasErrors,
    hasWarnings,
    issues,
    rawJson,
    parsedData: entity,
    richResultType: typeInfo?.richResultTypeAr || 'بيانات منظمة عامة في محرك البحث',
    requiredFieldsMissing: requiredMissing,
    recommendedFieldsMissing: recommendedMissing
  };
}

/**
 * Extracts and inspects all JSON-LD schemas embedded in HTML markup
 */
export function inspectJsonLdFromHtml(html: string, pageUrl: string = ''): SchemaAnalysis {
  const items: DetectedSchemaItem[] = [];
  const rawScripts: { index: number; rawText: string; isSyntacticallyValid: boolean; parseError?: string }[] = [];
  const detectedTypesSet = new Set<string>();

  // Extract <script type="application/ld+json"> blocks using regex (works in browser & server)
  const scriptRegex = /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  let scriptIndex = 0;

  while ((match = scriptRegex.exec(html)) !== null) {
    scriptIndex++;
    const rawContent = match[1]?.trim() || '';
    if (!rawContent) continue;

    try {
      const parsed = JSON.parse(rawContent);
      rawScripts.push({
        index: scriptIndex,
        rawText: rawContent,
        isSyntacticallyValid: true
      });

      // Handle array, graph, or single object
      if (Array.isArray(parsed)) {
        parsed.forEach((obj) => {
          if (obj && typeof obj === 'object') {
            const validated = validateSingleEntity(obj, JSON.stringify(obj, null, 2));
            items.push(validated);
            if (validated.type) detectedTypesSet.add(validated.type);
          }
        });
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed['@graph'])) {
          parsed['@graph'].forEach((obj: any) => {
            if (obj && typeof obj === 'object') {
              const validated = validateSingleEntity({ ...obj, '@context': obj['@context'] || parsed['@context'] || 'https://schema.org' });
              items.push(validated);
              if (validated.type) detectedTypesSet.add(validated.type);
            }
          });
        } else {
          const validated = validateSingleEntity(parsed, rawContent);
          items.push(validated);
          if (validated.type) detectedTypesSet.add(validated.type);
        }
      }
    } catch (parseErr: any) {
      // Syntax error in JSON-LD script
      const errMsg = parseErr?.message || 'خطأ في تنسيق كود JSON';
      rawScripts.push({
        index: scriptIndex,
        rawText: rawContent,
        isSyntacticallyValid: false,
        parseError: errMsg
      });

      items.push({
        id: `schema-syntax-err-${scriptIndex}`,
        type: 'SyntaxError (JSON غير صالح)',
        context: undefined,
        name: `سكريبت JSON-LD رقم ${scriptIndex}`,
        isValid: false,
        hasWarnings: false,
        issues: [
          {
            severity: 'error',
            messageAr: `فشل تحليل كود الـ JSON-LD بسبب خطأ في الصياغة البرمجية (Syntax Error): ${errMsg}`,
            fixGuideAr: 'تحقق من الفواصل الإضافية (Trailing commas)، أو الأقواس غير المغلقة، أو علامات التنصيص المفقودة في الكود.'
          }
        ],
        rawJson: rawContent,
        parsedData: undefined,
        richResultType: 'غير مؤهل للنتائج المنسقة بسبب خطأ برمجية في الكود',
        requiredFieldsMissing: [],
        recommendedFieldsMissing: []
      });
      detectedTypesSet.add('SyntaxError');
    }
  }

  // Calculate statistics
  const totalEntitiesFound = items.length;
  const validCount = items.filter(i => i.isValid && !i.hasWarnings).length;
  const warningCount = items.filter(i => i.isValid && i.hasWarnings).length;
  const errorCount = items.filter(i => !i.isValid).length;

  let overallStatus: 'valid' | 'has_warnings' | 'has_errors' | 'missing' = 'missing';
  let summaryAr = 'لم يتم الكشف عن أي وسوم بيانات منظمة Schema.org (JSON-LD) في هذه الصفحة.';

  if (totalEntitiesFound > 0) {
    if (errorCount > 0) {
      overallStatus = 'has_errors';
      summaryAr = `تم الكشف عن ${totalEntitiesFound} ترميز(ات) Schema.org، مع وجود ${errorCount} خطأ هيكلي يمنع ظهور النتائج المنسقة في جوجل.`;
    } else if (warningCount > 0) {
      overallStatus = 'has_warnings';
      summaryAr = `تم الكشف عن ${totalEntitiesFound} ترميز(ات) صالحة مع وجود بعض التوصيات والتحسينات الإضافية لتعزيز ظهور المقتطفات الغنية.`;
    } else {
      overallStatus = 'valid';
      summaryAr = `جميع ترميزات الـ Schema.org المطبقة (${totalEntitiesFound} كيان) صالحة وسليمة 100% ومؤهلة للمقتطفات الغنية في بحث جوجل.`;
    }
  }

  return {
    totalScriptsFound: scriptIndex,
    totalEntitiesFound,
    validCount,
    warningCount,
    errorCount,
    detectedTypes: Array.from(detectedTypesSet),
    items,
    rawScripts,
    summaryAr,
    overallStatus
  };
}

/**
 * Validates arbitrary JSON-LD text string submitted by the user in the interactive tester
 */
export function inspectJsonLdText(jsonText: string): SchemaAnalysis {
  const trimmed = jsonText.trim();
  if (!trimmed) {
    return {
      totalScriptsFound: 0,
      totalEntitiesFound: 0,
      validCount: 0,
      warningCount: 0,
      errorCount: 0,
      detectedTypes: [],
      items: [],
      summaryAr: 'يرجى لصق كود JSON-LD صالح للبدء في الفحص والتدقيق.',
      overallStatus: 'missing'
    };
  }

  // If user pasted `<script>...</script>`, wrap or clean it
  let cleanJson = trimmed;
  if (cleanJson.includes('<script')) {
    const match = /<script\b[^>]*>([\s\S]*?)<\/script>/i.exec(cleanJson);
    if (match && match[1]) {
      cleanJson = match[1].trim();
    }
  }

  try {
    const parsed = JSON.parse(cleanJson);
    const items: DetectedSchemaItem[] = [];
    const detectedTypesSet = new Set<string>();

    if (Array.isArray(parsed)) {
      parsed.forEach((obj) => {
        if (obj && typeof obj === 'object') {
          const validated = validateSingleEntity(obj, JSON.stringify(obj, null, 2));
          items.push(validated);
          if (validated.type) detectedTypesSet.add(validated.type);
        }
      });
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed['@graph'])) {
        parsed['@graph'].forEach((obj: any) => {
          if (obj && typeof obj === 'object') {
            const validated = validateSingleEntity({ ...obj, '@context': obj['@context'] || parsed['@context'] || 'https://schema.org' });
            items.push(validated);
            if (validated.type) detectedTypesSet.add(validated.type);
          }
        });
      } else {
        const validated = validateSingleEntity(parsed, cleanJson);
        items.push(validated);
        if (validated.type) detectedTypesSet.add(validated.type);
      }
    }

    const totalEntitiesFound = items.length;
    const validCount = items.filter(i => i.isValid && !i.hasWarnings).length;
    const warningCount = items.filter(i => i.isValid && i.hasWarnings).length;
    const errorCount = items.filter(i => !i.isValid).length;

    let overallStatus: 'valid' | 'has_warnings' | 'has_errors' | 'missing' = 'valid';
    if (errorCount > 0) overallStatus = 'has_errors';
    else if (warningCount > 0) overallStatus = 'has_warnings';

    return {
      totalScriptsFound: 1,
      totalEntitiesFound,
      validCount,
      warningCount,
      errorCount,
      detectedTypes: Array.from(detectedTypesSet),
      items,
      summaryAr: errorCount > 0
        ? `تم العثور على ${errorCount} خطأ هيكلي في الكود المفحوص.`
        : (warningCount > 0 ? 'الكود صالح من الناحية الهيكلية مع وجود بعض التحسينات.' : 'الكود سليم 100% ومطابق لمعايير Schema.org وجوجل.'),
      overallStatus
    };
  } catch (err: any) {
    const errMsg = err?.message || 'خطأ في بنية كود JSON';
    return {
      totalScriptsFound: 1,
      totalEntitiesFound: 1,
      validCount: 0,
      warningCount: 0,
      errorCount: 1,
      detectedTypes: ['SyntaxError'],
      items: [
        {
          id: 'test-syntax-error',
          type: 'SyntaxError (JSON غير صالح)',
          context: undefined,
          isValid: false,
          hasWarnings: false,
          issues: [
            {
              severity: 'error',
              messageAr: `خطأ في صياغة JSON: ${errMsg}`,
              fixGuideAr: 'تأكد من إغلاق كافة الأقواس وعلامات التنصيص وإزالة أي فواصل إضافية قبل إغلاق الكائن.'
            }
          ],
          rawJson: cleanJson,
          richResultType: 'غير صالح',
          requiredFieldsMissing: [],
          recommendedFieldsMissing: []
        }
      ],
      summaryAr: `فشل التحليل: ${errMsg}`,
      overallStatus: 'has_errors'
    };
  }
}
