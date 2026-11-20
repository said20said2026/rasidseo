import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AuditItem } from '../types/seo';

export const CATEGORY_NAMES_AR: Record<string, string> = {
  onpage: 'السيو الداخلي (On-Page)',
  technical: 'السيو التقني (Technical)',
  content: 'المحتوى والوسائط (Content)',
  performance: 'السرعة والأداء (Performance)',
  security: 'الأمان والتشفير (Security)',
  social: 'التواصل والبيانات المنظمة (Schema & Social)'
};

export interface PendingChecklistExportOptions {
  items: AuditItem[];
  pageUrl: string;
  domainName: string;
  analyzedAt?: string;
  overallScore?: number;
}

/**
 * Generates CSV content formatted specifically as an actionable task checklist with UTF-8 BOM.
 */
export function generatePendingChecklistCsv(options: PendingChecklistExportOptions): string {
  const { items, pageUrl, domainName, analyzedAt = new Date().toISOString() } = options;

  // Filter only pending items (errors & warnings that need remediation)
  const pendingItems = items.filter((item) => item.status !== 'pass');

  // CSV Headers
  const headers = [
    'حالة الإنجاز (Checklist)',
    'معرف المهمة (Task ID)',
    'الأولوية (Priority)',
    'النوع (Issue Type)',
    'القسم (Category)',
    'عنوان المهمة (Task Title)',
    'الوضع المكتشف حالياً (Current Status)',
    'الهدف المطلوب (Target / Ideal Value)',
    'شرح المشكلة (Description)',
    'خطوات الإصلاح والتنفيذ (Actionable Solution)',
    'المسؤول المقترح للتنفيذ (Assignee)',
    'رابط الصفحة (Target URL)',
    'تاريخ الفحص (Audit Date)',
    'تاريخ الإنجاز الفعلي (Completion Date)',
    'ملاحظات المتابعة الخارجية (External Notes)'
  ];

  const escapeCsv = (val: string | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""').replace(/\r\n/g, ' ').replace(/[\n\r]/g, ' ');
    return `"${str}"`;
  };

  const rows = pendingItems.map((item, index) => {
    const isError = item.status === 'error';
    const statusBox = `[ ] معلق (مهمة #${index + 1})`;
    const priority = isError ? 'عالية جداً (حرج)' : 'متوسطة (تحسين مستحسن)';
    const issueType = isError ? 'خطأ حرج' : 'تنبيه وتحسين';
    const categoryName = CATEGORY_NAMES_AR[item.category] || item.category;

    // Proposed role assignment based on category
    let proposedRole = 'مطور الويب (Web Developer)';
    if (item.category === 'content') proposedRole = 'كاتب / محرر المحتوى (Content Writer)';
    else if (item.category === 'security') proposedRole = 'مدير الخادم / DevOps';
    else if (item.category === 'onpage') proposedRole = 'أخصائي سيو ومحتوى (SEO Specialist)';

    return [
      escapeCsv(statusBox),
      escapeCsv(item.id),
      escapeCsv(priority),
      escapeCsv(issueType),
      escapeCsv(categoryName),
      escapeCsv(item.titleAr || item.title),
      escapeCsv(item.currentValue || 'يحتاج لمراجعة'),
      escapeCsv(item.idealValue || 'وفق أفضل ممارسات جوجل'),
      escapeCsv(item.descriptionAr),
      escapeCsv(item.fixGuideAr),
      escapeCsv(proposedRole),
      escapeCsv(pageUrl),
      escapeCsv(analyzedAt.split('T')[0]),
      escapeCsv(''), // Empty for team to fill
      escapeCsv('')  // Empty for team to fill
    ].join(',');
  });

  // UTF-8 BOM (\uFEFF) ensures Excel and Sheets properly display Arabic characters without corruption
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers instant browser download of the pending checklist as a CSV file.
 */
export function downloadPendingChecklistCsv(options: PendingChecklistExportOptions): void {
  const csvContent = generatePendingChecklistCsv(options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const cleanDomain = options.domainName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `SEO-Pending-Checklist-${cleanDomain}-${dateStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a clean, printable A4 PDF of the pending checklist from an HTML element.
 */
export async function exportPendingChecklistToPdf(
  elementId: string,
  domainName: string
): Promise<void> {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error('لم يتم العثور على عنصر قائمة التحقق لتصديره');
  }

  const cleanDomain = domainName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `SEO-Pending-Checklist-${cleanDomain}-${dateStr}.pdf`;

  const canvas = await html2canvas(targetElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: targetElement.scrollWidth
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210;
  const pdfPageHeight = 297;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfPageHeight;

  while (heightLeft > 0) {
    position -= pdfPageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfPageHeight;
  }

  pdf.save(filename);
}
