import React, { useState, useMemo } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  X,
  FileSpreadsheet,
  Table,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Info,
  Code2
} from 'lucide-react';
import { AuditResult } from '../types/seo';

interface JsonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditData: AuditResult;
}

export const JsonExportModal: React.FC<JsonExportModalProps> = ({
  isOpen,
  onClose,
  auditData
}) => {
  const [activeTab, setActiveTab] = useState<'full' | 'tabular' | 'tsv' | 'guide'>('full');
  const [copied, setCopied] = useState<string | null>(null);

  // Generate Full Structured JSON
  const fullJsonString = useMemo(() => {
    const fullData = {
      generator: 'RasidSEO Audit Tool (راصد سيو)',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      metadata: {
        targetUrl: auditData.url,
        analyzedAt: auditData.analyzedAt,
        overallScore: auditData.overallScore,
        loadTimeMs: auditData.loadTimeMs,
        statusCode: auditData.statusCode,
        isHttps: auditData.isHttps,
        wordCount: auditData.wordCount,
        pageSizeKb: auditData.pageSizeKb,
        textToHtmlRatio: auditData.textToHtmlRatio,
        lang: auditData.lang,
        charset: auditData.charset
      },
      categories: auditData.categories,
      scoresSummary: {
        overall: auditData.overallScore,
        passedChecks: auditData.items.filter((i) => i.status === 'pass').length,
        warningChecks: auditData.items.filter((i) => i.status === 'warning').length,
        errorChecks: auditData.items.filter((i) => i.status === 'error').length,
        totalChecks: auditData.items.length
      },
      pageStructure: {
        headings: auditData.headings,
        images: auditData.images,
        links: auditData.links,
        socialTags: auditData.social,
        schemas: auditData.schemasFound,
        securityHeaders: auditData.securityHeaders
      },
      auditChecklist: auditData.items.map((item) => ({
        id: item.id,
        category: item.category,
        titleAr: item.titleAr,
        titleEn: item.title,
        status: item.status,
        score: item.score,
        currentValue: item.currentValue,
        idealValue: item.idealValue,
        impact: item.impactAr,
        fixGuide: item.fixGuideAr,
        codeSnippet: item.codeSnippet || null
      })),
      aiRecommendations: auditData.aiAdvice || null,
      coreWebVitals: auditData.coreWebVitals || null,
      internalLinkingAnalysis: auditData.internalLinkingAnalysis || null,
      securityHeadersAnalysis: auditData.securityHeadersAnalysis || null
    };

    return JSON.stringify(fullData, null, 2);
  }, [auditData]);

  // Generate Flattened / Tabular JSON specifically for Excel & Google Sheets
  const tabularJsonArray = useMemo(() => {
    return auditData.items.map((item, idx) => ({
      index: idx + 1,
      url: auditData.url,
      category: item.category,
      categoryAr:
        auditData.categories[item.category as keyof typeof auditData.categories]?.nameAr ||
        item.category,
      test_id: item.id,
      test_name_ar: item.titleAr,
      test_name_en: item.title,
      status: item.status,
      status_ar:
        item.status === 'pass'
          ? 'ناجح (Pass)'
          : item.status === 'warning'
          ? 'تنبيه (Warning)'
          : 'خطأ حرج (Error)',
      score: item.score,
      current_value: item.currentValue,
      ideal_value: item.idealValue,
      impact: item.impactAr,
      fix_guide: item.fixGuideAr
    }));
  }, [auditData]);

  const tabularJsonString = useMemo(() => {
    return JSON.stringify(tabularJsonArray, null, 2);
  }, [tabularJsonArray]);

  // Generate TSV (Tab-Separated Values) for 1-click paste into Google Sheets / Excel
  const tsvString = useMemo(() => {
    const headers = [
      '#',
      'الرابط',
      'فئة الفحص',
      'معيار السيو',
      'الحالة',
      'الدرجة',
      'القيمة المكتشفة',
      'القيمة المثالية',
      'مستوى التأثير',
      'طريقة الإصلاح'
    ];
    const rows = tabularJsonArray.map((row) => [
      row.index,
      row.url,
      row.categoryAr,
      row.test_name_ar,
      row.status_ar,
      row.score,
      `"${String(row.current_value || '').replace(/"/g, '""')}"`,
      `"${String(row.ideal_value || '').replace(/"/g, '""')}"`,
      row.impact,
      `"${String(row.fix_guide || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
  }, [tabularJsonArray]);

  // Generate CSV for direct Excel import
  const csvString = useMemo(() => {
    const headers = [
      'index',
      'url',
      'category',
      'test_name_ar',
      'status',
      'score',
      'current_value',
      'ideal_value',
      'impact',
      'fix_guide'
    ];
    const rows = tabularJsonArray.map((row) => [
      row.index,
      `"${row.url}"`,
      `"${row.categoryAr}"`,
      `"${row.test_name_ar.replace(/"/g, '""')}"`,
      `"${row.status_ar}"`,
      row.score,
      `"${String(row.current_value || '').replace(/"/g, '""')}"`,
      `"${String(row.ideal_value || '').replace(/"/g, '""')}"`,
      `"${row.impact}"`,
      `"${String(row.fix_guide || '').replace(/"/g, '""')}"`
    ]);

    // Add BOM for proper Arabic UTF-8 rendering in Excel
    return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }, [tabularJsonArray]);

  // Clean filename generator
  const getDomainFilename = (ext: string, suffix = '') => {
    try {
      const parsed = new URL(auditData.url);
      const host = parsed.hostname.replace(/[^a-zA-Z0-9]/g, '_');
      const date = new Date().toISOString().slice(0, 10);
      return `rasid_seo_audit_${host}${suffix ? '_' + suffix : ''}_${date}.${ext}`;
    } catch {
      return `rasid_seo_audit${suffix ? '_' + suffix : ''}.${ext}`;
    }
  };

  // Trigger download helper
  const triggerDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  تصدير نتائج الفحص بصيغة JSON
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Google Sheets & Excel Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تصدير البيانات والنتائج البرمجية لتحليلها في جداول البيانات، أو عبر بايثون و Power BI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs & Subnav */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('full')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'full'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>ملف JSON الكامل (Full Schema)</span>
            </button>

            <button
              onClick={() => setActiveTab('tabular')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'tabular'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>JSON مسطح للجداول (Tabular)</span>
            </button>

            <button
              onClick={() => setActiveTab('tsv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'tsv'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>نسخ فوري لـ Sheets / Excel</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>طريقة الاستيراد</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">
              {auditData.items.length} اختبار سيو
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Tab 1: Full JSON Schema */}
          {activeTab === 'full' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">الهيكل الكامل للتقرير:</span>{' '}
                  يتضمن إحصائيات الأداء، والبيانات الوصفية، والترويسات، والوسوم، ونصائح الذكاء الاصطناعي.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(fullJsonString, 'full')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                  >
                    {copied === 'full' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ JSON</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      triggerDownload(
                        fullJsonString,
                        getDomainFilename('json', 'full'),
                        'application/json;charset=utf-8;'
                      )
                    }
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل ملف JSON</span>
                  </button>
                </div>
              </div>

              {/* Code preview block */}
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-[420px] dir-ltr text-left">
                <pre className="leading-relaxed whitespace-pre font-mono text-[11px]">
                  {fullJsonString}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 2: Tabular Flattened JSON */}
          {activeTab === 'tabular' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">صيغة مصفوفة مسطحة (Array of Records):</span>{' '}
                  مثالية للاستيراد المباشر في Microsoft Excel Power Query و Google Sheets Apps Script دون أي تعقيد.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(tabularJsonString, 'tabular')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                  >
                    {copied === 'tabular' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ JSON المسطح</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      triggerDownload(
                        tabularJsonString,
                        getDomainFilename('json', 'tabular'),
                        'application/json;charset=utf-8;'
                      )
                    }
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل Tabular JSON</span>
                  </button>
                </div>
              </div>

              {/* Code preview block */}
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-[420px] dir-ltr text-left">
                <pre className="leading-relaxed whitespace-pre font-mono text-[11px]">
                  {tabularJsonString}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 3: Quick TSV / Sheets Paste */}
          {activeTab === 'tsv' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                    أسرع طريقة لنقل البيانات إلى جداول البيانات (Google Sheets / Excel):
                  </h4>
                  <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    انقر على زر <strong>&quot;نسخ للجداول الآن&quot;</strong> أدناه، ثم افتح شيت جديد في Google Sheets أو Excel واضغط <kbd className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900 rounded font-mono">Ctrl + V</kbd>. ستتوزع كافة صفوف ونتائج الفحص تلقائياً في أعمدة مرتبة!
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  معاينة البيانات المنظمة القابلة للنسخ المباشر:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(tsvString, 'tsv')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-all shadow-xs shadow-emerald-200 dark:shadow-emerald-950 cursor-pointer"
                  >
                    {copied === 'tsv' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تم النسخ للحافظة بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ للجداول الآن (Ctrl + V)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      triggerDownload(
                        csvString,
                        getDomainFilename('csv'),
                        'text/csv;charset=utf-8;'
                      )
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل كملف CSV</span>
                  </button>
                </div>
              </div>

              {/* Table preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto max-h-[380px]">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">الفئة</th>
                      <th className="p-2.5">المعيار</th>
                      <th className="p-2.5">الحالة</th>
                      <th className="p-2.5">الدرجة</th>
                      <th className="p-2.5">القيمة المكتشفة</th>
                      <th className="p-2.5">القيمة المثالية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                    {tabularJsonArray.map((row) => (
                      <tr
                        key={row.index}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-2.5 text-slate-400">{row.index}</td>
                        <td className="p-2.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                          {row.categoryAr}
                        </td>
                        <td className="p-2.5 font-sans font-semibold text-slate-900 dark:text-white">
                          {row.test_name_ar}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.status === 'pass'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : row.status === 'warning'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {row.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                          {row.score}%
                        </td>
                        <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                          {row.current_value}
                        </td>
                        <td className="p-2.5 font-sans text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                          {row.ideal_value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Step-by-step How-To Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Excel Guide */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      XLS
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      كيفية فتح JSON في Microsoft Excel
                    </h3>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed pr-1">
                    <li>قم بتنزيل ملف <strong>Tabular JSON</strong> أو <strong>CSV</strong> من هذه النافذة.</li>
                    <li>افتح برنامج <strong>Excel</strong>، ثم توجه إلى تبويب <strong>بيانات (Data)</strong> في الشريط العلوي.</li>
                    <li>اختر <strong>الحصول على بيانات (Get Data)</strong> &gt; <strong>من ملف (From File)</strong> &gt; <strong>من JSON (From JSON)</strong>.</li>
                    <li>حدد الملف الذي قمت بتنزيله، ثم اضغط <strong>إغلاق وتحميل (Close &amp; Load)</strong> لتظهر الجداول جاهزة للمخططات والـ Pivot Tables.</li>
                  </ol>
                </div>

                {/* Google Sheets Guide */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                      GS
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      كيفية الاستخدام في Google Sheets
                    </h3>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed pr-1">
                    <li>
                      <strong>الطريقة الأسرع:</strong> انتقل إلى تبويب <strong>&quot;نسخ فوري&quot;</strong> في هذه النافذة، اضغط زر النسخ، وافتح جدول بيانات Google جديد ثم الصق بـ <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Ctrl+V</kbd>.
                    </li>
                    <li>
                      <strong>استيراد ملف CSV:</strong> توجه إلى <strong>ملف (File)</strong> &gt; <strong>استيراد (Import)</strong> &gt; <strong>تحميل (Upload)</strong> واختر ملف CSV المنزّل.
                    </li>
                    <li>
                      <strong>Apps Script:</strong> يمكنك استخدام ميزة سكريبتات Google لقراءة JSON الكامل وتحديث لوحة المتابعة الدورية تلقائياً.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Developer & Python Snippet */}
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                    كود سريع لتحليل البيانات في Python (Pandas Dataframe):
                  </h4>
                </div>
                <pre className="p-3 bg-slate-950 text-indigo-200 rounded-lg font-mono text-[11px] dir-ltr text-left overflow-x-auto">
{`import pandas as pd
import json

# تحميل التقرير المسطح
with open('rasid_seo_audit_tabular.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

df = pd.DataFrame(data)
print(df[['category', 'test_name_ar', 'status', 'score']])`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>كافة ملفات JSON المصدّرة مشفرة بصيغة UTF-8 وتدعم النصوص العربية بالكامل</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              إغلاق
            </button>
            <button
              onClick={() => {
                triggerDownload(
                  fullJsonString,
                  getDomainFilename('json'),
                  'application/json;charset=utf-8;'
                );
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل التقرير الكامل (.JSON)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
