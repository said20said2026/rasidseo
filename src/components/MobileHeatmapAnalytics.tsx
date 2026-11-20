import React from 'react';
import {
  Flame,
  Target,
  Sparkles,
  MousePointerClick,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Smartphone,
  Layers,
  ChevronRight,
  TrendingUp,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import {
  MobileHeatmapAnalysis,
  HeatmapMode,
  HotspotItem
} from '../utils/mobileHeatmapCalculator';

interface MobileHeatmapAnalyticsProps {
  analysis: MobileHeatmapAnalysis;
  activeMode: HeatmapMode;
  onChangeMode: (mode: HeatmapMode) => void;
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
  heatmapEnabled: boolean;
  onToggleHeatmap: () => void;
}

export const MobileHeatmapAnalytics: React.FC<MobileHeatmapAnalyticsProps> = ({
  analysis,
  activeMode,
  onChangeMode,
  selectedHotspotId,
  onSelectHotspot,
  heatmapEnabled,
  onToggleHeatmap
}) => {
  return (
    <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 space-y-6">
      {/* Header bar of analytics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>تحليل الخريطة الحرارية وتوزيع النقرات المتوقعة</span>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                AI Click Prediction
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              توقع مبني على هيكل الصفحة الحالي (H1، الصور، القوائم، أزرار CTA، والمسافات البينية لشاشات الهواتف)
            </p>
          </div>
        </div>

        {/* Quick Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
          <button
            onClick={() => {
              if (!heatmapEnabled) onToggleHeatmap();
              onChangeMode('density');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              heatmapEnabled && activeMode === 'density'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>كثافة النقر</span>
          </button>

          <button
            onClick={() => {
              if (!heatmapEnabled) onToggleHeatmap();
              onChangeMode('zones');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              heatmapEnabled && activeMode === 'zones'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>المناطق الهيكلية</span>
          </button>

          <button
            onClick={() => {
              if (!heatmapEnabled) onToggleHeatmap();
              onChangeMode('thumb_zone');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              heatmapEnabled && activeMode === 'thumb_zone'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>نطاق الإبهام</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Top Click Magnet */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>أعلى نقطة جذب للنقر</span>
            <Flame className="w-4 h-4 text-rose-500 fill-current" />
          </div>
          <div className="font-mono text-xl font-black text-rose-600 dark:text-rose-400">
            {analysis.topClickMagnet.clickSharePercent}%
          </div>
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={analysis.topClickMagnet.name}>
            {analysis.topClickMagnet.name}
          </div>
        </div>

        {/* Card 2: Above the Fold Tap Share */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>نقرات ما قبل التمرير (Above-fold)</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="font-mono text-xl font-black text-indigo-600 dark:text-indigo-400">
            {analysis.aboveFoldClickShare}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            تركيز تفاعلي قوي قبل أول تمريرة شاشة
          </div>
        </div>

        {/* Card 3: Thumb Ergonomics Score */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>مؤشر ملاءمة الإبهام (Thumb Ergonomics)</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
            {analysis.thumbErgonomics.overallErgonomicScore}/100
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {analysis.thumbErgonomics.naturalCoveragePercent}% من العناصر الحيوية بمتناول يد واحدة
          </div>
        </div>

        {/* Card 4: Mobile Usability Score */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>مؤشر سهولة تفاعل اللمس</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-mono text-xl font-black text-blue-600 dark:text-blue-400">
            {analysis.mobileUsabilityScore}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {analysis.hotspots.length} نقاط ساخنة مكتشفة في الهيكل
          </div>
        </div>
      </div>

      {/* Ranked Hotspots Interactive List & Heat Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Hotspots List (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-indigo-500" />
              <span>ترتيب العناصر حسب الجاذبية وكثافة النقر المتوقعة:</span>
            </h5>
            <span className="text-[10px] text-slate-400">اضغط على أي عنصر لإبرازه على المحاكي</span>
          </div>

          <div className="space-y-2">
            {analysis.hotspots.map((hotspot, idx) => {
              const isSelected = selectedHotspotId === hotspot.id;

              return (
                <div
                  key={hotspot.id}
                  onClick={() => onSelectHotspot(isSelected ? null : hotspot.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/50 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                      #{idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {hotspot.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            hotspot.thumbZoneSuitability === 'optimal'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : hotspot.thumbZoneSuitability === 'stretch'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {hotspot.thumbZoneSuitability === 'optimal'
                            ? 'نطاق إبهام مريح'
                            : hotspot.thumbZoneSuitability === 'stretch'
                            ? 'نطاق تمدد'
                            : 'منطقة صعبة'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm mt-0.5">
                        {hotspot.description}
                      </p>
                    </div>
                  </div>

                  {/* Click share progress bar and score */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <div className="w-24 text-left">
                      <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                        <span className="text-slate-500">حصة النقر:</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{hotspot.clickSharePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            hotspot.heatIntensity === 'extreme'
                              ? 'bg-rose-500'
                              : hotspot.heatIntensity === 'high'
                              ? 'bg-amber-500'
                              : hotspot.heatIntensity === 'medium'
                              ? 'bg-emerald-500'
                              : 'bg-sky-500'
                          }`}
                          style={{ width: `${hotspot.clickSharePercent * 2.5}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-1 text-slate-400 hover:text-indigo-600">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend & AI Optimization Tips (1 col) */}
        <div className="space-y-4">
          {/* Thermal Color Gradient Legend */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>دليل التدرج الحراري (Heatmap Legend)</span>
            </h5>

            {/* Gradient bar */}
            <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-rose-600 shadow-inner" />

            <div className="flex justify-between text-[10px] font-medium text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>بارد (&lt;5%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>متوسط</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>ساخن (&gt;30%)</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 leading-relaxed border-t border-slate-200/60 dark:border-slate-800">
              تعتمد الخريطة الحرارية التنبؤية على دراسات سلوك مستخدمي شاشات اللمس (Touch Screen F-Pattern &amp; Gutenberg Diagram) ومحاذاة أبعاد شاشة الهاتف المختار.
            </p>
          </div>

          {/* AI Optimization Tips Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
            <h5 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>توصيات الذكاء الاصطناعي لتحسين التحويل</span>
            </h5>

            <div className="space-y-2">
              {analysis.optimizationTips.map((tip, idx) => (
                <div key={idx} className="text-xs space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    {tip.type === 'positive' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span>{tip.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pr-5">
                    {tip.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
