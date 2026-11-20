import { AuditItem } from '../types/seo';
import { CustomCategory, CustomCategoryType } from './customCategoriesStorage';
import { apiFetch } from './apiConfig';

export interface AutoCategorizeSuggestion {
  id: string;
  name: string;
  type: CustomCategoryType;
  color: CustomCategory['color'];
  iconName: CustomCategory['iconName'];
  description: string;
  reasoningAr: string;
  itemIds: string[];
}

export interface AutoCategorizeResult {
  success: boolean;
  suggestions: AutoCategorizeSuggestion[];
  unassignedCount: number;
  totalItemsCount: number;
  source: 'gemini-3.8-flash' | 'heuristic_engine';
  message?: string;
}

/**
 * Identifies audit items that have not been assigned to any custom category yet
 */
export function getUnassignedItems(items: AuditItem[], categories: CustomCategory[]): AuditItem[] {
  const assignedIds = new Set<string>();
  categories.forEach((cat) => {
    cat.itemIds.forEach((id) => assignedIds.add(id));
  });

  return items.filter((item) => !assignedIds.has(item.id));
}

/**
 * Intelligent rule-based engine used as an immediate fallback or offline mode
 */
export function heuristicAutoCategorize(
  targetItems: AuditItem[],
  existingCategories: CustomCategory[]
): AutoCategorizeSuggestion[] {
  const technicalIds: string[] = [];
  const contentIds: string[] = [];
  const performanceIds: string[] = [];
  const securityIds: string[] = [];
  const urgentSprintIds: string[] = [];

  targetItems.forEach((item) => {
    const id = item.id.toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const titleAr = item.titleAr || '';

    // Check for high-urgency critical errors
    if (item.status === 'error' && item.impactAr === 'حرج') {
      urgentSprintIds.push(item.id);
    }

    // Performance / Speed / Core Web Vitals
    if (
      cat === 'performance' ||
      id.includes('speed') ||
      id.includes('ttfb') ||
      id.includes('lcp') ||
      id.includes('cls') ||
      id.includes('fid') ||
      id.includes('load') ||
      id.includes('size') ||
      title.includes('performance') ||
      titleAr.includes('سرعة') ||
      titleAr.includes('أداء') ||
      titleAr.includes('تحميل')
    ) {
      performanceIds.push(item.id);
    }
    // Security & HTTPS & Certificates
    else if (
      cat === 'security' ||
      id.includes('ssl') ||
      id.includes('https') ||
      id.includes('hsts') ||
      id.includes('csp') ||
      id.includes('security') ||
      titleAr.includes('أمان') ||
      titleAr.includes('تشفير') ||
      titleAr.includes('شهادة')
    ) {
      securityIds.push(item.id);
    }
    // Technical / Infrastructure / Crawl / Indexing
    else if (
      cat === 'technical' ||
      id.includes('robots') ||
      id.includes('sitemap') ||
      id.includes('schema') ||
      id.includes('canonical') ||
      id.includes('broken') ||
      id.includes('redirect') ||
      id.includes('viewport') ||
      titleAr.includes('تقني') ||
      titleAr.includes('فهرسة') ||
      titleAr.includes('روابط معطلة') ||
      titleAr.includes('روبوتات')
    ) {
      technicalIds.push(item.id);
    }
    // Content / On-page / Keywords / Meta / Editorial
    else {
      contentIds.push(item.id);
    }
  });

  const suggestions: AutoCategorizeSuggestion[] = [];
  const now = Date.now();

  if (technicalIds.length > 0) {
    suggestions.push({
      id: `ai-cat-tech-${now}`,
      name: 'فريق السيو التقني والخوادم',
      type: 'team',
      color: 'cyan',
      iconName: 'Server',
      description: 'معالجة ملفات الروبوتات، والـ Schema.org، والروابط المعطلة، وتهيئة الفهرسة',
      reasoningAr: 'تتطلب هذه العناصر تدخلاً برمجياً في بنية الموقع ووسوم الترويسة واستجابة الخادم لضمان سلامة زحف عناكب البحث.',
      itemIds: technicalIds
    });
  }

  if (contentIds.length > 0) {
    suggestions.push({
      id: `ai-cat-content-${now + 1}`,
      name: 'فريق التحرير والمحتوى',
      type: 'team',
      color: 'emerald',
      iconName: 'PenTool',
      description: 'تحسين العناوين (H1-H6)، والنصوص البديلة للصور (Alt)، والوصف التعريفي، وكثافة الكلمات',
      reasoningAr: 'مهام مخصصة لكتّاب المحتوى ومحرري الصفحات لتحسين جاذبية نتائج البحث ومطابقة نية الباحثين (Search Intent).',
      itemIds: contentIds
    });
  }

  if (performanceIds.length > 0) {
    suggestions.push({
      id: `ai-cat-perf-${now + 2}`,
      name: 'فريق السرعة والأداء (Core Web Vitals)',
      type: 'team',
      color: 'amber',
      iconName: 'Flame',
      description: 'تحسين زمن استجابة الخادم الأولية (TTFB)، وضغط الموارد، وتقليل حجم الصفحة',
      reasoningAr: 'معايير مباشرة تؤثر على تجربة تصفح الهاتف ومؤشرات Google Core Web Vitals ومعدل الارتداد.',
      itemIds: performanceIds
    });
  }

  if (securityIds.length > 0) {
    suggestions.push({
      id: `ai-cat-sec-${now + 3}`,
      name: 'الأمان والبنية التحتية',
      type: 'team',
      color: 'purple',
      iconName: 'Code',
      description: 'شهادات الحماية SSL/TLS وترويسات الأمان الصارمة لمنع هجمات التداخل',
      reasoningAr: 'معايير أمان موصى بها من جوجل لتعزيز ثقة الزوار وضمان تشفير الاتصال وحماية بيانات التصفح.',
      itemIds: securityIds
    });
  }

  if (urgentSprintIds.length > 0) {
    suggestions.push({
      id: `ai-cat-urgent-${now + 4}`,
      name: 'أولويات الإصلاح العاجل (Sprint 1)',
      type: 'priority',
      color: 'rose',
      iconName: 'Target',
      description: 'الأخطاء الحرجة ذات التأثير المباشر على ظهور الموقع في نتائج البحث',
      reasoningAr: 'أخطاء حرجة تعيق أرشفة صفحاتك بدقة ويجب إصلاحها أولاً قبل الانتقال للمهام التحسينية الأخرى.',
      itemIds: urgentSprintIds
    });
  }

  return suggestions;
}

/**
 * Calls the backend AI proxy route (/api/ai-auto-categorize) to analyze items with Gemini 3.8 Flash,
 * falling back gracefully to the heuristic engine if the API is offline or encounters an issue.
 */
export async function requestAiAutoCategorize(
  itemsToCategorize: AuditItem[],
  existingCategories: CustomCategory[],
  siteUrl?: string
): Promise<AutoCategorizeResult> {
  const unassigned = getUnassignedItems(itemsToCategorize, existingCategories);
  const targetItems = unassigned.length > 0 ? unassigned : itemsToCategorize;

  try {
    const payload = {
      items: targetItems.map((i) => ({
        id: i.id,
        title: i.title,
        titleAr: i.titleAr,
        category: i.category,
        status: i.status,
        impactAr: i.impactAr,
        currentValue: i.currentValue,
        idealValue: i.idealValue,
        descriptionAr: i.descriptionAr
      })),
      existingCategories: existingCategories.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        itemCount: c.itemIds.length
      })),
      url: siteUrl
    };

    const response = await apiFetch('/api/ai-auto-categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        return {
          success: true,
          suggestions: data.suggestions,
          unassignedCount: unassigned.length,
          totalItemsCount: itemsToCategorize.length,
          source: 'gemini-3.8-flash',
          message: data.message
        };
      }
    }
  } catch (err) {
    console.warn('Backend AI auto-categorize failed or offline, using heuristic engine:', err);
  }

  // Graceful rule-based fallback
  const fallbackSuggestions = heuristicAutoCategorize(targetItems, existingCategories);
  return {
    success: true,
    suggestions: fallbackSuggestions,
    unassignedCount: unassigned.length,
    totalItemsCount: itemsToCategorize.length,
    source: 'heuristic_engine',
    message: 'تم التصنيف الذكي بناءً على تحليل المعايير والأولويات الهندسية'
  };
}
