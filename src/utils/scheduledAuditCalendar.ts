import { ScheduledAuditFrequency, ScheduledAuditSubscription } from '../types/seo';

export interface ScheduledAuditCalendarConfig {
  siteName?: string;
  url: string;
  frequency: ScheduledAuditFrequency;
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  timeOfDay?: string; // e.g. "09:00"
  scoreThreshold?: number;
  auditScore?: number;
  alertOnScoreDrop?: boolean;
}

const DAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const DAY_NAMES_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/**
 * Calculates the next upcoming date for the scheduled audit
 */
export function computeNextAuditDate(
  frequency: ScheduledAuditFrequency = 'weekly',
  dayOfWeek: number = 1,
  timeOfDay: string = '09:00'
): Date {
  const [hours, minutes] = (timeOfDay || '09:00').split(':').map((v) => parseInt(v, 10) || 0);
  const now = new Date();
  const next = new Date(now);

  next.setHours(hours, minutes, 0, 0);

  if (frequency === 'daily') {
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  if (frequency === 'weekly' || frequency === 'biweekly') {
    const currentDay = next.getDay();
    let daysToAdd = (dayOfWeek - currentDay + 7) % 7;
    if (daysToAdd === 0 && next.getTime() <= now.getTime()) {
      daysToAdd = 7;
    }
    next.setDate(next.getDate() + daysToAdd);
    return next;
  }

  // Monthly: Next 1st of month (or next occurrence of same day)
  if (frequency === 'monthly') {
    if (next.getTime() <= now.getTime()) {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  }

  return next;
}

/**
 * Formats a Date object to iCalendar ISO format: YYYYMMDDTHHMMSSZ
 */
function formatIcsDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Escapes characters for iCalendar text fields
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function getFrequencyLabelAr(freq: ScheduledAuditFrequency): string {
  switch (freq) {
    case 'daily':
      return 'يومياً (Daily)';
    case 'weekly':
      return 'أسبوعياً (Weekly)';
    case 'biweekly':
      return 'كل أسبوعين (Bi-weekly)';
    case 'monthly':
      return 'شهرياً (Monthly)';
    default:
      return 'دوري';
  }
}

/**
 * Generates an RFC 5545 iCalendar (.ics) string with recurrence rules and reminders
 */
export function generateScheduledAuditIcs(config: ScheduledAuditCalendarConfig): string {
  const {
    siteName,
    url,
    frequency = 'weekly',
    dayOfWeek = 1,
    timeOfDay = '09:00',
    scoreThreshold = 80,
    auditScore
  } = config;

  const displayName = siteName || url;
  const startDate = computeNextAuditDate(frequency, dayOfWeek, timeOfDay);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 minutes duration
  const now = new Date();

  // Determine Recurrence Rule (RRULE)
  let rrule = '';
  const dayCode = DAY_CODES[dayOfWeek] || 'MO';

  switch (frequency) {
    case 'daily':
      rrule = 'RRULE:FREQ=DAILY;INTERVAL=1';
      break;
    case 'weekly':
      rrule = `RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${dayCode}`;
      break;
    case 'biweekly':
      rrule = `RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=${dayCode}`;
      break;
    case 'monthly':
      rrule = 'RRULE:FREQ=MONTHLY;INTERVAL=1';
      break;
  }

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rasid-seo.com';
  const auditLink = `${appUrl}/?url=${encodeURIComponent(url)}`;

  const description = [
    `📅 تذكير بفحص السيو الدوري لموقع: ${displayName}`,
    `🔗 رابط الموقع: ${url}`,
    `⏱️ التردد: ${getFrequencyLabelAr(frequency)} في تمام الساعة ${timeOfDay}`,
    auditScore ? `📊 النتيجة السابقة: ${auditScore}/100` : '',
    scoreThreshold ? `🎯 الحد الأدنى المستهدف للأداء: ${scoreThreshold}/100` : '',
    '',
    '📋 قائمة المهام المطلوب فحصها خلال هذه الجلسة:',
    '1. تشغيل فحص السيو الشامل عبر منصة راصد السيو الذكي.',
    '2. التحقق من مؤشرات سرعة الويب (Core Web Vitals - LCP, FID, CLS).',
    '3. الكشف عن أي روابط ميتة أو معطلة جديدة (Broken Links 404).',
    '4. مراجعة العناوين والوسوم التعريفية والكلمات المفتاحية ذات النية العالية.',
    '5. تنفيذ التوصيات ذات الأولوية القصوى المقترحة من الذكاء الاصطناعي.',
    '',
    `🚀 افتح تقرير الفحص المباشر فوراً:`,
    auditLink
  ]
    .filter(Boolean)
    .join('\n');

  const uid = `scheduled-audit-${encodeURIComponent(url).replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}@rasidseo.app`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RasidSEO//Scheduled Audits Calendar//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:مواعيد فحص السيو الدورية - راصد السيو',
    'X-WR-TIMEZONE:UTC',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    rrule,
    `SUMMARY:${escapeIcsText(`[راصد السيو] فحص دوري لموقع ${displayName}`)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(url)}`,
    `URL:${escapeIcsText(auditLink)}`,
    'STATUS:CONFIRMED',
    'CATEGORIES:SEO,Web Audit,Marketing',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`تذكير: حان موعد فحص السيو الدوري لموقع ${displayName}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n');
}

/**
 * Generates a direct Google Calendar Web URL with prefilled template parameters and recurrence
 */
export function generateGoogleCalendarUrl(config: ScheduledAuditCalendarConfig): string {
  const {
    siteName,
    url,
    frequency = 'weekly',
    dayOfWeek = 1,
    timeOfDay = '09:00',
    scoreThreshold = 80,
    auditScore
  } = config;

  const displayName = siteName || url;
  const startDate = computeNextAuditDate(frequency, dayOfWeek, timeOfDay);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

  const startIso = formatIcsDate(startDate);
  const endIso = formatIcsDate(endDate);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rasid-seo.com';
  const auditLink = `${appUrl}/?url=${encodeURIComponent(url)}`;

  const details = [
    `📅 موعد فحص السيو الدوري لموقع: ${displayName}`,
    `🔗 الرابط المفحوص: ${url}`,
    `⏱️ التكرار: ${getFrequencyLabelAr(frequency)} في تمام الساعة ${timeOfDay}`,
    auditScore ? `📊 النتيجة السابقة: ${auditScore}/100` : '',
    scoreThreshold ? `🎯 الحد الأدنى للسكور: ${scoreThreshold}/100` : '',
    '',
    '📋 قائمة التحقق المقترحة:',
    '• إجراء الفحص الدوري السريع في منصة راصد السيو الذكي',
    '• فحص سرعة الصفحة ومؤشرات الويب الأساسية (Core Web Vitals)',
    '• مراجعة الروابط المعطلة 404 وتصحيحها',
    '• متابعة الكلمات المفتاحية ذات النية العالية وفرص التصدر',
    '• تنفيذ توصيات الذكاء الاصطناعي الأسبوعية',
    '',
    `🚀 رابط الفحص المباشر: ${auditLink}`
  ]
    .filter(Boolean)
    .join('\n');

  // Recurrence rule for Google Calendar
  const dayCode = DAY_CODES[dayOfWeek] || 'MO';
  let recur = '';
  switch (frequency) {
    case 'daily':
      recur = 'RRULE:FREQ=DAILY;INTERVAL=1';
      break;
    case 'weekly':
      recur = `RRULE:FREQ=WEEKLY;BYDAY=${dayCode}`;
      break;
    case 'biweekly':
      recur = `RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=${dayCode}`;
      break;
    case 'monthly':
      recur = 'RRULE:FREQ=MONTHLY';
      break;
  }

  const queryParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[راصد السيو] فحص دوري لموقع ${displayName}`,
    dates: `${startIso}/${endIso}`,
    details,
    location: url,
    recur
  });

  return `https://calendar.google.com/calendar/render?${queryParams.toString()}`;
}

/**
 * Triggers instant browser download of the .ics calendar file
 */
export function downloadScheduledAuditIcs(config: ScheduledAuditCalendarConfig): void {
  const icsData = generateScheduledAuditIcs(config);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);

  let cleanHost = 'website';
  try {
    cleanHost = new URL(config.url).hostname.replace(/[^a-zA-Z0-9_-]/g, '_');
  } catch {
    cleanHost = config.url.replace(/[^a-zA-Z0-9_-]/g, '_') || 'website';
  }

  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `SEO_Audit_Schedule_${cleanHost}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Helper to build calendar config from a subscription object
 */
export function subscriptionToCalendarConfig(
  sub: ScheduledAuditSubscription,
  auditScore?: number
): ScheduledAuditCalendarConfig {
  return {
    siteName: sub.siteName,
    url: sub.url,
    frequency: sub.frequency,
    dayOfWeek: sub.dayOfWeek,
    timeOfDay: sub.timeOfDay,
    scoreThreshold: sub.scoreThreshold,
    auditScore,
    alertOnScoreDrop: sub.alertOnScoreDrop
  };
}

/**
 * Formats a friendly human-readable next audit schedule string in Arabic
 */
export function formatNextAuditDisplay(
  frequency: ScheduledAuditFrequency,
  dayOfWeek: number = 1,
  timeOfDay: string = '09:00'
): { nextDateStr: string; relativeText: string } {
  const date = computeNextAuditDate(frequency, dayOfWeek, timeOfDay);
  const dayName = DAY_NAMES_AR[date.getDay()] || '';
  const dateFormatted = date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return {
    nextDateStr: `${dayName} ${dateFormatted} - ${timeOfDay}`,
    relativeText: `${getFrequencyLabelAr(frequency)} كل ${dayName} الساعة ${timeOfDay}`
  };
}
