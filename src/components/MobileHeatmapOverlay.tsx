import React from 'react';
import {
  Flame,
  Target,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  MousePointerClick,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  MobileHeatmapAnalysis,
  HeatmapMode,
  HotspotItem
} from '../utils/mobileHeatmapCalculator';

interface MobileHeatmapOverlayProps {
  analysis: MobileHeatmapAnalysis;
  activeMode: HeatmapMode;
  opacity: number; // 0.2 to 0.95
  showLabels: boolean;
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
  isLandscape: boolean;
  previewTheme: 'light' | 'dark';
}

export const MobileHeatmapOverlay: React.FC<MobileHeatmapOverlayProps> = ({
  analysis,
  activeMode,
  opacity,
  showLabels,
  selectedHotspotId,
  onSelectHotspot,
  isLandscape,
  previewTheme
}) => {
  const selectedHotspot = analysis.hotspots.find((h) => h.id === selectedHotspotId) || null;

  // Color mappings for heat intensity
  const getIntensityColors = (intensity: HotspotItem['heatIntensity']) => {
    switch (intensity) {
      case 'extreme':
        return {
          glow: 'rgba(239, 68, 68, 0.75)',
          mid: 'rgba(249, 115, 22, 0.65)',
          outer: 'rgba(234, 179, 8, 0.0)',
          badge: 'bg-rose-600 text-white border-rose-400',
          ring: 'ring-rose-500'
        };
      case 'high':
        return {
          glow: 'rgba(249, 115, 22, 0.7)',
          mid: 'rgba(234, 179, 8, 0.55)',
          outer: 'rgba(59, 130, 246, 0.0)',
          badge: 'bg-amber-600 text-white border-amber-400',
          ring: 'ring-amber-500'
        };
      case 'medium':
        return {
          glow: 'rgba(234, 179, 8, 0.65)',
          mid: 'rgba(34, 197, 94, 0.45)',
          outer: 'rgba(59, 130, 246, 0.0)',
          badge: 'bg-emerald-600 text-white border-emerald-400',
          ring: 'ring-emerald-500'
        };
      case 'low':
      default:
        return {
          glow: 'rgba(59, 130, 246, 0.55)',
          mid: 'rgba(14, 165, 233, 0.35)',
          outer: 'rgba(99, 102, 241, 0.0)',
          badge: 'bg-sky-600 text-white border-sky-400',
          ring: 'ring-sky-500'
        };
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden transition-opacity duration-300"
      style={{ opacity }}
    >
      {/* ============================================================== */}
      {/* MODE 1: DENSITY (Radial Thermal Gradient Glows)                */}
      {/* ============================================================== */}
      {activeMode === 'density' && (
        <div className="w-full h-full relative">
          {/* Subtle thermal atmospheric background tint */}
          <div
            className="absolute inset-0 mix-blend-multiply dark:mix-blend-screen pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 25%, rgba(239,68,68,0.18) 0%, rgba(234,179,8,0.08) 45%, rgba(59,130,246,0.04) 80%, transparent 100%)'
            }}
          />

          {/* Render individual thermal glow blobs */}
          {analysis.hotspots.map((hotspot) => {
            const colors = getIntensityColors(hotspot.heatIntensity);
            const isSelected = selectedHotspotId === hotspot.id;

            return (
              <div
                key={hotspot.id}
                style={{
                  top: `${hotspot.topPercent}%`,
                  left: `${hotspot.leftPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${hotspot.radiusPx * 2.4}px`,
                  height: `${hotspot.radiusPx * 2.4}px`,
                  background: `radial-gradient(circle, ${colors.glow} 0%, ${colors.mid} 40%, ${colors.outer} 75%)`,
                  borderRadius: '50%',
                  filter: 'blur(10px)'
                }}
                className={`absolute transition-all duration-300 pointer-events-none ${
                  isSelected ? 'scale-125 opacity-100' : 'opacity-85'
                }`}
              />
            );
          })}

          {/* Render Interactive Hotspot Markers with Click Share Badges */}
          {analysis.hotspots.map((hotspot) => {
            const colors = getIntensityColors(hotspot.heatIntensity);
            const isSelected = selectedHotspotId === hotspot.id;

            return (
              <div
                key={`marker-${hotspot.id}`}
                style={{
                  top: `${hotspot.topPercent}%`,
                  left: `${hotspot.leftPercent}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute pointer-events-auto cursor-pointer z-30 group"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHotspot(isSelected ? null : hotspot.id);
                }}
              >
                {/* Hotspot core ping & circle */}
                <div className="relative flex items-center justify-center">
                  <span
                    className={`absolute w-7 h-7 rounded-full animate-ping opacity-75 ${
                      hotspot.heatIntensity === 'extreme'
                        ? 'bg-rose-500'
                        : hotspot.heatIntensity === 'high'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <div
                    className={`relative w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-transform duration-200 group-hover:scale-110 ${
                      colors.badge
                    } ${isSelected ? 'ring-4 ring-white shadow-2xl scale-115' : ''}`}
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                  </div>

                  {/* Always-visible percentage badge if enabled */}
                  {showLabels && (
                    <div
                      className={`absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black border shadow-md flex items-center gap-0.5 backdrop-blur-md transition-all ${
                        isSelected
                          ? 'bg-slate-950 text-white border-indigo-400 scale-105'
                          : 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 group-hover:scale-105'
                      }`}
                    >
                      <span>{hotspot.clickSharePercent}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: ZONES BREAKDOWN (Structural Bounded Regions)           */}
      {/* ============================================================== */}
      {activeMode === 'zones' && (
        <div className="w-full h-full relative p-2 space-y-3">
          {/* Visual zone outlines mapped to standard page sections */}
          {analysis.hotspots.map((hotspot) => {
            const isSelected = selectedHotspotId === hotspot.id;
            const colors = getIntensityColors(hotspot.heatIntensity);

            return (
              <div
                key={`zone-${hotspot.id}`}
                style={{
                  top: `${hotspot.topPercent - 4}%`,
                  left: '4%',
                  width: '92%',
                  height: `${Math.max(48, hotspot.radiusPx * 0.9)}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHotspot(isSelected ? null : hotspot.id);
                }}
                className={`absolute pointer-events-auto cursor-pointer rounded-xl border-2 transition-all duration-200 p-2 flex items-center justify-between backdrop-blur-2xs ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/25 ring-2 ring-indigo-400 shadow-lg'
                    : 'border-dashed border-amber-400/80 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${colors.badge}`}>
                    {hotspot.clickSharePercent}% نقرات
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white drop-shadow-xs truncate max-w-[170px]">
                    {hotspot.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono font-bold bg-white/90 dark:bg-slate-900/90 px-1.5 py-0.5 rounded shadow-xs text-slate-700 dark:text-slate-300">
                  <MousePointerClick className="w-3 h-3 text-indigo-500" />
                  <span>{hotspot.attractionScore} نقطة</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 3: THUMB ERGONOMICS (Natural / Stretch / Hard Zones)      */}
      {/* ============================================================== */}
      {activeMode === 'thumb_zone' && (
        <div className="w-full h-full relative flex flex-col justify-between pointer-events-auto">
          {/* Zone 1: Hard-to-reach Top Corner (Red/Rose) */}
          <div className="h-[28%] bg-gradient-to-b from-rose-500/35 to-rose-500/10 border-b-2 border-dashed border-rose-500/60 p-3 flex flex-col justify-between relative">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                ⚠️ منطقة مجهدة للإبهام (Hard Reach)
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded">
                تتطلب يد ثانية أو تمديد
              </span>
            </div>
            <p className="text-[10px] text-slate-700 dark:text-slate-200">
              مناسبة للأيقونات الثانوية وقوائم الهامبرغر، وتجنب وضع أزرار الشراء فيها.
            </p>
          </div>

          {/* Zone 2: Stretch Middle Area (Amber/Yellow) */}
          <div className="h-[32%] bg-gradient-to-b from-amber-500/25 to-amber-500/10 border-b-2 border-dashed border-amber-500/60 p-3 flex flex-col justify-between relative">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                ✋ منطقة التمدد الطبيعي (Stretch Reach)
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded">
                مدى متوسط
              </span>
            </div>
            <p className="text-[10px] text-slate-700 dark:text-slate-200">
              مثالية لفقرات القراءة، العناوين الرئيسية والصور التفاعلية.
            </p>
          </div>

          {/* Zone 3: Natural Bottom Easy Reach (Emerald/Green) */}
          <div className="h-[40%] bg-gradient-to-t from-emerald-500/35 to-emerald-500/10 p-3 flex flex-col justify-between relative">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                ✨ المنطقة السهلة والمريحة (Natural Easy Zone)
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded">
                نطاق الإبهام المباشر
              </span>
            </div>
            <p className="text-[10px] text-slate-700 dark:text-slate-200">
              المنطقة الأكثر راحة بيد واحدة (75% من نقرات الشراء والتفاعل السريع).
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP CARD: Hotspot Details When Selected                      */}
      {/* ============================================================== */}
      {selectedHotspot && (
        <div
          className="absolute bottom-3 left-3 right-3 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xl z-40 text-xs animate-in slide-in-from-bottom-2 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  getIntensityColors(selectedHotspot.heatIntensity).badge
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedHotspot.name}
                </h5>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {selectedHotspot.category.toUpperCase()} • تفاعل متوقع
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectHotspot(null)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">حصة النقرات</div>
              <div className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                {selectedHotspot.clickSharePercent}%
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">مؤشر الجاذبية</div>
              <div className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                {selectedHotspot.attractionScore}/100
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">نطاق الإبهام</div>
              <div
                className={`font-bold text-[11px] mt-0.5 ${
                  selectedHotspot.thumbZoneSuitability === 'optimal'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : selectedHotspot.thumbZoneSuitability === 'stretch'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {selectedHotspot.thumbZoneSuitability === 'optimal'
                  ? 'مريح جداً'
                  : selectedHotspot.thumbZoneSuitability === 'stretch'
                  ? 'متوسط'
                  : 'صعب/بعيد'}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {selectedHotspot.description}
          </p>

          <div className="mt-2 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-[10px] text-indigo-900 dark:text-indigo-200 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>توصية التحسين:</strong> {selectedHotspot.recommendation}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
