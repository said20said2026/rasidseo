import { AuditItem } from '../types/seo';

export type CustomCategoryType = 'team' | 'priority' | 'custom';

export interface CustomCategory {
  id: string;
  name: string;
  type: CustomCategoryType;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan' | 'blue';
  iconName: 'Users' | 'Code' | 'Server' | 'PenTool' | 'Flag' | 'Flame' | 'Target' | 'Sparkles';
  description?: string;
  itemIds: string[];
  createdAt: number;
}

const STORAGE_KEY = 'rasid_seo_custom_categories_v1';

export function getCategoryColorClasses(color: string) {
  switch (color) {
    case 'indigo':
      return {
        badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        dot: 'bg-indigo-500',
        ring: 'ring-indigo-500',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-300 dark:border-indigo-700'
      };
    case 'emerald':
      return {
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        ring: 'ring-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-300 dark:border-emerald-700'
      };
    case 'rose':
      return {
        badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
        ring: 'ring-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-300 dark:border-rose-700'
      };
    case 'amber':
      return {
        badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
        ring: 'ring-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-700'
      };
    case 'purple':
      return {
        badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        dot: 'bg-purple-500',
        ring: 'ring-purple-500',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-300 dark:border-purple-700'
      };
    case 'cyan':
      return {
        badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        dot: 'bg-cyan-500',
        ring: 'ring-cyan-500',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-300 dark:border-cyan-700'
      };
    case 'blue':
      return {
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
        ring: 'ring-blue-500',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-700'
      };
    default:
      return {
        badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-500',
        ring: 'ring-slate-500',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-300 dark:border-slate-600'
      };
  }
}

// Generate sensible default categories based on items
export function getDefaultPresetCategories(items: AuditItem[] = []): CustomCategory[] {
  const itemIds = items.map((i) => i.id);

  // Frontend team items (UI, tags, DOM, viewport, content elements)
  const frontendIds = itemIds.filter((id) => {
    const l = id.toLowerCase();
    return (
      l.includes('meta_') ||
      l.includes('h1') ||
      l.includes('alt') ||
      l.includes('viewport') ||
      l.includes('social') ||
      l.includes('schema') ||
      l.includes('cls') ||
      l.includes('lcp')
    );
  });

  // Backend & DevOps items (security, servers, robots, sitemap, https, ttfb)
  const backendIds = itemIds.filter((id) => {
    const l = id.toLowerCase();
    return (
      l.includes('ssl') ||
      l.includes('robots') ||
      l.includes('sitemap') ||
      l.includes('csp') ||
      l.includes('hsts') ||
      l.includes('ttfb') ||
      l.includes('speed') ||
      l.includes('broken') ||
      l.includes('redirect')
    );
  });

  // Content & SEO writing team
  const contentIds = itemIds.filter((id) => {
    const l = id.toLowerCase();
    return (
      l.includes('title') ||
      l.includes('meta_description') ||
      l.includes('word') ||
      l.includes('keyword') ||
      l.includes('internal_link') ||
      l.includes('alt')
    );
  });

  // Urgent Sprint 1: All critical error items
  const urgentIds = items.filter((i) => i.status === 'error').map((i) => i.id);

  // Medium Priority Sprint 2: Warning items
  const mediumIds = items.filter((i) => i.status === 'warning').map((i) => i.id);

  return [
    {
      id: 'cat-team-frontend',
      name: 'فريق الفرونت إند والواجهات (Frontend)',
      type: 'team',
      color: 'indigo',
      iconName: 'Code',
      description: 'مهام قوالب الويب والواجهات ووسوم الـ HTML ومؤشرات الـ Core Web Vitals',
      itemIds: frontendIds.length > 0 ? frontendIds : ['h1_structure', 'meta_description', 'image_alt'],
      createdAt: Date.now() - 4000
    },
    {
      id: 'cat-team-backend',
      name: 'فريق الباك إند والخوادم (Backend & DevOps)',
      type: 'team',
      color: 'cyan',
      iconName: 'Server',
      description: 'إعدادات الخادم والشهادات الأمنية وتوجيهات robots.txt وخريطة sitemap',
      itemIds: backendIds.length > 0 ? backendIds : ['ssl_check', 'robots_txt', 'sitemap_xml'],
      createdAt: Date.now() - 3000
    },
    {
      id: 'cat-team-content',
      name: 'فريق المحتوى والكتّاب (Content & SEO)',
      type: 'team',
      color: 'emerald',
      iconName: 'PenTool',
      description: 'صياغة العناوين وتوزيع الكلمات المفتاحية وتحسين النصوص والروابط الداخلية',
      itemIds: contentIds.length > 0 ? contentIds : ['meta_description', 'title_length'],
      createdAt: Date.now() - 2000
    },
    {
      id: 'cat-priority-urgent',
      name: 'أولوية قصوى للإطلاق (Sprint 1 - عاجل)',
      type: 'priority',
      color: 'rose',
      iconName: 'Flame',
      description: 'أخطاء حرجة تعطل فهرسة الموقع أو تسبب تحذيرات أمنية وتتطلب المعالجة فوراً',
      itemIds: urgentIds.length > 0 ? urgentIds : ['image_alt', 'robots_missing'],
      createdAt: Date.now() - 1000
    },
    {
      id: 'cat-priority-medium',
      name: 'أولوية التحسينات اللاحقة (Sprint 2)',
      type: 'priority',
      color: 'amber',
      iconName: 'Flag',
      description: 'فرص تحسين تجربة التصفح وزيادة معدل النقر CTR وسرعة التفاعل',
      itemIds: mediumIds.length > 0 ? mediumIds : ['speed_slow'],
      createdAt: Date.now()
    }
  ];
}

export function loadCustomCategories(items?: AuditItem[]): CustomCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load custom categories from localStorage', err);
  }

  // If empty, initialize default presets
  const defaults = getDefaultPresetCategories(items || []);
  saveCustomCategories(defaults);
  return defaults;
}

export function saveCustomCategories(categories: CustomCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    // Dispatch local event for sync across components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rasid-custom-categories-updated'));
    }
  } catch (err) {
    console.error('Failed to save custom categories to localStorage', err);
  }
}
