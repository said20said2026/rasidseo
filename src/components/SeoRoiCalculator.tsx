import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Briefcase,
  FileText,
  Building2,
  Sparkles,
  ArrowUpRight,
  Copy,
  Check,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Coins,
  Target,
  Sliders,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AuditResult } from '../types/seo';

interface SeoRoiCalculatorProps {
  auditData?: AuditResult | null;
}

type BusinessType = 'ecommerce' | 'saas' | 'content' | 'local' | 'custom';
type CurrencyCode = 'USD' | 'SAR' | 'AED' | 'EUR' | 'EGP';

interface BusinessPreset {
  labelAr: string;
  labelEn: string;
  icon: typeof ShoppingCart;
  descriptionAr: string;
  descriptionEn: string;
  visitors: number;
  conversionRate: number;
  avgValue: number;
  fixCost: number;
}

const PRESETS: Record<Exclude<BusinessType, 'custom'>, BusinessPreset> = {
  ecommerce: {
    labelAr: 'متجر إلكتروني',
    labelEn: 'E-Commerce Store',
    icon: ShoppingCart,
    descriptionAr: 'مبيعات منتجات سريعة وسلات تسوق بمعدل شراء مباشر',
    descriptionEn: 'Direct consumer checkout and product sales',
    visitors: 35000,
    conversionRate: 2.4,
    avgValue: 75,
    fixCost: 800
  },
  saas: {
    labelAr: 'برمجيات وشركات B2B',
    labelEn: 'SaaS & B2B Leads',
    icon: Briefcase,
    descriptionAr: 'تسجيلات تجريبية، طلب عروض أسعار وعقود خدمات',
    descriptionEn: 'Trials, demos, consultations and retainer contracts',
    visitors: 12000,
    conversionRate: 3.1,
    avgValue: 240,
    fixCost: 1500
  },
  content: {
    labelAr: 'مدونة وموقع محتوى',
    labelEn: 'Media & Content Blog',
    icon: FileText,
    descriptionAr: 'تحقيق أرباح عبر الإعلانات، المقالات الترويجية والعمولات',
    descriptionEn: 'Ad impressions (RPM), sponsorships and affiliate links',
    visitors: 90000,
    conversionRate: 1.8,
    avgValue: 14,
    fixCost: 450
  },
  local: {
    labelAr: 'خدمات محلية وعيادات',
    labelEn: 'Local Business & Clinics',
    icon: Building2,
    descriptionAr: 'حجوزات مواعيد، استشارات هاتفية وزيارات المقر',
    descriptionEn: 'Phone inquiries, appointments and physical visits',
    visitors: 8500,
    conversionRate: 4.5,
    avgValue: 120,
    fixCost: 600
  }
};

const CURRENCIES: Record<CurrencyCode, { symbol: string; label: string; rateToUsd: number }> = {
  USD: { symbol: '$', label: 'USD ($)', rateToUsd: 1 },
  SAR: { symbol: 'ر.س', label: 'SAR (ر.س)', rateToUsd: 3.75 },
  AED: { symbol: 'د.إ', label: 'AED (د.إ)', rateToUsd: 3.67 },
  EUR: { symbol: '€', label: 'EUR (€)', rateToUsd: 0.92 },
  EGP: { symbol: 'ج.م', label: 'EGP (ج.م)', rateToUsd: 49.0 }
};

export const SeoRoiCalculator: React.FC<SeoRoiCalculatorProps> = ({ auditData }) => {
  const { isRtl } = useLanguage();

  // Audit issues breakdown to dynamically calculate recommended uplift
  const criticalCount = useMemo(() => {
    return auditData?.items.filter((i) => i.status === 'error').length || 0;
  }, [auditData]);

  const warningCount = useMemo(() => {
    return auditData?.items.filter((i) => i.status === 'warning').length || 0;
  }, [auditData]);

  const currentScore = auditData?.overallScore || 68;

  // Formula: realistic organic lift when fixing detected technical and content issues
  // Each critical error fixed yields ~7.5% organic lift; each warning yields ~2% lift
  const autoRecommendedGrowth = useMemo(() => {
    const rawLift = criticalCount * 8 + warningCount * 2.5;
    // Bound reasonably between 15% and 85%
    return Math.max(15, Math.min(85, Math.round(rawLift || 32)));
  }, [criticalCount, warningCount]);

  // Projected score improvement
  const projectedScore = useMemo(() => {
    return Math.min(100, Math.round(currentScore + criticalCount * 6 + warningCount * 2.5));
  }, [currentScore, criticalCount, warningCount]);

  // State
  const [businessType, setBusinessType] = useState<BusinessType>('ecommerce');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [monthlyVisitors, setMonthlyVisitors] = useState<number>(35000);
  const [expectedGrowthPercent, setExpectedGrowthPercent] = useState<number>(autoRecommendedGrowth);
  const [conversionRate, setConversionRate] = useState<number>(2.4);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(75);
  const [fixCost, setFixCost] = useState<number>(800);
  const [cpcEstimate, setCpcEstimate] = useState<number>(0.85); // Cost per click if bought in Google Ads
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Apply preset
  const handleSelectPreset = (type: BusinessType) => {
    setBusinessType(type);
    if (type !== 'custom') {
      const preset = PRESETS[type];
      setMonthlyVisitors(preset.visitors);
      setConversionRate(preset.conversionRate);
      setAvgOrderValue(preset.avgValue);
      setFixCost(preset.fixCost);
    }
  };

  // Calculations
  const calculations = useMemo(() => {
    // Current baseline
    const currentMonthlyOrders = (monthlyVisitors * (conversionRate / 100));
    const currentMonthlyRevenue = currentMonthlyOrders * avgOrderValue;
    const currentAnnualRevenue = currentMonthlyRevenue * 12;

    // Projected after fixes
    const additionalMonthlyVisitors = Math.round(monthlyVisitors * (expectedGrowthPercent / 100));
    const totalNewMonthlyVisitors = monthlyVisitors + additionalMonthlyVisitors;

    const additionalMonthlyOrders = (additionalMonthlyVisitors * (conversionRate / 100));
    const totalNewMonthlyOrders = currentMonthlyOrders + additionalMonthlyOrders;

    const additionalMonthlyRevenue = additionalMonthlyOrders * avgOrderValue;
    const additionalAnnualRevenue = additionalMonthlyRevenue * 12;

    const totalNewMonthlyRevenue = currentMonthlyRevenue + additionalMonthlyRevenue;
    const totalNewAnnualRevenue = currentAnnualRevenue + additionalAnnualRevenue;

    // Net ROI
    const netAnnualProfit = additionalAnnualRevenue - fixCost;
    const roiMultiplier = fixCost > 0 ? ((additionalAnnualRevenue / fixCost) * 100) : 0;
    const paybackDays = additionalMonthlyRevenue > 0 ? Math.ceil((fixCost / additionalMonthlyRevenue) * 30) : 0;

    // Google Ads PPC equivalent value
    const monthlyAdSpendSaved = additionalMonthlyVisitors * cpcEstimate;
    const annualAdSpendSaved = monthlyAdSpendSaved * 12;

    return {
      currentMonthlyOrders,
      currentMonthlyRevenue,
      currentAnnualRevenue,
      additionalMonthlyVisitors,
      totalNewMonthlyVisitors,
      additionalMonthlyOrders,
      totalNewMonthlyOrders,
      additionalMonthlyRevenue,
      additionalAnnualRevenue,
      totalNewMonthlyRevenue,
      totalNewAnnualRevenue,
      netAnnualProfit,
      roiMultiplier,
      paybackDays,
      monthlyAdSpendSaved,
      annualAdSpendSaved
    };
  }, [monthlyVisitors, expectedGrowthPercent, conversionRate, avgOrderValue, fixCost, cpcEstimate]);

  const currSymbol = CURRENCIES[currency].symbol;

  const formatNumber = (num: number, decimals = 0) => {
    return new Intl.NumberFormat(isRtl ? 'ar-EG' : 'en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    }).format(num);
  };

  const formatMoney = (amount: number) => {
    return `${formatNumber(amount, 0)} ${currSymbol}`;
  };

  // Reset to auto audit recommendation
  const handleResetToAudit = () => {
    setExpectedGrowthPercent(autoRecommendedGrowth);
    handleSelectPreset('ecommerce');
  };

  // Copy full summary to clipboard
  const handleCopySummary = async () => {
    const summaryText = isRtl
      ? `📊 دراسة الجدوى وعائد الاستثمار من تحسين السيو (SEO ROI Forecast):
--------------------------------------------------
🌐 الموقع المستهدف: ${auditData?.url || 'موقع الويب'}
🔍 الحالة الحالية: تقييم السيو ${currentScore}/100 (${criticalCount} أخطاء حرجة، ${warningCount} تنبيهات)
📈 التقييم المستهدف بعد الإصلاح: ${projectedScore}/100 (+${expectedGrowthPercent}% نمو بالزيارات)

💰 النتائج المالية المتوقعة:
- الزيارات الشهرية الإضافية: +${formatNumber(calculations.additionalMonthlyVisitors)} زيارة مجانية
- التحويلات/الطلبات الإضافية: +${formatNumber(calculations.additionalMonthlyOrders, 0)} عملية شهرياً
- الإيراد الإضافي المتوقع شهرياً: +${formatMoney(calculations.additionalMonthlyRevenue)}
- الإيراد الإضافي المتوقع سنوياً: +${formatMoney(calculations.additionalAnnualRevenue)}
- التكلفة التقديرية للإصلاح: ${formatMoney(fixCost)}
- نسبة عائد الاستثمار السنوية (ROI): ${formatNumber(calculations.roiMultiplier, 0)}%
- فترة استرداد الاستثمار: خلال ${calculations.paybackDays} يوماً فقط!
- القيمة المكافئة لإعلانات جوجل (PPC): توفير ${formatMoney(calculations.annualAdSpendSaved)} سنوياً

تم التوليد بواسطة: منصة فحص وتدقيق أخطاء السيو 2026`
      : `📊 SEO ROI Forecast & Financial Feasibility Study:
--------------------------------------------------
🌐 Target Website: ${auditData?.url || 'Website'}
🔍 Baseline: SEO Score ${currentScore}/100 (${criticalCount} critical issues, ${warningCount} warnings)
📈 Projected Post-Fix Score: ${projectedScore}/100 (+${expectedGrowthPercent}% organic traffic uplift)

💰 Projected Financial Outcomes:
- Additional Monthly Traffic: +${formatNumber(calculations.additionalMonthlyVisitors)} organic visits
- Additional Monthly Orders/Leads: +${formatNumber(calculations.additionalMonthlyOrders, 0)} conversions
- Incremental Monthly Revenue: +${formatMoney(calculations.additionalMonthlyRevenue)}
- Incremental Annual Revenue: +${formatMoney(calculations.additionalAnnualRevenue)}
- Estimated Fix Budget: ${formatMoney(fixCost)}
- Annual Return on Investment (ROI): ${formatNumber(calculations.roiMultiplier, 0)}%
- Payback Period: In only ${calculations.paybackDays} days!
- Google Ads PPC Equivalent Value: Saves ${formatMoney(calculations.annualAdSpendSaved)}/year

Generated by: Professional SEO Audit & Analysis Platform 2026`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    } catch {
      // Fallback
    }
  };

  // Download CSV Forecast
  const handleExportCsv = () => {
    const rows = [
      ['Metric', 'Current Baseline', 'Projected Post-Fix', 'Incremental Gain'],
      ['Monthly Organic Visitors', monthlyVisitors, calculations.totalNewMonthlyVisitors, `+${calculations.additionalMonthlyVisitors}`],
      ['Conversion Rate (%)', `${conversionRate}%`, `${conversionRate}%`, '-'],
      ['Average Value per Conversion', avgOrderValue, avgOrderValue, '-'],
      ['Monthly Conversions / Orders', Math.round(calculations.currentMonthlyOrders), Math.round(calculations.totalNewMonthlyOrders), `+${Math.round(calculations.additionalMonthlyOrders)}`],
      ['Monthly Revenue', Math.round(calculations.currentMonthlyRevenue), Math.round(calculations.totalNewMonthlyRevenue), `+${Math.round(calculations.additionalMonthlyRevenue)}`],
      ['Annual Revenue', Math.round(calculations.currentAnnualRevenue), Math.round(calculations.totalNewAnnualRevenue), `+${Math.round(calculations.additionalAnnualRevenue)}`],
      ['Implementation Cost', '-', fixCost, '-'],
      ['Annual Net Profit', '-', Math.round(calculations.netAnnualProfit), '-'],
      ['ROI Multiplier (%)', '-', `${Math.round(calculations.roiMultiplier)}%`, '-'],
      ['Payback Timeline', '-', `${calculations.paybackDays} days`, '-'],
      ['PPC Search Ads Equivalent Saved', '-', Math.round(calculations.annualAdSpendSaved), `+${Math.round(calculations.annualAdSpendSaved)}`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SEO_ROI_Forecast_${auditData?.url.replace(/https?:\/\//, '').replace(/[\/\?#].*$/, '') || 'Report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="seo-roi-calculator-section"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors"
    >
      {/* Header Banner */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
              <Calculator className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  <span>{isRtl ? 'حاسبة القيمة المالية المضافة' : 'Financial Impact Model'}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {isRtl ? 'توقعات خوارزميات جوجل 2026' : 'Google 2026 Projections'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isRtl ? 'حاسبة عائد الاستثمار في تحسين السيو (SEO ROI Calculator)' : 'SEO Return on Investment (ROI) Calculator'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isRtl
                  ? 'احسب العائد المالي المتوقع، الأرباح الإضافية، وتوفير تكاليف إعلانات جوجل بعد معالجة الأخطاء المكتشفة في فحص موقعك.'
                  : 'Calculate the projected financial revenue, customer conversions, and ad-spend savings gained by repairing your site\'s SEO issues.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer shadow-xs active:scale-95"
              title={isRtl ? 'نسخ ملخص دراسة الجدوى' : 'Copy forecast summary'}
            >
              {copiedNotification ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">{isRtl ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isRtl ? 'نسخ الملخص' : 'Copy Summary'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-sm active:scale-95"
              title={isRtl ? 'تصدير جدول التوقعات كملف CSV' : 'Export ROI CSV'}
            >
              <Download className="w-4 h-4" />
              <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetToAudit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title={isRtl ? 'إعادة الضبط وفق بيانات الفحص' : 'Reset to audit recommendation'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRtl ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Audit Context Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-300 font-medium">
              {isRtl ? 'بيانات الفحص الحالي:' : 'Current audit context:'}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">
              <span className="text-slate-400">{isRtl ? 'التقييم الحالي:' : 'Score:'}</span>
              <span className="font-mono font-bold text-white">{currentScore}/100</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
              <span>{criticalCount} {isRtl ? 'أخطاء حرجة' : 'Critical'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <span>{warningCount} {isRtl ? 'تنبيهات تحسين' : 'Warnings'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-300">
              {isRtl ? 'التقييم المتوقع بعد معالجة الأخطاء:' : 'Potential score post-fixes:'}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
              <ArrowUpRight className="w-4 h-4 text-emerald-300" />
              <span>{projectedScore}/100</span>
              <span className="text-[10px] text-emerald-400">
                (+{projectedScore - currentScore} {isRtl ? 'نقطة' : 'pts'})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Step 1: Business Model Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center">1</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isRtl ? 'اختر نموذج عمل موقعك لتعبئة المتغيرات المناسبة:' : 'Select your business model for realistic baselines:'}
              </h3>
            </div>

            {/* Currency selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">{isRtl ? 'العملة:' : 'Currency:'}</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>{CURRENCIES[c as CurrencyCode].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.entries(PRESETS) as [Exclude<BusinessType, 'custom'>, BusinessPreset][]).map(([type, preset]) => {
              const Icon = preset.icon;
              const isSelected = businessType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectPreset(type)}
                  className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-slate-900 dark:text-white">
                      {isRtl ? preset.labelAr : preset.labelEn}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {isRtl ? preset.descriptionAr : preset.descriptionEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Interactive Parameter Sliders */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center">2</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isRtl ? 'المعايير والمتغيرات المالية وتوقعات الزيارات:' : 'Traffic and financial parameters:'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5">
            {/* 1. Monthly Organic Visitors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>{isRtl ? 'الزيارات العضوية الشهرية الحالية' : 'Current Monthly Organic Visits'}</span>
                </label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
                  <input
                    type="number"
                    min={100}
                    max={2000000}
                    step={500}
                    value={monthlyVisitors}
                    onChange={(e) => {
                      setMonthlyVisitors(Math.max(0, Number(e.target.value)));
                      setBusinessType('custom');
                    }}
                    className="w-24 text-right font-mono text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">{isRtl ? 'زيارة/شهر' : 'visits'}</span>
                </div>
              </div>
              <input
                type="range"
                min={1000}
                max={500000}
                step={1000}
                value={monthlyVisitors}
                onChange={(e) => {
                  setMonthlyVisitors(Number(e.target.value));
                  setBusinessType('custom');
                }}
                className="w-full accent-indigo-600 dark:accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1,000</span>
                <span>100,000</span>
                <span>250,000</span>
                <span>500,000+</span>
              </div>
            </div>

            {/* 2. Expected Traffic Growth % */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>{isRtl ? 'نسبة نمو الزيارات المتوقعة بعد الإصلاح' : 'Expected Traffic Growth Rate'}</span>
                  {expectedGrowthPercent === autoRecommendedGrowth && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      {isRtl ? 'توصية الفحص' : 'Audit Pick'}
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
                  <input
                    type="number"
                    min={5}
                    max={200}
                    step={1}
                    value={expectedGrowthPercent}
                    onChange={(e) => setExpectedGrowthPercent(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-right font-mono text-xs font-bold bg-transparent text-emerald-600 dark:text-emerald-400 focus:outline-none"
                  />
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">%+</span>
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={150}
                step={1}
                value={expectedGrowthPercent}
                onChange={(e) => setExpectedGrowthPercent(Number(e.target.value))}
                className="w-full accent-emerald-600 dark:accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>+5% ({isRtl ? 'تحسين طفيف' : 'Minor'})</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{autoRecommendedGrowth}% ({isRtl ? 'مقترح خوارزمي' : 'Algorithmic'})</span>
                <span>+100% ({isRtl ? 'مضاعفة' : 'Double'})</span>
              </div>
            </div>

            {/* 3. Conversion Rate % */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'معدل التحويل الحالي (Conversion Rate)' : 'Conversion Rate (%)'}
                </label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
                  <input
                    type="number"
                    min={0.1}
                    max={25}
                    step={0.1}
                    value={conversionRate}
                    onChange={(e) => {
                      setConversionRate(Math.max(0.1, Number(e.target.value)));
                      setBusinessType('custom');
                    }}
                    className="w-16 text-right font-mono text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[11px] font-bold text-slate-500">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0.5}
                max={10}
                step={0.1}
                value={conversionRate}
                onChange={(e) => {
                  setConversionRate(Number(e.target.value));
                  setBusinessType('custom');
                }}
                className="w-full accent-indigo-600 dark:accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5% ({isRtl ? 'منخفض' : 'Low'})</span>
                <span>2.5% ({isRtl ? 'المتوسط العالمي' : 'Average'})</span>
                <span>5.0%+ ({isRtl ? 'ممتاز' : 'High'})</span>
              </div>
            </div>

            {/* 4. Average Order / Deal Value */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'متوسط قيمة الطلب أو العميل (AOV / LTV)' : 'Average Order / Lead Value'}
                </label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    step={5}
                    value={avgOrderValue}
                    onChange={(e) => {
                      setAvgOrderValue(Math.max(1, Number(e.target.value)));
                      setBusinessType('custom');
                    }}
                    className="w-20 text-right font-mono text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-500">{currSymbol}</span>
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={1000}
                step={5}
                value={avgOrderValue}
                onChange={(e) => {
                  setAvgOrderValue(Number(e.target.value));
                  setBusinessType('custom');
                }}
                className="w-full accent-indigo-600 dark:accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10 {currSymbol}</span>
                <span>150 {currSymbol}</span>
                <span>500 {currSymbol}</span>
                <span>1,000+ {currSymbol}</span>
              </div>
            </div>

            {/* 5. Fix / Engineering Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>{isRtl ? 'تكلفة إصلاح أخطاء السيو التقديرية' : 'Estimated SEO Remediation Budget'}</span>
                </label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
                  <input
                    type="number"
                    min={0}
                    max={50000}
                    step={50}
                    value={fixCost}
                    onChange={(e) => setFixCost(Math.max(0, Number(e.target.value)))}
                    className="w-20 text-right font-mono text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-500">{currSymbol}</span>
                </div>
              </div>
              <input
                type="range"
                min={100}
                max={5000}
                step={50}
                value={fixCost}
                onChange={(e) => setFixCost(Number(e.target.value))}
                className="w-full accent-indigo-600 dark:accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>200 {currSymbol}</span>
                <span>1,500 {currSymbol}</span>
                <span>5,000+ {currSymbol}</span>
              </div>
            </div>

            {/* 6. Google Ads CPC Equivalent Benchmark */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>{isRtl ? 'تكلفة النقرة البديلة في إعلانات جوجل (CPC)' : 'Equivalent Google Ads Search CPC'}</span>
                </label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
                  <input
                    type="number"
                    min={0.1}
                    max={20}
                    step={0.05}
                    value={cpcEstimate}
                    onChange={(e) => setCpcEstimate(Math.max(0.1, Number(e.target.value)))}
                    className="w-16 text-right font-mono text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-500">{currSymbol}</span>
                </div>
              </div>
              <input
                type="range"
                min={0.2}
                max={5}
                step={0.05}
                value={cpcEstimate}
                onChange={(e) => setCpcEstimate(Number(e.target.value))}
                className="w-full accent-amber-600 dark:accent-amber-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.20 {currSymbol}</span>
                <span>1.00 {currSymbol}</span>
                <span>5.00+ {currSymbol}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Financial Projections Dashboard */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center">3</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isRtl ? 'المخرجات والأرباح المالية المضافة المتوقعة:' : 'Projected financial output & ROI metrics:'}
            </h3>
          </div>

          {/* Primary 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Additional Monthly Revenue */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300 dark:border-emerald-700/60 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {isRtl ? 'الإيراد الإضافي شهرياً' : 'Monthly Extra Revenue'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                +{formatMoney(calculations.additionalMonthlyRevenue)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isRtl ? 'أرباح ناتجة عن زيارات مجانية بدون إعلانات ممولة' : 'Recurring revenue from organic search visits'}
              </p>
            </div>

            {/* Additional Annual Revenue */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-300 dark:border-indigo-700/60 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {isRtl ? 'الإيراد الإضافي سنوياً' : 'Annual Extra Revenue'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                +{formatMoney(calculations.additionalAnnualRevenue)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isRtl
                  ? `صافي ربح سنوي: ${formatMoney(calculations.netAnnualProfit)} بعد خصم التكلفة`
                  : `Net annual profit: ${formatMoney(calculations.netAnnualProfit)}`}
              </p>
            </div>

            {/* ROI Multiplier */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-300 dark:border-purple-700/60 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  {isRtl ? 'مضاعف العائد (ROI)' : 'Annual ROI Multiplier'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                {formatNumber(calculations.roiMultiplier, 0)}%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isRtl
                  ? `استرداد كامل للتكلفة خلال ${calculations.paybackDays} يوماً فقط!`
                  : `Breakeven achieved within ${calculations.paybackDays} days`}
              </p>
            </div>

            {/* Google Ads PPC Equivalent */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  {isRtl ? 'توفير إعلانات جوجل' : 'Google Ads Saved'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {formatMoney(calculations.annualAdSpendSaved)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isRtl ? 'تكلفة شراء نفس الزيارات سنوياً عبر إعلانات البحث' : 'Equivalent annual search PPC spend'}
              </p>
            </div>
          </div>

          {/* Before vs After SEO Fix Visual Comparison Bar */}
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {isRtl ? 'مقارنة الوضع الحالي مقارنة بالوضع بعد إصلاح أخطاء السيو:' : 'Before vs. After SEO Fix Comparison:'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isRtl ? 'محاكاة مباشرة لزيادة الحصة السوقية وتدفق العملاء' : 'Direct simulation of organic market share growth'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                +{expectedGrowthPercent}% {isRtl ? 'نمو عضوي' : 'Uplift'}
              </span>
            </div>

            {/* Traffic Comparison */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'الزيارات الشهرية (Monthly Visitors):' : 'Monthly Traffic:'}
                </span>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-500">
                    {formatNumber(monthlyVisitors)}
                  </span>
                  <span className="text-slate-400">➔</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNumber(calculations.totalNewMonthlyVisitors)} (+{formatNumber(calculations.additionalMonthlyVisitors)})
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-slate-400 dark:bg-slate-600 h-full transition-all duration-300"
                  style={{ width: `${(monthlyVisitors / calculations.totalNewMonthlyVisitors) * 100}%` }}
                  title="الزيارات الحالية"
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(calculations.additionalMonthlyVisitors / calculations.totalNewMonthlyVisitors) * 100}%` }}
                  title="الزيارات الإضافية المجانية"
                />
              </div>
            </div>

            {/* Orders / Conversions Comparison */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'الطلبات والتحويلات الشهرية (Monthly Conversions):' : 'Monthly Conversions / Orders:'}
                </span>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-500">
                    {formatNumber(calculations.currentMonthlyOrders, 0)}
                  </span>
                  <span className="text-slate-400">➔</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {formatNumber(calculations.totalNewMonthlyOrders, 0)} (+{formatNumber(calculations.additionalMonthlyOrders, 0)} {isRtl ? 'طلب' : 'orders'})
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-slate-400 dark:bg-slate-600 h-full transition-all duration-300"
                  style={{ width: `${(calculations.currentMonthlyOrders / calculations.totalNewMonthlyOrders) * 100}%` }}
                  title="الطلبات الحالية"
                />
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${(calculations.additionalMonthlyOrders / calculations.totalNewMonthlyOrders) * 100}%` }}
                  title="الطلبات الإضافية بعد التحسين"
                />
              </div>
            </div>

            {/* Revenue Comparison */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'الإيراد الشهري الإجمالي (Monthly Revenue):' : 'Total Monthly Revenue:'}
                </span>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-500">
                    {formatMoney(calculations.currentMonthlyRevenue)}
                  </span>
                  <span className="text-slate-400">➔</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatMoney(calculations.totalNewMonthlyRevenue)} (+{formatMoney(calculations.additionalMonthlyRevenue)})
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-slate-400 dark:bg-slate-600 h-full transition-all duration-300"
                  style={{ width: `${(calculations.currentMonthlyRevenue / calculations.totalNewMonthlyRevenue) * 100}%` }}
                  title="الإيراد الحالي"
                />
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${(calculations.additionalMonthlyRevenue / calculations.totalNewMonthlyRevenue) * 100}%` }}
                  title="الإيراد الإضافي المحقق"
                />
              </div>
            </div>
          </div>

          {/* Actionable Insights per Detected Audit Issue */}
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-900 dark:text-white">
                  {isRtl
                    ? `الأثر المالي المتوقع لإصلاح الأخطاء المكتشفة في (${auditData?.url || 'موقعك'}):`
                    : `Financial ROI justification for repairing issues on ${auditData?.url || 'your site'}:`}
                </h5>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isRtl
                    ? `إصلاح ${criticalCount} أخطاء حرجة يزيل حواجز الزحف الرئيسية لمحركات البحث ويولد ما متوسطه ${formatMoney(calculations.additionalMonthlyRevenue / Math.max(1, criticalCount))} شهرياً لكل خطأ حرج يتم حله بنجاح.`
                    : `Resolving the ${criticalCount} critical audit errors removes fundamental indexing roadblocks, unlocking an average of ${formatMoney(calculations.additionalMonthlyRevenue / Math.max(1, criticalCount))} in monthly revenue per fixed issue.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
