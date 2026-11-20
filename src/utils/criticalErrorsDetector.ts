import { AuditItem, AuditResult } from '../types/seo';

export interface CriticalIssueGroup {
  type: 'crawling' | 'security' | 'indexing' | 'performance' | 'general';
  badgeAr: string;
  badgeColor: string;
  items: AuditItem[];
}

export interface CriticalAnalysisResult {
  hasCriticalErrors: boolean;
  totalCriticalCount: number;
  criticalItems: AuditItem[];
  groups: CriticalIssueGroup[];
  topItem?: AuditItem;
  summaryAr: string;
}

export function detectCriticalErrors(audit: AuditResult): CriticalAnalysisResult {
  if (!audit || !audit.items || !Array.isArray(audit.items)) {
    return {
      hasCriticalErrors: false,
      totalCriticalCount: 0,
      criticalItems: [],
      groups: [],
      summaryAr: ''
    };
  }

  // Find all error items that are high impact or critical security/crawl categories
  const criticalItems = audit.items.filter((item) => {
    if (item.status !== 'error') return false;

    const id = (item.id || '').toLowerCase();
    const title = ((item.titleAr || '') + ' ' + (item.title || '')).toLowerCase();

    // 1. Robots.txt or noindex blocking search engines
    const isCrawlingBlocked =
      id.includes('robots') ||
      id.includes('noindex') ||
      title.includes('robots') ||
      title.includes('فهرسة') ||
      title.includes('حظر');

    // 2. Security, SSL, HTTPS, CSP, HSTS
    const isSecurityError =
      item.category === 'security' ||
      id.includes('ssl') ||
      id.includes('https') ||
      id.includes('csp') ||
      id.includes('hsts') ||
      title.includes('أمان') ||
      title.includes('تشفير');

    // 3. High Impact critical items
    const isHighImpact = item.impactAr === 'حرج';

    return isCrawlingBlocked || isSecurityError || isHighImpact;
  });

  if (criticalItems.length === 0) {
    return {
      hasCriticalErrors: false,
      totalCriticalCount: 0,
      criticalItems: [],
      groups: [],
      summaryAr: ''
    };
  }

  // Group items by threat type
  const crawlingItems: AuditItem[] = [];
  const securityItems: AuditItem[] = [];
  const indexingItems: AuditItem[] = [];
  const performanceItems: AuditItem[] = [];
  const otherItems: AuditItem[] = [];

  criticalItems.forEach((item) => {
    const id = (item.id || '').toLowerCase();
    if (id.includes('robots') || id.includes('noindex')) {
      crawlingItems.push(item);
    } else if (item.category === 'security' || id.includes('ssl') || id.includes('csp') || id.includes('hsts')) {
      securityItems.push(item);
    } else if (item.category === 'performance' || id.includes('speed') || id.includes('ttfb')) {
      performanceItems.push(item);
    } else if (item.category === 'onpage' || id.includes('canonical') || id.includes('title')) {
      indexingItems.push(item);
    } else {
      otherItems.push(item);
    }
  });

  const groups: CriticalIssueGroup[] = [];
  if (crawlingItems.length > 0) {
    groups.push({
      type: 'crawling',
      badgeAr: 'حظر الزحف والفهرسة',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      items: crawlingItems
    });
  }
  if (securityItems.length > 0) {
    groups.push({
      type: 'security',
      badgeAr: 'خلل أمني وتشفير',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      items: securityItems
    });
  }
  if (indexingItems.length > 0) {
    groups.push({
      type: 'indexing',
      badgeAr: 'أخطاء وسوم الفهرسة',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      items: indexingItems
    });
  }
  if (performanceItems.length > 0) {
    groups.push({
      type: 'performance',
      badgeAr: 'بطء حرج في الخادم',
      badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300 dark:border-orange-800',
      items: performanceItems
    });
  }
  if (otherItems.length > 0) {
    groups.push({
      type: 'general',
      badgeAr: 'أخطاء حرجة تقنية',
      badgeColor: 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-300 dark:border-red-800',
      items: otherItems
    });
  }

  const topItem = crawlingItems[0] || securityItems[0] || criticalItems[0];
  const summaryAr = `تم رصد ${criticalItems.length} أخطاء حرجة تتطلب تدخلاً عاجلاً لحماية أرشفة الموقع وثقة محركات البحث.`;

  return {
    hasCriticalErrors: true,
    totalCriticalCount: criticalItems.length,
    criticalItems,
    groups,
    topItem,
    summaryAr
  };
}
