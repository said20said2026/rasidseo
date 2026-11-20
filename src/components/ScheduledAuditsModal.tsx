import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarClock,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Bell,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  Check,
  Trash2,
  Pause,
  Play,
  ArrowUpRight,
  ShieldCheck,
  Gauge,
  HelpCircle,
  Smartphone,
  ExternalLink,
  Calendar,
  Download,
  Copy,
  CalendarDays,
  FileDown
} from 'lucide-react';
import { AuditResult, ScheduledAuditSubscription, ScheduledAuditFrequency } from '../types/seo';
import {
  generateGoogleCalendarUrl,
  downloadScheduledAuditIcs,
  formatNextAuditDisplay,
  getFrequencyLabelAr,
  subscriptionToCalendarConfig
} from '../utils/scheduledAuditCalendar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  auditData?: AuditResult;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الإثنين (المفضل)' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' }
];

export const ScheduledAuditsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUrl,
  auditData
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'preview' | 'subscriptions' | 'calendar'>('schedule');
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState(currentUrl);
  const [siteName, setSiteName] = useState(auditData?.pageTitle || '');
  const [frequency, setFrequency] = useState<ScheduledAuditFrequency>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [timeOfDay, setTimeOfDay] = useState<string>('09:00');
  const [alertOnScoreDrop, setAlertOnScoreDrop] = useState(true);
  const [scoreThreshold, setScoreThreshold] = useState(80);
  const [includeCoreWebVitals, setIncludeCoreWebVitals] = useState(true);
  const [includeBrokenLinks, setIncludeBrokenLinks] = useState(true);
  const [includeAiRecommendations, setIncludeAiRecommendations] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const [subscriptions, setSubscriptions] = useState<ScheduledAuditSubscription[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentCalendarConfig = useMemo(() => ({
    siteName: siteName || auditData?.pageTitle || url,
    url,
    frequency,
    dayOfWeek,
    timeOfDay,
    scoreThreshold,
    auditScore: auditData?.overallScore,
    alertOnScoreDrop
  }), [siteName, auditData, url, frequency, dayOfWeek, timeOfDay, scoreThreshold, alertOnScoreDrop]);

  const nextSchedule = useMemo(() => {
    return formatNextAuditDisplay(frequency, dayOfWeek, timeOfDay);
  }, [frequency, dayOfWeek, timeOfDay]);

  const googleCalendarUrl = useMemo(() => {
    return generateGoogleCalendarUrl(currentCalendarConfig);
  }, [currentCalendarConfig]);

  const directIcsDownloadUrl = useMemo(() => {
    return `/api/scheduled-audits/export-ics?url=${encodeURIComponent(url)}&siteName=${encodeURIComponent(siteName || '')}&frequency=${frequency}&dayOfWeek=${dayOfWeek}&timeOfDay=${encodeURIComponent(timeOfDay)}`;
  }, [url, siteName, frequency, dayOfWeek, timeOfDay]);

  // Sync currentUrl and siteName
  useEffect(() => {
    if (currentUrl) {
      setUrl(currentUrl);
      try {
        setSiteName(auditData?.pageTitle || new URL(currentUrl).hostname);
      } catch {
        setSiteName(auditData?.pageTitle || currentUrl);
      }
    }
  }, [currentUrl, auditData]);

  // Load subscriptions from API and LocalStorage
  const fetchSubscriptions = async () => {
    setIsLoadingSubs(true);
    try {
      const resp = await fetch('/api/scheduled-audits');
      if (resp.ok) {
        const data = await resp.json();
        if (data.subscriptions) {
          setSubscriptions(data.subscriptions);
        }
      }
    } catch {
      // Fallback from localStorage
      const local = localStorage.getItem('scheduled_seo_audits');
      if (local) {
        try {
          setSubscriptions(JSON.parse(local));
        } catch {
          // ignore
        }
      }
    } finally {
      setIsLoadingSubs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptions();
      setStatusMessage(null);
    }
  }, [isOpen]);

  // Handle Form Submit
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال عنوان بريد إلكتروني صالح.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const payload = {
        email: email.trim(),
        url: url.trim(),
        siteName: siteName.trim() || url.trim(),
        frequency,
        dayOfWeek,
        timeOfDay,
        alertOnScoreDrop,
        scoreThreshold,
        includeCoreWebVitals,
        includeBrokenLinks,
        includeAiRecommendations
      };

      const resp = await fetch('/api/scheduled-audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const data = await resp.json();
        setStatusMessage({
          type: 'success',
          text: `تم تفعيل الجدولة الدورية بنجاح! سيتم إرسال أول ملخص تقرير إلى ${email} طبقاً للجدول المختار.`
        });
        fetchSubscriptions();
      } else {
        const errData = await resp.json();
        setStatusMessage({ type: 'error', text: errData.error || 'فشل حفظ الجدولة' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم أثناء حفظ الجدولة.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Send Test Email Now
  const handleSendTestNow = async () => {
    if (!email || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال البريد الإلكتروني أولاً لإرسال الملخص التجريبي إليه.' });
      return;
    }

    setIsSendingTest(true);
    setStatusMessage(null);
    try {
      const resp = await fetch('/api/scheduled-audits/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          url: url.trim(),
          auditData
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setStatusMessage({
          type: 'success',
          text: `تم إرسال ملخص تقرير السيو التجريبي بنجاح إلى ${email}! تفقد صندوق الوارد أو معاينة البريد بالأسفل.`
        });
        fetchSubscriptions();
      } else {
        const errData = await resp.json();
        setStatusMessage({ type: 'error', text: errData.error || 'تعذر إرسال التقرير التجريبي.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'تعذر الاتصال بالخادم لإرسال التقرير التجريبي.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Toggle Subscription Status
  const handleToggleSub = async (id: string) => {
    try {
      const resp = await fetch(`/api/scheduled-audits/${id}/toggle`, { method: 'PATCH' });
      if (resp.ok) {
        fetchSubscriptions();
      }
    } catch {
      // ignore
    }
  };

  // Delete Subscription
  const handleDeleteSub = async (id: string) => {
    try {
      const resp = await fetch(`/api/scheduled-audits/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        fetchSubscriptions();
        setStatusMessage({ type: 'success', text: 'تم إلغاء الاشتراك المجدول بنجاح.' });
      }
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const currentScore = auditData?.overallScore || 85;
  const criticalCount = auditData?.items.filter(i => i.status === 'error').length || 0;
  const warningsCount = auditData?.items.filter(i => i.status === 'warning').length || 0;
  const passedCount = auditData?.items.filter(i => i.status === 'pass').length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl transition-all my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/20 dark:from-indigo-950/30 dark:via-slate-900 dark:to-indigo-950/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  جدولة فحص السيو الدوري بالبريد الإلكتروني (Automated Audits)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  تلقائي
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                فحص دوري تلقائي لموقعك وإرسال ملخص تقرير الأداء وأي مشكلات طارئة مباشرة إلى بريدك الإلكتروني.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>إعداد الجدولة والتكرار</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>معاينة شكل تقرير الإيميل</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'subscriptions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>الاشتراكات المجدولة النشطة ({subscriptions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>مزامنة التقويم وتنزيل .ics</span>
          </button>
        </div>

        {/* Status Notification Toast */}
        {statusMessage && (
          <div className={`mx-5 mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: SCHEDULE FORM */}
          {activeTab === 'schedule' && (
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Input */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    البريد الإلكتروني لاستلام التقارير <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium dir-ltr text-left"
                      dir="ltr"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    سنرسل ملخص الفحص وتنبيهات الهبوط إلى هذا العنوان.
                  </span>
                </div>

                {/* Target URL */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    رابط الموقع المراد جدولته <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono dir-ltr text-left"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    الموقع الافتراضي هو الموقع المفحوص حالياً.
                  </span>
                </div>
              </div>

              {/* Frequency & Timing */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>توقيت ودورية الفحص الدوري التلقائي</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Frequency Selector */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      دورية الإرسال:
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as ScheduledAuditFrequency)}
                      className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="weekly">أسبوعياً (Weekly - موصى به)</option>
                      <option value="biweekly">كل أسبوعين (Bi-weekly)</option>
                      <option value="monthly">شهرياً (Monthly)</option>
                      <option value="daily">يومياً (Daily - للمواقع الكبرى)</option>
                    </select>
                  </div>

                  {/* Day of Week */}
                  {frequency !== 'daily' && (
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                        يوم الإرسال:
                      </label>
                      <select
                        value={dayOfWeek}
                        onChange={(e) => setDayOfWeek(Number(e.target.value))}
                        className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Time of Day */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      توقيت الإرسال:
                    </label>
                    <input
                      type="time"
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences & Inclusions */}
              <div className="space-y-2.5 pt-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  عناصر ملخص التقرير المرسل:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <label className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={alertOnScoreDrop}
                      onChange={(e) => setAlertOnScoreDrop(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        تنبيه فوري عند هبوط النتيجة عن {scoreThreshold}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        إشعار فوري عند حدوث أخطاء سيو حرجة غير متوقعة
                      </span>
                    </div>
                  </label>

                  <label className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeCoreWebVitals}
                      onChange={(e) => setIncludeCoreWebVitals(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        مؤشرات سرعة الويب (Core Web Vitals)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        قياسات LCP و FID و CLS وتأثيرها على سرعة الموقع
                      </span>
                    </div>
                  </label>

                  <label className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeBrokenLinks}
                      onChange={(e) => setIncludeBrokenLinks(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        رصد الروابط الخارجية المعطلة (404)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        كشف أي روابط ميتة تؤثر على سمعة الموقع في جوجل
                      </span>
                    </div>
                  </label>

                  <label className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeAiRecommendations}
                      onChange={(e) => setIncludeAiRecommendations(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        أهم 3 أولويات للإصلاح (AI Strategic Advice)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        خطوات محددة لمعالجة المشكلات الأكثر إلحاحاً
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Quick Calendar & .ics Export Card */}
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-bold text-xs text-indigo-950 dark:text-indigo-200">
                      مزامنة موعد الفحص مع تقويمك الشخصي (.ics & Google Calendar)
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-white/70 dark:bg-slate-900/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    {nextSchedule.relativeText}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  يمكنك أيضاً إضافة المواعيد الدورية مباشرة إلى تقويم جوجل لتلقي تذكير قبل كل جلسة فحص، أو تنزيل ملف .ics للأجهزة والتقاويم الأخرى.
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>جدولة في Google Calendar</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <button
                    type="button"
                    onClick={() => downloadScheduledAuditIcs(currentCalendarConfig)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل ملف .ics</span>
                  </button>

                  <a
                    href={directIcsDownloadUrl}
                    download
                    className="px-3 py-1.5 rounded-lg bg-white/60 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    title="رابط التنزيل المباشر لملف .ics"
                  >
                    <FileDown className="w-3.5 h-3.5 text-indigo-500" />
                    <span>رابط تنزيل مباشر</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const full = `${window.location.origin}${directIcsDownloadUrl}`;
                      navigator.clipboard?.writeText(full);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 text-xs transition-colors cursor-pointer"
                    title="نسخ رابط تنزيل ملف .ics"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSendTestNow}
                  disabled={isSendingTest || !email}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  title="إرسال رسالة تجريبية لمعاينة شكل الإيميل الحقيقي فوراً"
                >
                  {isSendingTest ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  <span>{isSendingTest ? 'جارٍ الإرسال التجريبي...' : 'إرسال ملخص تجريبي الآن'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>تأكيد وتفعيل الجدولة الدورية</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: LIVE EMAIL REPORT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>معاينة حية لشكل رسالة البريد الإلكتروني التي يستلمها المشترك:</span>
                <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  تنسيق HTML متوافق مع Gmail & Outlook
                </span>
              </div>

              {/* Email Envelope Container */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs bg-slate-100 dark:bg-slate-950 p-3 sm:p-5">
                {/* Email Client Header bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mb-3 text-xs space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>من: <strong>منصة راصد السيو الذكي &lt;reports@rasid-seo.com&gt;</strong></span>
                    <span>التردد: {frequency === 'weekly' ? 'أسبوعي' : frequency === 'monthly' ? 'شهري' : 'دوري'}</span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-bold">
                    الموضوع: 📊 ملخص تقرير السيو الدوري لـ {siteName || 'موقعك'} (النتيجة: {currentScore}/100)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    إلى: <span className="font-mono">{email || 'your-email@example.com'}</span>
                  </div>
                </div>

                {/* Email Body Template */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 space-y-5 text-right shadow-sm max-w-xl mx-auto">
                  {/* Brand Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                        ر
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">راصد السيو الذكي</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Greeting & Score Header */}
                  <div className="text-center space-y-2 py-2">
                    <span className="text-xs text-slate-500 block">
                      مرحباً بك! إليك الملخص الدوري لأداء موقعك في محركات البحث:
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white" dir="ltr">
                      {url || 'https://example.com'}
                    </h4>

                    {/* Overall Score Circle in Email */}
                    <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950 dark:to-indigo-900/40 border-4 border-indigo-500 my-2">
                      <span className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-300">
                        {currentScore}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">من 100</span>
                    </div>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold block">{passedCount}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">فحص سليم</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60">
                      <span className="text-amber-700 dark:text-amber-300 font-bold block">{warningsCount}</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400">تنبيه تحسين</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60">
                      <span className="text-rose-700 dark:text-rose-300 font-bold block">{criticalCount}</span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400">أخطاء حرجة</span>
                    </div>
                  </div>

                  {/* Core Web Vitals Status */}
                  {includeCoreWebVitals && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-amber-500" />
                          <span>مؤشرات أداء الويب الأساسية:</span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">سرعة استجابة {auditData?.loadTimeMs || 412}ms</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        مقياس LCP: 2.1s (جيد) · مقياس FID: 25ms (سليم) · مقياس CLS: 0.02 (مستقر)
                      </p>
                    </div>
                  )}

                  {/* Top Priorities Checklist */}
                  {includeAiRecommendations && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        أهم أولويات الإصلاح لهذا الأسبوع:
                      </span>
                      <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <span>تحديث وسوم alt للصور الناقصة لضمان فهرستها في بحث صور جوجل.</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <span>فحص الروابط الخارجية والتأكد من خلو الموقع من أخطاء 404 الميتة.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Button in Email */}
                  <div className="pt-2 text-center">
                    <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md">
                      <span>فتح تقرير السيو التفاعلي الكامل &larr;</span>
                    </div>
                  </div>

                  {/* Email Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center space-y-1">
                    <p>أنت تستلم هذه الرسالة بناءً على اشتراكك في خدمة المراقبة الدورية لمنصة راصد السيو.</p>
                    <p>يمكنك تعديل التردد أو إلغاء الاشتراك في أي وقت من لوحة التحكم.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    قائمة المواقع المجدولة للمراقبة الدورية
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    يمكنك إيقاف الفحص مؤقتاً أو تعديل التوقيت أو إلغاء الاشتراك في أي وقت.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchSubscriptions}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubs ? 'animate-spin text-indigo-600' : ''}`} />
                  <span>تحديث</span>
                </button>
              </div>

              {subscriptions.length > 0 ? (
                <div className="space-y-2.5">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                              {sub.siteName || sub.url}
                            </h5>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.status === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                            }`}>
                              {sub.status === 'active' ? 'نشط ويعمل ✓' : 'متوقف مؤقتاً'}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 block dir-ltr text-left" dir="ltr">
                            {sub.url}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                          {/* Google Calendar Link */}
                          <a
                            href={generateGoogleCalendarUrl(subscriptionToCalendarConfig(sub, auditData?.overallScore))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="جدولة هذا الفحص الدوري مباشرة في تقويم جوجل"
                          >
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span className="hidden sm:inline">Google Calendar</span>
                          </a>

                          {/* Download .ics */}
                          <button
                            type="button"
                            onClick={() => downloadScheduledAuditIcs(subscriptionToCalendarConfig(sub, auditData?.overallScore))}
                            className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="تنزيل ملف .ics لهذا الاشتراك"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="hidden sm:inline">.ics</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleSub(sub.id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
                            title={sub.status === 'active' ? 'إيقاف مؤقت' : 'استئناف'}
                          >
                            {sub.status === 'active' ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSub(sub.id)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="إلغاء الاشتراك وحذف الجدولة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Details Strip */}
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{sub.email}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {sub.frequency === 'weekly' ? 'أسبوعياً' : sub.frequency === 'monthly' ? 'شهرياً' : 'دوري'} ({sub.timeOfDay})
                          </span>
                        </span>
                        <span>إجمالي التقارير المرسلة: <strong>{sub.totalReportsSent}</strong></span>
                        {sub.lastSentAt && (
                          <span>آخر إرسال: {new Date(sub.lastSentAt).toLocaleDateString('ar-EG')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs space-y-2">
                  <CalendarClock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p>لا توجد اشتراكات مجدولة حتى الآن.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    أضف أول جدولة دورية الآن &larr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CALENDAR SYNC & .ICS EXPORT HUB */}
          {activeTab === 'calendar' && (
            <div className="space-y-5">
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900/80 border border-indigo-700/40 rounded-2xl p-5 text-white space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>مزامنة التقويم المباشرة والتنبيهات المسبقة</span>
                  </span>
                  <span className="text-xs text-slate-300">
                    Google Calendar • Apple Calendar • Outlook
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-white">
                  جدولة مواعيد الفحص الدورية في تقويمك لتفقد أداء موقعك بانتظام
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  لا تفوت أي فحص دوري: أضف هذا الموعد المتكرر مباشرة إلى تقويم جوجل، أو نزّل ملف التقويم (.ics) لفتحه في أي تطبيق تقويم على هاتفك أو حاسوبك، مع تنبيه إشعار مسبق قبل 15 دقيقة وقائمة كاملة بالمهام المطلوبة.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-3 pt-2 flex-wrap">
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>إضافة مباشرة إلى تقويم جوجل (Google Calendar)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  <button
                    type="button"
                    onClick={() => downloadScheduledAuditIcs(currentCalendarConfig)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تنزيل ملف التقويم (.ics)</span>
                  </button>
                </div>
              </div>

              {/* Direct Download Link Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      رابط تنزيل ملف .ics المباشر (Direct Download Link)
                    </h5>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    يمكن مشاركة هذا الرابط مع فريق العمل
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}${directIcsDownloadUrl}`}
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-600 dark:text-slate-400 select-all dir-ltr text-left"
                    dir="ltr"
                  />
                  <a
                    href={directIcsDownloadUrl}
                    download
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const full = `${window.location.origin}${directIcsDownloadUrl}`;
                      navigator.clipboard?.writeText(full);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              </div>

              {/* Event Details Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-indigo-500" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      معاينة تفاصيل الحدث في التقويم (Event Preview)
                    </h5>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {nextSchedule.relativeText}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">عنوان الحدث (Summary):</span>
                      <strong className="text-slate-800 dark:text-slate-100 block">
                        [راصد السيو] فحص دوري لموقع {siteName || url}
                      </strong>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">الموعد القادم والتكرار:</span>
                      <strong className="text-slate-800 dark:text-slate-100 block">
                        {nextSchedule.nextDateStr} ({getFrequencyLabelAr(frequency)})
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">المدة المقدرة:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">30 دقيقة</span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">التنبيه المسبق (Alarm):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>قبل 15 دقيقة</span>
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">الموقع والرابط:</span>
                      <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 truncate block dir-ltr text-left" dir="ltr">
                        {url}
                      </span>
                    </div>
                  </div>

                  {/* Checklist in description */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      الوصف المرفق بالحدث (Agenda & Checklist):
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>تشغيل الفحص الشامل ومقارنة النتيجة مع الحد الأدنى ({scoreThreshold}/100)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>فحص مقاييس تجربة وسرعة المستخدم (Core Web Vitals - LCP/FID/CLS)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>التحقق من خلو الروابط الداخلية والخارجية من أخطاء 404 الميتة</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>مراجعة الكلمات المفتاحية ذات النية العالية وفرص التصدر العضوي</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>متابعة التوصيات الاستراتيجية المحدثة للذكاء الاصطناعي</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Supported Calendar Apps Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>Google Calendar</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    يفتح الرابط مباشرة في متصفحك أو تطبيق Google Calendar على أندرويد و iOS، ويضيف الحدث المتكرر تلقائياً بحسابك.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                    <Download className="w-4 h-4 text-indigo-500" />
                    <span>Apple Calendar (iPhone & Mac)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    نزّل ملف .ics ثم انقر عليه لفتحه مباشرة في تطبيق تقويم Apple وتأكيد الإضافة بجميع التنبيهات.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-sky-600 font-bold">
                    <CalendarClock className="w-4 h-4" />
                    <span>Outlook & Exchange</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    متوافق تماماً مع Microsoft Outlook: استورد ملف .ics أو أضفه لتقويم العمل المشترك بسهولة.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
