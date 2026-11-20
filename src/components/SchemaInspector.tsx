import React, { useState } from 'react';
import {
  Code2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  FileCode,
  Globe,
  ShoppingBag,
  Building2,
  BookOpen,
  HelpCircle,
  User,
  Layers,
  Wrench,
  Search,
  Filter,
  RefreshCw,
  Play
} from 'lucide-react';
import { SchemaAnalysis, DetectedSchemaItem, SchemaIssue } from '../types/seo';
import { SCHEMA_TYPE_INFO, inspectJsonLdText } from '../utils/schemaValidator';

interface SchemaInspectorProps {
  analysis?: SchemaAnalysis;
  pageUrl: string;
}

export const SchemaInspector: React.FC<SchemaInspectorProps> = ({
  analysis,
  pageUrl
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'errors' | 'warnings' | 'valid'>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, 'issues' | 'code' | 'props'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Interactive Live Tester State
  const [showTester, setShowTester] = useState(false);
  const [testJsonInput, setTestJsonInput] = useState<string>('');
  const [testResult, setTestResult] = useState<SchemaAnalysis | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Toggle item accordion
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? true : !prev[id]
    }));
  };

  // Switch item inner tab
  const setItemTab = (id: string, tab: 'issues' | 'code' | 'props') => {
    setActiveTabs(prev => ({ ...prev, [id]: tab }));
  };

  // Copy code helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Run live validation on user-pasted text
  const handleRunTest = () => {
    if (!testJsonInput.trim()) return;
    setIsTesting(true);
    try {
      const result = inspectJsonLdText(testJsonInput);
      setTestResult(result);
    } catch {
      // handled inside inspector
    } finally {
      setIsTesting(false);
    }
  };

  // Load sample into tester
  const loadSnippetIntoTester = (snippet: string) => {
    setTestJsonInput(snippet);
    setShowTester(true);
    const result = inspectJsonLdText(snippet);
    setTestResult(result);
    // Smooth scroll to tester
    setTimeout(() => {
      document.getElementById('schema-live-tester')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const items = analysis?.items || [];

  // Filter items
  const filteredItems = items.filter(item => {
    if (activeFilter === 'errors') return !item.isValid;
    if (activeFilter === 'warnings') return item.isValid && item.hasWarnings;
    if (activeFilter === 'valid') return item.isValid && !item.hasWarnings;
    return true;
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'WebSite':
        return <Globe className="w-4 h-4 text-sky-500" />;
      case 'Organization':
      case 'Corporation':
      case 'LocalBusiness':
        return <Building2 className="w-4 h-4 text-indigo-500" />;
      case 'Article':
      case 'NewsArticle':
      case 'BlogPosting':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'Product':
        return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case 'BreadcrumbList':
        return <Layers className="w-4 h-4 text-purple-500" />;
      case 'FAQPage':
        return <HelpCircle className="w-4 h-4 text-teal-500" />;
      case 'Person':
        return <User className="w-4 h-4 text-blue-500" />;
      default:
        return <Code2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const totalFound = analysis?.totalEntitiesFound ?? 0;
  const validCount = analysis?.validCount ?? 0;
  const warningCount = analysis?.warningCount ?? 0;
  const errorCount = analysis?.errorCount ?? 0;

  return (
    <div id="social-schema-inspector" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <Code2 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  فاحص ومحلل بيانات الـ Schema.org (JSON-LD)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  التواصل والبيانات المنظمة
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                تدقيق الترميزات المطبقة في الصفحة وكشف الأخطاء الهيكلية المؤثرة على مقتطفات نتائج جوجل الغنية (Google Rich Snippets)
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(pageUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="فتح أداة فحص النتائج المنسقة الرسمية من جوجل"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فحص في Google Rich Results</span>
          </a>

          <button
            type="button"
            onClick={() => setShowTester(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              showTester
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{showTester ? 'إغلاق المحرر التفاعلي' : 'محرر ومختبر الـ Schema'}</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">الترميزات المكتشفة</span>
          <span className="font-mono text-xl font-black text-slate-900 dark:text-white">{totalFound}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">كيانات Schema</span>
        </div>

        <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-center">
          <span className="text-xs text-emerald-700 dark:text-emerald-300 block mb-1">سليمة 100%</span>
          <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">{validCount}</span>
          <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 block mt-0.5">مؤهلة للمقتطفات الغنية</span>
        </div>

        <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-center">
          <span className="text-xs text-rose-700 dark:text-rose-300 block mb-1">أخطاء هيكلية</span>
          <span className="font-mono text-xl font-black text-rose-600 dark:text-rose-400">{errorCount}</span>
          <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 block mt-0.5">تمنع ظهور المقتطفات</span>
        </div>

        <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-center">
          <span className="text-xs text-amber-700 dark:text-amber-300 block mb-1">توصيات وتحسينات</span>
          <span className="font-mono text-xl font-black text-amber-600 dark:text-amber-400">{warningCount}</span>
          <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 block mt-0.5">خصائص تكميلية موصى بها</span>
        </div>
      </div>

      {/* Summary Note Banner */}
      {analysis && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 mb-5 ${
            errorCount > 0
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200'
              : warningCount > 0
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200'
              : totalFound > 0
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {errorCount > 0 ? (
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : warningCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : totalFound > 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span className="font-medium leading-relaxed">{analysis.summaryAr}</span>
          </div>

          {totalFound > 0 && (
            <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono">
              <span className="text-slate-400 dark:text-slate-500">الأنواع:</span>
              <span className="font-bold">{analysis.detectedTypes.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Interactive Live Validator Drawer / Card */}
      {showTester && (
        <div id="schema-live-tester" className="mb-6 p-4 sm:p-5 bg-indigo-50/40 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                مختبر وتدقيق كود الـ Schema.org (JSON-LD) التفاعلي
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              الصق أي كود أو عدّل الكود الحالي لفحصه فوراً
            </span>
          </div>

          <div>
            <textarea
              rows={7}
              dir="ltr"
              value={testJsonInput}
              onChange={(e) => setTestJsonInput(e.target.value)}
              placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "عنوان المقال",\n  "image": "https://example.com/image.jpg",\n  "datePublished": "2026-03-20T08:00:00Z",\n  "author": { "@type": "Person", "name": "الكاتب" }\n}`}
              className="w-full p-3 font-mono text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting || !testJsonInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTesting ? 'جارِ التدقيق...' : 'تدقيق وفحص الكود الآن'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTestJsonInput('')}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                مسح المدخلات
              </button>
            </div>

            {/* Quick Templates */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">قوالب سريعة:</span>
              <button
                type="button"
                onClick={() => {
                  setTestJsonInput(JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "اسم الموقع الرسمي",
                    "url": pageUrl || "https://example.com",
                    "potentialAction": {
                      "@type": "SearchAction",
                      "target": `${pageUrl || "https://example.com"}/search?q={search_term_string}`,
                      "query-input": "required name=search_term_string"
                    }
                  }, null, 2));
                }}
                className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 font-medium"
              >
                WebSite
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestJsonInput(JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "عنوان المقال الرئيسي",
                    "image": "https://example.com/cover.jpg",
                    "datePublished": "2026-03-15T09:00:00Z",
                    "dateModified": "2026-03-20T11:00:00Z",
                    "author": {
                      "@type": "Person",
                      "name": "اسم الكاتب"
                    },
                    "publisher": {
                      "@type": "Organization",
                      "name": "اسم المجلة أو المدونة",
                      "logo": {
                        "@type": "ImageObject",
                        "url": "https://example.com/logo.png"
                      }
                    }
                  }, null, 2));
                }}
                className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 font-medium"
              >
                Article
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestJsonInput(JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": "اسم المنتج",
                    "image": "https://example.com/product.jpg",
                    "description": "وصف تفصيلي للمنتج",
                    "offers": {
                      "@type": "Offer",
                      "price": "199.00",
                      "priceCurrency": "SAR",
                      "availability": "https://schema.org/InStock"
                    },
                    "aggregateRating": {
                      "@type": "AggregateRating",
                      "ratingValue": "4.8",
                      "reviewCount": "89"
                    }
                  }, null, 2));
                }}
                className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 font-medium"
              >
                Product
              </button>
            </div>
          </div>

          {/* Test Output Panel */}
          {testResult && (
            <div className="pt-3 border-t border-indigo-200/60 dark:border-indigo-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  نتيجة الفحص الفوري:
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    testResult.errorCount > 0
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : testResult.warningCount > 0
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {testResult.errorCount > 0
                    ? `❌ ${testResult.errorCount} خطأ هيكلي`
                    : testResult.warningCount > 0
                    ? `⚠️ صالح مع ${testResult.warningCount} ملاحظات`
                    : '✅ سليم 100% ومطابق لمعايير جوجل'}
                </span>
              </div>

              {testResult.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      @{item.type}
                    </span>
                    <span className="text-[11px] text-slate-500">{item.richResultType}</span>
                  </div>

                  {item.issues.length === 0 ? (
                    <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>الكود خالٍ من أي أخطاء هيكلية ومؤهل فوراً للنتائج المنسقة.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {item.issues.map((issue, issueIdx) => (
                        <div
                          key={issueIdx}
                          className={`p-2 rounded text-[11px] flex items-start gap-2 ${
                            issue.severity === 'error'
                              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200'
                              : issue.severity === 'warning'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                              : 'bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200'
                          }`}
                        >
                          <span className="font-bold shrink-0">
                            {issue.severity === 'error' ? '🔴 خطأ:' : issue.severity === 'warning' ? '🟡 تحذير:' : 'ℹ️ ملاحظة:'}
                          </span>
                          <div className="space-y-0.5">
                            <div>{issue.messageAr}</div>
                            {issue.fixGuideAr && (
                              <div className="opacity-80 font-normal">💡 الحل: {issue.fixGuideAr}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs & Search Info */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            كافة الترميزات ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('errors')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
              activeFilter === 'errors'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
            }`}
          >
            أخطاء هيكلية ({errorCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('warnings')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
              activeFilter === 'warnings'
                ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
            }`}
          >
            تحسينات موصى بها ({warningCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('valid')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
              activeFilter === 'valid'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
            }`}
          >
            سليمة 100% ({validCount})
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          عرض {filteredItems.length} من أصل {items.length} كيان مكتشف
        </span>
      </div>

      {/* Discovered Items List */}
      {items.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              لم يتم العثور على أي ترميز Schema.org (JSON-LD) في هذه الصفحة
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              إضافة البيانات المنظمة تمنح موقعك فرصة الظهور بمقتطفات جذابة في بحث جوجل (مثل النجوم، مسار الروابط، الأسعار، ومربع البحث)، مما يضاعف معدل النقر (CTR).
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowTester(true);
                setTestJsonInput(JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "name": "اسم الموقع الرسمي",
                  "url": pageUrl || "https://example.com"
                }, null, 2));
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>توليد كود Schema لموقعك الآن</span>
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
          لا توجد عناصر تطابق التصفية المحددة.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isExpanded = expandedItems[item.id] ?? true; // expanded by default
            const currentTab = activeTabs[item.id] || 'issues';
            const typeInfo = SCHEMA_TYPE_INFO[item.type];

            return (
              <div
                key={item.id}
                className={`border rounded-xl transition-all overflow-hidden ${
                  !item.isValid
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/10'
                    : item.hasWarnings
                    ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Card Header Accordion Trigger */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 sm:p-4.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getEntityIcon(item.type)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          @{item.type}
                        </span>
                        {item.name && (
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-xs">
                            — {item.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            !item.isValid
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : item.hasWarnings
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {!item.isValid
                            ? 'أخطاء هيكلية ❌'
                            : item.hasWarnings
                            ? 'صالح مع تحسينات ⚠️'
                            : 'سليم ومؤهل 100% ✅'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {item.richResultType || typeInfo?.richResultTypeAr || 'بيانات منظمة'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadSnippetIntoTester(item.rawJson);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="فتح الكود في المحرر التفاعلي للتعديل والتدقيق"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 space-y-4">
                    {/* Sub-Tabs: Issues vs Code vs Properties */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setItemTab(item.id, 'issues')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            currentTab === 'issues'
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                          }`}
                        >
                          الفحص الهيكلي والأخطاء ({item.issues.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemTab(item.id, 'code')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            currentTab === 'code'
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                          }`}
                        >
                          كود JSON-LD الخام
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemTab(item.id, 'props')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            currentTab === 'props'
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                          }`}
                        >
                          الخصائص المستخرجة
                        </button>
                      </div>

                      {/* Action buttons inside card */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.rawJson, item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>نسخ الكود</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => loadSnippetIntoTester(item.rawJson)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-100 transition-colors"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>تعديل واختبار</span>
                        </button>
                      </div>
                    </div>

                    {/* Tab 1: Structural Issues & Findings */}
                    {currentTab === 'issues' && (
                      <div className="space-y-3">
                        {item.issues.length === 0 ? (
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div>
                              <span className="font-bold block">هيكل الـ Schema متكامل وخالٍ من الأخطاء!</span>
                              <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                                هذا الكائن مؤهل بالكامل لظهور النتائج المنسقة (Rich Results) في محرك بحث جوجل.
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {item.issues.map((issue, idx) => (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                                  issue.severity === 'error'
                                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-100'
                                    : issue.severity === 'warning'
                                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-100'
                                    : 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60 text-sky-900 dark:text-sky-100'
                                }`}
                              >
                                <span className="shrink-0 mt-0.5">
                                  {issue.severity === 'error' ? (
                                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                  ) : issue.severity === 'warning' ? (
                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                  ) : (
                                    <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                  )}
                                </span>

                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold">
                                      {issue.severity === 'error'
                                        ? 'خطأ هيكلي حرج'
                                        : issue.severity === 'warning'
                                        ? 'تحسين موصى به'
                                        : 'ملاحظة توثيقية'}
                                    </span>
                                    {issue.property && (
                                      <span className="font-mono text-[11px] px-1.5 py-0.2 bg-white/80 dark:bg-black/30 rounded border border-current opacity-90">
                                        الحقل: {issue.property}
                                      </span>
                                    )}
                                  </div>
                                  <p className="leading-relaxed">{issue.messageAr}</p>
                                  {issue.fixGuideAr && (
                                    <div className="pt-1 text-[11px] font-medium opacity-90 flex items-start gap-1">
                                      <span>💡</span>
                                      <span>{issue.fixGuideAr}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Missing Recommended/Required Checklist */}
                        {(item.requiredFieldsMissing?.length ?? 0) > 0 || (item.recommendedFieldsMissing?.length ?? 0) > 0 ? (
                          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              قائمة الحقول والخصائص:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              {item.requiredFieldsMissing && item.requiredFieldsMissing.length > 0 && (
                                <div className="p-2 bg-rose-50/50 dark:bg-rose-950/30 rounded border border-rose-100 dark:border-rose-900/40">
                                  <span className="font-bold text-rose-700 dark:text-rose-300 block mb-1">
                                    حقول إلزامية مفقودة:
                                  </span>
                                  <ul className="list-disc list-inside space-y-0.5 text-rose-600 dark:text-rose-400 font-mono">
                                    {item.requiredFieldsMissing.map((f, i) => (
                                      <li key={i}>{f}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {item.recommendedFieldsMissing && item.recommendedFieldsMissing.length > 0 && (
                                <div className="p-2 bg-amber-50/50 dark:bg-amber-950/30 rounded border border-amber-100 dark:border-amber-900/40">
                                  <span className="font-bold text-amber-700 dark:text-amber-300 block mb-1">
                                    حقول موصى بها تزيد من فرصة التميز:
                                  </span>
                                  <ul className="list-disc list-inside space-y-0.5 text-amber-600 dark:text-amber-400 font-mono">
                                    {item.recommendedFieldsMissing.map((f, i) => (
                                      <li key={i}>{f}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Tab 2: Raw Code View */}
                    {currentTab === 'code' && (
                      <div className="space-y-2">
                        <div className="relative">
                          <pre
                            dir="ltr"
                            className="p-4 bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-slate-200 font-mono text-xs rounded-xl overflow-x-auto max-h-80 leading-relaxed text-left border border-slate-800"
                          >
                            <code>{item.rawJson}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Parsed Properties Key-Value Table */}
                    {currentTab === 'props' && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                        {item.parsedData ? (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {Object.entries(item.parsedData).map(([key, val], idx) => (
                              <div key={idx} className="p-2.5 flex items-start gap-4">
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 w-36 shrink-0 dir-ltr text-left">
                                  {key}
                                </span>
                                <span className="font-mono text-slate-700 dark:text-slate-300 break-all dir-ltr text-left flex-1">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-slate-400">
                            لا تتوفر خصائص مهيكلة بسبب خطأ في كود الـ JSON.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
