import { SeoRoadmapPlan, RoadmapTask } from '../types/seo';

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

/**
 * Generates an iCalendar (.ics) string containing all 30-day roadmap tasks
 * scheduled as calendar events starting from tomorrow.
 */
export function generateRoadmapIcs(plan: SeoRoadmapPlan): string {
  const now = new Date();
  const createdDateStr = formatIcsDate(now);

  const allTasks: RoadmapTask[] = [];
  plan.phases.forEach((phase) => {
    phase.tasks.forEach((task) => {
      allTasks.push(task);
    });
  });

  const events: string[] = [];

  allTasks.forEach((task) => {
    // Calculate event date: tomorrow + (dayNumber - 1) days
    const eventStartDate = new Date();
    eventStartDate.setDate(eventStartDate.getDate() + Math.max(1, task.dayNumber));
    // Set to 10:00 AM local time
    eventStartDate.setHours(10, 0, 0, 0);

    const eventEndDate = new Date(eventStartDate.getTime() + task.estimatedMinutes * 60 * 1000);

    const subStepsText = task.subSteps.map((s, idx) => `${idx + 1}. ${s.textAr}`).join('\n');
    const fullDescription =
      `${task.descriptionAr}\n\n` +
      `الأهمية: ${task.whyThisDayAr}\n` +
      `الأثر المتوقع: ${task.expectedImpactAr}\n\n` +
      `خطوات التنفيذ:\n${subStepsText}\n\n` +
      `رابط الموقع المفحوص: ${plan.url}`;

    const priorityVal = task.priority === 'critical' ? '1' : task.priority === 'high' ? '2' : '3';

    events.push(
      [
        'BEGIN:VEVENT',
        `UID:seo-roadmap-${task.id}-${task.dayNumber}@rasidseo.app`,
        `DTSTAMP:${createdDateStr}`,
        `DTSTART:${formatIcsDate(eventStartDate)}`,
        `DTEND:${formatIcsDate(eventEndDate)}`,
        `SUMMARY:${escapeIcsText(`[سيو اليوم ${task.dayNumber}] ${task.titleAr}`)}`,
        `DESCRIPTION:${escapeIcsText(fullDescription)}`,
        `PRIORITY:${priorityVal}`,
        `CATEGORIES:${escapeIcsText(`SEO, ${task.category.toUpperCase()}`)}`,
        `URL:${plan.url}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      ].join('\r\n')
    );
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RasidSEO//SEO 30-Day Execution Roadmap//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(`خطة السيو 30 يوما - ${plan.targetDomain}`)}`,
    'X-WR-TIMEZONE:UTC',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Triggers instant browser download of the roadmap as an .ics file
 */
export function downloadRoadmapIcs(plan: SeoRoadmapPlan): void {
  const icsData = generateRoadmapIcs(plan);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanDomain = plan.targetDomain.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `SEO_Roadmap_30Days_${cleanDomain}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a clean CSV string of the 30-day roadmap with UTF-8 BOM
 */
export function generateRoadmapCsv(plan: SeoRoadmapPlan): string {
  const rows: string[][] = [
    [
      'اليوم',
      'الأسبوع',
      'المرحلة',
      'عنوان المهمة',
      'القسم',
      'الأولوية',
      'الصعوبة',
      'الوقت المقدر (دقيقة)',
      'سبب الجدولة في هذا اليوم',
      'الأثر المتوقع على السيو',
      'خطوات التنفيذ',
      'الحالة'
    ]
  ];

  plan.phases.forEach((phase) => {
    phase.tasks.forEach((task) => {
      const subSteps = task.subSteps.map((s, i) => `${i + 1}) ${s.textAr}`).join(' | ');
      rows.push([
        `اليوم ${task.dayNumber}`,
        `الأسبوع ${task.weekNumber}`,
        phase.titleAr,
        task.titleAr,
        task.category,
        task.priority === 'critical' ? 'حرج جداً' : task.priority === 'high' ? 'أولوية قصوى' : 'أولوية متوسطة',
        task.difficulty === 'hard' ? 'صعب' : task.difficulty === 'medium' ? 'متوسط' : 'سهل',
        task.estimatedMinutes.toString(),
        task.whyThisDayAr,
        task.expectedImpactAr,
        subSteps,
        task.status === 'completed' ? 'مكتمل' : task.status === 'in_progress' ? 'قيد التنفيذ' : 'معلق'
      ]);
    });
  });

  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
  return csvContent;
}

/**
 * Triggers browser download of roadmap CSV
 */
export function downloadRoadmapCsv(plan: SeoRoadmapPlan): void {
  const csvData = generateRoadmapCsv(plan);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanDomain = plan.targetDomain.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `SEO_Roadmap_30Days_${cleanDomain}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates an executive Markdown summary of the 30-day roadmap
 */
export function generateRoadmapMarkdown(plan: SeoRoadmapPlan): string {
  let md = `# خارطة طريق السيو التنفيذية لمدة 30 يوماً\n`;
  md += `**الموقع:** ${plan.url} | **السكور الأولي:** ${plan.overallHealthScore}/100 | **السكور المستهدف:** ${plan.projectedScoreAfter30Days}/100\n`;
  md += `**إجمالي المهام:** ${plan.phases.reduce((acc, p) => acc + p.tasks.length, 0)} مهمة | **إجمالي الوقت المقدر:** ${plan.estimatedTotalHours} ساعة\n\n`;
  md += `> ${plan.executiveSummaryAr}\n\n`;
  md += `### الأثر والنمو المستهدف:\n${plan.targetGrowthImpactAr}\n\n`;
  md += `---\n\n`;

  plan.phases.forEach((phase) => {
    md += `## ${phase.weekLabelAr}: ${phase.titleAr}\n`;
    md += `* **الهدف الرئيسي:** ${phase.goalAr}\n`;
    md += `* **المؤشر المستهدف:** ${phase.targetMetricAr}\n\n`;

    phase.tasks.forEach((task) => {
      const priorityBadge = task.priority === 'critical' ? '🔴 حرج' : task.priority === 'high' ? '🟠 عالي' : '🟡 متوسط';
      md += `### [اليوم ${task.dayNumber}] ${task.titleAr} (${priorityBadge} - ${task.estimatedMinutes} دقيقة)\n`;
      md += `${task.descriptionAr}\n\n`;
      md += `* **الأهمية:** ${task.whyThisDayAr}\n`;
      md += `* **الأثر المتوقع:** ${task.expectedImpactAr}\n`;
      md += `* **خطوات الإنجاز:**\n`;
      task.subSteps.forEach((s) => {
        md += `  - [ ] ${s.textAr}\n`;
      });
      if (task.codeSnippet) {
        md += `\n\`\`\`html\n${task.codeSnippet}\n\`\`\`\n`;
      }
      md += `\n`;
    });
    md += `---\n\n`;
  });

  return md;
}
