import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Layers,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  Code2,
  Image as ImageIcon,
  Check,
  History,
  Trash2,
  ChevronDown,
  X,
  Zap,
  Mic
} from 'lucide-react';
import { loadAuditorNotes } from './utils/auditorVoiceNotes';
import { Navbar } from './components/Navbar';
import { ScoreGauge } from './components/ScoreGauge';
import { SerpPreview } from './components/SerpPreview';
import { SocialPreview } from './components/SocialPreview';
import { HeadingsVisualizer } from './components/HeadingsVisualizer';
import { AuditItemCard } from './components/AuditItemCard';
import { AiConsultantCard } from './components/AiConsultantCard';
import { AuditHistoryChart } from './components/AuditHistoryChart';
import { CodeGeneratorSection } from './components/CodeGeneratorSection';
import { AuditResult, AuditStatus, AuditItem } from './types/seo';
import { SAMPLE_AUDITS } from './data/samples';
import { exportReportToPdf } from './utils/pdfExport';
import { StaticPageModal, StaticPageType } from './components/StaticPageModal';
import { SocialShareBar } from './components/SocialShareBar';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { HelpTooltip } from './components/HelpTooltip';
import { ReportComparisonModal, SavedReportItem } from './components/ReportComparisonModal';
import { JsonExportModal } from './components/JsonExportModal';
import { PendingChecklistExportModal } from './components/PendingChecklistExportModal';
import { MobilePreview } from './components/MobilePreview';
import { KeywordDensityCard } from './components/KeywordDensityCard';
import { BrokenLinksChecker } from './components/BrokenLinksChecker';
import { SchemaInspector } from './components/SchemaInspector';
import { CoreWebVitalsSection } from './components/CoreWebVitalsSection';
import { InternalLinkingAnalyzer } from './components/InternalLinkingAnalyzer';
import { CrawlSimulator } from './components/CrawlSimulator';
import { SecurityHeadersAnalyzer } from './components/SecurityHeadersAnalyzer';
import { ScheduledAuditCard } from './components/ScheduledAuditCard';
import { ScheduledAuditsModal } from './components/ScheduledAuditsModal';
import { HighIntentKeywordsSection } from './components/HighIntentKeywordsSection';
import { KeywordOpportunityVisualizer } from './components/KeywordOpportunityVisualizer';
import { CriticalAuditToast } from './components/CriticalAuditToast';
import { detectCriticalErrors, CriticalAnalysisResult } from './utils/criticalErrorsDetector';
import { CustomCategoriesModal } from './components/CustomCategoriesModal';
import {
  CustomCategory,
  loadCustomCategories,
  saveCustomCategories,
  getCategoryColorClasses
} from './utils/customCategoriesStorage';
import { Bookmark, BookmarkCheck, GitCompare, FileCode, FileSpreadsheet, Smartphone, Wrench, Unlink, Gauge, CheckSquare, ListTodo, Network, ShieldCheck, CalendarClock, TrendingUp, RotateCcw, CheckCheck, Tag, Plus, Filter, Bot, Cloud, Flame } from 'lucide-react';
import { SubNavbar } from './components/SubNavbar';
import { FaqSection } from './components/FaqSection';
import { SeoMasteryContentSection } from './components/SeoMasteryContentSection';
import { useLanguage } from './context/LanguageContext';
import { apiFetch, parseJsonSafely } from './utils/apiConfig';

// Assets
const heroBanner = '/src/assets/images/hero_audit_preview_1791822043693.jpg';
const techImg = '/src/assets/images/audit_feature_technical_1791822054303.jpg';
const contentImg = '/src/assets/images/audit_feature_content_1791822064933.jpg';

interface RecentAuditUrl {
  url: string;
  score?: number;
  timestamp: number;
}

export default function App() {
  const { t, currentLanguage, isRtl, setLanguage } = useLanguage();
  const [urlInput, setUrlInput] = useState('');
  const [enableAi, setEnableAi] = useState(true);
  const [turboMode, setTurboMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<AuditResult | null>(SAMPLE_AUDITS.blog);
  const [statusFilter, setStatusFilter] = useState<'all' | AuditStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedShare, setCopiedShare] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [staticPageModal, setStaticPageModal] = useState<{ isOpen: boolean; page: StaticPageType }>({
    isOpen: false,
    page: 'about'
  });
  const [recentUrls, setRecentUrls] = useState<RecentAuditUrl[]>([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const historyDropdownRef = useRef<HTMLDivElement>(null);

  // Saved reports for side-by-side comparison
  const [savedReports, setSavedReports] = useState<SavedReportItem[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [justSavedNotification, setJustSavedNotification] = useState<string | null>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isPendingChecklistModalOpen, setIsPendingChecklistModalOpen] = useState(false);
  const [isScheduledAuditsModalOpen, setIsScheduledAuditsModalOpen] = useState(false);
  const [isQuickFixMode, setIsQuickFixMode] = useState(false);
  const [locallyCompletedIds, setLocallyCompletedIds] = useState<Record<string, boolean>>({});
  const [previewTab, setPreviewTab] = useState<'mobile' | 'serp' | 'social' | 'all'>('mobile');
  const [auditorNotesTotalCount, setAuditorNotesTotalCount] = useState(0);
  const [criticalToast, setCriticalToast] = useState<{
    isOpen: boolean;
    analysis: CriticalAnalysisResult | null;
    siteUrl: string;
  } | null>(null);

  const handleJumpToCriticalItem = (itemId: string) => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setTimeout(() => {
      const el = document.getElementById(`audit-item-${itemId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-rose-500', 'ring-offset-4', 'transition-all');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-rose-500', 'ring-offset-4');
        }, 3000);
      } else {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  // Custom Categories State & Handlers
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isCustomCategoriesModalOpen, setIsCustomCategoriesModalOpen] = useState(false);
  const [customCategoryFilter, setCustomCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (auditData?.items) {
      const loaded = loadCustomCategories(auditData.items);
      setCustomCategories(loaded);
    }
  }, [auditData?.url]);

  const handleSaveCustomCategories = (updatedCategories: CustomCategory[]) => {
    setCustomCategories(updatedCategories);
    saveCustomCategories(updatedCategories);
  };

  const handleToggleCategoryAssignment = (categoryId: string, itemId: string) => {
    const updated = customCategories.map((cat) => {
      if (cat.id === categoryId) {
        const hasItem = cat.itemIds.includes(itemId);
        return {
          ...cat,
          itemIds: hasItem ? cat.itemIds.filter((id) => id !== itemId) : [...cat.itemIds, itemId]
        };
      }
      return cat;
    });
    handleSaveCustomCategories(updated);
  };

  useEffect(() => {
    const updateCount = () => {
      const notes = loadAuditorNotes(auditData?.url);
      setAuditorNotesTotalCount(Object.keys(notes).length);
    };
    updateCount();
    window.addEventListener('rasid-auditor-note-updated', updateCount);
    return () => window.removeEventListener('rasid-auditor-note-updated', updateCount);
  }, [auditData?.url]);

  // Load recent URLs & Saved comparison reports from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rasid_recent_audits');
      if (raw) {
        setRecentUrls(JSON.parse(raw));
      } else {
        const initial: RecentAuditUrl[] = [
          { url: 'https://al-arabi-tech.blog', score: 84, timestamp: Date.now() - 3600000 },
          { url: 'https://al-boutique-store.com', score: 59, timestamp: Date.now() - 7200000 }
        ];
        setRecentUrls(initial);
        localStorage.setItem('rasid_recent_audits', JSON.stringify(initial));
      }

      // Load saved comparison reports or initialize with meaningful baseline pair for instant testing
      const rawReports = localStorage.getItem('rasid_saved_comparison_reports');
      if (rawReports) {
        setSavedReports(JSON.parse(rawReports));
      } else {
        // Prepare preloaded baseline & optimized versions of the tech blog
        const baselineDate = new Date();
        baselineDate.setDate(baselineDate.getDate() - 7);
        const baselineReport: AuditResult = {
          ...SAMPLE_AUDITS.blog,
          analyzedAt: baselineDate.toISOString(),
          overallScore: 68,
          loadTimeMs: 780,
          items: SAMPLE_AUDITS.blog.items.map((it) => {
            if (it.id === 'images_alt') {
              return {
                ...it,
                status: 'error',
                score: 40,
                currentValue: '14 صورة بدون وسوم alt كافية'
              };
            }
            if (it.id === 'csp_header') {
              return {
                ...it,
                status: 'error',
                score: 30,
                currentValue: 'ترويسة CSP مفقودة'
              };
            }
            if (it.id === 'headings_h1') {
              return {
                ...it,
                status: 'warning',
                score: 60,
                currentValue: 'عناوين H1 متعددة وغير دقيقة'
              };
            }
            return it;
          })
        };

        const initialSaved: SavedReportItem[] = [
          {
            id: 'report-baseline-1',
            name: 'تقرير ما قبل التحسين (Baseline)',
            timestamp: baselineDate.getTime(),
            data: baselineReport
          },
          {
            id: 'report-current-2',
            name: 'تقرير بعد تطبيق التوصيات (الحالي)',
            timestamp: Date.now(),
            data: SAMPLE_AUDITS.blog
          }
        ];
        setSavedReports(initialSaved);
        localStorage.setItem('rasid_saved_comparison_reports', JSON.stringify(initialSaved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveCurrentReportForComparison = (customName?: string) => {
    if (!auditData) return;
    const name =
      customName ||
      `تقرير فحص (${new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`;
    const newItem: SavedReportItem = {
      id: `report-${Date.now()}`,
      name,
      timestamp: Date.now(),
      data: { ...auditData }
    };

    setSavedReports((prev) => {
      const updated = [newItem, ...prev].slice(0, 10);
      try {
        localStorage.setItem('rasid_saved_comparison_reports', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setJustSavedNotification(`تم حفظ التقرير بنجاح! يمكنك الآن مقارنته مع أي تقرير سابق.`);
    setTimeout(() => {
      setJustSavedNotification(null);
    }, 4000);
  };

  const deleteSavedReport = (id: string) => {
    setSavedReports((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('rasid_saved_comparison_reports', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(e.target as Node)) {
        setShowHistoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToRecent = (urlToSave: string, score?: number) => {
    if (!urlToSave || !urlToSave.trim()) return;
    const clean = urlToSave.trim();
    setRecentUrls((prev) => {
      const filtered = prev.filter((item) => item.url.toLowerCase() !== clean.toLowerCase());
      const updated = [{ url: clean, score, timestamp: Date.now() }, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('rasid_recent_audits', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const removeRecentItem = (e: React.MouseEvent, targetUrl: string) => {
    e.stopPropagation();
    setRecentUrls((prev) => {
      const updated = prev.filter((item) => item.url !== targetUrl);
      try {
        localStorage.setItem('rasid_recent_audits', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearRecentHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentUrls([]);
    try {
      localStorage.removeItem('rasid_recent_audits');
    } catch {
      // ignore
    }
  };

  const handleSelectRecentUrl = (selectedUrl: string) => {
    setUrlInput(selectedUrl);
    setShowHistoryDropdown(false);
    handleRunAudit(selectedUrl);
  };

  const openStaticPage = (page: StaticPageType) => {
    setStaticPageModal({ isOpen: true, page });
  };

  const loadingSteps = [
    'جاري الاتصال بالخادم وفحص استجابة الرابط (HTTP Status)...',
    'جاري تحليل شفرة HTML وفحص وسوم الميتا وعناوين H1-H6...',
    'جاري اختبار ملف Robots.txt وخريطة الموقع Sitemap.xml...',
    'جاري فحص جميع صور الموقع والتأكد من وسوم النصوص البديلة (Alt)...',
    'جاري صياغة استشارة الذكاء الاصطناعي وخطة الترتيب في جوجل...'
  ];

  // Audit Request Handler
  const handleRunAudit = async (customUrl?: string, forceRefresh = false) => {
    const target = customUrl || urlInput;
    if (!target.trim()) {
      setErrorMsg('يرجى كتابة رابط الموقع أو المدونة للبدء');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setLoadingStep(0);

    // Ultra-fast step animation interval (200ms)
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 200);

    try {
      const resp = await apiFetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, enableAi, turboMode, forceRefresh })
      });

      const parsed = await parseJsonSafely(resp);
      clearInterval(stepInterval);

      if (parsed.isHtmlOrTextError || !parsed.data) {
        setErrorMsg(
          parsed.status === 404
            ? 'نقطة الفحص (/api/audit) غير مفعّلة على الخادم الحالي. تأكد من رفع ملفات الخادم (api/index.ts و vercel.json) أو ضبط عنوان الخادم.'
            : `استجاب خادم الفحص برمز خطأ (${parsed.status}). يرجى المحاولة مرة أخرى.`
        );
        return;
      }

      const data = parsed.data;
      if (data.success && data.data) {
        setAuditData(data.data);
        setUrlInput(data.data.url);
        saveToRecent(data.data.url, data.data.overallScore);

        // Check for critical SEO & Security issues immediately upon audit completion!
        const criticalAnalysis = detectCriticalErrors(data.data);
        if (criticalAnalysis.hasCriticalErrors) {
          setCriticalToast({
            isOpen: true,
            analysis: criticalAnalysis,
            siteUrl: data.data.url
          });
        } else {
          setCriticalToast(null);
        }

        // scroll down smoothly to results
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setErrorMsg(data.error || 'حدث خطأ أثناء فحص الموقع. يرجى التأكد من الرابط والمحاولة مجدداً.');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg('تعذر الاتصال بخادم الفحص. يرجى التحقق من اتصال الإنترنت.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sampleKey: string) => {
    const sample = SAMPLE_AUDITS[sampleKey];
    if (sample) {
      setAuditData(sample);
      setUrlInput(sample.url);
      saveToRecent(sample.url, sample.overallScore);
      setErrorMsg(null);

      // Check for critical SEO & Security issues immediately upon sample selection!
      const criticalAnalysis = detectCriticalErrors(sample);
      if (criticalAnalysis.hasCriticalErrors) {
        setCriticalToast({
          isOpen: true,
          analysis: criticalAnalysis,
          siteUrl: sample.url
        });
      } else {
        setCriticalToast(null);
      }

      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!auditData) return;
    setIsExportingPdf(true);
    setErrorMsg(null);
    try {
      let domain = 'website';
      try {
        domain = new URL(auditData.url).hostname;
      } catch {
        domain = auditData.url.replace(/^https?:\/\//, '').split('/')[0] || 'website';
      }
      await exportReportToPdf({
        elementId: 'results-section',
        domainName: domain
      });
    } catch (err: any) {
      console.error('PDF export error:', err);
      setErrorMsg('حدث خطأ أثناء تصدير ملف PDF، يمكنك استخدام خيار الطباعة المباشرة.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Quick Fix Mode interactive calculations & completion tracking
  const totalPendingItems = useMemo<AuditItem[]>(() => {
    return auditData?.items.filter((i: AuditItem) => i.status !== 'pass') || [];
  }, [auditData]);

  const totalPendingCount = totalPendingItems.length;

  const locallyCompletedCount = useMemo<number>(() => {
    return totalPendingItems.filter((i: AuditItem) => locallyCompletedIds[i.id]).length;
  }, [totalPendingItems, locallyCompletedIds]);

  const quickFixProgressPercent = totalPendingCount > 0
    ? Math.round((locallyCompletedCount / totalPendingCount) * 100)
    : 0;

  const baseScore = auditData?.overallScore || 0;
  const projectedScore = totalPendingCount > 0
    ? Math.min(100, Math.round(baseScore + ((100 - baseScore) * (locallyCompletedCount / totalPendingCount))))
    : baseScore;

  const handleToggleCompleteItem = (itemId: string) => {
    setLocallyCompletedIds((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleResetLocallyCompleted = () => {
    setLocallyCompletedIds({});
  };

  const handleMarkAllCompleted = () => {
    const next: Record<string, boolean> = {};
    totalPendingItems.forEach((it: AuditItem) => {
      next[it.id] = true;
    });
    setLocallyCompletedIds(next);
  };

  // Filtered items (hiding passed results in Quick Fix Mode and filtering by custom category)
  const filteredItems = auditData?.items.filter((item) => {
    if (isQuickFixMode) {
      if (item.status === 'pass') return false;
    } else {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    }
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

    // Custom Category Filter
    if (customCategoryFilter !== 'all') {
      if (customCategoryFilter === 'unassigned') {
        const isAssigned = customCategories.some((c) => c.itemIds.includes(item.id));
        if (isAssigned) return false;
      } else {
        const cat = customCategories.find((c) => c.id === customCategoryFilter);
        if (!cat || !cat.itemIds.includes(item.id)) return false;
      }
    }

    return true;
  }) || [];

  const criticalErrorsCount = auditData?.items.filter((i) => i.status === 'error').length || 0;
  const warningsCount = auditData?.items.filter((i) => i.status === 'warning').length || 0;
  const passedCount = auditData?.items.filter((i) => i.status === 'pass').length || 0;
  const pendingItemsCount = criticalErrorsCount + warningsCount;

  return (
    <div className="min-w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <Navbar
        onNewAuditClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          document.getElementById('audit-input')?.focus();
        }}
        onToolsClick={() => {
          document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onCompareClick={() => setIsCompareModalOpen(true)}
        onScheduledAuditsClick={() => setIsScheduledAuditsModalOpen(true)}
        savedReportsCount={savedReports.length}
      />

      {/* Secondary Sub-Navbar Menu: الرئيسية، تقرير الفحص، مولد الأكواد، دليل السيو */}
      <SubNavbar
        onHomeClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onReportClick={() => {
          if (auditData) {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            loadSample('blog');
          }
        }}
        onCodeGenClick={() => {
          if (auditData) {
            document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            loadSample('blog');
            setTimeout(() => {
              document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 200);
          }
        }}
        onGuideClick={() => {
          document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onFixGuideClick={() => {
          if (auditData) {
            document.getElementById('seo-checklist-section')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onFaqClick={() => {
          document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        hasAuditData={!!auditData}
        auditScore={auditData?.overallScore}
      />

      {/* Top Language Alert Banner when non-Arabic is active */}
      {currentLanguage.code !== 'ar' && (
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 text-xs flex items-center justify-between transition-colors shadow-xs z-30">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">{currentLanguage.flag}</span>
            <span>
              {t('banner.viewing_in', 'يتم عرض الموقع حالياً باللغة:')}{' '}
              <strong className="underline underline-offset-2">{currentLanguage.name} ({currentLanguage.nameAr})</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className="text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {t('banner.switch_back_ar', 'العودة للغة العربية 🇸🇦')}
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-12 pb-16 lg:pt-16 lg:pb-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col (Text & Search Input) */}
            <div className="lg:col-span-7">
              {/* Domain Trust Marker */}
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block" />
                <span>{t('hero.badge', 'المنصة الرائدة لفحص وتدقيق أخطاء السيو والمواقع والمدونات 2026')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.25] text-balance">
                {t('hero.title_start', 'افحص موقعك ومدونتك واكتشف الأخطاء التي تعيق تصدرك في')}{' '}
                <span className="text-indigo-600 dark:text-indigo-400">{t('hero.title_target', 'جوجل')}</span>
              </h1>

              <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {t('hero.desc', 'أداة متكاملة لتحليل السيو الداخلي (On-Page SEO)، والسرعة، وهيكل العناوين H1-H6، ووسوم الميتا، وفحص ملفات الروبوتات وخريطة الموقع مع توليد فوري للأكواد واستشارة ذكاء اصطناعي ذكية.')}
              </p>

              {/* URL Input Form */}
              <div className="mt-8 bg-slate-50 dark:bg-slate-950 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRunAudit();
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <div className="relative flex-1" ref={historyDropdownRef}>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Globe className="w-5 h-5" />
                    </div>
                    <input
                      id="audit-input"
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onFocus={() => {
                        if (recentUrls.length > 0) setShowHistoryDropdown(true);
                      }}
                      placeholder={t('hero.input_placeholder', 'أدخل رابط موقعك أو مدونتك (مثال: example.com)')}
                      className="w-full pl-24 pr-11 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-white font-mono placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      disabled={isLoading}
                    />

                    {/* History Dropdown Toggle Button */}
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          showHistoryDropdown
                            ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                            : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="آخر 5 روابط تم فحصها"
                      >
                        <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="hidden sm:inline text-[11px]">السجل ({recentUrls.length})</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showHistoryDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Dropdown Menu */}
                    {showHistoryDropdown && (
                      <div className="absolute top-full right-0 left-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>آخر 5 روابط تم فحصها (محفوظة محلياً)</span>
                          </span>
                          {recentUrls.length > 0 && (
                            <button
                              type="button"
                              onClick={clearRecentHistory}
                              className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>مسح السجل</span>
                            </button>
                          )}
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                          {recentUrls.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                              لا توجد روابط سابقة في السجل حتى الآن.
                            </div>
                          ) : (
                            recentUrls.slice(0, 5).map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleSelectRecentUrl(item.url)}
                                className="flex items-center justify-between gap-3 p-3 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Globe className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                                  <span className="text-xs font-mono text-slate-800 dark:text-slate-200 font-medium truncate dir-ltr text-right" dir="ltr">
                                    {item.url}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {typeof item.score === 'number' && (
                                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded tabular-nums ${
                                      item.score >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                                      item.score >= 60 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                                      'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                    }`}>
                                      {item.score}%
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => removeRecentItem(e, item.url)}
                                    className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded transition-colors"
                                    title="حذف من السجل"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-950 cursor-pointer shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t('hero.auditing', 'جاري الفحص...')}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>{t('hero.audit_btn', 'فحص وتدقيق الموقع')}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Sub Options & Sample Presets */}
                <div className="mt-3 px-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800/60">
                      <input
                        type="checkbox"
                        checked={turboMode}
                        onChange={(e) => setTurboMode(e.target.checked)}
                        className="rounded border-amber-300 dark:border-amber-700 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 bg-white dark:bg-slate-900"
                      />
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        {t('hero.turbo_mode', 'فحص فائق السرعة (Turbo ⚡)')}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
                      <input
                        type="checkbox"
                        checked={enableAi}
                        onChange={(e) => setEnableAi(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-white dark:bg-slate-900"
                      />
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{t('hero.ai_toggle', 'استشارة الذكاء الاصطناعي (Gemini)')}</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 dark:text-slate-500">{t('hero.sample_title', 'أو جرب نموذجاً جاهزاً:')}</span>
                    <button
                      type="button"
                      onClick={() => loadSample('blog')}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold cursor-pointer underline underline-offset-2"
                    >
                      {t('sample.blog', 'مدونة تقنية')}
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <button
                      type="button"
                      onClick={() => loadSample('ecommerce_issues')}
                      className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-semibold cursor-pointer underline underline-offset-2"
                    >
                      {t('sample.critical', 'متجر به أخطاء حرجة')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Quick Feature Proof Indicators */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4 text-slate-600 dark:text-slate-400 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-base font-mono tabular-nums">50+</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">معيار سيو وتقني يتم فحصه</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-base font-mono tabular-nums">100%</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">مجاني بدون قيود أو تسجيل</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-base font-mono tabular-nums">&lt; 3 ثوانٍ</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">سرعة استخراج التقرير الشامل</span>
                </div>
              </div>
            </div>

            {/* Right Col: Visual Mockup / Hero Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
                <img
                  src={heroBanner}
                  alt="لوحة فحص أخطاء المواقع راصد سيو"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white">
                    <p className="text-xs font-mono text-indigo-300">الرصد الفوري والتقارير الاحترافية</p>
                    <p className="text-sm font-bold mt-0.5">تحليل شامل يعادل أدوات السيو العالمية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading Progress State */}
      {isLoading && (
        <section className="max-w-4xl mx-auto px-4 py-12 w-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center transition-colors">
            <RefreshCw className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">جاري فحص وتدقيق الموقع بدقة عالية...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">نقوم بزحف الصفحات وتحليل الترويسات ومقارنتها بأحدث معايير محركات البحث</p>

            <div className="max-w-md mx-auto space-y-3">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                />
              </div>
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 font-mono animate-pulse">
                {loadingSteps[loadingStep]}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Audit Results Dashboard */}
      {!isLoading && auditData && (
        <main id="results-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          {/* Notification when report is saved for comparison */}
          {justSavedNotification && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2.5 text-xs font-bold">
                <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{justSavedNotification}</span>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                فتح المقارنة الآن
              </button>
            </div>
          )}

          {/* Audit Header Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t('audit.report_title', 'تقرير فحص سيو الموقع')}
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {auditData.statusCode} OK
                  </span>
                  {auditData.isHttps && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>{t('audit.https_secure', 'HTTPS مشفر')}</span>
                    </span>
                  )}
                  {auditData.isCached && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1" title="استجابة فائقة السرعة بفضل التخزين المؤقت في الذاكرة">
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>ذاكرة سريعة (&lt;10ms)</span>
                    </span>
                  )}
                  {auditData.isTurboMode && !auditData.isCached && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                      <span>تيربو موازي ⚡</span>
                    </span>
                  )}
                </div>
                <a
                  href={auditData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 dir-ltr text-right"
                  dir="ltr"
                >
                  <span>{auditData.url}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                  {t('score.audit_date', 'تاريخ الفحص:')} {new Date(auditData.analyzedAt).toLocaleString(isRtl ? 'ar-EG' : currentLanguage.code, { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Force Re-audit Button */}
              <button
                onClick={() => handleRunAudit(auditData.url, true)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                title="إعادة فحص الموقع وتحديث النتائج فورياً"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
                <span>إعادة فحص مباشر</span>
              </button>

              {/* Save Report for Comparison Button */}
              <button
                onClick={() => saveCurrentReportForComparison()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-xs cursor-pointer"
                title="حفظ هذا التقرير لمقارنته لاحقاً بعد إجراء التحسينات"
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t('action.save', 'حفظ التقرير للمقارنة')}</span>
              </button>

              {/* Compare Modal Opener Button */}
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-all shadow-xs shadow-emerald-200 dark:shadow-emerald-950 cursor-pointer"
                title="مقارنة تقريرين لنفس الموقع جنباً إلى جنب"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>{t('nav.compare_reports', 'مقارنة تقريرين')} ({savedReports.length})</span>
              </button>

              {/* Scheduled Audit Opener Button */}
              <button
                onClick={() => setIsScheduledAuditsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all shadow-xs shadow-purple-200 dark:shadow-purple-950 cursor-pointer"
                title="جدولة فحص دوري بالبريد الإلكتروني وتنبيهات تلقائية"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                <span>{t('nav.schedule_audit', 'جدولة فحص دوري')}</span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 disabled:opacity-70 rounded-lg transition-all shadow-xs shadow-indigo-200 dark:shadow-indigo-950 cursor-pointer"
              >
                {isExportingPdf ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('action.export_pdf', 'جاري تصدير PDF...')}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('action.export_pdf', 'تصدير PDF')}</span>
                  </>
                )}
              </button>

              {/* Export JSON Button for Sheets / Excel */}
              <button
                onClick={() => setIsJsonModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t('action.export_json', 'تصدير JSON')}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              >
                <span>{isRtl ? 'طباعة' : 'Print'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">{isRtl ? 'تم النسخ!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t('action.share', 'مشاركة')}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleRunAudit()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إعادة الفحص' : 'Re-audit'}</span>
              </button>
            </div>
          </div>

          {/* Core Scoreboard Strip */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Overall Score Gauge Box */}
            <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center transition-colors">
              <ScoreGauge score={auditData.overallScore} size="lg" label={t('score.overall_score', 'تقييم السيو العام')} />
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-around text-center text-xs">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t('score.load_time', 'سرعة الاستجابة')}</span>
                    <HelpTooltip content={isRtl ? "زمن استجابة الخادم (TTFB): الوقت المستغرق لاستلام أول بايت من بيانات الموقع. القيمة المثالية أقل من 600ms لتجنب عقوبات البطء في جوجل." : "Server response time (TTFB): Time taken to receive the first byte. Ideal is below 600ms."} />
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{auditData.loadTimeMs}ms</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t('score.page_size', 'حجم الصفحة')}</span>
                    <HelpTooltip content={isRtl ? "حجم شفرة HTML المنقولة. كلما قل الحجم، كان استهلاك باقات الهواتف أقل والتحميل أسرع للقراء." : "Transferred HTML size. Lighter pages load faster on mobile networks."} />
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{auditData.pageSizeKb} KB</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">{t('score.word_count', 'عدد الكلمات')}</span>
                    <HelpTooltip content={isRtl ? "كثافة المحتوى النصي: المقالات الغنية التي تتجاوز 600 كلمة تحظى بفرص تصدر أعلى في خوارزميات المحتوى المفيد (Helpful Content)." : "Text content density: rich content exceeding 600 words gains ranking advantages in search algorithms."} />
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{auditData.wordCount} {isRtl ? 'كلمة' : 'words'}</span>
                </div>
              </div>
            </div>

            {/* Status Breakdown Strips */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Critical Errors */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'error' ? 'all' : 'error')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  statusFilter === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 ring-2 ring-rose-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50/20 dark:hover:bg-rose-950/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                    {isRtl ? 'أولوية قصوى' : 'High Priority'}
                  </span>
                </div>
                <span className="font-mono text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                  {criticalErrorsCount}
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{t('filter.errors', 'أخطاء حرجة يجب إصلاحها')}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {isRtl ? 'تمنع خوارزميات جوجل من فهرسة وفهم صفحاتك بدقة.' : 'Blocks search engines from accurately indexing your pages.'}
                </p>
                {criticalErrorsCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/70 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>{isRtl ? 'دليل إصلاح الأخطاء 2026' : 'Fix Guide 2026'}</span>
                  </button>
                )}
              </div>

              {/* Warnings */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'warning' ? 'all' : 'warning')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  statusFilter === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50/20 dark:hover:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    {isRtl ? 'فرص تحسين' : 'Improvement'}
                  </span>
                </div>
                <span className="font-mono text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                  {warningsCount}
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{t('filter.warnings', 'تنبيهات وملاحظات')}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {isRtl ? 'نقاط تؤثر على الأداء ونسبة النقر CTR وتجربة القارئ.' : 'Impacts site speed, CTR, and visitor experience.'}
                </p>
                {warningsCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/70 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{isRtl ? 'دليل المعالجة والتطوير' : 'Optimization Guide'}</span>
                  </button>
                )}
              </div>

              {/* Passed */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'pass' ? 'all' : 'pass')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  statusFilter === 'pass'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {isRtl ? 'متطابق' : 'Passed'}
                  </span>
                </div>
                <span className="font-mono text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                  {passedCount}
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{t('filter.passed', 'اختبارات ناجحة وسليمة')}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {isRtl ? 'تتوافق تماماً مع المعايير القياسية لمحركات البحث.' : 'Fully complies with standard search engine criteria.'}
                </p>
              </div>
            </div>
          </div>

          {/* AI Consultant Strategy Panel */}
          {auditData.aiAdvice && (
            <AiConsultantCard advice={auditData.aiAdvice} />
          )}

          {/* Category Score Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(auditData.categories).map(([key, cat]) => {
              const isActive = categoryFilter === key;
              const catExplanations: Record<string, string> = {
                onpage: 'السيو الداخلي: تهيئة ترويسة HTML، وعنوان الصفحة Title، والوصف، وعناوين H1-H6، والرابط المعياري.',
                technical: 'السيو التقني: فحص الروابط الخارجية المعطلة (Broken Links 404)، وملف الروبوتات robots.txt، وخريطة الموقع sitemap.xml، وتجاوب الشاشات.',
                content: 'المحتوى والوسائط: كثافة الكلمات المفتاحية، وتوفر النصوص البديلة للصور (Alt)، وفحص الروابط الداخلية والخارجية.',
                performance: 'السرعة والأداء: قياس زمن استجابة الخادم الأولية (TTFB) وخفة حجم الصفحة وفق مؤشرات أداء الويب Core Web Vitals.',
                security: 'الأمان والتشفير: اتصال HTTPS المشفر، وشهادة SSL، وترويسات الحماية HSTS و CSP لمنع الهجمات.',
                social: 'البيانات المنظمة والتواصل: فحص ترميزات Schema.org (JSON-LD) المطبقة وكشف الأخطاء الهيكلية، ووسوم بطاقات Open Graph للمقتطفات الغنية.'
              };

              return (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(isActive ? 'all' : key)}
                  data-tooltip-id="seo-tooltip"
                  data-tooltip-content={catExplanations[key] || (isRtl ? cat.nameAr : (cat.name || cat.nameAr))}
                  className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isRtl ? cat.nameAr : (cat.name || cat.nameAr)}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">{cat.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>{cat.passedCount} {isRtl ? 'ناجح' : 'pass'}</span>
                    <span className={cat.errorCount > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                      {cat.errorCount} {isRtl ? 'خطأ' : 'err'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Deep-Dive Tools Jump Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isRtl ? 'الأدوات المتقدمة:' : 'Deep Audit Tools:'}</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => document.getElementById('core-web-vitals-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-semibold hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Gauge className="w-3.5 h-3.5 text-amber-500" />
                <span>مؤشرات أداء الويب (LCP, FID, CLS)</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('internal-linking-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 font-semibold hover:bg-teal-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Network className="w-3.5 h-3.5 text-teal-500" />
                <span>هيكل الروابط الداخلية (Topic Clusters)</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('security-headers-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 font-semibold hover:bg-cyan-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span>ترويسات الأمان (CSP & HSTS)</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('seo-checklist-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>قائمة التحقق والمهام ({pendingItemsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('social-schema-inspector')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                <span>فاحص الـ Schema.org</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('technical-seo-broken-links')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-semibold hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Unlink className="w-3.5 h-3.5 text-rose-500" />
                <span>فاحص الروابط الخارجية (External Link Checker 404)</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('scheduled-audits-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-semibold hover:bg-purple-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <CalendarClock className="w-3.5 h-3.5 text-purple-500" />
                <span>جدولة فحص دوري بالبريد</span>
              </button>

              <button
                type="button"
                onClick={() => document.getElementById('most-searched-keywords-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-indigo-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title={isRtl ? "الانتقال إلى الكلمات المفتاحية الأكثر بحثاً في جوجل (SEO Keywords)" : "Jump to Most Searched Google Keywords"}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>{isRtl ? 'الكلمات الأكثر بحثاً في جوجل (SEO Keywords)' : 'Most Searched Google Keywords'}</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-amber-600 text-white rounded font-black">{isRtl ? 'جديد' : 'NEW'}</span>
              </button>

              <button
                type="button"
                onClick={() => document.getElementById('high-intent-keywords-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700/80 font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>الكلمات عالية النية (AI Keywords)</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('keyword-density-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>كثافة الكلمات المفتاحية</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('crawl-simulator-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="محاكي زحف جوجل وتفسير الروابط وتصيير الجافاسكريبت WRS"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                <span>محاكي زحف Googlebot (WRS)</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('audit-history-chart-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="مخطط تطور السيو والسرعة عبر الفحوصات المتكررة Recharts"
              >
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span>مخطط التطور التفاعلي (Recharts)</span>
              </button>
            </div>
          </div>

          {/* Recharts Audit Evolution & Speed History Chart */}
          <div id="audit-history-chart-section">
            <AuditHistoryChart
              url={auditData.url}
              currentScore={auditData.overallScore}
              currentSpeedMs={auditData.loadTimeMs}
              analyzedAt={auditData.analyzedAt}
              auditData={auditData}
            />
          </div>

          {/* Visual Previews & Simulators Section */}
          <div className="space-y-4" id="previews-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    قسم المعاينة والمحاكاة التفاعلية (Visual Previews & Simulators)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    محاكي عرض الجوال (iPhone 15 & Android)، نتائج بحث جوجل (SERP)، وبطاقات النشر الاجتماعي
                  </p>
                </div>
              </div>

              {/* Segmented control tabs */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold shrink-0">
                <button
                  onClick={() => setPreviewTab('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    previewTab === 'mobile'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'محاكي الهاتف (Mobile)' : 'Mobile Preview'}</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-black">{isRtl ? 'جديد' : 'NEW'}</span>
                </button>
                <button
                  onClick={() => setPreviewTab('serp')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    previewTab === 'serp'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'نتائج جوجل (SERP)' : 'Google SERP'}</span>
                </button>
                <button
                  onClick={() => setPreviewTab('social')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    previewTab === 'social'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'منصات التواصل' : 'Social Preview'}</span>
                </button>
                <button
                  onClick={() => setPreviewTab('all')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    previewTab === 'all'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isRtl ? "عرض الكل جنباً إلى جنب" : "View all side by side"}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{t('filter.all', 'الكل')}</span>
                </button>
              </div>

              {/* Quick Jump to Googlebot Crawl & JS Simulator */}
              <button
                type="button"
                onClick={() => document.getElementById('crawl-simulator-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold transition-all cursor-pointer border border-indigo-200 dark:border-indigo-800 text-xs shrink-0"
                title="الانتقال إلى محاكي زحف Googlebot وتصيير الجافاسكريبت والروابط الداخلية"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>محاكي Googlebot (WRS)</span>
              </button>
            </div>

            {/* Render Preview according to active tab */}
            {previewTab === 'mobile' && (
              <MobilePreview auditData={auditData} />
            )}

            {previewTab === 'serp' && (
              <SerpPreview
                url={auditData.url}
                title={auditData.pageTitle}
                description={auditData.metaDescription}
              />
            )}

            {previewTab === 'social' && (
              <SocialPreview
                url={auditData.url}
                social={auditData.social}
                pageTitle={auditData.pageTitle}
                metaDescription={auditData.metaDescription}
              />
            )}

            {previewTab === 'all' && (
              <div className="space-y-6">
                <MobilePreview auditData={auditData} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SerpPreview
                    url={auditData.url}
                    title={auditData.pageTitle}
                    description={auditData.metaDescription}
                  />
                  <SocialPreview
                    url={auditData.url}
                    social={auditData.social}
                    pageTitle={auditData.pageTitle}
                    metaDescription={auditData.metaDescription}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Structure & Content Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HeadingsVisualizer headings={auditData.headings} />

            {/* Images & Missing Alt Inspector */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
              <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">مدقق صور الموقع والنصوص البديلة (Alt Tags)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">التأكد من قابلية الصور للأرشفة في بحث صور جوجل</p>
                </div>
                <ImageIcon className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">إجمالي الصور</span>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white">{auditData.images.total}</span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-lg">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">تحتوي على Alt</span>
                  <span className="font-mono text-base font-bold text-emerald-800 dark:text-emerald-200">{auditData.images.withAlt}</span>
                </div>
                <div className={`p-3 rounded-lg border ${
                  auditData.images.withoutAlt > 0
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <span className="text-[11px] block">تفتقر لوسم Alt</span>
                  <span className="font-mono text-base font-bold">{auditData.images.withoutAlt}</span>
                </div>
              </div>

              {auditData.images.missingAltSamples.length > 0 ? (
                <div>
                  <h4 className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-2">عينة من الصور التي تحتاج إضافة وسم alt فوراً:</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {auditData.images.missingAltSamples.map((img, idx) => (
                      <div key={idx} className="p-2 bg-rose-50/50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 rounded-lg text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate dir-ltr text-left" dir="ltr">
                        {img.src}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>ممتاز! جميع الصور المكتشفة في هذه الصفحة تمتلك نصوص بديلة ملائمة.</span>
                </div>
              )}

              {/* Image Alt SEO Guideline & Syntax */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    الصيغة البرمجية الموصى بها لكتابة محتوى وصفي للصورة (&lt;img alt&gt;):
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    معيار السيو 2026
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px] dir-ltr text-left overflow-x-auto shadow-inner select-all">
                  &lt;img src="pic.gif" alt="نص الكلمات المفتاحية الدقيق والوصفي الذي يمثل الصورة." /&gt;
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  تساعد السمة <code className="text-indigo-600 dark:text-indigo-400 font-mono">alt</code> محركات البحث في فهم سياق الصورة ومطابقتها مع استفسارات الباحثين في Google Images.
                </p>
              </div>
            </div>
          </div>

          {/* Keyword Density & Distribution Analyzer */}
          <div id="keyword-density-section">
            <KeywordDensityCard
              analysis={auditData.keywordsAnalysis}
              wordCount={auditData.wordCount}
            />
          </div>

          {/* AI High-Intent Keywords Generator & Search Intent Optimization */}
          <div id="high-intent-keywords-section">
            <HighIntentKeywordsSection auditData={auditData} />
          </div>

          {/* Keyword Opportunity Visualizer (Word Cloud & Circular Donut Opportunity Chart) */}
          <div id="keyword-opportunity-cloud-section">
            <KeywordOpportunityVisualizer auditData={auditData} />
          </div>

          {/* Content & Media: Internal Linking Structure & Topic Clusters Analyzer */}
          <div id="internal-linking-section">
            <InternalLinkingAnalyzer
              analysis={auditData.internalLinkingAnalysis}
              pageUrl={auditData.url}
              wordCount={auditData.wordCount}
            />
          </div>

          {/* Technical SEO: Googlebot Crawl Simulator & JavaScript Rendering Analyzer */}
          <div id="crawl-simulator-section">
            <CrawlSimulator auditData={auditData} />
          </div>

          {/* Technical SEO: Broken External Links Checker */}
          <div id="technical-seo-broken-links">
            <BrokenLinksChecker
              analysis={auditData.brokenLinksAnalysis}
              pageUrl={auditData.url}
            />
          </div>

          {/* Social & Structured Data: Schema.org (JSON-LD) Inspector & Validator */}
          <div id="social-schema-inspector">
            <SchemaInspector
              analysis={auditData.schemaAnalysis}
              pageUrl={auditData.url}
            />
          </div>

          {/* Performance & Speed: Google Core Web Vitals (LCP, FID, CLS, TTFB) */}
          <div id="core-web-vitals-section">
            <CoreWebVitalsSection
              analysis={auditData.coreWebVitals}
              pageUrl={auditData.url}
              loadTimeMs={auditData.loadTimeMs}
              pageSizeKb={auditData.pageSizeKb}
            />
          </div>

          {/* Security & Encryption: Advanced Security Headers (CSP & HSTS) Analyzer */}
          <div id="security-headers-section">
            <SecurityHeadersAnalyzer
              analysis={auditData.securityHeadersAnalysis}
              targetUrl={auditData.url}
            />
          </div>

          {/* Recurring SEO Monitoring & Automated Email Reports Tool */}
          <div id="scheduled-audits-section">
            <ScheduledAuditCard
              currentUrl={auditData.url}
              auditData={auditData}
              onOpenModal={() => setIsScheduledAuditsModalOpen(true)}
            />
          </div>


          {/* Section: SEO Audit Checklist & Task Tracking (قائمة التحقق وتدقيق السيو) */}
          <div id="seo-checklist-section" className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        قائمة التحقق وتدقيق السيو (SEO Audit Checklist)
                      </h3>
                      {pendingItemsCount > 0 ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{pendingItemsCount} مهمة معلقة للإصلاح</span>
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>كافة المعايير المفحوصة ناجحة</span>
                        </span>
                      )}
                      {auditorNotesTotalCount > 0 && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 animate-in fade-in">
                          <Mic className="w-3 h-3 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                          <span>{auditorNotesTotalCount} توجيهات صوتية مسجلة</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      تدقيق شامل لـ {auditData.items.length} معيار سيو وتقني. يمكنك تصفية النتائج أو تصدير عناصر قائمة التحقق المعلقة كملف PDF أو CSV للتتبع الخارجي.
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Quick Fix Mode & Export */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick Fix Mode Primary Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsQuickFixMode(!isQuickFixMode)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                      isQuickFixMode
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/25 ring-2 ring-amber-400/50'
                        : 'bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80'
                    }`}
                    title="تفعيل وضع الإصلاح السريع لإخفاء العناصر الناجحة والتأشير على المعايير كمكتملة في الجلسة الحالية"
                  >
                    <Zap className={`w-4 h-4 ${isQuickFixMode ? 'fill-current animate-pulse text-amber-200' : 'text-amber-600 dark:text-amber-400'}`} />
                    <span>{isQuickFixMode ? 'إيقاف وضع الإصلاح السريع' : 'وضع الإصلاح السريع'}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isQuickFixMode ? 'bg-white/20 text-white' : 'bg-amber-200/70 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200'
                    }`}>
                      {isQuickFixMode ? `${locallyCompletedCount}/${totalPendingCount}` : `${pendingItemsCount} معلق`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCustomCategoriesModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer"
                    title="إنشاء وتعديل تصنيفات مخصصة لتجميع وتوزيع المهام على فرق العمل أو حسب الأولوية"
                  >
                    <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>التصنيفات المخصصة</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
                      {customCategories.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPendingChecklistModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white text-xs font-bold transition-all shadow-sm hover:shadow-indigo-500/20 cursor-pointer"
                    title="تصدير عناصر قائمة التحقق المعلقة فقط كملف PDF أو CSV بتنسيق قائمة مهام للتتبع الخارجي"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير المهام المعلقة</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold">
                      {pendingItemsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/70 dark:hover:bg-amber-900/60 active:scale-95 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all border border-amber-200 dark:border-amber-800 shadow-xs cursor-pointer"
                    title="الانتقال إلى دليل إصلاح أخطاء السيو والشروحات البرمجية الشاملة 2026"
                  >
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>دليل إصلاح الأخطاء</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Filter Bar for Items */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{isRtl ? 'تصفية حسب الحالة:' : 'Filter by status:'}</span>
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t('filter.all', 'الكل')} ({auditData.items.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('error')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      statusFilter === 'error'
                        ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t('filter.errors', 'أخطاء حرجة')} ({criticalErrorsCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('warning')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      statusFilter === 'warning'
                        ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t('filter.warnings', 'تحسينات')} ({warningsCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('pass')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      statusFilter === 'pass'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t('filter.passed', 'ناجحة')} ({passedCount})
                  </button>
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{isRtl ? 'القسم:' : 'Category:'}</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="all">{t('category.all', 'كافة الأقسام')}</option>
                  <option value="onpage">{t('category.seo', 'السيو الداخلي (On-Page)')}</option>
                  <option value="technical">{t('category.technical', 'السيو التقني (Technical)')}</option>
                  <option value="content">{t('category.content', 'المحتوى والوسائط (Content)')}</option>
                  <option value="performance">{t('category.performance', 'السرعة والأداء (Performance)')}</option>
                  <option value="security">{t('category.security', 'الأمان والشهادات (Security)')}</option>
                  <option value="social">{isRtl ? 'التواصل والـ Schema' : 'Schema & Social'}</option>
                </select>
              </div>

              {/* Quick Export Pending Checklist Button inside filter bar */}
              <button
                type="button"
                onClick={() => setIsPendingChecklistModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                title="تصدير قائمة المهام المعلقة للتتبع الخارجي كـ PDF أو CSV"
              >
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>تصدير المهام المعلقة ({pendingItemsCount})</span>
              </button>

              {/* Quick Access to Keyword Opportunity Cloud & Donut */}
              <button
                onClick={() => document.getElementById('keyword-opportunity-cloud-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                title="الانتقال إلى سحابة فرص الكلمات المفتاحية والمخطط الدائري التفاعلي"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>سحابة فرص الكلمات (Word Cloud)</span>
              </button>

              {/* Quick Access to Googlebot Crawl Simulator */}
              <button
                onClick={() => document.getElementById('crawl-simulator-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                title="الانتقال إلى محاكي زحف Googlebot وتصيير الجافاسكريبت والروابط الداخلية"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>محاكي زحف Googlebot</span>
              </button>

              {/* Quick Access to Broken Links Checker */}
              <button
                onClick={() => document.getElementById('technical-seo-broken-links')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                title="الانتقال إلى أداة فحص الروابط الخارجية المعطلة 404"
              >
                <Unlink className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>فحص الروابط المعطلة (404)</span>
                {auditData.brokenLinksAnalysis && auditData.brokenLinksAnalysis.brokenCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] bg-rose-600 text-white rounded-full font-bold">
                    {auditData.brokenLinksAnalysis.brokenCount}
                  </span>
                )}
              </button>

              {/* Quick Access to Schema Inspector */}
              <button
                onClick={() => document.getElementById('social-schema-inspector')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                title="الانتقال إلى فاحص ومحلل بيانات الـ Schema.org (JSON-LD)"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>فاحص بيانات Schema (JSON-LD)</span>
                {auditData.schemaAnalysis && auditData.schemaAnalysis.errorCount > 0 ? (
                  <span className="px-1.5 py-0.2 text-[9px] bg-rose-600 text-white rounded-full font-bold">
                    {auditData.schemaAnalysis.errorCount} خطأ
                  </span>
                ) : auditData.schemaAnalysis && auditData.schemaAnalysis.totalEntitiesFound > 0 ? (
                  <span className="px-1.5 py-0.2 text-[9px] bg-emerald-600 text-white rounded-full font-bold">
                    {auditData.schemaAnalysis.totalEntitiesFound}
                  </span>
                ) : null}
              </button>

              {/* Quick Access to Error Guide */}
              <button
                onClick={() => document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                title="الانتقال إلى دليل إصلاح الأخطاء 2026"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>دليل إصلاح الأخطاء</span>
              </button>
            </div>

            {/* Custom Categories Quick Filter & Management Bar (تصفية المهام حسب الفرق والأولويات المخصصة) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  <span>تصفية التصنيفات المخصصة (فرق / أولويات):</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCustomCategoryFilter('all')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      customCategoryFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    كافة التصنيفات ({auditData.items.length})
                  </button>

                  {customCategories.map((cat) => {
                    const cStyle = getCategoryColorClasses(cat.color);
                    const isActive = customCategoryFilter === cat.id;
                    const matchingCount = auditData.items.filter((item) => cat.itemIds.includes(item.id)).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCustomCategoryFilter(isActive ? 'all' : cat.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? `${cStyle.badge} font-bold ring-2 ${cStyle.ring} shadow-xs`
                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        title={cat.description || cat.name}
                      >
                        <span className={`w-2 h-2 rounded-full ${cStyle.dot}`} />
                        <span>{cat.name}</span>
                        <span className={`text-[10px] font-mono px-1 rounded-full ${isActive ? 'bg-black/10 dark:bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          {matchingCount}
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCustomCategoryFilter(customCategoryFilter === 'unassigned' ? 'all' : 'unassigned')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      customCategoryFilter === 'unassigned'
                        ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title="عرض المعايير والمهام التي لم تُسند لأي فريق أو أولوية مخصصة بعد"
                  >
                    <span>غير مصنفة</span>
                    <span className="mr-1 text-[10px] font-mono">
                      ({auditData.items.filter((item) => !customCategories.some((c) => c.itemIds.includes(item.id))).length})
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomCategoriesModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer mr-auto"
                title="إنشاء تصنيف جديد أو تعديل التصنيفات الحالية وتوزيع المهام"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إدارة التصنيفات المخصصة</span>
              </button>
            </div>

            {/* Quick Fix Mode Active Interactive Dashboard Banner */}
            {isQuickFixMode && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/20 border-2 border-amber-400/80 dark:border-amber-600/70 shadow-lg shadow-amber-500/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                      <Zap className="w-5 h-5 fill-current animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          وضع الإصلاح السريع (Quick Fix Mode) نشط
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                          {locallyCompletedCount}/{totalPendingCount} تم إصلاحها
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        تم إخفاء {passedCount} فحصاً ناجحاً تلقائياً. ركز على إصلاح الأخطاء في كود موقعك وعلّم كل معيار كمكتمل لمعاينة ارتفاع النتيجة فورياً.
                      </p>
                    </div>
                  </div>

                  {/* Projected Score Badge */}
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 rounded-xl px-3.5 py-2 shrink-0 shadow-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                        النتيجة المتوقعة بعد الإصلاح
                      </span>
                      <div className="flex items-center gap-1.5 font-black text-base">
                        <span className="text-slate-400 line-through text-xs font-mono">{baseScore}</span>
                        <span className="text-amber-500">⬅</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-lg">{projectedScore}</span>
                        <span className="text-xs text-slate-400">/100</span>
                        {projectedScore > baseScore && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" />
                            +{projectedScore - baseScore}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>نسبة إنجاز مهام الإصلاح في الجلسة:</span>
                    <span className="font-mono text-amber-700 dark:text-amber-300">{quickFixProgressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${quickFixProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleMarkAllCompleted}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs active:scale-95"
                      title="تعليم جميع المهام المعلقة كمكتملة في الجلسة الحالية"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>تعليم الكل كمكتمل</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetLocallyCompleted}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
                      title="إعادة تعيين علامات الاكتمال والبدء من جديد"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة ضبط التأشير</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQuickFixMode(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <span>إيقاف الوضع وعرض الكل</span>
                  </button>
                </div>
              </div>
            )}

            {/* Itemized Audit Checks List */}
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 text-xs">
                  {isQuickFixMode ? (
                    <div className="space-y-3 max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        رائع! لا توجد أخطاء متبقية في وضع الإصلاح السريع
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        كافة معايير السيو في هذا القسم متطابقة وناجحة بنسبة 100%. يمكنك إيقاف وضع الإصلاح السريع لمعاينة كافة الفحوصات.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsQuickFixMode(false)}
                        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                      >
                        إيقاف وضع الإصلاح السريع
                      </button>
                    </div>
                  ) : (
                    'لا توجد عناصر تطابق خيارات التصفية المحددة.'
                  )}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <AuditItemCard
                    key={item.id}
                    item={item}
                    currentUrl={auditData.url}
                    pageTitle={auditData.pageTitle}
                    quickFixMode={isQuickFixMode}
                    isCompletedLocally={Boolean(locallyCompletedIds[item.id])}
                    onToggleComplete={handleToggleCompleteItem}
                    assignedCustomCategories={customCategories.filter((c) => c.itemIds.includes(item.id))}
                    allCustomCategories={customCategories}
                    onToggleCategoryAssignment={handleToggleCategoryAssignment}
                    onFilterByCustomCategory={(catId) => setCustomCategoryFilter(catId)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Instant Code & Fix Generator Section */}
          <CodeGeneratorSection
            initialUrl={auditData.url}
            initialTitle={auditData.pageTitle}
            initialDesc={auditData.metaDescription}
          />
        </main>
      )}

      {/* SEO Educational Guide & Ranking Authority Section */}
      <SeoMasteryContentSection />

      {/* Frequently Asked Questions Section (قسم الأسئلة الشائعة) */}
      <FaqSection onContactClick={() => openStaticPage('contact')} />

      {/* Social Media Share Bar Section */}
      <section className="bg-slate-950 pt-10 pb-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SocialShareBar url={auditData?.url} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 pb-12 pt-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-white">راصد سيو</span>
                <span className="text-xs font-mono text-indigo-400">RasidSEO</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                المنصة المتكاملة لفحص وتدقيق أخطاء المواقع والمدونات، تحليل السيو التقني، وتوليد الأكواد الجاهزة.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-3 text-xs font-medium">
              <div className="flex items-center gap-5 text-slate-400 flex-wrap">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  {t('nav.home', 'الرئيسية')}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.getElementById('audit-input')?.focus();
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('nav.instant_audit', 'فحص فوري')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduledAuditsModalOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>{t('nav.schedule_audit', 'جدولة فحص دوري')}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </button>
                <a href="#results-section" className="hover:text-white transition-colors">
                  {t('nav.audit_report', 'تقرير الفحص')}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (auditData) {
                      document.getElementById('seo-checklist-section')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('nav.fix_guide', 'دليل إصلاح الأخطاء')}</span>
                </button>
                <a href="#tools-section" className="hover:text-white transition-colors">
                  {t('nav.code_generator', 'مولد الأكواد')}
                </a>
                <a href="#guide-section" className="hover:text-white transition-colors">
                  {t('nav.seo_guide', 'دليل السيو')}
                </a>
                <a href="#faq-section" className="hover:text-white transition-colors">
                  {t('nav.faq', 'الأسئلة الشائعة')}
                </a>
              </div>

              {/* Dedicated Essential Pages Links */}
              <div className="flex items-center gap-4 text-slate-400 flex-wrap pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => openStaticPage('about')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  من نحن
                </button>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => openStaticPage('disclaimer')}
                  className="hover:text-amber-400 transition-colors cursor-pointer font-medium"
                >
                  إخلاء مسؤولية
                </button>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => openStaticPage('help')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer font-medium flex items-center gap-1.5 text-slate-300"
                >
                  <span>مركز المساعدة</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-indigo-900/80 text-indigo-300 rounded font-bold border border-indigo-700/50">FAQ</span>
                </button>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => openStaticPage('privacy')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  سياسة الخصوصية
                </button>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => openStaticPage('terms')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  شروط الخدمة
                </button>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => openStaticPage('contact')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  اتصل بنا
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} راصد سيو (RasidSEO). جميع الحقوق محفوظة.</p>
            <p className="font-mono">معايير الفحص متوافقة مع Google Search Central 2026</p>
          </div>
        </div>
      </footer>

      {/* Essential Static Pages Modal */}
      <StaticPageModal
        isOpen={staticPageModal.isOpen}
        activePage={staticPageModal.page}
        onClose={() => setStaticPageModal((prev) => ({ ...prev, isOpen: false }))}
        onSelectPage={(page) => setStaticPageModal({ isOpen: true, page })}
      />

      {/* Side-by-Side Report Comparison Modal */}
      <ReportComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        savedReports={savedReports}
        currentReport={auditData}
        onDeleteSavedReport={deleteSavedReport}
        onLoadReportIntoView={(rep) => {
          setAuditData(rep);
          setUrlInput(rep.url);
          setIsCompareModalOpen(false);
          const criticalAnalysis = detectCriticalErrors(rep);
          if (criticalAnalysis.hasCriticalErrors) {
            setCriticalToast({
              isOpen: true,
              analysis: criticalAnalysis,
              siteUrl: rep.url
            });
          } else {
            setCriticalToast(null);
          }
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* JSON Export Modal for Sheets & Excel */}
      {auditData && (
        <JsonExportModal
          isOpen={isJsonModalOpen}
          onClose={() => setIsJsonModalOpen(false)}
          auditData={auditData}
        />
      )}

      {/* Pending Checklist Export Modal (PDF / CSV) */}
      {auditData && (
        <PendingChecklistExportModal
          isOpen={isPendingChecklistModalOpen}
          onClose={() => setIsPendingChecklistModalOpen(false)}
          auditData={auditData}
        />
      )}

      {/* Custom Categories Modal (إدارة وتخصيص تصنيفات الفرق والأولويات) */}
      {auditData && (
        <CustomCategoriesModal
          isOpen={isCustomCategoriesModalOpen}
          onClose={() => setIsCustomCategoriesModalOpen(false)}
          categories={customCategories}
          onSaveCategories={handleSaveCustomCategories}
          auditItems={auditData.items}
          siteUrl={auditData.url}
          onSelectCategoryFilter={(catId) => {
            setCustomCategoryFilter(catId);
            setIsCustomCategoriesModalOpen(false);
          }}
        />
      )}

      {/* Scheduled Audits & Automated Email Monitoring Modal */}
      <ScheduledAuditsModal
        isOpen={isScheduledAuditsModalOpen}
        onClose={() => setIsScheduledAuditsModalOpen(false)}
        currentUrl={auditData ? auditData.url : (urlInput || 'https://al-arabi-tech.blog')}
        auditData={auditData || undefined}
      />

      <Tooltip
        id="seo-tooltip"
        place="top"
        className="z-50 max-w-xs text-xs font-sans rounded-xl shadow-xl leading-relaxed"
        style={{
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '8px 12px',
          borderRadius: '10px',
          border: '1px solid #334155',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
          zIndex: 99999
        }}
      />

      {/* Critical SEO & Security Toast Notification */}
      {criticalToast && (
        <CriticalAuditToast
          isOpen={criticalToast.isOpen}
          onClose={() => setCriticalToast((prev) => (prev ? { ...prev, isOpen: false } : null))}
          analysis={criticalToast.analysis}
          siteUrl={criticalToast.siteUrl}
          onJumpToItem={handleJumpToCriticalItem}
        />
      )}
    </div>
  );
}
