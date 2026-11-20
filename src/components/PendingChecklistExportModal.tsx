import React, { useState, useMemo, useRef } from 'react';
import {
  CheckSquare,
  Download,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  X,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Printer,
  Sparkles,
  Info,
  Calendar,
  Globe,
  RefreshCw,
  ListTodo,
  Mic
} from 'lucide-react';
import { AuditItem, AuditResult } from '../types/seo';
import {
  CATEGORY_NAMES_AR,
  downloadPendingChecklistCsv,
  exportPendingChecklistToPdf
} from '../utils/checklistExport';
import { ChecklistAiTipButton } from './ChecklistAiTipButton';
import { loadAuditorNotes } from '../utils/auditorVoiceNotes';

interface PendingChecklistExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditData: AuditResult;
}

export const PendingChecklistExportModal: React.FC<PendingChecklistExportModalProps> = ({
  isOpen,
  onClose,
  auditData
}) => {
  const [filterType, setFilterType] = useState<'all' | 'error' | 'warning'>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const printableRef = useRef<HTMLDivElement>(null);

  // Extract clean domain name
  const domain = useMemo(() => {
    try {
      return new URL(auditData.url).hostname;
    } catch {
      return auditData.url.replace(/^https?:\/\//, '').split('/')[0] || 'website';
    }
  }, [auditData.url]);

  // Filter pending items (status !== 'pass')
  const pendingItems = useMemo(() => {
    const allPending = auditData.items.filter((item) => item.status !== 'pass');
    if (filterType === 'error') return allPending.filter((item) => item.status === 'error');
    if (filterType === 'warning') return allPending.filter((item) => item.status === 'warning');
    return allPending;
  }, [auditData.items, filterType]);

  const errorCount = useMemo(
    () => auditData.items.filter((item) => item.status === 'error').length,
    [auditData.items]
  );

  const warningCount = useMemo(
    () => auditData.items.filter((item) => item.status === 'warning').length,
    [auditData.items]
  );

  const auditorNotes = useMemo(() => {
    return loadAuditorNotes(auditData.url);
  }, [auditData.url]);

  const auditorNotesCount = useMemo(() => {
    return Object.keys(auditorNotes).length;
  }, [auditorNotes]);

  // Toggle item checkbox preview
  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    downloadPendingChecklistCsv({
      items: pendingItems,
      pageUrl: auditData.url,
      domainName: domain,
      analyzedAt: auditData.analyzedAt,
      overallScore: auditData.overallScore
    });
  };

  // PDF Export Handler
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportPendingChecklistToPdf('printable-pending-checklist', domain);
    } catch (err) {
      console.error('Checklist PDF export error:', err);
      alert('حدث خطأ أثناء تصدير ملف PDF، يمكنك استخدام خيار التصدير كـ CSV أو النسخ كـ Markdown.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Copy as Markdown Checklist
  const handleCopyMarkdown = () => {
    const lines = [
      `# قائمة مهام وتدقيق السيو المعلقة - ${domain}`,
      `**الرابط:** ${auditData.url}`,
      `**تاريخ الفحص:** ${new Date().toLocaleDateString('ar-EG')}`,
      `**الدرجة العامة:** ${auditData.overallScore}/100`,
      `**إجمالي المهام المعلقة:** ${pendingItems.length} مهمة`,
      '',
      '---',
      ''
    ];

    pendingItems.forEach((item, index) => {
      const priorityLabel = item.status === 'error' ? '🔴 [حرج]' : '🟡 [تحسين]';
      const catName = CATEGORY_NAMES_AR[item.category] || item.category;
      lines.push(`### ${index + 1}. ${priorityLabel} ${item.titleAr || item.title}`);
      lines.push(`- [ ] **المهمة:** ${item.titleAr || item.title}`);
      lines.push(`- **القسم:** ${catName}`);
      if (item.currentValue) lines.push(`- **الوضع الحالي:** ${item.currentValue}`);
      if (item.idealValue) lines.push(`- **المستهدف:** ${item.idealValue}`);
      lines.push(`- **التشخيص:** ${item.descriptionAr}`);
      lines.push(`- **خطوات الحل:** ${item.fixGuideAr}`);
      if (auditorNotes[item.id] && auditorNotes[item.id].text) {
        lines.push(`- 🎙️ **توجيه وملاحظة المدقق الصوتي:** ${auditorNotes[item.id].text}`);
      }
      lines.push('');
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 text-right overflow-hidden transition-all"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  تصدير قائمة التحقق للمهام المعلقة فقط (Pending Checklist)
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  {pendingItems.length} مهام معلقة
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                توليد قائمة مهام عملية بصيغة PDF أو CSV مخصصة للمطورين وفرق العمل للتتبع الخارجي والتنفيذ.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Summary Strip & Filters */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 dark:text-slate-300">نطاق التصدير:</span>
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                كافة المهام المعلقة ({errorCount + warningCount})
              </button>
              <button
                onClick={() => setFilterType('error')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === 'error'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>أخطاء حرجة فقط ({errorCount})</span>
              </button>
              <button
                onClick={() => setFilterType('warning')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  filterType === 'warning'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>تحسينات وتنبيهات فقط ({warningCount})</span>
              </button>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* CSV Button */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="تصدير ملف CSV متوافق مع Excel وجداول Google وتطبيقات المهام"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير CSV للمتابعة</span>
            </button>

            {/* PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="تصدير ملف PDF بتنسيق قائمة مهام للطباعة والمتابعة"
            >
              {isExportingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري تجهيز PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>تصدير PDF (قائمة مهام)</span>
                </>
              )}
            </button>

            {/* Markdown Copy Button */}
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-colors cursor-pointer"
              title="نسخ كمهام Markdown للصق في Slack أو GitHub أو Notion"
            >
              {copiedMarkdown ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>نسخ Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body: Interactive Checklist Preview and Hidden Printable Document */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <ListTodo className="w-4 h-4 text-indigo-500" />
              <span>معاينة عناصر قائمة التحقق المراد تصديرها ({pendingItems.length} عنصر):</span>
            </span>
            <span className="text-[11px]">انقر على المربع [✓] لتجربة التأشير</span>
          </div>

          {/* Interactive Checklist Preview Cards */}
          <div className="space-y-3">
            {pendingItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
                تهانينا! لا توجد مهام معلقة في هذا التصنيف. كافة المعايير المفحوصة ناجحة ومتطابقة تماماً.
              </div>
            ) : (
              pendingItems.map((item, index) => {
                const isChecked = !!checkedIds[item.id];
                const isError = item.status === 'error';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isChecked
                        ? 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                        : isError
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                        : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Interactive Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleCheck(item.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="flex-1 space-y-1.5 text-xs">
                        {/* Title and Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-400 font-bold">
                              #{index + 1}
                            </span>
                            <h4
                              className={`font-bold text-sm ${
                                isChecked
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {item.titleAr || item.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <ChecklistAiTipButton
                              item={item}
                              currentUrl={auditData.url}
                              pageTitle={auditData.pageTitle}
                            />
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isError
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {isError ? 'خطأ حرج' : 'تحسين مطلوب'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                              {CATEGORY_NAMES_AR[item.category] || item.category}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.descriptionAr}
                        </p>

                        {/* Current vs Ideal Values */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          {item.currentValue && (
                            <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                              <span className="text-slate-400 block font-medium">الوضع المكتشف:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">
                                {item.currentValue}
                              </span>
                            </div>
                          )}
                          {item.idealValue && (
                            <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                              <span className="text-slate-400 block font-medium">القيمة المستهدفة:</span>
                              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                                {item.idealValue}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actionable Solution */}
                        <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-[11px] leading-relaxed text-indigo-900 dark:text-indigo-200">
                          <span className="font-bold block mb-0.5 text-indigo-700 dark:text-indigo-300">
                            💡 خطوة الإصلاح المقترحة:
                          </span>
                          <span>{item.fixGuideAr}</span>
                        </div>

                        {/* Auditor Voice Note & Custom Advice */}
                        {auditorNotes[item.id] && (
                          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/90 to-emerald-50/70 dark:from-indigo-950/50 dark:to-emerald-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                              <Mic className="w-3.5 h-3.5" />
                              <span>توجيه وملاحظة المدقق الصوتي المخصصة:</span>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                              {auditorNotes[item.id].text}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Hidden/Dedicated Printable Container for PDF Generation */}
          <div className="overflow-hidden h-0 w-0 opacity-0 pointer-events-none">
            <div
              id="printable-pending-checklist"
              ref={printableRef}
              className="bg-white text-slate-900 p-10 max-w-4xl mx-auto space-y-6 text-right font-sans"
              style={{ direction: 'rtl', width: '800px', backgroundColor: '#ffffff' }}
            >
              {/* Document Header */}
              <div className="border-b-2 border-indigo-600 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">
                      قائمة تدقيق ومهام السيو المعلقة (Pending SEO Action Checklist)
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      تقرير التتبع الخارجي للمهام غير المنجزة المعد بواسطة أداة راصد سيو (RasidSEO)
                    </p>
                  </div>
                  <div className="text-left font-mono text-xs text-slate-500">
                    <span className="font-bold block text-sm text-indigo-600">
                      درجة السيو: {auditData.overallScore}/100
                    </span>
                    <span>التاريخ: {new Date().toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                {/* Target Site Bar */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 ml-1">رابط الموقع:</span>
                    <span className="font-mono font-bold text-slate-900">{auditData.url}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 ml-1">إجمالي المهام المعلقة:</span>
                    <span className="font-bold text-indigo-600">{pendingItems.length} مهمة</span>
                    <span className="text-rose-600 font-bold mr-2">({errorCount} حرج)</span>
                  </div>
                </div>
              </div>

              {/* Printable Checklist Items Table */}
              <div className="space-y-4">
                {pendingItems.map((item, index) => {
                  const isError = item.status === 'error';
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-slate-300 bg-white space-y-2 page-break-inside-avoid"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              display: 'inline-block',
                              width: '16px',
                              height: '16px',
                              border: '2px solid #334155',
                              borderRadius: '3px'
                            }}
                          />
                          <span className="font-bold text-sm text-slate-900">
                            #{index + 1} - {item.titleAr || item.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              isError ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isError ? 'خطأ حرج' : 'تحسين مطلوب'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {CATEGORY_NAMES_AR[item.category] || item.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pr-6">
                        {item.descriptionAr}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pr-6 pt-1">
                        {item.currentValue && (
                          <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                            <span className="text-slate-500 font-medium">الوضع الحالي: </span>
                            <span className="font-bold text-slate-800">{item.currentValue}</span>
                          </div>
                        )}
                        {item.idealValue && (
                          <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                            <span className="text-slate-500 font-medium">المستهدف: </span>
                            <span className="font-bold text-emerald-700">{item.idealValue}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-2 rounded bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed mr-6">
                        <span className="font-bold text-indigo-800">خطوة الإصلاح: </span>
                        <span>{item.fixGuideAr}</span>
                      </div>

                      {auditorNotes[item.id] && (
                        <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 leading-relaxed mr-6">
                          <span className="font-bold text-emerald-900 block">🎙️ توجيه وملاحظة المدقق الصوتي المخصصة:</span>
                          <span className="text-slate-800">{auditorNotes[item.id].text}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sign-off & Verification Footer */}
              <div className="mt-8 pt-6 border-t-2 border-slate-200 text-xs text-slate-700 space-y-3">
                <h4 className="font-bold text-slate-900">اعتماد وتوثيق إنجاز المهام:</h4>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block mb-3">المراجع / منفذ التعديلات:</span>
                    <span className="font-mono text-slate-400">________________________</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block mb-3">تاريخ اكتمال الإصلاح:</span>
                    <span className="font-mono text-slate-400">____ / ____ / ________</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 block mb-3">توقيع الاعتماد النهائي:</span>
                    <span className="font-mono text-slate-400">________________________</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            يمكن استيراد ملف CSV مباشرة في برامج مثل Excel و Trello و Asana و Notion كقائمة مهام.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
