import React, { useState } from 'react';
import {
  CalendarClock,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  BellRing,
  ArrowLeft,
  SlidersHorizontal,
  Check,
  Calendar,
  Download,
  ExternalLink,
  Copy
} from 'lucide-react';
import { AuditResult, ScheduledAuditFrequency } from '../types/seo';
import {
  generateGoogleCalendarUrl,
  downloadScheduledAuditIcs,
  formatNextAuditDisplay
} from '../utils/scheduledAuditCalendar';
import { apiFetch, apiUrl } from '../utils/apiConfig';

interface Props {
  currentUrl: string;
  auditData?: AuditResult;
  onOpenModal: () => void;
}

export const ScheduledAuditCard: React.FC<Props> = ({
  currentUrl,
  auditData,
  onOpenModal
}) => {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<ScheduledAuditFrequency>('weekly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const calendarConfig = {
    siteName: auditData?.pageTitle || currentUrl,
    url: currentUrl,
    frequency,
    dayOfWeek: 1, // Monday
    timeOfDay: '09:00',
    scoreThreshold: 80,
    auditScore: auditData?.overallScore
  };

  const nextSchedule = formatNextAuditDisplay(frequency, 1, '09:00');
  const googleCalendarUrl = generateGoogleCalendarUrl(calendarConfig);
  const directIcsDownloadUrl = apiUrl(`/api/scheduled-audits/export-ics?url=${encodeURIComponent(currentUrl)}&siteName=${encodeURIComponent(auditData?.pageTitle || '')}&frequency=${frequency}&dayOfWeek=1&timeOfDay=09:00`);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'يرجى إدخال بريد إلكتروني صالح.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const resp = await apiFetch('/api/scheduled-audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          url: currentUrl,
          siteName: auditData?.pageTitle || currentUrl,
          frequency,
          dayOfWeek: 1, // Monday
          timeOfDay: '09:00',
          alertOnScoreDrop: true,
          scoreThreshold: 80,
          includeCoreWebVitals: true,
          includeBrokenLinks: true,
          includeAiRecommendations: true
        })
      });

      if (resp.ok) {
        setFeedback({
          type: 'success',
          message: `تم تفعيل الجدولة الدورية (${frequency === 'weekly' ? 'أسبوعياً' : 'شهرياً'}) بنجاح! سيصلك ملخص التقرير القادم على بريدك.`
        });
      } else {
        const data = await resp.json();
        setFeedback({ type: 'error', message: data.error || 'فشل تفعيل الجدولة.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'تعذر الاتصال بالخادم لحفظ الجدولة.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendTest = async () => {
    if (!email || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'يرجى كتابة بريدك الإلكتروني أولاً في الحقل أدناه لإرسال التقرير إليه.' });
      return;
    }

    setIsSendingTest(true);
    setFeedback(null);
    try {
      const resp = await apiFetch('/api/scheduled-audits/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          url: currentUrl,
          auditData
        })
      });

      if (resp.ok) {
        setFeedback({
          type: 'success',
          message: `تم إرسال ملخص تقرير السيو التجريبي بنجاح إلى ${email}. تفقد بريدك الوارد!`
        });
      } else {
        setFeedback({ type: 'error', message: 'تعذر إرسال التقرير التجريبي.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'حدث خطأ في الاتصال بالخادم.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div id="scheduled-audits-section" className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-indigo-700/40 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Heading & Perks */}
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              <span>أداة المراقبة والجدولة التلقائية</span>
            </span>
            <span className="text-xs text-slate-400">
              متابعة مستمرة دون الحاجة لفتح الموقع يدوياً
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
            جدولة فحص دوري للموقع وإرسال ملخص السيو تلقائياً لبريدك الإلكتروني
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            راقب صحة موقعك في محركات البحث أسبوعياً: نرسل لك إشعاراً فورياً بتطور النتيجة الإجمالية، وتنبيهات برصد أي روابط ميتة (404) جديدة، مع مؤشرات أداء الويب (Core Web Vitals) وأهم 3 أولويات للإصلاح.
          </p>

          <div className="flex items-center gap-4 text-xs text-indigo-200 pt-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>فحص دوري أوتوماتيكي</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>تنبيه فوري عند هبوط النتيجة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>إلغاء الاشتراك في أي وقت</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Subscription Form */}
        <div className="w-full lg:max-w-md bg-white/10 dark:bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg shrink-0">
          <form onSubmit={handleSubscribe} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">
                البريد الإلكتروني لاستلام ملخص السيو الدوري:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs rounded-xl pr-9 pl-3 py-2.5 bg-slate-900/90 border border-indigo-500/40 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dir-ltr text-left font-medium"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  الدورية:
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as ScheduledAuditFrequency)}
                  className="w-full text-xs rounded-xl px-2.5 py-2 bg-slate-900/90 border border-indigo-500/40 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="weekly">أسبوعياً (Weekly - موصى به)</option>
                  <option value="biweekly">كل أسبوعين</option>
                  <option value="monthly">شهرياً (Monthly)</option>
                  <option value="daily">يومياً (Daily)</option>
                </select>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={onOpenModal}
                  className="px-3 py-2 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                  title="تخصيص التوقيت، اليوم، وشروط التنبيه"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>تخصيص</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-col sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CalendarClock className="w-3.5 h-3.5" />
                )}
                <span>تفعيل الجدولة الدورية</span>
              </button>

              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest || !email}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="إرسال تقرير تجريبي فوراً لمعاينة شكل الإيميل"
              >
                {isSendingTest ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-indigo-300" />
                )}
                <span>إرسال تجريبي</span>
              </button>
            </div>
          </form>

          {/* Feedback message */}
          {feedback && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="leading-snug">{feedback.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Scheduling & .ics Export Bar */}
      <div className="mt-5 pt-4 border-t border-indigo-700/40 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs bg-indigo-950/50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-300">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2 flex-wrap">
              <span>تصدير المواعيد وجدولتها في التقويم</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {nextSchedule.relativeText}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              احصل على تذكير تلقائي (Alert) في تقويمك قبل كل فحص، مع الرابط المباشر للموقع وقائمة المهام.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct Google Calendar Button */}
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            title="فتح تقويم جوجل وجدولة حدث الفحص الدوري بنقرة واحدة"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>جدولة في Google Calendar</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Download .ics file button */}
          <button
            type="button"
            onClick={() => downloadScheduledAuditIcs(calendarConfig)}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            title="تنزيل ملف .ics متوافق مع Apple Calendar و Outlook و Thunderbird"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تنزيل ملف .ics</span>
          </button>

          {/* Direct Link download/copy */}
          <a
            href={directIcsDownloadUrl}
            download
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 transition-colors flex items-center justify-center cursor-pointer"
            title="رابط التنزيل المباشر لملف .ics"
          >
            <Download className="w-3.5 h-3.5 text-indigo-300" />
          </a>

          <button
            type="button"
            onClick={() => {
              const fullUrl = `${window.location.origin}${directIcsDownloadUrl}`;
              navigator.clipboard?.writeText(fullUrl);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 transition-colors flex items-center justify-center cursor-pointer"
            title="نسخ رابط تنزيل ملف .ics"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
          </button>
        </div>
      </div>
    </div>
  );
};
